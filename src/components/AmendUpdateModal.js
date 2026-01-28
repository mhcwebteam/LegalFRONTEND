
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL, API_DOC_URL } from '../config/Config';
import Swal from 'sweetalert2';
import EmailAmendModal from './EmailAmendModal';

// Helper function to extract latest comment with date (sorted by date descending)
const getLatestComment = (commentsJson) => {
  if (!commentsJson) return { date: '', comment: '' };
  
  try {
    const parsed = JSON.parse(commentsJson);
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Sort by date descending (newest first)
      const sorted = [...parsed].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      // Get the first element (newest)
      const latest = sorted[0];
      return {
        date: latest.date || '',
        comment: latest.comment || latest || ''
      };
    } else if (typeof parsed === 'string') {
      return {
        date: '',
        comment: parsed
      };
    }
  } catch (e) {
    // If parsing fails, return as is
    return {
      date: '',
      comment: commentsJson
    };
  }
  
  return { date: '', comment: '' };
};

// Helper function to format date for input field (YYYY-MM-DD)
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  
  try {
    // Remove time part if exists
    const datePart = dateStr.split(' ')[0];
    
    // Check current format
    if (datePart.includes('-')) {
      const parts = datePart.split('-');
      
      if (parts.length === 3) {
        // Check if it's DD-MM-YYYY or YYYY-MM-DD
        if (parts[0].length === 4) {
          // YYYY-MM-DD format, return as is
          return datePart;
        } else if (parts[2].length === 4) {
          // DD-MM-YYYY format, convert to YYYY-MM-DD
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }
    
    // Try to parse as Date object
    const dateObj = new Date(dateStr);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Error formatting date:', e);
  }
  
  return '';
};

const AmendUpdateModal = ({
  show,
  onClose,
  plant,
  process,
  category,
  storeInfo,
  onSuccess
}) => {
  const [amendData, setAmendData] = useState({
    plant: plant || '',
    process: process || '',
    category: category || '',
    applyDate: '',
    receivedDate: '',
    amendreceivedDate: '',
    amendDate: '',
    commentDate: '',
    commentText: '',
    selectedFiles: [],
    existingDocs: [],
    existingNames: []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAmendRecipients, setEmailAmendRecipients] = useState([]);
  const [selectedAmendEmails, setSelectedAmendEmails] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const fileInputRef = useRef(null);

  
const token = localStorage.getItem('token');
const navigate = useNavigate();

  // Format date for display helper
  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const [fullDate, time] = date.split(" ");
    const [y, m, d] = fullDate.split("-");
    return time ? `${d}-${m}-${y} ${time}` : `${d}-${m}-${y}`;
  };

  // --- 2. Check User Login ---
    useEffect(() => {
      if (!token) {
        navigate('/');
        return;
      }
      const userString = localStorage.getItem('user'); // Changed to 'user' to be safe
      if (userString) {
        try {
          const userObj = JSON.parse(userString);
          setLoggedInUser(userObj);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
      
    }, [token, navigate]);

  // Initialize data when modal opens
  // useEffect(() => {
  //   if (show && storeInfo) {
  //     // Extract existing amendment data based on category
  //     const docPathKey = `${category}_DOC_PATH`;
  //     const docNameKey = `${category}_DOC_NAME`;
  //     const commentsKey = `${category}_COMMENTS`;
  //     const dateKey = `${category}_DATE`;
      
  //     let existingDocs = [];
  //     let existingNames = [];
      
  //     try {
  //       existingDocs = JSON.parse(storeInfo[docPathKey] || '[]');
  //       existingNames = JSON.parse(storeInfo[docNameKey] || '[]');
  //     } catch (e) {
  //       console.error('Error parsing existing docs:', e);
  //     }
      
  //     // Extract the latest comment with date
  //     const latestComment = getLatestComment(storeInfo[commentsKey]);
      
  //      // 1. Check if the main process was ever updated
  //   const isMainUpdated = storeInfo.UPDATED === 'YES';
    
  //   // 2. Format dates
  //   const formattedAmendDate = formatDateForInput(storeInfo[dateKey] || '') || new Date().toISOString().split('T')[0];
  //   const dbApplyDate = formatDateForInput(storeInfo.APPLY_DT || '');
    
  //   // 3. Logic: If main process is NOT updated, use amendment date as apply date
  //   const finalApplyDate = !isMainUpdated ? formattedAmendDate : dbApplyDate;

  //     // Format dates for input fields
  //     const formattedApplyDate = formatDateForInput(storeInfo.APPLY_DT || '');
  //     // const formattedReceivedDate = formatDateForInput(storeInfo.RECEIVED_DT || '');
  //     // const formattedAmendDate = formatDateForInput(storeInfo[dateKey] || '');

  //     const formattedAmendReceivedDate = formatDateForInput(storeInfo[dateKey] || '');

   
      
  //     setAmendData(prev => ({
  //       ...prev,
  //       plant: plant,
  //       process: process,
  //       category: category,
  //       // applyDate: formattedApplyDate,
  //        applyDate: finalApplyDate,
  //       amendreceivedDate: formattedAmendReceivedDate,
  //       amendDate: formattedAmendDate || new Date().toISOString().split('T')[0],
  //       commentDate: latestComment.date,
  //       commentText: latestComment.comment,
  //       existingDocs: existingDocs,
  //       existingNames: existingNames
  //     }));
  // }
  // }, [show, plant, process, category, storeInfo]);


   useEffect(() => {
    if (show && storeInfo) {
      const docPathKey = `${category}_DOC_PATH`;
      const docNameKey = `${category}_DOC_NAME`;
      const commentsKey = `${category}_COMMENTS`;
      const dateKey = `${category}_DATE`;

      // --- NEW LOGIC: Check sequence of previous statuses ---
      const statusSequence = [
        "UPDATED",
        "AMEND1_STATUS",
        "AMEND2_STATUS",
        "AMEND3_STATUS",
        "AMEND4_STATUS",
        "AMEND5_STATUS",
      ];

      // Determine which statuses are "previous" to the current category
      let previousStatusesToCheck = ["UPDATED"];
      if (category.startsWith("AMEND")) {
        const currentLevel = parseInt(category.replace("AMEND", "")); // e.g., "AMEND2" -> 2
        for (let i = 1; i < currentLevel; i++) {
          previousStatusesToCheck.push(`AMEND${i}_STATUS`);
        }
      }

      // Check if ALL previous statuses are empty/null
      const isChainEmpty = previousStatusesToCheck.every(
        (key) =>
          !storeInfo[key] || storeInfo[key] === "" || storeInfo[key] === null,
      );

      // Format dates
      const formattedAmendDate =
        formatDateForInput(storeInfo[dateKey] || "") ||
        new Date().toISOString().split("T")[0];
      const dbApplyDate = formatDateForInput(storeInfo.APPLY_DT || "");

      // If chain is empty, use amendment date as apply date, otherwise use database apply date
      const finalApplyDate = isChainEmpty ? formattedAmendDate : dbApplyDate;
      const formattedAmendReceivedDate = formatDateForInput(
        storeInfo[dateKey] || "",
      );

      // Set existing docs...
      let existingDocs = [],
        existingNames = [];
      try {
        existingDocs = JSON.parse(storeInfo[docPathKey] || "[]");
        existingNames = JSON.parse(storeInfo[docNameKey] || "[]");
      } catch (e) {
        console.error(e);
      }

      const latestComment = getLatestComment(storeInfo[commentsKey]);

      setAmendData((prev) => ({
        ...prev,
        plant,
        process,
        category,
        applyDate: finalApplyDate,
        amendreceivedDate: formattedAmendReceivedDate,
        amendDate: formattedAmendDate,
        commentDate: latestComment.date,
        commentText: latestComment.comment,
        existingDocs,
        existingNames,
      }));
    }
  }, [show, plant, process, category, storeInfo]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!amendData.amendDate) newErrors.amendDate = 'Amendment date is required';
    
    // Validate received date for specific processes
    const receivedDateProcesses = [
      "Received TOR",
      "EC (Environmental Clearance)",
      "Application for CFE",
      "Received CFE"
    ];
    
    if (receivedDateProcesses.includes(amendData.process) && !amendData.amendreceivedDate) {
      newErrors.amendreceivedDate = 'Received date is required for this process';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file upload
  const handleUploadFiles = async () => {
    if (amendData.selectedFiles.length === 0) {
      return { 
        docPath: JSON.stringify(amendData.existingDocs), 
        docName: JSON.stringify(amendData.existingNames) 
      };
    }

    const formData = new FormData();
    amendData.selectedFiles.forEach(file => {
      formData.append('files[]', file);
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/upload-amendment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newDocs = [...amendData.existingDocs, ...response.data.filePaths];
      const newNames = [...amendData.existingNames, ...response.data.fileNames];
      
      return {
        docPath: JSON.stringify(newDocs),
        docName: JSON.stringify(newNames)
      };
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  // Convert date from YYYY-MM-DD to DD-MM-YYYY format for backend
  const convertDateForBackend = (dateStr) => {
    if (!dateStr) return '';
    
    // If already in DD-MM-YYYY format, return as is
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[2].length === 4) {
        // DD-MM-YYYY format
        return `${dateStr}`;
      }
    }
    
    // Convert from YYYY-MM-DD to DD-MM-YYYY
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }
    
    return `${dateStr}`;
  };

  // Prepare comments for submission
  const prepareCommentsForSubmission = () => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
    
    // Get existing comments
    let existingComments = [];
    const existingCommentsJson = storeInfo[`${category}_COMMENTS`];
    
    if (existingCommentsJson) {
      try {
        const parsed = JSON.parse(existingCommentsJson);
        if (Array.isArray(parsed)) {
          existingComments = parsed;
        } else if (typeof parsed === 'string') {
          // Convert old string comment to array format
          existingComments = [{
            date: storeInfo[`${category}_DATE`] || timestamp,
            comment: parsed
          }];
        }
      } catch (e) {
        // If parsing fails, create new array
        existingComments = [{
          date: timestamp,
          comment: existingCommentsJson
        }];
      }
    }
    
    // Add new comment with current date/time
    const newCommentObj = {
      date: timestamp,
      comment: amendData.commentText || 'Updated'
    };
    
    // Add new comment at the beginning
    const allComments = [newCommentObj, ...existingComments];
    
    return JSON.stringify(allComments);
  };

  // Handle submission to show email modal first
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Fetch email recipients first
      const response = await axios.get(`${API_BASE_URL}/pcb-emails`);
      setEmailAmendRecipients(response.data);
      
      // Show email modal
      setShowEmailModal(true);
      
    } catch (error) {
      console.error('Failed to fetch email recipients:', error);
      setShowEmailModal(true);
    }
  };

  // Final submission after email selection
  const handleFinalSubmit = async (selectedEmails) => {
    setLoading(true);
    try {
      const uploadResult = await handleUploadFiles();

       //  const currentUserName = loggedInUser 
      // //  //? (loggedInUser.username || loggedInUser.name || loggedInUser.email || 'Unknown User') 
      //   : 'Unknown User';
      let currentUserName = loggedInUser.username;

      console.log("-----------------------------------------");
      console.log("Submitting with User:", currentUserName);
      console.log("-----------------------------------------");

      const submissionData = {
        loc: plant,
        process: process,
        category: category,
        applyDate: convertDateForBackend(amendData.applyDate) || convertDateForBackend(amendData.amendDate),
        // receivedDate: convertDateForBackend(amendData.receivedDate),
        amendreceivedDate:convertDateForBackend(amendData.amendreceivedDate),
        amendDate: convertDateForBackend(amendData.amendDate),
        documentPath: uploadResult.docPath,
        docName: uploadResult.docName,
        comments: prepareCommentsForSubmission(),
        status: 'YES',
        emails: selectedEmails,
        userName: currentUserName 
      };

     

      console.log("sssssssssssss",submissionData)

     await axios.post(`${API_BASE_URL}/amendment-update`, submissionData);
      
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Amendment updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close both modals
      setShowEmailModal(false);
      onClose();
      
    } catch (error) {
      console.error('Submission failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update amendment. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // List of processes that require received date
const receivedDateProcesses = [
  "Received TOR",
  "EC (Environmetal Clearance)",
  "Application for CFE",
  "Received CFE",
]

  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        dialogClassName="modal-dialog-scrollable"
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Amendment - {category}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* PLANT */}
            <Form.Group className="mb-3">
              <Form.Label>Plant</Form.Label>
              <Form.Control
                type="text"
                value={amendData.plant}
                className="form-control"
                readOnly
              />
            </Form.Group>

            {/* PROCESS */}
            <Form.Group className="mb-3">
              <Form.Label>Process</Form.Label>
              <Form.Control 
                type="text" 
                value={amendData.process} 
                readOnly 
              />
            </Form.Group>

            {/* APPLY DATE - EDITABLE */}
            {/* <Form.Group className="mb-3">
              <Form.Label>
                Apply Date <span style={{ color: "red" }}>*</span>
              </Form.Label>
         
               
                             <Form.Control
                               type="text"
                               value={
                                 amendData?.applyDate
                                   ? convertDateForBackend(amendData.applyDate)
                                   :convertDateForBackend(amendData?.amendDate)
                               }
                               readOnly
                             />
            </Form.Group> */}

            <Form.Group className="mb-3">
  <Form.Label>Apply Date</Form.Label>
  <Form.Control
    type="text"
    value={convertDateForBackend(amendData.applyDate)}
    readOnly
    style={{ backgroundColor: '#e9ecef' }} // Optional: light grey to show it's auto-filled
  />
  {!storeInfo?.UPDATED && (
    <small className="text-muted">
      Setting to Amendment Date because original process is not yet updated.
    </small>
  )}
</Form.Group>

            {/* RECEIVED DATE - EDITABLE (conditional) */}
            {receivedDateProcesses.includes(amendData.process) && (
              <Form.Group className="mb-3">
                <Form.Label>
                 Amendment Received Date <span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={amendData.amendreceivedDate || ""}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setAmendData((prev) => ({ 
                      ...prev, 
                      amendreceivedDate: e.target.value 
                    }))
                  }
                />
                {errors.amendreceivedDate && (
                  <div className="text-danger" style={{ fontSize: "14px" }}>
                    {errors.amendreceivedDate}
                  </div>
                )}
                
              </Form.Group>
            )}

     
            <Form.Group className="mb-3">
              <Form.Label>
                Amendment Date <span style={{ color: "red" }}>*</span>
              </Form.Label>
      { /*   <Form.Control
  type="date"
  value={amendData.amendDate || ""}
  max={new Date().toISOString().split("T")[0]}
   onChange={(e) => {
      const newDate = e.target.value;
      const isMainUpdated = storeInfo?.UPDATED === 'YES';

      setAmendData((prev) => ({
        ...prev,
        amendDate: newDate,
        // SYNC APPLY DATE ONLY IF MAIN PROCESS IS NOT UPDATED
        applyDate: !isMainUpdated ? newDate : prev.applyDate,
      }));
    }}
/>
*/}

<Form.Control
                type="date"
                value={amendData.amendDate || ""}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  const newDate = e.target.value;

                  // Check the chain again for manual changes
                  let previousStatusesToCheck = ["UPDATED"];
                  if (category.startsWith("AMEND")) {
                    const currentLevel = parseInt(
                      category.replace("AMEND", ""),
                    );
                    for (let i = 1; i < currentLevel; i++) {
                      previousStatusesToCheck.push(`AMEND${i}_STATUS`);
                    }
                  }

                  const isChainEmpty = previousStatusesToCheck.every(
                    (key) =>
                      !storeInfo[key] ||
                      storeInfo[key] === "" ||
                      storeInfo[key] === null,
                  );

                  setAmendData((prev) => ({
                    ...prev,
                    amendDate: newDate,
                    // If the chain is empty, sync the apply date to the new amendment date
                    applyDate: isChainEmpty ? newDate : prev.applyDate,
                  }));
                }}
              />

              {errors.amendDate && (
                <div className="text-danger" style={{ fontSize: "14px" }}>
                  {errors.amendDate}
                </div>
              )}
      
            </Form.Group>

            {/* CATEGORY */}
            <Form.Group className="mb-3">
              <Form.Label>Amendment Category</Form.Label>
              <Form.Control 
                type="text" 
                value={amendData.category} 
                readOnly 
              />
            </Form.Group>

            {/* LATEST COMMENT */}
            <Form.Group className="mb-3">
              <Form.Label>Amendment Comment</Form.Label>
              
              {/* Show date above comment */}
              {amendData.commentDate && (
                <div className="mb-2 p-2 bg-light rounded">
                  <small className="text-muted d-block">
                    <strong>Date:</strong> {formatDateForDisplay(amendData.commentDate)}
                  </small>
                </div>
              )}
              
              <Form.Control
                as="textarea"
                rows={3}
                value={amendData.commentText}
                onChange={(e) =>
                  setAmendData((prev) => ({
                    ...prev,
                    commentText: e.target.value,
                  }))
                }
               readOnly
              />
           
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              "Update Amendment"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Email Selection Modal */}
      <EmailAmendModal
        show={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setSelectedAmendEmails([]);
        }}
        emailAmendRecipients={emailAmendRecipients}
        selectedAmendEmails={selectedAmendEmails}
        setSelectedAmendEmails={setSelectedAmendEmails}
        onSendAmendEmail={handleFinalSubmit}
        modalData={{
          ...amendData,
          plant,
          process,
          category
        }}
        loading={loading}
      />
    </>
  );
};

export default AmendUpdateModal;