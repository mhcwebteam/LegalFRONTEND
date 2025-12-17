import React, { useState } from "react";
import { Card, ListGroup, Button, Modal } from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_BASE_URLS, API_DOC_URL } from "../config/Config";
import { BoxArrowUpRight } from "react-bootstrap-icons";

const DocumentList = ({ title, docs, docType, onDelete, deletedDocs = [], type = "view" }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // Filter out deleted documents
  const filteredDocs = docs.filter(
    (doc) =>
      !deletedDocs.some(
        (deletedDoc) =>
          deletedDoc.docType === docType && deletedDoc.fileName === doc.name
      )
  );

  if (!filteredDocs || filteredDocs.length === 0) return null;

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (docToDelete) {
      try {
        await onDelete(docType, docToDelete.name);
        setDeleteConfirmOpen(false);
        setDocToDelete(null);
      } catch (error) {
        console.error("Deletion failed:", error);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDocToDelete(null);
  };

  const isModifyMode = type === "modify";

  return (
    <>
      <h6 className="mt-2 mb-1 text-warning">{title}</h6>
      <ListGroup variant="flush">
        {filteredDocs.map((doc, idx) => (
          <ListGroup.Item
            key={`${docType}-${doc.name}-${idx}`}
            className="d-flex align-items-center justify-content-between"
          >
            <div className="d-flex align-items-center">
              <BoxArrowUpRight className="me-3" color="royalblue" size={20} />
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="fw-bold text-decoration-none"
              >
                {doc?.name}
              </a>
            </div>

            {isModifyMode && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDeleteClick(doc)}
              >
                <FaTrashAlt />
              </Button>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Delete Confirmation Dialog - Only show in modify mode */}
      {isModifyMode && deleteConfirmOpen && (
        <Modal show={deleteConfirmOpen} onHide={cancelDelete} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete? <strong>{docToDelete?.name}</strong>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

// ------------------ Main Panel ------------------
const PreviousWaterUploadedDocs = ({ firstStep, onDocumentsChange, type = "view" }) => {
  const [deletedDocuments, setDeletedDocuments] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);

  // Parse Logs
  let logs = [];

  try {
    const parsed = JSON.parse(firstStep?.LOG || "[]");
    logs = Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    console.error("Invalid LOG JSON:", e);
    logs = [];
  }

  if (!firstStep) {
    return (
      <Card className="h-100">
        <Card.Body className="d-flex align-items-center justify-content-center">
          <p className="text-muted mb-0">No step details available.</p>
        </Card.Body>
      </Card>
    );
  }

  // Delete API
  const handleDelete = async (docType, fileName) => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const res = await axios.delete(`${API_BASE_URL}/water/document`, {
        data: {
          loc: firstStep.LOC,
          process: firstStep.PROCESS,
          doc_type: docType,
          file_name: fileName,
        },
      });

      setDeletedDocuments((prev) => [...prev, { docType, fileName }]);

      if (onDocumentsChange) onDocumentsChange();

      Swal.fire("Deleted!", res.data.message, "success");
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire(
        "Error!",
        err.response?.data?.message || "Failed to delete file",
        "error"
      );
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  // Parse JSON docs
  const parseDocs = (nameField, pathField) => {
    try {
      if (!firstStep[nameField] || !firstStep[pathField]) return [];

      const names = JSON.parse(firstStep[nameField]);
      const paths = JSON.parse(firstStep[pathField]);

      return names.map((name, i) => ({
        name,
        url: `${API_DOC_URL}/storage/${paths[i].replace(/\\/g, "/")}`,
      }));
    } catch (e) {
      console.error(`Failed to parse ${nameField}:`, e);
      return [];
    }
  };

  // Documents
  const planDocs = parseDocs("PLAN_DOC_NAME", "PLAN_DOC_PATH");
  const titleDocs = parseDocs("TITLE_DOC_NAME", "TITLE_DOC_PATH");
  const linkDocs = parseDocs("LINK_DOC_NAME", "LINK_DOC_PATH");
  const landDocs = parseDocs("LAND_DOC_NAME", "LAND_DOC_PATH");
  const othDocs = parseDocs("OTH_DOC_NAME", "OTH_DOC_PATH");
  const feasDocs = parseDocs("FEAS_DOC_NAME", "FEAS_DOC_PATH");
  const docs = parseDocs("DOCUMENT_NAME", "DOCUMENT_PATH");
  const amountdocs = parseDocs("AMOUNT_PAID_DOC_NAME", "AMOUNT_PAID_DOC_PATH");

  // Check if we're in modify mode
  const isModifyMode = type === "modify";

  return (
    <Card className="h-100 shadow-sm d-flex flex-column">
      <div style={{ flex: "0 0 80%", overflowY: "auto", padding: "10px" }}>
        <Card.Title as="h5" className="mb-3 border-bottom pb-2">
          Previously Uploaded Documents
     
        </Card.Title>

        <DocumentList
          title="Plan Documents"
          docs={planDocs}
          docType="PLAN"
          onDelete={handleDelete}
          deletedDocs={deletedDocuments}
          type={type}
        />

        <DocumentList
          title="Title Documents"
          docs={titleDocs}
          docType="TITLE"
          onDelete={handleDelete}
          deletedDocs={deletedDocuments}
          type={type}
        />

        <DocumentList
          title="Link Documents"
          docs={linkDocs}
          docType="LINK"
          onDelete={handleDelete}
          deletedDocs={deletedDocuments}
          type={type}
        />

        <DocumentList
          title="Land Documents"
          docs={landDocs}
          docType="LAND"
          onDelete={handleDelete}
          deletedDocs={deletedDocuments}
          type={type}
        />

        <DocumentList
          title="Other Documents"
          docs={othDocs}
          docType="OTH"
          onDelete={handleDelete}
          deletedDocs={deletedDocuments}
          type={type}
        />

        <DocumentList
          title="Feasibility Documents"
          docs={feasDocs}
          docType="FEAS"
          onDelete={handleDelete}
          deletedDocs={deletedDocuments}
          type={type}
        />

        <DocumentList
          title="Upload Paid Documents"
          docs={amountdocs}
          docType="PAID"
          onDelete={handleDelete}
          deletedDocs={deletedDocuments}
          type={type}
        />

        <DocumentList
          title="Documents"
          docs={docs}
          docType="DOCS"
          onDelete={handleDelete}
          deletedDocs={deletedDocuments}
          type={type}
        />
      </div>

      {/* Logs Button */}
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
                <strong>{log?.date}:</strong> {log?.comment} {log?.REASON}
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
    </Card>
  );
};

export default PreviousWaterUploadedDocs;