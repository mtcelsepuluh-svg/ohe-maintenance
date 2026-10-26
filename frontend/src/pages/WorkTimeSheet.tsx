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
  absence_type?: 'sakit' | 'ijin' | 'cuti' | 'alpha' | 'ijin_sebagian' | 'lain-lain';
  leave_hours?: number;
}

type AbsenceType = 'sakit' | 'ijin' | 'cuti' | 'alpha' | 'ijin_sebagian' | 'lain-lain';

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
    sheet_id: string;
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
      // Map nama_mekanik to name for consistency
      const mekaniks = (data.data || []).map((m: any) => ({
        ...m,
        name: m.nama_mekanik,
        user_id: m.machine_code
      }));
      setMekaniks(mekaniks);
    } catch (error) {
      console.error('Failed to load mekaniks:', error);
    }
  };

  const loadWorkTimeData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/worktime/${selectedYear}/${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      // Map backend data to frontend expected format
      const mappedData = (data.data || []).map((sheet: any) => ({
        sheet_id: sheet._id,
        mekanik_id: sheet.personel_id?._id || sheet.personel_id,
        mekanik_name: sheet.personel_name,
        daily_entries: sheet.daily_entries || [],
        total_monthly: sheet.total_monthly
      }));
      
      setWorkTimeData(mappedData);
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

  const handleEditClick = (sheet_id: string, mekanik_id: string, mekanik_name: string, date: number, entry: DailyWorkTime) => {
    setEditEntry({ sheet_id, mekanik_id, mekanik_name, date, entry });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editEntry) return;

    try {
      const url = `/api/worktime/${editEntry.sheet_id}/day/${editEntry.date}`;
      console.log('Saving to URL:', url);
      console.log('Data:', editEntry);
      
      const response = await fetch(url, {
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
          overtime: editEntry.entry.overtime,
          absence_type: editEntry.entry.absence_type,
          leave_hours: editEntry.entry.leave_hours
        })
      });

      const result = await response.json();
      console.log('Response:', result);

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
          <div className="row g-3 mt-2">
            <div className="col-12">
              <label className="form-label">Absence Legend</label>
              <div className="d-flex gap-3 flex-wrap" style={{fontSize: '11px'}}>
                <span><span style={{background: '#fff3cd', padding: '2px 8px', borderRadius: '3px'}}>🤒 Sakit</span></span>
                <span><span style={{background: '#d1ecf1', padding: '2px 8px', borderRadius: '3px'}}>📝 Ijin</span></span>
                <span><span style={{background: '#d4edda', padding: '2px 8px', borderRadius: '3px'}}>Ijin Sebagian</span></span>
                <span><span style={{background: '#f8d7da', padding: '2px 8px', borderRadius: '3px'}}>🏖 Cuti</span></span>
                <span><span style={{background: '#f5c6cb', padding: '2px 8px', borderRadius: '3px'}}>❌ Alpha</span></span>
                <span><span style={{background: '#e2e3e5', padding: '2px 8px', borderRadius: '3px'}}>📌 Lain-lain</span></span>
                <span><span style={{color: 'blue'}}>+Overtime</span></span>
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
                        const absenceType = entry?.absence_type;
                        const leaveHours = entry?.leave_hours || 0;

                        // Calculate net effective minutes based on absence type
                        let netEffective = effectiveMinutes;
                        if (absenceType === 'sakit' || absenceType === 'ijin' || absenceType === 'cuti' || absenceType === 'alpha') {
                          netEffective = 0;
                        } else if (absenceType === 'ijin_sebagian') {
                          netEffective = effectiveMinutes - (leaveHours * 60);
                        }
                        
                        totalMonthly += netEffective + overtime;

                        if (isSunday) {
                          return (
                            <td key={date} style={{background: '#f5f5f5', textAlign: 'center'}}>
                              <small style={{color: '#999'}}>OFF</small>
                            </td>
                          );
                        }

                        // Determine cell background based on absence type
                        let cellStyle = {cursor: 'pointer', textAlign: 'center' as const};
                        if (absenceType === 'sakit') {
                          cellStyle = {...cellStyle, background: '#fff3cd'};
                        } else if (absenceType === 'ijin') {
                          cellStyle = {...cellStyle, background: '#d1ecf1'};
                        } else if (absenceType === 'ijin_sebagian') {
                          cellStyle = {...cellStyle, background: '#d4edda'};
                        } else if (absenceType === 'cuti') {
                          cellStyle = {...cellStyle, background: '#f8d7da'};
                        } else if (absenceType === 'alpha') {
                          cellStyle = {...cellStyle, background: '#f5c6cb'};
                        } else if (absenceType === 'lain-lain') {
                          cellStyle = {...cellStyle, background: '#e2e3e5'};
                        }

                        return (
                          <td
                            key={date}
                            style={cellStyle}
                            onClick={() => handleEditClick(mekanikData?.sheet_id || '', mekanik._id, mekanik.name, date, {
                              date,
                              start_time: entry?.start_time || workingHours.start,
                              end_time: entry?.end_time || workingHours.end,
                              break_start: entry?.break_start || workingHours.break_start,
                              break_end: entry?.break_end || workingHours.break_end,
                              effective_minutes: effectiveMinutes,
                              overtime,
                              absence_type: absenceType,
                              leave_hours: leaveHours
                            })}
                            title={absenceType ? `${absenceType}${leaveHours > 0 ? ` (${leaveHours}h)` : ''}` : `Click to edit - ${workingHours.start}-${workingHours.end}`}
                          >
                            {absenceType && absenceType !== 'ijin_sebagian' ? (
                              <small style={{fontWeight: 'bold', textTransform: 'uppercase', fontSize: '9px'}}>
                                {absenceType === 'sakit' && '🤒'}
                                {absenceType === 'ijin' && '📝'}
                                {absenceType === 'cuti' && '🏖'}
                                {absenceType === 'alpha' && '❌'}
                                {absenceType === 'lain-lain' && '📌'}
                                {' '}{absenceType}
                              </small>
                            ) : (
                              <>
                                <div style={{fontWeight: 'bold'}}>
                                  {absenceType === 'ijin_sebagian' ? netEffective : effectiveMinutes}
                                </div>
                                {overtime > 0 && (
                                  <small style={{color: 'blue'}}>+{overtime}</small>
                                )}
                                {absenceType === 'ijin_sebagian' && leaveHours > 0 && (
                                  <div><small style={{color: 'green'}}>-{leaveHours}h</small></div>
                                )}
                              </>
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
                  <div className="col-md-6">
                    <label className="form-label">Absence Type</label>
                    <select
                      className="form-select"
                      value={editEntry.entry.absence_type || ''}
                      onChange={(e) => setEditEntry({
                        ...editEntry,
                        entry: {
                          ...editEntry.entry,
                          absence_type: e.target.value as AbsenceType,
                          leave_hours: e.target.value === 'ijin_sebagian' ? editEntry.entry.leave_hours || 0 : 0
                        }
                      })}
                    >
                      <option value="">No Absence</option>
                      <option value="sakit">Sakit</option>
                      <option value="ijin">Ijin (Full Day)</option>
                      <option value="ijin_sebagian">Ijin Sebagian (Jam Tertentu)</option>
                      <option value="cuti">Cuti</option>
                      <option value="alpha">Alpha (Tanpa Keterangan)</option>
                      <option value="lain-lain">Lain-lain</option>
                    </select>
                  </div>
                  {editEntry.entry.absence_type === 'ijin_sebagian' && (
                    <div className="col-md-6">
                      <label className="form-label">Jam Ijin (hours)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editEntry.entry.leave_hours || 0}
                        onChange={(e) => setEditEntry({
                          ...editEntry,
                          entry: {...editEntry.entry, leave_hours: Number(e.target.value)}
                        })}
                        min="0"
                        max="8"
                        step="0.5"
                      />
                      <small className="text-muted">Jam kerja akan dikurangi sesuai jam ijin</small>
                    </div>
                  )}
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
