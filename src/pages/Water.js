


// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { API_BASE_URL } from '../config/Config';
// import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
// import { ChevronLeft, FileText, Home, Droplets, MessageSquareMore, Calculator, Store, FileCheck, FolderUp, MapPinned } from "lucide-react";
// import WaterDocUploadModal from "../components/WaterDocUploadModal";
// import PlantSelect from '../components/PlantSelect';
// import ApplyDateInput from '../components/ApplyDateInput';
// import { ToastContainer, toast } from 'react-toastify';
// import ProcessField from '../components/ProcessField';
// import ReusableDialog from "../components/ReusableDialog";
// import ProjectInfoHeader from "../components/ProjectInfoHeader"
// import "../pages/Water.css"
// import { getMasterByLoc, submitWaterForm } from "../api/Api";
// import { Context } from "../context/ContextData";
// import { MenuItem, Select } from "@mui/material";

// const WaterForm = () => {
//   const navigate = useNavigate();
//   const { 
//     waterData, 
//     setWaterData, 
//     masterGetData, 
//     masterData = [],
//     totalMasterData = [], 
//     setHeaderData, 
//     headerData 
//   } = useContext(Context);

//   console.log("master data", masterData);
//   const [showModal, setShowModal] = useState(false);
//   const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
//   const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
//   const [planDocs, setplanDocs] = useState([]);
//   const [titleDocs, setTitleDocs] = useState([]);
//   const [othDocs, setOthDocs] = useState([]);
//   const [feasibilityDocs, setFeasibilityDocs] = useState([]);
//   const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [confirmOpen, setConfirmOpen] = useState(false);

//   const [formData, setFormData] = useState({
//     loc: '',
//     process: '',
//     applyDate: '',
//     document: null,
//     noOfFlats: '',
//     comments: '',
//     KLD: '',
//     amountPaid: '',
//     feasibilityDoc: null,
//     AmountPaidDoc: null,
//     noOfTowers: '',
//     ProjectBuildArea: '',
//     TotalProjectArea: '',
//     ProjectName: '',
//     STATUS: '',
//     REASON: '',
//     GHMC: '',
//     OldAmount: '',
//     TotalAmount: '',
//     Size_Of_Connection: '',
//   });


//   // useEffect(() => {
//   //   if (headerData && headerData.LOC) {


//   //     setFormData(prev => ({
//   //       ...prev,
//   //       loc: headerData?.LOC || '',
//   //       applyDate: headerData?.APPLICATION_DATE || '',
//   //       noOfTowers: headerData?.NUMBER_OF_TOWERS || '',
//   //       TotalProjectArea: headerData?.TOTAL_PROJECT_AREA || '',
//   //       ProjectBuildArea: headerData?.PROJECT_BUILD_AREA || '',
//   //       ProjectName: headerData?.PROJECT_NAME || '',
//   //       noOfFlats: headerData?.NUMBER_OF_FLATS || '',
//   //         KLD:
//   //   headerData?.NUMBER_OF_FLATS && !isNaN(headerData?.NUMBER_OF_FLATS)
//   //     ? Number(headerData.NUMBER_OF_FLATS) / 2
//   //     : ''
//   //     }));
//   //   }
//   // }, [headerData]);


//   // useEffect(() => {
//   //   if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
//   //     const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;


//   //     if (defaultLoc) {
//   //       fetchDataForLoc(defaultLoc);
//   //     }
//   //   }
//   // }, [totalMasterData]);



//   useEffect(() => {
//     const fetchProcess = async () => {
//       try {
//         const res = await axios.get(`${API_BASE_URL}/water-plants`);
//         return res.data
//       } catch (err) {
//         console.error("Error fetching water process name:", err);
//       }
//     };
//     fetchProcess();
//   }, []);



//   const fetchDataForLoc = async (loc) => {
//     try {
//       const res = await getMasterByLoc(loc);

//       if (res) {
//         setHeaderData(res);
//       }
//     } catch (error) {
//       console.error("Error fetching initial loc data:", error);
//     }
//   };




//   useEffect(() => {
//     const fetchProcess = async () => {
//       try {
//         const res = await axios.get(`${API_BASE_URL}/water-process`);
//         setFormData((prev) => ({
//           ...prev,
//           process: res.data[0].PROCESS,
//         }));
//       } catch (err) {
//         console.error("Error fetching water process name:", err);
//       }
//     };
//     fetchProcess();
//   }, []);

//   const handleChange = async (e) => {
//     const { name, value } = e.target;

//     if (name === "loc") {
//       setFormData(prev => ({ ...prev, loc: value }));

//       try {
//         const res = await getMasterByLoc(value);
//         if (res) {
//           setHeaderData(res);
//           setFormData(prev => ({
//             ...prev,
//             applyDate: '',
//             noOfTowers:  '',
//             TotalProjectArea:'',
//             ProjectBuildArea:  '',
//             ProjectName:  '',
//           }));
//         } else {
//           setHeaderData(null);
//           setFormData(prev => ({
//             ...prev,
//             applyDate: '',
//             TotalProjectArea: '',
//             ProjectBuildArea: '',
//             ProjectName: '',
//             noOfTowers: ''
//           }));
//         }
//       } catch (err) {
//         console.error("Error fetching master by loc:", err);
//         setHeaderData(null);
//         setFormData(prev => ({
//           ...prev,
//           applyDate: '',
//           noOfTowers: '',
//           TotalProjectArea: '',
//           ProjectBuildArea: '',
//           ProjectName: '',
//         }));
//       }
//       return;
//     }

//     if (name === "noOfFlats") {
//       const kld = Math.ceil(Number(value) / 2);
//       setFormData(prev => ({
//         ...prev,
//         noOfFlats: value,
//         KLD: value ? kld : ""
//       }));
//       return;
//     }

//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };


//   const handleProcessChange = (value) => {
//     setFormData((prev) => ({
//       ...prev,
//       process: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const newErrors = {};
//     if (!formData.loc) newErrors.loc = "Project location is required.";
//     if (!formData.process) newErrors.process = "Process type is required.";

//     // if (planDocs.length + titleDocs.length + othDocs.length === 0) {
//     //   newErrors.documents = "Please upload at least one document.";
//     // }

//     if (!formData.noOfFlats) newErrors.noOfFlats = "Number of flats is required.";
//     if (!formData.amountPaid) newErrors.amountPaid = "Amount paid is required.";
//     // if (!formData.KLD) newErrors.KLD = "kLD  is required.";
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     setErrors({});
//     setConfirmOpen(true);
//   };

//   const handleConfirmSubmit = async () => {
//     setConfirmOpen(false);
//     setIsSubmitting(true);

//     const formPayload = new FormData();
//     formPayload.append('loc', formData.loc);
//     formPayload.append('process', formData.process);
//     formPayload.append('applyDate', formData.applyDate);
//     formPayload.append('document', formData.document);
//     formPayload.append('noOfFlats', formData.noOfFlats);
//     formPayload.append('noOfTowers', formData.noOfTowers);
//     formPayload.append('projectBuildArea', formData.ProjectBuildArea);
//     formPayload.append('totalProjectArea', formData.TotalProjectArea);
//     formPayload.append("STATUS", formData.STATUS || "");
//     formPayload.append("REASON", formData.REASON || "");
//     formPayload.append("OldAmount", formData.OldAmount || "");
//     formPayload.append("TotalAmount", formData.TotalAmount || "");
//     formPayload.append("Size_Of_Connection", formData.Size_Of_Connection || "");
//     formPayload.append('comments', formData.comments);
//     formPayload.append('amountPaid', formData.amountPaid);
//     formPayload.append('KLD', formData.KLD);
//     formPayload.append('FeasibilityDoc', formData.feasibilityDoc);
//     formPayload.append('AmountPaidDoc', formData.AmountPaidDoc);

//     planDocs.forEach(f => formPayload.append('planDocs[]', f));
//     titleDocs.forEach(f => formPayload.append('titleDocs[]', f));
//     othDocs.forEach(f => formPayload.append('othDocs[]', f));
//     feasibilityDocs.forEach(f => formPayload.append('feasibilityDocs[]', f));
//     AmountPaidDocs.forEach(f => formPayload.append('amountPaidDocs[]', f));

//     try {
//       const data = await submitWaterForm(formPayload);

//       setWaterData(data)

//       toast.success(data.message);
//       setFormData({
//         loc: '',
//         process: '',
//         applyDate: '',
//         document: null,
//         noOfFlats: '',
//         comments: '',
//         KLD: '',
//         amountPaid: '',
//         feasibilityDoc: null,
//         AmountPaidDoc: null
//       });
//       setplanDocs([]);
//       setTitleDocs([]);
//       setOthDocs([]);
//       setFeasibilityDocs([]);
//       setAmountPaidDocs([]);
//       navigate('/create');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleBackClick = () => {
//     navigate('/create');
//   };

//   return (
//     <div className="water-form-wrapper">
//       <div className="form-background"></div>
//       <form className={`water-form-container ${(formData.loc || formData.ProjectName) ? 'with-info-header' : ''}`} onSubmit={handleSubmit}>
//         {/* MAIN HEADER */}
//         <div className="form-header">
//           <div className="header-content">
//             <div className="title-section">
//               <div className="icon-wrapper">
//                 <Droplets className="water-icon" size={32} />
//               </div>
//               <h1 className="form-title">Water Control Board Application</h1>
//               <p className="form-subtitle">
//                 Submit your water management compliance application
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={handleBackClick}
//               className="back-button-modern"
//               title="Go back"
//             >
//               <ChevronLeft size={15} />
//             </button>
//           </div>
//         </div>
//         <ProjectInfoHeader data={headerData} />
//         <div className="form-content">
//           <div className="form-section">
//             <div className="section-header">
//               <Home className="section-icon" size={20} />
//               <h3 style={{ color: '#0e7bdae7' }}>Project Information</h3>
//             </div>

//             <div className="form-grid two-columns">
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaBuilding className="label-icon" /> Project Name*
//                 </label>
//                 <div className="input-wrapper">
//                   <select
//                     name="loc"
//                     value={formData.loc}
//                     onChange={handleChange}
//                     className="modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400"
//                   >
//                     <option value="">Select Plant</option>
//                     {Array.isArray(totalMasterData) && totalMasterData.map((ele, index) => (
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
//                   <ProcessField
//                     apiUrl={`${API_BASE_URL}/water-process`}
//                     value={formData.process}
//                     onChange={handleProcessChange}
//                     className="modern-input dropdown-bottom"
//                   />
//                   <div className="error-container">
//                     {errors.process && <p className="error-text">{errors.process}</p>}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* APPLICATION DETAILS */}
//           <div className="form-section">
//             <div className="section-header">
//               <FileText className="section-icon" size={20} />
//               <h3 style={{ color: '#0e7bdae7' }}>Application Details:</h3>
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
//                     value={formData.applyDate ? formData.applyDate.slice(0, 10) : ""}
//                     onChange={handleChange}
//                     className="modern-input"
//                   />

//                   <div className="error-container">
//                     {errors.applyDate && <p className="error-text">{errors.applyDate}</p>}
//                   </div>
//                 </div>
//               </div>
//               <div className="form-field">
//                 <label className="field-label">
//                   <MapPinned className="label-icon" size={20} /> Project Name
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="text"
//                     name="ProjectName"
//                     value={formData.ProjectName}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter the Name"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* DOCUMENTS - HORIZONTAL LAYOUT */}
//           <div className="form-section">
//             <div className="section-header">
//               <FaUpload className="section-icon" size={20} />
//               <h3 style={{ color: '#0e7bdae7' }}>Documents:</h3>
//             </div>

//             <div className="form-grid three-columns">
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaMoneyBill className="label-icon" /> Amount Paid*
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="number"
//                     name="amountPaid"
//                     value={formData.amountPaid}
//                     onChange={handleChange}
//                     className="highlight-input"
//                     placeholder="Enter amount paid"
//                     step="0.01"
//                     min="0"
//                   />
//                   <div className="error-container">
//                     {errors.amountPaid && <p className="error-text">{errors.amountPaid}</p>}
//                   </div>
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label className="field-label">
//                   <FaMoneyBill className="label-icon" /> Total Project Area*
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="number"
//                     name="TotalProjectArea"
//                     value={formData.TotalProjectArea}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter th TotalProjectArea"
//                     step="0.01"
//                     min="0"
//                   />
//                   <div className="error-container">
//                     {errors.TotalProjectArea && <p className="error-text">{errors.TotalProjectArea}</p>}
//                   </div>
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label className="field-label">
//                   <FaMoneyBill className="label-icon" /> Number of Towers*
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="number"
//                     name="noOfTowers"
//                     value={formData.noOfTowers}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter the Number of Towers"
//                     step="0.01"
//                     min="0"
//                   />
//                   <div className="error-container">
//                     {errors.noOfTowers && <p className="error-text">{errors.noOfTowers}</p>}
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
//                     onClick={() => setShowModal(true)}
//                   >
//                     <FaUpload className="upload-icon" /> Upload Documents
//                     <span className="upload-count">
//                       {(planDocs.length + titleDocs.length + othDocs.length) > 0 &&
//                         `(${planDocs.length + titleDocs.length + othDocs.length} files)`}
//                     </span>
//                   </button>
//                   <div className="error-container">
//                     {errors.documents && <p className="error-text">{errors.documents}</p>}
//                   </div>
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label className="field-label">
//                   <FolderUp className="label-icon" size={20} />Paid Document
//                 </label>
//                 <div className="upload-container">
//                   <button
//                     type="button"
//                     className="upload-button"
//                     onClick={() => setAmountPaidDocModal(true)}
//                   >
//                     <FaUpload className="upload-icon" />  Upload Documents
//                     <span className="upload-count">
//                       {AmountPaidDocs.length > 0 &&
//                         `(${AmountPaidDocs.length} files)`}
//                     </span>
//                   </button>
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label className="field-label">
//                   <FaFileAlt className="label-icon" /> Feasibility Certificate
//                 </label>
//                 <div className="upload-container">
//                   <button
//                     type="button"
//                     className="upload-button"
//                     onClick={() => setShowFeasibilityModal(true)}
//                   >
//                     <FaUpload className="upload-icon" /> Upload Feasibility
//                     <span className="upload-count">
//                       {feasibilityDocs.length > 0 &&
//                         `(${feasibilityDocs.length} files)`}
//                     </span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* WATER REQUIREMENT */}
//           <div className="form-section">
//             <div className="section-header">
//               <FileCheck className="section-icon" size={20} />
//               <h3 style={{ color: '#0e7bdae7' }}>Water Requirement:</h3>
//             </div>

//             <div className="form-grid three-columns">
//               <div className="form-field  mb-3">
//                 <label className="field-label">
//                   <Store className="label-icon" size={20} /> Number of Flats*
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="number"
//                     name="noOfFlats"
//                     value={formData.noOfFlats}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter total number of flats"
//                     min="1"
//                   />
//                   <div className="error-container">
//                     {errors.noOfFlats && <p className="error-text">{errors.noOfFlats}</p>}
//                   </div>
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label className="field-label">
//                   <Calculator className="label-icon" size={20} /> KLD
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="text"
//                     name="KLD"
//                     value={formData.KLD}
//                     readOnly
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter the KLD"
//                   />
//                 </div>
//               </div>
//               <div className="form-field">
//                 <label className="field-label">
//                   <Calculator className="label-icon" size={20} />Project Build Area
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="text"
//                     name="ProjectBuildArea"
//                     value={formData.ProjectBuildArea}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter the ProjectBuildArea"
//                   />
//                 </div>
//               </div>

//               <div className="form-field full-width">
//                 <label className="fire-field-label" style={{ marginTop: '-20px' }}>
//                   <MessageSquareMore className="label-icon" /> Comments
//                 </label>
//                 <div className="input-wrapper">
//                   <textarea
//                     name="comments"
//                     value={formData.comments}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter your comments"
//                     rows="2"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* SUBMIT BUTTON */}
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
//         message="Are you sure you want to submit this application? You will be redirected to the create page after successful submission."
//         onClose={() => setConfirmOpen(false)}
//         onConfirm={handleConfirmSubmit}
//         confirmText="Submit"
//         cancelText="Cancel"
//         isLoading={isSubmitting}
//       />

//       <WaterDocUploadModal
//         show={showModal}
//         onClose={() => setShowModal(false)}
//         linkDocs={planDocs}
//         setLinkDocs={setplanDocs}
//         landDocs={titleDocs}
//         setLandDocs={setTitleDocs}
//         othDocs={othDocs}
//         setOthDocs={setOthDocs}
//         title="Upload Documents"
//       />

//       <WaterDocUploadModal
//         show={showFeasibilityModal}
//         onClose={() => setShowFeasibilityModal(false)}
//         linkDocs={feasibilityDocs}
//         setLinkDocs={setFeasibilityDocs}
//         title="Upload Feasibility Certificate"
//         showLandDocs={false}
//         showOthDocs={false}
//       />

//       <WaterDocUploadModal
//         show={amountPaidDocModal}
//         onClose={() => setAmountPaidDocModal(false)}
//         linkDocs={AmountPaidDocs}
//         setLinkDocs={setAmountPaidDocs}
//         title="Upload Paid Document Certificate"
//         showLandDocs={false}
//         showOthDocs={false}
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

// export default WaterForm;


import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config/Config';
import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, Droplets, MessageSquareMore, Calculator, Store, FileCheck, FolderUp, MapPinned } from "lucide-react";
import WaterDocUploadModal from "../components/WaterDocUploadModal";
import PlantSelect from '../components/PlantSelect';
import ApplyDateInput from '../components/ApplyDateInput';
import { ToastContainer, toast } from 'react-toastify';
import ProcessField from '../components/ProcessField';
import ReusableDialog from "../components/ReusableDialog";
import ProjectInfoHeader from "../components/ProjectInfoHeader"
import "../pages/Water.css"
import { getMasterByLoc, submitWaterForm } from "../api/Api";
import { Context } from "../context/ContextData";
import { MenuItem, Select } from "@mui/material";
import Swal from "sweetalert2";

const WaterForm = () => {
  const navigate = useNavigate();
  const {
    waterData,
    setWaterData,
    masterGetData,
    masterData = [],
    totalMasterData = [],
    setHeaderData,
    headerData
  } = useContext(Context);

  console.log("master data", masterData);
  const [showModal, setShowModal] = useState(false);
  const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
  const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
  const [planDocs, setplanDocs] = useState([]);
  const [titleDocs, setTitleDocs] = useState([]);
  const [othDocs, setOthDocs] = useState([]);
  const [feasibilityDocs, setFeasibilityDocs] = useState([]);
  const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    loc: '',
    process: '',
    applyDate: '',
    document: null,
    noOfFlats: '',
    comments: '',
    KLD: '',
    amountPaid: '',
    feasibilityDoc: null,
    AmountPaidDoc: null,
    noOfTowers: '',
    ProjectBuildArea: '',
    TotalProjectArea: '',
    ProjectName: '',
    STATUS: '',
    REASON: '',
    GHMC: '',
    OldAmount: '',
    TotalAmount: '',
    Size_Of_Connection: '',
  });

  // Validate file type - PDF only
  const validateFileType = (file) => {
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.pdf'];
    const validMimeTypes = ['application/pdf'];

    const isValidExtension = validExtensions.includes(fileExtension);
    const isValidMimeType = !file.type || validMimeTypes.includes(file.type);

    return isValidExtension && isValidMimeType;
  };

  // Validate all documents are PDF
  const validateDocuments = () => {
    const allDocs = [...planDocs, ...titleDocs, ...othDocs, ...feasibilityDocs, ...AmountPaidDocs];
    const invalidFiles = allDocs.filter(file => !validateFileType(file));
    return invalidFiles.length === 0;
  };

  // Check if at least one document is uploaded
  const hasAtLeastOneDocument = () => {
    return planDocs.length > 0 || titleDocs.length > 0 || othDocs.length > 0 ||
      feasibilityDocs.length > 0 || AmountPaidDocs.length > 0;
  };



   const checkIfPlantExists = async (plant) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/check-plant-exists-water`, { loc: plant });
        console.log("API Response:", res.data);
        
        // Check if the response has a specific property indicating existence
        if (res.data && res.data.exists === true) {
      
            toast.error('This plant already has entries.');
            setFormData((prev) => ({ ...prev, loc: '' }));
            setHeaderData(null);
            return true; // Plant exists
        }
        return false; // Plant doesn't exist
    } catch (error) {
        console.error('Failed to check plant:', error);
        // Don't clear the selection on error
        return false;
    }
};

  // Fetch process
  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/water-plants`);
        return res.data
      } catch (err) {
        console.error("Error fetching water process name:", err);
      }
    };
    fetchProcess();
  }, []);

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

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/water-process`);
        setFormData((prev) => ({
          ...prev,
          process: res.data[0].PROCESS,
        }));
      } catch (err) {
        console.error("Error fetching water process name:", err);
      }
    };
    fetchProcess();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "loc") {
      setFormData(prev => ({ ...prev, loc: value }));

      try {
        const plantExists = await checkIfPlantExists(value);
      
            if (plantExists) {
                return; 
            }
        const res = await getMasterByLoc(value);
        if (res) {
          setHeaderData(res);
          setFormData(prev => ({
            ...prev,
            applyDate: '',
            noOfTowers: '',
            TotalProjectArea: '',
            ProjectBuildArea: '',
            ProjectName: '',
          }));
        } else {
          setHeaderData(null);
          setFormData(prev => ({
            ...prev,
            applyDate: '',
            TotalProjectArea: '',
            ProjectBuildArea: '',
            ProjectName: '',
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
          TotalProjectArea: '',
          ProjectBuildArea: '',
          ProjectName: '',
        }));
      }
      return;
    }

    if (name === "noOfFlats") {
      const kld = Math.ceil(Number(value) / 2);
      setFormData(prev => ({
        ...prev,
        noOfFlats: value,
        KLD: value ? kld : ""
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProcessChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      process: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    // Required field validations
    if (!formData.loc) newErrors.loc = "Project location is required.";
    if (!formData.process) newErrors.process = "Process type is required.";
    if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
    if (!formData.amountPaid) newErrors.amountPaid = "Amount paid is required.";
    if (!formData.TotalProjectArea) newErrors.TotalProjectArea = "Total project area is required.";
    if (!formData.noOfTowers) newErrors.noOfTowers = "Number of towers is required.";
    if (!formData.noOfFlats) newErrors.noOfFlats = "Number of flats is required.";
    if (!formData.ProjectBuildArea) newErrors.ProjectBuildArea = "Project build area is required.";
    if (!formData.comments) newErrors.comments = "Comments are required.";

    // Document validation
    if (!hasAtLeastOneDocument()) {
      newErrors.documents = "Please upload at least one document.";
    } else if (!validateDocuments()) {
      newErrors.documents = "Only PDF files are allowed for upload.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Show toast for the first error
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }

    setErrors({});
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setIsSubmitting(true);

    const formPayload = new FormData();
    formPayload.append('loc', formData.loc);
    formPayload.append('process', formData.process);
    formPayload.append('applyDate', formData.applyDate);
    formPayload.append('document', formData.document);
    formPayload.append('noOfFlats', formData.noOfFlats);
    formPayload.append('noOfTowers', formData.noOfTowers);
    formPayload.append('projectBuildArea', formData.ProjectBuildArea);
    formPayload.append('totalProjectArea', formData.TotalProjectArea);
    formPayload.append("STATUS", formData.STATUS || "");
    formPayload.append("REASON", formData.REASON || "");
    formPayload.append("OldAmount", formData.OldAmount || "");
    formPayload.append("TotalAmount", formData.TotalAmount || "");
    formPayload.append("Size_Of_Connection", formData.Size_Of_Connection || "");
    formPayload.append('comments', formData.comments);
    formPayload.append('amountPaid', formData.amountPaid);
    formPayload.append('KLD', formData.KLD);
    formPayload.append('FeasibilityDoc', formData.feasibilityDoc);
    formPayload.append('AmountPaidDoc', formData.AmountPaidDoc);

    // Only append valid PDF files
    planDocs.forEach(f => {
      if (validateFileType(f)) {
        formPayload.append('planDocs[]', f);
      }
    });
    titleDocs.forEach(f => {
      if (validateFileType(f)) {
        formPayload.append('titleDocs[]', f);
      }
    });
    othDocs.forEach(f => {
      if (validateFileType(f)) {
        formPayload.append('othDocs[]', f);
      }
    });
    feasibilityDocs.forEach(f => {
      if (validateFileType(f)) {
        formPayload.append('feasibilityDocs[]', f);
      }
    });
    AmountPaidDocs.forEach(f => {
      if (validateFileType(f)) {
        formPayload.append('amountPaidDocs[]', f);
      }
    });

    try {
      const res = await submitWaterForm(formPayload);
      console.log("ddddddddddd1111111111111111111",res);

      setWaterData(res)

      if (res.data.message) {
        Swal.fire({
          icon: "success",
          title: res.data.message,
          showConfirmButton: false,
          timer: 3000, // Changed to 3 seconds for better UX
        }).then(() => {
          // Reset form
          setFormData({
            loc: '',
            process: '',
            applyDate: '',
            document: null,
            noOfFlats: '',
            comments: '',
            KLD: '',
            amountPaid: '',
            feasibilityDoc: null,
            AmountPaidDoc: null,
            noOfTowers: '',
            ProjectBuildArea: '',
            TotalProjectArea: '',
            ProjectName: '',
          });
          setplanDocs([]);
          setTitleDocs([]);
          setOthDocs([]);
          setFeasibilityDocs([]);
          setAmountPaidDocs([]);
          setErrors({});
          navigate('/create');


        });
      } else {
    
        Swal.fire({
          icon: "success",
          title: "Application submitted successfully!",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          // Reset form
          setFormData({
            loc: '',
            process: '',
            applyDate: '',
            document: null,
            noOfFlats: '',
            comments: '',
            KLD: '',
            amountPaid: '',
            feasibilityDoc: null,
            AmountPaidDoc: null,
            noOfTowers: '',
            ProjectBuildArea: '',
            TotalProjectArea: '',
            ProjectName: '',
          });
          setplanDocs([]);
          setTitleDocs([]);
          setOthDocs([]);
          setFeasibilityDocs([]);
          setAmountPaidDocs([]);
          setErrors({});
          navigate('/create');

        });
      }


    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate('/create');
  };

  return (
    <div className="water-form-wrapper">
      <div className="form-background"></div>
      <form className={`water-form-container ${(formData.loc || formData.ProjectName) ? 'with-info-header' : ''}`} onSubmit={handleSubmit}>
        {/* MAIN HEADER */}
        <div className="form-header">
          <div className="header-content">
            <div className="title-section">
              <div className="icon-wrapper">
                <Droplets className="water-icon" size={32} />
              </div>
              <h1 className="form-title">Water Control Board Application</h1>
              <p className="form-subtitle">
                Submit your water management compliance application
              </p>
            </div>

            <button
              type="button"
              onClick={handleBackClick}
              className="back-button-modern"
              title="Go back"
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        </div>
        <ProjectInfoHeader data={headerData} />
        <div className="form-content">
          <div className="form-section">
            <div className="section-header">
              <Home className="section-icon" size={20} />
              <h3 style={{ color: '#0e7bdae7' }}>Project Information</h3>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Project Name*
                </label>
                <div className="input-wrapper">
                  <select
                    name="loc"
                    value={formData.loc}
                    onChange={handleChange}
                    className={`modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400 ${errors.loc ? 'error-border' : ''}`}
                  >
                    <option value="">Select Plant</option>
                    {Array.isArray(totalMasterData) && totalMasterData.map((ele, index) => (
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
                  <FaLeaf className="label-icon" /> Process Type*
                </label>
                <div className="input-wrapper">
                  <ProcessField
                    apiUrl={`${API_BASE_URL}/water-process`}
                    value={formData.process}
                    onChange={handleProcessChange}
                    className={`modern-input dropdown-bottom ${errors.process ? 'error-border' : ''}`}
                  />
                  <div className="error-container">
                    {errors.process && <p className="error-text">{errors.process}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* APPLICATION DETAILS */}
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
                  <input
                    type="date"
                    name="applyDate"
                    value={formData.applyDate ? formData.applyDate.slice(0, 10) : ""}
                    onChange={handleChange}
                    className={`modern-input ${errors.applyDate ? 'error-border' : ''}`}
                    max={new Date().toISOString().split('T')[0]} // Disable future dates
                  />
                  <div className="error-container">
                    {errors.applyDate && <p className="error-text">{errors.applyDate}</p>}
                  </div>
                </div>
              </div>
              <div className="form-field">
                <label className="field-label">
                  <MapPinned className="label-icon" size={20} /> Project Name
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="ProjectName"
                    value={formData.ProjectName}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter the Name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DOCUMENTS - HORIZONTAL LAYOUT */}
          <div className="form-section">
            <div className="section-header">
              <FaUpload className="section-icon" size={20} />
              <h3 style={{ color: '#0e7bdae7' }}>Documents:</h3>
            </div>

            <div className="form-grid three-columns">
              <div className="form-field">
                <label className="field-label">
                  <FaMoneyBill className="label-icon" /> Amount Paid*
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    className={`modern-input ${errors.amountPaid ? 'error-border' : ''}`}
                    placeholder="Enter amount paid"
                    step="0.01"
                    min="0"
                  />
                  <div className="error-container">
                    {errors.amountPaid && <p className="error-text">{errors.amountPaid}</p>}
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <FaMoneyBill className="label-icon" /> Total Project Area*
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    name="TotalProjectArea"
                    value={formData.TotalProjectArea}
                    onChange={handleChange}
                    className={`modern-input ${errors.TotalProjectArea ? 'error-border' : ''}`}
                    placeholder="Enter the Total Project Area"
                    step="0.01"
                    min="0"
                  />
                  <div className="error-container">
                    {errors.TotalProjectArea && <p className="error-text">{errors.TotalProjectArea}</p>}
                  </div>
                </div>
              </div>

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
                    className={`modern-input ${errors.noOfTowers ? 'error-border' : ''}`}
                    placeholder="Enter the Number of Towers"
                    min="0"
                  />
                  <div className="error-container">
                    {errors.noOfTowers && <p className="error-text">{errors.noOfTowers}</p>}
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
                    className={`upload-button ${errors.documents ? 'error-border' : ''}`}
                    onClick={() => setShowModal(true)}
                  >
                    <FaUpload className="upload-icon" /> Upload Documents
                    <span className="upload-count">
                      {(planDocs.length + titleDocs.length + othDocs.length) > 0 &&
                        `(${planDocs.length + titleDocs.length + othDocs.length} files)`}
                    </span>
                  </button>
                  <div className="error-container">
                    {errors.documents && <p className="error-text">{errors.documents}</p>}
                  </div>
                  
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <FolderUp className="label-icon" size={20} /> Paid Document
                </label>
                <div className="upload-container">
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => setAmountPaidDocModal(true)}
                  >
                    <FaUpload className="upload-icon" /> Upload Documents
                    <span className="upload-count">
                      {AmountPaidDocs.length > 0 &&
                        `(${AmountPaidDocs.length} files)`}
                    </span>
                  </button>
                
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <FaFileAlt className="label-icon" /> Feasibility Certificate
                </label>
                <div className="upload-container">
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => setShowFeasibilityModal(true)}
                  >
                    <FaUpload className="upload-icon" /> Upload Feasibility
                    <span className="upload-count">
                      {feasibilityDocs.length > 0 &&
                        `(${feasibilityDocs.length} files)`}
                    </span>
                  </button>
             
                </div>
              </div>
            </div>
          </div>

          {/* WATER REQUIREMENT */}
          <div className="form-section">
            <div className="section-header">
              <FileCheck className="section-icon" size={20} />
              <h3 style={{ color: '#0e7bdae7' }}>Water Requirement:</h3>
            </div>

            <div className="form-grid three-columns">
              <div className="form-field">
                <label className="field-label">
                  <Store className="label-icon" size={20} /> Number of Flats*
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    name="noOfFlats"
                    value={formData.noOfFlats}
                    onChange={handleChange}
                    className={`modern-input ${errors.noOfFlats ? 'error-border' : ''}`}
                    placeholder="Enter total number of flats"
                    min="1"
                  />
                  <div className="error-container">
                    {errors.noOfFlats && <p className="error-text">{errors.noOfFlats}</p>}
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Calculator className="label-icon" size={20} /> KLD
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="KLD"
                    value={formData.KLD}
                    readOnly
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="KLD will be calculated automatically"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Calculator className="label-icon" size={20} /> Project Build Area*
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="ProjectBuildArea"
                    value={formData.ProjectBuildArea}
                    onChange={handleChange}
                    className={`modern-input ${errors.ProjectBuildArea ? 'error-border' : ''}`}
                    placeholder="Enter the Project Build Area"
                  />
                  <div className="error-container">
                    {errors.ProjectBuildArea && <p className="error-text">{errors.ProjectBuildArea}</p>}
                  </div>
                </div>
              </div>

              <div className="form-field full-width">
                <label className="field-label" style={{ marginTop: '-20px' }}>
                  <MessageSquareMore className="label-icon" /> Comments*
                </label>
                <div className="input-wrapper">
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    className={`modern-input ${errors.comments ? 'error-border' : ''}`}
                    placeholder="Enter your comments"
                    rows="2"
                  />
                  <div className="error-container">
                    {errors.comments && <p className="error-text">{errors.comments}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
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
        message="Are you sure you want to submit this application? You will be redirected to the create page after successful submission."
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText="Submit"
        cancelText="Cancel"
        isLoading={isSubmitting}
      />

      <WaterDocUploadModal
        show={showModal}
        onClose={() => setShowModal(false)}
        linkDocs={planDocs}
        setLinkDocs={setplanDocs}
        landDocs={titleDocs}
        setLandDocs={setTitleDocs}
        othDocs={othDocs}
        setOthDocs={setOthDocs}
        tableType="water"
  apiType="water"

        title="Upload Documents"

        validateFileType={validateFileType}
      />

      <WaterDocUploadModal
        show={showFeasibilityModal}
        onClose={() => setShowFeasibilityModal(false)}
        linkDocs={feasibilityDocs}
        setLinkDocs={setFeasibilityDocs}
        title="Upload Feasibility Certificate"
        showLandDocs={false}
        showOthDocs={false}
        validateFileType={validateFileType}
      />

      <WaterDocUploadModal
        show={amountPaidDocModal}
        onClose={() => setAmountPaidDocModal(false)}
        linkDocs={AmountPaidDocs}
        setLinkDocs={setAmountPaidDocs}
        title="Upload Paid Document Certificate"
        showLandDocs={false}
        showOthDocs={false}
        validateFileType={validateFileType}
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

export default WaterForm;