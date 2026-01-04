



import React, { useEffect, useState, useContext } from "react";
import { Nav, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/Config";
import { FaCheckCircle, FaUpload } from "react-icons/fa";
import { Context } from "../context/ContextData";
import ReusableDialog from "./ReusableDialog";
import ProjectInfoHeader from "./ProjectInfoHeader";
import WaterDocUploadModal from "./WaterDocUploadModal";
import PreviousGhmcDocs from "./PreviousGhmcDocs";
import { getMasterByLoc } from "../api/Api";
import EmailSelectionModal from "./EmailModal";
import { toast } from "react-toastify";

const GhmcModify = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const {
    storeData,
    setStoreData,
    totalMasterData,
    setHeaderData,
    headerData,
    setRespModifyData,
  } = useContext(Context);

  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [nextStepDetails, setNextStepDetails] = useState(null);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [organizationType, setOrganizationType] = useState("");

  const [isViewingSpecificStep, setIsViewingSpecificStep] = useState(false);
  const [viewedStep, setViewedStep] = useState(null);
  const [viewedStepDetails, setViewedStepDetails] = useState(null);
  const [currentProcess, setCurrentProcess] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(null);

  // updated on 26-12-2025
  const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);

  const [formData, setFormData] = useState({
    loc: "",
    applyDate: "",
    Comments: "",
    process: "",
    organisation: "",
    project_name: "",
    location: "",
    status: "",
    noOfTowers: "",
    TotalProjectArea: "",
    ProjectBuildArea: "",
    ProjectName: "",
    noOfFlats: "",
    KLD: "",
    OldAmount: "",
    TotalAmount: "",
    Size: "",
    Ghmc: "",
  });

  const [feasibilityDocs, setFeasibilityDocs] = useState([]);
  const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
  const [linkDocs, setLinkDocs] = useState([]);
  const [landDocs, setLandDocs] = useState([]);
  const [othDocs, setOthDocs] = useState([]);

  const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
  const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [isFirstProcess, setIsFirstProcess] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loc, setLoc] = useState([]);
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    open: false,
  });

  // Check if all steps completed
  const areAllStepsCompleted = () => {
    if (!steps.length || !storeData.length) return false;

    const completedSteps = storeData
      .filter((item) => item.UPDATED === "YES")
      .map((item) => item.PROCESS);

    return steps.every((step) => completedSteps.includes(step.PROCESS));
  };

  // Check login
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
  }, [setHeaderData]);

  // Validate file type - PDF only
  const validateFileType = (file) => {
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.pdf'];
    const validMimeTypes = ['application/pdf'];

    const isValidExtension = validExtensions.includes(fileExtension);
    const isValidMimeType = !file.type || validMimeTypes.includes(file.type);

    return isValidExtension && isValidMimeType;
  };

  const validateDocuments = () => {
    let isValid = true;
    const newErrors = {};

    if (feasibilityDocs.length > 0) {
      const invalidFiles = feasibilityDocs.filter(file => !validateFileType(file));
      if (invalidFiles.length > 0) {
        newErrors.feasibilityDocs = "Only PDF files are allowed";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.applyDate) newErrors.applyDate = "Date is required";
    if (!formData.Comments) newErrors.Comments = "Please enter comments";

    if (!validateDocuments()) {
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderCompletionMessage = () => {
    return (
      <div className="text-center p-5">
        <FaCheckCircle size={80} className="text-success mb-4" />
        <h2 className="text-success mb-3 fw-bold">Congratulations! 🎉</h2>
        <h5 className="text-muted mb-4">All process steps have been completed successfully!</h5>
        <Alert variant="success" className="mx-auto" style={{ maxWidth: '600px' }}>
          <Alert.Heading>Project Completion Status</Alert.Heading>
          <p className="mb-2">
            All <strong>{steps.length}</strong> steps for <strong>{selectedPlant}</strong> have been completed.
          </p>
          <hr />
          <p className="mb-0">
            The project is now ready for the next phase or final approval.
          </p>
        </Alert>
      </div>
    );
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (selectedProcessDetails) {
      toast.info('Viewing completed step. No updates can be made.');
      return;
    }
    if (!validateForm()) {
      if (errors.feasibilityDocs) {
        toast.error('Please upload only PDF files');
      } else {
        toast.error('Please fill all required fields');
      }
      return;
    }

    setShowEmailModal(true);
  };

  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);
    setSubmitted(false);
    await handleConfirmSubmit(emails);
  };

  // Reset form when plant changes
  useEffect(() => {
    if (selectedPlant) {
      setSubmitted(false);
      setIsViewingSpecificStep(false);
      setViewedStep(null);
      setViewedStepDetails(null);
      setCurrentProcess("");
      setSelectedProcessDetails(null); // FIX: clear history viewing state

      setFormData(prev => ({
        ...prev,
        applyDate: "",
        Comments: "",
        noOfFlats: "",
        KLD: "",
        OldAmount: "",
        TotalAmount: "",
        Size: "",
        Ghmc: "",
      }));
      setActiveStep(null);

      setFeasibilityDocs([]);
      setAmountPaidDocs([]);
      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);
    }
  }, [selectedPlant]);

  useEffect(() => {
    setIsFirstProcess(immediateNextStepIndex === 0);
  }, [immediateNextStepIndex]);

  // Fetch plants
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/GHMC-plants`)
      .then((res) => {
        setLoc(res.data);
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  // Fetch processes (single effect, removed duplicate)
  useEffect(() => {
    if (!selectedPlant) return;

    axios
      .get(`${API_BASE_URL}/GHMC-process`, {
        params: { plant: selectedPlant },
      })
      .then((res) => {
        setSteps(res.data || []);
        if (res.data && res.data.length > 0) setActiveStep(0);
      })
      .catch((err) => console.error("Error fetching processes:", err));
  }, [selectedPlant]);

  // Compute next step
  useEffect(() => {
    if (steps.length > 0 && Array.isArray(storeData)) {
      const completed = storeData
        .filter((i) => i.UPDATED === "YES")
        .map((i) => i.PROCESS);
      const next = steps.find((s) => !completed.includes(s.PROCESS));
      if (next) {
        setImmediateNextStep(next);
        setImmediateNextStepIndex(steps.indexOf(next));
        if (selectedPlant && next) {
          handleStepClick(next, selectedPlant);
        }
      } else {
        setImmediateNextStep(null);
        setImmediateNextStepIndex(-1);
        setViewedStep(null);
        setViewedStepDetails(null);
        setIsViewingSpecificStep(false);
      }
    } else {
      setImmediateNextStep(null);
      setImmediateNextStepIndex(-1);
      setViewedStep(null);
      setViewedStepDetails(null);
      setIsViewingSpecificStep(false);
    }
  }, [steps, storeData, selectedPlant]);

  // Fetch plant data (GHMC/master)
//  useEffect(() => {
//   if (!selectedPlant) return;

//   const fetchPlantData = async () => {
//     try {
//       const ghmcRes = await axios.get(
//         `${API_BASE_URL}/GHMC-data?plant=${selectedPlant}`
//       );
//       const ghmcData = ghmcRes.data || [];

//       // 1. Update the store with fresh completion history
//       setStoreData(ghmcData);
      
//       // 2. Clear history-viewing states so form focuses on the NEW active step
//       setSubmitted(false);
//       setIsViewingSpecificStep(false);
//       setSelectedProcessDetails(null);

//       const plantRecord = ghmcData?.find(
//         (item) => item.loc === selectedPlant
//       );

//       // Determine Organization Type
//       setOrganizationType(plantRecord?.Organization || "GHMC");

//       if (ghmcData.length > 0) {
//         const firstStep = ghmcData[0];

      

//         setFormData((prev) => ({
//           ...prev,
//           loc: selectedPlant,
//            organisation: firstStep.Organization || "",
//           noOfTowers: firstStep.noOfTowers || "",
//           location: firstStep.LOCATION || "",
//           status: firstStep.STATUS || "",
//           // CRITICAL: Always reset these for the new process step
//           // Comments: "", 
//           // applyDate: "", 
//         }));
//       } else {
//         // Fallback to Master Data if no GHMC history exists yet
//         const masterRes = await getMasterByLoc(selectedPlant);
//         if (masterRes) {
//           setHeaderData(masterRes);
//           setFormData((prev) => ({
//             ...prev,
//             loc: selectedPlant,
//               organisation: masterRes.Organization || "",
//             project_name: masterRes.PROJECT_NAME || "",
//             location: masterRes.LOCATION || "",
//             status: masterRes.STATUS || "",
//             noOfTowers: masterRes.NUMBER_OF_TOWERS || "",
//             Comments: "",
//             applyDate: masterRes.APPLICATION_DATE || "",
//           }));
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching GHMC/master data:", err);
//     }
//   };

//   fetchPlantData();
//   // Added setSubmitted and other state setters to dependency if they are stable, 
//   // but usually, they are from useState so they don't need to be here.
// }, [selectedPlant, setStoreData, setHeaderData]);



  useEffect(() => {
    if (selectedPlant) {
      axios.get(
        `${API_BASE_URL}/GHMC-data?plant=${selectedPlant}`
      )
        .then((res) => {
          setStoreData(res.data);
      
          if (res.data.length > 0) {
                const plantRecord = res?.data?.find(
        (item) => item.loc === selectedPlant
      );
      const firstStep = res?.data[0];


        setOrganizationType(plantRecord?.Organization || "GHMC");
            setFormData((prev) => ({
              ...prev,
              loc: selectedPlant,
            organisation: firstStep.Organization || "",
            }));
            setSubmitted(false);
          }
        })
        .catch((err) => console.error("Error fetching step data", err));
    }
  }, [selectedPlant]);
  // Parse JSON arrays safely
  function parseJsonArraySafe(value) {
    if (!value) return [];
    try {
      if (Array.isArray(value)) return value;
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      if (typeof value === "string")
        return value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      return [];
    }
  }

  const combineAndParseDocArrays = (data, namesKey, pathsKey) => {
    const names = parseJsonArraySafe(data[namesKey]);
    const paths = parseJsonArraySafe(data[pathsKey]);
    const combined = [];
    const minLength = Math.min(names.length, paths.length);
    for (let i = 0; i < minLength; i++) {
      if (names[i] && paths[i]) {
        combined.push({ name: names[i], path: paths[i] });
      }
    }
    return combined;
  };

  // Fetch next step details (guarded by plant)
  useEffect(() => {
    if (!selectedPlant || immediateNextStepIndex === -1 || !steps.length) {
      setNextStepDetails(null);
      return;
    }

    const plantAtRequest = selectedPlant;
    const nextStepName = steps[immediateNextStepIndex]?.PROCESS;
    if (!nextStepName) return;

    axios
      .get(
        `${API_BASE_URL}/GHMC-step-details/${encodeURIComponent(
          plantAtRequest
        )}/${encodeURIComponent(nextStepName)}`
      )
      .then((res) => {
        if (plantAtRequest !== selectedPlant) return; // FIX: ignore stale response

        const data = res.data || {};
        const parsed = {
          ...data,
          tower_docs: combineAndParseDocArrays(
            data, "tower_doc_name", "tower_doc_path"
          ),
          feas_docs: combineAndParseDocArrays(
            data, "feas_doc_name", "feas_doc_path"
          ),
          amount_docs: combineAndParseDocArrays(
            data, "amount_doc_name", "amount_doc_path"
          ),
        };
        setNextStepDetails(parsed);
      })
      .catch((err) => {
        if (plantAtRequest !== selectedPlant) return;
        console.error("Error fetching GHMC-step-details:", err);
        setNextStepDetails(null);
      });
  }, [selectedPlant, immediateNextStepIndex, steps]);

  // Update form data from nextStepDetails (guarded by plant)
  useEffect(() => {
    if (!selectedPlant) return;

    if (nextStepDetails) {
      if (
        !submitted ||
        (immediateNextStep &&
          nextStepDetails.PROCESS === immediateNextStep.PROCESS)
      ) {
        setFormData((prev) => ({
          ...prev,
          applyDate: nextStepDetails.applyDate || "",
          Comments: "",
        }));

  
      }
    } else {
      if (!submitted) {
        setFormData((prev) => ({
          ...prev,
          applyDate: "",
          Comments: "",
        }));
      }
    }
  }, [selectedPlant, nextStepDetails, submitted, immediateNextStep]);

const handleChange = async (e) => {
  const { name, value } = e.target;

  if (name === "loc") {
    // 1. CLEAR EVERYTHING IMMEDIATELY (Prevents Flicker)
    setSelectedPlant(value);
    setStoreData([]);           // Clear completion history of previous plant
    setSteps([]);               // Clear sidebar steps of previous plant
    setHeaderData(null);        // Clear header info
    setNextStepDetails(null);   // Clear auto-filled step data
    setViewedStepDetails(null); // Clear viewing details
    setSelectedProcessDetails(null);
    setSubmitted(false);
    setIsViewingSpecificStep(false);

    // Reset Form Fields immediately
    setFormData({
      loc: value,
      applyDate: "",
      Comments: "",
      organisation: "",
      project_name: "",
      location: "",
      status: "",
      noOfTowers: "",
      TotalProjectArea: "",
      ProjectBuildArea: "",
      ProjectName: "",
      noOfFlats: "",
      KLD: "",
      OldAmount: "",
      TotalAmount: "",
      Size: "",
      Ghmc: "",
    });

    // If user selected the empty option, stop here
    if (!value) return;

    // 2. FETCH NEW DATA
    try {
      const res = await getMasterByLoc(value);
      if (res) {
        setHeaderData(res);
        // Ensure Organization is never null for your SQL constraint
        const org = res.Organization || "GHMC";
        setOrganizationType(org);
        
        setFormData((prev) => ({
          ...prev,
          organisation: org,
          applyDate: res.APPLICATION_DATE || "",
          noOfTowers: res.NUMBER_OF_TOWERS || "",
          TotalProjectArea: res.TOTAL_PROJECT_AREA || "",
          ProjectBuildArea: res.PROJECT_BUILD_AREA || "",
          ProjectName: res.PROJECT_NAME || "",
          location: res.LOCATION || "",
          status: res.STATUS || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching master data:", err);
    }
  } else if (name === "noOfFlats") {
    const nocs = Math.ceil(Number(value) / 2);
    setFormData((prev) => ({
      ...prev,
      noOfFlats: value,
      KLD: value ? nocs : "",
    }));
  } else if (name === "OldAmount") {
    const amountPaid = storeData?.[0]?.AMOUNT_PAID || 0;
    const total = amountPaid + Number(value);
    setFormData((prev) => ({
      ...prev,
      OldAmount: value,
      TotalAmount: value ? total : "",
    }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};

  // updated on 26-12-2025
  const handleViewNextStep = () => {
    setSelectedProcessDetails(null);
    setIsViewingSpecificStep(false);
    setViewedStep(null);
    setViewedStepDetails(null);
    setSubmitted(false);
  };

const handleConfirmSubmit = async (emails) => {
  setIsSubmitting(true);

  const currentUserName = loggedInUser?.username;
  const payload = new FormData();

   payload.append("Organization", formData.organisation || "");
  payload.append("project_name", formData.project_name || "");
  payload.append("location", formData.location || "");
  payload.append("status", formData.status || "");

  // Process Specific Info
  payload.append("loc", formData.loc);
  payload.append("applyDate", formData.applyDate);
  payload.append("process", immediateNextStep?.PROCESS || "");
  payload.append("Comments", formData.Comments || "");
  payload.append("GHMC", formData.Ghmc || "");
  payload.append("OldAmount", formData.OldAmount || "");
  payload.append("Size_Of_Connection", formData.Size || "");
  payload.append("noOfFlats", formData.noOfFlats || "");
  payload.append("totalProjectArea", formData.TotalProjectArea || "");
  payload.append("projectBuildArea", formData.ProjectBuildArea || "");
  payload.append("noOfTowers", formData.noOfTowers || "");
  payload.append("TotalAmount", formData.TotalAmount || "");
  payload.append("username", currentUserName || "");

  emails.forEach((email, i) => {
    payload.append(`emails[${i}]`, email);
  });

  feasibilityDocs.forEach((file) => {
    payload.append("feas_doc_name[]", file);
  });

  try {
    const existingRecord = storeData?.find(
      (item) =>
        item.PROCESS?.trim().toLowerCase() ===
          immediateNextStep?.PROCESS?.trim().toLowerCase() &&
        item.loc?.trim().toLowerCase() === formData.loc?.trim().toLowerCase()
    );

    let apiUrl = `${API_BASE_URL}/GHMC-submit`;
    if (existingRecord) {
      apiUrl = `${API_BASE_URL}/GHMC-modify`;
    }

    const res = await axios.post(apiUrl, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // --- TOTAL RESET LOGIC ---
    
    // 1. Reset Global Selection States
    setSelectedPlant("");   // CRITICAL: This clears the selection and stops flickering
    setStoreData([]);       // Clears process history
    setSteps([]);           // Clears sidebar steps
    setHeaderData(null);    // Clears top info bar
    
    // 2. Reset Document Arrays
    setFeasibilityDocs([]);
    setAmountPaidDocs([]);
    setLinkDocs([]);
    setLandDocs([]);
    setOthDocs([]);
    
    // 3. Reset UI flags & Details
    setSubmitted(false);
    setIsViewingSpecificStep(false);
    setNextStepDetails(null);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setSelectedProcessDetails(null);

    // 4. Reset Form Object to initial empty state
    setFormData({
      loc: "",
      applyDate: "",
      Comments: "",
      process: "",
      organisation: "",
      project_name: "",
      location: "",
      status: "",
      noOfTowers: "",
      TotalProjectArea: "",
      ProjectBuildArea: "",
      ProjectName: "",
      noOfFlats: "",
      KLD: "",
      OldAmount: "",
      TotalAmount: "",
      Size: "",
      Ghmc: "",
    });

    // 5. Success Message
    setDialogConfig({
      title: "Success",
      message: "Form submitted successfully. All data has been reset.",
      confirmText: "OK",
      open: true,
    });
   
    // 6. Update context if necessary
    if (setRespModifyData) {
        setRespModifyData(res?.data?.data);
    }

  } catch (err) {
    console.error("Submission failed:", err);
    setDialogConfig({
      title: "Error",
      message: "Submission failed. Please check your connection and try again.",
      confirmText: "OK",
      open: true,
    });
  } finally {
    setIsSubmitting(false);
    setConfirmOpen(false);
  }
};
  const isProcessCompleted = (processName) => {
    return storeData?.some(
      (item) => item.PROCESS === processName && item.UPDATED === "YES"
    );
  };

  // Handle step click for viewing
  const handleStepClick = async (step, plant) => {
    if (!plant) return;
    const plantAtClick = plant; // FIX: capture plant at click time

    setViewedStep(step);
    setCurrentProcess(step.PROCESS);
    setIsViewingSpecificStep(true);

    try {
      const isHistoryStep = storeData.some(
        (item) => item.PROCESS === step.PROCESS && item.UPDATED === "YES"
      );

      const storedCompletedStep = storeData.find(
        (item) => item.PROCESS === step.PROCESS && item.UPDATED === "YES"
      );

      let dataToParse;
      if (storedCompletedStep) {
        dataToParse = storedCompletedStep;
        setSubmitted(true);
        setSelectedProcessDetails(storedCompletedStep);
      } else {
        const res = await axios.get(
          `${API_BASE_URL}/GHMC-step-details/${encodeURIComponent(
            plantAtClick
          )}/${encodeURIComponent(step.PROCESS)}`
        );

        if (plantAtClick !== selectedPlant) return; // FIX: ignore stale response

        dataToParse = res.data || {};
        setSubmitted(false);
        setSelectedProcessDetails(null);
      }

      const parsed = {
        ...dataToParse,
        tower_docs: combineAndParseDocArrays(
          dataToParse, "tower_doc_name", "tower_doc_path"
        ),
        feas_docs: combineAndParseDocArrays(
          dataToParse, "feas_doc_name", "feas_doc_path"
        ),
        amount_docs: combineAndParseDocArrays(
          dataToParse, "amount_doc_name", "amount_doc_path"
        ),
      };

      setFormData((prev) => ({
        ...prev,
        applyDate: parsed.applyDate || "",
        Comments: isHistoryStep ? (parsed.Comments || "") : "",
      }));

      setViewedStepDetails(parsed);
    } catch (err) {
      if (plantAtClick !== selectedPlant) return;
      console.error("Error fetching step details:", err);
      setViewedStepDetails(null);
      setSubmitted(false);
      setSelectedProcessDetails(null);
      setFormData((prev) => ({
        ...prev,
        applyDate: "",
        Comments: "",
      }));
    }
  };

  const NumberOfTowers = storeData?.[0]?.noOfTowers;

  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        {/* Left Sidebar */}
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <span className="fw-bold m-3">
              {organizationType ? `${organizationType} Process Steps` : "Process Steps"}
            </span>
            <Nav variant="pills" className="flex-column m-3">
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
                    <Nav.Link
                      eventKey={idx}
                      disabled={!clickable}
                      className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                      style={{ cursor: clickable ? "pointer" : "not-allowed" }}
                    >
                      {statusIcon}
                      <span
                        onClick={(e) => {
                          if (isCompleted) {
                            e.stopPropagation();
                            handleStepClick(step, selectedPlant);
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
                  </Nav.Item>
                );
              })}
            </Nav>
          </div>
        </Col>

        {/* Center Form */}
        <Col
          md={6}
          className="d-flex flex-column"
          style={{ height: "400px", overflowY: "auto" }}
        >
          {areAllStepsCompleted() && !isViewingSpecificStep ? (
            <div
              className="p-3 border rounded bg-light d-flex align-items-center justify-content-center"
              style={{ minHeight: "400px" }}
            >
              {renderCompletionMessage()}
            </div>
          ) : (
            <Form
              key={`${formData.loc || "none"}-${
                immediateNextStep?.PROCESS || "none"
              }`} // FIX: force remount when plant/process changes [web:15]
              className="p-3 border rounded bg-light"
            >
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
              ) : (
                <h4 className="mb-3 text-warning fw-bold">
                  {currentProcess || immediateNextStep?.PROCESS}
                  {NumberOfTowers && (
                    <>
                      {" "}
                      | Towers Count :{" "}
                      <span className="text-dark">{NumberOfTowers}</span>
                    </>
                  )}
                </h4>
              )}

              <Row className="mb-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Plant</Form.Label>
                    <Form.Select
                      name="loc"
                      value={formData.loc || ""}
                      onChange={handleChange}
                      isInvalid={!!errors.loc}
                    >
                      <option value="">Select Plant</option>
                      {loc.map((ele, index) => (
                        <option key={index} value={ele.loc}>
                          {ele.loc}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.loc}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Apply Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="applyDate"
                      max={new Date().toISOString().split("T")[0]}
                      value={formData.applyDate || ""}
                      onChange={handleChange}
                      isInvalid={!!errors.applyDate}
                      disabled={
                        !formData.loc ||
                        (nextStepDetails && nextStepDetails.applyDate) ||
                        !!selectedProcessDetails
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.applyDate}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={6}>
                  <Form.Label>Upload Document</Form.Label>
                  <button
                    type="button"
                    className="btn btn-outline-secondary form-control"
                    onClick={() => setShowFeasibilityModal(true)}
                    disabled={!!selectedProcessDetails}
                  >
                    <FaUpload className="me-2" /> Upload Document
                    <span className="ms-2 text-muted">
                      {feasibilityDocs.length > 0 &&
                        `(${feasibilityDocs.length} selected)`}
                    </span>
                  </button>
                  {errors.feasibilityDocs && (
                    <p className="error-text text-danger mt-1 mb-0">
                      {errors.feasibilityDocs}
                    </p>
                  )}
                </Col>

                <Col md={6}>
                  <Form.Group controlId="formComments">
                    <Form.Label>Comments</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="Comments"
                      value={formData.Comments || ""}
                      onChange={handleChange}
                      disabled={
                        !formData.loc ||
                        isProcessCompleted(viewedStep?.PROCESS) ||
                        !!selectedProcessDetails
                      }
                    />
                    {errors.Comments && (
                      <p className="error-text text-danger">
                        {errors.Comments}
                      </p>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                {isFirstProcess && (
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label> Number of Towers </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={1}
                        name="noOfTowers"
                        value={formData.noOfTowers || ""}
                        onChange={handleChange}
                        disabled={
                          !formData.loc ||
                          isProcessCompleted(viewedStep?.PROCESS) ||
                          !!selectedProcessDetails
                        }
                      />
                    </Form.Group>
                  </Col>
                )}
              </Row>

              <div className="d-grid">
                {areAllStepsCompleted() && isViewingSpecificStep && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setIsViewingSpecificStep(false)}
                    className="w-100 fw-semibold mb-2"
                  >
                    ← Back to Completion Message
                  </Button>
                )}

                <Button
                  variant={submitted ? "success" : "primary"}
                  size="md"
                  onClick={handleEmailSubmit}
                  className="w-100 fw-semibold"
                  disabled={!formData.loc || isSubmitting || submitted}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : submitted
                    ? "Submitted"
                    : "Submit"}
                </Button>
              </div>
            </Form>
          )}
        </Col>

        {/* Right Section: Previous Docs */}
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill w-50">
            <PreviousGhmcDocs
              docsData={isViewingSpecificStep ? viewedStepDetails : nextStepDetails}
              type="modify"
            />
          </div>
        </Col>
      </Row>

      <ReusableDialog
        open={dialogConfig.open}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onClose={() => setDialogConfig({ ...dialogConfig, open: false })}
        onConfirm={() => setDialogConfig({ ...dialogConfig, open: false })}
        confirmText={dialogConfig.confirmText}
      />

      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData.loc}
        applyDate={formData.applyDate}
        comments={formData.Comments}
      />

      <WaterDocUploadModal
        show={showFeasibilityModal}
        onClose={() => setShowFeasibilityModal(false)}
        linkDocs={feasibilityDocs}
        setLinkDocs={setFeasibilityDocs}
        title="Upload Feasibility Certificate"
        showLandDocs={false}
        showOthDocs={false}
        validateFileType={validateFileType}
      />

      <WaterDocUploadModal
        show={amountPaidDocModal}
        onClose={() => setAmountPaidDocModal(false)}
        linkDocs={AmountPaidDocs}
        setLinkDocs={setAmountPaidDocs}
        title="Upload Paid Document Certificate"
        showLandDocs={false}
        showOthDocs={false}
        validateFileType={validateFileType}
      />

      <WaterDocUploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        linkDocs={linkDocs}
        setLinkDocs={setLinkDocs}
        landDocs={landDocs}
        setLandDocs={setLandDocs}
        othDocs={othDocs}
        setOthDocs={setOthDocs}
        validateFileType={validateFileType}
      />
    </>
  );
};

export default GhmcModify;
