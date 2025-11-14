import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config/Config';
import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, Droplets, MessageSquareMore, CircleDivide, Calculator, Store, FileCheck2, FileCheck, FolderUp, Caravan, Hotel, MapPinHouse, BookUser, LayoutDashboard, ClipboardList, MessageCircle, MessageCircleMore, Landmark, Warehouse, University } from "lucide-react";
import WaterDocUploadModal from "../components/WaterDocUploadModal";
import PlantSelect from '../components/PlantSelect';
import ApplyDateInput from '../components/ApplyDateInput';
import { ToastContainer, toast } from 'react-toastify';
import ProcessField from '../components/ProcessField';
import ReusableDialog from "../components/ReusableDialog";
import { getMasterByLoc, submitReraForm } from "../api/Api";
import { Context } from "../context/ContextData";
import "../pages/Water.css"
import ProjectInfoHeader from "../components/ProjectInfoHeader";


const ReraForm = () => {
  const navigate = useNavigate();
  const {setFormReraData, totalMasterData = [], setHeaderData, headerData  } = useContext(Context);


  const [showModal, setShowModal] = useState(false);
const [amountPaidDocModal, setAmountPaidDocModal]  = useState(false);
  const [planDocs, setplanDocs] = useState([]);
  const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
 

  const [formData, setFormData] = useState({
    loc: '',
    process: '',
    applyDate: '',
    document: null,
    projectDetails: '',
    address: '',
    Comments: '',
  });


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
      if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
        const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;
        if (defaultLoc) {
          fetchDataForLoc(defaultLoc);
        }
      }
    }, [totalMasterData]);
 
    useEffect(() => {
    const fetchProcess = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/rera-process`);
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
    const { name, value, type, checked } = e.target;

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
          applyDate: ""
        }));
        return;
      }

      // Fetch master data for the selected location
      try {
        const res = await getMasterByLoc(value);
        if (res && Object.keys(res).length > 0) {
          setHeaderData(res);

          setFormData((prev) => ({
            ...prev,
      
          }));
        } else {
          console.warn('⚠️ No master data found for location:', value);
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


  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  //   // Clear error when user starts typing
  //   if (errors[name]) {
  //     setErrors(prev => ({ ...prev, [name]: '' }));
  //   }
  // };

  const handleProcessChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      process: value,
    }));
    if (errors.process) {
      setErrors(prev => ({ ...prev, process: '' }));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

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
  formPayload.append('prjName', formData.projectDetails);
  formPayload.append('address', formData.address);
  formPayload.append('comments', formData.Comments || '');

  // ✅ Append multiple uploaded docs (from AmountPaidDocs state)
  if (AmountPaidDocs && AmountPaidDocs.length > 0) {
    AmountPaidDocs.forEach((file) => {
      formPayload.append('UPLOAD_DOC[]', file);
    });
  }

  try {
    const data = await submitReraForm(formPayload);
    setFormReraData(data);

    toast.success(data.message || "Application submitted successfully!");

    // Reset form
    setFormData({ 
      loc: '', 
      process: '', 
      applyDate: '', 
      document: null, 
      address: '',
      projectDetails: '',
      Comments: '', 
    });
    setplanDocs([]);
    setAmountPaidDocs([]); 

    navigate('/create');
  } catch (err) {
    console.error("Submission error:", err);
    toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};


  // const handleConfirmSubmit = async () => {
  //   setConfirmOpen(false);
  //   setIsSubmitting(true);

  //   const formPayload = new FormData();
   

  //   formPayload.append('PLANT_NAME', formData.loc);
  //   formPayload.append('PROCESS_TYPE', formData.process);
  //   formPayload.append('APPLICATION_DATE', formData.applyDate);
  //   formPayload.append('PROJECT_NAME', formData.projectDetails);
  //   formPayload.append('ADDRESS', formData.address);
  //   formPayload.append('COMMENTS', formData.Comments || '');
  //   formPayload.append('UPLOAD_DOC', formData.document);
  

  //     if (formData.uploadDoc) {
  //     formPayload.append('UPLOAD_DOC', formData.uploadDoc);
  //   }
  // AmountPaidDocs.forEach(f => formPayload.append('UPLOAD_DOC', f))
  //   console.log(formData, "form!!!!!!!!!!!!!!!!!!!")

  //   try {
  //     const data = await submitReraForm(formPayload);
  //     setFormReraData(data)
  //     console.log(data.message, "response data");
      
  
  //     toast.success(data.message || "Application submitted successfully!");
      
  //     // Reset form
  //     setFormData({ 
  //       loc: '', 
  //       process: '', 
  //       applyDate: '', 
  //       document: null, 
  //       address: '',
  //       projectDetails: '',
  //       Comments: '', 
  //     });
  //     setplanDocs([]);
    
  


  //       navigate('/create');
 
  //   } catch (err) {
  //     console.error("Submission error:", err);
  //     toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleBackClick = () => {
    navigate('/create');
  };


  return (
    <div className="water-form-wrapper">
      <div className="form-background"></div>
      
      <form className="water-form-container" onSubmit={handleSubmit} noValidate>
        {/* HEADER */}
        <header className="form-header">
          <div className="header-content">
            <div className="title-section">
              <div className="icon-wrapper">
                <University className="water-icon" size={32} />
              </div>
              <h1 className="form-title">RERA Control Board Application</h1>
              <p className="form-subtitle">
                Submit your RERA management compliance application with ease
              </p>
            </div>
         
            <button
              type="button"
              onClick={handleBackClick}
              className="back-button-modern"
              title="Go back to dashboard"
              aria-label="Go back"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
        </header>
   <ProjectInfoHeader data={headerData} />
        <div className="form-content">
          {/* PROJECT INFORMATION SECTION */}
          <div className="form-section" aria-labelledby="project-info-heading">
            <div className="section-header">
              <Home className="section-icon" size={20} />
              <h2 className="section-title" >Plant Information:</h2>
            </div>

            <div className="form-grid two-columns">
              <div className={`form-field ${errors.loc ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="project-name">
                  <Hotel className="label-icon"  size={20}/> 
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
                    {Array.isArray(totalMasterData) && totalMasterData.map((ele, index) => (
                      <option key={index} value={ele.LOC}>
                        {ele.LOC}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`form-field ${errors.process ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="process-type">
                  <FaLeaf className="label-icon" /> 
                  Process Type <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <ProcessField
                    id="process-type"
                   apiUrl={`${API_BASE_URL}/water-process`}
                    value={formData.process}
                    onChange={handleProcessChange}
                    className={`modern-input ${errors.process ? 'error' : ''}`}
                    aria-describedby={errors.process ? "process-type-error" : undefined}
                  />
                  {errors.process && (
                    <div className="error-container">
                      <p id="process-type-error" className="error-text" role="alert">
                        {errors.process}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* APPLICATION DETAILS SECTION */}
          <section className="form-section" aria-labelledby="app-details-heading">
            <div className="section-header">
              <FileText className="section-icon" size={20}  />
              <h2 id="app-details-heading" className="section-title">Application Details:</h2>
            </div>

            <div className="form-grid two-columns">
              <div className={`form-field ${errors.applyDate ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="apply-date">
                  <FaCalendarAlt className="label-icon" /> 
                  Application Date*
                </label>
                <div className="input-wrapper">
                  <ApplyDateInput
                    id="apply-date"
                    value={formData.applyDate}
                    onChange={handleChange}
                    className={`modern-input ${errors.applyDate ? 'error' : ''}`}
                    aria-describedby={errors.applyDate ? "apply-date-error" : undefined}
                  />
                  {errors.applyDate && (
                    <div className="error-container">
                      <p id="apply-date-error" className="error-text" role="alert">
                        {errors.applyDate}
                      </p>
                    </div>
                  )}
                </div>
              </div>

 
              <div className={`form-field ${errors.documents ? 'has-error' : ''}`}>
                <label className="field-label">
                  <FaUpload className="label-icon" /> 
                  Upload Documents*
                </label>
             <div className="upload-container">
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => setAmountPaidDocModal(true)}
                  >
                    <FaUpload className="upload-icon" />  Upload Paid Documents
                    <span className="upload-count">
                      {AmountPaidDocs.length > 0 &&
                        `(${AmountPaidDocs.length} files)`}
                    </span>
                  </button>
                        <div className="error-container">
                    {errors.AmountPaidDoc && <p className="error-text">{errors.AmountPaidDoc}</p>}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PROJECT DETAILS SECTION */}
          <section className="form-section" aria-labelledby="project-details-heading">
            <div className="section-header">
              <FaBuilding className="section-icon" size={20} />
              <h2 id="project-details-heading" className="section-title">Project Details:</h2>
            </div>

            <div className="form-grid two-columns">
              <div className={`form-field ${errors.projectDetails ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="plant-details">
                  <ClipboardList className="label-icon" /> 
                  Project Name*
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="plant-details"
                    name="projectDetails"
                    value={formData.projectDetails}
                    onChange={handleChange}
                    className={`modern-input ${errors.projectDetails ? 'error' : ''}`}
                    placeholder="Enter plant details"
                    aria-describedby={errors.projectDetails ? "plant-details-error" : undefined}
                  />
                  {errors.projectDetails && (
                    <div className="error-container">
                      <p id="plant-details-error" className="error-text" role="alert">
                        {errors.projectDetails}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`form-field ${errors.address ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="address">
                  <BookUser className="label-icon" size={20} /> 
                  Address*
                </label>
                <div className="input-wrapper">
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`modern-input ${errors.address ? 'error' : ''}`}
                    placeholder="Enter project address"
                    aria-describedby={errors.address ? "address-error" : undefined}
                  />
                  {errors.address && (
                    <div className="error-container">
                      <p id="address-error" className="error-text" role="alert">
                        {errors.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ADDITIONAL COMMENTS SECTION */}
          <section className="form-section" aria-labelledby="comments-heading">
            <div className="section-header">
              <MessageSquareMore className="section-icon" size={20} />
              <h2 id="comments-heading" className="section-title">Additional Comments:</h2>
            </div>

            <div className="form-grid single-column">
              <div className="form-field">
                <label className="field-label" htmlFor="comments">
                  <MessageCircleMore className="label-icon" size= {20} /> 
                  Comments
                </label>
                <div className="input-wrapper">
                  <textarea
                    id="comments"
                    name="Comments"
                    value={formData.Comments}
                    onChange={handleChange}
                    className="comment-inputs"
                    placeholder="Enter any additional comments or special requirements"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* FORM ACTIONS */}
          <div className="form-actions">
            <button
              type="submit"
              className={`submit-button ${isSubmitting ? "submitting" : ""}`}
              disabled={isSubmitting}
              aria-describedby="submit-button-description"
              style={{marginTop: '18px'}}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" aria-hidden="true"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaWater className="submit-icon" aria-hidden="true" /> 
                  Submit
                </>
              )}
            </button>
            <p id="submit-button-description" className="sr-only">
              Submit your RERA board application
            </p>
          </div>
        </div>
      </form>

      {/* MODALS AND DIALOGS */}
      <ReusableDialog
        open={confirmOpen}
        title="Confirm Submission"
        message="Are you sure you want to submit this application? Please review all information before proceeding. You will be redirected to the dashboard after successful submission."
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText="Yes, Submit"
        cancelText="Cancel"
        isLoading={isSubmitting}
      />
      

        <WaterDocUploadModal
        show={amountPaidDocModal}
        onClose={() => setAmountPaidDocModal(false)}
        linkDocs={AmountPaidDocs}
        setLinkDocs={setAmountPaidDocs}
        title="Upload Paid Document Certificate"
        showLandDocs={false}
        showOthDocs={false}
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
        theme="light"
      />
    </div>
  );
};

export default ReraForm;


// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// // import { API_BASE_URL } from '../config/Config';
// import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
// import { ChevronLeft, FileText, Home, Droplets, MessageSquareMore, CircleDivide, Calculator, Store, FileCheck2, FileCheck, FolderUp, Caravan, Hotel, MapPinHouse, BookUser, LayoutDashboard, ClipboardList, MessageCircle, MessageCircleMore, Landmark, Warehouse, University } from "lucide-react";
// import WaterDocUploadModal from "../components/WaterDocUploadModal";
// import PlantSelect from '../components/PlantSelect';
// import ApplyDateInput from '../components/ApplyDateInput';
// import { ToastContainer, toast } from 'react-toastify';
// import ProcessField from '../components/ProcessField';
// import ReusableDialog from "../components/ReusableDialog";
// import { Context } from "../context/ContextData";
// import "../pages/Water.css"

// // Direct API URL
// const API_BASE_URL = 'http://127.0.0.1:8000/api';

// const ReraForm = () => {
//   const navigate = useNavigate();
//   const { waterData, setWaterData } = useContext(Context);
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
//     uploadDoc: null, // Changed from 'document' to match API
//     projectDetails: '',
//     address: '',
//     Comments: '',
//   });

//   useEffect(() => {
//     const fetchProcess = async () => {
//       try {
//         // Updated to use RERA process endpoint if you have one
//         const res = await axios.get(`${API_BASE_URL}/rera-process`);
//         setFormData((prev) => ({
//           ...prev,
//           process: res.data[0]?.PROCESS || '',
//         }));
//       } catch (err) {
//         console.error("Error fetching RERA process name:", err);
//         // Fallback if no specific RERA process endpoint exists
//         setFormData((prev) => ({
//           ...prev,
//           process: 'RERA Registration',
//         }));
//       }
//     };
//     fetchProcess();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
    
//     if (files && files.length > 0) {
//       // Handle file input
//       setFormData((prev) => ({
//         ...prev,
//         [name]: files[0],
//       }));
//     } else {
//       // Handle regular input
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleProcessChange = (value) => {
//     setFormData((prev) => ({
//       ...prev,
//       process: value,
//     }));
//     if (errors.process) {
//       setErrors(prev => ({ ...prev, process: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.loc.trim()) {
//       newErrors.loc = "Plant name is required.";
//     }
    
//     if (!formData.process.trim()) {
//       newErrors.process = "Process type is required.";
//     }
    
//     if (!formData.applyDate) {
//       newErrors.applyDate = "Application date is required.";
//     }
    
//     if (!formData.projectDetails.trim()) {
//       newErrors.projectDetails = "Project name is required.";
//     }
    
//     if (!formData.address.trim()) {
//       newErrors.address = "Address is required.";
//     }
    
//     return newErrors;
//   };

//   // New API submission function for RERA
//   const submitReraForm = async (formPayload) => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/rera-data`, formPayload, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       console.log(response,"respppppppppppppppppppp")
//       return response.data;
//     } catch (error) {
//       console.error('RERA API Error:', error);
//       throw error;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const newErrors = validateForm();
    
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       // Scroll to first error
//       const firstErrorField = document.querySelector('.error-text')?.closest('.form-field');
//       if (firstErrorField) {
//         firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }
//       return;
//     }

//     setErrors({});
//     setConfirmOpen(true);
//   };

//   const handleConfirmSubmit = async () => {
//     setConfirmOpen(false);
//     setIsSubmitting(true);

//     // Create FormData with the correct field names matching your Laravel API
//     const formPayload = new FormData();
//     formPayload.append('PLANT_NAME', formData.loc);
//     formPayload.append('PROCESS_TYPE', formData.process);
//     formPayload.append('APPLICATION_DATE', formData.applyDate);
//     formPayload.append('PROJECT_NAME', formData.projectDetails);
//     formPayload.append('ADDRESS', formData.address);
//     formPayload.append('COMMENTS', formData.Comments || '');

//     // Add the main upload document if exists
//     if (formData.uploadDoc) {
//       formPayload.append('UPLOAD_DOC', formData.uploadDoc);
//     }

//     // If you want to handle additional documents (planDocs, titleDocs, etc.)
//     // you'll need to modify your Laravel API to accept multiple files
//     // For now, this matches your current API structure

//     try {
//       const data = await submitReraForm(formPayload);
//       console.log(data.message, "RERA response data");
      
//       // Update context if needed
//       setWaterData(data);
//       toast.success(data.message || "RERA application submitted successfully!");
      

  
//       // Navigate after a short delay to show success message
//       setTimeout(() => {
//         navigate('/create');
//       }, 1500);
//     } catch (err) {
//       console.error("RERA Submission error:", err);
//       const errorMessage = err.response?.data?.message || 
//                           err.response?.data?.errors || 
//                           'Submission failed. Please try again.';
      
//       // Handle validation errors from Laravel
//       if (err.response?.data?.errors) {
//         const backendErrors = err.response.data.errors;
//         const mappedErrors = {};
        
//         // Map Laravel validation errors to frontend field names
//         if (backendErrors.PLANT_NAME) mappedErrors.loc = backendErrors.PLANT_NAME[0];
//         if (backendErrors.PROCESS_TYPE) mappedErrors.process = backendErrors.PROCESS_TYPE[0];
//         if (backendErrors.APPLICATION_DATE) mappedErrors.applyDate = backendErrors.APPLICATION_DATE[0];
//         if (backendErrors.PROJECT_NAME) mappedErrors.projectDetails = backendErrors.PROJECT_NAME[0];
//         if (backendErrors.ADDRESS) mappedErrors.address = backendErrors.ADDRESS[0];
        
//         setErrors(mappedErrors);
//       }
      
//       toast.error(typeof errorMessage === 'string' ? errorMessage : 'Submission failed. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleBackClick = () => {
//     navigate('/create');
//   };

//   const getTotalDocumentCount = () => {
//     return planDocs.length + titleDocs.length + othDocs.length;
//   };

//   return (
//     <div className="water-form-wrapper">
//       <div className="form-background"></div>
      
//       <form className="water-form-container" onSubmit={handleSubmit} noValidate>
//         {/* HEADER */}
//         <header className="form-header">
//           <div className="header-content">
//             <div className="title-section">
//               <div className="icon-wrapper">
//                 <University className="water-icon" size={32} />
//               </div>
//               <h1 className="form-title">RERA Control Board Application</h1>
//               <p className="form-subtitle">
//                 Submit your RERA management compliance application with ease
//               </p>
//             </div>
         
//             <button
//               type="button"
//               onClick={handleBackClick}
//               className="back-button-modern"
//               title="Go back to dashboard"
//               aria-label="Go back"
//             >
//               <ChevronLeft size={24} />
//             </button>
//           </div>
//         </header>

//         <div className="form-content">
//           {/* PROJECT INFORMATION SECTION */}
//           <div className="form-section" aria-labelledby="project-info-heading">
//             <div className="section-header">
//               <Home className="section-icon" size={20} />
//               <h2 className="section-title">Plant Information:</h2>
//             </div>

//             <div className="form-grid two-columns">
//               <div className={`form-field ${errors.loc ? 'has-error' : ''}`}>
//                 <label className="field-label" htmlFor="project-name">
//                   <Hotel className="label-icon" size={20}/> 
//                   Plant Name*
//                 </label>
//                 <div className="input-wrapper">
//                   <PlantSelect
//                     id="project-name"
//                     value={formData.loc}
//                     onChange={handleChange}
//                     className={`highlight-input ${errors.loc ? 'error' : ''}`}
//                     aria-describedby={errors.loc ? "project-name-error" : undefined}
//                   />
//                   {errors.loc && (
//                     <div className="error-container">
//                       <p id="project-name-error" className="error-text" role="alert">
//                         {errors.loc}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className={`form-field ${errors.process ? 'has-error' : ''}`}>
//                 <label className="field-label" htmlFor="process-type">
//                   <FaLeaf className="label-icon" /> 
//                   Process Type <span className="required">*</span>
//                 </label>
//                 <div className="input-wrapper">
//                   <ProcessField
//                     id="process-type"
//                     apiUrl={`${API_BASE_URL}/rera-process`}
//                     value={formData.process}
//                     onChange={handleProcessChange}
//                     className={`modern-input ${errors.process ? 'error' : ''}`}
//                     aria-describedby={errors.process ? "process-type-error" : undefined}
//                   />
//                   {errors.process && (
//                     <div className="error-container">
//                       <p id="process-type-error" className="error-text" role="alert">
//                         {errors.process}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* APPLICATION DETAILS SECTION */}
//           <section className="form-section" aria-labelledby="app-details-heading">
//             <div className="section-header">
//               <FileText className="section-icon" size={20} />
//               <h2 id="app-details-heading" className="section-title">Application Details:</h2>
//             </div>

//             <div className="form-grid two-columns">
//               <div className={`form-field ${errors.applyDate ? 'has-error' : ''}`}>
//                 <label className="field-label" htmlFor="apply-date">
//                   <FaCalendarAlt className="label-icon" /> 
//                   Application Date*
//                 </label>
//                 <div className="input-wrapper">
//                   <ApplyDateInput
//                     id="apply-date"
//                     value={formData.applyDate}
//                     onChange={handleChange}
//                     className={`modern-input ${errors.applyDate ? 'error' : ''}`}
//                     aria-describedby={errors.applyDate ? "apply-date-error" : undefined}
//                   />
//                   {errors.applyDate && (
//                     <div className="error-container">
//                       <p id="apply-date-error" className="error-text" role="alert">
//                         {errors.applyDate}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label className="field-label" htmlFor="upload-doc">
//                   <FaUpload className="label-icon" /> 
//                   Upload Document
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="file"
//                     id="upload-doc"
//                     name="uploadDoc"
//                     onChange={handleChange}
//                     className="modern-input"
//                     accept=".pdf,.jpg,.png,.docx"
//                   />
//                   <small className="file-help-text">
//                     Accepted formats: PDF, JPG, PNG, DOCX (Max: 2MB)
//                   </small>
//                 </div>
//               </div>
//             </div>

//             {/* Additional Documents Section (Optional) */}
//             <div className="form-grid single-column" style={{marginTop: '20px'}}>
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaUpload className="label-icon" /> 
//                   Additional Documents (Optional)
//                 </label>
//                 <div className="upload-container">
//                   <button
//                     type="button"
//                     className="upload-button"
//                     onClick={() => setShowModal(true)}
//                   >
//                     <FaUpload className="upload-icon" /> 
//                     Upload Additional Documents
//                     {getTotalDocumentCount() > 0 && (
//                       <span className="upload-count">
//                         ({getTotalDocumentCount()} files)
//                       </span>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* PROJECT DETAILS SECTION */}
//           <section className="form-section" aria-labelledby="project-details-heading">
//             <div className="section-header">
//               <FaBuilding className="section-icon" size={20} />
//               <h2 id="project-details-heading" className="section-title">Project Details:</h2>
//             </div>

//             <div className="form-grid two-columns">
//               <div className={`form-field ${errors.projectDetails ? 'has-error' : ''}`}>
//                 <label className="field-label" htmlFor="plant-details">
//                   <ClipboardList className="label-icon" /> 
//                   Project Name*
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="text"
//                     id="plant-details"
//                     name="projectDetails"
//                     value={formData.projectDetails}
//                     onChange={handleChange}
//                     className={`modern-input ${errors.projectDetails ? 'error' : ''}`}
//                     placeholder="Enter project name"
//                     aria-describedby={errors.projectDetails ? "plant-details-error" : undefined}
//                   />
//                   {errors.projectDetails && (
//                     <div className="error-container">
//                       <p id="plant-details-error" className="error-text" role="alert">
//                         {errors.projectDetails}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className={`form-field ${errors.address ? 'has-error' : ''}`}>
//                 <label className="field-label" htmlFor="address">
//                   <BookUser className="label-icon" size={20} /> 
//                   Address*
//                 </label>
//                 <div className="input-wrapper">
//                   <textarea
//                     id="address"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     className={`modern-input ${errors.address ? 'error' : ''}`}
//                     placeholder="Enter project address"
//                     aria-describedby={errors.address ? "address-error" : undefined}
//                   />
//                   {errors.address && (
//                     <div className="error-container">
//                       <p id="address-error" className="error-text" role="alert">
//                         {errors.address}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* ADDITIONAL COMMENTS SECTION */}
//           <section className="form-section" aria-labelledby="comments-heading">
//             <div className="section-header">
//               <MessageSquareMore className="section-icon" size={20} />
//               <h2 id="comments-heading" className="section-title">Additional Comments:</h2>
//             </div>

//             <div className="form-grid single-column">
//               <div className="form-field">
//                 <label className="field-label" htmlFor="comments">
//                   <MessageCircleMore className="label-icon" size={20} /> 
//                   Comments
//                 </label>
//                 <div className="input-wrapper">
//                   <textarea
//                     id="comments"
//                     name="Comments"
//                     value={formData.Comments}
//                     onChange={handleChange}
//                     className="comment-inputs"
//                     placeholder="Enter any additional comments or special requirements"
//                     rows="2"
//                   />
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* FORM ACTIONS */}
//           <div className="form-actions">
//             <button
//               type="submit"
//               className={`submit-button ${isSubmitting ? "submitting" : ""}`}
//               disabled={isSubmitting}
//               aria-describedby="submit-button-description"
//               style={{marginTop: '18px'}}
//             >
//               {isSubmitting ? (
//                 <>
//                   <div className="spinner" aria-hidden="true"></div>
//                   Submitting...
//                 </>
//               ) : (
//                 <>
//                   <University className="submit-icon" aria-hidden="true" /> 
//                   Submit RERA Application
//                 </>
//               )}
//             </button>
//             <p id="submit-button-description" className="sr-only">
//               Submit your RERA board application
//             </p>
//           </div>
//         </div>
//       </form>

//       {/* MODALS AND DIALOGS */}
//       <ReusableDialog
//         open={confirmOpen}
//         title="Confirm RERA Submission"
//         message="Are you sure you want to submit this RERA application? Please review all information before proceeding. You will be redirected to the dashboard after successful submission."
//         onClose={() => setConfirmOpen(false)}
//         onConfirm={handleConfirmSubmit}
//         confirmText="Yes, Submit"
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
//         title="Upload Additional Documents"
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
//         title="Upload Payment Document Certificate"
//         showLandDocs={false}
//         showOthDocs={false}
//       />

//       {/* TOAST NOTIFICATIONS */}
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
//         theme="light"
//       />
//     </div>
//   );
// };

// export default ReraForm;