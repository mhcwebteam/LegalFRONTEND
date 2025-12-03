import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config/Config';
import { Context } from "../context/ContextData";
import { getMasterByLoc } from "../api/Api";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import {
  Landmark,
  ChevronLeft,
  Home,
  Store,
  FileText,
  FileCheck,
  MessageSquareMore,
} from "lucide-react";
import { FaCalendarAlt, FaLeaf, FaUpload, FaWater } from 'react-icons/fa';

// Import your components
import AirportDocUploadModal from "../components/AirportDocUploadModal";
import ProjectInfoHeader from "../components/ProjectInfoHeader";
import ReusableDialog from "../components/ReusableDialog";
import ApplyDateInput from '../components/ApplyDateInput';
import ProcessField from '../components/ProcessField';
import Swal from "sweetalert2";

const AirportForm = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [linkDocs, setLinkDocs] = useState([]);
  const [landDocs, setLandDocs] = useState([]);
  const [othDocs, setOthDocs] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ✅ Add ref to track if initial load is done
  const hasLoadedInitialData = useRef(false);

  const {
    totalMasterData = [],
    setHeaderData,
    headerData 
  } = useContext(Context);

  const [formData, setFormData] = useState({
    loc: '',
    process: '',
    applyDate: '',
    document: null,
    totalPrjArea: '',
    noOfNocs: '',
    comments: ''
  });



  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/airport-process`);
        if (res.data && res.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            process: res.data[0].PROCESS,
          }));
        }
      } catch (err) {
        console.error("Error fetching airport process name:", err);
      }
    };
    fetchProcess();
  }, []); // ✅ Empty dependency - run only once


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

 
const checkIfPlantExists = async (plant) => {
    try {
        const res = await axios.post(`${API_BASE_URL}/check-plant-exists-airport`, { loc: plant });
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
    const { name, value } = e.target;

    if (name === "loc") {

        setFormData((prev) => ({
            ...prev,
            loc: value,
        }));

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

        try {
            // Check if plant exists in airport table
            const plantExists = await checkIfPlantExists(value);
      
            if (plantExists) {
                return; 
            }

            // If plant doesn't exist, fetch master data
            const res = await getMasterByLoc(value);
            if (res && Object.keys(res).length > 0) {
                setHeaderData(res);
            
             

                setFormData((prev) => ({
                    ...prev,
                    // You can set other fields here if needed
                }));
            } else {
                console.warn('⚠️ No master data found for location:', value);
                setHeaderData({});
                setFormData((prev) => ({
                    ...prev,
                    applyDate: "",
                    totalPrjArea: "",
                    noOfNocs: "",
                }));
            }
        } catch (err) {
            console.error("❌ Error fetching master by loc:", err);
            setHeaderData({});
            setFormData((prev) => ({
                ...prev,
                applyDate: "",
                totalPrjArea: "",
                noOfNocs: "",
            }));
        }
        return;
    }

    // ✅ Handle all other fields
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
  };



const validateForm = () => {
  const newErrors = {};

  if (!formData.loc) newErrors.loc = "Plant name is required";
  if (!formData.applyDate) newErrors.applyDate = "Application date is required";
  if (!formData.totalPrjArea) newErrors.totalPrjArea = "Total Project Area required";
  if (!formData.noOfNocs) newErrors.noOfNocs = "number of nocs required";
  // 🔥 Check if at least one document is uploaded
  const totalDocs = linkDocs.length + landDocs.length + othDocs.length;
  if (totalDocs === 0) newErrors.document = "Please upload at least one document";
  if(!formData.comments) newErrors.comments = "Please enter comments";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // toast.error('Please fill all required fields');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setConfirmOpen(false);
    setIsSubmitting(true);

    const formPayload = new FormData();
    formPayload.append('loc', formData.loc);
    formPayload.append('process', formData.process);
    formPayload.append('applyDate', formData.applyDate);
    formPayload.append('documents', formData.document);
    formPayload.append('totalPrjArea', formData.totalPrjArea);
    formPayload.append('noOfNocs', formData.noOfNocs);
    formPayload.append('comments', formData.comments);

    linkDocs.forEach(f => formPayload.append('link_docs[]', f));
    landDocs.forEach(f => formPayload.append('land_docs[]', f));
    othDocs.forEach(f => formPayload.append('oth_docs[]', f));

    try {
      const response = await axios.post(`${API_BASE_URL}/airport-submit`, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

     if (response.data.message) {
  Swal.fire({
    icon: "success",
    title: response.data.message,
    showConfirmButton: false,
    timer: 2000,
  }).then(() => {
    navigate('/create');
  });
}


   
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate('/create');
  };

  const today = new Date().toISOString().split("T")[0];
return (
    <div className="air-form-wrapper">
      <form className="air-form-container" onSubmit={handleSubmit}>
        {/* HEADER */}
        <div className="form-header">
          <div className="header-content">
            <div className="title-section">
              <div className="icon-wrapper">
                <Landmark className="water-icon" size={32} />
              </div>
              <h1 className="form-title">AIR PORT Form Application </h1>
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

        {/* Project Info Header */}
        <ProjectInfoHeader data={headerData} />

        <div className="form-content">
          {/* Project Information */}
          <div className="form-section">
            <div className="section-header">
              <Home className="section-icon" size={20} />
              <h3 style={{ color: '#0e7bdae7' }}>Project Information:</h3>
            </div>

            <div className="form-grid two-columns ">
              <div className="form-field mt-2">
                <label className="field-label">
                  <Store className="label-icon" />
                  Plant Name*
                </label>
                <div className="input-wrapper">
                  <select
                    name="loc"
                    value={formData.loc}
                    onChange={handleChange}
                    className="modern-input"
                    required
                  >
                  <option value="">Select Plant</option>
                    {Array.isArray(totalMasterData) &&
                      totalMasterData.map((ele, index) => (
                        <option key={index} value={ele.LOC}>
                          {ele.LOC}
                        </option>
                      ))}
                  </select>
                  {errors.loc && <p className="error-text">{errors.loc}</p>}
                </div>
              </div>

              <div className="form-field mt-2">
                <label className="field-label">
                  <FaLeaf className="label-icon" /> Process Type
                </label>
                <div className="input-wrapper">
                  <ProcessField
                    apiUrl={`${API_BASE_URL}/airport-process`}
                    value={formData.process}
                    onChange={handleProcessChange}
                    className="form-control"
                  />
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
              <div className="form-field mt-2">
                <label className="field-label">
                  <FaCalendarAlt className="label-icon" /> Application Date*
                </label>
                <div className="input-wrapper">
                  <ApplyDateInput
                    value={formData.applyDate}
                    onChange={handleChange}
                    className="modern-input"
                    
                  />
                  {errors.applyDate && <p className="error-text">{errors.applyDate}</p>}
                </div>
              </div>

              <div className="air-form-field mt-2">
                <label className="air-field-label">
                  <FaUpload className="air-label-icon" /> Upload Documents*
                </label>
                <div className="air-upload-container mt-2">
                  <button
                    type="button"
                    className="air-upload-button"
                    onClick={() => setShowModal(true)}
                  >
                    <FaUpload className="air-upload-icon" /> Upload Documents
                    <span className="air-upload-count">
                      {(linkDocs.length + landDocs.length + othDocs.length) > 0 &&
                        `(${linkDocs.length + landDocs.length + othDocs.length} files)`}
                    </span>
                  </button>
                  {errors.document && <p className="error-text">{errors.document}</p>}

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
            <div className="form-field mt-2">
  <label className="field-label">
    <MessageSquareMore className="label-icon" /> Total Project Area (in acres)*
  </label>
  <div className="input-wrapper">
    <input
      type="number"
      name="totalPrjArea"
      value={formData.totalPrjArea}
      onChange={handleChange}
      className="form-control"
      placeholder="Enter area"
      min="0"
      step="any"
    />
    {errors.totalPrjArea && (
      <p className="error-text">{errors.totalPrjArea}</p>
    )}
  </div>
</div>


<div className="form-field mt-2">
  <label className="field-label">
    <MessageSquareMore className="label-icon" /> Number of NOCs*
  </label>
  <div className="input-wrapper">
    <input
      type="number"
      name="noOfNocs"
      className="form-control"
      value={formData.noOfNocs}
      onChange={handleChange}
      placeholder="Enter number of NOCs"
      min="0"
    />
    {errors.noOfNocs && (
      <p className="error-text">{errors.noOfNocs}</p>
    )}
  </div>
</div>


            </div>

            <div style={{ display: 'flex', alignItems: 'end', height: '100%', paddingLeft: '50px', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className={`submit-button ${isSubmitting ? "submitting" : ""}`}
                disabled={isSubmitting}
                style={{ width: 'auto', padding: '12px 30px' }}
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


          <div className="form-field mt-2">
            <label className="fire-field-label mt-3">
              <MessageSquareMore className="label-icon" /> Comments*
            </label>
            <div className="input-wrapper">
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                className="modern-input"
                placeholder="Enter your comments"
                rows="2"
              />
                  {errors.comments && (
      <p className="error-text">{errors.comments}</p>
    )}
            </div>
          </div>

        </div>
      </form>
      <AirportDocUploadModal
        show={showModal}
        onClose={() => setShowModal(false)}
        linkDocs={linkDocs}
        setLinkDocs={setLinkDocs}
        landDocs={landDocs}
        setLandDocs={setLandDocs}
        othDocs={othDocs}
        setOthDocs={setOthDocs}
      />
      <ReusableDialog
        open={confirmOpen}
        title="Confirm Submission"
        message="Are you sure you want to submit this application?"
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

export default AirportForm;