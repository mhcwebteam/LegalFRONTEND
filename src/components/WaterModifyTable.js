import React, { useEffect, useState, useRef, useContext } from "react";
import { Nav, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/Config";
import Swal from "sweetalert2";
import FormHeader from "./Header";
import WaterDocUploadModal from "./WaterDocUploadModal";
import { FaCheckCircle, FaTrashAlt, FaUpload } from "react-icons/fa";
import { fetchWaterDataByPlant, getMasterByLoc } from "../api/Api";
import { Context } from "../context/ContextData";
import ReusableDialog from "./ReusableDialog";
import { toast } from "react-toastify";
import ProjectInfoHeader from "./ProjectInfoHeader";
import EmailSelectionModal from "./EmailModal";
import PreviousWaterUploadedDocs from "./PreviousWaterUploadedDocs";


const WaterModifyTable = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { storeData, setStoreData, plants, respModifyData, setRespModifyData, totalMasterData, setHeaderData, headerData } = useContext(Context);

  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
  const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    confirmText: 'OK',
    open: false
  });
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);
  const [formData, setFormData] = useState({
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

  const [feasibilityDocs, setFeasibilityDocs] = useState([]);
  const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [firstStep, setFirstStep] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [linkDocs, setLinkDocs] = useState([]);
  const [landDocs, setLandDocs] = useState([]);
  const [othDocs, setOthDocs] = useState([]);
  const fileInputRef = useRef(null);
  const [nextStepDetails, setNextStepDetails] = useState(null);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [isFirstProcess, setIsFirstProcess] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  
  // Added on 24-12-2025 by rajakumari.m - State to store selected process details for viewing historical data
  const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);

  const [loggedInUser, setLoggedInUser] = useState(null);  //-----------login userstate
  
  
  const [loc, setLoc] = useState([]);
  
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

  // Open email modal
  // const handleEmailSubmit = () => {
  //   const newErrors = {};
  //   if (!formData.loc) newErrors.loc = "Plant selection is required";
  //   if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

  //   if (formData.status === "YES" && !formData.comments) {
  //     newErrors.comments = "Comments are required";
  //   }

  //   // Reason is required when status is "NO"
  //   if (formData.status === "NO" && !formData.reason) {
  //     newErrors.reason = "Reason is required";
  //   }

  //   if (!validateDocuments()) {
  //     // Errors already set in validateDocuments function
  //     return false;
  //   }


  //   if (Object.keys(newErrors).length > 0) {
  //     setErrors(newErrors);
  //     return;
  //   }

  //   setErrors({});
  //   setShowEmailModal(true);
  // };
  // added on 4-1-2026 by rajakumari.m----------------------------------------------------
  // Open email modal
const handleEmailSubmit = () => {
  const newErrors = {};
  if (!formData.loc) newErrors.loc = "Plant selection is required";
  if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

  if (formData.status === "YES" && !formData.comments) {
    newErrors.comments = "Comments are required";
  }

  // Reason is required when status is "NO"
  if (formData.status === "NO" && !formData.reason) {
    newErrors.reason = "Reason is required";
  }

  if (!validateDocuments()) {
    // Show error if documents are invalid
    Swal.fire({
      icon: "error",
      title: "Validation Error",
      text: "Only PDF files are allowed for documents.",
      confirmButtonText: "OK",
    });
    return;
  }

  if (Object.keys(newErrors).length > 0) {
    // Show validation errors
    const errorMessages = Object.values(newErrors).join("<br>");
    Swal.fire({
      icon: "error",
      title: "Validation Error",
      html: errorMessages,
      confirmButtonText: "OK",
    });
    return;
  }

  setErrors({});
  setShowEmailModal(true);
};
// ------------------------------------------------------------------------------------------------------------

  // Handle email selection and form submission
  // const handleEmailSelectionSubmit = async (emails) => {
  //   setSelectedEmails(emails);
  //   setShowEmailModal(false);

  //   // Proceed with form submission
  //   await handleConfirmSubmit(emails);
  // };

  // ----------added on 4-1-2026 by rajakumari.m--------------------------------------------------------------
  // Handle email selection and form submission
const handleEmailSelectionSubmit = async (emails) => {
  setSelectedEmails(emails);
  setShowEmailModal(false);

  // Proceed with form submission
  await handleConfirmSubmit(emails);
};
// ---------------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (immediateNextStepIndex === 0) {
      setIsFirstProcess(true);
    } else {
      setIsFirstProcess(false);
    }
  }, [immediateNextStepIndex]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/water-process`)
      .then((res) => {
        setSteps(res.data);
        if (res.data.length > 0) setActiveStep(0);
      })
      .catch((err) => console.error("Error fetching processes", err));
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/water-plants`)
      .then((res) => {
        setLoc(res.data);
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  useEffect(() => {
    if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
      const nextStepName = steps[immediateNextStepIndex]?.PROCESS;

      if (nextStepName) {
        axios
          .get(
            `${API_BASE_URL}/water-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(nextStepName)}`
          )
          .then((res) => {
            setNextStepDetails(res.data);
          })
          .catch((err) =>
            console.error("Error fetching next step details:", err)
          );
      }
    }
  }, [selectedPlant, immediateNextStepIndex, steps]);

  // Added on 24-12-2025 by rajakumari.m - Handle clicking on completed process steps to view historical data
  const handleProcessClick = (e, process) => {
    e.stopPropagation();
    console.log("Clicked:", process);

    // Find the process details from storeData
    const processDetails = storeData.find(
      (item) => item.PROCESS?.toLowerCase().trim() === process.toLowerCase().trim()
    );

    console.log(processDetails, "processDetailsprocessDetails");
    setSelectedProcessDetails(processDetails || null);

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

  // Added on 24-12-2025 by rajakumari.m - Populate form with selected process details when viewing historical data
  useEffect(() => {
    if (selectedProcessDetails) {
      console.log(selectedProcessDetails, "selectedProcessDetailsselectedProcessDetails");

      setFormData((prevFormData) => ({
        ...prevFormData,
        loc: selectedPlant,
        applyDate: selectedProcessDetails.APPLY_DT || "",
        status: selectedProcessDetails.STATUS || "",
        reason: selectedProcessDetails.REASON || "",
        comments: selectedProcessDetails.COMMENTS || "",
        noOfFlats: selectedProcessDetails.NUMBER_OF_FLATS || "",
        KLD: selectedProcessDetails.KLD || "",
        amountPaid: selectedProcessDetails.AMOUNT_PAID || "",
        Ghmc: selectedProcessDetails.GHMC || "",
        OldAmount: selectedProcessDetails.OLD_AMOUNT || "",
        Size: selectedProcessDetails.SIZE_OF_CONNECTION || "",
        TotalAmount: selectedProcessDetails.TOTAL_AMOUNT || "",
        TotalProjectArea: selectedProcessDetails?.TOTAL_PROJECT_AREA || '',
        noOfTowers: selectedProcessDetails?.NUMBER_OF_TOWERS || '',
        ProjectBuildArea: selectedProcessDetails?.PROJECT_BUILD_AREA || ''
      }));

      setFirstStep(selectedProcessDetails);
      setSubmitted(false);
    }
  }, [selectedProcessDetails, selectedPlant]);

  // Added on 24-12-2025 by rajakumari.m - Function to switch back to next step view from historical view
  const handleViewNextStep = () => {
    setSelectedProcessDetails(null);

    // Re-fetch next step details if available
    if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
      const nextStepName = steps[immediateNextStepIndex]?.PROCESS;
      if (nextStepName) {
        axios
          .get(
            `${API_BASE_URL}/water-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(nextStepName)}`
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

  // Modified on 24-12-2025 by rajakumari.m - Added check for selectedProcessDetails to prevent overwriting historical view data
  useEffect(() => {
    if (nextStepDetails && !selectedProcessDetails) {
      let details = nextStepDetails;

      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: details?.APPLY_DT,
        status: details?.STATUS || "YES",
        reason: "",
        comments: "",
        noOfFlats: details?.NUMBER_OF_FLATS || "",
        KLD: details?.KLD || "",
        amountPaid: details?.AMOUNT_PAID || "",
        Ghmc: details?.GHMC || "",
        OldAmount: details?.OLD_AMOUNT || "",
        Size: details?.SIZE_OF_CONNECTION || "",
        TotalAmount: details?.TOTAL_AMOUNT || "",
        TotalProjectArea: details?.TOTAL_PROJECT_AREA || '',
        noOfTowers: details?.NUMBER_OF_TOWERS || '',
        ProjectBuildArea: details?.PROJECT_BUILD_AREA || ''
      }));
      setFirstStep(details);
    } else if (!selectedProcessDetails) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: "",
        status: formData.status || "YES",
        reason: "",
        comments: "",
        noOfFlats: "",
        KLD: "",
        amountPaid: "",
        Ghmc: "",
        OldAmount: "",
        Size: "",
        TotalAmount: "",
        ProjectBuildArea: "",
        noOfTowers: "",
        TotalProjectArea: ""
      }));
      setFirstStep(null);
    }
  }, [nextStepDetails, selectedProcessDetails]);

  // Added on 24-12-2025 by rajakumari.m - Helper function to check if a field has valid data
  const hasFieldData = (fieldValue) => {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== "" && fieldValue !== 0;
  };

  // Added on 24-12-2025 by rajakumari.m - Render form fields based on whether viewing historical data or next step
  const renderFormFields = () => {
    // Show completion message if all steps are done and no specific process is selected
    if (allStepsCompleted && !selectedProcessDetails) {
      return (
        <Alert variant="success" className="text-center">
          <FaCheckCircle size={48} className="text-success mb-3" />
          <Alert.Heading>All Steps Completed! 🎉</Alert.Heading>
          <p>All process steps for <strong>{selectedPlant}</strong> have been completed successfully.</p>
          <hr />
          <p className="mb-0">Select any completed step from the left panel to view its details.</p>
        </Alert>
      );
    }

    // If no process is selected, render the next step form
    if (!selectedProcessDetails) {
      return renderNextStepForm();
    }

    // Render historical process data
    const process = selectedProcessDetails;
    const fields = [];

    // Always show basic info
    fields.push(
      <Row key="basic" className="mb-2">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Plant</Form.Label>
            <Form.Control
              type="text"
              value={process.LOC || formData.loc || selectedPlant || ""}
              readOnly
              disabled
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Apply Date</Form.Label>
            <Form.Control
              type="date"
              value={formData.applyDate || ""}
              readOnly
              disabled
            />
          </Form.Group>
        </Col>
      </Row>
    );

    // Determine which fields to show based on the specific process
    const processName = process.PROCESS?.toLowerCase()?.trim();

    // Application Filling process fields
    if (processName === "application filling") {
      if (hasFieldData(process.NO_OF_FLATS) || hasFieldData(process.KLD) || hasFieldData(process.AMOUNT_PAID)) {
        fields.push(
          <Row key="application-fields" className="mb-3">
            {hasFieldData(process.NO_OF_FLATS) && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Number of Flats</Form.Label>
                  <Form.Control
                    type="number"
                    value={process.NO_OF_FLATS || ""}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            )}
            {hasFieldData(process.KLD) && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label>KLD</Form.Label>
                  <Form.Control
                    type="text"
                    value={process.KLD || ""}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            )}
            {hasFieldData(process.AMOUNT_PAID) && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Amount Paid</Form.Label>
                  <Form.Control
                    type="number"
                    value={process.AMOUNT_PAID || ""}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            )}
            {hasFieldData(process.TOTAL_PROJECT_AREA) && (
              <Col md={4} className="mt-3">
                <Form.Group>
                  <Form.Label>Total Project Area</Form.Label>
                  <Form.Control
                    type="number"
                    value={process.TOTAL_PROJECT_AREA || ""}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            )}
            {hasFieldData(process.NUMBER_OF_TOWERS) && (
              <Col md={4} className="mt-3">
                <Form.Group>
                  <Form.Label>Number Of Towers</Form.Label>
                  <Form.Control
                    type="number"
                    value={process.NUMBER_OF_TOWERS || ""}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            )}
            {hasFieldData(process.PROJECT_BUILD_AREA) && (
              <Col md={4} className="mt-3">
                <Form.Group>
                  <Form.Label>Project Build Area</Form.Label>
                  <Form.Control
                    type="number"
                    value={process.PROJECT_BUILD_AREA || ""}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            )}
          </Row>
        );
      }

      // if (hasFieldData(process.COMMENTS)) {
      //   fields.push(
      //     <Row key="application-comments" className="mb-3">
      //       <Col md={12}>
      //         <Form.Group>
      //           <Form.Label>Comments</Form.Label>
      //           <Form.Control
      //             as="textarea"
      //             rows={2}
      //             value={process.COMMENTS || ""}
      //             readOnly
      //             disabled
      //           />
      //         </Form.Group>
      //       </Col>
      //     </Row>
      //   );
      // }
    }
    // Applied For Water Release process fields  
    else if (processName === "applied for water release") {
      if (hasFieldData(process.GHMC)) {
        fields.push(
          <Row key="ghmc" className="mb-2">
            <Col md={6}>
              <Form.Group>
                <Form.Label>GHMC</Form.Label>
                <Form.Control
                  type="text"
                  value={process.GHMC || ""}
                  readOnly
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>
        );
      }

      if (hasFieldData(process.OLD_AMOUNT) || hasFieldData(process.TOTAL_AMOUNT)) {
        fields.push(
          <Row key="payment-fields" className="mb-2">
            {hasFieldData(process.OLD_AMOUNT) && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Remaining Paid</Form.Label>
                  <Form.Control
                    type="number"
                    value={process.OLD_AMOUNT || ""}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            )}
            {hasFieldData(process.TOTAL_AMOUNT) && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={process.TOTAL_AMOUNT || ""}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            )}
          </Row>
        );
      }
    }
    // Community Inspection process fields
    else if (processName === "community inspection") {
      if (hasFieldData(process.SIZE_OF_CONNECTION)) {
        fields.push(
          <Row key="size" className="mb-2">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Size Of Connection</Form.Label>
                <Form.Control
                  type="number"
                  value={process.SIZE_OF_CONNECTION || ""}
                  readOnly
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>
        );
      }
    }
    // Other processes
    else {
      if (hasFieldData(process.GHMC)) {
        fields.push(
          <Row key="ghmc" className="mb-2">
            <Col md={12}>
              <Form.Group>
                <Form.Label>GHMC</Form.Label>
                <Form.Control
                  type="text"
                  value={process.GHMC || ""}
                  readOnly
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>
        );
      }

      if (hasFieldData(process.SIZE_OF_CONNECTION)) {
        fields.push(
          <Row key="size" className="mb-2">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Size Of Connection</Form.Label>
                <Form.Control
                  type="number"
                  value={process.SIZE_OF_CONNECTION || ""}
                  readOnly
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>
        );
      }
    }

    // Show comments if status is YES
    if (formData.status === "YES" && hasFieldData(process.COMMENTS)) {
      fields.push(
        <Row key="comments" className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={process.COMMENTS || ""}
                readOnly
                disabled
              />
            </Form.Group>
          </Col>
        </Row>
      );
    }

    // Show reason if status is NO
    if (formData.status === "NO" && hasFieldData(process.REASON)) {
      fields.push(
        <Row key="reason" className="mb-2">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.reason || ""}
                readOnly
                disabled
              />
            </Form.Group>
          </Col>
        </Row>
      );
    }

    return fields;
  };

  // Added on 24-12-2025 by rajakumari.m - Render the next step form (editable form for current process)
  const renderNextStepForm = () => {
    return (
      <>
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
                max={new Date().toISOString().split("T")[0]}
                isInvalid={!!errors.applyDate}
                disabled={!formData.loc || (nextStepDetails && nextStepDetails.APPLY_DT)}
              />
              <Form.Control.Feedback type="invalid">
                {errors.applyDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <>
          <Row className="mb-3 align-items-end">
            {!isFirstProcess && (
              <>
                <Col md={6} className="mb-2">
                  <Form.Group>
                    <Form.Label>STATUS</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        label="Yes"
                        name="status"
                        type="radio"
                        value="YES"
                        checked={formData.status === "YES"}
                        disabled={!formData.loc}
                        onChange={handleChange}
                      />
                      <Form.Check
                        inline
                        label="No"
                        name="status"
                        type="radio"
                        value="NO"
                        checked={formData.status === "NO"}
                        disabled={!formData.loc}
                        onChange={handleChange}
                      />
                    </div>
                  </Form.Group>
                </Col>
                {immediateNextStepIndex === 1 && (
                  <Col md={6} className="mb-2">
                    <Form.Group>
                      <Form.Label>GHMC</Form.Label>
                      <div>
                        <Form.Check
                          inline
                          label="Yes"
                          name="Ghmc"
                          type="radio"
                          value="YES"
                          checked={formData.Ghmc === "YES"}
                          disabled={!formData.loc}
                          onChange={handleChange}
                        />
                        <Form.Check
                          inline
                          label="No"
                          name="Ghmc"
                          type="radio"
                          value="NO"
                          checked={formData.Ghmc === "NO"}
                          disabled={!formData.loc}
                          onChange={handleChange}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                )}

                {immediateNextStepIndex === 1 && (
                  <Row className="mb-2">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Remaining Paid</Form.Label>
                        <Form.Control
                          type="number"
                          name="OldAmount"
                          value={formData.OldAmount || ""}
                          disabled={!formData.loc}
                          onChange={handleChange}
                          isInvalid={!!errors.loc}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.OldAmount}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Total Amount</Form.Label>
                        <Form.Control
                          type="number"
                          name="TotalAmount"
                          value={formData.TotalAmount || ""}
                          onChange={handleChange}
                          readOnly
                          isInvalid={!!errors.loc}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.TotalAmount}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {immediateNextStepIndex === 3 && (
                  <Row className="mb-2">
                    <Form.Group>
                      <Form.Label>Size Of Connection</Form.Label>
                      <Form.Control
                        type="number"
                        name="Size"
                        value={formData.Size || ""}
                        onChange={handleChange}
                        isInvalid={!!errors.Size}
                        disabled={!formData.loc}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.Size}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                )}
              </>
            )}
          </Row>
        </>

        {formData.status === "NO" && (
          <Row className="mb-2">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Reason*</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="reason"
                  value={formData.reason || ""}
                  disabled={!formData.loc}
                  isInvalid={!!errors.reason}
                  onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.reason}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        )}

        {isFirstProcess && (
          <>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Number of Flats</Form.Label>
                  <Form.Control
                    type="number"
                    name="noOfFlats"
                    value={formData.noOfFlats || ""}
                    disabled={!formData.loc}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>KLD</Form.Label>
                  <Form.Control
                    type="text"
                    name="KLD"
                    readOnly
                    value={formData.KLD || ""}
                    disabled={!formData.loc}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Amount Paid</Form.Label>
                  <Form.Control
                    type="number"
                    name="amountPaid"
                    value={formData.amountPaid || ""}
                    disabled={!formData.loc}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mt-3">
                <Form.Group>
                  <Form.Label>Total Project Area</Form.Label>
                  <Form.Control
                    type="number"
                    name="TotalProjectArea"
                    value={formData.TotalProjectArea || ""}
                    disabled={!formData.loc}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mt-3">
                <Form.Group>
                  <Form.Label>Number Of Towers</Form.Label>
                  <Form.Control
                    type="number"
                    name="noOfTowers"
                    value={formData.noOfTowers}
                    disabled={!formData.loc}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="mt-3">
                <Form.Group>
                  <Form.Label>Project Build Area</Form.Label>
                  <Form.Control
                    type="number"
                    name="ProjectBuildArea"
                    value={formData.ProjectBuildArea}
                    disabled={!formData.loc}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>Upload Documents</Form.Label>
            <button
              type="button"
              className="upload-button"
              onClick={() => setAmountPaidDocModal(true)}
              disabled={!formData.loc}
            >
              <FaUpload className="upload-icon" /> Upload Documents
              <span className="upload-count">
                {AmountPaidDocs.length > 0 &&
                  `(${AmountPaidDocs.length} files)`}
              </span>
            </button>
            {errors.AmountPaidDocs && (
              <p className="error-text text-danger mt-1 mb-0">
                {errors.AmountPaidDocs}
              </p>
            )}
          </Col>

          {formData.status !== "NO" && (
            <Col md={6}>
              <Form.Group>
                <Form.Label>Comments*</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="comments"
                  value={formData.comments || ""}
                  disabled={!formData.loc}
                  onChange={handleChange}
                  isInvalid={!!errors.comments}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.comments}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          )}
        </Row>
      </>
    );
  };

  useEffect(() => {
    if (selectedPlant) {
      axios
        .get(`${API_BASE_URL}/water-data?plant=${selectedPlant}`)
        .then((res) => {
          setStoreData(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              loc: selectedPlant
            }));
            setSubmitted(false);
          }
        })
        .catch((err) => console.error("Error fetching step data", err));
    }
  }, [selectedPlant]);

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
    }
    else if (name === "OldAmount") {
      const amountPaid = storeData?.[0]?.AMOUNT_PAID || 0;
      const total = amountPaid + Number(value);
      setFormData((prev) => ({
        ...prev,
        OldAmount: value,
        TotalAmount: value ? total : "",
      }));
    }
    else if (name === "loc") {
      setFormData(prev => ({ ...prev, loc: value }));
      setSelectedPlant(value);
      setSubmitted(false);

      try {
        const res = await getMasterByLoc(value);
        if (res) {
          setHeaderData(res);
          setFormData((prev) => ({
            ...prev,
            applyDate: res.APPLICATION_DATE || '',
            noOfTowers: res.NUMBER_OF_TOWERS || '',
            TotalProjectArea: res.TOTAL_PROJECT_AREA || '',
            ProjectBuildArea: res.PROJECT_BUILD_AREA || '',
            ProjectName: res.PROJECT_NAME || '',
          }));
        } else {
          setHeaderData(null);
          setFormData((prev) => ({
            ...prev,
            applyDate: '',
            noOfTowers: '',
            TotalProjectArea: '',
            ProjectBuildArea: '',
            ProjectName: '',
          }));
        }
      } catch (err) {
        console.error("Error fetching master by loc:", err);
        setHeaderData(null);
        setFormData((prev) => ({
          ...prev,
          applyDate: '',
          noOfTowers: '',
          TotalProjectArea: '',
          ProjectBuildArea: '',
          ProjectName: '',
        }));
      }
    }
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateFileType = (file) => {
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.pdf'];
    const validMimeTypes = ['application/pdf'];
    const isValidExtension = validExtensions.includes(fileExtension);
    const isValidMimeType = !file.type || validMimeTypes.includes(file.type);
    return isValidExtension && isValidMimeType;
  };

  const validateDocuments = () => {
    let isValid = true;
    const newErrors = {};

    if (AmountPaidDocs.length > 0) {
      const invalidFiles = AmountPaidDocs.filter(file => !validateFileType(file));
      if (invalidFiles.length > 0) {
        newErrors.AmountPaidDocs = "Only PDF files are allowed";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleConfirmSubmit = async (emails) => {
    setIsSubmitting(true);

    //  --- : 'fetch User';
    let currentUserName = loggedInUser.username;
    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("applyDate", formData.applyDate);
    payload.append("STATUS", formData.status || "");
    payload.append("REASON", formData.reason || "");
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("comments", formData.comments || "");
    payload.append("GHMC", formData.Ghmc || "");
    payload.append("OldAmount", formData.OldAmount || "");
    payload.append("Size_Of_Connection", formData.Size || "");
    payload.append("noOfFlats", formData.noOfFlats || 0);
    payload.append("totalProjectArea", formData.TotalProjectArea || "");
    payload.append("projectBuildArea", formData.ProjectBuildArea || "");
    payload.append("noOfTowers", formData.noOfTowers || 0);
    payload.append("TotalAmount", formData.TotalAmount || "");
    payload.append("KLD", formData.KLD || "");
    payload.append("amountPaid", formData.amountPaid || "");
    payload.append("username", currentUserName || "");
    linkDocs.forEach(f => payload.append("Plan_Doc[]", f));
    landDocs.forEach(f => payload.append("Title_Doc[]", f));
    othDocs.forEach(f => payload.append("Oth_Doc[]", f));
    AmountPaidDocs.forEach(f => payload.append("AMOUNT_PAID_DOC[]", f));
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    try {
      const existingRecord = storeData.find(
        (item) =>
          item.PROCESS?.trim().toLowerCase() ===
          immediateNextStep.PROCESS?.trim().toLowerCase() &&
          item.LOC?.trim().toLowerCase() === formData.loc?.trim().toLowerCase()
      );

      // const apiUrl = existingRecord
      //   ? `${API_BASE_URL}/water-modify`
      //   : `${API_BASE_URL}/water-submit`;

//       const res = await axios.post(apiUrl, payload, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//    // added on 4-1-2025 by rajakumari.m----------------------------------------------------
//  const response = await axios.post(endpoint, payload, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// added on 4-1-2026 by rajakumari.m----------------------------------------------------------------------------------
 const apiUrl = existingRecord
      ? `${API_BASE_URL}/water-modify`
      : `${API_BASE_URL}/water-submit`;

    // FIXED: Use apiUrl instead of endpoint
    const res = await axios.post(apiUrl, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    //---------------------------------------------------

     // --- START OF RESET LOGIC ---

      // 1. Reset Plant Selection to break the link to current data
      setSelectedPlant("");

      // 2. Clear Global Context Data (Clears Left Side Colors & Header)
      setStoreData([]); 
      setHeaderData(null);
      setRespModifyData(res?.data?.data); // Optional: keep response data if needed, or set to null

      // 3. Clear Local State (Navigation & Process Tracking)
      setImmediateNextStep(null);
      setImmediateNextStepIndex(-1);
      setNextStepDetails(null);
      setAllStepsCompleted(false);
      setActiveStep(0);
      setSelectedProcessDetails(null); // Exit "View History" mode if active

      // 4. Clear Documents (Right Side & Pending Uploads)
      setFirstStep(null); // This clears the "Previous Water Uploaded Docs" on the right
      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);
      setFeasibilityDocs([]);
      setAmountPaidDocs([]);

      // 5. Reset Submission Flags
      setSubmitted(false); // Reset to false so the next user sees "Submit" button, not "Submitted"

      // 6. Full Form Reset (Empty all fields)
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

      // --- END OF RESET LOGIC ---

      // setDialogConfig({
      //   title: 'Success',
      //   message: 'Form submitted successfully!',
      //   confirmText: 'OK',
      //   open: true
      // });
      //added on 4-1-2026 by rajakumari.m----------------------------------------------
       // Show success popup (auto-closes after 1.5 seconds)
    await Swal.fire({
      icon: "success",
      title: existingRecord ? "Updated!" : "Submitted!",
      text: "Your data has been saved successfully.",
      timer: 1500,
      showConfirmButton: false,
    });

  } catch (err) {
    console.error("Submission failed:", err);
    
    // Show error popup
    await Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: "Please check the console for details.",
      confirmButtonText: "OK",
    });
  } finally {
    setIsSubmitting(false);
    setConfirmOpen(false);
  }
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
                    {/* Modified on 24-12-2025 by rajakumari.m - Added click handler for completed steps */}
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
          {/* Modified on 24-12-2025 by rajakumari.m - Updated form rendering logic */}
          <Form className="p-3 border rounded bg-light">
            {selectedProcessDetails ? (
              <div className="mb-3">
                <h4 className="mb-2 text-info fw-bold">
                  Viewing: {selectedProcessDetails.PROCESS} (Completed)
                </h4>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleViewNextStep}
                  disabled={!immediateNextStep}
                >
                  View Next Step
                </Button>
              </div>
            ) : immediateNextStep ? (
              <h4 className="mb-3 text-warning fw-bold">
                {immediateNextStep.PROCESS}
              </h4>
            ) : allStepsCompleted ? (
              <h4 className="mb-3 text-success fw-bold">
                🎉 All Steps Completed!
              </h4>
            ) : null}

            {renderFormFields()}

            <div className="d-grid">
              {selectedProcessDetails ? (
                <div className="alert alert-info d-flex align-items-center">
                  <i className="fas fa-info-circle me-2"></i>
                  You are viewing historical data. To make changes, select the current step.
                </div>
              ) : !allStepsCompleted ? (
                <Button
                  variant={submitted ? "success" : "primary"}
                  size="md"
                  onClick={handleEmailSubmit}
                  className="w-100 fw-semibold"
                  disabled={!formData.loc || isSubmitting || submitted}
                >
                  {isSubmitting ? "Submitting..." : submitted ? "Submitted" : "Submit"}
                </Button>
              ) : null}
            </div>
          </Form>
        </Col>

        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill w-50">
            <PreviousWaterUploadedDocs firstStep={firstStep} type="modify" />
          </div>
        </Col>
      </Row>

      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData.loc}
        applyDate={formData.applyDate}
        comments={formData.comments}
        reason={formData.reason}
  status={formData.status} 
      />

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
        showCancel={dialogConfig.showCancel}
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
        title="Upload Document Certificate"
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

export default WaterModifyTable;