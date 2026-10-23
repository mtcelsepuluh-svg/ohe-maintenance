const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'create', 'update', 'delete', 'input_ohe', 'input_production', 'export_report', 'change_master']
  },
  module: {
    type: String,
    required: true
  },
  reference_id: {
    type: String
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model('Log', logSchema);
