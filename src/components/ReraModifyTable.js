import React, { useEffect, useState, useMemo, useContext } from "react";
import { Nav, Form, Button, Row, Col, Badge, Modal, Card, Alert, ListGroup } from "react-bootstrap"; // 08-12-2025: Added ListGroup
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import ReraDocUploadModal from "./ReraDocUploadModal";
import { FaCheckCircle, FaFileAlt } from "react-icons/fa";

import { Context } from "../context/ContextData";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { getMasterByLoc } from "../api/Api";
import EmailSelectionModal from "./EmailModal";

// Define the sub-levels as a constant
const SUB_LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];

const ReraModifyTable = () => {
  // All state and logic remains exactly the same.
  const [steps, setSteps] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  // const [storeData, setStoreData] = useState([]);
  const [formData, setFormData] = useState({ loc: "", applyDate: "", comments: "", prjName: "", address: "",fromDate:"", toDate:""  });
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
  
  // 08-12-2025: Added state for logs modal
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);

  console.log("selected LLLLLLLLLLLL",selectedLogs);

     const {
       storeData,
       setStoreData,
       totalMasterData,
       setHeaderData,
       headerData,
       setRespModifyData,
     } = useContext(Context);

     
     
         useEffect(() => {
           if (steps.length > 0 && storeData.length > 0) {
             const completedProcesses = storeData
               .filter((item) => item.UPDATED === "YES")
               .map((item) => item.PROCESS?.trim());
       
             const allCompleted = steps.every(step => 
               completedProcesses.includes(step.PROCESS?.trim())
             );

             console.log("aaaaaaaaaaaaaaaaa",storeData)
       
             setAllStepsCompleted(allCompleted);
           } else {
             setAllStepsCompleted(false);
           }
         }, [steps, storeData]);
     
         
           const renderCompletionMessage = () => {
             return (
               <div className="text-center py-5">
                 <FaCheckCircle size={64} className="text-success mb-3" />
                 <h3 className="text-success mb-3">Congratulations! 🎉</h3>
                 <h5 className="text-muted mb-4">All process steps have been completed successfully!</h5>
                 <Alert variant="success" className="mx-auto" style={{ maxWidth: '500px' }}>
                   <Alert.Heading>Project Completion Status</Alert.Heading>
                   <p>
                     All {steps.length} steps for <strong>{selectedPlant}</strong> have been completed. 
                     You can review the completed project details.
                   </p>
                   <hr />
                   <p className="mb-0">
                     The project is now ready for the next phase or final approval.
                   </p>
                 </Alert>
               </div>
             );
           };

        const handleEmailSubmit = () => {
    const newErrors = {};
    if (!formData.loc) newErrors.loc = "Plant selection is required";
    if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

    // if (Object.keys(newErrors).length > 0) {
    //   setErrors(newErrors);
    //   return;
    // }

    // setErrors({});
    setShowEmailModal(true);
  };

  
  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);

    // Proceed with form submission
    await handleConfirmSubmit(emails);
  };

  // All useEffect hooks for data fetching are correct and unchanged.
  useEffect(() => {
    axios.get(`${API_BASE_URL}/rera-process`).then((res) => setSteps(res.data)).catch((err) => console.error("Error fetching RERA processes:", err));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/rera-plants`).then((res) => setPlants(res.data)).catch((err) => console.error("Error fetching RERA plants:", err));
  }, []);
  
    useEffect(() => {
    setStoreData([]);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setNextStepDetails(null);
    setProjectInfo({ prjName: "", address: "" });
    setFormData({ loc: selectedPlant, applyDate: "", comments: "", prjName: "", address: "", fromDate: "", toDate: "" });

    if (selectedPlant && steps.length > 0) {
      axios.get(`${API_BASE_URL}/rera-data?plant=${selectedPlant}`)
        .then(res => {
          const fetchedData = res.data;

        
          setStoreData(fetchedData);
          if (fetchedData && fetchedData.length > 0) {
            const firstRecord = fetchedData[0];
            const info = { prjName: firstRecord.PROJECT_NAME || "", address: firstRecord.ADDRESS || "" };
            setProjectInfo(info);
            setFormData(prev => ({   loc: selectedPlant, ...prev, ...info }));
          
          }
          const completedProcesses = fetchedData.filter((item) => item.UPDATED === "YES").map((item) => item.PROCESS);
          const nextStep = steps.find(step => !completedProcesses.includes(step.PROCESS));
 
          // --- START: CORRECTED LOGIC ---
          if (nextStep) {
            // This part is for when there IS a next step
            setImmediateNextStep(nextStep);
            setImmediateNextStepIndex(steps.indexOf(nextStep));
            const apiUrl = `${API_BASE_URL}/rera-step-details/${encodeURIComponent(selectedPlant)}/${encodeURIComponent(nextStep.PROCESS)}`;
            return axios.get(apiUrl);
          } else {
            // ✅ NEW LOGIC: This runs when `nextStep` is undefined, meaning all steps are complete.
            // We check if there are any completed processes to ensure we don't do this on an empty project.
            if (completedProcesses.length === steps.length && steps.length > 0) {
              // Set the index to a number higher than any possible step index.
              // This will cause the rendering logic `(idx < immediateNextStepIndex)` to be true for all steps.
              setImmediateNextStepIndex(steps.length);
            }
            return Promise.resolve(null);
          }
          // --- END: CORRECTED LOGIC ---
        })
        .then(detailsRes => {
          if (detailsRes && detailsRes.data) {
            setNextStepDetails(detailsRes.data);
          }
        })
        .catch(err => console.error("Error during data fetching process:", err));
    }
  }, [selectedPlant, steps]);
  
  
  useEffect(() => {
    if (nextStepDetails && typeof nextStepDetails === 'object' && Object.keys(nextStepDetails).length > 0) {
      const details = nextStepDetails;

      setFormData((prev) => ({ ...prev, 
        applyDate: details.APPLY_DT, 
        fromDate: details.FRM_DT || "", // Added this line
        toDate: details.TO_DT || "",     // Added this line,
        comments: details.COMMENTS || "" }));
    } else {
      setFormData((prev) => ({ ...prev, applyDate: "", fromDate: "", toDate: "", comments: "" }));
    }
  }, [nextStepDetails]);

  // The activeSubLevelIndex logic is correct and unchanged.
  const activeSubLevelIndex = useMemo(() => {
    const currentLevel = nextStepDetails?.LEVEL;
    const currentStatus = nextStepDetails?.LEVEL_STATUS;
    if (currentLevel === 'Level 4' && currentStatus === 'Completed') {
      return SUB_LEVELS.length;
    }
    if (!currentLevel) {
      return 0;
    }
    let currentIndex = SUB_LEVELS.indexOf(currentLevel);
    if (currentIndex === -1) {
      currentIndex = 0;
    }
    if (currentStatus === "Yes") {
      return currentIndex + 1;
    }
    return currentIndex;
  }, [nextStepDetails]);

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
    if (name === 'loc') {
      setSelectedPlant(value);

       try {
           const res = await getMasterByLoc(value);
           if (res) {
             setHeaderData(res);
            //  setFormData((prev) => ({
            //    ...prev,
            //    applyDate: res.APPLICATION_DATE || '',
            //    noOfTowers: res.NUMBER_OF_TOWERS || '',
            //    TotalProjectArea: res.TOTAL_PROJECT_AREA || '',
            //    ProjectBuildArea: res.PROJECT_BUILD_AREA || '',
            //    ProjectName: res.PROJECT_NAME || '',
            //  }));
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

    if (name === 'subLevelStatus' && value === 'No') {
      if (activeSubLevelIndex === 1) {
        Swal.fire({
          title: 'Confirm Demotion',
          text: "This will reset the task to Level 1. Are you sure?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, reset to Level 1',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            setLevelToSubmit('Level 1');
            setFormData(prev => ({ ...prev, subLevelStatus: 'No' }));
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: 'Task will be reset to Level 1 on submit.',
                showConfirmButton: false,
                timer: 3000
            });
          }
        });
        return;
      }
      const isLevel3Or4 = activeSubLevelIndex === 2 || activeSubLevelIndex === 3;
      if (isLevel3Or4) {
        const options = SUB_LEVELS.slice(0, activeSubLevelIndex).reverse();
        setDemoteOptions(options);
        setShowDemoteModal(true);
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDemoteConfirm = (newLevel) => {
    if (newLevel) {
        setLevelToSubmit(newLevel);
        setFormData(prev => ({ ...prev, subLevelStatus: 'No' }));
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
  };

  const handleConfirmSubmit = async (emails) => {
    // --- VALIDATION (No changes needed here, it's correct for the UI) ---
    if (immediateNextStepIndex === 2 && (!formData.fromDate || !formData.toDate)) {
      Swal.fire("Validation Error", "Please provide both a 'From Date' and a 'To Date' for this step.", "error");
      return;
    }
    if (immediateNextStepIndex !== 2 && !formData.applyDate) {
      Swal.fire("Validation Error", "Please provide an 'Apply Date' for this step.", "error");
      return;
    }
    if (!formData.loc || !immediateNextStep) {
      Swal.fire("Validation Error", "Please select a Plant and ensure a process step is active.", "error");
      return;
    }
    
    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("comments", formData.comments || "");

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
    
    // ✅ START: CORRECTED PAYLOAD LOGIC
    
    // Determine which date to use as the primary 'applyDate'.
    // For step 3, use fromDate. For all other steps, use applyDate.
    const applyDateToSend = immediateNextStepIndex === 2 ? formData.fromDate : formData.applyDate;
    payload.append("applyDate", applyDateToSend);

    // ADDITIONALLY, if it is the third step, also send the specific date range.
    if (immediateNextStepIndex === 2) {
      payload.append("fromDate", formData.fromDate);
      payload.append("toDate", formData.toDate);
    }
    
    // ✅ END: CORRECTED PAYLOAD LOGIC

    if (immediateNextStepIndex === 1) {
      const taskStatus = formData.subLevelStatus || "No";
      payload.append("pending_task", levelToSubmit);
      payload.append("task_status", taskStatus);
    }
    
    newDocs.forEach((file) => payload.append("UPLOAD_DOC[]", file));
    
    console.log("--- Submitting Payload ---");
    for (const [key, value] of payload.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("--------------------------");
    
    const existingRecord = storeData.find((item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim());
    const apiUrl = existingRecord ? `${API_BASE_URL}/rera-modify` : `${API_BASE_URL}/rera-submit`;
    
    try {
      await axios.post(apiUrl, payload);
      await Swal.fire({ icon: 'success', title: existingRecord ? "Updated!" : "Submitted!", text: "Your data has been saved successfully.", timer: 1500, showConfirmButton: false });
      
      // Reset state after submission
      setFormData({ loc: "", applyDate: "", fromDate: "", toDate: "", comments: "", prjName: "", address: "" });
      setNewDocs([]);
      setSelectedPlant("");
      setStoreData([]);
      setImmediateNextStep(null);
      setImmediateNextStepIndex(-1);
      setNextStepDetails(null);
      setProjectInfo({ prjName: "", address: "" });
    } catch (error) {
      console.error("Submission failed:", error);
      Swal.fire("Submission Failed", "Please check the console for details.", "error");
    }
  };
  
  // 08-12-2025: Updated renderDocumentHistory to use ListGroup like GHMC component
  const renderDocumentHistory = () => {
    if (
      !nextStepDetails ||
      typeof nextStepDetails !== "object" ||
      !nextStepDetails.UPLOAD_DOC
    ) {
      return <p className="text-muted text-center mb-0">No previous documents for this step.</p>;
    }

    let documents = [];
    try {
      const parsedDocs = JSON.parse(nextStepDetails.UPLOAD_DOC);
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
        {documents.map((doc, idx) => (
          <ListGroup.Item 
            key={idx} 
            className="d-flex align-items-center"
          >
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="text-decoration-none"
            >
              <FaFileAlt className="me-2 text-secondary" />
              {doc.name}
            </a>
          </ListGroup.Item>
        ))}
      </ListGroup>
    ) : (
      <p className="text-muted text-center mb-0">No documents uploaded for this step.</p>
    );
  };

  return (
    <>
        <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h6 className="text-center mb-3">Process Steps</h6>
            <Nav variant="pills" className="flex-column">
              {steps.map((step, idx) => {
                let variant = "secondary", clickable = false, statusIcon = "⏸️";

                        const isCompleted = storeData.some(
                  (item) => item.PROCESS?.toLowerCase().trim() === step.PROCESS?.toLowerCase().trim() &&
                    item.UPDATED === "YES"
                );
                if (isCompleted) {
                  console.log("iosssssssssssssssss",isCompleted)
                  variant = "success"; clickable = true; statusIcon = "✅";
                } else if (idx === immediateNextStepIndex) {
                  variant = "warning"; clickable = true; statusIcon = "⚠️";
                }

                return (
                  <React.Fragment key={idx}>
                    <Nav.Item className="mb-2">
                      <Nav.Link eventKey={idx} disabled={!clickable} className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`} style={{ cursor: clickable ? "pointer" : "not-allowed" }}>
                        {statusIcon}<span>{step.PROCESS}</span>
                      </Nav.Link>
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
        
        {/* The rest of the JSX is correct and unchanged */}
        <Col md={6} className="d-flex flex-column">
        {allStepsCompleted  ? (
            renderCompletionMessage()
          ) : (
          <Form className="p-3 border rounded bg-light">

            {immediateNextStep && <h4 className="mb-3 text-primary fw-bold">{immediateNextStep.PROCESS}</h4>}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Plant</Form.Label>
                  <Form.Select name="loc" value={formData.loc} onChange={handleChange}>
                    <option value="">Select Plant</option>
                    {plants.map((p, idx) => <option key={idx} value={p.loc}>{p.loc}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
               {/* ✅ 2. CORRECTED CONDITIONAL DATE FIELDS */}
              {immediateNextStepIndex === 2 ? (
                // Show "From" and "To" date for the THIRD step (index 2)
                <>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>From Date</Form.Label>
                      {/* Use the new `fromDate` state */}
                      <Form.Control type="date" name="fromDate" value={formData.fromDate || ""} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>To Date</Form.Label>
                      {/* Use the new `toDate` state */}
                      <Form.Control type="date" name="toDate" value={formData.toDate || ""} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </>
              ) : (
                // Show a single "Apply Date" for ALL OTHER steps
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Apply Date</Form.Label>
                    <Form.Control type="date" name="applyDate" value={formData.applyDate || ""} onChange={handleChange} />
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
                      value={SUB_LEVELS[activeSubLevelIndex] || 'All Levels Complete'}
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
                        checked={formData.subLevelStatus === 'Yes'}
                        onChange={handleChange}
                        id="status-yes"
                      />
                      <Form.Check
                        type="radio"
                        label="No"
                        name="subLevelStatus"
                        value="No"
                        checked={formData.subLevelStatus === 'No'}
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
                    <Form.Control type="text" name="prjName" value={formData.prjName || ""} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Address</Form.Label>
                    <Form.Control type="text" name="address" value={formData.address || ""} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
            )}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Upload New Documents</Form.Label>
                <Button variant="outline-secondary" className="form-control" onClick={() => setShowUploadModal(true)}>Upload Docs</Button>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Comments</Form.Label>
                  <Form.Control as="textarea" rows={1} name="comments" value={formData.comments || ""} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-grid mt-3">
              <Button variant="primary" size="lg" onClick={handleEmailSubmit}>Submit</Button>
            </div>
          </Form>
          )}
        </Col>
        
        {/* 08-12-2025t */}
        <Col md={3}>
          <div className="d-flex flex-column" style={{ height: '100%' }}>
            <Card className="p-3 mb-2" style={{ height: '80%', overflow: 'auto' }}>
              <h6 className="text-center mb-3">Previously Uploaded Documents</h6>
              {renderDocumentHistory()}
            </Card>

            {/* 08-12-2025: Added View Logs button at bottom */}
            <div className="p-2 border-top bg-light text-center">
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
        </Col>

      </Row>

        <Modal show={showDemoteModal} onHide={() => setShowDemoteModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Reset Task Level</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Since the task was not completed, please select the correct current level to reset to.</p>
                <Form.Group>
                    <Form.Label className="fw-bold">Choose the correct level:</Form.Label>
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
                <Button variant="secondary" onClick={() => setShowDemoteModal(false)}>
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
      <Modal show={showLogsModal} onHide={() => setShowLogsModal(false)} centered>
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
