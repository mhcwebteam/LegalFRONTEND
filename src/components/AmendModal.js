import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { API_DOC_URL } from '../config/Config';
import { useRef } from 'react';
import Swal from 'sweetalert2';

const AmendModal = ({ show, onClose, amendData, setAmendData, onSubmit, onDeleteFile }) => {
const fileInputRef = useRef(null);
  

const handleDeleteFile = async (docPath, idx) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this file?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;

  try {
    await onDeleteFile(docPath);

    setAmendData(prev => {
      const updatedDocs = [...prev.existingDocs];
      const updatedNames = [...prev.existingNames];
      updatedDocs.splice(idx, 1);
      updatedNames.splice(idx, 1);
      return { ...prev, existingDocs: updatedDocs, existingNames: updatedNames };
    });

    await Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: 'File deleted successfully.',
    });
  } catch (err) {
    console.error('Delete failed', err);
    await Swal.fire({
      icon: 'error',
      title: 'Failed',
      text: 'Failed to delete the file. Please try again later.',
    });
  }
};


  return (
    <Modal show={show} onHide={onClose} dialogClassName="amend-modal-lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Amend Process Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* PLANT */}
          <Form.Group className="mb-3">
            <Form.Label>Plant</Form.Label>
            <Form.Control type="text" value={amendData.plant} className="form-control"
             readOnly />
          </Form.Group>

          {/* PROCESS */}
          <Form.Group className="mb-3">
            <Form.Label>Process</Form.Label>
            <Form.Control type="text" value={amendData.process} 
            readOnly />
          </Form.Group>

          {/* APPLY DATE */}
          <Form.Group className="mb-3">
            <Form.Label>Apply Date</Form.Label>
            <Form.Control type="text" value={amendData.applyDate} 
               readOnly />
          </Form.Group>

          {/* AMENDMENT DATE */}
          <Form.Group className="mb-3">
            <Form.Label>Amendment Date</Form.Label>
            <Form.Control
              type="date"
              value={amendData.amendDate}
              onChange={(e) =>
                setAmendData((prev) => ({ ...prev, amendDate: e.target.value }))
              }
            />
          </Form.Group>

          {/* CATEGORY */}
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control type="text" value={amendData.category}  
            readOnly />
          </Form.Group>

          {/* NEW - AMENDMENT DROPDOWN LIST */}
          <Form.Group className="mb-3">
            <Form.Label>
              Amendment Dropdown List <span style={{ color: 'red' }}>*</span>
            </Form.Label>
            <Form.Select
              value={amendData.amendDecision || 'Yes'}
              onChange={(e) =>
                setAmendData((prev) => ({ ...prev, amendDecision: e.target.value }))
              }
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
          </Form.Group>

          {/* PREVIOUSLY UPLOADED FILES */}
          {/* <div className="mb-3">
            <strong>Previously Uploaded Amendment Files:</strong>
            <ul className="mb-2">
              {amendData.existingDocs.map((docPath, idx) => {
                const cleanedPath = docPath.replace(/[[\]'"%]/g, '').trim();
                const displayName =
                  amendData.existingNames[idx]?.trim() || `Document ${idx + 1}`;
                return (
                  <li key={idx}>
                    <a
                      href={`${API_DOC_URL}/storage/${cleanedPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {displayName}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div> */}

          <div className="mb-3">
            <strong>Previously Uploaded Amendment Files:</strong>
            <ul className="mb-2 list-unstyled">
              {amendData.existingDocs.map((docPath, idx) => {
                const cleanedPath = docPath.replace(/[[\]'"%]/g, '').trim();
                const displayName = amendData.existingNames[idx]?.trim() || `Document ${idx + 1}`;

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

          {/* UPLOAD DOCUMENT */}
          <Form.Group className="mb-3">
            <Form.Label>
              Upload Document{' '}
              {amendData.amendDecision === 'Yes' && (
                <span style={{ color: 'red' }}>*</span>
              )}
            </Form.Label>
            <Form.Control
              type="file"
              multiple
      className="form-control"
              ref={fileInputRef} // ✅ use ref
              onChange={(e) => {
                const files = Array.from(e.target.files);
                if (files.length > 0) {
                  setAmendData((prev) => ({
                    ...prev,
                    selectedFiles: [...prev.selectedFiles, ...files],
                  }));
                  fileInputRef.current.value = null; // ✅ clear file input
                }
              }}
            />
          </Form.Group>


          {amendData.selectedFiles.length > 0 && (
            <div className="mb-2">
              <strong>Files to Upload:</strong>
              <ul className="list-unstyled">
                {amendData.selectedFiles.map((file, index) => (
                  <li key={index} className="d-flex justify-content-between align-items-center border p-2 rounded mb-1">
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
                        fileInputRef.current.value = null; // ✅ clear file input
                      }}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* PREVIOUS COMMENTS */}
          <Form.Group className="mb-3">
            <Form.Label>Previous Comments</Form.Label>
            <Form.Control
              as="textarea"
      className="form-control"
              rows={3}
              value={amendData.oldComments || ''}
              readOnly
              style={{ backgroundColor: '#f9f9f9' }}
            />
          </Form.Group>

          {/* NEW COMMENTS */}
          <Form.Group className="mb-3">
            <Form.Label>
              New Comments{' '}
              {amendData.amendDecision === 'Yes' && (
                <span style={{ color: 'red' }}>*</span>
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
              placeholder="Enter your amendment remarks"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          Submit Amendment
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AmendModal;
