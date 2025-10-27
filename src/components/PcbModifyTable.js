import React, { useState, useEffect } from 'react';
import { Container, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PlantSelector from '../components/PlantSelector';
import PcbTabs from '../components/PcbTabs';
import { API_BASE_URL, API_DOC_URL } from '../config/Config';
import '../pages/Update.css';
import AmendModal from '../components/AmendModal';
import CardWithHeader from '../components/CardWithHeader';
import { useRef } from 'react';
import Swal from 'sweetalert2';

const PcbModifyTable = () => {
 const navigate = useNavigate();
  const [key, setKey] = useState('Pollution Control Board');
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [pcbProcesses, setPcbProcesses] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [amendmentRecords, setAmendmentRecords] = useState([]);
  const [amendCategories, setAmendCategories] = useState([]);
  const [status, setStatus] = useState('');

  const fileInputRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    plant: '',
    process: '',
    applyDate: '',
    selectedFiles: [],
    existingDocs: [],
    existingNames: [],
    comments: '',
  });

  const [showAmendModal, setShowAmendModal] = useState(false);
  const [amendData, setAmendData] = useState({
    plant: '',
    process: '',
    applyDate: '',
    category: '',
    selectedFiles: [],
    existingDocs: [],
    existingNames: [],
    comments: '',
    oldComments: '',
  });
  
// Load initial data
  useEffect(() => {
    axios.get(`${API_BASE_URL}/pcb-processes`).then(res => setPcbProcesses(res.data));
    axios.get(`${API_BASE_URL}/plants`).then(res => setPlants(res.data));
  }, []);

  // Fetch store data on plant change
  useEffect(() => {
    if (selectedPlant) {
      axios.get(`${API_BASE_URL}/pcb-store/${selectedPlant}`)
        .then(res => {
          console.log('process',res.data);
          setStoreData(res.data)
        })
        .catch(err => console.error(err));
    } else {
      setStoreData([]);
    }
  }, [selectedPlant]);

  // Fetch amendment categories/status for the selected plant and process
  useEffect(() => {
    if (selectedPlant && key) {
      axios.get(`${API_BASE_URL}/amendments/${selectedPlant}/${key}`)
        .then(res => {
          const records = res.data.data || [];
          console.log('✅ Amendment API records:', records);
          setAmendmentRecords(records);

          // Status for process column
          const processRecord = records.find(r => r.PROCESS === key);
          setStatus(processRecord?.STATUS || '');

          // Only categories with STATUS = 'created'
          const createdRecords = records.filter(r => r.STATUS === 'created');
          const categories = [...new Set(createdRecords.map(r => r.CATEGORY))];
          setAmendCategories(categories);
          console.log('✅ Amendment API categories:', categories);
        })
        .catch(err => {
          console.error('❌ Failed to check amendment status:', err);
          setAmendmentRecords([]);
          setAmendCategories([]);
          setStatus('');
        });
    }
  }, [selectedPlant, key]);

  // Timeline: find last updated step
  const updatedStatusMap = storeData.reduce((acc, item) => {
    if (item.UPDATED === 'YES') {
      acc[item.PROCESS] = true;
    }
    return acc;
  }, {});

  let lastUpdatedIndex = -1;
  pcbProcesses.forEach((row, index) => {
    if (updatedStatusMap[row.PROCESS]) {
      lastUpdatedIndex = index;
    }
  });

  //amend ---------

  
  // amend ---------
let lastAmendedIndexMap = {};

amendCategories.forEach(category => {
  let lastIndex = -1;
  pcbProcesses.forEach((row, index) => {
    const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS);
    let amendStatus = '';

    if (category === 'EC') {
      amendStatus = storeInfo?.EC_AMEND_STATUS || '';
    } else if (category === 'CFE') {
      amendStatus = storeInfo?.CFE_AMEND_STATUS || '';
    }

    if (amendStatus === 'YES') {
      lastIndex = index;
    }
  });
  lastAmendedIndexMap[category] = lastIndex;
});

// 💥 Add here
const disableECColumn = amendCategories.includes('CFE');
// 🔥 Determine which mode timeline should use
let currentTimelineMode = 'action';
if (status === 'created') {
  if (amendCategories.includes('CFE')) {
    currentTimelineMode = 'CFE';
  } else if (amendCategories.includes('EC')) {
    currentTimelineMode = 'EC';
  }
}

// 🔥 Get last completed index for the timeline
let lastIndexForTimeline = -1;
if (currentTimelineMode === 'action') {
  lastIndexForTimeline = lastUpdatedIndex;
} else {
  lastIndexForTimeline = lastAmendedIndexMap[currentTimelineMode] ?? -1;
}



  // Handlers for Edit
  const handleEditClick = (row) => {
    const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS) || {};
    const existingDocs = storeInfo.DOC_PATH ? storeInfo.DOC_PATH.split(',') : [];
    const existingNames = storeInfo.DOC_NAME ? storeInfo.DOC_NAME.split(',') : [];

    setModalData({
      plant: selectedPlant,
      process: row.PROCESS,
      applyDate: storeInfo.APPLY_DT || '',
      selectedFiles: [],
      existingDocs,
      existingNames,
      comments: storeInfo.COMMENTS || '',
    });

    setShowModal(true);
  };

  // Handlers for Amend
  const handleAmendClick = async (row, category) => {
  try {
    const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS) || {};

    const endpoint = `${API_BASE_URL}/amendment-data/${selectedPlant}/${encodeURIComponent(row.PROCESS)}`;
    const res = await axios.get(endpoint);
    const data = res.data;

    const prefix = `${category}_AMEND`;

    const existingDocs = data[`${prefix}_DOC_PATH`] ? JSON.parse(data[`${prefix}_DOC_PATH`]) : [];
    const existingNames = data[`${prefix}_DOC_NAME`] ? JSON.parse(data[`${prefix}_DOC_NAME`]) : [];
    const amendDate = data[`${prefix}_DATE`] || '';
    const oldComments = data[`${prefix}_COMMENTS`] || '';

    setAmendData({
      plant: selectedPlant,
      process: row.PROCESS,
      applyDate: storeInfo.APPLY_DT || '',
      amendDate,
      category,
      selectedFiles: [],
      existingDocs,
      existingNames,
      comments: '',
      oldComments,
      amendDecision: 'Yes',
    });

    setShowAmendModal(true);
  } catch (error) {
    console.error('❌ handleAmendClick - Failed to fetch amendment data:', error);
    alert('Failed to load amendment data. Please try again.');
  }
};


  // Submit Edit Modal
  const handleModalSubmit = async () => {
    const formData = new FormData();
    formData.append('loc', modalData.plant);
    formData.append('process', modalData.process);
    formData.append('applyDate', modalData.applyDate);
    formData.append('comments', modalData.comments);
    modalData.selectedFiles.forEach(file => {
      formData.append('document[]', file);
      formData.append('doc_name[]', file.name);
    });

    const existingRecord = storeData.find(
      item => item.PROCESS?.trim().toLowerCase() === modalData.process.trim().toLowerCase()
    );

    const apiUrl = existingRecord
      ? `${API_BASE_URL}/pcb-store-update`
      : `${API_BASE_URL}/pollution-submit`;

    try {
      await axios.post(apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // alert(existingRecord ? 'Updated successfully' : 'Inserted successfully');
      setShowModal(false);
      const response = await axios.get(`${API_BASE_URL}/pcb-store/${selectedPlant}`);
      setStoreData(response.data);
       await Swal.fire({
      icon: 'success',
      title: existingRecord ? 'Updated Successfully' : 'Inserted Successfully',
      showConfirmButton: false,
      timer: 2000
    });
    } catch (error) {
      console.error('❌ Submission failed:', error);
       Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: 'Something went wrong. Please try again.',
    });
    }
  };

  const handleDeleteEditFile = async (docPath, idx) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this file?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post(`${API_BASE_URL}/delete-edit-file`, {
        docPath,
        plant: modalData.plant,
        process: modalData.process,
      });

      // Remove file from state
      setModalData(prev => {
        const updatedDocs = [...prev.existingDocs];
        const updatedNames = [...prev.existingNames];
        updatedDocs.splice(idx, 1);
        updatedNames.splice(idx, 1);
        return { ...prev, existingDocs: updatedDocs, existingNames: updatedNames };
      });

      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'File deleted successfully.',
      });
    } catch (err) {
      console.error('❌ Failed to delete file:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Failed to delete the file. Please try again later.',
      });
    }
  };

  // Submit Amend Modal
  const handleAmendSubmit = async () => {
    const { plant, process, applyDate, amendDate, selectedFiles, comments, category} = amendData;

    // ✅ Check if amendment already exists
 // ✅ Use locally available storeData to check existence
  const isExistingRecord = storeData.some(
  item => item.PROCESS?.toLowerCase().trim() === process?.toLowerCase().trim()
);

  console.log('📦 Record exists in storeData:', isExistingRecord);

  // ✅ Choose appropriate endpoint
  const endpoint = isExistingRecord
    ? `${API_BASE_URL}/${category.toLowerCase()}-amendment-updt`
    : `${API_BASE_URL}/${category.toLowerCase()}-amendment-submit`;

    console.log(`📡 Triggering API: ${endpoint}`);
    const formData = new FormData();
    formData.append('loc', plant);
    formData.append('process', process);
    formData.append('applyDate', applyDate);
    formData.append('amendDate', amendDate);
    formData.append('comments', comments);
    formData.append('category', category);

    selectedFiles.forEach(file => {
      formData.append('document[]', file);
      formData.append('doc_name[]', file.name);
    });
// 👇 Log FormData key-value pairs
for (let pair of formData.entries()) {
  console.log(`${pair[0]}:`, pair[1]);
}
    try {
      await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await Swal.fire({
      icon: 'success',
      title: 'Success',
      text: `Amendment (${category}) submitted successfully`,
    });
      setShowAmendModal(false);

      const response = await axios.get(`${API_BASE_URL}/pcb-store/${plant}`);
      setStoreData(response.data);
    } catch (error) {
        console.error('❌ Amendment submission failed:', error);
        await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Please try again later or contact support.',
      });
    }
  };

  const handleDeleteFile = async (docPath) => {
    await axios.post(`${API_BASE_URL}/delete-amendment-file`, {
      docPath,
      plant: amendData.plant,
      process: amendData.process,
      category: amendData.category
    });
  };


  // Custom button styles
  const buttonStyles = {
    updated: {
      backgroundColor: '#28a745',
      borderColor: '#28a745',
      color: 'white',
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'not-allowed'
    },
    edit: {
      backgroundColor: '#007bff',
      borderColor: '#007bff',
      color: 'white',
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    pending: {
      backgroundColor: '#6c757d',
      borderColor: '#6c757d',
      color: 'white',
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'not-allowed'
    },
    amended: {
      backgroundColor: '#17a2b8',
      borderColor: '#17a2b8',
      color: 'white',
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'not-allowed'
    },
    amend: {
      backgroundColor: '#ffc107',
      borderColor: '#ffc107',
      color: '#212529',
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  };
  return(
    <>
    
     <PlantSelector
          plants={plants}
          selectedPlant={selectedPlant}
          onChange={(e) => setSelectedPlant(e.target.value)}
          customMarginTop="-10px"
        />

        {selectedPlant ? (
          <div className='custom-tbl' style={{ 
                backgroundColor: '#fff',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginTop: '10px'
              }}>
                
          <table className="table table-hover table-sm compact-table" style={{ margin: 0 }}>
            <thead className="custom-thead" style={{ backgroundColor: '#a8c5d1' }}>
              <tr>
                 <th style={{ width: '30px', borderBottom: '2px solid #dee2e6', backgroundColor: '#a8c5d1' }}></th>
      <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>S.No</th>
      <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Process</th>
      <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Apply Date</th>
      <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Action</th>
                {amendCategories.map(cat => (
                  <th key={cat} style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600',
                   backgroundColor: '#a8c5d1',
                    whiteSpace: 'nowrap' }}>
                    {cat} Amend</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pcbProcesses.map((row, index) => {
                const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS);

                const isUpdated = !!storeInfo;
                const isNextStep = index === lastUpdatedIndex + 1;

                let buttonContent;
                if (status === 'created') {
                  buttonContent = storeInfo?.UPDATED === 'YES' ? (
                    <button className="btn btn-success btn-sm" disabled>Updated</button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" disabled>Pending</button>
                  );
                } else {
                  buttonContent = storeInfo?.UPDATED === 'YES' ? (
                    <button className="btn btn-success btn-sm" disabled>Updated</button>
                  ) : isNextStep ? (
                    <button className="btn btn-primary btn-sm" onClick={() => handleEditClick(row)}>Edit</button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" disabled>Pending</button>
                  );
                }

                //---------amend----------



                return (
                  <tr key={row.PROCESS} className={!isUpdated ? 'table-secondary' : ''}>
                    <td className="timeline-cell">
                      {(() => {
  // Determine timeline color for this row
  let timelineColor = 'grey';
  let isCompletedInMode = false;

  if (currentTimelineMode === 'action') {
    isCompletedInMode = storeInfo?.UPDATED === 'YES';
  } else if (currentTimelineMode === 'EC') {
    isCompletedInMode = storeInfo?.EC_AMEND_STATUS === 'YES';
  } else if (currentTimelineMode === 'CFE') {
    isCompletedInMode = storeInfo?.CFE_AMEND_STATUS === 'YES';
  }

  if (isCompletedInMode) {
    timelineColor = 'green';
  } else if (index === lastIndexForTimeline + 1) {
    timelineColor = 'red';
  }

  return (
    <>
      <span className={`dot ${timelineColor}`}></span>
      {index !== pcbProcesses.length - 1 && (
        <div className={`line ${timelineColor}`}></div>
      )}
    </>
  );
})()}

                    </td>
                    <td>{row.SNO}</td>
                    <td><em>{row.PROCESS}</em></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{storeInfo?.APPLY_DT || '-'}</td>
                    <td>{buttonContent}</td>
                   {amendCategories.map(category => {
  let amendStatus = '';
  if (category === 'EC') {
    amendStatus = storeInfo?.EC_AMEND_STATUS || '';
  } else if (category === 'CFE') {
    amendStatus = storeInfo?.CFE_AMEND_STATUS || '';
  }

  const lastIndex = lastAmendedIndexMap[category] ?? -1;

  let button;
  if (category === 'EC' && disableECColumn) {
    button = amendStatus === 'YES' ? (
      <button className="btn btn-success btn-sm" disabled>Amended</button>
    ) : (
      <button className="btn btn-secondary btn-sm" disabled>Pending</button>
    );
  } else {
    if (amendStatus === 'YES') {
      button = (
        <button className="btn btn-success btn-sm" disabled>Amended</button>
      );
    } else if (index === lastIndex + 1 ) {
      button = (
        <button className="btn btn-primary btn-sm" onClick={() => handleAmendClick(row, category)}>
          Amend
        </button>
      );
    } else {
      button = (
        <button className="btn btn-secondary btn-sm" disabled>Pending</button>
      );
    }
  }

  return <td key={category}>{button}</td>;
})}


                   
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="alert alert-info mt-4">Please select a plant to view data.</div>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Process Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Plant</Form.Label>
              <Form.Control type="text" value={modalData.plant} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Process</Form.Label>
              <Form.Control type="text" value={modalData.process} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apply Date</Form.Label>
              <Form.Control
                type="date"
                value={modalData.applyDate}
                onChange={(e) => setModalData(prev => ({ ...prev, applyDate: e.target.value }))}
              />
            </Form.Group>

            <div className="mb-3">
              <strong>Previously Uploaded Files:</strong>
              <ul className="mb-2 list-unstyled">
                {modalData.existingDocs.map((docPath, idx) => {
                  const cleanedPath = docPath.replace(/[[\]'"%]/g, '').trim();
                  const displayName = modalData.existingNames[idx]?.trim() || `Document ${idx + 1}`;

                  return (
                    <li
                      key={idx}
                      className="d-flex justify-content-between align-items-center mb-1 border p-2 rounded"
                    >
                      <a
                        href={`${API_DOC_URL}/storage/${cleanedPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {displayName}
                      </a>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteEditFile(docPath, idx)}
                      >
                        Delete
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>


            <Form.Group className="mb-3">
              <Form.Label>Upload Document</Form.Label>
              <Form.Control
                type="file"
                multiple
                ref={fileInputRef}
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files);
                  setModalData(prev => ({
                    ...prev,
                    selectedFiles: [...prev.selectedFiles, ...newFiles]
                  }));

                  // Clear the file input after selecting
                  if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                  }
                }}
              />

            </Form.Group>

            {modalData.selectedFiles.length > 0 && (
              <div className="mb-2">
                <strong>Files to Upload:</strong>
                <ul className="list-unstyled">
                  {modalData.selectedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="d-flex justify-content-between align-items-center mb-1 border p-2 rounded"
                    >
                      {file.name}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setModalData(prev => {
                            const updatedFiles = prev.selectedFiles.filter((_, i) => i !== index);

                            // Clear file input if all files are removed
                            if (updatedFiles.length === 0 && fileInputRef.current) {
                              fileInputRef.current.value = null;
                            }

                            return {
                              ...prev,
                              selectedFiles: updatedFiles
                            };
                          });
                        }}
                      >
                        Delete
                      </Button>

                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={modalData.comments}
                onChange={(e) => setModalData(prev => ({ ...prev, comments: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleModalSubmit}>Submit</Button>
        </Modal.Footer>
      </Modal>

      
      <AmendModal
        show={showAmendModal}
        onClose={() => setShowAmendModal(false)}
        amendData={amendData}
        setAmendData={setAmendData}
        onSubmit={handleAmendSubmit}
        onDeleteFile={handleDeleteFile}
      />

    </>
  )
 
};

export default PcbModifyTable;
