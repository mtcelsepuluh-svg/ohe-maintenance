import { useState, useEffect, useRef } from 'react';
import { activityService } from '../services/activityService';
import { Activity } from '../types';

const Activities = () => {
  const [activeTab, setActiveTab] = useState<'value' | 'direct' | 'indirect' | 'loss'>('value');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    data?: {
      total_rows: number;
      valid_records: number;
      created_records: number;
      errors: string[];
    };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadActivities();
  }, [activeTab]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      let data: Activity[] = [];
      switch (activeTab) {
        case 'value':
          data = await activityService.getValueTimes({ status: 'active' });
          break;
        case 'direct':
          data = await activityService.getDirects({ status: 'active' });
          break;
        case 'indirect':
          data = await activityService.getIndirects({ status: 'active' });
          break;
        case 'loss':
          data = await activityService.getLossTimes({ status: 'active' });
          break;
      }
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      setImportResult({
        success: false,
        message: 'Invalid file type. Please upload an Excel file (.xlsx, .xls) or CSV file.'
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const result = await activityService.importActivities(file);
      setImportResult(result);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        message: error.response?.data?.message || 'Import failed. Please try again.'
      });
    } finally {
      setImporting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const filteredActivities = activities.filter(
    (activity) =>
      activity.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.activity_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'VALUE TIME':
        return 'success';
      case 'DIRECT':
        return 'primary';
      case 'INDIRECT':
        return 'warning';
      case 'LOSS':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Activities Management</h1>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
          />
          <button
            className="btn btn-primary"
            onClick={triggerFileInput}
            disabled={importing}
          >
            {importing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Importing...
              </>
            ) : (
              <>
                📥 Import from Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Result Alert */}
      {importResult && (
        <div className={`alert ${importResult.success ? 'alert-success' : 'alert-danger'} alert-dismissible`} role="alert">
          <div>
            <strong>{importResult.message}</strong>
            {importResult.data && (
              <div className="mt-2">
                <small>
                  Total Rows: {importResult.data.total_rows} | 
                  Valid: {importResult.data.valid_records} | 
                  Created: {importResult.data.created_records}
                </small>
                {importResult.data.errors.length > 0 && (
                  <div className="mt-2">
                    <small className="d-block mb-1">Errors:</small>
                    <ul className="mb-0" style={{ fontSize: '0.875rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {importResult.data.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <button type="button" className="btn-close" onClick={() => setImportResult(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Import Format Info */}
      <div className="alert alert-info" role="alert">
        <strong>📋 Excel Format:</strong> Your Excel file should have these columns:{' '}
        <strong>Nama</strong>, <strong>Jenis Pekerjaan</strong>, <strong>Tanggal</strong>,{' '}
        <strong>Jam Mulai</strong>, <strong>Jam Selesai</strong>, <strong>Durasi ( dlm menit )</strong>,{' '}
        <strong>Kategori Pekerjaan</strong> (Corective/Preventive/Proyek),{' '}
        <strong>Pekerjaan Indirect</strong>, <strong>Durasi waktu Indirect</strong>,{' '}
        <strong>Loss Time</strong>, <strong>Durasi waktu Loss Time</strong>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'value' ? 'active' : ''}`}
            onClick={() => setActiveTab('value')}
          >
            ✅ Value Time
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'direct' ? 'active' : ''}`}
            onClick={() => setActiveTab('direct')}
          >
            ⚡ Direct
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'indirect' ? 'active' : ''}`}
            onClick={() => setActiveTab('indirect')}
          >
            🔄 Indirect
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'loss' ? 'active' : ''}`}
            onClick={() => setActiveTab('loss')}
          >
            ⚠️ Loss Time
          </button>
        </li>
      </ul>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Activities Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Activity Name</th>
                    <th>Category</th>
                    <th>Sub Category</th>
                    <th>Standard Time</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((activity) => (
                    <tr key={activity._id}>
                      <td>
                        <strong>{activity.activity_code}</strong>
                      </td>
                      <td>{activity.activity_name}</td>
                      <td>
                        <span className={`badge bg-${getCategoryColor(activity.category)}`}>
                          {activity.category}
                        </span>
                      </td>
                      <td>{activity.sub_category}</td>
                      <td>
                        {activity.standard_time} {activity.unit}
                      </td>
                      <td>{activity.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredActivities.length === 0 && (
                <div className="text-center text-muted py-4">
                  No activities found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;
