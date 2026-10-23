const mongoose = require('mongoose');

const standardTimeSchema = new mongoose.Schema({
  standard_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  mekanik: {
    type: String,
    required: true,
    trim: true
  },
  activity_code: {
    type: String,
    required: true,
    trim: true
  },
  activity_name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['VALUE TIME', 'DIRECT', 'INDIRECT', 'LOSS'],
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

standardTimeSchema.pre('save', function() {
  this.updated_at = Date.now();
});

module.exports = mongoose.model('StandardTime', standardTimeSchema);
