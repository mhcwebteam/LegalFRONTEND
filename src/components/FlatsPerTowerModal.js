import React, { useState, useEffect } from "react";
import "./FlatsPerTowerModal.css"; // We'll create this CSS
import { FaTimes, FaSave, FaBuilding } from "react-icons/fa"; // Import icons

const FlatsPerTowerModal = ({
  show,
  onClose,
  numberOfTowers,
  towerFlats,
  onSave,
}) => {
  const [currentFlats, setCurrentFlats] = useState({});

  useEffect(() => {
    // Initialize currentFlats when the modal opens or numberOfTowers changes
    const newFlats = {};
    for (let i = 1; i <= numberOfTowers; i++) {
      newFlats[`Tower ${i}`] = towerFlats[`Tower ${i}`] || "";
    }
    setCurrentFlats(newFlats);
  }, [show, numberOfTowers, towerFlats]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentFlats((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(currentFlats);
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="flats-modal-overlay">
      <div className="flats-modal-content">
        <div className="flats-modal-header">
          <h2>
            <FaBuilding className="modal-header-icon" /> Flats per Tower
          </h2>
          <button className="flats-modal-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="flats-modal-body">
          {Array.from({ length: numberOfTowers }).map((_, index) => (
            <div className="flats-input-item" key={index}>
              <label>
                Tower {index + 1} - Number of Flats:
              </label>
              <input
                type="number"
                name={`Tower ${index + 1}`}
                value={currentFlats[`Tower ${index + 1}`] || ""}
                onChange={handleChange}
                min="0"
                placeholder={`Flats in Tower ${index + 1}`}
                className="flats-modal-input"
              />
            </div>
          ))}
        </div>
        <div className="flats-modal-footer">
          <button className="flats-modal-save-button" onClick={handleSave}>
            <FaSave /> Save
          </button>
          <button className="flats-modal-cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlatsPerTowerModal;
