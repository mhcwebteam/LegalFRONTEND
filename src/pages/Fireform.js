import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_BASE_URLS } from '../config/Config';
import { FaLeaf, FaFire, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt, FaCheckCircle, FaWater } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, Flame, MessageSquareMore, Calculator, Store, FileCheck, FolderUp, MapPinned, User } from "lucide-react";
import WaterDocUploadModal from "../components/WaterDocUploadModal";
import PlantSelect from '../components/PlantSelect';
import ApplyDateInput from '../components/ApplyDateInput';
import { ToastContainer, toast } from 'react-toastify';
import ProcessField from '../components/ProcessField';
import ReusableDialog from "../components/ReusableDialog";
import ProjectInfoHeader from "../components/ProjectInfoHeader"
import "../pages/Fire.css";
import { getMasterByLoc, submitWaterForm } from "../api/Api";
import { Context } from "../context/ContextData";

const FireForm = () => {
    const navigate = useNavigate();
    const { fireData, setFireData, masterGetData, totalMasterData } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
    const [acknowledgeDocs, setAcknowledgeDocs] = useState([]);
    const [planDocs, setPlanDocs] = useState([]);
    const [titleDocs, setTitleDocs] = useState([]);
    const [othDocs, setOthDocs] = useState([]);
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
        noOfTowers: '',
        BuildArea: '',
        ProjectArea: '',
        TotalArea: '',
        ProjectName: '',
        feePaid: '',
        feeAmount: '',
        acknowledgeName: '',
    });

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

    const handleChange = async (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'radio') {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
            return;
        }

        // Special case: when user selects a LOC
        if (name === "loc") {
            setFormData((prev) => ({ ...prev, loc: value }));

            try {
                const res = await getMasterByLoc(value);

                setFormData((prev) => ({
                    ...prev,
                    applyDate: res.APPLICATION_DATE || '',
                    noOfTowers: res.NUMBER_OF_TOWERS || '',
                    ProjectArea: res.TOTAL_PROJECT_AREA || '',
                    TotalArea: res.PROJECT_BUILD_AREA || '',
                    ProjectName: res.PROJECT_NAME || ''
                }));

            } catch (err) {
                console.error("Error fetching master by loc:", err);
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.loc) newErrors.loc = "Project location is required.";
        if (!formData.process) newErrors.process = "Process type is required.";
        if (!formData.feePaid) newErrors.feePaid = "Please specify if fee is paid.";
        if (formData.feePaid === 'yes' && !formData.feeAmount) newErrors.feeAmount = "Fee amount is required when fee is paid.";
        if (!formData.acknowledgeName) newErrors.acknowledgeName = "Acknowledge name is required.";

        if (planDocs.length + titleDocs.length + othDocs.length === 0) {
            newErrors.documents = "Please upload at least one document.";
        }

        if (acknowledgeDocs.length === 0) {
            newErrors.acknowledgeDocs = "Please upload at least one acknowledge receipt.";
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

        const formPayload = new FormData();
        formPayload.append('loc', formData.loc);
        formPayload.append('process', formData.process);
        formPayload.append('applyDate', formData.applyDate);
        formPayload.append('noOfFlats', formData.noOfFlats);
        formPayload.append('comments', formData.Comments);
        formPayload.append('feePaid', formData.feePaid);
        formPayload.append('feeAmount', formData.feeAmount);
        formPayload.append('acknowledgeName', formData.acknowledgeName);
        formPayload.append('noOfTowers', formData.noOfTowers);
        formPayload.append('ProjectArea', formData.ProjectArea);
        formPayload.append('TotalArea', formData.TotalArea);
        formPayload.append('ProjectName', formData.ProjectName);

        planDocs.forEach(f => formPayload.append('Plan_Doc[]', f));
        titleDocs.forEach(f => formPayload.append('Title_Doc[]', f));
        othDocs.forEach(f => formPayload.append('Oth_Doc[]', f));
        acknowledgeDocs.forEach(f => formPayload.append('Acknowledge_Doc[]', f));

        try {
            const data = await submitWaterForm(formPayload);
            setFireData(data);
            toast.success(data.message);

            // Reset form
            setFormData({
                loc: '',
                process: '',
                applyDate: '',
                document: null,
                noOfFlats: '',
                Comments: '',
                noOfTowers: '',
                BuildArea: '',
                ProjectArea: '',
                TotalArea: '',
                ProjectName: '',
                feePaid: '',
                feeAmount: '',
                acknowledgeName: '',
            });

            setPlanDocs([]);
            setTitleDocs([]);
            setOthDocs([]);
            setAcknowledgeDocs([]);
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
        <div className="fire-form-wrapper">
            <div className="fire-form-background"></div>
            <form className={`fire-form-container ${(formData.loc || formData.ProjectName) ? 'with-info-header' : ''}`} onSubmit={handleSubmit}>
                {/* MAIN HEADER */}
                <div className="fire-form-header">
                    <div className="fire-header-content">
                        <div className="fire-title-section">
                            <div className="fire-icon-wrapper">
                                <Flame className="fire-icon" size={38} />
                            </div>
                            <h1 className="fire-form-title">Fire Control Board Application</h1>

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
                            <h3 style={{ color: '#0e7bdae7' }}>Project Information:</h3>
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
                                        className="highlight-input"
                                    >
                                        <option value="" hidden>Select Plant</option>
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
                                        name="applyDate"
                                        disabled
                                        value={
                                            formData.applyDate
                                                ? new Date(formData.applyDate)
                                                    .toLocaleDateString("en-GB")
                                                : ""
                                        }
                                        onChange={handleChange}
                                        className="modern-input"
                                        placeholder="Enter th ProjectArea"
                                        step="0.01"
                                        min="0"
                                    />
                                    <div className="error-container">
                                        {errors.applyDate && <p className="error-text">{errors.applyDate}</p>}
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

                        </div>
                    </div>
                    <div className="form-section">
                        <div className="section-header">
                            <FaUpload className="section-icon" size={20} />
                            <h3 style={{ color: '#0e7bdae7' }}>Documents:</h3>
                        </div>

                        <div className="form-grid two-columns">

                            <div className="form-field">
                                <label className="field-label">
                                    <FaMoneyBill className="label-icon" /> Acknowledgement name
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="number"
                                        name="noOfTowers"
                                        value={formData.noOfTowers}
                                        disabled
                                        readOnly
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
                                    <FaUpload className="label-icon" /> Acknowledgement Reciept
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
   <div className="form-field full-width">
                                <label className="field-label" style={{ marginTop: '-20px' }}>
                                    <MessageSquareMore className="label-icon" /> Address
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

                    <div className="form-section">
                        <div className="section-header">
                            <FileCheck className="section-icon" size={20} />
                            <h3 style={{ color: '#0e7bdae7' }}>Water Requirement:</h3>
                        </div>

                        <div className="form-grid three-columns">
                        

          
   <div className="form-group">
    <label className="field-label">Status</label>
    <div className="radio-group-horizontal">
      <label className="radio-label">
        <input
          type="radio"
          name="status"
          value="YES"
          checked={formData.status === "YES"}
          disabled={!formData.loc}
          onChange={handleChange}
          className="radio-input"
        />
        <span className="radiomark"></span>
        Yes
      </label>
      <label className="radio-label">
        <input
          type="radio"
          name="status"
          value="NO"
          checked={formData.status === "NO"}
          disabled={!formData.loc}
          onChange={handleChange}
          className="radio-input"
        />
        <span className="radiomark"></span>
        No
      </label>
    </div>
  </div>
  <div className="form-field">
                          <label className="field-label">
                            <FaMoneyBill className="label-icon" /> Free amount paid
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
      


                            <div className="form-field full-width">
                                <label className="field-label" style={{ marginTop: '-20px' }}>
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

            <WaterDocUploadModal
                show={showModal}
                onClose={() => setShowModal(false)}
                linkDocs={planDocs}
                setLinkDocs={setPlanDocs}
                landDocs={titleDocs}
                setLandDocs={setTitleDocs}
                othDocs={othDocs}
                setOthDocs={setOthDocs}
                title="Upload Documents"
            />

            <WaterDocUploadModal
                show={showAcknowledgeModal}
                onClose={() => setShowAcknowledgeModal(false)}
                linkDocs={acknowledgeDocs}
                setLinkDocs={setAcknowledgeDocs}
                title="Upload Acknowledge Receipts"
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

export default FireForm;