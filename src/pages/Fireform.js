import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import {
  FaLeaf,
  FaFire,
  FaBuilding,
  FaCalendarAlt,
  FaUpload,
  FaMoneyBill,
  FaWater,
} from "react-icons/fa";
import {
  ChevronLeft,
  FileText,
 Home,
  Flame,
  MessageSquareMore,
  Store,
  FileCheck,
  Edit,
  Eye,
  Lock,
  Trash2
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import ProcessField from "../components/ProcessField";
import ReusableDialog from "../components/ReusableDialog";
import ProjectInfoHeader from "../components/ProjectInfoHeader";
import "../pages/Fire.css";
import { getMasterByLoc, submitFireForm } from "../api/Api";
import { Context } from "../context/ContextData";
import ReraDocUploadModal from "../components/ReraDocUploadModal";
import FlatsPerTowerModal from "../components/FlatsPerTowerModal";
import Swal from "sweetalert2";

const FireForm = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const {
    totalMasterData,
    setHeaderData,
    headerData,
  } = useContext(Context);

  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [acknowledgeDocs, setAcknowledgeDocs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [towerFlats, setTowerFlats] = useState({});
  const [showFlatsModal, setShowFlatsModal] = useState(false);
  const [towerFlatsSubmitted, setTowerFlatsSubmitted] = useState(false);
  const [newDocs, setNewDocs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // ✅ STATE: Track if plant exists and existing data
  const [plantExists, setPlantExists] = useState(false);
  const [existingPlantId, setExistingPlantId] = useState(null);
  const [existingPlantData, setExistingPlantData] = useState(null);
  const [dataExists, setDataExists] = useState(false);
// Add these with other useState declarations
const [emailData, setEmailData] = useState([]);
const [userHasEditPermission, setUserHasEditPermission] = useState(false);
const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  // ✅ STATE FOR EXISTING UPLOADED FILES
  const [existingAppFiles, setExistingAppFiles] = useState([]);
  const [existingAckFiles, setExistingAckFiles] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  // Add these states after your other states
const [documentViewModal, setDocumentViewModal] = useState(false);
const [currentViewFiles, setCurrentViewFiles] = useState([]);
const [currentViewType, setCurrentViewType] = useState(""); // "app" or "ack"
  // ✅ Ref to track initial load
  const hasLoadedInitialData = useRef(false);
  // ✅ NEW: Update status state
  const [isUpdated, setIsUpdated] = useState(false); // TRUE if UPDATED = 'YES'
  const [canEdit, setCanEdit] = useState(false); // TRUE if UPDATED !== 'YES'
  const [formData, setFormData] = useState({
    loc: "",
    process: "",
    applyDate: "",
    noOfFlats: "",
    Comments: "",
    noOfTowers: "",
    BuildArea: "",
    ProjectArea: "",
    TotalArea: "",
    ProjectName: "",
    feePaid: "",
    feeAmount: "",
    acknowledgeName: "",
  });

  // --- 2. Check User Login ---
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const userString = localStorage.getItem("user");
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
  // Fetch default process
  useEffect(() => {
    const fetchFireProcess = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/fire-process`);
        console.log("Fire Process Data:", response.data);

        if (response.data && response.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            process: response.data[0].PROCESS,
          }));
        }
      } catch (error) {
        console.error("Error fetching fire process:", error);
        toast.error("Failed to load process data");
      }
    };

    fetchFireProcess();
  }, [API_BASE_URL]);
  // ✅ NEW: Check PCB update status using the new API
  const checkPcbUpdateStatus = async (plant) => {
    try {
      console.log("🔍 Checking PCB update status for plant:", plant);

      const res = await axios.get(`${API_BASE_URL}/checkPcbByPlantfire`, {
        params: { plant: plant }
      });

      console.log("📊 PCB Status Response:", res.data);

      if (res.data.status && res.data.data && res.data.data.length > 0) {
        // Data exists and UPDATED is NOT 'YES' (or NULL)
        setCanEdit(true);
        setIsUpdated(false);
        console.log("✅ Can edit: UPDATED !== 'YES'");
        return true;
      } else {
        // Either no data or UPDATED = 'YES'
        setCanEdit(false);
        setIsUpdated(true);
        console.log("🔒 Cannot edit: UPDATED = 'YES' or no data");
        return false;
      }
    } catch (error) {
      console.error("❌ Error checking PCB status:", error);
      setCanEdit(false);
      setIsUpdated(false);
      return false;
    }
  };
  // ✅ DEBUG: Monitor state changes
  // useEffect(() => {
  //   console.log("🔄 STATE UPDATE:");
  //   console.log("  - plantExists:", plantExists);
  //   console.log("  - dataExists:", dataExists);
  //   console.log("  - formData.feePaid:", formData.feePaid);
  //   console.log("  - existingAppFiles:", existingAppFiles.length);
  //   console.log("  - existingAckFiles:", existingAckFiles.length);
  // }, [plantExists, dataExists, formData.feePaid, existingAppFiles, existingAckFiles]);
  // ✅ MODIFIED: Check if plant exists and store the ID
  const checkIfPlantExists = async (plant) => {
    try {
     const res = await axios.post(`${API_BASE_URL}/check-plant-exists-fire`, {
        loc: plant,
      });
      console.log("API Response:", res.data);

      if (res.data && res.data.exists === true) {
        setPlantExists(true);
        setExistingPlantId(res.data.id || plant);
        setExistingPlantData(res.data.data);

        // ✅ ADD THIS: Also check update status
        await checkPcbUpdateStatus(plant);

        return true;
      } else {
        setPlantExists(false);
        setExistingPlantId(null);
        setExistingPlantData(null);
        setCanEdit(false); // ✅ ADD THIS
      }
      return false;
    } catch (error) {
      console.error("Failed to check plant:", error);
      setPlantExists(false);
      setExistingPlantId(null);
      setExistingPlantData(null);
      setCanEdit(false); // ✅ ADD THIS
      return false;
    }
  };



  // View documents function
const viewDocuments = (files, type) => {
  setCurrentViewFiles(files);
  setCurrentViewType(type);
 setDocumentViewModal(true);
};

// Delete document function
const handleDeleteDocument = async (file, index) => {
  if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
    return;
  }

  try {
    // Determine document type for backend
    const docType = currentViewType === "app" ? "UPLOAD_DOC" : "ACK_DOC";
    
    const response = await axios.delete(`${API_BASE_URL}/docmt-fire-dlt`, {
      data: {
      loc: formData.loc,
    process: formData.process,
     steptype: "ProvisionalNOC",
      doc_type: docType,
  file_name: file.name
      },
    });

    if (response.status === 200) {
      // Remove file from current view
      const updatedFiles = currentViewFiles.filter((_, i) => i !== index);
      setCurrentViewFiles(updatedFiles);
      
      // Remove file from the appropriate state
      if (currentViewType === "app") {
        const updatedAppFiles = existingAppFiles.filter(f => f.path !== file.path);
        setExistingAppFiles(updatedAppFiles);
      } else {
        const updatedAckFiles = existingAckFiles.filter(f => f.path !== file.path);
        setExistingAckFiles(updatedAckFiles);
      }
      
      toast.success(`File "${file.name}" deleted successfully`);
      
      // If no files left, close modal
      if (updatedFiles.length === 0) {
        setDocumentViewModal(false);
      }
    } else {
      toast.error('Failed to delete file');
    }
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('Failed to delete file. Please try again.');
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

  // ✅ Fetch existing data when plant or process changes
  useEffect(() => {
    if (!formData.loc || !formData.process || formData.loc === "" || formData.process === "") {
      console.log("⚠️ Waiting for plant and process...");
      return;
    }

    console.log("🔍 Fetching data for Plant:", formData.loc, "Process:", formData.process);

    const fetchExistingData = async () => {
      try {
        // ✅ ADD THIS LINE - First check if can edit
        await checkPcbUpdateStatus(formData.loc);

        const res = await axios.get(`${API_BASE_URL}/getProcessDatafire`, {
          params: {
            plant: formData.loc,
            process: formData.process,
          },
        });

        const data = Array.isArray(res?.data) ? res.data[0] : res?.data;

        // ✅ DEBUG CODE
        console.log("📊 RAW API DATA:", {
          hasData: !!(data && Object.keys(data).length > 0),
          UPLOAD_DOC: data?.UPLOAD_DOC,
          ACK_DOC: data?.ACK_DOC,
          typeof_UPLOAD_DOC: typeof data?.UPLOAD_DOC,
          typeof_ACK_DOC: typeof data?.ACK_DOC,
          isArray_UPLOAD_DOC: Array.isArray(data?.UPLOAD_DOC),
          isArray_ACK_DOC: Array.isArray(data?.ACK_DOC),
          allDataKeys: Object.keys(data || {}),
        });

        if (data && (data.LOC || data.APPLY_DT || data.COMMENTS || data.ACKNOWLEDGE_NAME || data.NO_OF_TOWERS)) {
          console.log("✅ Valid data found!");

          // ✅ DECLARE VARIABLES AT THE TOP
          let parsedAppFiles = [];
          let parsedAckFiles = [];

          // ✅ PARSE APPLICATION DOCUMENTS - DON'T REDECLARE!
          try {
        

            if (data.UPLOAD_DOC && data.UPLOAD_DOC !== 'null' && data.UPLOAD_DOC !== 'undefined') {
              const docStr = String(data.UPLOAD_DOC).trim();

              try {
                const docArray = JSON.parse(docStr);
                console.log("✅ Parsed JSON array:", docArray);

                if (Array.isArray(docArray)) {
                  // ✅ DON'T USE 'let' HERE - just assign to existing variable
                  parsedAppFiles = docArray.map((item, index) => {
                    const cleanPath = (item.stored_path || '').replace(/\\/g, '/');

                    return {
                      path: cleanPath,
                      name: item.file_name || `Application_Document_${index + 1}.pdf`,
                      isExisting: true,
                      url: `${API_DOC_URL}/storage/${cleanPath}`
                    };
                  });
                }
              } catch (parseErr) {
                console.error("⚠️ JSON parse failed:", parseErr);
              }
            }

            console.log("✅ Final parsed APPLICATION files:", parsedAppFiles);

          } catch (err) {
            console.error("❌ Error parsing application documents:", err);
          }

          // ✅ PARSE ACKNOWLEDGEMENT DOCUMENTS - DON'T REDECLARE!
          try {
            console.log("🔍 PARSING ACKNOWLEDGEMENT DOCUMENTS");
            console.log("RAW ACK_DOC:", data.ACK_DOC);

            if (data.ACK_DOC && data.ACK_DOC !== 'null' && data.ACK_DOC !== 'undefined') {
              const docStr = String(data.ACK_DOC).trim();

              try {
                const docArray = JSON.parse(docStr);
                console.log("✅ Parsed JSON array:", docArray);

                if (Array.isArray(docArray)) {
                  // ✅ DON'T USE 'let' HERE - just assign to existing variable
                  parsedAckFiles = docArray.map((item, index) => {
                    const cleanPath = (item.stored_path || '').replace(/\\/g, '/');

                    return {
                      path: cleanPath,
                      name: item.file_name || `Acknowledgement_${index + 1}.pdf`,
                      isExisting: true,
                      url: `${API_DOC_URL}/storage/${cleanPath}`
                    };
                  });
                }
              } catch (parseErr) {
                console.error("⚠️ JSON parse failed:", parseErr);
              }
            }

            console.log("✅ Final parsed ACKNOWLEDGEMENT files:", parsedAckFiles);

          } catch (err) {
            console.error("❌ Error parsing acknowledgement documents:", err);
          }

          // Parse towerFlats if exists
          let parsedTowerFlats = {};
          if (data.TOWER_FLATS) {
            try {
              parsedTowerFlats = JSON.parse(data.TOWER_FLATS);
            } catch (parseErr) {
              console.error("Error parsing TOWER_FLATS:", parseErr);
            }
          }

          // Set form data
          const updatedFormData = {
            loc: formData.loc,
            process: formData.process,
            applyDate: (data.APPLY_DT && data.APPLY_DT !== "nil") ? data.APPLY_DT : "",
            Comments: (data.COMMENTS && data.COMMENTS !== "nil") ? data.COMMENTS : "",
            acknowledgeName: (data.ACKNOWLEDGE_NAME && data.ACKNOWLEDGE_NAME !== "nil") ? data.ACKNOWLEDGE_NAME : "",
            noOfTowers: (data.NO_OF_TOWERS && data.NO_OF_TOWERS !== "nil") ? data.NO_OF_TOWERS.toString() : "",
            feePaid: (data.FEE_PAID_STATUS && data.FEE_PAID_STATUS !== "nil") ? data.FEE_PAID_STATUS : (data.FEE_PAID && data.FEE_PAID !== "nil") ? data.FEE_PAID : "",
            feeAmount: (data.FEE_AMOUNT && data.FEE_AMOUNT !== "nil") ? data.FEE_AMOUNT.toString() : "",
            BuildArea: (data.BUILD_AREA && data.BUILD_AREA !== "nil") ? data.BUILD_AREA.toString() : "",
            ProjectArea: (data.PROJECT_AREA && data.PROJECT_AREA !== "nil") ? data.PROJECT_AREA.toString() : "",
            TotalArea: (data.TOTAL_AREA && data.TOTAL_AREA !== "nil") ? data.TOTAL_AREA.toString() : "",
            ProjectName: (data.PROJECT_NAME && data.PROJECT_NAME !== "nil") ? data.PROJECT_NAME : "",
            noOfFlats: (data.NO_OF_FLATS && data.NO_OF_FLATS !== "nil") ? data.NO_OF_FLATS.toString() : "",
          };

          console.log("📝 Setting form data:", updatedFormData);
          console.log("📁 Setting app files:", parsedAppFiles.length);
          console.log("📁 Setting ack files:", parsedAckFiles.length);

          // ✅ SET ALL STATES TOGETHER
          setTimeout(() => {
            setExistingAppFiles(parsedAppFiles);
            setExistingAckFiles(parsedAckFiles);
            setTowerFlats(parsedTowerFlats);
            setTowerFlatsSubmitted(Object.keys(parsedTowerFlats).length > 0);
            setDataExists(true);
            setPlantExists(true);
            setExistingPlantData(data);
            setFormData(updatedFormData);

            console.log("✅ ALL STATES SET!");
            console.log("✅ existingAppFiles:", parsedAppFiles);
            console.log("✅ existingAckFiles:", parsedAckFiles);
          }, 0);

          toast.info(`Data already exists for ${formData.loc}.`, {
            autoClose: 3000
          });

        } else {
          // No data found - clear everything
          console.log("ℹ️ No existing data found");
          setDataExists(false);
          setPlantExists(false);
          setExistingPlantData(null);
          setExistingAppFiles([]);
          setExistingAckFiles([]);
          setTowerFlats({});
          setTowerFlatsSubmitted(false);

          setFormData(prev => ({
            ...prev,
            applyDate: "",
            Comments: "",
            acknowledgeName: "",
            noOfTowers: "",
            feePaid: "",
            feeAmount: "",
            BuildArea: "",
            ProjectArea: "",
            TotalArea: "",
            ProjectName: "",
           noOfFlats: "",
          }));
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        // Clear everything on error
        setDataExists(false);
        setPlantExists(false);
        setExistingPlantData(null);
        setExistingAppFiles([]);
        setExistingAckFiles([]);
        setTowerFlats({});
        setTowerFlatsSubmitted(false);

        setFormData(prev => ({
          ...prev,
          applyDate: "",
          Comments: "",
          acknowledgeName: "",
          noOfTowers: "",
          feePaid: "",
          feeAmount: "",
          BuildArea: "",
          ProjectArea: "",
          TotalArea: "",
          ProjectName: "",
          noOfFlats: "",
        }));
      }
    };

    const timeoutId = setTimeout(() => {
      fetchExistingData();
    }, 100);

    return () => clearTimeout(timeoutId);

  }, [formData.loc, formData.process]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    console.log(`🔄 Field Changed: ${name} = ${value}`);

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Handle location change separately
    if (name === "loc") {
      setFormData((prev) => ({
        ...prev,
        loc: value,
        applyDate: "", // Reset date when location changes
      }));

      if (!value || value.trim() === "") {
        setHeaderData({});
        setPlantExists(false);
        setExistingPlantId(null);
        setExistingPlantData(null);
        setExistingAppFiles([]);
        setExistingAckFiles([]);
        setTowerFlats({});
        setTowerFlatsSubmitted(false);

        setFormData(prev => ({
          ...prev,
          applyDate: "",
          Comments: "",
          acknowledgeName: "",
          noOfTowers: "",
          feePaid: "",
          feeAmount: "",
          BuildArea: "",
          ProjectArea: "",
          TotalArea: "",
          ProjectName: "",
          noOfFlats: "",
        }));
        return;
      }

      try {
        const plantExists = await checkIfPlantExists(value);
        const res = await getMasterByLoc(value);
        if (res && Object.keys(res).length > 0) {
          setHeaderData(res);
        } else {
          setHeaderData({});
        }
      } catch (err) {
        console.error("❌ Error:", err);
        setHeaderData({});
        setPlantExists(false);
        setExistingPlantData(null);
      }
      return;
    }

    // Handle all other fields (including applyDate)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNoOfTowersChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, noOfTowers: value }));

    setTowerFlatsSubmitted(false);
    setTowerFlats({});

    const selectedTowers = parseInt(value);
    if (selectedTowers > 0) {
      setShowFlatsModal(true);
    } else {
      setShowFlatsModal(false);
    }
  };

  const handleProcessChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      process: value,
    }));
  };

  const isFilePDF = (file) => {
    const fileExtension = file.name.toLowerCase().endsWith(".pdf");
    const fileMimeType = file.type === "application/pdf";
    return fileExtension && fileMimeType;
  };

  const validateAllFilesArePDF = (files) => {
    if (!files || files.length === 0) return true;

    for (const file of files) {
      if (!isFilePDF(file)) {
        return false;
      }
    }
    return true;
  };

  const handleSaveFlats = (flatsData) => {
    setTowerFlats(flatsData);
    setTowerFlatsSubmitted(true);
  };

  const handleFlatsModalClose = () => {
    setShowFlatsModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    setErrors({});

    // ✅ ALWAYS REQUIRED (for both new and update)
    if (!formData.loc) newErrors.loc = "Project location is required.";
    if (!formData.process) newErrors.process = "Process type is required.";

    // ✅ Conditionally required fields based on submission type
    const isUpdate = plantExists && dataExists && isEditMode;

    if (!isUpdate) {
      // ✅ For NEW SUBMISSION - All fields are mandatory
      if (!formData.applyDate) newErrors.applyDate = "Application Date is required.";
      if (!formData.feePaid) newErrors.feePaid = "Please specify if fee is paid.";
      if (!formData.noOfTowers) newErrors.noOfTowers = "Number of Towers is required.";
      if (!formData.Comments) newErrors.Comments = "Please enter the comments.";
      if (!formData.acknowledgeName) newErrors.acknowledgeName = "Acknowledge name is required.";

      if (formData.feePaid === "YES" && !formData.feeAmount) {
        newErrors.feeAmount = "Fee amount is required when fee is paid.";
      }
    } else {
      // ✅ For UPDATE - Only require what's being changed or minimal validation
      // Fee amount only required if feePaid is YES
      if (formData.feePaid === "YES" && !formData.feeAmount) {
        newErrors.feeAmount = "Fee amount is required when fee is paid.";
      }
      // For updates, Comments are optional (can be empty)
      // No mandatory validation for other fields during update
    }

    // ✅ File validation (different for new vs update)
    const totalAppFiles = [...existingAppFiles, ...newDocs];
    const totalAckFiles = [...existingAckFiles, ...acknowledgeDocs];

    if (!isUpdate) {
      // ✅ For NEW SUBMISSION - Files are mandatory
      if (totalAppFiles.length === 0) {
        newErrors.documents = "Please upload at least one application document.";
      }

      if (totalAckFiles.length === 0) {
        newErrors.acknowledgeDocs = "Please upload at least one acknowledgement receipt.";
      }
    } else {
      // ✅ For UPDATE - Files are NOT mandatory (existing files can remain)
      // Only validate if new files are uploaded
      if (newDocs.length > 0 && !validateAllFilesArePDF(newDocs)) {
        newErrors.documents = "All application documents must be PDF files only.";
      }

      if (acknowledgeDocs.length > 0 && !validateAllFilesArePDF(acknowledgeDocs)) {
        newErrors.acknowledgeDocs = "All acknowledgement receipts must be PDF files only.";
      }
    }

    // ✅ Validate PDF files (only new files)
    if (newDocs.length > 0 && !validateAllFilesArePDF(newDocs)) {
      newErrors.documents = "All application documents must be PDF files only.";
    }

    if (acknowledgeDocs.length > 0 && !validateAllFilesArePDF(acknowledgeDocs)) {
      newErrors.acknowledgeDocs = "All acknowledgement receipts must be PDF files only.";
    }

    // ✅ Tower flats validation (only for new submission or when noOfTowers is changed)
    const noOfTowers = parseInt(formData.noOfTowers);
    if (noOfTowers > 0) {
      // For new submission, require tower flats
      if (!isUpdate && !towerFlatsSubmitted) {
        newErrors.towerFlats = "Please enter flats per tower details.";
      } else if (towerFlatsSubmitted) {
        // Only validate if tower flats were submitted
        const towerKeys = Object.keys(towerFlats);
        if (towerKeys.length !== noOfTowers) {
          newErrors.towerFlats = "Please enter flats count for all towers.";
        } else {
          for (let i = 1; i <= noOfTowers; i++) {
            const key = `Tower ${i}`;
            const value = towerFlats[key];
            if (!value || value.toString().trim() === "") {
              newErrors.towerFlats = `Please enter flats count for ${key}.`;
              break;
            }
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < 0) {
              newErrors.towerFlats = `Please enter a valid number for ${key}.`;
              break;
            }
          }
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setConfirmOpen(false);

    // ✅ Only validate new files if uploaded
    if (newDocs.length > 0 && !validateAllFilesArePDF(newDocs)) {
      toast.error("Application documents must be PDF files only.");
      setIsSubmitting(false);
      return;
    }

    if (acknowledgeDocs.length > 0 && !validateAllFilesArePDF(acknowledgeDocs)) {
      toast.error("Acknowledgement receipts must be PDF files only.");
      setIsSubmitting(false);
      return;
    }

    const isUpdate = plantExists && dataExists && isEditMode;
    let currentUserName = loggedInUser.username;
    const formPayload = new FormData();
    formPayload.append("loc", formData.loc);
    formPayload.append("process", formData.process);
    formPayload.append("applyDate", formData.applyDate || "");
    formPayload.append("noOfFlats", formData.noOfFlats || "");
    formPayload.append("comments", formData.Comments || "");
    formPayload.append("feePaid", formData.feePaid || "");
    formPayload.append("feeAmount", formData.feeAmount || "");
    formPayload.append("acknowledgeName", formData.acknowledgeName || "");
    formPayload.append("noOfTowers", formData.noOfTowers || "");
    formPayload.append("BuildArea", formData.BuildArea || "");
    formPayload.append("ProjectArea", formData.ProjectArea || "");
    formPayload.append("TotalArea", formData.TotalArea || "");
    formPayload.append("ProjectName", formData.ProjectName || "");
    formPayload.append("steptype", "ProvisionalNOC");
    formPayload.append("username", currentUserName);

    // ✅ Only append new files if they exist
    if (acknowledgeDocs.length > 0) {
      acknowledgeDocs.forEach((f) => formPayload.append("Acknowledge_Doc[]", f));
    }

    if (newDocs.length > 0) {
      newDocs.forEach((f) => formPayload.append("New_Doc[]", f));
    }

    if (Object.keys(towerFlats).length > 0) {
      formPayload.append("towerFlats", JSON.stringify(towerFlats));
    }

    console.log("--- FormData Payload ---");
    for (let [key, value] of formPayload.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File (name: ${value.name}, type: ${value.type}, size: ${value.size} bytes)`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    console.log("New Docs:", newDocs.length);
    console.log("Ack Docs:", acknowledgeDocs.length);
    console.log("Is Update:", isUpdate);
    console.log("------------------------");

    try {
      // ✅ Use different endpoint based on edit mode
      const endpoint = isUpdate
        ? `${API_BASE_URL}/firePartialUpdate`
        : `${API_BASE_URL}/fire-submit`;

      console.log("🚀 Submitting to:", endpoint);

      const response = await axios.post(endpoint, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("API Response:", response);

      const successMessage =
        response?.data?.message ||
        response?.message ||
        (isUpdate ? "Application updated successfully!" : "Application submitted successfully!");

      await Swal.fire({
        icon: "success",
        title: isUpdate ? "Updated Successfully!" : "Submitted Successfully!",
        text: successMessage,
        showConfirmButton: false,
        timer: 2000,
      });

      // ✅ Reset form and navigate
      // Only reset new files, keep existing files for display
      setAcknowledgeDocs([]);
      setNewDocs([]);

      // If files were uploaded in this update, refresh the data
      if (isUpdate && (newDocs.length > 0 || acknowledgeDocs.length > 0)) {
        // Refresh the data to show updated files
        if (formData.loc && formData.process) {
          // Re-fetch the updated data
          const fetchUpdatedData = async () => {
            try {
              const res = await axios.get(`${API_BASE_URL}/getProcessDatafire`, {
                params: {
                  plant: formData.loc,
                  process: formData.process,
                },
              });

              const data = Array.isArray(res?.data) ? res.data[0] : res?.data;

              if (data) {
                // Parse and set the updated files
                if (data.UPLOAD_DOC && data.UPLOAD_DOC !== 'null') {
                  try {
                    const docArray = JSON.parse(String(data.UPLOAD_DOC).trim());
                    if (Array.isArray(docArray)) {
                      const updatedAppFiles = docArray.map((item, index) => ({
                        path: (item.stored_path || '').replace(/\\/g, '/'),
                        name: item.file_name || `Application_Document_${index + 1}.pdf`,
                        isExisting: true,
                        url: `${API_DOC_URL}/storage/${(item.stored_path || '').replace(/\\/g, '/')}`
                      }));
                      setExistingAppFiles(updatedAppFiles);
                    }
                  } catch (err) {
                    console.error("Error parsing updated app docs:", err);
                  }
                }

                if (data.ACK_DOC && data.ACK_DOC !== 'null') {
                  try {
                    const docArray = JSON.parse(String(data.ACK_DOC).trim());
                    if (Array.isArray(docArray)) {
                      const updatedAckFiles = docArray.map((item, index) => ({
                        path: (item.stored_path || '').replace(/\\/g, '/'),
                        name: item.file_name || `Acknowledgement_${index + 1}.pdf`,
                        isExisting: true,
                        url: `${API_DOC_URL}/storage/${(item.stored_path || '').replace(/\\/g, '/')}`
                      }));
                      setExistingAckFiles(updatedAckFiles);
                    }
                  } catch (err) {
                    console.error("Error parsing updated ack docs:", err);
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching updated data:", error);
            }
          };

          fetchUpdatedData();
        }
      }

      // Exit edit mode if we were editing
      if (isUpdate) {
        setIsEditMode(false);
        toast.info("Edit mode disabled. Form is now read-only.", {
          autoClose: 3000
        });
      }

      navigate("/create");

    } catch (err) {
      console.error("Submission error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });

      // More detailed error message
      let errorMessage = isUpdate ? "Update failed. Please try again." : "Submission failed. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error_details) {
        errorMessage = `Server error: ${err.response.data.message || 'Unknown error'}`;
      }

      Swal.fire({
        icon: "error",
        title: isUpdate ? "Update Failed" : "Submission Failed",
        text: errorMessage,
        footer: err.response?.status ? `Status: ${err.response.status}` : ''
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate("/create");
  };

  return (
    <div className="fire-form-wrapper">
      <div className="fire-form-background"></div>

      <form
        className={`fire-form-container ${formData.loc || formData.ProjectName ? "with-info-header" : ""
          }`}
        onSubmit={handleSubmit}
      >
        {/* MAIN HEADER */}
        <div className="fire-form-header">
          <div className="fire-header-content">
            <div className="fire-title-section">
              <div className="fire-icon-wrapper">
                <Flame className="fire-icon" size={38} />
              </div>
              <h1 className="fire-form-title">
                Fire Control Board Application
              </h1>
            </div>

            <button
              type="button"
              onClick={handleBackClick}
              className="fire-back-button-modern"
              title="Go back"
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        </div>

        <ProjectInfoHeader formData={formData} />

        {/* ✅ EDIT BUTTON SECTION */}

        {/* ✅ EDIT MODE TOGGLE SECTION */}
      {/* ✅ EDIT STATUS SECTION */}
{/* ✅ EDIT STATUS SECTION */}
{/* ✅ EDIT STATUS SECTION */}
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
        gap: '20px',
      }}>
        {/* ✅ Status Badge when application is completed (UPDATED = 'YES') */}
        {!canEdit && isUpdated && (
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

        {/* ✅ Edit Button (only shown when canEdit is true AND user has permission) */}
        {canEdit && !userHasEditPermission ? (
          ''
        ) : canEdit && userHasEditPermission ? (
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
          {/* Project Information */}
          <div className="form-section">
            <div className="section-header">
              <Home className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Project Information:</h3>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Plant Name*
                </label>
                <div className="input-wrapper">
                  <select
                    name="loc"
                    value={formData.loc}
                    onChange={handleChange}
                    className="highlight-input"
                  >
                    <option value="" hidden>
                      Select Plant
                    </option>
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
                  <FaLeaf className="label-icon" /> Process Type
                </label>
                <div className="input-wrapper">
                  <ProcessField
                    apiUrl={`${API_BASE_URL}/fire-process`}
                    value={formData.process}
                    onChange={handleProcessChange}
                    className="form-control"
                  />
                  <div className="error-container">
                    {errors.process && (
                      <p className="error-text">{errors.process}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="form-section">
            <div className="section-header">
              <FileText className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Application Details:</h3>
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
              {/* Application Documents Section - Update this */}
              <div className="form-field">
                <label className="field-label">
                  <FaUpload className="label-icon" /> Application Documents*
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
                    <span className="upload-count">
                      {newDocs.length > 0 && `(${newDocs.length} new)`}
                    </span>
                  </button>

                  {/* View Existing Files Button */}
                  {existingAppFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => viewDocuments(existingAppFiles, "app")}
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
                      View Existing ({existingAppFiles.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <style>{`
  /* Compact File Display Styles */
  .compact-files-list {
    margin-top: 6px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 4px 6px;
    font-size: 10px;
    max-height: 80px;
    overflow-y: auto;
  }
  
  .compact-files-header {
    font-size: 9px;
    color: #6c757d;
    font-weight: 600;
    margin-bottom: 3px;
    padding-bottom: 2px;
    border-bottom: 1px dashed #ced4da;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .compact-file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 4px;
    background: white;
    border-radius: 2px;
    margin-bottom: 2px;
    border-left: 2px solid #28a745;
    font-size: 9px;
  }
  
  .compact-file-item:last-child {
    margin-bottom: 0;
  }
  
  .compact-file-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
  }
  
  .compact-file-name {
    color: #495057;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 120px;
  }
  
  .compact-view-btn {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    padding: 0 2px;
    font-size: 8px;
    min-width: 18px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    transition: all 0.2s;
  }
  
  .compact-view-btn:hover {
    background: #e7f3ff;
    transform: scale(1.1);
  }
  
  /* Upload button adjustments */
  .upload-count {
    margin-left: 6px;
    background: #17a2b8;
    color: white;
    padding: 1px 4px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 500;
  }
  
  /* Hide scrollbar for compact lists */
  .compact-files-list::-webkit-scrollbar {
    width: 3px;
  }
  
  .compact-files-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }
  
  .compact-files-list::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }
  
  .compact-files-list::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  
  /* Even more compact version - single line */
  .ultra-compact-files {
    margin-top: 4px;
    padding: 2px 4px;
    background: #f8f9fa;
    border-radius: 3px;
    border: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    max-height: 40px;
    overflow-y: auto;
    font-size: 9px;
  }
  
  .ultra-compact-file-badge {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 1px 4px;
    background: white;
    border-radius: 3px;
    border: 1px solid #dee2e6;
  }
  
  .ultra-file-name {
    color: #495057;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .ultra-view-btn {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    padding: 0;
    font-size: 8px;
  }
  
  /* Alternative: Show count only with tooltip */
  .files-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: 6px;
    padding: 1px 6px;
    background: #e9ecef;
    color: #495057;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 500;
    cursor: help;
  }
  
  /* Tooltip for file names */
  .file-tooltip {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    z-index: 1000;
    max-width: 200px;
    word-wrap: break-word;
  }
  .minimal-files-list {
    margin-top: 8px;
    padding: 8px;
    background: #fafbfc;
    border-radius: 4px;
    border: 1px solid #e1e4e8;
  }
  
  .upload-count {
    margin-left: 8px;
    background: #17a2b8;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .mt-2 {
    margin-top: 8px;
  }
  
  .form-grid.three-columns {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .form-field.full-width {
    grid-column: 1 / -1;
  }
  
  @media (max-width: 768px) {
    .form-grid.three-columns {
      grid-template-columns: 1fr;
    }
  }
    .existing-files-container {
  margin-top: 8px;
}

.existing-files-header {
  font-size: 11px;
  color: #495057;
  margin-bottom: 4px;
  font-weight: 500;
}

.existing-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 5px;
  background: #f8f9fa;
  border-left: 3px solid #28a745;
  border-radius: 2px;
  margin-bottom: 3px;
}

.existing-file-name {
  font-size: 11px;
  color: #495057;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.view-file-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 2px;
}
  .data-exists-view {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 1200px;
  padding: 30px;
}

.existing-data-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  margin-top: 25px;
  background: #fafafa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #007bff;
}

.card-header h3 {
  color: #007bff;
  margin: 0;
  font-size: 24px;
}

.card-actions {
  display: flex;
  gap: 15px;
}

.edit-existing-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6a82fb, #8e54e9);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.edit-existing-button:hover {
  background: linear-gradient(135deg, #5b73e8, #7c43d6);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(106, 130, 251, 0.45);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.data-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.data-item strong {
  color: #495057;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 600;
}

.data-item span {
  color: #212529;
  font-size: 16px;
  font-weight: 500;
}

.documents-section {
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.documents-section h4 {
  color: #495057;
  margin-bottom: 15px;
  font-size: 18px;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.document-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.document-name {
  flex: 1;
  font-size: 14px;
  color: #495057;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-doc-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.view-doc-btn:hover {
  background: #218838;
}

.no-documents {
  color: #6c757d;
  font-style: italic;
  padding: 15px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 6px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .data-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .card-actions {
    width: 100%;
    justify-content: space-between;
  }
}
`}</style>
          {/* Documents Section */}
          <div className="form-section">
            <div className="section-header">
              <FaUpload className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Documents:</h3>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="field-label">
                  <FaMoneyBill className="label-icon" /> Acknowledgement name*
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="acknowledgeName"
                    value={formData.acknowledgeName}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter Acknowledge Name"
                    readOnly={plantExists && dataExists && !isEditMode}
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                  />
                  <div className="error-container">
                    {errors.acknowledgeName && (
                      <p className="error-text">{errors.acknowledgeName}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* Acknowledgement Documents Section - Update this */}
              <div className="form-field">
                <label className="field-label">
                  <FaUpload className="label-icon" /> Acknowledgement Receipts*
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
                      setShowAcknowledgeModal(true);
                    }}
                    disabled={plantExists && dataExists && !isEditMode}
                    style={{
                      opacity: plantExists && dataExists && !isEditMode ? 0.6 : 1,
                      cursor: plantExists && dataExists && !isEditMode ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FaUpload className="upload-icon" />
                    {plantExists && dataExists ? 'Add New Documents' : 'Upload PDF Files'}
                    <span className="upload-count">
                      {acknowledgeDocs.length > 0 && `(${acknowledgeDocs.length} new)`}
                    </span>
                  </button>

                  {/* View Existing Files Button */}
                  {existingAckFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => viewDocuments(existingAckFiles, "ack")}
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
                      View Existing ({existingAckFiles.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="form-section">
            <div className="section-header">
              <FileCheck className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Project Requirement:</h3>
            </div>

            <div className="form-grid three-columns">
              {/* Fee Paid? */}
              {/* Fee Paid? */}
              <div className="form-group">
                <label className="field-label">Fee Paid?*</label>
                <div className="radio-group-horizontal">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="feePaid"
                      value="YES"
                      checked={formData.feePaid === "YES"}
                      onChange={handleChange}
                      className="radio-input"
                      disabled={plantExists && dataExists && !isEditMode}
                    />
                    <span className="radiomark"></span>
                    Yes
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="feePaid"
                      value="NO"
                      checked={formData.feePaid === "NO"}
                      onChange={handleChange}
                      className="radio-input"
                      disabled={plantExists && dataExists && !isEditMode}
                    />
                    <span className="radiomark"></span>
                    No
                  </label>
                </div>
                <div className="error-container">
                  {errors.feePaid && (
                    <p className="error-text">{errors.feePaid}</p>
                  )}
                </div>
              </div>

              {/* Fee Amount - Show when Fee Paid is YES */}
              {formData.feePaid === "YES" && (
                <div className="form-field">
                  <label className="field-label">
                    <FaMoneyBill className="label-icon" /> Fee Amount*
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="feeAmount"
                      value={formData.feeAmount}
                      onChange={handleChange}
                      className="modern-input"
                     placeholder="Enter Fee Amount"
                      min="0"
                      readOnly={plantExists && dataExists && !isEditMode}
                      style={{
                        backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                        color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                      }}
                    />
                    <div className="error-container">
                      {errors.feeAmount && (
                        <p className="error-text">{errors.feeAmount}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Number of Towers */}
              <div className="form-field">
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Number of Towers*
                </label>
                <div className="input-wrapper">
                  <select
                    name="noOfTowers"
                    value={formData.noOfTowers}
                    onChange={handleNoOfTowersChange}
                    className="modern-input"
                    disabled={plantExists && dataExists && !isEditMode}
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                  >
                    <option value="">Select Number of Towers</option>
                    {[...Array(15)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <div className="error-container">
                    {errors.noOfTowers && (
                      <p className="error-text">{errors.noOfTowers}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Comments - Full width */}
              <div className="form-field full-width">
                <label className="field-label">
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
                    readOnly={plantExists && dataExists && !isEditMode}
                    style={{
                      backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                      color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit'
                    }}
                  />
                  <div className="error-container">
                    {errors.Comments && (
                      <p className="error-text">{errors.Comments}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

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

      <ReraDocUploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        files={newDocs}
        setFiles={setNewDocs}
        title="Upload Application Documents"
        acceptOnlyPdf={true}
      />

      <ReraDocUploadModal
        show={showAcknowledgeModal}
        onClose={() => setShowAcknowledgeModal(false)}
        files={acknowledgeDocs}
        setFiles={setAcknowledgeDocs}
        title="Upload Acknowledgement Receipts"
        acceptOnlyPdf={true}
      />

      <FlatsPerTowerModal
        show={showFlatsModal}
        onClose={handleFlatsModalClose}
        numberOfTowers={parseInt(formData.noOfTowers) || 0}
        towerFlats={towerFlats}
        onSave={handleSaveFlats}
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
          📄 {currentViewType === 'app' ? 'Application Documents' : 'Acknowledgement Documents'}
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
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              
              }}
              onClick={() => window.open(file.url, '_blank')}
              title="Click to open document"
              >
                {file?.name}
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
                
                {/* Delete button - only show in edit mode and when canEdit is true */}
                {isEditMode && canEdit && (
                  <button
                    onClick={() => handleDeleteDocument(file, index)}
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
              <span>
                Type: PDF
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

export default FireForm;
