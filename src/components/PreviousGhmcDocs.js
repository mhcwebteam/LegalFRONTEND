




import { Card, ListGroup } from "react-bootstrap";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import { Button, Modal } from "react-bootstrap";
import React, { useState } from "react";
const PreviousGhmcDocs = ({ docsData }) => {
  console.log('doooooooooooooooooooooooooooo',docsData);

    const [showLogsModal, setShowLogsModal] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState([]);


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

  const renderList = (list, title) => {
    if (!list.length) return null;

    return (
      <div className="mb-3">
        <h6 className="mb-2">{title}</h6>
        <ListGroup variant="flush">
          {list.map((doc, idx) => {
            const filenameToDisplay = doc.name || (typeof doc.path === 'string' ? doc.path.split("/").pop() : `file-${idx + 1}`);
            const path = doc.path || (typeof doc === 'string' ? doc : '');

            const href = `${API_DOC_URL}/storage/${path}`;

            if (!path) {
              console.warn(`Document item at index ${idx} in ${title} has no valid path:`, doc);
              return null;
            }

            return (
              <ListGroup.Item
                key={idx}
                className="d-flex justify-content-between align-items-center"
              >

                      
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none"
                >
                  {filenameToDisplay}
                </a>
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
        <h6 className="text-center mb-3">Previously Uploaded Documents</h6>
        {renderList(tower, "Tower Documents")}
        {renderList(feas, "Feasibility Documents")}
        {renderList(amount, "Amount Paid Documents")}
        {!tower.length && !feas.length && !amount.length && (
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

    </div>
  
  );
};

export default PreviousGhmcDocs;
  // {docsData?.Comments || 'No comments available'}