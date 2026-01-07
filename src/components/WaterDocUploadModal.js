import React, { useState } from 'react'; // 7-1-2026 by rajakumari.m - Added useState for error handling
import '../pages/Water.css';
import { FileList } from './FileList';

const WaterDocUploadModal = ({
  show,
  onClose,
  linkDocs = [],
  setLinkDocs,
  landDocs = [],
  setLandDocs,
  othDocs = [],
  setOthDocs,
  linkLabel = "Plan Doc",
  showLandDocs = true,
  showOthDocs = true,
  title = "Upload Documents"
}) => {
  // 7-1-2026 by rajakumari.m - Added state for error popup
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  
  if (!show) return null;

  // 7-1-2026 by rajakumari.m - Added file size limit constant (1MB)
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

  // 7-1-2026 by rajakumari.m - Updated handleFilesAppend with file size validation
  const handleFilesAppend = (e, setter) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      
      // 7-1-2026 by rajakumari.m - Check for files larger than 1MB
      const oversizedFiles = incoming.filter(file => file.size > MAX_FILE_SIZE);
      
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(', ');
        setErrorMessage(
          `The following files exceed 1MB limit: ${fileNames}. Please select smaller files.`
        );
        setShowError(true);
        e.target.value = '';
        return;
      }
      
      setter(prev => {
        const updated = [...prev, ...incoming];
        console.log('Files updated:', updated.length);
        return updated;
      });
      e.target.value = '';
    }
  };

  // 7-1-2026 by rajakumari.m - Updated ErrorPopup component with centered design
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
        zIndex: 9999
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

  const removeFile = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* 7-1-2026 by rajakumari.m - Added Error Popup */}
      <ErrorPopup />

      <div className="custom-modal-overlay">
        <div className="custom-modal">
          <h5 className="mb-3">{title}</h5>

          {/* LINK DOC SECTION */}
          <div className="mb-4">
            <label htmlFor="link-doc-input" className="form-label fw-semibold">
              {linkLabel}:
            </label>
            <div className="d-flex gap-2 mb-1">
              <input
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={(e) => handleFilesAppend(e, setLinkDocs)}
                id="link-doc-input"
                className="form-control"
              />
            </div>
            <FileList 
              files={linkDocs} 
              onRemove={(i) => removeFile(setLinkDocs, i)} 
            />
          </div>

          {/* TITLE DOC SECTION */}
          {showLandDocs && (
            <div className="mb-4">
              <label htmlFor="land-doc-input" className="form-label fw-semibold">Title Doc:</label>
              <div className="d-flex gap-2 mb-1">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={(e) => handleFilesAppend(e, setLandDocs)}
                  id="land-doc-input"
                  className="form-control"
                />
              </div>
              <FileList 
                files={landDocs} 
                onRemove={(i) => removeFile(setLandDocs, i)} 
              />
            </div>
          )}

          {/* OTHER DOC SECTION */}
          {showOthDocs && (
            <div className="mb-4">
              <label htmlFor="oth-doc-input" className="form-label fw-semibold">Other Doc:</label>
              <div className="d-flex gap-2 mb-1">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={(e) => handleFilesAppend(e, setOthDocs)}
                  id="oth-doc-input"
                  className="form-control"
                />
              </div>
              <FileList 
                files={othDocs} 
                onRemove={(i) => removeFile(setOthDocs, i)} 
              />
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
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

export default WaterDocUploadModal;