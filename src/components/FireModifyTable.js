import React, { useEffect, useState, useMemo, useContext } from "react";
import { Nav, Form, Button, Row, Col, Badge, Modal, Card } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import ReraDocUploadModal from "./ReraDocUploadModal";
import { FaFileAlt } from "react-icons/fa";
import EmailSelectionModal from "./EmailSelectionModal";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { Context } from "../context/ContextData";
import { getMasterByLoc } from "../api/Api";

const FireModifyTable = () => {
  

    const { 
      storeData, 
      setStoreData, 
      respModifyData, 
      setRespModifyData, 
      setHeaderData, 
      headerData 
    } = useContext(Context);

  const [steps, setSteps] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  // const [storeData, setStoreData] = useState([]);
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
  // State to hold validation errors for display
  const [errors, setErrors] = useState({}); // Added for displaying validation errors
  const [provisionalNOCCompleted, setProvisionalNOCCompleted] = useState(false);

  // You MUST adjust these indices based on the actual number of "Provisional NOC" steps
  const PROVISIONAL_NOC_STEP_INDICES = useMemo(() => [0, 1, 2, 3, 4], []);

  const OC_PROCESS_STEP_RANGE = useMemo(() => [5, 6, 7, 8, 9, 10], []);

  // For Provisional NOC steps (1–4)
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
    //   10: "OC Completion Confirmed?",
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

    console.log(
      "PROVISIONAL_NOC_STEP_INDICES:",
      PROVISIONAL_NOC_STEP_INDICES
    );
    console.log("OC_PROCESS_STEP_RANGE:", OC_PROCESS_STEP_RANGE); // Keep this for clarity in renderProcessColumn
    console.log("Steps array:", steps);




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
            // Only set form data for project name and address if it's the very first step
            // Otherwise, keep the projectInfo as read-only based on the first record
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

          // --- Determine Provisional NOC Completion ---
          const provisionalNOCStepsCompleted =
            PROVISIONAL_NOC_STEP_INDICES.every(
              (index) =>
                steps[index] && // Ensure step exists
                fetchedData.some(
                  (item) =>
                    item.PROCESS === steps[index].PROCESS &&
                    item.UPDATED === "YES"
                )
            );
          setProvisionalNOCCompleted(provisionalNOCStepsCompleted);
          console.log(
            "provisionalNOCStepsCompleted:",
            provisionalNOCStepsCompleted
          );

          let nextStepFound = null;
          let nextStepIdx = -1; // This will be the 0-based index for the *conceptual* combined steps (0-9 if 5+5)
          let currentStepType = null; // NEW: To store the step type

          // --- MODIFIED LOGIC FOR FINDING IMMEDIATE NEXT STEP ---
          if (!provisionalNOCStepsCompleted) {
            // PHASE 1: Provisional NOC is NOT complete. Find the next incomplete Provisional NOC step.
            for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
              // Loops 0,1,2,3,4
              if (
                steps[idx] && // Ensure step exists (it will, as steps has 5 items)
                !fetchedData.some(
                  (item) =>
                    item.PROCESS === steps[idx].PROCESS &&
                    item.UPDATED === "YES" // Check for Provisional completion
                )
              ) {
                nextStepFound = steps[idx];
                nextStepIdx = idx; // The index directly corresponds to the steps array for PNOC
                currentStepType = "Provisional NOC"; // NEW: Set step type
                break; // Found the first incomplete Provisional NOC step
              }
            }
          } else {
            // PHASE 2: Provisional NOC IS complete. Now, find the next incomplete OC step.
            // Loop through the SAME steps array indices, but check the OC_UPDATED flag.
            for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
              // Loops 0,1,2,3,4 again
              if (
                steps[idx] && // Ensure step exists
                !fetchedData.some(
                  (item) =>
                    item.PROCESS === steps[idx].PROCESS &&
                    item.OC_UPDATED === "YES" // Check for OC completion
                )
              ) {
                nextStepFound = steps[idx];
                // IMPORTANT: Adjust nextStepIdx to be a conceptual index for OC process.
                // This makes OC's step 0 (actual steps[0]) appear as combined step 5 in UI.
                nextStepIdx = idx + PROVISIONAL_NOC_STEP_INDICES.length;
                currentStepType = "OC Process"; // NEW: Set step type
                break; // Found the first incomplete OC step
              }
            }
          }

          setImmediateNextStep(nextStepFound);
          setImmediateNextStepIndex(nextStepIdx);
          console.log(
            "Next step index calculated:",
            nextStepIdx,
            "Next step found:",
            nextStepFound
          );

          if (nextStepFound) {
            // Use the correct PROCESS name for the API call, which is from nextStepFound.PROCESS
            const apiUrl = `${API_BASE_URL}/fire-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(
              nextStepFound.PROCESS
            )}/${encodeURIComponent(currentStepType)}`; // NEW: Add stepType query parameter
            return axios.get(apiUrl);
          } else {
            // All steps (both Provisional and OC) completed
            // Check if ALL OC steps are also marked as complete
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
              ); // Represents all 10 conceptual steps are done
            } else {
              // Fallback for an unexpected state, e.g., if provisional complete but OC not started/found.
              // This branch should ideally be unreachable if the logic is perfect and data is consistent.
              setImmediateNextStepIndex(-1); // Or some other indicator for "no active step"
            }
            return Promise.resolve(null);
          }
        })
        .then((detailsRes) => {
          if (detailsRes && detailsRes.data) {
            const details = detailsRes.data;
            setNextStepDetails(details);
            console.log("NExtstep Detials:", nextStepDetails);
            // Load form data from fetched details for the current step
            setFormData((prev) => ({
              ...prev,
              applyDate: details.APPLY_DT || "",
              comments: details.COMMENTS || "",
              feePaid: details.FEE_PAID || "", // Load existing fee data
              feeAmount: details.FEE_AMOUNT || "",
              acknowledgeName: details.ACKNOWLEDGE_NAME || "",
            }));
            // Parse existing acknowledge docs if any (for display, not re-upload)
            if (details.ACK_DOC) {
              try {
                // This part remains the same for parsing existing docs
              } catch (e) {
                console.error(
                  "Failed to parse existing acknowledge docs for details:",
                  e
                );
              }
            }
          } else {
            // Clear form fields if no details for the next step or all steps are complete
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
  }, [selectedPlant, steps, PROVISIONAL_NOC_STEP_INDICES]); // Remove OC_PROCESS_STEP_RANGE from dependencies as it's not used here for step finding

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

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   if (name === "loc") {
  //     setSelectedPlant(value);
  //     return;
  //   }

  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };
const handleChange = async (e) => {
  const { name, value } = e.target;

  console.log(name, value, "Field changed");

  // 🏗️ When location changes
  if (name === "loc") {
    setSelectedPlant(value);
    setFormData((prev) => ({
      ...prev,
      loc: value,
    }));

    // 🧹 If location is empty, clear dependent fields
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
      // 🌐 Fetch master data for selected location
      const res = await getMasterByLoc(value);

      if (res && Object.keys(res).length > 0) {
        console.log("✅ Master data fetched:", res);

        // 🧩 Update header data (used by ProjectInfoHeader)
        setHeaderData(res);

        // (Optional) update form fields based on res if needed
        setFormData((prev) => ({
          ...prev,
          // Example if you want to fill auto fields:
          // totalPrjArea: res.totalArea || "",
          // noOfNocs: res.nocCount || "",
        }));
      } else {
        console.warn("⚠️ No master data found for location:", value);
        setHeaderData({});
        setFormData((prev) => ({
          ...prev,
          applyDate: "",
          totalPrjArea: "",
          noOfNocs: "",
        }));
      }
    } catch (err) {
      console.error("❌ Error fetching master by loc:", err);
      setHeaderData({});
      setFormData((prev) => ({
        ...prev,
        applyDate: "",
        totalPrjArea: "",
        noOfNocs: "",
      }));
    }

    return;
  }

  // 🧾 Handle other input fields normally
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
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
  const handleConfirmSubmit = async (emails) => {
    const newErrors = {};
    setErrors({}); // Clear previous errors

    if (!formData.loc || !immediateNextStep) {
      Swal.fire(
        "Validation Error",
        "Please select a Plant and ensure a process step is active.",
        "error"
      );
      return;
    }

    // --- Validation based on current step type ---
    const isProvisionalNOCStep = PROVISIONAL_NOC_STEP_INDICES.includes(
      immediateNextStepIndex
    );
    const isOCProcessStep = OC_PROCESS_STEP_RANGE.includes(
      immediateNextStepIndex
    );

    if (isProvisionalNOCStep) {
      if (!formData.applyDate) {
        newErrors.applyDate =
          "Please provide an Apply/Inspection Date for this step.";
      }
    }

    if (isOCProcessStep) {
      if (!formData.feePaid) newErrors.feePaid = "Please specify if fee is paid.";
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
    payload.append("applyDate", formData.applyDate || ""); // Always append if present
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });
    // Project Name and Address fields are only editable for the very first step (index PROVISIONAL_NOC_STEP_INDICES[0])
    if (immediateNextStepIndex === PROVISIONAL_NOC_STEP_INDICES[0]) {
      payload.append("prjName", formData.prjName || "");
      payload.append("address", formData.address || "");
    } else {
      // For subsequent steps, send the projectInfo from state as it's read-only in UI
      payload.append("prjName", projectInfo.prjName || "");
      payload.append("address", projectInfo.address || "");
    }

    if (immediateNextStepIndex >= 1) {
      payload.append(
        "stepStatus",
        formData[`stepStatus_${immediateNextStepIndex}`] || ""
      );
    }

    // General application documents
    newDocs.forEach((file) => payload.append("New_Doc[]", file));

    // Acknowledge documents and fee details (only for OC Process steps)
    if (isOCProcessStep) {
      payload.append("feePaid", formData.feePaid || "");
      payload.append("feeAmount", formData.feeAmount || "");
      payload.append("acknowledgeName", formData.acknowledgeName || "");
      acknowledgeDocs.forEach((file) =>
        payload.append("Acknowledge_Doc[]", file)
      );
    }

    console.log("--- Submitting Payload ---");
    for (const [key, value] of payload.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("--------------------------");

    // Determine if it's an update or new submission based on the specific status field
    let existingRecordStatusField = null;
    const currentStepRecord = storeData.find(
      (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim()
    );

    if (isProvisionalNOCStep) {
      existingRecordStatusField = currentStepRecord?.UPDATED;
    } else if (isOCProcessStep) {
      existingRecordStatusField = currentStepRecord?.OC_UPDATED; // *** Use OC_UPDATED here ***
    }

    const apiUrl =
      existingRecordStatusField === "YES"
        ? `${API_BASE_URL}/fire-modify`
        : `${API_BASE_URL}/fire-submit`;

    try {
      await axios.post(apiUrl, payload);
      await Swal.fire({
        icon: "success",
        title: existingRecordStatusField === "YES" ? "Updated!" : "Submitted!",
        text: "Your data has been saved successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      // After successful submission, re-fetch data for the current plant to update the UI
      setSelectedPlant(formData.loc); // Trigger useEffect to re-fetch data
      setFormData((prev) => ({
        ...prev,
        applyDate: "", // Clear fields that change per step
        comments: "",
        feePaid: "",
        feeAmount: "",
        acknowledgeName: "",
      }));
      setNewDocs([]); // Clear uploaded general docs
      setAcknowledgeDocs([]); // Clear uploaded acknowledge docs
      setErrors({}); // Clear errors
    } catch (error) {
      console.error("Submission failed:", error);
      Swal.fire(
        "Submission Failed",
        "Please check the console for details.",
        "error"
      );
    }
  };

  const renderDocumentHistory = () => {
    if (
      !nextStepDetails ||
      typeof nextStepDetails !== "object" ||
      Object.keys(nextStepDetails).length === 0
    ) {
      return (
        <p className="text-muted mb-0">No previous documents for this step.</p>
      );
    }

    let generalDocuments = [];
    let acknowledgementReceipts = [];

    // Parse general uploaded documents (assuming UPLOAD_DOC in details is for New_Doc[])
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

    // Parse acknowledgement receipts (from ACK_DOC)
    if (nextStepDetails.ACK_DOC) {
      try {
        const parsedAcknowledgeDocs = JSON.parse(
          nextStepDetails.ACK_DOC
        );
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

    return (
      <div className="d-flex flex-column" style={{ height: '100%' }}>
        <Card style={{padding:'1px', height: '80%', overflow: 'auto' }}>
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
                  {/* <FaFileAlt className="me-2" /> */}
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

        {/* Only show acknowledgement receipts if the current step is an OC Process step */}
        {isOCProcessStep && ( // *** Conditional rendering here ***
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
 <Card className="m-2 p-2" style={{ height: '25%', overflow: 'hidden' }}>
  <h6 className="mb-2">Comments</h6>
  <div
    style={{
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}
  >
    {formData.comments || 'No comments available'}
  </div>
</Card>


      </div>
    );
  };

  const renderProcessColumn = (columnTitle, isOCPhase) => {
    // Added isOCPhase boolean
    return (
      <Col xs={6}>
        <h6 className="text-center mb-2">{columnTitle}</h6>
        <Nav variant="pills" className="flex-column">
          {steps.map((step, idx) => {
            let variant = "secondary",
              clickable = false,
              statusIcon = "⏸️";

            // Now, we use the isOCPhase flag passed to the function
            let isCompleted = false;
            let currentConceptualIndex; // This will be the index that aligns with immediateNextStepIndex

            if (isOCPhase) {
              isCompleted = storeData.some(
                (item) =>
                  item.PROCESS === step.PROCESS && item.OC_UPDATED === "YES"
              );
              // For OC phase, the conceptual index is offset
              currentConceptualIndex =
                idx + PROVISIONAL_NOC_STEP_INDICES.length;
            } else {
              // Provisional NOC Phase
              isCompleted = storeData.some(
                (item) =>
                  item.PROCESS === step.PROCESS && item.UPDATED === "YES"
              );
              currentConceptualIndex = idx; // For Provisional, it's the direct index
            }

            // Check if this step (in its current phase) is the immediate next step
            const isActive = currentConceptualIndex === immediateNextStepIndex;

            if (isCompleted) {
              variant = "success";
              statusIcon = "✅";
            } else if (isActive) {
              variant = "warning";
              statusIcon = "⚠️";
            }

            // Lock OC Process steps if Provisional NOC is not completed
            if (isOCPhase && !provisionalNOCCompleted) {
              clickable = false; // Override clickability
              variant = "secondary"; // Set to locked style
              statusIcon = "🔒";
            } else {
              // For Provisional NOC steps or unlocked OC Process steps, determine clickability
              // A step is clickable if it's already completed (for review) or if it's the current active step.
              if (currentConceptualIndex < immediateNextStepIndex) {
                clickable = true; // Completed steps in this phase are clickable
              } else if (currentConceptualIndex === immediateNextStepIndex) {
                clickable = true; // Current active step in this phase is clickable
              } else {
                clickable = false; // Future steps in this phase are not clickable
              }
            }

            return (
              <Nav.Item
                className="mb-2"
                key={`${isOCPhase ? "oc-" : "pnoc-"}${step.PROCESS}`}
              >
                {" "}
                {/* Add key prefix for uniqueness */}
                <Nav.Link
                  eventKey={currentConceptualIndex} // Use the conceptual index for eventKey
                  disabled={!clickable} // Disable based on `clickable`
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
        {/* Adjusted to md={4} for more width */}
        <Col md={4} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h5 className="text-center mb-3">Process Steps</h5>
            <Row>
              {renderProcessColumn("Provisional NOC", false)}
              {renderProcessColumn("OC Process", true)}
            </Row>
          </div>
        </Col>

        {/* Adjusted to md={5} for less width */}
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

            {/* {immediateNextStepIndex >= 1 && (
  <Form.Group className="mb-3">
    <Form.Label>{stepRadioLabels[immediateNextStepIndex] || "Status for this step"}</Form.Label>
    <div>
      <Form.Check
        type="radio"
        label="Yes"
        name={`stepStatus_${immediateNextStepIndex}`}
        value="YES"
        checked={formData[`stepStatus_${immediateNextStepIndex}`] === "YES"}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            [`stepStatus_${immediateNextStepIndex}`]: e.target.value,
          }))
        }
      />
      <Form.Check
        type="radio"
        label="No"
        name={`stepStatus_${immediateNextStepIndex}`}
        value="NO"
        checked={formData[`stepStatus_${immediateNextStepIndex}`] === "NO"}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            [`stepStatus_${immediateNextStepIndex}`]: e.target.value,
          }))
        }
      />
    </div>
  </Form.Group>
)} */}
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
        {/* md={3} remains the same, as 4 + 5 + 3 = 12 */}
        <Col md={3} className="d-flex w-25">
          <div className="border rounded p-3 bg-white flex-fill d-flex flex-columnc">
            <h5 className="mb-3 text-dark">
              Document History
            </h5>
            <div className="flex-grow-1 overflow-auto">
              {renderDocumentHistory()}
            </div>
          </div>
        </Col>
      </Row>

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