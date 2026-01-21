
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config/Config';
import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt, FaPlus, FaEdit, FaEye, FaLock, FaTrash } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, Droplets, MessageSquareMore, CircleDivide, Calculator, Store, FileCheck2, FileCheck, FolderUp, BrickWallFire, Edit, Eye, Lock, Trash2 } from "lucide-react";
import PlantSelect from '../components/PlantSelect';
import ApplyDateInput from '../components/ApplyDateInput';
import { ToastContainer, toast } from 'react-toastify';
import ReusableDialog from "../components/ReusableDialog";
import "../pages/ProjectDetails.css";
import { createMaster, getMasterByLoc } from "../api/Api";
import { Context } from "../context/ContextData";

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Slide from '@mui/material/Slide';
import InputAdornment from '@mui/material/InputAdornment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import DomainIcon from '@mui/icons-material/Domain';
import LocalPostOfficeIcon from '@mui/icons-material/LocalPostOffice';
import Swal from "sweetalert2";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProjectDetails = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const { setMasterData, setMasterGetData, totalMasterCode, totalMasterData = [] } = useContext(Context);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [dataExists, setDataExists] = useState(false);
  const [plantExists, setPlantExists] = useState(false);
  const [existingPlantData, setExistingPlantData] = useState(null);

// Add these with other useState declarations
const [emailData, setEmailData] = useState([]);
const [userHasEditPermission, setUserHasEditPermission] = useState(false);
const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  // Enhanced Address dialog state and validation
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [addressFields, setAddressFields] = useState({
    street: '',
    mandal: '',
    district: '',
    pincode: '',
    city: ''
  });

  // New dialog for company code and plant name
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [companyFields, setCompanyFields] = useState({
    companyCode: '',
    plantName: '',
    plantdes: ''
  });

  const [formData, setFormData] = useState({
    plantcode: '',
    loc: '',
    applyDate: '',
    noOfTowers: '',
    BuildArea: '',
    TotalProjectArea: '',
    ProjectName: '',
    Address: '',
    noOfFlats: '',
    streetName: '',
    district: '',
    city: '',
    mandal: '',
    pincode: ''
  });

  // --- 1. Check User Login ---
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
  // --- 2. Fetch existing data when plant is selected ---
  useEffect(() => {
    if (!formData.loc || formData.loc.trim() === "") {
      return;
    }

    const fetchExistingData = async () => {
      try {
        console.log("Fetching data for location:", formData.loc);

        const res = await getMasterByLoc(formData.loc);
        console.log("API Response:", res);

        if (res && Object.keys(res).length > 0 && res.LOC) {
          // Parse the address
          const address = res.ADDRESS || '';
          let streetName = '';
          let mandal = '';
          let district = '';
          let city = '';
          let pincode = '';

          if (address) {
            const parts = address.split(',');
            if (parts.length >= 5) {
              streetName = parts[0]?.trim() || '';
              mandal = parts[1]?.trim() || '';
              district = parts[2]?.trim() || '';
              city = parts[3]?.trim() || '';
              pincode = parts[4]?.trim() || '';
            } else {
              streetName = res.STREET_NAME || '';
              mandal = res.MANDAL || '';
              district = res.DISTRICT || '';
              city = res.CITY || '';
              pincode = res.PIN_CODE || '';
            }
          }

          // Set address fields for dialog
          setAddressFields({
            street: streetName,
            mandal: mandal,
            district: district,
            city: city,
            pincode: pincode
          });

          // Set form data
          const updatedFormData = {
            plantcode: res.COMPANY_CODE || '',
            loc: res.LOC || '',
            applyDate: (res.APPLICATION_DATE && res.APPLICATION_DATE !== "nil") ? res.APPLICATION_DATE : "",
            noOfTowers: (res.NUMBER_OF_TOWERS && res.NUMBER_OF_TOWERS !== "nil") ? res.NUMBER_OF_TOWERS : "",
            BuildArea: (res.PROJECT_BUILD_AREA && res.PROJECT_BUILD_AREA !== "nil") ? res.PROJECT_BUILD_AREA : "",
            TotalProjectArea: (res.TOTAL_PROJECT_AREA && res.TOTAL_PROJECT_AREA !== "nil") ? res.TOTAL_PROJECT_AREA : "",
            ProjectName: (res.PROJECT_NAME && res.PROJECT_NAME !== "nil") ? res.PROJECT_NAME : "",
            Address: address,
            noOfFlats: (res.NUMBER_OF_FLATS && res.NUMBER_OF_FLATS !== "nil") ? res.NUMBER_OF_FLATS : "",
            streetName: streetName,
            district: district,
            city: city,
            mandal: mandal,
            pincode: pincode
          };

          setFormData(updatedFormData);
          setDataExists(true);
          setPlantExists(true);
          setExistingPlantData(res);
          setIsEditMode(false); // Start in view mode

          // Check if UPDATED field exists
          const isCompleted = res?.UPDATED && res?.UPDATED?.toUpperCase() === 'YES';
          setCanEdit(!isCompleted);

          if (isCompleted) {
            toast.info(`Record for ${formData.loc} is completed and cannot be edited.`, {
              autoClose: 4000
            });
          } else {
            toast.info(`Data loaded for ${formData.loc}.`, {
              autoClose: 3000
            });
          }

        } else {
          console.log("No existing data found");
          setDataExists(false);
          setPlantExists(false);
          setExistingPlantData(null);
          setIsEditMode(true); // Allow editing since no data exists
          setCanEdit(true);

          // Reset form fields
          setFormData(prev => ({
            ...prev,
            applyDate: "",
            noOfTowers: "",
            BuildArea: "",
            TotalProjectArea: "",
            ProjectName: "",
            Address: "",
            noOfFlats: "",
            streetName: "",
            district: "",
            city: "",
            mandal: "",
            pincode: ""
          }));

          // Reset address fields
          setAddressFields({
            street: '',
            mandal: '',
            district: '',
            pincode: '',
            city: ''
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setDataExists(false);
        setPlantExists(false);
        setExistingPlantData(null);
        setIsEditMode(true);
        setCanEdit(true);

        setFormData(prev => ({
          ...prev,
          applyDate: "",
          noOfTowers: "",
          BuildArea: "",
          TotalProjectArea: "",
          ProjectName: "",
          Address: "",
          noOfFlats: "",
          streetName: "",
          district: "",
          city: "",
          mandal: "",
          pincode: ""
        }));
      }
    };

    fetchExistingData();
  }, [formData.loc]);

  const checkIfPlantExists = async (plant) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/masterPlntexists`, { loc: plant });

      if (res.data.exists) {
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

  // Toggle edit mode
const toggleEditMode = () => {
  if (plantExists && dataExists) {
    if (!canEdit) {
      toast.error("This record has been completed and cannot be edited (UPDATED = 'YES').", {
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
  const handleChange = async (e) => {
    const { name, value } = e.target;

    // If plant is being changed, check if it exists
    if (name === "loc" && value) {
      setFormData((prev) => ({
        ...prev,
        loc: value,
      }));

      if (errors.loc) {
        setErrors(prev => ({ ...prev, loc: '' }));
      }

      if (!value || value.trim() === "") {
        setFormData((prev) => ({
          ...prev,
          applyDate: "",
          noOfTowers: "",
          BuildArea: "",
          TotalProjectArea: "",
          ProjectName: "",
          Address: "",
          noOfFlats: "",
          streetName: "",
          district: "",
          city: "",
          mandal: "",
          pincode: ""
        }));
        setDataExists(false);
        setPlantExists(false);
        setExistingPlantData(null);
        setIsEditMode(false);
        return;
      }

      await checkIfPlantExists(value);
    } else {
      // Normal case - update form data and clear error
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handlePlantCodeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      plantcode: value,
      loc: '', // Reset plant selection when code changes
      applyDate: "",
      noOfTowers: "",
      BuildArea: "",
      TotalProjectArea: "",
      ProjectName: "",
      Address: "",
      noOfFlats: "",
      streetName: "",
      district: "",
      city: "",
      mandal: "",
      pincode: ""
    }));
    setDataExists(false);
    setPlantExists(false);
    setExistingPlantData(null);
    setIsEditMode(false);
  };

  // Handler for company dialog dropdown
  const handleCompanyCodeChange = async (e) => {
    const selectedCompanyCode = e.target.value;

    setCompanyFields(prev => ({
      ...prev,
      companyCode: selectedCompanyCode,
      plantName: '' // Clear plant name when company code changes
    }));

    // Auto-generate plant name when company code is selected
    if (selectedCompanyCode) {
      await generatePlantName(selectedCompanyCode);
    }
  };

  // Function to generate plant name
  const generatePlantName = async (companyCode) => {
    if (!companyCode || companyCode.trim() === "") {
      toast.error("Company code cannot be empty!");
      return;
    }

    const formPayload = {
      "company_code": companyCode
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/unique-plant-gen`, formPayload, {
        headers: { "Content-Type": "application/json" },
      });

      const generatedPlantName = response?.data?.data;
      setCompanyFields(prev => ({
        ...prev,
        plantName: generatedPlantName
      }));

      toast.success('Plant name generated successfully!');
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      toast.error('Failed to generate plant name. Please try again.');
    }
  };

  const handleCancel = async () => {
    if (!companyFields?.companyCode || !companyFields?.plantName) {
      setCompanyDialogOpen(false);
      return;
    }

    const payload = {
      company_code: companyFields.companyCode,
      plant_code: companyFields.plantName,
    };

    try {
      await axios.post(`${API_BASE_URL}/newGenPlntDel`, payload, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Error deleting plant:", err.response?.data || err.message);
    }

    setCompanyDialogOpen(false);
  };

  // Close company dialog and reset fields
  const handleCloseCompanyDialog = async () => {
    setCompanyDialogOpen(false);
    if (!companyFields?.companyCode || companyFields?.plantName.trim() === "") {
      return;
    }

    const formPayload = {
      "company_code": companyFields?.companyCode,
      "plant_code": companyFields?.plantName,
      "plant_desc": companyFields?.plantdes
    }

    const response = await axios.post(`${API_BASE_URL}/new-plant-store`, formPayload, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.data.message) {
      Swal.fire({
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        setCompanyDialogOpen(false);
      });
    }

    setCompanyFields({
      companyCode: '',
      plantName: '',
      plantdes: ''
    });

    setFormData({
      plantcode: '',
      loc: '',
      applyDate: '',
      noOfTowers: '',
      BuildArea: '',
      TotalProjectArea: '',
      ProjectName: '',
      Address: '',
      noOfFlats: '',
      streetName: '',
      district: '',
      city: '',
      mandal: '',
      pincode: ''
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.plantcode || formData.plantcode.trim() === '') {
      newErrors.plantcode = 'Company Code is required';
    }

    if (!formData.loc || formData.loc.trim() === '') {
      newErrors.loc = 'Plant Code/Name is required';
    }

    const isUpdate = plantExists && dataExists && isEditMode;

    if (!isUpdate) {
      // For new submission
      if (!formData.applyDate || formData.applyDate.trim() === '') {
        newErrors.applyDate = 'Application Date is required';
      }

      if (!formData.ProjectName || formData.ProjectName.trim() === '') {
        newErrors.ProjectName = 'Project Name is required';
      }

      if (!formData.BuildArea || formData.BuildArea.trim() === '') {
        newErrors.BuildArea = 'Project Build Area is required';
      }

      if (!formData.Address || formData.Address.trim() === '') {
        newErrors.Address = 'Address is required';
      }

      if (!formData.noOfFlats || formData.noOfFlats.trim() === '') {
        newErrors.noOfFlats = 'Number of Flats is required';
      }

      if (!formData.noOfTowers || formData.noOfTowers.trim() === '') {
        newErrors.noOfTowers = 'Number of Towers is required';
      }

      if (!formData.TotalProjectArea || formData.TotalProjectArea.trim() === '') {
        newErrors.TotalProjectArea = 'Total Project Area is required';
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
    formPayload.append('plantcode', formData.plantcode);
    formPayload.append('loc', formData.loc);
    formPayload.append('applicationDate', formData.applyDate);
    formPayload.append('address', formData.Address);
    formPayload.append('noOfTowers', formData.noOfTowers);
    formPayload.append('projectBuildArea', formData.BuildArea);
    formPayload.append('totalProjectArea', formData.TotalProjectArea);
    formPayload.append('projectname', formData.ProjectName);
    formPayload.append('noOfFlats', formData.noOfFlats);
    formPayload.append('streetName', formData.streetName);
    formPayload.append('district', formData.district);
    formPayload.append('city', formData.city);
    formPayload.append('mandal', formData.mandal);
    formPayload.append('pincode', formData.pincode);
    formPayload.append('username', currentUserName);

    try {
      let data;

      // Use update endpoint if editing, create endpoint if new
      if (isUpdate) {
        data = await axios.post(`${API_BASE_URL}/update-master`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        toast.success("Record updated successfully!");

        if (data.success) {
          setIsEditMode(false);
          toast.info("Edit mode disabled. Form is now read-only.", {
            autoClose: 3000
          });
        }
      } else {
        data = await createMaster(formPayload);
        setMasterData(data?.data);

        const get = await getMasterByLoc(data?.data.loc);
        setMasterGetData(get);

        toast.success("Record created successfully!");

        // For new submission, reset form
        setFormData({
          plantcode: '',
          loc: '',
          applyDate: '',
          noOfTowers: '',
          BuildArea: '',
          TotalProjectArea: '',
          ProjectName: '',
          Address: '',
          noOfFlats: '',
          streetName: '',
          district: '',
          city: '',
          mandal: '',
          pincode: ''
        });
        setDataExists(false);
        setPlantExists(false);
        setIsEditMode(false);
      }

      setErrors({});
      navigate('/create');

    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage = err.response?.data?.message ||
        (isUpdate ? 'Update failed. Please try again.' : 'Creation failed. Please try again.');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = async () => {
    navigate('/create');
  };

  return (
    <div className="water-form-wrapper">
      <form className="water-form-container" onSubmit={handleSubmit} noValidate>
        {/* HEADER */}
        <div className="form-header">
          <div className="header-content">
            <div className="title-section">
              <div className="icon-wrapper">
                <BrickWallFire className="water-icon" size={32} />
              </div>
              <h1 className="form-title">Master Control Board Application</h1>
              <p className="form-subtitle">
                {plantExists && dataExists && isEditMode
                  ? "Edit existing project details"
                  : "Submit your Project Details management compliance application"}
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

     
{/* EDIT MODE CONTROLS & CREATE PROJECT BUTTON - SIDE BY SIDE */}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  marginTop: '20px',
  paddingLeft: '20px',
  paddingRight: '20px'
}}>
   <div>
    <button
      type="button"
      onClick={() => setCompanyDialogOpen(true)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "10px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
        transition: "all 0.3s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.2)";
        e.currentTarget.style.background = "linear-gradient(90deg, #4F46E5, #7C3AED)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
        e.currentTarget.style.background = "linear-gradient(90deg, #6366F1, #8B5CF6)";
      }}
    >
      <FaPlus style={{ fontSize: "18px" }} />
      Create Project
    </button>
  </div>
  {/* Left side - Edit Mode Controls */}
{/* Left side - Edit Mode Controls */}
{/* Left side - Edit Mode Controls */}
<div>
  {isCheckingPermission ? (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: '#f8f9fa',
      border: '1px solid #6c757d',
      borderRadius: '8px',
      color: '#6c757d',
      fontSize: '14px',
      fontWeight: '600',
    }}>
      <div className="spinner-small"></div>
      Checking Permission...
    </div>
  ) : (
    plantExists && dataExists && existingPlantData?.UPDATED?.toUpperCase() !== 'YES' && (
      <>
        {!canEdit ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#f8f9fa',
            border: '1px solid #dc3545',
            borderRadius: '8px',
            color: '#dc3545',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            <Lock size={16} />
            Application Completed - Cannot Edit
          </div>
        ) : (
          // Only show edit button if user has permission
          userHasEditPermission ? (
            <button
              type="button"
              onClick={toggleEditMode}
              title={isEditMode ? "Disable Edit Mode" : "Enable Edit Mode"}
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
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
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
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
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
          ) : (
            ''
          )
        )}
      </>
    )
  )}
</div>
  {/* Right side - Create Project Button */}

</div>

        <div className="form-content">
          {/* Project Information */}
          <div className="form-section">
            <div className="section-header">
              <Home className="section-icon" size={20} />
              <h3 style={{ color: '#0e7bdae7' }}>Project Information:</h3>
            </div>

            <div className="form-grid two-columns">
              {/* Company Code Select */}
              <div className={`form-field ${errors.plantcode ? 'has-error' : ''}`}>
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Company Code*
                </label>
                <div className="input-wrapper">
                  <select
                    name="plantcode"
                    value={formData.plantcode}
                    onChange={handlePlantCodeChange}
                    className="modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400"

                  >
                    <option value="">Select Code</option>
                    {Array.isArray(totalMasterCode?.companyCodes) && totalMasterCode?.companyCodes.map((ele, index) => (
                      <option key={index} value={ele}>
                        {ele}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.plantcode && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.plantcode}
                  </p>
                )}
             </div>

              {/* Plant Select */}
              <div className={`form-field ${errors.loc ? 'has-error' : ''}`}>
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Plant Code/Name*
               </label>
                <div className="input-wrapper">
                  <PlantSelect
                    value={formData.loc}
                    onChange={handleChange}
                    selectedPlantCode={formData.plantcode}
                    className="highlight-input"

                  />
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
            </div>
          </div>

          {/* Application Details */}
          <div className="form-section">
            <div className="section-header">
              <FileText className="section-icon" size={20} />
              <h3 style={{ color: '#0e7bdae7' }}>Application Details:</h3>
            </div>

            <div className="form-grid two-columns">
              <div className={`form-field ${errors.applyDate ? 'has-error' : ''}`}>
                <label className="field-label">
                  <FaCalendarAlt className="label-icon" /> Creation Date*
                </label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    name="applyDate"
                    value={formData.applyDate || ""}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Select Creation Date"
                    disabled={plantExists && dataExists && !isEditMode}
                    style={{
                      border: errors.applyDate ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: (plantExists && dataExists && !isEditMode) ? '#f5f5f5' : 'white',
                      color: (plantExists && dataExists && !isEditMode) ? '#666' : 'inherit',
                      cursor: (plantExists && dataExists && !isEditMode) ? 'default' : 'pointer'
                    }}
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

              <div className={`form-field ${errors.TotalProjectArea ? 'has-error' : ''}`}>
                <label className="field-label">
                  <FaMoneyBill className="label-icon" /> Total Project Area (In Acres)*
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    name="TotalProjectArea"
                    value={formData.TotalProjectArea}
                    onChange={handleChange}
                    className="highlight-input"
                    placeholder="Enter Total Project Area"
                    step="0.01"
                    min="0"
                    style={{
                      border: errors.TotalProjectArea ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
                  />
                </div>
                {errors.TotalProjectArea && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.TotalProjectArea}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="form-section">
            <div className="section-header">
              <FaUpload className="section-icon" size={20} />
              <h3 style={{ color: '#0e7bdae7' }}>Project Details:</h3>
            </div>

            <div className="form-grid three-columns">
              <div className={`form-field ${errors.ProjectName ? 'has-error' : ''}`}>
                <label className="field-label">
                  <Store className="label-icon" size={20} />Project Name*
                </label>
                <div className="input-wrapper">
                  <input
                    name="ProjectName"
                    value={formData.ProjectName}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter Project Name"
                    style={{
                      border: errors.ProjectName ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
                  />
                </div>
                {errors.ProjectName && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.ProjectName}
                  </p>
                )}
              </div>
              <div className={`form-field ${errors.BuildArea ? 'has-error' : ''}`}>
                <label className="field-label">
                  <Calculator className="label-icon" size={20} /> Project Built-Up Area*
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    name="BuildArea"
                    value={formData.BuildArea}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter the Build Area"
                    style={{
                      border: errors.BuildArea ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
                  />
                </div>
                {errors.BuildArea && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.BuildArea}
                  </p>
                )}
              </div>

              <div className={`form-field ${errors.noOfTowers ? 'has-error' : ''}`}>
                <label className="field-label">
                  <Calculator className="label-icon" size={20} /> Number of Towers*
                </label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    name="noOfTowers"
                    value={formData.noOfTowers}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter the number of towers"
                    min="0"
                    style={{
                      border: errors.noOfTowers ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
                  />
                </div>
                {errors.noOfTowers && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.noOfTowers}
                 </p>
                )}
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
             <div className={`form-field ${errors.noOfFlats ? 'has-error' : ''}`}>
                <label className="field-label">
                  <FaMoneyBill className="label-icon" />Number of Flats*
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
                    style={{
                      border: errors.noOfFlats ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                    readOnly={plantExists && dataExists && !isEditMode}
                  />
                </div>
                {errors.noOfFlats && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.noOfFlats}
                  </p>
                )}
              </div>
              <div className={`form-field ${errors.Address ? 'has-error' : ''}`}>
                <label className="field-label">
                  <MessageSquareMore className="label-icon" size={20} /> Address*
                </label>
                <div className="input-wrapper" style={{ display: 'flex', paddingTop: '5px' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setAddressDialogOpen(true)}
                    style={{ whiteSpace: 'nowrap' }}
                    disabled={plantExists && dataExists && !isEditMode}
                  >
                    {formData.Address ? 'Edit Address' : 'Add Address'}
                  </Button>
                </div>
                <div style={{ marginTop: 8, fontStyle: 'italic', color: '#444' }}>
                  {formData.Address || 'No address added yet'}
                </div>
                {errors.Address && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    marginBottom: '0'
                  }}>
                    {errors.Address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
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
            ? "Are you sure you want to update this project record?"
            : "Are you sure you want to submit this project record? You will be redirected to the dashboard after successful submission."
        }
        onClose={() => setConfirmOpen(false)}
       onConfirm={handleConfirmSubmit}
        confirmText={plantExists && dataExists && isEditMode ? "Update" : "Submit"}
        cancelText="Cancel"
        isLoading={isSubmitting}
      />

      {/* Company & Plant Dialog */}
      <Dialog
        open={companyDialogOpen}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{ sx: { borderRadius: 3, padding: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Create Project
        </DialogTitle>
        <DialogContent dividers>
          {/* Company Code Dropdown */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#333'
            }}>
              <FaBuilding style={{ marginRight: '8px', color: '#1976d2' }} />
              Company Code*
            </label>
            <select
              value={companyFields.companyCode}
              onChange={handleCompanyCodeChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1976d2';
                e.target.style.boxShadow = '0 0 0 2px rgba(25, 118, 210, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Select Company Code</option>
              {Array.isArray(totalMasterCode?.companyCodes) && totalMasterCode?.companyCodes.map((ele, index) => (
                <option key={index} value={ele}>
                  {ele}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: 8 }}>
            <TextField
              label="Generated Plant Code"
              name="plantName"
              value={companyFields?.plantName}
              placeholder="Plant name will be generated automatically"
              fullWidth
              margin="normal"
              required
              InputProps={{
                readOnly: true,
                startAdornment: (<InputAdornment position="start"><Store color="primary" /></InputAdornment>)
              }}
            />

            <TextField
              label="Generated Plant Name"
              name="plantdes"
              value={companyFields?.plantdes || ""}
              placeholder="Please enter plant name"
              fullWidth
              margin="normal"
              onChange={(e) =>
                setCompanyFields(prev => ({
                  ...prev,
                  plantdes: e.target.value
                }))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Store color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCloseCompanyDialog}
            variant="contained"
            disabled={!companyFields.plantName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Address Dialog */}
      <Dialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{ sx: { borderRadius: 3, padding: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>Enter Address</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Street Name"
            placeholder="Enter street or road name"
            value={addressFields.street}
            onChange={e => setAddressFields(prev => ({ ...prev, street: e.target.value }))}
            fullWidth
            margin="normal"
            required
            InputProps={{
              startAdornment: (<InputAdornment position="start"><LocationOnIcon color="primary" /></InputAdornment>)
            }}
          />

          <div style={{ display: 'flex', gap: '16px', marginTop: 8 }}>
            <TextField
              label="District"
              placeholder="Enter district name"
              value={addressFields.district}
              onChange={e => setAddressFields(prev => ({ ...prev, district: e.target.value }))}
              required
              InputProps={{
                startAdornment: (<InputAdornment position="start"><DomainIcon color="primary" /></InputAdornment>)
              }}
              style={{ flex: 1 }}
              margin="normal"
            />
            <TextField
              label="City"
              placeholder="Enter city name"
              value={addressFields.city}
              onChange={e => setAddressFields(prev => ({ ...prev, city: e.target.value }))}
              required
              InputProps={{
                startAdornment: (<InputAdornment position="start"><DomainIcon color="primary" /></InputAdornment>)
              }}
              style={{ flex: 1 }}
              margin="normal"
            />
          </div>

          <TextField
            label="Mandal"
            placeholder="Enter mandal name"
            value={addressFields.mandal}
            onChange={e => setAddressFields(prev => ({ ...prev, mandal: e.target.value }))}
            fullWidth
            margin="normal"
            required
            InputProps={{
              startAdornment: (<InputAdornment position="start"><MapIcon color="primary" /></InputAdornment>)
            }}
          />

          <TextField
            label="Pincode"
            placeholder="Enter 6-digit pincode"
            value={addressFields.pincode}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setAddressFields(prev => ({ ...prev, pincode: value }));
            }}
            fullWidth
            margin="normal"
            required
            error={addressFields.pincode.length > 0 && addressFields.pincode.length !== 6}
            helperText={addressFields.pincode.length > 0 && addressFields.pincode.length !== 6 ? "Pincode must be 6 digits" : ""}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><LocalPostOfficeIcon color="primary" /></InputAdornment>)
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddressDialogOpen(false)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            disabled={
              !addressFields.street.trim() ||
              !addressFields.mandal.trim() ||
              !addressFields.district.trim() ||
              !addressFields.city.trim() ||
              addressFields.pincode.length !== 6
            }
            onClick={() => {
              const combined = `${addressFields.street}, ${addressFields.mandal}, ${addressFields.district}, ${addressFields.city}, ${addressFields.pincode}`;
              setFormData(prev => ({
                ...prev,
                Address: combined,
                streetName: addressFields.street,
                mandal: addressFields.mandal,
                district: addressFields.district,
                city: addressFields.city,
                pincode: addressFields.pincode
              }));
              setAddressDialogOpen(false);
            }}
          >
            Save Address
          </Button>
        </DialogActions>
      </Dialog>

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

export default ProjectDetails;
