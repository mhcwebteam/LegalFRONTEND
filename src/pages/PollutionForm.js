import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_DOC_URL } from '../config/Config';
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
    FolderUp,
    Edit,
    Eye,
    Lock,
    Trash2
} from "lucide-react";
import { FaLeaf, FaCalendarAlt, FaWater, FaUpload } from "react-icons/fa";
import ReusableDialog from "../components/ReusableDialog";
import PollutionDocUploadModal from "../components/PollutionDocUploadModal";

// ✅ PDF ONLY VALIDATION
const ALLOWED_FILE_TYPES = {
    'application/pdf': ['.pdf']
};

const PollutionForm = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const {
        totalMasterData = [],
        setHeaderData,
        headerData
    } = useContext(Context);

    const fileInputRef = useRef(null);
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
    
    // Edit mode states
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [plantExists, setPlantExists] = useState(false);
    const [dataExists, setDataExists] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [canEdit, setCanEdit] = useState(true);
    const [existingPlantData, setExistingPlantData] = useState(null);
    const [existingUploadedFiles, setExistingUploadedFiles] = useState([]);
    const [documentViewModal, setDocumentViewModal] = useState(false);
    const [currentViewFiles, setCurrentViewFiles] = useState([]);
    const [newDocs, setNewDocs] = useState([]); // Keep for new uploads
// Add these with other useState declarations
const [emailData, setEmailData] = useState([]);
const [userHasEditPermission, setUserHasEditPermission] = useState(false);
const [isCheckingPermission, setIsCheckingPermission] = useState(false);
    // ✅ PDF VALIDATION FUNCTION
    const validateFileType = (file) => {
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        const isValidType = fileExtension === '.pdf';
        
        if (!isValidType) {
            return false;
        }

        if (file.type && file.type !== 'application/pdf') {
            return false;
        }

        return true;
    };

    // --- Check User Login ---
    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const userObj = JSON.parse(userString);
                setLoggedInUser(userObj);
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, [token, navigate]);

    useEffect(() => {
        setHeaderData(null);
    }, []);
// Add this useEffect after your existing useEffect for checking user login
useEffect(() => {
  const fetchEmailData = async () => {
    setIsCheckingPermission(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/pcb-emailsdata`);
      console.log("Email API Response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setEmailData(response.data);
        
        // Check if current user has edit permission
        if (loggedInUser && loggedInUser.Email) {
          const userEmail = loggedInUser.Email.toLowerCase();
          console.log("Logged in user email:", userEmail);
          
          // Find matching email (case-insensitive)
          const userPermission = response.data.find(item => {
            const itemEmail = item.EMAIL ? item.EMAIL.toLowerCase() : '';
            return itemEmail === userEmail && item.EDIT === 1;
          });
          
          console.log("User permission found:", userPermission);
          setUserHasEditPermission(!!userPermission);
        }
      }
    } catch (error) {
      console.error("Error fetching email data:", error);
    } finally {
      setIsCheckingPermission(false);
    }
  };

  if (loggedInUser) {
    fetchEmailData();
  }
}, [loggedInUser]);
    // Check if plant exists in pollution table
    const checkIfPlantExists = async (plant) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/check-plant-exists`, { loc: plant });
            if (res.data.exists) {
                setPlantExists(true);
                setExistingPlantData(res.data.data);
                return true;
            } else {
                setPlantExists(false);
                setExistingPlantData(null);
                return false;
            }
        } catch (error) {
            console.error('Failed to check plant:', error);
            return false;
        }
    };

    // Fetch existing data when plant or process changes
    useEffect(() => {
        if (!formData.loc || !formData.process || formData.loc === "" || formData.process === "") {
            return;
        }

      const fetchExistingData = async () => {
    try {
        // Check if plant exists in pollution table
        const exists = await checkIfPlantExists(formData.loc);
        
        if (exists) {
            // Fetch existing pollution data
            const res = await axios.get(`${API_BASE_URL}/getProcessDatapcb`, {
                params: {
                    plant: formData.loc,
                    process: formData.process,
                },
            });

            const data = Array.isArray(res?.data) ? res.data[0] : res?.data;

            console.log("Fetched Pollution Data:", data);

            if (data && (data.LOC || data.APPLY_DT)) {
                // Parse existing files from DOC_NAME and DOC_PATH
                try {
                    let existingFiles = [];
                    
                    // Check if DOC_NAME and DOC_PATH exist and are not null
                    if (data.DOC_NAME && data.DOC_NAME !== 'null' && 
                        data.DOC_PATH && data.DOC_PATH !== 'null' &&
                        data.DOC_NAME !== 'undefined' && data.DOC_PATH !== 'undefined') {
                        
                        try {
                            // Parse DOC_NAME array
                            const docNames = JSON.parse(data.DOC_NAME);
                            // Parse DOC_PATH array  
                            const docPaths = JSON.parse(data.DOC_PATH);
                            
                            if (Array.isArray(docNames) && Array.isArray(docPaths) && 
                                docNames.length === docPaths.length) {
                                
                                existingFiles = docNames.map((name, index) => ({
                                    path: (docPaths[index] || '').replace(/\\/g, '/'),
                                    name: name || `Document_${index + 1}.pdf`,
                                    isExisting: true,
                                    url: `${API_DOC_URL}/storage/${(docPaths[index] || '').replace(/\\/g, '/')}`
                                }));
                            }
                        } catch (parseErr) {
                            console.error("JSON parse failed for DOC_NAME/DOC_PATH:", parseErr);
                            
                            // Try alternative parsing if JSON parsing fails
                            if (typeof data.DOC_NAME === 'string' && data.DOC_NAME.includes('"') &&
                                typeof data.DOC_PATH === 'string' && data.DOC_PATH.includes('"')) {
                                try {
                                    // Clean the strings and try parsing again
                                    const cleanDocName = data.DOC_NAME.replace(/\\/g, '');
                                    const cleanDocPath = data.DOC_PATH.replace(/\\/g, '');
                                    
                                    const docNames = JSON.parse(cleanDocName);
                                    const docPaths = JSON.parse(cleanDocPath);
                                    
                                    if (Array.isArray(docNames) && Array.isArray(docPaths)) {
                                        existingFiles = docNames.map((name, index) => ({
                                            path: (docPaths[index] || '').replace(/\\/g, '/'),
                                            name: name || `Document_${index + 1}.pdf`,
                                            isExisting: true,
                                            url: `${API_DOC_URL}/storage/${(docPaths[index] || '').replace(/\\/g, '/')}`
                                        }));
                                    }
                                } catch (secondParseErr) {
                                    console.error("Second attempt at parsing failed:", secondParseErr);
                                }
                            }
                        }
                    }
                    
                    console.log("Parsed existing files:", existingFiles);
                    setExistingUploadedFiles(existingFiles);

                    // Check if UPDATED field exists and is 'YES' (not null)
                    const isCompleted = data?.UPDATED && data?.UPDATED?.toUpperCase() === 'YES';
                    setCanEdit(!isCompleted);

                    // Update form data
                    const updatedFormData = {
                        loc: formData.loc,
                        process: formData.process,
                        applyDate: (data.APPLY_DT && data.APPLY_DT !== "nil") ? data.APPLY_DT : "",
                        comments: (data.COMMENTS && data.COMMENTS !== "nil") ? data.COMMENTS : "",
                    };

                    setFormData(updatedFormData);
                    setDataExists(true);
                    setIsEditMode(false); // Start in view mode
                    setNewDocs([]); // Clear new uploads

                    if (isCompleted) {
                        toast.info(`Application for ${formData.loc} is completed and cannot be edited.`, {
                            autoClose: 4000
                        });
                    } else {
                        toast.info(`Data loaded for ${formData.loc}.`, {
                            autoClose: 3000
                        });
                    }

                } catch (err) {
                    console.error("Error parsing document data:", err);
                    setExistingUploadedFiles([]);
                }
            } else {
                console.log("No existing data found");
                setDataExists(false);
                setExistingUploadedFiles([]);
                setIsEditMode(true);
                setCanEdit(true);
            }
        } else {
            console.log("Plant doesn't exist in pollution table");
            setDataExists(false);
            setPlantExists(false);
            setExistingUploadedFiles([]);
            setIsEditMode(true);
            setCanEdit(true);
        }
    } catch (err) {
        console.error("❌ Error fetching pollution data:", err.response || err);
        setDataExists(false);
        setExistingUploadedFiles([]);
        setIsEditMode(true);
        setCanEdit(true);
    }
};

        fetchExistingData();
    }, [formData.loc, formData.process]);

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

    // Toggle edit mode
    // Toggle edit mode
const toggleEditMode = () => {
    if (plantExists && dataExists) {
        if (!canEdit) {
            toast.error("This record has been completed and cannot be edited.", {
                autoClose: 4000
            });
            return;
        }

        // Check if user has edit permission
        if (!userHasEditPermission) {
            toast.error("You don't have permission to edit records.", {
                autoClose: 4000
            });
            return;
        }

        setIsEditMode(!isEditMode);
        if (!isEditMode) {
            toast.info("Edit mode enabled. You can now modify the form.", {
                autoClose: 3000
            });
        } else {
            toast.info("Edit mode disabled. Form is now read-only.", {
                autoClose: 3000
            });
        }
    }
};

    // View documents
    const viewDocuments = (files) => {
        setCurrentViewFiles(files);
        setDocumentViewModal(true);
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (name === "loc") {
            setFormData(prev => ({ ...prev, loc: value }));

            try {
                const res = await getMasterByLoc(value);
                if (res) {
                    setHeaderData(res);
                } else {
                    setHeaderData(null);
                }
            } catch (err) {
                console.error("Error fetching master by loc:", err);
                setHeaderData(null);
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        const isUpdate = plantExists && dataExists && isEditMode;

        if (!formData.loc) newErrors.loc = "Plant name is required";
        if (!formData.applyDate) newErrors.applyDate = "Application date is required";
        if (!formData.comments) newErrors.comments = "Please enter comments";
        
        // Document validation
        const totalFiles = [...existingUploadedFiles, ...newDocs];
        if (totalFiles.length === 0) {
            newErrors.document = "At least one PDF document is required";
        } else {
            // Validate new files are PDFs
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

    let currentUserName = loggedInUser.username;
    const isUpdate = plantExists && dataExists && isEditMode;

    const formPayload = new FormData();
    formPayload.append('loc', formData.loc);
    formPayload.append('process', formData.process);
    formPayload.append('applyDate', formData.applyDate);
    formPayload.append('comments', formData.comments);
    formPayload.append('receivedDate', "");
    formPayload.append('username', currentUserName);

    // For updates, include existing files
    if (isUpdate) {
        formPayload.append('isUpdate', 'true');
        formPayload.append('UPLOAD_DOC[]', JSON.stringify(existingUploadedFiles.map(f => f.path)));
    }

    // Append new files
    newDocs.forEach((file, index) => {
        if (validateFileType(file)) {
            formPayload.append(`document[${index}]`, file, file.name);
            formPayload.append(`doc_name[${index}]`, file.name);
        }
    });

    try {
        const endpoint = isUpdate 
            ? `${API_BASE_URL}/pollutionPartialUpdate`
            : `${API_BASE_URL}/pollution-submit`;
        
        const response = await axios.post(endpoint, formPayload, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const successMessage = response.data.message || 
            (isUpdate ? "Application updated successfully!" : "Application submitted successfully!");

        // FIRST: Close the confirmation dialog
        setConfirmOpen(false);
        
        // SECOND: Show success message (after confirmation dialog is closed)
        await Swal.fire({
            icon: "success",
            title: successMessage,
            showConfirmButton: false,
            timer: 1000,
        });

        // THIRD: Reset form and navigate
        if (isUpdate) {
            setIsEditMode(false);
            setNewDocs([]);
            // Refresh data if needed
            if (formData.loc && formData.process) {
                try {
                    const res = await axios.get(`${API_BASE_URL}/getProcessDatapcb`, {
                        params: {
                            plant: formData.loc,
                            process: formData.process,
                        },
                    });
                    
                    const updatedData = Array.isArray(res?.data) ? res.data[0] : res?.data;
                    if (updatedData) {
                        try {
                            let existingFiles = [];
                            if (updatedData.UPLOAD_DOC && updatedData.UPLOAD_DOC !== 'null') {
                                const docStr = String(updatedData.UPLOAD_DOC).trim();
                                try {
                                    const docArray = JSON.parse(docStr);
                                    if (Array.isArray(docArray)) {
                                        existingFiles = docArray.map((item, index) => ({
                                            path: (item.stored_path || '').replace(/\\/g, '/'),
                                            name: item.file_name || `Document_${index + 1}.pdf`,
                                            isExisting: true,
                                            url: `${API_DOC_URL}/storage/${(item.stored_path || '').replace(/\\/g, '/')}`
                                        }));
                                    }
                                } catch (parseErr) {
                                    console.error("Error parsing updated docs:", parseErr);
                                }
                            }
                            setExistingUploadedFiles(existingFiles);
                        } catch (err) {
                            console.error("Error updating files:", err);
                        }
                    }
                } catch (err) {
                    console.error("Error refreshing data:", err);
                }
            }
        } else {
            // For new submission, reset form
            setFormData({
                loc: '',
                process: formData.process,
                applyDate: '',
                comments: '',
                document: [],
            });
            setNewDocs([]);
            setExistingUploadedFiles([]);
            setDataExists(false);
            setPlantExists(false);
            setIsEditMode(false);
        }
        
        // Navigate after success message
        navigate('/create');
        
    } catch (err) {
        console.error('Submission error:', err.response?.data || err.message);
        // Close confirmation dialog on error
        setConfirmOpen(false);
        toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
        setIsSubmitting(false);
    }
};
    
const deleteDocument = async (file) => {
    try {
        console.log("=== DELETE DEBUG ===");
        console.log("File object from state:", file);
        console.log("File path from state:", file.path);
        console.log("File URL from state:", file.url);
        
        // Extract path from URL (more reliable)
        let docPathToDelete = "";
        if (file.url) {
            // Extract path from: http://localhost:3000/storage/pollution_docs/filename.pdf
            const urlParts = file.url.split('/storage/');
            if (urlParts.length > 1) {
                docPathToDelete = urlParts[1];
                console.log("Extracted path from URL:", docPathToDelete);
            }
        }
        
        // If URL extraction failed, use file.path
        if (!docPathToDelete && file.path) {
            docPathToDelete = file.path;
        }
        
        // Clean the path
        docPathToDelete = docPathToDelete.replace(/\\/g, '/');
        docPathToDelete = docPathToDelete.replace(/^"/, '').replace(/"$/, '');
        
        console.log("Final docPath to send:", docPathToDelete);
        console.log("Plant:", formData.loc);
        console.log("Process:", formData.process);
        console.log("==================");
        
        const response = await axios.post(`${API_BASE_URL}/delete-edit-file`, {
            plant: formData.loc,
            process: formData.process,
            docPath: docPathToDelete
        });

        console.log("API Response:", response.data);
        
        if (response.data.success) {
            // Remove file from UI
            const updatedFiles = currentViewFiles.filter(f => f.url !== file.url);
            setCurrentViewFiles(updatedFiles);
            
            const updatedExistingFiles = existingUploadedFiles.filter(f => f.url !== file.url);
            setExistingUploadedFiles(updatedExistingFiles);
            
            toast.success(`File "${file.name}" deleted successfully`);
            
            if (updatedFiles.length === 0) {
                setDocumentViewModal(false);
            }
            
            // Refresh data from server
            await refreshDocumentList();
        } else {
            toast.error(response.data.message || 'Delete failed');
        }
    } catch (error) {
        console.error('Delete error:', error.response?.data || error);
        toast.error(error.response?.data?.message || 'Delete failed. Please try again.');
    }
};

// Function to refresh document list from server
const refreshDocumentList = async () => {
    try {
        console.log("Refreshing document list...");
        
        const res = await axios.get(`${API_BASE_URL}/getProcessDatapcb`, {
            params: {
                plant: formData.loc,
                process: formData.process,
            },
        });

        console.log("Refresh response:", res.data);
        
        const data = Array.isArray(res?.data) ? res.data[0] : res?.data;
        
        if (data) {
            console.log("DOC_PATH from server:", data.DOC_PATH);
            console.log("DOC_NAME from server:", data.DOC_NAME);
            
            let existingFiles = [];
            
            // Parse DOC_PATH
            if (data.DOC_PATH && data.DOC_PATH !== 'null' && data.DOC_PATH !== 'undefined') {
                try {
                    // Try to parse as JSON array first
                    let paths = [];
                    try {
                        paths = JSON.parse(data.DOC_PATH);
                    } catch (e) {
                        // If not JSON, treat as string
                        paths = [data.DOC_PATH];
                    }
                    
                    // Parse DOC_NAME
                    let names = [];
                    if (data.DOC_NAME && data.DOC_NAME !== 'null' && data.DOC_NAME !== 'undefined') {
                        try {
                            names = JSON.parse(data.DOC_NAME);
                        } catch (e) {
                            names = [data.DOC_NAME];
                        }
                    }
                    
                    // Create file objects
                    existingFiles = paths.map((path, index) => ({
                        path: path.replace(/\\/g, '/'),
                        name: names[index] || `Document_${index + 1}.pdf`,
                        isExisting: true,
                        url: `${API_DOC_URL}/storage/${path.replace(/\\/g, '/')}`
                    }));
                    
                    console.log("Parsed files:", existingFiles);
                    
                } catch (err) {
                    console.error("Error parsing document data:", err);
                }
            }
            
            setExistingUploadedFiles(existingFiles);
        }
    } catch (err) {
        console.error("Error refreshing document list:", err);
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

              
{/* Edit Mode Controls */}
<div style={{
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    paddingRight: '20px',
    marginTop: '20px',
}}>
    
    {isCheckingPermission ? (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: '#f8f9fa',
            border: '1px solid #6c757d',
            borderRadius: '4px',
            color: '#6c757d',
            fontSize: '12px',
            fontWeight: '500',
        }}>
            <div className="spinner-small"></div>
            Checking Permission...
        </div>
    ) : (
        plantExists && dataExists && (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                {!canEdit ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        background: '#f8f9fa',
                        border: '1px solid #dc3545',
                        borderRadius: '4px',
                        color: '#dc3545',
                        fontSize: '12px',
                        fontWeight: '500',
                    }}>
                        <Lock size={14} />
                        Application Completed - Cannot Edit
                    </div>
                ) : (
                    // Show appropriate message or edit button based on permission
                    !userHasEditPermission ? (
                       ''
                    ) : (
                        <button
                            type="button"
                            onClick={toggleEditMode}
                            title={
                                isEditMode
                                    ? "Disable Edit Mode"
                                    : "Enable Edit Mode"
                            }
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 22px',
                                background: isEditMode
                                    ? 'linear-gradient(135deg, #ff6b6b, #ff4757)'
                                    : 'linear-gradient(135deg, #6a82fb, #8e54e9)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = isEditMode
                                    ? 'linear-gradient(135deg, #ff5252, #ff3838)'
                                    : 'linear-gradient(135deg, #5b73e8, #7c43d6)';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(106, 130, 251, 0.45)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = isEditMode
                                    ? 'linear-gradient(135deg, #ff6b6b, #ff4757)'
                                    : 'linear-gradient(135deg, #6a82fb, #8e54e9)';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            {isEditMode ? (
                                <>
                                    <Lock size={18} />
                                    Disable Edit
                                </>
                            ) : (
                                <>
                                    <Edit size={18} />
                                    Edit Mode
                                </>
                            )}
                        </button>
                    )
                )}
            </div>
        )
    )}
</div>

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
                                        disabled={plantExists && dataExists && !isEditMode}
                                        style={{
                                            backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                                            color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                                        }}
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
                                       <input
      type="date"
      name="applyDate"
      value={formData.applyDate || ""}
          max={new Date().toISOString().split('T')[0]}
      onChange={handleChange}
      className="modern-input"
      placeholder="Select Application Date"
      disabled={plantExists && dataExists && !isEditMode}
      style={{
        backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
        color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit',
        cursor: plantExists && dataExists && !isEditMode ? 'default' : 'pointer'
      }}
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
                                        onClick={() => {
                                            if (plantExists && dataExists && !isEditMode) {
                                                toast.warning("Please enable edit mode to upload files.");
                                                return;
                                            }
                                            setShowUploadModal(true);
                                        }}
                                        disabled={plantExists && dataExists && !isEditMode}
                                        style={{
                                            opacity: plantExists && dataExists && !isEditMode ? 0.6 : 1,
                                            cursor: plantExists && dataExists && !isEditMode ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        <FaUpload className="upload-icon" /> 
                                        {plantExists && dataExists ? 'Add New Documents' : 'Upload PDF Files'}
                                        {(newDocs.length > 0 || existingUploadedFiles.length > 0) && (
                                            <span className="upload-count">
                                                ({existingUploadedFiles.length + newDocs.length} PDF
                                                {existingUploadedFiles.length + newDocs.length !== 1 ? 's' : ''})
                                                {newDocs.length > 0 && ` (+${newDocs.length} new)`}
                                            </span>
                                        )}
                                    </button>
                                    
                                    {/* View Existing Files Button */}
                                    {existingUploadedFiles.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => viewDocuments(existingUploadedFiles)}
                                            style={{
                                                marginTop: '8px',
                                                padding: '6px 12px',
                                                background: '#e9ecef',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '4px',
                                                color: '#495057',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                width: '100%',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Eye size={14} />
                                            View Existing Documents ({existingUploadedFiles.length})
                                        </button>
                                    )}
                                    
                                    {errors.document && <p className="error-text">{errors.document}</p>}
                                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                        Only PDF files are accepted
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
                                        style={{ 
                                            width: '100%',
                                            backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                                            color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                                        }}
                                        readOnly={plantExists && dataExists && !isEditMode}
                                    />
                                </div>
                                {errors.comments && <p className="error-text">{errors.comments}</p>}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'end', height: '100%', paddingLeft: '50px', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    className={`submit-button ${isSubmitting ? "submitting" : ""}`}
                                    disabled={isSubmitting || (plantExists && dataExists && !isEditMode)}
                                    style={{ 
                                        width: 'auto', 
                                        padding: '12px 30px',
                                        opacity: plantExists && dataExists && !isEditMode ? 0.6 : 1,
                                        cursor: plantExists && dataExists && !isEditMode ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="spinner"></div>
                                            {plantExists && dataExists && isEditMode ? 'Updating...' : 'Submitting...'}
                                        </>
                                    ) : (
                                        <>
                                            <FaWater className="submit-icon" /> 
                                            {plantExists && dataExists && isEditMode ? 'Update' : 'Submit'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Upload Modal */}
            <PollutionDocUploadModal
                show={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                files={newDocs}
                setFiles={setNewDocs}
                title="Upload PDF Documents Only"
                validateFileType={validateFileType}
            />

            {/* Confirmation Dialog */}
           <ReusableDialog
    open={confirmOpen}
    title={plantExists && dataExists && isEditMode ? "Confirm Update" : "Confirm Submission"}
    message={
        plantExists && dataExists && isEditMode
            ? "Are you sure you want to update this application? This will add new documents while keeping existing ones."
            : "Are you sure you want to submit this application? Please review all information before proceeding."
    }
    onClose={() => {
        if (!isSubmitting) {
            setConfirmOpen(false);
        }
    }}
    onConfirm={handleConfirmSubmit}
    confirmText={plantExists && dataExists && isEditMode ? "Update" : "Submit"}
    cancelText="Cancel"
    isLoading={isSubmitting}
    disableCancel={isSubmitting} // Disable cancel button while submitting
/>

            {/* Document View Modal */}
            {documentViewModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            borderBottom: '1px solid #e9ecef',
                            paddingBottom: '10px'
                        }}>
                            <h3 style={{ margin: 0, color: '#007bff' }}>
                                📄 Existing Documents
                                {isEditMode && (
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#6c757d',
                                        marginLeft: '10px',
                                        fontWeight: 'normal'
                                    }}>
                                        (Edit Mode - Files can be deleted)
                                    </span>
                                )}
                            </h3>
                            <button
                                onClick={() => setDocumentViewModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#6c757d'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div>
                            {currentViewFiles.map((file, index) => (
                                <div key={index} style={{
                                    padding: '10px',
                                    marginBottom: '10px',
                                    background: '#f8f9fa',
                                    borderRadius: '4px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '5px'
                                    }}>
                                        <span style={{ 
                                            fontWeight: '500',
                                            color: '#495057',
                                            maxWidth: '70%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {file.name}
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                onClick={() => window.open(file.url, '_blank')}
                                                style={{
                                                    padding: '4px 12px',
                                                    background: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <Eye size={12} />
                                                View
                                            </button>
                                            
                                            {/* Delete button - only show in edit mode */}
                                            {isEditMode && (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
                                                            await deleteDocument(file);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '4px 12px',
                                                        background: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                    title="Delete this file"
                                                >
                                                    <Trash2 size={12} />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#6c757d',
                                        marginTop: '5px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                       
                                        {file.isExisting && (
                                            <span style={{
                                                background: '#e9ecef',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                fontSize: '10px'
                                            }}>
                                                Existing File
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {currentViewFiles.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#6c757d'
                                }}>
                                    <FileText size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                    <p>No documents found</p>
                                </div>
                            )}
                        </div>
                        
                        <div style={{ 
                            marginTop: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                {currentViewFiles.length} document(s) total
                            </div>
                            <button
                                onClick={() => setDocumentViewModal(false)}
                                style={{
                                    padding: '8px 20px',
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

