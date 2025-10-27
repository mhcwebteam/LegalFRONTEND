

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_BASE_URLS } from '../config/Config';
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

const WaterForm = () => {
  const navigate = useNavigate();
  const { waterData, setWaterData, masterGetData, totalMasterData, setHeaderData, headerData } = useContext(Context);
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
    Comments: '',
    KLD: '',
    amountPaid: '',
    feasibilityDoc: null,
    AmountPaidDoc: null,
    noOfTowers: '',
    ProjectBuildArea: '',
    TotalProjectArea: '',
    ProjectName: '',

  });


  useEffect(() => {
    if (headerData && headerData.LOC) {
      setFormData(prev => ({
        ...prev,
        loc: headerData?.LOC || '',
        applyDate: headerData?.APPLICATION_DATE || '',
        noOfTowers: headerData?.NUMBER_OF_TOWERS || '',
        TotalProjectArea: headerData?.TOTAL_PROJECT_AREA || '',
        ProjectBuildArea: headerData?.PROJECT_BUILD_AREA || '',
        ProjectName: headerData?.PROJECT_NAME || '',
        noOfFlats: headerData?.NUMBER_OF_FLATS || ''
      }));
    }
  }, [headerData]);


  useEffect(() => {
    if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
      const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;
      console.log(defaultLoc,"degfffffffffffff");
      

      fetchDataForLoc(defaultLoc);
    }
  }, [totalMasterData]);



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
        const res = await getMasterByLoc(value);
        if (res) {
          setHeaderData(res);
          setFormData(prev => ({
            ...prev,
            applyDate: res.APPLICATION_DATE || '',
            noOfTowers: res.NUMBER_OF_TOWERS || '',
            TotalProjectArea: res.TOTAL_PROJECT_AREA || '',
            ProjectBuildArea: res.PROJECT_BUILD_AREA || '',
            ProjectName: res.PROJECT_NAME || '',
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
    if (!formData.loc) newErrors.loc = "Project location is required.";
    if (!formData.process) newErrors.process = "Process type is required.";

    if (planDocs.length + titleDocs.length + othDocs.length === 0) {
      newErrors.documents = "Please upload at least one document.";
    }

    if (!formData.noOfFlats) newErrors.noOfFlats = "Number of flats is required.";
    if (!formData.amountPaid) newErrors.amountPaid = "Amount paid is required.";
    if (!formData.KLD) newErrors.KLD = "kLD  is required.";
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

    const formPayload = new FormData();
    formPayload.append('loc', formData.loc);
    formPayload.append('process', formData.process);
    formPayload.append('applyDate', formData.applyDate);
    formPayload.append('document', formData.document);
    formPayload.append('noOfFlats', formData.noOfFlats);
    formPayload.append('noOfTowers', formData.noOfTowers);
    formPayload.append('projectBuildArea', formData.ProjectBuildArea);
    formPayload.append('totalProjectArea', formData.TotalProjectArea);

    formPayload.append('comments', formData.Comments);
    formPayload.append('amountPaid', formData.amountPaid);
    formPayload.append('KLD', formData.KLD);
    formPayload.append('FeasibilityDoc', formData.feasibilityDoc);
    formPayload.append('AmountPaidDoc', formData.AmountPaidDoc);

    planDocs.forEach(f => formPayload.append('planDocs[]', f));
    titleDocs.forEach(f => formPayload.append('titleDocs[]', f));
    othDocs.forEach(f => formPayload.append('othDocs[]', f));
   feasibilityDocs.forEach(f => formPayload.append('feasibilityDocs[]', f));
  AmountPaidDocs.forEach(f => formPayload.append('amountPaidDocs[]', f));
    try {
      const data = await submitWaterForm(formPayload);
     

      setWaterData(data)

      toast.success(data.message);
      setFormData({
        loc: '',
        process: '',
        applyDate: '',
        document: null,
        noOfFlats: '',
        Comments: '',
        KLD: '',
        amountPaid: '',
        feasibilityDoc: null,
        AmountPaidDoc: null
      });
      setplanDocs([]);
      setTitleDocs([]);
      setOthDocs([]);
      setFeasibilityDocs([]);
      setAmountPaidDocs([]);
      navigate('/create');
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
                <Select
                labelId="loc-select-label"
                name="loc"
            
                value={formData.loc}
                onChange={handleChange}
                label="Select Plant"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3498db',
                    borderWidth: '2px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#bdc3c7'
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: '300px',
                       width: '280px',
                      '&::-webkit-scrollbar': {
                        width: '5px'
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '5px'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#c4c4c4',
                        borderRadius: '5px'
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#a8a8a8'
                      }
                    }
                  }
                }}
              >
                {totalMasterData.map((ele, index) => (
                  <MenuItem key={index} value={ele.LOC}>
                    {ele.LOC}
                  </MenuItem>
                ))}
              </Select>



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
                    apiUrl={`${API_BASE_URLS}/water-process`}
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
                    className="modern-input"
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
                    className="highlight-input"
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
                    className="modern-input"
                    placeholder="Enter th TotalProjectArea"
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
                    className="modern-input"
                    placeholder="Enter the Number of Towers"
                    step="0.01"
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
                    className="upload-button"
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
                  <FolderUp className="label-icon" size={20} />Paid Document
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
              <div className="form-field  mb-3">
                <label className="field-label">
                  <Store className="label-icon" size={20} /> Number of Flats*
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    name="noOfFlats"
                    value={formData.noOfFlats}
                    onChange={handleChange}
                    className="modern-input"
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
                    placeholder="Enter the KLD"
                  />
                </div>
              </div>
              <div className="form-field">
                <label className="field-label">
                  <Calculator className="label-icon" size={20} />Project Build Area
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="ProjectBuildArea"
                    value={formData.ProjectBuildArea}

                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter the ProjectBuildArea"
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label className="fire-field-label" style={{ marginTop: '-20px' }}>
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
        title="Upload Documents"
      />

      <WaterDocUploadModal
        show={showFeasibilityModal}
        onClose={() => setShowFeasibilityModal(false)}
        linkDocs={feasibilityDocs}
        setLinkDocs={setFeasibilityDocs}
        title="Upload Feasibility Certificate"
        showLandDocs={false}
        showOthDocs={false}
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
      />
    </div>
  );
};

export default WaterForm;