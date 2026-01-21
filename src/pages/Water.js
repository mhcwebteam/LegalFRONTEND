import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_DOC_URL } from '../config/Config';
import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, Droplets, MessageSquareMore, Calculator, Store, FileCheck, FolderUp, MapPinned, Edit, Eye, Lock, Trash2 } from "lucide-react";
import WaterDocUploadModal from "../components/WaterDocUploadModal";
import { ToastContainer, toast } from 'react-toastify';
import ProcessField from '../components/ProcessField';
import ReusableDialog from "../components/ReusableDialog";
import ProjectInfoHeader from "../components/ProjectInfoHeader"
import "../pages/Water.css"
import { getMasterByLoc, submitWaterForm } from "../api/Api";
import { Context } from "../context/ContextData";
import Swal from "sweetalert2";

const WaterForm = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const {
    waterData,
    setWaterData,
    masterGetData,
    masterData = [],
    totalMasterData = [],
    setHeaderData,
    headerData
  } = useContext(Context);

  console.log("master data", masterData);
  const [showModal, setShowModal] = useState(false);
  const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
  const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);

  // For handling existing and new files separately
  const [existingUploadedFiles, setExistingUploadedFiles] = useState([]);
  const [newPlanDocs, setNewPlanDocs] = useState([]);
  const [newTitleDocs, setNewTitleDocs] = useState([]);
  const [newOthDocs, setNewOthDocs] = useState([]);
  const [newFeasibilityDocs, setNewFeasibilityDocs] = useState([]);
  const [newAmountPaidDocs, setNewAmountPaidDocs] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Edit mode states
  const [plantExists, setPlantExists] = useState(false);
  const [existingPlantData, setExistingPlantData] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [documentViewModal, setDocumentViewModal] = useState(false);
  const [currentViewFiles, setCurrentViewFiles] = useState([]);

// Add these with other useState declarations
const [emailData, setEmailData] = useState([]);
const [userHasEditPermission, setUserHasEditPermission] = useState(false);
const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  console.log("existingPlantDataexistingPlantData", existingPlantData);

  const [formData, setFormData] = useState({
    loc: '',
    process: '',
    applyDate: '',
    document: null,
    noOfFlats: '',
    comments: '',
    KLD: '',
    amountPaid: '',
    feasibilityDoc: null,
    AmountPaidDoc: null,
    noOfTowers: '',
    ProjectBuildArea: '',
    TotalProjectArea: '',
    ProjectName: '',
    STATUS: '',
    REASON: '',
    GHMC: '',
    OldAmount: '',
    TotalAmount: '',
    Size_Of_Connection: '',
  });

  // Check User Login
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
  // Validate file type - PDF only
  const validateFileType = (file) => {
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.pdf'];
    const validMimeTypes = ['application/pdf'];

    const isValidExtension = validExtensions.includes(fileExtension);
    const isValidMimeType = !file.type || validMimeTypes.includes(file.type);

    return isValidExtension && isValidMimeType;
  };

  // Helper function to parse document arrays from API
  const parseDocumentArray = (nameArray, pathArray, type) => {
    const files = [];

    if (!nameArray || !pathArray) return files;

    try {
      // Parse name array
      let names = [];
      try {
        names = JSON.parse(nameArray);
      } catch (e) {
        console.error(`Error parsing ${type} names:`, e);
        if (typeof nameArray === 'string' && nameArray.trim() !== '') {
          names = [nameArray];
        }
      }

      // Parse path array
      let paths = [];
      try {
        paths = JSON.parse(pathArray);
      } catch (e) {
        console.error(`Error parsing ${type} paths:`, e);
        if (typeof pathArray === 'string' && pathArray.trim() !== '') {
          paths = [pathArray];
        }
      }

      // Create file objects
      for (let i = 0; i < Math.min(names.length, paths.length); i++) {
        if (names[i] && paths[i]) {
          files.push({
            name: names[i],
            path: paths[i].replace(/\\/g, '/'),
            type: type,
            isExisting: true,
            url: `${API_DOC_URL}/storage/${paths[i].replace(/\\/g, '/')}`
          });
        }
      }
    } catch (err) {
      console.error(`Error parsing ${type} documents:`, err);
    }

    return files;
  };

  // Fetch existing data when plant or process changes
  useEffect(() => {
    if (!formData.loc || !formData.process || formData.loc === "" || formData.process === "") {
      return;
    }

    const fetchExistingData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/getProcessDatawater`, {
          params: {
            plant: formData.loc,
            process: formData.process,
          },
        });

        const data = Array.isArray(res?.data) ? res.data[0] : res?.data;
        console.log('Fetched water data:', data);

        if (data && (data.LOC || data.APPLY_DT)) {
          // Parse existing files from all document types
          try {
            // Parse plan documents
            const planFiles = parseDocumentArray(
              data.PLAN_DOC_NAME,
              data.PLAN_DOC_PATH,
              'plan'
            );

            // Parse title documents
            const titleFiles = parseDocumentArray(
              data.TITLE_DOC_NAME,
              data.TITLE_DOC_PATH,
              'title'
            );

            // Parse other documents
            const otherFiles = parseDocumentArray(
              data.OTH_DOC_NAME,
              data.OTH_DOC_PATH,
              'other'
            );

            // Parse feasibility documents
            const feasibilityFiles = parseDocumentArray(
              data.FEAS_DOC_NAME,
              data.FEAS_DOC_PATH,
              'feasibility'
            );

            // Parse paid documents
            const paidFiles = parseDocumentArray(
              data.AMOUNT_PAID_DOC_NAME,
              data.AMOUNT_PAID_DOC_PATH,
              'paid'
            );

            const allExistingFiles = [
              ...planFiles,
              ...titleFiles,
              ...otherFiles,
              ...feasibilityFiles,
              ...paidFiles
            ];

            setExistingUploadedFiles(allExistingFiles);
            console.log("📁 All existing files:", allExistingFiles);
          } catch (err) {
            console.error("Error parsing document data:", err);
            setExistingUploadedFiles([]);
          }

          // Check if STATUS indicates completed application
          const isCompleted = data?.UPDATED && data?.UPDATED?.toUpperCase() === 'YES';

          // Update form data
          const updatedFormData = {
            loc: formData.loc,
            process: formData.process,
            applyDate: (data.APPLY_DT && data.APPLY_DT !== "nil") ? data.APPLY_DT.slice(0, 10) : "",
            comments: (data.COMMENTS && data.COMMENTS !== "nil") ? data.COMMENTS : "",
            ProjectName: (data.PROJECT_NAME && data.PROJECT_NAME !== "nil") ? data.PROJECT_NAME : "",
            noOfFlats: data.NUMBER_OF_FLATS || "",
            KLD: data.KLD || "",
            amountPaid: data.AMOUNT_PAID || "",
            noOfTowers: data.NUMBER_OF_TOWERS || "",
            ProjectBuildArea: data.PROJECT_BUILD_AREA || "",
            TotalProjectArea: data.TOTAL_PROJECT_AREA || "",
            STATUS: data.STATUS || "",
            REASON: data.REASON || "",
            GHMC: data.GHMC || "",
            OldAmount: data.OLD_AMOUNT || "",
            TotalAmount: data.TOTAL_AMOUNT || "",
            Size_Of_Connection: data.SIZE_OF_CONNECTION || "",
          };

          setFormData(updatedFormData);
          setDataExists(true);
          setPlantExists(true);
          setExistingPlantData(data);

          console.log(data, "d1");
          setIsEditMode(false); // Start in view mode
          setCanEdit(!isCompleted); // Disable edit if completed

          // Clear new upload arrays
          setNewPlanDocs([]);
          setNewTitleDocs([]);
          setNewOthDocs([]);
          setNewFeasibilityDocs([]);
          setNewAmountPaidDocs([]);

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
          setIsEditMode(true); // Allow editing since no data exists
          setCanEdit(true);

          // Reset form fields
          setFormData(prev => ({
            ...prev,
            applyDate: "",
            comments: "",
            ProjectName: "",
            noOfFlats: "",
            KLD: "",
            amountPaid: "",
            noOfTowers: "",
            ProjectBuildArea: "",
            TotalProjectArea: "",
            STATUS: "",
            REASON: "",
            GHMC: "",
            OldAmount: "",
            TotalAmount: "",
            Size_Of_Connection: "",
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
          ProjectName: "",
          noOfFlats: "",
          KLD: "",
          amountPaid: "",
          noOfTowers: "",
          ProjectBuildArea: "",
          TotalProjectArea: "",
          STATUS: "",
          REASON: "",
          GHMC: "",
          OldAmount: "",
          TotalAmount: "",
          Size_Of_Connection: "",
        }));
      }
    };

    fetchExistingData();
  }, [formData.loc, formData.process]);

  const checkIfPlantExists = async (plant) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/check-plant-exists-water`, { loc: plant });

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
  // Fetch process
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

      if (errors.loc) {
        setErrors(prev => ({ ...prev, loc: '' }));
      }

      if (!value || value.trim() === "") {
        setHeaderData(null);
        setFormData(prev => ({
          ...prev,
          applyDate: "",
          noOfTowers: "",
          TotalProjectArea: "",
          ProjectBuildArea: "",
          ProjectName: "",
        }));
        // Clear existing data
        setDataExists(false);
        setPlantExists(false);
        setExistingPlantData(null);
        setExistingUploadedFiles([]);
        setNewPlanDocs([]);
        setNewTitleDocs([]);
        setNewOthDocs([]);
        setNewFeasibilityDocs([]);
        setNewAmountPaidDocs([]);
        setIsEditMode(false);
        return;
      }

      try {
        const plantExistsResult = await checkIfPlantExists(value);
        if (plantExistsResult) {
          return;
        }

        const res = await getMasterByLoc(value);
        if (res) {
          setHeaderData(res);
          setFormData(prev => ({
            ...prev,
            applyDate: '',
            noOfTowers: '',
            TotalProjectArea: '',
            ProjectBuildArea: '',
            ProjectName: '',
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

  // Toggle edit mode
 // Toggle edit mode
const toggleEditMode = () => {
  if (plantExists && dataExists) {
    if (!canEdit) {
      toast.error("This application is completed and cannot be edited.", {
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
  const viewDocuments = (type = 'all') => {
    let filesToShow = [];

    if (type === 'plan' || type === 'title' || type === 'other') {
      filesToShow = existingUploadedFiles.filter(f => f.type === type);
    } else if (type === 'feasibility') {
      filesToShow = existingUploadedFiles.filter(f => f.type === 'feasibility');
    } else if (type === 'paid') {
      filesToShow = existingUploadedFiles.filter(f => f.type === 'paid');
    } else if (type === 'main') {
      filesToShow = existingUploadedFiles.filter(f =>
        f.type === 'plan' || f.type === 'title' || f.type === 'other'
      );
    } else {
      filesToShow = existingUploadedFiles;
    }

    setCurrentViewFiles(filesToShow);
    setDocumentViewModal(true);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const isUpdate = plantExists && dataExists && isEditMode;

    // Required field validations
    if (!formData.loc) newErrors.loc = "Project location is required.";
    if (!formData.process) newErrors.process = "Process type is required.";

    if (!isUpdate) {
      // For new submission
      if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
      if (!formData.amountPaid) newErrors.amountPaid = "Amount paid is required.";
      if (!formData.TotalProjectArea) newErrors.TotalProjectArea = "Total project area is required.";
      if (!formData.noOfTowers) newErrors.noOfTowers = "Number of towers is required.";
      if (!formData.noOfFlats) newErrors.noOfFlats = "Number of flats is required.";
      if (!formData.ProjectBuildArea) newErrors.ProjectBuildArea = "Project build area is required.";
      if (!formData.comments) newErrors.comments = "Comments are required.";

      // Document validation for new submission
      const totalMainFiles = newPlanDocs.length + newTitleDocs.length + newOthDocs.length;
      const totalFeasibilityFiles = newFeasibilityDocs.length;
      const totalPaidFiles = newAmountPaidDocs.length;

      if (totalMainFiles === 0) newErrors.documents = "Please upload at least one main document.";
      if (totalFeasibilityFiles === 0) newErrors.feasibilityDocs = "Feasibility Certificate is required.";
      if (totalPaidFiles === 0) newErrors.AmountPaidDocs = "Paid Document is required.";

      // Validate file types for new uploads
      const allNewFiles = [...newPlanDocs, ...newTitleDocs, ...newOthDocs, ...newFeasibilityDocs, ...newAmountPaidDocs];
      const invalidFiles = allNewFiles.filter(file => !validateFileType(file));
      if (invalidFiles.length > 0) {
        newErrors.fileType = "Only PDF files are allowed for upload.";
      }
    } else {
      // For updates
      const existingMainFiles = existingUploadedFiles.filter(f =>
        f.type === 'plan' || f.type === 'title' || f.type === 'other'
      ).length;
      const existingFeasibilityFiles = existingUploadedFiles.filter(f => f.type === 'feasibility').length;
      const existingPaidFiles = existingUploadedFiles.filter(f => f.type === 'paid').length;

      const totalMainFiles = existingMainFiles + newPlanDocs.length + newTitleDocs.length + newOthDocs.length;
      const totalFeasibilityFiles = existingFeasibilityFiles + newFeasibilityDocs.length;
      const totalPaidFiles = existingPaidFiles + newAmountPaidDocs.length;

      if (totalMainFiles === 0) newErrors.documents = "At least one main document is required.";
      if (totalFeasibilityFiles === 0) newErrors.feasibilityDocs = "Feasibility Certificate is required.";
      if (totalPaidFiles === 0) newErrors.AmountPaidDocs = "Paid Document is required.";

      // Validate new file types
      const allNewFiles = [...newPlanDocs, ...newTitleDocs, ...newOthDocs, ...newFeasibilityDocs, ...newAmountPaidDocs];
      const invalidFiles = allNewFiles.filter(file => !validateFileType(file));
      if (invalidFiles.length > 0) {
        newErrors.fileType = "Only PDF files are allowed for upload.";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Show first error in toast
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);

      // Scroll to first error field
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    setErrors({});
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setIsSubmitting(true);

    let currentUserName = loggedInUser.username;
    const isUpdate = plantExists && dataExists && isEditMode;
    const formPayload = new FormData();

    // Basic form data
    formPayload.append('loc', formData.loc);
    formPayload.append('process', formData.process);
    formPayload.append('applyDate', formData.applyDate);
    formPayload.append('noOfFlats', formData.noOfFlats);
    formPayload.append('noOfTowers', formData.noOfTowers);
    formPayload.append('projectBuildArea', formData.ProjectBuildArea);
    formPayload.append('totalProjectArea', formData.TotalProjectArea);
    formPayload.append('projectName', formData.ProjectName || '');
    formPayload.append('STATUS', formData.STATUS || '');
    formPayload.append('REASON', formData.REASON || '');
    formPayload.append('GHMC', formData.GHMC || '');
    formPayload.append('OldAmount', formData.OldAmount || '');
    formPayload.append('TotalAmount', formData.TotalAmount || '');
    formPayload.append('Size_Of_Connection', formData.Size_Of_Connection || '');
    formPayload.append('comments', formData.comments);
    formPayload.append('amountPaid', formData.amountPaid);
    formPayload.append('KLD', formData.KLD);
    formPayload.append('username', currentUserName);

    if (isUpdate) {
      formPayload.append('isUpdate', 'true');
      // ✅ NO NEED to append existing files - backend will fetch them from DB
    }

    // ✅ Append ONLY NEW files
    newPlanDocs.forEach(f => {
      if (validateFileType(f)) {
        formPayload.append('planDocs[]', f);
      }
    });

    newTitleDocs.forEach(f => {
      if (validateFileType(f)) {
        formPayload.append('titleDocs[]', f);
      }
    });

    newOthDocs.forEach(f => {
      if (validateFileType(f)) {
        formPayload.append('othDocs[]', f);
      }
    });

    newFeasibilityDocs.forEach(f => {
      if (validateFileType(f)) {
        formPayload.append('feasibilityDocs[]', f);
      }
    });

    newAmountPaidDocs.forEach(f => {
      if (validateFileType(f)) {
        formPayload.append('AMOUNT_PAID_DOC[]', f);
      }
    });

    try {
      const endpoint = isUpdate
        ? `${API_BASE_URL}/WaterPartialUpdate`
        : `${API_BASE_URL}/water-submit`;

      const res = isUpdate
        ? await axios.post(endpoint, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        : await submitWaterForm(formPayload);

      const successMessage = res?.data?.message ||
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
        // Clear new uploads
        setNewPlanDocs([]);
        setNewTitleDocs([]);
        setNewOthDocs([]);
        setNewFeasibilityDocs([]);
        setNewAmountPaidDocs([]);

        // Refresh data to show updated files
        if (formData.loc && formData.process) {
          const refreshRes = await axios.get(`${API_BASE_URL}/getProcessDatawater`, {
            params: {
              plant: formData.loc,
              process: formData.process,
            },
          });

          const updatedData = Array.isArray(refreshRes?.data) ? refreshRes.data[0] : refreshRes?.data;
          if (updatedData) {
            // Re-parse existing files
            // ... (your parsing logic)
          }
        }
      } else {
        // For new submission, reset form
        setFormData({
          loc: '',
          process: '',
          applyDate: '',
          document: null,
          noOfFlats: '',
          comments: '',
          KLD: '',
          amountPaid: '',
          feasibilityDoc: null,
          AmountPaidDoc: null,
          noOfTowers: '',
          ProjectBuildArea: '',
          TotalProjectArea: '',
          ProjectName: '',
          STATUS: '',
          REASON: '',
          GHMC: '',
          OldAmount: '',
          TotalAmount: '',
          Size_Of_Connection: '',
        });
        setNewPlanDocs([]);
        setNewTitleDocs([]);
        setNewOthDocs([]);
        setNewFeasibilityDocs([]);
        setNewAmountPaidDocs([]);
        setExistingUploadedFiles([]);
        setDataExists(false);
        setPlantExists(false);
        setIsEditMode(false);
        setHeaderData(null);
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

  // Helper to get total file counts
  const getTotalMainFiles = () => {
    const existingMain = existingUploadedFiles.filter(f =>
      f.type === 'plan' || f.type === 'title' || f.type === 'other'
    ).length;
    const newMain = newPlanDocs.length + newTitleDocs.length + newOthDocs.length;
    return existingMain + newMain;
  };

  const getTotalFeasibilityFiles = () => {
    const existingFeasibility = existingUploadedFiles.filter(f => f.type === 'feasibility').length;
    return existingFeasibility + newFeasibilityDocs.length;
  };

  const getTotalPaidFiles = () => {
    const existingPaid = existingUploadedFiles.filter(f => f.type === 'paid').length;
    return existingPaid + newAmountPaidDocs.length;
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

        {headerData && <ProjectInfoHeader data={headerData} />}

        {/* EDIT BUTTON SECTION - Only show if plant exists and data exists */}

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
                  <select
                    name="loc"
                    value={formData.loc}
                    onChange={handleChange}
                    className={`modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400 ${errors.loc ? 'error-border' : ''}`}
                  >
                    <option value="">Select Plant</option>
                    {Array.isArray(totalMasterData) && totalMasterData.map((ele, index) => (
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
                    className={`modern-input dropdown-bottom ${errors.process ? 'error-border' : ''}`}
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    disabled={plantExists && dataExists && !isEditMode}
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
                    value={formData.applyDate || ""}
                    onChange={handleChange}
                    className={`modern-input ${errors.applyDate ? 'error-border' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
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
                    style={{
                     backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
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
                    className={`modern-input ${errors.amountPaid ? 'error-border' : ''}`}
                    placeholder="Enter amount paid"
                    step="0.01"
                    min="0"
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
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
                    className={`modern-input ${errors.TotalProjectArea ? 'error-border' : ''}`}
                    placeholder="Enter the Total Project Area"
                    step="0.01"
                    min="0"
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
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
                    className={`modern-input ${errors.noOfTowers ? 'error-border' : ''}`}
                    placeholder="Enter the Number of Towers"
                    min="0"
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
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
                    className={`upload-button ${errors.documents ? 'error-border' : ''}`}
                    onClick={() => {
                      if (plantExists && dataExists && !isEditMode) {
                        toast.warning("Please enable edit mode to upload files.");
                        return;
                      }
                      setShowModal(true);
                    }}
                    disabled={plantExists && dataExists && !isEditMode}
                    style={{
                      opacity: plantExists && dataExists && !isEditMode ? 0.6 : 1,
                      cursor: plantExists && dataExists && !isEditMode ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FaUpload className="upload-icon" />
                    {plantExists && dataExists ? 'Add Documents' : 'Upload Documents'}
                    <span className="upload-count">
                      {getTotalMainFiles() > 0 && `(${getTotalMainFiles()} files)`}
                    </span>
                  </button>

                  {/* View Existing Files Button */}
                  {existingUploadedFiles.filter(f =>
                    f.type === 'plan' || f.type === 'title' || f.type === 'other'
                  ).length > 0 && (
                      <button
                        type="button"
                        onClick={() => viewDocuments('main')}
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
                        View Existing ({existingUploadedFiles.filter(f =>
                          f.type === 'plan' || f.type === 'title' || f.type === 'other'
                        ).length})
                      </button>
                    )}

                  <div className="error-container">
                    {errors.documents && <p className="error-text">{errors.documents}</p>}
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <FolderUp className="label-icon" size={20} /> Paid Document*
                </label>
                <div className="upload-container">
                  <button
                    type="button"
                    className={`upload-button ${errors.AmountPaidDocs ? 'error-border' : ''}`}
                    onClick={() => {
                      if (plantExists && dataExists && !isEditMode) {
                        toast.warning("Please enable edit mode to upload files.");
                        return;
                      }
                      setAmountPaidDocModal(true);
                    }}
                    disabled={plantExists && dataExists && !isEditMode}
                    style={{
                      opacity: plantExists && dataExists && !isEditMode ? 0.6 : 1,
                      cursor: plantExists && dataExists && !isEditMode ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FaUpload className="upload-icon" />
                    {plantExists && dataExists ? 'Add Paid Doc' : 'Upload Paid Doc'}
                    <span className="upload-count">
                      {getTotalPaidFiles() > 0 && `(${getTotalPaidFiles()} files)`}
                    </span>
                  </button>

                  {/* View Existing Paid Files Button */}
                  {existingUploadedFiles.filter(f => f.type === 'paid').length > 0 && (
                    <button
                      type="button"
                      onClick={() => viewDocuments('paid')}
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
                      View Existing ({existingUploadedFiles.filter(f => f.type === 'paid').length})
                    </button>
                  )}

                  <div className="error-container">
                    {errors.AmountPaidDocs && <p className="error-text">{errors.AmountPaidDocs}</p>}
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <FaFileAlt className="label-icon" /> Feasibility Certificate*
                </label>
                <div className="upload-container">
                  <button
                    type="button"
                    className={`upload-button ${errors.feasibilityDocs ? 'error-border' : ''}`}
                    onClick={() => {
                      if (plantExists && dataExists && !isEditMode) {
                        toast.warning("Please enable edit mode to upload files.");
                        return;
                      }
                      setShowFeasibilityModal(true);
                    }}
                    disabled={plantExists && dataExists && !isEditMode}
                    style={{
                      opacity: plantExists && dataExists && !isEditMode ? 0.6 : 1,
                      cursor: plantExists && dataExists && !isEditMode ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FaUpload className="upload-icon" />
                    {plantExists && dataExists ? 'Add Feasibility' : 'Upload Feasibility'}
                    <span className="upload-count">
                      {getTotalFeasibilityFiles() > 0 && `(${getTotalFeasibilityFiles()} files)`}
                    </span>
                  </button>

                  {/* View Existing Feasibility Files Button */}
                  {existingUploadedFiles.filter(f => f.type === 'feasibility').length > 0 && (
                    <button
                      type="button"
                      onClick={() => viewDocuments('feasibility')}
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
                      View Existing ({existingUploadedFiles.filter(f => f.type === 'feasibility').length})
                    </button>
                  )}

                  <div className="error-container">
                    {errors.feasibilityDocs && <p className="error-text">{errors.feasibilityDocs}</p>}
                  </div>
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
              <div className="form-field">
                <label className="field-label">
                  <Store className="label-icon" size={20} /> Number of Flats*
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                   name="noOfFlats"
                    value={formData.noOfFlats}
                    onChange={handleChange}
                    className={`modern-input ${errors.noOfFlats ? 'error-border' : ''}`}
                    placeholder="Enter total number of flats"
                    min="1"
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
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
                    className="modern-input"
                    placeholder="KLD will be calculated automatically"
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Calculator className="label-icon" size={20} /> Project Build Area*
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="ProjectBuildArea"
                    value={formData.ProjectBuildArea}
                    onChange={handleChange}
                    className={`modern-input ${errors.ProjectBuildArea ? 'error-border' : ''}`}
                    placeholder="Enter the Project Build Area"
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
                  />
                  <div className="error-container">
                    {errors.ProjectBuildArea && <p className="error-text">{errors.ProjectBuildArea}</p>}
                  </div>
                </div>
              </div>

              <div className="form-field full-width">
                <label className="field-label" style={{ marginTop: '-20px' }}>
                  <MessageSquareMore className="label-icon" /> Comments*
                </label>
                <div className="input-wrapper">
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    className={`modern-input ${errors.comments ? 'error-border' : ''}`}
                    placeholder="Enter your comments"
                    rows="2"
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
                  />
                  <div className="error-container">
                    {errors.comments && <p className="error-text">{errors.comments}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="form-actions">
            <button
              type="submit"
              className={`submit-button ${isSubmitting ? "submitting" : ""}`}
              disabled={isSubmitting || (plantExists && dataExists && !isEditMode)}
              style={{
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
      </form>

      <ReusableDialog
        open={confirmOpen}
        title={plantExists && dataExists && isEditMode ? "Confirm Update" : "Confirm Submission"}
        message={
          plantExists && dataExists && isEditMode
            ? "Are you sure you want to update this application? This will add new documents while keeping existing ones."
            : "Are you sure you want to submit this application? You will be redirected to the create page after successful submission."
        }
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText={plantExists && dataExists && isEditMode ? "Update" : "Submit"}
        cancelText="Cancel"
        isLoading={isSubmitting}
      />

      <WaterDocUploadModal
        show={showModal}
        onClose={() => setShowModal(false)}
        linkDocs={newPlanDocs}
        setLinkDocs={setNewPlanDocs}
        landDocs={newTitleDocs}
        setLandDocs={setNewTitleDocs}
        othDocs={newOthDocs}
        setOthDocs={setNewOthDocs}
        tableType="water"
        apiType="water"
        title="Upload Documents"
        validateFileType={validateFileType}
      />

      <WaterDocUploadModal
        show={showFeasibilityModal}
        onClose={() => setShowFeasibilityModal(false)}
        linkDocs={newFeasibilityDocs}
        setLinkDocs={setNewFeasibilityDocs}
        title="Upload Feasibility Certificate"
        showLandDocs={false}
        showOthDocs={false}
        validateFileType={validateFileType}
      />

      <WaterDocUploadModal
        show={amountPaidDocModal}
        onClose={() => setAmountPaidDocModal(false)}
        linkDocs={newAmountPaidDocs}
        setLinkDocs={setNewAmountPaidDocs}
        title="Upload Paid Document Certificate"
        showLandDocs={false}
        showOthDocs={false}
        validateFileType={validateFileType}
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


                      {isEditMode && (
                        <button
                          onClick={async () => {
                            // Confirm deletion
                            if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
                              try {
                                // Determine document type from file properties
                                // You need to pass the correct doc_type based on file type
                                let docType = '';

                                // Map file type to backend doc_type
                                switch (file.type) {
                                  case 'plan':
                                    docType = 'PLAN';
                                    break;
                                  case 'title':
                                    docType = 'TITLE';
                                    break;
                                  case 'other':
                                    docType = 'OTH';
                                    break;
                                  case 'feasibility':
                                    docType = 'FEAS';
                                    break;
                                  case 'paid':
                                    docType = 'PAID';
                                    break;
                                  default:
                                    // If type is not mapped, check file name or path for clues
                                    if (file.path && file.path.includes('PLAN')) {
                                      docType = 'PLAN';
                                    } else if (file.path && file.path.includes('TITLE')) {
                                      docType = 'TITLE';
                                    } else if (file.path && file.path.includes('FEAS')) {
                                      docType = 'FEAS';
                                    } else if (file.path && file.path.includes('PAID')) {
                                      docType = 'PAID';
                                    } else {
                                      docType = 'DOCS'; // Default fallback
                                    }
                                }

                                // Make API call to delete from backend
                                const response = await axios.delete(`${API_BASE_URL}/water/document`, {
                                  data: {
                                    loc: formData.loc,
                                    process: formData.process,
                                    doc_type: docType, // Send single valid type
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

                                  // Refresh data from backend to ensure consistency
                                  if (formData.loc && formData.process) {
                                    try {
                                      const res = await axios.get(`${API_BASE_URL}/getProcessDatawater`, {
                                        params: {
                                          plant: formData.loc,
                                          process: formData.process,
                                        },
                                      });

                                      const data = Array.isArray(res?.data) ? res.data[0] : res?.data;

                                      // Re-parse all document types
                                      if (data) {
                                        const planFiles = parseDocumentArray(
                                          data.PLAN_DOC_NAME,
                                          data.PLAN_DOC_PATH,
                                          'plan'
                                        );

                                        const titleFiles = parseDocumentArray(
                                          data.TITLE_DOC_NAME,
                                          data.TITLE_DOC_PATH,
                                          'title'
                                        );

                                        const otherFiles = parseDocumentArray(
                                          data.OTH_DOC_NAME,
                                          data.OTH_DOC_PATH,
                                          'other'
                                        );

                                        const feasibilityFiles = parseDocumentArray(
                                          data.FEAS_DOC_NAME,
                                          data.FEAS_DOC_PATH,
                                          'feasibility'
                                        );

                                        const paidFiles = parseDocumentArray(
                                          data.AMOUNT_PAID_DOC_NAME,
                                          data.AMOUNT_PAID_DOC_PATH,
                                          'paid'
                                        );

                                        const allExistingFiles = [
                                          ...planFiles,
                                          ...titleFiles,
                                          ...otherFiles,
                                          ...feasibilityFiles,
                                          ...paidFiles
                                        ];

                                        setExistingUploadedFiles(allExistingFiles);
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

                                // Show more specific error message
                                if (error.response?.data?.message) {
                                  toast.error(error.response.data.message);
                                } else if (error.response?.data?.errors?.doc_type) {
                                  toast.error(`Invalid document type. Allowed: ${error.response.data.errors.doc_type}`);
                                } else {
                                  toast.error('Failed to delete file. Please try again.');
                                }
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
      />
    </div>
  );
};

export default WaterForm;
