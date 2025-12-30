// import React, { useState, useEffect, useContext } from 'react';
// import { Container } from 'react-bootstrap';
// import axios from 'axios';
// import { API_BASE_URL, API_DOC_URL } from '../config/Config';
// import { OverlayTrigger, Tooltip, Modal, Button, Form } from 'react-bootstrap';
// import PlantSelector from '../components/PlantSelector';
// import PcbTabs from '../components/PcbTabs';
// import '../pages/Update.css';
// import '../components/PcbTabs.css';
// import DocumentModal from '../components/DocumentModal';
// import CardWithHeader from '../components/CardWithHeader';
// import Swal from 'sweetalert2';
// import { getMasterByLoc } from "../api/Api";
// import ProjectInfoHeader from './ProjectInfoHeader';
// import { Context } from '../context/ContextData';
// import EmailSelectionModal from './EmailSelectionModal';
// import AmendUpdateModal from './AmendUpdateModal'; 

// // Helper function to format dates for backend (YYYY-MM-DD to DD-MM-YYYY)
// const formatDateForBackend = (dateString) => {
//   if (!dateString) return '';
  
//   // Check if already in DD-MM-YYYY format
//   if (dateString.includes('-') && dateString.split('-')[0].length <= 2) {
//     return dateString;
//   }
  
//   // If in YYYY-MM-DD format, convert to DD-MM-YYYY
//   if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
//     const [year, month, day] = dateString.split('-');
//     return `${day}-${month}-${year}`;
//   }
  
//   return dateString;
// };

// // Helper function to format dates for display
// const formatDate = (date) => {
//   if (!date) return "";
//   const [fullDate, time] = date.split(" ");
//   const [y, m, d] = fullDate.split("-");
//   return time ? `${d}-${m}-${y} ${time}` : `${d}-${m}-${y}`;
// };

// // Helper function to get latest comment
// const getLatestComment = (storeInfo) => {
//   // First check parsedLogs
//   if (storeInfo?.parsedLogs && Array.isArray(storeInfo.parsedLogs) && storeInfo.parsedLogs.length > 0) {
//     // Sort parsedLogs by date descending (newest first)
//     const sortedLogs = [...storeInfo.parsedLogs].sort((a, b) => {
//       const dateA = a.date ? new Date(a.date) : new Date(0);
//       const dateB = b.date ? new Date(b.date) : new Date(0);
//       return dateB - dateA;
//     });
    
//     const latestLog = sortedLogs[0];
//     return {
//       date: latestLog.date || '',
//       comment: latestLog.comment || 'No comment text'
//     };
//   }
  
//   // If no parsedLogs, check COMMENTS field
//   const commentsJson = storeInfo?.COMMENTS;
  
//   if (!commentsJson || commentsJson === 'null' || commentsJson === 'undefined' || commentsJson.trim() === '') {
//     return { date: '', comment: 'No comments available' };
//   }
  
//   try {
//     const parsed = JSON.parse(commentsJson);
    
//     if (Array.isArray(parsed) && parsed.length > 0) {
//       // Sort by date descending (newest first)
//       const sorted = [...parsed].sort((a, b) => {
//         const dateA = a.date ? new Date(a.date) : new Date(0);
//         const dateB = b.date ? new Date(b.date) : new Date(0);
//         return dateB - dateA;
//       });
      
//       const latest = sorted[0];
//       return {
//         date: latest.date || '',
//         comment: latest.comment || latest || 'No comment text'
//       };
//     } else if (typeof parsed === 'string' && parsed.trim() !== '') {
//       return {
//         date: '',
//         comment: parsed
//       };
//     }
//   } catch (e) {
//     // If parsing fails, check if it's a simple string
//     if (typeof commentsJson === 'string' && commentsJson.trim() !== '') {
//       return {
//         date: '',
//         comment: commentsJson
//       };
//     }
//   }
  
//   return { date: '', comment: 'No comments available' };
// };

// const PcbUpdateTable = () => {
//   const [key, setKey] = useState('Pollution Control Board');
//   const [plants, setPlants] = useState([]);
//   const [selectedPlant, setSelectedPlant] = useState('');
//   const [pcbProcesses, setPcbProcesses] = useState([]);
//   const [storeData, setStoreData] = useState([]);
//   const [showDocModal, setShowDocModal] = useState(false);
//   const [modalDocs, setModalDocs] = useState([]);
//   const [modalTitle, setModalTitle] = useState('');
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [amendModalDocs, setAmendModalDocs] = useState([]);
//   const [showAmendDocModal, setShowAmendDocModal] = useState(false);
//   const [amendDocTitle, setAmendDocTitle] = useState('');
//   const [selectedProcess, setSelectedProcess] = useState(null);
//   const [selectedEmails, setSelectedEmails] = useState([]);
//   const [amendmentRecords, setAmendmentRecords] = useState([]);
//   const [amendCategories, setAmendCategories] = useState([]);
//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [emailRecipients, setEmailRecipients] = useState([]);
//   const [inputData, setInputData] = useState({});
//   const [status, setStatus] = useState('');
//   const [showLogModal, setShowLogModal] = useState(false);
//   const [currentLogs, setCurrentLogs] = useState([]); 
//   const [amendLogs, setAmendLogs] = useState([]);
//   const [logModalTitle, setLogModalTitle] = useState('');
//   const [selectedAmendProcess, setSelectedAmendProcess] = useState("");
//   const [selectedAmendCategory, setSelectedAmendCategory] = useState("");
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [confirmModalData, setConfirmModalData] = useState(null);
//   const [editableApplyDate, setEditableApplyDate] = useState('');
//   const [showAmendUpdateModal, setShowAmendUpdateModal] = useState(false);
//   const [selectedAmendUpdateData, setSelectedAmendUpdateData] = useState(null);
//   const [editableReceivedDate, setEditableReceivedDate] = useState('');
//   const [newComment, setNewComment] = useState('');
//   const [loading, setLoading] = useState(false);

//   const [errors, setErrors] = useState({
//     receivedDate: ""
//   });

//   const { 
//     totalMasterData = [],
//     setHeaderData, 
//     headerData 
//   } = useContext(Context);

// const receivedDateProcesses = [
//   "Received TOR",
//   "EC (Environmetal Clearance)",
//   "Application for CFE",
//   "Received CFE",
// ]
//   // Format date for input field (YYYY-MM-DD)
//   const formatDateForInput = (dateStr) => {
//     if (!dateStr) return '';
    
//     // If already in YYYY-MM-DD format
//     if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
//       const parts = dateStr.split(' ');
//       return parts[0]; // Return just the date part
//     }
    
//     // If in DD-MM-YYYY format, convert to YYYY-MM-DD
//     if (dateStr.includes('-')) {
//       const parts = dateStr.split(' ');
//       const datePart = parts[0];
//       const [day, month, year] = datePart.split('-');
      
//       if (day && month && year && year.length === 4) {
//         return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
//       }
//     }
    
//     return '';
//   };

//   useEffect(() => {
//     axios.get(`${API_BASE_URL}/pcb-processes`).then(res => setPcbProcesses(res.data));
//     axios.get(`${API_BASE_URL}/plants`).then(res => setPlants(res.data));
//   }, []);

//   const handlePlantChange = async (e) => {
//     const plant = e.target.value;
//     setSelectedPlant(plant);
//     const res = await getMasterByLoc(plant);
//     setHeaderData(res);

//     if (plant) {
//       axios.get(`${API_BASE_URL}/pcb-store/${plant}`)
//         .then((res) => {
//           const processedData = res.data.map(item => {
//             if (item.LOG && typeof item.LOG === 'string') {
//               try {
//                 item.parsedLogs = JSON.parse(item.LOG);
//               } catch (e) {
//                 console.error('Error parsing LOG JSON for process:', item.PROCESS, e);
//                 item.parsedLogs = [{ date: new Date().toLocaleString(), comment: 'Error parsing logs.' }];
//               }
//             } else {
//               item.parsedLogs = [];
//             }
//             return item;
//           });
          
//           setStoreData(processedData);
//         })
//         .catch((err) => console.error(err));
//     } else {
//       setStoreData([]);
//     }
//     setInputData({});
//   };

//   useEffect(() => {
//     setHeaderData(null);
//   }, []);

//   useEffect(() => {
//     if (selectedPlant && key) {
//       axios.get(`${API_BASE_URL}/amendments/${selectedPlant}/${key}`)
//         .then(res => {
//           const records = res.data.data || [];
//           setAmendmentRecords(records);

//           const processRecord = records.find(r => r.PROCESS === key);
//           setStatus(processRecord?.STATUS || '');

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

//   const latestCreatedAmendment = amendmentRecords
//     .filter(a => a.STATUS === 'created')
//     .sort((a, b) => b.SNO - a.SNO)[0];

//   const showConfirmationModal = (storeInfo) => {
//     setConfirmModalData({
//       storeInfo: storeInfo
//     });
    
//     // Set initial editable dates from store info
//     setEditableApplyDate(formatDateForInput(storeInfo?.APPLY_DT || ''));
//     setEditableReceivedDate(formatDateForInput(storeInfo?.RECEIVED_DT || ''));
    
//     // Get latest comment
//     const latestComment = getLatestComment(storeInfo);
//     setNewComment(latestComment.comment);
    
//     setShowConfirmModal(true);
//   };

//   const validateForm = () => {
//     const processName = confirmModalData.storeInfo?.PROCESS;
//     let newErrors = {};
    
//     // Check if this process requires received date
//     if (receivedDateProcesses.includes(processName)) {
//       if (!editableReceivedDate) {
//         newErrors.receivedDate = "Received Date is required";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
  
//   const proceedToEmailSelection = async () => {
//     if (!validateForm()) {
//       const processName = confirmModalData.storeInfo?.PROCESS;
//       if (receivedDateProcesses.includes(processName) && !editableReceivedDate) {
//         await Swal.fire({
//           icon: 'warning',
//           title: 'Missing Required Field',
//           text: 'Received Date is required for this process.',
//         });
//       }
//       return;
//     }
    
//     setShowConfirmModal(false);
//     setLoading(true);
    
//     try {
//       // Fetch email recipients
//       const response = await axios.get(`${API_BASE_URL}/pcb-emails`);
//       setEmailRecipients(response.data);
      
//       // Convert dates to DD-MM-YYYY format for backend
//       let formattedApplyDate = '';
//       if (editableApplyDate) {
//         formattedApplyDate = formatDateForBackend(editableApplyDate);
//       } else if (confirmModalData.storeInfo?.APPLY_DT) {
//         formattedApplyDate = confirmModalData.storeInfo.APPLY_DT;
//       }
      
//       let formattedReceivedDate = '';
//       if (editableReceivedDate) {
//         formattedReceivedDate = formatDateForBackend(editableReceivedDate);
//       } else if (confirmModalData.storeInfo?.RECEIVED_DT) {
//         formattedReceivedDate = confirmModalData.storeInfo.RECEIVED_DT;
//       }
      
//       // Create updated process info with formatted dates
//       const updatedStoreInfo = {
//         ...confirmModalData.storeInfo,
//         APPLY_DT: formattedApplyDate,
//         RECEIVED_DT: formattedReceivedDate || ""
//       };
      
//       console.log('Updated store info for submission:', updatedStoreInfo);
      
//       setSelectedProcess(updatedStoreInfo);
//       setShowEmailModal(true);
//       setLoading(false);
      
//     } catch (error) {
//       console.error("❌ Failed to fetch email recipients:", error);
//       setLoading(false);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Failed to load email recipients. Please try again.'
//       });
//     }
//   };



//   const showEmailModalForUpdate = async (type, processInfo, amendCategory = '') => {
//     try {
//       if (type === 'regular') {
//         // For regular updates - show email modal
//         const response = await axios.get(`${API_BASE_URL}/pcb-emails`);
//         setEmailRecipients(response.data);
//         setSelectedProcess(processInfo);
        
//         setEmailSubject(`Process Update: ${processInfo.PROCESS}`);
//         setEmailMessage(
//           `Dear Team,\n\nPlease find the update for the process: ${processInfo.PROCESS}\n\nPlant: ${selectedPlant}\nApply Date: ${processInfo.APPLY_DT}\n\nComments: ${processInfo.COMMENTS}\n\nBest Regards`
//         );
        
//         setSelectedEmails([]);
//         setShowEmailModal(true);
//       } else if (type === 'amendment') {
//         // For amendment updates - show amendment modal directly
//         setSelectedAmendUpdateData({
//           plant: selectedPlant,
//           process: processInfo.PROCESS,
//           category: amendCategory,
//           storeInfo: processInfo
//         });
//         setShowAmendUpdateModal(true);
//       }
//     } catch (error) {
//       console.error("❌ Failed to fetch email recipients:", error);
//       if (type === 'regular') {
//         setShowEmailModal(true);
//       }
//     }
//   };

// const handleSendEmail = async (selectedEmails) => {

//   if (!selectedProcess) {
//     await Swal.fire({
//       icon: 'warning',
//       title: 'No Process Selected',
//       text: 'Please select a process to update.'
//     });
//     return;
//   }

//   setLoading(true);
  
//   const storeInfo = storeData.find(item => item.PROCESS === selectedProcess?.PROCESS);
  
//   // ✅ Get dates in consistent format
//   const updatedApplyDate = formatDate(selectedProcess.APPLY_DT); // Should be DD-MM-YYYY
//   const updatedReceivedDate = selectedProcess.RECEIVED_DT || "";
  
//   // Convert existing date to YYYY-MM-DD for comparison
//   const existingDateFormatted = formatDateForInput(storeInfo?.APPLY_DT || '');
  
  
//   console.log("New date from input:", formatDate(editableApplyDate)); // YYYY-MM-DD
//   console.log("Existing date from DB:", storeInfo?.APPLY_DT); // DD-MM-YYYY
//   console.log("Existing date formatted:", existingDateFormatted); // YYYY-MM-DD
//   console.log("Updated date to send:", updatedApplyDate); // DD-MM-YYYY
  
//   if (!updatedApplyDate || !storeInfo?.DOC_PATH || !storeInfo?.COMMENTS) {
//     await Swal.fire({
//       icon: 'warning',
//       title: 'Missing Fields',
//       text: 'Please ensure Apply Date, Document, and Comments are all available before updating.'
//     });
//     setLoading(false);
//     return;
//   }

//   try {
//     Swal.fire({
//       title: 'Updating...',
//       allowOutsideClick: false,
//       didOpen: () => Swal.showLoading()
//     });

//     // Send update to backend
//     await axios.post(`${API_BASE_URL}/pollution-update`, {
//       loc: selectedPlant,
//       process: selectedProcess.PROCESS,
//       applyDate: updatedApplyDate, // Send as DD-MM-YYYY
//       documentPath: storeInfo.DOC_PATH,
//       comments: storeInfo.COMMENTS,
//       receivedDate: updatedReceivedDate,
//       emails: selectedEmails
//     });

//     Swal.close();

//     // ✅ Update storeData - make sure date format matches what will be displayed
//     setStoreData(prevStoreData => {
//       return prevStoreData.map(item => {
//         if (item.PROCESS === selectedProcess.PROCESS) {
//           return {
//             ...item,
//             APPLY_DT: updatedApplyDate, // Store as DD-MM-YYYY
//             RECEIVED_DT: updatedReceivedDate || item.RECEIVED_DT,
//             UPDATED: 'YES'
//           };
//         }
//         return item;
//       });
//     });

//     await Swal.fire({
//       icon: 'success',
//       title: 'Update Successful',
//       text: `${selectedProcess.PROCESS} has been updated successfully.`,
//       timer: 2000,
//       showConfirmButton: false
//     });

//     // Close modals and reset states
//     setShowEmailModal(false);
//     setShowConfirmModal(false);
//     setSelectedProcess(null);
//     setConfirmModalData(null);
//     setEditableApplyDate('');
//     setEditableReceivedDate('');
//     setSelectedEmails([]);
//     setLoading(false);

//   } catch (error) {
//     console.error('Update failed:', error);
//     Swal.close();
//     setLoading(false);
//     Swal.fire({
//       icon: 'error',
//       title: 'Update Failed',
//       text: error.response?.data?.message || 'Something went wrong while updating. Please try again.'
//     });
//   }
// };

//   // Refresh data after amendment update
//   const refreshStoreData = async () => {
//     if (selectedPlant) {
//       try {
//         const response = await axios.get(`${API_BASE_URL}/pcb-store/${selectedPlant}`);
//         const processedData = response.data.map(item => {
//           if (item.LOG && typeof item.LOG === 'string') {
//             try {
//               item.parsedLogs = JSON.parse(item.LOG);
//             } catch (e) {
//               console.error('Error parsing LOG JSON for process:', item.PROCESS, e);
//               item.parsedLogs = [{ date: new Date().toLocaleString(), comment: 'Error parsing logs.' }];
//             }
//           } else {
//             item.parsedLogs = [];
//           }
//           return item;
//         });
//         setStoreData(processedData);
//       } catch (error) {
//         console.error('Error refreshing data:', error);
//       }
//     }
//   };

//   let lastAmendedIndexMap = {};

//   amendCategories.forEach(category => {
//     let lastIndex = -1;
//     pcbProcesses.forEach((row, index) => {
//       const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS);
//       let amendStatus = '';

//       if (category === 'AMEND1') {
//         amendStatus = storeInfo?.AMEND1_STATUS || '';
//       } else if (category === 'AMEND2') {
//         amendStatus = storeInfo?.AMEND2_STATUS || '';
//       } else if (category === 'AMEND3') {
//         amendStatus = storeInfo?.AMEND3_STATUS || '';
//       } else if (category === 'AMEND4') {
//         amendStatus = storeInfo?.AMEND4_STATUS || '';
//       } else if (category === 'AMEND5') {
//         amendStatus = storeInfo?.AMEND5_STATUS || '';
//       }

//       if (amendStatus === 'YES') {
//         lastIndex = index;
//       }
//     });
//     lastAmendedIndexMap[category] = lastIndex;
//   });

//   let currentTimelineMode = 'action';
//   if (status === 'created') {
//     if (amendCategories.includes('AMEND2')) {
//       currentTimelineMode = 'AMEND2';
//     } else if (amendCategories.includes('AMEND1')) {
//       currentTimelineMode = 'AMEND1';
//     } else if (amendCategories.includes('AMEND3')) {
//       currentTimelineMode = 'AMEND3';
//     } else if (amendCategories.includes('AMEND4')) {
//       currentTimelineMode = 'AMEND4';
//     } else if (amendCategories.includes('AMEND5')) {
//       currentTimelineMode = 'AMEND5';
//     }
//   }

//   const updatedIndexes = pcbProcesses
//     .map((row, idx) => {
//       const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS);
//       return storeInfo?.UPDATED === 'YES' ? idx : null;
//     })
//     .filter(idx => idx !== null);

//   const lastUpdatedIndex = updatedIndexes.length > 0 ? Math.max(...updatedIndexes) : -1;

//   let lastIndexForTimeline = -1;
//   if (currentTimelineMode === 'action') {
//     lastIndexForTimeline = lastUpdatedIndex;
//   } else {
//     lastIndexForTimeline = lastAmendedIndexMap[currentTimelineMode] ?? -1;
//   }

//   const isAmendExists = amendmentRecords.length > 0;

//   return (
//     <>
//       <PlantSelector
//         plants={plants}
//         selectedPlant={selectedPlant}
//         onChange={handlePlantChange}
//         customMarginTop="-10px"
//       />
//       <div className='mt-1'>
//         <ProjectInfoHeader data={headerData}/>
//       </div>

//       {!selectedPlant ? (
//         <div className="alert alert-info mt-4" style={{
//           backgroundColor: '#d1ecf1',
//           borderColor: '#bee5eb',
//           color: '#0c5460',
//           borderRadius: '8px'
//         }}>
//           Please select a plant to view data.
//         </div>
//       ) : (
//         <div 
//           className="custom-tbl" 
//           style={{ 
//             backgroundColor: '#fff',
//             borderRadius: '8px',
//             overflow: 'hidden',
//             boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
//             marginTop: '5px',
//             height: 'calc(100vh - 350px)',
//             display: 'flex',
//             flexDirection: 'column'
//           }}
//         >
//           <div className="table-scroll-wrapper custom-tbl" style={{ width: '100%', overflowX: 'auto' }} >
//             <table className="table table-hover table-sm" style={{ marginBottom: '0px' }}>
//               <thead className="custom-thead">
//                 <tr>
//                   <th style={{ width: '30px' }}></th>
//                   <th>S.NO</th>
//                   <th>PROCESS</th>
//                   <th style={{ whiteSpace: 'nowrap' }}>APPLY DATE</th>
//                   <th>DOCUMENT</th>
//                   <th>LOGS</th>
//                   <th>ACTION</th>
                  
//                   {/* Amendment columns */}
//                   {amendCategories?.map(cat => (
//                     <React.Fragment key={cat}>
//                       <th style={{ whiteSpace: 'nowrap' }}>{cat} DATE</th>
//                       <th style={{ whiteSpace: 'nowrap' }}>{cat} DOC</th>
//                       <th style={{ whiteSpace: 'nowrap' }}>{cat} LOGS</th>
//                       <th style={{ whiteSpace: 'nowrap' }}>{cat} ACTION</th>
//                     </React.Fragment>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {pcbProcesses?.map((row, index) => {
//                   const storeInfo = storeData?.find(item => item.PROCESS === row.PROCESS);

//                   console.log(storeInfo,"infrrrrraaaaaaaaaaaaaa");
//                   const isOriginalUpdated = storeInfo?.UPDATED === 'YES';

//                   let isUpdated = false;
//                   let isNextStep = false;

//                   if (currentTimelineMode === 'action') {
//                     isUpdated = storeInfo?.UPDATED === 'YES';
//                     isNextStep = index === lastUpdatedIndex + 1;
//                   } else if (currentTimelineMode === 'AMEND1') {
//                     isUpdated = storeInfo?.AMEND1_STATUS === 'YES';
//                     isNextStep = index === lastAmendedIndexMap['AMEND1'] + 1;
//                   } else if (currentTimelineMode === 'AMEND2') {
//                     isUpdated = storeInfo?.AMEND2_STATUS === 'YES';
//                     isNextStep = index === lastAmendedIndexMap['AMEND2'] + 1;
//                   } else if (currentTimelineMode === 'AMEND3') {
//                     isUpdated = storeInfo?.AMEND3_STATUS === 'YES';
//                     isNextStep = index === lastAmendedIndexMap['AMEND3'] + 1;
//                   } else if (currentTimelineMode === 'AMEND4') {
//                     isUpdated = storeInfo?.AMEND4_STATUS === 'YES';
//                     isNextStep = index === lastAmendedIndexMap['AMEND4'] + 1;
//                   } else if (currentTimelineMode === 'AMEND5') {
//                     isUpdated = storeInfo?.AMEND5_STATUS === 'YES';
//                     isNextStep = index === lastAmendedIndexMap['AMEND5'] + 1;
//                   }

//                   let dotColor = 'grey';
//                   let lineColor = 'grey';
//                   if (isUpdated) {
//                     dotColor = 'green';
//                     lineColor = 'green';
//                   } else if (isNextStep) {
//                     dotColor = 'red';
//                     lineColor = 'red';
//                   }

//                   return (
//                     <tr key={row.PROCESS}>
//                       <td className="timeline-cell">
//                         <span className={`dot ${dotColor}`}></span>
//                         {index !== pcbProcesses.length - 1 && (
//                           <div className={`line ${lineColor}`}></div>
//                         )}
//                       </td>

//                       <td>{row.SNO}</td>
//                       <td style={{ whiteSpace: 'nowrap' }}><em>{row.PROCESS}</em></td>

//                       <td style={{ whiteSpace: 'nowrap' }}>
//                         {/* Show the latest apply date from store data */}
//                         {formatDate(storeInfo?.APPLY_DT) || '-'}
//                       </td>

//                       <td style={{ whiteSpace: 'nowrap' }}>
//                         {storeInfo?.DOC_PATH ? (
//                           <button
//                             className="btn btn-outline-primary btn-sm"
//                             title="View Document"
//                             onClick={() => {
//                               if (!storeInfo?.DOC_PATH) {
//                                 alert('No documents available for this process');
//                                 return;
//                               }

//                               let docs = [];
//                               let names = [];

//                               try {
//                                 docs = JSON.parse(storeInfo.DOC_PATH || '[]');
//                                 names = JSON.parse(storeInfo.DOC_NAME || '[]');
//                               } catch (e) {
//                                 console.error('Error parsing DOC_PATH/DOC_NAME:', e);
//                               }

//                               const files = docs?.map((docPath, idx) => ({
//                                 DOC_PATH: docPath,
//                                 DOC_NAME: names[idx] || `Document ${idx + 1}`,
//                               }));

//                               setModalDocs(files);
//                               setModalTitle(row.PROCESS);
//                               setShowDocModal(true);
//                             }}
//                           >
//                             <i className="fas fa-file-alt"></i>
//                           </button>
//                         ) : (
//                           '-'
//                         )}
//                       </td>

//                       <td style={{ whiteSpace: 'nowrap' }}>
//                         {storeInfo?.LOG ? (
//                           <OverlayTrigger
//                             placement="top"
//                             overlay={
//                               <Tooltip id={`tooltip-logs-${row.PROCESS}`} className="custom-tooltip">
//                                 View Logs
//                               </Tooltip>
//                             }
//                           >
//                             <button
//                               className="btn btn-outline-info btn-sm"
//                               onClick={() => {
//                                 setLogModalTitle(`${row.PROCESS} Logs`);
//                                 setCurrentLogs(storeInfo.parsedLogs || []);
//                                 setShowLogModal(true);
//                               }}
//                             >
//                               <i className="fas fa-history"></i>
//                             </button>
//                           </OverlayTrigger>
//                         ) : (
//                           '-'
//                         )}
//                       </td>

//                       <td>
//                         {isAmendExists ? (
//                           <button
//                             className={`btn btn-sm ${
//                               isOriginalUpdated ? "btn-success" : "btn-secondary"
//                             }`}
//                             disabled
//                           >
//                             {isOriginalUpdated ? "Updated" : "Pending"}
//                           </button>
//                         ) : isNextStep ? (
//                           <button
//                             className="btn btn-primary btn-sm"
//                             onClick={async () => {
//                               if (
//                                 !storeInfo?.APPLY_DT ||
//                                 !storeInfo?.DOC_PATH ||
//                                 !storeInfo?.COMMENTS
//                               ) {
//                                 await Swal.fire({
//                                   icon: "warning",
//                                   title: "Missing Fields",
//                                   text: "Please ensure Apply Date, Document, and Comments are all available.",
//                                 });
//                                 return;
//                               }
//                               showConfirmationModal(storeInfo);
//                             }}
//                           >
//                             Update
//                           </button>
//                         ) : (
//                           <button className="btn btn-success btn-sm" disabled>
//                             {isOriginalUpdated ? "Updated" : "Pending"}
//                           </button>
//                         )}
//                       </td>

//                       {/* Amendment columns */}
//                       {amendCategories?.map(cat => {
//                         const docPathKey = `${cat}_DOC_PATH`;
//                         const docNameKey = `${cat}_DOC_NAME`;
//                         const statusKey = `${cat}_STATUS`;
//                         const commentsKey = `${cat}_COMMENTS`;
//                         const dateKey = `${cat}_DATE`;

//                         const hasDocs = storeInfo?.[docPathKey];
//                         const isAmendUpdated = storeInfo?.[statusKey] === 'YES';
//                         const hasComments = storeInfo?.[commentsKey];
//                         const amendDate = storeInfo?.[dateKey];

//                         console.log(storeInfo,":dddddddddddddd");

//                         const isLatestAmendmentForCat =
//                           latestCreatedAmendment &&
//                           latestCreatedAmendment.CATEGORY === cat;

//                         const canUpdateAmendment = !isAmendUpdated && isLatestAmendmentForCat && hasDocs;

//                         return (
//                           <React.Fragment key={cat}>
//                             {/* DATE Column */}
//                             <td style={{ whiteSpace: 'nowrap' }}>
//                               {formatDate(amendDate)}
//                             </td>

//                             {/* DOC Column */}
//                             <td>
//                               {hasDocs ? (
//                                 <OverlayTrigger
//                                   placement="top"
//                                   overlay={
//                                     <Tooltip id="custom-tooltip" className="custom-tooltip">
//                                       View Amendment Documents
//                                     </Tooltip>
//                                   }
//                                 >
//                                   <button
//                                     className="btn btn-outline-primary btn-sm"
//                                     onClick={() => {
//                                       let docs = [];
//                                       let names = [];

//                                       try {
//                                         docs = JSON.parse(storeInfo[docPathKey] || '[]');
//                                         names = JSON.parse(storeInfo[docNameKey] || '[]');
//                                       } catch (e) {
//                                         console.error('Error parsing amendment docs:', e);
//                                       }

//                                       const files = docs.map((docPath, idx) => ({
//                                         DOC_PATH: docPath,
//                                         DOC_NAME: names[idx] || `Amend Document ${idx + 1}`,
//                                       }));

//                                       setAmendModalDocs(files);
//                                       setAmendDocTitle(`${row.PROCESS} - ${cat} Amendment`);
//                                       setShowAmendDocModal(true);
//                                     }}
//                                   >
//                                     <i className="fas fa-file-alt wiggle-icon"></i>
//                                   </button>
//                                 </OverlayTrigger>
//                               ) : '-'}
//                             </td>

//                             {/* LOGS Column */}
//                             <td style={{ whiteSpace: 'nowrap' }}>
//                               {hasComments ? (
//                                 <OverlayTrigger
//                                   placement="top"
//                                   overlay={
//                                     <Tooltip id={`tooltip-${cat}-logs-${row.PROCESS}`} className="custom-tooltip">
//                                       View {cat} Comments
//                                     </Tooltip>
//                                   }
//                                 >
//                                   <button
//                                     className="btn btn-outline-info btn-sm"
//                                     onClick={() => {
//                                       const amendLogs = [];
//                                       const comments = storeInfo?.[commentsKey];
                                      
//                                       if (comments) {
//                                         try {
//                                           const parsedComments = JSON.parse(comments);
//                                           if (Array.isArray(parsedComments)) {
//                                             parsedComments.forEach(log => {
//                                               amendLogs.push({
//                                                 date: formatDate(log.date || storeInfo?.[`${cat}_APPLY_DT`]),
//                                                 comment: log.comment || 'No comment',
//                                                 type: cat
//                                               });
//                                             });
//                                           } else if (typeof parsedComments === 'string') {
//                                             amendLogs.push({
//                                               date: storeInfo?.[`${cat}_APPLY_DT`] || 'N/A',
//                                               comment: parsedComments,
//                                               type: cat
//                                             });
//                                           }
//                                         } catch (e) {
//                                           amendLogs.push({
//                                             date: storeInfo?.[`${cat}_APPLY_DT`] || 'N/A',
//                                             comment: comments,
//                                             type: cat
//                                           });
//                                         }
//                                       }
                                      
//                                       if (amendLogs.length > 0) {
//                                         setLogModalTitle(`${row.PROCESS} - ${cat} Comments`);
//                                         setCurrentLogs(amendLogs);
//                                         setShowLogModal(true);
//                                       }
//                                     }}
//                                   >
//                                     <i className="fas fa-history"></i>
//                                   </button>
//                                 </OverlayTrigger>
//                               ) : (
//                                 '-'
//                               )}
//                             </td>

//                             {/* ACTION Column */}
//                             <td>
//                               {isAmendUpdated ? (
//                                 <button className="btn btn-success btn-sm" disabled>Updated</button>
//                               ) : canUpdateAmendment ? (
//                                 <button
//                                   className="btn btn-warning btn-sm"
//                                   onClick={() => showEmailModalForUpdate("amendment", storeInfo, cat)}
//                                 >
//                                   Update
//                                 </button>
//                               ) : (
//                                 <button className="btn btn-secondary btn-sm" disabled>Pending</button>
//                               )}
//                             </td>
//                           </React.Fragment>
//                         );
//                       })}
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Document Modals */}
//       <DocumentModal
//         show={showDocModal}
//         onClose={() => setShowDocModal(false)}
//         title={modalTitle}
//         docs={modalDocs}
//       />

//       <DocumentModal
//         show={showAmendDocModal}
//         onClose={() => setShowAmendDocModal(false)}
//         title={amendDocTitle}
//         docs={amendModalDocs}
//         isAmendment={true}
//       />

//       {/* Confirmation Modal for editing dates */}
//       <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered dialogClassName="modal-dialog-scrollable">
//         <Modal.Header closeButton>
//           <Modal.Title>Update Process Data</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {confirmModalData ? (
//             <Form>
//               <Form.Group className="mb-3">
//                 <Form.Label>Plant</Form.Label>
//                 <Form.Control 
//                   type="text" 
//                   value={selectedPlant || "N/A"} 
//                   readOnly 
//                 />
//               </Form.Group>
              
//               <Form.Group className="mb-3">
//                 <Form.Label>Process</Form.Label>
//                 <Form.Control 
//                   type="text" 
//                   value={confirmModalData.storeInfo?.PROCESS || "N/A"} 
//                   readOnly 
//                 />
//               </Form.Group>
              
//               <Form.Group className="mb-3">
//                 <Form.Label>
//                   Apply Date 
//                   <span style={{ color: "red" }}>*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={editableApplyDate || ""}
//                   max={new Date().toISOString().split("T")[0]}
//                   onChange={(e) => setEditableApplyDate(e.target.value)}
//                   required
//                 />
//                 <small className="text-muted">
//                   Current date will be replaced with the new date you select.
//                 </small>
//               </Form.Group>

//               {receivedDateProcesses.includes(confirmModalData.storeInfo?.PROCESS) && (
//                 <Form.Group className="mb-3">
//                   <Form.Label>
//                     Received Date <span style={{ color: "red" }}>*</span>
//                   </Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={editableReceivedDate || ""}
//                     max={new Date().toISOString().split("T")[0]}
//                     onChange={(e) => setEditableReceivedDate(e.target.value)}
//                     className={errors.receivedDate ? "is-invalid" : ""}
//                     required
//                   />
//                   {errors.receivedDate && (
//                     <div className="text-danger" style={{ fontSize: "14px" }}>
//                       {errors.receivedDate}
//                     </div>
//                   )}
//                 </Form.Group>
//               )}
              
//               <Form.Group className="mb-3">
//                 <Form.Label>Latest Comments</Form.Label>
//                 <div style={{ 
//                   maxHeight: '150px', 
//                   overflowY: 'auto',
//                   backgroundColor: '#f8f9fa',
//                   padding: '10px',
//                   borderRadius: '5px',
//                   border: '1px solid #dee2e6'
//                 }}>
//                   <div>
//                     <strong className="text-muted">Comment:</strong> {newComment || 'No comments available'}
//                   </div>
//                 </div>
//               </Form.Group>

//             </Form>
//           ) : (
//             <div className="text-center py-4">
//               <div className="spinner-border text-primary" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               <p className="mt-3">Loading process data...</p>
//             </div>
//           )}
//         </Modal.Body>
        
//         <Modal.Footer>
//           <Button 
//             variant="secondary" 
//             onClick={() => setShowConfirmModal(false)}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
          
//           <Button 
//             variant="primary" 
//             onClick={proceedToEmailSelection}
//             disabled={!confirmModalData || !editableApplyDate || loading}
//           >
//             {loading ? (
//               <>
//                 <span className="spinner-border spinner-border-sm me-2"></span>
//                 Loading...
//               </>
//             ) : (
//               'Send Email'
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Email Selection Modal */}
//       <EmailSelectionModal
//         show={showEmailModal}
//         onClose={() => {
//           setShowEmailModal(false);
//           setSelectedProcess(null);
//           setSelectedEmails([]);
//         }}
//         emailRecipients={emailRecipients}
//         selectedEmails={selectedEmails}
//         setSelectedEmails={setSelectedEmails}
//         onSendEmail={handleSendEmail}
//         modalData={selectedProcess}
//         loading={loading}
//       />

//       {/* Amendment Update Modal */}
//       {showAmendUpdateModal && selectedAmendUpdateData && (
//         <AmendUpdateModal
//           show={showAmendUpdateModal}
//           onClose={() => {
//             setShowAmendUpdateModal(false);
//             setSelectedAmendUpdateData(null);
//           }}
//           plant={selectedAmendUpdateData?.plant}
//           process={selectedAmendUpdateData?.process}
//           category={selectedAmendUpdateData?.category}
//           storeInfo={selectedAmendUpdateData?.storeInfo}
     
//         />
//       )}

//       {/* Logs Modal */}
//       <Modal show={showLogModal} onHide={() => setShowLogModal(false)} centered scrollable>
//         <Modal.Header closeButton>
//           <Modal.Title>{logModalTitle}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {currentLogs.length > 0 ? (
//             <div className="list-group">
//               {currentLogs.map((log, idx) => (
//                 <div key={idx} className="list-group-item">
//                   <div className="d-flex justify-content-between align-items-start">
//                     <div className="flex-grow-1">
//                       <div className="d-flex align-items-center mb-1">
//                         <strong className="text-muted me-2">
//                           {formatDate(log.date)}:
//                         </strong>
//                       </div>
//                       <div className="ps-3">
//                         {log.comment}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p>No amendment comments available.</p>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowLogModal(false)}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default PcbUpdateTable;

import React, { useState, useEffect, useContext } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL, API_DOC_URL } from '../config/Config';
import { OverlayTrigger, Tooltip, Modal, Button, Form } from 'react-bootstrap';
import PlantSelector from '../components/PlantSelector';
import PcbTabs from '../components/PcbTabs';
import '../pages/Update.css';
import '../components/PcbTabs.css';
import DocumentModal from '../components/DocumentModal';
import CardWithHeader from '../components/CardWithHeader';
import Swal from 'sweetalert2';
import { getMasterByLoc } from "../api/Api";
import ProjectInfoHeader from './ProjectInfoHeader';
import { Context } from '../context/ContextData';
import EmailSelectionModal from './EmailSelectionModal';
import AmendUpdateModal from './AmendUpdateModal'; 

// Helper function to format dates for backend (YYYY-MM-DD to DD-MM-YYYY)
const formatDateForBackend = (dateString) => {
  if (!dateString) return '';
  
  // Check if already in DD-MM-YYYY format
  if (dateString.includes('-') && dateString.split('-')[0].length <= 2) {
    return dateString;
  }
  
  // If in YYYY-MM-DD format, convert to DD-MM-YYYY
  if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }
  
  return dateString;
};

// Helper function to format dates for display
const formatDate = (date) => {
  if (!date) return "";
  const [fullDate, time] = date.split(" ");
  const [y, m, d] = fullDate.split("-");
  return time ? `${d}-${m}-${y} ${time}` : `${d}-${m}-${y}`;
};

// Helper function to get latest comment
const getLatestComment = (storeInfo) => {
  // First check parsedLogs
  if (storeInfo?.parsedLogs && Array.isArray(storeInfo.parsedLogs) && storeInfo.parsedLogs.length > 0) {
    // Sort parsedLogs by date descending (newest first)
    const sortedLogs = [...storeInfo.parsedLogs].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
    
    const latestLog = sortedLogs[0];
    return {
      date: latestLog.date || '',
      comment: latestLog.comment || 'No comment text'
    };
  }
  
  // If no parsedLogs, check COMMENTS field
  const commentsJson = storeInfo?.COMMENTS;
  
  if (!commentsJson || commentsJson === 'null' || commentsJson === 'undefined' || commentsJson.trim() === '') {
    return { date: '', comment: 'No comments available' };
  }
  
  try {
    const parsed = JSON.parse(commentsJson);
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Sort by date descending (newest first)
      const sorted = [...parsed].sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
      
      const latest = sorted[0];
      return {
        date: latest.date || '',
        comment: latest.comment || latest || 'No comment text'
      };
    } else if (typeof parsed === 'string' && parsed.trim() !== '') {
      return {
        date: '',
        comment: parsed
      };
    }
  } catch (e) {
    // If parsing fails, check if it's a simple string
    if (typeof commentsJson === 'string' && commentsJson.trim() !== '') {
      return {
        date: '',
        comment: commentsJson
      };
    }
  }
  
  return { date: '', comment: 'No comments available' };
};

const PcbUpdateTable = () => {
  const [key, setKey] = useState('Pollution Control Board');
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [pcbProcesses, setPcbProcesses] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [modalDocs, setModalDocs] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [amendModalDocs, setAmendModalDocs] = useState([]);
  const [showAmendDocModal, setShowAmendDocModal] = useState(false);
  const [amendDocTitle, setAmendDocTitle] = useState('');
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [amendmentRecords, setAmendmentRecords] = useState([]);
  const [amendCategories, setAmendCategories] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [inputData, setInputData] = useState({});
  const [status, setStatus] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [currentLogs, setCurrentLogs] = useState([]); 
  const [amendLogs, setAmendLogs] = useState([]);
  const [logModalTitle, setLogModalTitle] = useState('');
  const [selectedAmendProcess, setSelectedAmendProcess] = useState("");
  const [selectedAmendCategory, setSelectedAmendCategory] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState(null);
  const [editableApplyDate, setEditableApplyDate] = useState('');
  const [showAmendUpdateModal, setShowAmendUpdateModal] = useState(false);
  const [selectedAmendUpdateData, setSelectedAmendUpdateData] = useState(null);
  const [editableReceivedDate, setEditableReceivedDate] = useState('');
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    receivedDate: ""
  });

  const { 
    totalMasterData = [],
    setHeaderData, 
    headerData 
  } = useContext(Context);

const receivedDateProcesses = [
  "Received TOR",
  "EC (Environmetal Clearance)",
  "Application for CFE",
  "Received CFE",
]
  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    
    // If already in YYYY-MM-DD format
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      const parts = dateStr.split(' ');
      return parts[0]; // Return just the date part
    }
    
    // If in DD-MM-YYYY format, convert to YYYY-MM-DD
    if (dateStr.includes('-')) {
      const parts = dateStr.split(' ');
      const datePart = parts[0];
      const [day, month, year] = datePart.split('-');
      
      if (day && month && year && year.length === 4) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    return '';
  };

  useEffect(() => {
    axios.get(`${API_BASE_URL}/pcb-processes`).then(res => setPcbProcesses(res.data));
    axios.get(`${API_BASE_URL}/plants`).then(res => setPlants(res.data));
  }, []);

  const handlePlantChange = async (e) => {
    const plant = e.target.value;
    setSelectedPlant(plant);
    const res = await getMasterByLoc(plant);
    setHeaderData(res);

    if (plant) {
      axios.get(`${API_BASE_URL}/pcb-store/${plant}`)
        .then((res) => {
          const processedData = res.data.map(item => {
            if (item.LOG && typeof item.LOG === 'string') {
              try {
                item.parsedLogs = JSON.parse(item.LOG);
              } catch (e) {
                console.error('Error parsing LOG JSON for process:', item.PROCESS, e);
                item.parsedLogs = [{ date: new Date().toLocaleString(), comment: 'Error parsing logs.' }];
              }
            } else {
              item.parsedLogs = [];
            }
            return item;
          });
          
          setStoreData(processedData);
        })
        .catch((err) => console.error(err));
    } else {
      setStoreData([]);
    }
    setInputData({});
  };

  useEffect(() => {
    setHeaderData(null);
  }, []);

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

  const latestCreatedAmendment = amendmentRecords
    .filter(a => a.STATUS === 'created')
    .sort((a, b) => b.SNO - a.SNO)[0];

  const showConfirmationModal = (storeInfo) => {
    setConfirmModalData({
      storeInfo: storeInfo
    });
    
    // Set initial editable dates from store info
    setEditableApplyDate(formatDateForInput(storeInfo?.APPLY_DT || ''));
    setEditableReceivedDate(formatDateForInput(storeInfo?.RECEIVED_DT || ''));
    
    // Get latest comment
    const latestComment = getLatestComment(storeInfo);
    setNewComment(latestComment.comment);
    
    setShowConfirmModal(true);
  };

  const validateForm = () => {
    const processName = confirmModalData.storeInfo?.PROCESS;
    let newErrors = {};
    
    // Check if this process requires received date
    if (receivedDateProcesses.includes(processName)) {
      if (!editableReceivedDate) {
        newErrors.receivedDate = "Received Date is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const proceedToEmailSelection = async () => {
    if (!validateForm()) {
      const processName = confirmModalData.storeInfo?.PROCESS;
      if (receivedDateProcesses.includes(processName) && !editableReceivedDate) {
        await Swal.fire({
          icon: 'warning',
          title: 'Missing Required Field',
          text: 'Received Date is required for this process.',
        });
      }
      return;
    }
    
    setShowConfirmModal(false);
    setLoading(true);
    
    try {
      // Fetch email recipients
      const response = await axios.get(`${API_BASE_URL}/pcb-emails`);
      setEmailRecipients(response.data);
      
      // Convert dates to DD-MM-YYYY format for backend
      let formattedApplyDate = '';
      if (editableApplyDate) {
        formattedApplyDate = formatDateForBackend(editableApplyDate);
      } else if (confirmModalData.storeInfo?.APPLY_DT) {
        formattedApplyDate = confirmModalData.storeInfo.APPLY_DT;
      }
      
      let formattedReceivedDate = '';
      if (editableReceivedDate) {
        formattedReceivedDate = formatDateForBackend(editableReceivedDate);
      } else if (confirmModalData.storeInfo?.RECEIVED_DT) {
        formattedReceivedDate = confirmModalData.storeInfo.RECEIVED_DT;
      }
      
      // Create updated process info with formatted dates
      const updatedStoreInfo = {
        ...confirmModalData.storeInfo,
        APPLY_DT: formattedApplyDate,
        RECEIVED_DT: formattedReceivedDate || ""
      };
      
      console.log('Updated store info for submission:', updatedStoreInfo);
      
      setSelectedProcess(updatedStoreInfo);
      setShowEmailModal(true);
      setLoading(false);
      
    } catch (error) {
      console.error("❌ Failed to fetch email recipients:", error);
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load email recipients. Please try again.'
      });
    }
  };



  const showEmailModalForUpdate = async (type, processInfo, amendCategory = '') => {
    try {
      if (type === 'regular') {
        // For regular updates - show email modal
        const response = await axios.get(`${API_BASE_URL}/pcb-emails`);
        setEmailRecipients(response.data);
        setSelectedProcess(processInfo);
        
        setEmailSubject(`Process Update: ${processInfo.PROCESS}`);
        setEmailMessage(
          `Dear Team,\n\nPlease find the update for the process: ${processInfo.PROCESS}\n\nPlant: ${selectedPlant}\nApply Date: ${processInfo.APPLY_DT}\n\nComments: ${processInfo.COMMENTS}\n\nBest Regards`
        );
        
        setSelectedEmails([]);
        setShowEmailModal(true);
      } else if (type === 'amendment') {
        // For amendment updates - show amendment modal directly
        setSelectedAmendUpdateData({
          plant: selectedPlant,
          process: processInfo.PROCESS,
          category: amendCategory,
          storeInfo: processInfo
        });
        setShowAmendUpdateModal(true);
      }
    } catch (error) {
      console.error("❌ Failed to fetch email recipients:", error);
      if (type === 'regular') {
        setShowEmailModal(true);
      }
    }
  };

const handleSendEmail = async (selectedEmails) => {

  if (!selectedProcess) {
    await Swal.fire({
      icon: 'warning',
      title: 'No Process Selected',
      text: 'Please select a process to update.'
    });
    return;
  }

  setLoading(true);
  
  const storeInfo = storeData.find(item => item.PROCESS === selectedProcess?.PROCESS);
  
  // ✅ Get dates in consistent format
  const updatedApplyDate = formatDate(selectedProcess.APPLY_DT); // Should be DD-MM-YYYY
  const updatedReceivedDate = selectedProcess.RECEIVED_DT || "";
  
  // Convert existing date to YYYY-MM-DD for comparison
  const existingDateFormatted = formatDateForInput(storeInfo?.APPLY_DT || '');
  
  
  console.log("New date from input:", formatDate(editableApplyDate)); // YYYY-MM-DD
  console.log("Existing date from DB:", storeInfo?.APPLY_DT); // DD-MM-YYYY
  console.log("Existing date formatted:", existingDateFormatted); // YYYY-MM-DD
  console.log("Updated date to send:", updatedApplyDate); // DD-MM-YYYY
  
  if (!updatedApplyDate || !storeInfo?.DOC_PATH || !storeInfo?.COMMENTS) {
    await Swal.fire({
      icon: 'warning',
      title: 'Missing Fields',
      text: 'Please ensure Apply Date, Document, and Comments are all available before updating.'
    });
    setLoading(false);
    return;
  }

  try {
    Swal.fire({
      title: 'Updating...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    // Send update to backend
    await axios.post(`${API_BASE_URL}/pollution-update`, {
      loc: selectedPlant,
      process: selectedProcess.PROCESS,
      applyDate: updatedApplyDate, // Send as DD-MM-YYYY
      documentPath: storeInfo.DOC_PATH,
      comments: storeInfo.COMMENTS,
      receivedDate: updatedReceivedDate,
      emails: selectedEmails
    });

    Swal.close();

    // ✅ Update storeData - make sure date format matches what will be displayed
    setStoreData(prevStoreData => {
      return prevStoreData.map(item => {
        if (item.PROCESS === selectedProcess.PROCESS) {
          return {
            ...item,
            APPLY_DT: updatedApplyDate, // Store as DD-MM-YYYY
            RECEIVED_DT: updatedReceivedDate || item.RECEIVED_DT,
            UPDATED: 'YES'
          };
        }
        return item;
      });
    });

    await Swal.fire({
      icon: 'success',
      title: 'Update Successful',
      text: `${selectedProcess.PROCESS} has been updated successfully.`,
      timer: 2000,
      showConfirmButton: false
    });

     refreshStoreData(); 
    // Close modals and reset states
    setShowEmailModal(false);
    setShowConfirmModal(false);
    setSelectedProcess(null);
    setConfirmModalData(null);
    setEditableApplyDate('');
    setEditableReceivedDate('');
    setSelectedEmails([]);
    setLoading(false);

  } catch (error) {
    console.error('Update failed:', error);
    Swal.close();
    setLoading(false);
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: error.response?.data?.message || 'Something went wrong while updating. Please try again.'
    });
  }
};

  // Refresh data after amendment update
  const refreshStoreData = async () => {
    if (selectedPlant) {
      try {
        const response = await axios.get(`${API_BASE_URL}/pcb-store/${selectedPlant}`);
        const processedData = response.data.map(item => {
          if (item.LOG && typeof item.LOG === 'string') {
            try {
              item.parsedLogs = JSON.parse(item.LOG);
            } catch (e) {
              console.error('Error parsing LOG JSON for process:', item.PROCESS, e);
              item.parsedLogs = [{ date: new Date().toLocaleString(), comment: 'Error parsing logs.' }];
            }
          } else {
            item.parsedLogs = [];
          }
          return item;
        });
        setStoreData(processedData);
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }
  };

  let lastAmendedIndexMap = {};

  amendCategories.forEach(category => {
    let lastIndex = -1;
    pcbProcesses.forEach((row, index) => {
      const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS);
      let amendStatus = '';

      if (category === 'AMEND1') {
        amendStatus = storeInfo?.AMEND1_STATUS || '';
      } else if (category === 'AMEND2') {
        amendStatus = storeInfo?.AMEND2_STATUS || '';
      } else if (category === 'AMEND3') {
        amendStatus = storeInfo?.AMEND3_STATUS || '';
      } else if (category === 'AMEND4') {
        amendStatus = storeInfo?.AMEND4_STATUS || '';
      } else if (category === 'AMEND5') {
        amendStatus = storeInfo?.AMEND5_STATUS || '';
      }

      if (amendStatus === 'YES') {
        lastIndex = index;
      }
    });
    lastAmendedIndexMap[category] = lastIndex;
  });

  let currentTimelineMode = 'action';
  if (status === 'created') {
    if (amendCategories.includes('AMEND2')) {
      currentTimelineMode = 'AMEND2';
    } else if (amendCategories.includes('AMEND1')) {
      currentTimelineMode = 'AMEND1';
    } else if (amendCategories.includes('AMEND3')) {
      currentTimelineMode = 'AMEND3';
    } else if (amendCategories.includes('AMEND4')) {
      currentTimelineMode = 'AMEND4';
    } else if (amendCategories.includes('AMEND5')) {
      currentTimelineMode = 'AMEND5';
    }
  }

  const updatedIndexes = pcbProcesses
    .map((row, idx) => {
      const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS);
      return storeInfo?.UPDATED === 'YES' ? idx : null;
    })
    .filter(idx => idx !== null);

  const lastUpdatedIndex = updatedIndexes.length > 0 ? Math.max(...updatedIndexes) : -1;

  let lastIndexForTimeline = -1;
  if (currentTimelineMode === 'action') {
    lastIndexForTimeline = lastUpdatedIndex;
  } else {
    lastIndexForTimeline = lastAmendedIndexMap[currentTimelineMode] ?? -1;
  }

  const isAmendExists = amendmentRecords.length > 0;

  return (
    <>
      <PlantSelector
        plants={plants}
        selectedPlant={selectedPlant}
        onChange={handlePlantChange}
        customMarginTop="-10px"
      />
      <div className='mt-1'>
        <ProjectInfoHeader data={headerData}/>
      </div>

      {!selectedPlant ? (
        <div className="alert alert-info mt-4" style={{
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          color: '#0c5460',
          borderRadius: '8px'
        }}>
          Please select a plant to view data.
        </div>
      ) : (
        <div 
          className="custom-tbl" 
          style={{ 
            backgroundColor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginTop: '5px',
            height: 'calc(100vh - 350px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="table-scroll-wrapper custom-tbl" style={{ width: '100%', overflowX: 'auto' }} >
            <table className="table table-hover table-sm" style={{ marginBottom: '0px' }}>
              <thead className="custom-thead">
                <tr>
                  <th style={{ width: '30px' }}></th>
                  <th>S.NO</th>
                  <th>PROCESS</th>
                  <th style={{ whiteSpace: 'nowrap' }}>APPLY DATE</th>
                  <th>DOCUMENT</th>
                  <th>LOGS</th>
                  <th>ACTION</th>
                  
                  {/* Amendment columns */}
                  {amendCategories?.map(cat => (
                    <React.Fragment key={cat}>
                      <th style={{ whiteSpace: 'nowrap' }}>{cat} DATE</th>
                      <th style={{ whiteSpace: 'nowrap' }}>{cat} DOC</th>
                      <th style={{ whiteSpace: 'nowrap' }}>{cat} LOGS</th>
                      <th style={{ whiteSpace: 'nowrap' }}>{cat} ACTION</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pcbProcesses?.map((row, index) => {
                  const storeInfo = storeData?.find(item => item.PROCESS === row.PROCESS);

                  console.log(storeInfo,"infrrrrraaaaaaaaaaaaaa");
                  const isOriginalUpdated = storeInfo?.UPDATED === 'YES';

                  let isUpdated = false;
                  let isNextStep = false;

                  if (currentTimelineMode === 'action') {
                    isUpdated = storeInfo?.UPDATED === 'YES';
                    isNextStep = index === lastUpdatedIndex + 1;
                  } else if (currentTimelineMode === 'AMEND1') {
                    isUpdated = storeInfo?.AMEND1_STATUS === 'YES';
                    isNextStep = index === lastAmendedIndexMap['AMEND1'] + 1;
                  } else if (currentTimelineMode === 'AMEND2') {
                    isUpdated = storeInfo?.AMEND2_STATUS === 'YES';
                    isNextStep = index === lastAmendedIndexMap['AMEND2'] + 1;
                  } else if (currentTimelineMode === 'AMEND3') {
                    isUpdated = storeInfo?.AMEND3_STATUS === 'YES';
                    isNextStep = index === lastAmendedIndexMap['AMEND3'] + 1;
                  } else if (currentTimelineMode === 'AMEND4') {
                    isUpdated = storeInfo?.AMEND4_STATUS === 'YES';
                    isNextStep = index === lastAmendedIndexMap['AMEND4'] + 1;
                  } else if (currentTimelineMode === 'AMEND5') {
                    isUpdated = storeInfo?.AMEND5_STATUS === 'YES';
                    isNextStep = index === lastAmendedIndexMap['AMEND5'] + 1;
                  }

                  let dotColor = 'grey';
                  let lineColor = 'grey';
                  if (isUpdated) {
                    dotColor = 'green';
                    lineColor = 'green';
                  } else if (isNextStep) {
                    dotColor = 'red';
                    lineColor = 'red';
                  }

                  return (
                    <tr key={row.PROCESS}>
                      <td className="timeline-cell">
                        <span className={`dot ${dotColor}`}></span>
                        {index !== pcbProcesses.length - 1 && (
                          <div className={`line ${lineColor}`}></div>
                        )}
                      </td>

                      <td>{row.SNO}</td>
                      <td style={{ whiteSpace: 'nowrap' }}><em>{row.PROCESS}</em></td>

                      <td style={{ whiteSpace: 'nowrap' }}>
                        {/* Show the latest apply date from store data */}
                        {formatDate(storeInfo?.APPLY_DT) || '-'}
                      </td>

                      <td style={{ whiteSpace: 'nowrap' }}>
                        {storeInfo?.DOC_PATH ? (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            title="View Document"
                            onClick={() => {
                              if (!storeInfo?.DOC_PATH) {
                                alert('No documents available for this process');
                                return;
                              }

                              let docs = [];
                              let names = [];

                              try {
                                docs = JSON.parse(storeInfo.DOC_PATH || '[]');
                                names = JSON.parse(storeInfo.DOC_NAME || '[]');
                              } catch (e) {
                                console.error('Error parsing DOC_PATH/DOC_NAME:', e);
                              }

                              const files = docs?.map((docPath, idx) => ({
                                DOC_PATH: docPath,
                                DOC_NAME: names[idx] || `Document ${idx + 1}`,
                              }));

                              setModalDocs(files);
                              setModalTitle(row.PROCESS);
                              setShowDocModal(true);
                            }}
                          >
                            <i className="fas fa-file-alt"></i>
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td style={{ whiteSpace: 'nowrap' }}>
                        {storeInfo?.LOG ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-logs-${row.PROCESS}`} className="custom-tooltip">
                                View Logs
                              </Tooltip>
                            }
                          >
                            <button
                              className="btn btn-outline-info btn-sm"
                              onClick={() => {
                                setLogModalTitle(`${row.PROCESS} Logs`);
                                setCurrentLogs(storeInfo.parsedLogs || []);
                                setShowLogModal(true);
                              }}
                            >
                              <i className="fas fa-history"></i>
                            </button>
                          </OverlayTrigger>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td>
                        {isAmendExists ? (
                          <button
                            className={`btn btn-sm ${
                              isOriginalUpdated ? "btn-success" : "btn-secondary"
                            }`}
                            disabled
                          >
                            {isOriginalUpdated ? "Updated" : "Pending"}
                          </button>
                        ) : isNextStep ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={async () => {
                              if (
                                !storeInfo?.APPLY_DT ||
                                !storeInfo?.DOC_PATH ||
                                !storeInfo?.COMMENTS
                              ) {
                                await Swal.fire({
                                  icon: "warning",
                                  title: "Missing Fields",
                                  text: "Please ensure Apply Date, Document, and Comments are all available.",
                                });
                                return;
                              }
                              showConfirmationModal(storeInfo);
                            }}
                          >
                            Update
                          </button>
                        ) : (
                          <button className="btn btn-success btn-sm" disabled>
                            {isOriginalUpdated ? "Updated" : "Pending"}
                          </button>
                        )}
                      </td>

                      {/* Amendment columns */}
                      {amendCategories?.map(cat => {
                        const docPathKey = `${cat}_DOC_PATH`;
                        const docNameKey = `${cat}_DOC_NAME`;
                        const statusKey = `${cat}_STATUS`;
                        const commentsKey = `${cat}_COMMENTS`;
                        const dateKey = `${cat}_DATE`;

                        const hasDocs = storeInfo?.[docPathKey];
                        const isAmendUpdated = storeInfo?.[statusKey] === 'YES';
                        const hasComments = storeInfo?.[commentsKey];
                        const amendDate = storeInfo?.[dateKey];

                        console.log(storeInfo,":dddddddddddddd");

                        const isLatestAmendmentForCat =
                          latestCreatedAmendment &&
                          latestCreatedAmendment.CATEGORY === cat;

                        const canUpdateAmendment = !isAmendUpdated && isLatestAmendmentForCat && hasDocs;

                        return (
                          <React.Fragment key={cat}>
                            {/* DATE Column */}
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {formatDate(amendDate)}
                            </td>

                            {/* DOC Column */}
                            <td>
                              {hasDocs ? (
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="custom-tooltip" className="custom-tooltip">
                                      View Amendment Documents
                                    </Tooltip>
                                  }
                                >
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => {
                                      let docs = [];
                                      let names = [];

                                      try {
                                        docs = JSON.parse(storeInfo[docPathKey] || '[]');
                                        names = JSON.parse(storeInfo[docNameKey] || '[]');
                                      } catch (e) {
                                        console.error('Error parsing amendment docs:', e);
                                      }

                                      const files = docs.map((docPath, idx) => ({
                                        DOC_PATH: docPath,
                                        DOC_NAME: names[idx] || `Amend Document ${idx + 1}`,
                                      }));

                                      setAmendModalDocs(files);
                                      setAmendDocTitle(`${row.PROCESS} - ${cat} Amendment`);
                                      setShowAmendDocModal(true);
                                    }}
                                  >
                                    <i className="fas fa-file-alt wiggle-icon"></i>
                                  </button>
                                </OverlayTrigger>
                              ) : '-'}
                            </td>

                            {/* LOGS Column */}
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {hasComments ? (
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id={`tooltip-${cat}-logs-${row.PROCESS}`} className="custom-tooltip">
                                      View {cat} Comments
                                    </Tooltip>
                                  }
                                >
                                  <button
                                    className="btn btn-outline-info btn-sm"
                                    onClick={() => {
                                      const amendLogs = [];
                                      const comments = storeInfo?.[commentsKey];
                                      
                                      if (comments) {
                                        try {
                                          const parsedComments = JSON.parse(comments);
                                          if (Array.isArray(parsedComments)) {
                                            parsedComments.forEach(log => {
                                              amendLogs.push({
                                                date: formatDate(log.date || storeInfo?.[`${cat}_APPLY_DT`]),
                                                comment: log.comment || 'No comment',
                                                type: cat
                                              });
                                            });
                                          } else if (typeof parsedComments === 'string') {
                                            amendLogs.push({
                                              date: storeInfo?.[`${cat}_APPLY_DT`] || 'N/A',
                                              comment: parsedComments,
                                              type: cat
                                            });
                                          }
                                        } catch (e) {
                                          amendLogs.push({
                                            date: storeInfo?.[`${cat}_APPLY_DT`] || 'N/A',
                                            comment: comments,
                                            type: cat
                                          });
                                        }
                                      }
                                      
                                      if (amendLogs.length > 0) {
                                        setLogModalTitle(`${row.PROCESS} - ${cat} Comments`);
                                        setCurrentLogs(amendLogs);
                                        setShowLogModal(true);
                                      }
                                    }}
                                  >
                                    <i className="fas fa-history"></i>
                                  </button>
                                </OverlayTrigger>
                              ) : (
                                '-'
                              )}
                            </td>

                            {/* ACTION Column */}
                            <td>
                              {isAmendUpdated ? (
                                <button className="btn btn-success btn-sm" disabled>Updated</button>
                              ) : canUpdateAmendment ? (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => showEmailModalForUpdate("amendment", storeInfo, cat)}
                                >
                                  Update
                                </button>
                              ) : (
                                <button className="btn btn-secondary btn-sm" disabled>Pending</button>
                              )}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Modals */}
      <DocumentModal
        show={showDocModal}
        onClose={() => setShowDocModal(false)}
        title={modalTitle}
        docs={modalDocs}
      />

      <DocumentModal
        show={showAmendDocModal}
        onClose={() => setShowAmendDocModal(false)}
        title={amendDocTitle}
        docs={amendModalDocs}
        isAmendment={true}
      />

      {/* Confirmation Modal for editing dates */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered dialogClassName="modal-dialog-scrollable">
        <Modal.Header closeButton>
          <Modal.Title>Update Process Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmModalData ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Plant</Form.Label>
                <Form.Control 
                  type="text" 
                  value={selectedPlant || "N/A"} 
                  readOnly 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Process</Form.Label>
                <Form.Control 
                  type="text" 
                  value={confirmModalData.storeInfo?.PROCESS || "N/A"} 
                  readOnly 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>
                  Apply Date 
                  <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={editableApplyDate || ""}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEditableApplyDate(e.target.value)}
                  required
                />
                <small className="text-muted">
                  Current date will be replaced with the new date you select.
                </small>
              </Form.Group>

              {receivedDateProcesses.includes(confirmModalData.storeInfo?.PROCESS) && (
                <Form.Group className="mb-3">
                  <Form.Label>
                    Received Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={editableReceivedDate || ""}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEditableReceivedDate(e.target.value)}
                    className={errors.receivedDate ? "is-invalid" : ""}
                    required
                  />
                  {errors.receivedDate && (
                    <div className="text-danger" style={{ fontSize: "14px" }}>
                      {errors.receivedDate}
                    </div>
                  )}
                </Form.Group>
              )}
              
              <Form.Group className="mb-3">
                <Form.Label>Latest Comments</Form.Label>
                <div style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #dee2e6'
                }}>
                  <div>
                    <strong className="text-muted">Comment:</strong> {newComment || 'No comments available'}
                  </div>
                </div>
              </Form.Group>

            </Form>
          ) : (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading process data...</p>
            </div>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirmModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button 
            variant="primary" 
            onClick={proceedToEmailSelection}
            disabled={!confirmModalData || !editableApplyDate || loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Loading...
              </>
            ) : (
              'Send Email'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Email Selection Modal */}
      <EmailSelectionModal
        show={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setSelectedProcess(null);
          setSelectedEmails([]);
        }}
        emailRecipients={emailRecipients}
        selectedEmails={selectedEmails}
        setSelectedEmails={setSelectedEmails}
        onSendEmail={handleSendEmail}
        modalData={selectedProcess}
        loading={loading}
      />

      {/* Amendment Update Modal */}
      {showAmendUpdateModal && selectedAmendUpdateData && (
        <AmendUpdateModal
          show={showAmendUpdateModal}
          onClose={() => {
            setShowAmendUpdateModal(false);
            setSelectedAmendUpdateData(null);
          }}
          plant={selectedAmendUpdateData?.plant}
          process={selectedAmendUpdateData?.process}
          category={selectedAmendUpdateData?.category}
          storeInfo={selectedAmendUpdateData?.storeInfo}
           onSuccess={refreshStoreData} 
        />
      )}

      {/* Logs Modal */}
      <Modal show={showLogModal} onHide={() => setShowLogModal(false)} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{logModalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentLogs.length > 0 ? (
            <div className="list-group">
              {currentLogs.map((log, idx) => (
                <div key={idx} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <strong className="text-muted me-2">
                          {formatDate(log.date)}:
                        </strong>
                      </div>
                      <div className="ps-3">
                        {log.comment}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No amendment comments available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PcbUpdateTable;