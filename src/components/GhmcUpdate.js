


import React, { useEffect, useState, useContext } from "react";
import { Nav, Form, Button, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../config/Config";
import { FaCheckCircle, FaUpload } from "react-icons/fa";
import { Context } from "../context/ContextData";
import ReusableDialog from "./ReusableDialog";
import ProjectInfoHeader from "./ProjectInfoHeader";
import WaterDocUploadModal from "./WaterDocUploadModal";
import PreviousGhmcDocs from "./PreviousGhmcDocs";
import { getMasterByLoc } from "../api/Api";
import EmailSelectionModal from "./EmailModal"

const GhmcUpdate = () => {
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
  const [loc, setLoc] = useState([]);

  // 👇 NEW STATE: Track if we're viewing a specific step
  const [isViewingSpecificStep, setIsViewingSpecificStep] = useState(false);

  const [viewedStep, setViewedStep] = useState(null);
  const [viewedStepDetails, setViewedStepDetails] = useState(null);

  const [formData, setFormData] = useState({
    loc: "",
    applyDate: "",
    comments: "",
    process: "",
    organisation: "",
    project_name: "",
    location: "",
    status: "",
    noOfTowers: "",
  });

  const [feasibilityDocs, setFeasibilityDocs] = useState([]);
  const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
  const [linkDocs, setLinkDocs] = useState([]);
  const [landDocs, setLandDocs] = useState([]);
  const [othDocs, setOthDocs] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
  const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [organizationType, setOrganizationType] = useState("");
  const [isFirstProcess, setIsFirstProcess] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentProcess, setCurrentProcess] = useState("");

  const [errors, setErrors] = useState({});
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    open: false,
  });


  
      useEffect(() => {
        setHeaderData(null);
      }, []);

      
  // Check if viewing the immediate next step (not a completed step)
  const isViewingNextStep = () => {
    return viewedStep?.PROCESS === immediateNextStep?.PROCESS;
  };

  const handleEmailSubmit = () => {
    // Only allow submit if we're viewing the immediate next step
    if (!isViewingNextStep()) {
      alert("Cannot submit a completed step. Please select the next pending step.");
      return;
    }
    
    const newErrors = {};
    if (!formData.loc) newErrors.loc = "Plant selection is required";
    if (!formData.applyDate) newErrors.applyDate = "Apply date is required";
    setShowEmailModal(true);
  };

  const areAllStepsCompleted = () => {
    if (!steps.length || !storeData.length) return false;
    
    const completedSteps = storeData
      .filter((item) => item.UPDATED === "YES")
      .map((item) => item.PROCESS);
    
    return steps.every((step) => completedSteps.includes(step.PROCESS));
  };

  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);
    await handleConfirmSubmit(emails);
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

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/GHMC-plants`)
      .then((res) => {
        setLoc(res.data);
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  useEffect(() => {
    setIsFirstProcess(immediateNextStepIndex === 0);
  }, [immediateNextStepIndex]);

  useEffect(() => {
    if (!selectedPlant) return;

    console.log("Fetching GHMC processes for plant:", selectedPlant);

    axios
      .get(`${API_BASE_URL}/GHMC-process`, {
        params: { plant: selectedPlant },
      })
      .then((res) => {
        console.log("Response from GHMC-process:", res.data);
        setSteps(res.data || []);
        if (res.data && res.data.length > 0) setActiveStep(0);
      })
      .catch((err) => console.error("Error fetching processes:", err));
  }, [selectedPlant]);

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
        // 👇 Reset viewing state when all completed
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

  useEffect(() => {
    if (!selectedPlant) {
      console.log("⚠️ No plant selected yet.");
      return;
    }

    const fetchPlantData = async () => {
      console.log(`🚀 Fetching GHMC data for plant: ${selectedPlant}`);

      try {
        const ghmcRes = await axios.get(
          `${API_BASE_URL}/GHMC-data?plant=${selectedPlant}`
        );
        const ghmcData = ghmcRes.data || [];
        console.log("📦 Full GHMC data:", ghmcData);

        setStoreData(ghmcData);
        const plantRecord = ghmcData?.find(
          (item) => item.loc === selectedPlant
        );

        if (plantRecord && plantRecord.Organization) {
          setOrganizationType(plantRecord.Organization);
        } else {
          setOrganizationType(plantRecord?.Organization || "GHMC");
        }

        if (ghmcData.length > 0) {
          console.log("✅ GHMC records found. Using first step for project info.");

          const firstStep = ghmcData[0];
          console.log("🧾 First step data:", firstStep);

          setFormData((prev) => ({
            ...prev,
            loc: selectedPlant,
            organisation: firstStep.Organization || "",
            noOfTowers: firstStep.noOfTowers || "",
            location: firstStep.LOCATION || "",
            status: firstStep.STATUS || "",
          }));

          console.log("🎯 Updated formData with first step:", {
            organisation: firstStep.Organization,
            noOfTowers: firstStep.noOfTowers,
            location: firstStep.LOCATION,
            status: firstStep.STATUS,
          });
        } else {
          console.log("⚠️ No GHMC data found — falling back to master API...");

          const masterRes = await getMasterByLoc(selectedPlant);
          console.log("📚 Master data from getMasterByLoc:", masterRes);

          if (masterRes) {
            setHeaderData(masterRes);
            setFormData((prev) => ({
              ...prev,
              loc: selectedPlant,
              organisation: masterRes.Organization || "",
              project_name: masterRes.PROJECT_NAME || "",
              location: masterRes.LOCATION || "",
              status: masterRes.STATUS || "",
            }));

            console.log("🎯 Updated formData with masterRes:", {
              organisation: masterRes.Organization,
              project_name: masterRes.PROJECT_NAME,
              location: masterRes.LOCATION,
              status: masterRes.STATUS,
            });
          }
        }
      } catch (err) {
        console.error("❌ Error fetching GHMC/master data:", err);
      }
    };

    fetchPlantData();
  }, [selectedPlant]);

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

  useEffect(() => {
    if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
      const nextStepName = steps[immediateNextStepIndex]?.PROCESS;
      if (!nextStepName) return;

      axios
        .get(
          `${API_BASE_URL}/GHMC-step-details/${encodeURIComponent(
            selectedPlant
          )}/${encodeURIComponent(nextStepName)}`
        )
        .then((res) => {
          const data = res.data || {};
          console.log("Raw GHMC-step-details response (Immediate Next Step):", data);

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
          console.error("Error fetching GHMC-step-details (Immediate Next Step):", err);
          setNextStepDetails(null);
        });
    } else {
      setNextStepDetails(null);
    }
  }, [selectedPlant, immediateNextStepIndex, steps]);

  useEffect(() => {
    if (nextStepDetails) {
      console.log("🧩 Next Step Details Fetched:", nextStepDetails);
      setFormData((prev) => ({
        ...prev,
        applyDate: nextStepDetails.applyDate || "",
        status: nextStepDetails.STATUS || "",
        reason: nextStepDetails.REASON || "",
        comments: nextStepDetails.Comments || nextStepDetails.COMMENTS || "",
        noOfFlats:
          nextStepDetails.NUMBER_OF_FLATS || nextStepDetails.noOfFlats || "",
        KLD: nextStepDetails.feas_doc_name || "",
        amountPaid: nextStepDetails.AMOUNT_PAID || "",
        Ghmc: nextStepDetails.GHMC || "",
        OldAmount:
          nextStepDetails.OLD_AMOUNT || nextStepDetails.OldAmount || "",
        Size: nextStepDetails.SIZE_OF_CONNECTION || nextStepDetails.Size || "",
        TotalAmount: nextStepDetails.TOTAL_AMOUNT || "",
        TotalProjectArea: nextStepDetails.TOTAL_PROJECT_AREA || "",
        noOfTowers: nextStepDetails.noOfTowers || "",
        ProjectBuildArea: nextStepDetails.PROJECT_BUILD_AREA || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        applyDate: "",
        comments: "",
        process: "",
        reason: "",
        status: "",
        noOfFlats: "",
        KLD: "",
        amountPaid: "",
        Ghmc: "",
        OldAmount: "",
        Size: "",
        TotalAmount: "",
        TotalProjectArea: "",
        noOfTowers: "",
        ProjectBuildArea: "",
      }));

      setFeasibilityDocs([]);
      setAmountPaidDocs([]);
      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);
    }
  }, [nextStepDetails]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "noOfFlats") {
      const nocs = Math.ceil(Number(value) / 2);
      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);
      setFeasibilityDocs([]);
      setAmountPaidDocs([]);
      setFormData((prev) => ({
        ...prev,
        noOfFlats: value,
        KLD: value ? nocs : "",
      }));
    } else if (name === "OldAmount") {
      const amountPaid = storeData?.[0]?.AMOUNT_PAID || 0;
      const total = amountPaid + Number(value);
      console.log(total, "total", amountPaid, value);
      setFormData((prev) => ({
        ...prev,
        OldAmount: value,
        TotalAmount: value ? total : "",
      }));
    } else if (name === "loc") {
      setFormData((prev) => ({ ...prev, loc: value }));
      setSelectedPlant(value);
      setSubmitted(false);
      setIsViewingSpecificStep(false); // 👈 Reset when plant changes
      setViewedStepDetails(null);
      setViewedStep(null);
      setCurrentProcess("");
      setShowEmailModal(false);

      try {
        const res = await getMasterByLoc(value);
        if (res) {
          setHeaderData(res);
          setFormData((prev) => ({
            ...prev,
            applyDate: res.APPLICATION_DATE || "",
            noOfTowers: res.NUMBER_OF_TOWERS || "",
            TotalProjectArea: res.TOTAL_PROJECT_AREA || "",
            ProjectBuildArea: res.PROJECT_BUILD_AREA || "",
            ProjectName: res.PROJECT_NAME || "",
          }));
        } else {
          setHeaderData(null);
          setFormData((prev) => ({
            ...prev,
            applyDate: "",
            noOfTowers: "",
            TotalProjectArea: "",
            ProjectBuildArea: "",
            ProjectName: "",
          }));
        }
      } catch (err) {
        console.error("Error fetching master by loc:", err);
        setHeaderData(null);
        setFormData((prev) => ({
          ...prev,
          applyDate: "",
          noOfTowers: "",
          TotalProjectArea: "",
          ProjectBuildArea: "",
          ProjectName: "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleConfirmSubmit = async (emails) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = new FormData();

    payload.append("Organization", formData.organisation || "");
    payload.append("project_name", formData.project_name || "");
    payload.append("location", formData.location || "");
    payload.append("status", formData.status || "");

    payload.append("loc", formData.loc);
    payload.append("applyDate", formData.applyDate);
    payload.append("process", immediateNextStep?.PROCESS || "");
    payload.append("Comments", formData.comments || "");
    payload.append("GHMC", formData.Ghmc || "");
    payload.append("OldAmount", formData.OldAmount || "");
    payload.append("Size_Of_Connection", formData.Size || "");
    payload.append("noOfFlats", formData.noOfFlats || "");
    payload.append("totalProjectArea", formData.TotalProjectArea || "");
    payload.append("projectBuildArea", formData.ProjectBuildArea || "");
    payload.append("noOfTowers", formData.noOfTowers || "");
    payload.append("TotalAmount", formData.TotalAmount || "");
    
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    feasibilityDocs.forEach((file) => payload.append("feas_doc_name[]", file));

    console.log("📦 Payload being sent to GHMC-update:", payload);

    try {
      const res = await axios.post(`${API_BASE_URL}/GHMC-update`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const refreshed = await axios.get(
        `${API_BASE_URL}/GHMC-data?plant=${formData.loc}`
      );
      setStoreData(refreshed.data || []);

      const master = await getMasterByLoc(formData.loc);
      if (master) setHeaderData(master);

      setFormData((prev) => ({
        ...prev,
        applyDate: "",
        comments: "",
        noOfFlats: "",
        KLD: "",
        amountPaid: "",
        status: "",
        reason: "",
        noOfTowers: "",
        ProjectBuildArea: "",
      }));

      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);
      setFeasibilityDocs([]);
      setAmountPaidDocs([]);
      setNextStepDetails(null);
      setSubmitted(true);

      setRespModifyData?.(res?.data?.data);

      setDialogConfig({
        title: "Success",
        message: "Form submitted successfully!",
        confirmText: "OK",
        open: true,
      });
    } catch (err) {
      console.error("❌ Submission failed:", err);
      setDialogConfig({
        title: "Error",
        message: "Submission failed. Please try again.",
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

  // 👇 MODIFIED: Set viewing state when step is clicked
  const handleStepClick = async (step, plant) => {
    if (!plant) return;
    
    setViewedStep(step);
    setCurrentProcess(step.PROCESS);
    
    // 👇 Set that we're viewing a specific step
    setIsViewingSpecificStep(true);
    setShowEmailModal(false); // Close email modal if open

    // Reset submitted state only if it's the immediate next step
    if (step.PROCESS === immediateNextStep?.PROCESS) {
      setSubmitted(false);
    }

    try {
      const storedCompletedStep = storeData.find(
        (item) => item.PROCESS === step.PROCESS && item.UPDATED === "YES"
      );

      let dataToParse;
      if (storedCompletedStep) {
        console.log("📜 Viewing completed process from storeData:", step.PROCESS);
        dataToParse = storedCompletedStep;
        setSubmitted(true); // Mark as submitted if already completed
      } else {
        console.log("🌐 Fetching live step details for:", step.PROCESS);
        const res = await axios.get(
          `${API_BASE_URL}/GHMC-step-details/${encodeURIComponent(
            plant
          )}/${encodeURIComponent(step.PROCESS)}`
        );
        dataToParse = res.data || {};
        setSubmitted(false); // Not submitted yet
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
        status: parsed.STATUS || "",
        reason: parsed.REASON || "",
        comments: parsed.Comments || parsed.COMMENTS || "",
        noOfFlats: parsed.NUMBER_OF_FLATS || parsed.noOfFlats || "",
        KLD: parsed.feas_doc_name || "",
        amountPaid: parsed.AMOUNT_PAID || "",
        Ghmc: parsed.GHMC || "",
        OldAmount: parsed.OLD_AMOUNT || parsed.OldAmount || "",
        Size: parsed.SIZE_OF_CONNECTION || parsed.Size || "",
        TotalAmount: parsed.TOTAL_AMOUNT || "",
        TotalProjectArea: parsed.TOTAL_PROJECT_AREA || "",
        noOfTowers: parsed.noOfTowers || "",
        ProjectBuildArea: parsed.PROJECT_BUILD_AREA || "",
      }));

      setViewedStepDetails(parsed);

    } catch (err) {
      console.error("❌ Error fetching step details:", err);
      setViewedStepDetails(null);
      setSubmitted(false);
      setFormData((prev) => ({
        ...prev,
        applyDate: "", comments: "", process: "", reason: "", status: "",
        noOfFlats: "", KLD: "", amountPaid: "", Ghmc: "", OldAmount: "",
        Size: "", TotalAmount: "", TotalProjectArea: "", noOfTowers: "",
        ProjectBuildArea: "",
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
              {organizationType ? `${organizationType} Process Steps` : 'Process Steps'}
            </span>

            <Nav variant="pills" className="flex-column">
              {steps.map((step, idx) => {
                let variant = "secondary";
                let clickable = false;
                let statusIcon = "⏸️";

                const isCompleted = storeData?.some(
                  (item) => item.PROCESS?.toLowerCase().trim() === step.PROCESS?.toLowerCase().trim() &&
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
                      onClick={() => {
                        if (!clickable) return;
                        setActiveStep(idx);
                        handleStepClick(step, selectedPlant);
                      }}
                      className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                      style={{
                        cursor: clickable ? "pointer" : "not-allowed"
                      }}
                    >
                      {statusIcon}
                      <span>
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
            <div className="p-3 border rounded bg-light d-flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
              {renderCompletionMessage()}
            </div>
          ) : (
            <Form className="p-3 border rounded bg-light">
              <h4 className="mb-3 text-warning fw-bold">

                    {immediateNextStep && (
                  <h4 className="mb-3  fw-bold">
                    {immediateNextStep.PROCESS}
                    {NumberOfTowers && <> | Towers Count: <span className="text-dark">{NumberOfTowers}</span></>}
                  
                  </h4>
                )}
       
             
              </h4>

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
                      value={formData.applyDate || ""}
                      readOnly
                      onChange={handleChange}
                      disabled={!isViewingNextStep()}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.applyDate}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={12}>
                  <Form.Group controlId="formCommentsDisplay">
                    <Form.Label>Comments</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="comments"
                      value={formData.comments || ""}
                      readOnly
                      onChange={handleChange}
                      disabled={!isViewingNextStep()}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid">
                {/* 👇 Show "Back to Completion" button when viewing completed step */}
                {areAllStepsCompleted() && isViewingSpecificStep && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setIsViewingSpecificStep(false);
                      setViewedStep(null);
                      setViewedStepDetails(null);
                      setCurrentProcess("");
                    }}
                    className="w-100 fw-semibold mb-2"
                  >
                    ← Back to Completion Message
                  </Button>
                )}

                {/* Only show Submit button for the immediate next step */}
                {isViewingNextStep() && (
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
                )}
                
                {/* Show view-only button for completed steps */}
                {!isViewingNextStep() && isViewingSpecificStep && (
                  <Button variant="secondary" size="md" className="w-100 fw-semibold" disabled>
                    {isProcessCompleted(viewedStep?.PROCESS) 
                      ? "Completed (View Only)" 
                      : "Not Available"}
                  </Button>
                )}
              </div>
            </Form>
          )}
        </Col>

        {/* Right Section: Previous Docs */}
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill w-50">
            <PreviousGhmcDocs docsData={viewedStepDetails} />
          </div>
        </Col>
      </Row>

      <ReusableDialog
        open={confirmOpen}
        title="Confirm Submission"
        message="Are you sure you want to submit this form? This action cannot be undone."
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText="Submit"
        isLoading={isSubmitting}
      />

      <ReusableDialog
        open={dialogConfig.open}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onClose={() => setDialogConfig({ ...dialogConfig, open: false })}
        onConfirm={() => setDialogConfig({ ...dialogConfig, open: false })}
        confirmText={dialogConfig.confirmText}
      />

      {/* Only show email modal when needed */}
      {formData?.loc && formData?.applyDate && immediateNextStep && isViewingNextStep() && (
        <EmailSelectionModal
          show={showEmailModal}
          onHide={() => setShowEmailModal(false)}
          onSubmit={handleEmailSelectionSubmit}
          processName={immediateNextStep?.PROCESS}
          plantName={formData.loc}
          applyDate={formData.applyDate}
          comments={formData.comments}
        />
      )}
     
      <WaterDocUploadModal
        show={showFeasibilityModal}
        onClose={() => setShowFeasibilityModal(false)}
        linkDocs={feasibilityDocs}
        setLinkDocs={setFeasibilityDocs}
        title="Upload Feasibility Certificate"
        showLandDocs={false}
        showOthDocs={false}
      />

      <WaterDocUploadModal
        show={amountPaidDocModal}
        onClose={() => setAmountPaidDocModal(false)}
        linkDocs={AmountPaidDocs}
        setLinkDocs={setAmountPaidDocs}
        title="Upload Paid Document Certificate"
        showLandDocs={false}
        showOthDocs={false}
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
      />
    </>
  );
};

export default GhmcUpdate;