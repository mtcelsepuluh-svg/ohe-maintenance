const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  sync_type: {
    type: String,
    enum: ['manual', 'auto'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  started_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  completed_at: {
    type: Date
  },
  records_synced: {
    type: Number,
    default: 0
  },
  error_message: {
    type: String,
    trim: true
  },
  synced_by: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
syncLogSchema.index({ created_at: -1 });
syncLogSchema.index({ status: 1 });

// Virtual for duration
syncLogSchema.virtual('duration_ms').get(function() {
  if (this.completed_at && this.started_at) {
    return this.completed_at - this.started_at;
  }
  return null;
});

// Static method to get last sync
syncLogSchema.statics.getLastSync = async function() {
  return await this.findOne()
    .sort({ created_at: -1 })
    .lean();
};

// Static method to get sync stats
syncLogSchema.statics.getSyncStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total_syncs: { $sum: 1 },
        successful_syncs: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failed_syncs: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        total_records: { $sum: '$records_synced' }
      }
    }
  ]);

  return stats[0] || {
    total_syncs: 0,
    successful_syncs: 0,
    failed_syncs: 0,
    total_records: 0
  };
};

module.exports = mongoose.model('SyncLog', syncLogSchema);
