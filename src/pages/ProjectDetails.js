import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config/Config';
import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt, FaPlus } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, Droplets, MessageSquareMore, CircleDivide, Calculator, Store, FileCheck2, FileCheck, FolderUp, BrickWallFire } from "lucide-react";
import PlantSelect from '../components/PlantSelect';
import ApplyDateInput from '../components/ApplyDateInput';
import { ToastContainer, toast } from 'react-toastify';
import ReusableDialog from "../components/ReusableDialog";
import "../pages/ProjectDetails.css";
import { createMaster, getMasterByLoc, submitWaterForm } from "../api/Api";
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
  const navigate = useNavigate();
  const { setMasterData, setMasterGetData, masterPostData, totalMasterCode } = useContext(Context);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

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



    const checkIfPlantExists = async (plant) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/masterPlntexists`, { loc: plant });
         
            if (res.data.exists) {
                toast.error('This plant already has entries.');
                setFormData((prev) => ({ ...prev, loc: '' }));
            
            }
        } catch (error) {
            console.error('Failed to check plant:', error);
        }
    };

  const handleChange = async (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));


   const plantExists = await checkIfPlantExists(value);
      
            if (plantExists) {
                return; 
            }

  };


 
 
  const handlePlantCodeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      plantcode: value,
      loc: '' // Reset plant selection when code changes
    }));
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
      return; // stop function here
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
  // If companyCode or plantName is empty, just close the dialog
  if (!companyFields?.companyCode || !companyFields?.plantName) {
    setCompanyDialogOpen(false); // close dialog
    return; // exit the function, no API call
  }

  // Only call API if both fields exist
  const payload = {
    company_code: companyFields.companyCode,
    plant_code: companyFields.plantName,
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/newGenPlntDel`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Deleted new plant generation", payload);
  } catch (err) {
    console.error("Error deleting plant:", err.response?.data || err.message);
  }

  setCompanyDialogOpen(false); // close dialog after API call
  
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.loc) newErrors.loc = "Project location is required.";
    if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
    if (!formData.ProjectName) newErrors.ProjectName = "Project name is required.";
    if (!formData.BuildArea) newErrors.BuildArea = "Project Build Area is required.";
    if (!formData.Address) newErrors.Address = "Address is required.";
    if (!formData.noOfFlats) newErrors.noOfFlats = "Number Of Flats required.";
    if (!formData.noOfTowers) newErrors.noOfTowers = "Number Of Towers required.";
    if (!formData.TotalProjectArea) newErrors.TotalProjectArea = "Total ProjectArea required.";

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

    try {
      const data = await createMaster(formPayload);

      setMasterData(data?.data);


      const get = await getMasterByLoc(data?.data.loc);
      setMasterGetData(get);

      if (data.message) {
        Swal.fire({
          icon: "success",
          title: "Form Submitted Successfully!",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          navigate('/create');
        });
      }

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


    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick =  async () => {
 
    navigate('/create');
  };


  

  return (
    <div className="water-form-wrapper">
      <form className="water-form-container" onSubmit={handleSubmit}>
        {/* HEADER */}
        <div className="form-header">
          <div className="header-content">
            <div className="title-section">
              <div className="icon-wrapper">
                <BrickWallFire className="water-icon" size={32} />
              </div>
              <h1 className="form-title">Master Control Board Application</h1>
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

        {/* CREATE BUTTON */}
        {/* <div className="create-button-section">
          <button
            type="button"
            onClick={() => setCompanyDialogOpen(true)}
            className="create-company-button"
          >
            <FaPlus className="create-icon" />
            Create Company
          </button>
        </div> */}
        <div
          className="create-button-section"
          style={{ display: "flex", justifyContent: "flex-end", marginBottom: "-10px", marginRight: "10px" }}
        >
          <button
            type="button"
            onClick={() => setCompanyDialogOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(90deg, #6366F1, #8B5CF6)", // Default gradient
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
              e.currentTarget.style.background =
                "linear-gradient(90deg, #4F46E5, #7C3AED)"; // Hover gradient
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
              e.currentTarget.style.background =
                "linear-gradient(90deg, #6366F1, #8B5CF6)";
            }}
          >
            <FaPlus style={{ fontSize: "18px" }} />
            Create Project
          </button>
        </div>

        <div className="form-content">
          {/* Project Information */}
          <div className="form-section">
            <div className="section-header">
              <Home className="section-icon" size={20} />
              <h3 style={{ color: '#0e7bdae7' }}>Project Information:</h3>
            </div>

            <div className="form-grid two-columns">
              {/* ✅ Plant Code Select - First Field */}
              <div className="form-field">
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
                  {/* <div className="error-container">
                    {errors.plantcode && <p className="error-text">{errors.plantcode}</p>}
                  </div> */}
                </div>

              </div>



              {/* ✅ Plant Select - Pass selectedPlantCode */}
              <div className="form-field">
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Plant Code/Name*
                </label>
                <div className="input-wrapper">
                  <PlantSelect
                    value={formData.loc}
                    onChange={handleChange}
                    selectedPlantCode={formData.plantcode}
                    className="highlight-input"
                    disabled={!formData.plantcode}
                  />
                  <div className="error-container">
                    {errors.loc && <p className="error-text">{errors.loc}</p>}
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
                  <FaCalendarAlt className="label-icon" /> Creation Date*
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
                  />
                  <div className="error-container">
                    {errors.TotalProjectArea && <p className="error-text">{errors.TotalProjectArea}</p>}
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
                  <Store className="label-icon" size={20} />Project Name*
                </label>
                <div className="input-wrapper">
                  <input
                    name="ProjectName"
                    value={formData.ProjectName}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter Project Name"
                    min="1"
                  />
                  <div className="error-container">
                    {errors.ProjectName && <p className="error-text">{errors.ProjectName}</p>}
                  </div>
                </div>
              </div>
              <div className="form-field">
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
                  />
                  <div className="error-container">
                    {errors.BuildArea && <p className="error-text">{errors.BuildArea}</p>}
                  </div>
                </div>
              </div>

              <div className="form-field">
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
                  />
                  <div className="error-container">
                    {errors.noOfTowers && <p className="error-text">{errors.noOfTowers}</p>}
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
                  />
                  <div className="error-container">
                    {errors.noOfFlats && <p className="error-text">{errors.noOfFlats}</p>}
                  </div>
                </div>
              </div>
              <div className="form-field">
                <label className="field-label">
                  <MessageSquareMore className="label-icon" size={20} /> Address*
                </label>
                <div className="input-wrapper" style={{ display: 'flex', paddingTop: '5px' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setAddressDialogOpen(true)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Add Address
                  </Button>
                </div>
                <div className="error-container">
                  {errors.Address && <p className="error-text">{errors.Address}</p>}
                </div>
                <div style={{ marginTop: 8, fontStyle: 'italic', color: '#444' }}>
                  {formData.Address || 'No address added yet'}
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

      {/* Company & Plant Dialog */}
      <Dialog
        open={companyDialogOpen}
        // onClose={handleCloseCompanyDialog}
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

          {/* Generated Plant Name */}



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

export default ProjectDetails;