import { DailyEntry } from '../services/workTimeService';

interface WorkTimeCellProps {
  entry: DailyEntry;
  onEdit: () => void;
  onAddOvertime: () => void;
  onMarkAbsence: () => void;
}

const WorkTimeCell = ({ entry, onEdit, onAddOvertime, onMarkAbsence }: WorkTimeCellProps) => {
  const getCellColor = () => {
    if (entry.status === 'absence') {
      return 'bg-danger bg-opacity-10 border-danger';
    }
    if (entry.overtime > 0) {
      return 'bg-primary bg-opacity-10 border-primary';
    }
    if (entry.is_half_day) {
      return 'bg-warning bg-opacity-10 border-warning';
    }
    return 'bg-success bg-opacity-10 border-success';
  };

  const getStatusBadge = () => {
    if (entry.status === 'absence') {
      const typeLabels: { [key: string]: string } = {
        sakit: 'S',
        ijin: 'I',
        cuti: 'C',
        'lain-lain': 'L'
      };
      return (
        <span className="badge bg-danger">
          {typeLabels[entry.absence_type || 'lain-lain']}
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className={`work-time-cell p-2 border rounded ${getCellColor()}`}
      style={{ minWidth: '120px', cursor: 'pointer' }}
      onClick={onEdit}
      onContextMenu={(e) => {
        e.preventDefault();
        onEdit();
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted">{entry.day_of_week}</small>
        {getStatusBadge()}
      </div>
      
      <div className="text-center">
        <div className="fw-bold">
          {entry.status === 'absence' ? (
            <span className="text-danger">ABSENT</span>
          ) : (
            <>
              <span className="text-success">{entry.standard_time}</span>
              {entry.overtime > 0 && (
                <>
                  {' '}
                  / <span className="text-primary">{entry.overtime}</span>
                </>
              )}
            </>
          )}
        </div>
        <small className="text-muted">
          Total: {entry.total_time} min
        </small>
      </div>

      {entry.status === 'present' && (
        <div className="d-flex gap-1 mt-2">
          <button
            className="btn btn-sm btn-outline-primary flex-fill"
            onClick={(e) => {
              e.stopPropagation();
              onAddOvertime();
            }}
            title="Add overtime"
          >
            +OT
          </button>
          <button
            className="btn btn-sm btn-outline-danger flex-fill"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAbsence();
            }}
            title="Mark absence"
          >
            Abs
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkTimeCell;
