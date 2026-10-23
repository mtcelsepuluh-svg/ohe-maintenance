import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface OvertimeInputProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (overtimeMinutes: number) => void;
  date: number;
  personelName: string;
  currentValue?: number;
}

const OvertimeInput = ({ show, onHide, onSubmit, date, personelName, currentValue = 0 }: OvertimeInputProps) => {
  const [overtimeMinutes, setOvertimeMinutes] = useState(currentValue);

  const handleSubmit = () => {
    onSubmit(overtimeMinutes);
    setOvertimeMinutes(0);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Overtime</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <p className="text-muted">
            Adding overtime for <strong>{personelName}</strong> on date <strong>{date}</strong>
          </p>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Overtime (minutes)</Form.Label>
          <Form.Control
            type="number"
            min="0"
            value={overtimeMinutes}
            onChange={(e) => setOvertimeMinutes(Number(e.target.value))}
            placeholder="Enter overtime minutes"
          />
          <Form.Text className="text-muted">
            Enter the number of overtime minutes (e.g., 60 for 1 hour, 120 for 2 hours)
          </Form.Text>
        </Form.Group>

        <div className="alert alert-info">
          <small>
            <strong>Quick conversions:</strong><br />
            30 min = 0.5 hour<br />
            60 min = 1 hour<br />
            90 min = 1.5 hours<br />
            120 min = 2 hours
          </small>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OvertimeInput;
