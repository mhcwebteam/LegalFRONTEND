


// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
// import { ChevronLeft, FileText, Home, Droplets, MessageSquareMore, CircleDivide, Calculator, Store, FileCheck2, FileCheck, FolderUp, BrickWallFire, Building, Landmark } from "lucide-react";
// import PlantSelect from '../components/PlantSelect';
// import ApplyDateInput from '../components/ApplyDateInput';
// import { ToastContainer, toast } from 'react-toastify';
// import ReusableDialog from "../components/ReusableDialog";
// import "../pages/Ghmc.css";
// import { createMaster, getMasterByLoc, submitWaterForm } from "../api/Api";
// import { Context } from "../context/ContextData";
// import { Button } from "react-bootstrap";
// import { FormControl, MenuItem, Select, TextField } from "@mui/material";
// import { API_BASE_URL, API_BASE_URLS } from "../config/Config";
// import ProcessField from "../components/ProcessField";
// import ProjectInfoHeader from "../components/ProjectInfoHeader";
// import WaterDocUploadModal from "../components/WaterDocUploadModal";


// const Ghmc = () => {
//     const navigate = useNavigate();
//     const { totalMasterData, setHeaderData, headerData, setMasterGetData, setMasterData } = useContext(Context);
//     const [showModal, setShowModal] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [confirmOpen, setConfirmOpen] = useState(false);
//     const [towerDocModal, setTowerDocModal] = useState(false);
//     const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
//     const [feasibilityDocs, setFeasibilityDocs] = useState([]);
//     const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
//     const [towerDocuments, setTowerDocuments] = useState([]);
//     const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
//     const [formData, setFormData] = useState({
//         loc: '',
//         process: '',
//         Organization: "",
//         applyDate: '',
//         noOfTowers: '',
//     });


//     useEffect(() => {
//         if (formData.noOfTowers && parseInt(formData.noOfTowers) > 0) {
//             const count = parseInt(formData.noOfTowers);
//             const newTowerDocs = Array.from({ length: count }, (_, index) => ({
//                 towerId: index + 1,
//                 documents: []
//             }));
//             setTowerDocuments(newTowerDocs);
//         } else {
//             setTowerDocuments([]);
//         }
//     }, [formData.noOfTowers]);

//     const handleChange = async (e) => {
//         const { name, value } = e.target;

//         if (name === "loc") {
//             setFormData(prev => ({ ...prev, loc: value }));

//             try {
//                 const res = await getMasterByLoc(value);
//                 if (res) {
//                     setHeaderData(res);
//                     setFormData(prev => ({
//                         ...prev,
//                         applyDate: res.APPLICATION_DATE || '',
//                         noOfTowers: res.NUMBER_OF_TOWERS || '',
//                     }));
//                 } else {
//                     setHeaderData(null);
//                     setFormData(prev => ({
//                         ...prev,
//                         applyDate: '',
//                         noOfTowers: ''
//                     }));
//                 }
//             } catch (err) {
//                 console.error("Error fetching master by loc:", err);
//                 setHeaderData(null);
//                 setFormData(prev => ({
//                     ...prev,
//                     applyDate: '',
//                     noOfTowers: '',
//                 }));
//             }
//             return;
//         }

//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     useEffect(() => {
//         const fetchProcess = async () => {
//             try {
//                 const res = await axios.get(`${API_BASE_URLS}/GHMC-process`);
            
//                 setFormData((prev) => ({
//                     ...prev,
//                     process: res.data[0].PROCESS,
//                 }));
//             } catch (err) {
//                 console.error("Error fetching water process name:", err);
//             }
//         };
//         fetchProcess();
//     }, []);

//     useEffect(() => {
//         if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
//             const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;
//             fetchDataForLoc(defaultLoc);
//         }
//     }, [totalMasterData]);

//     const fetchDataForLoc = async (loc) => {
//         try {
//             const res = await getMasterByLoc(loc);
//             if (res) {
//                 setHeaderData(res);
//             }
//         } catch (error) {
//             console.error("Error fetching initial loc data:", error);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const newErrors = {};
//         if (!formData.loc) newErrors.loc = "Project location is required.";
//         if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
//         if (Object.keys(newErrors).length > 0) {
//             setErrors(newErrors);
//             return;
//         }
//         setErrors({});
//         setConfirmOpen(true);
//     };

//     const handleProcessChange = (value) => {
//         setFormData((prev) => ({
//             ...prev,
//             process: value,
//         }));
//     };

// const handleConfirmSubmit = async () => {
//   setConfirmOpen(false);
//   setIsSubmitting(true);

//   const formPayload = new FormData();
//   formPayload.append('loc', formData.loc);
//   formPayload.append('process', formData.process);
//   formPayload.append('applyDate', formData.applyDate);
//   formPayload.append('Organization', formData.Organization);
//   formPayload.append('noOfTowers', formData.noOfTowers);
//   formPayload.append('Comments', formData.Comments || "");

//   // ✅ Match backend names
//   feasibilityDocs.forEach(file => formPayload.append('feas_doc_name[]', file));
//   AmountPaidDocs.forEach(file => formPayload.append('amount_doc_name[]', file));

//   towerDocuments.forEach(tower => {
//     tower.documents.forEach(file => {
//       formPayload.append('tower_doc_name[]', file);
//     });
//   });

//   try {
//     const res = await axios.post(`${API_BASE_URL}/ghmc-data-store`, formPayload, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     toast.success(res.data.message || "Form submitted successfully");
//     console.log(res, "result Data");

//     setFormData({
//       loc: "",
//       process: "",
//       Organization: "",
//       applyDate: "",
//       noOfTowers: "",
//       Comments: "",
//     });
//     setFeasibilityDocs([]);
//     setAmountPaidDocs([]);
//     setTowerDocuments([]);
//     navigate('/create');
//   } catch (err) {
//     toast.error(err.response?.data?.message || "Submission failed");
//   } finally {
//     setIsSubmitting(false);
//   }
// };



//     const handleBackClick = () => {
//         navigate('/create');
//     };

//     const updateTowerDocs = (towerId, docs) => {
//         setTowerDocuments(prev =>
//             prev.map(tower =>
//                 tower.towerId === towerId
//                     ? { ...tower, documents: docs }
//                     : tower
//             )
//         );
//     };

//     return (
//         <div className="ghmc-form-wrapper">
//             <form className="ghmc-form-container" onSubmit={handleSubmit}>
//                 {/* HEADER */}
//                 <div className="form-header">
//                     <div className="header-content">
//                         <div className="title-section">
//                             <div className="icon-wrapper">
//                                 <Landmark className="water-icon" size={32} />
//                             </div>
//                             <h1 className="form-title">GHMC/HMDA Application</h1>
//                             <p className="form-subtitle">
//                                 Submit your Project Details management compliance application
//                             </p>
//                         </div>
//                         <button
//                             type="button"
//                             onClick={handleBackClick}
//                             className="back-button-modern"
//                             title="Go back"
//                         >
//                             <ChevronLeft size={24} />
//                         </button>
//                     </div>
//                 </div>
//                 <ProjectInfoHeader data={headerData} />
//                 <div className="form-content">
//                     {/* Project Information */}
//                     <div className="form-section">
//                         <div className="section-header">
//                             <Home className="section-icon" size={20} />
//                             <h3 style={{ color: '#0e7bdae7' }}>Project Information:</h3>
//                         </div>

//                         <div className="form-grid two-columns">
//                             <div className="form-field">
//                                 <label className="field-label">
//                                     <Store className="label-icon" />
//                                     Plant Name*
//                                 </label>
//                                 <div className="input-wrapper">
//                                     <select
//                                         name="loc"
//                                         value={formData.loc}
//                                         onChange={handleChange}
//                                         className="modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400"
//                                     >
//                                         <option value="">Select Plant</option>
//                                         {totalMasterData.map((ele, index) => (
//                                             <option key={index} value={ele.LOC}>
//                                                 {ele.LOC}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     <div className="error-container">
//                                         {errors.Organization && <p className="error-text">{errors.Organization}</p>}
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="form-field">
//                                 <label className="field-label">
//                                     <FaLeaf className="label-icon" /> Process Type
//                                 </label>
//                                 <div className="input-wrapper">
//                                     <ProcessField
//                                         apiUrl={`${API_BASE_URLS}/water-process`}
//                                         value={formData.process}
//                                         onChange={handleProcessChange}
//                                         className="modern-input dropdown-bottom"
//                                     />
//                                     <div className="error-container">
//                                         {errors.process && <p className="error-text">{errors.process}</p>}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Application Details */}
//                     <div className="form-section">
//                         <div className="section-header">
//                             <FileText className="section-icon" size={20} />
//                             <h3 style={{ color: '#0e7bdae7' }}>Application Details:</h3>
//                         </div>

//                         <div className="form-grid two-columns">
//                             <div className="form-field">
//                                 <label className="field-label">
//                                     <FaCalendarAlt className="label-icon" /> Application Date*
//                                 </label>
//                                 <div className="input-wrapper">
//                                     <ApplyDateInput
//                                         value={formData.applyDate}
//                                         onChange={handleChange}
//                                         className="modern-input"
//                                     />
//                                     <div className="error-container">
//                                         {errors.applyDate && <p className="error-text">{errors.applyDate}</p>}
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="form-field">
//                                 <label className="field-label">
//                                     <Store className="label-icon" />
//                                     Organization*
//                                 </label>
//                                 <div className="input-wrapper">
//                                     <select
//                                         name="Organization"
//                                         value={formData.Organization}
//                                         onChange={handleChange}
//                                         className="modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400"
//                                     >
//                                         <option value="">Select Organization</option>
//                                         <option value="GHMC">GHMC</option>
//                                         <option value="HMDA">HMDA</option>
//                                     </select>
//                                     <div className="error-container">
//                                         {errors.Organization && <p className="error-text">{errors.Organization}</p>}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Documents */}
//                     <div className="form-section">
//                         <div className="section-header">
//                             <FaUpload className="section-icon" size={20} />
//                             <h3 style={{ color: '#0e7bdae7' }}>Project Details:</h3>
//                         </div>

//                         <div className="form-grid three-columns">
//                             <div className="form-field">
//                                 <label className="field-label">
//                                     <FaMoneyBill className="label-icon" /> Number of Towers*
//                                 </label>
//                                 <div className="input-wrapper">
//                                     <input
//                                         type="number"
//                                         name="noOfTowers"
//                                         value={formData.noOfTowers}
//                                         onChange={handleChange}
//                                         className="modern-input"
//                                         placeholder="Enter the Number of Towers"
//                                         step="1"
//                                         min="0"
//                                     />
//                                     <div className="error-container">
//                                         {errors.noOfTowers && <p className="error-text">{errors.noOfTowers}</p>}
//                                     </div>
//                                 </div>
//                             </div>



//                             <div className="form-field">
//                                 <label className="field-label">
//                                     <FolderUp className="label-icon" size={20} />Tower Documents
//                                 </label>
//                                 <div className="upload-container">
//                                     <button
//                                         type="button"
//                                         className="upload-button"
//                                         onClick={() => {
//                                             if (formData.noOfTowers && parseInt(formData.noOfTowers) > 0) {
//                                                 setTowerDocModal(true);
//                                             } else {
//                                                 toast.warning("Please enter Number of Towers first!");
//                                             }
//                                         }}
//                                     >
//                                         <FaUpload className="upload-icon" /> Tower Documents
//                                         <span className="upload-count">
//                                             {formData.noOfTowers && parseInt(formData.noOfTowers) > 0 &&
//                                                 `(${formData.noOfTowers} towers)`}
//                                         </span>
//                                     </button>


//                                 </div>



//                             </div>

//                             <div className="form-field">
//                                 <label className="field-label">
//                                     <FaMoneyBill className="label-icon" /> Title Document
//                                 </label>
//                                 <div className="upload-container">
//                                     <button
//                                         type="button"
//                                         className="upload-button"
//                                         onClick={() => setAmountPaidDocModal(true)}
//                                     >
//                                         <FaUpload className="upload-icon" />  Upload Documents
//                                         <span className="upload-count">
//                                             {AmountPaidDocs.length > 0 &&
//                                                 `(${AmountPaidDocs.length} files)`}
//                                         </span>
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                     </div>

//                     {/* Project Requirement */}
//                     <div className="form-section">
//                         <div className="section-header">
//                             <FileCheck className="section-icon" size={20} />
//                             <h3 style={{ color: '#0e7bdae7' }}>Project Requirement:</h3>
//                         </div>

//                         <div className="form-grid two-columns">
//                             <div className="form-field">
//                                 <label className="field-label">
//                                     <FaFileAlt className="label-icon" /> Other Document
//                                 </label>
//                                 <div className="upload-container">
//                                     <button
//                                         type="button"
//                                         className="upload-button"
//                                         onClick={() => setShowFeasibilityModal(true)}
//                                     >
//                                         <FaUpload className="upload-icon" /> Upload Document
//                                         <span className="upload-count">
//                                             {feasibilityDocs.length > 0 &&
//                                                 `(${feasibilityDocs.length} files)`}
//                                         </span>
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="form-field">
//                                 <label className="fire-field-label">
//                                     <MessageSquareMore className="label-icon" /> Comments
//                                 </label>
//                                 <div className="input-wrapper">
//                                     <textarea
//                                         name="Comments"
//                                         value={formData.Comments}
//                                         onChange={handleChange}
//                                         className="modern-input"
//                                         placeholder="Enter your comments"
//                                         rows="2"
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Submit Button */}
//                     <div className="form-actions">
//                         <button
//                             type="submit"
//                             className={`submit-button ${isSubmitting ? "submitting" : ""}`}
//                             disabled={isSubmitting}
//                         >
//                             {isSubmitting ? (
//                                 <>
//                                     <div className="spinner"></div>
//                                     Submitting...
//                                 </>
//                             ) : (
//                                 <>
//                                     <FaWater className="submit-icon" /> Submit
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </form>
//             {towerDocModal && (
//                 <div className="modal-overlay" onClick={() => setTowerDocModal(false)}>
//                     <div style={{backgroundColor:'white'}} className="modal-content" onClick={(e) => e.stopPropagation()}>
//                         <div className="modal-header">
//                             <h3>Upload Tower Documents ({formData.noOfTowers} Towers)</h3>
//                             <button onClick={() => setTowerDocModal(false)} className="close-btn">×</button>
//                         </div>
//                         <div className="modal-body">
//                             {towerDocuments.map((tower) => (
//                                 <div key={tower.towerId} className="tower-upload-section">
//                                     <label className="tower-label">
//                                         <Building size={18} /> Tower {tower.towerId} Documents
//                                     </label>
//                                     <div className="upload-container">
//                                         <button
//                                             type="button"
//                                             className="upload-button"
//                                             onClick={() => {

//                                                 const input = document.createElement('input');
//                                                 input.type = 'file';
//                                                 input.multiple = true;
//                                                 input.onchange = (e) => {
//                                                     const files = Array.from(e.target.files);
//                                                     updateTowerDocs(tower.towerId, [...tower.documents, ...files]);
//                                                 };
//                                                 input.click();
//                                             }}
//                                         >
//                                             <FaUpload className="upload-icon" /> Upload Files
//                                             <span className="upload-count">
//                                                 {tower.documents.length > 0 && `(${tower.documents.length} files)`}
//                                             </span>
//                                         </button>
//                                     </div>
//                                     {tower.documents.length > 0 && (
//                                         <div className="uploaded-files-list">
//                                             {tower.documents.map((file, idx) => (
//                                                 <div key={idx} className="file-item">
//                                                     <span>{file.name}</span>
//                                                     <button
//                                                         onClick={() => {
//                                                             const newDocs = tower.documents.filter((_, i) => i !== idx);
//                                                             updateTowerDocs(tower.towerId, newDocs);
//                                                         }}
//                                                         className="remove-file-btn"
//                                                     >
//                                                         ×
//                                                     </button>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                         <div className="modal-footer">
//                             <button
//                                 onClick={() => setTowerDocModal(false)}
//                                 className="btn-primary"
//                             >
//                                 Done
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//             <WaterDocUploadModal
//                 show={amountPaidDocModal}
//                 onClose={() => setAmountPaidDocModal(false)}
//                 linkDocs={AmountPaidDocs}
//                 setLinkDocs={setAmountPaidDocs}
//                 title="Title Document"
//                 showLandDocs={false}
//                 showOthDocs={false}
//             />
//             <WaterDocUploadModal
//                 show={showFeasibilityModal}
//                 onClose={() => setShowFeasibilityModal(false)}
//                 linkDocs={feasibilityDocs}
//                 setLinkDocs={setFeasibilityDocs}
//                 title="Other Document"
//                 showLandDocs={false}
//                 showOthDocs={false}
//             />

//             <ReusableDialog
//                 open={confirmOpen}
//                 title="Confirm Submission"
//                 message="Are you sure you want to submit this application? You will be redirected to the create page after successful submission."
//                 onClose={() => setConfirmOpen(false)}
//                 onConfirm={handleConfirmSubmit}
//                 confirmText="Submit"
//                 cancelText="Cancel"
//                 isLoading={isSubmitting}
//             />

//             <ToastContainer
//                 position="top-right"
//                 autoClose={5000}
//                 hideProgressBar={false}
//                 newestOnTop={false}
//                 closeOnClick
//                 rtl={false}
//                 pauseOnFocusLoss
//                 draggable
//                 pauseOnHover
//             />

//         </div>
//     );
// };

// export default Ghmc;


import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, Droplets, MessageSquareMore, CircleDivide, Calculator, Store, FileCheck2, FileCheck, FolderUp, BrickWallFire, Building, Landmark } from "lucide-react";
import PlantSelect from '../components/PlantSelect';
import ApplyDateInput from '../components/ApplyDateInput';
import { ToastContainer, toast } from 'react-toastify';
import ReusableDialog from "../components/ReusableDialog";
import "../pages/Ghmc.css";
import { createMaster, getMasterByLoc, submitWaterForm } from "../api/Api"
import { Context } from "../context/ContextData"
import { Button } from "react-bootstrap";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { API_BASE_URL, API_BASE_URLS } from "../config/Config";
import ProcessField from "../components/ProcessField";
import ProjectInfoHeader from "../components/ProjectInfoHeader";
import WaterDocUploadModal from "../components/WaterDocUploadModal";

const Ghmc = () => {
    const navigate = useNavigate();
    const { totalMasterData, setHeaderData, headerData, setMasterGetData, setMasterData } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [towerDocModal, setTowerDocModal] = useState(false);
    const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
    const [feasibilityDocs, setFeasibilityDocs] = useState([]);
    const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
    const [towerDocuments, setTowerDocuments] = useState([]);
    const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
    const [formData, setFormData] = useState({
        loc: '',
        process: '',
        Organization: "",
        applyDate: '',
        noOfTowers: '',
    });

    useEffect(() => {
        if (formData.noOfTowers && parseInt(formData.noOfTowers) > 0) {
            const count = parseInt(formData.noOfTowers);
            const newTowerDocs = Array.from({ length: count }, (_, index) => ({
                towerId: index + 1,
                documents: []
            }));
            setTowerDocuments(newTowerDocs);
        } else {
            setTowerDocuments([]);
        }
    }, [formData.noOfTowers]);

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (name === "loc") {
            setFormData(prev => ({ ...prev, loc: value }));

            try {
                const res = await getMasterByLoc(value);
                if (res) {
                    setHeaderData(res);
                    setFormData(prev => ({
                        ...prev,
                    
                    }));
                } else {
                    setHeaderData(null);
                    setFormData(prev => ({
                        ...prev,
                        applyDate: '',
                        noOfTowers: ''
                    }));
                }
            } catch (err) {
                console.error("Error fetching master by loc:", err);
                setHeaderData(null);
                setFormData(prev => ({
                    ...prev,
                    applyDate: '',
                    noOfTowers: '',
                }));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

   useEffect(() => {
  const fetchProcess = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/GHMC-process`, {
        params: { plant: '' }, // ✅ correct syntax — no extra parenthesis
      });

      if (res.data && res.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          process: res.data[0].PROCESS,
        }));
      }
    } catch (err) {
      console.error("Error fetching water process name:", err);
    }
  };

  fetchProcess();
}, []);


    useEffect(() => {
        if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
            const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;
            fetchDataForLoc(defaultLoc);
        }
    }, [totalMasterData]);

    const fetchDataForLoc = async (loc) => {
        try {
            const res = await getMasterByLoc(loc);
            if (res) {
                setHeaderData(res);
            }
        } catch (error) {
            console.error("Error fetching initial loc data:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.loc) newErrors.loc = "Project location is required.";
        if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setConfirmOpen(true);
    };

    const handleProcessChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            process: value,
        }));
    };

const handleConfirmSubmit = async () => {
  setConfirmOpen(false);
  setIsSubmitting(true);

  const formPayload = new FormData();
  formPayload.append('loc', formData.loc);
  formPayload.append('process', formData.process);
  formPayload.append('applyDate', formData.applyDate);
  formPayload.append('Organization', formData.Organization);
  formPayload.append('noOfTowers', formData.noOfTowers);
  formPayload.append('Comments', formData.Comments || "");

  // ✅ Match backend names
  feasibilityDocs.forEach(file => formPayload.append('feas_doc_name[]', file));
  AmountPaidDocs.forEach(file => formPayload.append('amount_doc_name[]', file));

  towerDocuments.forEach(tower => {
    tower.documents.forEach(file => {
      formPayload.append('tower_doc_name[]', file);
    });
  });

  try {
    const res = await axios.post(`${API_BASE_URL}/GHMC-submit`, formPayload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success(res.data.message || "Form submitted successfully");
    console.log(res, "result Data");

    setFormData({
      loc: "",
      process: "",
      Organization: "",
      applyDate: "",
      noOfTowers: "",
      Comments: "",
    });
    setFeasibilityDocs([]);
    setAmountPaidDocs([]);
    setTowerDocuments([]);
    navigate('/create');
  } catch (err) {
    toast.error(err.response?.data?.message || "Submission failed");
  } finally {
    setIsSubmitting(false);
  }
};

    const handleBackClick = () => {
        navigate('/create');
    };

    const updateTowerDocs = (towerId, docs) => {
        setTowerDocuments(prev =>
            prev.map(tower =>
                tower.towerId === towerId
                    ? { ...tower, documents: docs }
                    : tower
            )
        );
    };

    return (
        <div className="ghmc-form-wrapper">
            <form className="ghmc-form-container" onSubmit={handleSubmit}>
                {/* HEADER */}
                <div className="form-header">
                    <div className="header-content">
                        <div className="title-section">
                            <div className="icon-wrapper">
                                <Landmark className="water-icon" size={32} />
                            </div>
                            <h1 className="form-title">GHMC/HMDA Application</h1>
                            <p className="form-subtitle">
                                Submit your Project Details management compliance application
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleBackClick}
                            className="back-button-modern"
                            title="Go back"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>
                </div>
                <ProjectInfoHeader data={headerData} />
                <div className="form-content">
                    {/* Project Information */}
                    <div className="form-section">
                        <div className="section-header">
                            <Home className="section-icon" size={20} />
                            <h3 style={{ color: '#0e7bdae7' }}>Project Information:</h3>
                        </div>

                        <div className="form-grid two-columns">
                            <div className="form-field">
                                <label className="field-label">
                                    <Store className="label-icon" />
                                    Plant Name*
                                </label>
                                <div className="input-wrapper">
                                    <select
                                        name="loc"
                                        value={formData.loc}
                                        onChange={handleChange}
                                        className="modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="">Select Plant</option>
                                        {totalMasterData.map((ele, index) => (
                                            <option key={index} value={ele.LOC}>
                                                {ele.LOC}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="error-container">
                                        {errors.Organization && <p className="error-text">{errors.Organization}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="field-label">
                                    <FaLeaf className="label-icon" /> Process Type
                                </label>
                                <div className="input-wrapper">
                                    <ProcessField
                                        apiUrl={`${API_BASE_URL}/water-process`}
                                        value={formData.process}
                                        onChange={handleProcessChange}
                                        className="modern-input dropdown-bottom"
                                    />
                                    <div className="error-container">
                                        {errors.process && <p className="error-text">{errors.process}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application Details */}
                    <div className="form-section">
                        <div className="section-header">
                            <FileText className="section-icon" size={20} />
                            <h3 style={{ color: '#0e7bdae7' }}>Application Details:</h3>
                        </div>

                        <div className="form-grid two-columns">
                            <div className="form-field">
                                <label className="field-label">
                                    <FaCalendarAlt className="label-icon" /> Application Date*
                                </label>
                                <div className="input-wrapper">
                                    <ApplyDateInput
                                        value={formData.applyDate}
                                        onChange={handleChange}
                                        className="modern-input"
                                    />
                                    <div className="error-container">
                                        {errors.applyDate && <p className="error-text">{errors.applyDate}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="field-label">
                                    <Store className="label-icon" />
                                    Organization*
                                </label>
                                <div className="input-wrapper">
                                    <select
                                        name="Organization"
                                        value={formData.Organization}
                                        onChange={handleChange}
                                        className="modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="">Select Organization</option>
                                        <option value="GHMC">GHMC</option>
                                        <option value="HMDA">HMDA</option>
                                    </select>
                                    <div className="error-container">
                                        {errors.Organization && <p className="error-text">{errors.Organization}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="form-section">
                        <div className="section-header">
                            <FaUpload className="section-icon" size={20} />
                            <h3 style={{ color: '#0e7bdae7' }}>Project Details:</h3>
                        </div>

                        <div className="form-grid three-columns">
                            <div className="form-field">
                                <label className="field-label">
                                    <FaMoneyBill className="label-icon" /> Number of Towers*
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="number"
                                        name="noOfTowers"
                                        value={formData.noOfTowers}
                                        onChange={handleChange}
                                        className="modern-input"
                                        placeholder="Enter the Number of Towers"
                                        step="1"
                                        min="0"
                                    />
                                    <div className="error-container">
                                        {errors.noOfTowers && <p className="error-text">{errors.noOfTowers}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="field-label">
                                    <FolderUp className="label-icon" size={20} />Tower Documents
                                </label>
                                <div className="upload-container">
                                    <button
                                        type="button"
                                        className="upload-button"
                                        onClick={() => {
                                            if (formData.noOfTowers && parseInt(formData.noOfTowers) > 0) {
                                                setTowerDocModal(true);
                                            } else {
                                                toast.warning("Please enter Number of Towers first!");
                                            }
                                        }}
                                    >
                                        <FaUpload className="upload-icon" /> Tower Documents
                                        <span className="upload-count">
                                            {formData.noOfTowers && parseInt(formData.noOfTowers) > 0 &&
                                                `(${formData.noOfTowers} towers)`}
                                        </span>
                                    </button>

                                </div>

                            </div>

                            <div className="form-field">
                                <label className="field-label">
                                    <FaMoneyBill className="label-icon" /> Title Document
                                </label>
                                <div className="upload-container">
                                    <button
                                        type="button"
                                        className="upload-button"
                                        onClick={() => setAmountPaidDocModal(true)}
                                    >
                                        <FaUpload className="upload-icon" />  Upload Documents
                                        <span className="upload-count">
                                            {AmountPaidDocs.length > 0 &&
                                                `(${AmountPaidDocs.length} files)`}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Project Requirement */}
                    <div className="form-section">
                        <div className="section-header">
                            <FileCheck className="section-icon" size={20} />
                            <h3 style={{ color: '#0e7bdae7' }}>Project Requirement:</h3>
                        </div>

                        <div className="form-grid two-columns">
                            <div className="form-field">
                                <label className="field-label">
                                    <FaFileAlt className="label-icon" /> Other Document
                                </label>
                                <div className="upload-container">
                                    <button
                                        type="button"
                                        className="upload-button"
                                        onClick={() => setShowFeasibilityModal(true)}
                                    >
                                        <FaUpload className="upload-icon" /> Upload Document
                                        <span className="upload-count">
                                            {feasibilityDocs.length > 0 &&
                                                `(${feasibilityDocs.length} files)`}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="fire-field-label">
                                    <MessageSquareMore className="label-icon" /> Comments
                                </label>
                                <div className="input-wrapper">
                                    <textarea
                                        name="Comments"
                                        value={formData.Comments}
                                        onChange={handleChange}
                                        className="modern-input"
                                        placeholder="Enter your comments"
                                        rows="2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className={`submit-button ${isSubmitting ? "submitting" : ""}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <FaWater className="submit-icon" /> Submit
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
            {towerDocModal && (
                <div className="modal-overlay" onClick={() => setTowerDocModal(false)}>
                    <div style={{backgroundColor:'white'}} className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Upload Tower Documents ({formData.noOfTowers} Towers)</h3>
                            <button onClick={() => setTowerDocModal(false)} className="close-btn">×</button>
                        </div>
                        <div className="modal-body">
                            {towerDocuments.map((tower) => (
                                <div key={tower.towerId} className="tower-upload-section">
                                    <label className="tower-label">
                                        <Building size={18} /> Tower {tower.towerId} Documents
                                    </label>
                                    <div className="upload-container">
                                        <button
                                            type="button"
                                            className="upload-button"
                                            onClick={() => {

                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.multiple = true;
                                                input.onchange = (e) => {
                                                    const files = Array.from(e.target.files);
                                                    updateTowerDocs(tower.towerId, [...tower.documents, ...files]);
                                                };
                                                input.click();
                                            }}
                                        >
                                            <FaUpload className="upload-icon" /> Upload Files
                                            <span className="upload-count">
                                                {tower.documents.length > 0 && `(${tower.documents.length} files)`}
                                            </span>
                                        </button>
                                    </div>
                                    {tower.documents.length > 0 && (
                                        <div className="uploaded-files-list">
                                            {tower.documents.map((file, idx) => (
                                                <div key={idx} className="file-item">
                                                    <span>{file.name}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newDocs = tower.documents.filter((_, i) => i !== idx);
                                                            updateTowerDocs(tower.towerId, newDocs);
                                                        }}
                                                        className="remove-file-btn"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={() => setTowerDocModal(false)}
                                className="btn-primary"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <WaterDocUploadModal
                show={amountPaidDocModal}
                onClose={() => setAmountPaidDocModal(false)}
                linkDocs={AmountPaidDocs}
                setLinkDocs={setAmountPaidDocs}
                title="Title Document"
                showLandDocs={false}
                showOthDocs={false}
            />
            <WaterDocUploadModal
                show={showFeasibilityModal}
                onClose={() => setShowFeasibilityModal(false)}
                linkDocs={feasibilityDocs}
                setLinkDocs={setFeasibilityDocs}
                title="Other Document"
                showLandDocs={false}
                showOthDocs={false}
            />

            <ReusableDialog
                open={confirmOpen}
                title="Confirm Submission"
                message="Are you sure you want to submit this application? You will be redirected to the create page after successful submission."
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmSubmit}
                confirmText="Submit"
                cancelText="Cancel"
                isLoading={isSubmitting}
            />

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

        </div>
    );
};

export default Ghmc;
