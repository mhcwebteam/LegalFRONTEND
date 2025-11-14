import React, { useEffect, useState, useContext } from "react";
import { Nav, Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL, API_BASE_URLS } from "../config/Config";
import { FaUpload } from "react-icons/fa";
import { Context } from "../context/ContextData";
import ReusableDialog from "./ReusableDialog";
import ProjectInfoHeader from "./ProjectInfoHeader";
import WaterDocUploadModal from "./WaterDocUploadModal";
import PreviousGhmcDocs from "./PreviousGhmcDocs";
import { getMasterByLoc } from "../api/Api";
import EmailSelectionModal from "./EmailSelectionModal";

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



  // 👇 state to track which step user is viewing
  const [viewedStep, setViewedStep] = useState(null);
  const [viewedStepDetails, setViewedStepDetails] = useState(null); // This will hold the combined doc data for the *currently viewed* step

  const [formData, setFormData] = useState({
    loc: "",
    applyDate: "",
    comments: "", // Make sure this is initialized
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

  const [isFirstProcess, setIsFirstProcess] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Track which process is being displayed in the center form
  const [currentProcess, setCurrentProcess] = useState("");

  const [errors, setErrors] = useState({});
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    open: false,
  });

  
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







  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/GHMC-plants`)
      .then((res) => {
        setLoc(res.data);
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);



  // Determine first process
  useEffect(() => {
    setIsFirstProcess(immediateNextStepIndex === 0);
  }, [immediateNextStepIndex]);

  // fetch process steps
  useEffect(() => {
    if (!selectedPlant) return; // only run when a plant is selected

    console.log("Fetching GHMC processes for plant:", selectedPlant);

    axios
      .get(`${API_BASE_URL}/GHMC-process`, {
        params: { plant: selectedPlant }, // send plant as query param
      })
      .then((res) => {
        console.log("Response from GHMC-process:", res.data);
        setSteps(res.data || []);
        if (res.data && res.data.length > 0) setActiveStep(0);
      })
      .catch((err) => console.error("Error fetching processes:", err));
  }, [selectedPlant]);

  // THIS IS THE BLOCK YOU NEED TO UPDATE
  // compute next step based on UPDATED = YES logic
  useEffect(() => {
    if (steps.length > 0 && Array.isArray(storeData)) {
      const completed = storeData
        .filter((i) => i.UPDATED === "YES")
        .map((i) => i.PROCESS);
      const next = steps.find((s) => !completed.includes(s.PROCESS));
      if (next) {
        setImmediateNextStep(next);
        setImmediateNextStepIndex(steps.indexOf(next));
        // ⭐ ADDED LOGIC STARTS HERE ⭐
        // After identifying the immediate next step, also set it as the *viewed* step
        // This will trigger the useEffect for viewedStep, which fetches its details
        // If you already have `nextStepDetails` populated at this point, you can directly use it
        // but it's safer to call handleStepClick to ensure full data parsing and consistency
        if (selectedPlant && next) {
          handleStepClick(next, selectedPlant);
        }
        // ⭐ ADDED LOGIC ENDS HERE ⭐
      } else {
        setImmediateNextStep(null);
        setImmediateNextStepIndex(-1);
        // ⭐ ADDED: If all steps are completed, clear viewed step details ⭐
        setViewedStep(null);
        setViewedStepDetails(null);
        // ⭐ END ADDED LOGIC ⭐
      }
    } else {
      // If no steps or storeData, ensure everything is cleared
      setImmediateNextStep(null);
      setImmediateNextStepIndex(-1);
      setViewedStep(null);
      setViewedStepDetails(null);
    }
  }, [steps, storeData, selectedPlant]); // Add selectedPlant to dependencies

  // fetch GHMC data + master details for selected plant
  useEffect(() => {
    if (!selectedPlant) {
      console.log("⚠️ No plant selected yet.");
      return;
    }

    const fetchPlantData = async () => {
      console.log(`🚀 Fetching GHMC data for plant: ${selectedPlant}`);

      try {
        // 1️⃣ Fetch all stored GHMC steps
        const ghmcRes = await axios.get(
          `${API_BASE_URL}/GHMC-data?plant=${selectedPlant}`
        );
        const ghmcData = ghmcRes.data || [];
        console.log("📦 Full GHMC data:", ghmcData);

        setStoreData(ghmcData);

        if (ghmcData.length > 0) {
          console.log(
            "✅ GHMC records found. Using first step for project info."
          );

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

          // 🧠 Log what's being set
          console.log("🎯 Updated formData with first step:", {
            organisation: firstStep.Organization,
            noOfTowers: firstStep.noOfTowers,
            location: firstStep.LOCATION,
            status: firstStep.STATUS,
          });
        } else {
          console.log("⚠️ No GHMC data found — falling back to master API...");

          // If no GHMC data yet, fall back to master API
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

  // helper to safely parse JSON or CSV string
  function parseJsonArraySafe(value) {
    if (!value) return [];
    try {
      if (Array.isArray(value)) return value;
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed]; // If not array, wrap in one
    } catch {
      if (typeof value === "string")
        return value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      return [];
    }
  }

  // ⭐ NEW HELPER FUNCTION FOR COMBINING DOCS (copied from GhmcModify) ⭐
  // Combines separate name and path arrays into a single array of { name, path } objects
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
  // ⭐ END NEW HELPER FUNCTION ⭐

  // fetch details for immediate next step
  // This useEffect will populate `nextStepDetails` for the *next immediate step*
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


  // update formData when nextStepDetails changes (for the *immediate next step*)
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
        KLD: nextStepDetails.feas_doc_name || "", // Assuming this is still a direct value, not doc array
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
      // 🧹 Clear everything when no step data found
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

      // Also clear doc arrays
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

  const handleSubmitClick = () => {
    const newErrors = {};
    if (!formData.loc) newErrors.loc = "Plant selection is required";
    if (!formData.applyDate) newErrors.applyDate = "Apply date is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setConfirmOpen(true);
  };

  const handleConfirmSubmit = async (emails) => {
    if (isSubmitting) return; // 🚫 Prevent double submit
    setIsSubmitting(true);

    const payload = new FormData();

    // ✅ Always include hidden project details
    payload.append("Organization", formData.organisation || "");
    payload.append("project_name", formData.project_name || "");
    payload.append("location", formData.location || "");
    payload.append("status", formData.status || "");

    // ✅ Step-based data
    payload.append("loc", formData.loc);
    payload.append("applyDate", formData.applyDate);
    payload.append("process", immediateNextStep?.PROCESS || "");
    payload.append("comments", formData.comments || ""); // Append comments to payload
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

    // ✅ Append uploaded documents
    feasibilityDocs.forEach((file) => payload.append("feas_doc_name[]", file));

    console.log("📦 Payload being sent to GHMC-update:", payload);

    try {
      // ✅ Only one API hit
      const res = await axios.post(`${API_BASE_URL}/GHMC-update`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ Refresh data
      const refreshed = await axios.get(
        `${API_BASE_URL}/GHMC-data?plant=${formData.loc}`
      );
      setStoreData(refreshed.data || []);

      const master = await getMasterByLoc(formData.loc);
      if (master) setHeaderData(master);

      // ✅ Reset form
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

  // helper to check if process is completed
  const isProcessCompleted = (processName) => {
    return storeData?.some(
      (item) => item.PROCESS === processName && item.UPDATED === "YES"
    );
  };

  // 👇 when user clicks a step in sidebar
  const handleStepClick = async (step, plant) => {
    if (!plant) return;
    setViewedStep(step);
    setCurrentProcess(step.PROCESS); // ✅ Set center title process

    try {
      // Find if this step is already 'UPDATED=YES' in storeData
      const storedCompletedStep = storeData.find(
        (item) => item.PROCESS === step.PROCESS && item.UPDATED === "YES"
      );

      let dataToParse;
      if (storedCompletedStep) {
        console.log("📜 Viewing completed process from storeData:", step.PROCESS);
        dataToParse = storedCompletedStep; // Use the data from storeData
        setSubmitted(true); // ✅ Disable & show Submitted/Updated button
      } else {
        console.log("🌐 Fetching live step details for:", step.PROCESS);
        const res = await axios.get(
          `${API_BASE_URL}/GHMC-step-details/${encodeURIComponent(
            plant
          )}/${encodeURIComponent(step.PROCESS)}`
        );
        dataToParse = res.data || {};
        setSubmitted(false); // ✅ Reset button when new (not updated)
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
        // Add other document types here if needed, e.g.:
        // plan_docs: combineAndParseDocArrays(dataToParse, "PLAN_DOC_NAME", "PLAN_DOC_PATH"),
      };

      // Set the formData fields based on the fetched/stored step details
      setFormData((prev) => ({
        ...prev,
        applyDate: parsed.applyDate || "",
        status: parsed.STATUS || "",
        reason: parsed.REASON || "",
        comments: parsed.Comments || parsed.COMMENTS || "",
        noOfFlats: parsed.NUMBER_OF_FLATS || parsed.noOfFlats || "",
        KLD: parsed.feas_doc_name || "", // Assuming this is still a direct value
        amountPaid: parsed.AMOUNT_PAID || "",
        Ghmc: parsed.GHMC || "",
        OldAmount: parsed.OLD_AMOUNT || parsed.OldAmount || "",
        Size: parsed.SIZE_OF_CONNECTION || parsed.Size || "",
        TotalAmount: parsed.TOTAL_AMOUNT || "",
        TotalProjectArea: parsed.TOTAL_PROJECT_AREA || "",
        noOfTowers: parsed.noOfTowers || "",
        ProjectBuildArea: parsed.PROJECT_BUILD_AREA || "",
      }));

      setViewedStepDetails(parsed); // This holds details for the LEFT SIDEBAR clicked step
      // The PreviousGhmcDocs component should probably display docs for the *viewed* step, not the *next immediate* step.
      // So, let's pass `viewedStepDetails` to PreviousGhmcDocs.
      // We will adjust the render line for PreviousGhmcDocs below.

    } catch (err) {
      console.error("❌ Error fetching step details:", err);
      setViewedStepDetails(null);
      setSubmitted(false);
      // Also clear form data related to the step if there's an error fetching its details
      setFormData((prev) => ({
        ...prev,
        applyDate: "", comments: "", process: "", reason: "", status: "",
        noOfFlats: "", KLD: "", amountPaid: "", Ghmc: "", OldAmount: "",
        Size: "", TotalAmount: "", TotalProjectArea: "", noOfTowers: "",
        ProjectBuildArea: "",
      }));
    }
  };

  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        {/* Left Sidebar */}
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h6 className="text-center mb-3">Process Steps</h6>
            <Nav variant="pills" className="flex-column">
              {steps.map((step, idx) => {
                const allCompleted = immediateNextStepIndex === -1;
                const isClickable =
                  allCompleted || idx <= immediateNextStepIndex;

                let variant = "secondary";
                let statusIcon = "⏸️";

                if (allCompleted) {
                  // ✅ all completed → all green
                  variant = "success";
                  statusIcon = "✅";
                } else if (idx < immediateNextStepIndex) {
                  variant = "success";
                  statusIcon = "✅";
                } else if (idx === immediateNextStepIndex) {
                  variant = "warning";
                  statusIcon = "⚠️";
                }

                return (
                  <Nav.Item className="mb-2" key={idx}>
                    <Nav.Link
                      active={viewedStep?.PROCESS === step.PROCESS}
                      disabled={!isClickable}
                      onClick={() =>
                        isClickable && handleStepClick(step, selectedPlant)
                      }
                      className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                      style={{
                        cursor: isClickable ? "pointer" : "not-allowed",
                      }}
                    >
                      {statusIcon} <span>{step.PROCESS}</span>
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
          <Form className="p-3 border rounded bg-light">
            <h4 className="mb-3 text-warning fw-bold">
              {currentProcess ||
                immediateNextStep?.PROCESS ||
                "Select a Process"}
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
                    onChange={handleChange}
                    // isInvalid={!!errors.applyDate}
                    disabled // Always disabled for display only
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.applyDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Comments Field for Display */}
            <Row className="mb-2">
              <Col md={12}>
                <Form.Group controlId="formCommentsDisplay">
                  <Form.Label>Comments</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="comments"
                    value={formData.comments || ""}
                    disabled // Disabled for display only
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* <Row className="mb-3">

              {viewedStep?.PROCESS === immediateNextStep?.PROCESS && (
                <Col md={6}>
                  <Form.Label>Upload Feasibility Document</Form.Label>
                  <button
                    type="button"
                    className="btn btn-outline-secondary form-control"
                    onClick={() => setShowFeasibilityModal(true)}
                    disabled={!formData.loc}
                  >
                    <FaUpload className="me-2" /> Upload Document
                    <span className="ms-2 text-muted">
                      {feasibilityDocs.length > 0 &&
                        `(${feasibilityDocs.length} selected)`}
                    </span>
                  </button>
                </Col>
              )}
            </Row> */}

            <div className="d-grid">
              {/* Show submit button only if the currently displayed process is the immediateNextStep */}
              {viewedStep?.PROCESS === immediateNextStep?.PROCESS && (
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
               {/* Optionally show an "Updated" button for completed steps that are not the immediate next step */}
              {viewedStep?.PROCESS !== immediateNextStep?.PROCESS && isProcessCompleted(viewedStep?.PROCESS) && (
                <Button variant="success" size="md" className="w-100 fw-semibold" disabled>
                  Updated (View Only)
                </Button>
              )}
            </div>
          </Form>
        </Col>

        {/* Right Section: Previous Docs */}
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill w-50">
            {/* ⭐ MODIFICATION: Pass viewedStepDetails instead of nextStepDetails ⭐ */}
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
  <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData.loc}
        applyDate={formData.applyDate}
        comments={formData.comments}
      />
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