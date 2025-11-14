


import React, { useEffect, useState, useRef, useContext } from "react";
import { Nav, Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL, API_BASE_URLS } from "../config/Config";
import PreviousUploadedDocsModal from "./PreviousUploadedDocsPanel";
import WaterDocUploadModal from "./WaterDocUploadModal";
import { getMasterByLoc } from "../api/Api";
import { Context } from "../context/ContextData";
import ReusableDialog from "./ReusableDialog";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { FaUpload } from "react-icons/fa";
import EmailSelectionModal from "./EmailSelectionModal";

const GhmcModify = () => {
  const { 
    storeData, 
    setStoreData, 
    respModifyData, 
    setRespModifyData, 
    setHeaderData, 
    headerData 
  } = useContext(Context);
  const [feasibilityDocs, setFeasibilityDocs] = useState([]);
   const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
  const [steps, setSteps] = useState([]);
  const [loc, setLoc] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [firstStep, setFirstStep] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [linkDocs, setLinkDocs] = useState([]);
  const [landDocs, setLandDocs] = useState([]);
  const [othDocs, setOthDocs] = useState([]);
  const [nextStepDetails, setNextStepDetails] = useState(null);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);

  
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    confirmText: 'OK',
    open: false
  });

  const [formData, setFormData] = useState({
    loc: "",
    applyDate: "",
    comments: "",
    noOfTowers: "",
    Organization: ""
  });

  console.log("Selected Plant:", selectedPlant);
  console.log("Form Data:", formData);
  console.log("Next Step Details:", nextStepDetails);
  console.log("Store Data:", storeData);
  
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
    axios
      .get(`${API_BASE_URLS}/get-loc`)
      .then((res) => {
        setLoc(res.data);
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);
console.log("loc",loc);
 
  useEffect(() => {
    if (selectedPlant) {
      console.log("Fetching GHMC data for plant:", selectedPlant);
      
      axios
        .get(`${API_BASE_URLS}/GHMC-data?plant=${selectedPlant}`)
        .then((res) => {
          console.log("GHMC data received:", res.data);
       setStoreData([ res.data]);

        })
        .catch((err) => console.error("Error fetching GHMC data:", err));
    } else {
      setStoreData([]);
    }
  }, [selectedPlant, setStoreData]);

  useEffect(() => {
    if ( storeData.length > 0) {
      console.log("Calculating next step...");
      
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.PROCESS);

      console.log("Completed processes:", completedProcesses);

      const nextStep = steps.find(
        (step) => !completedProcesses.includes(step.PROCESS)
      );

      if (nextStep) {
        const nextIndex = steps.indexOf(nextStep);
        console.log("Next step found:", nextStep.PROCESS, "at index:", nextIndex);
        setImmediateNextStep(nextStep);
        setImmediateNextStepIndex(nextIndex);
      } else {
        console.log("All steps completed");
        setImmediateNextStep(null);
        setImmediateNextStepIndex(-1);
      }
    } else if (storeData.length === 0 && selectedPlant) {
      // No data exists, start from first step
      console.log("No data exists, starting from first step");
      setImmediateNextStep(steps[0]);
      setImmediateNextStepIndex(0);
    }
  }, [steps, storeData, selectedPlant]);

  // Fetch next step details
  useEffect(() => {
    if (selectedPlant && steps.length > 0 && immediateNextStepIndex >= 0) {
      const nextStepName = steps[immediateNextStepIndex]?.PROCESS;
      
    

      if (nextStepName) {
        axios
          .get(
            `${API_BASE_URLS}/GHMC-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(nextStepName)}`
          )
          .then((res) => {
            console.log("Step details fetched:", res.data);
            setNextStepDetails(res.data);
          })
          .catch((err) => {
            console.error("Error fetching step details:", err);
            setNextStepDetails(null);
          });
      }
    } else {
      setNextStepDetails(null);
    }
  }, [selectedPlant, steps, immediateNextStepIndex]);

  
  useEffect(() => {
    console.log("Updating form with nextStepDetails:", nextStepDetails);
    
    if (nextStepDetails) {
      setFormData((prev) => ({
        ...prev,
        applyDate: nextStepDetails?.data?.applyDate || "",
        comments: nextStepDetails?.data?.Comments || "",
        noOfTowers: nextStepDetails?.data?.noOfTowers || "",
        Organization: nextStepDetails?.data?.Organization || ""
      }));
      setFirstStep(nextStepDetails);
    } else {
      if (selectedPlant) {
        setFormData((prev) => ({
          ...prev,
          applyDate: "",
          comments: "",
          noOfTowers: "",
          Organization: ""
        }));
        setFirstStep(null);
      }
    }
  }, [nextStepDetails, selectedPlant]);

  const handlePlantChange = (e) => {
    const { value } = e.target;
   
  
    setSelectedPlant(value);
    setFormData({
      loc: value,
      applyDate: "",
      comments: "",
      noOfTowers: "",
      Organization: ""
    });
    setSubmitted(false);
    setNextStepDetails(null);
    setFirstStep(null);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleConfirmSubmit = async (emails) => {


 
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("applyDate", formData.applyDate);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("comments", formData.comments || "");
    payload.append("noOfTowers", formData.noOfTowers || "0");
    payload.append("Organization", formData.Organization || "");

    feasibilityDocs.forEach(f => payload.append('feas_doc_name[]', f));
    
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });
   

    try {
      const existingRecord = storeData.find(
        (item) =>
          item.process === immediateNextStep.PROCESS &&
          item.loc === formData.loc
      );

      const apiUrl = existingRecord
        ? `${API_BASE_URLS}/GHMC-modify`
        : `${API_BASE_URLS}/ghmc-data-store`;

      console.log("Submitting to:", apiUrl);

      const res = await axios.post(apiUrl, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh GHMC data
      const refreshed = await axios.get(
        `${API_BASE_URLS}/GHMC-data?plant=${formData.loc}`
      );
      setStoreData(refreshed.data);

      // Update header data
      const master = await getMasterByLoc(formData.loc);
      if (master) {
        setHeaderData(master);
      }

      // Reset form
      const currentLoc = formData.loc;
      setFormData({
        loc: currentLoc,
        applyDate: "",
        comments: "",
        noOfTowers: "",
        Organization: ""
      });

      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);
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

  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        {/* Process Steps Sidebar */}
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h6 className="text-center mb-3">Process Steps</h6>
            <Nav variant="pills" className="flex-column">
              {steps.map((step, idx) => {
                let variant = "secondary";
                let clickable = false;
                let statusIcon = "⏸️";
                
                if (idx < immediateNextStepIndex) {
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
                      onClick={() => clickable && setActiveStep(idx)}
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

        {/* Main Form */}
        <Col md={6} className="d-flex flex-column" style={{ maxHeight: '360px', overflowY: 'auto' }}>
          <Form className="p-3 border rounded bg-light">
            {immediateNextStep && (
              <h4 className="mb-3 text-warning fw-bold">
                {immediateNextStep.PROCESS}
              </h4>
            )}
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Plant *</Form.Label>
                  <Form.Select
                    name="loc"
                    value={formData.loc || ""}
                    onChange={handlePlantChange}
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
                  <Form.Label>Apply Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="applyDate"
                    value={formData.applyDate || ""}
                    onChange={handleInputChange}
                    isInvalid={!!errors.applyDate}
                    disabled={!formData.loc}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.applyDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Organization</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="Organization"
                    value={formData.Organization || ""}
                    disabled={!formData.loc}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

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
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Number Of Towers</Form.Label>
                  <Form.Control
                    type="number"
                    name="noOfTowers"
                    value={formData.noOfTowers || ""}
                    disabled={!formData.loc}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

       <Col md={6}>
                        <Form.Label>Upload Documents</Form.Label>
                        <button
                          type="button"
                          className="upload-button"
                          onClick={() => setShowFeasibilityModal(true)}
                          disabled={!formData.loc}
                        >
                          <FaUpload className="upload-icon" /> Upload Document
                          <span className="upload-count">
                            {feasibilityDocs.length > 0 &&
                              `(${feasibilityDocs.length} files)`}
                          </span>
                        </button>
                      </Col>
            </Row>

            <div className="d-grid mt-3">
              <Button
                variant={submitted ? "success" : "primary"}
                size="lg"
                onClick={handleEmailSubmit}
                disabled={!formData.loc || isSubmitting || submitted}
              >
                {isSubmitting ? "Submitting..." : submitted ? "✓ Submitted" : "Submit"}
              </Button>
            </div>
          </Form>
        </Col>

        {/* Previous Documents Sidebar */}
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill">
            <PreviousUploadedDocsModal firstStep={firstStep} />
          </div>
        </Col>
      </Row>

      {/* Dialogs */}
      <ReusableDialog
        open={confirmOpen}
        title="Confirm Submission"
        message="Are you sure you want to submit this form?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText="Submit"
        isLoading={isSubmitting}
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
        title="Upload Document"
        showLandDocs={false}
        showOthDocs={false}
      />
    </>
  );
};

export default GhmcModify;