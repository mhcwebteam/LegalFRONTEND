import React from 'react';
import '../pages/Water.css'; // Assuming you still want this stylesheet
import { FileList } from './FileList'; // Assuming FileList component exists
import { Button, Form, Modal } from 'react-bootstrap';
import { Trash2 } from 'lucide-react';

const ReraDocUploadModal1 = ({
  show,
  onClose,
  files = [],
  setFiles,     
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
    <Modal 
      show={show} 
      onHide={onClose} 
      centered
      backdrop="static" // Prevents closing when clicking outside
      style={{ zIndex: 1060 }} // Ensures it's above the first modal
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Choose Files:</Form.Label>
          <Form.Control
            type="file"
            multiple
            onChange={handleFilesAppend}
            id="file-upload-input"
          />
        </Form.Group>

        {/* Display the list of selected files */}
        {files.length > 0 && (
          <div className="mb-3">
            <strong>Selected Files ({files.length}):</strong>
            <ul className="list-unstyled mt-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="d-flex justify-content-between align-items-center mb-2 border p-2 rounded"
                >
                  <span>{file.name}</span>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
               <Trash2/>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReraDocUploadModal1;
