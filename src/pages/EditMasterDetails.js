// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { API_BASE_URL } from '../config/Config';
// import { FaLeaf, FaWater, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt, FaPlus } from 'react-icons/fa';
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
// import Swal from "sweetalert2";

// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });

// const EditMasterDetails = () => {
//   const navigate = useNavigate();
//   const { setMasterData, setMasterGetData, masterPostData, totalMasterCode, totalMasterData = [] } = useContext(Context);

//   const [showModal, setShowModal] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [filteredPlants, setFilteredPlants] = useState([]);
//   const [isEditing, setIsEditing] = useState(false); // Track if editing existing record

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

//   // Fetch plants when component mounts
//   useEffect(() => {
//     if (totalMasterData && totalMasterData.length > 0) {
//       setFilteredPlants(totalMasterData);
//     }
//   }, [totalMasterData]);

//   // Filter plants when company code changes
//   useEffect(() => {
//     if (formData.plantcode && totalMasterData && totalMasterData.length > 0) {
//       const filtered = totalMasterData.filter(plant => 
//         plant.PLANT_CODE === formData.plantcode
//       );
//       setFilteredPlants(filtered);
      
//       // Reset form when company code changes (except plantcode)
//       setFormData(prev => ({
//         ...prev,
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
//       }));
//       setIsEditing(false); // Reset editing state
//     } else {
//       setFilteredPlants(totalMasterData || []);
//     }
//   }, [formData.plantcode, totalMasterData]);

//   const handleChange = async (e) => {
//     const { name, value } = e.target;
//     console.log(name, "name", value);

//     // If plant is being selected, fetch its data
//     if (name === "loc" && value) {
//       await fetchDataForLoc(value);
//     }
    
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const fetchDataForLoc = async (loc) => {
//     try {
//       console.log("Fetching data for location:", loc);
      
//       // Use the getMasterByLoc function from your API
//       const res = await getMasterByLoc(loc);
      
//       console.log("API Response:", res);
      
//       if (res && Object.keys(res).length > 0) {
//         // Parse the address string if it exists
//         const address = res.ADDRESS || '';
//         let streetName = '';
//         let mandal = '';
//         let district = '';
//         let city = '';
//         let pincode = '';
        
//         if (address) {
//           const parts = address.split(',');
//           if (parts.length >= 5) {
//             streetName = parts[0]?.trim() || '';
//             mandal = parts[1]?.trim() || '';
//             district = parts[2]?.trim() || '';
//             city = parts[3]?.trim() || '';
//             pincode = parts[4]?.trim() || '';
//           } else {
//             // If address is not in the expected format, use individual fields
//             streetName = res.STREET_NAME || '';
//             mandal = res.MANDAL || '';
//             district = res.DISTRICT || '';
//             city = res.CITY || '';
//             pincode = res.PIN_CODE || '';
//           }
//         }
        
//         // Also populate address fields for dialog
//         setAddressFields({
//           street: streetName,
//           mandal: mandal,
//           district: district,
//           city: city,
//           pincode: pincode
//         });

//         // Set form data with fetched values - use the actual response field names
//         setFormData(prev => ({
//           ...prev,
//           plantcode: res.PLANT_CODE || '',
//           loc: res.LOC || '',
//           applyDate: res.APPLICATION_DATE || '',
//           noOfTowers: res.NUMBER_OF_TOWERS || '',
//           BuildArea: res.PROJECT_BUILD_AREA || '',
//           TotalProjectArea: res.TOTAL_PROJECT_AREA || '',
//           ProjectName: res.PROJECT_NAME || '',
//           Address: res.ADDRESS || '',
//           noOfFlats: res.NUMBER_OF_FLATS || '',
//           streetName: streetName,
//           district: district,
//           city: city,
//           mandal: mandal,
//           pincode: pincode
//         }));
        
//         setIsEditing(true); // We're editing an existing record
        
//         toast.success(`Loaded data for ${res.PROJECT_NAME || loc}`);
//       } else {
//         // If no data found, reset form for this location
//         resetFormForLocation();
//         setIsEditing(false);
//         toast.info(`No existing data found for ${loc}. You can create new record.`);
//       }
//     } catch (error) {
//       console.error("Error fetching plant data:", error);
//       toast.error("Failed to fetch plant details");
//       resetFormForLocation();
//       setIsEditing(false);
//     }
//   };

//   const resetFormForLocation = () => {
//     setFormData(prev => ({
//       ...prev,
//       applyDate: '',
//       noOfTowers: '',
//       BuildArea: '',
//       TotalProjectArea: '',
//       ProjectName: '',
//       Address: '',
//       noOfFlats: '',
//       streetName: '',
//       district: '',
//       city: '',
//       mandal: '',
//       pincode: ''
//     }));
//     setAddressFields({
//       street: '',
//       mandal: '',
//       district: '',
//       city: '',
//       pincode: ''
//     });
//   };

//   const handlePlantCodeChange = (e) => {
//     const { value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       plantcode: value,
//       loc: '' // Reset plant selection when code changes
//     }));
//     setIsEditing(false); // Reset editing state
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = {};

//     if (!formData.loc) newErrors.loc = "Project location is required.";
//     if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
//     if (!formData.ProjectName) newErrors.ProjectName = "Project name is required.";
//     if (!formData.BuildArea) newErrors.BuildArea = "Project Build Area is required.";
//     if (!formData.Address) newErrors.Address = "Address is required.";
//     if (!formData.noOfFlats) newErrors.noOfFlats = "Number Of Flats required.";
//     if (!formData.noOfTowers) newErrors.noOfTowers = "Number Of Towers required.";
//     if (!formData.TotalProjectArea) newErrors.TotalProjectArea = "Total ProjectArea required.";

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
//     formPayload.append('plantcode', formData.plantcode);
//     formPayload.append('loc', formData.loc);
//     formPayload.append('applicationDate', formData.applyDate);
//     formPayload.append('address', formData.Address);
//     formPayload.append('noOfTowers', formData.noOfTowers);
//     formPayload.append('projectBuildArea', formData.BuildArea);
//     formPayload.append('totalProjectArea', formData.TotalProjectArea);
//     formPayload.append('projectname', formData.ProjectName);
//     formPayload.append('noOfFlats', formData.noOfFlats);

//     formPayload.append('streetName', formData.streetName);
//     formPayload.append('district', formData.district);
//     formPayload.append('city', formData.city);
//     formPayload.append('mandal', formData.mandal);
//     formPayload.append('pincode', formData.pincode);

//     try {
//       let data;
      
//       // Use update endpoint if editing, create endpoint if new
//       if (isEditing) {
//         data = await axios.post(`${API_BASE_URL}/update-master`, formPayload, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       } else {
//         data = await createMaster(formPayload);
//       }

//       setMasterData(data?.data);

//       const get = await getMasterByLoc(data?.data?.loc);
//       setMasterGetData(get);

//       Swal.fire({
//         icon: "success",
//         title: isEditing ? "Record Updated Successfully!" : "Record Created Successfully!",
//         showConfirmButton: false,
//         timer: 2000,
//       }).then(() => {
//         navigate('/create');
//       });
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleBackClick = async () => {
//     navigate('/create');
//   };

//   // Function to open address dialog with current data
//   const openAddressDialog = () => {
//     setAddressDialogOpen(true);
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
//               <h1 className="form-title">Edit Master Control Board Application</h1>
//               <p className="form-subtitle">
//                 {isEditing ? "Edit existing plant details" : "Create new plant details"}
//               </p>
//               {isEditing && (
//                 <div className="edit-mode-indicator">
//                   <span style={{
//                     backgroundColor: '#e6f4ff',
//                     color: '#1890ff',
//                     padding: '4px 8px',
//                     borderRadius: '4px',
//                     fontSize: '12px',
//                     fontWeight: '500'
//                   }}>
//                     Editing Existing Record
//                   </span>
//                 </div>
//               )}
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
//               {/* Company Code Select */}
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaBuilding className="label-icon" /> Company Code*
//                 </label>
//                 <div className="input-wrapper">
//                   <select
//                     name="plantcode"
//                     value={formData.plantcode}
//                     onChange={handlePlantCodeChange}
//                     className="modern-input appearance-none cursor-pointer focus:ring-2 focus:ring-blue-400"
//                   >
//                     <option value="">Select Code</option>
//                     {Array.isArray(totalMasterCode?.companyCodes) && totalMasterCode?.companyCodes.map((ele, index) => (
//                       <option key={index} value={ele}>
//                         {ele}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Plant Select - Filtered by Company Code */}
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaBuilding className="label-icon" /> Plant Code/Name*
//                 </label>
//                 <div className="input-wrapper">
//                   <PlantSelect
//                     value={formData.loc}
//                     onChange={handleChange}
//                     selectedPlantCode={formData.plantcode}
//                     className="highlight-input"
//                     disabled={!formData.plantcode}
//                   />
//                   <div className="error-container">
//                     {errors.loc && <p className="error-text">{errors.loc}</p>}
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

//           {/* Project Details */}
//           <div className="form-section">
//             <div className="section-header">
//               <FaUpload className="section-icon" size={20} />
//               <h3 style={{ color: '#0e7bdae7' }}>Project Details:</h3>
//             </div>

//             <div className="form-grid three-columns">
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
//                   />
//                   <div className="error-container">
//                     {errors.ProjectName && <p className="error-text">{errors.ProjectName}</p>}
//                   </div>
//                 </div>
//               </div>
//               <div className="form-field">
//                 <label className="field-label">
//                   <Calculator className="label-icon" size={20} /> Project Built-Up Area*
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
//                   <div className="error-container">
//                     {errors.BuildArea && <p className="error-text">{errors.BuildArea}</p>}
//                   </div>
//                 </div>
//               </div>

//               <div className="form-field">
//                 <label className="field-label">
//                   <Calculator className="label-icon" size={20} /> Number of Towers*
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
//               <div className="form-field">
//                 <label className="field-label">
//                   <FaMoneyBill className="label-icon" />Number of Flats*
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
//                   <MessageSquareMore className="label-icon" size={20} /> Address*
//                 </label>
//                 <div className="input-wrapper" style={{ display: 'flex', paddingTop: '5px' }}>
//                   <Button
//                     variant="outlined"
//                     onClick={openAddressDialog}
//                     style={{ whiteSpace: 'nowrap' }}
//                   >
//                     {formData.Address ? 'Edit Address' : 'Add Address'}
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
//                   {isEditing ? "Updating..." : "Submitting..."}
//                 </>
//               ) : (
//                 <>
//                   <FaWater className="submit-icon" /> {isEditing ? "Update" : "Create"}
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </form>

//       {/* Enhanced Address Dialog - Pre-filled with existing data */}
//       <Dialog
//         open={addressDialogOpen}
//         onClose={() => setAddressDialogOpen(false)}
//         maxWidth="sm"
//         fullWidth
//         TransitionComponent={Transition}
//         keepMounted
//         PaperProps={{ sx: { borderRadius: 3, padding: 2 } }}
//       >
//         <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
//           {formData.Address ? "Edit Address" : "Add Address"}
//         </DialogTitle>
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
//         title={isEditing ? "Confirm Update" : "Confirm Creation"}
//         message={isEditing ? 
//           "Are you sure you want to update this master record?" : 
//           "Are you sure you want to create a new master record?"}
//         onClose={() => setConfirmOpen(false)}
//         onConfirm={handleConfirmSubmit}
//         confirmText={isEditing ? "Update" : "Create"}
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

// export default EditMasterDetails;



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

const EditMasterDetails = () => {
    const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const { setMasterData, setMasterGetData, masterPostData, totalMasterCode, totalMasterData = [] } = useContext(Context);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

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

  
    // --- 2. Check User Login ---
            useEffect(() => {
              if (!token) {
                navigate('/');
                return;
              }
              const userString = localStorage.getItem('user'); // Changed to 'user' to be safe
              if (userString) {
                try {
                  const userObj = JSON.parse(userString);
                  setLoggedInUser(userObj);
                } catch (error) {
                  console.error("Error parsing user data:", error);
                }
              }
              
            }, [token, navigate]);
  // Fetch dependent locations when company code changes
  useEffect(() => {
    const fetchDependentLocations = async () => {
      if (formData.plantcode) {
        setLoadingLocations(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/DependLoc/${formData.plantcode}`);
          console.log("Dependent Locations Response:", response.data);
          
          if (response.data.success && response.data.locations) {
            setFilteredLocations(response.data.locations);
          } else {
            setFilteredLocations([]);
            toast.info('No locations found for this company code');
          }
        } catch (error) {
          console.error('Error fetching dependent locations:', error);
          toast.error('Failed to fetch locations for selected company code');
          setFilteredLocations([]);
        } finally {
          setLoadingLocations(false);
        }
      } else {
        setFilteredLocations([]);
      }
    };

    fetchDependentLocations();
  }, [formData.plantcode]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    console.log("Field Changed:", name, "New Value:", value);

    // If location is being selected, fetch its data
    if (name === "loc" && value) {
      await fetchDataForLoc(value);
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchDataForLoc = async (loc) => {
    try {
      console.log("=== FETCHING DATA FOR LOC ===");
      console.log("Plant Code (LOC):", loc);
      
      const res = await getMasterByLoc(loc);
      
      console.log("API Response:", res);
      
      if (res && Object.keys(res).length > 0) {
        // Parse the address string if it exists
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
        
        setAddressFields({
          street: streetName,
          mandal: mandal,
          district: district,
          city: city,
          pincode: pincode
        });

        console.log("Setting form data with COMPANY_CODE:", res.COMPANY_CODE);

        setFormData(prev => ({
          ...prev,
          plantcode: res.COMPANY_CODE || '',  // Company Code from COMPANY_CODE column
          loc: res.LOC || '',                 // Plant Code from LOC column
          applyDate: res.APPLICATION_DATE || '',
          noOfTowers: res.NUMBER_OF_TOWERS || '',
          BuildArea: res.PROJECT_BUILD_AREA || '',
          TotalProjectArea: res.TOTAL_PROJECT_AREA || '',
          ProjectName: res.PROJECT_NAME || '',
          Address: res.ADDRESS || '',
          noOfFlats: res.NUMBER_OF_FLATS || '',
          streetName: streetName,
          district: district,
          city: city,
          mandal: mandal,
          pincode: pincode
        }));
        
        setIsEditing(true);
        toast.success(`Loaded data for ${res.PROJECT_NAME || loc}`);
      } else {
        resetFormForLocation();
        setIsEditing(false);
        toast.info(`No existing data found for ${loc}. You can create new record.`);
      }
    } catch (error) {
      console.error("Error fetching plant data:", error);
      toast.error("Failed to fetch plant details");
      resetFormForLocation();
      setIsEditing(false);
    }
  };

  const resetFormForLocation = () => {
    setFormData(prev => ({
      ...prev,
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
    }));
    setAddressFields({
      street: '',
      mandal: '',
      district: '',
      city: '',
      pincode: ''
    });
  };

  const handlePlantCodeChange = (e) => {
    const { value } = e.target;
    console.log("Company Code Changed to:", value);
    setFormData((prev) => ({
      ...prev,
      plantcode: value,
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
    }));
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.plantcode) newErrors.plantcode = "Company Code is required.";
    if (!formData.loc) newErrors.loc = "Plant Code is required.";
    if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
    if (!formData.ProjectName) newErrors.ProjectName = "Project name is required.";
    if (!formData.BuildArea) newErrors.BuildArea = "Project Build Area is required.";
    if (!formData.Address) newErrors.Address = "Address is required.";
    if (!formData.noOfFlats) newErrors.noOfFlats = "Number Of Flats required.";
    if (!formData.noOfTowers) newErrors.noOfTowers = "Number Of Towers required.";
    if (!formData.TotalProjectArea) newErrors.TotalProjectArea = "Total ProjectArea required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }
    setErrors({});
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setIsSubmitting(true);

    // Validate that we have both company code and plant code before submitting
    if (!formData.plantcode || !formData.loc) {
      toast.error('Company Code and Plant Code are required');
      setIsSubmitting(false);
      return;
    }

    // Field Mapping:
    // formData.plantcode = Company Code → COMPANY_CODE in DB (e.g., "2350")
    // formData.loc = Plant Code → LOC in DB (e.g., "235001")

    //  --- : 'fetch User';
    let currentUserName = loggedInUser.username;

    const formPayload = new FormData();
    formPayload.append('plantcode', formData.plantcode);       // Company Code → COMPANY_CODE
    formPayload.append('loc', formData.loc);                   // Plant Code → LOC
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

    console.log("=== FORM SUBMISSION START ===");
    console.log("Company Code (COMPANY_CODE):", formData.plantcode);
    console.log("Plant Code (LOC):", formData.loc);
    console.log("Is Editing:", isEditing);
    console.log("Project Name:", formData.ProjectName);

    try {
      let response;
      
      // Use update endpoint if editing, create endpoint if new
      if (isEditing) {
        console.log("📝 UPDATING RECORD");
        console.log("Update Payload:", {
          plantcode: formData.plantcode,
          loc: formData.loc,
          projectname: formData.ProjectName
        });
        
        response = await axios.post(`${API_BASE_URL}/update-master`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        console.log("✅ Update Response:", response.data);
        
        if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Record Updated Successfully!",
            html: `
              <p><strong>Company Code:</strong> ${formData.plantcode}</p>
              <p><strong>Plant Code:</strong> ${formData.loc}</p>
              <p><strong>Project Name:</strong> ${formData.ProjectName}</p>
            `,
            showConfirmButton: true,
            confirmButtonText: "OK"
          }).then(() => {
            navigate('/create');
          });
        }
        
      } else {
        console.log("➕ CREATING NEW RECORD");
        response = await createMaster(formPayload);
        console.log("✅ Create Response:", response.data);
        
        Swal.fire({
          icon: "success",
          title: "Record Created Successfully!",
          html: `
            <p><strong>Company Code:</strong> ${formData.plantcode}</p>
            <p><strong>Plant Code:</strong> ${formData.loc}</p>
            <p><strong>Project Name:</strong> ${formData.ProjectName}</p>
          `,
          showConfirmButton: true,
          confirmButtonText: "OK"
        }).then(() => {
          navigate('/create');
        });
      }

    } catch (err) {
      console.error("❌ Submission Error:", err);
      console.error("❌ Error Response:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Submission failed. Please try again.';
      
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: errorMessage,
        showConfirmButton: true
      });
      
      toast.error(errorMessage);
    } finally {
      console.log("=== FORM SUBMISSION END ===");
      setIsSubmitting(false);
    }
  };

  const handleBackClick = async () => {
    navigate('/create');
  };

  const openAddressDialog = () => {
    setAddressDialogOpen(true);
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
              <h1 className="form-title">Edit Master Control Board Application</h1>
              <p className="form-subtitle">
                {isEditing ? "Edit existing plant details" : "Create new plant details"}
              </p>
              {isEditing && (
                <div className="edit-mode-indicator">
                  <span style={{
                    backgroundColor: '#e6f4ff',
                    color: '#1890ff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    ✏️ Editing Existing Record
                  </span>
                </div>
              )}
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
              {/* Company Code Select */}
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
                    <option value="">Select Company Code</option>
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

              {/* Plant Code Select */}
              <div className="form-field">
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Plant Code/Name*
                </label>
                <div className="input-wrapper">
                  {loadingLocations ? (
                    <div style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                      Loading locations...
                    </div>
                  ) : (
                    <select
                      name="loc"
                      value={formData.loc}
                      onChange={handleChange}
                      disabled={!formData.plantcode || loadingLocations}
                      className="modern-input"
                    >
                      <option value="">Select Plant Code</option>
                      {filteredLocations.map((location, index) => (
                        <option key={index} value={location.LOC}>
                          {location.LOC}
                        </option>
                      ))}
                    </select>
                  )}
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

          {/* Project Details */}
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
                    onClick={openAddressDialog}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {formData.Address ? 'Edit Address' : 'Add Address'}
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
                  {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>
                  <FaWater className="submit-icon" /> {isEditing ? "Update" : "Create"}
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
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          {formData.Address ? "Edit Address" : "Add Address"}
        </DialogTitle>
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
        title={isEditing ? "Confirm Update" : "Confirm Creation"}
        message={isEditing ? 
          "Are you sure you want to update this master record?" : 
          "Are you sure you want to create a new master record?"}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText={isEditing ? "Update" : "Create"}
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

export default EditMasterDetails;