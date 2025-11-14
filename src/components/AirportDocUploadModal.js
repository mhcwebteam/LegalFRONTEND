// src/components/AirportDocUploadModal.jsx
import React from 'react';
import '../pages/Airport.css'; // or a dedicated CSS

const FileList = ({ files, onRemove }) => {
  if (!files?.length) return null;
  return (
    <ul className="list-unstyled mb-2">
      {files.map((f, i) => (
        <li key={i} className="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {f.name}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={() => onRemove(i)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
};

const AirportDocUploadModal = ({
  show,
  onClose,
  linkDocs = [],
  setLinkDocs,
  landDocs = [],
  setLandDocs,
  othDocs = [],
  setOthDocs,
  comments
}) => {
  if (!show) return null;


  console.log(comments,"commentssssssssssssssssssss")
  const handleFilesAppend = (e, setter) => {
    const incoming = Array.from(e.target.files);
    setter(prev => [...prev, ...incoming]);
    e.target.value = null; // allow re-selecting same file if needed
  };

  const removeAtIndex = (setter, idx) => {
    setter(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal">
        <h5 className="mb-3">Upload Documents</h5>

        <div className="mb-4">
          <label className="form-label fw-semibold">Link Doc:</label>
          <div className="d-flex gap-2 mb-1">
            <input
              type="file"
              multiple
              onChange={(e) => handleFilesAppend(e, setLinkDocs)}
              id="link-doc-input"
              style={{ flex: 1 }}
            />
          </div>
          <FileList files={linkDocs} onRemove={(i) => removeAtIndex(setLinkDocs, i)} />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Land Doc:</label>
          <div className="d-flex gap-2 mb-1">
            <input
              type="file"
              multiple
              onChange={(e) => handleFilesAppend(e, setLandDocs)}
              id="land-doc-input"
              style={{ flex: 1 }}
            />
          </div>
          <FileList files={landDocs} onRemove={(i) => removeAtIndex(setLandDocs, i)} />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">Other Doc:</label>
          <div className="d-flex gap-2 mb-1">
            <input
              type="file"
              multiple
              onChange={(e) => handleFilesAppend(e, setOthDocs)}
              id="oth-doc-input"
              style={{ flex: 1 }}
            />
          </div>
          <FileList files={othDocs} onRemove={(i) => removeAtIndex(setOthDocs, i)} />
        </div>

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

export default AirportDocUploadModal;
