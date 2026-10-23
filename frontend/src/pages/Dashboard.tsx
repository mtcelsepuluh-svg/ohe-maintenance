import { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { dashboardService } from '../services/dashboardService';
import { DashboardData, DashboardStats } from '../types';
import { format, subDays } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadDashboardData();
  }, [startDate, endDate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        dashboardService.getDashboard({ startDate, endDate }),
        dashboardService.getStats({ startDate, endDate }),
      ]);
      setDashboardData(data);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  if (!dashboardData || !stats) {
    return <div className="alert alert-warning">No data available</div>;
  }

  const { summary } = dashboardData;

  // Doughnut chart data
  const doughnutData = {
    labels: ['Value Time', 'Direct Time', 'Indirect Time', 'Loss Time'],
    datasets: [
      {
        data: [summary.value_time, summary.direct_time, summary.indirect_time, summary.loss_time],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  // Line chart data
  const lineData = {
    labels: stats.trend.map((t) => format(new Date(t.date), 'dd MMM')),
    datasets: [
      {
        label: 'OHE %',
        data: stats.trend.map((t) => t.ohe),
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Efficiency %',
        data: stats.trend.map((t) => t.efficiency),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Bar chart data
  const barData = {
    labels: stats.trend.slice(-7).map((t) => format(new Date(t.date), 'dd MMM')),
    datasets: [
      {
        label: 'Value Time',
        data: stats.trend.slice(-7).map((t) => t.value_time),
        backgroundColor: '#10b981',
      },
      {
        label: 'Direct Time',
        data: stats.trend.slice(-7).map((t) => t.direct_time),
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Indirect Time',
        data: stats.trend.slice(-7).map((t) => t.indirect_time),
        backgroundColor: '#f59e0b',
      },
      {
        label: 'Loss Time',
        data: stats.trend.slice(-7).map((t) => t.loss_time),
        backgroundColor: '#ef4444',
      },
    ],
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard</h1>
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
          <div className="card stat-card value-time">
            <div className="card-body">
              <div className="stat-value text-success">{summary.value_time}</div>
              <div className="stat-label">Value Time (mins)</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-value text-primary">{summary.direct_time}</div>
              <div className="stat-label">Direct Time (mins)</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card indirect-time">
            <div className="card-body">
              <div className="stat-value text-warning">{summary.indirect_time}</div>
              <div className="stat-label">Indirect Time (mins)</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card stat-card loss-time">
            <div className="card-body">
              <div className="stat-value text-danger">{summary.loss_time}</div>
              <div className="stat-label">Loss Time (mins)</div>
            </div>
          </div>
        </div>
      </div>

      {/* OHE Metrics */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">OHE Performance</div>
            <div className="card-body">
              <div className="stat-value">{summary.ohe}%</div>
              <div className="stat-label">Current OHE</div>
              <div className="mt-3">
                <small className="text-muted">Target: {summary.target_ohe}%</small>
                <div className="progress mt-2" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${Math.min(100, (summary.ohe / summary.target_ohe) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">Efficiency</div>
            <div className="card-body">
              <div className="stat-value">{summary.efficiency}%</div>
              <div className="stat-label">Work Efficiency</div>
              <div className="mt-3">
                <small className="text-muted">Direct Ratio: {summary.direct_ratio}%</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">Status</div>
            <div className="card-body text-center">
              <div
                className={`stat-value ${
                  summary.status === 'ACHIEVED' ? 'text-success' : 'text-danger'
                }`}
              >
                {summary.status === 'ACHIEVED' ? '✓' : '✗'}
              </div>
              <div className="stat-label">{summary.status}</div>
              <div className="mt-3">
                <small className="text-muted">Achievement: {summary.achievement}%</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Time Distribution</div>
            <div className="card-body">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">OHE & Efficiency Trend</div>
            <div className="card-body">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">Last 7 Days Activity</div>
            <div className="card-body">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
