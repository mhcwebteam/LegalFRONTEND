import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaLeaf, FaWater, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, MessageSquareMore, Store, FileCheck, FolderUp, Building, Landmark, Edit, Eye, Lock, Trash2 } from "lucide-react";
import ApplyDateInput from '../components/ApplyDateInput';
import { ToastContainer, toast } from 'react-toastify';
import ReusableDialog from "../components/ReusableDialog";
import "../pages/Ghmc.css";
import { getMasterByLoc } from "../api/Api"
import { Context } from "../context/ContextData"
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import ProcessField from "../components/ProcessField";
import ProjectInfoHeader from "../components/ProjectInfoHeader";
import WaterDocUploadModal from "../components/WaterDocUploadModal";
import Swal from "sweetalert2";

const Ghmc = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const { totalMasterData, setHeaderData, headerData } = useContext(Context);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [towerDocModal, setTowerDocModal] = useState(false);
    const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
    const [feasibilityDocs, setFeasibilityDocs] = useState([]);
    const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [towerDocuments, setTowerDocuments] = useState([]);
    const [AmountPaidDocs, setAmountPaidDocs] = useState([]);

    // Existing files state
    const [existingFeasibilityFiles, setExistingFeasibilityFiles] = useState([]);
    const [existingAmountPaidFiles, setExistingAmountPaidFiles] = useState([]);
    const [existingTowerFiles, setExistingTowerFiles] = useState({});
    // Add these states to your existing state declarations
    const [documentViewModal, setDocumentViewModal] = useState(false);
    const [currentViewFiles, setCurrentViewFiles] = useState([]);
    const [currentFileType, setCurrentFileType] = useState(''); // 'feasibility', 'amount', or 'tower'
    const [selectedTowerId, setSelectedTowerId] = useState(null);
    // Plant existence and edit state
    const [plantExists, setPlantExists] = useState(false);
    const [existingPlantId, setExistingPlantId] = useState(null);
    const [dataExists, setDataExists] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loadingExistingData, setLoadingExistingData] = useState(false);
    const [canEdit, setCanEdit] = useState(true);
    const hasLoadedInitialData = useRef(false);
// Add these states near your other state declarations (around line 48)
const [deletedDocs, setDeletedDocs] = useState([]); // Track deleted docs locally
const [isUpdated, setIsUpdated] = useState(false); // Track if record is updated
    const [formData, setFormData] = useState({
        loc: '',
        process: '',
        Organization: "",
        applyDate: '',
        noOfTowers: '',
        Comments: ''
    });
// Add these with other useState declarations
const [emailData, setEmailData] = useState([]);
const [userHasEditPermission, setUserHasEditPermission] = useState(false);
const [isCheckingPermission, setIsCheckingPermission] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const MAX_FILE_SIZE = 1 * 1024 * 1024;

    const validateFileType = (file) => {
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        return fileExtension === '.pdf' && (!file.type || file.type === 'application/pdf');
    };
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
    // Error Popup Component
    const ErrorPopup = () => {
        if (!showError) return null;

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '40px',
                    maxWidth: '400px',
                    width: '90%',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 20px',
                        borderRadius: '50%',
                        border: '4px solid #ef5350',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="#ef5350"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <h3 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '12px'
                    }}>
                        Invalid File Type
                    </h3>
                    <p style={{
                        fontSize: '16px',
                        color: '#666',
                        marginBottom: '24px',
                        lineHeight: '1.5'
                    }}>
                        {errorMessage || "File size should not be Larger!"}
                    </p>
                    <button
                        onClick={() => setShowError(false)}
                        style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '10px 40px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
                    >
                        OK
                    </button>
                </div>
            </div>
        );
    };
// Add this helper function after the extractFilesSimply function (around line 466)
// Fix this function - it has a bug comparing deleted.docType with itself
const filterDeletedDocs = (list, fileType) => {
    if (!list || !Array.isArray(list)) return [];
    
    let docType;
    switch(fileType) {
        case 'feasibility': docType = 'FEAS_DOCS'; break;
        case 'amount': docType = 'AMOUNT_DOCS'; break;
        case 'tower': docType = 'TOWER_DOCS'; break;
        default: return list;
    }
    
    return list.filter(file => {
        // Check if this file is in the deletedDocs array
        const isDeleted = deletedDocs.some(deleted => {
            // Compare by file name or path
            const nameMatches = deleted.fileName === file.name;
            const typeMatches = deleted.docType === docType;
            
            // If it's a tower document, also check towerId
            if (fileType === 'tower' && selectedTowerId) {
                return nameMatches && typeMatches && deleted.towerId === selectedTowerId;
            }
            
            return nameMatches && typeMatches;
        });
        
        return !isDeleted;
    });
};
    // Grayout Field Component
    const GrayoutField = ({ children, isDisabled }) => {
        if (!isDisabled) return children;

        return React.cloneElement(children, {
            style: {
                ...children.props.style,
                backgroundColor: '#f5f5f5',
                color: '#666',
                cursor: 'not-allowed',
                opacity: 0.7,
                borderColor: '#ddd'
            },
            disabled: true,
            className: `${children.props.className || ''} grayout-field`
        });
    };

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

    // ✅ Toggle edit mode
   // ✅ Toggle edit mode
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
            toast.info("Edit mode enabled. You can now modify all fields.", {
                autoClose: 3000
            });
        } else {
            toast.info("Edit mode disabled. Only comments can be modified.", {
                autoClose: 3000
            });
        }
    }
};

    // ✅ Check if plant exists
  
const checkIfPlantExists = async (plant) => {
    try {
        setLoadingExistingData(true);
  // ✅ ADD THIS LINE - Reset deletedDocs when checking a new plant
        setDeletedDocs([]);
        let processValue = '';
        try {
            const processRes = await axios.get(`${API_BASE_URL}/GHMC-process`, {
                params: { plant: plant },
            });

            if (processRes.data && processRes.data.length > 0) {
                processValue = processRes.data[0].PROCESS;
                setFormData(prev => ({
                    ...prev,
                    process: processValue
                }));
            }
        } catch (processErr) {
            console.error("Error fetching process:", processErr);
        }

        const res = await axios.get(`${API_BASE_URL}/getProcessDataghmc`, {
            params: {
                plant: plant,
                process: processValue || ''
            }
        });

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            const existingRecord = res.data[0];
            console.log("Full API Response:", res); // Debug log
   const record = Array.isArray(existingRecord) ? existingRecord[0] : existingRecord;

// 2. Get the tower_doc value
const rawTowerDoc = record?.tower_doc || "";


const rawGhmcDoc =  record?.feas_doc || "";

const rawFeasDoc =  record?.amount_doc || "";

            setPlantExists(true);
            setDataExists(true);
            setExistingPlantId(existingRecord.id || plant);

             // ✅ ADD THESE LINES HERE (after setExistingPlantId)
            // Check if application is completed (UPDATED = 'YES')
            const isCompleted = existingRecord?.UPDATED && 
                               existingRecord.UPDATED.toString().toUpperCase() === 'YES';
            
            setCanEdit(!isCompleted);
            setIsUpdated(isCompleted);

            if (isCompleted) {
                toast.info(`Application for ${plant} is completed and cannot be edited.`, {
                    autoClose: 4000
                });
            }
            // ✅ END OF NEW CODE

            // Parse documents - HANDLE MALFORMED JSON
            let parsedFeasibilityFiles = [];
            let parsedAmountPaidFiles = [];
            let parsedTowerFiles = {};

            // =============================================
            // 1. PARSE FEASIBILITY DOCS (Other Documents)
            // =============================================
            // Check multiple possible field names
            const feasDocString = existingRecord.feas_doc_name || 
                                 existingRecord.FEAS_DOC || 
                                 existingRecord.feas_doc_path || 
                                 existingRecord.feasibility_docs || 
                                 '';
            console.log("Feasibility Doc String:", feasDocString);

            if (feasDocString && feasDocString !== 'null' && feasDocString !== '[]') {
                try {
                    // Clean and fix the JSON string
                    let cleanedString = String(feasDocString)
                        .trim()
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\')
                        .replace(/\"{/g, '{')
                        .replace(/}\"/g, '}');

                    // Remove outer quotes if present
                    if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
                        cleanedString = cleanedString.substring(1, cleanedString.length - 1);
                    }

                    console.log("Cleaned Feas String:", cleanedString);

                    if (cleanedString.startsWith('[{') && cleanedString.endsWith('}]')) {
                        const docArray = JSON.parse(cleanedString);
                        if (Array.isArray(docArray)) {
                            parsedFeasibilityFiles = docArray
                                .filter(item => item && item.stored_path)
                                .map((item, index) => ({
                                    path: item.stored_path?.replace(/\\/g, '/') || '',
                                    name: item.file_name || `Other_Document_${index + 1}.pdf`,
                                    isExisting: true,
                                    url: item.stored_path ? `${API_DOC_URL}/storage/${item.stored_path.replace(/\\/g, '/')}` : '#'
                                }));
                        }
                    } else if (cleanedString.includes('stored_path')) {
                        // Try to extract using regex for malformed JSON
                        const regex = /"stored_path"\s*:\s*"([^"]+)"/g;
                        let match;
                        while ((match = regex.exec(cleanedString)) !== null) {
                            if (match[1] && match[1] !== 'null') {
                                const nameRegex = new RegExp(`"file_name"\\s*:\\s*"([^"]+)"`);
                                const nameMatch = nameRegex.exec(cleanedString.substring(match.index));
                                const fileName = nameMatch ? nameMatch[1] : `Other_Document_${parsedFeasibilityFiles.length + 1}.pdf`;

                                parsedFeasibilityFiles.push({
                                    path: match[1].replace(/\\/g, '/'),
                                    name: fileName,
                                    isExisting: true,
                                    url: `${API_DOC_URL}/storage/${match[1].replace(/\\/g, '/')}`
                                });
                            }
                        }
                    } else if (cleanedString.includes('.pdf')) {
                        // Handle simple format like ["1236.pdf"]
                        const pdfMatches = cleanedString.match(/"([^"]+\.pdf)"/g);
                        if (pdfMatches) {
                            pdfMatches.forEach((pdfMatch, index) => {
                                const fileName = pdfMatch.replace(/"/g, '');
                                parsedFeasibilityFiles.push({
                                    path: `ghmc_docs/feasibility_docs/${fileName}`,
                                    name: fileName,
                                    isExisting: true,
                                    url: `${API_DOC_URL}/storage/${rawGhmcDoc}`
                                });
                            });
                        }
                    }
                } catch (parseErr) {
                    console.error("Parse failed for feas_doc_name:", parseErr);
                    // Try simple extraction
                    const simpleFiles = extractFilesSimply(feasDocString, 'Other_Document');
                    if (simpleFiles.length > 0) {
                        parsedFeasibilityFiles = simpleFiles;
                    }
                }
            }

            // =============================================
            // 2. PARSE AMOUNT PAID DOCS (Upload Documents)
            // =============================================
            // Check multiple possible field names
            const amountDocString = existingRecord.amount_doc_name || 
                                   existingRecord.AMOUNT_DOC || 
                                   existingRecord.amount_doc_path || 
                                   existingRecord.upload_docs || 
                                   '';
            console.log("Amount Doc String:", amountDocString);

            if (amountDocString && amountDocString !== 'null' && amountDocString !== '[]') {
                try {
                    // Clean and fix the JSON string
                    let cleanedString = String(amountDocString)
                        .trim()
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\')
                        .replace(/\"{/g, '{')
                        .replace(/}\"/g, '}');

                    if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
                        cleanedString = cleanedString.substring(1, cleanedString.length - 1);
                    }

                    console.log("Cleaned Amount String:", cleanedString);

                    if (cleanedString.startsWith('[{') && cleanedString.endsWith('}]')) {
                        const docArray = JSON.parse(cleanedString);
                        if (Array.isArray(docArray)) {
                            parsedAmountPaidFiles = docArray
                                .filter(item => item && item.stored_path)
                                .map((item, index) => ({
                                    path: item.stored_path?.replace(/\\/g, '/') || '',
                                    name: item.file_name || `Title_Document_${index + 1}.pdf`,
                                    isExisting: true,
                                    url: item.stored_path ? `${API_DOC_URL}/storage/${item.stored_path.replace(/\\/g, '/')}` : '#'
                                }));
                        }
                    } else if (cleanedString.includes('stored_path')) {
                        // Extract using regex
                        const regex = /"stored_path"\s*:\s*"([^"]+)"/g;
                        let match;
                        while ((match = regex.exec(cleanedString)) !== null) {
                            if (match[1] && match[1] !== 'null') {
                                const nameRegex = new RegExp(`"file_name"\\s*:\\s*"([^"]+)"`);
                                const nameMatch = nameRegex.exec(cleanedString.substring(match.index));
                                const fileName = nameMatch ? nameMatch[1] : `Title_Document_${parsedAmountPaidFiles.length + 1}.pdf`;

                                parsedAmountPaidFiles.push({
                                    path: match[1].replace(/\\/g, '/'),
                                    name: fileName,
                                    isExisting: true,
                                    url: `${API_DOC_URL}/storage/${match[1].replace(/\\/g, '/')}`
                                });
                            }
                        }
                    } else if (cleanedString.includes('.pdf')) {
                        // Handle simple format like ["1236.pdf"]
                        const pdfMatches = cleanedString.match(/"([^"]+\.pdf)"/g);
                        if (pdfMatches) {
                            pdfMatches.forEach((pdfMatch, index) => {
                                const fileName = pdfMatch.replace(/"/g, '');
                                parsedAmountPaidFiles.push({
                                    path: `ghmc_docs/upload_docs/${fileName}`,
                                    name: fileName,
                                    isExisting: true,
                                     url: `${API_DOC_URL}/storage/${rawFeasDoc}`
                                });
                            });
                        }
                    }
                } catch (parseErr) {
                    console.error("Parse failed for amount_doc_name:", parseErr);
                    // Try simple extraction
                    const simpleFiles = extractFilesSimply(amountDocString, 'Title_Document');
                    if (simpleFiles.length > 0) {
                        parsedAmountPaidFiles = simpleFiles;
                    }
                }
            }

            // =============================================
            // 3. PARSE TOWER DOCS
            // =============================================
            const towerDocString = existingRecord.tower_doc_name || 
                                  existingRecord.TOWER_DOC || 
                                  existingRecord.tower_doc_path || 
                                  '';
  
console.log(record,"fffffffffffffff");

            if (towerDocString && towerDocString !== 'null' && towerDocString !== '[]') {
                try {
                    // Clean and fix the JSON string
                    let cleanedString = String(towerDocString)
                        .trim()
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\');

                    if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
                        cleanedString = cleanedString.substring(1, cleanedString.length - 1);
                    }

                    
                                    console.log(cleanedString,"pathhhhhhhhhhhhhhhhhhhhhh");

                    console.log("Cleaned Tower String:", cleanedString);

                    if (cleanedString.startsWith('[{') && cleanedString.endsWith('}]')) {
                        const docArray = JSON.parse(cleanedString);
                        
                        if (Array.isArray(docArray)) {
                            docArray.forEach((item, index) => {
                                if (item && (item.stored_path || item.path)) {
                                    const towerId = item.tower_id || (index + 1);
                                    const path = item.stored_path || item.path;


                                    if (!parsedTowerFiles[towerId]) {
                                        parsedTowerFiles[towerId] = [];
                                    }

                                    parsedTowerFiles[towerId].push({
                                        path: path.replace(/\\/g, '/'),
                                        name: item.file_name || `Tower_${towerId}_Document.pdf`,
                                        isExisting: true,
                                        url: `${API_DOC_URL}/storage/${path.replace(/\\/g, '/')}`
                                    });
                                }
                            });
                        }
                    } else if (cleanedString.includes('.pdf')) {
                        // Handle simple format: ["1236.pdf"]
                        const pdfMatches = cleanedString.match(/"([^"]+\.pdf)"/g);
       const filenameToDisplay = existingRecord.tower_doc_path || (typeof existingRecord.tower_doc_path === 'string' ? existingRecord.tower_doc_path.split("/").pop() : "");
            const path = filenameToDisplay.path || (typeof filenameToDisplay === 'string' ? filenameToDisplay : '');

            console.log(existingRecord,"pathjjjjjjjjjjjjjjjjj");
                        console.log(pdfMatches,"pdf");
                        if (pdfMatches) {
                            pdfMatches.forEach((pdfMatch, index) => {
                                const fileName = pdfMatch.replace(/"/g, '');
                                const towerId = 1; // Default to tower 1
                                
                                if (!parsedTowerFiles[towerId]) {
                                    parsedTowerFiles[towerId] = [];
                                }
                                
                                parsedTowerFiles[towerId].push({
                                    path: `ghmc_docs/tower_docs/${fileName}`,
                                    name: fileName,
                                    isExisting: true,
                                    url: `${API_DOC_URL}/storage/${rawTowerDoc}`
                                });
                            });
                        }
                    }
                } catch (parseErr) {
                    console.error("Parse failed for tower_doc_name:", parseErr);
                }
            }

            // Debug log parsed files
            console.log("Parsed Files:", {
                feasibility: parsedFeasibilityFiles,
                amount: parsedAmountPaidFiles,
                tower: parsedTowerFiles
            });

            // Set form data
            setFormData(prev => ({
                ...prev,
                Organization: existingRecord.Organization || '',
                applyDate: existingRecord.applyDate || '',
                noOfTowers: existingRecord.noOfTowers || '',
                Comments: existingRecord.Comments || ''
            }));

            // Set existing files
            setExistingFeasibilityFiles(parsedFeasibilityFiles);
            setExistingAmountPaidFiles(parsedAmountPaidFiles);
            setExistingTowerFiles(parsedTowerFiles);

            // Show toast based on what files were found
            const fileCount = parsedFeasibilityFiles.length + parsedAmountPaidFiles.length + Object.values(parsedTowerFiles).flat().length;
            if (fileCount > 0) {
                toast.success(`Found ${fileCount} existing document(s)!`, {
                    autoClose: 3000
                });
            } else {
                toast.info('No existing documents found for this plant.', {
                    autoClose: 3000
                });
            }
            
            return true;
        } else {
            setPlantExists(false);
            setDataExists(false);
            setExistingFeasibilityFiles([]);
            setExistingAmountPaidFiles([]);
            setExistingTowerFiles({});
  // ✅ ADD THESE TWO LINES
            setCanEdit(true);
            setIsUpdated(false);
            setFormData(prev => ({
                ...prev,
                Organization: '',
                applyDate: '',
                noOfTowers: '',
                Comments: ''
            }));
            
            return false;
        }
    } catch (error) {
        console.error('Failed to check plant:', error);
        setPlantExists(false);
        setDataExists(false);
        setExistingFeasibilityFiles([]);
        setExistingAmountPaidFiles([]);
        setExistingTowerFiles({});
          setCanEdit(true);
        setIsUpdated(false);
        return false;
    } finally {
        setLoadingExistingData(false);
    }
};

    // Helper function for simple extraction
    const extractFilesSimply = (jsonString, type) => {
        if (!jsonString || jsonString === 'null') return [];

        const files = [];
        const string = String(jsonString);

        // Look for stored_path patterns
        const pathRegex = /stored_path[^"]*"([^"]+)"/g;
        let pathMatch;

        while ((pathMatch = pathRegex.exec(string)) !== null) {
            if (pathMatch[1] && !pathMatch[1].includes('null')) {
                // Look for file_name
                const nameRegex = /file_name[^"]*"([^"]+)"/;
                const nameMatch = nameRegex.exec(string.substring(pathMatch.index));

                files.push({
                    path: pathMatch[1].replace(/\\/g, '/'),
                    name: nameMatch ? nameMatch[1] : `${type}_${files.length + 1}.pdf`,
                    isExisting: true,
                    url: `${API_DOC_URL}/storage/${pathMatch[1].replace(/\\/g, '/')}`
                });
            }
        }

        return files;
    };
    // Helper function to view existing documents in modal
    // Helper function to view existing documents in modal
const viewExistingDocuments = (files, fileType, towerId = null) => {
    setCurrentViewFiles(files); // ✅ Using the parameter directly
    setCurrentFileType(fileType);
    setSelectedTowerId(towerId);
    setDocumentViewModal(true);
};

    // Function to get modal title
    const getModalTitle = () => {
        switch (currentFileType) {
            case 'feasibility':
                return '📄 Other Documents';
            case 'amount':
                return '📄 Upload Documents';
            case 'tower':
                return `📄 Tower ${selectedTowerId} Documents`;
            default:
                return '📄 Documents';
        }
    };
    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }

        if (name === "loc") {
            setPlantExists(false);
            setDataExists(false);
            setExistingPlantId(null);
            setIsEditMode(false);

            setFormData(prev => ({
                ...prev,
                loc: value,
                Organization: '',
                applyDate: '',
                noOfTowers: '',
                Comments: ''
            }));

            if (!value || value.trim() === "") {
                setHeaderData(null);
                setFormData(prev => ({
                    ...prev,
                    process: '',
                    Organization: '',
                    applyDate: '',
                    noOfTowers: '',
                    Comments: ''
                }));
                return;
            }

            try {
                const res = await getMasterByLoc(value);
                if (res) {
                    setHeaderData(res);
                } else {
                    setHeaderData(null);
                }

                await checkIfPlantExists(value);

            } catch (err) {
                console.error("Error fetching data:", err);
                setHeaderData(null);
                setFormData(prev => ({
                    ...prev,
                    process: '',
                    Organization: '',
                    applyDate: '',
                    noOfTowers: '',
                    Comments: ''
                }));
            }
            return;
        }

        // Always allow editing of Comments field (even when not in edit mode)
        if (name === "Comments") {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            return;
        }

        // Don't allow editing of other existing data fields when not in edit mode
        if (plantExists && dataExists && !isEditMode) {
            toast.warning('Please enable edit mode to modify this field.');
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
                console.error("Error fetching GHMC process name:", err);
            }
        };

        fetchProcess();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isUpdate = plantExists && dataExists && isEditMode;
        const newErrors = {};

        // Always required
        if (!formData.loc) newErrors.loc = "Plant Name is required.";
        if (!formData.process) newErrors.process = "Process Type is required.";

        if (!isUpdate) {
            // For new submission
            if (!formData.applyDate) newErrors.applyDate = "Application date is required.";
            if (!formData.Organization) newErrors.Organization = "Organization is required.";
            if (!formData.noOfTowers) newErrors.noOfTowers = "Number Of Towers is required.";
            if (!formData.Comments) newErrors.Comments = "Please enter comments.";

            // File validation for new submission
            if (feasibilityDocs.length === 0) {
                newErrors.feasibilityDocs = "Other Document is required (at least one PDF)";
            }
            if (AmountPaidDocs.length === 0) {
                newErrors.AmountPaidDocs = "Title Document is required (at least one PDF)";
            }

            // Validate tower documents for new submission
            if (formData.noOfTowers && parseInt(formData.noOfTowers) > 0) {
                let allTowersHaveDocs = true;
                towerDocuments.forEach((tower) => {
                    if (tower.documents.length === 0) {
                        newErrors[`tower_${tower.towerId}`] = `Tower ${tower.towerId} document is required`;
                        allTowersHaveDocs = false;
                    }
                });
            }
        }

        // Validate file types for newly uploaded files
        if (feasibilityDocs.length > 0) {
            const invalidFiles = feasibilityDocs.filter(file => !validateFileType(file));
            if (invalidFiles.length > 0) {
                newErrors.feasibilityDocs = "Only PDF files are allowed for Other Document";
            }
        }

        if (AmountPaidDocs.length > 0) {
            const invalidFiles = AmountPaidDocs.filter(file => !validateFileType(file));
            if (invalidFiles.length > 0) {
                newErrors.AmountPaidDocs = "Only PDF files are allowed for Title Document";
            }
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
        if (plantExists && dataExists && !isEditMode) {
            toast.warning('Please enable edit mode to modify process.');
            return;
        }

        setFormData((prev) => ({
            ...prev,
            process: value,
        }));
    };
const deleteDocument = async (file) => {
    try {
        console.log('🗑️ Delete triggered for file:', file);

        if (!file.isExisting) {
            toast.error("Only existing files can be deleted.");
            return;
        }

        if (!formData.loc || !formData.process) {
            toast.error("Plant location or process information is missing.");
            return;
        }

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

        // Determine document type
        let docType;
        let apiDocType;
        
        switch (currentFileType) {
            case 'feasibility':
                docType = 'FEAS_DOCS';
                apiDocType = 'FEAS_DOCS';
                break;
            case 'amount':
                docType = 'AMOUNT_DOCS';
                apiDocType = 'AMOUNT_DOCS';
                break;
            case 'tower':
                docType = 'TOWER_DOCS';
                apiDocType = 'TOWER_DOCS';
                break;
            default:
                docType = 'FEAS_DOCS';
                apiDocType = 'FEAS_DOCS';
        }

        // ✅ Extract correct filename from path
        let fileNameToSend = file.name;
        
        if (file.path) {
            const pathParts = file.path.split('/');
            fileNameToSend = pathParts[pathParts.length - 1];
            console.log('📝 Extracted filename from path:', fileNameToSend);
        }
        
        // Clean the filename
        fileNameToSend = fileNameToSend.replace(/['"\\]/g, '');
        
        console.log('📤 Will send filename:', fileNameToSend);

        // Add to locally deleted docs immediately for instant UI update
       // In the deleteDocument function, when adding to deletedDocs:
setDeletedDocs(prev => [...prev, {
    fileName: file.name,
    filePath: file.path, // Add this
    docType: docType,
    fileType: currentFileType,
    towerId: selectedTowerId
}]);

        try {
            const requestData = {
                loc: formData.loc,
                process: formData.process,
                doc_type: apiDocType,
                file_name: fileNameToSend
            };
            
            // Add tower_id only for tower documents
            if (currentFileType === 'tower' && selectedTowerId) {
                requestData.tower_id = selectedTowerId;
            }

            console.log('📡 Sending delete request:', requestData);
            
            const response = await axios.delete(`${API_BASE_URL}/deleteGhmcDoc`, {
                data: requestData
            });

            console.log('✅ Delete response:', response.data);
            
            if (response.data.success || response.data.message?.includes('deleted')) {
                // ✅ FIRST: Close the modal immediately
                setDocumentViewModal(false);

                // ✅ THEN: Show success message
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Document has been deleted successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                // ✅ Update UI state based on file type
                switch (currentFileType) {
                    case 'feasibility':
                        setExistingFeasibilityFiles(prev => prev.filter(f => f.path !== file.path));
                        break;
                    case 'amount':
                        setExistingAmountPaidFiles(prev => prev.filter(f => f.path !== file.path));
                        break;
                    case 'tower':
                        if (selectedTowerId) {
                            setExistingTowerFiles(prev => ({
                                ...prev,
                                [selectedTowerId]: prev[selectedTowerId]?.filter(f => f.path !== file.path) || []
                            }));
                        }
                        break;
                }

                // ✅ Show success toast
                toast.success('Document deleted successfully!', {
                    autoClose: 3000
                });

                // ✅ OPTIONAL: Reload plant data to ensure UI is in sync with backend
                await checkIfPlantExists(formData.loc);

            } else {
                // Remove from locally deleted docs if deletion failed
                setDeletedDocs(prev => prev.filter(doc => 
                    !(doc.fileName === file.name && doc.docType === docType)
                ));
                toast.error(response.data.message || 'Failed to delete file');
            }
        } catch (apiError) {
            console.error('❌ Delete API error:', apiError);
            console.error('Error response:', apiError.response?.data);
            
            // Remove from locally deleted docs if deletion failed
            setDeletedDocs(prev => prev.filter(doc => 
                !(doc.fileName === file.name && doc.docType === docType)
            ));
            
            const errorMessage = apiError.response?.data?.message || 'Failed to delete document';
            
            // ✅ Close modal before showing error
            setDocumentViewModal(false);
            
            await Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    } catch (error) {
        console.error('❌ Delete error:', error);
        
        // ✅ Close modal on any error
        setDocumentViewModal(false);
        
        toast.error('Failed to delete file. Please try again.');
    }
};


    // ✅ Helper function to map file type to doc_type parameter
    const getDocTypeFromFileType = (fileType) => {
        switch (fileType) {
            case 'feasibility':
                return 'OTHER_DOC';  // For Other Documents
            case 'amount':
                return 'UPLOAD_DOC';  // For Upload Documents  
            case 'tower':
                return 'TOWER_DOC';  // For Tower Documents
            default:
                return 'OTHER_DOC';
        }
    };
    const handleConfirmSubmit = async () => {
        const isUpdate = plantExists && dataExists && isEditMode;

        // Validate new files
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

        let currentUserName = loggedInUser?.username || 'unknown';
        const formPayload = new FormData();
        formPayload.append('loc', formData.loc);
        formPayload.append('process', formData.process);
        formPayload.append('applyDate', formData.applyDate);
        formPayload.append('Organization', formData.Organization);
        formPayload.append('noOfTowers', formData.noOfTowers);
        formPayload.append('Comments', formData.Comments || "");
        formPayload.append('username', currentUserName); // ✅ Make sure this is included

        // Only append new files (existing files are handled separately)
        feasibilityDocs.forEach(file => formPayload.append('feas_doc_name[]', file));
        AmountPaidDocs.forEach(file => formPayload.append('amount_doc_name[]', file));

        towerDocuments.forEach(tower => {
            tower.documents.forEach(file => {
                formPayload.append('tower_doc_name[]', file);
            });
        });

        try {
            const endpoint = isUpdate
                ? `${API_BASE_URL}/ghmcPartialUpdate`
                : `${API_BASE_URL}/GHMC-submit`;

            const res = await axios.post(endpoint, formPayload, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const successMessage = res.data?.message ||
                (isUpdate ? "Application updated successfully!" : "Application submitted successfully!");

            await Swal.fire({
                icon: "success",
                title: isUpdate ? "Updated Successfully!" : "Submitted Successfully!",
                text: successMessage,
                showConfirmButton: false,
                timer: 2000,
            });

            // Reset only new files
            setFeasibilityDocs([]);
            setAmountPaidDocs([]);
            setTowerDocuments([]);

            // Exit edit mode if updating
            if (isUpdate) {
                setIsEditMode(false);
                toast.info("Edit mode disabled. Form is now read-only.", {
                    autoClose: 3000
                });
            }

            navigate('/create');

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: isUpdate ? "Update Failed" : "Submission Failed",
                text: err.response?.data?.message || "Something went wrong. Please try again.",
                confirmButtonText: "OK"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
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
        setPlantExists(false);
        setDataExists(false);
        setExistingPlantId(null);
        setErrors({});
        setHeaderData(null);
        setIsEditMode(false);
    };

    const handleBackClick = () => {
        navigate('/create');
    };

    const updateTowerDocs = (towerId, newDocs) => {
        const invalidFiles = newDocs.filter(file => !validateFileType(file));

        if (invalidFiles.length > 0) {
            toast.error(`Only PDF files are allowed for Tower ${towerId}`);
            return;
        }

        setTowerDocuments(prev =>
            prev.map(tower =>
                tower.towerId === towerId
                    ? { ...tower, documents: newDocs }
                    : tower
            )
        );
    };

    const handleTowerFileInput = (towerId, currentDocs) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.pdf,application/pdf';

        input.onchange = (e) => {
            const files = Array.from(e.target.files);

            const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);

            if (oversizedFiles.length > 0) {
                const fileNames = oversizedFiles.map(f => f.name).join(', ');
                setErrorMessage(
                    `The following files exceed 1MB limit: ${fileNames}. Please select smaller files.`
                );
                setShowError(true);
                return;
            }

            const allValid = files.every(file => validateFileType(file));

            if (allValid) {
                updateTowerDocs(towerId, [...currentDocs, ...files]);
            } else {
                toast.error('Some files were not added because they are not PDFs');
            }
        };

        input.click();
    };
    // ✅ Add this component near the top, after imports but before the Ghmc component
    const ExistingFilesDisplay = ({ files, title, type = "default", towerId = null }) => {
        if (!files || files.length === 0) return null;

        return (
            <div className="existing-files-display mt-2">
                <div className="existing-files-header">
                    <span className="existing-files-title">{title}</span>
                    <span className="existing-files-count">{files.length} file(s)</span>
                </div>
                <div className="existing-files-list">
                    {files.slice(0, 3).map((file, index) => (
                        <div key={index} className="existing-file-item">
                            <FileText size={14} className="file-icon" />
                            <span className="file-name" title={file.name}>
                                {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => window.open(file.url, '_blank')}
                                title="View document"
                                className="file-view-btn"
                            >
                                <Eye size={14} />
                            </button>
                        </div>
                    ))}
                    {files.length > 3 && (
                        <div className="more-files-indicator">
                            + {files.length - 3} more file{files.length - 3 !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>
        );
    };
    return (
        <>
            <ErrorPopup />
            {/* Document View Modal - Add this near your other modals */}
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
                                {currentFileType === 'feasibility' && '📄 Other Documents'}
                                {currentFileType === 'amount' && '📄 Upload Documents'}
                                {currentFileType === 'tower' && `📄 Tower ${selectedTowerId} Documents`}
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

                                            {/* ADD DELETE BUTTON HERE - Only show in edit mode */}
                                            {/* Show delete button only in edit mode and if not updated */}
{isEditMode && file.isExisting && !isUpdated && (
    <button
        onClick={async (e) => {
            e.stopPropagation();
            if (!formData.loc || !formData.process) {
                toast.error(`Cannot delete: Missing location or process.`);
                return;
            }
            await deleteDocument(file);
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
                                        marginTop: '5px'
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
            <div className="ghmc-form-wrapper">
                <form className="ghmc-form-container" onSubmit={handleSubmit}>
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

                    {/* ✅ EDIT MODE TOGGLE SECTION (same as FireForm) */}
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
           
        </div>
    ) : (
       plantExists && dataExists && !isUpdated && (
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

                {/* ✅ Edit Button - Only show if not completed AND user has permission */}
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
                                            disabled={loadingExistingData}
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
                                        <GrayoutField isDisabled={plantExists && dataExists && !isEditMode}>
                                            <ProcessField
                                                apiUrl={`${API_BASE_URL}/water-process`}
                                                value={formData.process}
                                                onChange={handleProcessChange}
                                                className="modern-input dropdown-bottom"
                                            />
                                        </GrayoutField>
                                        <div className="error-container">
                                            {errors.process && <p className="error-text">{errors.process}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                        <GrayoutField isDisabled={plantExists && dataExists && !isEditMode}>
                                            <ApplyDateInput
                                                value={formData.applyDate}
                                                onChange={handleChange}
                                                className="modern-input"
                                            />
                                        </GrayoutField>
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
                                        <GrayoutField isDisabled={plantExists && dataExists && !isEditMode}>
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
                                        </GrayoutField>
                                        <div className="error-container">
                                            {errors.Organization && <p className="error-text">{errors.Organization}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                        <GrayoutField isDisabled={plantExists && dataExists && !isEditMode}>
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
                                        </GrayoutField>

                                        {/* ✅ Display Existing Tower Files Summary */}


                                        <div className="error-container">
                                            {errors.noOfTowers && <p className="error-text">{errors.noOfTowers}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label className="field-label">
                                        <FolderUp className="label-icon" size={20} /> Tower Documents*
                                    </label>
                                    <div className="upload-container">
                                        <GrayoutField isDisabled={plantExists && dataExists && !isEditMode}>
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
                                                <FaUpload className="upload-icon" /> Upload Tower Documents
                                                <span className="upload-count">
                                                    {towerDocuments.flatMap(t => t.documents).length > 0 &&
                                                        `(${towerDocuments.flatMap(t => t.documents).length} new)`}
                                                </span>
                                            </button>
                                        </GrayoutField>

                                        {/* ✅ Display Existing Tower Files - FIXED POSITION (same as other documents) */}
                                        {plantExists && dataExists && Object.keys(existingTowerFiles).length > 0 && (
                                            <div style={{ marginTop: '8px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // This will show all tower files in a modal
                                                        const allTowerFiles = Object.values(existingTowerFiles).flat();
                                                        setCurrentViewFiles(allTowerFiles);
                                                        setCurrentFileType('tower');
                                                        setDocumentViewModal(true);
                                                    }}
                                                    style={{
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
                                                    View existing tower files: {Object.keys(existingTowerFiles).length} tower(s)
                                                </button>
                                            </div>
                                        )}

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
        <GrayoutField isDisabled={plantExists && dataExists && !isEditMode}>
            <button
                type="button"
                className="upload-button"
                onClick={() => setAmountPaidDocModal(true)}
            >
                <FaUpload className="upload-icon" /> Upload Documents
                <span className="upload-count">
                    {AmountPaidDocs.length > 0 &&
                        `(${AmountPaidDocs.length} new)`}
                </span>
            </button>
        </GrayoutField>

        {/* Display Existing Upload Documents */}
        {plantExists && dataExists && existingAmountPaidFiles.length > 0 && (
            <div style={{ marginTop: '8px' }}>
                <button
                    type="button"
                    // In your button onClick handlers:
onClick={() => {
    const filteredFiles = filterDeletedDocs(existingAmountPaidFiles, 'amount');
    if (filteredFiles.length > 0) {
        viewExistingDocuments(filteredFiles, 'amount');
    } else {
        toast.info("No upload documents available to view");
    }
}}
                    style={{
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
                    View Existing Upload Documents ({existingAmountPaidFiles.length})
                </button>
                
                {/* Show file names summary */}
               
            </div>
        )}

        <div className="error-container">
            {errors.AmountPaidDocs && <p className="error-text">{errors.AmountPaidDocs}</p>}
        </div>
    </div>
</div>

                            </div>

                        </div>

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
        <GrayoutField isDisabled={plantExists && dataExists && !isEditMode}>
            <button
                type="button"
                className="upload-button"
                onClick={() => setShowFeasibilityModal(true)}
            >
                <FaUpload className="upload-icon" /> Upload Other Documents
                <span className="upload-count">
                    {feasibilityDocs.length > 0 &&
                        `(${feasibilityDocs.length} new)`}
                </span>
            </button>
        </GrayoutField>

        {/* Display Existing Other Documents */}
        {plantExists && dataExists && existingFeasibilityFiles.length > 0 && (
            <div style={{ marginTop: '8px' }}>
                <button
                    type="button"
                    onClick={() => {
                        const filteredFiles = filterDeletedDocs(existingFeasibilityFiles, 'feasibility');
                        if (filteredFiles.length > 0) {
                            viewExistingDocuments(filteredFiles, 'feasibility');
                        } else {
                            toast.info("No other documents available to view");
                        }
                    }}
                    style={{
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
                    View Existing Other Documents ({existingFeasibilityFiles.length})
                </button>
                
                {/* Show file names summary */}
                
            </div>
        )}

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
                                        {/* FIXED: Remove GrayoutField wrapper for Comments */}
                                        <textarea
                                            name="Comments"
                                            value={formData.Comments}
                                            onChange={handleChange}
                                            className="modern-input"
                                            placeholder="Enter your comments"
                                            rows="2"
                                            style={{
                                                backgroundColor: plantExists && dataExists && !isEditMode ? '#f5f5f5' : 'white',
                                                color: plantExists && dataExists && !isEditMode ? '#666' : 'inherit',
                                                cursor: plantExists && dataExists && !isEditMode ? 'not-allowed' : 'text'
                                            }}
                                            readOnly={plantExists && dataExists && !isEditMode}
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
                                className={`submit-button ${plantExists && dataExists && !isEditMode ? 'grayout-submit-button' : ''} ${isSubmitting ? "submitting" : ""}`}
                                disabled={plantExists && dataExists && !isEditMode || isSubmitting}
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
                                                    {tower.documents.length > 0 && `(${tower.documents.length} new)`}
                                                </span>
                                            </button>
                                        </div>

                                        {/* ✅ Display Existing Tower Files - Compact version */}
                                        {existingTowerFiles[tower.towerId] && existingTowerFiles[tower.towerId].length > 0 && (
                                            <div className="compact-files-list" style={{ marginTop: '8px' }}>
                                                <div className="compact-files-header">
                                                    📄 Existing ({existingTowerFiles[tower.towerId].length})
                                                </div>
                                                {existingTowerFiles[tower.towerId].map((file, index) => (
                                                    <div key={`existing-tower-${tower.towerId}-${index}`} className="compact-file-item">
                                                        <div className="compact-file-info">
                                                            <span className="compact-file-name" title={file.name}>
                                                                {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => window.open(file.url, '_blank')}
                                                            title="View"
                                                            className="compact-view-btn"
                                                        >
                                                            <Eye size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

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
                    disabled={plantExists && dataExists && !isEditMode}
                />
                <WaterDocUploadModal
                    show={showFeasibilityModal}
                    onClose={() => setShowFeasibilityModal(false)}
                    linkDocs={feasibilityDocs}
                    setLinkDocs={setFeasibilityDocs}
                    title="Other Document (PDF Only)"
                    showLandDocs={false}
                    showOthDocs={false}
                    disabled={plantExists && dataExists && !isEditMode}
                />

                <ReusableDialog
                    open={confirmOpen}
                    title={plantExists && dataExists && isEditMode ? "Confirm Update" : "Confirm Submission"}
                    message={
                        plantExists && dataExists && isEditMode
                            ? "⚠️ Warning: This will replace existing files with newly uploaded files. Are you sure you want to continue?"
                            : "Are you sure you want to submit this application? You will be redirected to the create page after successful submission."
                    }
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={handleConfirmSubmit}
                    confirmText={plantExists && dataExists && isEditMode ? "Update" : "Submit"}
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
        </>
    );
};

export default Ghmc;



     