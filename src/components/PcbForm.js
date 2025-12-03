import React, { useState, useEffect } from 'react';
import { Container, Form, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import API_BASE_URL from '../config/Config';
import PcbProcessTable from './PcbProcessTable';

const PcbForm = ({ mode, showStatus, editableAll }) => {
  const [key, setKey] = useState('Pollution Control Board');
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [pcbProcesses, setPcbProcesses] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [applyDates, setApplyDates] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});

  // Fetch process list & plants on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/pcb-processes`)
      .then(res => setPcbProcesses(res.data))
      .catch(console.error);

    axios.get(`${API_BASE_URL}/plants`)
      .then(res => setPlants(res.data))
      .catch(console.error);
  }, []);

  // Fetch storeData when plant changes
  useEffect(() => {
    if (!selectedPlant) {
      setStoreData([]);
      setApplyDates({});
      setSelectedFiles({});
      return;
    }

    axios.get(`${API_BASE_URL}/pcb-store/${selectedPlant}`)
      .then(res => {
        setStoreData(res.data);

        if (mode === 'update' && !editableAll) {
          const updatedIndexes = pcbProcesses
            .map((row, idx) => res.data.find(item => item.PROCESS === row.PROCESS) ? idx : null)
            .filter(idx => idx !== null);
          const lastUpdatedIndex = updatedIndexes.length > 0 ? Math.max(...updatedIndexes) : -1;
          const nextProcess = pcbProcesses[lastUpdatedIndex + 1]?.PROCESS;

          setApplyDates(nextProcess ? { [nextProcess]: '' } : {});
          setSelectedFiles({});
        } else {
          const dates = {};
          res.data.forEach(item => {
            dates[item.PROCESS] = item.APPLY_DT || '';
          });
          setApplyDates(dates);
          setSelectedFiles({});
        }
      })
      .catch(console.error);
  }, [selectedPlant, mode, editableAll, pcbProcesses]);

  const handlePlantChange = (e) => {
    setSelectedPlant(e.target.value);
  };

  const handleApplyDateChange = (process, date) => {
    setApplyDates(prev => ({ ...prev, [process]: date }));
  };

  const handleFileChange = (process, file) => {
    setSelectedFiles(prev => ({ ...prev, [process]: file }));
  };

  const handleUpdateClick = async (process) => {
    const applyDate = applyDates[process];
    const selectedFile = selectedFiles[process];

    if (!applyDate || !selectedFile) {
      alert('Please provide both apply date and document');
      return;
    }

    const formData = new FormData();
    formData.append('loc', selectedPlant);
    formData.append('process', process);
    formData.append('applyDate', applyDate);
    formData.append('document', selectedFile);

    try {
      await axios.post(`${API_BASE_URL}/pollution-submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Updated successfully');

      // Refresh data
      const response = await axios.get(`${API_BASE_URL}/pcb-store/${selectedPlant}`);
      setStoreData(response.data);

      if (mode === 'update' && !editableAll) {
        const updatedIndexes = pcbProcesses
          .map((row, idx) => response.data.find(item => item.PROCESS === row.PROCESS) ? idx : null)
          .filter(idx => idx !== null);
        const lastUpdatedIndex = updatedIndexes.length > 0 ? Math.max(...updatedIndexes) : -1;
        const nextProcess = pcbProcesses[lastUpdatedIndex + 1]?.PROCESS;

        setApplyDates(nextProcess ? { [nextProcess]: '' } : {});
        setSelectedFiles({});
      } else {
        const dates = {};
        response.data.forEach(item => {
          dates[item.PROCESS] = item.APPLY_DT || '';
        });
        setApplyDates(dates);
        setSelectedFiles(prev => ({ ...prev, [process]: null }));
      }
    } catch (error) {
      console.error(error);
      alert('Update failed');
    }
  };

  let editableRows = [];
  if (mode === 'update' && !editableAll) {
    const updatedIndexes = pcbProcesses
      .map((row, idx) => storeData.find(item => item.PROCESS === row.PROCESS) ? idx : null)
      .filter(idx => idx !== null);
    const lastUpdatedIndex = updatedIndexes.length > 0 ? Math.max(...updatedIndexes) : -1;
    const nextProcess = pcbProcesses[lastUpdatedIndex + 1]?.PROCESS;
    if (nextProcess) editableRows = [nextProcess];
  } else {
    editableRows = pcbProcesses.map(p => p.PROCESS);
  }

  return (
    <Container className="mt-4">
      <h2>{mode === 'update' ? 'Update Section' : 'Modify Section'}</h2>

      <Tabs activeKey={key} onSelect={setKey} className="mb-3" fill justify>
        <Tab eventKey="Pollution Control Board" title="Pollution Control Board">
          <Form>
            <Form.Group controlId="plantSelect" className="d-flex justify-content-center align-items-center mb-3">
              <Form.Label className="me-3 mb-0">Select Plant</Form.Label>
              <Form.Select
                value={selectedPlant}
                onChange={handlePlantChange}
                className="w-25"
              >
                <option value="">-- Select a Plant --</option>
                {plants.map(plant => (
                  <option key={plant.loc} value={plant.loc}>{plant.loc}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>

          <PcbProcessTable
            pcbProcesses={pcbProcesses}
            storeData={storeData}
            applyDates={applyDates}
            selectedFiles={selectedFiles}
            onApplyDateChange={handleApplyDateChange}
            onFileChange={handleFileChange}
            onUpdateClick={handleUpdateClick}
            selectedPlant={selectedPlant}
            editableRows={editableRows}
            showStatus={showStatus}
          />
        </Tab>

        <Tab eventKey="Airport Authority" title="Airport Authority">
          <p>Airport Authority tab content goes here.</p>
        </Tab>
        
   <Tab eventKey="Fire" title="Fire">
          <p>Fire tab content goes here.</p>
        </Tab>

        <Tab eventKey="HMDA" title="HMDA">
          <p>HMDA tab content goes here.</p>
        </Tab>

     
      </Tabs>
    </Container>
  );
};

export default PcbForm;
