// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { API_BASE_URL } from '../config/Config';
// import { FaLeaf, FaFire, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt, FaCheckCircle, FaWater } from 'react-icons/fa';
// import { ChevronLeft, FileText, Home, Flame, MessageSquareMore, Calculator, Store, FileCheck, FolderUp, MapPinned, User } from "lucide-react";
// import WaterDocUploadModal from "../components/WaterDocUploadModal";
// import PlantSelect from '../components/PlantSelect';
// import ApplyDateInput from '../components/ApplyDateInput';
// import { ToastContainer, toast } from 'react-toastify';
// import ProcessField from '../components/ProcessField';
// import ReusableDialog from "../components/ReusableDialog";
// import ProjectInfoHeader from "../components/ProjectInfoHeader"
// import "../pages/Fire.css";
// import { getMasterByLoc, submitFireForm, submitWaterForm } from "../api/Api";
// import { Context } from "../context/ContextData";
// import ReraDocUploadModal from "../components/ReraDocUploadModal";
// import FlatsPerTowerModal from "../components/FlatsPerTowerModal";
// import Swal from "sweetalert2";

// const FireForm = () => {
//   const navigate = useNavigate();
//   const { totalMasterData, setHeaderData, headerData, setMasterGetData, setMasterData } = useContext(Context);
//   const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
//   const [acknowledgeDocs, setAcknowledgeDocs] = useState([]);

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [confirmOpen, setConfirmOpen] = useState(false);

//   const [towerFlats, setTowerFlats] = useState({});
//   const [showFlatsModal, setShowFlatsModal] = useState(false);

//   const [newDocs, setNewDocs] = useState([]);
//   const [showUploadModal, setShowUploadModal] = useState(false);

//   const [formData, setFormData] = useState({
//     loc: "",
//     process: "",
//     applyDate: "",
//     document: null,
//     noOfFlats: "",
//     Comments: "",
//     noOfTowers: "",
//     BuildArea: "",
//     ProjectArea: "",
//     TotalArea: "",
//     ProjectName: "",
//     feePaid: "",
//     feeAmount: "",
//     acknowledgeName: "",
//   });

//   // Add this useEffect to your FireForm component
// useEffect(() => {
//   const fetchFireProcess = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/fire-process`);
//       console.log("Fire Process Data:", response.data);

//       // Set the first process as default
//       if (response.data && response.data.length > 0) {
//         setFormData(prev => ({
//           ...prev,
//           process: response.data[0].PROCESS
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching fire process:", error);
//       toast.error("Failed to load process data");
//     }
//   };

//   fetchFireProcess();
// }, [API_BASE_URL]); // Add API_BASE_URL to dependency array if it can change

//   // useEffect(() => {
//   //   if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
//   //     const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;
//   //     fetchDataForLoc(defaultLoc);
//   //   }
//   // }, [totalMasterData]);

//   // const fetchDataForLoc = async (loc) => {
//   //   try {
//   //     const res = await getMasterByLoc(loc);
//   //     if (res) {
//   //       setHeaderData(res);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching initial loc data:", error);
//   //   }
//   // };

//   useEffect(() => {
//     const fetchProcess = async () => {
//       try {
//         const res = await axios.get(`${API_BASE_URL}/fire-process`);
//         setFormData((prev) => ({
//           ...prev,
//           process: res.data[0].PROCESS,
//         }));
//       } catch (err) {
//         console.error("Error fetching fire process name:", err);
//       }
//     };
//     fetchProcess();
//   }, []);

//   const checkIfPlantExists = async (plant) => {
//       try {
//         const res = await axios.post(`${API_BASE_URL}/check-plant-exists-fire`, { loc: plant });
//         console.log("API Response:", res.data);

//         if (res.data && res.data.exists === true) {
//           toast.error('This plant already has entries.');
//           setFormData((prev) => ({ ...prev, loc: '' }));
//           setHeaderData(null);
//           return true;
//         }
//         return false;
//       } catch (error) {
//         console.error('Failed to check plant:', error);
//         return false;
//       }
//     };

//   const handleChange = async (e) => {
//     const { name, value, type, checked } = e.target;

//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: undefined }));
//     }

//     if (type === "radio") {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//       return;
//     }

//     if (name === "loc") {
//       setFormData((prev) => ({
//         ...prev,
//         loc: value,
//       }));

//       // If empty value, clear everything
//       if (!value || value.trim() === "") {
//         setHeaderData({});
//         setFormData((prev) => ({
//           ...prev,
//           applyDate: "",
//           totalPrjArea: "",
//           noOfNocs: "",
//         }));
//         return;
//       }

//       // Fetch master data for the selected location
//       try {
//          const plantExists = await checkIfPlantExists(value);
//         if (plantExists) {
//           return;
//         }
//         const res = await getMasterByLoc(value);
//         if (res && Object.keys(res).length > 0) {
//           setHeaderData(res);
//         } else {
//           console.warn('⚠️ No master data found for location:', value);
//           setHeaderData({});
//           setFormData((prev) => ({
//             ...prev,
//             applyDate: "",
//           }));
//         }
//       } catch (err) {
//         console.error("❌ Error fetching master by loc:", err);
//         setHeaderData({});
//         setFormData((prev) => ({
//           ...prev,
//           applyDate: "",
//         }));
//       }
//       return;
//     }

//     // Normal case
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleProcessChange = (value) => {
//     setFormData((prev) => ({
//       ...prev,
//       process: value,
//     }));
//   };

//   // Function to check if a file is PDF
//   const isFilePDF = (file) => {
//     // Check file extension
//     const fileExtension = file.name.toLowerCase().endsWith('.pdf');
//     // Check MIME type
//     const fileMimeType = file.type === 'application/pdf';

//     return fileExtension && fileMimeType;
//   };

//   // Function to validate all files are PDF
//   const validateAllFilesArePDF = (files) => {
//     if (!files || files.length === 0) return true;

//     for (const file of files) {
//       if (!isFilePDF(file)) {
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleSaveFlats = (flatsData) => {
//     setTowerFlats(flatsData);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const newErrors = {};

//     // Clear previous errors
//     setErrors({});

//     // Basic field validations
//     if (!formData.loc) newErrors.loc = "Project location is required.";
//     if (!formData.process) newErrors.process = "Process type is required.";
//     if (!formData.feePaid) newErrors.feePaid = "Please specify if fee is paid.";
//  if (!formData.noOfTowers) newErrors.noOfTowers = "Number of Towers is required.";
//     if(!formData.Comments) newErrors.Comments = "Please enter the comments.";

//     if (formData.feePaid === "YES" && !formData.feeAmount)
//       newErrors.feeAmount = "Fee amount is required when fee is paid.";
//     if (!formData.acknowledgeName)
//       newErrors.acknowledgeName = "Acknowledge name is required.";

//     // PDF file validations
//     if (newDocs.length === 0) {
//       newErrors.documents = "Please upload at least one application document.";
//     } else {
//       // Check if all newDocs are PDF
//       if (!validateAllFilesArePDF(newDocs)) {
//         newErrors.documents = "All application documents must be PDF files only.";
//       }
//     }

//     if (acknowledgeDocs.length === 0) {
//       newErrors.acknowledgeDocs = "Please upload at least one acknowledgement receipt.";
//     } else {
//       // Check if all acknowledgeDocs are PDF
//       if (!validateAllFilesArePDF(acknowledgeDocs)) {
//         newErrors.acknowledgeDocs = "All acknowledgement receipts must be PDF files only.";
//       }
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     setErrors({});
//     setConfirmOpen(true);
//   };

//  const handleConfirmSubmit = async () => {
//   setConfirmOpen(false);
//   setIsSubmitting(true);

//   // Final validation - check all files are PDF
//   if (!validateAllFilesArePDF(newDocs)) {
//     toast.error("Application documents must be PDF files only.");
//     setIsSubmitting(false);
//     return;
//   }

//   if (!validateAllFilesArePDF(acknowledgeDocs)) {
//     toast.error("Acknowledgement receipts must be PDF files only.");
//     setIsSubmitting(false);
//     return;
//   }

//   const formPayload = new FormData();
//   formPayload.append("loc", formData.loc);
//   formPayload.append("process", formData.process);
//   formPayload.append("applyDate", formData.applyDate);
//   formPayload.append("noOfFlats", formData.noOfFlats);
//   formPayload.append("comments", formData.Comments);
//   formPayload.append("feePaid", formData.feePaid);
//   formPayload.append("feeAmount", formData.feeAmount);
//   formPayload.append("acknowledgeName", formData.acknowledgeName);
//   formPayload.append("noOfTowers", formData.noOfTowers);
//   formPayload.append("BuildArea", formData.BuildArea);
//   formPayload.append("ProjectArea", formData.ProjectArea);
//   formPayload.append("TotalArea", formData.TotalArea);
//   formPayload.append("ProjectName", formData.ProjectName);
//   formPayload.append("steptype", "ProvisionalNOC");

//   // Append document arrays
//   acknowledgeDocs.forEach((f) => formPayload.append("Acknowledge_Doc[]", f));
//   newDocs.forEach((f) => formPayload.append("New_Doc[]", f));

//   // Append towerFlats data as a JSON string
//   formPayload.append("towerFlats", JSON.stringify(towerFlats));

//   console.log("--- FormData Payload ---");
//   for (let [key, value] of formPayload.entries()) {
//     if (value instanceof File) {
//       console.log(
//         `${key}: File (name: ${value.name}, type: ${value.type}, size: ${value.size} bytes)`
//       );
//     } else {
//       console.log(`${key}: ${value}`);
//     }
//   }
//   console.log("------------------------");

//   try {
//     const response = await submitFireForm(formPayload);

//     console.log("API Response:", response);

//     // Check if response has message (could be at root or in data property)
//     const successMessage = response?.message || response?.data?.message || "Application submitted successfully!";

//     await Swal.fire({
//       icon: "success",
//       title: successMessage,
//       showConfirmButton: false,
//       timer: 2000,
//     });

//     // Reset form
//     setFormData({
//       loc: "",
//       process: "",
//       applyDate: "",
//       document: null,
//       noOfFlats: "",
//       Comments: "",
//       noOfTowers: "",
//       BuildArea: "",
//       ProjectArea: "",
//       TotalArea: "",
//       ProjectName: "",
//       feePaid: "",
//       feeAmount: "",
//       acknowledgeName: "",
//     });

//     // Reset document states and towerFlats
//     setAcknowledgeDocs([]);
//     setNewDocs([]);
//     setTowerFlats({});

//     // Navigate to create page
//     navigate("/create");

//   } catch (err) {
//     console.error("Submission error:", err);

//     // Use Swal.fire instead of toast for error
//     Swal.fire({
//       icon: "error",
//       title: "Submission Failed",
//       text: err.response?.data?.message ||
//         err.message ||
//         "Submission failed. Please try again.",
//     });

//     if (err.response?.data?.errors) {
//       console.error("Validation Errors:", err.response.data.errors);
//     }
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   const handleBackClick = () => {
//     navigate("/create");
//   };

//   return (
//     <div className="fire-form-wrapper">
//       <div className="fire-form-background"></div>
//       <form
//         className={`fire-form-container ${
//           formData.loc || formData.ProjectName ? "with-info-header" : ""
//         }`}
//         onSubmit={handleSubmit}
//       >
//         {/* MAIN HEADER */}
//         <div className="fire-form-header">
//           <div className="fire-header-content">
//             <div className="fire-title-section">
//               <div className="fire-icon-wrapper">
//                 <Flame className="fire-icon" size={38} />
//               </div>
//               <h1 className="fire-form-title">
//                 Fire Control Board Application
//               </h1>
//             </div>

//             <button
//               type="button"
//               onClick={handleBackClick}
//               className="fire-back-button-modern"
//               title="Go back"
//             >
//               <ChevronLeft size={15} />
//             </button>
//           </div>
//         </div>

//         <ProjectInfoHeader formData={formData} />

//         <div className="form-content">
//           <div className="form-section">
//             <div className="section-header">
//               <Home className="section-icon" size={20} />
//               <h3 style={{ color: "#0e7bdae7" }}>Project Information:</h3>
//             </div>

//             <div className="form-grid two-columns">
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaBuilding className="label-icon" /> Plant Name*
//                 </label>
//                 <div className="input-wrapper">
//                   <select
//                     name="loc"
//                     value={formData.loc}
//                     onChange={handleChange}
//                     className="highlight-input"
//                   >
//                     <option value="" hidden>
//                       Select Plant
//                     </option>
//                     {totalMasterData.map((ele, index) => (
//                       <option key={index} value={ele.LOC}>
//                         {ele.LOC}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="error-container">
//                     {errors.loc && <p className="error-text">{errors.loc}</p>}
//                   </div>
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label className="field-label">
//                   <FaLeaf className="label-icon" /> Process Type
//                 </label>
//                 <div className="input-wrapper">
//                      <ProcessField
//                     apiUrl={`${API_BASE_URL}/fire-process`}
//                     value={formData.process}
//                     onChange={handleProcessChange}
//                     className="form-control"
//                   />
//                   <div className="error-container">
//                     {errors.process && (
//                       <p className="error-text">{errors.process}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="form-section">
//             <div className="section-header">
//               <FileText className="section-icon" size={20} />
//               <h3 style={{ color: "#0e7bdae7" }}>Application Details:</h3>
//             </div>

//             <div className="form-grid two-columns">
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaCalendarAlt className="label-icon" /> Application Date*
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="date"
//                     name="applyDate"
//                     value={formData.applyDate}
//                     max={new Date().toISOString().split("T")[0]}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Select Application Date"
//                   />
//                   <div className="error-container">
//                     {errors.applyDate && (
//                       <p className="error-text">{errors.applyDate}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaUpload className="label-icon" /> Upload Documents*
//                 </label>
//                 <div className="upload-container">
//                   <button
//                     type="button"
//                     className="upload-button"
//                     onClick={() => setShowUploadModal(true)}
//                   >
//                     <FaUpload className="upload-icon" /> Upload Files
//                     {newDocs.length > 0 && (
//                       <span className="upload-count">
//                         ({newDocs.length} files)
//                       </span>
//                     )}
//                   </button>
//                   <div className="error-container">
//                     {errors.documents && (
//                       <p className="error-text">{errors.documents}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="form-section">
//             <div className="section-header">
//               <FaUpload className="section-icon" size={20} />
//               <h3 style={{ color: "#0e7bdae7" }}>Documents:</h3>
//             </div>

//             <div className="form-grid two-columns">
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaMoneyBill className="label-icon" /> Acknowledgement name
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="text"
//                     name="acknowledgeName"
//                     value={formData.acknowledgeName}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter Acknowledge Name"
//                   />
//                   <div className="error-container">
//                     {errors.acknowledgeName && (
//                       <p className="error-text">{errors.acknowledgeName}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaUpload className="label-icon" /> Acknowledgement Receipt*
//                 </label>
//                 <div className="upload-container">
//                   <button
//                     type="button"
//                     className="upload-button"
//                     onClick={() => setShowAcknowledgeModal(true)}
//                   >
//                     <FaUpload className="upload-icon" /> Upload Receipts
//                     {acknowledgeDocs.length > 0 && (
//                       <span className="upload-count">
//                         ({acknowledgeDocs.length} files)
//                       </span>
//                     )}
//                   </button>
//                   <div className="error-container">
//                     {errors.acknowledgeDocs && (
//                       <p className="error-text">{errors.acknowledgeDocs}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="form-section">
//             <div className="section-header">
//               <FileCheck className="section-icon" size={20} />
//               <h3 style={{ color: "#0e7bdae7" }}>Water Requirement:</h3>
//             </div>

//             <div className="form-grid three-columns">
//               <div className="form-group">
//                 <label className="field-label">Fee Paid?</label>
//                 <div className="radio-group-horizontal">
//                   <label className="radio-label">
//                     <input
//                       type="radio"
//                       name="feePaid"
//                       value="YES"
//                       checked={formData.feePaid === "YES"}
//                       onChange={handleChange}
//                       className="radio-input"
//                     />
//                     <span className="radiomark"></span>
//                     Yes
//                   </label>
//                   <label className="radio-label">
//                     <input
//                       type="radio"
//                       name="feePaid"
//                       value="NO"
//                       checked={formData.feePaid === "NO"}
//                       onChange={handleChange}
//                       className="radio-input"
//                     />
//                     <span className="radiomark"></span>
//                     No
//                   </label>
//                 </div>
//                 <div className="error-container">
//                   {errors.feePaid && (
//                     <p className="error-text">{errors.feePaid}</p>
//                   )}
//                 </div>
//               </div>

//               {formData.feePaid === "YES" && (
//                 <div className="form-field">
//                   <label className="field-label">
//                     <FaMoneyBill className="label-icon" /> Fee amount paid*
//                   </label>
//                   <div className="input-wrapper">
//                     <input
//                       type="number"
//                       name="feeAmount"
//                       value={formData.feeAmount}
//                       onChange={handleChange}
//                       className="modern-input"
//                       placeholder="Enter the Fee Amount"
//                       step="0.01"
//                       min="0"
//                     />
//                     <div className="error-container">
//                       {errors.feeAmount && (
//                         <p className="error-text">{errors.feeAmount}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="form-field">
//                 <label className="field-label">
//                   <FaBuilding className="label-icon" /> Number of Towers*
//                 </label>
//                 <div className="input-wrapper">
//                   <select
//                     name="noOfTowers"
//                     value={formData.noOfTowers}
//                     onChange={(e) => {
//                       handleChange(e);
//                       const selectedTowers = parseInt(e.target.value);
//                       if (selectedTowers > 0) {
//                         const initialFlats = {};
//                         for (let i = 1; i <= selectedTowers; i++) {
//                           initialFlats[`Tower ${i}`] =
//                             towerFlats[`Tower ${i}`] || "";
//                         }
//                         setTowerFlats(initialFlats);
//                         setShowFlatsModal(true);
//                       } else {
//                         setShowFlatsModal(false);
//                         setTowerFlats({});
//                       }
//                     }}
//                     className="modern-input"
//                   >
//                     <option value="">Select Number of Towers</option>
//                     {[...Array(15)].map((_, i) => (
//                       <option key={i + 1} value={i + 1}>
//                         {i + 1}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="error-container">
//                     {errors.noOfTowers && (
//                       <p className="error-text">{errors.noOfTowers}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="form-field full-width">
//                 <label className="field-label" style={{ marginTop: "-20px" }}>
//                   <MessageSquareMore className="label-icon" /> Comments
//                 </label>
//                 <div className="input-wrapper">
//                   <textarea
//                     name="Comments"
//                     value={formData.Comments}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter your comments"
//                     rows="2"
//                   />
//                       <div className="error-container">
//                       {errors.Comments && (
//                         <p className="error-text">{errors.Comments}</p>
//                       )}
//                     </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="form-actions">
//             <button
//               type="submit"
//               className={`submit-button ${isSubmitting ? "submitting" : ""}`}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <>
//                   <div className="spinner"></div>
//                   Submitting...
//                 </>
//               ) : (
//                 <>
//                   <FaWater className="submit-icon" /> Submit
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </form>

//       <ReusableDialog
//         open={confirmOpen}
//         title="Confirm Submission"
//         message="Are you sure you want to submit this fire application? You will be redirected to the create page after successful submission."
//         onClose={() => setConfirmOpen(false)}
//         onConfirm={handleConfirmSubmit}
//         confirmText="Submit"
//         cancelText="Cancel"
//         isLoading={isSubmitting}
//       />

//       {/* Pass PDF validation to modals */}
//       <ReraDocUploadModal
//         show={showUploadModal}
//         onClose={() => setShowUploadModal(false)}
//         files={newDocs}
//         setFiles={setNewDocs}
//         title="Upload Application Documents"
//         acceptOnlyPdf={true} // Add this
//       />

//       <ReraDocUploadModal
//         show={showAcknowledgeModal}
//         onClose={() => setShowAcknowledgeModal(false)}
//         files={acknowledgeDocs}
//         setFiles={setAcknowledgeDocs}
//         title="Upload Acknowledgement Receipts"
//         acceptOnlyPdf={true} // Add this
//       />

//       <FlatsPerTowerModal
//         show={showFlatsModal}
//         onClose={() => setShowFlatsModal(false)}
//         numberOfTowers={parseInt(formData.noOfTowers) || 0}
//         towerFlats={towerFlats}
//         onSave={handleSaveFlats}
//       />
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//     </div>
//   );
// };

// export default FireForm;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/Config";
import {
  FaLeaf,
  FaFire,
  FaBuilding,
  FaCalendarAlt,
  FaUpload,
  FaMoneyBill,
  FaFileAlt,
  FaCheckCircle,
  FaWater,
} from "react-icons/fa";
import {
  ChevronLeft,
  FileText,
  Home,
  Flame,
  MessageSquareMore,
  Calculator,
  Store,
  FileCheck,
  FolderUp,
  MapPinned,
  User,
} from "lucide-react";
import WaterDocUploadModal from "../components/WaterDocUploadModal";
import PlantSelect from "../components/PlantSelect";
import ApplyDateInput from "../components/ApplyDateInput";
import { ToastContainer, toast } from "react-toastify";
import ProcessField from "../components/ProcessField";
import ReusableDialog from "../components/ReusableDialog";
import ProjectInfoHeader from "../components/ProjectInfoHeader";
import "../pages/Fire.css";
import { getMasterByLoc, submitFireForm, submitWaterForm } from "../api/Api";
import { Context } from "../context/ContextData";
import ReraDocUploadModal from "../components/ReraDocUploadModal";
import FlatsPerTowerModal from "../components/FlatsPerTowerModal";
import Swal from "sweetalert2";

const FireForm = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const {
    totalMasterData,
    setHeaderData,
    headerData,
    setMasterGetData,
    setMasterData,
  } = useContext(Context);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [acknowledgeDocs, setAcknowledgeDocs] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [towerFlats, setTowerFlats] = useState({});
  const [showFlatsModal, setShowFlatsModal] = useState(false);
  const [towerFlatsSubmitted, setTowerFlatsSubmitted] = useState(false);

  const [newDocs, setNewDocs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [formData, setFormData] = useState({
    loc: "",
    process: "",
    applyDate: "",
    document: null,
    noOfFlats: "",
    Comments: "",
    noOfTowers: "",
    BuildArea: "",
    ProjectArea: "",
    TotalArea: "",
    ProjectName: "",
    feePaid: "",
    feeAmount: "",
    acknowledgeName: "",
  });

  // --- 2. Check User Login ---
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const userString = localStorage.getItem("user"); // Changed to 'user' to be safe
    if (userString) {
      try {
        const userObj = JSON.parse(userString);
        setLoggedInUser(userObj);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [token, navigate]);
  // Add this useEffect to your FireForm component
  useEffect(() => {
    const fetchFireProcess = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/fire-process`);
        console.log("Fire Process Data:", response.data);

        // Set the first process as default
        if (response.data && response.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            process: response.data[0].PROCESS,
          }));
        }
      } catch (error) {
        console.error("Error fetching fire process:", error);
        toast.error("Failed to load process data");
      }
    };

    fetchFireProcess();
  }, [API_BASE_URL]); // Add API_BASE_URL to dependency array if it can change

  // useEffect(() => {
  //   if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
  //     const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;
  //     fetchDataForLoc(defaultLoc);
  //   }
  // }, [totalMasterData]);

  // const fetchDataForLoc = async (loc) => {
  //   try {
  //     const res = await getMasterByLoc(loc);
  //     if (res) {
  //       setHeaderData(res);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching initial loc data:", error);
  //   }
  // };

  useEffect(() => {
    setHeaderData(null);
  }, []);

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/fire-process`);
        setFormData((prev) => ({
          ...prev,
          process: res.data[0].PROCESS,
        }));
      } catch (err) {
        console.error("Error fetching fire process name:", err);
      }
    };
    fetchProcess();
  }, []);

  const checkIfPlantExists = async (plant) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/check-plant-exists-fire`, {
        loc: plant,
      });
      console.log("API Response:", res.data);

      if (res.data && res.data.exists === true) {
        toast.error("This plant already has entries.");
        setFormData((prev) => ({ ...prev, loc: "" }));
        setHeaderData(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to check plant:", error);
      return false;
    }
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (type === "radio") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }

    if (name === "loc") {
      setFormData((prev) => ({
        ...prev,
        loc: value,
      }));

      // If empty value, clear everything
      if (!value || value.trim() === "") {
        setHeaderData({});
        setFormData((prev) => ({
          ...prev,
          applyDate: "",
          totalPrjArea: "",
          noOfNocs: "",
        }));
        return;
      }

      // Fetch master data for the selected location
      try {
        const plantExists = await checkIfPlantExists(value);
        if (plantExists) {
          return;
        }
        const res = await getMasterByLoc(value);
        if (res && Object.keys(res).length > 0) {
          setHeaderData(res);
        } else {
          console.warn("⚠️ No master data found for location:", value);
          setHeaderData({});
          setFormData((prev) => ({
            ...prev,
            applyDate: "",
          }));
        }
      } catch (err) {
        console.error("❌ Error fetching master by loc:", err);
        setHeaderData({});
        setFormData((prev) => ({
          ...prev,
          applyDate: "",
        }));
      }
      return;
    }

    // Normal case
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNoOfTowersChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, noOfTowers: value }));

    // Reset towerFlatsSubmitted when number of towers changes
    setTowerFlatsSubmitted(false);
    setTowerFlats({});

    const selectedTowers = parseInt(value);
    if (selectedTowers > 0) {
      setShowFlatsModal(true);
    } else {
      setShowFlatsModal(false);
    }
  };

  const handleProcessChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      process: value,
    }));
  };

  // Function to check if a file is PDF
  const isFilePDF = (file) => {
    // Check file extension
    const fileExtension = file.name.toLowerCase().endsWith(".pdf");
    // Check MIME type
    const fileMimeType = file.type === "application/pdf";

    return fileExtension && fileMimeType;
  };

  // Function to validate all files are PDF
  const validateAllFilesArePDF = (files) => {
    if (!files || files.length === 0) return true;

    for (const file of files) {
      if (!isFilePDF(file)) {
        return false;
      }
    }
    return true;
  };

  const handleSaveFlats = (flatsData) => {
    setTowerFlats(flatsData);
    setTowerFlatsSubmitted(true);
  };

  const handleFlatsModalClose = () => {
    setShowFlatsModal(false);
    // Don't mark as submitted if cancelled
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // Clear previous errors
    setErrors({});

    // Basic field validations
    if (!formData.loc) newErrors.loc = "Project location is required.";
    if (!formData.process) newErrors.process = "Process type is required.";
    if (!formData.feePaid) newErrors.feePaid = "Please specify if fee is paid.";
    if (!formData.noOfTowers)
      newErrors.noOfTowers = "Number of Towers is required.";
    if (!formData.Comments) newErrors.Comments = "Please enter the comments.";

    if (formData.feePaid === "YES" && !formData.feeAmount)
      newErrors.feeAmount = "Fee amount is required when fee is paid.";
    if (!formData.acknowledgeName)
      newErrors.acknowledgeName = "Acknowledge name is required.";

    // PDF file validations
    if (newDocs.length === 0) {
      newErrors.documents = "Please upload at least one application document.";
    } else {
      // Check if all newDocs are PDF
      if (!validateAllFilesArePDF(newDocs)) {
        newErrors.documents =
          "All application documents must be PDF files only.";
      }
    }

    if (acknowledgeDocs.length === 0) {
      newErrors.acknowledgeDocs =
        "Please upload at least one acknowledgement receipt.";
    } else {
      // Check if all acknowledgeDocs are PDF
      if (!validateAllFilesArePDF(acknowledgeDocs)) {
        newErrors.acknowledgeDocs =
          "All acknowledgement receipts must be PDF files only.";
      }
    }

    // Tower Flats validation - only if number of towers is greater than 0
    const noOfTowers = parseInt(formData.noOfTowers);
    if (noOfTowers > 0) {
      if (!towerFlatsSubmitted) {
        newErrors.towerFlats = "Please enter flats per tower details.";
      } else {
        // Check if all towers have values
        const towerKeys = Object.keys(towerFlats);
        if (towerKeys.length !== noOfTowers) {
          newErrors.towerFlats = "Please enter flats count for all towers.";
        } else {
          for (let i = 1; i <= noOfTowers; i++) {
            const key = `Tower ${i}`;
            const value = towerFlats[key];
            if (!value || value.toString().trim() === "") {
              newErrors.towerFlats = `Please enter flats count for ${key}.`;
              break;
            }
            // Validate it's a positive number
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
              newErrors.towerFlats = `Please enter a valid number for ${key}.`;
              break;
            }
          }
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setIsSubmitting(true);

    // Final validation - check all files are PDF
    if (!validateAllFilesArePDF(newDocs)) {
      toast.error("Application documents must be PDF files only.");
      setIsSubmitting(false);
      return;
    }

    if (!validateAllFilesArePDF(acknowledgeDocs)) {
      toast.error("Acknowledgement receipts must be PDF files only.");
      setIsSubmitting(false);
      return;
    }

    // Final tower flats validation
    const noOfTowers = parseInt(formData.noOfTowers);
    if (noOfTowers > 0) {
      if (
        !towerFlatsSubmitted ||
        Object.keys(towerFlats).length !== noOfTowers
      ) {
        toast.error("Please enter valid flats per tower details.");
        setIsSubmitting(false);
        return;
      }
    }

    //  --- : 'fetch User';
    let currentUserName = loggedInUser.username;
    const formPayload = new FormData();
    formPayload.append("loc", formData.loc);
    formPayload.append("process", formData.process);
    formPayload.append("applyDate", formData.applyDate);
    formPayload.append("noOfFlats", formData.noOfFlats);
    formPayload.append("comments", formData.Comments);
    formPayload.append("feePaid", formData.feePaid);
    formPayload.append("feeAmount", formData.feeAmount);
    formPayload.append("acknowledgeName", formData.acknowledgeName);
    formPayload.append("noOfTowers", formData.noOfTowers);
    formPayload.append("BuildArea", formData.BuildArea);
    formPayload.append("ProjectArea", formData.ProjectArea);
    formPayload.append("TotalArea", formData.TotalArea);
    formPayload.append("ProjectName", formData.ProjectName);
    formPayload.append("steptype", "ProvisionalNOC");
        formPayload.append('username', currentUserName);

    // Append document arrays
    acknowledgeDocs.forEach((f) => formPayload.append("Acknowledge_Doc[]", f));
    newDocs.forEach((f) => formPayload.append("New_Doc[]", f));

    // Append towerFlats data as a JSON string
    formPayload.append("towerFlats", JSON.stringify(towerFlats));

    console.log("--- FormData Payload ---");
    for (let [key, value] of formPayload.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File (name: ${value.name}, type: ${value.type}, size: ${value.size} bytes)`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    console.log("------------------------");

    try {
      const response = await submitFireForm(formPayload);

      console.log("API Response:", response);

      // Check if response has message (could be at root or in data property)
      const successMessage =
        response?.message ||
        response?.data?.message ||
        "Application submitted successfully!";

      await Swal.fire({
        icon: "success",
        title: successMessage,
        showConfirmButton: false,
        timer: 2000,
      });

      // Reset form
      setFormData({
        loc: "",
        process: "",
        applyDate: "",
        document: null,
        noOfFlats: "",
        Comments: "",
        noOfTowers: "",
        BuildArea: "",
        ProjectArea: "",
        TotalArea: "",
        ProjectName: "",
        feePaid: "",
        feeAmount: "",
        acknowledgeName: "",
      });

      // Reset document states and towerFlats
      setAcknowledgeDocs([]);
      setNewDocs([]);
      setTowerFlats({});
      setTowerFlatsSubmitted(false);

      // Navigate to create page
      navigate("/create");
    } catch (err) {
      console.error("Submission error:", err);

      // Use Swal.fire instead of toast for error
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text:
          err.response?.data?.message ||
          err.message ||
          "Submission failed. Please try again.",
      });

      if (err.response?.data?.errors) {
        console.error("Validation Errors:", err.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate("/create");
  };

  return (
    <div className="fire-form-wrapper">
      <div className="fire-form-background"></div>
      <form
        className={`fire-form-container ${
          formData.loc || formData.ProjectName ? "with-info-header" : ""
        }`}
        onSubmit={handleSubmit}
      >
        {/* MAIN HEADER */}
        <div className="fire-form-header">
          <div className="fire-header-content">
            <div className="fire-title-section">
              <div className="fire-icon-wrapper">
                <Flame className="fire-icon" size={38} />
              </div>
              <h1 className="fire-form-title">
                Fire Control Board Application
              </h1>
            </div>

            <button
              type="button"
              onClick={handleBackClick}
              className="fire-back-button-modern"
              title="Go back"
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        </div>

        <ProjectInfoHeader formData={formData} />

        <div className="form-content">
          <div className="form-section">
            <div className="section-header">
              <Home className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Project Information:</h3>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Plant Name*
                </label>
                <div className="input-wrapper">
                  <select
                    name="loc"
                    value={formData.loc}
                    onChange={handleChange}
                    className="highlight-input"
                  >
                    <option value="" hidden>
                      Select Plant
                    </option>
                    {totalMasterData.map((ele, index) => (
                      <option key={index} value={ele.LOC}>
                        {ele.LOC}
                      </option>
                    ))}
                  </select>
                  <div className="error-container">
                    {errors.loc && <p className="error-text">{errors.loc}</p>}
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <FaLeaf className="label-icon" /> Process Type
                </label>
                <div className="input-wrapper">
                  <ProcessField
                    apiUrl={`${API_BASE_URL}/fire-process`}
                    value={formData.process}
                    onChange={handleProcessChange}
                    className="form-control"
                  />
                  <div className="error-container">
                    {errors.process && (
                      <p className="error-text">{errors.process}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <FileText className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Application Details:</h3>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="field-label">
                  <FaCalendarAlt className="label-icon" /> Application Date*
                </label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    name="applyDate"
                    value={formData.applyDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Select Application Date"
                  />
                  <div className="error-container">
                    {errors.applyDate && (
                      <p className="error-text">{errors.applyDate}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-field">
                <label className="field-label">
                  <FaUpload className="label-icon" /> Upload Documents*
                </label>
                <div className="upload-container">
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <FaUpload className="upload-icon" /> Upload Files
                    {newDocs.length > 0 && (
                      <span className="upload-count">
                        ({newDocs.length} files)
                      </span>
                    )}
                  </button>
                  <div className="error-container">
                    {errors.documents && (
                      <p className="error-text">{errors.documents}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <FaUpload className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Documents:</h3>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="field-label">
                  <FaMoneyBill className="label-icon" /> Acknowledgement name
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="acknowledgeName"
                    value={formData.acknowledgeName}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter Acknowledge Name"
                  />
                  <div className="error-container">
                    {errors.acknowledgeName && (
                      <p className="error-text">{errors.acknowledgeName}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-field">
                <label className="field-label">
                  <FaUpload className="label-icon" /> Acknowledgement Receipt*
                </label>
                <div className="upload-container">
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => setShowAcknowledgeModal(true)}
                  >
                    <FaUpload className="upload-icon" /> Upload Receipts
                    {acknowledgeDocs.length > 0 && (
                      <span className="upload-count">
                        ({acknowledgeDocs.length} files)
                      </span>
                    )}
                  </button>
                  <div className="error-container">
                    {errors.acknowledgeDocs && (
                      <p className="error-text">{errors.acknowledgeDocs}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <FileCheck className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Water Requirement:</h3>
            </div>

            <div className="form-grid three-columns">
              <div className="form-group">
                <label className="field-label">Fee Paid?</label>
                <div className="radio-group-horizontal">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="feePaid"
                      value="YES"
                      checked={formData.feePaid === "YES"}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    <span className="radiomark"></span>
                    Yes
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="feePaid"
                      value="NO"
                      checked={formData.feePaid === "NO"}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    <span className="radiomark"></span>
                    No
                  </label>
                </div>
                <div className="error-container">
                  {errors.feePaid && (
                    <p className="error-text">{errors.feePaid}</p>
                  )}
                </div>
              </div>

              {formData.feePaid === "YES" && (
                <div className="form-field">
                  <label className="field-label">
                    <FaMoneyBill className="label-icon" /> Fee amount paid*
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="feeAmount"
                      value={formData.feeAmount}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Enter the Fee Amount"
                      step="0.01"
                      min="0"
                    />
                    <div className="error-container">
                      {errors.feeAmount && (
                        <p className="error-text">{errors.feeAmount}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-field">
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Number of Towers*
                </label>
                <div className="input-wrapper">
                  <select
                    name="noOfTowers"
                    value={formData.noOfTowers}
                    onChange={handleNoOfTowersChange}
                    className="modern-input"
                  >
                    <option value="">Select Number of Towers</option>
                    {[...Array(15)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <div className="error-container">
                    {errors.noOfTowers && (
                      <p className="error-text">{errors.noOfTowers}</p>
                    )}
                  </div>
                </div>
                {errors.towerFlats && (
                  <p
                    className="error-text"
                    style={{ color: "#dc3545", fontSize: "14px" }}
                  >
                    ⚠️ {errors.towerFlats}
                  </p>
                )}
              </div>

              {/* Show Tower Flats Error */}

              <div className="form-field full-width">
                <label className="field-label">
                  <MessageSquareMore className="label-icon" /> Comments*
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
                  <div className="error-container">
                    {errors.Comments && (
                      <p className="error-text">{errors.Comments}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

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

      <ReusableDialog
        open={confirmOpen}
        title="Confirm Submission"
        message="Are you sure you want to submit this fire application? You will be redirected to the create page after successful submission."
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText="Submit"
        cancelText="Cancel"
        isLoading={isSubmitting}
      />

      {/* Pass PDF validation to modals */}
      <ReraDocUploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        files={newDocs}
        setFiles={setNewDocs}
        title="Upload Application Documents"
        acceptOnlyPdf={true}
      />

      <ReraDocUploadModal
        show={showAcknowledgeModal}
        onClose={() => setShowAcknowledgeModal(false)}
        files={acknowledgeDocs}
        setFiles={setAcknowledgeDocs}
        title="Upload Acknowledgement Receipts"
        acceptOnlyPdf={true}
      />

      <FlatsPerTowerModal
        show={showFlatsModal}
        onClose={handleFlatsModalClose}
        numberOfTowers={parseInt(formData.noOfTowers) || 0}
        towerFlats={towerFlats}
        onSave={handleSaveFlats}
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

export default FireForm;
