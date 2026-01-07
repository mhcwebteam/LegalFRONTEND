import React, { useState } from 'react';
import '../pages/Water.css';
import { FileList } from './FileList';

const PollutionDocUploadModal = ({
  show,
  onClose,
  files = [],
  setFiles,
  title = "Upload Documents"
}) => {
  // Error popup state
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  // File size limit constant (1MB)
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

  if (!show) return null;

  // Error Popup Component
  const ErrorPopup = () => {
    if (!showError) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Error Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            border: '4px solid #ef5350',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="#ef5350" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '12px'
          }}>
            Invalid File Type
          </h3>

          {/* Message */}
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            File size should not be Larger!
          </p>

          {/* OK Button */}
          <button
            onClick={() => setShowError(false)}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 40px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  // Updated handleFilesAppend with file size validation
  const handleFilesAppend = (e) => {
    if (e.target.files) {
      const incomingFiles = Array.from(e.target.files);
      
      // Check for files larger than 1MB
      const oversizedFiles = incomingFiles.filter(file => file.size > MAX_FILE_SIZE);
      
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(', ');
        setErrorMessage(
          `The following files exceed 1MB limit: ${fileNames}. Please select smaller files.`
        );
        setShowError(true);
        e.target.value = '';
        return;
      }
      
      setFiles(prevFiles => [...prevFiles, ...incomingFiles]);
      e.target.value = '';
    }
  };

  // Removes a file from the list by its index
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Error Popup */}
      <ErrorPopup />

      <div className="custom-modal-overlay">
        <div className="custom-modal">
          <h5 className="mb-4 border-bottom pb-2">{title}</h5>

          {/* --- SINGLE FILE UPLOAD SECTION --- */}
          <div className="mb-4">
            <label htmlFor="file-upload-input" className="form-label fw-semibold">
              Choose Files:
            </label>
            <div className="mb-2">
              <input
                type="file"
                multiple
                onChange={handleFilesAppend}
                id="file-upload-input"
                className="form-control"
              />
            </div>
            
            {/* Display the list of selected files */}
            <FileList 
              files={files} 
              onRemove={removeFile} 
            />
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PollutionDocUploadModal;