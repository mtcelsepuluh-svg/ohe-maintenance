const mongoose = require('mongoose');

const indirectListSchema = new mongoose.Schema({
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

indirectListSchema.pre('save', function() {
  this.updated_at = Date.now();
});

module.exports = mongoose.model('IndirectList', indirectListSchema);
