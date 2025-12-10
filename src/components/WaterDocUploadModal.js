import React from 'react';
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
  if (!show) return null;

const handleFilesAppend = (e, setter) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      setter(prev => {
        const updated = [...prev, ...incoming];
        console.log('Files updated:', updated.length);
        return updated;
      });
      e.target.value = '';
    }
  };



  const removeFile = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  return (
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
  );
};
 export default WaterDocUploadModal;