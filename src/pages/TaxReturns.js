import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/Config';
import PlantSelect from '../components/PlantSelect';
import PlantSelector from '../components/PlantSelector';
import CardWithHeader from '../components/CardWithHeader';
import { TabLabels } from '../components/TabIcons';

import Swal from 'sweetalert2';
import '../pages/Amendment.css';

const TaxReturns = () => {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [approvalAuthority, setApprovalAuthority] = useState('');
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  axios.get(`${API_BASE_URL}/plants`)
    .then(res => {
      console.log('fetched plants:', res.data);
      setPlants(res.data);
      setLoading(false); // ✅ important to stop spinner
    })
    .catch(err => {
      console.error(err);
      setLoading(false); // also stop spinner on error
    });
}, []);

    const handlePlantChange = (value) => {
        setSelectedPlant(value);
    };


  const handleCreate = () => {
    if (!selectedPlant || !approvalAuthority) {
      Swal.fire('Missing Fields', 'Please select both Plant and Approval Authority.', 'warning');
      return;
    }

    // Submit logic here
    Swal.fire('Success', `Plant: ${selectedPlant}, Authority: ${approvalAuthority}`, 'success');
  };

  return (
    <CardWithHeader title="Tax Returns Section">
      <Row className="g-3 align-items-end">
        <Col md={4} className='amendment-plant-wrapper'>
          <Form.Group controlId="plantSelect">
            <div className="d-flex align-items-center">
              <Form.Label className="me-3 mb-0" style={{ whiteSpace: 'nowrap' }}>
                Select Plant
              </Form.Label>
              <Form.Select
                value={selectedPlant}
                onChange={(e) => handlePlantChange(e.target.value)}
                style={{ flex: 1, border: '1px solid #7b2cbf' }}
                className="form-select-sm"
              >
                <option value="">-- Select Plant --</option>
                {plants.map((plant, index) => (
                  <option key={index} value={plant.loc}>
                    {plant.loc}
                  </option>
                ))}
              </Form.Select>
              {loading && <Spinner size="sm" animation="border" className="ms-2" />}
            </div>
          </Form.Group>
        </Col>

        <Col md={4} className="amendment-plant-wrapper">
            <Form.Group controlId="authoritySelect">
                <div className="d-flex align-items-center">
                <Form.Label className="me-3 mb-0" style={{ whiteSpace: 'nowrap' }}>
                    Approval Authority
                </Form.Label>
                <Form.Select 
                    style={{ flex: 1 }}
                    className="form-select-sm"value={approvalAuthority}
                    onChange={(e) => setApprovalAuthority(e.target.value)}>
                    <option value="">Select Approval Authority</option>
                    {Object.entries(TabLabels).map(([key, label]) => (
                    <option key={key} value={label}>
                        {label}
                    </option>
                    ))}
                </Form.Select>
                </div>
            </Form.Group>
        </Col>

        <Col md={4}>
          <div className="mb-0">
            <Button variant="primary" className="w-50 p-1"  onClick={handleCreate}>
              Create
            </Button>
          </div>
        </Col>
      </Row>
    </CardWithHeader>
  );
};

export default TaxReturns;
