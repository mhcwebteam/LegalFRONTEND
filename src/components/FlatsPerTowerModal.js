// import React, { useState, useEffect } from "react";
// import "./FlatsPerTowerModal.css";
// import { FaTimes, FaSave, FaBuilding } from "react-icons/fa";

// const FlatsPerTowerModal = ({
//   show,
//   onClose,
//   numberOfTowers,
//   towerFlats,
//   onSave,
// }) => {
//   const [currentFlats, setCurrentFlats] = useState({});

//   useEffect(() => {
//     if (!show) return;

//     const newFlats = {};
//     for (let i = 1; i <= numberOfTowers; i++) {
//       const key = `Tower ${i}`;
//       // Initialize with existing value or empty string
//       newFlats[key] =
//         towerFlats && towerFlats[key] !== undefined ? String(towerFlats[key]) : "";
//     }
//     setCurrentFlats(newFlats);
//   }, [show, numberOfTowers, towerFlats]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     // Only allow non-negative integers
//     if (Number(value) < 0) return;
//     setCurrentFlats((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSave = () => {
//     onSave(currentFlats);
//     onClose();
//   };

//   // All fields required: check that every tower has a non-empty value
//   const allRequiredFilled = () => {
//     if (numberOfTowers <= 0) return false;
    
//     for (let i = 1; i <= numberOfTowers; i++) {
//       const key = `Tower ${i}`;
//       const val = currentFlats[key];
//       if (val === undefined || val === null || String(val).trim() === "") {
//         return false;
//       }
//     }
//     return true;
//   };

//   if (!show) {
//     return null;
//   }

//   const isSaveDisabled = !allRequiredFilled();

//   return (
//     <div className="flats-modal-overlay">
//       <div className="flats-modal-content">
//         <div className="flats-modal-header">
//       <h2>
//   <FaBuilding className="modal-header-icon" />
//   Flats per Tower

// </h2>

//           <button className="flats-modal-close-button" onClick={onClose}>
//             <FaTimes />
//           </button>
//         </div>

//         <div className="flats-modal-body">
//           {Array.from({ length: numberOfTowers }).map((_, index) => {
//             const key = `Tower ${index + 1}`;
//             return (
//               <div className="flats-input-item" key={key}>
//                 <label>{key} - Number of Flats:
//                     <span style={{ color: "red" }}>*</span>
//                 </label>
//                 <input
//                   type="number"
//                   name={key}
//                   value={currentFlats[key] || ""}
//                   onChange={handleChange}
//                   min="0"
//                   placeholder={`Flats in ${key}`}
//                   className="flats-modal-input"
//                   required
//                 />
//               </div>
//             );
//           })}
//         </div>

//         <div className="flats-modal-footer">
//           <button
//             className="flats-modal-save-button"
//             onClick={handleSave}
//             disabled={isSaveDisabled}
//           >
//             <FaSave /> Save
//           </button>
//           <button className="flats-modal-cancel-button" onClick={onClose}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FlatsPerTowerModal;


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
  const [errors, setErrors] = useState({});

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
    setErrors({});
  }, [show, numberOfTowers, towerFlats]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow non-negative integers
    const numValue = parseInt(value);
    if (numValue < 0) return;
    
    setCurrentFlats((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateAllFields = () => {
    const newErrors = {};
    
    for (let i = 1; i <= numberOfTowers; i++) {
      const key = `Tower ${i}`;
      const value = currentFlats[key];
      
      if (!value || value.trim() === "") {
        newErrors[key] = `Please enter flats count for ${key}`;
      } else if (parseInt(value) < 0) {
        newErrors[key] = `Please enter a valid number for ${key}`;
      }
    }
    
    return newErrors;
  };

  const handleSave = () => {
    const validationErrors = validateAllFields();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
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
          <p className="flats-modal-description">
            Please enter the number of flats for each tower:
          </p>
          
          {Array.from({ length: numberOfTowers }).map((_, index) => {
            const key = `Tower ${index + 1}`;
            return (
              <div className="flats-input-item" key={key}>
                <label>
                  {key} - Number of Flats:
                  <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="number"
                  name={key}
                  value={currentFlats[key] || ""}
                  onChange={handleChange}
                  min="0"
                  placeholder={`Flats in ${key}`}
                  className={`flats-modal-input ${errors[key] ? 'input-error' : ''}`}
                  required
                />
                {errors[key] && (
                  <p className="flats-input-error">{errors[key]}</p>
                )}
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
            <FaSave /> Save Details
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