


import React, { useEffect, useState, useRef, useContext } from "react";
import { Nav, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FormGroup from "./FormGroup";
import { API_BASE_URL } from "../config/Config";
import PreviousUploadedDocsModal from "./PreviousUploadedDocsPanel";
import Swal from "sweetalert2";
import EmailSelectionModal from "./EmailModal"
import ProjectInfoHeader from "./ProjectInfoHeader";
import { getMasterByLoc } from "../api/Api";
import { Context } from "../context/ContextData";
import { FaCheckCircle } from "react-icons/fa";

const AirportUpdateTable = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
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
  const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingDt, setProcessingdt] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState(null);   //------------login user state
const [recordExists, setRecordExists] = useState(false); 
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

  const renderCompletionMessage = () => {
    return (
      <div className="text-center">
        <FaCheckCircle size={64} className="text-success" />
        <h3 className="text-success mb-3">Congratulations! 🎉</h3>
        <h5 className="text-muted mb-4">All process steps have been completed successfully!</h5>
        <Alert variant="success" className="mx-auto" style={{ maxWidth: '500px' }}>
          <Alert.Heading>Project Completion Status</Alert.Heading>
          <p>
            All {steps.length} steps for <strong>{selectedPlant}</strong> have been completed.
            You can review any step by clicking on it in the process list.
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
    if (steps.length > 0 && storeData.length > 0) {
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.PROCESS?.trim().toLowerCase());

      const allCompleted = steps.every(step =>
        completedProcesses.includes(step.PROCESS?.trim().toLowerCase())
      );

      setAllStepsCompleted(allCompleted);
    } else {
      setAllStepsCompleted(false);
    }
  }, [steps, storeData]);

  useEffect(() => {
    if (immediateNextStepIndex === 0) {
      setIsFirstProcess(true);
    } else {
      setIsFirstProcess(false);
    }
  }, [immediateNextStepIndex]);

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
  const handleEmailSubmit = () => {
    // FIX: Don't show email modal if viewing completed step
    if (selectedProcessDetails) {
      Swal.fire({
        icon: 'info',
        title: 'Viewing Completed Step',
        text: 'You are viewing a completed step. No updates can be made.',
        timer: 2000
      });
      return;
    }

    // FIX: Check if all steps are completed
    if (allStepsCompleted) {
      Swal.fire({
        icon: 'info',
        title: 'All Steps Completed',
        text: 'All process steps have been completed. No further action required.',
        timer: 2000
      });
      return;
    }

    // FIX: Check if immediateNextStep exists
    if (!immediateNextStep) {
      Swal.fire({
        icon: 'info',
        title: 'No Next Step',
        text: 'There is no next step to update.',
        timer: 2000
      });
      return;
    }

    // FIX: Validation
    const newErrors = {};
    if (!formData.plant) newErrors.plant = "Plant selection is required";
    if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

    // If there are errors, show them
    if (Object.keys(newErrors).length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: Object.values(newErrors).join(', '),
        timer: 2000
      });
      return;
    }

    // Show email modal only for valid updates
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
      .get(`${API_BASE_URL}/airport-process`)
      .then((res) => {
        setSteps(res.data);
        if (res.data.length > 0) setActiveStep(0);
      })
      .catch((err) => console.error("Error fetching processes", err));
  }, []);

  // Fetch plants
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/airport-plants`)
      .then((res) => {
        console.log("fetch plants", res.data);
        setPlants(res.data);
      })
      .catch((err) => console.error("Error fetching plants", err));
  }, []);

  const getDateLabel = (processName) => {
    if (!processName) return "Date";
    
    if (processName === "Received TOR") {
      return "Received Date";
    }
    
    switch (processName) {
      case "Submit Application": return "Application Date";
      case "Inspection by Consultant":
      case "Inspection by Authority": return "Inspection Date";
      case "NOC Received or Not": return "NOC Received Date";
      case "Appeal Filled": return "Appeal Date";
      case "NOC for Appeal Status": return "NOC for Appeal Date";
      default: return "Date";
    }
  };

  useEffect(() => {
    // Set the correct date label based on the next step
    if (immediateNextStep && immediateNextStep.PROCESS) {
      setProcessingdt(getDateLabel(immediateNextStep.PROCESS));
    } else {
      setProcessingdt("Application Date");
    }
  }, [immediateNextStep]);

  useEffect(() => {
    setFormData((prev) => ({
      plant: prev.plant,
      applyDate: "",
      comments: "",
      prjArea: "",
      nocs: "",
    }));
    setNextStepDetails(null);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    if (selectedPlant) {
      axios
        .get(`${API_BASE_URL}/airport-data?plant=${selectedPlant}`)
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
            `${API_BASE_URL}/airport-step-details/${encodeURIComponent(
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
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.PROCESS);

      const nextStep = steps.find(
        (step) => !completedProcesses.includes(step.PROCESS)
      );

      if (nextStep) {
        setImmediateNextStep(nextStep);
        setImmediateNextStepIndex(steps.indexOf(nextStep));
      } else {
        setImmediateNextStep(null);
        setImmediateNextStepIndex(-1);
      }
    }
  }, [steps, storeData]);

  useEffect(() => {
    if (nextStepDetails && nextStepDetails.length > 0) {
      const details = nextStepDetails[0];
      console.log("detailssssssssssssssss", details)
      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: details.APPLY_DT,
        comments: details.COMMENTS || "",
        totalPrjArea: details.AMEND_TOTAL_PRJ_AREA || "",
        noOfNocs: details.AMEND_NO_OF_NOCS || "",
        prjArea: details.TOTAL_PRJ_AREA || "",
        STATUS: details.STATUS || "YES",
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
        STATUS: "",
        totalPrjArea: "",
        noOfNocs: "",
      }));
      setFirstStep(null);
    }
  }, [nextStepDetails]);

  useEffect(() => {
    if (selectedProcessDetails) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: selectedProcessDetails.APPLY_DT,
        comments: selectedProcessDetails.COMMENTS || "",
        totalPrjArea: selectedProcessDetails.AMEND_TOTAL_PRJ_AREA || "",
        noOfNocs: selectedProcessDetails.AMEND_NO_OF_NOCS || "",
        prjArea: selectedProcessDetails.TOTAL_PRJ_AREA || "",
        STATUS: selectedProcessDetails.STATUS || "",
        nocs: selectedProcessDetails.NO_OF_NOCS || "",
      }));

      setFirstStep(selectedProcessDetails);
    }
  }, [selectedProcessDetails, selectedPlant]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "plant") {
      setSelectedPlant(value);
      setSelectedProcessDetails(null); // FIX: Reset selected process when plant changes

      try {
        const res = await getMasterByLoc(value);

        if (res) {
          setHeaderData(res);
          console.log("✅ Master data fetched:", res);

          setFormData((prev) => ({
            ...prev,
            plant: value,
            applyDate: res.APPLICATION_DATE || '' || null,
            prjArea: res.TOTAL_PRJ_AREA || '' || null,
            nocs: res?.TOTAL_PRJ_AREA && !isNaN(res.TOTAL_PRJ_AREA)
              ? Math.ceil(Number(res.TOTAL_PRJ_AREA) / 5)
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleConfirmSubmit = async (emails) => {
  //   if (!immediateNextStep) {
  //     Swal.fire({ icon: "info", title: "All steps are complete!" });
  //     return;
  //   }
  //   if (!selectedPlant) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Validation Error",
  //       text: "Please select a plant.",
  //     });
  //     return;
  //   }
  //   // ✅ Add validation for applyDate
  //   if (!formData.applyDate) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Validation Error",
  //       text: "Please select a date.",
  //     });
  //     return;
  //   }

  //   setIsSubmitting(true);

  
  //   let currentUserName = loggedInUser.username;
  //   const payload = new FormData();
  //   payload.append("loc", selectedPlant);
  //   payload.append("process", immediateNextStep.PROCESS);
  //   payload.append("applyDate", formData.applyDate);
  //   payload.append("comments", formData.comments);
  //   payload.append("totalPrjArea", formData.prjArea || "");
  //   payload.append("noOfNocs", formData.nocs || "");
  //   payload.append("STATUS", formData.STATUS || "");
  //   payload.append("username", currentUserName || "");

  //   emails.forEach((email, i) => {
  //     payload.append(`emails[${i}]`, email);
  //   });

  //   const apiUrl = `${API_BASE_URL}/airport-update`;

  //   try {
  //     await axios.post(apiUrl, payload);

  //     // Refresh the data to show the new status
  //     const res = await axios.get(
  //       `${API_BASE_URL}/airport-data?plant=${selectedPlant}`
  //     );

  
  //     setStoreData(res.data);
  //        setSelectedPlant("");
      
  //     // 2. Clear the Header Data (Project Info Header)
  //     setHeaderData(null);

  //     // 3. Clear the Sidebar Data (This removes the green checks/process history)
  //     setStoreData([]);
  //     // FIX: Reset selected process details after successful update
  //     setSelectedProcessDetails(null);
     
  //     Swal.fire({
  //       icon: "success",
  //       title: "Step Updated Successfully!",
  //       showConfirmButton: false,
  //       timer: 2000,
  //     });
  //   } catch (error) {
  //     console.error("❌ Submission failed:", error);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Update Failed",
  //       text: "Something went wrong. Please check the console for details.",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

 
 const handleConfirmSubmit = async (emails) => {
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
    // ✅ Add validation for applyDate
    if (!formData.applyDate) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please select a date.",
      });
      return;
    }

    setIsSubmitting(true);

  
    let currentUserName = loggedInUser.username;
    const payload = new FormData();
    payload.append("loc", selectedPlant);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("applyDate", formData.applyDate);
    payload.append("comments", formData.comments);
    payload.append("totalPrjArea", formData.prjArea || "");
    payload.append("noOfNocs", formData.nocs || "");
    payload.append("STATUS", formData.STATUS || "");
    payload.append("username", currentUserName || "");

    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    const apiUrl = `${API_BASE_URL}/airport-update`;

    try {
      await axios.post(apiUrl, payload);

      // IMPORTANT: Reset form data first
      setFormData({
        loc: "",
        applyDate: "",
        comments: "",
        prjArea: "",
        nocs: "",
        STATUS: ""
      });

      // Reset other states
      setSelectedPlant(""); // This clears the plant dropdown
      setHeaderData(null);
      setStoreData([]);
      setSelectedProcessDetails(null);
      setImmediateNextStep(null);
      setImmediateNextStepIndex(-1);
      
      // Optionally, clear any other related states
      // setProjectInfo({ prjName: "", address: "" }); // If you have this state
      
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
      setIsSubmitting(false);
    }
  };
 
  const handleProcessClick = (e, process) => {
    e.stopPropagation();
    console.log("Clicked:", process);

    // Find the process details from storeData
    const processDetails = storeData.find(
      (item) => item.PROCESS?.toLowerCase().trim() === process.toLowerCase().trim()
    );

   setSelectedProcessDetails(processDetails || null);
  setImmediateNextStep(null); // Reset immediateNextStep when viewing completed step
  setImmediateNextStepIndex(-1); // Reset index

  // If process details found, also set it as the active step
  if (processDetails) {
    const stepIndex = steps.findIndex(step =>
      step.PROCESS?.toLowerCase().trim() === process.toLowerCase().trim()
    );
    if (stepIndex !== -1) {
      setActiveStep(stepIndex);
    }
  }
};

  // ✅ Check if the current step is already submitted
  const isStepAlreadySubmitted = () => {
    if (!selectedPlant || !immediateNextStep) return false;
    
    return storeData.some(
      (item) => 
        item.PROCESS?.toLowerCase().trim() === immediateNextStep.PROCESS?.toLowerCase().trim() &&
        item.UPDATED === "YES"
    );
  };

  const renderNextStepForm = () => {
    const fields = [];

    fields.push(
      <Row key="basic" className="mb-2">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Plant</Form.Label>
            <Form.Select
              name="plant"
              value={formData.plant || ""}
              onChange={handleChange}
              disabled={!!selectedProcessDetails} // ✅ Disable when viewing completed steps
              className={selectedProcessDetails ? "bg-light" : ""}
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
  {selectedProcessDetails 
    ? getDateLabel(selectedProcessDetails.PROCESS)  // For viewing completed steps
    : immediateNextStep 
      ? getDateLabel(immediateNextStep.PROCESS)     // For current active step
      : "Application Date"                           // Default
  }
</Form.Label>
            <Form.Control
              type="date"
              name="applyDate"
              value={formData.applyDate || ""}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              // ✅ Enable for current step, disable if already submitted or viewing completed step
              disabled={isStepAlreadySubmitted() || !!selectedProcessDetails}
              className={(isStepAlreadySubmitted() || selectedProcessDetails) ? "bg-light" : ""}
            />
            {isStepAlreadySubmitted() && (
              <Form.Text className="text-muted small">
                This step is already submitted. Date cannot be modified.
              </Form.Text>
            )}
          </Form.Group>
        </Col>

        <Row className="mt-2 align-items-end">
          {immediateNextStep?.PROCESS === 'NOC Received or Not' &&
            <>
              <Col md={6} className="mb-2">
                <Form.Check
                  inline
                  label="Yes"
                  name="STATUS"
                  type="radio"
                  id="status-yes"
                  value="YES"
                  checked={formData.STATUS === "YES"}
                  onChange={handleChange}
                  disabled={!!selectedProcessDetails}
                />
                <Form.Check
                  inline
                  label="No"
                  name="STATUS"
                  type="radio"
                  id="status-no"
                  value="NO"
                  checked={formData.STATUS === "NO"}
                  onChange={handleChange}
                  disabled={!!selectedProcessDetails}
                />
              </Col>
            </>
          }
        </Row>

        {isFirstProcess && (
          <>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total Project Area</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    name="prjArea"
                    value={formData.prjArea || ""}
                    readOnly
                    // onChange={handleChange}
                    // readOnly={!!selectedProcessDetails}
                    className={selectedProcessDetails ? "bg-light" : ""}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nocs</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    name="nocs"
                    value={formData.nocs || ""}
                    // onChange={handleChange}
                    // readOnly={!!selectedProcessDetails}
                    readOnly
                    className={selectedProcessDetails ? "bg-light" : ""}
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        <Row>
          <Col md={12}> 
            <Form.Group>
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                name="comments"
                value={formData.comments || ""}
              readOnly
                // ✅ Make comments read-only when viewing completed steps
                disabled={isStepAlreadySubmitted() || !!selectedProcessDetails}
                className={(isStepAlreadySubmitted() || selectedProcessDetails) ? "bg-light" : ""}
              />
            </Form.Group>
          </Col>
        </Row>
      </Row>
    );

    return fields;
  };

  const hasFieldData = (fieldValue) => {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== "" && fieldValue !== 0;
  };

  const renderFormFields = () => {
    if (allStepsCompleted && !selectedProcessDetails) {
      return renderCompletionMessage();
    }

    if (!selectedProcessDetails) {
      return renderNextStepForm();
    }

    const process = selectedProcessDetails;
    const fields = [];
    const processName = process.PROCESS?.toLowerCase()?.trim();
    
    fields.push(
      <Row key="basic" className="mb-2">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Plant</Form.Label>
            <Form.Control
              type="text"
              value={formData.plant || ""}
              readOnly
              className="bg-light"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
           <Form.Label>{getDateLabel(selectedProcessDetails.PROCESS)}</Form.Label>
            <Form.Control
              type="date"
              value={formData.applyDate ||  ""}
              max={new Date().toISOString().split("T")[0]}
              readOnly
              className="bg-light"
              // ✅ Disable for viewing completed steps
            />
          </Form.Group>
        </Col>
      </Row>
    );

    if (processName === 'submit application') {
      if (hasFieldData(process.TOTAL_PRJ_AREA) || hasFieldData(process.NO_OF_NOCS)) {
        fields.push(
          <Row key="application-fields" className="mb-3">
            {hasFieldData(process.TOTAL_PRJ_AREA) && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total Project Area</Form.Label>
                  <Form.Control
                    type="number"
                    value={process.TOTAL_PRJ_AREA || ""}
                    readOnly
                    disabled
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            )}
            {hasFieldData(process.NO_OF_NOCS) && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nocs</Form.Label>
                  <Form.Control
                    type="text"
                    value={process.NO_OF_NOCS || ""}
                    readOnly
                    disabled
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            )}
          </Row>
        );
      }
    }
    
    if (hasFieldData(process.COMMENTS)) {
      fields.push(
        <Row key="application-comments" className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={process.COMMENTS || ""}
                readOnly
                disabled
                className="bg-light"
              />
            </Form.Group>
          </Col>
        </Row>
      );
    }

    if (processName === "noc received or not") {
      fields.push(
        <Form.Group key="status-group">
          <Form.Label>Status</Form.Label>
          <div>
            <Form.Check
              inline
              label="Yes"
              name="STATUS"
              type="radio"
              id="status-yes"
              value="YES"
              checked={formData.STATUS === "YES"}
              onChange={handleChange}
              disabled
            />
            <Form.Check
              inline
              label="No"
              name="STATUS"
              type="radio"
              id="status-no"
              value="NO"
              checked={formData.STATUS === "NO"}
              onChange={handleChange}
              disabled
            />
          </div>
        </Form.Group>
      );
    }
    
    return fields;
  };

  let totalProjectArea = stepData?.[0]?.TOTAL_PRJ_AREA;
  let noofNOCS = stepData?.[0]?.NO_OF_NOCS;


  const handleViewNextStep = () => {
  setSelectedProcessDetails(null);

  // Re-calculate the next step
  if (steps.length > 0 && storeData.length > 0) {
    const completedProcesses = storeData
      .filter((item) => item.UPDATED === "YES")
      .map((item) => item.PROCESS);

    const nextStep = steps.find(
      (step) => !completedProcesses.includes(step.PROCESS)
    );

    if (nextStep) {
      setImmediateNextStep(nextStep);
      setImmediateNextStepIndex(steps.indexOf(nextStep));

      // Fetch step details
      axios
        .get(
          `${API_BASE_URL}/airport-step-details/${encodeURIComponent(
            selectedPlant
          )}/${encodeURIComponent(nextStep.PROCESS)}`
        )
        .then((res) => {
          setNextStepDetails(res.data);
        })
        .catch((err) =>
          console.error("Error fetching next step details:", err)
        );
    }
  }
};

const handleBackClick = () => {
  setSelectedPlant("");
  setStoreData([]);
  setHeaderData(null);
  setSelectedProcessDetails(null);
  setAllStepsCompleted(false);
  setImmediateNextStep(null);
  setImmediateNextStepIndex(-1);
  setFormData({
    loc: "",
    applyDate: "",
    comments: "",
    noOfFlats: "",
    KLD: "",
    amountPaid: "",
    feasibilityDoc: null,
    AmountPaidDoc: null,
    status: "",
    reason: "",
    Ghmc: "",
    OldAmount: "",
    Size: "",
    TotalAmount: "",
    noOfTowers: "",
    ProjectBuildArea: "",
    TotalProjectArea: ""
  });
};

  // const handleViewNextStep = () => {
  //   setSelectedProcessDetails(null);

  //   if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
  //     const nextStepName = steps[immediateNextStepIndex]?.PROCESS;

  //     if (nextStepName) {
  //       axios
  //         .get(
  //           `${API_BASE_URL}/airport-step-details/${encodeURIComponent(
  //             selectedPlant
  //           )}/${encodeURIComponent(nextStepName)}`
  //         )
  //         .then((res) => {
  //           setNextStepDetails(res.data);
  //         })
  //         .catch((err) =>
  //           console.error("Error fetching next step details:", err)
  //         );
  //     }
  //   }
  // };

  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h6 className="text-center mb-3">Process Steps</h6>
            <Nav variant="pills" className="flex-column">
              {steps.map((step, idx) => {
                let variant = "secondary";
                let clickable = false;
                let statusIcon = "⏸️";

                const isCompleted = storeData.some(
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
                      }}
                      className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                      style={{
                        cursor: clickable ? "pointer" : "not-allowed"
                      }}
                    >
                      {statusIcon}
                      <span
                        onClick={(e) => {
                          if (isCompleted) {
                            handleProcessClick(e, step.PROCESS);
                          }
                        }}
                        style={{
                          cursor: isCompleted ? "pointer" : "default",
                          textDecoration: isCompleted ? "underline" : "none"
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

      <Col
  md={6}
  className="d-flex flex-column"
  style={{ height: '400px', overflowY: 'auto' }}
>
 <Form className="p-3 border rounded bg-light">
    {/* Form header showing current view */}
    {selectedProcessDetails ? (
      <div className="mb-3">
        <h4 className="mb-2 text-info fw-bold">
          Viewing: {selectedProcessDetails.PROCESS} (Completed)
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
    ) : immediateNextStep ? (
      <h4 className="mb-3 text-warning fw-bold">
        {immediateNextStep.PROCESS}
        <h6 className="text-muted m-2">
          {totalProjectArea && (
            <>Total Area: {totalProjectArea} &nbsp; | &nbsp;</>
          )}
          {noofNOCS && <>NOCs: {noofNOCS}</>}
        </h6>
      </h4>
    ) : allStepsCompleted ? (
<div className="d-flex justify-content-between align-items-center mb-3">
  <h4 className="text-success fw-bold mb-0">
    🎉 All Steps Completed!
  </h4>
  <button 
  onClick={handleBackClick}
    className="btn btn-success"
  >
    Back to Start
  </button>
</div>
    ) : null}

    {renderFormFields()}

    {/* Button section */}
    <div className="d-grid mt-3">
      {selectedProcessDetails ? (
        <div className="alert alert-info d-flex align-items-center">
          <i className="fas fa-info-circle me-2"></i>
          You are viewing historical data. To make changes, select the current step.
        </div>
      ) : allStepsCompleted ? (
        <div className="alert alert-success d-flex align-items-center">
          <FaCheckCircle className="me-2" size={20} />
          All steps completed! No further action required.
        </div>
      ) : (
        <Button 
          variant="primary" 
          size="md" 
          onClick={handleEmailSubmit}
          disabled={isSubmitting || !formData.plant || !immediateNextStep || !formData.applyDate || !recordExists}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      )}
    </div>
  </Form>
</Col>

        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill w-50">
            <PreviousUploadedDocsModal firstStep={firstStep} type='view'/>
          </div>
        </Col>
      </Row>

      {formData?.plant && formData?.applyDate && immediateNextStep && !selectedProcessDetails && (
        <EmailSelectionModal
          show={showEmailModal}
          onHide={() => setShowEmailModal(false)}
          onSubmit={handleEmailSelectionSubmit}
          processName={immediateNextStep?.PROCESS}
          plantName={formData?.plant}
          applyDate={formData?.applyDate}
          comments={formData?.comments}
        />
      )}
    </>
  );
};

export default AirportUpdateTable;