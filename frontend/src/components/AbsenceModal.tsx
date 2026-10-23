import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface AbsenceModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (absenceType: 'sakit' | 'ijin' | 'cuti' | 'lain-lain', remarks: string) => void;
  date: number;
  personelName: string;
}

const AbsenceModal = ({ show, onHide, onSubmit, date, personelName }: AbsenceModalProps) => {
  const [absenceType, setAbsenceType] = useState<'sakit' | 'ijin' | 'cuti' | 'lain-lain'>('sakit');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = () => {
    onSubmit(absenceType, remarks);
    setAbsenceType('sakit');
    setRemarks('');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Mark Absence</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <p className="text-muted">
            Marking absence for <strong>{personelName}</strong> on date <strong>{date}</strong>
          </p>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Absence Type</Form.Label>
          <Form.Select
            value={absenceType}
            onChange={(e) => setAbsenceType(e.target.value as any)}
          >
            <option value="sakit">Sakit</option>
            <option value="ijin">Ijin</option>
            <option value="cuti">Cuti</option>
            <option value="lain-lain">Lain-lain</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Remarks (Optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any additional notes..."
          />
        </Form.Group>
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

export default AbsenceModal;
