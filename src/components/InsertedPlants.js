// components/PlantDropdown.js
import React, { useEffect, useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/Config';

const InsertedPlants = ({ selectedPlant, onChange }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/plants`)
      .then(res => {
        setPlants(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching plant list:', err);
        setLoading(false);
      });
  }, []);

  return (
    <Form.Group controlId="plantDropdown">
      <Form.Label>Plant</Form.Label>
      <div className="d-flex align-items-center">
        <Form.Select
          value={selectedPlant}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
        >
          <option value="">Select Plant</option>
          {plants.map((plant) => (
            <option key={plant.PCODE} value={plant.PCODE}>
              {plant.PNAME}
            </option>
          ))}
        </Form.Select>
        {loading && <Spinner animation="border" size="sm" className="ms-2" />}
      </div>
    </Form.Group>
  );
};

export default InsertedPlants;
