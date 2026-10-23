const cron = require('node-cron');
const googleSheetsService = require('../services/googleSheetsService');
const OHEInput = require('../models/OHEInput');
const SyncLog = require('../models/SyncLog');

class SyncScheduler {
  constructor() {
    this.isRunning = false;
    this.interval = process.env.GOOGLE_SYNC_INTERVAL || 300000; // Default: 5 minutes
    this.cronJob = null;
  }

  // Start auto-sync scheduler
  start() {
    if (this.cronJob) {
      console.log('⚠️  Sync scheduler already running');
      return;
    }

    // Convert interval to cron expression
    const intervalMinutes = Math.floor(this.interval / 60000);
    const cronExpression = `*/${intervalMinutes} * * * *`; // Every X minutes

    console.log(`🔄 Starting sync scheduler: every ${intervalMinutes} minutes`);

    this.cronJob = cron.schedule(cronExpression, async () => {
      await this.runAutoSync();
    });

    this.isRunning = true;
    console.log('✅ Sync scheduler started');
  }

  // Stop auto-sync scheduler
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.isRunning = false;
      console.log('🛑 Sync scheduler stopped');
    }
  }

  // Run auto-sync
  async runAutoSync() {
    if (this.isSyncing) {
      console.log('⚠️  Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    const startTime = new Date();

    try {
      console.log('🔄 Running auto-sync...');

      // Sync data from Google Sheets
      const syncResult = await googleSheetsService.syncData();

      const endTime = new Date();

      if (!syncResult.success) {
        await SyncLog.create({
          sync_type: 'auto',
          status: 'failed',
          started_at: startTime,
          completed_at: endTime,
          records_synced: 0,
          error_message: syncResult.message,
          synced_by: 'SYSTEM'
        });

        console.error('❌ Auto-sync failed:', syncResult.message);
        return;
      }

      // Save synced data to database
      let savedCount = 0;
      if (syncResult.data && syncResult.data.length > 0) {
        // Check for duplicates
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
        sync_type: 'auto',
        status: 'success',
        started_at: startTime,
        completed_at: endTime,
        records_synced: savedCount,
        synced_by: 'SYSTEM'
      });

      console.log(`✅ Auto-sync completed: ${savedCount} new records synced`);
    } catch (error) {
      console.error('❌ Auto-sync error:', error.message);

      await SyncLog.create({
        sync_type: 'auto',
        status: 'failed',
        started_at: startTime,
        completed_at: new Date(),
        records_synced: 0,
        error_message: error.message,
        synced_by: 'SYSTEM'
      });
    } finally {
      this.isSyncing = false;
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      isSyncing: this.isSyncing || false,
      interval: this.interval,
      intervalMinutes: Math.floor(this.interval / 60000)
    };
  }
}

module.exports = new SyncScheduler();
