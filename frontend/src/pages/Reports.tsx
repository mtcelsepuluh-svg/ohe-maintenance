import { useState, useEffect } from 'react';
import { oheService } from '../services/oheService';
import { format, subDays } from 'date-fns';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await oheService.getSummary({ startDate, endDate });
      setSummary(data);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!summary) {
    return <div className="alert alert-warning">No data available</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Work Hour Reports</h1>
        <div className="d-flex gap-2">
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Total Work Time</h6>
              <h2 className="mb-0">{summary.total_work_time}</h2>
              <small className="text-muted">minutes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Value Time</h6>
              <h2 className="text-success mb-0">{summary.value_time}</h2>
              <small className="text-muted">minutes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Indirect Time</h6>
              <h2 className="text-warning mb-0">{summary.indirect_time}</h2>
              <small className="text-muted">minutes</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-danger">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Loss Time</h6>
              <h2 className="text-danger mb-0">{summary.loss_time}</h2>
              <small className="text-muted">minutes</small>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="card mb-4">
        <div className="card-header">Time Analysis</div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-3 bg-light rounded">
                <h6>Efficiency Metrics</h6>
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Efficiency:</span>
                    <strong>{summary.efficiency}%</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Direct Ratio:</span>
                    <strong>{summary.direct_ratio}%</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>OHE:</span>
                    <strong>{summary.ohe}%</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 bg-light rounded">
                <h6>Time Distribution</h6>
                <div className="mt-3">
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Value Time</span>
                      <span>{summary.value_time} mins</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{
                          width: `${(summary.value_time / summary.total_work_time) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Direct Time</span>
                      <span>{summary.direct_time} mins</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{
                          width: `${(summary.direct_time / summary.total_work_time) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Indirect Time</span>
                      <span>{summary.indirect_time} mins</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-warning"
                        style={{
                          width: `${(summary.indirect_time / summary.total_work_time) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Loss Time</span>
                      <span>{summary.loss_time} mins</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-danger"
                        style={{
                          width: `${(summary.loss_time / summary.total_work_time) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Period Info */}
      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-1">
                <strong>Period:</strong> {format(new Date(summary.period.start), 'dd MMM yyyy')} -{' '}
                {format(new Date(summary.period.end), 'dd MMM yyyy')}
              </p>
            </div>
            <div className="col-md-6 text-end">
              <p className="mb-0">
                <strong>Total Records:</strong> {summary.total_records}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
