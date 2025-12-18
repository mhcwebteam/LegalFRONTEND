import React, { useEffect, useState, useMemo, useContext } from "react";
import {
  Nav,
  Form,
  Button,
  Row,
  Col,
  Badge,
  Modal,
  Card,
} from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import ReraDocUploadModal from "./ReraDocUploadModal";
import { FaFileAlt } from "react-icons/fa";
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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    noOfTowers: "",
    feepaidstatus: "",
  stepStatus_1: "YES"
  });
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
 const [stepdata, setSetData] = useState([]);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [nextStepDetails, setNextStepDetails] = useState(null);

  const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });
  const [newDocs, setNewDocs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [acknowledgeDocs, setAcknowledgeDocs] = useState([]);
  const [errors, setErrors] = useState({});
  const [provisionalNOCCompleted, setProvisionalNOCCompleted] = useState(false);
  const [currentProcess, setCurrentProcess] = useState("");
  const [latestLogs, setLatestLogs] = useState([]);

  const PROVISIONAL_NOC_STEP_INDICES = useMemo(() => [0, 1, 2, 3, 4], []);
  const OC_PROCESS_STEP_RANGE = useMemo(() => [5, 6, 7, 8, 9, 10], []);

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
    setHeaderData(null);
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
      noOfTowers: "",
      feepaidstatus: "",
       stepStatus_1: "YES",  // Site Inspection Status
  stepStatus_2: "YES",  // Queries Received?
  stepStatus_3: "YES",  // Committee Approved?
  stepStatus_4: "YES",  // Provisional Status?
  stepStatus_6: "YES",  // Site Inspection Status? (OC)
  stepStatus_7: "YES",  // Queries Received? (OC)
  stepStatus_8: "YES",  // Committee Approved? (OC)
  stepStatus_9: "YES", 
    });
    setNewDocs([]);
    setAcknowledgeDocs([]);
    setErrors({});
    setProvisionalNOCCompleted(false);

    if (selectedPlant && steps.length > 0) {
      axios
        .get(`${API_BASE_URL}/fire-data?plant=${selectedPlant}`)
        .then((res) => {
          const fetchedData = res.data;
          setStoreData(fetchedData);

          if (fetchedData && fetchedData.length > 0) {
            const firstRecord = fetchedData[0];
            const info = {
              prjName: firstRecord.PROJECT_NAME || "",
              address: firstRecord.ADDRESS || "",
            };
            setProjectInfo(info);
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

          const provisionalNOCStepsCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
            (index) =>
              steps[index] &&
              fetchedData.some(
                (item) =>
                  item.PROCESS === steps[index].PROCESS &&
                  item.UPDATED === "YES"
              )
          );
          setProvisionalNOCCompleted(provisionalNOCStepsCompleted);

          let nextStepFound = null;
          let nextStepIdx = -1;
          let currentStepType = null;

          if (!provisionalNOCStepsCompleted) {
            for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
              if (
                steps[idx] &&
                !fetchedData.some(
                  (item) =>
                    item.PROCESS === steps[idx].PROCESS &&
                    item.UPDATED === "YES"
                )
              ) {
                nextStepFound = steps[idx];
                nextStepIdx = idx;
                currentStepType = "ProvisionalNOC";
                break;
              }
            }
          } else {
            for (const idx of PROVISIONAL_NOC_STEP_INDICES) {
              if (
                steps[idx] &&
                !fetchedData.some(
                  (item) =>
                    item.PROCESS === steps[idx].PROCESS &&
                    item.OC_UPDATED === "YES"
                )
              ) {
                nextStepFound = steps[idx];
                nextStepIdx = idx + PROVISIONAL_NOC_STEP_INDICES.length;
                currentStepType = "OCPROCESS";
                break;
              }
            }
          }

          setImmediateNextStep(nextStepFound);
          setImmediateNextStepIndex(nextStepIdx);
          setCurrentProcess(currentStepType);

          if (nextStepFound) {
            const apiUrl = `${API_BASE_URL}/fire-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(
              nextStepFound.PROCESS
            )}/${encodeURIComponent(currentStepType)}`;
            return axios.get(apiUrl);
          } else {
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
              setImmediateNextStepIndex(PROVISIONAL_NOC_STEP_INDICES.length * 2);
            }
            return Promise.resolve(null);
          }
        })
        .then((detailsRes) => {
          if (detailsRes && detailsRes.data) {
            const details = detailsRes.data;
            setNextStepDetails(details);
            setLatestLogs(details);
setSetData(details);


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

    const currentStepRecord = storeData.find(
            (item) =>
              item.PROCESS?.trim() === immediateNextStep?.PROCESS?.trim() &&
              item.STEPTYPE === currentProcess
          );


          console.log(":fffffffffffff",details);

            setFormData((prev) => ({
              ...prev,
              applyDate: details.APPLY_DT || "",
              comments: details.COMMENTS || "",
              logs: details.LOG || "",
              feePaid: details.FEE_PAID || "",
              feeAmount: details.FEE_AMOUNT || "",
              acknowledgeName: details.ACKNOWLEDGE_NAME || "",
              noOfTowers: details.NO_OF_TOWERS || "",
              feepaidstatus: details.FEE_PAID_STATUS || "" ,
                 [`stepStatus_${immediateNextStepIndex}`]: 
              currentStepRecord?.LEVEL_STATUS || ""// Load feepaidstatus from backend
            }));
          } else {
            setNextStepDetails(null);
            setFormData((prev) => ({
              ...prev,
              applyDate: "",
              comments: "",
              logs: "",
              feePaid: "",
              feeAmount: "",
              acknowledgeName: "",
              noOfTowers: "",
              feepaidstatus: ""
            }));
          }
        })
        .catch((err) =>
          console.error("Error during data fetching process:", err)
        );
    }
  }, [selectedPlant, steps, PROVISIONAL_NOC_STEP_INDICES]);


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
        comments: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, applyDate: "", comments: "" }));
    }
  }, [nextStepDetails]);

  const getCurrentStepLogs = () => {
    const currentStepRecord = storeData.find(
      (item) =>
        item.PROCESS?.trim() === immediateNextStep?.PROCESS?.trim() &&
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
      return;
    }

    setErrors({});
    setShowEmailModal(true);
  };

  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);
    await handleConfirmSubmit(emails);
  };

  const handleConfirmSubmit = async (emails) => {
    setIsSubmitting(true);
    const newErrors = {};
    setErrors({});

    if (!formData.loc || !immediateNextStep) {
      Swal.fire(
        "Validation Error",
        "Please select a Plant and ensure a process step is active.",
        "error"
      );
      setIsSubmitting(false);
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const errorMessages = Object.values(newErrors).join("<br>");
      Swal.fire("Validation Error", errorMessages, "error");
      setIsSubmitting(false);
      return;
    }

    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("comments", formData.comments || "");
    payload.append("applyDate", formData.applyDate || "");
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });
    payload.append("steptype", currentProcess);


    // Add Number of Towers, Fee Amount, and Fee Paid Status only for Application Submission
    if (immediateNextStepIndex === 0 && immediateNextStep?.PROCESS === "Application Submission") {
      payload.append("noOfTowers", formData.noOfTowers || "");
      payload.append("feeAmount", formData.feeAmount || "");
      // payload.append("feepaidstatus", formData.feepaidstatus || "");
 payload.append("feePaid", formData.feepaidstatus || "");

    }

      if (immediateNextStepIndex >= 1) {

    

      payload.append(
        "stepStatus",
        formData[`stepStatus_${immediateNextStepIndex}`] || ""
      );
    }

    newDocs.forEach((file) => payload.append("New_Doc[]", file));

   
    payload.append("acknowledgeName", formData.acknowledgeName || "");

    acknowledgeDocs.forEach((file) =>
      payload.append("Acknowledge_Doc[]", file)
    );

    const currentStepRecord = storeData.find(
      (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim() && item.STEPTYPE === currentProcess
    );

    const apiUrl = currentStepRecord
      ? `${API_BASE_URL}/fire-modify`
      : `${API_BASE_URL}/fire-submit`;

    try {
      await axios.post(apiUrl, payload);
      await Swal.fire({
        icon: "success",
        title: currentStepRecord ? "Updated!" : "Submitted!",
        text: "Your data has been saved successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

   
      setFormData((prev) => ({
        ...prev,
        applyDate: "",
        comments: "",
        feePaid: "",
        feeAmount: "",
        acknowledgeName: "",
        noOfTowers: "",
        feepaidstatus: ""
      }));
      setNewDocs([]);
      setAcknowledgeDocs([]);
      setErrors({});
    } catch (error) {
      console.error("Submission failed:", error);
      Swal.fire(
        "Submission Failed",
        "Please check the console for details.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = async (docType, fileName, index) => {
    try {
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

      const response = await axios.delete(`${API_BASE_URL}/docmt-fire-dlt`, {
        data: {
          loc: formData.loc,
          process: immediateNextStep?.PROCESS || "",
          steptype: currentProcess,
          doc_type: docType,
          file_name: fileName,
        },
      });

      if (response.status === 200) {
        if (nextStepDetails) {
          const updatedDetails = { ...nextStepDetails };

          if (docType === "UPLOAD_DOC" && updatedDetails.UPLOAD_DOC) {
            try {
              const parsedDocs = JSON.parse(updatedDetails.UPLOAD_DOC);
              const filteredDocs = parsedDocs.filter(doc => doc.file_name !== fileName);
              updatedDetails.UPLOAD_DOC = JSON.stringify(filteredDocs);
            } catch (error) {
              console.error("Error updating UPLOAD_DOC:", error);
            }
          } else if (docType === "ACK_DOC" && updatedDetails.ACK_DOC) {
            try {
              const parsedDocs = JSON.parse(updatedDetails.ACK_DOC);
              const filteredDocs = parsedDocs.filter(doc => doc.file_name !== fileName);
              updatedDetails.ACK_DOC = JSON.stringify(filteredDocs);
            } catch (error) {
              console.error("Error updating ACK_DOC:", error);
            }
          }

          setNextStepDetails(updatedDetails);
        }

        if (storeData && storeData.length > 0) {
          const updatedStoreData = storeData.map(item => {
            if (item.PROCESS === immediateNextStep.PROCESS && item.STEPTYPE === currentProcess) {
              const updatedItem = { ...item };

              if (docType === "UPLOAD_DOC" && updatedItem.UPLOAD_DOC) {
                try {
                  const parsedDocs = JSON.parse(updatedItem.UPLOAD_DOC);
                  const filteredDocs = parsedDocs.filter(doc => doc.file_name !== fileName);
                  updatedItem.UPLOAD_DOC = JSON.stringify(filteredDocs);
                } catch (error) {
                  console.error("Error updating storeData UPLOAD_DOC:", error);
                }
              } else if (docType === "ACK_DOC" && updatedItem.ACK_DOC) {
                try {
                  const parsedDocs = JSON.parse(updatedItem.ACK_DOC);
                  const filteredDocs = parsedDocs.filter(doc => doc.file_name !== fileName);
                  updatedItem.ACK_DOC = JSON.stringify(filteredDocs);
                } catch (error) {
                  console.error("Error updating storeData ACK_DOC:", error);
                }
              }

              return updatedItem;
            }
            return item;
          });

          setStoreData(updatedStoreData);
        }

        Swal.fire('Deleted!', 'Document has been deleted.', 'success');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      Swal.fire('Error!', 'Failed to delete document.', 'error');
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

    const currentStepLogs = getCurrentStepLogs();



    return (
      <div className="d-flex flex-column" style={{ height: "100%", maxHeight: "330px" }}>
        <Card style={{
          padding: "10px",
          flex: "1 1 auto",
          minHeight: "0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          width: "300px"
        }}>
          <div style={{
            flex: "1 1 auto",
            overflowY: "auto",
            paddingRight: "5px"
          }}>
            <div style={{ marginBottom: "15px" }}>
              <h6 className="text-primary mb-2">General Uploaded Documents</h6>
              {generalDocuments.length > 0 ? (
                <div style={{
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  padding: "5px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <ul className="list-unstyled mb-0">
                    {generalDocuments.map((doc, idx) => (
                      <li
                        key={`gen-doc-${idx}`}
                        className="d-flex justify-content-between align-items-center mb-1 p-1"
                        style={{
                          backgroundColor: "white",
                          borderRadius: "3px",
                          borderBottom: idx < generalDocuments.length - 1 ? "1px solid #e9ecef" : "none"
                        }}
                      >
                        <div className="text-truncate" style={{
                          maxWidth: "calc(100% - 40px)",
                          flexShrink: 1
                        }}>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none text-dark"
                            style={{ fontSize: "13px" }}
                          >
                            <FaFileAlt className="me-2" style={{ minWidth: "16px" }} />
                            <span className="text-truncate" style={{
                              display: "inline-block",
                              maxWidth: "calc(100% - 30px)",
                              verticalAlign: "middle"
                            }}>
                              {doc.name}
                            </span>
                          </a>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="flex-shrink-0"
                          style={{
                            padding: "2px 6px",
                            fontSize: "11px",
                            minWidth: "30px",
                            height: "24px"
                          }}
                          onClick={() => handleDeleteDocument("UPLOAD_DOC", doc.name, idx)}
                          title="Delete document"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted mb-0 small" style={{ fontSize: "13px" }}>
                  No general documents were uploaded for this step.
                </p>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
             { immediateNextStepIndex === 0  &&  <h6 className="text-primary mb-2">Acknowledgement Receipts</h6>} 
              {acknowledgementReceipts.length > 0 ? (
                <div style={{
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  padding: "5px",
                  backgroundColor: "#f8f9fa"
                }}>
                  <ul className="list-unstyled mb-0">
                    {acknowledgementReceipts.map((doc, idx) => (
                      <li
                        key={`ack-doc-${idx}`}
                        className="d-flex justify-content-between align-items-center mb-1 p-1"
                        style={{
                          backgroundColor: "white",
                          borderRadius: "3px",
                          borderBottom: idx < acknowledgementReceipts.length - 1 ? "1px solid #e9ecef" : "none"
                        }}
                      >
                        <div className="text-truncate" style={{
                          maxWidth: "calc(100% - 40px)",
                          flexShrink: 1
                        }}>
                          <a
                            href={doc?.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none text-dark"
                            style={{ fontSize: "13px" }}
                          >
                            <FaFileAlt className="me-2" style={{ minWidth: "16px" }} />
                            <span className="text-truncate" style={{
                              display: "inline-block",
                              maxWidth: "calc(100% - 30px)",
                              verticalAlign: "middle"
                            }}>
                              {doc?.name}
                            </span>
                          </a>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="flex-shrink-0"
                          style={{
                            padding: "2px 6px",
                            fontSize: "11px",
                            minWidth: "30px",
                            height: "24px"
                          }}
                          onClick={() => handleDeleteDocument("ACK_DOC", doc.name, idx)}
                          title="Delete receipt"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted mb-0 small" style={{ fontSize: "13px" }}>
                
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="p-2 border-top bg-light text-center" style={{ flexShrink: 0 }}>
          <Button
            variant="info"
            size="sm"
            onClick={() => {
              const logs = getCurrentStepLogs();
              setSelectedLogs(logs);
              setShowLogsModal(true);
            }}
            disabled={currentStepLogs.length === 0}
            style={{
              minWidth: "120px",
              fontSize: "13px",
              padding: "4px 12px"
            }}
          >
            {currentStepLogs.length === 0 ? "No Logs Available" : `View Logs (${currentStepLogs.length})`}
          </Button>
        </div>
      </div>
    );
  };

  const renderProcessColumn = (columnTitle, isOCPhase) => {
    return (
      <Col xs={6}>
        <h6 className="text-center mb-2">{columnTitle}</h6>
        <Nav variant="pills" className="flex-column">
          {steps.map((step, idx) => {
            let variant = "secondary",
              clickable = false,
              statusIcon = "⏸️";

            let isCompleted = false;
            let currentConceptualIndex;

            if (isOCPhase) {
              isCompleted = storeData.some(
                (item) =>
                  item.PROCESS === step.PROCESS && item.OC_UPDATED === "YES"
              );
              currentConceptualIndex = idx + PROVISIONAL_NOC_STEP_INDICES.length;
            } else {
              isCompleted = storeData.some(
                (item) =>
                  item.PROCESS === step.PROCESS && item.UPDATED === "YES"
              );
              currentConceptualIndex = idx;
            }

            const isActive = currentConceptualIndex === immediateNextStepIndex;

            if (isCompleted) {
              variant = "success";
              statusIcon = "✅";
            } else if (isActive) {
              variant = "warning";
              statusIcon = "⚠️";
            }

            if (isOCPhase && !provisionalNOCCompleted) {
              clickable = false;
              variant = "secondary";
              statusIcon = "🔒";
            } else {
              if (currentConceptualIndex < immediateNextStepIndex) {
                clickable = true;
              } else if (currentConceptualIndex === immediateNextStepIndex) {
                clickable = true;
              } else {
                clickable = false;
              }
            }

            return (
              <Nav.Item
                className="mb-2"
                key={`${isOCPhase ? "oc-" : "pnoc-"}${step.PROCESS}`}
              >
                <Nav.Link
                  eventKey={currentConceptualIndex}
                  disabled={!clickable}
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


  const FeeAmount = storeData[0]?.FEE_AMOUNT;
  const NumberOfTowers = storeData[0]?.NO_OF_TOWERS;


  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        <Col md={4} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h5 className="text-center">Process Steps</h5>
            <Row>
              {renderProcessColumn("ProvisionalNOC", false)}
              {renderProcessColumn("OCPROCESS", true)}
            </Row>
          </div>
        </Col>

        <Col md={5} className="d-flex flex-column">
          <Form className="p-3 border rounded bg-light">
            {immediateNextStep && (
                  <h4 className="mb-3 text-primary fw-bold">
                    {immediateNextStep.PROCESS}
                    {/* Show Towers and FeeAmount only for steps 1-4 (after Application Submission) */}
                    {immediateNextStepIndex >= 1 && immediateNextStepIndex <= 4 && NumberOfTowers && (
                      <> | Towers: <span className="text-dark">{NumberOfTowers}</span></>
                    )}
                    {immediateNextStepIndex >= 1 && immediateNextStepIndex <= 4 && FeeAmount && (
                      <> | FeeAmount: <span className="text-dark">{FeeAmount}</span></>
                    )}
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
                    isInvalid={!!errors.loc}
                  >
                    <option value="">Select Plant</option>
                    {plants.map((p, idx) => (
                      <option key={idx} value={p.loc}>
                        {p.loc}
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
                  <Form.Label>
                    {immediateNextStepIndex === 1 ? "Inspection Date" : "Apply Date"}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="applyDate"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.applyDate || ""}
                    disabled={!formData.loc || (nextStepDetails && nextStepDetails.APPLY_DT)}
                    onChange={handleChange}
                    isInvalid={!!errors.applyDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.applyDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Show Number of Towers and Fee Amount only for Application Submission */}
         <Row className="mb-3">


            {immediateNextStepIndex === 0 && immediateNextStep?.PROCESS === "Application Submission" && (
    <Col md={4}>
      <Form.Group>
        <Form.Label>Fee Paid?</Form.Label>
        <div className="d-flex gap-3 mt-2">
          <Form.Check
            type="radio"
            label="Yes"
            name="feepaidstatus"
            value="YES"
            checked={formData.feepaidstatus === "YES"}
           disabled
          />
          <Form.Check
            type="radio"
            label="No"
            name="feepaidstatus"
            value="NO"
            checked={formData.feepaidstatus === "NO"}
           disabled
          />
        </div>
      </Form.Group>
    </Col>
  )}
  {/* Column 1: Number of Towers */}
  {immediateNextStepIndex === 0 && immediateNextStep?.PROCESS === "Application Submission" && (
    <Col md={4}>
      <Form.Group>
        <Form.Label>Number Of Towers</Form.Label>
        <Form.Control
          type="text"
          name="noOfTowers"
          value={formData.noOfTowers || ""}
          disabled={!formData.loc}
          onChange={handleChange}
        />
      </Form.Group>
    </Col>
  )}
  
  {/* Column 2: Fee Paid Radio */}

  
  {/* Column 3: Fee Amount - Only shown if feepaidstatus is YES */}
  {immediateNextStepIndex === 0 && 
   immediateNextStep?.PROCESS === "Application Submission" && 
   formData.feepaidstatus === 'YES' ? (
    <Col md={4}>
      <Form.Group>
        <Form.Label>Fee Amount</Form.Label>
        <Form.Control
          type="text"
          name="feeAmount"
          value={formData.feeAmount || ""}
          disabled={!formData.loc}
          onChange={handleChange}
        />
      </Form.Group>
    </Col>
  ) : immediateNextStepIndex === 0 && immediateNextStep?.PROCESS === "Application Submission" ? (
    // Empty column to maintain layout when Fee Amount is not shown
    <Col md={4}></Col>
  ) : null}
</Row>

 {immediateNextStepIndex > 0 && immediateNextStepIndex < 5 && (
  <Form.Group className="mb-3">
    <Form.Label>
      {provisionalRadioLabels[immediateNextStepIndex] ||
        "Status for this step"}
    </Form.Label>
    <div>
      <Form.Check
        type="radio"
        inline
        label="Yes"
        name={`stepStatus_${immediateNextStepIndex}`}
        id={`stepYes_${immediateNextStepIndex}`}
        value="YES"
        checked={
          formData[`stepStatus_${immediateNextStepIndex}`] === "YES"
        }


        onChange={(e) =>
           setFormData((prev) => ({
      ...prev,
      [`stepStatus_${immediateNextStepIndex}`]: "YES",
    }))
          // setFormData((prev) => ({
          //   ...prev,
          //   [`stepStatus_${immediateNextStepIndex}`]: e.target.value,
          // }))
        }
      />
      <Form.Check
        type="radio"
        inline
        label="No"
        name={`stepStatus_${immediateNextStepIndex}`}
        id={`stepNo_${immediateNextStepIndex}`}
        value="NO"
        checked={
          formData[`stepStatus_${immediateNextStepIndex}`] === "NO"
        }
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            [`stepStatus_${immediateNextStepIndex}`]: e.target.value,
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
                    disabled={!formData.loc}
                    onChange={handleChange}
                    isInvalid={!!errors.comments}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.comments}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid mt-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleEmailSubmit}
                disabled={!formData.loc || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Form>
        </Col>

        <Col md={3} className="d-flex w-25">
          <div className="border rounded p-3 bg-white flex-fill d-flex flex-column">
            <h5 className="mb-1 text-dark">Document History</h5>
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





