import React, { useEffect, useState, useMemo, useContext } from "react";
import { Nav, Form, Button, Row, Col, Badge, OverlayTrigger, Tooltip, Card, Alert, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import { FaArrowLeft, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import { Context } from "../context/ContextData";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { getMasterByLoc } from "../api/Api";
import EmailSelectionModal from "./EmailModal";
const SUB_LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4"];

const ReraUpdateTable = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

const [showCongratulation, setShowCongratulation] = useState(true);
  const {
    storeData,
    setStoreData,
    totalMasterData,
    setHeaderData,
    headerData,
    setRespModifyData,
  } = useContext(Context);

  const [steps, setSteps] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
 const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
 const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewedStep, setViewedStep] = useState(null);
const [showCompletionMessage, setShowCompletionMessage] = useState(true);

  const [viewedStepDetails, setViewedStepDetails] = useState(null);
const [recordExists, setRecordExists] = useState(false); 
  const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });
      const [loggedInUser, setLoggedInUser] = useState(null);   //------------login user state

 const areAllStepsCompleted = () => {
  if (!steps.length || !storeData.length) return false;

  const completedSteps = storeData
    .filter((item) => item.UPDATED === "YES")
    .map((item) => item.PROCESS?.trim());

  return steps.every((step) => completedSteps.includes(step.PROCESS?.trim()));
};
const isCurrentStepEditable = immediateNextStep && 
  viewedStep && 
  immediateNextStep.PROCESS === viewedStep.PROCESS &&
  !storeData.some(item => item.PROCESS === viewedStep.PROCESS && item.UPDATED === "YES");
  

  const checkRecordExists = () => {
    if (selectedPlant && immediateNextStep) {
      const exists = storeData.some(item => 
        item.PROCESS?.toLowerCase().trim() === immediateNextStep.PROCESS?.toLowerCase().trim() &&
        item.LOC?.toLowerCase().trim() === selectedPlant.toLowerCase().trim()
      );

      setRecordExists(exists);
      console.log("Record exists check:", exists, "for process:", immediateNextStep?.PROCESS, "plant:", selectedPlant);
    } else {
      setRecordExists(false);
    }
  };

  
    useEffect(() => {
      checkRecordExists();
    }, [storeData, selectedPlant, immediateNextStep]);
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

// And update the condition to show completion message
useEffect(() => {
  if (areAllStepsCompleted() && !selectedProcessDetails) {
    setShowCompletionMessage(true);
  } else {
    setShowCompletionMessage(false);
  }
}, [areAllStepsCompleted(), selectedProcessDetails]);

useEffect(() => {
  if (areAllStepsCompleted() && selectedPlant && !selectedProcessDetails) {
    setShowCongratulation(true);
  } else {
    setShowCongratulation(false);
  }
}, [areAllStepsCompleted(), selectedPlant, selectedProcessDetails]);
 const handleEmailSubmit = () => {

  if (!selectedPlant || !immediateNextStep) {
    Swal.fire("Validation Error", "Please select a plant and ensure a step is active.", "error");
    return;
  }

     if (!recordExists) {
        Swal.fire({
          icon: "warning",
          title: "Process Not Initialized",
          text: `The process "${immediateNextStep?.PROCESS}" has not been initialized for plant "${selectedPlant}". Please submit in the Modify section.`,
          confirmButtonText: "OK"
        });
        return;
      }

  // ✅ NEW: Check if Step 2 has completed all 4 levels
  if (immediateNextStep.PROCESS === "Status of the Application") {
    const currentLevel = viewedStepDetails?.LEVEL;
    const currentStatus = viewedStepDetails?.LEVEL_STATUS;
    
    // Check if Level 4 is completed
    if (!(currentLevel === "Level 4" && currentStatus === "Completed")) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Levels",
        text: "Please complete all 4 levels before updating this step.",
        confirmButtonText: "OK"
      });
      return;
    }
  }

  console.log("Setting showEmailModal to true");
  setShowEmailModal(true);
};
  const handleEmailSelectionSubmit = async (emails) => {
    console.log('Selected emails:', emails);
    setSelectedEmails(emails);
    setShowEmailModal(false);

    // Proceed with form submission
    await handleConfirmSubmit(emails);
  };

  // --- Data Fetching Hooks ---
  useEffect(() => {
    axios.get(`${API_BASE_URL}/rera-process`).then((res) => setSteps(res.data)).catch((err) => console.error("Error fetching RERA processes:", err));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/rera-plants`).then((res) => setPlants(res.data)).catch((err) => console.error("Error fetching RERA plants:", err));
  }, []);

  // This is the main effect that runs when a plant is selected
  useEffect(() => {
    // Reset everything
     setStoreData([])
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setViewedStep(null);
    setViewedStepDetails(null);
    setProjectInfo({ prjName: "", address: "" });

    if (selectedPlant && steps.length > 0) {
      axios.get(`${API_BASE_URL}/rera-data?plant=${selectedPlant}`)
        .then((res) => {
          const fetchedData = res.data;
          setStoreData(fetchedData);
          if (fetchedData && fetchedData.length > 0) {
            const firstRecord = fetchedData[0];
            setProjectInfo({ prjName: firstRecord.PROJECT_NAME || "", address: firstRecord.ADDRESS || "" });
          }

                         const currentProcessExists = res.data.some(item => 
            item.PROCESS?.toLowerCase().trim() === immediateNextStep?.PROCESS?.toLowerCase().trim() &&
            item.LOC?.toLowerCase().trim() === selectedPlant.toLowerCase().trim()
          );
       
        setRecordExists(currentProcessExists);
          const completedProcesses = fetchedData.filter((item) => item.UPDATED === "YES").map((item) => item.PROCESS);
          const nextStep = steps.find((step) => !completedProcesses.includes(step.PROCESS));

          if (nextStep) {
            setImmediateNextStep(nextStep); // Set the true active step
            setImmediateNextStepIndex(steps.indexOf(nextStep));
            handleStepClick(nextStep, selectedPlant); // ✅ Automatically click/load details for the active step
          } else {

             setRecordExists(false);
            // Handle case where all steps are complete
            if (completedProcesses.length === steps.length && steps.length > 0) {
              setImmediateNextStepIndex(steps.length);
              // Optionally, view the last step by default
              if (steps.length > 0) {
                handleStepClick(steps[steps.length - 1], selectedPlant);
              }
            }
          }
        })
        .catch((err) => console.error("Error during data fetching process:", err));
    }
  }, [selectedPlant, steps]);

useEffect(() => {
  console.log("viewedStepDetails changed:", viewedStepDetails);
  console.log("viewedStepDetails.APPLY_DT:", viewedStepDetails?.APPLY_DT);
  console.log("viewedStepDetails.COMMENTS:", viewedStepDetails?.COMMENTS);
}, [viewedStepDetails]);

const handleViewNextStep = () => {
  setSelectedProcessDetails(null);
  
  if (immediateNextStep) {
    handleStepClick(immediateNextStep, selectedPlant);
  }
};

  // ✅ NEW: This function is now the single point for fetching and displaying step details.
const handleStepClick = async (step, plant, isCompletedStep = false) => {
  if (!plant) return;
  
  setSelectedProcessDetails(isCompletedStep ? step : null);
  setViewedStep(step);
  
  try {
    const apiUrl = `${API_BASE_URL}/rera-step-details/${encodeURIComponent(plant)}/${encodeURIComponent(step.PROCESS)}`;
    const detailsRes = await axios.get(apiUrl);
    console.log("Fetched step details:", detailsRes.data);
    
    if (detailsRes && detailsRes.data) {
      // ✅ FIX: Preserve edited dates if they exist in local state
      const updatedDetails = { ...detailsRes.data };
      
      // If we have locally edited dates, keep them
      if (viewedStepDetails?.FRM_DT && viewedStepDetails?.TO_DT) {
        updatedDetails.FRM_DT = viewedStepDetails.FRM_DT;
        updatedDetails.TO_DT = viewedStepDetails.TO_DT;
      }
      
      setViewedStepDetails(updatedDetails);
    } else {
      setViewedStepDetails({});
    }
  } catch (error) {
    console.error(`Error fetching details for step: ${step.PROCESS}`, error);
    setViewedStepDetails({});
  }
};
const handleChange = async (e) => {
  const { name, value } = e.target;

  if (name === "loc") {
    setSelectedPlant(value);
    console.log(name, "name", value);

    if (value) { // Only fetch data if a plant is selected
      try {
        const res = await getMasterByLoc(value);
        if (res) {
          setHeaderData(res);
        }
      } catch (err) {
        console.error("Error fetching master by loc:", err);
        setHeaderData(null);
      }
    } else {
      // If value is empty (Select Plant), reset all data
      setHeaderData(null);
      setViewedStep(null);
      setViewedStepDetails(null);
      setSelectedProcessDetails(null);
      setImmediateNextStep(null);
      setImmediateNextStepIndex(-1);
      setProjectInfo({ prjName: "", address: "" });
    }
  }
};
  // const handleChange = async (e) => {
  //   const { name, value } = e.target;

  //   if (name === "loc") {
  //     setSelectedPlant(value);
    
  //     try {
  //       const res = await getMasterByLoc(value);
  //       if (res) {
  //         setHeaderData(res);
  //       }
  //       else{
        
  //     setRecordExists(false);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching master by loc:", err);
  //       setHeaderData(null);
  //     }
  //   }
  // };

  // This logic now correctly calculates sub-level status based on the VIEWED step's details
const activeSubLevelIndex = useMemo(() => {
  if (viewedStep?.PROCESS !== "Status of the Application") return -1;
  const currentLevel = viewedStepDetails?.LEVEL;
  const currentStatus = viewedStepDetails?.LEVEL_STATUS;

  // ✅ Check if Level 4 is completed
  if (currentLevel === "Level 4" && currentStatus === "Completed") {
    return SUB_LEVELS.length; // This should be 4, meaning all levels are complete
  }
  
  if (!currentLevel) return 0;
  
  let currentIndex = SUB_LEVELS.indexOf(currentLevel);
  if (currentIndex === -1) currentIndex = 0;
  
  if (currentStatus === "Yes") {
    return currentIndex + 1;
  }
  
  return currentIndex;
}, [viewedStep, viewedStepDetails]);

const handleConfirmSubmit = async (emails) => {
    setIsSubmitting(true);
  if (!selectedPlant || !immediateNextStep) {
    Swal.fire("Error", "No active step is available to update.", "error");
    return;
  }
 //  --- : 'fetch User';
    let currentUserName = loggedInUser.username;

  const payload = new FormData();
  payload.append("loc", selectedPlant);
  payload.append("applyDate",viewedStepDetails?.APPLY_DT);
  payload.append("comments",  viewedStepDetails?.COMMENTS);
  payload.append("username",  currentUserName);

   // UPDATED: Check which step we're updating to send appropriate date
  if (immediateNextStep.PROCESS === "Validity of the Certificate") {
    // For step 3, send FROM_DT and TO_DT
    payload.append("fromDate", viewedStepDetails?.FRM_DT || "");
    payload.append("toDate", viewedStepDetails?.TO_DT || "");
  } 
  payload.append("process", immediateNextStep.PROCESS);

  emails.forEach((email, i) => {
    payload.append(`emails[${i}]`, email);
  });

  const apiUrl = `${API_BASE_URL}/rera-update`;

  try {
    await axios.post(apiUrl, payload);

    // ✅ Wait a moment for backend to process
    // await new Promise(resolve => setTimeout(resolve, 500));

    // ✅ FIRST: Refresh the storeData to update step completion status
    const res = await axios.get(`${API_BASE_URL}/rera-data?plant=${selectedPlant}`);
    const fetchedData = res.data;

    setStoreData(fetchedData);

     setSelectedPlant(""); // This will reset the dropdown to "Select Plant"
    
    // ✅ RESET ALL RELATED STATES
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setViewedStep(null);
    setViewedStepDetails(null);
    setSelectedProcessDetails(null);
    setHeaderData(null);
    setProjectInfo({ prjName: "", address: "" });
  setStoreData([]);
    // ✅ SECOND: Check current step status
    const completedProcesses = fetchedData.filter((item) => item.UPDATED === "YES").map((item) => item.PROCESS);
    const nextStep = steps.find((step) => !completedProcesses.includes(step.PROCESS));

    if (nextStep) {
      setImmediateNextStep(nextStep);
      setImmediateNextStepIndex(steps.indexOf(nextStep));
      
      // ✅ Automatically load the next step's details
      handleStepClick(nextStep, selectedPlant);
    } else {
      // All steps completed
      setImmediateNextStep(null);
      setImmediateNextStepIndex(steps.length);
    }

    // ✅ THIRD: Show success message
    await Swal.fire({
      icon: "success",
      title: "Status Updated!",
      text: `Step '${immediateNextStep.PROCESS}' has been marked as complete.`,
      timer: 2000,
      showConfirmButton: false
    });

  } catch (error) {
    console.error("Update failed:", error);
    Swal.fire("Update Failed", "Could not update the status. Please check the console.", "error");
  }

  finally {
    setIsSubmitting(false);
  }
};
// Add this useEffect after your existing useEffect hooks
useEffect(() => {
  // When storeData changes (after update), refresh the viewed step details
  if (selectedPlant && viewedStep) {
    const fetchUpdatedDetails = async () => {
      try {
        const detailsRes = await axios.get(
          `${API_BASE_URL}/rera-step-details/${encodeURIComponent(selectedPlant)}/${encodeURIComponent(viewedStep.PROCESS)}`
        );
        if (detailsRes && detailsRes.data) {
          setViewedStepDetails(detailsRes.data);
        }
      } catch (error) {
        console.error("Error refreshing step details:", error);
      }
    };
    
    fetchUpdatedDetails();
  }
}, [storeData, selectedPlant, viewedStep]);
useEffect(() => {
  console.log("Debug badge states:", {
    viewedStep: viewedStep?.PROCESS,
    currentLevel: viewedStepDetails?.LEVEL,
    currentStatus: viewedStepDetails?.LEVEL_STATUS,
    activeSubLevelIndex: activeSubLevelIndex,
    SUB_LEVELS_length: SUB_LEVELS.length,
    isLevel4Completed: viewedStepDetails?.LEVEL === "Level 4" && viewedStepDetails?.LEVEL_STATUS === "Completed"
  });
}, [viewedStep, viewedStepDetails, activeSubLevelIndex]);

   const handleDemoteConfirm = (newLevel) => {
      if (newLevel) {
          // setLevelToSubmit(newLevel);
          // setFormData(prev => ({ ...prev, subLevelStatus: 'No' }));
          Swal.fire({
              icon: 'info',
              title: 'Level Changed',
              text: `The task will be reset to ${newLevel}. Click the main 'Submit' button to save this change.`,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3500
          });
      }
      setShowDemoteModal(false);
    
 const isStep2Incomplete = immediateNextStep?.PROCESS === "Status of the Application" && 
    !(viewedStepDetails?.LEVEL === "Level 4" && (viewedStepDetails?.LEVEL_STATUS === "Completed" || viewedStepDetails?.LEVEL_STATUS === "Yes"));

  // The button is only truly active if the user is viewing the actual immediateNextStep AND conditions are met
  const canUpdate = immediateNextStep && 
  viewedStep && 
  immediateNextStep.PROCESS === viewedStep.PROCESS &&
  !storeData.some(item => item.PROCESS === immediateNextStep.PROCESS && item.UPDATED === "YES");}
  // --- UI Rendering ---
  const renderDocumentHistory = () => {
    if (!viewedStepDetails || !viewedStepDetails.UPLOAD_DOC) {
      return <p className="text-muted mb-0">No documents found for this step.</p>;
    }
    let documents = [];
    try {
      const parsedDocs = JSON.parse(viewedStepDetails.UPLOAD_DOC);
      documents = parsedDocs.map((doc) => ({
        name: doc.file_name,
        url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`
      }));
    } catch (error) {
      console.error("Failed to parse UPLOAD_DOC JSON:", error);
      return <p className="text-danger mb-0">Error displaying documents.</p>;
    }
    return documents.length > 0 ? (
      <div
        className="mb-6"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "5px",
        }}
      >
        <h6 className="text-primary p-3">Uploaded Documents</h6>
        <ul className="list-unstyled mb-0">
          {documents.map((doc, idx) => (
            <li key={idx} className="mb-1">
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none text-dark"
                style={{ display: "flex", alignItems: "center" }}
              >
                <FaFileAlt className="me-2 text-secondary" />
                <span className="text-truncate" style={{ maxWidth: "200px" }}>
                  {doc.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <p className="text-muted mb-0">No documents were uploaded for this step.</p>
    );
  };

  // ✅ NEW: These conditions determine the button's state and tooltip text.handleEmailSubmit 
  const isStep2Incomplete = immediateNextStepIndex === 1 && activeSubLevelIndex < SUB_LEVELS.length;
  // The button is only truly active if the user is viewing the actual immediateNextStep.
  const canUpdate = immediateNextStep && viewedStep && immediateNextStep.PROCESS === viewedStep.PROCESS;

  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        <Col md={3} className="d-flex">
     
          <div className="border rounded p-3 bg-light flex-fill">
            <h6 className="text-center mb-3">Process Steps</h6>
            <Nav variant="pills" className="flex-column">
          {steps.map((step, idx) => {
  const isCompleted = storeData.some(
    item => item.PROCESS === step.PROCESS && item.UPDATED === "YES"
  );
  
  let variant = "secondary", statusIcon = "⏸️";
  if (isCompleted) { 
    variant = "success"; 
    statusIcon = "✅"; 
  } else if (idx === immediateNextStepIndex) { 
    variant = "warning"; 
    statusIcon = "⚠️"; 
  }

 
  const isClickable = isCompleted || idx === immediateNextStepIndex;

   return (
    <React.Fragment key={idx}>
      <Nav.Item className="mb-2">
        <Nav.Link
          active={viewedStep?.PROCESS === step.PROCESS}
          onClick={() => {
            if (isClickable) {
              handleStepClick(step, selectedPlant, isCompleted);
            }
          }}
          className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
          style={{ cursor: isClickable ? "pointer" : "not-allowed" }}
          disabled={!isClickable}
        >
          {statusIcon}<span>{step.PROCESS}</span>
        </Nav.Link>
      </Nav.Item>

      {/* Sub-levels for Step 2 */}
      {idx === 1 && viewedStep?.PROCESS === step.PROCESS && !isCompleted && (
        <div className="ps-4 mb-2 d-flex flex-wrap gap-1">
          {SUB_LEVELS.map((level, subIdx) => {
            let badgeVariant = "secondary";
            
            if (subIdx < activeSubLevelIndex) { 
              badgeVariant = "success"; 
            } else if (subIdx === activeSubLevelIndex) { 
              badgeVariant = "warning";
            }
            
            return (
              <Badge bg={badgeVariant} key={subIdx} className="shadow-sm">
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

       <Col
  md={6}
  className="d-flex flex-column"
  style={{ height: "400px", overflowY: "auto" }}
>
  {areAllStepsCompleted() && !selectedProcessDetails && showCongratulation ? (
    // Show completion message ONLY when no step is selected
    <Card className="p-4 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card.Body className="position-relative">
        {/* Back Button in top right corner */}
        <div className="position-absolute top-0 end-0 p-3">
          <Button 
  size="sm"
  onClick={() => {
    // Reset everything to show fresh form
    setSelectedPlant("");
    setHeaderData(null);
    setViewedStep(null);
    setViewedStepDetails(null);
    setSelectedProcessDetails(null);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setProjectInfo({ prjName: "", address: "" });
    setStoreData([]);
    setShowCongratulation(false);
  }}
  className="d-flex align-items-center gap-1"
  style={{
    backgroundColor: '#198754', // Darker green
    borderColor: '#198754',
    color: 'white',
  }}
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
              All <strong>{steps.length}</strong> steps for <strong>{selectedPlant}</strong> have been completed successfully.
            </p>
            <hr />
            <p className="mb-0">
              Click on any completed step above to view its details or click Back button to start fresh.
            </p>
          </Alert>
        </div>
      </Card.Body>
    </Card>
  ) : (
    // Show form with data
    <Form className="p-3 border rounded bg-light">
      {/* Add viewing header if looking at completed step */}
      {selectedProcessDetails ? (
        <div className="mb-3">
          <h4 className="mb-2 text-success fw-bold">
            Viewing: {viewedStep?.PROCESS} (Completed) ✅
          </h4>
          {immediateNextStep && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleViewNextStep}
            >
              View Next Step
            </Button>
          )}
        </div>
      ) : viewedStep ? (
        <h4 className="mb-3 text-primary fw-bold">{viewedStep.PROCESS}</h4>
      ) : (
        <h4 className="mb-3 text-muted">Select a Plant to begin</h4>
      )}
  

<Row className="mb-3">
 <Col md={6}>
  <Form.Group>
    <Form.Label>Plant</Form.Label>
    <Form.Select 
      name="loc" 
      value={selectedPlant} 
      onChange={handleChange}
    >
      <option value="">Select Plant to View</option>
      {plants.map((p, idx) => (
        <option key={idx} value={p.loc}>{p.loc}</option>
      ))}
    </Form.Select>
  </Form.Group>
</Col>
  {viewedStep?.PROCESS === "Validity of the Certificate" ? (
  <>
    <Col md={3}>
      <Form.Group>
        <Form.Label>From Date</Form.Label>
        <Form.Control
          type="date"
          value={viewedStepDetails?.FRM_DT || ""}
          onChange={(e) => setViewedStepDetails(prev => ({ 
            ...prev, 
            FRM_DT: e.target.value 
          }))}
          max={new Date().toISOString().split("T")[0]}
        />
      </Form.Group>
    </Col>

    <Col md={3}>
      <Form.Group>
        <Form.Label>To Date</Form.Label>
        <Form.Control
          type="date"
          value={viewedStepDetails?.TO_DT || ""}
          onChange={(e) => setViewedStepDetails(prev => ({ 
            ...prev, 
            TO_DT: e.target.value 
          }))}
          min={viewedStepDetails?.FRM_DT || ""} // Optional: To Date should be after From Date
        />
      </Form.Group>
    </Col>
  </>
  ) : (
    <>
      {/* Application Date */}
   <Col md={6}>
    <Form.Group>
      <Form.Label>Application Date</Form.Label>
      <Form.Control 
        type="date" 
        value={viewedStepDetails?.APPLY_DT || ""} 
        onChange={(e) => setViewedStepDetails(prev => ({ ...prev, APPLY_DT: e.target.value }))}
        readOnly={!isCurrentStepEditable}
              max={new Date().toISOString().split("T")[0]}
        style={{ 
          backgroundColor: !isCurrentStepEditable ? "#e9ecef" : "white",
          cursor: !isCurrentStepEditable ? "not-allowed" : "text"
        }}
      />
    </Form.Group>
  </Col>

      {/* Project */}

   {viewedStepDetails?.PROCESS === "Application Submission" && (
  <>
    <Col md={6}>
      <Form.Group>
        <Form.Label>Project Name</Form.Label>
        <Form.Control
          type="text"
          value={viewedStepDetails?.PROJECT_NAME || ""}
          readOnly
          disabled
          placeholder="Enter Project Name"
        />
      </Form.Group>
    </Col>

    <Col md={6} className="mt-2">
      <Form.Group>
        <Form.Label>Address</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={viewedStepDetails?.ADDRESS || ""}
          readOnly
          disabled
          placeholder="Enter Address"
        />
      </Form.Group>
    </Col>
  </>
)}

    </>
  )}
</Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Comments</Form.Label>
            <Form.Control as="textarea" rows={2} value={viewedStepDetails?.COMMENTS || ""} disabled />
          </Form.Group>
        </Col>
      
      {/* ✅ NEW: Add Status radio buttons for Step 2 when Level 4 is reached */}
{viewedStep?.PROCESS === "Status of the Application" && 
 viewedStepDetails?.LEVEL === "Level 4" && (
 
    <Col md={6}>
      <Form.Group>
        <Form.Label>Status</Form.Label>
        <div className="d-flex align-items-center gap-3 mt-2">
          <Form.Check
            type="radio"
            label="Yes"
            name="levelStatus"
            value="Yes"
            checked={viewedStepDetails?.LEVEL_STATUS === "Yes" || viewedStepDetails?.LEVEL_STATUS === "Completed"}
            disabled
            id="status-yes"
            className="me-3"
          />
          <Form.Check
            type="radio"
            label="No"
            name="levelStatus"
            value="No"
            checked={viewedStepDetails?.LEVEL_STATUS === "No"}
            disabled
            id="status-no"
          />
        </div>
        
      </Form.Group>
    </Col>
  
)}</Row>
     
      {/* Update button */}
<div className="d-grid mt-3">
  <OverlayTrigger
    placement="top"
    overlay={
      <Tooltip id="update-tooltip">
        {!canUpdate ? 
          (isStep2Incomplete ? 
            "Complete Level 4 to enable update" : 
            "You can only update the current active step"
          ) : 
          "Click here to update this step as complete."
        }
      </Tooltip>
    }
  >
    <span className="d-grid">
     <Button
  style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
  size="md"
  onClick={handleEmailSubmit}
  disabled={!canUpdate || isSubmitting || !selectedPlant || !recordExists}
   
>
    {isSubmitting ? "Updating..." : "Update"}
</Button>

    </span>
  </OverlayTrigger>
</div>
    </Form>
  )}
</Col>
        
        <Col md={3}>
  <Card
    className="border rounded bg-white p-3 d-flex flex-column"
    style={{
      height: "100%",
      minHeight: "400px",
    }}
  >
    {/* 📂 Document History section - adjust height based on whether View Logs is shown */}
    <div
      style={{
        flexBasis: selectedPlant ? "70%" : "100%",
        overflowY: "auto",
        overflowX: "hidden",
        borderBottom: selectedPlant ? "1px solid #ddd" : "none",
        paddingBottom: selectedPlant ? "8px" : "0",
        marginBottom: selectedPlant ? "8px" : "0",
      }}
    >
      <h5 className="mb-3 text-dark">Document History</h5>
      {renderDocumentHistory()}
    </div>

    {/* View Logs button - only show when plant is selected */}
    {selectedPlant && (
  <div className="p-2 border-top bg-light text-center">
    <Button 
      variant="info" 
      size="sm" 
      onClick={() => {
        console.log("=== DEBUG: View Logs Clicked ===");
        console.log("viewedStepDetails:", viewedStepDetails);
        console.log("LOG field:", viewedStepDetails?.LOG);
        console.log("Type of LOG:", typeof viewedStepDetails?.LOG);
        
        let logs = [];
        try {
          if (viewedStepDetails?.LOG) {
            // First, check if it's already an array
            if (Array.isArray(viewedStepDetails.LOG)) {
              logs = viewedStepDetails.LOG;
              console.log("LOG is already an array:", logs);
            } else {
              // Try to parse it as JSON
              logs = JSON.parse(viewedStepDetails.LOG);
              console.log("Parsed logs from JSON:", logs);
            }
          } else {
            console.log("No LOG field found in viewedStepDetails");
          }
        } catch (error) {
          console.error("Failed to parse logs:", error);
          console.log("Raw LOG value:", viewedStepDetails?.LOG);
          
          // Try alternative formats
          if (viewedStepDetails?.LOG) {
            // If it's a string but not JSON, create a simple log entry
            if (typeof viewedStepDetails.LOG === 'string') {
              logs = [{
                date: new Date().toISOString().split('T')[0],
                comment: viewedStepDetails.LOG
              }];
              console.log("Created simple log from string:", logs);
            }
          }
        }
        
        console.log("Final logs to display:", logs);
        setSelectedLogs(logs);
        setShowLogsModal(true);
      }}
    >
      View Logs
    </Button>
  </div>
)}
  </Card>
</Col>
      </Row>

      
     <Modal show={showLogsModal} onHide={() => setShowLogsModal(false)} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Activity Logs</Modal.Title>
  </Modal.Header>
  
  <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
    {selectedLogs.length === 0 ? (
      <p className="text-muted text-center">No logs available</p>
    ) : (
      selectedLogs.map((log, i) => {
        // Handle different log formats
        const timestamp = 
          log?.date || 
          log?.timestamp || 
          log?.created_at || 
          log?.time || 
          "Unknown date";
        
        const comment = 
          log?.comment || 
          log?.comments || 
          log?.action || 
          log?.message || 
          log?.description || 
          (typeof log === 'string' ? log : "No comment");
        
        return (
          <div key={i}>
            <strong>{timestamp}:</strong> {comment}
            {i < selectedLogs.length - 1 && <hr />}
          </div>
        );
      })
    )}
  </Modal.Body>
  
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowLogsModal(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>
      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={selectedPlant}
        applyDate={viewedStepDetails?.APPLY_DT}
        comments={viewedStepDetails?.COMMENTS}
      />
    </>
  );
};

export default ReraUpdateTable;
