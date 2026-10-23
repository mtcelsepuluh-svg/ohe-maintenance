import { WorkTimeSheet } from '../services/workTimeService';

interface WorkTimeSummaryProps {
  sheets: WorkTimeSheet[];
}

const WorkTimeSummary = ({ sheets }: WorkTimeSummaryProps) => {
  const totalPersonel = sheets.length;
  const totalMonthlyMinutes = sheets.reduce((sum, sheet) => sum + sheet.total_monthly, 0);
  const totalMonthlyHours = Math.floor(totalMonthlyMinutes / 60);
  const avgMonthlyMinutes = totalPersonel > 0 ? totalMonthlyMinutes / totalPersonel : 0;
  const avgMonthlyHours = Math.floor(avgMonthlyMinutes / 60);

  const totalOvertime = sheets.reduce((sum, sheet) => {
    return sum + sheet.daily_entries.reduce((daySum, entry) => daySum + entry.overtime, 0);
  }, 0);

  return (
    <div className="row g-3 mb-4">
      <div className="col-md-3">
        <div className="card border-primary">
          <div className="card-body text-center">
            <h6 className="text-muted mb-2">Total Personel</h6>
            <h2 className="text-primary mb-0">{totalPersonel}</h2>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card border-success">
          <div className="card-body text-center">
            <h6 className="text-muted mb-2">Total Work Hours</h6>
            <h2 className="text-success mb-0">{totalMonthlyHours}</h2>
            <small className="text-muted">{totalMonthlyMinutes} minutes</small>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card border-warning">
          <div className="card-body text-center">
            <h6 className="text-muted mb-2">Total Overtime</h6>
            <h2 className="text-warning mb-0">{Math.floor(totalOvertime / 60)}</h2>
            <small className="text-muted">{totalOvertime} minutes</small>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card border-info">
          <div className="card-body text-center">
            <h6 className="text-muted mb-2">Avg per Personel</h6>
            <h2 className="text-info mb-0">{avgMonthlyHours}</h2>
            <small className="text-muted">{Math.floor(avgMonthlyMinutes)} minutes</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkTimeSummary;
