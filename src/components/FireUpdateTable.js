
import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { Nav, Form, Button, Row, Col, Badge, Modal, OverlayTrigger, Tooltip, Card , Alert} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// added on 20-12-2025 ny rajakumari.m-----------------------------------------------------------
import {FaCheckCircle } from "react-icons/fa";
//-----------------------------------------------------------------------------------------------
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import { FaFileAlt, FaHistory } from "react-icons/fa";
import { Context } from "../context/ContextData";
import { getMasterByLoc } from "../api/Api";
import ProjectInfoHeader from "./ProjectInfoHeader";
import EmailSelectionModal from "./EmailModal";

const FireUpdateTable = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [steps, setSteps] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordExists, setRecordExists] = useState(false); 
  const {
    storeData,
    setStoreData,
    respModifyData,
    setRespModifyData,
    setHeaderData,
    headerData
  } = useContext(Context);

  const [formData, setFormData] = useState({
    loc: "",
    applyDate: "",
    document: null,
    comments: "",
    prjName: "",
    address: "",
    feePaid: "",
    feeAmount: "",
    noOfTowers: "",
    feepaidstatus: "",
  });

  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [viewedStepConceptualIndex, setViewedStepConceptualIndex] = useState(-1);
  const [viewedStepDetails, setViewedStepDetails] = useState(null);
  const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });
  const [provisionalNOCCompleted, setProvisionalNOCCompleted] = useState(false);
  const [currentProcess, setCurrentProcess] = useState("");
  const [isCompleted, setIsCompleted] = useState(null);
  const PROVISIONAL_NOC_STEP_INDICES = useMemo(() => [0, 1, 2, 3, 4], []);
  const OC_PROCESS_CONCEPTUAL_START_INDEX = PROVISIONAL_NOC_STEP_INDICES.length;
// Add this with your other useState declarations
const [allStepsCompleted, setAllStepsCompleted] = useState(false);
const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);   //------------login user state


  const provisionalRadioLabels = {
    1: "Site Inspection Status",
    2: "Queries Received?",
    3: "Committee Approved?",
    4: "Provisional Status?",
  };




  useEffect(() => {
  if (!selectedPlant) {
    setHeaderData({});
  }
}, [selectedPlant]);
  // Function to parse and get logs for current viewed step
  const getCurrentStepLogs = useCallback(() => {
    if (!viewedStepDetails?.LOG) {
      return [];
    }

    try {
      const logs = JSON.parse(viewedStepDetails.LOG);
      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      console.error("Failed to parse logs:", error);
      return [];
    }
  }, [viewedStepDetails]);


 const checkRecordExists = () => {
  if (selectedPlant && immediateNextStep) {
    const exists = storeData.some(item => 
      item.PROCESS?.toLowerCase().trim() === immediateNextStep.PROCESS?.toLowerCase().trim() &&
      item.LOC?.toLowerCase().trim() === selectedPlant.toLowerCase().trim() &&
      // Also check for the correct step type
      item.STEPTYPE?.toLowerCase().trim() === currentProcess.toLowerCase().trim()
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



  const fetchStepDetails = useCallback(async (plantId, processName, stepType) => {


    // let steptype = "OCPROCESS";
    setCurrentProcess(stepType);
    if (!plantId || !processName || !stepType) return null;
    try {
      const apiUrl = `${API_BASE_URL}/fire-step-details/${encodeURIComponent(plantId)}/${encodeURIComponent(processName)}/${encodeURIComponent(stepType)}`;
      const detailsRes = await axios.get(apiUrl);
      return detailsRes.data || null;
    } catch (error) {
      console.error(`Error fetching details for step: ${processName} (${stepType})`, error);
      return null;
    }
  }, []);
// Add this with your other useCallback functions
const checkAllStepsCompleted = useCallback((fetchedData) => {
  if (!fetchedData || !steps.length) return false;
  
  // Check if all ProvisionalNOC steps are completed
  const allProvisionalCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
    (index) => steps[index] && fetchedData.some(
      (item) => item.PROCESS === steps[index].PROCESS && item.UPDATED === "YES"
    )
  );
  
  if (!allProvisionalCompleted) return false;
  
  // Check if all OCProcess steps are completed
  const allOCCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
    (index) => steps[index] && fetchedData.some(
      (item) => item.PROCESS === steps[index].PROCESS && item.OC_UPDATED === "YES"
    )
  );
  
  return allProvisionalCompleted && allOCCompleted;
}, [steps, PROVISIONAL_NOC_STEP_INDICES]);


const fetchPlantData = useCallback(async (plantId) => {

if (!plantId || plantId.trim() === "") {
    setStoreData([]);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setViewedStepConceptualIndex(-1);
    setViewedStepDetails(null);
    setProjectInfo({ prjName: "", address: "" });
    setFormData(prev => ({
      ...prev,
      loc: "",
      applyDate: "",
      comments: "",
      prjName: "",
      address: "",
      noOfTowers: "",
      feepaidstatus: "",
      feePaid: "",
      feeAmount: "",
    }));
    setProvisionalNOCCompleted(false);
    setSelectedLogs([]);
    setAllStepsCompleted(false);
    setSelectedProcessDetails(null);
    return;
  }
  

  try {
    const res = await axios.get(`${API_BASE_URL}/fire-data?plant=${plantId}`);
    const fetchedData = res.data;
    setStoreData(fetchedData);

const stepTypeToCheck = immediateNextStepIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "OCPROCESS" : "ProvisionalNOC";
const currentProcessExists = fetchedData.some(item => 
  item.PROCESS?.toLowerCase().trim() === immediateNextStep?.PROCESS?.toLowerCase().trim() &&
  item.LOC?.toLowerCase().trim() === selectedPlant.toLowerCase().trim() &&
  item.STEPTYPE?.toLowerCase().trim() === stepTypeToCheck.toLowerCase().trim()
);
setRecordExists(currentProcessExists);
    const allCompleted = checkAllStepsCompleted(fetchedData);
    setAllStepsCompleted(allCompleted);

    let currentProjectName = "";
    let currentAddress = "";
    if (fetchedData && fetchedData.length > 0) {
      const firstRecord = fetchedData[0];
      currentProjectName = firstRecord.PROJECT_NAME || "";
      currentAddress = firstRecord.ADDRESS || "";
      setProjectInfo({ prjName: currentProjectName, address: currentAddress });
    } else {
      setProjectInfo({ prjName: "", address: "" });
       setRecordExists(false);
    }

    const allProvisionalNOCStepsCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
      (index) => steps[index] && fetchedData.some(
        (item) => item.PROCESS === steps[index].PROCESS && item.UPDATED === "YES"
      )
    );
    setProvisionalNOCCompleted(allProvisionalNOCStepsCompleted);

    let nextStepFound = null;
    let nextStepIdx = -1;

    if (!allProvisionalNOCStepsCompleted) {
      for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
        if (steps[idx] && !fetchedData.some(
          (item) => item.PROCESS === steps[idx].PROCESS && item.UPDATED === "YES"
        )) {
          nextStepFound = steps[idx];
          nextStepIdx = idx;
          break;
        }
      }
    } else {
      for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
        if (steps[idx] && !fetchedData.some(
          (item) => item.PROCESS === steps[idx].PROCESS && item.OC_UPDATED === "YES"
        )) {
          nextStepFound = steps[idx];
          nextStepIdx = idx + OC_PROCESS_CONCEPTUAL_START_INDEX;
          break;
        }
      }
    }

    setImmediateNextStep(nextStepFound);
    setImmediateNextStepIndex(nextStepIdx);

    let detailsForViewedStep = null;

    // If all steps completed, show last OC step by default
    if (allCompleted) {
      const lastOCStepIndex = (PROVISIONAL_NOC_STEP_INDICES.length - 1) + OC_PROCESS_CONCEPTUAL_START_INDEX;
      const lastOCStep = steps[PROVISIONAL_NOC_STEP_INDICES.length - 1];
      detailsForViewedStep = await fetchStepDetails(plantId, lastOCStep.PROCESS, "OCPROCESS");
      setViewedStepConceptualIndex(lastOCStepIndex);
      // ✅ REMOVE this line - don't set selectedProcessDetails when all steps are completed
      // setSelectedProcessDetails(lastOCStep);
    } else if (nextStepFound) {
      const stepType = nextStepIdx >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "OCPROCESS" : "ProvisionalNOC";
      detailsForViewedStep = await fetchStepDetails(plantId, nextStepFound.PROCESS, stepType);
      setViewedStepConceptualIndex(nextStepIdx);
      setSelectedProcessDetails(null);
    } else if (steps.length > 0) {
      const lastOCStepIndex = (PROVISIONAL_NOC_STEP_INDICES.length - 1) + OC_PROCESS_CONCEPTUAL_START_INDEX;
      const lastOCStep = steps[PROVISIONAL_NOC_STEP_INDICES.length - 1];
      detailsForViewedStep = await fetchStepDetails(plantId, lastOCStep.PROCESS, "OCPROCESS");
      setViewedStepConceptualIndex(lastOCStepIndex);
    }

    setViewedStepDetails(detailsForViewedStep);

    // Load logs if available
    if (detailsForViewedStep?.LOG) {
      try {
        const logs = JSON.parse(detailsForViewedStep.LOG);
        setSelectedLogs(Array.isArray(logs) ? logs : []);
      } catch (error) {
        console.error("Failed to parse LOG JSON:", error);
        setSelectedLogs([]);
      }
    } else {
      setSelectedLogs([]);
    }

    setFormData((prev) => ({
      ...prev,
      loc: plantId,
      prjName: currentProjectName,
      address: currentAddress,
      applyDate: detailsForViewedStep?.APPLY_DT || "",
      comments: detailsForViewedStep?.COMMENTS || "",
      noOfTowers: detailsForViewedStep?.NO_OF_TOWERS || "",
      feepaidstatus: detailsForViewedStep?.FEE_PAID_STATUS || "",
      feePaid: detailsForViewedStep?.FEE_PAID || "",
      feeAmount: detailsForViewedStep?.FEE_AMOUNT || "",
    }));

  } catch (err) {
    console.error("Error fetching plant data:", err);
    Swal.fire("Error", "Failed to load plant data. Please check console.", "error");
    setStoreData([]);
     setRecordExists(false); 
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setViewedStepConceptualIndex(-1);
    setViewedStepDetails(null);
    setProjectInfo({ prjName: "", address: "" });
    setFormData({
      loc: plantId,
      applyDate: "",
      comments: "",
      prjName: "",
      address: "",
      noOfTowers: "",
      feepaidstatus: "",
      feePaid: "",
      feeAmount: "",
    });
    setProvisionalNOCCompleted(false);
    setSelectedLogs([]);
    setAllStepsCompleted(false);
    setSelectedProcessDetails(null);
  }
}, [steps, PROVISIONAL_NOC_STEP_INDICES, OC_PROCESS_CONCEPTUAL_START_INDEX, fetchStepDetails, checkAllStepsCompleted]);


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
    axios.get(`${API_BASE_URL}/fire-process`)
      .then((res) => setSteps(res.data))
      .catch((err) => console.error("Error fetching FIRE processes:", err));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/fire-plants`)
      .then((res) => setPlants(res.data))
      .catch((err) => console.error("Error fetching FIRE plants:", err));
  }, []);

  useEffect(() => {
    fetchPlantData(selectedPlant);
  }, [selectedPlant, steps, fetchPlantData]);

 


  const handleEmailSubmit = () => {
  const newErrors = {};
  if (!formData.loc) newErrors.loc = "Plant selection is required";
  if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

  if (Object.keys(newErrors).length > 0) {
    Swal.fire("Validation Error", Object.values(newErrors).join("<br>"), "error");
    return;
  }

  // Check if record exists before proceeding
  if (!recordExists) {
    Swal.fire({
      icon: "warning",
      title: "Process Not Initialized",
      text: `The process "${immediateNextStep?.PROCESS}" has not been initialized for plant "${selectedPlant}". Please submit in the Modify section.`,
      confirmButtonText: "OK"
    });
    return; // Important: Return here to stop execution
  }

  setShowEmailModal(true);
};

  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);
    await handleConfirmSubmit(emails);
  };

  const handleConfirmSubmit = async (emails) => {
    setIsSubmitting(true);
    if (!formData.loc || !immediateNextStep) {
      Swal.fire("Selection Error", "Please select a Plant and ensure an active process step.", "error");
      return;
    }




    const currentStepIsOC = immediateNextStepIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX && immediateNextStepIndex < (PROVISIONAL_NOC_STEP_INDICES.length * 2);
    // const stepType = currentStepIsOC ? "OC Process" : "Provisional NOC";

    //  --- : 'fetch User';
    let currentUserName = loggedInUser.username;

    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("process", immediateNextStep.PROCESS);
    //  payload.append("stepType", currentStepType);
    payload.append("steptype", currentProcess);
    payload.append("applyDate", formData.applyDate);
    payload.append("comments", formData.comments);
    payload.append("username", currentUserName);

    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

try {
    await axios.post(`${API_BASE_URL}/fire-update`, payload);
    
    // Reset plant dropdown after successful submission
    setSelectedPlant("");
    setFormData(prev => ({
      ...prev,
      loc: "",
      applyDate: "",
      comments: "",
      prjName: "",
      address: "",
      noOfTowers: "",
      feepaidstatus: "",
      feePaid: "",
      feeAmount: "",
    }));
    
    // Reset other states
    setViewedStepConceptualIndex(-1);
    setViewedStepDetails(null);
    setSelectedProcessDetails(null);
    setSelectedLogs([]);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setProvisionalNOCCompleted(false);
    setAllStepsCompleted(false);
    setStoreData([]);
    
    await Swal.fire({
      icon: "success",
      title: "Step Updated!",
      text: "Process step updated successfully. Plant dropdown has been reset.",
      timer: 1500,
      showConfirmButton: false,
    });
    
    // No need to fetch plant data since we reset it
    // await fetchPlantData(formData.loc); // Remove this line
    
  } catch (error) {
    console.error("Submission failed:", error);
    Swal.fire("Submission Failed", "Please check the console for details.", "error");
  } finally {
    setIsSubmitting(false);
  }
};
const handleViewNextStep = () => {
  setSelectedProcessDetails(null);
  if (immediateNextStep) {
    const stepType = immediateNextStepIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "OCPROCESS" : "ProvisionalNOC";
    handleStepClick(immediateNextStep.PROCESS, stepType, immediateNextStepIndex);
  }
};
 const handleStepClick = useCallback(async (processName, stepType, conceptualIndex, isCompleted = false) => {
  if (!selectedPlant) {
    Swal.fire("Error", "Please select a plant first", "error");
    return;
  }

  setViewedStepConceptualIndex(conceptualIndex);
  if (isCompleted) {
    setSelectedProcessDetails({ PROCESS: processName, stepType });
  } else {
    setSelectedProcessDetails(null);
  }

  // ✅ Add this line to fetch the details
  const details = await fetchStepDetails(selectedPlant, processName, stepType);
  setViewedStepDetails(details);
  
  // Load logs for the clicked step
  if (details?.LOG) {
    try {
      const logs = JSON.parse(details.LOG);
      setSelectedLogs(Array.isArray(logs) ? logs : []);
    } catch (error) {
      console.error("Failed to parse LOG JSON:", error);
      setSelectedLogs([]);
    }
  } else {
    setSelectedLogs([]);
  }

  setFormData((prev) => ({
    ...prev,
    applyDate: details?.APPLY_DT || "",
    comments: details?.COMMENTS || "",
    noOfTowers: details?.NO_OF_TOWERS || "",
    feepaidstatus: details?.FEE_PAID_STATUS || "",
    feePaid: details?.FEE_PAID || "",
    feeAmount: details?.FEE_AMOUNT || "",
  }));
}, [selectedPlant, fetchStepDetails]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "loc") {
      setSelectedPlant(value);
      setFormData((prev) => ({
        ...prev,
        loc: value,
      }));

      if (!value || value.trim() === "") {
        setHeaderData({});
        setFormData((prev) => ({
          ...prev,
          applyDate: "",
          totalPrjArea: "",
          noOfNocs: "",
        }));
          setRecordExists(false);
        return;
      }

      try {
        const res = await getMasterByLoc(value);
        if (res && Object.keys(res).length > 0) {
          setHeaderData(res);
        } else {
          setHeaderData({});
        }
      } catch (err) {
        console.error("Error fetching master by loc:", err);
        setHeaderData({});
      }

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
const renderCompletionMessage = () => {
  return (
    <div className="d-flex align-items-center justify-content-center h-100">
      <Card className="p-4 shadow-sm text-center" style={{ maxWidth: '600px' }}>
        <Card.Body>
          <FaCheckCircle size={64} className="text-success mb-3" />
          <h3 className="text-success mb-3">Congratulations! 🎉</h3>
          <h5 className="text-muted mb-4">All process steps have been completed successfully!</h5>
          <Alert variant="success">
            <Alert.Heading>Project Completion Status</Alert.Heading>
            <p>
              All <strong>{PROVISIONAL_NOC_STEP_INDICES.length * 2}</strong> steps for <strong>{selectedPlant}</strong> have been completed successfully.
            </p>
            <p>
              Both <strong>Provisional NOC</strong> and <strong>OC Process</strong> are fully completed.
            </p>
            <hr />
            <p className="mb-0">
              Click on any completed step above to view its details.
            </p>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
};
  const renderDocumentHistory = () => {
    const details = viewedStepDetails;
    if (!details || typeof details !== "object" || Object.keys(details).length === 0) {
      return (<p className="text-muted mb-0">No previous documents for this step.</p>);
    }

    let generalDocuments = [];
    let acknowledgementReceipts = [];

    if (details.UPLOAD_DOC) {
      try {
        const parsedDocs = JSON.parse(details.UPLOAD_DOC);
        generalDocuments = parsedDocs.map((doc) => ({
          name: doc.file_name,
          url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
        }));
      } catch (error) {
        console.error("Failed to parse UPLOAD_DOC JSON:", error);
      }
    }

    if (details.ACK_DOC) {
      try {
        const parsedAcknowledgeDocs = JSON.parse(details.ACK_DOC);
        acknowledgementReceipts = parsedAcknowledgeDocs.map((doc) => ({
          name: doc.file_name,
          url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
        }));
      } catch (error) {
        console.error("Failed to parse ACK_DOC JSON:", error);
      }
    }

    const currentStepLogs = getCurrentStepLogs();

    return (
      <div className="d-flex flex-column" style={{ height: "100%", maxHeight: "330px" }}>
        <Card style={{
          padding: "10px",
          flex: "1 1 auto",
          minHeight: "0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          width: "300px"
        }}>
          <div style={{
            flex: "1 1 auto",
            overflowY: "auto",
            paddingRight: "5px" // Space for scrollbar
          }}>
            <h6 className="text-primary p-2">General Uploaded Documents</h6>


            {generalDocuments.length > 0 ? (
              <div style={{
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                padding: "5px",
                backgroundColor: "#f8f9fa"
              }}>
                <ul className="list-unstyled">
                  {generalDocuments.map((doc, idx) => (
                    <li
                      key={`gen-doc-${idx}`}
                      className="d-flex justify-content-between align-items-center mb-1 p-1"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "3px",
                        borderBottom: idx < generalDocuments.length - 1 ? "1px solid #e9ecef" : "none"
                      }}
                    >
                      <div className="text-truncate" style={{
                        maxWidth: "calc(100% - 40px)",
                        flexShrink: 1
                      }}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none text-dark"
                          style={{ fontSize: "13px" }}
                        >
                          <FaFileAlt className="me-2" style={{ minWidth: "16px" }} />
                          <span className="text-truncate" style={{
                            display: "inline-block",
                            maxWidth: "calc(100% - 30px)",
                            verticalAlign: "middle"
                          }}>
                            {doc.name}
                          </span>
                        </a>
                      </div>

                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-muted mb-0 p-2">No general documents were uploaded for this step.</p>
            )}

            { immediateNextStepIndex === 0  &&  <h6 className="text-primary mb-2">Acknowledgement Receipts</h6>} 
            {acknowledgementReceipts.length > 0 ? (
              <div style={{
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                padding: "5px",
                backgroundColor: "#f8f9fa"
              }}>
                <ul className="list-unstyled">
                  {acknowledgementReceipts.map((doc, idx) => (
                    <li
                      key={`ack-doc-${idx}`}
                      className="d-flex justify-content-between align-items-center mb-1 p-1"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "3px",
                        borderBottom: idx < acknowledgementReceipts.length - 1 ? "1px solid #e9ecef" : "none"
                      }}
                    >
                      <div className="text-truncate" style={{
                        maxWidth: "calc(100% - 40px)", // Leave space for button
                        flexShrink: 1
                      }}>
                        <a
                          href={doc?.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none text-dark"
                          style={{ fontSize: "13px" }}
                        >
                          <FaFileAlt className="me-2" style={{ minWidth: "16px" }} />
                          <span className="text-truncate" style={{
                            display: "inline-block",
                            maxWidth: "calc(100% - 30px)",
                            verticalAlign: "middle"
                          }}>
                            {doc?.name}
                          </span>
                        </a>
                      </div>

                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-muted mb-0 p-1">
                
              </p>
            )}
          </div>
        </Card>

        {/* Comments Card with View Logs Button */}
        <Card className="m-2 p-2" style={{ height: '25%', overflow: 'hidden' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Comments</h6>
            {selectedLogs.length > 0 && (
              <Button
                variant="outline-info"
                size="sm"
                onClick={() => setShowLogsModal(true)}
                className="d-flex align-items-center gap-1"
              >
                <FaHistory size={12} />
                View Logs
              </Button>
            )}
          </div>
          <div style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: selectedLogs.length > 0 ? 'pointer' : 'default'
          }}
            onClick={() => {
              if (selectedLogs.length > 0) {
                setShowLogsModal(true);
              }
            }}
            title={selectedLogs.length > 0 ? "Click to view full logs" : ""}
          >
          </div>
          {selectedLogs.length > 0 && (
            <small className="text-muted mt-1 d-block">
              {selectedLogs.length} log entries available
            </small>
          )}
        </Card>
      </div>
    );
  };

  const renderProcessColumn = (columnTitle, isOCPhase) => {
  return (
    <Col xs={6}>
      <h6 className="text-center mb-2">{columnTitle}</h6>
      <Nav variant="pills" className="flex-column">
        {steps.map((step, idx) => {
          let variant = "secondary", statusIcon = "⏸️";
          let isCompleted = false;
          let currentConceptualIndex;

          if (isOCPhase) {
            isCompleted = storeData.some(
              (item) => item.PROCESS === step.PROCESS && item.OC_UPDATED === "YES"
            );
            currentConceptualIndex = idx + OC_PROCESS_CONCEPTUAL_START_INDEX;
          } else {
            isCompleted = storeData.some(
              (item) => item.PROCESS === step.PROCESS && item.UPDATED === "YES"
            );
            currentConceptualIndex = idx;
          }

          const allStepsCompleted = !immediateNextStep;
          const isClickable = allStepsCompleted || isCompleted || (currentConceptualIndex === immediateNextStepIndex);

          if (isCompleted) {
            variant = "success";
            statusIcon = "✅";
          } else if (currentConceptualIndex === immediateNextStepIndex) {
            variant = "warning";
            statusIcon = "⚠️";
          }

          const isOCLocked = isOCPhase && !provisionalNOCCompleted;
          if (isOCLocked && !isCompleted) {
            variant = "secondary";
            statusIcon = "🔒";
          }

          return (
            <Nav.Item className="mb-2" key={`${isOCPhase ? 'oc-' : 'pnoc-'}${step.PROCESS}`}>
              <Nav.Link
                active={viewedStepConceptualIndex === currentConceptualIndex}
                disabled={isOCLocked && !isCompleted}
                onClick={() =>
                  !(isOCLocked && !isCompleted) && handleStepClick(
                    step.PROCESS, 
                    isOCPhase ? "OCPROCESS" : "ProvisionalNOC", 
                    currentConceptualIndex,
                    isCompleted // ✅ Pass the isCompleted parameter
                  )
                }
                className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                style={{ cursor: (!(isOCLocked && !isCompleted)) ? "pointer" : "not-allowed" }}
              >
                {statusIcon}
                <span>{step.PROCESS}</span>
              </Nav.Link>
            </Nav.Item>
          );
        })}
      </Nav>
    </Col>
  );
};

  const FeeAmount = storeData[0]?.FEE_AMOUNT;
  const NumberOfTowers = storeData[0]?.NO_OF_TOWERS;


  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        <Col md={4} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h5 className="text-center mb-3">Process Steps</h5>
            <Row>
              {renderProcessColumn("ProvisionalNOC", false)}
              {renderProcessColumn("OCPROCESS", true)}
            </Row>
          </div>
        </Col>

<Col md={5} className="d-flex flex-column" style={{ height: "500px", overflowY: "auto" }}>
  {allStepsCompleted && !selectedProcessDetails ? (
    renderCompletionMessage()
  ) : selectedProcessDetails ? (
    // Show selected completed step details
    <Form className="p-3 border rounded bg-light flex-fill">
      <div className="mb-3">
        <h4 className="mb-2 text-success fw-bold">
          Viewing: {viewedStepConceptualIndex !== -1 && steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length]?.PROCESS} (Completed) ✅
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
      
      {/* Form content for completed step */}
      {!immediateNextStep && immediateNextStepIndex >= (PROVISIONAL_NOC_STEP_INDICES.length * 2) && (
        <h4 className="mb-3 text-success fw-bold">All Process Steps Completed! 🎉</h4>
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
              {steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length]?.PROCESS === steps[1]?.PROCESS
                ? "Inspection Date"
                : "Apply Date"}
            </Form.Label>
            <Form.Control
              type="date"
              name="applyDate"
              value={formData.applyDate || ""}
              onChange={handleChange}
              disabled={true}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        {immediateNextStepIndex === 0 && immediateNextStep?.PROCESS === "Application Submission" && (
          <>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fee Paid?</Form.Label>
                <div className="d-flex gap-3 mt-2">
                  <Form.Check
                    type="radio"
                    label="Yes"
                    name="feepaidstatus"
                    value="YES"
                    checked={formData.feepaidstatus === "YES"}
                    disabled
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name="feepaidstatus"
                    value="NO"
                    checked={formData.feepaidstatus === "NO"}
                    disabled
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Number Of Towers</Form.Label>
                <Form.Control
                  type="text"
                  name="noOfTowers"
                  value={formData.noOfTowers || ""}
                  disabled
                />
              </Form.Group>
            </Col>
            {formData.feepaidstatus === 'YES' && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Fee Amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="feeAmount"
                    value={formData.feeAmount || ""}
                    disabled
                  />
                </Form.Group>
              </Col>
            )}
          </>
        )}
      </Row>

      {immediateNextStepIndex > 0 && immediateNextStepIndex < 5 && (
        <Form.Group className="mb-3">
          <Form.Label>
            {provisionalRadioLabels[immediateNextStepIndex] || "Status for this step"}
          </Form.Label>
          <div>
            {(() => {
              const viewedStep = steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length];
              if (!viewedStep) return null;

              const stepRecord = storeData.find(
                (item) =>
                  item.PROCESS?.trim() === viewedStep.PROCESS?.trim() &&
                  item.STEPTYPE === (viewedStepConceptualIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "OCPROCESS" : "ProvisionalNOC")
              );

              const currentStatus = stepRecord?.LEVEL_STATUS || "";
              const isStepCompleted = stepRecord?.UPDATED === "YES" || stepRecord?.OC_UPDATED === "YES";

              const isActiveStep = viewedStepConceptualIndex === immediateNextStepIndex;

              if (isStepCompleted) {
                return (
                  <div className="d-flex align-items-center gap-2">
                    <Form.Check
                      type="radio"
                      inline
                      label="Yes"
                      checked={currentStatus === "YES"}
                      disabled
                    />
                    <Form.Check
                      type="radio"
                      inline
                      label="No"
                      checked={currentStatus === "NO"}
                      disabled
                    />
                    <Badge bg="success" className="ms-2">
                      Completed
                    </Badge>
                  </div>
                );
              }

              if (isActiveStep) {
                return (
                  <div>
                    <Form.Check
                      type="radio"
                      inline
                      label="Yes"
                      name={`stepStatus_${viewedStepConceptualIndex}`}
                      id={`stepYes_${viewedStepConceptualIndex}`}
                      value="YES"
                      checked={currentStatus === "YES"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [`stepStatus_${viewedStepConceptualIndex}`]: e.target.value,
                        }))
                      }
                    />
                    <Form.Check
                      type="radio"
                      inline
                      label="No"
                      name={`stepStatus_${viewedStepConceptualIndex}`}
                      id={`stepNo_${viewedStepConceptualIndex}`}
                      value="NO"
                      checked={currentStatus === "NO"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [`stepStatus_${viewedStepConceptualIndex}`]: e.target.value,
                        }))
                      }
                    />
                  </div>
                );
              }

              return (
                <div className="d-flex align-items-center gap-2">
                  <Form.Check
                    type="radio"
                    inline
                    label="Yes"
                    checked={currentStatus === "YES"}
                    disabled
                  />
                  <Form.Check
                    type="radio"
                    inline
                    label="No"
                    checked={currentStatus === "NO"}
                    disabled
                  />
                  <span className="text-muted small">(View only)</span>
                </div>
              );
            })()}
          </div>
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Comments</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="comments"
          value={formData.comments || ""}
          onChange={handleChange}
          disabled={true}
        />
      </Form.Group>

      {immediateNextStep && viewedStepConceptualIndex === immediateNextStepIndex && !allStepsCompleted && (
        <div className="d-grid mt-3">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="update-tooltip">
                {!selectedPlant ? "Please select a Plant." :
                  (!immediateNextStep ? "All steps are completed." :
                    (viewedStepConceptualIndex !== immediateNextStepIndex ? "You can only update the active step." :
                      "Click here to update the current active step."))
                }
              </Tooltip>
            }
          >
            <span className="d-grid">
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleEmailSubmit} 
                disabled={
                  !formData.loc || 
                  isSubmitting || 
                  !immediateNextStep || 
                  viewedStepConceptualIndex !== immediateNextStepIndex ||
                  (() => {
                    const viewedStep = steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length];
                    if (!viewedStep) return true;
                    
                    const stepRecord = storeData.find(
                      (item) =>
                        item.PROCESS?.trim() === viewedStep.PROCESS?.trim() &&
                        item.STEPTYPE === (viewedStepConceptualIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "OCPROCESS" : "ProvisionalNOC")
                    );
                    
                    return stepRecord?.UPDATED === "YES" || stepRecord?.OC_UPDATED === "YES";
                  })()
                }
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </span>
          </OverlayTrigger>
        </div>
      )}
    </Form>
  ) : (
    // Show active step form (when not all steps are completed)
    <Form className="p-3 border rounded bg-light flex-fill">
      {viewedStepConceptualIndex !== -1 && steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length] ? (
        <h4 className="mb-3 text-primary fw-bold">
          Viewing: {steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length].PROCESS}
          {immediateNextStep && (
            <>
              {immediateNextStepIndex >= 1 && immediateNextStepIndex <= 4 && NumberOfTowers && (
                <> | Towers: <span className="text-dark">{NumberOfTowers}</span></>
              )}
              {immediateNextStepIndex >= 1 && immediateNextStepIndex <= 4 && FeeAmount && (
                <> | FeeAmount: <span className="text-dark">{FeeAmount}</span></>
              )}
            </>
          )}
        </h4>
      ) : (
        <h4 className="mb-3 text-muted">Select a Plant to begin</h4>
      )}
      
      {!immediateNextStep && immediateNextStepIndex >= (PROVISIONAL_NOC_STEP_INDICES.length * 2) && (
        <h4 className="mb-3 text-success fw-bold">All Process Steps Completed! 🎉</h4>
      )}

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
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              {steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length]?.PROCESS === steps[1]?.PROCESS
                ? "Inspection Date"
                : "Apply Date"}
            </Form.Label>
            <Form.Control
              type="date"
              name="applyDate"
              value={formData.applyDate || ""}
              onChange={handleChange}
              // disabled={true}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        {immediateNextStepIndex === 0 && immediateNextStep?.PROCESS === "Application Submission" && (
          <>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Fee Paid?</Form.Label>
                <div className="d-flex gap-3 mt-2">
                  <Form.Check
                    type="radio"
                    label="Yes"
                    name="feepaidstatus"
                    value="YES"
                    checked={formData.feepaidstatus === "YES"}
                    disabled
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name="feepaidstatus"
                    value="NO"
                    checked={formData.feepaidstatus === "NO"}
                    disabled
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Number Of Towers</Form.Label>
                <Form.Control
                  type="text"
                  name="noOfTowers"
                  value={formData.noOfTowers || ""}
                  disabled
                />
              </Form.Group>
            </Col>
            {formData.feepaidstatus === 'YES' && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Fee Amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="feeAmount"
                    value={formData.feeAmount || ""}
                    disabled
                  />
                </Form.Group>
              </Col>
            )}
          </>
        )}
      </Row>

      {immediateNextStepIndex > 0 && immediateNextStepIndex < 5 && (
        <Form.Group className="mb-3">
          <Form.Label>
            {provisionalRadioLabels[immediateNextStepIndex] || "Status for this step"}
          </Form.Label>
          <div>
            {(() => {
              const viewedStep = steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length];
              if (!viewedStep) return null;

              const stepRecord = storeData.find(
                (item) =>
                  item.PROCESS?.trim() === viewedStep.PROCESS?.trim() &&
                  item.STEPTYPE === (viewedStepConceptualIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "OCPROCESS" : "ProvisionalNOC")
              );

              const currentStatus = stepRecord?.LEVEL_STATUS || "";
              const isStepCompleted = stepRecord?.UPDATED === "YES" || stepRecord?.OC_UPDATED === "YES";

              const isActiveStep = viewedStepConceptualIndex === immediateNextStepIndex;

              if (isStepCompleted) {
                return (
                  <div className="d-flex align-items-center gap-2">
                    <Form.Check
                      type="radio"
                      inline
                      label="Yes"
                      checked={currentStatus === "YES"}
                      disabled
                    />
                    <Form.Check
                      type="radio"
                      inline
                      label="No"
                      checked={currentStatus === "NO"}
                      disabled
                    />
                    <Badge bg="success" className="ms-2">
                      Completed
                    </Badge>
                  </div>
                );
              }

              if (isActiveStep) {
                return (
                  <div>
                    <Form.Check
                      type="radio"
                      inline
                      label="Yes"
                      name={`stepStatus_${viewedStepConceptualIndex}`}
                      id={`stepYes_${viewedStepConceptualIndex}`}
                      value="YES"
                      checked={currentStatus === "YES"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [`stepStatus_${viewedStepConceptualIndex}`]: e.target.value,
                        }))
                      }
                    />
                    <Form.Check
                      type="radio"
                      inline
                      label="No"
                      name={`stepStatus_${viewedStepConceptualIndex}`}
                      id={`stepNo_${viewedStepConceptualIndex}`}
                      value="NO"
                      checked={currentStatus === "NO"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [`stepStatus_${viewedStepConceptualIndex}`]: e.target.value,
                        }))
                      }
                    />
                  </div>
                );
              }

              return (
                <div className="d-flex align-items-center gap-2">
                  <Form.Check
                    type="radio"
                    inline
                    label="Yes"
                    checked={currentStatus === "YES"}
                    disabled
                  />
                  <Form.Check
                    type="radio"
                    inline
                    label="No"
                    checked={currentStatus === "NO"}
                    disabled
                  />
                  <span className="text-muted small">(View only)</span>
                </div>
              );
            })()}
          </div>
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Comment</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="comments"
          value={formData.comments || ""}
          onChange={handleChange}
          disabled={true}
        />
      </Form.Group>

      <div className="d-grid mt-3">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="update-tooltip">
              {!selectedPlant ? "Please select a Plant." :
                (!immediateNextStep ? "All steps are completed." :
                  (viewedStepConceptualIndex !== immediateNextStepIndex ? "You can only update the active step." :
                    "Click here to update the current active step."))
              }
            </Tooltip>
          }
        >
          <span className="d-grid">
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleEmailSubmit} 
              disabled={
                !formData.loc ||
                !recordExists || 
                isSubmitting || 
                !immediateNextStep || 
                viewedStepConceptualIndex !== immediateNextStepIndex || 
                (() => {
                  const viewedStep = steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length];
                  if (!viewedStep) return true;
                  
                  const stepRecord = storeData.find(
                    (item) =>
                      item.PROCESS?.trim() === viewedStep.PROCESS?.trim() &&
                      item.STEPTYPE === (viewedStepConceptualIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "OCPROCESS" : "ProvisionalNOC")
                  );
                  
                  return stepRecord?.UPDATED === "YES" || stepRecord?.OC_UPDATED === "YES";
                })()
              }
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </span>
        </OverlayTrigger>
      </div>
    </Form>
  )}
</Col>

        <Col md={3} className="d-flex w-25">
          <div className="border rounded p-3 bg-white flex-fill d-flex flex-column w-50">
            <h5 className="mb-3 text-dark">
              Document History
            </h5>
            <div className="flex-grow-1 overflow-auto">
              {renderDocumentHistory()}
            </div>
          </div>
        </Col>
      </Row>

      {/* Logs Modal */}
      <Modal show={showLogsModal} onHide={() => setShowLogsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaHistory className="me-2" />
            Activity Logs - {viewedStepConceptualIndex !== -1 ? steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length]?.PROCESS : "Step"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {selectedLogs.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-muted">No activity logs available for this step.</p>
            </div>
          ) : (
            <div className="timeline">
              {selectedLogs && selectedLogs.length > 0 ? (
                selectedLogs.map((logItem, i) => {

                  return (
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <strong>{logItem.date}</strong>
                      <span>{logItem.comment}</span>
                    </div>
                  );




                })
              ) : (
                <p>No logs available</p>
              )}
            </div>
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
        plantName={formData?.loc}
        applyDate={formData?.applyDate}
        comments={formData?.comments}
      />
    </>
  );
};

export default FireUpdateTable;


