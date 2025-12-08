// // import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
// // import { Nav, Form, Button, Row, Col, Badge, Modal, OverlayTrigger, Tooltip, Card } from "react-bootstrap";
// // import axios from "axios";
// // import Swal from "sweetalert2";
// // import { API_BASE_URL, API_DOC_URL } from "../config/Config";
// // import FormHeader from "./Header";
// // import { FaFileAlt } from "react-icons/fa";
// // import { Context } from "../context/ContextData";
// // import { getMasterByLoc } from "../api/Api";
// // import ProjectInfoHeader from "./ProjectInfoHeader";
// // import EmailSelectionModal from "./EmailModal";

// // const FireUpdateTable = () => {
// //   const [steps, setSteps] = useState([]);
// //   const [plants, setPlants] = useState([]);
// //   const [selectedPlant, setSelectedPlant] = useState("");
// //    const [showLogsModal, setShowLogsModal] = useState(false);
// //     const [selectedLogs, setSelectedLogs] = useState([]);
// //   // const [storeData, setStoreData] = useState([]);
// //      const [showEmailModal, setShowEmailModal] = useState(false);
// //       const [emailRecipients, setEmailRecipients] = useState([]);
// //       const [selectedEmails, setSelectedEmails] = useState([]);
// //           const { 
// //             storeData, 
// //             setStoreData, 
// //             respModifyData, 
// //             setRespModifyData, 
// //             setHeaderData, 
// //             headerData 
// //           } = useContext(Context);

// //   const [formData, setFormData] = useState({
// //     loc: "",
// //     applyDate: "",
// //     document: null,
// //     comments: "",
// //     prjName: "",
// //     address: "",
// //     // Removed feePaid, feeAmount, acknowledgeName
// //   });
// //   const [immediateNextStep, setImmediateNextStep] = useState(null); // The actual next step to be completed
// //   const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1); // Conceptual index of the immediateNextStep (0-9)

// //   // ✅ NEW STATE: Tracks which step the user is currently viewing in the form
// //   const [viewedStepConceptualIndex, setViewedStepConceptualIndex] = useState(-1);
// //   const [viewedStepDetails, setViewedStepDetails] = useState(null); // Details for the currently viewed step

// //   const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });

// //   // Removed acknowledgeDocs state

// //   const [provisionalNOCCompleted, setProvisionalNOCCompleted] = useState(false);

// //        const handleEmailSubmit = () => {
// //     const newErrors = {};
// //     if (!formData.loc) newErrors.loc = "Plant selection is required";
// //     if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

// //     // if (Object.keys(newErrors).length > 0) {
// //     //   setErrors(newErrors);
// //     //   return;
// //     // }

// //     // setErrors({});
// //     setShowEmailModal(true);
// //   };

// //      const getCurrentStepLogs = () => {
// //     if (!immediateNextStep || !storeData || storeData.length === 0) {
// //       return [];
// //     }
    
// //     // Find the current step record
// //     const currentStepRecord = storeData.find(
// //       (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim()
// //     );
    
// //     if (!currentStepRecord?.LOG) {
// //       return [];
// //     }
    
// //     try {
// //       return JSON.parse(currentStepRecord.LOG);
// //     } catch (error) {
// //       console.error("Failed to parse logs:", error);
// //       return [];
// //     }
// //   };

  
// //   const handleEmailSelectionSubmit = async (emails) => {
// //     setSelectedEmails(emails);
// //     setShowEmailModal(false);

// //     // Proceed with form submission
// //     await handleConfirmSubmit(emails);
// //   };

// //   const PROVISIONAL_NOC_STEP_INDICES = useMemo(() => [0, 1, 2, 3, 4], []);
// //   const OC_PROCESS_CONCEPTUAL_START_INDEX = PROVISIONAL_NOC_STEP_INDICES.length; // Will be 5

// //   const fetchStepDetails = useCallback(async (plantId, processName, stepType) => {
// //     if (!plantId || !processName || !stepType) return null;
// //     try {
// //       const apiUrl = `${API_BASE_URL}/fire-step-details/${encodeURIComponent(plantId)}/${encodeURIComponent(processName)}/${encodeURIComponent(stepType)}`;
// //       const detailsRes = await axios.get(apiUrl);
// //       return detailsRes.data || null;
// //     } catch (error) {
// //       console.error(`Error fetching details for step: ${processName} (${stepType})`, error);
// //       return null;
// //     }
// //   }, []);

// //   const fetchPlantData = useCallback(async (plantId) => {
// //     if (!plantId || steps.length === 0) {
// //       setStoreData([]);
// //       setImmediateNextStep(null);
// //       setImmediateNextStepIndex(-1);
// //       setViewedStepConceptualIndex(-1); // Reset viewed step
// //       setViewedStepDetails(null); // Reset viewed step details
// //       setProjectInfo({ prjName: "", address: "" });
// //       setFormData({
// //         loc: plantId,
// //         applyDate: "",
// //         comments: "",
// //         prjName: "",
// //         address: "",
// //         // Removed feePaid, feeAmount, acknowledgeName
// //       });
// //       setProvisionalNOCCompleted(false);
// //       return;
// //     }

// //     try {
// //       const res = await axios.get(`${API_BASE_URL}/fire-data?plant=${plantId}`);
// //       const fetchedData = res.data;

// //       console.log(fetchedData,"fffffffffff11111111");
// //       setStoreData(fetchedData);

// //       let currentProjectName = "";
// //       let currentAddress = "";
// //       if (fetchedData && fetchedData.length > 0) {
// //         const firstRecord = fetchedData[0];
// //         currentProjectName = firstRecord.PROJECT_NAME || "";
// //         currentAddress = firstRecord.ADDRESS || "";
// //         setProjectInfo({ prjName: currentProjectName, address: currentAddress });
// //       } else {
// //         setProjectInfo({ prjName: "", address: "" });
// //       }

// //       const allProvisionalNOCStepsCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
// //         (index) => steps[index] && fetchedData.some(
// //           (item) => item.PROCESS === steps[index].PROCESS && item.UPDATED === "YES"
// //         )
// //       );
// //       setProvisionalNOCCompleted(allProvisionalNOCStepsCompleted);

// //       let nextStepFound = null;
// //       let nextStepIdx = -1;

// //       if (!allProvisionalNOCStepsCompleted) {
// //         for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
// //           if (steps[idx] && !fetchedData.some(
// //             (item) => item.PROCESS === steps[idx].PROCESS && item.UPDATED === "YES"
// //           )) {
// //             nextStepFound = steps[idx];
// //             nextStepIdx = idx;
// //             break;
// //           }
// //         }
// //       } else {
// //         for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
// //           if (steps[idx] && !fetchedData.some(
// //             (item) => item.PROCESS === steps[idx].PROCESS && item.OC_UPDATED === "YES"
// //           )) {
// //             nextStepFound = steps[idx];
// //             nextStepIdx = idx + OC_PROCESS_CONCEPTUAL_START_INDEX;
// //             break;
// //           }
// //         }
// //       }

// //       setImmediateNextStep(nextStepFound);
// //       setImmediateNextStepIndex(nextStepIdx);

// //       // ✅ NEW: Automatically set the viewed step to the immediate next step on load
// //       let detailsForViewedStep = null;
// //       if (nextStepFound) {
// //         const stepType = nextStepIdx >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "OC Process" : "Provisional NOC";
// //         detailsForViewedStep = await fetchStepDetails(plantId, nextStepFound.PROCESS, stepType);
// //         setViewedStepConceptualIndex(nextStepIdx); // Set viewed step to the immediate next
// //       } else if (steps.length > 0) {
// //         // If all steps are complete, view the last OC step by default
// //         const lastOCStepIndex = (PROVISIONAL_NOC_STEP_INDICES.length - 1) + OC_PROCESS_CONCEPTUAL_START_INDEX;
// //         const lastOCStep = steps[PROVISIONAL_NOC_STEP_INDICES.length - 1]; // Last step of original array
// //         detailsForViewedStep = await fetchStepDetails(plantId, lastOCStep.PROCESS, "OC Process");
// //         setViewedStepConceptualIndex(lastOCStepIndex);
// //       }
// //       setViewedStepDetails(detailsForViewedStep);
// // console.log('veiwedStepdetials:', viewedStepDetails);

// //       setFormData((prev) => ({
// //         ...prev,
// //         loc: plantId,
// //         prjName: currentProjectName,
// //         address: currentAddress,
// //         applyDate: detailsForViewedStep?.APPLY_DT || "",
// //         comments: detailsForViewedStep?.COMMENTS || "",
// //         // Removed feePaid, feeAmount, acknowledgeName
// //       }));

// //     } catch (err) {
// //       console.error("Error fetching plant data:", err);
// //       Swal.fire("Error", "Failed to load plant data. Please check console.", "error");
// //       setStoreData([]);
// //       setImmediateNextStep(null);
// //       setImmediateNextStepIndex(-1);
// //       setViewedStepConceptualIndex(-1);
// //       setViewedStepDetails(null);
// //       setProjectInfo({ prjName: "", address: "" });
// //       setFormData({
// //         loc: plantId,
// //         applyDate: "",
// //         comments: "",
// //         prjName: "",
// //         address: "",
// //         // Removed feePaid, feeAmount, acknowledgeName
// //       });
// //       setProvisionalNOCCompleted(false);
// //     }
// //   }, [steps, PROVISIONAL_NOC_STEP_INDICES, OC_PROCESS_CONCEPTUAL_START_INDEX, fetchStepDetails]); // Added fetchStepDetails to dependencies

// //   useEffect(() => {
// //     axios.get(`${API_BASE_URL}/fire-process`)
// //       .then((res) => setSteps(res.data))
// //       .catch((err) => console.error("Error fetching FIRE processes:", err));
// //   }, []);

// //   useEffect(() => {
// //     axios.get(`${API_BASE_URL}/fire-plants`)
// //       .then((res) => setPlants(res.data))
// //       .catch((err) => console.error("Error fetching FIRE plants:", err));
// //   }, []);

// //   useEffect(() => {
// //     fetchPlantData(selectedPlant);
// //   }, [selectedPlant, steps, fetchPlantData]);

// //   // const handleChange = (e) => {
// //   //   const { name, value } = e.target;
// //   //   if (name === "loc") {
// //   //     setSelectedPlant(value);
// //   //     return;
// //   //   }
// //   //   setFormData((prev) => ({ ...prev, [name]: value }));
// //   // };

// //   // Removed handleAcknowledgeFileChange and removeAcknowledgeFile

// //   const handleChange = async (e) => {
// //     const { name, value } = e.target;
  
// //     console.log(name, value, "Field changed");
  
// //     // 🏗️ When location changes
// //     if (name === "loc") {
// //       setSelectedPlant(value);
// //       setFormData((prev) => ({
// //         ...prev,
// //         loc: value,
// //       }));
  
// //       // 🧹 If location is empty, clear dependent fields
// //       if (!value || value.trim() === "") {
// //         setHeaderData({});
// //         setFormData((prev) => ({
// //           ...prev,
// //           applyDate: "",
// //           totalPrjArea: "",
// //           noOfNocs: "",
// //         }));
// //         return;
// //       }
  
// //       try {
   
// //         const res = await getMasterByLoc(value);
  
// //         if (res && Object.keys(res).length > 0) {
// //           console.log("✅ Master data fetched:", res);

// //           setHeaderData(res);

// //           setFormData((prev) => ({
// //             ...prev,
// //           }));
// //         } else {
// //           console.warn("⚠️ No master data found for location:", value);
// //           setHeaderData({});
// //           setFormData((prev) => ({
// //             ...prev,
// //             applyDate: "",
// //             totalPrjArea: "",
// //             noOfNocs: "",
// //           }));
// //         }
// //       } catch (err) {
// //         console.error("❌ Error fetching master by loc:", err);
// //         setHeaderData({});
// //         setFormData((prev) => ({
// //           ...prev,
// //           applyDate: "",
// //           totalPrjArea: "",
// //           noOfNocs: "",
// //         }));
// //       }
  
// //       return;
// //     }
  
// //     // 🧾 Handle other input fields normally
// //     setFormData((prev) => ({
// //       ...prev,
// //       [name]: value,
// //     }));
// //   };

// //   const handleConfirmSubmit = async (emails) => {
// //     // Crucially, submission always relates to the `immediateNextStep`
// //     if (!formData.loc || !immediateNextStep) {
// //       Swal.fire("Selection Error", "Please select a Plant and ensure an active process step.", "error");
// //       return;
// //     }

// //     const currentStepIsOC = immediateNextStepIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX && immediateNextStepIndex < (PROVISIONAL_NOC_STEP_INDICES.length * 2);
// //     const stepType = currentStepIsOC ? "OC Process" : "Provisional NOC";

// //     const payload = new FormData();
// //     payload.append("loc", formData.loc);
// //     payload.append("process", immediateNextStep.PROCESS);
// //     payload.append("stepType", stepType);
// //     payload.append("applyDate", formData.applyDate);
// //     payload.append("comments", formData.comments);
// //     emails.forEach((email, i) => {
// //       payload.append(`emails[${i}]`, email);
// //     });
// //     // Removed conditional append for OC-specific fields

// //     try {
// //       await axios.post(`${API_BASE_URL}/fire-update`, payload);
// //       await Swal.fire({
// //         icon: "success",
// //         title: "Step Updated!",
// //         text: "Process step updated successfully.",
// //         timer: 1500,
// //         showConfirmButton: false,
// //       });
// //       // Removed clearing acknowledgeDocs
// //       await fetchPlantData(formData.loc); // Re-fetch all data to refresh state
// //     } catch (error) {
// //       console.error("Submission failed:", error);
// //       Swal.fire("Submission Failed", "Please check the console for details.", "error");
// //     }
// //   };

// //   const handleStepClick = useCallback(async (processName, stepType, conceptualIndex) => {
// //     if (!selectedPlant) {
// //       Swal.fire("Error", "Please select a plant first", "error");
// //       return;
// //     }
// //     // Update the viewed step's conceptual index
// //     setViewedStepConceptualIndex(conceptualIndex);

// //     // Fetch details for the clicked step
// //     const details = await fetchStepDetails(selectedPlant, processName, stepType);
// //     setViewedStepDetails(details);

// //     // Populate form with fetched details
// //     setFormData((prev) => ({
// //       ...prev,
// //       applyDate: details?.APPLY_DT || "",
// //       comments: details?.COMMENTS || "",
// //       // Removed feePaid, feeAmount, acknowledgeName
// //     }));
// //   }, [selectedPlant, fetchStepDetails]);

// //   const renderDocumentHistory = () => {
// //     const details = viewedStepDetails; 
// //     if (!details || typeof details !== "object" || Object.keys(details).length === 0) {
// //       return (<p className="text-muted mb-0">No previous documents for this step.</p>);
// //     }

// //     let generalDocuments = [];
// //     let acknowledgementReceipts = []; // Re-introduced for ACK_DOC

// //     if (details.UPLOAD_DOC) {
// //       try {
// //         const parsedDocs = JSON.parse(details.UPLOAD_DOC);
// //         generalDocuments = parsedDocs.map((doc) => ({
// //           name: doc.file_name,
// //           url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
// //         }));
// //       } catch (error) {
// //         console.error("Failed to parse UPLOAD_DOC JSON:", error);
// //       }
// //     }

// //     // Re-introducing ACK_DOC parsing
// //     if (details.ACK_DOC) {
// //       try {
// //         const parsedAcknowledgeDocs = JSON.parse(details.ACK_DOC);
// //         acknowledgementReceipts = parsedAcknowledgeDocs.map((doc) => ({
// //           name: doc.file_name,
// //           url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
// //         }));
// //       } catch (error) {
// //         console.error("Failed to parse ACK_DOC JSON:", error);
// //       }
// //     }
// //    const currentStepLogs = getCurrentStepLogs();
// //     return (
// //     <div className="d-flex flex-column" style={{ height: '100%' }}>
// //       <Card style={{padding:'1px', height: '80%', overflow: 'auto' }}>
// //         <h6 className="text-primary p-2">General Uploaded Documents</h6>
// //         {generalDocuments.length > 0 ? (
// //           <ul className="list-unstyled">
// //             {generalDocuments.map((doc, idx) => (
// //               <li key={`gen-doc-${idx}`} className="p-1">
// //                 <a href={doc.url} target="_blank" rel="noreferrer" className="text-decoration-none">
// //                   {/* <FaFileAlt className="" /> */}
// //                   {doc.name}
// //                 </a>
// //               </li>
// //             ))}
// //           </ul>
// //         ) : (
// //           <p className="text-muted mb-0 p-2">No general documents were uploaded for this step.</p>
// //         )}

// //         {/* Re-introducing Acknowledgement Receipts section */}
// //         <h6 className="text-primary mt-3 p-2">Acknowledgement Receipts</h6>
// //         {acknowledgementReceipts.length > 0 ? (
// //           <ul className="list-unstyled">
// //             {acknowledgementReceipts.map((doc, idx) => (
// //               <li key={`ack-doc-${idx}`} className="p-1">
// //                 <a href={doc.url} target="_blank" rel="noreferrer" className="text-decoration-none">
// //                   {/* <FaFileAlt className="me-2" /> */}
// //                   {doc.name}
// //                 </a>
// //               </li>
// //             ))}
// //           </ul>
// //         ) : (
// //           <p className="text-muted mb-0 p-1">No acknowledgement receipts available for this step.</p>
// //         )}
// //         </Card>
   


// //            <div className="p-2 border-top bg-light text-center">
// //                        <Button
// //                          variant="info"
// //                          size="sm"
// //                          onClick={() => {
// //                            const logs = getCurrentStepLogs();
// //                            setSelectedLogs(logs);
// //                            setShowLogsModal(true);
// //                          }}
// //                          disabled={currentStepLogs.length === 0}
// //                        >
// //                          {currentStepLogs.length === 0 ? "No Logs Available" : `View Logs (${currentStepLogs.length})`}
// //                        </Button>
// //                      </div>
// //       </div>
// //     );
// //   };





// //   const renderProcessColumn = (columnTitle, isOCPhase) => {
// //     return (
// //       <Col xs={6}>
// //         <h6 className="text-center mb-2">{columnTitle}</h6>
// //         <Nav variant="pills" className="flex-column">
// //           {steps.map((step, idx) => {
// //             let variant = "secondary", statusIcon = "⏸️";
// //             let isCompleted = false;
// //             let currentConceptualIndex;

// //             if (isOCPhase) {
// //               isCompleted = storeData.some(
// //                 (item) => item.PROCESS === step.PROCESS && item.OC_UPDATED === "YES"
// //               );
// //               currentConceptualIndex = idx + OC_PROCESS_CONCEPTUAL_START_INDEX;
// //             } else {
// //               isCompleted = storeData.some(
// //                 (item) => item.PROCESS === step.PROCESS && item.UPDATED === "YES"
// //               );
// //               currentConceptualIndex = idx;
// //             }

// //             // Determine if all steps are completed
// //             const allStepsCompleted = !immediateNextStep; // This means immediateNextStep is null

// //             // Determine if the step is clickable
// //             // It's clickable if all steps are completed OR it's a completed step OR it's the immediate next step.
// //             const isClickable = allStepsCompleted || isCompleted || (currentConceptualIndex === immediateNextStepIndex);

// //             // Determine UI state
// //             if (isCompleted) {
// //               variant = "success";
// //               statusIcon = "✅";
// //             } else if (currentConceptualIndex === immediateNextStepIndex) {
// //               variant = "warning";
// //               statusIcon = "⚠️";
// //             }

// //             // OC steps are locked if Provisional NOC is not completed
// //             const isOCLocked = isOCPhase && !provisionalNOCCompleted;
// //             if (isOCLocked && !isCompleted) { // If OC is locked and not yet completed
// //                 variant = "secondary";
// //                 statusIcon = "🔒";
// //             }

// //             return (
// //               <Nav.Item className="mb-2" key={`${isOCPhase ? 'oc-' : 'pnoc-'}${step.PROCESS}`}>
// //                 <Nav.Link
// //                   // ✅ ACTIVE STATE: Highlights the step currently being viewed in the form
// //                   active={viewedStepConceptualIndex === currentConceptualIndex}
// //                   // Modified disabled condition: Disable only if OC is locked AND not already completed,
// //                   // or if it's not the immediateNextStep and allStepsCompleted is false
// //                   disabled={isOCLocked && !isCompleted}
// //                   onClick={() =>
// //                     // Only call handleStepClick if not disabled by OC lock
// //                     !(isOCLocked && !isCompleted) && handleStepClick(step.PROCESS, isOCPhase ? "OC Process" : "Provisional NOC", currentConceptualIndex)
// //                   }
// //                   className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
// //                   style={{ cursor: (!(isOCLocked && !isCompleted)) ? "pointer" : "not-allowed" }}
// //                 >
// //                   {statusIcon}
// //                   <span>{step.PROCESS}</span>
// //                 </Nav.Link>
// //               </Nav.Item>
// //             );
// //           })}
// //         </Nav>
// //       </Col>
// //     );
// //   };

// //   // Removed isCurrentViewedStepAnOCProcess since OC-specific fields are removed

// //   return (
// //     <>
// //          <ProjectInfoHeader data={headerData} />
// //       <Row className="align-items-stretch">
// //         <Col md={4} className="d-flex">
// //           <div className="border rounded p-3 bg-light flex-fill">
// //             <h5 className="text-center mb-3">Process Steps</h5>
// //             <Row>
// //               {renderProcessColumn("Provisional NOC", false)}
// //               {renderProcessColumn("OC Process", true)}
// //             </Row>
// //           </div>
// //         </Col>

// //         <Col md={5} className="d-flex flex-column">
// //           <Form className="p-3 border rounded bg-light flex-fill">
// //             {/* Display the process name of the *viewed* step */}
// //             {viewedStepConceptualIndex !== -1 && steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length] ? (
// //               <h4 className="mb-3 text-primary fw-bold">
// //                 Viewing: {steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length].PROCESS} {viewedStepConceptualIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "(OC Process)" : "(Provisional NOC)"}
// //               </h4>
// //             ) : (
// //                 <h4 className="mb-3 text-muted">Select a Plant to begin</h4>
// //             )}
// //             {!immediateNextStep && immediateNextStepIndex >= (PROVISIONAL_NOC_STEP_INDICES.length * 2) && (
// //                  <h4 className="mb-3 text-success fw-bold">All Process Steps Completed! 🎉</h4>
// //             )}

// //             <Row className="mb-3">
// //               <Col md={6}>
// //                 <Form.Group>
// //                   <Form.Label>Plant</Form.Label>
// //                   <Form.Select
// //                     name="loc"
// //                     value={formData.loc}
// //                     onChange={handleChange}
// //                   >
// //                     <option value="">Select Plant</option>
// //                     {plants.map((p, idx) => (
// //                       <option key={idx} value={p.loc}>
// //                         {p.loc}
// //                       </option>
// //                     ))}
// //                   </Form.Select>
// //                 </Form.Group>
// //               </Col>
// //               <Col md={6}>
// //                 <Form.Group>
// //                   <Form.Label>
// //                     {steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length]?.PROCESS === steps[1]?.PROCESS // Check if viewed step is the "Inspection" step (index 1)
// //                       ? "Inspection Date"
// //                       : "Apply Date"}
// //                   </Form.Label>
// //                   <Form.Control
// //                     type="date"
// //                     name="applyDate"
// //                     value={formData.applyDate || ""}
// //                     onChange={handleChange}
// //                     // ✅ Editable ONLY if viewing the *immediate next step*
// //                     // disabled={viewedStepConceptualIndex !== immediateNextStepIndex || !immediateNextStep}
// //                     disabled={true}
// //                   />
// //                 </Form.Group>
// //               </Col>
// //             </Row>

// //             <Form.Group className="mb-3">
// //               <Form.Label>Comments</Form.Label>
// //               <Form.Control
// //                 as="textarea"
// //                 rows={2}
// //                 name="comments"
// //                 value={formData.comments || ""}
// //                 onChange={handleChange}
// //                 // ✅ Editable ONLY if viewing the *immediate next step*
// //                 // disabled={viewedStepConceptualIndex !== immediateNextStepIndex || !immediateNextStep}
// //                 disabled={true}
// //               />
// //             </Form.Group>

// //             {/* Removed OC-specific fields */}

// //             <div className="d-grid mt-3">
// //               <OverlayTrigger
// //                 placement="top"
// //                 overlay={
// //                   <Tooltip id="update-tooltip">
// //                     { !selectedPlant ? "Please select a Plant." :
// //                       (!immediateNextStep ? "All steps are completed." :
// //                       (viewedStepConceptualIndex !== immediateNextStepIndex ? "You can only update the active step." :
// //                       "Click here to update the current active step."))
// //                     }
// //                   </Tooltip>
// //                 }
// //               >
// //                 <span className="d-grid"> {/* Span is needed for disabled OverlayTrigger */}
// //                   <Button
// //                     variant="primary"
// //                     size="lg"
// //                     onClick={handleEmailSubmit}
// //                     // ✅ Enabled ONLY if viewing the *immediate next step*
// //                     disabled={!formData.loc || !immediateNextStep || (viewedStepConceptualIndex !== immediateNextStepIndex)}
// //                     style={(!formData.loc || !immediateNextStep || (viewedStepConceptualIndex !== immediateNextStepIndex)) ? { pointerEvents: "none" } : {}}
// //                   >
// //                     Update
// //                   </Button>
// //                 </span>
// //               </OverlayTrigger>
// //             </div>
// //           </Form>
// //         </Col>

// //              <Col md={3} className="d-flex w-25">
// //                   <div className="border rounded p-3 bg-white flex-fill d-flex flex-column w-50">
// //                     <h5 className="mb-3 text-dark">
// //                       Document History
// //                     </h5>
// //                     <div className="flex-grow-1 overflow-auto">
// //                       {renderDocumentHistory()}
// //                     </div>
// //                   </div>
// //                 </Col>

                 

 
// //       </Row>

// //        <Modal show={showLogsModal} onHide={() => setShowLogsModal(false)} centered>
// //                         <Modal.Header closeButton>
// //                           <Modal.Title>Logs for {immediateNextStep?.PROCESS}</Modal.Title>
// //                         </Modal.Header>
// //                         <Modal.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
// //                           {selectedLogs.length === 0 ? (
// //                             <p>No logs available</p>
// //                           ) : (
// //                             selectedLogs.map((log, i) => (
// //                               <div key={i} className="mb-2">
// //                                 <strong>{log?.date || "Unknown Date"}:</strong> {log?.comment || "No comment"}
// //                                 <hr />
// //                               </div>
// //                             ))
// //                           )}
// //                         </Modal.Body>
// //                         <Modal.Footer>
// //                           <Button variant="secondary" onClick={() => setShowLogsModal(false)}>
// //                             Close
// //                           </Button>
// //                         </Modal.Footer>
// //                       </Modal>

// //         <EmailSelectionModal
// //         show={showEmailModal}
// //         onHide={() => setShowEmailModal(false)}
// //         onSubmit={handleEmailSelectionSubmit}
// //         processName={immediateNextStep?.PROCESS}
// //         plantName={formData?.loc}
// //         applyDate={formData?.applyDate}
// //         comments={formData?.comments}
// //       />
// //     </>
// //   );
// // };

// // export default FireUpdateTable;


// import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
// import { Nav, Form, Button, Row, Col, Badge, Modal, OverlayTrigger, Tooltip, Card } from "react-bootstrap";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { API_BASE_URL, API_DOC_URL } from "../config/Config";
// import FormHeader from "./Header";
// import { FaFileAlt } from "react-icons/fa";
// import { Context } from "../context/ContextData";
// import { getMasterByLoc } from "../api/Api";
// import ProjectInfoHeader from "./ProjectInfoHeader";
// import EmailSelectionModal from "./EmailModal";
// const FireUpdateTable = () => {
//   const [steps, setSteps] = useState([]);
//   const [plants, setPlants] = useState([]);
//   const [selectedPlant, setSelectedPlant] = useState("");
//    const [showLogsModal, setShowLogsModal] = useState(false);
//     const [selectedLogs, setSelectedLogs] = useState([]);
//   // const [storeData, setStoreData] = useState([]);
//      const [showEmailModal, setShowEmailModal] = useState(false);
//       const [emailRecipients, setEmailRecipients] = useState([]);
//       const [selectedEmails, setSelectedEmails] = useState([]);
//           const { 
//             storeData, 
//             setStoreData, 
//             respModifyData, 
//             setRespModifyData, 
//             setHeaderData, 
//             headerData 
//           } = useContext(Context);

//   const [formData, setFormData] = useState({
//     loc: "",
//     applyDate: "",
//     document: null,
//     comments: "",
//     prjName: "",
//     address: "",
//     // Removed feePaid, feeAmount, acknowledgeName
//   });
//   const [immediateNextStep, setImmediateNextStep] = useState(null); // The actual next step to be completed
//   const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1); // Conceptual index of the immediateNextStep (0-9)

//   // ✅ NEW STATE: Tracks which step the user is currently viewing in the form
//   const [viewedStepConceptualIndex, setViewedStepConceptualIndex] = useState(-1);
//   const [viewedStepDetails, setViewedStepDetails] = useState(null); // Details for the currently viewed step


//   const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });

//   // Removed acknowledgeDocs state

//   const [provisionalNOCCompleted, setProvisionalNOCCompleted] = useState(false);


//        const handleEmailSubmit = () => {
//     const newErrors = {};
//     if (!formData.loc) newErrors.loc = "Plant selection is required";
//     if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

//     // if (Object.keys(newErrors).length > 0) {
//     //   setErrors(newErrors);
//     //   return;
//     // }

//     // setErrors({});
//     setShowEmailModal(true);
//   };

  
//   const handleEmailSelectionSubmit = async (emails) => {
//     setSelectedEmails(emails);
//     setShowEmailModal(false);

//     // Proceed with form submission
//     await handleConfirmSubmit(emails);
//   };

//   const PROVISIONAL_NOC_STEP_INDICES = useMemo(() => [0, 1, 2, 3, 4], []);
//   const OC_PROCESS_CONCEPTUAL_START_INDEX = PROVISIONAL_NOC_STEP_INDICES.length; // Will be 5

//   const fetchStepDetails = useCallback(async (plantId, processName, stepType) => {
//     if (!plantId || !processName || !stepType) return null;
//     try {
//       const apiUrl = `${API_BASE_URL}/fire-step-details/${encodeURIComponent(plantId)}/${encodeURIComponent(processName)}/${encodeURIComponent(stepType)}`;
//       const detailsRes = await axios.get(apiUrl);
//       return detailsRes.data || null;
//     } catch (error) {
//       console.error(`Error fetching details for step: ${processName} (${stepType})`, error);
//       return null;
//     }
//   }, []);


//   const fetchPlantData = useCallback(async (plantId) => {
//     if (!plantId || steps.length === 0) {
//       setStoreData([]);
//       setImmediateNextStep(null);
//       setImmediateNextStepIndex(-1);
//       setViewedStepConceptualIndex(-1); // Reset viewed step
//       setViewedStepDetails(null); // Reset viewed step details
//       setProjectInfo({ prjName: "", address: "" });
//       setFormData({
//         loc: plantId,
//         applyDate: "",
//         comments: "",
//         prjName: "",
//         address: "",
//         // Removed feePaid, feeAmount, acknowledgeName
//       });
//       setProvisionalNOCCompleted(false);
//       return;
//     }

//     try {
//       const res = await axios.get(`${API_BASE_URL}/fire-data?plant=${plantId}`);
//       const fetchedData = res.data;
//       setStoreData(fetchedData);

//       let currentProjectName = "";
//       let currentAddress = "";
//       if (fetchedData && fetchedData.length > 0) {
//         const firstRecord = fetchedData[0];
//         currentProjectName = firstRecord.PROJECT_NAME || "";
//         currentAddress = firstRecord.ADDRESS || "";
//         setProjectInfo({ prjName: currentProjectName, address: currentAddress });
//       } else {
//         setProjectInfo({ prjName: "", address: "" });
//       }

//       const allProvisionalNOCStepsCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
//         (index) => steps[index] && fetchedData.some(
//           (item) => item.PROCESS === steps[index].PROCESS && item.UPDATED === "YES"
//         )
//       );
//       setProvisionalNOCCompleted(allProvisionalNOCStepsCompleted);

//       let nextStepFound = null;
//       let nextStepIdx = -1;

//       if (!allProvisionalNOCStepsCompleted) {
//         for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
//           if (steps[idx] && !fetchedData.some(
//             (item) => item.PROCESS === steps[idx].PROCESS && item.UPDATED === "YES"
//           )) {
//             nextStepFound = steps[idx];
//             nextStepIdx = idx;
//             break;
//           }
//         }
//       } else {
//         for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
//           if (steps[idx] && !fetchedData.some(
//             (item) => item.PROCESS === steps[idx].PROCESS && item.OC_UPDATED === "YES"
//           )) {
//             nextStepFound = steps[idx];
//             nextStepIdx = idx + OC_PROCESS_CONCEPTUAL_START_INDEX;
//             break;
//           }
//         }
//       }

//       setImmediateNextStep(nextStepFound);
//       setImmediateNextStepIndex(nextStepIdx);

//       // ✅ NEW: Automatically set the viewed step to the immediate next step on load
//       let detailsForViewedStep = null;
//       if (nextStepFound) {
//         const stepType = nextStepIdx >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "OC Process" : "Provisional NOC";
//         detailsForViewedStep = await fetchStepDetails(plantId, nextStepFound.PROCESS, stepType);
//         setViewedStepConceptualIndex(nextStepIdx); // Set viewed step to the immediate next
//       } else if (steps.length > 0) {
//         // If all steps are complete, view the last OC step by default
//         const lastOCStepIndex = (PROVISIONAL_NOC_STEP_INDICES.length - 1) + OC_PROCESS_CONCEPTUAL_START_INDEX;
//         const lastOCStep = steps[PROVISIONAL_NOC_STEP_INDICES.length - 1]; // Last step of original array
//         detailsForViewedStep = await fetchStepDetails(plantId, lastOCStep.PROCESS, "OC Process");
//         setViewedStepConceptualIndex(lastOCStepIndex);
//       }
//       setViewedStepDetails(detailsForViewedStep);
// console.log('veiwedStepdetials:', viewedStepDetails);

//       setFormData((prev) => ({
//         ...prev,
//         loc: plantId,
//         prjName: currentProjectName,
//         address: currentAddress,
//         applyDate: detailsForViewedStep?.APPLY_DT || "",
//         comments: detailsForViewedStep?.COMMENTS || "",
//         // Removed feePaid, feeAmount, acknowledgeName
//       }));

//     } catch (err) {
//       console.error("Error fetching plant data:", err);
//       Swal.fire("Error", "Failed to load plant data. Please check console.", "error");
//       setStoreData([]);
//       setImmediateNextStep(null);
//       setImmediateNextStepIndex(-1);
//       setViewedStepConceptualIndex(-1);
//       setViewedStepDetails(null);
//       setProjectInfo({ prjName: "", address: "" });
//       setFormData({
//         loc: plantId,
//         applyDate: "",
//         comments: "",
//         prjName: "",
//         address: "",
//         // Removed feePaid, feeAmount, acknowledgeName
//       });
//       setProvisionalNOCCompleted(false);
//     }
//   }, [steps, PROVISIONAL_NOC_STEP_INDICES, OC_PROCESS_CONCEPTUAL_START_INDEX, fetchStepDetails]); // Added fetchStepDetails to dependencies

//   useEffect(() => {
//     axios.get(`${API_BASE_URL}/fire-process`)
//       .then((res) => setSteps(res.data))
//       .catch((err) => console.error("Error fetching FIRE processes:", err));
//   }, []);

//   useEffect(() => {
//     axios.get(`${API_BASE_URL}/fire-plants`)
//       .then((res) => setPlants(res.data))
//       .catch((err) => console.error("Error fetching FIRE plants:", err));
//   }, []);

//   useEffect(() => {
//     fetchPlantData(selectedPlant);
//   }, [selectedPlant, steps, fetchPlantData]);


//   // const handleChange = (e) => {
//   //   const { name, value } = e.target;
//   //   if (name === "loc") {
//   //     setSelectedPlant(value);
//   //     return;
//   //   }
//   //   setFormData((prev) => ({ ...prev, [name]: value }));
//   // };

//   // Removed handleAcknowledgeFileChange and removeAcknowledgeFile


//   const handleChange = async (e) => {
//     const { name, value } = e.target;
  
//     console.log(name, value, "Field changed");
  
//     // 🏗️ When location changes
//     if (name === "loc") {
//       setSelectedPlant(value);
//       setFormData((prev) => ({
//         ...prev,
//         loc: value,
//       }));
  
//       // 🧹 If location is empty, clear dependent fields
//       if (!value || value.trim() === "") {
//         setHeaderData({});
//         setFormData((prev) => ({
//           ...prev,
//           applyDate: "",
//           totalPrjArea: "",
//           noOfNocs: "",
//         }));
//         return;
//       }
  
//       try {
   
//         const res = await getMasterByLoc(value);
  
//         if (res && Object.keys(res).length > 0) {
//           console.log("✅ Master data fetched:", res);

//           setHeaderData(res);

//           setFormData((prev) => ({
//             ...prev,
//           }));
//         } else {
//           console.warn("⚠️ No master data found for location:", value);
//           setHeaderData({});
//           setFormData((prev) => ({
//             ...prev,
//             applyDate: "",
//             totalPrjArea: "",
//             noOfNocs: "",
//           }));
//         }
//       } catch (err) {
//         console.error("❌ Error fetching master by loc:", err);
//         setHeaderData({});
//         setFormData((prev) => ({
//           ...prev,
//           applyDate: "",
//           totalPrjArea: "",
//           noOfNocs: "",
//         }));
//       }
  
//       return;
//     }
  
//     // 🧾 Handle other input fields normally
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };


//   const handleConfirmSubmit = async (emails) => {
//     // Crucially, submission always relates to the `immediateNextStep`
//     if (!formData.loc || !immediateNextStep) {
//       Swal.fire("Selection Error", "Please select a Plant and ensure an active process step.", "error");
//       return;
//     }

//     const currentStepIsOC = immediateNextStepIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX && immediateNextStepIndex < (PROVISIONAL_NOC_STEP_INDICES.length * 2);
//     const stepType = currentStepIsOC ? "OC Process" : "Provisional NOC";

//     const payload = new FormData();
//     payload.append("loc", formData.loc);
//     payload.append("process", immediateNextStep.PROCESS);
//     payload.append("stepType", stepType);
//     payload.append("applyDate", formData.applyDate);
//     payload.append("comments", formData.comments);
//     emails.forEach((email, i) => {
//       payload.append(`emails[${i}]`, email);
//     });
//     // Removed conditional append for OC-specific fields

//     try {
//       await axios.post(`${API_BASE_URL}/fire-update`, payload);
//       await Swal.fire({
//         icon: "success",
//         title: "Step Updated!",
//         text: "Process step updated successfully.",
//         timer: 1500,
//         showConfirmButton: false,
//       });
//       // Removed clearing acknowledgeDocs
//       await fetchPlantData(formData.loc); // Re-fetch all data to refresh state
//     } catch (error) {
//       console.error("Submission failed:", error);
//       Swal.fire("Submission Failed", "Please check the console for details.", "error");
//     }
//   };


//   const handleStepClick = useCallback(async (processName, stepType, conceptualIndex) => {
//     if (!selectedPlant) {
//       Swal.fire("Error", "Please select a plant first", "error");
//       return;
//     }
//     // Update the viewed step's conceptual index
//     setViewedStepConceptualIndex(conceptualIndex);

//     // Fetch details for the clicked step
//     const details = await fetchStepDetails(selectedPlant, processName, stepType);
//     setViewedStepDetails(details);

//     // Populate form with fetched details
//     setFormData((prev) => ({
//       ...prev,
//       applyDate: details?.APPLY_DT || "",
//       comments: details?.COMMENTS || "",
//       // Removed feePaid, feeAmount, acknowledgeName
//     }));
//   }, [selectedPlant, fetchStepDetails]);


//   const renderDocumentHistory = () => {
//     const details = viewedStepDetails; 
//     if (!details || typeof details !== "object" || Object.keys(details).length === 0) {
//       return (<p className="text-muted mb-0">No previous documents for this step.</p>);
//     }

//     let generalDocuments = [];
//     let acknowledgementReceipts = []; // Re-introduced for ACK_DOC

//     if (details.UPLOAD_DOC) {
//       try {
//         const parsedDocs = JSON.parse(details.UPLOAD_DOC);
//         generalDocuments = parsedDocs.map((doc) => ({
//           name: doc.file_name,
//           url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
//         }));
//       } catch (error) {
//         console.error("Failed to parse UPLOAD_DOC JSON:", error);
//       }
//     }

//     // Re-introducing ACK_DOC parsing
//     if (details.ACK_DOC) {
//       try {
//         const parsedAcknowledgeDocs = JSON.parse(details.ACK_DOC);
//         acknowledgementReceipts = parsedAcknowledgeDocs.map((doc) => ({
//           name: doc.file_name,
//           url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
//         }));
//       } catch (error) {
//         console.error("Failed to parse ACK_DOC JSON:", error);
//       }
//     }

//     return (
//     <div className="d-flex flex-column" style={{ height: '100%' }}>
//       <Card style={{padding:'1px', height: '80%', overflow: 'auto' }}>
//         <h6 className="text-primary p-2">General Uploaded Documents</h6>
//         {generalDocuments.length > 0 ? (
//           <ul className="list-unstyled">
//             {generalDocuments.map((doc, idx) => (
//               <li key={`gen-doc-${idx}`} className="p-1">
//                 <a href={doc.url} target="_blank" rel="noreferrer" className="text-decoration-none">
//                   {/* <FaFileAlt className="" /> */}
//                   {doc.name}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-muted mb-0 p-2">No general documents were uploaded for this step.</p>
//         )}

//         {/* Re-introducing Acknowledgement Receipts section */}
//         <h6 className="text-primary mt-3 p-2">Acknowledgement Receipts</h6>
//         {acknowledgementReceipts.length > 0 ? (
//           <ul className="list-unstyled">
//             {acknowledgementReceipts.map((doc, idx) => (
//               <li key={`ack-doc-${idx}`} className="p-1">
//                 <a href={doc.url} target="_blank" rel="noreferrer" className="text-decoration-none">
//                   {/* <FaFileAlt className="me-2" /> */}
//                   {doc.name}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-muted mb-0 p-1">No acknowledgement receipts available for this step.</p>
//         )}
//         </Card>
//       <Card className="m-2 p-2" style={{ height: '25%', overflow: 'hidden' }}>
//        <h6 className="mb-2">Comments</h6>
//        <div
//          style={{
//            whiteSpace: 'nowrap',
//            overflow: 'hidden',
//            textOverflow: 'ellipsis',
//          }}
//        >
//          {formData.comments || 'No comments available'}
//        </div>
//      </Card>
//       </div>
//     );
//   };

//   const renderProcessColumn = (columnTitle, isOCPhase) => {
//     return (
//       <Col xs={6}>
//         <h6 className="text-center mb-2">{columnTitle}</h6>
//         <Nav variant="pills" className="flex-column">
//           {steps.map((step, idx) => {
//             let variant = "secondary", statusIcon = "⏸️";
//             let isCompleted = false;
//             let currentConceptualIndex;

//             if (isOCPhase) {
//               isCompleted = storeData.some(
//                 (item) => item.PROCESS === step.PROCESS && item.OC_UPDATED === "YES"
//               );
//               currentConceptualIndex = idx + OC_PROCESS_CONCEPTUAL_START_INDEX;
//             } else {
//               isCompleted = storeData.some(
//                 (item) => item.PROCESS === step.PROCESS && item.UPDATED === "YES"
//               );
//               currentConceptualIndex = idx;
//             }

//             // Determine if all steps are completed
//             const allStepsCompleted = !immediateNextStep; // This means immediateNextStep is null

//             // Determine if the step is clickable
//             // It's clickable if all steps are completed OR it's a completed step OR it's the immediate next step.
//             const isClickable = allStepsCompleted || isCompleted || (currentConceptualIndex === immediateNextStepIndex);

//             // Determine UI state
//             if (isCompleted) {
//               variant = "success";
//               statusIcon = "✅";
//             } else if (currentConceptualIndex === immediateNextStepIndex) {
//               variant = "warning";
//               statusIcon = "⚠️";
//             }

//             // OC steps are locked if Provisional NOC is not completed
//             const isOCLocked = isOCPhase && !provisionalNOCCompleted;
//             if (isOCLocked && !isCompleted) { // If OC is locked and not yet completed
//                 variant = "secondary";
//                 statusIcon = "🔒";
//             }

//             return (
//               <Nav.Item className="mb-2" key={`${isOCPhase ? 'oc-' : 'pnoc-'}${step.PROCESS}`}>
//                 <Nav.Link
//                   // ✅ ACTIVE STATE: Highlights the step currently being viewed in the form
//                   active={viewedStepConceptualIndex === currentConceptualIndex}
//                   // Modified disabled condition: Disable only if OC is locked AND not already completed,
//                   // or if it's not the immediateNextStep and allStepsCompleted is false
//                   disabled={isOCLocked && !isCompleted}
//                   onClick={() =>
//                     // Only call handleStepClick if not disabled by OC lock
//                     !(isOCLocked && !isCompleted) && handleStepClick(step.PROCESS, isOCPhase ? "OC Process" : "Provisional NOC", currentConceptualIndex)
//                   }
//                   className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
//                   style={{ cursor: (!(isOCLocked && !isCompleted)) ? "pointer" : "not-allowed" }}
//                 >
//                   {statusIcon}
//                   <span>{step.PROCESS}</span>
//                 </Nav.Link>
//               </Nav.Item>
//             );
//           })}
//         </Nav>
//       </Col>
//     );
//   };

//   // Removed isCurrentViewedStepAnOCProcess since OC-specific fields are removed

//   return (
//     <>
//          <ProjectInfoHeader data={headerData} />
//       <Row className="align-items-stretch">
//         <Col md={4} className="d-flex">
//           <div className="border rounded p-3 bg-light flex-fill">
//             <h5 className="text-center mb-3">Process Steps</h5>
//             <Row>
//               {renderProcessColumn("Provisional NOC", false)}
//               {renderProcessColumn("OC Process", true)}
//             </Row>
//           </div>
//         </Col>

//         <Col md={5} className="d-flex flex-column">
//           <Form className="p-3 border rounded bg-light flex-fill">
//             {/* Display the process name of the *viewed* step */}
//             {viewedStepConceptualIndex !== -1 && steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length] ? (
//               <h4 className="mb-3 text-primary fw-bold">
//                 Viewing: {steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length].PROCESS} {viewedStepConceptualIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "(OC Process)" : "(Provisional NOC)"}
//               </h4>
//             ) : (
//                 <h4 className="mb-3 text-muted">Select a Plant to begin</h4>
//             )}
//             {!immediateNextStep && immediateNextStepIndex >= (PROVISIONAL_NOC_STEP_INDICES.length * 2) && (
//                  <h4 className="mb-3 text-success fw-bold">All Process Steps Completed! 🎉</h4>
//             )}


//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Plant</Form.Label>
//                   <Form.Select
//                     name="loc"
//                     value={formData.loc}
//                     onChange={handleChange}
//                   >
//                     <option value="">Select Plant</option>
//                     {plants.map((p, idx) => (
//                       <option key={idx} value={p.loc}>
//                         {p.loc}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>
//                     {steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length]?.PROCESS === steps[1]?.PROCESS // Check if viewed step is the "Inspection" step (index 1)
//                       ? "Inspection Date"
//                       : "Apply Date"}
//                   </Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="applyDate"
//                     value={formData.applyDate || ""}
//                     onChange={handleChange}
//                     // ✅ Editable ONLY if viewing the *immediate next step*
//                     // disabled={viewedStepConceptualIndex !== immediateNextStepIndex || !immediateNextStep}
//                     disabled={true}
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Form.Group className="mb-3">
//               <Form.Label>Comments</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={2}
//                 name="comments"
//                 value={formData.comments || ""}
//                 onChange={handleChange}
//                 // ✅ Editable ONLY if viewing the *immediate next step*
//                 // disabled={viewedStepConceptualIndex !== immediateNextStepIndex || !immediateNextStep}
//                 disabled={true}
//               />
//             </Form.Group>

//             {/* Removed OC-specific fields */}

//             <div className="d-grid mt-3">
//               <OverlayTrigger
//                 placement="top"
//                 overlay={
//                   <Tooltip id="update-tooltip">
//                     { !selectedPlant ? "Please select a Plant." :
//                       (!immediateNextStep ? "All steps are completed." :
//                       (viewedStepConceptualIndex !== immediateNextStepIndex ? "You can only update the active step." :
//                       "Click here to update the current active step."))
//                     }
//                   </Tooltip>
//                 }
//               >
//                 <span className="d-grid"> {/* Span is needed for disabled OverlayTrigger */}
//                   <Button
//                     variant="primary"
//                     size="lg"
//                     onClick={handleEmailSubmit}
//                     // ✅ Enabled ONLY if viewing the *immediate next step*
//                     disabled={!formData.loc || !immediateNextStep || (viewedStepConceptualIndex !== immediateNextStepIndex)}
//                     style={(!formData.loc || !immediateNextStep || (viewedStepConceptualIndex !== immediateNextStepIndex)) ? { pointerEvents: "none" } : {}}
//                   >
//                     Update
//                   </Button>
//                 </span>
//               </OverlayTrigger>
//             </div>
//           </Form>
//         </Col>

//              <Col md={3} className="d-flex w-25">
//                   <div className="border rounded p-3 bg-white flex-fill d-flex flex-column w-50">
//                     <h5 className="mb-3 text-dark">
//                       Document History
//                     </h5>
//                     <div className="flex-grow-1 overflow-auto">
//                       {renderDocumentHistory()}
//                     </div>
//                   </div>
//                 </Col>

 
//       </Row>

//         <EmailSelectionModal
//         show={showEmailModal}
//         onHide={() => setShowEmailModal(false)}
//         onSubmit={handleEmailSelectionSubmit}
//         processName={immediateNextStep?.PROCESS}
//         plantName={formData?.loc}
//         applyDate={formData?.applyDate}
//         comments={formData?.comments}
//       />
//     </>
//   );
// };

// export default FireUpdateTable;
import React, { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { Nav, Form, Button, Row, Col, Badge, Modal, OverlayTrigger, Tooltip, Card } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import { FaFileAlt, FaHistory } from "react-icons/fa";
import { Context } from "../context/ContextData";
import { getMasterByLoc } from "../api/Api";
import ProjectInfoHeader from "./ProjectInfoHeader";
import EmailSelectionModal from "./EmailModal";

const FireUpdateTable = () => {
  const [steps, setSteps] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  
  const { 
    storeData, 
    setStoreData, 
    respModifyData, 
    setRespModifyData, 
    setHeaderData, 
    headerData 
  } = useContext(Context);

  const [formData, setFormData] = useState({
    loc: "",
    applyDate: "",
    document: null,
    comments: "",
    prjName: "",
    address: "",
  });

  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [viewedStepConceptualIndex, setViewedStepConceptualIndex] = useState(-1);
  const [viewedStepDetails, setViewedStepDetails] = useState(null);
  const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });
  const [provisionalNOCCompleted, setProvisionalNOCCompleted] = useState(false);

  const PROVISIONAL_NOC_STEP_INDICES = useMemo(() => [0, 1, 2, 3, 4], []);
  const OC_PROCESS_CONCEPTUAL_START_INDEX = PROVISIONAL_NOC_STEP_INDICES.length;

  // Function to parse and get logs for current viewed step
  const getCurrentStepLogs = useCallback(() => {
    if (!viewedStepDetails?.LOG) {
      return [];
    }
    
    try {
      const logs = JSON.parse(viewedStepDetails.LOG);
      return Array.isArray(logs) ? logs : [];
    } catch (error) {
      console.error("Failed to parse logs:", error);
      return [];
    }
  }, [viewedStepDetails]);

  const fetchStepDetails = useCallback(async (plantId, processName, stepType) => {
    if (!plantId || !processName || !stepType) return null;
    try {
      const apiUrl = `${API_BASE_URL}/fire-step-details/${encodeURIComponent(plantId)}/${encodeURIComponent(processName)}/${encodeURIComponent(stepType)}`;
      const detailsRes = await axios.get(apiUrl);
      return detailsRes.data || null;
    } catch (error) {
      console.error(`Error fetching details for step: ${processName} (${stepType})`, error);
      return null;
    }
  }, []);

  const fetchPlantData = useCallback(async (plantId) => {
    if (!plantId || steps.length === 0) {
      setStoreData([]);
      setImmediateNextStep(null);
      setImmediateNextStepIndex(-1);
      setViewedStepConceptualIndex(-1);
      setViewedStepDetails(null);
      setProjectInfo({ prjName: "", address: "" });
      setFormData({
        loc: plantId,
        applyDate: "",
        comments: "",
        prjName: "",
        address: "",
      });
      setProvisionalNOCCompleted(false);
      setSelectedLogs([]); // Clear logs
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/fire-data?plant=${plantId}`);
      const fetchedData = res.data;
      setStoreData(fetchedData);

      let currentProjectName = "";
      let currentAddress = "";
      if (fetchedData && fetchedData.length > 0) {
        const firstRecord = fetchedData[0];
        currentProjectName = firstRecord.PROJECT_NAME || "";
        currentAddress = firstRecord.ADDRESS || "";
        setProjectInfo({ prjName: currentProjectName, address: currentAddress });
      } else {
        setProjectInfo({ prjName: "", address: "" });
      }

      const allProvisionalNOCStepsCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
        (index) => steps[index] && fetchedData.some(
          (item) => item.PROCESS === steps[index].PROCESS && item.UPDATED === "YES"
        )
      );
      setProvisionalNOCCompleted(allProvisionalNOCStepsCompleted);

      let nextStepFound = null;
      let nextStepIdx = -1;

      if (!allProvisionalNOCStepsCompleted) {
        for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
          if (steps[idx] && !fetchedData.some(
            (item) => item.PROCESS === steps[idx].PROCESS && item.UPDATED === "YES"
          )) {
            nextStepFound = steps[idx];
            nextStepIdx = idx;
            break;
          }
        }
      } else {
        for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
          if (steps[idx] && !fetchedData.some(
            (item) => item.PROCESS === steps[idx].PROCESS && item.OC_UPDATED === "YES"
          )) {
            nextStepFound = steps[idx];
            nextStepIdx = idx + OC_PROCESS_CONCEPTUAL_START_INDEX;
            break;
          }
        }
      }

      setImmediateNextStep(nextStepFound);
      setImmediateNextStepIndex(nextStepIdx);

      let detailsForViewedStep = null;
      if (nextStepFound) {
        const stepType = nextStepIdx >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "OC Process" : "Provisional NOC";
        detailsForViewedStep = await fetchStepDetails(plantId, nextStepFound.PROCESS, stepType);
        setViewedStepConceptualIndex(nextStepIdx);
      } else if (steps.length > 0) {
        const lastOCStepIndex = (PROVISIONAL_NOC_STEP_INDICES.length - 1) + OC_PROCESS_CONCEPTUAL_START_INDEX;
        const lastOCStep = steps[PROVISIONAL_NOC_STEP_INDICES.length - 1];
        detailsForViewedStep = await fetchStepDetails(plantId, lastOCStep.PROCESS, "OC Process");
        setViewedStepConceptualIndex(lastOCStepIndex);
      }
      
      setViewedStepDetails(detailsForViewedStep);

      // Load logs if available
      if (detailsForViewedStep?.LOG) {
        try {
          const logs = JSON.parse(detailsForViewedStep.LOG);
          setSelectedLogs(Array.isArray(logs) ? logs : []);
        } catch (error) {
          console.error("Failed to parse LOG JSON:", error);
          setSelectedLogs([]);
        }
      } else {
        setSelectedLogs([]);
      }

      setFormData((prev) => ({
        ...prev,
        loc: plantId,
        prjName: currentProjectName,
        address: currentAddress,
        applyDate: detailsForViewedStep?.APPLY_DT || "",
        comments: detailsForViewedStep?.COMMENTS || "",
      }));

    } catch (err) {
      console.error("Error fetching plant data:", err);
      Swal.fire("Error", "Failed to load plant data. Please check console.", "error");
      setStoreData([]);
      setImmediateNextStep(null);
      setImmediateNextStepIndex(-1);
      setViewedStepConceptualIndex(-1);
      setViewedStepDetails(null);
      setProjectInfo({ prjName: "", address: "" });
      setFormData({
        loc: plantId,
        applyDate: "",
        comments: "",
        prjName: "",
        address: "",
      });
      setProvisionalNOCCompleted(false);
      setSelectedLogs([]);
    }
  }, [steps, PROVISIONAL_NOC_STEP_INDICES, OC_PROCESS_CONCEPTUAL_START_INDEX, fetchStepDetails]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/fire-process`)
      .then((res) => setSteps(res.data))
      .catch((err) => console.error("Error fetching FIRE processes:", err));
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/fire-plants`)
      .then((res) => setPlants(res.data))
      .catch((err) => console.error("Error fetching FIRE plants:", err));
  }, []);

  useEffect(() => {
    fetchPlantData(selectedPlant);
  }, [selectedPlant, steps, fetchPlantData]);

  const handleEmailSubmit = () => {
    const newErrors = {};
    if (!formData.loc) newErrors.loc = "Plant selection is required";
    if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

    if (Object.keys(newErrors).length > 0) {
      Swal.fire("Validation Error", Object.values(newErrors).join("<br>"), "error");
      return;
    }

    setShowEmailModal(true);
  };

  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);
    await handleConfirmSubmit(emails);
  };

  const handleConfirmSubmit = async (emails) => {
    if (!formData.loc || !immediateNextStep) {
      Swal.fire("Selection Error", "Please select a Plant and ensure an active process step.", "error");
      return;
    }

    const currentStepIsOC = immediateNextStepIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX && immediateNextStepIndex < (PROVISIONAL_NOC_STEP_INDICES.length * 2);
    const stepType = currentStepIsOC ? "OC Process" : "Provisional NOC";

    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("stepType", stepType);
    payload.append("applyDate", formData.applyDate);
    payload.append("comments", formData.comments);
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    try {
      await axios.post(`${API_BASE_URL}/fire-update`, payload);
      await Swal.fire({
        icon: "success",
        title: "Step Updated!",
        text: "Process step updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      await fetchPlantData(formData.loc);
    } catch (error) {
      console.error("Submission failed:", error);
      Swal.fire("Submission Failed", "Please check the console for details.", "error");
    }
  };

  const handleStepClick = useCallback(async (processName, stepType, conceptualIndex) => {
    if (!selectedPlant) {
      Swal.fire("Error", "Please select a plant first", "error");
      return;
    }
    
    setViewedStepConceptualIndex(conceptualIndex);
    const details = await fetchStepDetails(selectedPlant, processName, stepType);
    setViewedStepDetails(details);

    // Load logs for the clicked step
    if (details?.LOG) {
      try {
        const logs = JSON.parse(details.LOG);
        setSelectedLogs(Array.isArray(logs) ? logs : []);
      } catch (error) {
        console.error("Failed to parse LOG JSON:", error);
        setSelectedLogs([]);
      }
    } else {
      setSelectedLogs([]);
    }

    setFormData((prev) => ({
      ...prev,
      applyDate: details?.APPLY_DT || "",
      comments: details?.COMMENTS || "",
    }));
  }, [selectedPlant, fetchStepDetails]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "loc") {
      setSelectedPlant(value);
      setFormData((prev) => ({
        ...prev,
        loc: value,
      }));

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
        const res = await getMasterByLoc(value);
        if (res && Object.keys(res).length > 0) {
          setHeaderData(res);
        } else {
          setHeaderData({});
        }
      } catch (err) {
        console.error("Error fetching master by loc:", err);
        setHeaderData({});
      }

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderDocumentHistory = () => {
    const details = viewedStepDetails; 
    if (!details || typeof details !== "object" || Object.keys(details).length === 0) {
      return (<p className="text-muted mb-0">No previous documents for this step.</p>);
    }

    let generalDocuments = [];
    let acknowledgementReceipts = [];

    if (details.UPLOAD_DOC) {
      try {
        const parsedDocs = JSON.parse(details.UPLOAD_DOC);
        generalDocuments = parsedDocs.map((doc) => ({
          name: doc.file_name,
          url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
        }));
      } catch (error) {
        console.error("Failed to parse UPLOAD_DOC JSON:", error);
      }
    }

    if (details.ACK_DOC) {
      try {
        const parsedAcknowledgeDocs = JSON.parse(details.ACK_DOC);
        acknowledgementReceipts = parsedAcknowledgeDocs.map((doc) => ({
          name: doc.file_name,
          url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
        }));
      } catch (error) {
        console.error("Failed to parse ACK_DOC JSON:", error);
      }
    }

    const currentStepLogs = getCurrentStepLogs();

    return (
      <div className="d-flex flex-column" style={{ height: '100%' }}>
        <Card style={{padding:'1px', height: '80%', overflow: 'auto' }}>
          <h6 className="text-primary p-2">General Uploaded Documents</h6>
          {generalDocuments.length > 0 ? (
            <ul className="list-unstyled">
              {generalDocuments.map((doc, idx) => (
                <li key={`gen-doc-${idx}`} className="p-1">
                  <a href={doc.url} target="_blank" rel="noreferrer" className="text-decoration-none">
                    {doc.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0 p-2">No general documents were uploaded for this step.</p>
          )}

          <h6 className="text-primary mt-3 p-2">Acknowledgement Receipts</h6>
          {acknowledgementReceipts.length > 0 ? (
            <ul className="list-unstyled">
              {acknowledgementReceipts.map((doc, idx) => (
                <li key={`ack-doc-${idx}`} className="p-1">
                  <a href={doc.url} target="_blank" rel="noreferrer" className="text-decoration-none">
                    {doc.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0 p-1">No acknowledgement receipts available for this step.</p>
          )}
        </Card>
        
        {/* Comments Card with View Logs Button */}
        <Card className="m-2 p-2" style={{ height: '25%', overflow: 'hidden' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Comments</h6>
            {selectedLogs.length > 0 && (
              <Button 
                variant="outline-info" 
                size="sm"
                onClick={() => setShowLogsModal(true)}
                className="d-flex align-items-center gap-1"
              >
                <FaHistory size={12} />
                View Logs
              </Button>
            )}
          </div>
          <div style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            cursor: selectedLogs.length > 0 ? 'pointer' : 'default'
          }}
          onClick={() => {
            if (selectedLogs.length > 0) {
              setShowLogsModal(true);
            }
          }}
          title={selectedLogs.length > 0 ? "Click to view full logs" : ""}
          >
          </div>
          {selectedLogs.length > 0 && (
            <small className="text-muted mt-1 d-block">
              {selectedLogs.length} log entries available
            </small>
          )}
        </Card>
      </div>
    );
  };

  const renderProcessColumn = (columnTitle, isOCPhase) => {
    return (
      <Col xs={6}>
        <h6 className="text-center mb-2">{columnTitle}</h6>
        <Nav variant="pills" className="flex-column">
          {steps.map((step, idx) => {
            let variant = "secondary", statusIcon = "⏸️";
            let isCompleted = false;
            let currentConceptualIndex;

            if (isOCPhase) {
              isCompleted = storeData.some(
                (item) => item.PROCESS === step.PROCESS && item.OC_UPDATED === "YES"
              );
              currentConceptualIndex = idx + OC_PROCESS_CONCEPTUAL_START_INDEX;
            } else {
              isCompleted = storeData.some(
                (item) => item.PROCESS === step.PROCESS && item.UPDATED === "YES"
              );
              currentConceptualIndex = idx;
            }

            const allStepsCompleted = !immediateNextStep;
            const isClickable = allStepsCompleted || isCompleted || (currentConceptualIndex === immediateNextStepIndex);

            if (isCompleted) {
              variant = "success";
              statusIcon = "✅";
            } else if (currentConceptualIndex === immediateNextStepIndex) {
              variant = "warning";
              statusIcon = "⚠️";
            }

            const isOCLocked = isOCPhase && !provisionalNOCCompleted;
            if (isOCLocked && !isCompleted) {
              variant = "secondary";
              statusIcon = "🔒";
            }

            return (
              <Nav.Item className="mb-2" key={`${isOCPhase ? 'oc-' : 'pnoc-'}${step.PROCESS}`}>
                <Nav.Link
                  active={viewedStepConceptualIndex === currentConceptualIndex}
                  disabled={isOCLocked && !isCompleted}
                  onClick={() =>
                    !(isOCLocked && !isCompleted) && handleStepClick(step.PROCESS, isOCPhase ? "OC Process" : "Provisional NOC", currentConceptualIndex)
                  }
                  className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                  style={{ cursor: (!(isOCLocked && !isCompleted)) ? "pointer" : "not-allowed" }}
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
        <Col md={4} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h5 className="text-center mb-3">Process Steps</h5>
            <Row>
              {renderProcessColumn("Provisional NOC", false)}
              {renderProcessColumn("OC Process", true)}
            </Row>
          </div>
        </Col>

        <Col md={5} className="d-flex flex-column">
          <Form className="p-3 border rounded bg-light flex-fill">
            {viewedStepConceptualIndex !== -1 && steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length] ? (
              <h4 className="mb-3 text-primary fw-bold">
                Viewing: {steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length].PROCESS} {viewedStepConceptualIndex >= OC_PROCESS_CONCEPTUAL_START_INDEX ? "(OC Process)" : "(Provisional NOC)"}
              </h4>
            ) : (
              <h4 className="mb-3 text-muted">Select a Plant to begin</h4>
            )}
            {!immediateNextStep && immediateNextStepIndex >= (PROVISIONAL_NOC_STEP_INDICES.length * 2) && (
              <h4 className="mb-3 text-success fw-bold">All Process Steps Completed! 🎉</h4>
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
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    {steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length]?.PROCESS === steps[1]?.PROCESS
                      ? "Inspection Date"
                      : "Apply Date"}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="applyDate"
                    value={formData.applyDate || ""}
                    onChange={handleChange}
                    disabled={true}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="comments"
                value={formData.comments || ""}
                onChange={handleChange}
                disabled={true}
              />
            </Form.Group>

            <div className="d-grid mt-3">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="update-tooltip">
                    {!selectedPlant ? "Please select a Plant." :
                      (!immediateNextStep ? "All steps are completed." :
                      (viewedStepConceptualIndex !== immediateNextStepIndex ? "You can only update the active step." :
                      "Click here to update the current active step."))
                    }
                  </Tooltip>
                }
              >
                <span className="d-grid">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleEmailSubmit}
                    disabled={!formData.loc || !immediateNextStep || (viewedStepConceptualIndex !== immediateNextStepIndex)}
                    style={(!formData.loc || !immediateNextStep || (viewedStepConceptualIndex !== immediateNextStepIndex)) ? { pointerEvents: "none" } : {}}
                  >
                    Update
                  </Button>
                </span>
              </OverlayTrigger>
            </div>
          </Form>
        </Col>

        <Col md={3} className="d-flex w-25">
          <div className="border rounded p-3 bg-white flex-fill d-flex flex-column w-50">
            <h5 className="mb-3 text-dark">
              Document History
            </h5>
            <div className="flex-grow-1 overflow-auto">
              {renderDocumentHistory()}
            </div>
          </div>
        </Col>
      </Row>

      {/* Logs Modal */}
      <Modal show={showLogsModal} onHide={() => setShowLogsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaHistory className="me-2" />
            Activity Logs - {viewedStepConceptualIndex !== -1 ? steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length]?.PROCESS : "Step"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {selectedLogs.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-muted">No activity logs available for this step.</p>
            </div>
          ) : (
            <div className="timeline">
            {selectedLogs && selectedLogs.length > 0 ? (
  selectedLogs.map((logItem, i) => {
   
return (
  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
    <strong>{logItem.date}</strong>
    <span>{logItem.comment}</span>
  </div>
);




  })
) : (
  <p>No logs available</p>
)}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData?.loc}
        applyDate={formData?.applyDate}
        comments={formData?.comments}
      />
    </>
  );
};

export default FireUpdateTable;