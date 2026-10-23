const googleSheetsService = require('../services/googleSheetsService');
const OHEInput = require('../models/OHEInput');
const SyncLog = require('../models/SyncLog');
const Log = require('../models/Log');

// @desc    Sync data from Google Sheets
// @route   POST /api/google-sync/sync
// @access  Private (Admin only)
const syncFromGoogleSheets = async (req, res) => {
  try {
    const startTime = new Date();
    const syncedBy = req.user.user_id;

    console.log(`🔄 Manual sync triggered by ${syncedBy}`);

    // Sync data from Google Sheets
    const syncResult = await googleSheetsService.syncData();

    const endTime = new Date();

    if (!syncResult.success) {
      // Log failed sync
      await SyncLog.create({
        sync_type: 'manual',
        status: 'failed',
        started_at: startTime,
        completed_at: endTime,
        records_synced: 0,
        error_message: syncResult.message,
        synced_by: syncedBy
      });

      return res.status(500).json({
        success: false,
        message: syncResult.message
      });
    }

    // Save synced data to database
    let savedCount = 0;
    if (syncResult.data && syncResult.data.length > 0) {
      // Check for duplicates based on record_id
      const existingRecords = await OHEInput.find({
        record_id: { $in: syncResult.data.map(d => d.record_id) }
      }).select('record_id');

      const existingIds = new Set(existingRecords.map(r => r.record_id));
      const newRecords = syncResult.data.filter(d => !existingIds.has(d.record_id));

      if (newRecords.length > 0) {
        await OHEInput.insertMany(newRecords);
        savedCount = newRecords.length;
      }
    }

    // Log successful sync
    await SyncLog.create({
      sync_type: 'manual',
      status: 'success',
      started_at: startTime,
      completed_at: endTime,
      records_synced: savedCount,
      synced_by: syncedBy
    });

    // Log activity
    await Log.create({
      user: syncedBy,
      action: 'google_sync',
      module: 'google_sync',
      description: `Manual sync from Google Sheets: ${savedCount} records synced`
    });

    res.status(200).json({
      success: true,
      message: `Sync completed successfully. ${savedCount} new records synced.`,
      records_synced: savedCount,
      duration_ms: endTime - startTime
    });
  } catch (error) {
    console.error('❌ Sync error:', error.message);
    
    // Log error
    await SyncLog.create({
      sync_type: 'manual',
      status: 'failed',
      started_at: new Date(),
      completed_at: new Date(),
      records_synced: 0,
      error_message: error.message,
      synced_by: req.user.user_id
    });

    res.status(500).json({
      success: false,
      message: 'Sync failed: ' + error.message
    });
  }
};

// @desc    Get sync status
// @route   GET /api/google-sync/status
// @access  Private
const getSyncStatus = async (req, res) => {
  try {
    const lastSync = await SyncLog.getLastSync();
    const stats = await SyncLog.getSyncStats();

    res.status(200).json({
      success: true,
      data: {
        last_sync: lastSync ? {
          timestamp: lastSync.created_at,
          status: lastSync.status,
          records_synced: lastSync.records_synced,
          sync_type: lastSync.sync_type,
          synced_by: lastSync.synced_by,
          duration_ms: lastSync.completed_at ? 
            lastSync.completed_at - lastSync.started_at : null
        } : null,
        stats: {
          total_syncs: stats.total_syncs,
          successful_syncs: stats.successful_syncs,
          failed_syncs: stats.failed_syncs,
          total_records_synced: stats.total_records,
          success_rate: stats.total_syncs > 0 ? 
            Math.round((stats.successful_syncs / stats.total_syncs) * 100) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sync status: ' + error.message
    });
  }
};

// @desc    Get sync history
// @route   GET /api/google-sync/history
// @access  Private (Admin only)
const getSyncHistory = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const [syncLogs, total] = await Promise.all([
      SyncLog.find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SyncLog.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      count: syncLogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: syncLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sync history: ' + error.message
    });
  }
};

// @desc    Get Google Form options (for dropdowns)
// @route   GET /api/google-sync/options
// @access  Private
const getGoogleFormOptions = async (req, res) => {
  try {
    // Get unique mekaniks from synced data
    const mekaniks = await OHEInput.distinct('nama', {
      created_by: 'GOOGLE_SYNC'
    });

    // Get unique categories
    const categories = await OHEInput.distinct('kategori_pekerjaan', {
      created_by: 'GOOGLE_SYNC'
    });

    // Get unique indirect activities
    const indirectActivities = await OHEInput.distinct('pekerjaan_indirect', {
      created_by: 'GOOGLE_SYNC',
      pekerjaan_indirect: { $ne: '' }
    });

    // Get unique loss time activities
    const lossActivities = await OHEInput.distinct('loss_time', {
      created_by: 'GOOGLE_SYNC',
      loss_time: { $ne: '' }
    });

    res.status(200).json({
      success: true,
      data: {
        mekaniks: mekaniks.filter(m => m).sort(),
        categories: categories.filter(c => c).sort(),
        indirect_activities: indirectActivities.filter(a => a).sort(),
        loss_activities: lossActivities.filter(a => a).sort()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching options: ' + error.message
    });
  }
};

// @desc    Test Google Sheets connection
// @route   GET /api/google-sync/test
// @access  Private (Admin only)
const testConnection = async (req, res) => {
  try {
    console.log('🧪 Testing Google Sheets connection...');

    const initialized = await googleSheetsService.initialize();

    if (!initialized) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize Google Sheets API'
      });
    }

    const rows = await googleSheetsService.fetchData();

    res.status(200).json({
      success: true,
      message: 'Connection successful',
      rows_fetched: rows.length,
      has_data: rows.length > 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Connection test failed: ' + error.message
    });
  }
};

module.exports = {
  syncFromGoogleSheets,
  getSyncStatus,
  getSyncHistory,
  getGoogleFormOptions,
  testConnection
};
