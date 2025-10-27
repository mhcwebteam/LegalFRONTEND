import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, CardHeader } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/Config';

import PcbTabs from '../components/PcbTabs';
import PlantSelector from '../components/PlantSelector';
import CategorySelector from '../components/CategorySelector';

import '../pages/Amendment.css';
// import '../pages/Update.css';
// import '../components/PcbTabs.css';
import CardWithHeader from '../components/CardWithHeader';
import Swal from 'sweetalert2';
// import { text } from 'framer-motion/client';
import { motion, AnimatePresence } from 'framer-motion';

const Amendment = () => {
  const [key, setKey] = useState('Pollution Control Board');
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [category, setCategory] = useState('');

  const [categories, setCategories] = useState([]);

  const tabList = [
  'Pollution Control Board',
  'Airport Authority',
  'HMDA',
  'Fire',
];

useEffect(() => {
  if (!selectedPlant) {
    setCategories([]);
    setCategory('');
    return;
  }

  axios.get(`${API_BASE_URL}/categories/${selectedPlant}`)
    .then(res => {
      console.log('Fetched categories:', res.data);
      setCategories(res.data);
    })
    .catch(err => {
      console.error('Error fetching categories:', err);
      setCategories([]);
    });
}, [selectedPlant]);


  useEffect(() => {
    axios.get(`${API_BASE_URL}/amnd_plants`)
      .then(res => {
        console.log('fetched palnts:', res.data);
        setPlants(res.data)
      })
      .catch(err => console.error(err));
  }, []);

  const handlePlantChange = (e) => {
    setSelectedPlant(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

//   const handleCreate = () => {
//     if (!selectedPlant || !category) {
//       alert('Please select both Plant and Category of Amendment');
//       return;
//     }
//     console.log('Create triggered with:', { plant: selectedPlant, category });
//     // TODO: trigger modal/form/api logic here
//   };
  const handleCreate = async () => {
      if (!selectedPlant || !category) {
        // alert('Please select both Plant and Category of Amendment');
        await Swal.fire({
          icon: 'warning',
          title: 'Missing Fields',
          text: 'Please select both Plant and Category of Amendment',
        });
        return;
      }

      const payload = {
        plant: selectedPlant,
        category: category,
        process: key // tab name becomes the process name
      };
      console.log(payload);
      try {
        const res = await axios.post(`${API_BASE_URL}/amendments`, payload);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Amendment saved successfully!',
        });
        console.log(res.data);
      } 
        catch (err) {
        console.error(err);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error saving amendment',
        });
      }

    };


  return (
    <CardWithHeader title='Amendment Section'>

      <PcbTabs keyState={key} setKey={setKey} tabList={tabList}>
        {key === 'Pollution Control Board' }
        {key === 'Airport Authority' }
        {key === 'HMDA' && <p>This is the HMDA tab.</p>}
        {key === 'Fire' && <p>This is the Fire tab.</p>}
        <Row className="g-3 align-items-end">
            <Col md={4} className="amendment-plant-wrapper">
                <PlantSelector
                    plants={plants}
                    selectedPlant={selectedPlant}
                    onChange={handlePlantChange}
                />
            </Col>


            <Col md={4}>
                <CategorySelector
                  category={category}
                  categories={categories}
                  onChange={handleCategoryChange}
                />

            </Col>

            <Col md={4}>
                <div className="mb-1">
                    <Button
                    variant="primary"
                    className="w-50"
                    onClick={handleCreate}
                    >
                    Create
                    </Button>
                </div>
            </Col>

        </Row>
      </PcbTabs>
    </CardWithHeader>

  );
};

export default Amendment; 