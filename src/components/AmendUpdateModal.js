
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Toast } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL, API_DOC_URL } from '../config/Config';

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
    amendDate: '',
    amendDecision: 'Yes',
    comments: '',
    selectedFiles: [],
    existingDocs: [],
    existingNames: []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Format date helper
  const formatDate = (date) => {
    if (!date) return "";
    const [fullDate, time] = date.split(" ");
    const [y, m, d] = fullDate.split("-");
    return time ? `${d}-${m}-${y} ${time}` : `${d}-${m}-${y}`;
  };

  // Initialize data when modal opens
  useEffect(() => {
    if (show && storeInfo) {
      // Extract existing amendment data based on category
      const docPathKey = `${category}_DOC_PATH`;
      const docNameKey = `${category}_DOC_NAME`;
      const commentsKey = `${category}_COMMENTS`;
      const dateKey = `${category}_DATE`;
      
      let existingDocs = [];
      let existingNames = [];
      
      try {
        existingDocs = JSON.parse(storeInfo[docPathKey] || '[]');
        existingNames = JSON.parse(storeInfo[docNameKey] || '[]');
      } catch (e) {
        console.error('Error parsing existing docs:', e);
      }
      
      setAmendData(prev => ({
        ...prev,
        plant: plant,
        process: process,
        category: category,
        applyDate: storeInfo.APPLY_DT || '',
        receivedDate: storeInfo.RECEIVED_DT || '',
        amendDate: storeInfo[dateKey] || new Date().toISOString().split('T')[0],
        comments: storeInfo[commentsKey] || '',
        existingDocs: existingDocs,
        existingNames: existingNames
      }));
    }
  }, [show, plant, process, category, storeInfo]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (amendData.amendDecision === 'Yes') {
      if (!amendData.amendDate) newErrors.amendDate = 'Amendment date is required';
      if (!amendData.comments.trim()) newErrors.comments = 'Comments are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file upload
  const handleUploadFiles = async () => {
    if (amendData.selectedFiles.length === 0) {
      return { docPath: JSON.stringify(amendData.existingDocs), docName: JSON.stringify(amendData.existingNames) };
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

  // Handle submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Upload files if any
      const uploadResult = await handleUploadFiles();
      
      // Prepare data for submission
      const submissionData = {
        loc: plant,
        process: process,
        category: category,
        applyDate: storeInfo.APPLY_DT,
        receivedDate: amendData.receivedDate || storeInfo.RECEIVED_DT,
        amendDate: amendData.amendDate,
        documentPath: uploadResult.docPath,
        docName: uploadResult.docName,
        comments: amendData.comments,
        status: amendData.amendDecision === 'Yes' ? 'YES' : 'NO'
      };

      // Send to backend
      await axios.post(`${API_BASE_URL}/amendment-update`, submissionData);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to update amendment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete file
  const handleDeleteFile = (docPath, index) => {
    const updatedDocs = [...amendData.existingDocs];
    const updatedNames = [...amendData.existingNames];
    
    updatedDocs.splice(index, 1);
    updatedNames.splice(index, 1);
    
    setAmendData(prev => ({
      ...prev,
      existingDocs: updatedDocs,
      existingNames: updatedNames
    }));
  };

  // List of processes that require received date
  const receivedDateProcesses = [
    "Comply EC conditions and submit half yearly returns and compliance Reports"
    // Add other processes if needed
  ];

  return (
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

          {/* APPLY DATE */}
          <Form.Group className="mb-3">
            <Form.Label>Original Apply Date</Form.Label>
            <Form.Control 
              type="text" 
              value={formatDate(amendData.applyDate)} 
              readOnly 
            />
          </Form.Group>

          {/* RECEIVED DATE (conditional) */}
          {receivedDateProcesses.includes(amendData.process) && (
            <Form.Group className="mb-3">
              <Form.Label>Received Date</Form.Label>
              <Form.Control
                type="date"
                value={amendData.receivedDate}
                onChange={(e) =>
                  setAmendData((prev) => ({ 
                    ...prev, 
                    receivedDate: e.target.value 
                  }))
                }
              />
            </Form.Group>
          )}

          {/* AMENDMENT DATE */}
          <Form.Group className="mb-3">
            <Form.Label>
              Amendment Date
              {amendData.amendDecision === "Yes" && (
                <span style={{ color: "red" }}>*</span>
              )}
            </Form.Label>
            <Form.Control
              type="date"
              value={amendData.amendDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setAmendData((prev) => ({
                  ...prev,
                  amendDate: e.target.value,
                }))
              }
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

          {/* AMENDMENT DECISION */}
          <Form.Group className="mb-3">
            <Form.Label>
              Amendment Decision <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Select
              value={amendData.amendDecision}
              onChange={(e) =>
                setAmendData((prev) => ({
                  ...prev,
                  amendDecision: e.target.value,
                }))
              }
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
          </Form.Group>

          {/* EXISTING DOCUMENTS */}
          {amendData.existingDocs.length > 0 && (
            <div className="mb-3">
              <strong>Previously Uploaded Documents:</strong>
              <ul className="mb-2 list-unstyled">
                {amendData.existingDocs.map((docPath, idx) => {
                  const cleanedPath = docPath.replace(/[[\]'"%]/g, "").trim();
                  const displayName =
                    amendData.existingNames[idx]?.trim() ||
                    `Document ${idx + 1}`;
                  
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
                        onClick={() => handleDeleteFile(docPath, idx)}
                      >
                        Delete
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* UPLOAD NEW DOCUMENTS */}
          <Form.Group className="mb-3">
            <Form.Label>Upload Additional Documents (PDF Only)</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="application/pdf"
              ref={fileInputRef}
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const invalidFiles = files.filter(
                  (file) => file.type !== "application/pdf"
                );

                if (invalidFiles.length > 0) {
                  alert("Only PDF files are allowed!");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                  }
                  return;
                }

                setAmendData((prev) => ({
                  ...prev,
                  selectedFiles: [...prev.selectedFiles, ...files],
                }));

                if (fileInputRef.current) {
                  fileInputRef.current.value = null;
                }
              }}
            />
          </Form.Group>

          {/* FILES TO UPLOAD LIST */}
          {amendData.selectedFiles.length > 0 && (
            <div className="mb-3">
              <strong>New Files to Upload:</strong>
              <ul className="list-unstyled">
                {amendData.selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className="d-flex justify-content-between align-items-center border p-2 rounded mb-1"
                  >
                    <span>{file.name}</span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        const updatedFiles = [...amendData.selectedFiles];
                        updatedFiles.splice(index, 1);
                        setAmendData((prev) => ({
                          ...prev,
                          selectedFiles: updatedFiles,
                        }));
                      }}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* COMMENTS */}
          <Form.Group className="mb-3">
            <Form.Label>
              Amendment Comments
              {amendData.amendDecision === "Yes" && (
                <span style={{ color: "red" }}>*</span>
              )}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={amendData.comments}
              onChange={(e) =>
                setAmendData((prev) => ({
                  ...prev,
                  comments: e.target.value,
                }))
              }
              placeholder="Enter amendment comments..."
            />
            {errors.comments && (
              <div className="text-danger" style={{ fontSize: "14px" }}>
                {errors.comments}
              </div>
            )}
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
              Updating...
            </>
          ) : (
            "Update Amendment"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AmendUpdateModal;