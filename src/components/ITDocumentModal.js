import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { API_BASE_URL, API_DOC_URL, API_DOC_URL1 } from '../config/Config';

const ITDocumentModal = ({ show, onClose, title, docs }) => {
  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title} - Documents</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {docs && docs.length > 0 ? (
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Document Name</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {docs.flatMap((doc, docIndex) => {
                const names = doc.DOC_NAME.split(',');
                const paths = doc.DOC_PATH.split(',');
                return names.map((name, i) => {
                    const cleanedName = name.replace(/[\[\]"'%]/g, '').trim(); // keep slashes
                    const cleanedPath = paths[i].replace(/[\[\]"'%]/g, '').trim(); // keep slashes

                    return (
                        <tr key={`${docIndex}-${i}`}>
                        <td>{i + 1}</td>
                        <td>{cleanedName}</td>
                        <td>
                            <a
                            href={`${API_DOC_URL}${cleanedPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                            🔗 Open
                            </a>
                        </td>
                        </tr>
                    );
                });
              })}
            </tbody>
          </Table>
        ) : (
          <p>No documents found.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ITDocumentModal;
