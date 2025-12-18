import React, { useState, useEffect } from "react";
import "./FlatsPerTowerModal.css";
import { FaTimes, FaSave, FaBuilding } from "react-icons/fa";

const FlatsPerTowerModal = ({
  show,
  onClose,
  numberOfTowers,
  towerFlats,
  onSave,
}) => {
  const [currentFlats, setCurrentFlats] = useState({});

  useEffect(() => {
    if (!show) return;

    const newFlats = {};
    for (let i = 1; i <= numberOfTowers; i++) {
      const key = `Tower ${i}`;
      // Initialize with existing value or empty string
      newFlats[key] =
        towerFlats && towerFlats[key] !== undefined ? String(towerFlats[key]) : "";
    }
    setCurrentFlats(newFlats);
  }, [show, numberOfTowers, towerFlats]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow non-negative integers
    if (Number(value) < 0) return;
    setCurrentFlats((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(currentFlats);
    onClose();
  };

  // All fields required: check that every tower has a non-empty value
  const allRequiredFilled = () => {
    if (numberOfTowers <= 0) return false;
    
    for (let i = 1; i <= numberOfTowers; i++) {
      const key = `Tower ${i}`;
      const val = currentFlats[key];
      if (val === undefined || val === null || String(val).trim() === "") {
        return false;
      }
    }
    return true;
  };

  if (!show) {
    return null;
  }

  const isSaveDisabled = !allRequiredFilled();

  return (
    <div className="flats-modal-overlay">
      <div className="flats-modal-content">
        <div className="flats-modal-header">
      <h2>
  <FaBuilding className="modal-header-icon" />
  Flats per Tower

</h2>

          <button className="flats-modal-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="flats-modal-body">
          {Array.from({ length: numberOfTowers }).map((_, index) => {
            const key = `Tower ${index + 1}`;
            return (
              <div className="flats-input-item" key={key}>
                <label>{key} - Number of Flats:
                    <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="number"
                  name={key}
                  value={currentFlats[key] || ""}
                  onChange={handleChange}
                  min="0"
                  placeholder={`Flats in ${key}`}
                  className="flats-modal-input"
                  required
                />
              </div>
            );
          })}
        </div>

        <div className="flats-modal-footer">
          <button
            className="flats-modal-save-button"
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
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