import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface Mekanik {
  _id: string;
  name: string;
  user_id: string;
}

interface DailyWorkTime {
  date: number;
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
  effective_minutes: number;
  overtime: number;
  absence?: string;
}

interface MekanikWorkTime {
  mekanik_id: string;
  mekanik_name: string;
  daily_entries: DailyWorkTime[];
  total_monthly: number;
}

const WorkTimeSheet = () => {
  const [mekaniks, setMekaniks] = useState<Mekanik[]>([]);
  const [workTimeData, setWorkTimeData] = useState<MekanikWorkTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEntry, setEditEntry] = useState<{
    mekanik_id: string;
    mekanik_name: string;
    date: number;
    entry: DailyWorkTime;
  } | null>(null);

  useEffect(() => {
    loadMekaniks();
    loadWorkTimeData();
  }, [selectedMonth, selectedYear]);

  const loadMekaniks = async () => {
    try {
      const response = await fetch('/api/mekaniks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setMekaniks(data.data || []);
    } catch (error) {
      console.error('Failed to load mekaniks:', error);
    }
  };

  const loadWorkTimeData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/worktimes?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setWorkTimeData(data.data || []);
    } catch (error) {
      console.error('Failed to load work time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(new Date(selectedYear, selectedMonth - 1));
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end });
  };

  const getWorkingHours = (day: Date) => {
    const dayOfWeek = getDay(day);
    
    // Senin-Kamis (1-4)
    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      return {
        start: '07:30',
        end: '15:00',
        break_start: '12:00',
        break_end: '12:30',
        effective: 420
      };
    }
    // Jumat (5)
    else if (dayOfWeek === 5) {
      return {
        start: '07:00',
        end: '15:00',
        break_start: '11:45',
        break_end: '12:45',
        effective: 390
      };
    }
    // Sabtu (6)
    else if (dayOfWeek === 6) {
      return {
        start: '07:30',
        end: '13:00',
        break_start: '11:30',
        break_end: '12:00',
        effective: 300
      };
    }
    // Minggu (0) - Libur
    else {
      return {
        start: '-',
        end: '-',
        break_start: '-',
        break_end: '-',
        effective: 0
      };
    }
  };

  const handleEditClick = (mekanik_id: string, mekanik_name: string, date: number, entry: DailyWorkTime) => {
    setEditEntry({ mekanik_id, mekanik_name, date, entry });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editEntry) return;

    try {
      const response = await fetch(`/api/worktimes/${editEntry.mekanik_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date: editEntry.date,
          start_time: editEntry.entry.start_time,
          end_time: editEntry.entry.end_time,
          break_start: editEntry.entry.break_start,
          break_end: editEntry.entry.break_end,
          effective_minutes: editEntry.entry.effective_minutes,
          overtime: editEntry.entry.overtime
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setShowEditModal(false);
        setEditEntry(null);
        await loadWorkTimeData();
        alert('Work time updated successfully!');
      } else {
        alert('Failed to update: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to update work time:', error);
      alert('Failed to update work time');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Work Time Sheet</h1>
        <button className="btn btn-primary" onClick={loadWorkTimeData}>
           Refresh
        </button>
      </div>

      {/* Month/Year Selector */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <label className="form-label">Month</label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {monthNames.map((name, index) => (
                  <option key={index} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Year</label>
              <select
                className="form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Working Hours Info</label>
              <div className="alert alert-info mb-0" style={{fontSize: '11px'}}>
                <strong>Mon-Thu:</strong> 07:30-15:00 (Break 12:00-12:30) = 420 min<br/>
                <strong>Fri:</strong> 07:00-15:00 (Break 11:45-12:45) = 390 min<br/>
                <strong>Sat:</strong> 07:30-13:00 (Break 11:30-12:00) = 300 min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Time Grid */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy', { locale: id })}
            {' '} - {mekaniks.length} Mekaniks
          </h5>
        </div>
        <div className="card-body">
          <div className="table-responsive" style={{maxHeight: '600px', overflow: 'auto'}}>
            <table className="table table-sm table-bordered" style={{fontSize: '10px', minWidth: '2000px'}}>
              <thead style={{position: 'sticky', top: 0, background: '#4472C4', color: 'white', zIndex: 1}}>
                <tr>
                  <th rowSpan={2} style={{minWidth: '150px', position: 'sticky', left: 0, background: '#4472C4', zIndex: 2}}>
                    Mekanik
                  </th>
                  {days.map((day) => {
                    const dayOfWeek = getDay(day);
                    const isSunday = dayOfWeek === 0;
                    return (
                      <th 
                        key={day.getDate()} 
                        colSpan={1}
                        style={{
                          minWidth: '80px',
                          background: isSunday ? '#d9534f' : '#4472C4'
                        }}
                      >
                        <div>{format(day, 'd')}</div>
                        <small>{format(day, 'EEE', { locale: id })}</small>
                      </th>
                    );
                  })}
                  <th rowSpan={2} style={{minWidth: '100px', background: '#4472C4'}}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {mekaniks.map((mekanik) => {
                  const mekanikData = workTimeData.find(w => w.mekanik_id === mekanik._id);
                  let totalMonthly = 0;

                  return (
                    <tr key={mekanik._id}>
                      <td style={{position: 'sticky', left: 0, background: 'white', zIndex: 1, fontWeight: 'bold'}}>
                        {mekanik.name}
                      </td>
                      {days.map((day) => {
                        const date = day.getDate();
                        const dayOfWeek = getDay(day);
                        const isSunday = dayOfWeek === 0;
                        const entry = mekanikData?.daily_entries.find(e => e.date === date);
                        const workingHours = getWorkingHours(day);
                        
                        const effectiveMinutes = entry?.effective_minutes || workingHours.effective;
                        const overtime = entry?.overtime || 0;
                        totalMonthly += effectiveMinutes + overtime;

                        if (isSunday) {
                          return (
                            <td key={date} style={{background: '#f5f5f5', textAlign: 'center'}}>
                              <small style={{color: '#999'}}>OFF</small>
                            </td>
                          );
                        }

                        return (
                          <td 
                            key={date} 
                            style={{cursor: 'pointer', textAlign: 'center'}}
                            onClick={() => handleEditClick(mekanik._id, mekanik.name, date, {
                              date,
                              start_time: entry?.start_time || workingHours.start,
                              end_time: entry?.end_time || workingHours.end,
                              break_start: entry?.break_start || workingHours.break_start,
                              break_end: entry?.break_end || workingHours.break_end,
                              effective_minutes: effectiveMinutes,
                              overtime
                            })}
                            title={`Click to edit - ${workingHours.start}-${workingHours.end}`}
                          >
                            <div style={{fontWeight: 'bold'}}>{effectiveMinutes}</div>
                            {overtime > 0 && (
                              <small style={{color: 'blue'}}>+{overtime}</small>
                            )}
                          </td>
                        );
                      })}
                      <td style={{fontWeight: 'bold', textAlign: 'right', paddingRight: '5px'}}>
                        {totalMonthly}
                        <br/>
                        <small>({Math.floor(totalMonthly / 60)}h {totalMonthly % 60}m)</small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {mekaniks.length === 0 && (
            <div className="text-center text-muted py-5">
              <h5>No mekaniks found</h5>
              <p>Please add mekaniks first</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editEntry && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Edit Work Time - {editEntry.mekanik_name} ({editEntry.date}/{selectedMonth}/{selectedYear})
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={editEntry.entry.start_time}
                      onChange={(e) => setEditEntry({
                        ...editEntry,
                        entry: {...editEntry.entry, start_time: e.target.value}
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">End Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={editEntry.entry.end_time}
                      onChange={(e) => setEditEntry({
                        ...editEntry,
                        entry: {...editEntry.entry, end_time: e.target.value}
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Break Start</label>
                    <input
                      type="time"
                      className="form-control"
                      value={editEntry.entry.break_start}
                      onChange={(e) => setEditEntry({
                        ...editEntry,
                        entry: {...editEntry.entry, break_start: e.target.value}
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Break End</label>
                    <input
                      type="time"
                      className="form-control"
                      value={editEntry.entry.break_end}
                      onChange={(e) => setEditEntry({
                        ...editEntry,
                        entry: {...editEntry.entry, break_end: e.target.value}
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Effective Minutes</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editEntry.entry.effective_minutes}
                      onChange={(e) => setEditEntry({
                        ...editEntry,
                        entry: {...editEntry.entry, effective_minutes: Number(e.target.value)}
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Overtime (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editEntry.entry.overtime}
                      onChange={(e) => setEditEntry({
                        ...editEntry,
                        entry: {...editEntry.entry, overtime: Number(e.target.value)}
                      })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkTimeSheet;
