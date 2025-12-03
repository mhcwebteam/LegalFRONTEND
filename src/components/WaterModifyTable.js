

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
import ProjectInfoHeader from "./ProjectInfoHeader";
import EmailSelectionModal from "./EmailModal";


const WaterModifyTable = () => {

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
  const [loc, setLoc] = useState([]);


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
    if (nextStepDetails) {
      let details = nextStepDetails;

      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: details?.APPLY_DT,
        status: details?.STATUS || "",
        reason: details?.REASON || "",
        comments: details?.COMMENTS || "",
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
    } else {
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
        noOfTowers: "",
        TotalProjectArea: ""
      }));
      setFirstStep(null);
    }
  }, [nextStepDetails]);

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

  const handleConfirmSubmit = async (emails) => {
    setIsSubmitting(true);

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
    
    linkDocs.forEach(f => payload.append("Plan_Doc[]", f));
    landDocs.forEach(f => payload.append("Title_Doc[]", f));
    othDocs.forEach(f => payload.append("Oth_Doc[]", f));
    
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    if (isFirstProcess) {
      payload.append("noOfFlats", formData.noOfFlats || "");
      payload.append("KLD", formData.KLD || "");
      payload.append("amountPaid", formData.amountPaid || "");
      payload.append("noOfTowers", formData.noOfTowers || 0);
      feasibilityDocs.forEach(f => payload.append('FEAS_DOC[]', f));
      AmountPaidDocs.forEach(f => payload.append('AMOUNT_PAID_DOC[]', f));
    }

    try {
      const existingRecord = storeData.find(
        (item) =>
          item.PROCESS?.trim().toLowerCase() ===
          immediateNextStep.PROCESS?.trim().toLowerCase() &&
          item.LOC?.trim().toLowerCase() === formData.loc?.trim().toLowerCase()
      );

      const apiUrl = existingRecord
        ? `${API_BASE_URL}/water-modify`
        : `${API_BASE_URL}/water-submit`;

      const res = await axios.post(apiUrl, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const refreshed = await axios.get(
        `${API_BASE_URL}/water-data?plant=${formData.loc}`
      );
      setStoreData(refreshed.data);

      const master = await getMasterByLoc(formData.loc);
      if (master) {
        setHeaderData(master);
      }

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
        noOfTowers: "",
        ProjectBuildArea: "",
        TotalProjectArea: ""
      });

      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);
      setFeasibilityDocs([]);
      setAmountPaidDocs([]);
      setFirstStep(null);
      setNextStepDetails(null);
      setSubmitted(true);
      setRespModifyData(res?.data?.data);

      setDialogConfig({
        title: 'Success',
        message: 'Form submitted successfully!',
        confirmText: 'OK',
        open: true
      });

    } catch (err) {
      console.error("Submission failed:", err);
      setDialogConfig({
        title: 'Error',
        message: 'Submission failed. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        open: true
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
                      <span>{step.PROCESS}</span>
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
          style={{ height: '350px', overflowY: 'auto' }}

        >
             {allStepsCompleted  ? (
            renderCompletionMessage()
          ) : (
          <Form className="p-3 border rounded bg-light ">
            {immediateNextStep && (
              <h4 className="mb-3 text-warning fw-bold">
                {immediateNextStep.PROCESS}
              </h4>
            )}
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
                    isInvalid={!!errors.applyDate}
                    disabled={!formData.loc}
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

            {formData.status === "YES" && (
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Comments</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="comments"
                      value={formData.comments || ""}
                      disabled={!formData.loc}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {formData.status === "NO" && (
              <Row className="mb-2">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Reason</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="reason"
                      value={formData.reason || ""}
                      disabled={!formData.loc}
                      onChange={handleChange}
                    />
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

            {isFirstProcess && (
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Amount Paid Document</Form.Label>
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => setAmountPaidDocModal(true)}
                    disabled={!formData.loc}
                  >
                    <FaUpload className="upload-icon" /> Upload Paid Documents
                    <span className="upload-count">
                      {AmountPaidDocs.length > 0 &&
                        `(${AmountPaidDocs.length} files)`}
                    </span>
                  </button>
                </Col>
                <Col md={6}>
                  <Form.Label>Feasibility Documents</Form.Label>
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => setShowFeasibilityModal(true)}
                    disabled={!formData.loc}
                  >
                    <FaUpload className="upload-icon" /> Upload Feasibility
                    <span className="upload-count">
                      {feasibilityDocs.length > 0 &&
                        `(${feasibilityDocs.length} files)`}
                    </span>
                  </button>
                </Col>
              </Row>
            )}

            <Col className="mb-2" md={6}>
              <Form.Label>Upload Documents</Form.Label>
              <button
                type="button"
                className="btn btn-outline-secondary form-control"
                onClick={() => setShowUploadModal(true)}
                disabled={!formData.loc}
              >
                Upload Docs
              </button>
            </Col>

            <div className="d-grid">
              <Button
                variant={submitted ? "success" : "primary"}
                size="md"
                onClick={handleEmailSubmit}
                className="w-100 fw-semibold"
                disabled={!formData.loc || isSubmitting || submitted}
              >
                {isSubmitting ? "Submitting..." : submitted ? "Submitted" : "Submit"}
              </Button>
            </div>
          </Form>

             )}
        </Col>

        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill w-50">
            <PreviousUploadedDocsModal firstStep={firstStep} />
          </div>
        </Col>
      </Row>

      {/* Reusable Email Selection Modal */}
      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData.loc}
        applyDate={formData.applyDate}
        comments={formData.comments}
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

export default WaterModifyTable;