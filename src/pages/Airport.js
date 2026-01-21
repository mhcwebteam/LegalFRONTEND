import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_DOC_URL } from '../config/Config';
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
  Edit,
  Eye,
  Lock,
  X,
  Trash2
} from "lucide-react";
import { FaCalendarAlt, FaFileAlt, FaLeaf, FaUpload, FaWater } from 'react-icons/fa';

// Import your components
import ProjectInfoHeader from "../components/ProjectInfoHeader";
import ReusableDialog from "../components/ReusableDialog";
import ApplyDateInput from '../components/ApplyDateInput';
import Swal from "sweetalert2";
import WaterDocUploadModal from "../components/WaterDocUploadModal";
import ProcessField from '../components/ProcessField';
const AirportForm = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [linkDocs, setLinkDocs] = useState([]);
  const [newLinkDocs, setNewLinkDocs] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  // Edit mode states
  const [plantExists, setPlantExists] = useState(false);
  const [existingPlantData, setExistingPlantData] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [existingUploadedFiles, setExistingUploadedFiles] = useState([]);
  const [documentViewModal, setDocumentViewModal] = useState(false);
  const [currentViewFiles, setCurrentViewFiles] = useState([]);
// Add these with other useState declarations
const [emailData, setEmailData] = useState([]);
const [userHasEditPermission, setUserHasEditPermission] = useState(false);
const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const {
    totalMasterData = [],
    setHeaderData,
    headerData 
  } = useContext(Context);

  const [formData, setFormData] = useState({
    loc: '',
    process: '',
    applyDate: '',
    totalPrjArea: '',
    noOfNocs: '',
    comments: ''
  });

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
  useEffect(() => {
    setHeaderData(null);
  }, []);

  // Fetch default process
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
  }, []);

  // Check for existing data when plant or process changes
  useEffect(() => {
    if (!formData.loc || !formData.process || formData.loc === "" || formData.process === "") {
      return;
    }

    const fetchExistingData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/getProcessData`, {
          params: {
            plant: formData.loc,
            process: formData.process,
          },
        });

        const data = Array.isArray(res?.data) ? res.data[0] : res?.data;

        if (data && (data.LOC || data.APPLY_DT || data.NO_OF_NOCS)) {
          // Parse existing files
          try {
            let existingFiles = [];
            if (data.DOCUMENT_PATH && data.DOCUMENT_PATH !== 'null' && data.DOCUMENT_PATH !== 'undefined') {
              const docPaths = String(data.DOCUMENT_PATH).split(',').filter(path => path && path.trim() !== '');
              const docNames = data.DOCUMENT_NAME ? 
                String(data.DOCUMENT_NAME).split(',').filter(name => name && name.trim() !== '') : [];
              
              existingFiles = docPaths.map((path, index) => ({
                path: path.trim().replace(/[\[\]"]/g, ''),
                name: (docNames[index] || `Document_${index + 1}.pdf`).trim().replace(/[\[\]"]/g, ''),
                isExisting: true,
                url: `${API_DOC_URL}/storage/${path.trim().replace(/[\[\]"]/g, '')}`
              }));
            }
            setExistingUploadedFiles(existingFiles);
          } catch (err) {
            console.error("Error parsing document data:", err);
            setExistingUploadedFiles([]);
          }

          // Check if application is completed (UPDATED = 'YES')
          const isCompleted = data?.UPDATED && data?.UPDATED?.toUpperCase() === 'YES';
          setCanEdit(!isCompleted);

          const updatedFormData = {
            loc: formData.loc,
            process: formData.process,
            applyDate: (data.APPLY_DT && data.APPLY_DT !== "nil") ? data.APPLY_DT : "",
            comments: (data.COMMENTS && data.COMMENTS !== "nil") ? data.COMMENTS : "",
            totalPrjArea: (data.TOTAL_PRJ_AREA && data.TOTAL_PRJ_AREA !== "nil" && data.TOTAL_PRJ_AREA !== null) ? data.TOTAL_PRJ_AREA : "",
            noOfNocs: (data.NO_OF_NOCS && data.NO_OF_NOCS !== "nil") ? data.NO_OF_NOCS : "",
          };

          setFormData(updatedFormData);
          setDataExists(true);
          setPlantExists(true);
          setExistingPlantData(data);
          setIsEditMode(false); // Start in view mode
          setNewLinkDocs([]); // Clear new uploads

          if (isCompleted) {
            toast.info(`Application for ${formData.loc} is completed and cannot be edited.`, {
              autoClose: 4000
            });
          } else {
           
          }

        } else {
          console.log("ℹ️ No existing data found");
          setDataExists(false);
          setPlantExists(false);
          setExistingPlantData(null);
          setExistingUploadedFiles([]);
          setIsEditMode(true); // Allow editing since no data exists
          setCanEdit(true);

          setFormData(prev => ({
            ...prev,
            applyDate: "",
            comments: "",
            totalPrjArea: "",
            noOfNocs: "",
          }));
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setDataExists(false);
        setPlantExists(false);
        setExistingPlantData(null);
        setExistingUploadedFiles([]);
        setIsEditMode(true);
        setCanEdit(true);

        setFormData(prev => ({
          ...prev,
          applyDate: "",
          comments: "",
          totalPrjArea: "",
          noOfNocs: "",
        }));
      }
    };

    fetchExistingData();
  }, [formData.loc, formData.process]);

// Toggle edit mode
const toggleEditMode = () => {
    if (plantExists && dataExists) {
        if (!canEdit) {
            toast.error("This application is completed and cannot be edited (UPDATED = 'YES').", {
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
      setFormData((prev) => ({
        ...prev,
        loc: value,
      }));

      if (errors.loc) {
        setErrors(prev => ({ ...prev, loc: '' }));
      }

      if (!value || value.trim() === "") {
        setHeaderData({});
        setPlantExists(false);
        setExistingPlantData(null);
        setExistingUploadedFiles([]);
        setNewLinkDocs([]);
        setIsEditMode(false);
        setCanEdit(true);
        setFormData(prev => ({
          ...prev,
          applyDate: "",
          totalPrjArea: "",
          noOfNocs: "",
          comments: "",
        }));
        return;
      }

      try {
        // Fetch master data
        const res = await getMasterByLoc(value);
        if (res && Object.keys(res).length > 0) {
          setHeaderData(res);
        } else {
          console.warn('⚠️ No master data found for location:', value);
          setHeaderData({});
        }
      } catch (err) {
        console.error("❌ Error fetching master by loc:", err);
        setHeaderData({});
        setPlantExists(false);
        setExistingPlantData(null);
        setExistingUploadedFiles([]);
        setCanEdit(true);
      }
      return;
    }

    // Handle all other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
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

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.loc || formData.loc.trim() === '') {
      newErrors.loc = 'Plant Name is required';
    }
    
    if (!formData.process || formData.process.trim() === '') {
      newErrors.process = 'Process Type is required';
    }
    
    // For new submission or edit mode, validate required fields
    const isUpdate = plantExists && dataExists && isEditMode;
    
    if (!isUpdate) {
      // For new submission
      if (!formData.applyDate || formData.applyDate.trim() === '') {
        newErrors.applyDate = 'Application Date is required';
      }
      
      if (!formData.totalPrjArea || formData.totalPrjArea.trim() === '') {
        newErrors.totalPrjArea = 'Total Project Area is required';
      }
      
      if (!formData.noOfNocs || formData.noOfNocs.trim() === '') {
        newErrors.noOfNocs = 'Number of NOCs is required';
      }
      
      if (!formData.comments || formData.comments.trim() === '') {
        newErrors.comments = 'Comments are required';
      }
      
      // Document validation for new submission
      const totalFiles = [...existingUploadedFiles, ...newLinkDocs];
      if (totalFiles.length === 0) {
        newErrors.document = 'At least one document is required';
      }
    } else {
      // For update
      const totalFiles = [...existingUploadedFiles, ...newLinkDocs];
      if (totalFiles.length === 0) {
        newErrors.document = 'At least one document is required';
      }
      
      // Validate new files if any
      if (newLinkDocs.length > 0) {
        const invalidFiles = newLinkDocs.filter(file => 
          !file.name.toLowerCase().endsWith('.pdf')
        );
        if (invalidFiles.length > 0) {
          newErrors.document = 'All documents must be PDF files';
        }
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
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
    
    setConfirmOpen(true);
  };

const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setIsSubmitting(true);

    const isUpdate = plantExists && dataExists && isEditMode;
    let currentUserName = loggedInUser.username;
    const formPayload = new FormData();

    formPayload.append('loc', formData.loc);
    formPayload.append('process', formData.process);
    formPayload.append('applyDate', formData.applyDate);
    formPayload.append('totalPrjArea', formData.totalPrjArea);
    formPayload.append('noOfNocs', formData.noOfNocs);
    formPayload.append('comments', formData.comments);
    formPayload.append('username', currentUserName);

    // Only append new files (not existing files)
    if (newLinkDocs.length > 0) {
      newLinkDocs.forEach(f => {
        formPayload.append("documents[]", f);
      });
    }

    // For update, we need to indicate it's an update
    // if (isUpdate) {
    //   formPayload.append('isUpdate', 'true');
    // }

    try {
      // ✅ Use two different endpoints like RERA form
      const endpoint = isUpdate 
        ? `${API_BASE_URL}/airportPartialUpdate`  // For updates
        : `${API_BASE_URL}/airport-submit`;         // For new submissions
      
      console.log('📤 Sending to endpoint:', endpoint);
      console.log('📦 Payload keys:');
      for (let pair of formPayload.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }

      const response = await axios.post(endpoint, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const successMessage = response?.data?.message || 
        (isUpdate ? "Application updated successfully!" : "Application submitted successfully!");

      await Swal.fire({
        icon: "success",
        title: successMessage,
        showConfirmButton: false,
        timer: 2000,
      });

      toast.success(successMessage);

      if (isUpdate) {
        setIsEditMode(false);
        toast.info("Edit mode disabled. Form is now read-only.", {
          autoClose: 3000
        });
        
        // Refresh data after update
        if (formData.loc && formData.process) {
          const res = await axios.get(`${API_BASE_URL}/getProcessData`, {
            params: {
              plant: formData.loc,
              process: formData.process,
            },
          });
          
          const updatedData = Array.isArray(res?.data) ? res.data[0] : res?.data;
          if (updatedData) {
            // Parse and update files (existing + new)
            try {
              let allFiles = [];
              
              // First, add existing files
              existingUploadedFiles.forEach(file => {
                allFiles.push({
                  ...file,
                  isExisting: true
                });
              });
              
              // Then add new files that were just uploaded
              // We need to get these from the response or refetch
              // For now, we'll clear newLinkDocs since they've been submitted
         
              
              setExistingUploadedFiles(allFiles);

                   setNewLinkDocs([]);
              setCurrentViewFiles([]);
              console.log("📁 Files after update:", allFiles);
            } catch (err) {
              console.error("Error updating files:", err);
            }
          }
        }
        setNewLinkDocs([]);
      } else {
        // For new submission, reset form
        setFormData({ 
          loc: '', 
          process: '', 
          applyDate: '', 
          totalPrjArea: '',
          noOfNocs: '',
          comments: '', 
        });
        setLinkDocs([]);
        setNewLinkDocs([]);
        setExistingUploadedFiles([]);
        setDataExists(false);
        setPlantExists(false);
        setIsEditMode(false);
        setCanEdit(true);
      }
      
      setErrors({});
      navigate('/create');
    } catch (err) {
      console.error('Submission error:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || 
        (isUpdate ? 'Update failed. Please try again.' : 'Submission failed. Please try again.');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate('/create');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="air-form-wrapper">
      <style>{`
        .disabled-input-view {
          background-color: #f8f9fa;
          border: 1px solid #ced4da;
          border-radius: 4px;
          padding: 10px 12px;
          min-height: 38px;
          color: #495057;
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        
        .disabled-textarea-view {
          background-color: #f8f9fa;
          border: 1px solid #ced4da;
          border-radius: 4px;
          padding: 10px 12px;
          min-height: 60px;
          color: #495057;
          white-space: pre-wrap;
          font-size: 14px;
        }
        
        .existing-files-list {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 15px;
          margin-top: 10px;
        }
        
        .existing-file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .existing-file-name {
          font-size: 14px;
          color: #495057;
          max-width: 70%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .air-upload-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
      
        .upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .upload-count {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
        
        .error-text {
          color: #ef4444;
          font-size: 14px;
          margin-top: 4px;
          margin-bottom: 0;
        }
        
        .has-error .modern-input,
        .has-error .form-control {
          border: 2px solid #ef4444 !important;
        }

          .disabled-input-view {
          background-color: #f8f9fa;
          border: 1px solid #ced4da;
          border-radius: 4px;
          padding: 8px 12px;
          min-height: 38px;
          color: #495057;
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        
        .disabled-textarea-view {
          background-color: #f8f9fa;
          border: 1px solid #ced4da;
          border-radius: 4px;
          padding: 8px 12px;
          min-height: 50px;
          color: #495057;
          white-space: pre-wrap;
          font-size: 14px;
        }
      `}</style>

      <form className="air-form-container" onSubmit={handleSubmit}>
        {/* HEADER */}
        <div className="form-header">
          <div className="header-content">
            <div className="title-section">
              <div className="icon-wrapper">
                <Landmark className="water-icon" size={32} />
              </div>
              <h1 className="form-title">AIR PORT Form Application</h1>
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
    
  {/* Edit Mode Controls */}
{
  plantExists && dataExists && (
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Show "Application Completed" message when UPDATED = 'YES' */}
          {existingPlantData?.UPDATED?.toUpperCase() === 'YES' && (
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
          )}

          {/* Edit Button - Show only when UPDATED !== 'YES' and user has permission */}
          {existingPlantData?.UPDATED?.toUpperCase() !== 'YES' && (
            !userHasEditPermission ? (
             ''
            ) : (
              <button
                type="button"
                onClick={toggleEditMode}
                disabled={!canEdit}
                title={
                  !canEdit
                    ? "This record cannot be edited (UPDATED = 'YES')"
                    : isEditMode
                      ? "Disable Edit Mode"
                      : "Enable Edit Mode"
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  background: !canEdit
                    ? '#e0e0e0'
                    : isEditMode
                      ? 'linear-gradient(135deg, #ff6b6b, #ff4757)'
                      : 'linear-gradient(135deg, #6a82fb, #8e54e9)',
                  color: !canEdit ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: !canEdit ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: !canEdit ? 0.65 : 1,
                }}
                onMouseEnter={(e) => {
                  if (canEdit) {
                    e.target.style.background = isEditMode
                      ? 'linear-gradient(135deg, #ff5252, #ff3838)'
                      : 'linear-gradient(135deg, #5b73e8, #7c43d6)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(106, 130, 251, 0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canEdit) {
                    e.target.style.background = isEditMode
                      ? 'linear-gradient(135deg, #ff6b6b, #ff4757)'
                      : 'linear-gradient(135deg, #6a82fb, #8e54e9)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
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
      )}
    </div>
  )
}


        <div className="form-content">
          {/* Project Information */}
          <div className="form-section">
            <div className="section-header">
              <Home className="section-icon" size={20} />
              <h3 style={{ color: '#0e7bdae7' }}>Project Information:</h3>
            </div>

            <div className="form-grid two-columns">
              {/* Plant Name */}
              <div className={`form-field mt-2 ${errors.loc ? 'has-error' : ''}`}>
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

              {/* Process Type */}
              <div className={`form-field mt-2 ${errors.process ? 'has-error' : ''}`}>
                <label className="field-label">
                  <FaLeaf className="label-icon" /> Process Type*
                </label>
                <div className="input-wrapper">
                  <ProcessField
                    apiUrl={`${API_BASE_URL}/airport-process`}
                    value={formData.process}
                    onChange={handleProcessChange}
                    className="modern-input"
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    disabled={plantExists && dataExists && !isEditMode}
                  />
                  {errors.process && <p className="error-text">{errors.process}</p>}
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
              {/* Application Date */}
              <div className={`form-field mt-2 ${errors.applyDate ? 'has-error' : ''}`}>
                <label className="field-label">
                  <FaCalendarAlt className="label-icon" /> Application Date*
                </label>
                <div className="input-wrapper">
                  {plantExists && dataExists && !isEditMode ? (
                    <div className="disabled-input-view">
                      {formatDate(formData.applyDate)}
                    </div>
                  ) : (
                    <>
                      <ApplyDateInput
                        value={formData.applyDate}
                        onChange={handleChange}
                        className="modern-input"
                      />
                      {errors.applyDate && <p className="error-text">{errors.applyDate}</p>}
                    </>
                  )}
                </div>
              </div>

              {/* Upload Documents */}
              <div className={`form-field mt-2 ${errors.document ? 'has-error' : ''}`}>
                <label className="field-label">
                  <FaFileAlt className="label-icon" /> Upload Documents*
                </label>
                <div className="air-upload-container mt-2">
                  {plantExists && dataExists && !isEditMode ? (
                    <div>
                      <div className="disabled-input-view">
                        {existingUploadedFiles.length > 0 ? (
                          <span>{existingUploadedFiles.length} document(s) uploaded</span>
                        ) : (
                          <span className="text-muted">No documents uploaded</span>
                        )}
                      </div>
                      
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
                          View Documents ({existingUploadedFiles.length})
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="upload-button"
                        onClick={() => setShowFeasibilityModal(true)}
                        disabled={plantExists && dataExists && !isEditMode}
                        style={{
                          border: errors.document ? '2px solid #ef4444' : '1px solid #d1d5db',
                          opacity: plantExists && dataExists && !isEditMode ? 0.6 : 1,
                          cursor: plantExists && dataExists && !isEditMode ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <FaUpload className="label-icon" /> 
                        {plantExists && dataExists ? 'Add New Documents' : 'Upload PDF Documents'}
                        <span className="upload-count">
                          {newLinkDocs.length > 0 && `(${newLinkDocs.length} new)`}
                        </span>
                      </button>
                      
                      {/* View Existing Files Button in edit mode */}
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
                    </>
                  )}
                  {errors.document && <p className="error-text">{errors.document}</p>}
                </div>
              </div>
            </div>
            <div>
              <div className={`form-field ${errors.comments ? 'has-error' : ''}`}>
              <label className="field-label">
                <MessageSquareMore className="label-icon" /> Comments*
              </label>
              <div className="input-wrapper">
                {plantExists && dataExists && !isEditMode ? (
                  <div className="disabled-textarea-view">
                    {formData.comments || 'No comments'}
                  </div>
                ) : (
                  <>
                    <textarea
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Enter your comments"
                      rows="2"
                      style={{
                        backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                        color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                      }}
                      readOnly={plantExists && dataExists && !isEditMode}
                    />
                    {errors.comments && (
                      <p className="error-text">{errors.comments}</p>
                    )}
                  </>
                )}
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
              {/* Total Project Area */}
              <div className={`form-field mt-2 ${errors.totalPrjArea ? 'has-error' : ''}`}>
                <label className="field-label">
                  <MessageSquareMore className="label-icon" /> Total Project Area (in acres)*
                </label>
                <div className="input-wrapper">
                  {plantExists && dataExists && !isEditMode ? (
                    <div className="disabled-input-view">
                      {formData.totalPrjArea ? `${formData.totalPrjArea} acres` : 'Not provided'}
                    </div>
                  ) : (
                    <>
                      <input
                        type="number"
                        name="totalPrjArea"
                        value={formData.totalPrjArea}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter area"
                        min="0"
                        step="any"
                        style={{
                          backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                          color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                        }}
                        readOnly={plantExists && dataExists && !isEditMode}
                      />
                      {errors.totalPrjArea && (
                        <p className="error-text">{errors.totalPrjArea}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Number of NOCs */}
              <div className={`form-field mt-2 ${errors.noOfNocs ? 'has-error' : ''}`}>
                <label className="field-label">
                  <MessageSquareMore className="label-icon" /> Number of NOCs*
                </label>
                <div className="input-wrapper">
                  {plantExists && dataExists && !isEditMode ? (
                    <div className="disabled-input-view">
                      {formData.noOfNocs || 'Not provided'}
                    </div>
                  ) : (
                    <>
                      <input
                        type="number"
                        name="noOfNocs"
                        className="form-control"
                        value={formData.noOfNocs}
                        onChange={handleChange}
                        placeholder="Enter number of NOCs"
                        min="0"
                        style={{
                          backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                          color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                        }}
                        readOnly={plantExists && dataExists && !isEditMode}
                      />
                      {errors.noOfNocs && (
                        <p className="error-text">{errors.noOfNocs}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Comments */}
        

            {/* Submit Button */}
            <div style={{ display: 'flex', alignItems: 'end', height: '100%', paddingLeft: '50px', justifyContent: 'flex-end', marginTop: '20px' }}>
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
                    {plantExists && dataExists && isEditMode ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <FaWater className="submit-icon" />
                    {plantExists && dataExists && isEditMode ? "Update" : "Submit"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Document Upload Modal */}
      <WaterDocUploadModal
        show={showFeasibilityModal}
        onClose={() => setShowFeasibilityModal(false)}
        linkDocs={newLinkDocs}
        setLinkDocs={setNewLinkDocs}
        title="Upload Documents"
        showLandDocs={false}
        showOthDocs={false}
      />

      {/* Confirmation Dialog */}
      <ReusableDialog
        open={confirmOpen}
        title={plantExists && dataExists && isEditMode ? "Confirm Update" : "Confirm Submission"}
        message={plantExists && dataExists && isEditMode 
          ? "Are you sure you want to update this application? Existing files will be preserved and new files will be added."
          : "Are you sure you want to submit this application?"}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText={plantExists && dataExists && isEditMode ? "Update" : "Submit"}
        cancelText="Cancel"
        isLoading={isSubmitting}
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
      // Confirm deletion with SweetAlert2 (instead of window.confirm)
      const isConfirmed = await Swal.fire({
        title: 'Delete File?',
        text: `Are you sure you want to delete "${file.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (!isConfirmed.isConfirmed) return;

      try {
        // Make API call to delete from backend
        const response = await axios.delete(`${API_BASE_URL}/airport-docu-delete`, {
          data: {
            loc: formData.loc,
            process: formData.process,
            doc_type: 'DOCS',
            file_name: file.name,
          },
        });

        if (response.status === 200) {
          // Close modal first
          setDocumentViewModal(false);

          // Show success message with SweetAlert2
          await Swal.fire({
            title: 'Deleted!',
            text: 'Document has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });

          // 1. Remove file from currentViewFiles
          const updatedFiles = currentViewFiles.filter((_, i) => i !== index);
          setCurrentViewFiles(updatedFiles);
          
          // 2. Remove file from main existingUploadedFiles state
          const updatedExistingFiles = existingUploadedFiles.filter(f => f.path !== file.path);
          setExistingUploadedFiles(updatedExistingFiles);
          
          toast.success(`File "${file.name}" deleted successfully`);
          
          // 4. Refresh data from backend
          if (formData.loc && formData.process) {
            try {
              const res = await axios.get(`${API_BASE_URL}/getProcessData`, {
                params: {
                  plant: formData.loc,
                  process: formData.process,
                },
              });

              const data = Array.isArray(res?.data) ? res.data[0] : res?.data;
              
              if (data) {
                // Parse document data for airport form
                let newExistingFiles = [];
                
                // Check for DOCUMENT_PATH and DOCUMENT_NAME fields
                if (data.DOCUMENT_PATH && data.DOCUMENT_PATH !== 'null' && data.DOCUMENT_PATH !== 'undefined') {
                  try {
                    // Parse paths
                    let docPaths = [];
                    try {
                      const parsedPaths = JSON.parse(data.DOCUMENT_PATH);
                      if (Array.isArray(parsedPaths)) {
                        docPaths = parsedPaths;
                      } else if (typeof parsedPaths === 'string') {
                        docPaths = parsedPaths.split(',').filter(p => p && p.trim() !== '');
                      }
                    } catch (e) {
                      docPaths = String(data.DOCUMENT_PATH).split(',').filter(p => p && p.trim() !== '');
                    }
                    
                    // Parse names
                    let docNames = [];
                    if (data.DOCUMENT_NAME && data.DOCUMENT_NAME !== 'null' && data.DOCUMENT_NAME !== 'undefined') {
                      try {
                        const parsedNames = JSON.parse(data.DOCUMENT_NAME);
                        if (Array.isArray(parsedNames)) {
                          docNames = parsedNames;
                        } else if (typeof parsedNames === 'string') {
                          docNames = parsedNames.split(',').filter(n => n && n.trim() !== '');
                        }
                      } catch (e) {
                        docNames = String(data.DOCUMENT_NAME).split(',').filter(n => n && n.trim() !== '');
                      }
                    } else {
                      // Generate default names
                      docNames = docPaths.map((_, i) => `Document_${i + 1}.pdf`);
                    }
                    
                    // Create file objects
                    newExistingFiles = docPaths.map((path, idx) => {
                      const cleanPath = String(path).trim().replace(/[\[\]"]/g, '');
                      const cleanName = (docNames[idx] || `Document_${idx + 1}.pdf`).trim().replace(/[\[\]"]/g, '');
                      
                      return {
                        path: cleanPath,
                        name: cleanName,
                        isExisting: true,
                        url: `${API_DOC_URL}/storage/${cleanPath}`,
                        type: 'document'
                      };
                    });
                  } catch (err) {
                    console.error("Error parsing document data after deletion:", err);
                  }
                }
                
                setExistingUploadedFiles(newExistingFiles);
              }
            } catch (err) {
              console.error("Error refetching data after deletion:", err);
            }
          }
        } else {
          toast.error('Failed to delete file');
        }
      } catch (error) {
        console.error('Delete error:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete file';
        
        // Close modal before showing error
        setDocumentViewModal(false);
        
        // Show error with SweetAlert2
        await Swal.fire({
          title: 'Error!',
          text: errorMsg,
          icon: 'error',
          confirmButtonText: 'OK'
        });
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
            
            {/* File info */}
            <div style={{
              fontSize: '11px',
              color: '#6c757d',
              marginTop: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                Size: {Math.round((file.size || 0) / 1024)} KB
              </span>
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
        <div style={{ display: 'flex', gap: '10px' }}>
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

export default AirportForm;