// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { API_BASE_URL } from '../config/Config';
// import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
// import { ChevronLeft, FileText, Home, Droplets, MessageSquareMore, CircleDivide, Calculator, Store, FileCheck2, FileCheck, FolderUp, BrickWallFire } from "lucide-react";
// import PlantSelect from '../components/PlantSelect';
// import ApplyDateInput from '../components/ApplyDateInput';
// import { ToastContainer, toast } from 'react-toastify';
// import ReusableDialog from "../components/ReusableDialog";
// import "../pages/ProjectDetails.css";
// import { createMaster, getMasterByLoc, submitWaterForm } from "../api/Api";
// import { Context } from "../context/ContextData";

// import Dialog from '@mui/material/Dialog';
// import DialogTitle from '@mui/material/DialogTitle';
// import DialogContent from '@mui/material/DialogContent';
// import DialogActions from '@mui/material/DialogActions';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import Slide from '@mui/material/Slide';
// import InputAdornment from '@mui/material/InputAdornment';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import MapIcon from '@mui/icons-material/Map';
// import DomainIcon from '@mui/icons-material/Domain';
// import LocalPostOfficeIcon from '@mui/icons-material/LocalPostOffice';

// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });

// const ProjectDetails = () => {
//   const navigate = useNavigate();


  
//   const { setMasterData, setMasterGetData, masterPostData,totalMasterCode } = useContext(Context);



//   const [showModal, setShowModal] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [confirmOpen, setConfirmOpen] = useState(false);

//   // Enhanced Address dialog state and validation
//   const [addressDialogOpen, setAddressDialogOpen] = useState(false);
//   const [addressFields, setAddressFields] = useState({
//     street: '',
//     mandal: '',
//     district: '',
//     pincode: '',
//     city: ''
//   });

//   const [formData, setFormData] = useState({
//     plantcode: '',
//     loc: '',
//     applyDate: '',
//     noOfTowers: '',
//     BuildArea: '',
//     TotalProjectArea: '',
//     ProjectName: '',
//     Address: '',
//     noOfFlats: '',
//     streetName: '',
//     district: '',
//     city: '',
//     mandal: '',
//     pincode: ''
//   });





//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };




//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = {};
//     if (!formData.loc) newErrors.loc = "Project location is required.";
//     if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
//     if (!formData.ProjectName) newErrors.ProjectName = "Project name is required.";
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }
//     setErrors({});
//     setConfirmOpen(true);
//   };

//   const handleConfirmSubmit = async () => {
//     setConfirmOpen(false);
//     setIsSubmitting(true);

//     const formPayload = new FormData();
//     formPayload.append('loc', formData.loc);
//     formPayload.append('applicationDate', formData.applyDate);
//     formPayload.append('address', formData.Address);
//     formPayload.append('noOfTowers', formData.noOfTowers);
//     formPayload.append('projectBuildArea', formData.BuildArea);
//     formPayload.append('totalProjectArea', formData.TotalProjectArea);
//     formPayload.append('projectname', formData.ProjectName);
//     formPayload.append('noOfFlats', formData.noOfFlats);
    
//     // Add individual address components
//     formPayload.append('streetName', formData.streetName);
//     formPayload.append('district', formData.district);
//     formPayload.append('city', formData.city);
//     formPayload.append('mandal', formData.mandal);
//     formPayload.append('pincode', formData.pincode);

//     try {
//       const data = await createMaster(formPayload);
//       setMasterData(data?.data);
      
//   const get = await getMasterByLoc(data?.data.loc);
//       setMasterGetData(get);
//       toast.success(data.message);
//       setFormData({
//         loc: '',
//         applyDate: '',
//         noOfTowers: '',
//         BuildArea: '',
//         TotalProjectArea: '',
//         ProjectName: '',
//         Address: '',
//         noOfFlats: '',
//         streetName: '',
//         district: '',
//         city: '',
//         mandal: '',
//         pincode: ''
//       });

    
//       navigate('/create');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleBackClick = () => {
//     navigate('/create');
//   };

//   return (
//     <div className="water-form-wrapper">
//       <form className="water-form-container" onSubmit={handleSubmit}>
//         {/* HEADER */}
//         <div className="form-header">
//           <div className="header-content">
//             <div className="title-section">
//               <div className="icon-wrapper">
//                 <BrickWallFire className="water-icon" size={32} />
//               </div>
//               <h1 className="form-title">Master Control Board Application</h1>
//               <p className="form-subtitle">
//                 Submit your Project Details management compliance application
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={handleBackClick}
//               className="back-button-modern"
//               title="Go back"
//             >
//               <ChevronLeft size={24} />
//             </button>
//           </div>
//         </div>

//         <div className="form-content">
//           {/* Project Information */}
//           <div className="form-section">
//             <div className="section-header">
//               <Home className="section-icon" size={20} />
//               <h3 style={{ color: '#0e7bdae7' }}>Project Information:</h3>
//             </div>

//             <div className="form-grid two-columns">

//     <div className="input-wrapper">
//                   <select
//                     name="plantcode"
//                     value={formData.plantcode}
//                     onChange={handleChange}
//                     className="modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400"
//                   >
//                     <option value="">Select Code</option>
//                     {Array.isArray(totalMasterCode?.companyCodes) && totalMasterCode?.companyCodes.map((ele, index) => (
//                       <option key={index} value={ele}>
//                         {ele}
//                       </option>
//                     ))}
//                   </select>

//                   <div className="error-container">
//                     {errors.loc && <p className="error-text">{errors.loc}</p>}
//                   </div>
//                 </div>


//               <div className="form-field">
//                 <label className="field-label">
//                   <FaBuilding className="label-icon" /> Plant Name*
//                 </label>
//                 <div className="input-wrapper">
//                   <PlantSelect
//                     value={formData.loc}
//                     onChange={handleChange}
//                     className="highlight-input"
//                   />
//                   <div className="error-container">
//                     {errors.loc && <p className="error-text">{errors.loc}</p>}
//                   </div>
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label className="field-label">
//                   <Store className="label-icon" size={20} />Project Name*
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     name="ProjectName"
//                     value={formData.ProjectName}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter Project Name"
//                     min="1"
//                   />
//                   <div className="error-container">
//                     {errors.ProjectName && <p className="error-text">{errors.ProjectName}</p>}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Application Details */}
//           <div className="form-section">
//             <div className="section-header">
//               <FileText className="section-icon" size={20} />
//               <h3 style={{ color: '#0e7bdae7' }}>Application Details:</h3>
//             </div>

//             <div className="form-grid two-columns">
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaCalendarAlt className="label-icon" /> Creation Date*
//                 </label>
//                 <div className="input-wrapper">
//                   <ApplyDateInput
//                     value={formData.applyDate}
//                     onChange={handleChange}
//                     className="modern-input"
//                   />
//                   <div className="error-container">
//                     {errors.applyDate && <p className="error-text">{errors.applyDate}</p>}
//                   </div>
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label className="field-label">
//                   <FaMoneyBill className="label-icon" /> Total Project Area (In Acres)*
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="number"
//                     name="TotalProjectArea"
//                     value={formData.TotalProjectArea}
//                     onChange={handleChange}
//                     className="highlight-input"
//                     placeholder="Enter Total Project Area"
//                     step="0.01"
//                     min="0"
//                   />
//                   <div className="error-container">
//                     {errors.TotalProjectArea && <p className="error-text">{errors.TotalProjectArea}</p>}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Documents */}
//           <div className="form-section">
//             <div className="section-header">
//               <FaUpload className="section-icon" size={20} />
//               <h3 style={{ color: '#0e7bdae7' }}>Project Details:</h3>
//             </div>

//             <div className="form-grid two-columns">
//               <div className="form-field">
//                 <label className="field-label">
//                   <Calculator className="label-icon" size={20} /> Project BuildUp Area
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="number"
//                     name="BuildArea"
//                     value={formData.BuildArea}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter the Build Area"
//                   />
//                 </div>
//               </div>

//                   <div className="form-field">
//                 <label className="field-label">
//                   <Calculator className="label-icon" size={20} /> Number of Towers
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="number"
//                     name="noOfTowers"
//                     value={formData.noOfTowers}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter the number of towers"
//                     min="0"
//                   />
//                   <div className="error-container">
//                     {errors.noOfTowers && <p className="error-text">{errors.noOfTowers}</p>}
//                   </div>
//                 </div>
//               </div>

         
//             </div>
//           </div>

//           {/* Project Requirement */}
//           <div className="form-section">
//             <div className="section-header">
//               <FileCheck className="section-icon" size={20} />
//               <h3 style={{ color: '#0e7bdae7' }}>Project Requirement:</h3>
//             </div>

//             <div className="form-grid two-columns">
          
//      <div className="form-field">
//                 <label className="field-label">
//                   <FaMoneyBill className="label-icon" />Number of Flats
//                 </label>
//                 <div className="input-wrapper">
//                   <input
//                     type="number"
//                     name="noOfFlats"
//                     value={formData.noOfFlats}
//                     onChange={handleChange}
//                     className="modern-input"
//                     placeholder="Enter total number of flats"
//                     min="1"
//                   />
//                   <div className="error-container">
//                     {errors.noOfFlats && <p className="error-text">{errors.noOfFlats}</p>}
//                   </div>
//                 </div>
//               </div>
//               <div className="form-field">
//                 <label className="field-label">
//                   <MessageSquareMore className="label-icon" size={20} /> Address
//                 </label>
//                 <div className="input-wrapper" style={{ display: 'flex', paddingTop: '5px' }}>
//                   <Button
//                     variant="outlined"
//                     onClick={() => setAddressDialogOpen(true)}
//                     style={{ whiteSpace: 'nowrap' }}
//                   >
//                     Add Address
//                   </Button>
//                 </div>
//                 <div className="error-container">
//                   {errors.Address && <p className="error-text">{errors.Address}</p>}
//                 </div>
//                 <div style={{ marginTop: 8, fontStyle: 'italic', color: '#444' }}>
//                   {formData.Address || 'No address added yet'}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="form-actions">
//             <button
//               type="submit"
//               className={`submit-button ${isSubmitting ? "submitting" : ""}`}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <>
//                   <div className="spinner"></div>
//                   Submitting...
//                 </>
//               ) : (
//                 <>
//                   <FaWater className="submit-icon" /> Submit
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </form>

//       {/* Enhanced Address Dialog */}
//       <Dialog
//         open={addressDialogOpen}
//         onClose={() => setAddressDialogOpen(false)}
//         maxWidth="sm"
//         fullWidth
//         TransitionComponent={Transition}
//         keepMounted
//         PaperProps={{ sx: { borderRadius: 3, padding: 2 } }}
//       >
//         <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>Enter Address</DialogTitle>
//         <DialogContent dividers>
//           <TextField
//             label="Street Name"
//             placeholder="Enter street or road name"
//             value={addressFields.street}
//             onChange={e => setAddressFields(prev => ({ ...prev, street: e.target.value }))}
//             fullWidth
//             margin="normal"
//             required
//             InputProps={{
//               startAdornment: (<InputAdornment position="start"><LocationOnIcon color="primary" /></InputAdornment>)
//             }}
//           />
          
//           <div style={{ display: 'flex', gap: '16px', marginTop: 8 }}>
//             <TextField
//               label="District"
//               placeholder="Enter district name"
//               value={addressFields.district}
//               onChange={e => setAddressFields(prev => ({ ...prev, district: e.target.value }))}
//               required
//               InputProps={{
//                 startAdornment: (<InputAdornment position="start"><DomainIcon color="primary" /></InputAdornment>)
//               }}
//               style={{ flex: 1 }}
//               margin="normal"
//             />
//             <TextField
//               label="City"
//               placeholder="Enter city name"
//               value={addressFields.city}
//               onChange={e => setAddressFields(prev => ({ ...prev, city: e.target.value }))}
//               required
//               InputProps={{
//                 startAdornment: (<InputAdornment position="start"><DomainIcon color="primary" /></InputAdornment>)
//               }}
//               style={{ flex: 1 }}
//               margin="normal"
//             />
//           </div>
          
//           <TextField
//             label="Mandal"
//             placeholder="Enter mandal name"
//             value={addressFields.mandal}
//             onChange={e => setAddressFields(prev => ({ ...prev, mandal: e.target.value }))}
//             fullWidth
//             margin="normal"
//             required
//             InputProps={{
//               startAdornment: (<InputAdornment position="start"><MapIcon color="primary" /></InputAdornment>)
//             }}
//           />
          
//           <TextField
//             label="Pincode"
//             placeholder="Enter 6-digit pincode"
//             value={addressFields.pincode}
//             onChange={e => {
//               const value = e.target.value.replace(/\D/g, '').slice(0, 6);
//               setAddressFields(prev => ({ ...prev, pincode: value }));
//             }}
//             fullWidth
//             margin="normal"
//             required
//             error={addressFields.pincode.length > 0 && addressFields.pincode.length !== 6}
//             helperText={addressFields.pincode.length > 0 && addressFields.pincode.length !== 6 ? "Pincode must be 6 digits" : ""}
//             InputProps={{
//               startAdornment: (<InputAdornment position="start"><LocalPostOfficeIcon color="primary" /></InputAdornment>)
//             }}
//           />
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={() => setAddressDialogOpen(false)} color="inherit">Cancel</Button>
//           <Button
//             variant="contained"
//             disabled={
//               !addressFields.street.trim() ||
//               !addressFields.mandal.trim() ||
//               !addressFields.district.trim() ||
//               !addressFields.city.trim() ||
//               addressFields.pincode.length !== 6
//             }
//             onClick={() => {
//               const combined = `${addressFields.street}, ${addressFields.mandal}, ${addressFields.district}, ${addressFields.city}, ${addressFields.pincode}`;
//               setFormData(prev => ({ 
//                 ...prev, 
//                 Address: combined,
//                 streetName: addressFields.street,
//                 mandal: addressFields.mandal,
//                 district: addressFields.district,
//                 city: addressFields.city,
//                 pincode: addressFields.pincode
//               }));
//               setAddressDialogOpen(false);
//             }}
//           >
//             Save Address
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <ReusableDialog
//         open={confirmOpen}
//         title="Confirm Submission"
//         message="Are you sure you want to submit this application? You will be redirected to the create page after successful submission."
//         onClose={() => setConfirmOpen(false)}
//         onConfirm={handleConfirmSubmit}
//         confirmText="Submit"
//         cancelText="Cancel"
//         isLoading={isSubmitting}
//       />

//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//     </div>
//   );
// };

// export default ProjectDetails;


import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config/Config';
import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ New handler specifically for plant code selection
  const handlePlantCodeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      plantcode: value,
      loc: '' // Reset plant selection when code changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.plantcode) newErrors.plantcode = "Plant code is required.";
    if (!formData.loc) newErrors.loc = "Project location is required.";
    if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
    if (!formData.ProjectName) newErrors.ProjectName = "Project name is required.";
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
      toast.success(data.message);
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
                  <FaBuilding className="label-icon" /> Plant Code*
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
                  <div className="error-container">
                    {errors.plantcode && <p className="error-text">{errors.plantcode}</p>}
                  </div>
                </div>
              </div>

              {/* ✅ Plant Select - Pass selectedPlantCode */}
              <div className="form-field">
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Plant Name*
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
                  <Calculator className="label-icon" size={20} /> Project BuildUp Area
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
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <Calculator className="label-icon" size={20} /> Number of Towers
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
                  <FaMoneyBill className="label-icon" />Number of Flats
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
                  <MessageSquareMore className="label-icon" size={20} /> Address
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