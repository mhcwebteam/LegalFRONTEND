
// import React, { useState, useEffect, useContext } from 'react';
// import { Container, Modal, Button, Form } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import PlantSelector from '../components/PlantSelector';
// import PcbTabs from '../components/PcbTabs';
// import { API_BASE_URL, API_BASE_URLS, API_DOC_URL } from '../config/Config';
// import '../pages/Update.css';
// import AmendModal from '../components/AmendModal';
// import CardWithHeader from '../components/CardWithHeader';
// import { useRef } from 'react';
// import Swal from 'sweetalert2';
// import ProjectInfoHeader from './ProjectInfoHeader';
// import { Context } from '../context/ContextData';
// import { getMasterByLoc } from '../api/Api';
// import ReraDocUploadModal from './ReraDocUploadModal';
// import ReraDocUploadModal1 from './ReraDocUploadModal1';
// import { FaUpload } from 'react-icons/fa';
// import { Delete, Trash, Trash2 } from 'lucide-react';

// const PcbModifyTable = () => {
//   const navigate = useNavigate();
//   const [key, setKey] = useState('Pollution Control Board');
//   const [plants, setPlants] = useState([]);
//   const [selectedPlant, setSelectedPlant] = useState('');
//   const [pcbProcesses, setPcbProcesses] = useState([]);
//   const [amendmentRecords, setAmendmentRecords] = useState([]);
//   const [amendCategories, setAmendCategories] = useState([]);
//   const [status, setStatus] = useState('');
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const {
//     totalMasterData = [],
//     setHeaderData,
//     headerData,
//     storeData, 
//     setStoreData
//   } = useContext(Context);

//   const [newDocs, setNewDocs] = useState([]);

//   const fileInputRef = useRef(null);

//   const [showModal, setShowModal] = useState(false);
//   const [modalData, setModalData] = useState({
//     plant: '',
//     process: '',
//     applyDate: '',
//     selectedFiles: [],
//     existingDocs: [],
//     existingNames: [],
//     comments: '',
//   });

//   const [showAmendModal, setShowAmendModal] = useState(false);
//   const [amendData, setAmendData] = useState({
//     plant: '',
//     process: '',
//     applyDate: '',
//     category: '',
//     selectedFiles: [],
//     existingDocs: [],
//     existingNames: [],
//     comments: '',
//     oldComments: '',
//   });

//   // Load initial data
//   useEffect(() => {
//     axios.get(`${API_BASE_URL}/pcb-processes`).then(res =>
//       setPcbProcesses(res.data)
//     );

//     axios.get(`${API_BASE_URL}/plants`).then(res => setPlants(res.data));
//   }, []);

//   // Fetch store data on plant change
//   useEffect(() => {
//     if (selectedPlant) {
//       axios.get(`${API_BASE_URL}/pcb-store/${selectedPlant}`)
//         .then(res => {
//           setStoreData(res.data);
//         })
//         .catch(err => console.error(err));
//     } else {
//       setStoreData([]);
//     }
//   }, [selectedPlant]);

//   // Fetch amendment categories/status for the selected plant and process
//   useEffect(() => {
//     if (selectedPlant && key) {
//       axios.get(`${API_BASE_URL}/amendments/${selectedPlant}/${key}`)
//         .then(res => {
//           const records = res.data.data || [];
//           setAmendmentRecords(records);

//           // Status for process column
//           const processRecord = records.find(r => r.PROCESS === key);
//           setStatus(processRecord?.STATUS || '');

//           // Only categories with STATUS = 'created'
//           const createdRecords = records.filter(r => r.STATUS === 'created');
//           const categories = [...new Set(createdRecords.map(r => r.CATEGORY))];
//           setAmendCategories(categories);
//         })
//         .catch(err => {
//           console.error('❌ Failed to check amendment status:', err);
//           setAmendmentRecords([]);
//           setAmendCategories([]);
//           setStatus('');
//         });
//     }
//   }, [selectedPlant, key]);

//   // Timeline: find last updated step
//   const updatedStatusMap = storeData?.reduce((acc, item) => {
//     if (item.UPDATED === 'YES') {
//       acc[item.PROCESS] = true;
//     }
//     return acc;
//   }, {});

//   let lastUpdatedIndex = -1;
//   pcbProcesses.forEach((row, index) => {
//     if (updatedStatusMap[row.PROCESS]) {
//       lastUpdatedIndex = index;
//     }
//   });

//   // Amend logic
//   let lastAmendedIndexMap = {};

//   amendCategories.forEach(category => {
//     let lastIndex = -1;
//     pcbProcesses.forEach((row, index) => {
//       const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS);
//       let amendStatus = '';

//       if (category === 'EC') {
//         amendStatus = storeInfo?.EC_AMEND_STATUS || '';
//       } else if (category === 'CFE') {
//         amendStatus = storeInfo?.CFE_AMEND_STATUS || '';
//       }

//       if (amendStatus === 'YES') {
//         lastIndex = index;
//       }
//     });
//     lastAmendedIndexMap[category] = lastIndex;
//   });

//   const disableECColumn = amendCategories.includes('CFE');
  
//   let currentTimelineMode = 'action';
//   if (status === 'created') {
//     if (amendCategories.includes('CFE')) {
//       currentTimelineMode = 'CFE';
//     } else if (amendCategories.includes('EC')) {
//       currentTimelineMode = 'EC';
//     }
//   }

//   let lastIndexForTimeline = -1;
//   if (currentTimelineMode === 'action') {
//     lastIndexForTimeline = lastUpdatedIndex;
//   } else {
//     lastIndexForTimeline = lastAmendedIndexMap[currentTimelineMode] ?? -1;
//   }

//   // Handlers for Edit
//   const handleEditClick = (row) => {

  
//     const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS) || {};
//       console.log(storeData,"storeing111111111111", row.PROCESS);
//     const existingDocs = storeInfo.DOC_PATH ? storeInfo.DOC_PATH.split(',') : [];
//     const existingNames = storeInfo.DOC_NAME ? storeInfo.DOC_NAME.split(',') : [];

//     setModalData({
//       plant: selectedPlant,
//       process: row.PROCESS,
//       applyDate: storeInfo.APPLY_DT || '',
//       selectedFiles: [],
//       existingDocs,
//       existingNames,
//       comments: storeInfo.COMMENTS || '',
//     });

//     setShowModal(true);
//   };

//   // Handlers for Amend
//   const handleAmendClick = async (row, category) => {
//     try {
//       const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS) || {};

//       const endpoint = `${API_BASE_URL}/amendment-data/${selectedPlant}/${encodeURIComponent(row.PROCESS)}`;
//       const res = await axios.get(endpoint);
//       const data = res.data;

//       const prefix = `${category}_AMEND`;

//       const existingDocs = data[`${prefix}_DOC_PATH`] ? JSON.parse(data[`${prefix}_DOC_PATH`]) : [];
//       const existingNames = data[`${prefix}_DOC_NAME`] ? JSON.parse(data[`${prefix}_DOC_NAME`]) : [];
//       const amendDate = data[`${prefix}_DATE`] || '';
//       const oldComments = data[`${prefix}_COMMENTS`] || '';

//       setAmendData({
//         plant: selectedPlant,
//         process: row.PROCESS,
//         applyDate: storeInfo.APPLY_DT || '',
//         amendDate,
//         category,
//         selectedFiles: [],
//         existingDocs,
//         existingNames,
//         comments: '',
//         oldComments,
//         amendDecision: 'Yes',
//       });

//       setShowAmendModal(true);
//     } catch (error) {
//       console.error('❌ handleAmendClick - Failed to fetch amendment data:', error);
//       alert('Failed to load amendment data. Please try again.');
//     }
//   };

  

//   // Submit Edit Modal
//   const handleModalSubmit = async () => {
//     const formData = new FormData();
//     formData.append('loc', modalData.plant);
//     formData.append('process', modalData.process);
//     formData.append('applyDate', modalData.applyDate);
//     formData.append('comments', modalData.comments);
    
//     newDocs.forEach((file, index) => {
//       formData.append(`document[${index}]`, file);
//       formData.append(`doc_name[${index}]`, file.name);
//     });

//     const existingRecord = storeData.find(
//       item => item.PROCESS?.trim().toLowerCase() === modalData.process.trim().toLowerCase()
//     );

//     const apiUrl = existingRecord
//       ? `${API_BASE_URL}/pcb-store-update`
//       : `${API_BASE_URL}/pollution-submit`;

//     try {
//       await axios.post(apiUrl, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       setShowModal(false);
//       const response = await axios.get(`${API_BASE_URL}/pcb-store/${selectedPlant}`);
//       setStoreData(response.data);

//       const master = await getMasterByLoc(modalData.plant);
//       if (master) {
//         setHeaderData(master);
//       }
//       await Swal.fire({
//         icon: 'success',
//         title: existingRecord ? 'Updated Successfully' : 'Inserted Successfully',
//         showConfirmButton: false,
//         timer: 2000
//       });
//     } catch (error) {
//       console.error('❌ Submission failed:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Submission Failed',
//         text: 'Something went wrong. Please try again.',
//       });
//     }
//   };

//   const handleDeleteEditFile = async (docPath, idx) => {
//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: 'Do you really want to delete this file?',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, delete it',
//       cancelButtonText: 'Cancel',
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await axios.post(`${API_BASE_URL}/delete-edit-file`, {
//         docPath,
//         plant: modalData.plant,
//         process: modalData.process,
//       });

//       setModalData(prev => {
//         const updatedDocs = [...prev.existingDocs];
//         const updatedNames = [...prev.existingNames];
//         updatedDocs.splice(idx, 1);
//         updatedNames.splice(idx, 1);
//         return { ...prev, existingDocs: updatedDocs, existingNames: updatedNames };
//       });

//       await Swal.fire({
//         icon: 'success',
//         title: 'Deleted!',
//         text: 'File deleted successfully.',
//       });
//     } catch (err) {
//       console.error('❌ Failed to delete file:', err);
//       await Swal.fire({
//         icon: 'error',
//         title: 'Failed',
//         text: 'Failed to delete the file. Please try again later.',
//       });
//     }
//   };

//   // Submit Amend Modal
//   const handleAmendSubmit = async () => {
//     const { plant, process, applyDate, amendDate, selectedFiles, comments, category } = amendData;

//     const isExistingRecord = storeData.some(
//       item => item.PROCESS?.toLowerCase().trim() === process?.toLowerCase().trim()
//     );

//     const endpoint = isExistingRecord
//       ? `${API_BASE_URL}/${category.toLowerCase()}-amendment-updt`
//       : `${API_BASE_URL}/${category.toLowerCase()}-amendment-submit`;

//     const formData = new FormData();
//     formData.append('loc', plant);
//     formData.append('process', process);
//     formData.append('applyDate', applyDate);
//     formData.append('amendDate', amendDate);
//     formData.append('comments', comments);
//     formData.append('category', category);

//     selectedFiles.forEach(file => {
//       formData.append('document[]', file);
//       formData.append('doc_name[]', file.name);
//     });

//     try {
//       await axios.post(endpoint, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       await Swal.fire({
//         icon: 'success',
//         title: 'Success',
//         text: `Amendment (${category}) submitted successfully`,
//       });
//       setShowAmendModal(false);

//       const response = await axios.get(`${API_BASE_URL}/pcb-store/${plant}`);
//       setStoreData(response.data);
//     } catch (error) {
//       console.error('❌ Amendment submission failed:', error);
//       await Swal.fire({
//         icon: 'error',
//         title: 'Submission Failed',
//         text: 'Please try again later or contact support.',
//       });
//     }
//   };

//   const handleDeleteFile = async (docPath) => {
//     await axios.post(`${API_BASE_URL}/delete-amendment-file`, {
//       docPath,
//       plant: amendData.plant,
//       process: amendData.process,
//       category: amendData.category
//     });
//   };

//   const handleChange = async (e) => {
//     const { name, value } = e.target;

//     if (!value || value.trim() === '') {
//       setSelectedPlant('');
//       setHeaderData(null);
//       setModalData((prev) => ({
//         ...prev,
//         applyDate: '',
//       }));
//       return;
//     }

//     try {
//       setSelectedPlant(value);

//       const res = await getMasterByLoc(value);

//       if (res && Object.keys(res).length > 0) {
//         setHeaderData(res);
//         setModalData((prev) => ({
//           ...prev,
//           applyDate: res.APPLICATION_DATE || '',
//         }));
//       } else {
//         console.warn('⚠️ No master data found for location:', value);
//         setHeaderData(null);
//         setModalData((prev) => ({
//           ...prev,
//           applyDate: '',
//         }));

//         await Swal.fire({
//           icon: 'warning',
//           title: 'No Data Found',
//           text: 'No master data available for the selected plant.',
//           timer: 2000,
//           showConfirmButton: false
//         });
//       }
//     } catch (error) {
//       console.error('❌ Error fetching master data:', error);

//       setHeaderData(null);
//       setModalData((prev) => ({
//         ...prev,
//         applyDate: '',
//       }));

//       await Swal.fire({
//         icon: 'error',
//         title: 'Error Loading Data',
//         text: error.response?.status === 404
//           ? 'Plant data not found. Please select a valid plant.'
//           : 'Failed to load plant data. Please try again.',
//         timer: 3000,
//         showConfirmButton: false
//       });
//     }
//   };

//   const buttonStyles = {
//     updated: {
//       backgroundColor: '#28a745',
//       borderColor: '#28a745',
//       color: 'white',
//       fontSize: '12px',
//       padding: '4px 8px',
//       borderRadius: '4px',
//       border: 'none',
//       cursor: 'not-allowed'
//     },
//     edit: {
//       backgroundColor: '#007bff',
//       borderColor: '#007bff',
//       color: 'white',
//       fontSize: '12px',
//       padding: '4px 8px',
//       borderRadius: '4px',
//       border: 'none',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease'
//     },
//     pending: {
//       backgroundColor: '#6c757d',
//       borderColor: '#6c757d',
//       color: 'white',
//       fontSize: '12px',
//       padding: '4px 8px',
//       borderRadius: '4px',
//       border: 'none',
//       cursor: 'not-allowed'
//     },
//     amended: {
//       backgroundColor: '#17a2b8',
//       borderColor: '#17a2b8',
//       color: 'white',
//       fontSize: '12px',
//       padding: '4px 8px',
//       borderRadius: '4px',
//       border: 'none',
//       cursor: 'not-allowed'
//     },
//     amend: {
//       backgroundColor: '#ffc107',
//       borderColor: '#ffc107',
//       color: '#212529',
//       fontSize: '12px',
//       padding: '4px 8px',
//       borderRadius: '4px',
//       border: 'none',
//       cursor: 'pointer',
//       transition: 'all 0.3s ease'
//     }
//   };

//   return (
//     <>
//       <PlantSelector
//         plants={plants}
//         modalData={modalData}
//         selectedPlant={selectedPlant}
//         onChange={handleChange}
//       />
//       <div className='mt-1'>
//         <ProjectInfoHeader data={headerData} />
//       </div>

//       {selectedPlant ? (
//         <div className='custom-tbl'
//           style={{
//             backgroundColor: '#fff',
//             borderRadius: '8px',
//             overflow: 'hidden',
//             boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
//             marginTop: '5px',
//             height: 'calc(100vh - 380px)',
//             display: 'flex',
//             flexDirection: 'column'
//           }}
//         >
//           <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
//             <table className="table table-hover table-sm compact-table" style={{ margin: 0 }}>
//               <thead className="custom-thead" style={{ backgroundColor: '#a8c5d1' }}>
//                 <tr>
//                   <th style={{ width: '30px', borderBottom: '2px solid #dee2e6', backgroundColor: '#a8c5d1' }}></th>
//                   <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>S.No</th>
//                   <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Process</th>
//                   <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Apply Date</th>
//                   <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Action</th>
//                   {amendCategories.map(cat => (
//                     <th key={cat} style={{
//                       borderBottom: '2px solid #dee2e6', fontWeight: '600',
//                       backgroundColor: '#a8c5d1',
//                       whiteSpace: 'nowrap'
//                     }}>
//                       {cat} Amend</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {pcbProcesses.map((row, index) => {
//                   const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS);

//                   const isUpdated = !!storeInfo;
//                   const isNextStep = index === lastUpdatedIndex + 1;

//                   let buttonContent;
//                   if (status === 'created') {
//                     buttonContent = storeInfo?.UPDATED === 'YES' ? (
//                       <button className="btn btn-success btn-sm" disabled>Updated</button>
//                     ) : (
//                       <button className="btn btn-secondary btn-sm" disabled>Pending</button>
//                     );
//                   } else {
//                     buttonContent = storeInfo?.UPDATED === 'YES' ? (
//                       <button className="btn btn-success btn-sm" disabled>Updated</button>
//                     ) : isNextStep ? (
//                       <button className="btn btn-primary btn-sm" onClick={() => handleEditClick(row)}>Edit</button>
//                     ) : (
//                       <button className="btn btn-secondary btn-sm" disabled>Pending</button>
//                     );
//                   }

//                   return (
//                     <tr key={row.PROCESS} className={!isUpdated ? 'table-secondary' : ''}>
//                       <td className="timeline-cell">
//                         {(() => {
//                           let timelineColor = 'grey';
//                           let isCompletedInMode = false;

//                           if (currentTimelineMode === 'action') {
//                             isCompletedInMode = storeInfo?.UPDATED === 'YES';
//                           } else if (currentTimelineMode === 'EC') {
//                             isCompletedInMode = storeInfo?.EC_AMEND_STATUS === 'YES';
//                           } else if (currentTimelineMode === 'CFE') {
//                             isCompletedInMode = storeInfo?.CFE_AMEND_STATUS === 'YES';
//                           }

//                           if (isCompletedInMode) {
//                             timelineColor = 'green';
//                           } else if (index === lastIndexForTimeline + 1) {
//                             timelineColor = 'red';
//                           }

//                           return (
//                             <>
//                               <span className={`dot ${timelineColor}`}></span>
//                               {index !== pcbProcesses.length - 1 && (
//                                 <div className={`line ${timelineColor}`}></div>
//                               )}
//                             </>
//                           );
//                         })()}
//                       </td>
//                       <td>{row.SNO}</td>
//                       <td><em>{row.PROCESS}</em></td>
//                       <td style={{ whiteSpace: 'nowrap' }}>{storeInfo?.APPLY_DT || '-'}</td>
//                       <td>{buttonContent}</td>
//                       {amendCategories.map(category => {
//                         let amendStatus = '';
//                         if (category === 'EC') {
//                           amendStatus = storeInfo?.EC_AMEND_STATUS || '';
//                         } else if (category === 'CFE') {
//                           amendStatus = storeInfo?.CFE_AMEND_STATUS || '';
//                         }

//                         const lastIndex = lastAmendedIndexMap[category] ?? -1;

//                         let button;
//                         if (category === 'EC' && disableECColumn) {
//                           button = amendStatus === 'YES' ? (
//                             <button className="btn btn-success btn-sm" disabled>Amended</button>
//                           ) : (
//                             <button className="btn btn-secondary btn-sm" disabled>Pending</button>
//                           );
//                         } else {
//                           if (amendStatus === 'YES') {
//                             button = (
//                               <button className="btn btn-success btn-sm" disabled>Amended</button>
//                             );
//                           } else if (index === lastIndex + 1) {
//                             button = (
//                               <button className="btn btn-primary btn-sm" onClick={() => handleAmendClick(row, category)}>
//                                 Amend
//                               </button>
//                             );
//                           } else {
//                             button = (
//                               <button className="btn btn-secondary btn-sm" disabled>Pending</button>
//                             );
//                           }
//                         }

//                         return <td key={category}>{button}</td>;
//                       })}
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         <div className="alert alert-info mt-4">Please select a plant to view data.</div>
//       )}

//       <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Process Data</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>Plant</Form.Label>
//               <Form.Control type="text" value={modalData.plant} readOnly />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Process</Form.Label>
//               <Form.Control type="text" value={modalData.process} readOnly />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Apply Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={modalData.applyDate}
//                 onChange={(e) => setModalData(prev => ({ ...prev, applyDate: e.target.value }))}
//               />
//             </Form.Group>

//             <div className="mb-3">
//               <strong>Previously Uploaded Files:</strong>
//               <ul className="mb-2 list-unstyled">
//                 {(() => {
//                   const docPaths = Array.isArray(modalData.existingDocs)
//                     ? modalData.existingDocs
//                     : JSON.parse(modalData.existingDocs || "[]");

//                   const docNames = Array.isArray(modalData.existingNames)
//                     ? modalData.existingNames
//                     : JSON.parse(modalData.existingNames || "[]");

//                   return docPaths.map((docPath, idx) => {
//                     const cleanedPath = docPath.replace(/[[\]"'%]/g, "").trim();
//                     const rawName = docNames[idx] || cleanedPath.split("/").pop();
//                     const displayName = rawName.replace(/[[\]"'%]/g, "").trim();

//                     return (
//                       <li
//                         key={idx}
//                         className="d-flex justify-content-between align-items-center mb-1 border p-2 rounded"
//                       >
//                         <a
//                           href={`${API_DOC_URL}/storage/${cleanedPath}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                         >
//                           {decodeURIComponent(displayName)}
//                         </a>
//                         <Button
//                           variant="outline-danger"
//                           size="sm"
//                           onClick={() => handleDeleteEditFile(docPath, idx)}
//                         >
//                           <Trash2 color="red" />
//                         </Button>
//                       </li>
//                     );
//                   });
//                 })()}
//               </ul>
//             </div>

//             <Form.Group>
//               <Form.Label>Upload Document</Form.Label>
//               <button
//                 type="button"
//                 className="upload-button"
//                 onClick={() => setShowUploadModal(true)}
//               >
//                 <FaUpload className="upload-icon" /> Upload Files
//                 {newDocs.length > 0 && (
//                   <span className="upload-count">
//                     ({newDocs.length} files)
//                   </span>
//                 )}
//               </button>
//             </Form.Group>

//             {modalData.selectedFiles.length > 0 && (
//               <div className="mb-2">
//                 <strong>Files to Upload:</strong>
//                 <ul className="list-unstyled">
//                   {modalData.selectedFiles.map((file, index) => (
//                     <li
//                       key={index}
//                       className="d-flex justify-content-between align-items-center mb-1 border p-2 rounded"
//                     >
//                       {file.name}
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         onClick={() => {
//                           setModalData(prev => {
//                             const updatedFiles = prev.selectedFiles.filter((_, i) => i !== index);

//                             if (updatedFiles.length === 0 && fileInputRef.current) {
//                               fileInputRef.current.value = null;
//                             }

//                             return {
//                               ...prev,
//                               selectedFiles: updatedFiles
//                             };
//                           });
//                         }}
//                       >
//                         Delete
//                       </Button>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <Form.Group className="mb-3">
//               <Form.Label>Comments</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={3}
//                 value={modalData.comments}
//                 onChange={(e) => setModalData(prev => ({ ...prev, comments: e.target.value }))}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>

//              <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
//           <Button  variant="primary" >Send Email</Button>
//         </Modal.Footer>
//         {/* <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
//           <Button variant="primary" onClick={handleModalSubmit}>Submit</Button>
//         </Modal.Footer> */}
//       </Modal>

//       <ReraDocUploadModal1
//         show={showUploadModal}
//         onClose={() => setShowUploadModal(false)}
//         files={newDocs}
//         setFiles={setNewDocs}
//       />
//       <AmendModal
//         show={showAmendModal}
//         onClose={() => setShowAmendModal(false)}
//         amendData={amendData}
//         setAmendData={setAmendData}
//         onSubmit={handleAmendSubmit}
//         onDeleteFile={handleDeleteFile}
//       />
//     </>
//   );
// };

// export default PcbModifyTable;


import React, { useState, useEffect, useContext } from 'react';
import { Container, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PlantSelector from '../components/PlantSelector';
import PcbTabs from '../components/PcbTabs';
import { API_BASE_URL, API_BASE_URLS, API_DOC_URL } from '../config/Config';
import '../pages/Update.css';
import AmendModal from '../components/AmendModal';
import CardWithHeader from '../components/CardWithHeader';
import { useRef } from 'react';
import Swal from 'sweetalert2';
import ProjectInfoHeader from './ProjectInfoHeader';
import { Context } from '../context/ContextData';
import { getMasterByLoc } from '../api/Api';
import ReraDocUploadModal from './ReraDocUploadModal';
import ReraDocUploadModal1 from './ReraDocUploadModal1';
import { FaUpload } from 'react-icons/fa';
import { Delete, Trash, Trash2, Mail, Send } from 'lucide-react';
import { 
  Checkbox, 
  FormControlLabel, 
  TextField, 
  Chip,
  Box,
  Typography
} from '@mui/material';

const PcbModifyTable = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState('Pollution Control Board');
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [pcbProcesses, setPcbProcesses] = useState([]);
  const [amendmentRecords, setAmendmentRecords] = useState([]);
  const [amendCategories, setAmendCategories] = useState([]);
  const [status, setStatus] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [customEmail, setCustomEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  console.log("emailRecipientsemailRecipientsemailRecipients",selectedEmails);

  const {
    totalMasterData = [],
    setHeaderData,
    headerData,
    storeData, 
    setStoreData
  } = useContext(Context);

  const [newDocs, setNewDocs] = useState([]);

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
    // returnSubmit: 'No',
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
    axios.get(`${API_BASE_URLS}/pcb-processes`).then(res =>
      setPcbProcesses(res.data)
    );

    axios.get(`${API_BASE_URLS}/plants`).then(res => setPlants(res.data));
  }, []);

  // Fetch store data on plant change
  useEffect(() => {
    if (selectedPlant) {
      axios.get(`${API_BASE_URLS}/pcb-store/${selectedPlant}`)
        .then(res => {
          setStoreData(res.data);


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
          setAmendmentRecords(records);

          const processRecord = records.find(r => r.PROCESS === key);
          setStatus(processRecord?.STATUS || '');

          const createdRecords = records.filter(r => r.STATUS === 'created');
          const categories = [...new Set(createdRecords.map(r => r.CATEGORY))];
          setAmendCategories(categories);
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
  const updatedStatusMap = storeData?.reduce((acc, item) => {
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

  // Amend logic
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

  const disableECColumn = amendCategories.includes('CFE');
  
  let currentTimelineMode = 'action';
  if (status === 'created') {
    if (amendCategories.includes('CFE')) {
      currentTimelineMode = 'CFE';
    } else if (amendCategories.includes('EC')) {
      currentTimelineMode = 'EC';
    }
  }

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
      // returnSubmit: storeInfo.RETURN_SUBMIT || 'No',
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

  // Handle Email Submit - Opens Email Modal
  const handleEmailSubmit = async () => {
    try {
     


      const response = await axios.get(`${API_BASE_URLS}/pcb-emails`);
      setEmailRecipients(response.data);
      
      // Pre-fill email subject and message
      setEmailSubject(`Process Update: ${modalData.process}`);
      setEmailMessage(`Dear Team,\n\nPlease find the update for the process: ${modalData.process}\n\nPlant: ${modalData.plant}\nApply Date: ${modalData.applyDate}\n\nComments: ${modalData.comments}\n\nBest Regards`);
      
      setShowEmailModal(true);
    } catch (error) {
      console.error('❌ Failed to fetch email recipients:', error);

      setShowEmailModal(true);
    }
  };

  // Handle Email Checkbox Toggle
  const handleEmailToggle = (email) => {
   
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  // Add Custom Email
  const handleAddCustomEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customEmail && emailRegex.test(customEmail)) {
      if (!selectedEmails.includes(customEmail)) {
        setSelectedEmails(prev => [...prev, customEmail]);
        setCustomEmail('');
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Duplicate Email',
          text: 'This email is already added.',
          timer: 2000
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
        timer: 2000
      });
    }
  };

  // Remove Selected Email
  const handleRemoveEmail = (email) => {
    setSelectedEmails(prev => prev.filter(e => e !== email));
  };

  // Send Email


  // Submit Edit Modal (Without Email)
  const handleSendEmail = async () => {

       if (selectedEmails.length === 0) {
      Swal.fire({
        icon: 'warning',
        text: 'Please select at least one email recipient.',
  
      });
      return;
    }
    const formData = new FormData();
    formData.append('loc', modalData.plant);
    formData.append('process', modalData.process);
    formData.append('applyDate', modalData.applyDate);
    formData.append('comments', modalData.comments);
    //  formData.append('emails', JSON.stringify(selectedEmails));
    // formData.append('returnSubmit', modalData.returnSubmit);

    selectedEmails.forEach((email, i) => {
  formData.append(`emails[${i}]`, email);
});
    
    newDocs.forEach((file, index) => {
      formData.append(`document[${index}]`, file);
      formData.append(`doc_name[${index}]`, file.name);
    });

    const existingRecord = storeData.find(
      item => item.PROCESS?.trim().toLowerCase() === modalData.process.trim().toLowerCase()
    );

    const apiUrl = existingRecord
      ? `${API_BASE_URLS}/pcb-store-update`
      : `${API_BASE_URLS}/pollution-submit`;

    try {
      await axios.post(apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
 
             await Swal.fire({
        icon: 'success',
        title: existingRecord ? 'Updated Successfully' : 'Inserted Successfully',
        showConfirmButton: false,
        timer: 2000
      });

     setSelectedEmails([]);
           setShowEmailModal(false);
      setShowModal(false);

      const response = await axios.get(`${API_BASE_URLS}/pcb-store/${selectedPlant}`);
      setStoreData(response.data);

 

      const master = await getMasterByLoc(modalData.plant);
      if (master) {
        setHeaderData(master);
      }

  
       
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
    const { plant, process, applyDate, amendDate, selectedFiles, comments, category } = amendData;

    const isExistingRecord = storeData.some(
      item => item.PROCESS?.toLowerCase().trim() === process?.toLowerCase().trim()
    );

    const endpoint = isExistingRecord
      ? `${API_BASE_URL}/${category.toLowerCase()}-amendment-updt`
      : `${API_BASE_URL}/${category.toLowerCase()}-amendment-submit`;

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

      const response = await axios.get(`${API_BASE_URLS}/pcb-store/${plant}`);
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

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (!value || value.trim() === '') {
      setSelectedPlant('');
      setHeaderData(null);
      setModalData((prev) => ({
        ...prev,
        applyDate: '',
      }));
      return;
    }

    try {
      setSelectedPlant(value);

      const res = await getMasterByLoc(value);

      if (res && Object.keys(res).length > 0) {
        setHeaderData(res);
        setModalData((prev) => ({
          ...prev,
          applyDate: res.APPLICATION_DATE || '',
        }));
      } else {
        console.warn('⚠️ No master data found for location:', value);
        setHeaderData(null);
        setModalData((prev) => ({
          ...prev,
          applyDate: '',
        }));

        await Swal.fire({
          icon: 'warning',
          title: 'No Data Found',
          text: 'No master data available for the selected plant.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('❌ Error fetching master data:', error);

      setHeaderData(null);
      setModalData((prev) => ({
        ...prev,
        applyDate: '',
      }));

      await Swal.fire({
        icon: 'error',
        title: 'Error Loading Data',
        text: error.response?.status === 404
          ? 'Plant data not found. Please select a valid plant.'
          : 'Failed to load plant data. Please try again.',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

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

  return (
    <>
      <PlantSelector
        plants={plants}
        modalData={modalData}
        selectedPlant={selectedPlant}
        onChange={handleChange}
      />
      <div className='mt-1'>
        <ProjectInfoHeader data={headerData} />
      </div>

      {selectedPlant ? (
        <div className='custom-tbl'
          style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginTop: '5px',
            height: 'calc(100vh - 380px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
            <table className="table table-hover table-sm compact-table" style={{ margin: 0 }}>
              <thead className="custom-thead" style={{ backgroundColor: '#a8c5d1' }}>
                <tr>
                  <th style={{ width: '30px', borderBottom: '2px solid #dee2e6', backgroundColor: '#a8c5d1' }}></th>
                  <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>S.No</th>
                  <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Process</th>
                  <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Apply Date</th>
                  <th style={{ borderBottom: '2px solid #dee2e6', fontWeight: '600', backgroundColor: '#a8c5d1' }}>Action</th>
                  {amendCategories.map(cat => (
                    <th key={cat} style={{
                      borderBottom: '2px solid #dee2e6', fontWeight: '600',
                      backgroundColor: '#a8c5d1',
                      whiteSpace: 'nowrap'
                    }}>
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

                  return (
                    <tr key={row.PROCESS} className={!isUpdated ? 'table-secondary' : ''}>
                      <td className="timeline-cell">
                        {(() => {
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
                          } else if (index === lastIndex + 1) {
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
        </div>
      ) : (
        <div className="alert alert-info mt-4">Please select a plant to view data.</div>
      )}

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
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
                {(() => {
                  const docPaths = Array.isArray(modalData.existingDocs)
                    ? modalData.existingDocs
                    : JSON.parse(modalData.existingDocs || "[]");

                  const docNames = Array.isArray(modalData.existingNames)
                    ? modalData.existingNames
                    : JSON.parse(modalData.existingNames || "[]");

                  return docPaths.map((docPath, idx) => {
                    const cleanedPath = docPath.replace(/[[\]"'%]/g, "").trim();
                    const rawName = docNames[idx] || cleanedPath.split("/").pop();
                    const displayName = rawName.replace(/[[\]"'%]/g, "").trim();

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
                          {decodeURIComponent(displayName)}
                        </a>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteEditFile(docPath, idx)}
                        >
                          <Trash2 color="red" />
                        </Button>
                      </li>
                    );
                  });
                })()}
              </ul>
            </div>

         

            <Form.Group>
              <Form.Label>Upload Document</Form.Label>
              <button
                type="button"
                className="upload-button"
                onClick={() => setShowUploadModal(true)}
              >
                <FaUpload className="upload-icon" /> Upload Files
                {newDocs.length > 0 && (
                  <span className="upload-count">
                    ({newDocs.length} files)
                  </span>
                )}
              </button>
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
          <Button variant="primary" onClick={handleEmailSubmit}>
            <Mail size={16} className="me-1" />
            Send Email
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Email Selection Modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Mail size={24} className="text-primary" />
            Select Email Recipients
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Box>
            {/* Static Email Recipients with Checkboxes */}
            <Typography variant="h6" className="fw-semibold">
              Available Recipients:
            </Typography>
            <Box className="mb-4 p-3 border rounded" style={{ maxHeight: '1000px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
              <div className="row">
                {emailRecipients.map((recipient) => (
                  <div key={recipient.id} className="row-md-6 mb-2">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedEmails.includes(recipient.EMAIL)}
                          onChange={() => handleEmailToggle(recipient.EMAIL)}
                          sx={{
                            color: '#007bff',
                            '&.Mui-checked': {
                              color: '#007bff',
                            },
                          }}
                        />
                      }
                      label={
                        <span className="d-flex flex-column">
                          <strong style={{ fontSize: '14px' }}>{recipient.EMAIL}</strong>
                    
                        </span>
                      }
                      sx={{
                        width: '100%',
                        margin: 0,
                
                 
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                          borderColor: '#007bff',
                        },
                      }}
                    />
                  </div>
                ))}
              </div>
            </Box>


            {/* Selected Emails Display */}
            {selectedEmails.length > 0 && (
              <Box className="mb-3 p-3 border rounded" style={{ backgroundColor: '#e7f3ff' }}>
                <Typography variant="subtitle2" className="mb-2 fw-semibold text-primary">
                  Selected Recipients ({selectedEmails.length}):
                </Typography>
                <Box className="d-flex flex-wrap gap-2">
                  {selectedEmails.map((email, index) => (
                    <Chip
                      key={index}
                      label={email}
                      onDelete={() => handleRemoveEmail(email)}
                      size="small"
                      sx={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                          color: 'white',
                          '&:hover': {
                            color: '#ff6b6b',
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

      
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendEmail}
            disabled={selectedEmails.length === 0}
          >
            <Send size={16} className="me-1" />
            Submit ({selectedEmails.length})
          </Button>
        </Modal.Footer>
      </Modal>

      <ReraDocUploadModal1
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        files={newDocs}
        setFiles={setNewDocs}
      />
      <AmendModal
        show={showAmendModal}
        onClose={() => setShowAmendModal(false)}
        amendData={amendData}
        setAmendData={setAmendData}
        onSubmit={handleAmendSubmit}
        onDeleteFile={handleDeleteFile}
      />
    </>
  );
};

export default PcbModifyTable;