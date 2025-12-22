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
import Swal from "sweetalert2";

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

  // useEffect(() => {
  //   if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
  //     const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;
  //     if (defaultLoc) {
  //       fetchDataForLoc(defaultLoc);
  //     }
  //   }
  // }, [totalMasterData]);


    useEffect(() => {
    setHeaderData(null);
  }, []);

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

  // --------------------------------------------------------------------
  // 08-12-2025: ADDED FORM VALIDATION FUNCTION
  // This function validates all required fields before submission
  // --------------------------------------------------------------------
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.loc || formData.loc.trim() === '') {
      newErrors.loc = 'Plant Name is required';
    }
    
    if (!formData.process || formData.process.trim() === '') {
      newErrors.process = 'Process Type is required';
    }
    
    if (!formData.applyDate || formData.applyDate.trim() === '') {
      newErrors.applyDate = 'Application Date is required';
    }
    
    if (!formData.projectDetails || formData.projectDetails.trim() === '') {
      newErrors.projectDetails = 'Project Name is required';
    }
    
    if (!formData.address || formData.address.trim() === '') {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.Comments || formData.Comments.trim() === '') {
      newErrors.Comments = 'Comments are required';
    }
    
    // Document validation - if AmountPaidDocs is required
    if (AmountPaidDocs.length === 0) {
      newErrors.AmountPaidDoc = 'At least one document is required';
    }
    
    return newErrors;
  };

  const checkIfPlantExists = async (plant) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/check-plant-exists-rera`, { loc: plant });
      console.log("API Response:", res.data);
      
      if (res.data && res.data.exists === true) {
        toast.error('This plant already has entries.');
        setFormData((prev) => ({ ...prev, loc: '' }));
        setHeaderData(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to check plant:', error);
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

      // Clear error for this field
      if (errors.loc) {
        setErrors(prev => ({ ...prev, loc: '' }));
      }

      if (!value || value.trim() === "") {
        setHeaderData({});
        setFormData((prev) => ({
          ...prev,
          applyDate: ""
        }));
        return;
      }

      try {
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

    // Normal case - update form data and clear error
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

  // --------------------------------------------------------------------
  // 08-12-2025: UPDATED HANDLESUBMIT FUNCTION WITH VALIDATION
  // Now checks all required fields before opening confirmation dialog
  // --------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before opening confirmation dialog
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Scroll to first error for better UX
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField) || 
                        document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      
      toast.error('Please fill in all required fields');
      return;
    }

    // If validation passes, open confirmation dialog
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
formPayload.append("fromDate",'');
      formPayload.append("toDate", '');
    // Append multiple uploaded docs
    if (AmountPaidDocs && AmountPaidDocs.length > 0) {
      AmountPaidDocs.forEach((file) => {
        formPayload.append('UPLOAD_DOC[]', file);
      });
    }

    try {
      const data = await submitReraForm(formPayload);
      setFormReraData(data);
const successMessage = data?.message || data?.data?.message || "Application submitted successfully!";
    
    await Swal.fire({
      icon: "success",
      title: successMessage,
      showConfirmButton: false,
      timer: 2000,
    });
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
      setErrors({}); // Clear errors on success

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
              <Home className="section-icon" size={15} />
              <h2 className="section-title" style={{ fontSize: "15px" }}>
                Plant Information:
              </h2>
            </div>

            <div className="form-grid two-columns">
              {/* PLANT NAME FIELD */}
              <div className={`form-field ${errors.loc ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="project-name">
                  <Hotel className="label-icon" size={20}/> 
                  Plant Name*
                </label>
                <div className="input-wrapper">
                  <select
                    name="loc"
                    value={formData.loc}
                    onChange={handleChange}
                    className="modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400"
                    style={{
                      border: errors.loc ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  >
                    <option value="">Select Plant</option>
                    {Array.isArray(totalMasterData) && totalMasterData.map((ele, index) => (
                      <option key={index} value={ele.LOC}>
                        {ele.LOC}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.loc && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.loc}
                  </p>
                )}
              </div>

              {/* PROCESS TYPE FIELD */}
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
                    style={{
                      border: errors.process ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                    aria-describedby={errors.process ? "process-type-error" : undefined}
                  />
                </div>
                {errors.process && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.process}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* APPLICATION DETAILS SECTION */}
          <section className="form-section" aria-labelledby="app-details-heading">
            <div className="section-header">
              <FileText className="section-icon" size={15}  />
              <h2 id="app-details-heading" className="section-title" style={{ fontSize: "15px" }}>
                Application Details:
              </h2>
            </div>

            <div className="form-grid two-columns">
              {/* APPLICATION DATE FIELD */}
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
                    style={{
                      border: errors.applyDate ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                    aria-describedby={errors.applyDate ? "apply-date-error" : undefined}
                  />
                </div>
                {errors.applyDate && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.applyDate}
                  </p>
                )}
              </div>

              {/* UPLOAD DOCUMENTS FIELD */}
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
                    style={{
                      border: errors.AmountPaidDoc ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  >
                    <FaUpload className="upload-icon" />  Upload Paid Documents
                    <span className="upload-count">
                      {AmountPaidDocs.length > 0 &&
                        `(${AmountPaidDocs.length} files)`}
                    </span>
                  </button>
                </div>
                {errors.AmountPaidDoc && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.AmountPaidDoc}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* PROJECT DETAILS SECTION */}
          <section className="form-section" aria-labelledby="project-details-heading">
            <div className="section-header">
              <FaBuilding className="section-icon" size={15} />
              <h2 id="project-details-heading" className="section-title" style={{ fontSize: "15px" }}>
                Project Details:
              </h2>
            </div>

            <div className="form-grid two-columns">
              {/* PROJECT NAME FIELD */}
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
                    style={{
                      border: errors.projectDetails ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                    aria-describedby={errors.projectDetails ? "plant-details-error" : undefined}
                  />
                </div>
                {errors.projectDetails && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.projectDetails}
                  </p>
                )}
              </div>

              {/* ADDRESS FIELD */}
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
                    style={{
                      border: errors.address ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                    aria-describedby={errors.address ? "address-error" : undefined}
                  />
                </div>
                {errors.address && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.address}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ADDITIONAL COMMENTS SECTION */}
          <section className="form-section" aria-labelledby="comments-heading">
            <div className="section-header">
              <MessageSquareMore className="section-icon" size={15} />
              <h2 id="comments-heading" className="section-title" style={{ fontSize: "15px" }}>
                Additional Comments:
              </h2>
            </div>

            <div className="form-grid single-column">
              <div className="form-field">
                <label className="field-label" htmlFor="comments">
                  <MessageCircleMore className="label-icon" size= {20} /> 
                  Comments*
                </label>
                <div className="input-wrapper">
                  <textarea
                    id="comments"
                    name="Comments"
                    value={formData.Comments}
                    onChange={handleChange}
                    className={`modern-input ${errors.Comments ? 'error' : ''}`}
                    placeholder="Enter  comments"
                    style={{
                      border: errors.Comments ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                    aria-describedby={errors.Comments ? "comments-error" : undefined}
                  />
                </div>
                {errors.Comments && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.Comments}
                  </p>
                )}
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