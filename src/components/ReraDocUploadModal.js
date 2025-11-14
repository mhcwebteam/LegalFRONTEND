import React from 'react';
import '../pages/Water.css'; // Assuming you still want this stylesheet
import { FileList } from './FileList'; // Assuming FileList component exists

const ReraDocUploadModal = ({
  show,
  onClose,
  files = [],     // Generic 'files' prop
  setFiles,     // Generic 'setFiles' prop
  title = "Upload Documents"
}) => {
  if (!show) return null;

  // Appends newly selected files to the existing list
  const handleFilesAppend = (e) => {
    if (e.target.files) {
      const incomingFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...incomingFiles]);
      // Clear the input value to allow re-selecting the same file
      e.target.value = '';
    }
  };

  // Removes a file from the list by its index
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="custom-modal-overlay" >
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
              multiple // Allows selecting multiple files
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
  );
};

export default ReraDocUploadModal;
