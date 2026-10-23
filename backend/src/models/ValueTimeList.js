const mongoose = require('mongoose');

const valueTimeListSchema = new mongoose.Schema({
  activity_code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  activity_name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['VALUE TIME'],
    default: 'VALUE TIME'
  },
  sub_category: {
    type: String,
    enum: ['Corrective', 'Preventive', 'Pekerjaan Proyek MTC'],
    required: true
  },
  standard_time: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'minutes'
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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

valueTimeListSchema.pre('save', function() {
  this.updated_at = Date.now();
});

// Index untuk pencarian berdasarkan sub_category
valueTimeListSchema.index({ sub_category: 1, status: 1 });

module.exports = mongoose.model('ValueTimeList', valueTimeListSchema);
