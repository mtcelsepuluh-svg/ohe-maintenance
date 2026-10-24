import { useState, useEffect } from 'react';
import { oheService } from '../services/oheService';
import { activityService } from '../services/activityService';
import { authService } from '../services/authService';
import { OHEInput, OHEInputCreate, Activity } from '../types';
import { format } from 'date-fns';

const InputOHE = () => {
  const user = authService.getCurrentUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [oheInputs, setOheInputs] = useState<OHEInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<OHEInputCreate>({
    date: format(new Date(), 'yyyy-MM-dd'),
    shift: '1',
    mekanik: user?.name || '',
    activity_code: '',
    activity_name: '',
    category: 'VALUE TIME',
    start_time: '07:30',
    end_time: '08:00',
    standard_time_min: 30,
    quantity: 0,
    production_result: '',
    remarks: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activitiesData, inputsData] = await Promise.all([
        activityService.getValueTimes({ status: 'active' }),
        oheService.getInputs({}),
      ]);
      setActivities(activitiesData);
      setOheInputs(inputsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await oheService.createInput(formData);
      setShowForm(false);
      loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to create OHE input:', error);
      alert('Failed to save OHE input');
    }
  };

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      shift: '1',
      mekanik: user?.name || '',
      activity_code: '',
      activity_name: '',
      category: 'VALUE TIME',
      start_time: '07:30',
      end_time: '08:00',
      standard_time_min: 30,
      quantity: 0,
      production_result: '',
      remarks: '',
    });
  };

  const handleActivityChange = (activityCode: string) => {
    const activity = activities.find((a) => a.activity_code === activityCode);
    if (activity) {
      setFormData({
        ...formData,
        activity_code: activity.activity_code,
        activity_name: activity.activity_name,
        category: activity.category,
        standard_time_min: activity.standard_time,
      });
    }
  };

  const calculateActualTime = (startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const start = startHours * 60 + startMinutes;
    const end = endHours * 60 + endMinutes;
    return end - start;
  };

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

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Input OHE Activity</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Activity'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">New Activity Entry</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Shift</label>
                  <select
                    className="form-select"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    required
                  >
                    <option value="1">Shift 1</option>
                    <option value="2">Shift 2</option>
                    <option value="3">Shift 3</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Mekanik</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.mekanik}
                    onChange={(e) => setFormData({ ...formData, mekanik: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Activity</label>
                  <select
                    className="form-select"
                    value={formData.activity_code}
                    onChange={(e) => handleActivityChange(e.target.value)}
                    required
                  >
                    <option value="">Select Activity</option>
                    {activities.map((activity) => (
                      <option key={activity._id} value={activity.activity_code}>
                        {activity.activity_code} - {activity.activity_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.category}
                    readOnly
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Actual Time (mins)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={calculateActualTime(formData.start_time, formData.end_time)}
                    readOnly
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Quantity (optional)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Production Result (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.production_result}
                    onChange={(e) =>
                      setFormData({ ...formData, production_result: e.target.value })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Remarks (optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="mt-3">
                <button type="submit" className="btn btn-primary me-2">
                  Save Activity
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Today's Activities */}
      <div className="card">
        <div className="card-header">Today's Activities ({format(new Date(), 'dd MMM yyyy')})</div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Activity</th>
                  <th>Category</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {oheInputs.map((input) => (
                  <tr key={input._id}>
                    <td>
                      <small>{input.record_id}</small>
                    </td>
                    <td>{input.activity_name || input.jenis_pekerjaan || '-'}</td>
                    <td>
                      <span className={`badge bg-${getCategoryColor(input.category || input.kategori_pekerjaan)}`}>
                        {input.category || input.kategori_pekerjaan || '-'}
                      </span>
                    </td>
                    <td>
                      {input.start_time && input.end_time ? `${input.start_time} - ${input.end_time}` : '-'}
                    </td>
                    <td>{input.actual_time_min} mins</td>
                    <td>{input.remarks || input.loss_time || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {oheInputs.length === 0 && (
              <div className="text-center text-muted py-4">
                No activities recorded today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputOHE;
