import { Modal, Button } from 'react-bootstrap';

interface WarningModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  actualTime: number;
  standardTime: number;
  activityName: string;
}

const WarningModal = ({ show, onHide, onConfirm, actualTime, standardTime, activityName }: WarningModalProps) => {
  const difference = actualTime - standardTime;
  const percentage = standardTime > 0 ? ((difference / standardTime) * 100).toFixed(1) : 0;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-warning">
        <Modal.Title>
          <i className="bi bi-exclamation-triangle"></i> Warning: Time Discrepancy
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="alert alert-warning">
          <h6 className="alert-heading">Actual Time Much Higher Than Standard Time</h6>
          <p className="mb-0">
            The actual time is significantly higher than the standard time for this activity.
          </p>
        </div>

        <div className="mb-3">
          <strong>Activity:</strong> {activityName}
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-body text-center">
                <small className="text-muted d-block">Actual Time</small>
                <h3 className="text-danger mb-0">{actualTime} min</h3>
                <small className="text-muted">
                  ({Math.floor(actualTime / 60)}h {actualTime % 60}m)
                </small>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-success">
              <div className="card-body text-center">
                <small className="text-muted d-block">Standard Time</small>
                <h3 className="text-success mb-0">{standardTime} min</h3>
                <small className="text-muted">
                  ({Math.floor(standardTime / 60)}h {standardTime % 60}m)
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="alert alert-info">
          <strong>Difference:</strong> {difference} minutes ({percentage}% higher)
        </div>

        <p className="text-muted">
          Please verify the actual time is correct. This could indicate:
        </p>
        <ul className="text-muted">
          <li>Unexpected complications during the task</li>
          <li>Equipment issues or delays</li>
          <li>Incorrect time entry</li>
          <li>Need to update standard time</li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="warning" onClick={onConfirm}>
          Confirm Anyway
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WarningModal;
