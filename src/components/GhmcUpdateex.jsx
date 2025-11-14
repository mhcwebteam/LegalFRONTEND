
// import React, { useEffect, useState, useRef, useContext } from "react";
// import { Nav, Form, Button, Row, Col, Alert } from "react-bootstrap";
// import axios from "axios";
// import { API_BASE_URL, API_BASE_URLS } from "../config/Config";
// import Swal from "sweetalert2";
// import FormHeader from "./Header";
// import PreviousUploadedDocsModal from "./PreviousUploadedDocsPanel";
// import WaterDocUploadModal from "./WaterDocUploadModal";
// import { FaTrashAlt, FaUpload, FaCheckCircle } from "react-icons/fa";
// import { fetchWaterDataByPlant, getMasterByLoc } from "../api/Api";
// import { Context } from "../context/ContextData";
// import ReusableDialog from "./ReusableDialog";
// import { toast } from "react-toastify";
// import { Home } from "lucide-react";
// import ProjectInfoHeader from "./ProjectInfoHeader";

// const GhmcUpdate = () => {
//   const { storeData, setStoreData, plants, totalMasterData, headerData, setHeaderData } = useContext(Context);

//   const [steps, setSteps] = useState([]);
//   const [activeStep, setActiveStep] = useState(0);
//   const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
//   const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [submitted, setSubmitted] = useState(false);
//   const [loc, setLoc] = useState([]);
//   const [organizationType, setOrganizationType] = useState("");
//   const [dialogConfig, setDialogConfig] = useState({
//     title: '',
//     message: '',
//     confirmText: 'OK',
//     showCancel: false,
//     open: false
//   });
//   const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);
//   const [allStepsCompleted, setAllStepsCompleted] = useState(false);

//   console.log("Selected Process Details:", selectedProcessDetails);

//   const [formData, setFormData] = useState({
//     loc: "",
//     applyDate: "",
//     comments: "",
//     noOfTowers: "",
//     Organization: ""
//   });

//   const [feasibilityDocs, setFeasibilityDocs] = useState([]);
//   const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [selectedPlant, setSelectedPlant] = useState("");
//   const [firstStep, setFirstStep] = useState(null);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [linkDocs, setLinkDocs] = useState([]);
//   const [landDocs, setLandDocs] = useState([]);
//   const [othDocs, setOthDocs] = useState([]);
//   const fileInputRef = useRef(null);
//   const [nextStepDetails, setNextStepDetails] = useState(null);
//   const [immediateNextStep, setImmediateNextStep] = useState(null);
//   const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
//   const [isFirstProcess, setIsFirstProcess] = useState(true);
//   const safeStoreData = Array.isArray(storeData) ? storeData : [];

//   console.log(safeStoreData, "safe it,..........");

//   // Check if all steps are completed
//   useEffect(() => {
//     if (steps.length > 0 && storeData.length > 0) {
//       const completedProcesses = storeData
//         .filter((item) => item.UPDATED === "YES")
//         .map((item) => item.process?.trim().toLowerCase());

//       const allCompleted = steps.every(step => 
//         completedProcesses.includes(step.PROCESS?.trim().toLowerCase())
//       );

//       setAllStepsCompleted(allCompleted);
//     } else {
//       setAllStepsCompleted(false);
//     }
//   }, [steps, storeData]);

//   useEffect(() => {
//     if (immediateNextStepIndex === 0) {
//       setIsFirstProcess(true);
//     } else {
//       setIsFirstProcess(false);
//     }
//   }, [immediateNextStepIndex]);

//   useEffect(() => {
//     axios
//       .get(`${API_BASE_URLS}/get-loc`)
//       .then((res) => {
//         setLoc(res.data);
//       })
//       .catch((err) => console.error("Error fetching locations:", err));
//   }, []);

//   useEffect(() => {
//     if (selectedPlant && steps.length > 0 && immediateNextStepIndex >= 0) {
//       const nextStepName = steps[immediateNextStepIndex]?.PROCESS;

//       console.log("Fetching step details:", nextStepName, "for plant:", selectedPlant);

//       if (nextStepName) {
//         axios
//           .get(
//             `${API_BASE_URLS}/GHMC-step-details/${encodeURIComponent(
//               selectedPlant
//             )}/${encodeURIComponent(nextStepName)}`
//           )
//           .then((res) => {
//             console.log("Step details fetched:", res.data);
//             setNextStepDetails(res.data);
//           })
//           .catch((err) => {
//             console.error("Error fetching step details:", err);
//             setNextStepDetails(null);
//           });
//       }
//     } else {
//       setNextStepDetails(null);
//     }
//   }, [selectedPlant, steps, immediateNextStepIndex]);

//   useEffect(() => {
//     if (steps.length > 0 && storeData.length > 0) {
//       const completedProcesses = storeData
//         .filter((item) => item.UPDATED === "YES")
//         .map((item) => item.process);

//       const nextStep = steps.find(
//         (step) => !completedProcesses.includes(step.PROCESS)
//       );

//       if (nextStep) {
//         setImmediateNextStep(nextStep);
//         setImmediateNextStepIndex(steps.indexOf(nextStep));
//       } else {
//         setImmediateNextStep(null);
//         setImmediateNextStepIndex(-1);
//       }
//     }
//   }, [steps, storeData]);

//   // Update form data based on whether viewing completed process or next step
//   useEffect(() => {
//     if (selectedProcessDetails) {
//       // Viewing a completed process - show its data as read-only
//       console.log("Setting form data from selectedProcessDetails:", selectedProcessDetails);
//       setFormData((prev) => ({
//         ...prev,
//         loc: selectedProcessDetails?.loc || selectedPlant || "",
//         applyDate: selectedProcessDetails?.applyDate || "",
//         comments: selectedProcessDetails?.Comments || "",
//         noOfTowers: selectedProcessDetails?.noOfTowers || "",
//         Organization: selectedProcessDetails?.Organization || ""
//       }));
//       setFirstStep(selectedProcessDetails);
//     } else if (nextStepDetails) {
//       // Viewing next step - show editable form
//       console.log("Setting form data from nextStepDetails:", nextStepDetails);
//       setFormData((prev) => ({
//         ...prev,
//         loc: selectedPlant || "",
//         applyDate: nextStepDetails?.data?.applyDate || "",
//         comments: nextStepDetails?.data?.Comments || "",
//         noOfTowers: nextStepDetails?.data?.noOfTowers || "",
//         Organization: nextStepDetails?.data?.Organization || ""
//       }));
//       setFirstStep(nextStepDetails);
//     } else {
//       if (selectedPlant) {
//         setFormData((prev) => ({
//           ...prev,
//           loc: selectedPlant,
//           applyDate: "",
//           comments: "",
//           noOfTowers: "",
//           Organization: ""
//         }));
//         setFirstStep(null);
//       }
//     }
//   }, [nextStepDetails, selectedProcessDetails, selectedPlant]);

//   useEffect(() => {
//     if (selectedPlant) {
//       axios
//         .get(`${API_BASE_URLS}/GHMC-data?plant=${selectedPlant}`)
//         .then((res) => {
//           setSteps(res.data.processes);

//           console.log(res?.data?.plantData, "plamttttttttttt");
//           setStoreData(res.data.plantData);

//           const plantRecord = res.data.plantData.find(
//             (item) => item.loc === selectedPlant
//           );

//           if (plantRecord && plantRecord.Organization) {
//             setOrganizationType(plantRecord.Organization);
//           } else {
//             setOrganizationType(res.data.plantData[0].Organization || "GHMC");
//           }
//         })
//         .catch((err) => {
//           console.error("Error fetching GHMC data:", err);
//           setStoreData([]);
//         });
//     } else {
//       setStoreData([]);
//     }
//   }, [selectedPlant, setStoreData]);

//   useEffect(() => {
//     if (steps.length > 0 && storeData.length > 0) {
//       const completedProcesses = storeData
//         .filter((item) => item.UPDATED === "YES")
//         .map((item) => item.process?.trim().toLowerCase());

//       console.log("Steps:", steps);
//       console.log("Completed Processes:", completedProcesses);

//       const lastCompletedIndex = steps.findIndex(
//         (step) =>
//           step.PROCESS?.trim().toLowerCase() ===
//           completedProcesses[completedProcesses.length - 1]
//       );

//       const nextIndex = lastCompletedIndex + 1;

//       if (nextIndex < steps.length) {
//         const nextStep = steps[nextIndex];
//         console.log("✅ Next step found:", nextStep.PROCESS, "at index:", nextIndex);
//         setImmediateNextStep(nextStep);
//         setImmediateNextStepIndex(nextIndex);
//       } else {
//         console.log("✅ All steps completed");
//         setImmediateNextStep(null);
//         setImmediateNextStepIndex(-1);
//       }
//     }
//     else if (steps.length > 0 && storeData.length === 0 && selectedPlant) {
//       console.log("No data exists, starting from first step");
//       setImmediateNextStep(steps[0]);
//       setImmediateNextStepIndex(0);
//     }
//   }, [steps, storeData, selectedPlant]);

//   const handleProcessClick = (e, process) => {
//     e.stopPropagation();
//     console.log(process, "clicked process");

//     const processDetails = storeData.find(
//       (item) => item.process?.toLowerCase().trim() === process.toLowerCase().trim()
//     );

//     if (!processDetails) {
//       console.log("⚠️ No data found for this process yet.");
//       setSelectedProcessDetails(null);
//       setNextStepDetails(null);
//       setFirstStep(null);
//       return;
//     }

//     console.log(processDetails, "👉 selected process details");

//     if (processDetails.UPDATED === "YES") {
//       setSelectedProcessDetails(processDetails);
//       setNextStepDetails(null);
//       setFirstStep(processDetails);
//     } else {
//       setSelectedProcessDetails(null);
//       setNextStepDetails(null);
//       setFirstStep(null);
//     }
//   };

//   const renderCompletionMessage = () => {
//     return (
//       <div className="text-center py-5">
//         <FaCheckCircle size={64} className="text-success mb-3" />
//         <h3 className="text-success mb-3">Congratulations! 🎉</h3>
//         <h5 className="text-muted mb-4">All process steps have been completed successfully!</h5>
//         <Alert variant="success" className="mx-auto" style={{ maxWidth: '500px' }}>
//           <Alert.Heading>Project Completion Status</Alert.Heading>
//           <p>
//             All {steps.length} steps for <strong>{selectedPlant}</strong> have been completed. 
//             You can review any step by clicking on it in the process list.
//           </p>
//           <hr />
//           <p className="mb-0">
//             The project is now ready for the next phase or final approval.
//           </p>
//         </Alert>
//       </div>
//     );
//   };

//   const renderFormFields = () => {
//     if (allStepsCompleted && !selectedProcessDetails) {
//       return renderCompletionMessage();
//     }

//     if (!selectedProcessDetails) {
//       return renderNextStepForm();
//     }

//     console.log("Rendering completed step details:", selectedProcessDetails);
//     const fields = [];

//     fields.push(
//       <Row key="basic" className="mb-2">
//         <Col md={6}>
//           <Form.Group>
//             <Form.Label>Plant</Form.Label>
//             <Form.Control
//               type="text"
//               value={selectedProcessDetails.loc || ""}
//               readOnly
//               disabled
//             />
//           </Form.Group>
//         </Col>

//         <Col md={6}>
//           <Form.Group>
//             <Form.Label>Apply Date</Form.Label>
//             <Form.Control
//               type="date"
//               value={selectedProcessDetails.applyDate || ""}
//               readOnly
//               disabled
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//     );

//     fields.push(
//       <Row key="comments" className="mb-2">
//         <Col md={12}>
//           <Form.Group>
//             <Form.Label>Comments</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={2}
//               value={selectedProcessDetails.Comments || ""}
//               readOnly
//               disabled
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//     );

//     return fields;
//   };

//   const renderNextStepForm = () => {
//     const fields = [];

//     fields.push(
//       <Row key="basic" className="mb-2">
//         <Col md={6}>
//           <Form.Group>
//             <Form.Label>Plant</Form.Label>
//             <Form.Select
//               name="loc"
//               value={formData.loc || ""}
//               onChange={handleChange}
//               isInvalid={!!errors.loc}
//             >
//               <option value="">Select Plant</option>
//               {loc.map((ele, index) => (
//                 <option key={index} value={ele.loc}>
//                   {ele.loc}
//                 </option>
//               ))}
//             </Form.Select>
//             <Form.Control.Feedback type="invalid">
//               {errors.loc}
//             </Form.Control.Feedback>
//           </Form.Group>
//         </Col>
//         <Col md={6}>
//           <Form.Group>
//             <Form.Label>Apply Date</Form.Label>
//             <Form.Control
//               type="date"
//               name="applyDate"
//               value={formData.applyDate || ""}
//               onChange={handleChange}
//               readOnly
//               disabled={!formData.loc}
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//     );

//     fields.push(
//       <Row key="comments" className="mb-2">
//         <Col md={12}>
//           <Form.Group>
//             <Form.Label>Comments</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={2}
//               name="comments"
//               value={formData.comments || ""}
//               disabled={!formData.loc}
//               readOnly
//             />
//           </Form.Group>
//         </Col>
//       </Row>
//     );

//     return fields;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));

//     if (name === "loc") {
//       setSelectedPlant(value);
//       setSelectedProcessDetails(null);
//     }
//   };

//   const handleSubmitClick = () => {
//     const newErrors = {};
//     if (!formData.loc) newErrors.loc = "Plant selection is required";
//     if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       toast.error("Please fix the validation errors");
//       return;
//     }

//     setErrors({});
//     setConfirmOpen(true);
//   };

//   const handleViewNextStep = () => {
//     setSelectedProcessDetails(null);
//     setActiveStep(immediateNextStepIndex);
//     setFirstStep(null);

//     if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
//       const nextStepName = steps[immediateNextStepIndex]?.PROCESS;
//       if (nextStepName) {
//         axios
//           .get(
//             `${API_BASE_URLS}/GHMC-step-details/${encodeURIComponent(
//               selectedPlant
//             )}/${encodeURIComponent(nextStepName)}`
//           )
//           .then((res) => {
//             setNextStepDetails(res.data);
//           })
//           .catch((err) => {
//             console.error("Error fetching next step details:", err);
//             setNextStepDetails(null);
//           });
//       }
//     }
//   };

//   const handleConfirmSubmit = async () => {
//     setIsSubmitting(true);

//     const payload = new FormData();
//     payload.append("loc", formData.loc);
//     payload.append("applyDate", formData.applyDate);
//     payload.append("process", immediateNextStep.PROCESS);
//     payload.append("comments", formData.comments || "");
//     payload.append("noOfTowers", formData.noOfTowers || "0");
//     payload.append("Organization", formData.Organization || "" || null);
//     feasibilityDocs.forEach(f => payload.append('feas_doc_name[]', f));

//     try {
//       const result = await axios.post(`${API_BASE_URLS}/GHMC-update`, payload, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const refreshed = await axios.get(
//         `${API_BASE_URLS}/GHMC-data?plant=${formData.loc}`
//       );

//       setStoreData(refreshed?.data);

//       const master = await getMasterByLoc(formData.loc);
//       if (master) {
//         setHeaderData(master);
//       }

//       const currentLoc = formData.loc;
//       setFormData({
//         loc: currentLoc,
//         applyDate: "",
//         comments: "",
//         noOfTowers: "",
//         Organization: ""
//       });

//       setLinkDocs([]);
//       setLandDocs([]);
//       setOthDocs([]);
//       setFirstStep(null);
//       setNextStepDetails(null);
//       setSelectedProcessDetails(null);
//       setSubmitted(true);

//       setDialogConfig({
//         title: 'Success',
//         message: 'Form submitted successfully!',
//         confirmText: 'OK',
//         open: true
//       });

//     } catch (err) {
//       console.error("Submission failed:", err);
//       setDialogConfig({
//         title: 'Error',
//         message: err.response?.data?.message || 'Submission failed. Please try again.',
//         confirmText: 'OK',
//         showCancel: false,
//         open: true
//       });
//     } finally {
//       setIsSubmitting(false);
//       setConfirmOpen(false);
//     }
//   };

//   return (
//     <>
//       <ProjectInfoHeader data={headerData} />
//       <Row className="align-items-stretch">
//         <Col md={3} className="d-flex">
//           <div className="border rounded p-3 bg-light flex-fill">
//             <h6 className="text-center mb-3">
//               {organizationType ? `${organizationType} Process Steps` : 'Process Steps'}
//               {allStepsCompleted && (
//                 <span className="badge bg-success ms-2">Completed</span>
//               )}
//             </h6>
//             <Nav variant="pills" className="flex-column">
//               {steps.map((step, idx) => {
//                 let variant = "secondary";
//                 let clickable = false;
//                 let statusIcon = "⏸️";

//                 if (idx < immediateNextStepIndex) {
//                   variant = "success";
//                   clickable = true;
//                   statusIcon = "✅";
//                 } else if (idx === immediateNextStepIndex) {
//                   variant = "warning";
//                   clickable = true;
//                   statusIcon = "⚠️";
//                 } else if (allStepsCompleted) {
//                   variant = "success";
//                   clickable = true;
//                   statusIcon = "✅";
//                 }

//                 return (
//                   <Nav.Item key={idx} className="mb-2">
//                     <Nav.Link
//                       eventKey={idx}
//                       disabled={!clickable}
//                       onClick={(e) => {
//                         handleProcessClick(e, step.PROCESS);
//                       }}
//                       className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
//                       style={{
//                         cursor: clickable ? "pointer" : "not-allowed"
//                       }}
//                     >
//                       {statusIcon}
//                       <span>{step.PROCESS}</span>
//                     </Nav.Link>
//                   </Nav.Item>
//                 );
//               })}
//             </Nav>
//           </div>
//         </Col>

//         <Col
//           md={6}
//           className="d-flex flex-column"
//           style={{ height: '400px', overflowY: 'auto' }}
//         >
//           <Form className="p-3 border rounded bg-light flex-fill">
//             {selectedProcessDetails ? (
//               <div className="mb-3">
//                 <h4 className="mb-2 text-info fw-bold">
//                   Viewing: {selectedProcessDetails.process} (Completed)
//                 </h4>
//                 <Button
//                   variant="outline-primary"
//                   size="sm"
//                   onClick={handleViewNextStep}
//                   disabled={!immediateNextStep}
//                 >
//                   View Next Step
//                 </Button>
//               </div>
//             ) : immediateNextStep ? (
//               <h4 className="mb-3 text-warning fw-bold">
//                 Next Step: {immediateNextStep.PROCESS}
//               </h4>
//             ) : allStepsCompleted ? (
//               <h4 className="mb-3 text-success fw-bold">
//                 🎉 All Steps Completed!
//               </h4>
//             ) : null}

//             {renderFormFields()}

//             {!allStepsCompleted && !selectedProcessDetails && (
//               <div className="d-grid mt-3">
//                 <Button
//                   variant={submitted ? "success" : "primary"}
//                   size="md"
//                   onClick={handleSubmitClick}
//                   className="w-100 fw-semibold"
//                   disabled={!formData.loc || isSubmitting || submitted}
//                 >
//                   {isSubmitting ? "Submitting..." : submitted ? "Submitted" : "Submit"}
//                 </Button>
//               </div>
//             )}
//           </Form>
//         </Col>

//         <Col md={3} className="d-flex">
//           <div className="border rounded p-3 bg-white flex-fill">
//             <PreviousUploadedDocsModal firstStep={firstStep} />
//           </div>
//         </Col>
//       </Row>

//       <ReusableDialog
//         open={confirmOpen}
//         title="Confirm Submission"
//         message="Are you sure you want to submit this form? This action cannot be undone."
//         onClose={() => setConfirmOpen(false)}
//         onConfirm={handleConfirmSubmit}
//         confirmText="Submit"
//         isLoading={isSubmitting}
//       />
//     </>
//   );
// };

// export default GhmcUpdate;



import React, { useEffect, useState, useRef, useContext } from "react";
import { Nav, Form, Button, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL, API_BASE_URLS } from "../config/Config";
import Swal from "sweetalert2";
import FormHeader from "./Header";
import PreviousUploadedDocsModal from "./PreviousUploadedDocsPanel";
import WaterDocUploadModal from "./WaterDocUploadModal";
import { FaTrashAlt, FaUpload, FaCheckCircle } from "react-icons/fa";
import { fetchWaterDataByPlant, getMasterByLoc } from "../api/Api";
import { Context } from "../context/ContextData";
import ReusableDialog from "./ReusableDialog";
import { toast } from "react-toastify";
import { Home } from "lucide-react";
import ProjectInfoHeader from "./ProjectInfoHeader";
import EmailSelectionModal from "./EmailSelectionModal";

const GhmcUpdate = () => {
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
  const [organizationType, setOrganizationType] = useState("");
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    confirmText: 'OK',
    showCancel: false,
    open: false
  });
  const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);

  console.log("Selected Process Details:", selectedProcessDetails);

  const [formData, setFormData] = useState({
    loc: "",
    applyDate: "",
    comments: "",
    noOfTowers: "",
    Organization: ""
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


  const safeStoreData = Array.isArray(storeData) ? storeData : [];

 

    const handleEmailSubmit = () => {
      const newErrors = {};
      if (!formData.loc) newErrors.loc = "Plant selection is required";
      if (!formData.applyDate) newErrors.applyDate = "Apply date is required";
  
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
        return;
      }
  
      setErrors({});
      setShowEmailModal(true);
    };
  

    const handleEmailModalSubmit = (emails) => {
      console.log('✅ Selected emails:', emails);
      setSelectedEmails(emails);
      setShowEmailModal(false);
      
      setConfirmOpen(true);
    };

 
  useEffect(() => {
    if (steps.length > 0 && storeData.length > 0) {
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.process?.trim().toLowerCase());

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

  useEffect(() => {
    axios
      .get(`${API_BASE_URLS}/get-loc`)
      .then((res) => {
        setLoc(res.data);
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  useEffect(() => {
    if (selectedPlant && steps.length > 0 && immediateNextStepIndex >= 0) {
      const nextStepName = steps[immediateNextStepIndex]?.PROCESS;

      console.log("Fetching step details:", nextStepName, "for plant:", selectedPlant);

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
    if (steps.length > 0 && storeData.length > 0) {
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.process);

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

  // Update form data based on whether viewing completed process or next step
  useEffect(() => {
    if (selectedProcessDetails) {
      // Viewing a completed process - show its data as read-only
      console.log("Setting form data from selectedProcessDetails:", selectedProcessDetails);
      setFormData((prev) => ({
        ...prev,
        loc: selectedProcessDetails?.loc || selectedPlant || "",
        applyDate: selectedProcessDetails?.applyDate || "",
        comments: selectedProcessDetails?.Comments || "",
        noOfTowers: selectedProcessDetails?.noOfTowers || "",
        Organization: selectedProcessDetails?.Organization || ""
      }));
      setFirstStep(selectedProcessDetails);
    } else if (nextStepDetails) {
      // Viewing next step - show editable form
      console.log("Setting form data from nextStepDetails:", nextStepDetails);
      setFormData((prev) => ({
        ...prev,
        loc: selectedPlant || "",
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
          loc: selectedPlant,
          applyDate: "",
          comments: "",
          noOfTowers: "",
          Organization: ""
        }));
        setFirstStep(null);
      }
    }
  }, [nextStepDetails, selectedProcessDetails, selectedPlant]);

  useEffect(() => {
    if (selectedPlant) {
      axios
        .get(`${API_BASE_URLS}/GHMC-data?plant=${selectedPlant}`)
        .then((res) => {
          setSteps(res.data.processes);

          console.log(res?.data?.plantData, "plamttttttttttt");
          setStoreData(res.data.plantData);

          const plantRecord = res.data.plantData.find(
            (item) => item.loc === selectedPlant
          );

          if (plantRecord && plantRecord.Organization) {
            setOrganizationType(plantRecord.Organization);
          } else {
            setOrganizationType(res.data.plantData[0].Organization || "GHMC");
          }
        })
        .catch((err) => {
          console.error("Error fetching GHMC data:", err);
          setStoreData([]);
        });
    } else {
      setStoreData([]);
    }
  }, [selectedPlant, setStoreData]);

  useEffect(() => {
    if (steps.length > 0 && storeData.length > 0) {
      const completedProcesses = storeData
        .filter((item) => item.UPDATED === "YES")
        .map((item) => item.process?.trim().toLowerCase());

      console.log("Steps:", steps);
      console.log("Completed Processes:", completedProcesses);

      const lastCompletedIndex = steps.findIndex(
        (step) =>
          step.PROCESS?.trim().toLowerCase() ===
          completedProcesses[completedProcesses.length - 1]
      );

      const nextIndex = lastCompletedIndex + 1;

      if (nextIndex < steps.length) {
        const nextStep = steps[nextIndex];
        console.log("✅ Next step found:", nextStep.PROCESS, "at index:", nextIndex);
        setImmediateNextStep(nextStep);
        setImmediateNextStepIndex(nextIndex);
      } else {
        console.log("✅ All steps completed");
        setImmediateNextStep(null);
        setImmediateNextStepIndex(-1);
      }
    }
    else if (steps.length > 0 && storeData.length === 0 && selectedPlant) {
      console.log("No data exists, starting from first step");
      setImmediateNextStep(steps[0]);
      setImmediateNextStepIndex(0);
    }
  }, [steps, storeData, selectedPlant]);

  const handleProcessClick = (e, process) => {
    e.stopPropagation();
    console.log(process, "clicked process");

    const processDetails = storeData.find(
      (item) => item.process?.toLowerCase().trim() === process.toLowerCase().trim()
    );

    if (!processDetails) {
      console.log("⚠️ No data found for this process yet.");
      setSelectedProcessDetails(null);
      setNextStepDetails(null);
      setFirstStep(null);
      return;
    }

    console.log(processDetails, "👉 selected process details");

    if (processDetails.UPDATED === "YES") {
      setSelectedProcessDetails(processDetails);
      setNextStepDetails(null);
      setFirstStep(processDetails);
    } else {
      setSelectedProcessDetails(null);
      setNextStepDetails(null);
      setFirstStep(null);
    }
  };

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

  const renderFormFields = () => {
    if (allStepsCompleted && !selectedProcessDetails) {
      return renderCompletionMessage();
    }

    if (!selectedProcessDetails) {
      return renderNextStepForm();
    }

    console.log("Rendering completed step details:", selectedProcessDetails);
    const fields = [];

    fields.push(
      <Row key="basic" className="mb-2">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Plant</Form.Label>
            <Form.Control
              type="text"
              value={selectedProcessDetails.loc || ""}
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
              value={selectedProcessDetails.applyDate || ""}
              readOnly
              disabled
            />
          </Form.Group>
        </Col>
      </Row>
    );

    fields.push(
      <Row key="comments" className="mb-2">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={selectedProcessDetails.Comments || ""}
              readOnly
              disabled
            />
          </Form.Group>
        </Col>
      </Row>
    );

    return fields;
  };

  const renderNextStepForm = () => {
    const fields = [];

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
              readOnly
              disabled={!formData.loc}
            />
          </Form.Group>
        </Col>
      </Row>
    );

    fields.push(
      <Row key="comments" className="mb-2">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="comments"
              value={formData.comments || ""}
              disabled={!formData.loc}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>
    );

    return fields;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "loc") {
      setSelectedPlant(value);
      setSelectedProcessDetails(null);
    }
  };




  const handleViewNextStep = () => {
    setSelectedProcessDetails(null);
    setActiveStep(immediateNextStepIndex);
    setFirstStep(null);

    if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
      const nextStepName = steps[immediateNextStepIndex]?.PROCESS;
      if (nextStepName) {
        axios
          .get(
            `${API_BASE_URLS}/GHMC-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(nextStepName)}`
          )
          .then((res) => {
            setNextStepDetails(res.data);
          })
          .catch((err) => {
            console.error("Error fetching next step details:", err);
            setNextStepDetails(null);
          });
      }
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("applyDate", formData.applyDate);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("comments", formData.comments || "");
    payload.append("noOfTowers", formData.noOfTowers || "0");
    payload.append("Organization", formData.Organization || "" || null);
    feasibilityDocs.forEach(f => payload.append('feas_doc_name[]', f));
    selectedEmails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });
    try {
      const result = await axios.post(`${API_BASE_URLS}/GHMC-update`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const refreshed = await axios.get(
        `${API_BASE_URLS}/GHMC-data?plant=${formData.loc}`
      );

      setStoreData(refreshed?.data);

      const master = await getMasterByLoc(formData.loc);
      if (master) {
        setHeaderData(master);
      }

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
      setSelectedProcessDetails(null);
      setSubmitted(true);

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
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h6 className="text-center mb-3">
              {organizationType ? `${organizationType} Process Steps` : 'Process Steps'}
              {allStepsCompleted && (
                <span className="badge bg-success ms-2">Completed</span>
              )}
            </h6>
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
                } else if (allStepsCompleted) {
                  variant = "success";
                  clickable = true;
                  statusIcon = "✅";
                }

                return (
                  <Nav.Item key={idx} className="mb-2">
                    <Nav.Link
                      eventKey={idx}
                      disabled={!clickable}
                      onClick={(e) => {
                        handleProcessClick(e, step.PROCESS);
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
          style={{ height: '400px', overflowY: 'auto' }}
        >
          <Form className="p-3 border rounded bg-light flex-fill">
            {selectedProcessDetails ? (
              <div className="mb-3">
                <h4 className="mb-2 text-info fw-bold">
                  Viewing: {selectedProcessDetails.process} (Completed)
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

            {!allStepsCompleted && !selectedProcessDetails && (
              <div className="d-grid mt-3">
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
            )}
          </Form>
        </Col>

        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill">
            <PreviousUploadedDocsModal firstStep={firstStep} />
          </div>
        </Col>
      </Row>


 <EmailSelectionModal
        show={showEmailModal}
        onHide={() => {
          setShowEmailModal(false);
          setSelectedEmails([]);
        }}
        onSubmit={handleEmailModalSubmit}
        processName={immediateNextStep?.PROCESS || ''}
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
    </>
  );
};

export default GhmcUpdate;