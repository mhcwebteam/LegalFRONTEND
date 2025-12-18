

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLeaf, FaWater, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, MessageSquareMore, Store, FileCheck, FolderUp, Building, Landmark } from "lucide-react";
import ApplyDateInput from '../components/ApplyDateInput';
import { ToastContainer, toast } from 'react-toastify';
import ReusableDialog from "../components/ReusableDialog";
import "../pages/Ghmc.css";
import {  getMasterByLoc } from "../api/Api"
import { Context } from "../context/ContextData"


import { API_BASE_URL } from "../config/Config";
import ProcessField from "../components/ProcessField";
import ProjectInfoHeader from "../components/ProjectInfoHeader";
import WaterDocUploadModal from "../components/WaterDocUploadModal";
import Swal from "sweetalert2";

const Ghmc = () => {
    const navigate = useNavigate();
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
        Comments: ''
    });

    // ✅ Strict PDF validation function
    const validateFileType = (file) => {
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        const isValidType = fileExtension === '.pdf';

        if (!isValidType) {
            toast.error(`${file.name} is not a PDF file. Only PDF files are allowed.`);
            return false;
        }

        // Double-check MIME type
        if (file.type && file.type !== 'application/pdf') {
            toast.error(`${file.name} is not a valid PDF file.`);
            return false;
        }

        return true;
    };





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





    const checkIfPlantExists = async (plant) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/check-plant-exists-ghmc`, { loc: plant });
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
                    params: { plant: '' },
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

    // useEffect(() => {
    //     if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
    //         const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;
    //         fetchDataForLoc(defaultLoc);
    //     }
    // }, [totalMasterData]);

    // const fetchDataForLoc = async (loc) => {
    //     try {
    //         const res = await getMasterByLoc(loc);
    //         if (res) {
    //             setHeaderData(res);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching initial loc data:", error);
    //     }
    // };

    // ✅ Complete validation in handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Required field validations
        if (!formData.loc) newErrors.loc = "Plant Name is required.";
        if (!formData.process) newErrors.process = "Process Type is required.";
        if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
        if (!formData.Organization) newErrors.Organization = "Organization is required.";
        if (!formData.noOfTowers) newErrors.noOfTowers = "Number Of Towers is required.";
        if (!formData.Comments) newErrors.Comments = "Please enter comments.";

        // ✅ Feasibility Docs validation (MANDATORY)
        if (feasibilityDocs.length === 0) {
            newErrors.feasibilityDocs = "Other Document is required (at least one PDF)";
        } else {
            const invalidFiles = feasibilityDocs.filter(file => !validateFileType(file));
            if (invalidFiles.length > 0) {
                newErrors.feasibilityDocs = "Only PDF files are allowed for Other Document";
            }
        }

        // ✅ Amount Paid Docs validation (MANDATORY)
        if (AmountPaidDocs.length === 0) {
            newErrors.AmountPaidDocs = "Title Document is required (at least one PDF)";
        } else {
            const invalidFiles = AmountPaidDocs.filter(file => !validateFileType(file));
            if (invalidFiles.length > 0) {
                newErrors.AmountPaidDocs = "Only PDF files are allowed for Title Document";
            }
        }

        // ✅ Tower Documents validation (MANDATORY for each tower)
        if (formData.noOfTowers && parseInt(formData.noOfTowers) > 0) {
            let allTowersHaveDocs = true;
            towerDocuments.forEach((tower) => {
                if (tower.documents.length === 0) {
                    newErrors[`tower_${tower.towerId}`] = `Tower ${tower.towerId} document is required`;
                    allTowersHaveDocs = false;
                } else {
                    const invalidFiles = tower.documents.filter(file => !validateFileType(file));
                    if (invalidFiles.length > 0) {
                        newErrors[`tower_${tower.towerId}`] = `Only PDF files are allowed for Tower ${tower.towerId}`;
                    }
                }
            });
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fix all validation errors before submitting");
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
        const allInvalidFiles = [
            ...feasibilityDocs.filter(file => !validateFileType(file)),
            ...AmountPaidDocs.filter(file => !validateFileType(file)),
            ...towerDocuments.flatMap(tower =>
                tower.documents.filter(file => !validateFileType(file))
            )
        ];

        if (allInvalidFiles.length > 0) {
            toast.error('Please remove non-PDF files before submitting');
            setIsSubmitting(false);
            setConfirmOpen(false);
            return;
        }

        setConfirmOpen(false);
        setIsSubmitting(true);

        const formPayload = new FormData();
        formPayload.append('loc', formData.loc);
        formPayload.append('process', formData.process);
        formPayload.append('applyDate', formData.applyDate);
        formPayload.append('Organization', formData.Organization);
        formPayload.append('noOfTowers', formData.noOfTowers);
        formPayload.append('Comments', formData.Comments || "");

        // Append documents
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

            if (res.data.message) {
                Swal.fire({
                    icon: "success",
                    title: res.data.message,
                    showConfirmButton: false,
                    timer: 3000, // Changed to 3 seconds for better UX
                }).then(() => {
                    // Reset form
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
                    setErrors({});

                    // Navigate after the alert is closed
                    navigate('/create');
                });
            }
        } catch (err) {
            // Show error alert instead of toast for consistency
            Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: err.response?.data?.message || "Something went wrong. Please try again.",
                confirmButtonText: "OK"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Final validation before submit
    // const handleConfirmSubmit = async () => {
    //     const allInvalidFiles = [
    //         ...feasibilityDocs.filter(file => !validateFileType(file)),
    //         ...AmountPaidDocs.filter(file => !validateFileType(file)),
    //         ...towerDocuments.flatMap(tower => 
    //             tower.documents.filter(file => !validateFileType(file))
    //         )
    //     ];

    //     if (allInvalidFiles.length > 0) {
    //         toast.error('Please remove non-PDF files before submitting');
    //         setIsSubmitting(false);
    //         setConfirmOpen(false);
    //         return;
    //     }

    //     setConfirmOpen(false);
    //     setIsSubmitting(true);

    //     const formPayload = new FormData();
    //     formPayload.append('loc', formData.loc);
    //     formPayload.append('process', formData.process);
    //     formPayload.append('applyDate', formData.applyDate);
    //     formPayload.append('Organization', formData.Organization);
    //     formPayload.append('noOfTowers', formData.noOfTowers);
    //     formPayload.append('Comments', formData.Comments || "");

    //     // Append documents
    //     feasibilityDocs.forEach(file => formPayload.append('feas_doc_name[]', file));
    //     AmountPaidDocs.forEach(file => formPayload.append('amount_doc_name[]', file));

    //     towerDocuments.forEach(tower => {
    //         tower.documents.forEach(file => {
    //             formPayload.append('tower_doc_name[]', file);
    //         });
    //     });

    //     try {
    //         const res = await axios.post(`${API_BASE_URL}/GHMC-submit`, formPayload, {
    //             headers: { "Content-Type": "multipart/form-data" },
    //         });

    //              if (res.data.message) {
    //           Swal.fire({
    //             icon: "success",
    //             title: res.data.message,
    //             showConfirmButton: false,
    //             timer: 5000,
    //           }).then(() => {
    //             navigate('/create');
    //           });
    //         }


    //         // Reset form
    //         setFormData({
    //             loc: "",
    //             process: "",
    //             Organization: "",
    //             applyDate: "",
    //             noOfTowers: "",
    //             Comments: "",
    //         });
    //         setFeasibilityDocs([]);
    //         setAmountPaidDocs([]);
    //         setTowerDocuments([]);
    //         setErrors({});
    //         navigate('/create');
    //     } catch (err) {
    //         toast.error(err.response?.data?.message || "Submission failed");
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handleBackClick = () => {
        navigate('/create');
    };

    // ✅ Validate PDFs when uploading tower documents
    const updateTowerDocs = (towerId, newDocs) => {
        // Validate all new files are PDFs
        const invalidFiles = newDocs.filter(file => !validateFileType(file));

        if (invalidFiles.length > 0) {
            toast.error(`Only PDF files are allowed for Tower ${towerId}`);
            return; // Don't update if any invalid files
        }

        setTowerDocuments(prev =>
            prev.map(tower =>
                tower.towerId === towerId
                    ? { ...tower, documents: newDocs }
                    : tower
            )
        );
    };

    // ✅ Handle tower file input with PDF validation
    const handleTowerFileInput = (towerId, currentDocs) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.pdf,application/pdf'; // ✅ Only show PDFs in file picker

        input.onchange = (e) => {
            const files = Array.from(e.target.files);

            // Validate all files are PDFs
            const allValid = files.every(file => validateFileType(file));

            if (allValid) {
                updateTowerDocs(towerId, [...currentDocs, ...files]);
            } else {
                toast.error('Some files were not added because they are not PDFs');
            }
        };

        input.click();
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
                                    <FolderUp className="label-icon" size={20} />Tower Documents*
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
                                    <div className="error-container">
                                        {Object.keys(errors).filter(key => key.startsWith('tower_')).length > 0 && (
                                            <p className="error-text">All tower documents are required (PDF only)</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="field-label">
                                    <FaMoneyBill className="label-icon" /> Upload Documents*
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
                                    <div className="error-container">
                                        {errors.AmountPaidDocs && <p className="error-text">{errors.AmountPaidDocs}</p>}
                                    </div>
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
                                    <FaFileAlt className="label-icon" /> Other Documents*
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
                                    <div className="error-container">
                                        {errors.feasibilityDocs && <p className="error-text">{errors.feasibilityDocs}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="fire-field-label">
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
                                </div>
                                <div className="error-container">
                                    {errors.Comments && <p className="error-text">{errors.Comments}</p>}
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

            {/* Tower Documents Modal */}
            {towerDocModal && (
                <div className="modal-overlay" onClick={() => setTowerDocModal(false)}>
                    <div style={{ backgroundColor: 'white' }} className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Upload Tower Documents ({formData.noOfTowers} Towers) - PDF Only</h3>
                            <button onClick={() => setTowerDocModal(false)} className="close-btn">×</button>
                        </div>
                        <div className="modal-body">
                            {towerDocuments.map((tower) => (
                                <div key={tower.towerId} className="tower-upload-section">
                                    <label className="tower-label">
                                        <Building size={18} /> Tower {tower.towerId} Documents*
                                    </label>
                                    <div className="upload-container">
                                        <button
                                            type="button"
                                            className="upload-button"
                                            onClick={() => handleTowerFileInput(tower.towerId, tower.documents)}
                                        >
                                            <FaUpload className="upload-icon" /> Upload PDF Files
                                            <span className="upload-count">
                                                {tower.documents.length > 0 && `(${tower.documents.length} files)`}
                                            </span>
                                        </button>
                                    </div>
                                    {errors[`tower_${tower.towerId}`] && (
                                        <p className="error-text" style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                            {errors[`tower_${tower.towerId}`]}
                                        </p>
                                    )}
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
                title="Title Document (PDF Only)"
                showLandDocs={false}
                showOthDocs={false}
            />
            <WaterDocUploadModal
                show={showFeasibilityModal}
                onClose={() => setShowFeasibilityModal(false)}
                linkDocs={feasibilityDocs}
                setLinkDocs={setFeasibilityDocs}
                title="Other Document (PDF Only)"
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