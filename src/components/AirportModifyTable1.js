import React, { useEffect, useState } from 'react';
import { Nav, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/Config';


const AirportModifyTable = () => {
  
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0); // index-based
  const [plants, setPlants] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
const [selectedPlant, setSelectedPlant] = useState('');
const [stepData, setStepData] = useState([]); 


  // Fetch steps
  useEffect(() => {
    axios.get(`${API_BASE_URL}/airport-process`)
      .then(res => {
        setSteps(res.data);
        if (res.data.length > 0) setActiveStep(0);
      })
      .catch(err => console.error('Error fetching processes', err));
  }, []);

  // Fetch plants
  useEffect(() => {
    axios.get(`${API_BASE_URL}/airport-plants`)
      .then(res => {
        console.log('fetch plants', res.data);
        setPlants(res.data);
      })
      .catch(err => console.error('Error fetching plants', err));
  }, []);

  useEffect(() => {
  if (selectedPlant) {
    axios.get(`${API_BASE_URL}/airport-data?plant=${selectedPlant}`)
      .then(res => {
        console.log('stepdata:', res.data);
        setStepData(res.data);
        if (res.data.length > 0) {
  const firstStep = res.data[0];
  setFormData({
    plant: selectedPlant,
    applyDate: firstStep.APPLY_DT ? firstStep.APPLY_DT.split('T')[0] : '',
    comments: ''
  });
}

        findActiveStep(res.data); // Determines active step
      })
      .catch(err => console.error('Error fetching step data', err));
  }
}, [selectedPlant]);

// This function finds the active (yellow) step based on 'UPDATED' column
const findActiveStep = (data) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].UPDATED !== 'YES') {
      setActiveStep(i); // immediate next step
      return;
    }
  }
  setActiveStep(data.length); // all are completed
};

 const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));

  if (name === 'plant') {
    setSelectedPlant(value);
  }
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
console.log("Current Step Data:", stepData[activeStep]);

  return (
    <Row>
      {/* Left side pills */}
      <Col md={3}>
        <Nav variant="pills" className="flex-column">
          {steps.map((step, idx) => {
            // Determine color variant
            let variant = 'danger'; // red (pending)
            if (stepData[idx]?.UPDATED === 'YES') variant = 'success'; // green (completed)
            else if (idx === activeStep) variant = 'warning'; // yellow (current)

            return (
              <Nav.Item key={idx}>
                <Nav.Link
                  eventKey={idx}
                  active={idx === activeStep}
                  onClick={() => setActiveStep(idx)}
                  className={`text-${variant}`}
                >
                  {step.PROCESS}
                </Nav.Link>
              </Nav.Item>
            );
          })}
        </Nav>
      </Col>

      {/* Right side content */}
      <Col md={9}>
        <Form className="p-3 border rounded">
          {/* <h5>{activeStep}</h5> */}

          {/* Plant Dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>Plant</Form.Label>
            <Form.Select className='form-control' name="plant" value={formData.plant || ''} onChange={handleChange}>
              <option value="">Select Plant</option>
              {plants.map((p, idx) => (
                <option key={idx} value={p.loc}>
                  {p.loc}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Apply Date */}
          <Form.Group className="mb-3">
            <Form.Label>Apply Date</Form.Label>
            <Form.Control type="date" name="applyDate" value={formData.applyDate || ''} onChange={handleChange} />
          </Form.Group>

          {/* Previously Uploaded Files */}
         {/* Previously Uploaded Files */}
<div className="mb-3">
  <strong>Previously Uploaded File:</strong>

  {stepData.length > 0 && stepData[activeStep] && (() => {
    const step = stepData[activeStep];
    const linkDocs = JSON.parse(step.LINK_DOC_NAME || '[]');
    const linkPaths = JSON.parse(step.LINK_DOC_PATH || '[]');
    const landDocs = JSON.parse(step.LAND_DOC_NAME || '[]');
    const landPaths = JSON.parse(step.LAND_DOC_PATH || '[]');
    const othDocs = JSON.parse(step.OTH_DOC_NAME || '[]');
    const othPaths = JSON.parse(step.OTH_DOC_PATH || '[]');

    const renderDocList = (title, names, paths) =>
      names.length > 0 && (
        <>
          <h6>{title}</h6>
          <ul>
            {names.map((name, idx) => (
              <li key={idx}>
                <a
                  href={`${API_BASE_URL}/storage/${paths[idx]}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </>
      );

    return (
      <>
        {renderDocList('Link Documents', linkDocs, linkPaths)}
        {renderDocList('Land Documents', landDocs, landPaths)}
        {renderDocList('Other Documents', othDocs, othPaths)}
      </>
    );
  })()}
</div>


          {/* File Upload */}
          <Form.Group className="mb-3">
            <Form.Label>Upload Documents</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileChange} />
            <ul>
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
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Form>
      </Col>
    </Row>
  );
};

export default AirportModifyTable;
