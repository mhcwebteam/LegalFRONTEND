


import { Card, ListGroup, Button, Modal } from "react-bootstrap";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import React, { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import axios from "axios";
import Swal from "sweetalert2";

const PreviousGhmcDocs = ({ docsData, loc, process, type = "view" }) => {
  console.log('docsData:', docsData, 'type:', type);

  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedDocs, setDeletedDocs] = useState([]); // Track deleted docs locally

  let logs = [];

  try {
    const parsed = JSON.parse(docsData?.LOG);
    logs = Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    console.error("Invalid LOG JSON:", e);
    logs = [];
  }

  if (!docsData) {
    return (
      <Card className="p-3">
        <p className="text-muted text-center mb-0">No uploaded documents</p>
      </Card>
    );
  }

  const tower = docsData?.tower_docs || [];
  const feas = docsData?.feas_docs || [];
  const amount = docsData?.amount_docs || [];

  // Check if we're in modify mode (should show delete buttons)
  const isModifyMode = type === "modify";

  // Filter out locally deleted documents
  const filterDeletedDocs = (list, docType) => {
    return list.filter(doc => {
      const filenameToDisplay = doc.name || (typeof doc.path === 'string' ? doc.path.split("/").pop() : '');
      return !deletedDocs.some(deleted => 
        deleted.fileName === filenameToDisplay && deleted.docType === docType
      );
    });
  };

  const filteredTower = filterDeletedDocs(tower, "TOWER_DOCS");
  const filteredFeas = filterDeletedDocs(feas, "FEAS_DOCS");
  const filteredAmount = filterDeletedDocs(amount, "AMOUNT_DOCS");

  // Handle delete confirmation
  const handleDeleteClick = (doc, docType) => {
    const filenameToDisplay = doc.name || (typeof doc.path === 'string' ? doc.path.split("/").pop() : '');
    setDocToDelete({ 
      ...doc, 
      docType,
      displayName: filenameToDisplay 
    });
    setDeleteConfirmOpen(true);
  };

  // Confirm and execute delete
  const confirmDelete = async () => {
    if (!docToDelete) return;

    setIsDeleting(true);
    
    try {
      // Add to locally deleted docs immediately for instant UI update
      setDeletedDocs(prev => [...prev, {
        fileName: docToDelete.displayName,
        docType: docToDelete.docType
      }]);

      await axios.delete(`${API_BASE_URL}/deleteGhmcDoc`, {
        data: {
          loc: loc || docsData?.loc,
          process: process || docsData?.PROCESS,
          doc_type: docToDelete.docType,
          file_name: docToDelete.displayName
        }
      });

      // Show success alert
      Swal.fire({
        title: 'Deleted!',
        text: 'Document has been deleted successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });

    } catch (error) {
      console.error("Deletion failed:", error);
      
      // Remove from locally deleted docs if deletion failed
      setDeletedDocs(prev => prev.filter(doc => 
        !(doc.fileName === docToDelete.displayName && doc.docType === docToDelete.docType)
      ));
      
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to delete document',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setDocToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDocToDelete(null);
  };

  const renderList = (list, title, docType) => {
    const filteredList = filterDeletedDocs(list, docType);
    
    if (!filteredList.length) return null;

    return (
      <div className="mb-3">
        <h6 className="mb-2 text-warning">{title}</h6>
        <ListGroup variant="flush">
          {filteredList.map((doc, idx) => {
            const filenameToDisplay = doc.name || (typeof doc.path === 'string' ? doc.path.split("/").pop() : `file-${idx + 1}`);
            const path = doc.path || (typeof doc === 'string' ? doc : '');
            const href = `${API_DOC_URL}/storage/${path}`;

            if (!path) {
              console.warn(`Document item at index ${idx} in ${title} has no valid path:`, doc);
              return null;
            }

            return (
              <ListGroup.Item
                key={`${docType}-${idx}`}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  <BoxArrowUpRight className="me-3" color="royalblue" size={20} />
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none fw-bold"
                  >
                    {filenameToDisplay}
                  </a>
                </div>

                {/* Show delete button only in modify mode */}
                {isModifyMode && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteClick({ 
                      name: filenameToDisplay, 
                      path 
                    }, docType)}
                    title="Delete document"
                    disabled={isDeleting}
                  >
                    <FaTrashAlt />
                  </Button>
                )}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </div>
    );
  };

  return (
    <div className="d-flex flex-column" style={{ height: '100%' }}>
      <Card className="p-3 mb-2" style={{ height: '80%', overflow: 'auto' }}>
        <h6 className="text-center mb-3">
          Previously Uploaded Documents
          <span className="ms-2 badge bg-secondary">
          
          </span>
        </h6>
        {renderList(tower, "Tower Documents", "TOWER_DOCS")}
        {renderList(feas, "Upload Documents", "FEAS_DOCS")}
        {renderList(amount, "Other Documents", "AMOUNT_DOCS")}
        {!filteredTower.length && !filteredFeas.length && !filteredAmount.length && (
          <p className="text-muted text-center mb-0">
            No documents uploaded for this step.
          </p>
        )}
      </Card>

      <div className="p-2 border-top bg-light text-center">
        <Button
          variant="info"
          size="sm"
          onClick={() => {
            setSelectedLogs(logs || []);
            setShowLogsModal(true);
          }}
        >
          View Logs
        </Button>
      </div>

      {/* View Logs Modal */}
      <Modal show={showLogsModal} onHide={() => setShowLogsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Logs</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
          {selectedLogs.length === 0 ? (
            <p>No comments available</p>
          ) : (
            selectedLogs.map((log, i) => (
              <div key={i}>
                <strong>{log?.date}:</strong> {log?.comment}
                <hr />
              </div>
            ))
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal (only shown in modify mode) */}
      {isModifyMode && (
        <Modal show={deleteConfirmOpen} onHide={cancelDelete} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete? <strong>{docToDelete?.displayName}</strong>
           
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cancelDelete} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default PreviousGhmcDocs;