import React, { useState, useEffect, useContext } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL, API_DOC_URL } from '../config/Config';
import { OverlayTrigger, Tooltip, Modal, Button } from 'react-bootstrap';

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

  // New state to track update type and process
  const [updateType, setUpdateType] = useState(''); // 'regular' or 'amendment'
  const [currentProcessForUpdate, setCurrentProcessForUpdate] = useState(null);


    useEffect(() => {
    setHeaderData(null);
  }, []);

  const {
    totalMasterData = [],
    setHeaderData,
    headerData
  } = useContext(Context);

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

  // Function to show email modal for ANY update
  const showEmailModalForUpdate = async (type, processInfo, amendCategory = '') => {
    try {
      // Fetch email recipients
      const response = await axios.get(`${API_BASE_URL}/pcb-emails`);
      setEmailRecipients(response.data);

      // Set current process for update
      setCurrentProcessForUpdate(processInfo);
      setUpdateType(type);

      if (type === 'amendment') {
        setSelectedAmendProcess(processInfo.PROCESS);
        setSelectedAmendCategory(amendCategory);
      } else {
        setSelectedProcess(processInfo);
      }

      // Set email subject and message
      if (type === 'regular') {
        setEmailSubject(`Process Update: ${processInfo.PROCESS}`);
        setEmailMessage(
          `Dear Team,\n\nPlease find the update for the process: ${processInfo.PROCESS}\n\nPlant: ${selectedPlant}\nApply Date: ${formatDate(processInfo.APPLY_DT)}\n\nComments: ${processInfo.COMMENTS}\n\nBest Regards`
        );
      } else if (type === 'amendment') {
        setEmailSubject(`Amendment Update: ${processInfo.PROCESS} - ${amendCategory}`);
        setEmailMessage(
          `Dear Team,\n\nPlease find the amendment update for:\n\nProcess: ${processInfo.PROCESS}\nAmendment Type: ${amendCategory}\nPlant: ${selectedPlant}\nApply Date: ${formatDate(processInfo.APPLY_DT)}\n\nBest Regards`
        );
      }

      // Reset selected emails
      setSelectedEmails([]);

      // Show modal
      setShowEmailModal(true);

    } catch (error) {
      console.error("❌ Failed to fetch email recipients:", error);

      // Still show modal even if email fetch fails
      setShowEmailModal(true);
    }
  };

  // Unified handler for sending emails
  const handleUnifiedSendEmail = async (selectedEmails) => {
    if (updateType === 'regular') {
      await handleSendEmail(selectedEmails);
    } else if (updateType === 'amendment') {
      await handleAmendmentEmail(selectedEmails);
    }

    // Reset states
    setUpdateType('');
    setCurrentProcessForUpdate(null);
  };

  const handleSendEmail = async (selectedEmails) => {
    const storeInfo = currentProcessForUpdate || storeData.find(item => item.PROCESS === selectedProcess?.PROCESS);

    if (!storeInfo?.APPLY_DT || !storeInfo?.DOC_PATH || !storeInfo?.COMMENTS) {
      await Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please ensure Apply Date, Document, and Comments are all available before updating.'
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Updating...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await axios.post(`${API_BASE_URL}/pollution-update`, {
        loc: selectedPlant,
        process: storeInfo.PROCESS,
        applyDate: storeInfo.APPLY_DT,
        documentPath: storeInfo.DOC_PATH,
        comments: storeInfo.COMMENTS,
        emails: selectedEmails
      });

      Swal.close();
      setHeaderData("");

      await Swal.fire({
        icon: 'success',
        title: 'Update Successful',
        text: `${storeInfo.PROCESS} has been updated successfully.`,
        timer: 2000,
        showConfirmButton: false
      });

      // Re-fetch and re-process store data to get updated logs
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
      console.error('Update failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Something went wrong while updating. Please try again.'
      });
    }
  };

  const handleAmendmentEmail = async (selectedEmails) => {
    const storeInfo = currentProcessForUpdate || storeData.find(item => item.PROCESS === selectedAmendProcess);
    const docPathKey = `${selectedAmendCategory}_DOC_PATH`;
    const commentsKey = `${selectedAmendCategory}_COMMENTS`;
    const endpoint = `${API_BASE_URL}/amendment-update`;

    try {
      Swal.fire({
        title: 'Updating Amendment...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await axios.post(endpoint, {
        loc: selectedPlant,
        process: storeInfo.PROCESS,
        category: selectedAmendCategory,
        applyDate: formatDate(storeInfo.APPLY_DT),
        documentPath: storeInfo[docPathKey],
        comments: storeInfo[commentsKey] || '',
        emails: selectedEmails
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


  const formatDate = (date) => {
  if (!date) return "";

  // Split date & time safely
  const [fullDate, time] = date.split(" ");

  const [y, m, d] = fullDate.split("-");

  // If no time → return only date
  return time ? `${d}-${m}-${y} ${time}` : `${d}-${m}-${y}`;
};


  return (
    <>
      <PlantSelector
        plants={plants}
        selectedPlant={selectedPlant}
        onChange={handlePlantChange}
        customMarginTop="-10px"
      />
      <div className='mt-1'>
        <ProjectInfoHeader data={headerData} />
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

                  {/* Amendment columns - two columns per category */}
                  {amendCategories?.map(cat => (
                    <React.Fragment key={cat}>
                      <th style={{ whiteSpace: 'nowrap' }}>{cat} DOC</th>
                      <th style={{ whiteSpace: 'nowrap' }}>{cat} LOGS</th>
                      <th style={{ whiteSpace: 'nowrap' }}>{cat} ACTION</th>
                    </React.Fragment>
                  ))}

                  {/* Individual amendment log columns - only show if they have data */}
                  {/* {storeData.some(item => item.AMEND1_COMMENTS) && <th style={{ whiteSpace: 'nowrap' }}>AMD1 LOGS</th>}
                  {storeData.some(item => item.AMEND2_COMMENTS) && <th style={{ whiteSpace: 'nowrap' }}>AMD2 LOGS</th>}
                  {storeData.some(item => item.AMEND3_COMMENTS) && <th style={{ whiteSpace: 'nowrap' }}>AMD3 LOGS</th>}
                  {storeData.some(item => item.AMEND4_COMMENTS) && <th style={{ whiteSpace: 'nowrap' }}>AMD4 LOGS</th>}
                  {storeData.some(item => item.AMEND5_COMMENTS) && <th style={{ whiteSpace: 'nowrap' }}>AMD5 LOGS</th>} */}
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
                        {formatDate(storeInfo?.APPLY_DT)}
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
                            // placement="top"
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

                                // Show email modal for regular update
                                showEmailModalForUpdate('regular', storeInfo);
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

                     {/* Amendment columns - grouped as DOC, LOGS, ACTION */}
                      {amendCategories?.map(cat => {
                        const docPathKey = `${cat}_DOC_PATH`;
                        const docNameKey = `${cat}_DOC_NAME`;
                        const statusKey = `${cat}_STATUS`;
                        const commentsKey = `${cat}_COMMENTS`;

                        const hasDocs = storeInfo?.[docPathKey];
                        const isAmendUpdated = storeInfo?.[statusKey] === 'YES';
                        const hasComments = storeInfo?.[commentsKey];

                        return (
                          <React.Fragment key={cat}>
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
                                                date: log.date || storeInfo?.[`${cat}_APPLY_DT`] || 'N/A',
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
                                <button className="btn btn-success btn-sm" disabled>
                                  Updated
                                </button>
                              ) : hasDocs ? (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => {
                                    // Show email modal for amendment update
                                    showEmailModalForUpdate('amendment', storeInfo, cat);
                                  }}
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

                      {/* AMD1 Logs Column */}
                      {/* {storeData.some(item => item.AMEND1_COMMENTS) && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {storeInfo?.AMEND1_COMMENTS ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-amend1-logs-${row.PROCESS}`} className="btn btn-outline-info btn-sm">
                                  View Amendment 1 Comments
                                </Tooltip>
                              }
                            >
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => {
                                  const amendLogs = [];
                                  const comments = storeInfo?.AMEND1_COMMENTS;

                                  if (comments) {
                                    try {
                                      const parsedComments = JSON.parse(comments);
                                      if (Array.isArray(parsedComments)) {
                                        parsedComments.forEach(log => {
                                          amendLogs.push({
                                            date: log.date || storeInfo?.AMEND1_APPLY_DT || 'N/A',
                                            comment: log.comment || 'No comment',
                                            type: 'Amendment 1'
                                          });
                                        });
                                      } else if (typeof parsedComments === 'string') {
                                        amendLogs.push({
                                          date: storeInfo?.AMEND1_APPLY_DT || 'N/A',
                                          comment: parsedComments,
                                          type: 'Amendment 1'
                                        });
                                      }
                                    } catch (e) {
                                      amendLogs.push({
                                        date: storeInfo?.AMEND1_APPLY_DT || 'N/A',
                                        comment: comments,
                                        type: 'Amendment 1'
                                      });
                                    }
                                  }

                                  if (amendLogs.length > 0) {
                                    setLogModalTitle(`${row.PROCESS} - Amendment 1 Comments`);
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
                      )} */}

                      {/* AMD2 Logs Column */}
                      {/* {storeData.some(item => item.AMEND2_COMMENTS) && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {storeInfo?.AMEND2_COMMENTS ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-amend2-logs-${row.PROCESS}`} className="custom-tooltip">
                                  View Amendment 2 Comments
                                </Tooltip>
                              }
                            >
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => {
                                  const amendLogs = [];
                                  const comments = storeInfo?.AMEND2_COMMENTS;

                                  if (comments) {
                                    try {
                                      const parsedComments = JSON.parse(comments);
                                      if (Array.isArray(parsedComments)) {
                                        parsedComments.forEach(log => {
                                          amendLogs.push({
                                            date: log.date || storeInfo?.AMEND2_APPLY_DT || 'N/A',
                                            comment: log.comment || 'No comment',
                                            type: 'Amendment 2'
                                          });
                                        });
                                      } else if (typeof parsedComments === 'string') {
                                        amendLogs.push({
                                          date: storeInfo?.AMEND2_APPLY_DT || 'N/A',
                                          comment: parsedComments,
                                          type: 'Amendment 2'
                                        });
                                      }
                                    } catch (e) {
                                      amendLogs.push({
                                        date: storeInfo?.AMEND2_APPLY_DT || 'N/A',
                                        comment: comments,
                                        type: 'Amendment 2'
                                      });
                                    }
                                  }

                                  if (amendLogs.length > 0) {
                                    setLogModalTitle(`${row.PROCESS} - Amendment 2 Comments`);
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
                      )} */}

                      {/* AMD3 Logs Column */}
                      {/* {storeData.some(item => item.AMEND3_COMMENTS) && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {storeInfo?.AMEND3_COMMENTS ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-amend3-logs-${row.PROCESS}`} className="custom-tooltip">
                                  View Amendment 3 Comments
                                </Tooltip>
                              }
                            >
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => {
                                  const amendLogs = [];
                                  const comments = storeInfo?.AMEND3_COMMENTS;

                                  if (comments) {
                                    try {
                                      const parsedComments = JSON.parse(comments);
                                      if (Array.isArray(parsedComments)) {
                                        parsedComments.forEach(log => {
                                          amendLogs.push({
                                            date: log.date || storeInfo?.AMEND3_APPLY_DT || 'N/A',
                                            comment: log.comment || 'No comment',
                                            type: 'Amendment 3'
                                          });
                                        });
                                      } else if (typeof parsedComments === 'string') {
                                        amendLogs.push({
                                          date: storeInfo?.AMEND3_APPLY_DT || 'N/A',
                                          comment: parsedComments,
                                          type: 'Amendment 3'
                                        });
                                      }
                                    } catch (e) {
                                      amendLogs.push({
                                        date: storeInfo?.AMEND3_APPLY_DT || 'N/A',
                                        comment: comments,
                                        type: 'Amendment 3'
                                      });
                                    }
                                  }

                                  if (amendLogs.length > 0) {
                                    setLogModalTitle(`${row.PROCESS} - Amendment 3 Comments`);
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
                      )} */}

                      {/* AMD4 Logs Column */}
                      {/* {storeData.some(item => item.AMEND4_COMMENTS) && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {storeInfo?.AMEND4_COMMENTS ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-amend4-logs-${row.PROCESS}`} className="custom-tooltip">
                                  View Amendment 4 Comments
                                </Tooltip>
                              }
                            >
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => {
                                  const amendLogs = [];
                                  const comments = storeInfo?.AMEND4_COMMENTS;

                                  if (comments) {
                                    try {
                                      const parsedComments = JSON.parse(comments);
                                      if (Array.isArray(parsedComments)) {
                                        parsedComments.forEach(log => {
                                          amendLogs.push({
                                            date: log.date || storeInfo?.AMEND4_APPLY_DT || 'N/A',
                                            comment: log.comment || 'No comment',
                                            type: 'Amendment 4'
                                          });
                                        });
                                      } else if (typeof parsedComments === 'string') {
                                        amendLogs.push({
                                          date: storeInfo?.AMEND4_APPLY_DT || 'N/A',
                                          comment: parsedComments,
                                          type: 'Amendment 4'
                                        });
                                      }
                                    } catch (e) {
                                      amendLogs.push({
                                        date: storeInfo?.AMEND4_APPLY_DT || 'N/A',
                                        comment: comments,
                                        type: 'Amendment 4'
                                      });
                                    }
                                  }

                                  if (amendLogs.length > 0) {
                                    setLogModalTitle(`${row.PROCESS} - Amendment 4 Comments`);
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
                      )} */}

                      {/* AMD5 Logs Column */}
                      {/* {storeData.some(item => item.AMEND5_COMMENTS) && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {storeInfo?.AMEND5_COMMENTS ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-amend5-logs-${row.PROCESS}`} className="custom-tooltip">
                                  View Amendment 5 Comments
                                </Tooltip>
                              }
                            >
                              <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={() => {
                                  const amendLogs = [];
                                  const comments = storeInfo?.AMEND5_COMMENTS;

                                  if (comments) {
                                    try {
                                      const parsedComments = JSON.parse(comments);
                                      if (Array.isArray(parsedComments)) {
                                        parsedComments.forEach(log => {
                                          amendLogs.push({
                                            date: log.date || storeInfo?.AMEND5_APPLY_DT || 'N/A',
                                            comment: log.comment || 'No comment',
                                            type: 'Amendment 5'
                                          });
                                        });
                                      } else if (typeof parsedComments === 'string') {
                                        amendLogs.push({
                                          date: storeInfo?.AMEND5_APPLY_DT || 'N/A',
                                          comment: parsedComments,
                                          type: 'Amendment 5'
                                        });
                                      }
                                    } catch (e) {
                                      amendLogs.push({
                                        date: storeInfo?.AMEND5_APPLY_DT || 'N/A',
                                        comment: comments,
                                        type: 'Amendment 5'
                                      });
                                    }
                                  }

                                  if (amendLogs.length > 0) {
                                    setLogModalTitle(`${row.PROCESS} - Amendment 5 Comments`);
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
                      )} */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DocumentModal
        show={showDocModal}
        onClose={() => setShowDocModal(false)}
        title={modalTitle}
        docs={modalDocs}
             isUpdated={true}
      />

      <EmailSelectionModal
        show={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setUpdateType('');
          setCurrentProcessForUpdate(null);
        }}
        emailRecipients={emailRecipients}
        selectedEmails={selectedEmails}
        setSelectedEmails={setSelectedEmails}
        onSendEmail={handleUnifiedSendEmail}
        modalData={{
          ...(updateType === 'regular' ? currentProcessForUpdate : {}),
          ...(updateType === 'amendment' ? {
            process: selectedAmendProcess,
            category: selectedAmendCategory
          } : {}),
          updateType: updateType
        }}
      />

      <DocumentModal
        show={showAmendDocModal}
        onClose={() => setShowAmendDocModal(false)}
        title={amendDocTitle}
        docs={amendModalDocs}
        isAmendment={true}
      />

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
                        <strong className="text-muted me-2">{formatDate(log.date)}:</strong>
                        {log.type && (
                          <span className="badge bg-info me-2">{log.type}</span>
                        )}
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

