const mongoose = require('mongoose');

const dailyEntrySchema = new mongoose.Schema({
  date: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  day_of_week: {
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    required: true
  },
  is_half_day: {
    type: Boolean,
    default: false
  },
  standard_time: {
    type: Number,
    default: 420, // 7 hours in minutes
    min: 0
  },
  overtime: {
    type: Number,
    default: 0,
    min: 0
  },
  total_time: {
    type: Number,
    default: 420,
    min: 0
  },
  status: {
    type: String,
    enum: ['present', 'absence', 'holiday', 'leave'],
    default: 'present'
  },
  absence_type: {
    type: String,
    enum: ['sakit', 'ijin', 'cuti', 'alpha', 'ijin_sebagian', 'lain-lain', null],
    default: null
  },
  leave_hours: {
    type: Number,
    default: 0,
    min: 0
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  },
  is_manual_overtime: {
    type: Boolean,
    default: false
  }
});

const workTimeSheetSchema = new mongoose.Schema({
  personel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personel_name: {
    type: String,
    required: true,
    trim: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2100
  },
  daily_entries: [dailyEntrySchema],
  total_monthly: {
    type: Number,
    default: 0,
    min: 0
  },
  created_by: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one sheet per personel per month
workTimeSheetSchema.index({ personel_id: 1, month: 1, year: 1 }, { unique: true });

// Pre-save hook to update total_monthly
workTimeSheetSchema.pre('save', function(next) {
  this.updated_at = Date.now();

  // Calculate total_monthly from daily_entries
  this.total_monthly = this.daily_entries.reduce((sum, entry) => {
    let effectiveTime = entry.total_time || 0;
    
    // Adjust for absence types
    if (entry.absence_type === 'sakit' || entry.absence_type === 'ijin' || 
        entry.absence_type === 'cuti' || entry.absence_type === 'alpha') {
      effectiveTime = 0;
    } else if (entry.absence_type === 'ijin_sebagian' && entry.leave_hours > 0) {
      effectiveTime = Math.max(0, effectiveTime - (entry.leave_hours * 60));
    }
    
    return sum + effectiveTime;
  }, 0);

  if (typeof next === 'function') {
    next();
  }
});

// Virtual for getting absence days count
workTimeSheetSchema.virtual('absence_days').get(function() {
  return this.daily_entries.filter(entry => entry.status === 'absence').length;
});

// Virtual for getting overtime days count
workTimeSheetSchema.virtual('overtime_days').get(function() {
  return this.daily_entries.filter(entry => entry.overtime > 0).length;
});

// Static method to generate monthly sheet
workTimeSheetSchema.statics.generateMonthlySheet = function(personelId, personelName, month, year, createdBy) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyEntries = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    let dayOfWeekStr;
    switch (dayOfWeek) {
      case 0: dayOfWeekStr = 'Sun'; break;
      case 6: dayOfWeekStr = 'Sat'; break;
      default: dayOfWeekStr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][dayOfWeek - 1];
    }
    
    const isHalfDay = dayOfWeekStr === 'Sat';
    const standardTime = dayOfWeekStr === 'Sun' ? 300 : (isHalfDay ? 390 : 420);
    
    dailyEntries.push({
      date: day,
      day_of_week: dayOfWeekStr,
      is_half_day: isHalfDay,
      standard_time: standardTime,
      overtime: 0,
      total_time: standardTime,
      status: 'present',
      absence_type: null,
      remarks: '',
      is_manual_overtime: false
    });
  }
  
  return {
    personel_id: personelId,
    personel_name: personelName,
    month,
    year,
    daily_entries: dailyEntries,
    total_monthly: dailyEntries.reduce((sum, entry) => sum + entry.standard_time, 0),
    created_by: createdBy
  };
};

// Method to update daily entry
workTimeSheetSchema.methods.updateDailyEntry = function(date, updates) {
  const entry = this.daily_entries.find(e => e.date === date);
  if (!entry) {
    throw new Error(`Entry for date ${date} not found`);
  }

  // If total_time is explicitly provided in updates, use it directly
  if (updates.total_time !== undefined) {
    Object.assign(entry, updates);
  } else {
    // Otherwise, use the old behavior of calculating from standard_time + overtime
    Object.assign(entry, updates);
    
    // Handle absence types
    if (entry.absence_type === 'sakit' || entry.absence_type === 'ijin' ||
        entry.absence_type === 'cuti' || entry.absence_type === 'alpha') {
      entry.status = 'absence';
      entry.total_time = 0;
    } else if (entry.absence_type === 'ijin_sebagian') {
      entry.status = 'present';
      const leaveMinutes = (entry.leave_hours || 0) * 60;
      entry.total_time = Math.max(0, entry.standard_time + entry.overtime - leaveMinutes);
    } else {
      entry.status = 'present';
      entry.total_time = entry.standard_time + entry.overtime;
    }
  }

  // Recalculate total_monthly
  this.total_monthly = this.daily_entries.reduce((sum, e) => {
    let effectiveTime = e.total_time || 0;

    if (e.absence_type === 'sakit' || e.absence_type === 'ijin' ||
        e.absence_type === 'cuti' || e.absence_type === 'alpha') {
      effectiveTime = 0;
    } else if (e.absence_type === 'ijin_sebagian' && e.leave_hours > 0) {
      effectiveTime = Math.max(0, effectiveTime - (e.leave_hours * 60));
    }

    return sum + effectiveTime;
  }, 0);

  return entry;
};

// Method to add overtime
workTimeSheetSchema.methods.addOvertime = function(date, overtimeMinutes, isManual = true) {
  const entry = this.daily_entries.find(e => e.date === date);
  if (!entry) {
    throw new Error(`Entry for date ${date} not found`);
  }
  
  if (entry.status === 'absence') {
    throw new Error('Cannot add overtime on absence day');
  }
  
  entry.overtime = overtimeMinutes;
  entry.is_manual_overtime = isManual;
  entry.total_time = entry.standard_time + entry.overtime;
  
  // Recalculate total_monthly
  this.total_monthly = this.daily_entries.reduce((sum, e) => sum + (e.total_time || 0), 0);
  
  return entry;
};

// Method to mark absence
workTimeSheetSchema.methods.markAbsence = function(date, absenceType, remarks = '') {
  const entry = this.daily_entries.find(e => e.date === date);
  if (!entry) {
    throw new Error(`Entry for date ${date} not found`);
  }
  
  entry.status = 'absence';
  entry.absence_type = absenceType;
  entry.remarks = remarks;
  entry.standard_time = 0;
  entry.overtime = 0;
  entry.total_time = 0;
  
  // Recalculate total_monthly
  this.total_monthly = this.daily_entries.reduce((sum, e) => sum + (e.total_time || 0), 0);
  
  return entry;
};

module.exports = mongoose.model('WorkTimeSheet', workTimeSheetSchema);
