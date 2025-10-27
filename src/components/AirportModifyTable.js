import React, { useEffect, useState } from 'react';
import { Nav, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/Config';

const AirportModifyTable = () => {
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState('');
  const [plants, setPlants] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch steps
  useEffect(() => {
    axios.get(`${API_BASE_URL}/airport-process`)
      .then(res => {
        setSteps(res.data);
        if (res.data.length > 0) setActiveStep(res.data[0].PROCESS);
      })
      .catch(err => console.error('Error fetching processes', err));
  }, []);

  // Fetch plants
  useEffect(() => {
    axios.get(`${API_BASE_URL}/plants`)
      .then(res => setPlants(res.data))
      .catch(err => console.error('Error fetching plants', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async () => {
    const payload = new FormData();
    payload.append('plant', formData.plant || '');
    payload.append('applyDate', formData.applyDate || '');
    payload.append('process', activeStep);
    payload.append('comments', formData.comments || '');
    selectedFiles.forEach(file => payload.append('documents[]', file));

    try {
      await axios.post(`${API_BASE_URL}/airport-submit`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Submitted successfully');
    } catch (err) {
      console.error('Submit error', err);
      alert('Submission failed');
    }
  };

  return (
    <div className="p-3">
      {/* Horizontal pills */}
      <Nav variant="pills" activeKey={activeStep} onSelect={(k) => setActiveStep(k)} className="justify-content-center mb-4">
        {steps.map((step, idx) => (
          <Nav.Item key={idx}>
            <Nav.Link eventKey={step.PROCESS}>
              Step {idx + 1}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Form Content */}
      <Form className="p-3 border rounded">
        <h5 className="mb-3 text-center">{activeStep}</h5>

        {/* Plant Dropdown */}
        <Form.Group className="mb-3">
          <Form.Label>Plant</Form.Label>
          <Form.Select name="plant" value={formData.plant || ''} onChange={handleChange}>
            <option value="">Select Plant</option>
            {plants.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Apply Date */}
        <Form.Group className="mb-3">
          <Form.Label>Apply Date</Form.Label>
          <Form.Control type="date" name="applyDate" value={formData.applyDate || ''} onChange={handleChange} />
        </Form.Group>

        {/* Previously Uploaded Files */}
        <div className="mb-3">
          <strong>Previously Uploaded Files:</strong>
          {/* TODO: Fetch and list files for this step */}
        </div>

        {/* File Upload */}
        <Form.Group className="mb-3">
          <Form.Label>Upload Documents</Form.Label>
          <Form.Control type="file" multiple onChange={handleFileChange} />
          <ul className="mt-2">
            {selectedFiles.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        </Form.Group>

        {/* Comments */}
        <Form.Group className="mb-3">
          <Form.Label>Comments</Form.Label>
          <Form.Control as="textarea" rows={3} name="comments" value={formData.comments || ''} onChange={handleChange} />
        </Form.Group>

        {/* Submit */}
        <div className="text-center">
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AirportModifyTable;
