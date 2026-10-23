const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.pre('save', function() {
  this.updated_at = Date.now();
});

module.exports = mongoose.model('Settings', settingsSchema);
