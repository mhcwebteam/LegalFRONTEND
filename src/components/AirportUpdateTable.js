import React, { useEffect, useState, useRef, useContext } from "react";

import { Nav, Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";
import FormGroup from "./FormGroup";
import { API_BASE_URL, API_BASE_URLS } from "../config/Config";
import PreviousUploadedDocsModal from "./PreviousUploadedDocsPanel";
import Swal from "sweetalert2";
import EmailSelectionModal from "./EmailSelectionModal";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { getMasterByLoc } from "../api/Api";
import { Context } from "../context/ContextData";

const AirportUpdateTable = () => {

    const { totalMasterData, setHeaderData, headerData, setMasterGetData, setMasterData } = useContext(Context);
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [stepData, setStepData] = useState([]);
  const [firstStep, setFirstStep] = useState(null);
  const [isFirstProcess, setIsFirstProcess] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [linkDocs, setLinkDocs] = useState([]);
  const [landDocs, setLandDocs] = useState([]);
  const [othDocs, setOthDocs] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [nextStepDetails, setNextStepDetails] = useState(null);

  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [processingDt, setProcessingdt] = useState(0);




  useEffect(() => {
    if (immediateNextStepIndex === 0) {
      setIsFirstProcess(true);
    } else {
      setIsFirstProcess(false);
    }
  }, [immediateNextStepIndex]);


  const handleEmailSubmit = () => {
    const newErrors = {};
    if (!formData.plant) newErrors.plant = "Plant selection is required";
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
  // Fetch steps
  useEffect(() => {
    axios
      .get(`${API_BASE_URLS}/airport-process`)
      .then((res) => {
        setSteps(res.data);
        if (res.data.length > 0) setActiveStep(0);
      })
      .catch((err) => console.error("Error fetching processes", err));
  }, []);

  // Fetch plants
  useEffect(() => {
    axios
      .get(`${API_BASE_URLS}/airport-plants`)
      .then((res) => {
        console.log("fetch plants", res.data);
        setPlants(res.data);
      })
      .catch((err) => console.error("Error fetching plants", err));
  }, []);


  useEffect(() => {
    // First, check if immediateNextStep and its PROCESS property exist
    if (immediateNextStep && immediateNextStep.PROCESS) {
      const processName = immediateNextStep.PROCESS;
      console.log(`[EFFECT] Process changed to: ${processName}. Determining fee.`);

      // Use a switch statement for clean, readable logic
      switch (processName) {
        case "Submit Application":
          setProcessingdt('Application');
          break;

        case "Inspection by Consultant":
          setProcessingdt('Inspection');
          break;

        case "Inspection by Authority":
          setProcessingdt('Inspection');
          break;

        case "NOC Received or Not":
          setProcessingdt('NOC Received');
          break;

        case "Appeal Filled":
          setProcessingdt('Appeal');
          break;
        case "NOC for Appeal Status":
          setProcessingdt('NOC for Appeal');
          break;

        // Add a default case for any other processes or as a fallback
        default:
          setProcessingdt(); // A default fee
          break;
      }
    } else {
      // If there is no next step, reset the fee to 0
      console.log("[EFFECT] No next step. Resetting fee.");
      setProcessingdt();
    }
  }, [immediateNextStep]);

  useEffect(() => {
    setFormData((prev) => ({
      plant: prev.plant, // Keep the newly selected plant value
      applyDate: "", // Clear the date
      comments: "",
      prjArea: "",
      nocs: "", // Clear the comments
    }));
    setNextStepDetails(null); // Clear the details from the last plant
    setImmediateNextStep(null); // Clear the next step display
    setImmediateNextStepIndex(-1); // Reset the index
    if (selectedPlant) {
      axios
        .get(`${API_BASE_URLS}/airport-data?plant=${selectedPlant}`)
        .then((res) => {
          setStepData(res.data);
          setStoreData(res.data);
          console.log("stepdata:", res.data);
        })
        .catch((err) => console.error("Error fetching step data:", err));
    }
  }, [selectedPlant]);

  useEffect(() => {
    if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
      const nextStepName = steps[immediateNextStepIndex]?.PROCESS;

      if (nextStepName) {
        axios
          .get(
            `${API_BASE_URLS}/airport-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(nextStepName)}`
          )

          .then((res) => {
            setNextStepDetails(res.data);
            console.log("nextStepDetails:", res.data);
          })
          .catch((err) =>
            console.error("Error fetching next step details:", err)
          );
      }
    }
  }, [selectedPlant, immediateNextStepIndex, steps]);

  useEffect(() => {
    if (steps.length > 0 && storeData.length > 0) {
      // Find the first step from steps[] that is NOT in storeData as completed
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.PROCESS);

      const nextStep = steps.find(
        (step) => !completedProcesses.includes(step.PROCESS)
      );

      if (nextStep) {
        setImmediateNextStep(nextStep); // Store in state
        console.log("Immediate Next Step from steps[]:", nextStep);
      } else {
        setImmediateNextStep(null);
      }
    }
  }, [steps, storeData]);

  // Update your "find next step" useEffect to also set index:
  useEffect(() => {
    if (steps.length > 0 && storeData.length > 0) {
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.PROCESS);

      const nextStep = steps.find(
        (step) => !completedProcesses.includes(step.PROCESS)
      );

      if (nextStep) {
        setImmediateNextStep(nextStep);
        setImmediateNextStepIndex(steps.indexOf(nextStep)); // ✅ store index for coloring
        console.log("Immediate Next Step from steps[]:", nextStep);
      } else {
        setImmediateNextStep(null);
        setImmediateNextStepIndex(-1);
      }
    }
  }, [steps, storeData]);

  //  UPDATED useEffect to initialize the new fields
  useEffect(() => {
    if (nextStepDetails && nextStepDetails.length > 0) {
      const details = nextStepDetails[0];
      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: details.APPLY_DT,
        comments: details.COMMENTS || "",
        totalPrjArea: details.AMEND_TOTAL_PRJ_AREA || "",
        noOfNocs: details.AMEND_NO_OF_NOCS || "",
        prjArea: details.TOTAL_PRJ_AREA || "",

        nocs: details.NO_OF_NOCS || "",
      }));
      setFirstStep(details);
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: "",
        comments: "",
        prjArea: "",
        nocs: "",
        // Clear the new fields here
        totalPrjArea: "",
        noOfNocs: "",
      }));
      setFirstStep(null);
    }
  }, [nextStepDetails]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    // --- Step 1: Handle side-effects ---
    // If the plant is changed, we must update the `selectedPlant` state
    // to trigger all the data-fetching useEffect hooks.
    if (name === "plant") {
      setSelectedPlant(value);

        try {
              const res = await getMasterByLoc(value);
      
              if (res) {
                setHeaderData(res);
                console.log("✅ Master data fetched:", res);
      
                // ✅ CRITICAL FIX: Update formData after getting the response
                setFormData((prev) => ({
                  ...prev,
                  plant: value, // ✅ Set the plant value
                  applyDate: res.APPLICATION_DATE || '' || null,
                  prjArea: res.TOTAL_PROJECT_AREA || '' || null,
                  nocs: res?.TOTAL_PROJECT_AREA && !isNaN(res.TOTAL_PROJECT_AREA)
                    ? Math.ceil(Number(res.TOTAL_PROJECT_AREA) / 5)
                    : '' || null,
                }));
              } else {
                console.warn('⚠️ No master data found for location:', value);
                setHeaderData(null);
                setFormData((prev) => ({
                  ...prev,
                  plant: value,
                  applyDate: '',
                  comments: '',
                  amendComments: '',
                  amendDate: '',
                  totalPrjArea: '',
                  prjArea: '',
                  noOfNocs: '',
                  nocs: ''
                }));
              }
            } catch (err) {
              console.error("❌ Error fetching master by loc:", err);
              setHeaderData({});
              setFormData((prev) => ({
                ...prev,
                plant: value,
                applyDate: '',
                comments: '',
                amendComments: '',
                amendDate: '',
                totalPrjArea: '',
                prjArea: '',
                noOfNocs: '',
                nocs: ''
              }));
            }
               return;
    }

    // --- Step 2: Handle all updates to the main `formData` state ---
    setFormData((prev) => {
      // Case 1: The user is typing in the 'Total Project Area' field
      if (name === "totalPrjArea") {
        const area = Number(value);
        const nocs = area > 0 ? Math.ceil(area / 5) : "";
        return {
          ...prev,
          prjArea: value,
          nocs: nocs,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // ✅ Replace your old handleSubmit with this one.
  // This is the ONLY change you need to make to the AirportUpdateTable.js file.

  const handleConfirmSubmit = async (emails) => {
    // Add a loading state for better UX

    if (!immediateNextStep) {
      Swal.fire({ icon: "info", title: "All steps are complete!" });
      return;
    }
    if (!selectedPlant) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please select a plant.",
      });
      return;
    }

    setIsSubmitting(true); // Disable button

    // 1. Create the simple payload with ONLY loc and process
    const payload = new FormData();
    payload.append("loc", selectedPlant);
    payload.append("process", immediateNextStep.PROCESS);

    payload.append("totalPrjArea", formData.prjArea || "");

    payload.append("noOfNocs", formData.nocs || "");

    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    // 2. Define the single API endpoint
    const apiUrl = `${API_BASE_URLS}/airport-update`;


    try {
      await axios.post(apiUrl, payload);

      // Refresh the data to show the new status
      const res = await axios.get(
        `${API_BASE_URLS}/airport-data?plant=${selectedPlant}`
      );
      setStoreData(res.data);

      Swal.fire({
        icon: "success",
        title: "Step Updated Successfully!",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("❌ Submission failed:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Something went wrong. Please check the console for details.",
      });
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  console.log("Current Step Data:", stepData[activeStep]);

  let totalProjectArea = stepData?.[0]?.TOTAL_PRJ_AREA;
  let noofNOCS = stepData?.[0]?.NO_OF_NOCS;

  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h6 className="text-center mb-3">Process Steps</h6>
            <Nav variant="pills" className="flex-column">
              {steps.map((step, idx) => {
                let variant = "secondary"; // disabled grey
                let clickable = false;
                let statusIcon = "⏸️"; // paused icon for disabled
                if (idx < immediateNextStepIndex) {
                  variant = "success"; // green
                  clickable = true;
                  statusIcon = "✅";
                } else if (idx === immediateNextStepIndex) {
                  variant = "warning"; // yellow
                  clickable = true;
                  statusIcon = "⚠️";
                }

                return (
                  <Nav.Item key={idx} className="mb-2">
                    <Nav.Link
                      eventKey={idx}
                      disabled={!clickable}
                      onClick={() => {
                        if (!clickable) return; // do nothing if disabled
                        setActiveStep(idx);
                        // loadStepData(stepData, idx);
                      }}
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
          </div>
        </Col>

        {/*  middle content */}
        <Col md={6}>
          <Form className="p-3 border rounded bg-light h-100">
            {immediateNextStep && (
              <div className="mb-3">
                <h4 className="text-warning fw-bold">
                  {immediateNextStep.PROCESS}
                </h4>
                <h6 className="text-muted">
                  {totalProjectArea && (
                    <>Total Area: {totalProjectArea} &nbsp; | &nbsp;</>
                  )}
                  {noofNOCS && <>NOCs: {noofNOCS}</>}
                </h6>
              </div>
            )}

            {/* Plant Dropdown */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Plant</Form.Label>
                  <Form.Select
                    name="plant"
                    value={formData.plant || ""}
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
                  <Form.Label>{processingDt} Date</Form.Label>
                  <Form.Control
                    readOnly
                    type="date"
                    name="applyDate"
                    value={formData.applyDate || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            { isFirstProcess && (

      <>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Total Project Area</Form.Label>
                    <Form.Control as="textarea" rows={1} name="prjArea" value={formData.prjArea || ""} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nocs</Form.Label>
                    <Form.Control as="textarea" rows={1} name="nocs" value={formData.nocs || ""} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Comments</Form.Label>
                    <Form.Control
                      readOnly
                      as="textarea"
                      rows={1} // Keep it compact
                      name="comments"
                      value={formData.comments || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

            </>
            ) 
      }

            {/* === END OF ROW === */}

            {/* Submit Button */}
            <div className="d-grid mt-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleEmailSubmit}
                disabled={isSubmitting || !immediateNextStep} // Disable when submitting or if no step
              >
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </div>
          </Form>
        </Col>

        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill w-50">
            <PreviousUploadedDocsModal firstStep={firstStep} />
          </div>
        </Col>
      </Row>

      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData.plant}
        applyDate={formData.applyDate}
        comments={formData.comments}
      />
    </>
  );
};

export default AirportUpdateTable;
