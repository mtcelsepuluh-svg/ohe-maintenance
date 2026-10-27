import { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface Mekanik {
  _id: string;
  name: string;
  user_id: string;
  machine_code?: string;
}

interface DailyWorkTime {
  date: number;
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
  // Worked minutes excluding overtime. Backend stores this as total_time - overtime.
  effective_minutes: number;
  // Backend's seeded baseline for this weekday; used for the +/- change indicator.
  standard_time: number;
  overtime: number;
  absence?: string;
  absence_type?: 'sakit' | 'ijin' | 'cuti' | 'alpha' | 'ijin_sebagian' | 'lain-lain';
  leave_hours?: number;
}

type AbsenceType = 'sakit' | 'ijin' | 'cuti' | 'alpha' | 'ijin_sebagian' | 'lain-lain';

const FULL_DAY_ABSENCES: AbsenceType[] = ['sakit', 'ijin', 'cuti', 'alpha'];

// Step for the inline +/- controls. The edit modal still allows single-minute
// changes and direct typing for finer adjustment.
const INLINE_STEP = 10;
const INLINE_LEAVE_STEP = 1;
const MAX_LEAVE_HOURS = 8;

const ABSENCE_OPTIONS: { value: AbsenceType | ''; label: string }[] = [
  { value: '', label: '–' },
  { value: 'sakit', label: 'Sakit' },
  { value: 'ijin', label: 'Ijin' },
  { value: 'ijin_sebagian', label: 'Ijin Seb' },
  { value: 'cuti', label: 'Cuti' },
  { value: 'alpha', label: 'Alpha' },
  { value: 'lain-lain', label: 'Lain' }
];

interface MekanikWorkTime {
  sheet_id: string;
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
  const [sheetIdMap, setSheetIdMap] = useState<Record<string, string>>({});
  // Inline editing: only the hovered cell renders its +/- toolbar, so 700+
  // cells don't each carry a pile of hidden buttons.
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [cellStatus, setCellStatus] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});
  // Tracks the period already fetched so Strict Mode's double effect is skipped,
  // while a real month/year change still triggers a reload.
  const loadedPeriodRef = useRef<string>('');
  // Per-cell request sequence so an out-of-order response from a slower PUT
  // can't overwrite the status of a newer edit.
  const saveSeqRef = useRef<Record<string, number>>({});
  // Latest inline-edited value per cell. Rapid clicks can land before React
  // re-renders, making the render-time `cellEntry` stale; see applyInlineChange.
  const pendingEntryRef = useRef<Record<string, DailyWorkTime>>({});

  useEffect(() => {
    loadMekaniks();
    const period = `${selectedYear}-${selectedMonth}`;
    if (loadedPeriodRef.current !== period) {
      loadedPeriodRef.current = period;
      loadWorkTimeData();
    }
  }, [selectedMonth, selectedYear]);

  const loadMekaniks = async () => {
    try {
      const response = await fetch('/api/mekaniks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      console.log('=== Mekaniks Response ===');
      console.log('Total mekaniks:', data.data?.length);
      
      // Map nama_mekanik to name for consistency
      const mekaniks = (data.data || []).map((m: any) => {
        // Clean name - remove extra quotes if any
        const cleanName = String(m.nama_mekanik || '').trim();
        console.log(`Mekanik: "${cleanName}" (ID: ${m._id})`);
        return {
          ...m,
          name: cleanName,
          user_id: m.machine_code
        };
      });
      setMekaniks(mekaniks);
    } catch (error) {
      console.error('Failed to load mekaniks:', error);
    }
  };

  const loadWorkTimeData = async () => {
    setLoading(true);
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/worktime/${selectedYear}/${selectedMonth}?_t=${timestamp}&_v=2`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      const data = await response.json();
      
      console.log('=== Work Time Data Response ===');
      console.log('Total sheets:', data.data?.length);
      
      // Create mapping from user_id (normalized) to sheet_id
      const idMap: Record<string, string> = {};
      
      // Map backend data to frontend expected format
      const mappedData = (data.data || []).map((sheet: any) => {
        const personelId = sheet.personel_id?._id || sheet.personel_id;
        const userId = sheet.personel_id?.user_id || '';
        const id = sheet._id;

        // Normalize user_id by removing dashes
        const normalizedUserId = userId.replace(/-/g, '').toUpperCase();

        console.log(`Sheet: ${sheet.personel_name} (user_id: ${userId}, normalized: ${normalizedUserId}) → ${id}`);
        idMap[normalizedUserId] = id;

        // Backend stores total_time = worked minutes INCLUDING overtime.
        // The UI edits them separately, so split overtime back out here.
        const dailyEntries = (sheet.daily_entries || []).map((entry: any) => {
          const overtime = entry.overtime || 0;
          const totalTime = entry.total_time ?? entry.standard_time ?? 0;
          return {
            ...entry,
            overtime,
            standard_time: entry.standard_time ?? 0,
            effective_minutes: Math.max(0, totalTime - overtime)
          };
        });

        return {
          sheet_id: id,
          mekanik_id: personelId,
          mekanik_name: sheet.personel_name,
          user_id: userId,
          daily_entries: dailyEntries,
          total_monthly: sheet.total_monthly
        };
      });
      
      console.log('=== Sheet ID Map (by normalized user_id) ===');
      console.log('Map keys:', Object.keys(idMap));
      console.log('Total entries:', Object.keys(idMap).length);
      
      // Fresh server data supersedes any accumulated inline edits.
      pendingEntryRef.current = {};
      saveSeqRef.current = {};
      setCellStatus({});
      setSheetIdMap(idMap);
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

  const handleEditClick = (mekanik_id: string, mekanik_name: string, machine_code: string, date: number, entry: DailyWorkTime) => {
    // Normalize machine_code by removing dashes
    const normalizedCode = machine_code.replace(/-/g, '').toUpperCase();
    const sheet_id = sheetIdMap[normalizedCode] || '';

    setEditEntry({ sheet_id, mekanik_id, mekanik_name, date, entry });
    setShowEditModal(true);
  };

  // Functional updater so rapid +/- clicks can't drop an edit.
  const adjustEntry = (patch: Partial<DailyWorkTime>) => {
    setEditEntry(prev => (prev ? { ...prev, entry: { ...prev.entry, ...patch } } : prev));
  };

  // Delta form for the modal's +/- buttons. The arithmetic happens inside the
  // updater, so it can never be computed from a stale `editEntry` closure.
  const adjustEntryBy = (field: 'effective_minutes' | 'overtime', delta: number) => {
    setEditEntry(prev => (prev
      ? { ...prev, entry: { ...prev.entry, [field]: Math.max(0, prev.entry[field] + delta) } }
      : prev));
  };

  const sheetIdFor = (mekanik: Mekanik) =>
    sheetIdMap[(mekanik.machine_code || '').replace(/-/g, '').toUpperCase()] || '';

  // Optimistic local update, deliberately without a refetch afterwards: the
  // Vite dev proxy can serve a stale sheet list, which would drop rows.
  // Keyed on sheet_id for the same reason as the row join above.
  const patchLocalEntry = (
    sheetId: string,
    date: number,
    current: DailyWorkTime,
    patch: Partial<DailyWorkTime>
  ) => {
    setWorkTimeData(prev => prev.map(sheet => {
      if (sheet.sheet_id !== sheetId) return sheet;
      const hasEntry = sheet.daily_entries.some(e => e.date === date);
      return {
        ...sheet,
        daily_entries: hasEntry
          ? sheet.daily_entries.map(e => (e.date === date ? { ...e, ...patch } : e))
          : [...sheet.daily_entries, { ...current, ...patch }]
      };
    }));
  };

  const saveDay = async (sheetId: string, date: number, next: DailyWorkTime) => {
    const key = `${sheetId}:${date}`;
    const seq = (saveSeqRef.current[key] || 0) + 1;
    saveSeqRef.current[key] = seq;
    setCellStatus(prev => ({ ...prev, [key]: 'saving' }));

    // Same contract as the modal: backend total_time INCLUDES overtime.
    const payload = {
      date,
      total_time: next.effective_minutes + next.overtime,
      overtime: next.overtime,
      absence_type: next.absence_type ?? null,
      leave_hours: next.leave_hours || 0
    };

    try {
      const response = await fetch(`/api/worktime/${sheetId}/day/${date}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (saveSeqRef.current[key] !== seq) return;
      if (result.success) {
        setCellStatus(prev => ({ ...prev, [key]: 'saved' }));
      } else {
        setCellStatus(prev => ({ ...prev, [key]: 'error' }));
        alert('Failed to update: ' + result.message);
      }
    } catch (error) {
      if (saveSeqRef.current[key] !== seq) return;
      setCellStatus(prev => ({ ...prev, [key]: 'error' }));
      alert('Failed to update work time: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // `computePatch` receives the accumulated base value, not the render-time
  // snapshot, so consecutive rapid clicks all count instead of collapsing.
  const applyInlineChange = (
    mekanik: Mekanik,
    date: number,
    current: DailyWorkTime,
    computePatch: (base: DailyWorkTime) => Partial<DailyWorkTime>
  ) => {
    const sheetId = sheetIdFor(mekanik);
    if (!sheetId) {
      alert('Error: Work time sheet not found. Please refresh the page and try again.');
      return;
    }
    const cellKey = `${mekanik._id}:${date}`;
    const base = pendingEntryRef.current[cellKey] ?? current;
    const patch = computePatch(base);
    const next = { ...base, ...patch };
    pendingEntryRef.current[cellKey] = next;

    patchLocalEntry(sheetId, date, base, patch);
    saveDay(sheetId, date, next);
  };

  const applyInlineAbsence = (
    mekanik: Mekanik,
    date: number,
    current: DailyWorkTime,
    value: AbsenceType | ''
  ) => {
    applyInlineChange(mekanik, date, current, (base) => ({
      absence_type: value === '' ? undefined : value,
      leave_hours: value === 'ijin_sebagian' ? (base.leave_hours || 0) : 0
    }));
  };

  const applyInlineReset = (mekanik: Mekanik, date: number, current: DailyWorkTime) => {
    applyInlineChange(mekanik, date, current, (base) => ({
      effective_minutes: base.standard_time,
      overtime: 0,
      absence_type: undefined,
      leave_hours: 0
    }));
  };

  const renderStatusBadge = (
    status: 'saving' | 'saved' | 'error' | undefined,
    isHovered: boolean
  ) => {
    if (!status) return null;
    // Errors stay pinned; saving/saved only show while hovering so the grid
    // isn't permanently speckled with badges.
    if (status !== 'error' && !isHovered) return null;
    const label = status === 'saving' ? '...' : status === 'saved' ? 'saved' : 'gagal';
    const color = status === 'error' ? '#dc3545' : status === 'saving' ? '#6c757d' : '#198754';
    return (
      <div style={{ fontSize: '8px', fontWeight: 'bold', color, lineHeight: '9px' }}>
        {label}
      </div>
    );
  };

  const renderInlineControls = (
    mekanik: Mekanik,
    date: number,
    cellKey: string,
    v: DailyWorkTime,
    flipUp: boolean
  ) => {
    if (hoveredCell !== cellKey) return null;

    const btnStyle = (color: string): React.CSSProperties => ({
      fontSize: '9px',
      lineHeight: '12px',
      padding: '0 2px',
      border: `1px solid ${color}`,
      background: 'white',
      color,
      borderRadius: '2px',
      cursor: 'pointer',
      fontWeight: 'bold'
    });

    const stepBtn = (label: string, color: string, title: string, onClick: () => void) => (
      <button
        type="button"
        title={title}
        style={btnStyle(color)}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        {label}
      </button>
    );

    const leaveHours = v.leave_hours || 0;

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          // Absolute overlay: revealing the controls must not change row height,
          // otherwise the whole grid jumps on every hover.
          position: 'absolute',
          left: 0,
          ...(flipUp ? { bottom: '100%' } : { top: '100%' }),
          zIndex: 30,
          width: '96px',
          padding: '3px',
          background: 'white',
          border: '1px solid #6c757d',
          borderRadius: '3px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}
      >
        <div style={{
          fontSize: '8px',
          textAlign: 'center',
          color: '#212529',
          borderBottom: '1px solid #dee2e6',
          paddingBottom: '2px',
          marginBottom: '1px'
        }}>
          M {v.effective_minutes} / std {v.standard_time} &middot; OT {v.overtime}
        </div>
        <div style={{ display: 'flex', gap: '1px', justifyContent: 'center' }}>
          {stepBtn('-OT', '#0d6efd', `Kurangi overtime ${INLINE_STEP} menit`, () =>
            applyInlineChange(mekanik, date, v, (b) => ({ overtime: Math.max(0, b.overtime - INLINE_STEP) })))}
          {stepBtn('+OT', '#0d6efd', `Tambah overtime ${INLINE_STEP} menit`, () =>
            applyInlineChange(mekanik, date, v, (b) => ({ overtime: b.overtime + INLINE_STEP })))}
        </div>
        <div style={{ display: 'flex', gap: '1px', justifyContent: 'center' }}>
          {stepBtn('-M', '#198754', `Kurangi menit efektif ${INLINE_STEP}`, () =>
            applyInlineChange(mekanik, date, v, (b) => ({ effective_minutes: Math.max(0, b.effective_minutes - INLINE_STEP) })))}
          {stepBtn('+M', '#198754', `Tambah menit efektif ${INLINE_STEP}`, () =>
            applyInlineChange(mekanik, date, v, (b) => ({ effective_minutes: b.effective_minutes + INLINE_STEP })))}
        </div>
        <select
          value={v.absence_type || ''}
          title="Tipe absence"
          style={{ fontSize: '8px', padding: '0', width: '100%' }}
          onChange={(e) => applyInlineAbsence(mekanik, date, v, e.target.value as AbsenceType | '')}
        >
          {ABSENCE_OPTIONS.map(o => (
            <option key={o.value || 'none'} value={o.value}>{o.label}</option>
          ))}
        </select>
        {v.absence_type === 'ijin_sebagian' && (
          <div style={{ display: 'flex', gap: '1px', justifyContent: 'center', alignItems: 'center' }}>
            {stepBtn('-h', '#6f42c1', `Kurangi jam ijin ${INLINE_LEAVE_STEP} jam`, () =>
              applyInlineChange(mekanik, date, v, (b) => ({ leave_hours: Math.max(0, (b.leave_hours || 0) - INLINE_LEAVE_STEP) })))}
            <span style={{ fontSize: '8px' }}>{leaveHours}h</span>
            {stepBtn('+h', '#6f42c1', `Tambah jam ijin ${INLINE_LEAVE_STEP} jam (maks ${MAX_LEAVE_HOURS})`, () =>
              applyInlineChange(mekanik, date, v, (b) => ({ leave_hours: Math.min(MAX_LEAVE_HOURS, (b.leave_hours || 0) + INLINE_LEAVE_STEP) })))}
          </div>
        )}
        {stepBtn('reset', '#6c757d', 'Reset ke standard_time (hapus overtime & absence)', () =>
          applyInlineReset(mekanik, date, v))}
      </div>
    );
  };

  const handleSaveEdit = async () => {
    if (!editEntry) {
      console.error('No edit entry found');
      return;
    }

    try {
      const sheetId = editEntry.sheet_id;

      if (!sheetId) {
        alert('Error: Work time sheet not found. Please refresh the page and try again.');
        return;
      }

      const { effective_minutes, overtime, absence_type, leave_hours } = editEntry.entry;

      // Backend's total_time includes overtime; recombine before sending.
      const payload = {
        date: editEntry.date,
        total_time: effective_minutes + overtime,
        overtime,
        absence_type: absence_type ?? null,
        leave_hours: leave_hours || 0
      };

      const url = `/api/worktime/${sheetId}/day/${editEntry.date}`;
      console.log('PUT', url, payload);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('Response:', response.status, result);

      if (result.success) {
        setShowEditModal(false);
        setEditEntry(null);
        alert('Work time updated successfully! Please refresh the page (F5) to see the updated data.');
      } else {
        alert('Failed to update: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to update work time:', error);
      alert('Failed to update work time: ' + (error instanceof Error ? error.message : String(error)));
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
          <div className="row g-3 mt-1">
            <div className="col-12">
              <div className="alert alert-secondary mb-0 py-1 px-2" style={{fontSize: '11px'}}>
                <strong>Inline editing:</strong> hover sel hari untuk memunculkan kontrolnya —
                {' '}<span style={{color: '#0d6efd', fontWeight: 'bold'}}>-OT/+OT</span> overtime,
                {' '}<span style={{color: '#198754', fontWeight: 'bold'}}>-M/+M</span> menit efektif (langkah {INLINE_STEP}),
                {' '}dropdown absence, <span style={{color: '#6f42c1', fontWeight: 'bold'}}>-h/+h</span> jam ijin untuk Ijin Sebagian,
                {' '}dan <span style={{fontWeight: 'bold'}}>reset</span> untuk kembali ke standard_time.
                Setiap perubahan langsung tersimpan. Klik selnya untuk editor lengkap.
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
                          minWidth: '92px',
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
                {mekaniks.map((mekanik, mekanikIndex) => {
                  const sheetId = sheetIdFor(mekanik);
                  // Join on sheet_id, NOT on mekanik._id. The grid rows come from the
                  // `mekaniks` collection while sheet.personel_id references `users`,
                  // so those _ids never match — matching on them left every row with
                  // mekanikData undefined, silently rendering frontend defaults
                  // instead of the stored data.
                  const mekanikData = workTimeData.find(w => w.sheet_id === sheetId);
                  // Rows in the lower half open their overlay upward so it isn't
                  // clipped by the scrollable table container.
                  const flipUp = mekanikIndex >= mekaniks.length / 2;
                  let totalMonthly = 0;

                  if (!mekanikData) {
                    console.log(`⚠ No work time sheet for: "${mekanik.name}" (ID: ${mekanik._id})`);
                  }

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

                        // `??` not `||`: a day genuinely reduced to 0 must still render as 0.
                        const effectiveMinutes = entry?.effective_minutes ?? workingHours.effective;
                        const overtime = entry?.overtime ?? 0;
                        const absenceType = entry?.absence_type;
                        const leaveHours = entry?.leave_hours ?? 0;
                        // Compare against the backend's own baseline for this weekday; the
                        // frontend's getWorkingHours() disagrees with it for Fri/Sat/Sun.
                        const standardTime = entry?.standard_time ?? workingHours.effective;

                        // One resolved snapshot of this cell, shared by the modal opener and
                        // the inline +/- controls so the two can never disagree.
                        const cellEntry: DailyWorkTime = {
                          date,
                          start_time: entry?.start_time || workingHours.start,
                          end_time: entry?.end_time || workingHours.end,
                          break_start: entry?.break_start || workingHours.break_start,
                          break_end: entry?.break_end || workingHours.break_end,
                          effective_minutes: effectiveMinutes,
                          standard_time: standardTime,
                          overtime,
                          absence_type: absenceType,
                          leave_hours: leaveHours
                        };
                        const cellKey = `${mekanik._id}:${date}`;
                        const status = sheetId ? cellStatus[`${sheetId}:${date}`] : undefined;
                        const isHovered = hoveredCell === cellKey;

                        const isFullDayAbsence = !!absenceType && FULL_DAY_ABSENCES.includes(absenceType);

                        // Calculate net effective minutes based on absence type
                        let netEffective = effectiveMinutes;
                        if (isFullDayAbsence) {
                          netEffective = 0;
                        } else if (absenceType === 'ijin_sebagian') {
                          netEffective = Math.max(0, effectiveMinutes - (leaveHours * 60));
                        }

                        // Mirrors the backend total_monthly formula: total_time (= effective +
                        // overtime) with absence adjustments. Overtime is already inside it.
                        let contribution = effectiveMinutes + overtime;
                        if (isFullDayAbsence) {
                          contribution = 0;
                        } else if (absenceType === 'ijin_sebagian' && leaveHours > 0) {
                          contribution = Math.max(0, contribution - (leaveHours * 60));
                        }
                        totalMonthly += contribution;

                        if (isSunday) {
                          return (
                            <td key={date}
                                style={{background: overtime > 0 ? '#fff3cd' : '#f5f5f5', textAlign: 'center', cursor: 'pointer', verticalAlign: 'top', position: 'relative'}}
                                onMouseEnter={() => setHoveredCell(cellKey)}
                                onMouseLeave={() => setHoveredCell(prev => (prev === cellKey ? null : prev))}
                                onClick={() => handleEditClick(mekanik._id, mekanik.name, mekanik.machine_code || '', date, cellEntry)}>
                              <small style={{color: '#999'}}>OFF</small>
                              {overtime > 0 && (
                                <div><small style={{color: 'blue', fontWeight: 'bold'}}>+{overtime}</small></div>
                              )}
                              {renderStatusBadge(status, isHovered)}
                              {renderInlineControls(mekanik, date, cellKey, cellEntry, flipUp)}
                            </td>
                          );
                        }

                        // Determine cell background based on absence type
                        let cellStyle: React.CSSProperties = {cursor: 'pointer', textAlign: 'center'};
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

                        const displayedMinutes = absenceType === 'ijin_sebagian' ? netEffective : effectiveMinutes;

                        return (
                          <td
                            key={date}
                            style={{...cellStyle, verticalAlign: 'top', position: 'relative'}}
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(prev => (prev === cellKey ? null : prev))}
                            onClick={() => handleEditClick(mekanik._id, mekanik.name, mekanik.machine_code || '', date, cellEntry)}
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
                                  {displayedMinutes}
                                </div>
                                {/* Show effective minutes change indicator */}
                                {(() => {
                                  const diff = displayedMinutes - standardTime;
                                  if (diff === 0) return null;
                                  return (
                                    <div>
                                      <small style={{
                                        color: diff > 0 ? 'green' : 'red',
                                        fontWeight: 'bold',
                                        fontSize: '9px'
                                      }}>
                                        {diff > 0 ? '+' : ''}{diff}
                                      </small>
                                    </div>
                                  );
                                })()}
                                {overtime > 0 && (
                                  <div><small style={{color: 'blue', fontWeight: 'bold'}}>+{overtime}</small></div>
                                )}
                                {absenceType === 'ijin_sebagian' && leaveHours > 0 && (
                                  <div><small style={{color: 'green'}}>-{leaveHours}h</small></div>
                                )}
                              </>
                            )}
                            {renderStatusBadge(status, isHovered)}
                            {renderInlineControls(mekanik, date, cellKey, cellEntry, flipUp)}
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
                    <div className="input-group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => adjustEntryBy('effective_minutes', -10)}
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => adjustEntryBy('effective_minutes', -1)}
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="1"
                        value={editEntry.entry.effective_minutes}
                        onChange={(e) => adjustEntry({ effective_minutes: Math.max(0, Number(e.target.value) || 0) })}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => adjustEntryBy('effective_minutes', 1)}
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => adjustEntryBy('effective_minutes', 10)}
                      >
                        +10
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Overtime (minutes)</label>
                    <div className="input-group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => adjustEntryBy('overtime', -10)}
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => adjustEntryBy('overtime', -1)}
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="1"
                        value={editEntry.entry.overtime}
                        onChange={(e) => adjustEntry({ overtime: Math.max(0, Number(e.target.value) || 0) })}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => adjustEntryBy('overtime', 1)}
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => adjustEntryBy('overtime', 10)}
                      >
                        +10
                      </button>
                    </div>
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
