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




  const checkIfPlantExists = async (plant) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/check-plant-exists-rera`, { loc: plant });
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


         // Check if plant exists in airport table
            const plantExists = await checkIfPlantExists(value);
      
            if (plantExists) {
                return; 
            }
            
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

    // Validate form
    const newErrors = {};

    if (!formData.loc) {
      newErrors.loc = 'Please select a plant';
    }

    if (!formData.process) {
      newErrors.process = 'Please select a process type';
    }

    if (!formData.applyDate) {
      newErrors.applyDate = 'Please select an application date';
    }

    if (!AmountPaidDocs || AmountPaidDocs.length === 0) {
      newErrors.AmountPaidDoc = 'Please upload at least one PDF document';
    }

    if (!formData.projectDetails) {
      newErrors.projectDetails = 'Please enter project name';
    }

    if (!formData.address) {
      newErrors.address = 'Please enter address';
    }

    // If there are errors, set them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill all required fields');
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

 
              <div className={`form-field ${errors.AmountPaidDoc ? 'has-error' : ''}`}>
                <label className="field-label">
                  <FaUpload className="label-icon" /> 
                  Upload Documents (PDF Only)*
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
                  {errors.AmountPaidDoc && (
                    <div className="error-container">
                      <p className="error-text" role="alert">{errors.AmountPaidDoc}</p>
                    </div>
                  )}
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
                    className="modern-input"
                    placeholder="Enter any additional comments or special requirements"
                    rows="2"
                    style={{ 
                      minHeight: '100px',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
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
        title="Upload Paid Document Certificate (PDF Only)"
        showLandDocs={false}
        showOthDocs={false}
        acceptedFileTypes=".pdf"
        fileTypeMessage="Only PDF files are accepted"
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














