import { useState } from 'react';
import { googleSyncService } from '../services/googleSyncService';

interface GoogleSheetsSyncButtonProps {
  onSyncComplete?: () => void;
}

const GoogleSheetsSyncButton = ({ onSyncComplete }: GoogleSheetsSyncButtonProps) => {
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    records?: number;
  } | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setLastResult(null);

    try {
      const result = await googleSyncService.syncFromGoogleSheets();
      
      setLastResult({
        success: true,
        message: result.message,
        records: result.records_synced
      });

      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error: any) {
      setLastResult({
        success: false,
        message: error.response?.data?.message || 'Sync failed'
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={handleSync}
        disabled={syncing}
      >
        {syncing ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </span>
            Syncing...
          </>
        ) : (
          <>
            <i className="bi bi-arrow-clockwise"></i> Sync from Google Sheets
          </>
        )}
      </button>

      {lastResult && (
        <div className={`alert alert-${lastResult.success ? 'success' : 'danger'} mt-2`} role="alert">
          <small>
            {lastResult.success ? (
              <>
                <strong>✓ Success!</strong> {lastResult.message}
                {lastResult.records !== undefined && (
                  <span className="ms-2">({lastResult.records} records)</span>
                )}
              </>
            ) : (
              <>
                <strong>✗ Failed!</strong> {lastResult.message}
              </>
            )}
          </small>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsSyncButton;
