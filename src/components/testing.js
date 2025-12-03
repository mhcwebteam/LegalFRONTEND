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
} from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import ReraDocUploadModal from "./ReraDocUploadModal";
import { FaFileAlt } from "react-icons/fa";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { Context } from "../context/ContextData";
import { getMasterByLoc } from "../api/Api";
import EmailSelectionModal from "./EmailModal";

const FireModifyTable = () => {
  const {
    storeData,
    setStoreData,
    respModifyData,
    setRespModifyData,
    setHeaderData,
    headerData,
  } = useContext(Context);

  const [steps, setSteps] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [formData, setFormData] = useState({
    loc: "",
    applyDate: "",
    document: null,
    comments: "",
    prjName: "",
    address: "",
    feePaid: "",
    feeAmount: "",
    acknowledgeName: "",
  });

  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [nextStepDetails, setNextStepDetails] = useState(null);
  const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });
  const [newDocs, setNewDocs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [acknowledgeDocs, setAcknowledgeDocs] = useState([]);
  const [errors, setErrors] = useState({});
  const [provisionalNOCCompleted, setProvisionalNOCCompleted] = useState(false);
  
  // Add these states for logs modal
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);

  const PROVISIONAL_NOC_STEP_INDICES = useMemo(() => [0, 1, 2, 3, 4], []);
  const OC_PROCESS_STEP_RANGE = useMemo(() => [5, 6, 7, 8, 9, 10], []);

  const provisionalRadioLabels = {
    1: "Site Inspection Status",
    2: "Queries Received?",
    3: "Committee Approved?",
    4: "Provisional Status?",
  };

  const ocRadioLabels = {
    6: "Site Inspection Status?",
    7: "Queries Received?",
    8: "Committee Approved?",
    9: "OC Status?",
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/fire-process`)
      .then((res) => setSteps(res.data))
      .catch((err) => console.error("Error fetching FIRE processes:", err));
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/fire-plants`)
      .then((res) => setPlants(res.data))
      .catch((err) => console.error("Error fetching FIRE plants:", err));
  }, []);

  useEffect(() => {
    setStoreData([]);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setNextStepDetails(null);
    setProjectInfo({ prjName: "", address: "" });
    setFormData({
      loc: selectedPlant,
      applyDate: "",
      comments: "",
      prjName: "",
      address: "",
      feePaid: "",
      feeAmount: "",
      acknowledgeName: "",
    });
    setNewDocs([]);
    setAcknowledgeDocs([]);
    setErrors({});
    setProvisionalNOCCompleted(false);
    setSelectedLogs([]); // Reset logs

    if (selectedPlant && steps.length > 0) {
      axios
        .get(`${API_BASE_URL}/fire-data?plant=${selectedPlant}`)
        .then((res) => {
          const fetchedData = res.data;
          setStoreData(fetchedData);
          console.log("Fetched Data (full):", fetchedData);

          if (fetchedData && fetchedData.length > 0) {
            const firstRecord = fetchedData[0];
            const info = {
              prjName: firstRecord.PROJECT_NAME || "",
              address: firstRecord.ADDRESS || "",
            };
            setProjectInfo(info);
            if (
              PROVISIONAL_NOC_STEP_INDICES[0] === 0 &&
              !fetchedData.some(
                (item) =>
                  item.PROCESS === steps[0]?.PROCESS && item.UPDATED === "YES"
              )
            ) {
              setFormData((prev) => ({ ...prev, ...info }));
            } else {
              setFormData((prev) => ({
                ...prev,
                prjName: info.prjName,
                address: info.address,
              }));
            }
          }

          const provisionalNOCStepsCompleted =
            PROVISIONAL_NOC_STEP_INDICES.every(
              (index) =>
                steps[index] &&
                fetchedData.some(
                  (item) =>
                    item.PROCESS === steps[index].PROCESS &&
                    item.UPDATED === "YES"
                )
            );
          setProvisionalNOCCompleted(provisionalNOCStepsCompleted);

          let nextStepFound = null;
          let nextStepIdx = -1;
          let currentStepType = null;

          if (!provisionalNOCStepsCompleted) {
            for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
              if (
                steps[idx] &&
                !fetchedData.some(
                  (item) =>
                    item.PROCESS === steps[idx].PROCESS &&
                    item.UPDATED === "YES"
                )
              ) {
                nextStepFound = steps[idx];
                nextStepIdx = idx;
                currentStepType = "Provisional NOC";
                break;
              }
            }
          } else {
            for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
              if (
                steps[idx] &&
                !fetchedData.some(
                  (item) =>
                    item.PROCESS === steps[idx].PROCESS &&
                    item.OC_UPDATED === "YES"
                )
              ) {
                nextStepFound = steps[idx];
                nextStepIdx = idx + PROVISIONAL_NOC_STEP_INDICES.length;
                currentStepType = "OC Process";
                break;
              }
            }
          }

          setImmediateNextStep(nextStepFound);
          setImmediateNextStepIndex(nextStepIdx);

          if (nextStepFound) {
            const apiUrl = `${API_BASE_URL}/fire-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(
              nextStepFound.PROCESS
            )}/${encodeURIComponent(currentStepType)}`;
            return axios.get(apiUrl);
          } else {
            const allOCStepsCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
              (index) =>
                steps[index] &&
                fetchedData.some(
                  (item) =>
                    item.PROCESS === steps[index].PROCESS &&
                    item.OC_UPDATED === "YES"
                )
            );

            if (provisionalNOCStepsCompleted && allOCStepsCompleted) {
              setImmediateNextStepIndex(
                PROVISIONAL_NOC_STEP_INDICES.length * 2
              );
            } else {
              setImmediateNextStepIndex(-1);
            }
            return Promise.resolve(null);
          }
        })
        .then((detailsRes) => {
          if (detailsRes && detailsRes.data) {
            const details = detailsRes.data;
            setNextStepDetails(details);
            
            // Get logs for current step
            if (immediateNextStep) {
              const currentStepRecord = storeData.find(
                (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim()
              );
              
              if (currentStepRecord?.LOG) {
                try {
                  const parsedLogs = JSON.parse(currentStepRecord.LOG);
                  setFormData(prev => ({
                    ...prev,
                    logs: parsedLogs
                  }));
                } catch (error) {
                  console.error("Failed to parse logs:", error);
                }
              }
            }
            
            setFormData((prev) => ({
              ...prev,
              applyDate: details.APPLY_DT || "",
              comments: details.COMMENTS || "",
              feePaid: details.FEE_PAID || "",
              feeAmount: details.FEE_AMOUNT || "",
              acknowledgeName: details.ACKNOWLEDGE_NAME || "",
            }));
          } else {
            setNextStepDetails(null);
            setFormData((prev) => ({
              ...prev,
              applyDate: "",
              comments: "",
              feePaid: "",
              feeAmount: "",
              acknowledgeName: "",
            }));
          }
        })
        .catch((err) =>
          console.error("Error during data fetching process:", err)
        );
    }
  }, [selectedPlant, steps, PROVISIONAL_NOC_STEP_INDICES]);

  useEffect(() => {
    if (
      nextStepDetails &&
      typeof nextStepDetails === "object" &&
      Object.keys(nextStepDetails).length > 0
    ) {
      const details = nextStepDetails;
      setFormData((prev) => ({
        ...prev,
        applyDate: details.APPLY_DT,
        comments: details.COMMENTS || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, applyDate: "", comments: "" }));
    }
  }, [nextStepDetails]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    console.log(name, value, "Field changed");

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
        return;
      }

      try {
        const res = await getMasterByLoc(value);

        if (res && Object.keys(res).length > 0) {
          console.log("✅ Master data fetched:", res);
          setHeaderData(res);
        } else {
          console.warn("⚠️ No master data found for location:", value);
          setHeaderData({});
          setFormData((prev) => ({
            ...prev,
            applyDate: "",
          }));
        }
      } catch (err) {
        console.error("❌ Error fetching master by loc:", err);
        setHeaderData({});
        setFormData((prev) => ({
          ...prev,
          applyDate: "",
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailSubmit = () => {
    const newErrors = {};
    if (!formData.loc) newErrors.loc = "Plant selection is required";
    if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

    setShowEmailModal(true);
  };

  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);
    await handleConfirmSubmit(emails);
  };

  const handleConfirmSubmit = async (emails) => {
    const newErrors = {};
    setErrors({});

    if (!formData.loc || !immediateNextStep) {
      Swal.fire(
        "Validation Error",
        "Please select a Plant and ensure a process step is active.",
        "error"
      );
      return;
    }

    const isProvisionalNOCStep = PROVISIONAL_NOC_STEP_INDICES.includes(
      immediateNextStepIndex
    );
    const isOCProcessStep = OC_PROCESS_STEP_RANGE.includes(
      immediateNextStepIndex
    );

    if (isOCProcessStep) {
      if (!formData.feePaid)
        newErrors.feePaid = "Please specify if fee is paid.";
      if (formData.feePaid === "YES" && !formData.feeAmount)
        newErrors.feeAmount = "Fee amount is required when fee is paid.";
      if (!formData.acknowledgeName)
        newErrors.acknowledgeName = "Acknowledge name is required.";
      if (acknowledgeDocs.length === 0) {
        newErrors.acknowledgeDocs =
          "Please upload at least one acknowledgement receipt.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const errorMessages = Object.values(newErrors).join("<br>");
      Swal.fire("Validation Error", errorMessages, "error");
      return;
    }

    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("comments", formData.comments || "");
    payload.append("applyDate", formData.applyDate || "");
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });
    
    if (immediateNextStepIndex === PROVISIONAL_NOC_STEP_INDICES[0]) {
      payload.append("prjName", formData.prjName || "");
      payload.append("address", formData.address || "");
    } else {
      payload.append("prjName", projectInfo.prjName || "");
      payload.append("address", projectInfo.address || "");
    }

    if (immediateNextStepIndex >= 1) {
      payload.append(
        "stepStatus",
        formData[`stepStatus_${immediateNextStepIndex}`] || ""
      );
    }

    newDocs.forEach((file) => payload.append("New_Doc[]", file));

    if (isOCProcessStep) {
      payload.append("feePaid", formData.feePaid || "");
      payload.append("feeAmount", formData.feeAmount || "");
      payload.append("acknowledgeName", formData.acknowledgeName || "");
      acknowledgeDocs.forEach((file) =>
        payload.append("Acknowledge_Doc[]", file)
      );
    }

    const currentStepRecord = storeData.find(
      (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim()
    );

    const apiUrl = currentStepRecord
      ? `${API_BASE_URL}/fire-modify`
      : `${API_BASE_URL}/fire-submit`;

    try {
      await axios.post(apiUrl, payload);
      await Swal.fire({
        icon: "success",
        title: "Submitted!",
        text: "Your data has been saved successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      setSelectedPlant(formData.loc);
      setFormData((prev) => ({
        ...prev,
        applyDate: "",
        comments: "",
        feePaid: "",
        feeAmount: "",
        acknowledgeName: "",
      }));
      setNewDocs([]);
      setAcknowledgeDocs([]);
      setErrors({});
    } catch (error) {
      console.error("Submission failed:", error);
      Swal.fire(
        "Submission Failed",
        "Please check the console for details.",
        "error"
      );
    }
  };

  // Function to get logs for current step
  const getCurrentStepLogs = () => {
    if (!immediateNextStep || !storeData || storeData.length === 0) {
      return [];
    }
    
    // Find the current step record
    const currentStepRecord = storeData.find(
      (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim()
    );
    
    if (!currentStepRecord?.LOG) {
      return [];
    }
    
    try {
      return JSON.parse(currentStepRecord.LOG);
    } catch (error) {
      console.error("Failed to parse logs:", error);
      return [];
    }
  };

  const renderDocumentHistory = () => {
    if (
      !nextStepDetails ||
      typeof nextStepDetails !== "object" ||
      Object.keys(nextStepDetails).length === 0
    ) {
      return (
        <div className="d-flex flex-column" style={{ height: "100%" }}>
          <Card style={{ padding: "1px", height: "80%", overflow: "auto" }}>
            <p className="text-muted mb-0">No previous documents for this step.</p>
          </Card>
          <div className="p-2 border-top bg-light text-center">
            <Button
              variant="info"
              size="sm"
              disabled={true}
            >
              No Logs Available
            </Button>
          </div>
        </div>
      );
    }

    let generalDocuments = [];
    let acknowledgementReceipts = [];

    if (nextStepDetails.UPLOAD_DOC) {
      try {
        const parsedDocs = JSON.parse(nextStepDetails.UPLOAD_DOC);
        generalDocuments = parsedDocs.map((doc) => ({
          name: doc.file_name,
          url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
        }));
      } catch (error) {
        console.error("Failed to parse UPLOAD_DOC JSON:", error);
      }
    }

    if (nextStepDetails.ACK_DOC) {
      try {
        const parsedAcknowledgeDocs = JSON.parse(nextStepDetails.ACK_DOC);
        acknowledgementReceipts = parsedAcknowledgeDocs.map((doc) => ({
          name: doc.file_name,
          url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
        }));
      } catch (error) {
        console.error("Failed to parse ACK_DOC JSON:", error);
      }
    }

    const isOCProcessStep = OC_PROCESS_STEP_RANGE.includes(
      immediateNextStepIndex
    );

    // Get logs for current step
    const currentStepLogs = getCurrentStepLogs();

    return (
      <div className="d-flex flex-column" style={{ height: "100%" }}>
        <Card style={{ padding: "1px", height: "80%", overflow: "auto" }}>
          <h6 className="text-primary p-2">General Uploaded Documents</h6>
          {generalDocuments.length > 0 ? (
            <ul className="list-unstyled">
              {generalDocuments.map((doc, idx) => (
                <li key={`gen-doc-${idx}`} className="mb-1 p-1">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none"
                  >
                    {doc.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0">
              No general documents were uploaded for this step.
            </p>
          )}

          {isOCProcessStep && (
            <>
              <h6 className="text-primary mt-3">Acknowledgement Receipts</h6>
              {acknowledgementReceipts.length > 0 ? (
                <ul className="list-unstyled">
                  {acknowledgementReceipts.map((doc, idx) => (
                    <li key={`ack-doc-${idx}`} className="mb-1">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none"
                      >
                        <FaFileAlt className="me-2" />
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">
                  No acknowledgement receipts available for this step.
                </p>
              )}
            </>
          )}
        </Card>
        
        {/* View Logs Button */}
        <div className="p-2 border-top bg-light text-center">
          <Button
            variant="info"
            size="sm"
            onClick={() => {
              const logs = getCurrentStepLogs();
              setSelectedLogs(logs);
              setShowLogsModal(true);
            }}
            disabled={currentStepLogs.length === 0}
          >
            {currentStepLogs.length === 0 ? "No Logs Available" : `View Logs (${currentStepLogs.length})`}
          </Button>
        </div>
      </div>
    );
  };

  const renderProcessColumn = (columnTitle, isOCPhase) => {
    return (
      <Col xs={6}>
        <h6 className="text-center mb-2">{columnTitle}</h6>
        <Nav variant="pills" className="flex-column">
          {steps.map((step, idx) => {
            let variant = "secondary",
              clickable = false,
              statusIcon = "⏸️";

            let isCompleted = false;
            let currentConceptualIndex;

            if (isOCPhase) {
              isCompleted = storeData.some(
                (item) =>
                  item.PROCESS === step.PROCESS && item.OC_UPDATED === "YES"
              );
              currentConceptualIndex =
                idx + PROVISIONAL_NOC_STEP_INDICES.length;
            } else {
              isCompleted = storeData.some(
                (item) =>
                  item.PROCESS === step.PROCESS && item.UPDATED === "YES"
              );
              currentConceptualIndex = idx;
            }

            const isActive = currentConceptualIndex === immediateNextStepIndex;

            if (isCompleted) {
              variant = "success";
              statusIcon = "✅";
            } else if (isActive) {
              variant = "warning";
              statusIcon = "⚠️";
            }

            if (isOCPhase && !provisionalNOCCompleted) {
              clickable = false;
              variant = "secondary";
              statusIcon = "🔒";
            } else {
              if (currentConceptualIndex < immediateNextStepIndex) {
                clickable = true;
              } else if (currentConceptualIndex === immediateNextStepIndex) {
                clickable = true;
              } else {
                clickable = false;
              }
            }

            return (
              <Nav.Item
                className="mb-2"
                key={`${isOCPhase ? "oc-" : "pnoc-"}${step.PROCESS}`}
              >
                <Nav.Link
                  eventKey={currentConceptualIndex}
                  disabled={!clickable}
                  className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                  style={{ cursor: clickable ? "pointer" : "not-allowed" }}
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

  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        <Col md={4} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h5 className="text-center mb-3">Process Steps</h5>
            <Row>
              {renderProcessColumn("Provisional NOC", false)}
              {renderProcessColumn("OC Process", true)}
            </Row>
          </div>
        </Col>

        <Col md={5} className="d-flex flex-column">
          <Form className="p-3 border rounded bg-light">
            {immediateNextStep && (
              <h4 className="mb-3 text-primary fw-bold">
                {immediateNextStep.PROCESS}
              </h4>
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
              {immediateNextStepIndex < 2 && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      {immediateNextStepIndex === 1
                        ? "Inspection Date"
                        : "Apply Date"}
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="applyDate"
                      value={formData.applyDate || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>

            {immediateNextStepIndex > 0 && immediateNextStepIndex < 5 && (
              <Form.Group className="mb-3">
                <Form.Label>
                  {provisionalRadioLabels[immediateNextStepIndex] ||
                    "Status for this step"}
                </Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    label="Yes"
                    name={`stepStatus_${immediateNextStepIndex}`}
                    value="YES"
                    checked={
                      formData[`stepStatus_${immediateNextStepIndex}`] === "YES"
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [`stepStatus_${immediateNextStepIndex}`]:
                          e.target.value,
                      }))
                    }
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name={`stepStatus_${immediateNextStepIndex}`}
                    value="NO"
                    checked={
                      formData[`stepStatus_${immediateNextStepIndex}`] === "NO"
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [`stepStatus_${immediateNextStepIndex}`]:
                          e.target.value,
                      }))
                    }
                  />
                </div>
              </Form.Group>
            )}

            {immediateNextStepIndex >= 6 && (
              <Form.Group className="mb-3">
                <Form.Label>
                  {ocRadioLabels[immediateNextStepIndex] ||
                    "Status for this step"}
                </Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    label="Yes"
                    name={`stepStatus_${immediateNextStepIndex}`}
                    value="YES"
                    checked={
                      formData[`stepStatus_${immediateNextStepIndex}`] === "YES"
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [`stepStatus_${immediateNextStepIndex}`]:
                          e.target.value,
                      }))
                    }
                  />
                  <Form.Check
                    type="radio"
                    label="No"
                    name={`stepStatus_${immediateNextStepIndex}`}
                    value="NO"
                    checked={
                      formData[`stepStatus_${immediateNextStepIndex}`] === "NO"
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [`stepStatus_${immediateNextStepIndex}`]:
                          e.target.value,
                      }))
                    }
                  />
                </div>
              </Form.Group>
            )}

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Upload Application Documents</Form.Label>
                <Button
                  variant="outline-secondary"
                  className="form-control"
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload Docs{" "}
                  {newDocs.length > 0 && `(${newDocs.length} files)`}
                </Button>
                {errors.newDocs && (
                  <div className="text-danger mt-1">{errors.newDocs}</div>
                )}
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Comments</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    name="comments"
                    value={formData.comments || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-grid mt-3">
              <Button variant="primary" size="lg" onClick={handleEmailSubmit}>
                Submit
              </Button>
            </div>
          </Form>
        </Col>

        <Col md={3} className="d-flex w-25">
          <div className="border rounded p-3 bg-white flex-fill d-flex flex-column">
            <h5 className="mb-3 text-dark">Document History</h5>
            <div className="flex-grow-1 overflow-auto">
              {renderDocumentHistory()}
            </div>
          </div>
        </Col>
      </Row>

      {/* Logs Modal */}
      <Modal show={showLogsModal} onHide={() => setShowLogsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Logs for {immediateNextStep?.PROCESS}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
          {selectedLogs.length === 0 ? (
            <p>No logs available</p>
          ) : (
            selectedLogs.map((log, i) => (
              <div key={i} className="mb-2">
                <strong>{log?.date || "Unknown Date"}:</strong> {log?.comment || "No comment"}
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

      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData?.loc}
        applyDate={formData?.applyDate}
        comments={formData?.comments}
      />
      <ReraDocUploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        files={newDocs}
        setFiles={setNewDocs}
      />
    </>
  );
};

export default FireModifyTable;