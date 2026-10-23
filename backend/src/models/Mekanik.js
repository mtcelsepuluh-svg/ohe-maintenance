const mongoose = require('mongoose');

const mekanikSchema = new mongoose.Schema({
  nama_mekanik: {
    type: String,
    required: true,
    trim: true
  },
  machine_code: {
    type: String,
    required: true,
    trim: true
  },
  machine_name: {
    type: String,
    required: true,
    trim: true
  },
  target_ohe: {
    type: Number,
    default: 85
  },
  benchmark_ohe: {
    type: Number,
    default: 90
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

mekanikSchema.pre('save', function() {
  this.updated_at = Date.now();
});

module.exports = mongoose.model('Mekanik', mekanikSchema);
