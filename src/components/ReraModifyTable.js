import React, { useEffect, useState, useMemo, useContext } from "react";
import {
  Nav,
  Form,
  Button,
  Row,
  Col,
  Badge,
  Modal,
  Card,
  Alert,
  ListGroup,
} from "react-bootstrap"; // 08-12-2025: Added ListGroup
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import ReraDocUploadModal from "./ReraDocUploadModal";
import { FaArrowLeft, FaCheckCircle, FaFileAlt } from "react-icons/fa";

import { Context } from "../context/ContextData";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { getMasterByLoc } from "../api/Api";
import EmailSelectionModal from "./EmailModal";

// Define the sub-levels as a constant
const SUB_LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4"];

const ReraModifyTable = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  // All state and logic remains exactly the same.
  const [steps, setSteps] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  // const [storeData, setStoreData] = useState([]);
  const [formData, setFormData] = useState({
    loc: "",
    applyDate: "",
    comments: "",
    prjName: "",
    address: "",
    fromDate: "",
    toDate: "",
    subLevelStatus: "Yes",
  });
  const [newDocs, setNewDocs] = useState([]);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [nextStepDetails, setNextStepDetails] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [demoteOptions, setDemoteOptions] = useState([]);
  const [levelToSubmit, setLevelToSubmit] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  const [errors, setErrors] = useState({});
  // 08-12-2025: Added state for logs modal
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ADD THIS: PDF validation error state
  const [uploadError, setUploadError] = useState("");

  // State to track if Level 4 is completed
  const [isLevel4Completed, setIsLevel4Completed] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState(null);  //-----------login userstate
  //-----updated on 26-12-2025 by rajakumari.m--------------------------------------------------------------------
  const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  //-----------------------------------------------------------------------------------------------------------

  const {
    storeData,
    setStoreData,
    totalMasterData,
    setHeaderData,
    headerData,
    setRespModifyData,
  } = useContext(Context);

  useEffect(() => {
    setHeaderData(null);
  }, []);

  // --- 2. Check User Login ---
  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    const userString = localStorage.getItem("user"); // Changed to 'user' to be safe
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
    if (steps.length > 0 && storeData.length > 0) {
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.PROCESS?.trim());

      const allCompleted = steps.every((step) =>
        completedProcesses.includes(step.PROCESS?.trim())
      );

      setAllStepsCompleted(allCompleted);
    } else {
      setAllStepsCompleted(false);
    }
  }, [steps, storeData]);

  const renderCompletionMessage = () => {
    return (
     <Card className="p-4 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
  <Card.Body className="position-relative">
    {/* Back Button in top right corner - Updated to green background */}
    <div className="position-absolute top-0 end-0 p-3">
      <Button 
        variant="success" // Changed from outline-primary to success
        size="sm"
        onClick={() => {
          // Reset everything to show fresh form
          setSelectedPlant("");
          setHeaderData(null);
          setSelectedProcessDetails(null);
          setImmediateNextStep(null);
          setImmediateNextStepIndex(-1);
          setFormData({
            loc: "",
            applyDate: "",
            fromDate: "",
            toDate: "",
            comments: "",
            prjName: "",
            address: "",
            subLevelStatus: "Yes",
          });
          setStoreData([]);
          setAllStepsCompleted(false);
        }}
        className="d-flex align-items-center gap-1 text-white" // Added text-white for white text
      >
        <FaArrowLeft /> Back to start
      </Button>
    </div>
    
    {/* Content */}
    <div className="text-center pt-4">
      <FaCheckCircle size={64} className="text-success mb-3" />
      <h3 className="text-success mb-3">Congratulations! 🎉</h3>
      <h5 className="text-muted mb-4">All process steps have been completed successfully!</h5>
      <Alert variant="success">
        <Alert.Heading>Project Completion Status</Alert.Heading>
        <p>
          All {steps.length} steps for <strong>{selectedPlant}</strong> have
          been completed successfully.
        </p>
        <hr />
        <p className="mb-0">
          Click on any completed step above to view its details or click Back button to start fresh.
        </p>
      </Alert>
    </div>
  </Card.Body>
</Card>
  );
};

  const handleEmailSubmit = () => {
    // First validate the form

    //-----------------------added on 26-12-2025 by rajakumari.m----------------------------------------------
    if (selectedProcessDetails) {
      Swal.fire({
        icon: "info",
        title: "Viewing Completed Step",
        text: "You are viewing a completed step. No updates can be made.",
        timer: 2000,
      });
      return;
    }
    //--------------------------------------------------------------------------------------------------------

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Scroll to the first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }

      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in all required fields marked with *",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    // Clear any previous errors
    setErrors({});

    // If validation passes, show email modal
    setShowEmailModal(true);
  };

  //-------------added on 26-12-2025 by rajakumari.m----------------------------------------------------------------------
  const handleProcessClick = (e, process) => {
    e.stopPropagation();
    console.log("Clicked:", process);

    // Find the process details from storeData
    const processDetails = storeData.find(
      (item) =>
        item.PROCESS?.toLowerCase().trim() === process.toLowerCase().trim()
    );

    setSelectedProcessDetails(processDetails || null);

    // If process details found, also set it as the active step
    if (processDetails) {
      const stepIndex = steps.findIndex(
        (step) =>
          step.PROCESS?.toLowerCase().trim() === process.toLowerCase().trim()
      );
      if (stepIndex !== -1) {
        setActiveStep(stepIndex);
      }
    }
  };

  const handleViewNextStep = () => {
    setSelectedProcessDetails(null);

    if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
      const nextStepName = steps[immediateNextStepIndex]?.PROCESS;

      if (nextStepName) {
        axios
          .get(
            `${API_BASE_URL}/rera-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(nextStepName)}`
          )
          .then((res) => {
            setNextStepDetails(res.data);
          })
          .catch((err) =>
            console.error("Error fetching next step details:", err)
          );
      }
    }
  };

  useEffect(() => {
    if (selectedProcessDetails) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: selectedProcessDetails.APPLY_DT,
        comments: selectedProcessDetails.COMMENTS || "",
        fromDate: selectedProcessDetails.FRM_DT || "",
        toDate: selectedProcessDetails.TO_DT || "",
        prjName: selectedProcessDetails.PROJECT_NAME || "",
        address: selectedProcessDetails.ADDRESS || "",
        subLevelStatus:
          selectedProcessDetails.LEVEL_STATUS === "No" ? "No" : "Yes",
      }));
    }
  }, [selectedProcessDetails]);

  //-----------------------------------------------------------------------------------------------------------------
  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);

    // Proceed with form submission
    await handleConfirmSubmit(emails);
  };

  // All useEffect hooks for data fetching are correct and unchanged.
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/rera-process`)
      .then((res) => setSteps(res.data))
      .catch((err) => console.error("Error fetching RERA processes:", err));
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/rera-plants`)
      .then((res) => setPlants(res.data))
      .catch((err) => console.error("Error fetching RERA plants:", err));
  }, []);

  useEffect(() => {
    setStoreData([]);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setNextStepDetails(null);
    setProjectInfo({ prjName: "", address: "" });
    // CHANGE THIS: Always set subLevelStatus to "Yes" when resetting
    setFormData({
      loc: selectedPlant,
      applyDate: "",
      comments: "",
      prjName: "",
      address: "",
      fromDate: "",
      toDate: "",
      subLevelStatus: "Yes",
    });
    setIsLevel4Completed(false);

    if (selectedPlant && steps.length > 0) {
      axios
        .get(`${API_BASE_URL}/rera-data?plant=${selectedPlant}`)
        .then((res) => {
          const fetchedData = res.data;

          setStoreData(fetchedData);
          if (fetchedData && fetchedData.length > 0) {
            const firstRecord = fetchedData[0];
            const info = {
              prjName: firstRecord.PROJECT_NAME || "",
              address: firstRecord.ADDRESS || "",
            };
            setProjectInfo(info);
            setFormData((prev) => ({ loc: selectedPlant, ...prev, ...info }));
          }
          const completedProcesses = fetchedData
            .filter((item) => item.UPDATED === "YES")
            .map((item) => item.PROCESS);
          const nextStep = steps.find(
            (step) => !completedProcesses.includes(step.PROCESS)
          );

          // --- START: CORRECTED LOGIC ---
          if (nextStep) {
            // This part is for when there IS a next step
            setImmediateNextStep(nextStep);
            setImmediateNextStepIndex(steps.indexOf(nextStep));
            const apiUrl = `${API_BASE_URL}/rera-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(nextStep.PROCESS)}`;
            return axios.get(apiUrl);
          } else {
            // ✅ NEW LOGIC: This runs when `nextStep` is undefined, meaning all steps are complete.
            // We check if there are any completed processes to ensure we don't do this on an empty project.
            if (
              completedProcesses.length === steps.length &&
              steps.length > 0
            ) {
              // Set the index to a number higher than any possible step index.
              // This will cause the rendering logic `(idx < immediateNextStepIndex)` to be true for all steps.
              setImmediateNextStepIndex(steps.length);
            }
            return Promise.resolve(null);
          }
          // --- END: CORRECTED LOGIC ---
        })
        .then((detailsRes) => {
          if (detailsRes && detailsRes.data) {
            setNextStepDetails(detailsRes.data);

            // Check if Level 4 is completed
            if (
              detailsRes.data.LEVEL === "Level 4" &&
              detailsRes.data.LEVEL_STATUS === "Completed"
            ) {
              setIsLevel4Completed(true);
            } else {
              setIsLevel4Completed(false);
            }
          }
        })
        .catch((err) =>
          console.error("Error during data fetching process:", err)
        );
    }
  }, [selectedPlant, steps]);

 useEffect(() => {
  if (
    nextStepDetails &&
    typeof nextStepDetails === "object" &&
    Object.keys(nextStepDetails).length > 0
  ) {
    const details = nextStepDetails;

    console.log("=== DEBUG: Setting Form Data ===");
    console.log("- LEVEL:", details.LEVEL);
    console.log("- LEVEL_STATUS:", details.LEVEL_STATUS);
    
    // ✅ FIX: Check if Level 4 is completed and preserve it
    const isLevel4Complete = details.LEVEL === "Level 4" && details.LEVEL_STATUS === "Completed";
    
    setFormData((prev) => ({
      ...prev,
      applyDate: details.APPLY_DT,
      fromDate: details.FRM_DT || "",
      toDate: details.TO_DT || "",
      comments: "",
      // ✅ FIX: If Level 4 is completed, set status to "Completed"
      subLevelStatus: isLevel4Complete ? "Completed" : (details.LEVEL_STATUS === "No" ? "No" : "Yes"),
    }));
    
    // Set the Level 4 completed flag
    setIsLevel4Completed(isLevel4Complete);
    console.log("- Set isLevel4Completed to:", isLevel4Complete);
    
  } else {
    setFormData((prev) => ({
      ...prev,
      applyDate: "",
      fromDate: "",
      toDate: "",
      comments: "",
    }));
    setIsLevel4Completed(false);
  }
}, [nextStepDetails]);
  // useEffect(() => {
  //   if (
  //     nextStepDetails &&
  //     typeof nextStepDetails === "object" &&
  //     Object.keys(nextStepDetails).length > 0
  //   ) {
  //     const details = nextStepDetails;

  //     setFormData((prev) => ({
  //       ...prev,
  //       applyDate: details.APPLY_DT,
  //       fromDate: details.FRM_DT || "",
  //       toDate: details.TO_DT || "",
  //       comments: "",
  //       // CHANGE THIS LINE: Always default to "Yes" when loading data
  //       subLevelStatus: "Yes", // Changed from: details.LEVEL_STATUS === "No" ? "No" : "Yes"
  //     }));
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       applyDate: "",
  //       fromDate: "",
  //       toDate: "",
  //       comments: "",
  //     }));
  //   }
  // }, [nextStepDetails]);
  // Validation function

  const validateForm = () => {
    const newErrors = {};

    // REMOVE Plant validation - it's not required
    // if (!formData.loc) {
    //   newErrors.loc = "Plant selection is required";
    // }

    // Apply Date validation (for all steps except step 3)
    if (immediateNextStepIndex !== 2) {
      if (!formData.applyDate) {
        newErrors.applyDate = "Apply Date is required";
      }
    }

    // From Date and To Date validation (for step 3)
    if (immediateNextStepIndex === 2) {
      if (!formData.fromDate) {
        newErrors.fromDate = "From Date is required";
      }
      if (!formData.toDate) {
        newErrors.toDate = "To Date is required";
      }
    }

    // Comments validation
    if (!formData.comments || formData.comments.trim() === "") {
      newErrors.comments = "Comments are required";
    }

    // REMOVE Project Name and Address validation - they're not required
    // if (immediateNextStepIndex === 0) {
    //   if (!formData.prjName || formData.prjName.trim() === "") {
    //     newErrors.prjName = "Project Name is required";
    //   }
    //   if (!formData.address || formData.address.trim() === "") {
    //     newErrors.address = "Address is required";
    //   }
    // }

    return newErrors;
  };
  const activeSubLevelIndex = useMemo(() => {
  const currentLevel = nextStepDetails?.LEVEL;
  const currentStatus = nextStepDetails?.LEVEL_STATUS;
  
  console.log("=== DEBUG: activeSubLevelIndex ===");
  console.log("- currentLevel:", currentLevel);
  console.log("- currentStatus:", currentStatus);
  
  // ✅ FIX 1: Properly handle Level 4 Completed status
  if (currentLevel === "Level 4" && currentStatus === "Completed") {
    console.log("- Level 4 is completed, returning index 4");
    return SUB_LEVELS.length; // This will be 4 for Level 4 completed
  }
  
  if (!currentLevel) {
    console.log("- No current level, returning 0");
    return 0;
  }
  
  let currentIndex = SUB_LEVELS.indexOf(currentLevel);
  if (currentIndex === -1) {
    currentIndex = 0;
  }
  
  // ✅ FIX 2: Only advance if status is "Yes"
  if (currentStatus === "Yes") {
    console.log("- Status is Yes, advancing to next level:", currentIndex + 1);
    return currentIndex + 1;
  }
  
  console.log("- Status is not Yes, staying at level:", currentIndex);
  return currentIndex;
}, [nextStepDetails]);
  // The activeSubLevelIndex logic is correct and unchanged.
  // const activeSubLevelIndex = useMemo(() => {
  //   const currentLevel = nextStepDetails?.LEVEL;
  //   const currentStatus = nextStepDetails?.LEVEL_STATUS;
  //   if (currentLevel === "Level 4" && currentStatus === "Completed") {
  //     return SUB_LEVELS.length;
  //   }

  //   if (!currentLevel) {
  //     return 0;
  //   }
  //   let currentIndex = SUB_LEVELS.indexOf(currentLevel);
  //   if (currentIndex === -1) {
  //     currentIndex = 0;
  //   }
  //   if (currentStatus === "Yes") {
  //     return currentIndex + 1;
  //   }
  //   return currentIndex;
  // }, [nextStepDetails]);

  useEffect(() => {
  if (immediateNextStepIndex === 1) {
    if (formData.subLevelStatus === "Yes") {
      // For "Yes", set to current active level
      setLevelToSubmit(SUB_LEVELS[activeSubLevelIndex] || "Level 1");
    } else if (formData.subLevelStatus === "Reject") {
      // For "Reject", keep current levelToSubmit (set in handleChange)
      // If not set, default to Level 1
      if (!levelToSubmit) {
        setLevelToSubmit(SUB_LEVELS[0]);
      }
    } else if (formData.subLevelStatus === "No") {
      // For "No", set to current active level
      setLevelToSubmit(SUB_LEVELS[activeSubLevelIndex] || "Level 1");
    }
  } else {
    setLevelToSubmit("");
  }
}, [activeSubLevelIndex, immediateNextStepIndex, formData.subLevelStatus]);
useEffect(() => {
  if (immediateNextStepIndex === 1 && !levelToSubmit) {
    // Set default levelToSubmit when the form loads
    setLevelToSubmit(SUB_LEVELS[activeSubLevelIndex] || "Level 1");
  }
}, [immediateNextStepIndex, activeSubLevelIndex]);

  // This hook is correct and unchanged.
  useEffect(() => {
    if (immediateNextStepIndex === 1 && SUB_LEVELS[activeSubLevelIndex]) {
      setLevelToSubmit(SUB_LEVELS[activeSubLevelIndex]);
    } else {
      setLevelToSubmit("");
    }
  }, [activeSubLevelIndex, immediateNextStepIndex]);

  const handleChange = async (e) => {
  const { name, value } = e.target;
  if (errors[name]) {
    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  }
  
  if (name === "loc") {
    setSelectedPlant(value);
    try {
      const res = await getMasterByLoc(value);
      if (res) {
        setHeaderData(res);
      } else {
        setHeaderData(null);
        setFormData((prev) => ({
          ...prev,
        }));
      }
    } catch (err) {
      console.error("Error fetching master by loc:", err);
      setHeaderData(null);
      setFormData((prev) => ({
        ...prev,
      }));
    }
  }

  // Handle "Reject" option
  if (name === "subLevelStatus" && value === "Reject") {
    if (activeSubLevelIndex === 1) {
      // For Level 2: Reject to Level 1 (no modal needed)
      Swal.fire({
        title: "Confirm Rejection",
        text: "This will reset the task to Level 1. Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, reset to Level 1",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          setLevelToSubmit("Level 1");
          setFormData(prev => ({ ...prev, subLevelStatus: "Reject" }));
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: "Task will be reset to Level 1 on submit.",
            showConfirmButton: false,
            timer: 3000
          });
        } else {
          // If cancelled, keep the current selection
          setFormData(prev => ({ ...prev, subLevelStatus: "Yes" }));
        }
      });
      return;
    } else if (activeSubLevelIndex === 2) {
      // For Level 3: Show modal with options Level 2 or Level 1
      setDemoteOptions(["Level 2", "Level 1"]);
      setShowDemoteModal(true);
      return;
    } else if (activeSubLevelIndex === 3) {
      // For Level 4: Show modal with options Level 3, Level 2, or Level 1
      setDemoteOptions(["Level 3", "Level 2", "Level 1"]);
      setShowDemoteModal(true);
      return;
    } else if (activeSubLevelIndex === 0) {
      // For Level 1: Already at first level, just show message
      setLevelToSubmit("Level 1");
      setFormData((prev) => ({ ...prev, subLevelStatus: "Reject" }));
      
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: `Task will stay at Level 1 on submit.`,
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }
  }
//--------------31-12-2025 by rajakumari.m-----------------------------------------------------------------------
  // ✅ FIX: Reset levelToSubmit when changing from "No" or "Reject" back to "Yes"
 // Handle "Yes" option
if (name === "subLevelStatus" && value === "Yes") {
  // For "Yes", set to current active level
  const currentLevel = SUB_LEVELS[activeSubLevelIndex] || "Level 1";
  setLevelToSubmit(currentLevel);
  setFormData((prev) => ({ ...prev, subLevelStatus: "Yes" }));
  
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "info",
    title: `Task will progress from ${currentLevel} on submit.`,
    showConfirmButton: false,
    timer: 3000,
  });
  return;
}
//--------------------------------------------------------------------------------------------------------------------
  // Handle "No" option - stay at current level
  if (name === "subLevelStatus" && value === "No") {
    // Keep the current level
    const currentLevel = SUB_LEVELS[activeSubLevelIndex] || SUB_LEVELS[0];
    setLevelToSubmit(currentLevel);
    setFormData((prev) => ({ ...prev, subLevelStatus: "No" }));
    
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: `Task will stay at ${currentLevel} on submit.`,
      showConfirmButton: false,
      timer: 3000,
    });
    return;
  }

  // For all other changes
  setFormData((prev) => ({ ...prev, [name]: value }));
};
const handleDemoteConfirm = (newLevel) => {
  if (newLevel) {
    setLevelToSubmit(newLevel);
    setFormData((prev) => ({ ...prev, subLevelStatus: "Reject" }));
    Swal.fire({
      icon: "info",
      title: "Task Rejected",
      text: `The task will be reset to ${newLevel}. Click the main 'Submit' button to save this change.`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3500,
    });
  }
  setShowDemoteModal(false);
};
  const handleDeleteDocument = async (docType, fileName, index) => {
    try {
      const result = await Swal.fire({
        title: "Delete Document?",
        text: `Are you sure you want to delete ${fileName}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      const response = await axios.delete(`${API_BASE_URL}/rera-docu-delete`, {
        data: {
          loc: formData.loc,
          process: immediateNextStep?.PROCESS || "",
          doc_type: docType,
          file_name: fileName,
        },
      });

      console.log("Delete response:", response);

      // ✅ Remove deleted item from BOTH formData AND nextStepDetails
      setFormData((prev) => ({
        ...prev,
        existingDocs: prev.existingDocs?.filter((_, i) => i !== index) || [],
        existingNames: prev.existingNames?.filter((_, i) => i !== index) || [],
      }));

      // ✅ ALSO update nextStepDetails to reflect the deletion without refresh
      if (nextStepDetails?.UPLOAD_DOC) {
        try {
          const currentDocs = JSON.parse(nextStepDetails.UPLOAD_DOC);
          const updatedDocs = currentDocs.filter((doc, i) => i !== index);

          setNextStepDetails((prev) => ({
            ...prev,
            UPLOAD_DOC: JSON.stringify(updatedDocs),
          }));
        } catch (error) {
          console.error("Error updating nextStepDetails:", error);
        }
      }

      Swal.fire("Deleted!", "Document has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting document:", error);
      Swal.fire("Error!", "Failed to delete document.", "error");
    }
  };

//     const handleConfirmSubmit = async (emails) => {
//   setIsSubmitting(true);
//   setUploadError("");

//   try {
//     console.log("=== DEBUG: Starting Submission ===");
//     console.log("Current state:");
//     console.log("- immediateNextStepIndex:", immediateNextStepIndex);
//     console.log("- formData.loc:", formData.loc);
//     console.log("- immediateNextStep:", immediateNextStep);
//     console.log("- formData.subLevelStatus:", formData.subLevelStatus);
//     console.log("- levelToSubmit:", levelToSubmit);
//     console.log("- activeSubLevelIndex:", activeSubLevelIndex);

//     // --- VALIDATION ---
//     if (immediateNextStepIndex === 2 && (!formData.fromDate || !formData.toDate)) {
//       await Swal.fire(
//         "Validation Error",
//         "Please provide both a 'From Date' and a 'To Date' for this step.",
//         "error"
//       );
//       return;
//     }

//     if (immediateNextStepIndex !== 2 && !formData.applyDate) {
//       await Swal.fire(
//         "Validation Error",
//         "Please provide an 'Apply Date' for this step.",
//         "error"
//       );
//       return;
//     }

//     if (!formData.loc || !immediateNextStep) {
//       await Swal.fire(
//         "Validation Error",
//         "Please select a Plant and ensure a process step is active.",
//         "error"
//       );
//       return;
//     }

//     if (newDocs.length > 0) {
//       const nonPDFFiles = newDocs.filter(
//         (file) =>
//           file.type !== "application/pdf" &&
//           !file.name.toLowerCase().endsWith(".pdf")
//       );

//       if (nonPDFFiles.length > 0) {
//         setUploadError(
//           "Only PDF files are allowed. Please remove non-PDF files."
//         );
//         return;
//       }
//     }

//     // --- : 'fetch User';
//     let currentUserName = loggedInUser?.username || "";

//     // --- PREPARE PAYLOAD ---
//     const payload = new FormData();
//     payload.append("loc", formData.loc);
//     payload.append("process", immediateNextStep.PROCESS);
//     payload.append("comments", formData.comments || "");
//     payload.append("username", currentUserName);

//     emails.forEach((email, i) => {
//       payload.append(`emails[${i}]`, email);
//     });

//     if (immediateNextStepIndex === 0) {
//       payload.append("prjName", formData.prjName || "");
//       payload.append("address", formData.address || "");
//     } else {
//       payload.append("prjName", projectInfo.prjName || "");
//       payload.append("address", projectInfo.address || "");
//     }

//     // Determine which date to use as the primary 'applyDate'
//     const applyDateToSend =
//       immediateNextStepIndex === 2 ? formData.fromDate : formData.applyDate;
//     payload.append("applyDate", applyDateToSend);
//     payload.append("fromDate", formData.fromDate);
//     payload.append("toDate", formData.toDate);

//     // Handle task status - CRITICAL FIX HERE
//     if (immediateNextStepIndex === 1) {
//       console.log("=== DEBUG: Handling task status ===");
//       console.log("- formData.subLevelStatus:", formData.subLevelStatus);
//       console.log("- levelToSubmit:", levelToSubmit);
//       console.log("- SUB_LEVELS[activeSubLevelIndex]:", SUB_LEVELS[activeSubLevelIndex]);
      
//       // For "Yes", we should submit the CURRENT active level
//       // For "Reject", we submit the selected rejection level (levelToSubmit)
//       // For "No", we submit the current level
//       let pendingTaskToSubmit = "";
      
//       if (formData.subLevelStatus === "Yes") {
//         // When "Yes", submit the current active level (will progress to next)
//         pendingTaskToSubmit = SUB_LEVELS[activeSubLevelIndex] || "Level 1";
//       } else if (formData.subLevelStatus === "Reject") {
//         // When "Reject", submit the selected rejection level
//         pendingTaskToSubmit = levelToSubmit || SUB_LEVELS[0];
//       } else if (formData.subLevelStatus === "No") {
//         // When "No", submit the current level (stay at same)
//         pendingTaskToSubmit = SUB_LEVELS[activeSubLevelIndex] || "Level 1";
//       }
      
//       console.log("- pendingTaskToSubmit:", pendingTaskToSubmit);
      
//       // Make sure we have a valid pending task
//       if (!pendingTaskToSubmit) {
//         console.error("ERROR: No pending task determined!");
//         pendingTaskToSubmit = SUB_LEVELS[0];
//       }
      
//       payload.append("pending_task", pendingTaskToSubmit);
      
//       // For backend: "Reject" becomes "No"
//       const backendStatus = formData.subLevelStatus === "Reject" ? "No" : formData.subLevelStatus;
//       payload.append("task_status", backendStatus);
      
//       console.log("- Backend task_status:", backendStatus);
//     }

//     newDocs.forEach((file) => payload.append("UPLOAD_DOC[]", file));

//     console.log("=== DEBUG: Final Payload ===");
//     for (const [key, value] of payload.entries()) {
//       console.log(`${key}:`, value);
//     }
//     console.log("=============================");

//     // --- SUBMIT TO API ---
//     const existingRecord = storeData.find(
//       (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim()
//     );
//     const apiUrl = existingRecord
//       ? `${API_BASE_URL}/rera-modify`
//       : `${API_BASE_URL}/rera-submit`;

//     console.log("=== DEBUG: Making API Call ===");
//     console.log("- API URL:", apiUrl);
//     console.log("- Is existing record?", !!existingRecord);

//     const response = await axios.post(apiUrl, payload);
//     console.log("=== DEBUG: API Response ===");
//     console.log("- Status:", response.status);
//     console.log("- Data:", response.data);

//     await Swal.fire({
//       icon: "success",
//       title: existingRecord ? "Updated!" : "Submitted!",
//       text: "Your data has been saved successfully.",
//       timer: 1500,
//       showConfirmButton: false,
//     });

//     // --- RESET STATE AFTER SUCCESSFUL SUBMISSION ---
//     console.log("=== DEBUG: Resetting state ===");
//     setFormData({
//       loc: "",
//       applyDate: "",
//       fromDate: "",
//       toDate: "",
//       comments: "",
//       prjName: "",
//       address: "",
//       subLevelStatus: "Yes", // Reset to default
//     });
//     setNewDocs([]);
//     setSelectedPlant("");
//     setStoreData([]);
//     setImmediateNextStep(null);
//     setImmediateNextStepIndex(-1);
//     setNextStepDetails(null);
//     setProjectInfo({ prjName: "", address: "" });
//     setIsLevel4Completed(false);
//     setLevelToSubmit(""); // Reset levelToSubmit
    
//   } catch (error) {
//     console.error("=== DEBUG: Submission failed ===");
//     console.error("Error:", error);
//     console.error("Error response:", error.response?.data);
//     console.error("Error message:", error.message);
    
//     let errorMessage = "Please check the console for details.";
//     if (error.response?.data?.message) {
//       errorMessage = error.response.data.message;
//     } else if (error.message) {
//       errorMessage = error.message;
//     }
    
//     await Swal.fire(
//       "Submission Failed",
//       errorMessage,
//       "error"
//     );
//   } finally {
//     setIsSubmitting(false);
//     console.log("=== DEBUG: Submission completed ===");
//   }
// };

//-------2-1-2026 by rajakumari.m-------------------------------------------------------------------
// const handleConfirmSubmit = async (emails) => {
//   setIsSubmitting(true);
//   setUploadError("");

//   try {
//     // Check if we're updating a completed process or submitting a new one
//     const isUpdateMode = selectedProcessDetails !== null;

//     // --- VALIDATION ---
//     if (!isUpdateMode) {
//       // Only validate for new submissions
//       if (immediateNextStepIndex === 2 && (!formData.fromDate || !formData.toDate)) {
//         await Swal.fire(
//           "Validation Error",
//           "Please provide both a 'From Date' and a 'To Date' for this step.",
//           "error"
//         );
//         return;
//       }

//       if (immediateNextStepIndex !== 2 && !formData.applyDate) {
//         await Swal.fire(
//           "Validation Error",
//           "Please provide an 'Apply Date' for this step.",
//           "error"
//         );
//         return;
//       }
//     }

//     if (!formData.loc) {
//       await Swal.fire(
//         "Validation Error",
//         "Please select a Plant.",
//         "error"
//       );
//       return;
//     }

//     // --- : 'fetch User';
//     let currentUserName = loggedInUser?.username || "";

//     // --- PREPARE PAYLOAD ---
//     const payload = new FormData();
//     payload.append("loc", formData.loc);
//     payload.append("username", currentUserName);

//     emails.forEach((email, i) => {
//       payload.append(`emails[${i}]`, email);
//     });

//     if (isUpdateMode) {
//       // Update mode: updating existing process
//       payload.append("process", selectedProcessDetails.PROCESS);
//       payload.append("applyDate", formData.applyDate);
//       payload.append("comments", formData.comments || "");
//       payload.append("id", selectedProcessDetails.ID); // Pass the ID for update
      
//       // Add other fields if they exist
//       if (selectedProcessDetails.FRM_DT) payload.append("fromDate", selectedProcessDetails.FRM_DT);
//       if (selectedProcessDetails.TO_DT) payload.append("toDate", selectedProcessDetails.TO_DT);
//       if (selectedProcessDetails.PROJECT_NAME) payload.append("prjName", selectedProcessDetails.PROJECT_NAME);
//       if (selectedProcessDetails.ADDRESS) payload.append("address", selectedProcessDetails.ADDRESS);
      
//       // For step 2 specific fields
//       const stepIndex = steps.findIndex(
//         step => step.PROCESS?.toLowerCase().trim() === selectedProcessDetails.PROCESS?.toLowerCase().trim()
//       );
      
//       if (stepIndex === 1 && selectedProcessDetails.LEVEL) {
//         payload.append("pending_task", selectedProcessDetails.LEVEL);
//         payload.append("task_status", selectedProcessDetails.LEVEL_STATUS || "Yes");
//       }
//     } else {
//       // New submission mode
//       payload.append("process", immediateNextStep.PROCESS);
//       payload.append("comments", formData.comments || "");
      
//       // Determine which date to use as the primary 'applyDate'
//       const applyDateToSend =
//         immediateNextStepIndex === 2 ? formData.fromDate : formData.applyDate;
//       payload.append("applyDate", applyDateToSend);
//       payload.append("fromDate", formData.fromDate);
//       payload.append("toDate", formData.toDate);
      
//       if (immediateNextStepIndex === 0) {
//         payload.append("prjName", formData.prjName || "");
//         payload.append("address", formData.address || "");
//       } else {
//         payload.append("prjName", projectInfo.prjName || "");
//         payload.append("address", projectInfo.address || "");
//       }

//       // Handle task status for step 2
//       if (immediateNextStepIndex === 1) {
//         let pendingTaskToSubmit = "";
        
//         if (formData.subLevelStatus === "Yes") {
//           pendingTaskToSubmit = SUB_LEVELS[activeSubLevelIndex] || "Level 1";
//         } else if (formData.subLevelStatus === "Reject") {
//           pendingTaskToSubmit = levelToSubmit || SUB_LEVELS[0];
//         } else if (formData.subLevelStatus === "No") {
//           pendingTaskToSubmit = SUB_LEVELS[activeSubLevelIndex] || "Level 1";
//         }
        
//         if (!pendingTaskToSubmit) {
//           pendingTaskToSubmit = SUB_LEVELS[0];
//         }
        
//         payload.append("pending_task", pendingTaskToSubmit);
//         const backendStatus = formData.subLevelStatus === "Reject" ? "No" : formData.subLevelStatus;
//         payload.append("task_status", backendStatus);
//       }

//       newDocs.forEach((file) => payload.append("UPLOAD_DOC[]", file));
//     }

//     // --- SUBMIT TO API ---
//     const apiUrl = isUpdateMode 
//       ? `${API_BASE_URL}/rera-modify`
//       : `${API_BASE_URL}/rera-submit`;

//     const response = await axios.post(apiUrl, payload);

//     await Swal.fire({
//       icon: "success",
//       title: isUpdateMode ? "Updated!" : "Submitted!",
//       text: "Your data has been saved successfully.",
//       timer: 1500,
//       showConfirmButton: false,
//     });

//     // Refresh data
//     if (selectedPlant) {
//       const res = await axios.get(`${API_BASE_URL}/rera-data?plant=${selectedPlant}`);
//       setStoreData(res.data);
      
//       // If updating, refresh the selected process details
//       if (isUpdateMode) {
//         const updatedProcess = res.data.find(
//           item => item.PROCESS?.trim() === selectedProcessDetails.PROCESS?.trim()
//         );
//         if (updatedProcess) {
//           setSelectedProcessDetails(updatedProcess);
//         }
//       }
//     }

//     // Reset form for new submissions
//     if (!isUpdateMode) {
//       setFormData({
//         loc: "",
//         applyDate: "",
//         fromDate: "",
//         toDate: "",
//         comments: "",
//         prjName: "",
//         address: "",
//         subLevelStatus: "Yes",
//       });
//       setNewDocs([]);
//       setLevelToSubmit("");
//     }
    
//   } catch (error) {
//     console.error("Submission failed:", error);
    
//     let errorMessage = "Please check the console for details.";
//     if (error.response?.data?.message) {
//       errorMessage = error.response.data.message;
//     } else if (error.message) {
//       errorMessage = error.message;
//     }
    
//     await Swal.fire(
//       "Submission Failed",
//       errorMessage,
//       "error"
//     );
//   } finally {
//     setIsSubmitting(false);
//   }
// };


    const handleConfirmSubmit = async (emails) => {
  setIsSubmitting(true);
  setUploadError("");

  try {

    // --- VALIDATION ---
    if (immediateNextStepIndex === 2 && (!formData.fromDate || !formData.toDate)) {
      await Swal.fire(
        "Validation Error",
        "Please provide both a 'From Date' and a 'To Date' for this step.",
        "error"
      );
      return;
    }

    if (immediateNextStepIndex !== 2 && !formData.applyDate) {
      await Swal.fire(
        "Validation Error",
        "Please provide an 'Apply Date' for this step.",
        "error"
      );
      return;
    }

    if (!formData.loc || !immediateNextStep) {
      await Swal.fire(
        "Validation Error",
        "Please select a Plant and ensure a process step is active.",
        "error"
      );
      return;
    }

    if (newDocs.length > 0) {
      const nonPDFFiles = newDocs.filter(
        (file) =>
          file.type !== "application/pdf" &&
          !file.name.toLowerCase().endsWith(".pdf")
      );

      if (nonPDFFiles.length > 0) {
        setUploadError(
          "Only PDF files are allowed. Please remove non-PDF files."
        );
        return;
      }
    }

    // --- : 'fetch User';
    let currentUserName = loggedInUser?.username || "";

    // --- PREPARE PAYLOAD ---
    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("comments", formData.comments || "");
    payload.append("username", currentUserName);

    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    if (immediateNextStepIndex === 0) {
      payload.append("prjName", formData.prjName || "");
      payload.append("address", formData.address || "");
    } else {
      payload.append("prjName", projectInfo.prjName || "");
      payload.append("address", projectInfo.address || "");
    }

    // Determine which date to use as the primary 'applyDate'
    const applyDateToSend =
      immediateNextStepIndex === 2 ? formData.fromDate : formData.applyDate;
    payload.append("applyDate", applyDateToSend);
    payload.append("fromDate", formData.fromDate);
    payload.append("toDate", formData.toDate);

    // Handle task status - CRITICAL FIX HERE
   // Handle task status - CRITICAL FIX HERE
if (immediateNextStepIndex === 1) {
  console.log("=== DEBUG: Handling task status ===");
  console.log("- formData.subLevelStatus:", formData.subLevelStatus);
  console.log("- levelToSubmit:", levelToSubmit);
  console.log("- SUB_LEVELS[activeSubLevelIndex]:", SUB_LEVELS[activeSubLevelIndex]);
  
  let pendingTaskToSubmit = "";
  
  // FIX: Check if Level 4 is completed
  const isLevel4Complete = isLevel4Completed;
  
  if (isLevel4Complete) {
    // If Level 4 is completed, submit "Level 4" as pending task
    pendingTaskToSubmit = "Level 4";
  } else if (formData.subLevelStatus === "Yes") {
    // When "Yes", submit the current active level (will progress to next)
    pendingTaskToSubmit = SUB_LEVELS[activeSubLevelIndex] || "Level 1";
  } else if (formData.subLevelStatus === "Reject") {
    // When "Reject", submit the selected rejection level
    pendingTaskToSubmit = levelToSubmit || SUB_LEVELS[0];
  } else if (formData.subLevelStatus === "No") {
    // When "No", submit the current level (stay at same)
    pendingTaskToSubmit = SUB_LEVELS[activeSubLevelIndex] || "Level 1";
  }
  
  console.log("- pendingTaskToSubmit:", pendingTaskToSubmit);
  console.log("- isLevel4Complete:", isLevel4Complete);
  
  // Make sure we have a valid pending task
  if (!pendingTaskToSubmit) {
    console.error("ERROR: No pending task determined!");
    pendingTaskToSubmit = SUB_LEVELS[0];
  }
  
  payload.append("pending_task", pendingTaskToSubmit);
  
  // For backend: "Reject" becomes "No"
  const backendStatus = formData.subLevelStatus === "Reject" ? "No" : formData.subLevelStatus;
  // If Level 4 is completed, send "Completed" status
  const finalStatus = isLevel4Complete ? "Completed" : backendStatus;
  payload.append("task_status", finalStatus);
  
  console.log("- Backend task_status:", finalStatus);
}
    newDocs.forEach((file) => payload.append("UPLOAD_DOC[]", file));

    console.log("=== DEBUG: Final Payload ===");
    for (const [key, value] of payload.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("=============================");

    // --- SUBMIT TO API ---
    const existingRecord = storeData.find(
      (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim()
    );
    const apiUrl = existingRecord
      ? `${API_BASE_URL}/rera-modify`
      : `${API_BASE_URL}/rera-submit`;

    console.log("=== DEBUG: Making API Call ===");
    console.log("- API URL:", apiUrl);
    console.log("- Is existing record?", !!existingRecord);

    const response = await axios.post(apiUrl, payload);
    console.log("=== DEBUG: API Response ===");
    console.log("- Status:", response.status);
    console.log("- Data:", response.data);

    await Swal.fire({
      icon: "success",
      title: existingRecord ? "Updated!" : "Submitted!",
      text: "Your data has been saved successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
    
    // --- RESET STATE AFTER SUCCESSFUL SUBMISSION ---
    setFormData({ 
      loc: "", 
      applyDate: "", 
      fromDate: "", 
      toDate: "", 
      comments: "", 
      prjName: "", 
      address: "" 
    });
    setNewDocs([]);
    setSelectedPlant("");
    setStoreData([]);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setNextStepDetails(null);
    setProjectInfo({ prjName: "", address: "" });
    setIsLevel4Completed(false);
    
  } catch (error) {
    console.error("Submission failed:", error);
    await Swal.fire("Submission Failed", "Please check the console for details.", "error");
  } finally {
    setIsSubmitting(false);
  }
};
//----------------------------------------------------
   const isUpdatable = selectedProcessDetails?.UPDATED !== "YES";

  
const renderDocumentHistory = () => {
  // First, check if we're viewing a completed step
  const sourceData = selectedProcessDetails || nextStepDetails;
  
  if (!sourceData || typeof sourceData !== "object" || !sourceData.UPLOAD_DOC) {
    return (
      <p className="text-muted text-center mb-0">
        No previous documents for this step.
      </p>
    );
  }

  let documents = [];
  try {
    const parsedDocs = JSON.parse(sourceData.UPLOAD_DOC);
    documents = parsedDocs.map((doc) => ({
      name: doc.file_name,
      url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
    }));
  } catch (error) {
    console.error("Failed to parse UPLOAD_DOC JSON:", error);
    return <p className="text-danger mb-0">Error displaying documents.</p>;
  }

  return documents.length > 0 ? (
    <ListGroup variant="flush">
      <h6 className="text-primary">Uploaded Documents</h6>
      {documents.map((doc, idx) => (
        <ListGroup.Item key={idx} className="d-flex align-items-center">
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="text-decoration-none d-flex align-items-center w-100"
            style={{ minWidth: 0 }}
          >
            <FaFileAlt className="text-secondary me-2 flex-shrink-0" />
            <span
              className="text-truncate"
              style={{ maxWidth: "250px" }}
              title={doc.name}
            >
              {doc.name}
            </span>
          </a>

          {/* Only show delete button for active step, not completed ones */}
          {!selectedProcessDetails && isUpdatable && !isLevel4Completed && (
            <Button
              variant="outline-danger"
              size="sm"
              className="flex-shrink-0 ms-2"
              style={{
                padding: "2px 6px",
                fontSize: "11px",
                minWidth: "30px",
                height: "24px",
              }}
              onClick={() => handleDeleteDocument("UPLOAD_DOC", doc.name, idx)}
              title="Delete document"
            >
              <i className="fas fa-trash-alt"></i>
            </Button>
          )}
        </ListGroup.Item>
      ))}
    </ListGroup>
  ) : (
    <p className="text-muted text-center mb-0">
      No documents uploaded for this step.
    </p>
  );
};


const existingRecordForProcess = storeData.find(
  item =>
    item.PROCESS?.trim() === immediateNextStep?.PROCESS?.trim()
);


  //-------------------2-1-2025 by rajakumari.m-----------------------------------------------------------------
  // Function to render fields for completed processes (view mode)
const renderCompletedProcessFields = () => {
  if (!selectedProcessDetails) return null;

  const process = selectedProcessDetails;
  const processName = process.PROCESS?.toLowerCase()?.trim();
  const stepIndex = steps.findIndex(
    step => step.PROCESS?.toLowerCase().trim() === processName
  );

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Plant</Form.Label>
            <Form.Control
              type="text"
              value={formData.loc || ""}
              readOnly
            />
          </Form.Group>
        </Col>
        
        {/* Date fields based on step index */}
        {stepIndex === 2 ? (
          // For step 3 (index 2): Show From and To dates
          <>
            <Col md={3}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.fromDate || ""}
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.toDate || ""}
                  readOnly
                />
              </Form.Group>
            </Col>
          </>
        ) : (
          // For other steps: Show Apply Date
        <Col md={6}>
            <Form.Group>
              <Form.Label>Apply Date</Form.Label>
              <Form.Control
                type="date"
                name="applyDate"
                value={formData.applyDate || ""}
                onChange={handleChange}
                isInvalid={!!errors.applyDate}
                readOnly={!isUpdatable}
                style={{ 
                  backgroundColor: !isUpdatable ? "#e9ecef" : "white",
                  cursor: !isUpdatable ? "not-allowed" : "text"
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.applyDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}
      </Row>

      {/* Step 2 specific fields (sub-levels) */}
      {stepIndex === 1 && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Pending Task</Form.Label>
              <Form.Control
                type="text"
                disabled
                value={process.LEVEL || "Not specified"}
                className="fw-bold"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Control
                type="text"
                disabled
                value={process.LEVEL_STATUS === "Completed" ? "Completed" : process.LEVEL_STATUS || "Not specified"}
                className={
                  process.LEVEL_STATUS === "Completed" ? "text-success fw-bold" : 
                  process.LEVEL_STATUS === "No" ? "text-danger fw-bold" : 
                  process.LEVEL_STATUS === "Yes" ? "text-success fw-bold" : ""
                }
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {/* Step 1 specific fields (Project Name and Address) */}
      {stepIndex === 0 && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.prjName || ""}
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.address || ""}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {/* Comments field (editable for all steps) */}
      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Comments</Form.Label>
           <Form.Control
  as="textarea"
  rows={1}
  name="comments"
  value={formData.comments || ""}
  onChange={handleChange}
  isInvalid={!!errors.comments}
  style={{ backgroundColor: "#f0f0f0" }}
  readOnly
/>

            <Form.Control.Feedback type="invalid">
              {errors.comments}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

// Function to render fields for next step (original renderNextStepForm logic)
const renderNextStepFields = () => {
  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Plant</Form.Label>
            <Form.Select
              name="loc"
              value={formData.loc}
              onChange={handleChange}
            >
              <option value="">Select Plant</option>
              {plants.map((p, idx) => (
                <option key={idx} value={p.loc}>
                  {p.loc}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        
        {immediateNextStepIndex === 2 ? (
          <>
            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  From Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={formData.fromDate || ""}
                  onChange={handleChange}
                  isInvalid={!!errors.fromDate}
                  max={new Date().toISOString().split("T")[0]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fromDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  To Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={formData.toDate || ""}
                  onChange={handleChange}
                  isInvalid={!!errors.toDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.toDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </>
        ) : (
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                Apply Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="applyDate"
                value={formData.applyDate || ""}
                onChange={handleChange}
                disabled = {!!existingRecordForProcess}
                isInvalid={!!errors.applyDate}
                max={new Date().toISOString().split("T")[0]}
              />
              <Form.Control.Feedback type="invalid">
                {errors.applyDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}
      </Row>

      {immediateNextStepIndex === 1 && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Pending Task</Form.Label>
              <Form.Control
                type="text"
                disabled
                value={
                  formData.subLevelStatus === "Reject" 
                    ? `Reject to: ${levelToSubmit || "Level 1"}`
                    : formData.subLevelStatus === "No"
                      ? `Stay at: ${SUB_LEVELS[activeSubLevelIndex] || 'Level 1'}`
                      : formData.subLevelStatus === "Yes"
                        ? `Progress: ${SUB_LEVELS[activeSubLevelIndex] || 'Level 1'}`
                        : "All Levels Complete"
                }
                className="fw-bold"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <div className="d-flex align-items-center h-100 gap-3">
                <Form.Check
                  type="radio"
                  label="Yes"
                  name="subLevelStatus"
                  value="Yes"
                  checked={formData.subLevelStatus === "Yes"}
                  onChange={handleChange}
                  id="status-yes"
                />
                <Form.Check
                  type="radio"
                  label="Reject"
                  name="subLevelStatus"
                  value="Reject"
                  checked={formData.subLevelStatus === "Reject"}
                  onChange={handleChange}
                  id="status-reject"
                />
                <Form.Check
                  type="radio"
                  label="No"
                  name="subLevelStatus"
                  value="No"
                  checked={formData.subLevelStatus === "No"}
                  onChange={handleChange}
                  id="status-no"
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
      )}

      {immediateNextStepIndex === 0 && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                name="prjName"
                value={formData.prjName || ""}
                disabled = {!!existingRecordForProcess}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address || ""}
                disabled ={!!existingRecordForProcess}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col md={6}>
          <Form.Label>Upload New Documents</Form.Label>
          <Button
            variant="outline-secondary"
            className="form-control"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Docs
          </Button>
          {uploadError && (
            <div className="text-danger small mt-1">{uploadError}</div>
          )}
          <Form.Text className="text-muted d-block mt-1">
            Only PDF files are allowed
          </Form.Text>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Comment<span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              name="comments"
              value={formData.comments || ""}
              onChange={handleChange}
              isInvalid={!!errors.comments}
           
            />
            <Form.Control.Feedback type="invalid">
              {errors.comments}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};
// --------------------------------------------------------------
  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h6 className="text-center mb-3">Process Steps</h6>
            <Nav variant="pills" className="flex-column">
              {steps.map((step, idx) => {
                let variant = "secondary",
                  clickable = false,
                  statusIcon = "⏸️";

                const isCompleted = storeData.some(
                  (item) =>
                    item.PROCESS?.toLowerCase().trim() ===
                      step.PROCESS?.toLowerCase().trim() &&
                    item.UPDATED === "YES"
                );
                if (isCompleted) {
               
                  variant = "success";
                  clickable = true;
                  statusIcon = "✅";
                } else if (idx === immediateNextStepIndex) {
                  variant = "warning";
                  clickable = true;
                  statusIcon = "⚠️";
                }

                return (
                  <React.Fragment key={idx}>
                    <Nav.Item className="mb-2">
                      {/* <Nav.Link  eventKey={idx} disabled={!clickable} className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`} style={{ cursor: clickable ? "pointer" : "not-allowed" }}>
                        {statusIcon}<span>{step.PROCESS}</span>
                      </Nav.Link> */}

                      {/* updated on 26-12-2025 by rajakumari.m--------------------------------------------------------- */}
                      <Nav.Link
                        eventKey={idx}
                        disabled={!clickable}
                        className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                        style={{
                          cursor: clickable ? "pointer" : "not-allowed",
                        }}
                      >
                        {statusIcon}
                        <span
                          onClick={(e) => {
                            if (isCompleted) {
                              handleProcessClick(e, step.PROCESS);
                            }
                          }}
                          style={{
                            cursor: isCompleted ? "pointer" : "default",
                            textDecoration: isCompleted ? "underline" : "none",
                          }}
                        >
                          {step.PROCESS}
                        </span>
                      </Nav.Link>
                      {/* ---------------------------------------------------------------------------------------------------------- */}
                    </Nav.Item>

                    {/* ✅ THE ONLY CHANGE IS HERE: Changed >= to === */}
                    {/* This now only shows the sub-levels when the second step is ACTUALLY the active step. */}
                    {idx === 1 && immediateNextStepIndex === 1 && (
                      <div className="ps-4 mb-2 d-flex flex-wrap gap-1">
                        {SUB_LEVELS.map((level, subIdx) => {
                          let badgeVariant = "secondary"; // Pending
                          if (subIdx < activeSubLevelIndex) {
                            badgeVariant = "success"; // Completed
                          } else if (subIdx === activeSubLevelIndex) {
                            badgeVariant = "warning"; // Active
                          }
                          return (
                            <Badge
                              bg={badgeVariant}
                              key={subIdx}
                              className="shadow-sm"
                            >
                              {level}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </Nav>
          </div>
        </Col>

        {/* The rest of the JSX is correct and unchanged */}
       <Col md={6} className="d-flex flex-column">
  {allStepsCompleted && !selectedProcessDetails ? (
    renderCompletionMessage()
  ) : (
    <Form className="p-3 border rounded bg-light">
      {/* Display appropriate heading */}
      {selectedProcessDetails ? (
        <div className="mb-3">
          <h4 className="mb-2 text-info fw-bold">
            Viewing: {selectedProcessDetails.PROCESS} (Completed)
          </h4>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleViewNextStep}
            disabled={!immediateNextStep}
          >
            View Next Step
          </Button>
        </div>
      ) : immediateNextStep ? (
        <h4 className="mb-3 text-primary fw-bold">
          {immediateNextStep.PROCESS}
        </h4>
      ) : null}

      {/* Render form fields based on whether we're viewing historical data or next step */}
      {selectedProcessDetails ? renderCompletedProcessFields() : renderNextStepFields()}

      {/* Submit button section */}
      <div className="d-grid mt-3">
        <Button
          variant="primary"
          size="md"
          onClick={handleEmailSubmit}
          disabled={isLevel4Completed || isSubmitting || !formData.loc}
        >
          {isSubmitting ? "Submitting..." : selectedProcessDetails ? "Update" : "Submit"}
        </Button>
      </div>
    </Form>
  )}
</Col>

        {/* 08-12-2025t */}
        {/* <Col md={3}>
          <div className="d-flex flex-column" style={{ height: "100%" }}>
            <Card
              className="p-3 mb-2"
              style={{ height: "80%", overflow: "auto" }}
            >
              <h6 className="text-center mb-3">
                Previously Uploaded Documents
              </h6>
              {renderDocumentHistory()}
            </Card>

            {/* 08-12-2025: Added View Logs button at bottom */}
            {/* <div className="p-2 border-top bg-light text-center">
              <Button
                variant="info"
                size="sm"
                onClick={() => {
                  // 08-12-2025: Parse logs from nextStepDetails
                  let logs = [];
                  try {
                    if (nextStepDetails?.LOG) {
                      logs = JSON.parse(nextStepDetails.LOG);
                    }
                  } catch (error) {
                    console.error("Failed to parse logs:", error);
                  }
                  setSelectedLogs(logs);
                  setShowLogsModal(true);
                }}
              >
                View Logs
              </Button>
            </div>
          </div>
        </Col> */} 
     <Col md={3}>
  <div className="d-flex flex-column" style={{ height: "100%" }}>
    {/* Conditional rendering based on whether plant is selected */}
    {formData.loc ? (
      <>
        {/* When plant is selected, show documents with 80% height */}
        <Card
          className="p-3 mb-2"
          style={{ height: "80%", overflow: "auto" }}
        >
          <h6 className="text-center mb-3">
            Previously Uploaded Documents
          </h6>
          {renderDocumentHistory()}
        </Card>

        {/* View Logs button at bottom (20% height) */}
       {/* // In your ReraModifyTable component, update the View Logs button section: */}

{/* View Logs button at bottom (20% height) */}
<div className="p-2 border-top bg-light text-center" style={{ height: "20%" }}>
  <Button
    variant="info"
    size="sm"
    onClick={() => {
      let logs = [];
      try {
        // ✅ FIX: Check which data source to use for logs
        if (selectedProcessDetails) {
          // If viewing a completed step, get logs from selectedProcessDetails
          if (selectedProcessDetails.LOG) {
            logs = JSON.parse(selectedProcessDetails.LOG);
          }
        } else if (nextStepDetails?.LOG) {
          // If viewing the next step, get logs from nextStepDetails
          logs = JSON.parse(nextStepDetails.LOG);
        }
      } catch (error) {
        console.error("Failed to parse logs:", error);
      }
      setSelectedLogs(logs);
      setShowLogsModal(true);
    }}
  >
    View Logs
  </Button>
</div>
      </>
    ) : (
      // When no plant is selected, documents take full height
      <Card
        className="p-3"
        style={{ height: "100%", overflow: "auto" }}
      >
        <h6 className="text-center mb-3">
          Previously Uploaded Documents
        </h6>
        {renderDocumentHistory()}
      </Card>
    )}
  </div>
</Col>
      </Row>

      <Modal show={showDemoteModal} onHide={() => setShowDemoteModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Select Rejection Level</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>Since the task is being rejected, please select which level to reset to:</p>
    <Form.Group>
      <Form.Label className="fw-bold">Choose rejection level:</Form.Label>
      <Form.Select
        onChange={(e) => handleDemoteConfirm(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Select a level...</option>
        {demoteOptions.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </Form.Select>
    </Form.Group>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => {
      setShowDemoteModal(false);
      // Reset to "Yes" if cancelled
      setFormData(prev => ({ ...prev, subLevelStatus: "Yes" }));
    }}>
      Cancel
    </Button>
  </Modal.Footer>
</Modal>

      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData.loc}
        applyDate={formData.applyDate}
        comments={formData.comments}
      />

      <ReraDocUploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        files={newDocs}
        setFiles={setNewDocs}
      />

      {/* 08-12-2025: Added Logs Modal */}
      <Modal
        show={showLogsModal}
        onHide={() => setShowLogsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Logs</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
          {selectedLogs.length === 0 ? (
            <p>No comments available</p>
          ) : (
            selectedLogs.map((log, i) => (
              <div key={i}>
                <strong>{log?.date}:</strong> {log?.comment}
                <hr />
              </div>
            ))
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReraModifyTable;
