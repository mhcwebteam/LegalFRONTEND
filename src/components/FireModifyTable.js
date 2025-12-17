// import React, { useEffect, useState, useMemo, useContext } from "react";
// import {
//   Nav,
//   Form,
//   Button,
//   Row,
//   Col,
//   Badge,
//   Modal,
//   Card,
// } from "react-bootstrap";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { API_BASE_URL, API_DOC_URL } from "../config/Config";
// import FormHeader from "./Header";
// import ReraDocUploadModal from "./ReraDocUploadModal";
// import { FaFileAlt } from "react-icons/fa";
// import ProjectInfoHeader from "./ProjectInfoHeader";
// import { Context } from "../context/ContextData";
// import { getMasterByLoc } from "../api/Api";
// import EmailSelectionModal from "./EmailModal";

// const FireModifyTable = () => {
//   const {
//     storeData,
//     setStoreData,
//     respModifyData,
//     setRespModifyData,
//     setHeaderData,
//     headerData,
//   } = useContext(Context);

//   const [steps, setSteps] = useState([]);
//   const [plants, setPlants] = useState([]);
//   const [selectedPlant, setSelectedPlant] = useState("");
//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [emailRecipients, setEmailRecipients] = useState([]);
//   const [selectedEmails, setSelectedEmails] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formData, setFormData] = useState({
//     loc: "",
//     applyDate: "",
//     document: null,
//     comments: "",
//     prjName: "",
//     address: "",
//     feePaid: "",
//     feeAmount: "",
//     acknowledgeName: "",
//     noOfTowers: "",
//     feepaidstatus: "", // Fixed field name
//   });
//   const [showLogsModal, setShowLogsModal] = useState(false);
//   const [selectedLogs, setSelectedLogs] = useState([]);
//  const [stepdata, setSetData] = useState([]);
//   const [immediateNextStep, setImmediateNextStep] = useState(null);
//   const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
//   const [nextStepDetails, setNextStepDetails] = useState(null);

//   const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });
//   const [newDocs, setNewDocs] = useState([]);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [acknowledgeDocs, setAcknowledgeDocs] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [provisionalNOCCompleted, setProvisionalNOCCompleted] = useState(false);
//   const [currentProcess, setCurrentProcess] = useState("");
//   const [latestLogs, setLatestLogs] = useState([]);

//   const PROVISIONAL_NOC_STEP_INDICES = useMemo(() => [0, 1, 2, 3, 4], []);
//   const OC_PROCESS_STEP_RANGE = useMemo(() => [5, 6, 7, 8, 9, 10], []);

//   const provisionalRadioLabels = {
//     1: "Site Inspection Status",
//     2: "Queries Received?",
//     3: "Committee Approved?",
//     4: "Provisional Status?",
//   };

//   const ocRadioLabels = {
//     6: "Site Inspection Status?",
//     7: "Queries Received?",
//     8: "Committee Approved?",
//     9: "OC Status?",
//   };

//   useEffect(() => {
//     axios
//       .get(`${API_BASE_URL}/fire-process`)
//       .then((res) => setSteps(res.data))
//       .catch((err) => console.error("Error fetching FIRE processes:", err));
//   }, []);

//   useEffect(() => {
//     axios
//       .get(`${API_BASE_URL}/fire-plants`)
//       .then((res) => setPlants(res.data))
//       .catch((err) => console.error("Error fetching FIRE plants:", err));
//   }, []);

//   useEffect(() => {
//     setStoreData([]);
//     setImmediateNextStep(null);
//     setImmediateNextStepIndex(-1);
//     setNextStepDetails(null);
//     setProjectInfo({ prjName: "", address: "" });
//     setFormData({
//       loc: selectedPlant,
//       applyDate: "",
//       comments: "",
//       prjName: "",
//       address: "",
//       feePaid: "",
//       feeAmount: "",
//       acknowledgeName: "",
//       noOfTowers: "",
//       feepaidstatus: ""
//     });
//     setNewDocs([]);
//     setAcknowledgeDocs([]);
//     setErrors({});
//     setProvisionalNOCCompleted(false);

//     if (selectedPlant && steps.length > 0) {
//       axios
//         .get(`${API_BASE_URL}/fire-data?plant=${selectedPlant}`)
//         .then((res) => {
//           const fetchedData = res.data;
//           setStoreData(fetchedData);

//           if (fetchedData && fetchedData.length > 0) {
//             const firstRecord = fetchedData[0];
//             const info = {
//               prjName: firstRecord.PROJECT_NAME || "",
//               address: firstRecord.ADDRESS || "",
//             };
//             setProjectInfo(info);
//             if (
//               PROVISIONAL_NOC_STEP_INDICES[0] === 0 &&
//               !fetchedData.some(
//                 (item) =>
//                   item.PROCESS === steps[0]?.PROCESS && item.UPDATED === "YES"
//               )
//             ) {
//               setFormData((prev) => ({ ...prev, ...info }));
//             } else {
//               setFormData((prev) => ({
//                 ...prev,
//                 prjName: info.prjName,
//                 address: info.address,
//               }));
//             }
//           }

//           const provisionalNOCStepsCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
//             (index) =>
//               steps[index] &&
//               fetchedData.some(
//                 (item) =>
//                   item.PROCESS === steps[index].PROCESS &&
//                   item.UPDATED === "YES"
//               )
//           );
//           setProvisionalNOCCompleted(provisionalNOCStepsCompleted);

//           let nextStepFound = null;
//           let nextStepIdx = -1;
//           let currentStepType = null;

//           if (!provisionalNOCStepsCompleted) {
//             for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
//               if (
//                 steps[idx] &&
//                 !fetchedData.some(
//                   (item) =>
//                     item.PROCESS === steps[idx].PROCESS &&
//                     item.UPDATED === "YES"
//                 )
//               ) {
//                 nextStepFound = steps[idx];
//                 nextStepIdx = idx;
//                 currentStepType = "ProvisionalNOC";
//                 break;
//               }
//             }
//           } else {
//             for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
//               if (
//                 steps[idx] &&
//                 !fetchedData.some(
//                   (item) =>
//                     item.PROCESS === steps[idx].PROCESS &&
//                     item.OC_UPDATED === "YES"
//                 )
//               ) {
//                 nextStepFound = steps[idx];
//                 nextStepIdx = idx + PROVISIONAL_NOC_STEP_INDICES.length;
//                 currentStepType = "OCPROCESS";
//                 break;
//               }
//             }
//           }

//           setImmediateNextStep(nextStepFound);
//           setImmediateNextStepIndex(nextStepIdx);
//           setCurrentProcess(currentStepType);

//           if (nextStepFound) {
//             const apiUrl = `${API_BASE_URL}/fire-step-details/${encodeURIComponent(
//               selectedPlant
//             )}/${encodeURIComponent(
//               nextStepFound.PROCESS
//             )}/${encodeURIComponent(currentStepType)}`;
//             return axios.get(apiUrl);
//           } else {
//             const allOCStepsCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
//               (index) =>
//                 steps[index] &&
//                 fetchedData.some(
//                   (item) =>
//                     item.PROCESS === steps[index].PROCESS &&
//                     item.OC_UPDATED === "YES"
//                 )
//             );

//             if (provisionalNOCStepsCompleted && allOCStepsCompleted) {
//               setImmediateNextStepIndex(PROVISIONAL_NOC_STEP_INDICES.length * 2);
//             }
//             return Promise.resolve(null);
//           }
//         })
//         .then((detailsRes) => {
//           if (detailsRes && detailsRes.data) {
//             const details = detailsRes.data;
//             setNextStepDetails(details);
//             setLatestLogs(details);
// setSetData(details)

//     const currentStepRecord = storeData.find(
//             (item) =>
//               item.PROCESS?.trim() === immediateNextStep?.PROCESS?.trim() &&
//               item.STEPTYPE === currentProcess
//           );

//             setFormData((prev) => ({
//               ...prev,
//               applyDate: details.APPLY_DT || "",
//               comments: details.COMMENTS || "",
//               logs: details.LOG || "",
//               feePaid: details.FEE_PAID || "",
//               feeAmount: details.FEE_AMOUNT || "",
//               acknowledgeName: details.ACKNOWLEDGE_NAME || "",
//               noOfTowers: details.NO_OF_TOWERS || "",
//               feepaidstatus: details.FEE_PAID_STATUS || "" ,
//                  [`stepStatus_${immediateNextStepIndex}`]: 
//               currentStepRecord?.LEVEL_STATUS || ""// Load feepaidstatus from backend
//             }));
//           } else {
//             setNextStepDetails(null);
//             setFormData((prev) => ({
//               ...prev,
//               applyDate: "",
//               comments: "",
//               logs: "",
//               feePaid: "",
//               feeAmount: "",
//               acknowledgeName: "",
//               noOfTowers: "",
//               feepaidstatus: ""
//             }));
//           }
//         })
//         .catch((err) =>
//           console.error("Error during data fetching process:", err)
//         );
//     }
//   }, [selectedPlant, steps, PROVISIONAL_NOC_STEP_INDICES]);

//   useEffect(() => {
//     if (
//       nextStepDetails &&
//       typeof nextStepDetails === "object" &&
//       Object.keys(nextStepDetails).length > 0
//     ) {
//       const details = nextStepDetails;
//       setFormData((prev) => ({
//         ...prev,
//         applyDate: details.APPLY_DT,
//         comments: "",
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, applyDate: "", comments: "" }));
//     }
//   }, [nextStepDetails]);

//   const getCurrentStepLogs = () => {
//     const currentStepRecord = storeData.find(
//       (item) =>
//         item.PROCESS?.trim() === immediateNextStep?.PROCESS?.trim() &&
//         item.STEPTYPE === currentProcess
//     );

//     if (!currentStepRecord?.LOG) {
//       return [];
//     }

//     try {
//       return JSON.parse(currentStepRecord.LOG);
//     } catch (error) {
//       console.error("Failed to parse logs:", error);
//       return [];
//     }
//   };

//   const handleChange = async (e) => {
//     const { name, value } = e.target;

//     if (name === "loc") {
//       setSelectedPlant(value);
//       setFormData((prev) => ({
//         ...prev,
//         loc: value,
//       }));

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
//           setHeaderData(res);
//         } else {
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

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleEmailSubmit = () => {
//     const newErrors = {};

//     if (!formData.loc) newErrors.loc = "Plant selection is required";
//     if (!formData.applyDate) newErrors.applyDate = "Apply date is required";
//     if (!formData.comments) newErrors.comments = "Please enter comments";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     setErrors({});
//     setShowEmailModal(true);
//   };

//   const handleEmailSelectionSubmit = async (emails) => {
//     setSelectedEmails(emails);
//     setShowEmailModal(false);
//     await handleConfirmSubmit(emails);
//   };

//   const handleConfirmSubmit = async (emails) => {
//     setIsSubmitting(true);
//     const newErrors = {};
//     setErrors({});

//     if (!formData.loc || !immediateNextStep) {
//       Swal.fire(
//         "Validation Error",
//         "Please select a Plant and ensure a process step is active.",
//         "error"
//       );
//       setIsSubmitting(false);
//       return;
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       const errorMessages = Object.values(newErrors).join("<br>");
//       Swal.fire("Validation Error", errorMessages, "error");
//       setIsSubmitting(false);
//       return;
//     }

//     const payload = new FormData();
//     payload.append("loc", formData.loc);
//     payload.append("process", immediateNextStep.PROCESS);
//     payload.append("comments", formData.comments || "");
//     payload.append("applyDate", formData.applyDate || "");
//     emails.forEach((email, i) => {
//       payload.append(`emails[${i}]`, email);
//     });
//     payload.append("steptype", currentProcess);


//     // Add Number of Towers, Fee Amount, and Fee Paid Status only for Application Submission
//     if (immediateNextStepIndex === 0 && immediateNextStep?.PROCESS === "Application Submission") {
//       payload.append("noOfTowers", formData.noOfTowers || "");
//       payload.append("feeAmount", formData.feeAmount || "");
//       // payload.append("feepaidstatus", formData.feepaidstatus || "");
//  payload.append("feePaid", formData.feepaidstatus || "");

//     }

//       if (immediateNextStepIndex >= 1) {

    

//       payload.append(
//         "stepStatus",
//         formData[`stepStatus_${immediateNextStepIndex}`] || ""
//       );
//     }

//     newDocs.forEach((file) => payload.append("New_Doc[]", file));

   
//     payload.append("acknowledgeName", formData.acknowledgeName || "");

//     acknowledgeDocs.forEach((file) =>
//       payload.append("Acknowledge_Doc[]", file)
//     );

//     const currentStepRecord = storeData.find(
//       (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim() && item.STEPTYPE === currentProcess
//     );

//     const apiUrl = currentStepRecord
//       ? `${API_BASE_URL}/fire-modify`
//       : `${API_BASE_URL}/fire-submit`;

//     try {
//       await axios.post(apiUrl, payload);
//       await Swal.fire({
//         icon: "success",
//         title: currentStepRecord ? "Updated!" : "Submitted!",
//         text: "Your data has been saved successfully.",
//         timer: 1500,
//         showConfirmButton: false,
//       });

   
//       setFormData((prev) => ({
//         ...prev,
//         applyDate: "",
//         comments: "",
//         feePaid: "",
//         feeAmount: "",
//         acknowledgeName: "",
//         noOfTowers: "",
//         feepaidstatus: ""
//       }));
//       setNewDocs([]);
//       setAcknowledgeDocs([]);
//       setErrors({});
//     } catch (error) {
//       console.error("Submission failed:", error);
//       Swal.fire(
//         "Submission Failed",
//         "Please check the console for details.",
//         "error"
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDeleteDocument = async (docType, fileName, index) => {
//     try {
//       const result = await Swal.fire({
//         title: 'Delete Document?',
//         text: `Are you sure you want to delete ${fileName}?`,
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#d33',
//         cancelButtonColor: '#3085d6',
//         confirmButtonText: 'Yes, delete it!'
//       });

//       if (!result.isConfirmed) return;

//       const response = await axios.delete(`${API_BASE_URL}/docmt-fire-dlt`, {
//         data: {
//           loc: formData.loc,
//           process: immediateNextStep?.PROCESS || "",
//           steptype: currentProcess,
//           doc_type: docType,
//           file_name: fileName,
//         },
//       });

//       if (response.status === 200) {
//         if (nextStepDetails) {
//           const updatedDetails = { ...nextStepDetails };

//           if (docType === "UPLOAD_DOC" && updatedDetails.UPLOAD_DOC) {
//             try {
//               const parsedDocs = JSON.parse(updatedDetails.UPLOAD_DOC);
//               const filteredDocs = parsedDocs.filter(doc => doc.file_name !== fileName);
//               updatedDetails.UPLOAD_DOC = JSON.stringify(filteredDocs);
//             } catch (error) {
//               console.error("Error updating UPLOAD_DOC:", error);
//             }
//           } else if (docType === "ACK_DOC" && updatedDetails.ACK_DOC) {
//             try {
//               const parsedDocs = JSON.parse(updatedDetails.ACK_DOC);
//               const filteredDocs = parsedDocs.filter(doc => doc.file_name !== fileName);
//               updatedDetails.ACK_DOC = JSON.stringify(filteredDocs);
//             } catch (error) {
//               console.error("Error updating ACK_DOC:", error);
//             }
//           }

//           setNextStepDetails(updatedDetails);
//         }

//         if (storeData && storeData.length > 0) {
//           const updatedStoreData = storeData.map(item => {
//             if (item.PROCESS === immediateNextStep.PROCESS && item.STEPTYPE === currentProcess) {
//               const updatedItem = { ...item };

//               if (docType === "UPLOAD_DOC" && updatedItem.UPLOAD_DOC) {
//                 try {
//                   const parsedDocs = JSON.parse(updatedItem.UPLOAD_DOC);
//                   const filteredDocs = parsedDocs.filter(doc => doc.file_name !== fileName);
//                   updatedItem.UPLOAD_DOC = JSON.stringify(filteredDocs);
//                 } catch (error) {
//                   console.error("Error updating storeData UPLOAD_DOC:", error);
//                 }
//               } else if (docType === "ACK_DOC" && updatedItem.ACK_DOC) {
//                 try {
//                   const parsedDocs = JSON.parse(updatedItem.ACK_DOC);
//                   const filteredDocs = parsedDocs.filter(doc => doc.file_name !== fileName);
//                   updatedItem.ACK_DOC = JSON.stringify(filteredDocs);
//                 } catch (error) {
//                   console.error("Error updating storeData ACK_DOC:", error);
//                 }
//               }

//               return updatedItem;
//             }
//             return item;
//           });

//           setStoreData(updatedStoreData);
//         }

//         Swal.fire('Deleted!', 'Document has been deleted.', 'success');
//       }
//     } catch (error) {
//       console.error('Error deleting document:', error);
//       Swal.fire('Error!', 'Failed to delete document.', 'error');
//     }
//   };

//   const renderDocumentHistory = () => {
//     if (
//       !nextStepDetails ||
//       typeof nextStepDetails !== "object" ||
//       Object.keys(nextStepDetails).length === 0
//     ) {
//       return (
//         <p className="text-muted mb-0">No previous documents for this step.</p>
//       );
//     }

//     let generalDocuments = [];
//     let acknowledgementReceipts = [];

//     if (nextStepDetails.UPLOAD_DOC) {
//       try {
//         const parsedDocs = JSON.parse(nextStepDetails.UPLOAD_DOC);
//         generalDocuments = parsedDocs.map((doc) => ({
//           name: doc.file_name,
//           url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
//         }));
//       } catch (error) {
//         console.error("Failed to parse UPLOAD_DOC JSON:", error);
//       }
//     }

//     if (nextStepDetails.ACK_DOC) {
//       try {
//         const parsedAcknowledgeDocs = JSON.parse(nextStepDetails.ACK_DOC);
//         acknowledgementReceipts = parsedAcknowledgeDocs.map((doc) => ({
//           name: doc.file_name,
//           url: `${API_DOC_URL}/storage/${doc.stored_path.replace(/\\/g, "/")}`,
//         }));
//       } catch (error) {
//         console.error("Failed to parse ACK_DOC JSON:", error);
//       }
//     }

//     const currentStepLogs = getCurrentStepLogs();



//     return (
//       <div className="d-flex flex-column" style={{ height: "100%", maxHeight: "330px" }}>
//         <Card style={{
//           padding: "10px",
//           flex: "1 1 auto",
//           minHeight: "0",
//           display: "flex",
//           flexDirection: "column",
//           overflow: "hidden",
//           width: "300px"
//         }}>
//           <div style={{
//             flex: "1 1 auto",
//             overflowY: "auto",
//             paddingRight: "5px"
//           }}>
//             <div style={{ marginBottom: "15px" }}>
//               <h6 className="text-primary mb-2">General Uploaded Documents</h6>
//               {generalDocuments.length > 0 ? (
//                 <div style={{
//                   border: "1px solid #dee2e6",
//                   borderRadius: "4px",
//                   padding: "5px",
//                   backgroundColor: "#f8f9fa"
//                 }}>
//                   <ul className="list-unstyled mb-0">
//                     {generalDocuments.map((doc, idx) => (
//                       <li
//                         key={`gen-doc-${idx}`}
//                         className="d-flex justify-content-between align-items-center mb-1 p-1"
//                         style={{
//                           backgroundColor: "white",
//                           borderRadius: "3px",
//                           borderBottom: idx < generalDocuments.length - 1 ? "1px solid #e9ecef" : "none"
//                         }}
//                       >
//                         <div className="text-truncate" style={{
//                           maxWidth: "calc(100% - 40px)",
//                           flexShrink: 1
//                         }}>
//                           <a
//                             href={doc.url}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="text-decoration-none text-dark"
//                             style={{ fontSize: "13px" }}
//                           >
//                             <FaFileAlt className="me-2" style={{ minWidth: "16px" }} />
//                             <span className="text-truncate" style={{
//                               display: "inline-block",
//                               maxWidth: "calc(100% - 30px)",
//                               verticalAlign: "middle"
//                             }}>
//                               {doc.name}
//                             </span>
//                           </a>
//                         </div>
//                         <Button
//                           variant="outline-danger"
//                           size="sm"
//                           className="flex-shrink-0"
//                           style={{
//                             padding: "2px 6px",
//                             fontSize: "11px",
//                             minWidth: "30px",
//                             height: "24px"
//                           }}
//                           onClick={() => handleDeleteDocument("UPLOAD_DOC", doc.name, idx)}
//                           title="Delete document"
//                         >
//                           <i className="fas fa-trash-alt"></i>
//                         </Button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ) : (
//                 <p className="text-muted mb-0 small" style={{ fontSize: "13px" }}>
//                   No general documents were uploaded for this step.
//                 </p>
//               )}
//             </div>

//             <div style={{ marginBottom: "15px" }}>
//              { immediateNextStepIndex === 0  &&  <h6 className="text-primary mb-2">Acknowledgement Receipts</h6>} 
//               {acknowledgementReceipts.length > 0 ? (
//                 <div style={{
//                   border: "1px solid #dee2e6",
//                   borderRadius: "4px",
//                   padding: "5px",
//                   backgroundColor: "#f8f9fa"
//                 }}>
//                   <ul className="list-unstyled mb-0">
//                     {acknowledgementReceipts.map((doc, idx) => (
//                       <li
//                         key={`ack-doc-${idx}`}
//                         className="d-flex justify-content-between align-items-center mb-1 p-1"
//                         style={{
//                           backgroundColor: "white",
//                           borderRadius: "3px",
//                           borderBottom: idx < acknowledgementReceipts.length - 1 ? "1px solid #e9ecef" : "none"
//                         }}
//                       >
//                         <div className="text-truncate" style={{
//                           maxWidth: "calc(100% - 40px)",
//                           flexShrink: 1
//                         }}>
//                           <a
//                             href={doc?.url}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="text-decoration-none text-dark"
//                             style={{ fontSize: "13px" }}
//                           >
//                             <FaFileAlt className="me-2" style={{ minWidth: "16px" }} />
//                             <span className="text-truncate" style={{
//                               display: "inline-block",
//                               maxWidth: "calc(100% - 30px)",
//                               verticalAlign: "middle"
//                             }}>
//                               {doc?.name}
//                             </span>
//                           </a>
//                         </div>
//                         <Button
//                           variant="outline-danger"
//                           size="sm"
//                           className="flex-shrink-0"
//                           style={{
//                             padding: "2px 6px",
//                             fontSize: "11px",
//                             minWidth: "30px",
//                             height: "24px"
//                           }}
//                           onClick={() => handleDeleteDocument("ACK_DOC", doc.name, idx)}
//                           title="Delete receipt"
//                         >
//                           <i className="fas fa-trash-alt"></i>
//                         </Button>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ) : (
//                 <p className="text-muted mb-0 small" style={{ fontSize: "13px" }}>
                
//                 </p>
//               )}
//             </div>
//           </div>
//         </Card>

//         <div className="p-2 border-top bg-light text-center" style={{ flexShrink: 0 }}>
//           <Button
//             variant="info"
//             size="sm"
//             onClick={() => {
//               const logs = getCurrentStepLogs();
//               setSelectedLogs(logs);
//               setShowLogsModal(true);
//             }}
//             disabled={currentStepLogs.length === 0}
//             style={{
//               minWidth: "120px",
//               fontSize: "13px",
//               padding: "4px 12px"
//             }}
//           >
//             {currentStepLogs.length === 0 ? "No Logs Available" : `View Logs (${currentStepLogs.length})`}
//           </Button>
//         </div>
//       </div>
//     );
//   };

//   const renderProcessColumn = (columnTitle, isOCPhase) => {
//     return (
//       <Col xs={6}>
//         <h6 className="text-center mb-2">{columnTitle}</h6>
//         <Nav variant="pills" className="flex-column">
//           {steps.map((step, idx) => {
//             let variant = "secondary",
//               clickable = false,
//               statusIcon = "⏸️";

//             let isCompleted = false;
//             let currentConceptualIndex;

//             if (isOCPhase) {
//               isCompleted = storeData.some(
//                 (item) =>
//                   item.PROCESS === step.PROCESS && item.OC_UPDATED === "YES"
//               );
//               currentConceptualIndex = idx + PROVISIONAL_NOC_STEP_INDICES.length;
//             } else {
//               isCompleted = storeData.some(
//                 (item) =>
//                   item.PROCESS === step.PROCESS && item.UPDATED === "YES"
//               );
//               currentConceptualIndex = idx;
//             }

//             const isActive = currentConceptualIndex === immediateNextStepIndex;

//             if (isCompleted) {
//               variant = "success";
//               statusIcon = "✅";
//             } else if (isActive) {
//               variant = "warning";
//               statusIcon = "⚠️";
//             }

//             if (isOCPhase && !provisionalNOCCompleted) {
//               clickable = false;
//               variant = "secondary";
//               statusIcon = "🔒";
//             } else {
//               if (currentConceptualIndex < immediateNextStepIndex) {
//                 clickable = true;
//               } else if (currentConceptualIndex === immediateNextStepIndex) {
//                 clickable = true;
//               } else {
//                 clickable = false;
//               }
//             }

//             return (
//               <Nav.Item
//                 className="mb-2"
//                 key={`${isOCPhase ? "oc-" : "pnoc-"}${step.PROCESS}`}
//               >
//                 <Nav.Link
//                   eventKey={currentConceptualIndex}
//                   disabled={!clickable}
//                   className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
//                   style={{ cursor: clickable ? "pointer" : "not-allowed" }}
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


//   const FeeAmount = storeData[0]?.FEE_AMOUNT;
//   const NumberOfTowers = storeData[0]?.NO_OF_TOWERS;


//   return (
//     <>
//       <ProjectInfoHeader data={headerData} />
//       <Row className="align-items-stretch">
//         <Col md={4} className="d-flex">
//           <div className="border rounded p-3 bg-light flex-fill">
//             <h5 className="text-center">Process Steps</h5>
//             <Row>
//               {renderProcessColumn("ProvisionalNOC", false)}
//               {renderProcessColumn("OCPROCESS", true)}
//             </Row>
//           </div>
//         </Col>

//         <Col md={5} className="d-flex flex-column">
//           <Form className="p-3 border rounded bg-light">
//             {immediateNextStep && (
//                   <h4 className="mb-3 text-primary fw-bold">
//                     {immediateNextStep.PROCESS}
//                     {/* Show Towers and FeeAmount only for steps 1-4 (after Application Submission) */}
//                     {immediateNextStepIndex >= 1 && immediateNextStepIndex <= 4 && NumberOfTowers && (
//                       <> | Towers: <span className="text-dark">{NumberOfTowers}</span></>
//                     )}
//                     {immediateNextStepIndex >= 1 && immediateNextStepIndex <= 4 && FeeAmount && (
//                       <> | FeeAmount: <span className="text-dark">{FeeAmount}</span></>
//                     )}
//                   </h4>
//                 )}

//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Plant</Form.Label>
//                   <Form.Select
//                     name="loc"
//                     value={formData.loc}
//                     onChange={handleChange}
//                     isInvalid={!!errors.loc}
//                   >
//                     <option value="">Select Plant</option>
//                     {plants.map((p, idx) => (
//                       <option key={idx} value={p.loc}>
//                         {p.loc}
//                       </option>
//                     ))}
//                   </Form.Select>
//                   <Form.Control.Feedback type="invalid">
//                     {errors.loc}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>
//                     {immediateNextStepIndex === 1 ? "Inspection Date" : "Apply Date"}
//                   </Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="applyDate"
//                     max={new Date().toISOString().split("T")[0]}
//                     value={formData.applyDate || ""}
//                     disabled={!formData.loc || (nextStepDetails && nextStepDetails.APPLY_DT)}
//                     onChange={handleChange}
//                     isInvalid={!!errors.applyDate}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.applyDate}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//             </Row>

//             {/* Show Number of Towers and Fee Amount only for Application Submission */}
//          <Row className="mb-3">


//             {immediateNextStepIndex === 0 && immediateNextStep?.PROCESS === "Application Submission" && (
//     <Col md={4}>
//       <Form.Group>
//         <Form.Label>Fee Paid?</Form.Label>
//         <div className="d-flex gap-3 mt-2">
//           <Form.Check
//             type="radio"
//             label="Yes"
//             name="feepaidstatus"
//             value="YES"
//             checked={formData.feepaidstatus === "YES"}
//            disabled
//           />
//           <Form.Check
//             type="radio"
//             label="No"
//             name="feepaidstatus"
//             value="NO"
//             checked={formData.feepaidstatus === "NO"}
//            disabled
//           />
//         </div>
//       </Form.Group>
//     </Col>
//   )}
//   {/* Column 1: Number of Towers */}
//   {immediateNextStepIndex === 0 && immediateNextStep?.PROCESS === "Application Submission" && (
//     <Col md={4}>
//       <Form.Group>
//         <Form.Label>Number Of Towers</Form.Label>
//         <Form.Control
//           type="text"
//           name="noOfTowers"
//           value={formData.noOfTowers || ""}
//           disabled={!formData.loc}
//           onChange={handleChange}
//         />
//       </Form.Group>
//     </Col>
//   )}
  
//   {/* Column 2: Fee Paid Radio */}

  
//   {/* Column 3: Fee Amount - Only shown if feepaidstatus is YES */}
//   {immediateNextStepIndex === 0 && 
//    immediateNextStep?.PROCESS === "Application Submission" && 
//    formData.feepaidstatus === 'YES' ? (
//     <Col md={4}>
//       <Form.Group>
//         <Form.Label>Fee Amount</Form.Label>
//         <Form.Control
//           type="text"
//           name="feeAmount"
//           value={formData.feeAmount || ""}
//           disabled={!formData.loc}
//           onChange={handleChange}
//         />
//       </Form.Group>
//     </Col>
//   ) : immediateNextStepIndex === 0 && immediateNextStep?.PROCESS === "Application Submission" ? (
//     // Empty column to maintain layout when Fee Amount is not shown
//     <Col md={4}></Col>
//   ) : null}
// </Row>

//  {immediateNextStepIndex > 0 && immediateNextStepIndex < 5 && (
//   <Form.Group className="mb-3">
//     <Form.Label>
//       {provisionalRadioLabels[immediateNextStepIndex] ||
//         "Status for this step"}
//     </Form.Label>
//     <div>
//       <Form.Check
//         type="radio"
//         inline
//         label="Yes"
//         name={`stepStatus_${immediateNextStepIndex}`}
//         id={`stepYes_${immediateNextStepIndex}`}
//         value="YES"
//         checked={
//           formData[`stepStatus_${immediateNextStepIndex}`] === "YES"
//         }


//         onChange={(e) =>
//            setFormData((prev) => ({
//       ...prev,
//       [`stepStatus_${immediateNextStepIndex}`]: "YES",
//     }))
//           // setFormData((prev) => ({
//           //   ...prev,
//           //   [`stepStatus_${immediateNextStepIndex}`]: e.target.value,
//           // }))
//         }
//       />
//       <Form.Check
//         type="radio"
//         inline
//         label="No"
//         name={`stepStatus_${immediateNextStepIndex}`}
//         id={`stepNo_${immediateNextStepIndex}`}
//         value="NO"
//         checked={
//           formData[`stepStatus_${immediateNextStepIndex}`] === "NO"
//         }
//         onChange={(e) =>
//           setFormData((prev) => ({
//             ...prev,
//             [`stepStatus_${immediateNextStepIndex}`]: e.target.value,
//           }))
//         }
//       />
//     </div>
//   </Form.Group>
// )}
          

//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Label>Upload Application Documents</Form.Label>
//                 <Button
//                   variant="outline-secondary"
//                   className="form-control"
//                   onClick={() => setShowUploadModal(true)}
//                 >
//                   Upload Docs{" "}
//                   {newDocs.length > 0 && `(${newDocs.length} files)`}
//                 </Button>
//                 {errors.newDocs && (
//                   <div className="text-danger mt-1">{errors.newDocs}</div>
//                 )}
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Comments</Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     rows={1}
//                     name="comments"
//                     value={formData.comments || ""}
//                     disabled={!formData.loc}
//                     onChange={handleChange}
//                     isInvalid={!!errors.comments}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.comments}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <div className="d-grid mt-3">
//               <Button
//                 variant="primary"
//                 size="md"
//                 onClick={handleEmailSubmit}
//                 disabled={!formData.loc || isSubmitting}
//               >
//                 {isSubmitting ? "Submitting..." : "Submit"}
//               </Button>
//             </div>
//           </Form>
//         </Col>

//         <Col md={3} className="d-flex w-25">
//           <div className="border rounded p-3 bg-white flex-fill d-flex flex-column">
//             <h5 className="mb-1 text-dark">Document History</h5>
//             <div className="flex-grow-1 overflow-auto">
//               {renderDocumentHistory()}
//             </div>
//           </div>
//         </Col>
//       </Row>

//       <Modal show={showLogsModal} onHide={() => setShowLogsModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Logs for {immediateNextStep?.PROCESS}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
//           {selectedLogs.length === 0 ? (
//             <p>No logs available</p>
//           ) : (
//             selectedLogs.map((log, i) => (
//               <div key={i} className="mb-2">
//                 <strong>{log?.date || "Unknown Date"}:</strong> {log?.comment || "No comment"}
//                 <hr />
//               </div>
//             ))
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowLogsModal(false)}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <EmailSelectionModal
//         show={showEmailModal}
//         onHide={() => setShowEmailModal(false)}
//         onSubmit={handleEmailSelectionSubmit}
//         processName={immediateNextStep?.PROCESS}
//         plantName={formData?.loc}
//         applyDate={formData?.applyDate}
//         comments={formData?.comments}
//       />
//       <ReraDocUploadModal
//         show={showUploadModal}
//         onClose={() => setShowUploadModal(false)}
//         files={newDocs}
//         setFiles={setNewDocs}
//       />
//     </>
//   );
// };

// export default FireModifyTable;



import React, { useEffect, useState, useMemo, useContext } from "react";
import { FaCheckCircle, FaFileAlt } from "react-icons/fa";
import {
  Nav,
  Form,
  Button,
  Row,
  Col,Alert,
  Badge,
  Modal,
  Card,
} from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import ReraDocUploadModal from "./ReraDocUploadModal";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { Context } from "../context/ContextData";
import { getMasterByLoc } from "../api/Api";
import EmailSelectionModal from "./EmailModal";

const FireModifyTable = () => {
  const {
    storeData,
    setStoreData,
    respModifyData,
    setRespModifyData,
    setHeaderData,
    headerData,
  } = useContext(Context);

  const [steps, setSteps] = useState([]);
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  // const [storeData, setStoreData] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [allStepsCompleted, setAllStepsCompleted] = useState(false);

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
     // Add default for step 2
  stepStatus_1: "YES"
  });
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  
 


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

  const [currentProcess, setCurrentProcess] = useState("");
  const [latestLogs, setLatestLogs] = useState([]);
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
      // Add defaults for all radio button steps
  stepStatus_1: "YES",  // Site Inspection Status
  stepStatus_2: "YES",  // Queries Received?
  stepStatus_3: "YES",  // Committee Approved?
  stepStatus_4: "YES",  // Provisional Status?
  stepStatus_6: "YES",  // Site Inspection Status? (OC)
  stepStatus_7: "YES",  // Queries Received? (OC)
  stepStatus_8: "YES",  // Committee Approved? (OC)
  stepStatus_9: "YES",  // OC Status?
    });
    setNewDocs([]);
    setAcknowledgeDocs([]);
    setErrors({});
    setProvisionalNOCCompleted(false);

    console.log("PROVISIONAL_NOC_STEP_INDICES:", PROVISIONAL_NOC_STEP_INDICES);
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
                currentStepType = "ProvisionalNOC"; // NEW: Set step type
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
                currentStepType = "OCPROCESS"; // NEW: Set step type
                break; // Found the first incomplete OC step
              }
            }
          }

          setImmediateNextStep(nextStepFound);
          setImmediateNextStepIndex(nextStepIdx);



          setCurrentProcess(currentStepType);

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
            console.log("NExtstep Detials:", details);
            setLatestLogs(details);

          let stepStatus = details.STATUS || "";
    
    // Check if this step should have radio buttons (steps 1-4 for Provisional, 6-9 for OC)
    const shouldHaveRadioButtons = 
      (immediateNextStepIndex > 0 && immediateNextStepIndex < 5) || // Steps 1-4
      (immediateNextStepIndex >= 6 && immediateNextStepIndex <= 9); // Steps 6-9
    
    // If this step should have radio buttons and no status is set, default to "YES"
    if (shouldHaveRadioButtons && !stepStatus) {
      stepStatus = "YES";
      console.log(`Setting default YES for step ${immediateNextStepIndex}`);
    }

            // Load form data from fetched details for the current step
            setFormData((prev) => ({
              ...prev,
              applyDate: details.APPLY_DT || "",
              comments: details.COMMENTS || "",
              logs: details.LOG || "",
              feePaid: details.FEE_PAID || "", // Load existing fee data
              feeAmount: details.FEE_AMOUNT || "",
              acknowledgeName: details.ACKNOWLEDGE_NAME || "",
              // ADD THIS LINE to set stepStatus for step 2
      [`stepStatus_${immediateNextStepIndex}`]: stepStatus
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
              logs: "",
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
  console.log("Step index changed:", immediateNextStepIndex);
  
  // Check if this step should have radio buttons
  const shouldHaveRadioButtons = 
    (immediateNextStepIndex > 0 && immediateNextStepIndex < 5) || // Steps 1-4
    (immediateNextStepIndex >= 6 && immediateNextStepIndex <= 9); // Steps 6-9
  
  // When step changes to one that should have radio buttons, set default to "YES" if not already set
  if (shouldHaveRadioButtons) {
    console.log(`Step ${immediateNextStepIndex} should have radio buttons`);
    
    // Check if we already have a value for this step
    const currentStatus = formData[`stepStatus_${immediateNextStepIndex}`];
    
    if (!currentStatus) {
      console.log(`Setting default YES for step ${immediateNextStepIndex}`);
      setFormData(prev => ({
        ...prev,
        [`stepStatus_${immediateNextStepIndex}`]: "YES"
      }));
    }
  }
}, [immediateNextStepIndex]);
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



    const getCurrentStepLogs = () => {

  
  const currentStepRecord = storeData.find(
    (item) => 
      item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim() &&
      item.STEPTYPE === currentProcess
  );
  
    
    if (!currentStepRecord?.LOG) {
      return [];
    }
    
    try {

      return JSON.parse(currentStepRecord.LOG);
    } catch (error) {
      console.error("Failed to parse logs:", error);
      return [];
    }
  };


  const handleChange = async (e) => {
    const { name, value } = e.target;

    console.log(name, value, "Field changed");


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
  if (!formData.comments) newErrors.comments = "Please enter comments";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    
    // Just set errors without scrolling
    return;
  }

  setErrors({});
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

    // if (isProvisionalNOCStep) {
    //   if (!formData.applyDate) {
    //     newErrors.applyDate =
    //       "Please provide an Apply/Inspection Date for this step.";
    //   }
    // }

    // if (isOCProcessStep) {
    //   if (!formData.feePaid)
    //     newErrors.feePaid = "Please specify if fee is paid.";
    //   if (formData.feePaid === "YES" && !formData.feeAmount)
    //     newErrors.feeAmount = "Fee amount is required when fee is paid.";
    //   if (!formData.acknowledgeName)
    //     newErrors.acknowledgeName = "Acknowledge name is required.";
    //   if (acknowledgeDocs.length === 0) {
    //     newErrors.acknowledgeDocs =
    //       "Please upload at least one acknowledgement receipt.";
    //   }
    // }

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
      payload.append("steptype", currentProcess);
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


    for (const [key, value] of payload.entries()) {
      console.log(`${key}:`, value);
    }
  
    let existingRecordStatusField = null;

    console.log("ghhhhhhhhhhhhhhhh",storeData,"immediateNextStep.PROCESS?",immediateNextStep.PROCESS);
    const currentStepRecord = storeData.find(
      (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim() && item.STEPTYPE === currentProcess
    );


    if (isProvisionalNOCStep) {
      existingRecordStatusField = currentStepRecord?.UPDATED;
    } else if (isOCProcessStep) {
      existingRecordStatusField = currentStepRecord?.OC_UPDATED; // *** Use OC_UPDATED here ***
    }

    console.log("➡️ ExistingRecord :", existingRecordStatusField);
    // const apiUrl =
    //   existingRecordStatusField === "YES"
    //   //  ? `${API_BASE_URL}/fire-modify`
    //     : `${API_BASE_URL}/fire-submit`;
   
    const apiUrl = currentStepRecord
  ? `${API_BASE_URL}/fire-modify`
  : `${API_BASE_URL}/fire-submit`;

        // console.log("➡️ Triggering API:", apiUrl);
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
        const parsedAcknowledgeDocs = JSON.parse(nextStepDetails.ACK_DOC);
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

 



    const handleDeleteDocument = async (docType, fileName, index) => {

      console.log("deletedddddd",docType, "file",fileName,"index",index);
  try {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Delete Document?',
      text: `Are you sure you want to delete ${fileName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    // Make API call to delete from server
    const response = await axios.delete(`${API_BASE_URL}/fire-docu-delete`, {
      data: {
        loc: formData.loc,
        process: immediateNextStep?.PROCESS || "",
        steptype: currentProcess,
        doc_type: docType, // "New_Doc" or "Acknowledge_Doc"
        file_name: fileName,
      },
    });

    if (response.status === 200) {
      // Remove from local state
      if (docType === "New_Doc") {
        const updatedDocs = newDocs.filter((_, i) => i !== index);
        setNewDocs(updatedDocs);
      } else if (docType === "Acknowledge_Doc") {
        const updatedDocs = acknowledgeDocs.filter((_, i) => i !== index);
        setAcknowledgeDocs(updatedDocs);
      }

      // Show success message
      Swal.fire('Deleted!', 'Document has been deleted.', 'success');
      
      // Optionally: Refresh document history
 
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    Swal.fire('Error!', 'Failed to delete document.', 'error');
  }
};

    
   const currentStepLogs = getCurrentStepLogs();

  
    return (
      <div className="d-flex flex-column" style={{ height: "100%" }}>
     <Card style={{ padding: "1px", height: "80%", overflow: "auto" }}>
        <h6 className="text-primary p-2">General Uploaded Documents</h6>
        {generalDocuments.length > 0 ? (
          <ul className="list-unstyled">
            {generalDocuments.map((doc, idx) => (
              <li key={`gen-doc-${idx}`} className="mb-1 p-1 d-flex justify-content-between align-items-center">
                <div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none"
                  >
                    <FaFileAlt className="me-2" />
                    {doc.name}
                  </a>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteDocument("New_Doc", doc.name, idx)}
                  title="Delete document"
                >
                  <i className="fas fa-trash-alt"></i>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mb-0">
            No general documents were uploaded for this step.
          </p>
        )}

        {isOCProcessStep && (
          <>
            <h6 className="text-primary mt-3">Acknowledgement Receipts</h6>
            {acknowledgementReceipts.length > 0 ? (
              <ul className="list-unstyled">
                {acknowledgementReceipts.map((doc, idx) => (
                  <li key={`ack-doc-${idx}`} className="mb-1 d-flex justify-content-between align-items-center">
                    <div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-decoration-none"
                      >
                        <FaFileAlt className="me-2" />
                        {doc.name}
                      </a>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteDocument("Acknowledge_Doc", doc.name, idx)}
                      title="Delete receipt"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </Button>
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


           <div className="p-2 border-top bg-light text-center">
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => {
                   
                      const logs = getCurrentStepLogs();
                      setSelectedLogs(logs);
                      setShowLogsModal(true);
                    }}
                    disabled={currentStepLogs.length === 0}
                  >
                    {currentStepLogs.length === 0 ? "No Logs Available" : `View Logs (${currentStepLogs.length})`}
                  </Button>
                </div>

      
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


  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        {/* Adjusted to md={4} for more width */}
        <Col md={4} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h5 className="text-center mb-3">Process Steps</h5>
            <Row>
              {renderProcessColumn("ProvisionalNOC", false)}
              {renderProcessColumn("OCPROCESS", true)}
            </Row>
          </div>
        </Col>

       {/* The rest of the JSX is correct and unchanged */}
               <Col md={5} className="d-flex flex-column">
               {allStepsCompleted  ? (
                   renderCompletionMessage()
                 ) : (
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

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    {immediateNextStepIndex === 1 ? "Inspection Date" : "Apply Date"}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="applyDate"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.applyDate || ""}
                    onChange={handleChange}
                    isInvalid={!!errors.applyDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.applyDate}
                  </Form.Control.Feedback>
                </Form.Group>
            </Col>
            </Row>

            {/* {immediateNextStepIndex >= 1 && (
        `<Form.Group className="mb-3">
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
        </Form.Group>`
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
                      {errors.comments && (
                          <p className="error-text text-danger">{errors.comments}</p>
                        )}
                </Form.Group>
              </Col>
            </Row>
            <div className="d-grid mt-3">
              <Button variant="primary" size="lg" onClick={handleEmailSubmit}>
                Submit
              </Button>
            </div>
          </Form>
                 )}
               </Col>


        {/* md={3} remains the same, as 4 + 5 + 3 = 12 */}
        <Col md={3} className="d-flex w-25">
          <div className="border rounded p-3 bg-white flex-fill d-flex flex-column">
            <h5 className="mb-3 text-dark">Document History</h5>
            <div className="flex-grow-1 overflow-auto">
              {renderDocumentHistory()}
            </div>
          </div>
        </Col>
      </Row>

       <Modal show={showLogsModal} onHide={() => setShowLogsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Logs for {immediateNextStep?.PROCESS}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
          {selectedLogs.length === 0 ? (
            <p>No logs available</p>
          ) : (
            selectedLogs.map((log, i) => (
              <div key={i} className="mb-2">
                <strong>{log?.date || "Unknown Date"}:</strong> {log?.comment || "No comment"}
                <hr />
              </div>
            ))
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

