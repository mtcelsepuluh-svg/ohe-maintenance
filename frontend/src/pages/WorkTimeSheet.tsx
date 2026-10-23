import { useState, useEffect } from 'react';
import { workTimeService, WorkTimeSheet, DailyEntry } from '../services/workTimeService';
import WorkTimeCell from '../components/WorkTimeCell';
import WorkTimeSummary from '../components/WorkTimeSummary';
import AbsenceModal from '../components/AbsenceModal';
import OvertimeInput from '../components/OvertimeInput';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { id } from 'date-fns/locale';

const WorkTimeSheetPage = () => {
  const [sheets, setSheets] = useState<WorkTimeSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<{ sheet: WorkTimeSheet; entry: DailyEntry } | null>(null);

  useEffect(() => {
    loadWorkTimeSheets();
  }, [selectedMonth, selectedYear]);

  const loadWorkTimeSheets = async () => {
    setLoading(true);
    try {
      const { data } = await workTimeService.getWorkTimeSheet(selectedYear, selectedMonth);
      setSheets(data);
    } catch (error) {
      console.error('Failed to load work time sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (sheet: WorkTimeSheet, entry: DailyEntry) => {
    setSelectedEntry({ sheet, entry });
  };

  const handleAddOvertime = async (overtimeMinutes: number) => {
    if (!selectedEntry) return;

    try {
      await workTimeService.addOvertime(
        selectedEntry.sheet._id,
        selectedEntry.entry.date,
        overtimeMinutes,
        true
      );
      setShowOvertimeModal(false);
      loadWorkTimeSheets();
    } catch (error) {
      console.error('Failed to add overtime:', error);
      alert('Failed to add overtime');
    }
  };

  const handleMarkAbsence = async (
    absenceType: 'sakit' | 'ijin' | 'cuti' | 'lain-lain',
    remarks: string
  ) => {
    if (!selectedEntry) return;

    try {
      await workTimeService.markAbsence(
        selectedEntry.sheet._id,
        selectedEntry.entry.date,
        absenceType,
        remarks
      );
      setShowAbsenceModal(false);
      loadWorkTimeSheets();
    } catch (error) {
      console.error('Failed to mark absence:', error);
      alert('Failed to mark absence');
    }
  };

  const handleExport = async () => {
    try {
      await workTimeService.downloadExcel(selectedYear, selectedMonth);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export to Excel');
    }
  };

  const handleCreateBulk = async () => {
    if (!confirm(`Create work time sheets for all personel for ${format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}?`)) {
      return;
    }

    try {
      const result = await workTimeService.createBulkWorkTimeSheets({
        month: selectedMonth,
        year: selectedYear
      });
      alert(`Created ${result.results.created} sheets, skipped ${result.results.skipped}`);
      loadWorkTimeSheets();
    } catch (error) {
      console.error('Failed to create bulk sheets:', error);
      alert('Failed to create work time sheets');
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(new Date(selectedYear, selectedMonth - 1));
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end });
  };

  const calculateDailyTotal = (date: number) => {
    return sheets.reduce((sum, sheet) => {
      const entry = sheet.daily_entries.find(e => e.date === date);
      return sum + (entry?.total_time || 0);
    }, 0);
  };

  const calculateDailyOvertime = (date: number) => {
    return sheets.reduce((sum, sheet) => {
      const entry = sheet.daily_entries.find(e => e.date === date);
      return sum + (entry?.overtime || 0);
    }, 0);
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

  const days = getDaysInMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Work Time Sheet</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={handleExport}>
            📊 Export Excel
          </button>
          <button className="btn btn-primary" onClick={handleCreateBulk}>
            + Create Sheets
          </button>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-3">
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
            <div className="col-md-3">
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
            <div className="col-md-6">
              <label className="form-label">Legend</label>
              <div className="d-flex gap-3 flex-wrap">
                <span className="badge bg-success">Normal Day</span>
                <span className="badge bg-warning">Half Day (Sat)</span>
                <span className="badge bg-primary">Overtime</span>
                <span className="badge bg-danger">Absence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <WorkTimeSummary sheets={sheets} />

      {/* Spreadsheet Grid */}
      <div className="card">
        <div className="card-header">
          {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy', { locale: id })}
        </div>
        <div className="card-body">
          <div className="table-responsive" style={{ maxHeight: '600px', overflowX: 'auto' }}>
            <table className="table table-bordered table-hover" style={{ minWidth: `${days.length * 150 + 200}px` }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                <tr>
                  <th style={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 11, minWidth: '200px' }}>
                    Personel
                  </th>
                  {days.map((day) => {
                    const dayOfWeek = getDay(day);
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    return (
                      <th
                        key={day.getDate()}
                        className={`text-center ${isWeekend ? 'table-warning' : ''}`}
                        style={{ minWidth: '120px' }}
                      >
                        <div>{format(day, 'd')}</div>
                        <small>{format(day, 'EEE', { locale: id })}</small>
                      </th>
                    );
                  })}
                  <th className="text-center table-primary" style={{ minWidth: '100px' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {sheets.map((sheet) => (
                  <tr key={sheet._id}>
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'white',
                        zIndex: 5,
                        fontWeight: 'bold'
                      }}
                    >
                      {sheet.personel_name}
                    </td>
                    {sheet.daily_entries.map((entry) => (
                      <td key={entry.date} className="p-1">
                        <WorkTimeCell
                          entry={entry}
                          onEdit={() => handleCellClick(sheet, entry)}
                          onAddOvertime={() => {
                            setSelectedEntry({ sheet, entry });
                            setShowOvertimeModal(true);
                          }}
                          onMarkAbsence={() => {
                            setSelectedEntry({ sheet, entry });
                            setShowAbsenceModal(true);
                          }}
                        />
                      </td>
                    ))}
                    <td className="text-center fw-bold table-primary">
                      {sheet.total_monthly}
                      <br />
                      <small>({Math.floor(sheet.total_monthly / 60)}h)</small>
                    </td>
                  </tr>
                ))}
                {/* Summary Row */}
                <tr className="table-secondary fw-bold">
                  <td
                    style={{
                      position: 'sticky',
                      left: 0,
                      backgroundColor: '#e9ecef',
                      zIndex: 5
                    }}
                  >
                    Total/Day
                  </td>
                  {days.map((day) => {
                    const date = day.getDate();
                    const totalStandard = calculateDailyTotal(date);
                    const totalOvertime = calculateDailyOvertime(date);
                    return (
                      <td key={date} className="text-center">
                        <div>{totalStandard}</div>
                        {totalOvertime > 0 && (
                          <small className="text-primary">+{totalOvertime}</small>
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center table-primary">
                    {sheets.reduce((sum, sheet) => sum + sheet.total_monthly, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {sheets.length === 0 && (
            <div className="text-center text-muted py-5">
              <h5>No work time sheets found</h5>
              <p>Click "Create Sheets" to generate work time sheets for all personel</p>
            </div>
          )}
        </div>
      </div>

      {/* Absence Modal */}
      {selectedEntry && (
        <AbsenceModal
          show={showAbsenceModal}
          onHide={() => setShowAbsenceModal(false)}
          onSubmit={handleMarkAbsence}
          date={selectedEntry.entry.date}
          personelName={selectedEntry.sheet.personel_name}
        />
      )}

      {/* Overtime Modal */}
      {selectedEntry && (
        <OvertimeInput
          show={showOvertimeModal}
          onHide={() => setShowOvertimeModal(false)}
          onSubmit={handleAddOvertime}
          date={selectedEntry.entry.date}
          personelName={selectedEntry.sheet.personel_name}
          currentValue={selectedEntry.entry.overtime}
        />
      )}
    </div>
  );
};

export default WorkTimeSheetPage;
