



import React, { useEffect, useState, useRef, useContext } from "react";
import { Nav, Form, Button, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../config/Config";
import Swal from "sweetalert2";
import FormHeader from "./Header";
import PreviousUploadedDocsModal from "./PreviousUploadedDocsPanel";
import WaterDocUploadModal from "./WaterDocUploadModal";
import { FaCheckCircle, FaTrashAlt, FaUpload } from "react-icons/fa";
import { fetchWaterDataByPlant, getMasterByLoc } from "../api/Api";
import { Context } from "../context/ContextData";
import ReusableDialog from "./ReusableDialog";
import { toast } from "react-toastify";
import { Home } from "lucide-react";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { Send } from "react-bootstrap-icons";
import EmailSelectionModal from "./EmailModal";


const WaterUpdateTable = () => {
  const { storeData, setStoreData, plants, totalMasterData, headerData, setHeaderData } = useContext(Context);

  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
  const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loc, setLoc] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    confirmText: 'OK',
    showCancel: false,
    open: false
  });
  const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);

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
    const [allStepsCompleted, setAllStepsCompleted] = useState(false);



  const handleEmailSubmit = () => {
    const newErrors = {};
    if (!formData.loc) newErrors.loc = "Plant selection is required";
    if (!formData.applyDate) newErrors.applyDate = "Apply date is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setShowEmailModal(true);
  };

  // Handle email selection and form submission
  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);
    
    // Proceed with form submission
    await handleConfirmSubmit(emails);
  };






  // Fetch locations
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/water-plants`)
      .then((res) => {
        setLoc(res.data);
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  // Check if it's the first process
  useEffect(() => {
    if (immediateNextStepIndex === 0) {
      setIsFirstProcess(true);
    } else {
      setIsFirstProcess(false);
    }
  }, [immediateNextStepIndex]);

  // Fetch steps
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

  useEffect(() => {
    if (steps.length > 0 && storeData.length > 0) {
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.PROCESS);

      const nextStep = steps.find(
        (step) => !completedProcesses.includes(step.PROCESS)
      );

       const allCompleted = steps.every(step =>
        completedProcesses.includes(step.PROCESS?.trim())
      );
         setAllStepsCompleted(allCompleted);
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
    if (nextStepDetails && !selectedProcessDetails) {
      let details = nextStepDetails;
      console.log(details, "details");

      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: details.APPLY_DT,
        status: details.STATUS || "",
        reason: details.REASON || "",
        comments: details.COMMENTS || "",
        noOfFlats: details?.NUMBER_OF_FLATS || "",
        KLD: details?.KLD || "",
        amountPaid: details?.AMOUNT_PAID || "",
        Ghmc: details?.GHMC || "",
        OldAmount: details?.OLD_AMOUNT || "",
        Size: details?.Size_Of_Connection || "",
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
        status: "",
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
        noOfTowers: ""
      }));
      setFirstStep(null);
    }
  }, [nextStepDetails, selectedProcessDetails]);

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

  // Fixed handleProcessClick function
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

  // Fixed useEffect for selectedProcessDetails
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
        Size: selectedProcessDetails.Size_Of_Connection || "",
        TotalAmount: selectedProcessDetails.TOTAL_AMOUNT || "",
        TotalProjectArea: selectedProcessDetails?.TOTAL_PROJECT_AREA || '',
        noOfTowers: selectedProcessDetails?.NUMBER_OF_TOWERS || '',
        ProjectBuildArea: selectedProcessDetails?.PROJECT_BUILD_AREA || ''
      }));

      setFirstStep(selectedProcessDetails);
      setSubmitted(false);
    }
  }, [selectedProcessDetails, selectedPlant]);

  const hasFieldData = (fieldValue) => {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== "" && fieldValue !== 0;
  };

  const renderFormFields = () => {

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
    if (!selectedProcessDetails) {
      return renderNextStepForm();
    }

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
              value={formData.loc || ""}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Apply Date</Form.Label>
            <Form.Control
              type="date"
              disabled
              value={formData.applyDate || ""}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>
    );

    // Determine which fields to show based on the specific process
    const processName = process.PROCESS?.toLowerCase()?.trim();
    console.log("Process Name:", processName, "Process Data:", process);

    // Application Filling process fields
    if (processName === "application filling") {
      console.log("Showing Application Filling fields");

      if (hasFieldData(process.NO_OF_FLATS) || hasFieldData(process.KLD) || hasFieldData(process.AMOUNT_PAID)) {
        fields.push(
          <Row key="application-fields" className="mb-3">
            {hasFieldData(process.NO_OF_FLATS) && (
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Number of Flats</Form.Label>
                  <Form.Control
                    type="number"
                    disabled
                    value={process.NO_OF_FLATS || ""}
                    readOnly
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
                  <Form.Label>Remaning Paid</Form.Label>
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
              <Col className="m-6" md={4}>
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
              <Col md={4}>
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
              <Col md={4}>
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

      // Show comments for Application Filling if available
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
                />
              </Form.Group>
            </Col>
          </Row>
        );
      }
    }
    // Applied For Water Release process fields  
    else if (processName === "applied for water release") {
      console.log("Showing Applied for Water Release fields");

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
      console.log("Showing Community Inspection fields");

      if (hasFieldData(process.Size_Of_Connection)) {
        fields.push(
          <Row key="size" className="mb-2">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Size Of Connection</Form.Label>
                <Form.Control
                  type="number"
                  value={process.Size_Of_Connection || ""}
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
      console.log("Showing other process fields");

      // Show GHMC field if it has data
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

      // Show any other process specific fields
      if (hasFieldData(process.Size_Of_Connection)) {
        fields.push(
          <Row key="size" className="mb-2">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Size Of Connection</Form.Label>
                <Form.Control
                  type="number"
                  value={process.Size_Of_Connection || ""}
                  readOnly
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>
        );
      }
    }

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

  const renderNextStepForm = () => {
    const fields = [];

    // Basic info
    fields.push(
      <Row key="basic" className="mb-2">
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
              isInvalid={!!errors.applyDate}
              disabled
            />
            <Form.Control.Feedback type="invalid">
              {errors.applyDate}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    );

    // Process-specific fields based on step
    if (!isFirstProcess) {
      if (immediateNextStepIndex === 1) {
        fields.push(
          <Row key="amounts" className="mb-2">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Remaining Paid</Form.Label>
                <Form.Control
                  type="number"
                  name="OldAmount"
                  value={formData.OldAmount || ""}
                  onChange={handleChange}
                  isInvalid={!!errors.loc}
                  disabled
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
                  disabled
                  isInvalid={!!errors.loc}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.TotalAmount}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        );
      }

      if (immediateNextStepIndex === 3) {
        fields.push(
          <Row key="size" className="mb-2">
            <Form.Group>
              <Form.Label>Size Of Connection</Form.Label>
              <Form.Control
                type="number"
                name="Size"
                value={formData.Size || ""}
                onChange={handleChange}
                disabled
                isInvalid={!!errors.loc}
              />
              <Form.Control.Feedback type="invalid">
                {errors.Size}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>
        );
      }
    }

    // Status-based fields
    if (formData.status === "YES") {
      fields.push(
        <Row key="comments" className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="comments"
                value={formData.comments || ""}
                disabled
                isInvalid={!!errors.loc}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
      );
    }

    if (formData.status === "NO") {
      fields.push(
        <Row key="reason" className="mb-2">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="reason"
                value={formData.reason || ""}
                disabled
                isInvalid={!!errors.loc}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
      );
    }

    // First process specific fields
    if (isFirstProcess) {
      fields.push(
        <Row key="flats-info" className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Number of Flats</Form.Label>
              <Form.Control
                type="number"
                name="noOfFlats"
                value={formData.noOfFlats || ""}
                disabled
                isInvalid={!!errors.loc}
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
                disabled
                isInvalid={!!errors.loc}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Remaining Paid</Form.Label>
              <Form.Control
                type="number"
                name="amountPaid"
                value={formData.amountPaid || ""}
                disabled
                isInvalid={!!errors.loc}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Total Project Area</Form.Label>
              <Form.Control
                type="number"
                name="TotalProjectArea"
                value={formData.TotalProjectArea || ""}
                disabled
                isInvalid={!!errors.loc}
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
                disabled
                isInvalid={!!errors.loc}
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
                disabled
                isInvalid={!!errors.loc}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
      );
    }

    return fields;
  };

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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

 


  const handleConfirmSubmit = async (emails) => {
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("applyDate", formData.applyDate);
    payload.append("STATUS", formData.status);
    payload.append("REASON", formData.reason || "");
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("comments", formData.comments || "");
    payload.append("GHMC", formData.Ghmc || "");
    payload.append("OldAmount", formData.OldAmount || "");
    payload.append("Size_Of_Connection", formData.Size || "");
    payload.append("TotalAmount", formData.TotalAmount || "");
    
    linkDocs.forEach(f => payload.append("Plan_Doc[]", f));
    landDocs.forEach(f => payload.append("Title_Doc[]", f));
    othDocs.forEach(f => payload.append("Oth_Doc[]", f));
    
    // Add selected emails to payload
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    if (isFirstProcess) {
      payload.append("noOfFlats", formData.noOfFlats || "");
      payload.append("KLD", formData.KLD || "");
      payload.append("amountPaid", formData.amountPaid || "");
      payload.append('FeasibilityDoc', formData.feasibilityDoc);
      payload.append('AmountPaidDoc', formData.AmountPaidDoc);
      feasibilityDocs.forEach(f => payload.append('FEAS_DOC[]', f));
      AmountPaidDocs.forEach(f => payload.append('AMOUNT_PAID_DOC[]', f));
    }

    try {
      const result = await axios.post(`${API_BASE_URL}/water-update`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('✅ Form submitted successfully:', result.data);

      const res = await axios.get(
        `${API_BASE_URL}/water-data?plant=${selectedPlant}`
      );
      setStoreData(res.data);

      setFormData({
        loc: selectedPlant,
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

      // Clear ALL document arrays
      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);
      setFeasibilityDocs([]);
      setAmountPaidDocs([]);
      setSelectedEmails([]);

      setFirstStep(null);
      setNextStepDetails(null);
      setSelectedProcessDetails(null);
      setSubmitted(true);

      setDialogConfig({
        title: 'Success',
        message: result.data.emailSent 
          ? `Form submitted successfully! Emails sent to ${selectedEmails.length} recipient(s).`
          : 'Form submitted successfully!',
        confirmText: 'OK',
        showCancel: false,
        open: true
      });

    } catch (err) {
      console.error("❌ Submission failed:", err);
      setDialogConfig({
        title: 'Error',
        message: err.response?.data?.message || 'Submission failed. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        open: true
      });
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
    }
  };

  // Function to switch back to next step view
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

                // Check if this step is completed
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
                Next Step: {immediateNextStep.PROCESS}
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
          <div className="border rounded p-3 bg-white flex-fill  w-50">
            <PreviousUploadedDocsModal firstStep={firstStep} />
          </div>
        </Col>
      </Row>

      {/* Email Selection Modal */}
      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
         onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData.loc}
        applyDate={formData.applyDate}
        comments={formData.comments}
      />

      {/* Confirmation Dialog */}
      <ReusableDialog
        open={confirmOpen}
        title="Confirm Submission"
        message={`Are you sure you want to submit this form and send emails to ${selectedEmails.length} recipient(s)? This action cannot be undone.`}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText="Submit"
        isLoading={isSubmitting}
      />

      {/* Success/Error Dialog */}
      <ReusableDialog
        open={dialogConfig.open}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onClose={() => setDialogConfig({ ...dialogConfig, open: false })}
        onConfirm={() => setDialogConfig({ ...dialogConfig, open: false })}
        confirmText={dialogConfig.confirmText}
        showCancel={dialogConfig.showCancel}
      />

      {/* Document Upload Modals */}
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

export default WaterUpdateTable;
