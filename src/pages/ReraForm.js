import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_DOC_URL } from '../config/Config';
import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, Hotel, ClipboardList, BookUser, MessageSquareMore, MessageCircleMore, University, Edit, Eye, Lock, Trash2 } from "lucide-react";
import WaterDocUploadModal from "../components/WaterDocUploadModal";
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
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const { setFormReraData, totalMasterData = [], setHeaderData, headerData } = useContext(Context);
const [originalComments, setOriginalComments] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
  const [planDocs, setplanDocs] = useState([]);
  const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
  const [newAmountPaidDocs, setNewAmountPaidDocs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [commentHistoryData, setCommentHistoryData] = useState([]);
const [showCommentHistory, setShowCommentHistory] = useState(false);
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
  console.log(existingPlantData,"existingPlantDataexistingPlantDataexistingPlantData");
  
  const [formData, setFormData] = useState({
    loc: '',
    process: '',
    applyDate: '',
    document: null,
    projectDetails: '',
    address: '',
    Comments: '',
  });

  // Check login
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
  // Fetch process
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

  // Check RERA update status
  // const checkReraUpdateStatus = async (plant) => {
  //   try {
  //     const res = await axios.get(`${API_BASE_URL}/checkReraByPlant`, {
  //       params: { plant: plant }
  //     });

  //     if (res.data.status && res.data.data && res.data.data.length > 0) {
  //       // Check if UPDATED field exists and is not 'YES'
  //       const record = res.data.data[0];
  //       if (record.UPDATED && record.UPDATED === 'YES') {
  //         setCanEdit(false);
  //         setIsEditMode(false);
  //         toast.error("This record has been updated and cannot be edited (UPDATED = 'YES').", {
  //           autoClose: 4000
  //         });
  //         return false;
  //       } else {
  //         setCanEdit(true);
  //         return true;
  //       }
  //     }
  //     setCanEdit(true);
  //     return true;
  //   } catch (error) {
  //     console.error("❌ Error checking RERA status:", error);
  //     setCanEdit(true);
  //     return true;
  //   }
  // };

  // Fetch existing data when plant or process changes
 useEffect(() => {
    if (!formData.loc || !formData.process || formData.loc === "" || formData.process === "") {
      return;
    }

    const fetchExistingData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/getProcessDatarera`, {
          params: {
            plant: formData.loc,
            process: formData.process,
          },
        });

        const data = Array.isArray(res?.data) ? res.data[0] : res?.data;

        console.log('Fetched RERA data:', data);

        if (data && (data.LOC || data.APPLY_DT)) {
          // Parse existing files
          try {
            let existingFiles = [];
            if (data.UPLOAD_DOC && data.UPLOAD_DOC !== 'null' && data.UPLOAD_DOC !== 'undefined') {
              const docStr = String(data.UPLOAD_DOC).trim();
              try {
                const docArray = JSON.parse(docStr);
                if (Array.isArray(docArray)) {
                  existingFiles = docArray.map((item, index) => ({
                    path: (item.stored_path || '').replace(/\\/g, '/'),
                    name: item.file_name || `Paid_Document_${index + 1}.pdf`,
                    isExisting: true,
                    url: `${API_DOC_URL}/storage/${(item.stored_path || '').replace(/\\/g, '/')}`
                  }));
                }
              } catch (parseErr) {
                console.error("JSON parse failed, trying string format:", parseErr);
                if (docStr.includes(',')) {
                  const paths = docStr.split(',').filter(p => p && p.trim() !== '');
                  existingFiles = paths.map((path, index) => ({
                    path: path.trim(),
                    name: `Document_${index + 1}.pdf`,
                    isExisting: true,
                    url: `${API_DOC_URL}/storage/${path.trim()}`
                  }));
                }
              }
            }
            setExistingUploadedFiles(existingFiles);
            console.log("📁 Existing files:", existingFiles);
          } catch (err) {
            console.error("Error parsing document data:", err);
            setExistingUploadedFiles([]);
          }

          const isCompleted = data?.UPDATED && data?.UPDATED?.toUpperCase() === 'YES';
          
          // 🔧 FIX: Get current comments
const dbComments = data.COMMENTS === null || data.COMMENTS === undefined || data.COMMENTS === "nil" 
  ? "" 
  : String(data.COMMENTS);

console.log('📥 DB Comments:', dbComments);
console.log('📝 Setting originalComments to:', dbComments);
setOriginalComments(dbComments);
          
          // 🔧 NEW: Parse comment history from LOG field
          let historyComments = [];
          if (data.LOG && data.LOG !== 'null' && data.LOG !== 'undefined') {
            try {
              const logData = typeof data.LOG === 'string' ? JSON.parse(data.LOG) : data.LOG;
              if (Array.isArray(logData)) {
                historyComments = logData
                  .filter(log => log.comments && log.comments.trim() !== '')
                  .map(log => ({
                    timestamp: log.timestamp || '',
                    user: log.user || 'Unknown',
                    comments: log.comments || '',
                    action: log.action || 'Updated'
                  }));
                console.log('📝 Comment History:', historyComments);
              }
            } catch (err) {
              console.error('Error parsing LOG data:', err);
            }
          }
          
          setCommentHistoryData(historyComments);
          
          // 🔧 OPTION: Show combined comments (current + all history)
          // If you want to show ALL comments including history in the textarea:
          let displayComments = dbComments;
          
          // Uncomment this if you want to show full history in the textarea:
          /*
          if (historyComments.length > 0) {
            const historyText = historyComments
              .map(log => `[${log.timestamp} - ${log.user}]\n${log.comments}`)
              .join('\n\n');
            
            if (dbComments && dbComments.trim() !== '') {
              displayComments = `${historyText}\n\n[Current]\n${dbComments}`;
            } else {
              displayComments = historyText;
            }
          }
          */
          
          // Update form data
          const updatedFormData = {
            loc: formData.loc,
            process: formData.process,
            applyDate: (data.APPLY_DT && data.APPLY_DT !== "nil") ? data.APPLY_DT : "",
            Comments: displayComments, // Show current or current+history
            projectDetails: (data.PROJECT_NAME && data.PROJECT_NAME !== "nil") ? data.PROJECT_NAME : "",
            address: (data.ADDRESS && data.ADDRESS !== "nil") ? data.ADDRESS : "",
          };

          setFormData(updatedFormData);
          setDataExists(true);
          setPlantExists(true);
          setExistingPlantData(data);
          setIsEditMode(false);
          setAmountPaidDocs([]);
          setNewAmountPaidDocs([]);
          setCanEdit(!isCompleted); 

          if (isCompleted) {
            toast.info(`Application for ${formData.loc} is completed and cannot be edited.`, {
              autoClose: 4000
            });
          } else {
            toast.info(`Data loaded for ${formData.loc}.`, {
              autoClose: 3000
            });
          }

        } else {
          console.log("ℹ️ No existing data found");
          setDataExists(false);
          setPlantExists(false);
          setExistingPlantData(null);
          setExistingUploadedFiles([]);
          setIsEditMode(true);
          setCanEdit(true);
          setOriginalComments('');
          setCommentHistoryData([]);

          setFormData(prev => ({
            ...prev,
            applyDate: "",
          // Comments: originalComments,
          Comments: "",
            projectDetails: "",
            address: "",
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
        setOriginalComments('');
        setCommentHistoryData([]);

        setFormData(prev => ({
          ...prev,
          applyDate: "",
          Comments: "",
          projectDetails: "",
          address: "",
        }));
      }
    };

    fetchExistingData();
  }, [formData.loc, formData.process]);
  const checkIfPlantExists = async (plant) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/check-plant-exists-rera`, { loc: plant });
      
      if (res.data && res.data.exists === true) {
        setPlantExists(true);
        setExistingPlantData(res.data.data);
        return true;
      }
      
      setPlantExists(false);
      setExistingPlantData(null);
      return false;
    } catch (error) {
      console.error('Failed to check plant:', error);
      setPlantExists(false);
      setExistingPlantData(null);
      return false;
    }
  };

  
const toggleEditMode = () => {
  if (plantExists && dataExists) {
    if (!canEdit) {
      toast.error("This record has been updated and cannot be edited (UPDATED = 'YES').", {
        autoClose: 4000
      });
      return;
    }

    if (!userHasEditPermission) {
      toast.error("You don't have permission to edit records.", {
        autoClose: 4000
      });
      return;
    }

    if (!isEditMode) {
      // Enabling edit mode
      toast.info("Edit mode enabled. You can now modify the form.", {
        autoClose: 3000
      });
      setIsEditMode(true);
    } else {
      // Disabling edit mode - RESTORE ALL FIELDS
      toast.info("Edit mode disabled. Restoring original values.", {
        autoClose: 3000
      });
      
      console.log('🔄 Restoring original comments:', originalComments); // ✅ ADD THIS LOG
      
      // Restore ALL fields to original state
      setFormData(prev => ({
        ...prev,
        // Comments: originalComments,
        // Optionally restore other fields too:
        applyDate: existingPlantData?.APPLY_DT || prev.applyDate,
        projectDetails: existingPlantData?.PROJECT_NAME || prev.projectDetails,
        address: existingPlantData?.ADDRESS || prev.address,
      }));
      
      // Clear any new file uploads
      setNewAmountPaidDocs([]);
      
      setIsEditMode(false);
    }
  }
};
  // View documents
  const viewDocuments = (files) => {
    setCurrentViewFiles(files);
    setDocumentViewModal(true);
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
    // For new submission - all fields required
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
    
    const totalFiles = [...existingUploadedFiles, ...newAmountPaidDocs];
    if (totalFiles.length === 0) {
      newErrors.AmountPaidDoc = 'At least one document is required';
    }
  } else {
    // 🔧 FIX: For update - Comments are NOT required (can be empty/cleared)
    // Only validate documents
    const totalFiles = [...existingUploadedFiles, ...newAmountPaidDocs];
    if (totalFiles.length === 0) {
      newErrors.AmountPaidDoc = 'At least one document is required';
    }
    
    // Validate new files if any
    if (newAmountPaidDocs.length > 0) {
      const invalidFiles = newAmountPaidDocs.filter(file => 
        !file.name.toLowerCase().endsWith('.pdf')
      );
      if (invalidFiles.length > 0) {
        newErrors.AmountPaidDoc = 'All documents must be PDF files';
      }
    }
  }
  
  return newErrors;
};
  const handleChange = async (e) => {
    const { name, value, type } = e.target;

    if (type === "radio") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
   

  
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};
if (name === "Comments") {
  setFormData((prev) => ({ ...prev, [name]: value }));
  if (errors.Comments) setErrors(prev => ({ ...prev, Comments: '' }));
  return;
}
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
        setFormData((prev) => ({
          ...prev,
          applyDate: ""
        }));
        // Clear existing data
        setDataExists(false);
        setPlantExists(false);
        setExistingPlantData(null);
        setExistingUploadedFiles([]);
        setAmountPaidDocs([]);
        setNewAmountPaidDocs([]);
        setIsEditMode(false);
        return;
      }

      try {
        const plantExistsResult = await checkIfPlantExists(value);
        
        const res = await getMasterByLoc(value);
        if (res && Object.keys(res).length > 0) {
          setHeaderData(res);
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
    formPayload.append('prjName', formData.projectDetails || '');
    formPayload.append('address', formData.address);
    formPayload.append('comments', formData.Comments || '');
    formPayload.append('username', currentUserName);
    formPayload.append("fromDate", '');
    formPayload.append("toDate", '');

    // For updates
    if (isUpdate) {
      formPayload.append('isUpdate', 'true');
      formPayload.append('UPLOAD_DOC[]', JSON.stringify(existingUploadedFiles.map(f => f.path)));
    }

    // Append new uploaded docs
    if (newAmountPaidDocs && newAmountPaidDocs.length > 0) {
      newAmountPaidDocs.forEach((file) => {
        formPayload.append('UPLOAD_DOC[]', file);
      });
    }

    try {
      // Use appropriate endpoint
      const endpoint = isUpdate 
        ? `${API_BASE_URL}/reraPartialUpdate`
        : `${API_BASE_URL}/rera-submit`;
      
      const response = isUpdate 
        ? await axios.post(endpoint, formPayload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : await submitReraForm(formPayload);
      
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
        // Refresh data
        if (formData.loc && formData.process) {
          const res = await axios.get(`${API_BASE_URL}/getProcessDatarera`, {
            params: {
              plant: formData.loc,
              process: formData.process,
            },
          });
          
          const updatedData = Array.isArray(res?.data) ? res.data[0] : res?.data;
          if (updatedData) {
            // Parse and update files
            try {
              let existingFiles = [];
              if (updatedData.UPLOAD_DOC && updatedData.UPLOAD_DOC !== 'null') {
                const docStr = String(updatedData.UPLOAD_DOC).trim();
                try {
                  const docArray = JSON.parse(docStr);
                  if (Array.isArray(docArray)) {
                    existingFiles = docArray.map((item, index) => ({
                      path: (item.stored_path || '').replace(/\\/g, '/'),
                      name: item.file_name || `Paid_Document_${index + 1}.pdf`,
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
        }
        setNewAmountPaidDocs([]);
      } else {
        // For new submission, reset form
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
        setNewAmountPaidDocs([]);
        setExistingUploadedFiles([]);
        setDataExists(false);
        setPlantExists(false);
        setIsEditMode(false);
      }
      
      setErrors({});
      navigate('/create');
    } catch (err) {
      console.error("Submission error:", err);
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
    plantExists && dataExists && existingPlantData?.UPDATED?.toUpperCase() !== 'YES' && (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}>
        {!canEdit && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
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

        {/* Edit Button - Only show if not completed AND user has permission */}
        {canEdit && !userHasEditPermission ? (
          ''
        ) : canEdit && userHasEditPermission ? (
          <button
            type="button"
            onClick={toggleEditMode}
            disabled={!canEdit}
            title={
              !canEdit
                ? "This application is completed and cannot be edited"
                : isEditMode
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
        ) : null}
      </div>
    )
  )}
</div>
     
        
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
                    apiUrl={`${API_BASE_URL}/rera-process`}
                    value={formData.process}
                    onChange={handleProcessChange}
                    className={`modern-input ${errors.process ? 'error' : ''}`}
                    style={{
                      border: errors.process ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    disabled={plantExists && dataExists && !isEditMode}
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
    <div className="error-container">
      {errors.applyDate && (
        <p className="error-text">{errors.applyDate}</p>
      )}
    </div>
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
                  {/* Upload Button */}
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => {
                      if (plantExists && dataExists && !isEditMode) {
                        toast.warning("Please enable edit mode to upload files.");
                        return;
                      }
                      setAmountPaidDocModal(true);
                    }}
                    disabled={plantExists && dataExists && !isEditMode}
                    style={{
                      border: errors.AmountPaidDoc ? '2px solid #ef4444' : '1px solid #d1d5db',
                      opacity: plantExists && dataExists && !isEditMode ? 0.6 : 1,
                      cursor: plantExists && dataExists && !isEditMode ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FaUpload className="upload-icon" />  
                    {plantExists && dataExists ? 'Add New Documents' : 'Upload Paid Documents'}
                    <span className="upload-count">
                      {newAmountPaidDocs.length > 0 &&
                        `(${newAmountPaidDocs.length} new)`}
                    </span>
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
                  
                  {/* New Files Preview */}
        
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
                    placeholder="Enter project name"
                    style={{
                      border: errors.projectDetails ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
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
                      border: errors.address ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
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
                  <MessageCircleMore className="label-icon" size={20} /> 
                  Comments*
                </label>
                <div className="input-wrapper">
                <textarea
  id="comments"
  name="Comments"
  value={formData.Comments || ""} // ✅ Ensure it's always a string
  onChange={handleChange}
  className={`modern-input ${errors.Comments ? 'error' : ''}`}
  placeholder="Enter comments"
  style={{
    border: errors.Comments ? '2px solid #ef4444' : '1px solid #d1d5db',
    backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
    color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
  }}
  readOnly={plantExists && dataExists && !isEditMode}
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
              disabled={isSubmitting || (plantExists && dataExists && !isEditMode)}
              aria-describedby="submit-button-description"
              style={{
                marginTop: '18px',
                opacity: plantExists && dataExists && !isEditMode ? 0.6 : 1,
                cursor: plantExists && dataExists && !isEditMode ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" aria-hidden="true"></div>
                  {plantExists && dataExists && isEditMode ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <FaWater className="submit-icon" aria-hidden="true" /> 
                  {plantExists && dataExists && isEditMode ? 'Update' : 'Submit'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* MODALS AND DIALOGS */}
      <ReusableDialog
        open={confirmOpen}
        title={plantExists && dataExists && isEditMode ? "Confirm Update" : "Confirm Submission"}
        message={
          plantExists && dataExists && isEditMode
            ? "Are you sure you want to update this application? This will add new documents while keeping existing ones."
            : "Are you sure you want to submit this application? Please review all information before proceeding. You will be redirected to the dashboard after successful submission."
        }
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText={plantExists && dataExists && isEditMode ? "Update" : "Submit"}
        cancelText="Cancel"
        isLoading={isSubmitting}
      />
      
      <WaterDocUploadModal
        show={amountPaidDocModal}
        onClose={() => setAmountPaidDocModal(false)}
        linkDocs={newAmountPaidDocs}
        setLinkDocs={setNewAmountPaidDocs}
        title="Upload Paid Document Certificate"
        showLandDocs={false}
        showOthDocs={false}
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
      // Confirm deletion
      if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
        try {
          // Make API call to delete from backend
          const response = await axios.delete(`${API_BASE_URL}/rera-docu-delete`, {
            data: {
              loc: formData.loc,
              process: formData.process,
              doc_type: 'UPLOAD_DOC',
              file_name: file.name,
            },
          });

          if (response.status === 200) {
            // 1. Remove file from currentViewFiles
            const updatedFiles = currentViewFiles.filter((_, i) => i !== index);
            setCurrentViewFiles(updatedFiles);
            
            // 2. Remove file from main existingUploadedFiles state
            const updatedExistingFiles = existingUploadedFiles.filter(f => f.path !== file.path);
            setExistingUploadedFiles(updatedExistingFiles);
            
            toast.success(`File "${file.name}" deleted successfully`);
            
            // 3. If no files left, close modal
            if (updatedFiles.length === 0) {
              setDocumentViewModal(false);
            }
            
  
              if (formData.loc && formData.process) {
                try {
                  const res = await axios.get(`${API_BASE_URL}/getProcessDatarera`, {
                    params: {
                      plant: formData.loc,
                      process: formData.process,
                    },
                  });

                  const data = Array.isArray(res?.data) ? res.data[0] : res?.data;
                  
                  if (data && data.UPLOAD_DOC && data.UPLOAD_DOC !== 'null' && data.UPLOAD_DOC !== 'undefined') {
                    try {
                      let existingFiles = [];
                      const docStr = String(data.UPLOAD_DOC).trim();
                      
                      try {
                        const docArray = JSON.parse(docStr);
                        if (Array.isArray(docArray)) {
                          existingFiles = docArray.map((item, index) => ({
                            path: (item.stored_path || '').replace(/\\/g, '/'),
                            name: item.file_name || `Paid_Document_${index + 1}.pdf`,
                            isExisting: true,
                            url: `${API_DOC_URL}/storage/${(item.stored_path || '').replace(/\\/g, '/')}`
                          }));
                        }
                      } catch (parseErr) {
                        console.error("JSON parse failed, trying string format:", parseErr);
                        // Try comma-separated format
                        if (docStr.includes(',')) {
                          const paths = docStr.split(',').filter(p => p && p.trim() !== '');
                          existingFiles = paths.map((path, index) => ({
                            path: path.trim(),
                            name: `Document_${index + 1}.pdf`,
                            isExisting: true,
                            url: `${API_DOC_URL}/storage/${path.trim()}`
                          }));
                        }
                      }
                      
                      setExistingUploadedFiles(existingFiles);
                    } catch (err) {
                      console.error("Error parsing document data:", err);
                    }
                  } else {
                    setExistingUploadedFiles([]);
                  }
                } catch (err) {
                  console.error("Error refetching data:", err);
                }
              }
         
          } else {
            toast.error('Failed to delete file');
          }
        } catch (error) {
          console.error('Delete error:', error);
          toast.error('Failed to delete file. Please try again.');
        }
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
        theme="light"
      />
    </div>
  );
};

export default ReraForm;

