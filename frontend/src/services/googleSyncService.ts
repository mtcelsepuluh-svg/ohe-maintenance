import api from './api';

export interface SyncStatus {
  last_sync: {
    timestamp: string;
    status: 'success' | 'failed';
    records_synced: number;
    sync_type: 'manual' | 'auto';
    synced_by: string;
    duration_ms: number | null;
  } | null;
  stats: {
    total_syncs: number;
    successful_syncs: number;
    failed_syncs: number;
    total_records_synced: number;
    success_rate: number;
  };
}

export interface SyncHistory {
  _id: string;
  sync_type: 'manual' | 'auto';
  status: 'success' | 'failed';
  started_at: string;
  completed_at: string;
  records_synced: number;
  error_message?: string;
  synced_by: string;
  created_at: string;
}

export interface GoogleFormOptions {
  mekaniks: string[];
  categories: string[];
  indirect_activities: string[];
  loss_activities: string[];
}

export const googleSyncService = {
  // Trigger manual sync
  syncFromGoogleSheets: async (): Promise<{
    success: boolean;
    message: string;
    records_synced: number;
    duration_ms: number;
  }> => {
    const response = await api.post('/google-sync/sync');
    return response.data;
  },

  // Get sync status
  getSyncStatus: async (): Promise<SyncStatus> => {
    const response = await api.get('/google-sync/status');
    return response.data.data;
  },

  // Get sync history
  getSyncHistory: async (limit = 50, page = 1): Promise<{
    count: number;
    total: number;
    page: number;
    pages: number;
    data: SyncHistory[];
  }> => {
    const response = await api.get('/google-sync/history', {
      params: { limit, page }
    });
    return response.data;
  },

  // Get Google Form options (for dropdowns)
  getGoogleFormOptions: async (): Promise<GoogleFormOptions> => {
    const response = await api.get('/google-sync/options');
    return response.data.data;
  },

  // Test Google Sheets connection
  testConnection: async (): Promise<{
    success: boolean;
    message: string;
    rows_fetched: number;
    has_data: boolean;
  }> => {
    const response = await api.get('/google-sync/test');
    return response.data;
  },
};
