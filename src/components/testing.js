

import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../config/Config';
import { CheckCircle } from "lucide-react";
import WaterDocUploadModal from './WaterDocUploadModal';
import { FaTrashAlt } from 'react-icons/fa';
import ReusableDialog from './ReusableDialog'; // Missing import
import { toast } from 'react-toastify'; // Missing import

const WaterModifyTable = () => {
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [activeProcess, setActiveProcess] = useState(null);
  const [plants, setPlants] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [stepData, setStepData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [linkDocs, setLinkDocs] = useState([]);
  const [landDocs, setLandDocs] = useState([]);
  const [othDocs, setOthDocs] = useState([]);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [storeData, setStoreData] = useState([]);
  const [nextStepDetails, setNextStepDetails] = useState(null);
  const [firstStep, setFirstStep] = useState(null);
  const [nextSteps, setNextSteps] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [dialogConfig, setDialogConfig] = useState({ 
    title: '',
    message: '',
    confirmText: 'OK',
    showCancel: false,
    open: false
  });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/water-process`)
      .then(res => {
        setSteps(res.data);
        if (res.data.length > 0) setActiveStep(0);
      })
      .catch(err => console.error('Error fetching processes', err));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/water-plants`)
      .then(res => setPlants(res.data))
      .catch(err => console.error('Error fetching plants', err));
  }, []);

  useEffect(() => {
    if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
      const nextStepName = steps[immediateNextStepIndex]?.PROCESS;
      setNextSteps(nextStepName);

      if (nextStepName) {
        axios
          .get(
            `${API_BASE_URL}/water-step-details/${encodeURIComponent(
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
    console.log(nextStepDetails, "deeeeeeeeeeeeeee");
    if (nextStepDetails) {
      const details = nextStepDetails;
      console.log(details, "detailsssssssssssssss");

      // Only set form data without document fields
      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: details?.APPLY_DT || "",
        comments: details?.COMMENTS || "",
        Flats: details?.NO_OF_FLATS || "",
      }));

      // Clear document arrays for new process
      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);

      setFirstStep(details);
    } else {
      // Clear all data for new process
      setFormData((prevFormData) => ({
        ...prevFormData,
        applyDate: "",
        comments: "",
        Flats: "",
      }));

      // Clear document arrays
      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);

      setFirstStep(null);
    }
  }, [nextStepDetails]);

  useEffect(() => {
    if (selectedPlant) {
      axios.get(`${API_BASE_URL}/water-data?plant=${selectedPlant}`)
        .then(res => {
          setStepData(res.data);
          setStoreData(res.data);
          if (res.data.length > 0) {
            console.log(res.data, "plantttttttttttttttttttttttttttttttttt");

            setFormData(prev => ({
              ...prev,
              loc: selectedPlant,
              applyDate: "",
              comments: "",
              Flats: "",
            }));

            // Clear document arrays when plant changes
            setLinkDocs([]);
            setLandDocs([]);
            setOthDocs([]);

            findActiveStep(res.data);
          }
        })
        .catch(err => console.error('Error fetching step data', err));
    }
  }, [selectedPlant]);

  // Clear documents when active step changes
  useEffect(() => {
    setLinkDocs([]);
    setLandDocs([]);
    setOthDocs([]);
  }, [activeStep]);

  const findActiveStep = (data) => {
    console.log('hhhhhhiiiiiiiiiiiiiiiiiiiiii activeeeeeeeeeeeeeeeeeeeeeeee', data);
    for (let i = 0; i < data.length; i++) {
      if (data[i].UPDATED !== 'YES') {
        setActiveStep(i);
        return;
      }
    }
    console.log(data, "actriverrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
    setActiveProcess(data.PROCESS);
  };

  useEffect(() => {
    if (steps.length > 0 && storeData.length > 0) {
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.PROCESS);

      console.log(nextStepDetails, "complete it!!!!!!!!!!!!!!");

      const nextStep = steps.find(
        (step) => !completedProcesses.includes(step.PROCESS)
      );
      console.log(nextStep, "nextone!!!!!!!!!!!!!!!!!!!", steps);

      if (nextStep) {
        setImmediateNextStep(nextStep);
        setImmediateNextStepIndex(steps.indexOf(nextStep));
        console.log("Immediate Next Step from steps[]:", nextStep);

        // Clear documents when switching to next step
        setLinkDocs([]);
        setLandDocs([]);
        setOthDocs([]);
      } else {
        setImmediateNextStep(null);
      }
    }
  }, [steps, storeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'loc') {
      setSelectedPlant(value);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmitClick = () => {
    const newErrors = {};
    if (!formData.loc) newErrors.loc = "Plant selection is required";
    if (!formData.applyDate) newErrors.applyDate = "Apply date is required";
    if (!formData.Flats) newErrors.Flats = "Number of flats is required";
    if (linkDocs.length + landDocs.length + othDocs.length === 0) {
      newErrors.documents = "Please upload at least one document";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the validation errors");
      return;
    }

    setErrors({});
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    
    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("applyDate", formData.applyDate);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("noOfFlats", formData.Flats);
    payload.append("comments", formData.comments || "");

    linkDocs.forEach(f => payload.append("Plan_Doc[]", f));
    landDocs.forEach(f => payload.append("Title_Doc[]", f));
    othDocs.forEach(f => payload.append("Oth_Doc[]", f));

    try {
      const existingRecord = storeData.find(
        item => item.PROCESS?.trim().toLowerCase() === immediateNextStep.PROCESS?.trim().toLowerCase() &&
        item.LOC?.trim().toLowerCase() === formData.loc?.trim().toLowerCase()
      );

      const apiUrl = existingRecord
        ? `${API_BASE_URL}/water-modify`
        : `${API_BASE_URL}/water-submit`;

      await axios.post(apiUrl, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Show success in dialog instead of alert
      setDialogConfig({
        title: 'Success',
        message: 'Form submitted successfully!',
        confirmText: 'OK',
        showCancel: false,
        open: true
      });
      
      // Clear documents after successful submission
      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);

      // Refresh step data
      if (selectedPlant) {
        const res = await axios.get(`${API_BASE_URL}/water-data?plant=${selectedPlant}`);
        setStepData(res.data);
        setStoreData(res.data);
      }
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

  const isReadOnly = stepData[activeStep]?.UPDATED === "YES";

  const renderDocumentList = () => {
    // Only show documents for the current immediate next step
    if (!selectedPlant || !immediateNextStep || immediateNextStepIndex === -1) {
      return (
        <div className="border rounded p-3 bg-light" style={{ maxHeight: '320px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
          <strong className="d-block mb-3 text-dark">Previously Uploaded Files:</strong>
          <p className="text-muted mb-0">No files uploaded yet</p>
        </div>
      );
    }

    const currentStepData = storeData.find(
      item => item.PROCESS === immediateNextStep.PROCESS && item.LOC === selectedPlant
    );

    if (!currentStepData) {
      return (
        <div className="border rounded p-3 bg-light" style={{ maxHeight: '320px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
          <strong className="d-block mb-3 text-dark">Previously Uploaded Files:</strong>
          <p className="text-muted mb-0">No files uploaded yet</p>
        </div>
      );
    }

    const linkDocs = JSON.parse(currentStepData.PLAN_DOC_NAME || '[]');
    const linkPaths = JSON.parse(currentStepData.PLAN_DOC_PATH || '[]');
    const landDocs = JSON.parse(currentStepData.TITLE_DOC_NAME || '[]');
    const landPaths = JSON.parse(currentStepData.TITLE_DOC_PATH || '[]');
    const othDocs = JSON.parse(currentStepData.OTH_DOC_NAME || '[]');
    const othPaths = JSON.parse(currentStepData.OTH_DOC_PATH || '[]');

    const renderDocList = (title, names, paths, onDelete) =>
      names.length > 0 && (
        <div className="mb-3">
          <h6 className="text-primary">{title}</h6>
          <ul className="list-unstyled">
            {names.map((name, idx) => (
              <li key={idx} className="mb-1">
                <a
                  href={`${API_BASE_URL}/storage/${paths[idx]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none"
                  style={{ fontSize: '0.9rem' }}
                >
                  📄 {name}
                </a>
                <FaTrashAlt
                  style={{
                    color: 'red',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                  onClick={() => onDelete(title, idx)}
                />
              </li>
            ))}
          </ul>
        </div>
      );

    const handleDelete = (type, index) => {
      console.log(`Delete ${type} at index ${index}`);
    };

    return (
      <div
        className="border rounded p-3 bg-light"
        style={{
          maxHeight: '320px',
          overflowY: 'auto',
          scrollbarWidth: 'thin'
        }}
      >
        <strong className="d-block mb-3 text-dark">Previously Uploaded Files:</strong>
        {renderDocList('Plan Documents', linkDocs, linkPaths, handleDelete)}
        {renderDocList('Title Documents', landDocs, landPaths, handleDelete)}
        {renderDocList('Other Documents', othDocs, othPaths, handleDelete)}
        {linkDocs.length === 0 && landDocs.length === 0 && othDocs.length === 0 && (
          <p className="text-muted mb-0">No files uploaded yet</p>
        )}
      </div>
    );
  };

  return (
    <div className="rounded shadow-sm d-flex flex-column overflow-hidden">
      <Container fluid className="d-flex flex-column" style={{ overflowX: 'hidden' }}>
        <div
          className="bg-white rounded shadow-sm p-2 mb-2"
          style={{ flexShrink: 0 }}
        >
          <div className="d-flex justify-content-between align-items-center position-relative">
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '5%',
                right: '5%',
                height: '2px',
                backgroundColor: '#dee2e6',
                zIndex: 0,
              }}
            />

            {steps.map((step, idx) => {
              const completed = stepData[idx]?.UPDATED === 'YES';
              const isCurrentStep = idx === activeStep;
              const isNextStep = idx === immediateNextStepIndex;

              let backgroundColor = '#dee2e6';
              let borderColor = '#dee2e6';
              let textColor = '#6c757d';

              if (completed) {
                backgroundColor = '#28a745';
                borderColor = '#28a745';
                textColor = 'white';
              } else if (isNextStep) {
                backgroundColor = '#ffc107';
                borderColor = '#ffc107';
                textColor = 'white';
              }

              return (
                <div
                  key={idx}
                  className="text-center flex-fill position-relative"
                  style={{ cursor: completed || isCurrentStep || isNextStep ? 'pointer' : 'not-allowed', zIndex: 1 }}
                  onClick={() => (completed || isCurrentStep || isNextStep) && setActiveStep(idx)}
                  title={step.PROCESS}
                >
                  <div
                    className="mx-auto mb-2"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: backgroundColor,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: textColor,
                      fontWeight: 'bold',
                      border: `3px solid ${borderColor}`,
                      transition: 'all 0.3s ease',
                      boxShadow: isCurrentStep ? '0 0 0 3px rgba(0,123,255,0.25)' :
                        isNextStep ? '0 0 0 3px rgba(255,193,7,0.25)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (completed || isCurrentStep || isNextStep) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow =
                        isCurrentStep ? '0 0 0 3px rgba(0,123,255,0.25)' :
                          isNextStep ? '0 0 0 3px rgba(255,193,7,0.25)' : 'none';
                    }}
                  >
                    {completed ? <CheckCircle size={20} /> : idx + 1}
                  </div>
                  <small
                    className={`${isCurrentStep ? 'fw-bold text-secondary' :
                      isNextStep ? 'fw-bold text-warning' :
                        completed ? 'text-success' : 'text-muted'}`}
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      lineHeight: '1.2'
                    }}
                  >
                    {step.PROCESS.length > 12 ? `${step.PROCESS.slice(0, 12)}...` : step.PROCESS}
                  </small>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-grow-1 d-flex flex-column">
          <div className="row g-1 mx-0">
            <Col lg={6} className="d-flex flex-column">
              <div
                className="bg-white rounded shadow-sm p-2 d-flex flex-column"
                style={{ overflow: 'hidden' }}
              >
                <h5 className="mb-2 border-bottom pb-2">
                  <span className="text-secondary">Process Details</span>
                  {nextSteps && (
                    <span style={{ color: '#ffc107' }}> --- {nextSteps}</span>
                  )}
                </h5>

                <div
                  className="flex-grow-1"
                  style={{
                    overflowY: 'auto',
                    scrollbarWidth: 'thin'
                  }}
                >
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="px-2">
                          <Form.Label className="fw-semibold">Plant</Form.Label>
                          <Form.Select
                            name="loc"
                            value={formData.loc || ''}
                            onChange={handleChange}
                            isInvalid={!!errors.loc}
                          >
                            <option value="">Select Plant</option>
                            {plants.map((p, idx) => (
                              <option key={idx} value={p.loc}>{p.loc}</option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.loc}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="">
                          <Form.Label className="fw-semibold">Apply Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="applyDate"
                            value={formData.applyDate || ''}
                            onChange={handleChange}
                            isInvalid={!!errors.applyDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.applyDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className='px-2'>
                      <Form.Label className="fw-semibold">Upload Documents</Form.Label>
                      <button type="button" className="btn form-control" onClick={() => setShowModal(true)}>
                        Upload Documents
                      </button>
                      {errors.documents && (
                        <div className="text-danger small">{errors.documents}</div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-2 px-2">
                      <Form.Label className="fw-semibold">Number of Flats</Form.Label>
                      <Form.Control
                        type="number"
                        name="Flats"
                        value={formData.Flats || ''}
                        onChange={handleChange}
                        placeholder="Enter total number of flats"
                        isInvalid={!!errors.Flats}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.Flats}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold">Comments</Form.Label>
                      <Form.Control
                        type="text"
                        name="comments"
                        value={formData.comments || ''}
                        onChange={handleChange}
                        placeholder="Enter your comments here..."
                      />
                    </Form.Group>
                  </Form>

                  <div
                    className="bg-white p-3 border-top"
                    style={{
                      position: "sticky",
                      bottom: 0,
                      zIndex: 10,
                    }}
                  >
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSubmitClick}
                      className="w-100 fw-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
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
                      onClose={() => setDialogConfig({...dialogConfig, open: false})}
                      onConfirm={() => setDialogConfig({...dialogConfig, open: false})}
                      confirmText={dialogConfig.confirmText}
                      showCancel={dialogConfig.showCancel}
                    />
                  </div>
                </div>

                <WaterDocUploadModal
                  show={showModal}
                  onClose={() => setShowModal(false)}
                  linkDocs={linkDocs}
                  setLinkDocs={setLinkDocs}
                  landDocs={landDocs}
                  setLandDocs={setLandDocs}
                  othDocs={othDocs}
                  setOthDocs={setOthDocs}
                />
              </div>
            </Col>
            <Col lg={6} className="d-flex flex-column">
              <div
                className="bg-white rounded shadow-sm p-4 d-flex flex-column overflow-hidden"
                style={{ height: '100%' }}
              >
                <h5 className="mb-4 text-primary border-bottom pb-2">
                  Document History
                </h5>

                <div
                  className="flex-grow-1"
                  style={{
                    scrollbarWidth: 'thin'
                  }}
                >
                  {renderDocumentList()}
                </div>
              </div>
            </Col>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default WaterModifyTable;