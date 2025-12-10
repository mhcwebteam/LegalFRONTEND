import React, { useState } from 'react';
import '../pages/Water.css'; // Assuming you still want this stylesheet
import { FileList } from './FileList'; // Assuming FileList component exists
import Swal from 'sweetalert2'; // ADD THIS IMPORT

const ReraDocUploadModal = ({
  show,
  onClose,
  files = [],     // Generic 'files' prop
  setFiles,     // Generic 'setFiles' prop
  title = "Upload Documents"
}) => {
  const [error, setError] = useState('');
  
  if (!show) return null;

  // Function to validate if file is PDF
  const validatePDF = (file) => {
    const allowedTypes = ['application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF files are allowed';
    }
    
    // Check file size
    if (file.size > maxSize) {
      return 'File size should not exceed 10MB';
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      return 'File must have .pdf extension';
    }
    
    return null; // No error
  };

  // Appends newly selected files to the existing list with PDF validation
  const handleFilesAppend = (e) => {
    setError(''); // Clear previous errors
    
    if (e.target.files && e.target.files.length > 0) {
      const incomingFiles = Array.from(e.target.files);
      const validFiles = [];
      const errors = [];
      
      // Validate each file
      incomingFiles.forEach(file => {
        const validationError = validatePDF(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
        } else {
          validFiles.push(file);
        }
      });
      
      // If there are errors, show them
      if (errors.length > 0) {
        setError(errors.join('<br>'));
        
        // Show error alert
        if (errors.length === 1) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid File',
            html: errors[0],
            confirmButtonText: 'OK'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Files',
            html: errors.join('<br>'),
            confirmButtonText: 'OK'
          });
        }
      }
      
      // Add valid files to the list
      if (validFiles.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...validFiles]);
      }
      
      // Clear the input value to allow re-selecting the same file
      e.target.value = '';
    }
  };

  // Removes a file from the list by its index
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal">
        <h5 className="mb-4 border-bottom pb-2">{title}</h5>

        {/* Error Message Display */}
        {/* {error && (
          <div className="alert alert-danger" role="alert">
            <strong>Upload Error:</strong>
            <div dangerouslySetInnerHTML={{ __html: error }} />
          </div>
        )} */}

        {/* --- SINGLE FILE UPLOAD SECTION --- */}
        <div className="mb-4">
          <label htmlFor="file-upload-input" className="form-label fw-semibold">
            Choose PDF Files:
          </label>
          <div className="mb-2">
            <input
              type="file"
              multiple
              onChange={handleFilesAppend}
              id="file-upload-input"
              className="form-control"
              accept=".pdf,application/pdf" // Restrict to PDF only
            />
          
          </div>
          
          {/* Display the list of selected files */}
          {files.length > 0 ? (
            <>
              <div className="mt-3">
                <strong>Selected PDF Files ({files.length}):</strong>
              </div>
              <FileList 
                files={files} 
                onRemove={removeFile} 
              />
            </>
          ) : (
            <div className="text-muted mt-3">
              No PDF files selected yet
            </div>
          )}
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