


import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config/Config';
import FormGroup from '../components/FormGroup';
import ProcessField from '../components/ProcessField';
import ApplyDateInput from '../components/ApplyDateInput';
import FileUpload from '../components/FileUpload';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Context } from "../context/ContextData";
import ProjectInfoHeader from "../components/ProjectInfoHeader";
import { getMasterByLoc } from "../api/Api";

import './PollutionForm.css';
import {
    Landmark,
    ChevronLeft,
    Home,
    Store,
    FileText,
    FileCheck,
    MessageSquareMore,
    FolderUp
} from "lucide-react";
import { FaLeaf, FaCalendarAlt, FaWater, FaUpload } from "react-icons/fa";
import ReusableDialog from "../components/ReusableDialog";
import PollutionDocUploadModal from "../components/PollutionDocUploadModal";

// ✅ PDF ONLY VALIDATION
const ALLOWED_FILE_TYPES = {
    'application/pdf': ['.pdf']
};

// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const PollutionForm = () => {
    const navigate = useNavigate();
    const {
        totalMasterData = [],
        setHeaderData,
        headerData
    } = useContext(Context);

    const fileInputRef = useRef(null);
    const [newDocs, setNewDocs] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [formData, setFormData] = useState({
        loc: '',
        process: '',
        applyDate: '',
        document: [],
        comments: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [linkDocs, setLinkDocs] = useState([]);
    const [landDocs, setLandDocs] = useState([]);
    const [othDocs, setOthDocs] = useState([]);

    // ✅ PDF VALIDATION FUNCTION
    const validateFileType = (file) => {
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        const isValidType = fileExtension === '.pdf';
        
        if (!isValidType) {
            return false;
        }

        // if (file.size > MAX_FILE_SIZE) {
        //     toast.error(`${file.name} is too large. Max size is 10MB`);
        //     return false;
        // }

        // Double-check MIME type
        if (file.type && file.type !== 'application/pdf') {
            toast.error(`${file.name} is not a valid PDF file.`);
            return false;
        }

        return true;
    };

    // useEffect(() => {
    //     if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
    //         const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;

    //         if (defaultLoc) {
    //             fetchDataForLoc(defaultLoc);
    //         }
    //     }
    // }, [totalMasterData]);

    useEffect(() => {
        if (formData.loc !== '') {
            checkIfPlantExists(formData.loc);
        }
    }, [formData.loc]);

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

    const checkIfPlantExists = async (plant) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/check-plant-exists`, { loc: plant });
            if (res.data.exists) {
                toast.error('This plant already has entries.');
                setFormData((prev) => ({ ...prev, loc: '' }));
                setHeaderData(null);
            }
        } catch (error) {
            console.error('Failed to check plant:', error);
        }
    };

    // Fetch process on component mount
    useEffect(() => {
        const fetchProcess = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/processname`);
                const processValue = res.data.process?.[0]?.PROCESS || "";
                setFormData((prev) => ({
                    ...prev,
                    process: processValue,
                }));
            } catch (err) {
                console.error("Error fetching process:", err);
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
                    }));
                } else {
                    setHeaderData(null);
                    setFormData(prev => ({
                        ...prev,
                        applyDate: '',
                    }));
                }
            } catch (err) {
                console.error("Error fetching master by loc:", err);
                setHeaderData(null);
                setFormData(prev => ({
                    ...prev,
                    applyDate: '',
                }));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFormData((prev) => {
            const existingFiles = Array.from(prev.document || []);
            const existingNames = existingFiles.map(file => file.name);
            const uniqueNewFiles = newFiles.filter(file => !existingNames.includes(file.name));
            return {
                ...prev,
                document: [...existingFiles, ...uniqueNewFiles],
            };
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.loc) newErrors.loc = "Plant name is required";
        if (!formData.applyDate) newErrors.applyDate = "Application date is required";
        if (!formData.comments) newErrors.comments = "Please enter comments";
        
        // Document validation with PDF check
        if (newDocs.length === 0) {
            newErrors.document = "At least one PDF document is required";
        } else {
            // Validate all files are PDFs
            const invalidFiles = newDocs.filter(file => !validateFileType(file));
            if (invalidFiles.length > 0) {
                newErrors.document = "Only PDF files are allowed";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setConfirmOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);

        // ✅ Final validation before submission
        const invalidFiles = newDocs.filter(file => !validateFileType(file));
        if (invalidFiles.length > 0) {
            toast.error('Please remove non-PDF files before submitting');
            setIsSubmitting(false);
            setConfirmOpen(false);
            return;
        }
// const today = new Date().toISOString().split("T")[0];
        const formPayload = new FormData();
        formPayload.append('loc', formData.loc);
        formPayload.append('process', formData.process);
        formPayload.append('applyDate', formData.applyDate);
        formPayload.append('comments', formData.comments);
    // formPayload.append('receivedDate', today);


        // ✅ Append only validated PDF files
        newDocs.forEach((file, index) => {
            if (validateFileType(file)) {
                formPayload.append(`document[${index}]`, file, file.name);
                formPayload.append(`doc_name[${index}]`, file.name);
               
            }
        });

        try {
            const response = await axios.post(`${API_BASE_URL}/pollution-submit`, formPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // onUploadProgress: (progressEvent) => {
                //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                //     console.log(`Upload Progress: ${percentCompleted}%`);
                // }
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

            setFormData({
                loc: '',
                process: formData.process,
                applyDate: '',
                comments: '',
                document: [],
            });
            setNewDocs([]);
        } catch (err) {
            console.error('Submission error:', err.response?.data || err.message);
            
        
        } finally {
            setIsSubmitting(false);
            setConfirmOpen(false);
        }
    };

    const handleBackClick = () => {
        navigate('/create');
    };

    return (
        <div className="pol-form-wrapper">
            <form className="pol-form-container" onSubmit={handleSubmit}>
                {/* HEADER */}
                <div className="form-header">
                    <div className="header-content">
                        <div className="title-section">
                            <div className="icon-wrapper">
                                <Landmark className="water-icon" size={32} />
                            </div>
                            <h1 className="form-title">Pollution Control Board Form Application</h1>
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

                        <div className="form-grid two-columns">
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
                                        apiUrl={`${API_BASE_URL}/processname`}
                                        value={formData.process}
                                        onChange={(value) => setFormData((prev) => ({ ...prev, process: value }))}
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
                                        <FaUpload className="upload-icon" /> Upload PDF Files
                                        {newDocs.length > 0 && (
                                            <span className="upload-count">
                                                ({newDocs.length} PDF{newDocs.length !== 1 ? 's' : ''})
                                            </span>
                                        )}
                                    </button>
                                    {errors.document && <p className="error-text">{errors.document}</p>}
                                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                        Only PDF files are accepted (Max 10MB per file)
                                    </p>
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

                        <div className="form-grid" style={{ gridTemplateColumns: '3fr 1fr', gap: '20px', alignItems: 'start' }}>
                            <div className="form-field mt-2">
                                <label className="field-label">
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
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                {errors.comments && <p className="error-text">{errors.comments}</p>}
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
                    </div>
                </div>
            </form>

            <PollutionDocUploadModal
                show={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                files={newDocs}
                setFiles={setNewDocs}
                title="Upload PDF Documents Only"
                validateFileType={validateFileType}
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

export default PollutionForm;