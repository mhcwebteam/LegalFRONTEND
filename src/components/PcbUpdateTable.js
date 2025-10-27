import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL, API_DOC_URL } from '../config/Config';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import PlantSelector from '../components/PlantSelector';
import PcbTabs from '../components/PcbTabs';
import '../pages/Update.css';
import '../components/PcbTabs.css';
import DocumentModal from '../components/DocumentModal';
import CardWithHeader from '../components/CardWithHeader';import Swal from 'sweetalert2';


const PcbUpdateTable = () => {

 const [key, setKey] = useState('Pollution Control Board');
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [pcbProcesses, setPcbProcesses] = useState([]);
  const [storeData, setStoreData] = useState([]);

  const [showDocModal, setShowDocModal] = useState(false);
  const [modalDocs, setModalDocs] = useState([]);
  const [modalTitle, setModalTitle] = useState('');

  const [amendModalDocs, setAmendModalDocs] = useState([]);
  const [showAmendDocModal, setShowAmendDocModal] = useState(false);
  const [amendDocTitle, setAmendDocTitle] = useState('');

   const [amendmentRecords, setAmendmentRecords] = useState([]);   // Whole API response
  const [amendCategories, setAmendCategories] = useState([]);     // Unique categories
  

  // For inputs, keep separate state for each row (process)
  const [inputData, setInputData] = useState({}); // { [process]: { applyDate, selectedFile } }

  const [status, setStatus] = useState('');


  useEffect(() => {
    axios.get(`${API_BASE_URL}/pcb-processes`).then(res => setPcbProcesses(res.data));
    axios.get(`${API_BASE_URL}/plants`).then(res => setPlants(res.data));
  }, []);

  const handlePlantChange = (e) => {
    const plant = e.target.value;
    setSelectedPlant(plant);

    if (plant) {
      axios.get(`${API_BASE_URL}/pcb-store/${plant}`)
        .then((res) => {
          console.log(res.data);
          setStoreData(res.data);
        })
        .catch((err) => console.error(err));
    } else {
      setStoreData([]);
    }
    // Clear inputs on plant change
    setInputData({});
  };

  useEffect(() => {
  if (selectedPlant && key) {
    axios.get(`${API_BASE_URL}/amendments/${selectedPlant}/${key}`)
      .then(res => {
        console.log('✅ Amendments API response:', res.data);

        const records = res.data.data || [];
        setAmendmentRecords(records);

        // Status for process column
        const processRecord = records.find(r => r.PROCESS === key);
        setStatus(processRecord?.STATUS || '');

        // Only categories with STATUS = 'created'
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


  const handleInputChange = (process, field, value) => {
    setInputData(prev => ({
      ...prev,
      [process]: {
        ...prev[process],
        [field]: value,
      }
    }));
  };

  const handleUpdate = async (process) => {
    const storeInfo = storeData.find(item => item.PROCESS === process);

    if (!storeInfo?.APPLY_DT || !storeInfo?.DOC_PATH || !storeInfo?.COMMENTS) {
      // alert('Please ensure Apply Date, Document, and Comments are all available before updating.');
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please ensure Apply Date, Document, and Comments are all available before updating.'
      });
      return;
    }

    try {
       // Optional: show loading spinner
        Swal.fire({
          title: 'Updating...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
      // Replace this with your actual API if needed
        await axios.post(`${API_BASE_URL}/pollution-update`, {
          loc: selectedPlant,
          process,
          applyDate: storeInfo.APPLY_DT,
          documentPath: storeInfo.DOC_PATH,
          comments: storeInfo.COMMENTS
        });

          // Close loading modal
        Swal.close();

        // Show success alert
        await Swal.fire({
          icon: 'success',
          title: 'Update Successful',
          text: `${process} has been updated successfully.`,
          timer: 2000,
          showConfirmButton: false
        });

      // Optional: refresh store data
      const response = await axios.get(`${API_BASE_URL}/pcb-store/${selectedPlant}`);
      setStoreData(response.data);

    } catch (error) {
      console.error('Update failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Something went wrong while updating. Please try again.'
      });
    }
  };

 const handleAmendmentUpdate = async (process, category) => {
  const storeInfo = storeData.find(item => item.PROCESS === process);

  const docPathKey = `${category}_AMEND_DOC_PATH`;
  const commentsKey = `${category}_AMEND_COMMENTS`;
  console.log(docPathKey);
  console.log(commentsKey);

  // if (!storeInfo?.[docPathKey] || !storeInfo?.commentsKey) {
  //   await Swal.fire({
  //     icon: 'warning',
  //     title: 'Missing Amendment Data',
  //     text: 'Please make sure Apply Date and Amendment Document are available before updating.',
  //   });
  //   return;
  // }

   const endpoint = category === 'EC'
    ? `${API_BASE_URL}/ec-amendment-update`
    : `${API_BASE_URL}/cfe-amendment-update`;

  try {
    Swal.fire({
      title: 'Updating Amendment...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    await axios.post(endpoint, {
      loc: selectedPlant,
      process,
      category,
      applyDate: storeInfo.APPLY_DT,
      documentPath: storeInfo[docPathKey],
      comments: storeInfo[commentsKey] || ''
    });

    Swal.close();

    await Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Amendment update completed successfully!',
      timer: 2000,
      showConfirmButton: false
    });

    const res = await axios.get(`${API_BASE_URL}/pcb-store/${selectedPlant}`);
    setStoreData(res.data);
  } catch (err) {
    console.error('Amendment update failed:', err);
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: 'An error occurred while updating the amendment.'
    });
  }
};


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


  // Identify which processes are already submitted
 // Identify updated rows based on UPDATED === 'YES'
  
const isAmendExists = amendmentRecords.length > 0;
 return(
    <>
    
    <PlantSelector
             plants={plants}
             selectedPlant={selectedPlant}
             onChange={handlePlantChange}
             customMarginTop="-10px"
           />
   
           {!selectedPlant ? (
             <div className="alert alert-info mt-4" style={{ 
               backgroundColor: '#d1ecf1',
               borderColor: '#bee5eb',
               color: '#0c5460',
               borderRadius: '8px'
             }}
             >
               Please select a plant to view data.
               </div>
           ) : (
             <div className="table-scroll-wrapper custom-tbl" style={{ width: '100%', overflowX: 'auto' }} >
               
               <table className="table table-hover table-sm" 
                     style={{marginBottom:'0px'}}>
                 <thead className="custom-thead">
                   <tr>
                     <th style={{ width: '30px' }}></th>
                     <th>S.No</th>
                     <th>Process</th>
                     <th style={{ whiteSpace: 'nowrap' }}>Apply Date</th>
                     <th>Document</th>
                     <th>Comments</th>
                     <th>Action</th>
                     {amendCategories.map(cat => (
                       <React.Fragment key={cat}>
                         <th style={{ whiteSpace: 'nowrap' }}>{cat} Amend Docs</th>
                         <th style={{ whiteSpace: 'nowrap' }}>{cat} Action</th>
                       </React.Fragment>
                     ))}
   
                     {/* <th>Document</th>
                     <th>Action</th> */}
                   </tr>
                 </thead>
                 <tbody>
                   {pcbProcesses.map((row, index) => {
                     const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS);
                     let isUpdated = false;
     let isNextStep = false;
   
     if (currentTimelineMode === 'action') {
       isUpdated = storeInfo?.UPDATED === 'YES';
       isNextStep = index === lastUpdatedIndex + 1;
     } else if (currentTimelineMode === 'EC') {
       isUpdated = storeInfo?.EC_AMEND_STATUS === 'YES';
       isNextStep = index === lastAmendedIndexMap['EC'] + 1;
     } else if (currentTimelineMode === 'CFE') {
       isUpdated = storeInfo?.CFE_AMEND_STATUS === 'YES';
       isNextStep = index === lastAmendedIndexMap['CFE'] + 1;
     }
   
                     // Timeline colors
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
                           {storeInfo?.APPLY_DT || '-'}
                         </td>
   
                         <td style={{ whiteSpace: 'nowrap' }}>
                           {storeInfo?.DOC_PATH ? (
                             <button
                               className="btn btn-outline-primary btn-sm "
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
   
                                   const files = docs.map((docPath, idx) => ({
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
                           {storeInfo?.COMMENTS || '-'}
                         </td>
   
                         <td>
                           {isAmendExists ? (
       isUpdated ? (
         <button className="btn btn-success btn-sm" disabled>
           Updated
         </button>
       ) : (
         <button className="btn btn-secondary btn-sm" disabled>
           Pending
         </button>
       )
     ) : (
       isNextStep ? (
         <button
           className="btn btn-primary btn-sm"
           onClick={async () => {
             if (
               !storeInfo?.APPLY_DT ||
               !storeInfo?.DOC_PATH ||
               !storeInfo?.COMMENTS
             ) {
               await Swal.fire({
                 icon: 'warning',
                 title: 'Missing Fields',
                 text: 'Please ensure Apply Date, Document, and Comments are all available before updating.',
               });
               return;
             }
   
             const result = await Swal.fire({
               title: 'Are you sure?',
               text: 'Do you want to proceed with the update?',
               icon: 'question',
               showCancelButton: true,
               confirmButtonText: 'Yes, update it!',
             });
   
             if (result.isConfirmed) {
               handleUpdate(row.PROCESS);
             }
           }}
         >
           Update
         </button>
       ) : (
         <button className="btn btn-success btn-sm" disabled>
           {isUpdated ? 'Updated' : 'Pending'}
         </button>
       )
     )}
   
                         </td>
   
                         {amendCategories.map(cat => {
       const docPathKey = `${cat}_AMEND_DOC_PATH`;
       const docNameKey = `${cat}_AMEND_DOC_NAME`;
       const statusKey = `${cat}_AMEND_STATUS`;
   
       const hasDocs = storeInfo?.[docPathKey];
       const isUpdated = storeInfo?.[statusKey] === 'YES';
   
   
       return (
         <React.Fragment key={cat}>
           <td>
             {hasDocs ? (
               
   
   <OverlayTrigger
     placement="top"
     overlay={
       <Tooltip id="custom-tooltip"  className="custom-tooltip">
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
   
           <td>
             {isUpdated ? (
               <button className="btn btn-success btn-sm" disabled>
                 Updated
               </button>
             ) : hasDocs ? (
               <button
                 className="btn btn-warning btn-sm"
                 onClick={() => handleAmendmentUpdate(row.PROCESS, cat)}
               >
                 Update
               </button>
             ) : (
               <button className="btn btn-secondary btn-sm" disabled>
                 Pending
               </button>
             )}
           </td>
         </React.Fragment>
       );
     })}
   
   
                         {/* <td>
       {storeInfo?.EC_AMEND_DOC_PATH ? (
         <button
           className="btn btn-link p-0 text-primary"
           onClick={() => {
             const storeInfo = storeData.find(item => item.PROCESS === row.PROCESS);
   
     if (storeInfo?.EC_AMEND_DOC_PATH) {
       let docs = [];
       let names = [];
   
       try {
         docs = JSON.parse(storeInfo.EC_AMEND_DOC_PATH || '[]');
         names = JSON.parse(storeInfo.EC_AMEND_DOC_NAME || '[]');
       } catch (e) {
         console.error('Error parsing amendment docs:', e);
       }
   
       const files = docs.map((docPath, idx) => ({
         DOC_PATH: docPath,
         DOC_NAME: names[idx] || `Amend Document ${idx + 1}`,
       }));
   
       setAmendModalDocs(files);
       setAmendDocTitle(`${row.PROCESS} - Amendment`);
       setShowAmendDocModal(true);
     }
   
           }}
         >
           View Amend Docs
         </button>
       ) : '-'}
     </td> */}
   
     {/* <td>
       {storeInfo?.EC_AMEND_STATUS === 'YES' ? (
         <button className="btn btn-success btn-sm" disabled>Updated</button>
       ) : storeInfo?.EC_AMEND_DOC_PATH ? (
         <button
           className="btn btn-warning btn-sm"
           onClick={() => {
             // Similar logic to handleUpdate but for amendment
             handleAmendmentUpdate(row.PROCESS);
           }}
         >
           Update
         </button>
       ) : (
         <button className="btn btn-secondary btn-sm" disabled>Pending</button>
       )}
     </td> */}
   
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           )}


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
  isAmendment={true} // optional, if you want to differentiate inside modal
/>
    </>
 );

};

export default PcbUpdateTable;