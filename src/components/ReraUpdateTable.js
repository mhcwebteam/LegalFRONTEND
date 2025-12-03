import React, { useEffect, useState, useMemo, useContext } from "react";
import { Nav, Form, Button, Row, Col, Badge, OverlayTrigger, Tooltip, Card, Alert } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import { FaCheckCircle, FaFileAlt } from "react-icons/fa";
import EmailSelectionModal from "./EmailSelectionModal";
import { Context } from "../context/ContextData";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { getMasterByLoc } from "../api/Api";

const SUB_LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4"];

const ReraUpdateTable = () => {

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

  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);

  // ✅ NEW: 'viewedStep' tracks which step the user is currently looking at (could be an old one).
  const [viewedStep, setViewedStep] = useState(null);
  // ✅ NEW: 'viewedStepDetails' holds the data for the step being looked at.
  const [viewedStepDetails, setViewedStepDetails] = useState(null);

  const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });

  console.log("storeDatastoreDatastoreDatastoreDatastoreData", storeData);

  const areAllStepsCompleted = () => {
    if (!steps.length || !storeData.length) return false;

    const completedSteps = storeData
      .filter((item) => item.UPDATED === "YES")
      .map((item) => item.PROCESS);

    console.log('commmmmmmmmmmmm', completedSteps);

    return steps.every((step) => completedSteps.includes(step.PROCESS));
  };

  const renderCompletionMessage = () => {
    return (
      <Alert variant="success" className="mb-3">
        <div className="d-flex align-items-center">
          <FaCheckCircle size={24} className="text-success me-3" />
          <div>
            <Alert.Heading className="mb-1">Congratulations! 🎉</Alert.Heading>
            <p className="mb-0">
              All <strong>{steps.length}</strong> steps for <strong>{selectedPlant}</strong> have been completed successfully!
            </p>
          </div>
        </div>
      </Alert>
    );
  };

  const handleEmailSubmit = () => {
    console.log("Submit clicked - opening email modal");
    console.log("selectedPlant:", selectedPlant);
    console.log("immediateNextStep:", immediateNextStep);
    console.log("viewedStepDetails:", viewedStepDetails);

    if (!selectedPlant || !immediateNextStep) {
      Swal.fire("Validation Error", "Please select a plant and ensure a step is active.", "error");
      return;
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
          const completedProcesses = fetchedData.filter((item) => item.UPDATED === "YES").map((item) => item.PROCESS);
          const nextStep = steps.find((step) => !completedProcesses.includes(step.PROCESS));

          if (nextStep) {
            setImmediateNextStep(nextStep); // Set the true active step
            setImmediateNextStepIndex(steps.indexOf(nextStep));
            handleStepClick(nextStep, selectedPlant); // ✅ Automatically click/load details for the active step
          } else {
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

  // ✅ NEW: This function is now the single point for fetching and displaying step details.
  const handleStepClick = async (step, plant) => {
    if (!plant) return;
    setViewedStep(step); // Set which step we are now viewing
    try {
      const apiUrl = `${API_BASE_URL}/rera-step-details/${encodeURIComponent(plant)}/${encodeURIComponent(step.PROCESS)}`;
      const detailsRes = await axios.get(apiUrl);
      if (detailsRes && detailsRes.data) {
        setViewedStepDetails(detailsRes.data);
      } else {
        setViewedStepDetails(null); // Clear details if none found
      }
    } catch (error) {
      console.error(`Error fetching details for step: ${step.PROCESS}`, error);
      setViewedStepDetails(null); // Clear details on error
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "loc") {
      setSelectedPlant(value);
      console.log(name, "name", value);

      try {
        const res = await getMasterByLoc(value);
        if (res) {
          setHeaderData(res);
        }
      } catch (err) {
        console.error("Error fetching master by loc:", err);
        setHeaderData(null);
      }
    }
  };

  // This logic now correctly calculates sub-level status based on the VIEWED step's details
  const activeSubLevelIndex = useMemo(() => {
    if (viewedStep?.PROCESS !== "Status of the Application") return -1; // Only calculate for step 2
    const currentLevel = viewedStepDetails?.LEVEL;
    const currentStatus = viewedStepDetails?.LEVEL_STATUS;

    if (currentLevel === "Level 4" && currentStatus === "Completed") { return SUB_LEVELS.length; }
    if (!currentLevel) { return 0; }
    let currentIndex = SUB_LEVELS.indexOf(currentLevel);
    if (currentIndex === -1) currentIndex = 0;
    if (currentStatus === "Yes") { return currentIndex + 1; }
    return currentIndex;
  }, [viewedStep, viewedStepDetails]);

  console.log('select plant:', selectedPlant, "apply date:", viewedStepDetails?.APPLY_DT, "comments:", viewedStepDetails?.COMMENTS);

  const handleConfirmSubmit = async (emails) => {
    const isStep2Incomplete = immediateNextStepIndex === 1 && activeSubLevelIndex < SUB_LEVELS.length;
    
    if (!selectedPlant || !immediateNextStep) {
      Swal.fire("Error", "No active step is available to update.", "error");
      return;
    }

    const payload = new FormData();
    payload.append("loc", selectedPlant);
    payload.append("applyDate", viewedStepDetails?.APPLY_DT || "");
    payload.append("process", immediateNextStep.PROCESS);

    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    const apiUrl = `${API_BASE_URL}/rera-update`;

    try {
      await axios.post(apiUrl, payload);

      // Refresh the data after update
      const res = await axios.get(`${API_BASE_URL}/rera-data?plant=${selectedPlant}`);
      const fetchedData = res.data;
      setStoreData(fetchedData);

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
  };

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
        <h6 className="text-primary">Uploaded Documents</h6>
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

  // ✅ NEW: These conditions determine the button's state and tooltip text.
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
                let variant = "secondary", statusIcon = "⏸️";
                if (idx < immediateNextStepIndex) { variant = "success"; statusIcon = "✅"; }
                else if (idx === immediateNextStepIndex) { variant = "warning"; statusIcon = "⚠️"; }

                const isClickable = idx <= immediateNextStepIndex;

                return (
                  <React.Fragment key={idx}>
                    <Nav.Item className="mb-2">
                      <Nav.Link
                        active={viewedStep?.PROCESS === step.PROCESS}
                        onClick={() => handleStepClick(step, selectedPlant)}
                        className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                        style={{ cursor: "pointer" }}
                      >
                        {statusIcon}<span>{step.PROCESS}</span>
                      </Nav.Link>
                    </Nav.Item>

                    {/* This logic correctly shows sub-levels only when VIEWING the second step */}
                    {idx === 1 && viewedStep?.PROCESS === step.PROCESS && (
                      <div className="ps-4 mb-2 d-flex flex-wrap gap-1">
                        {SUB_LEVELS.map((level, subIdx) => {
                          let badgeVariant = "secondary";
                          if (subIdx < activeSubLevelIndex) { badgeVariant = "success"; }
                          else if (subIdx === activeSubLevelIndex) { badgeVariant = "warning"; }
                          return (<Badge bg={badgeVariant} key={subIdx} className="shadow-sm">{level}</Badge>);
                        })}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </Nav>
          </div>
        </Col>

        <Col md={6} className="d-flex flex-column">
          {/* Show completion message at the top if all steps are completed */}
          {areAllStepsCompleted() && renderCompletionMessage()}
          
          {/* Always show the form with process data */}
          <Form className="p-3 border rounded bg-light">
            {viewedStep ? (
              <h4 className="mb-3 text-primary fw-bold">{viewedStep.PROCESS}</h4>
            ) : (
              <h4 className="mb-3 text-muted">Select a Plant to begin</h4>
            )}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Plant</Form.Label>
                  <Form.Select name="loc" value={selectedPlant} onChange={handleChange}>
                    <option value="">Select Plant to View</option>
                    {plants.map((p, idx) => (<option key={idx} value={p.loc}>{p.loc}</option>))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {/* The date fields now populate from viewedStepDetails */}
              {viewedStep?.PROCESS === 'Your Step 3 Name Here' ? ( // Replace with your actual step 3 name
                <>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>From Date</Form.Label>
                      <Form.Control type="date" value={viewedStepDetails?.FROM_DT || ""} disabled />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>To Date</Form.Label>
                      <Form.Control type="date" value={viewedStepDetails?.TO_DT || ""} disabled />
                    </Form.Group>
                  </Col>
                </>
              ) : (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Application Date</Form.Label>
                    <Form.Control type="date" value={viewedStepDetails?.APPLY_DT || ""} disabled />
                  </Form.Group>
                </Col>
              )}
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Comments</Form.Label>
                  <Form.Control as="textarea" rows={2} value={viewedStepDetails?.COMMENTS || ""} disabled />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Only show update button if there are steps to update */}
            {!areAllStepsCompleted() && (
              <div className="d-grid mt-3">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="update-tooltip">
                      {!canUpdate ? "You can only update the current active step." :
                        isStep2Incomplete ? "Please complete all 4 sub-levels to enable this button." :
                          "Click here to update this step as complete."}
                    </Tooltip>
                  }
                >
                  <span className="d-grid">
                    <Button
                      variant="success"
                      size="md"
                      onClick={handleEmailSubmit}
                    >
                      Update Status to Complete
                    </Button>
                  </span>
                </OverlayTrigger>
              </div>
            )}
          </Form>
        </Col>
        
        <Col md={3}>
          <Card
            className="border rounded bg-white p-3 d-flex flex-column"
            style={{
              height: "100%",
              minHeight: "400px",
            }}
          >
            {/* 📂 Document History (70%) */}
            <div
              style={{
                flexBasis: "70%",
                overflowY: "auto",
                overflowX: "hidden",
                borderBottom: "1px solid #ddd",
                paddingBottom: "8px",
                marginBottom: "8px",
              }}
            >
              <h5 className="mb-3 text-dark">Document History</h5>
              {renderDocumentHistory()}
            </div>

            {/* 💬 Comments (30%) */}
            <div
              style={{
                flexBasis: "30%",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <h6 className="mb-2">Comments</h6>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {viewedStepDetails?.COMMENTS || "No comments available"}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

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