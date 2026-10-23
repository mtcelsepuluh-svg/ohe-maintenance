import { useState, useEffect } from 'react';
import { googleSyncService, SyncStatus } from '../services/googleSyncService';
import { format } from 'date-fns';

const SyncStatusIndicator = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSyncStatus();
    const interval = setInterval(loadSyncStatus, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await googleSyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <small className="text-muted">Loading sync status...</small>
      </div>
    );
  }

  if (!syncStatus || !syncStatus.last_sync) {
    return (
      <div className="alert alert-warning mb-0" role="alert">
        <small>
          <i className="bi bi-exclamation-triangle"></i> No sync data available
        </small>
      </div>
    );
  }

  const { last_sync, stats } = syncStatus;
  const isSuccess = last_sync.status === 'success';
  const lastSyncTime = format(new Date(last_sync.timestamp), 'dd MMM yyyy, HH:mm');

  return (
    <div className="card">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Google Sheets Sync Status</h6>
          <span className={`badge bg-${isSuccess ? 'success' : 'danger'}`}>
            {isSuccess ? '✓ Connected' : '✗ Error'}
          </span>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <small className="text-muted d-block">Last Sync</small>
            <strong>{lastSyncTime}</strong>
            <br />
            <small className="text-muted">
              {last_sync.records_synced} records synced • {last_sync.sync_type}
            </small>
          </div>

          <div className="col-md-6">
            <small className="text-muted d-block">Success Rate</small>
            <strong>{stats.success_rate}%</strong>
            <div className="progress mt-1" style={{ height: '8px' }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${stats.success_rate}%` }}
              ></div>
            </div>
            <small className="text-muted">
              {stats.successful_syncs}/{stats.total_syncs} syncs successful
            </small>
          </div>
        </div>

        <div className="mt-3 pt-3 border-top">
          <div className="row g-2 text-center">
            <div className="col-4">
              <small className="text-muted d-block">Total Syncs</small>
              <strong>{stats.total_syncs}</strong>
            </div>
            <div className="col-4">
              <small className="text-muted d-block">Records</small>
              <strong>{stats.total_records_synced}</strong>
            </div>
            <div className="col-4">
              <small className="text-muted d-block">Failed</small>
              <strong className="text-danger">{stats.failed_syncs}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
