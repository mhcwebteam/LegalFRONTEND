import React, { useEffect, useState, useRef, useMemo, useContext } from "react";
import { Nav, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../config/Config";

import PreviousUploadedDocsModal from "./PreviousUploadedDocsPanel";
import AirportDocUploadModal from "./AirportDocUploadModal";
import AmendmentPanel from "./AmendmentPanel";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { Context } from "../context/ContextData";
import { getMasterByLoc } from "../api/Api";
import { FaArrowLeft, FaCheckCircle, FaUpload } from "react-icons/fa";
import EmailSelectionModal from "./EmailModal";
import { toast } from "react-toastify";
import WaterDocUploadModal from "./WaterDocUploadModal";

const AirportModifyTable = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { totalMasterData, setHeaderData, headerData } = useContext(Context);
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedPlant, setSelectedPlant] = useState("");
  const [stepData, setStepData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [firstStep, setFirstStep] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isFirstProcess, setIsFirstProcess] = useState(true);
  const [linkDocs, setLinkDocs] = useState([]);
  const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
  const [nextStepDetails, setNextStepDetails] = useState(null);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [processingDt, setProcessingdt] = useState("Application");

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);

  const [amendmentStatus, setAmendmentStatus] = useState(null);
  const [isAmendmentActive, setIsAmendmentActive] = useState(false);

  const [amendLinkDocs, setAmendLinkDocs] = useState([]);
  const [modalContext, setModalContext] = useState("main");
  //added on 23-12-2025 by rajakumari.m--------------------------------------------------------------------------------------
  const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);
  //---------------------------------------------------------------------------------------------------------------------------

  const [loggedInUser, setLoggedInUser] = useState(null);  //-----------login userstate
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Add function to check if process is already submitted
  const isProcessAlreadySubmitted = useMemo(() => {
    if (!selectedPlant || !immediateNextStep) return false;

    return storeData.some(
      (item) =>
        item.LOC?.trim() === selectedPlant?.trim() &&
        item.PROCESS?.trim() === immediateNextStep?.PROCESS?.trim() &&
        item.UPDATED === "YES"
    );
  }, [selectedPlant, immediateNextStep, storeData]);

  // Also check if we're in amendment mode
  const isProcessAmended = useMemo(() => {
    if (!selectedPlant || !immediateNextStep) return false;

    return storeData.some(
      (item) =>
        item.LOC?.trim() === selectedPlant?.trim() &&
        item.PROCESS?.trim() === immediateNextStep?.PROCESS?.trim() &&
        item.AMEND_STATUS === "YES"
    );
  }, [selectedPlant, immediateNextStep, storeData]);

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
    setHeaderData(null);
  }, []);

  //added on 23-12-2025 by rajakumari.m--------------------------------------------------------------------------------
  // const handleProcessClick = (e, process) => {
  //   e.stopPropagation();
  //   console.log("Clicked:", process);

  //   // Find the process details from storeData
  //   const processDetails = storeData.find(
  //     (item) =>
  //       item.PROCESS?.toLowerCase().trim() === process.toLowerCase().trim()
  //   );

  //   setSelectedProcessDetails(processDetails || null);

  //   // If process details found, also set it as the active step
  //   if (processDetails) {
  //     const stepIndex = steps.findIndex(
  //       (step) =>
  //         step.PROCESS?.toLowerCase().trim() === process.toLowerCase().trim()
  //     );
  //     if (stepIndex !== -1) {
  //       setActiveStep(stepIndex);
  //     }
  //   }
  // };

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

    // ✅ ONLY set form data for the specific step we're viewing
    setFormData((prevFormData) => ({
      ...prevFormData,
      applyDate: processDetails.APPLY_DT || "",
      comments: processDetails.COMMENTS || "",
      // Only include STATUS for NOC Received or Not step
      STATUS: processDetails.PROCESS === "NOC Received or Not" 
        ? (processDetails.STATUS || "YES") 
        : prevFormData.STATUS, // Keep existing STATUS for other steps
      // Only include project area and NOCs for Submit Application step
      totalPrjArea: processDetails.PROCESS === "Submit Application"
        ? (processDetails.AMEND_TOTAL_PRJ_AREA || "")
        : prevFormData.totalPrjArea,
      noOfNocs: processDetails.PROCESS === "Submit Application"
        ? (processDetails.AMEND_NO_OF_NOCS || "")
        : prevFormData.noOfNocs,
      prjArea: processDetails.PROCESS === "Submit Application"
        ? (processDetails.TOTAL_PRJ_AREA || "")
        : prevFormData.prjArea,
      nocs: processDetails.PROCESS === "Submit Application"
        ? (processDetails.NO_OF_NOCS || "")
        : prevFormData.nocs,
    }));

    setFirstStep(processDetails);
  }
};
const handleViewNextStep = () => {
  // Clear selected process details
  setSelectedProcessDetails(null);
  
  // Reset form STATUS when moving to next step (unless it's NOC Received or Not)
  if (immediateNextStep && immediateNextStep.PROCESS !== "NOC Received or Not") {
    setFormData(prev => ({
      ...prev,
      STATUS: "YES" // Reset to default
    }));
  }

  if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
    const nextStepName = steps[immediateNextStepIndex]?.PROCESS;

    if (nextStepName) {
      axios
        .get(
          `${API_BASE_URL}/airport-step-details/${encodeURIComponent(
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
  // const handleViewNextStep = () => {
  //   setSelectedProcessDetails(null);

  //   if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
  //     const nextStepName = steps[immediateNextStepIndex]?.PROCESS;

  //     if (nextStepName) {
  //       axios
  //         .get(
  //           `${API_BASE_URL}/airport-step-details/${encodeURIComponent(
  //             selectedPlant
  //           )}/${encodeURIComponent(nextStepName)}`
  //         )
  //         .then((res) => {
  //           setNextStepDetails(res.data);
  //         })
  //         .catch((err) =>
  //           console.error("Error fetching next step details:", err)
  //         );
  //     }
  //   }
  // };
  // Add this new useEffect to handle selectedProcessDetails
  useEffect(() => {
    if (selectedProcessDetails) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: selectedProcessDetails.APPLY_DT,
        comments: selectedProcessDetails.COMMENTS || "",
        totalPrjArea: selectedProcessDetails.AMEND_TOTAL_PRJ_AREA || "",
        noOfNocs: selectedProcessDetails.AMEND_NO_OF_NOCS || "",
        prjArea: selectedProcessDetails.TOTAL_PRJ_AREA || "",
        STATUS: selectedProcessDetails.STATUS || "YES",
        nocs: selectedProcessDetails.NO_OF_NOCS || "",
      }));

      setFirstStep(selectedProcessDetails);
    }
  }, [selectedProcessDetails]);
  //------------------------------------------------------------------------------------------------------------------------
  // Check if all steps are completed
  useEffect(() => {
    if (steps.length > 0 && storeData.length > 0) {
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.PROCESS?.trim().toLowerCase());

      const allCompleted = steps.every((step) =>
        completedProcesses.includes(step.PROCESS?.trim().toLowerCase())
      );

      setAllStepsCompleted(allCompleted);
    } else {
      setAllStepsCompleted(false);
    }
  }, [steps, storeData]);

  // Validate file type - PDF only
  const validateFileType = (file) => {
    // Check file extension
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    const validExtensions = [".pdf"];

    // Check MIME type
    const validMimeTypes = ["application/pdf"];

    // Validate extension
    const isValidExtension = validExtensions.includes(fileExtension);

    // Validate MIME type (if available)
    const isValidMimeType = !file.type || validMimeTypes.includes(file.type);

    return isValidExtension && isValidMimeType;
  };

  // Validate all selected documents
  const validateDocuments = () => {
    let isValid = true;
    const newErrors = {};

    // Validate linkDocs if any files are selected
    if (linkDocs.length > 0) {
      const invalidFiles = linkDocs.filter((file) => !validateFileType(file));
      if (invalidFiles.length > 0) {
        newErrors.linkDocs = "Only PDF files are allowed";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };
 const handleBackClick = () => {
  setSelectedPlant("");
  setStoreData([]);
  setHeaderData(null);
  setSelectedProcessDetails(null);
  setAllStepsCompleted(false);
  setImmediateNextStep(null);
  setImmediateNextStepIndex(-1);
  setFormData({
    loc: "",
    applyDate: "",
    comments: "",
    noOfFlats: "",
    KLD: "",
    amountPaid: "",
    feasibilityDoc: null,
    AmountPaidDoc: null,
    status: "",
    reason: "",
    Ghmc: "",
    OldAmount: "",
    Size: "",
    TotalAmount: "",
    noOfTowers: "",
    ProjectBuildArea: "",
    TotalProjectArea: ""
  });
};
  const renderCompletionMessage = () => {
  return (
    <div className="position-relative text-center py-5">
      {/* Button in top-right corner */}
      <button 
        onClick={handleBackClick}
        className="position-absolute top-0 end-0 btn btn-success mt-3 me-3"
      >
<FaArrowLeft className="me-1" /> Back to Start
      </button>
      
      <FaCheckCircle size={64} className="text-success mb-3" />
      <h3 className="text-success mb-3">Congratulations! 🎉</h3>
      <h5 className="text-muted mb-4">
        All process steps have been completed successfully!
      </h5>
      <Alert
        variant="success"
        className="mx-auto"
        style={{ maxWidth: "500px" }}
      >
        <Alert.Heading>Project Completion Status</Alert.Heading>
        <p>
          All {steps.length} steps for <strong>{selectedPlant}</strong> have
          been completed. You can review the completed project details.
        </p>
        <hr />
        <p className="mb-0">
          The project is now ready for the next phase or final approval.
        </p>
      </Alert>
    </div>
  );
};

  const validateForm = () => {
    const newErrors = {};

    if (!formData.plant) newErrors.loc = "Plant name is required";
    if (!formData.applyDate) newErrors.applyDate = "Date is required";
    if (!formData.comments) newErrors.comments = "Please enter comments";

    // Validate documents if any are selected
    if (!validateDocuments()) {
      // Errors already set in validateDocuments function
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    //added on 23-12-2025 ny rajakumari.m-------------------------------------------------------------
    if (selectedProcessDetails) {
      Swal.fire({
        icon: "info",
        title: "Viewing Completed Step",
        text: "You are viewing a completed step. No updates can be made.",
        timer: 2000,
      });
      return;
    }
    // ----------------------------------------------------------------------------------------------------
    if (!validateForm()) {
      if (errors.linkDocs) {
        toast.error("Please upload only PDF files");
      } else {
        toast.error("Please fill all required fields");
      }
      return;
    }

    setShowEmailModal(true);
  };

  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);

    // Proceed with form submission
    await handleConfirmSubmit(emails);
  };

  // Fetch steps
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/airport-process`)
      .then((res) => {
        setSteps(res.data);
        if (res.data.length > 0) setActiveStep(0);
      })
      .catch((err) => console.error("Error fetching processes", err));
  }, []);

  useEffect(() => {
    if (immediateNextStepIndex === 0) {
      setIsFirstProcess(true);
    } else {
      setIsFirstProcess(false);
    }
  }, [immediateNextStepIndex]);

  // Fetch plants
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/airport-plants`)
      .then((res) => setPlants(res.data))
      .catch((err) => console.error("Error fetching plants", err));
  }, []);

  // Function to get date label based on process
  const getDateLabel = (processName) => {
    if (!processName) return "Date";

    if (processName === "Received TOR") {
      return "Received Date";
    }

    switch (processName) {
      case "Submit Application":
        return "Application Date";
      case "Inspection by Consultant":
      case "Inspection by Authority":
        return "Inspection Date";
      case "NOC Received or Not":
        return "NOC Received Date";
      case "Appeal Filled":
        return "Appeal Date";
      case "NOC for Appeal Status":
        return "NOC for Appeal Date";
       default:
      return "Application Date"; 
  }
    
  };


  useEffect(() => {
  // Clear everything when plant is cleared
  if (!selectedPlant) {
    setStoreData([]);
    setHeaderData(null);
    setAllStepsCompleted(false);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setNextStepDetails(null);
    setFirstStep(null);
    setFormData({
      plant: "",
      applyDate: "",
      comments: "",
      amendComments: "",
      amendDate: "",
      totalPrjArea: "",
      noOfNocs: "",
      prjArea: "",
      nocs: "",
      STATUS: "",
    });
    setLinkDocs([]);
    return;
  }

  // Rest of your existing useEffect logic for fetching data...
  // ... [keep your existing fetch logic here]
}, [selectedPlant, steps]);

  useEffect(() => {
    // Set the correct date label based on the next step
    if (immediateNextStep && immediateNextStep.PROCESS) {
      setProcessingdt(getDateLabel(immediateNextStep.PROCESS));
    } else {
      setProcessingdt("Application Date");
    }
  }, [immediateNextStep]);

  useEffect(() => {
    // 1. Reset all states at the beginning
    setAmendmentStatus(null);
    setIsAmendmentActive(false);
    setFormData((prev) => ({
      plant: selectedPlant,
      // plant: prev.plant,
      applyDate: "",
      comments: "",
      amendComments: "",
      amendDate: "",
      totalPrjArea: "",
      prjArea: "",
      nocs: "",
      noOfNocs: "",
      STATUS: "YES",
    }));
    setNextStepDetails(null);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setStepData([]);
    setStoreData([]);
    setLinkDocs([]); // Clear documents when plant changes

    // 2. Guard clause: only proceed if a plant and steps are selected/loaded
    if (selectedPlant && steps.length > 0) {
      const processName = "Airport Authority";

      const airportDataUrl = `${API_BASE_URL}/airport-data?plant=${selectedPlant}`;
      const amendmentCheckUrl = `${API_BASE_URL}/amendments/${selectedPlant}/${encodeURIComponent(
        processName
      )}`;

      // Use Promise.all to fetch main data and amendment status concurrently
      Promise.all([axios.get(airportDataUrl), axios.get(amendmentCheckUrl)])
        .then(([airportRes, amendmentRes]) => {
          const fetchedData = airportRes.data;

          const amendmentRecord = amendmentRes.data?.data?.[0] || null;

          // Update data states
          setStepData(fetchedData);
          setStoreData(fetchedData);

          setFormData((prev) => ({
            ...prev,
            loc: selectedPlant,
          }));

          // 3. Determine the correct "next step" USING the data we just fetched
          let nextStep = null;
          let nextStepIndex = -1;
          const isAmendActive =
            amendmentRecord && amendmentRecord.STATUS === "created";

          if (isAmendActive) {
            setIsAmendmentActive(true);
            setAmendmentStatus(amendmentRecord);
            const completed = fetchedData
              .filter((i) => i.AMEND_STATUS === "YES")
              .map((i) => i.PROCESS);
            nextStep = steps.find((s) => !completed.includes(s.PROCESS));
          } else {
            setIsAmendmentActive(false);
            setAmendmentStatus(null);
            if (fetchedData.length > 0) {
              const completed = fetchedData
                .filter((i) => i.UPDATED === "YES")
                .map((i) => i.PROCESS);
              nextStep = steps.find((s) => !completed.includes(s.PROCESS));
            } else {
              nextStep = steps[0]; // Default to the first step if no data exists
            }
          }

          if (nextStep) {
            nextStepIndex = steps.indexOf(nextStep);
            setImmediateNextStep(nextStep);
            setImmediateNextStepIndex(nextStepIndex);

            // 4. NOW, fetch the details for the ONE, CORRECT next step
            const nextStepName = nextStep.PROCESS;
            const detailsUrl = `${API_BASE_URL}/airport-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(nextStepName)}`;

            return axios.get(detailsUrl); // Return this promise for the next .then()
          }

          return Promise.resolve(null); // Return a resolved promise if there's no next step
        })
        .then((detailsRes) => {
          // 5. Set the details from the second API call
          if (detailsRes) {
            setNextStepDetails(detailsRes.data);
          }
        })
        .catch((err) => {
          console.error("Error during data fetching process:", err.message);
          // Reset states on error to be safe
          setAmendmentStatus(null);
          setIsAmendmentActive(false);
        });
    }
  }, [selectedPlant, steps]);

  useEffect(() => {
    if (nextStepDetails && nextStepDetails.length > 0) {
      const details = nextStepDetails[0];

      setFormData((prev) => ({
        ...prev,
        applyDate: details.APPLY_DT,
        comments: "",
        // Populate the new amendment fields
        amendComments: details.AMEND_COMMENTS || "",
        amendDate: details.AMEND_DATE || "",
        totalPrjArea: details.AMEND_TOTAL_PRJ_AREA || "",
        prjArea: details.TOTAL_PRJ_AREA || "",
        noOfNocs: details.AMEND_NO_OF_NOCS || "",
        nocs: details.NO_OF_NOCS || "",
        STATUS: details.STATUS || "YES",
      }));
      setFirstStep(details);
    } else {
      setFormData((prev) => ({
        ...prev,
        applyDate: "",
        comments: "",
        amendComments: "",
        amendDate: "",
        totalPrjArea: "",
        noOfNocs: "",
        prjArea: "",
        nocs: "",
        STATUS: "YES",
      }));
      setFirstStep(null);
    }
  }, [nextStepDetails]);

  const handleChange = async (e) => {
  const { name, value } = e.target;

  // Prevent changing applyDate for already submitted processes
  if (
    name === "applyDate" &&
    (isProcessAlreadySubmitted || isProcessAmended)
  ) {
    toast.info(
      "Application date cannot be changed for already submitted or amended processes"
    );
    return;
  }

  if (name === "plant") {
    // Clear everything before setting new plant
    setSelectedPlant("");
    setStoreData([]);
    setHeaderData(null);
    setAllStepsCompleted(false);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setNextStepDetails(null);
    setFirstStep(null);
    setFormData({
      plant: "",
      applyDate: "",
      comments: "",
      amendComments: "",
      amendDate: "",
      totalPrjArea: "",
      noOfNocs: "",
      prjArea: "",
      nocs: "",
      STATUS: "YES",
    });
    setLinkDocs([]);
    setErrors({});
    setSelectedProcessDetails(null);

    if (!value || value.trim() === "") {
      return;
    }

    // Now set the new plant
    setSelectedPlant(value);

    try {
      const res = await getMasterByLoc(value);

      if (res) {
        setHeaderData(res);

        setFormData((prev) => ({
          ...prev,
          plant: value,
          applyDate: res.APPLICATION_DATE || "",
          prjArea: res.TOTAL_PROJECT_AREA || "" || null,
        }));
      } else {
        console.warn("⚠️ No master data found for location:", value);
        setHeaderData(null);
        setFormData((prev) => ({
          ...prev,
          plant: value,
        }));
      }
    } catch (err) {
      console.error("❌ Error fetching master by loc:", err);
      setHeaderData({});
      setFormData((prev) => ({
        ...prev,
        plant: value,
      }));
    }

    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  // const handleChange = async (e) => {
  //   const { name, value } = e.target;

  //   // Prevent changing applyDate for already submitted processes
  //   if (
  //     name === "applyDate" &&
  //     (isProcessAlreadySubmitted || isProcessAmended)
  //   ) {
  //     toast.info(
  //       "Application date cannot be changed for already submitted or amended processes"
  //     );
  //     return;
  //   }

  //   if (name === "plant") {
  //     setSelectedPlant(value);

  //     if (!value || value.trim() === "") {
  //       setFormData((prev) => ({
  //         ...prev,
  //         plant: "",
  //         applyDate: "",
  //         comments: "",
  //         amendComments: "",
  //         amendDate: "",
  //         totalPrjArea: "",
  //         noOfNocs: "",
  //         nocs: "",
  //         prjArea: "",
  //         STATUS: "YES",
  //       }));
  //       return;
  //     }

  //     try {
  //       const res = await getMasterByLoc(value);

  //       if (res) {
  //         setHeaderData(res);

  //         setFormData((prev) => ({
  //           ...prev,
  //           plant: value,
  //           applyDate: res.APPLICATION_DATE || "",
  //           prjArea: res.TOTAL_PROJECT_AREA || "" || null,
  //         }));
  //       } else {
  //         console.warn("⚠️ No master data found for location:", value);
  //         setHeaderData(null);
  //         setFormData((prev) => ({
  //           ...prev,
  //           plant: value,
  //           applyDate: "",
  //           comments: "",
  //           amendComments: "",
  //           amendDate: "",
  //           totalPrjArea: "",
  //           prjArea: "",
  //           noOfNocs: "",
  //           nocs: "",
  //           STATUS: "",
  //         }));
  //       }
  //     } catch (err) {
  //       console.error("❌ Error fetching master by loc:", err);
  //       setHeaderData({});
  //       setFormData((prev) => ({
  //         ...prev,
  //         plant: value,
  //         applyDate: "",
  //         comments: "",
  //         amendComments: "",
  //         amendDate: "",
  //         totalPrjArea: "",
  //         prjArea: "",
  //         noOfNocs: "",
  //         nocs: "",
  //         STATUS: "",
  //       }));
  //     }

  //     return;
  //   }

  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };


  const handleConfirmSubmit = async (emails) => {
  if (!formData.plant || !formData.applyDate) {
    Swal.fire(
      "Validation Error",
      "Please select a plant and provide a date.",
      "error"
    );
    return;
  }

  // Final document validation before submission
  if (!validateDocuments()) {
    toast.error("Please ensure all uploaded files are PDF format");
    return;
  }

  setIsSubmitting(true);

  //  --- : 'fetch User';
  let currentUserName = loggedInUser.username;

  const payload = new FormData();
  payload.append("loc", formData.plant);
  payload.append("applyDate", formData.applyDate);
  payload.append("comments", formData.comments || "");
  payload.append("process", immediateNextStep.PROCESS);
  payload.append("totalPrjArea", formData.prjArea || "" || null);
  payload.append("noOfNocs", formData.nocs || "" || null);
  payload.append("STATUS", formData.STATUS);
  payload.append("username", currentUserName);

  emails.forEach((email, i) => {
    payload.append(`emails[${i}]`, email);
  });

  // Append documents
  linkDocs.forEach((file) => {
    if (validateFileType(file)) {
      payload.append("documents[]", file);
    }
  });

  const existingRecord = storeData.find(
    (item) =>
      item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim() &&
      item.LOC?.trim() === formData.plant?.trim()
  );

  const apiUrl = existingRecord
    ? `${API_BASE_URL}/airport-modify`
    : `${API_BASE_URL}/airport-submit`;

try {
      await axios.post(apiUrl, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Submitted Successfully!",
        showConfirmButton: false,
        timer: 2000,
      });
        // --- START OF CHANGES ---
      
      // 1. Clear the selected plant
      setSelectedPlant("");
      
      // 2. Clear the Header Data (Project Info Header)
      setHeaderData(null);

      // 3. Clear the Sidebar Data (This removes the green checks/process history)
      setStoreData([]);
      
      // 4. Reset Step states
      setFirstStep(null);
      setNextStepDetails(null);
      setImmediateNextStep(null);
      setActiveStep(0); 

      // 5. Clear Form Data
      setFormData({
        plant: "", // Ensure this is empty
        applyDate: "",
        comments: "",
        totalPrjArea: "",
        prjArea: "",
        nocs: "",
        document: "",
        STATUS: "YES", // Reset status to default
      });

      // Clear document states
      setLinkDocs([]);
      setErrors({}); 

      // REMOVED THE FOLLOWING LINES:
      // const res = await axios.get(
      //   `${API_BASE_URL}/airport-data?plant=${formData.plant}`
      // );
      // setStoreData(res.data);

      // --- END OF CHANGES ---
    } catch (error) {
      console.error("Submission failed:", error);
      Swal.fire(
        "Error",
        "Submission failed. Please check the console.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }

};

// Helper function to fetch plant data
const fetchPlantData = async (plant) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/airport-data?plant=${plant}`
    );
    setStoreData(res.data);
    
    // Recalculate next step after data is loaded
    if (res.data.length > 0 && steps.length > 0) {
      const completed = res.data
        .filter((i) => i.UPDATED === "YES")
        .map((i) => i.PROCESS);
      
      const nextStep = steps.find((s) => !completed.includes(s.PROCESS));
      
      if (nextStep) {
        setImmediateNextStep(nextStep);
        setImmediateNextStepIndex(steps.indexOf(nextStep));
        
        // Fetch step details
        const detailsUrl = `${API_BASE_URL}/airport-step-details/${encodeURIComponent(
          plant
        )}/${encodeURIComponent(nextStep.PROCESS)}`;
        
        const detailsRes = await axios.get(detailsUrl);
        setNextStepDetails(detailsRes.data);
      }
    }
  } catch (err) {
    console.error("Error fetching plant data after submission:", err);
  }
};
  

//   const handleConfirmSubmit = async (emails) => {
//     if (!formData.plant || !formData.applyDate) {
//       Swal.fire(
//         "Validation Error",
//         "Please select a plant and provide a date.",
//         "error"
//       );
//       return;
//     }

//     // Final document validation before submission
//     if (!validateDocuments()) {
//       toast.error("Please ensure all uploaded files are PDF format");
//       return;
//     }

//     setIsSubmitting(true);

//     //  --- : 'fetch User';
//     let currentUserName = loggedInUser.username;

//     const payload = new FormData();
//     payload.append("loc", formData.plant);
//     payload.append("applyDate", formData.applyDate);
//     payload.append("comments", formData.comments || "");
//     payload.append("process", immediateNextStep.PROCESS);
//     payload.append("totalPrjArea", formData.prjArea || "" || null);
//     payload.append("noOfNocs", formData.nocs || "" || null);
//     payload.append("STATUS", formData.STATUS);
//     payload.append("username", currentUserName);

//     emails.forEach((email, i) => {
//       payload.append(`emails[${i}]`, email);
//     });

//     // Append documents
//     linkDocs.forEach((file) => {
//       if (validateFileType(file)) {
//         payload.append("documents[]", file);
//       }
//     });

//     const existingRecord = storeData.find(
//       (item) =>
//         item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim() &&
//         item.LOC?.trim() === formData.plant?.trim()
//     );

//     const apiUrl = existingRecord
//       ? `${API_BASE_URL}/airport-modify`
//       : `${API_BASE_URL}/airport-submit`;

//     try {
//       await axios.post(apiUrl, payload, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       Swal.fire({
//         icon: "success",
//         title: "Submitted Successfully!",
//         showConfirmButton: false,
//         timer: 2000,
//       });
//       setSelectedPlant("");
//         setStoreData([]); 
//       setHeaderData(null);
// setAllStepsCompleted("");
//       // 3. Reset Step Tracking (Clears Right Side Docs and Middle Form)
//       setImmediateNextStep(null);
//       setImmediateNextStepIndex(-1);
//       setNextStepDetails(null);
//       // setLatestLogs([]);
//       setFirstStep(null);
//       setFormData({
//         plant: formData.plant,
//         applyDate: "",
//         comments: "",
//         totalPrjArea: "",
//         prjArea: "",
//         nocs: "",
//         document: "",
//       });

//       // Clear document states
//       setLinkDocs([]);
//       setErrors({}); // Clear errors on successful submission

//       const res = await axios.get(
//         `${API_BASE_URL}/airport-data?plant=${formData.plant}`
//       );
//       setStoreData(res.data);
//     } catch (error) {
//       console.error("Submission failed:", error);
//       Swal.fire(
//         "Error",
//         "Submission failed. Please check the console.",
//         "error"
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

  const handleAmendmentUpdate = async (dataFromPanel) => {
    if (!selectedPlant || !immediateNextStep) {
      Swal.fire("Error", "No plant or active step selected.", "error");
      return;
    }

    // Validate amendment documents
    const invalidAmendFiles = amendLinkDocs.filter(
      (file) => !validateFileType(file)
    );

    if (invalidAmendFiles.length > 0) {
      toast.error("Please ensure all amendment files are PDF format");
      return;
    }

    console.log("Data received from AmendmentPanel:", dataFromPanel);

    const payload = new FormData();
    payload.append("loc", selectedPlant);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("amendmentDate", dataFromPanel.amendmentDate);
    payload.append("totalPrjArea", dataFromPanel.totalPrjArea);
    payload.append("noOfNocs", dataFromPanel.noOfNocs);
    payload.append("reason", dataFromPanel.reason);
    payload.append("STATUS", formData.STATUS);

    // Only append valid PDF files
    amendLinkDocs.forEach((file) => {
      if (validateFileType(file)) {
        payload.append("link_docs[]", file);
      }
    });

    console.log("--- Submitting Amendment Payload ---");
    for (const [key, value] of payload.entries()) {
      console.log(`${key}:`, value);
    }

    const apiUrl = `${API_BASE_URL}/airport-amendment-submit`;
    try {
      await axios.post(apiUrl, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire({
        icon: "success",
        title: "Amendment Step Submitted!",
        showConfirmButton: false,
        timer: 2000,
      });

      // Clear amendment file states after successful submission
      setAmendLinkDocs([]);

      // ✅ VERY IMPORTANT: Refreshes the data from the server
      const res = await axios.get(
        `${API_BASE_URL}/airport-data?plant=${selectedPlant}`
      );
      setStoreData(res.data); // This will trigger your useEffect to find the next step
    } catch (error) {
      console.error("Amendment submission failed:", error);
      Swal.fire(
        "Submission Failed",
        "Please check the console for details.",
        "error"
      );
    }
  };

  const openUploadModal = (context) => {
    setModalContext(context); // Set 'main' or 'amendment'
    setShowUploadModal(true);
  };

  const totalProjectArea = stepData?.[0]?.TOTAL_PRJ_AREA;
  const noofNOCS = stepData?.[0]?.NO_OF_NOCS;

  const memoizedStepAmendData = useMemo(
    () => ({
      date: formData.amendDate,
      comments: formData.amendComments,
      totalPrjArea: formData.totalPrjArea,
      noOfNocs: formData.noOfNocs,
    }),
    [
      formData.amendDate,
      formData.amendComments,
      formData.totalPrjArea,
      formData.noOfNocs,
    ]
  );

  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h6 className="text-center mb-3">Process Steps</h6>
            <Nav variant="pills" className="flex-column">
              {steps.map((step, idx) => {
                let variant = "secondary";
                let clickable = false;
                let statusIcon = "⏸️";

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
                  <Nav.Item key={idx} className="mb-2">
                    {/* <Nav.Link
                      eventKey={idx}
                      disabled={!clickable}
                      onClick={() => {
                        if (!clickable) return;
                        setActiveStep(idx);
                      }}
                      className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                      style={{
                        cursor: clickable ? "pointer" : "not-allowed"
                      }}
                    >
                      {statusIcon}
                      <span>{step.PROCESS}</span>
                    </Nav.Link> */}
                    {/* added on 23-12-2025 by rajakumari.m-------------------- */}
                    <Nav.Link
                      eventKey={idx}
                      disabled={!clickable}
                      onClick={() => {
                        if (!clickable) return;
                        setActiveStep(idx);
                      }}
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
                    {/* ----------------------------------------------------------------------------------------------------------------- */}
                  </Nav.Item>
                );
              })}
            </Nav>
          </div>
        </Col>
        {/* added on 23-12-2025 by rajakumari.m-------------------------------------------------------------[] */}
        <Col md={6} className="d-flex flex-column">
          {allStepsCompleted && !amendmentStatus && !selectedProcessDetails ? (
            renderCompletionMessage()
          ) : (
            <div
              style={{
                height: "calc(100vh - 380px)",
              }}
            >
              <Form
                className="p-3 border rounded bg-light"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Form header showing current view */}
                {selectedProcessDetails ? (
                  <div className="mb-3">
                    <h4 className="mb-2 text-info fw-bold">
                      Viewing: {selectedProcessDetails.PROCESS} {totalProjectArea && (
                      <>
                        {" "}
                        | Area:{" "}
                        <span className="text-dark">{totalProjectArea}</span>
                      </>
                    )}
                    {noofNOCS && (
                      <>
                        {" "}
                        | NOCs: <span className="text-dark">{noofNOCS}</span>
                      </>
                    )} (Completed)
                    </h4>

                       {/* {selectedProcessDetails.PROCESS === "NOC Received or Not" && (
      <div className="mb-2">
        <strong>Status: </strong>
        <span className={selectedProcessDetails.STATUS === "YES" ? "text-success" : "text-danger"}>
          {selectedProcessDetails.STATUS === "YES" ? "✅ Yes" : "❌ No"}
        </span>
      </div>
    )} */}
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
                    {totalProjectArea && (
                      <>
                        {" "}
                        | Area:{" "}
                        <span className="text-dark">{totalProjectArea}</span>
                      </>
                    )}
                    {noofNOCS && (
                      <>
                        {" "}
                        | NOCs: <span className="text-dark">{noofNOCS}</span>
                      </>
                    )}
                  </h4>
                ) : null}
                {/* --------------------------------------------------------------------------------------------------------------- */}
                {/* Scrollable content area */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    paddingRight: "5px",
                  }}
                >
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Plant</Form.Label>
                        <Form.Select
                          name="plant"
                          value={formData.plant || ""}
                          onChange={handleChange}
                          disabled={!!amendmentStatus}
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
                    <Col md={6}>
                      <Form.Group>
                   <Form.Label>
  {selectedProcessDetails 
    ? getDateLabel(selectedProcessDetails.PROCESS)  // For viewing completed steps
    : immediateNextStep 
      ? getDateLabel(immediateNextStep.PROCESS)     // For current active step
      : "Application Date"                           // Default
  }
  {(isProcessAlreadySubmitted || isProcessAmended) && (
    <span className="text-muted ms-2">(Locked)</span>
  )}
</Form.Label>
                        <Form.Control
                          type="date"
                          name="applyDate"
                          value={formData.applyDate || ""}
                          onChange={handleChange}
                          max={new Date().toISOString().split("T")[0]}
                          disabled={
                            !!amendmentStatus ||
                            !formData.plant ||
                            (firstStep && firstStep.APPLY_DT)
                          }
                        />
                        {errors.applyDate && (
                          <p className="error-text text-danger">
                            {errors.applyDate}
                          </p>
                        )}
                        {/* Show info messages */}
                        {isProcessAlreadySubmitted && !isProcessAmended && (
                          <p className="text-info small mt-1 mb-0">
                            This process has already been submitted. Date cannot
                            be modified.
                          </p>
                        )}
                        {isProcessAmended && (
                          <p className="text-info small mt-1 mb-0">
                            This process has amendments. Date cannot be
                            modified.
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <>
                    {isFirstProcess && (
                      <Row>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Total Project Area</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={1}
                              name="prjArea"
                              value={formData.prjArea || ""}
                              disabled
                              onChange={handleChange}
                              // disabled={!!amendmentStatus || !formData?.plant}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Nocs</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={1}
                              name="nocs"
                              value={formData.nocs || ""}
                              onChange={handleChange}
                              disabled
                              // disabled={!!amendmentStatus || !formData?.plant}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    )}
                  </>
                  <Row>
        <Col md={6} className="mt-2">
                  {/* 3-1-2026 by rajakumari.m */}
    <Form.Group>
      <Form.Label>Comments</Form.Label>
      <Form.Control
        as="textarea"
        rows={1}
        name="comments"
        value={formData.comments || ""}
        onChange={handleChange}
        disabled={!!amendmentStatus || !formData?.plant || selectedProcessDetails}
        style={{
          backgroundColor: selectedProcessDetails ? '#e9ecef' : '',
          color: selectedProcessDetails ? '#6c757d' : '',
          cursor: selectedProcessDetails ? 'not-allowed' : ''
        }}
      />
      {errors.comments && (
        <p className="error-text text-danger">{errors.comments}</p>
      )}
    </Form.Group>
  </Col>
                    <Col md={6} className="mt-2">
                      <Form.Label>Upload Document</Form.Label>
                      <button
                        type="button"
                        className="btn btn-outline-secondary form-control"
                        onClick={() => setShowFeasibilityModal(true)}
                        // added on 4-1-2026 by rajakumari.m-----------------------------------------------------
                          disabled={!!amendmentStatus || !formData?.plant || selectedProcessDetails}
        style={{
          backgroundColor: selectedProcessDetails ? '#e9ecef' : '',
          color: selectedProcessDetails ? '#6c757d' : '',
          cursor: selectedProcessDetails ? 'not-allowed' : ''
        }}
        //----------------------------------------------------------------------------------------------------
      
                      >
                        <FaUpload className="me-2" /> Upload Document
                        <span className="ms-2 text-muted">
                          {linkDocs.length > 0 &&
                            `(${linkDocs.length} selected)`}
                        </span>
                        

                      </button>
                      {/* Document validation error message */}
                      {errors.linkDocs && (
                        <p className="error-text text-danger mt-1 mb-0">
                          {errors.linkDocs}
                        </p>
                      )}
                      {/* Helper text */}
                      <p className="text-muted small mt-1 mb-0">
                        Only PDF files are accepted.
                      </p>
                    </Col>

<Row className="mt-2 align-items-end">
  {(() => {
    // Get current process name (from immediateNextStep if available)
    const currentProcessName = selectedProcessDetails?.PROCESS?.toLowerCase();
    
  
    if (currentProcessName === "noc received or not") {
      return (
        <Col md={6} className="mb-2">
          <Form.Group>
            <Form.Label>Status</Form.Label>
            <div className="d-flex align-items-center gap-3">
              <Form.Check
                inline
                label="Yes"
                name="STATUS"
                type="radio"
                id="status-yes"
                value="YES"
                checked={formData.STATUS === "YES"}
                disabled
                // onChange={handleChange}
              />
              <Form.Check
                inline
                label="No"
                name="STATUS"
                type="radio"
                id="status-no"
                value="NO"
                checked={formData.STATUS === "NO"}
                   disabled
                // onChange={handleChange}
              />
            </div>
          </Form.Group>
        </Col>
      );
    }
    return null;
  })()}
</Row>
                  </Row>
                </div>

                {/* Fixed footer area */}
                <div className="d-grid mt-4" style={{ flexShrink: 0 }}>
                  {allStepsCompleted ? (
                    <div className="alert alert-success d-flex align-items-center">
                      <FaCheckCircle className="me-2" size={20} />
                      All steps completed! No further action required.
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleEmailSubmit}
                      disabled={
                        isSubmitting || !!amendmentStatus || !formData.plant
                      }
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  )}
                </div>
              </Form>
            </div>
          )}
          {amendmentStatus && (
            <div className="mt-4">
              <AmendmentPanel
                amendmentData={amendmentStatus}
                onUpdate={handleAmendmentUpdate}
                setAmendmentStatus={setAmendmentStatus}
                onUploadClick={() => openUploadModal("amendment")}
                stepAmendData={memoizedStepAmendData}
              />
            </div>
          )}
        </Col>

        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill w-50">
            <PreviousUploadedDocsModal storeData={storeData} firstStep={firstStep} type= "modify" />
          </div>
        </Col>
      </Row>

      <WaterDocUploadModal
        show={showFeasibilityModal}
        onClose={() => setShowFeasibilityModal(false)}
        linkDocs={linkDocs}
        setLinkDocs={setLinkDocs}
        title="Upload Documents"
        showLandDocs={false}
        showOthDocs={false}
        validateFileType={validateFileType}
      />

      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData?.plant}
        applyDate={formData.applyDate}
        comments={formData.comments}
      />

      <AirportDocUploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        linkDocs={modalContext === "main" ? linkDocs : amendLinkDocs}
        setLinkDocs={modalContext === "main" ? setLinkDocs : setAmendLinkDocs}
      />
    </>
  );
};

export default AirportModifyTable;
