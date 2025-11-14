import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

// ✅ 1. MAKE SURE IT ACCEPTS `stepAmendData` PROP
const AmendmentPanel = ({ amendmentData, stepAmendData, onUpdate, setAmendmentStatus, onUploadClick }) => {
  const [formData, setFormData] = useState({
    amendmentDate: '',
    totalPrjArea: '',
    noOfNocs: '',
    reason: '',
  });

  // ✅ 2. THIS useEffect IS THE KEY
  // It populates the form using the props passed from the parent.
  useEffect(() => {
    if (amendmentData) {
      // Get the area and NOCs from the most specific source available
      const area = stepAmendData?.totalPrjArea || amendmentData.TOTAL_PRJ_AREA || '';
      const nocs = stepAmendData?.noOfNocs || amendmentData.NO_OF_NOCS || '';

      setFormData({
        totalPrjArea: area,
        
        // This is the key change: it sets the NOCs from the database value.
        // Your existing handleChange logic will override this if the user types in the area field.
        noOfNocs: nocs,
        
        // ... rest of the state updates remain the same
        amendmentDate: stepAmendData?.date || amendmentData.AMENDMENT_DT || '',
        reason: stepAmendData?.comments || amendmentData.DETAILS || '',
      });
    }
}, [amendmentData, stepAmendData]);

// YOUR handleChange REMAINS THE SAME - IT CORRECTLY OVERWRITES THE NOCs
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'totalPrjArea') {
        const area = Number(value);
        // This calculation logic will run when the user types, correctly updating the NOCs.
        const newNocs = area > 0 ? Math.ceil(area / 5) : '';
        return { ...prev, totalPrjArea: value, noOfNocs: newNocs };
      }
      return { ...prev, [name]: value };
    });
};

  const handleUpdateClick = () => { if (onUpdate) onUpdate(formData); };
  const handleCancelClick = () => { if (setAmendmentStatus) setAmendmentStatus(null); };

  return (
    <div className="border rounded p-3 bg-info bg-opacity-10">
      <h5 className="text-info fw-bold mb-3">Amendment In Progress</h5>
      <Form>
        <Row className="mb-3">
            <Col md={5}><Form.Group><Form.Label>Amendment Date</Form.Label><Form.Control type="date" name="amendmentDate" value={formData.amendmentDate} onChange={handleChange} /></Form.Group></Col>
            <Col md={4}><Form.Group><Form.Label>Total Project Area</Form.Label><Form.Control type="number" step="any" name="totalPrjArea" placeholder="e.g., 12.5" value={formData.totalPrjArea} onChange={handleChange} /></Form.Group></Col>
            <Col md={3}><Form.Group><Form.Label>No. of NOCs</Form.Label><Form.Control type="text" readOnly name="noOfNocs" placeholder="Auto" value={formData.noOfNocs} className="form-control-plaintext ps-2" /></Form.Group></Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Reason / Comments</Form.Label>
              {/* This textarea is now correctly linked to the `amend_comments` data */}
              <Form.Control as="textarea" rows={2} name="reason" value={formData.reason} onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Label>Upload Amendment Docs</Form.Label>
            <Button variant="outline-secondary" className="form-control" onClick={onUploadClick}>Upload Docs</Button>
          </Col>
        </Row>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button variant="secondary" size="sm" onClick={handleCancelClick}>Cancel</Button>
          <Button variant="info" size="sm" onClick={handleUpdateClick}>Submit Amendment Process</Button>
        </div>
      </Form>
    </div>
  );
};

export default AmendmentPanel;
