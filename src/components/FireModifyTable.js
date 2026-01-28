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
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import FormHeader from "./Header";
import ReraDocUploadModal from "./ReraDocUploadModal";
import { FaArrowLeft, FaCheckCircle, FaFileAlt } from "react-icons/fa";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { Context } from "../context/ContextData";
import { getMasterByLoc } from "../api/Api";
import EmailSelectionModal from "./EmailModal";
import { queries } from "@testing-library/dom";

const FireModifyTable = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
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
  feepaidstatus: "YES",
  stepStatus_1: "YES",
  stepStatus_2: "YES", 
  stepStatus_3: "YES",
  stepStatus_4: "YES",
  stepStatus_6: "YES",
  stepStatus_7: "YES",
  stepStatus_8: "YES",
  stepStatus_9: "YES",
  site: "YES",
  queries: "YES",
  committe: "YES",
  provisional: "YES"
});
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [stepdata, setSetData] = useState([]);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [nextStepDetails, setNextStepDetails] = useState(null);

  console.log(nextStepDetails, "ffffffffffff")

  const [projectInfo, setProjectInfo] = useState({ prjName: "", address: "" });
  const [newDocs, setNewDocs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [acknowledgeDocs, setAcknowledgeDocs] = useState([]);
  const [errors, setErrors] = useState({});
  const [provisionalNOCCompleted, setProvisionalNOCCompleted] = useState(false);
  const [currentProcess, setCurrentProcess] = useState("");
  const [latestLogs, setLatestLogs] = useState([]);
  //added on 23-12-2025 by rajakumari.m----------------------------------------------------------------------------
  // Add these new states around line 60
  const [viewedStepConceptualIndex, setViewedStepConceptualIndex] =
    useState(-1);
  const [viewedStepDetails, setViewedStepDetails] = useState(null);
  const [isAllStepsCompleted, setIsAllStepsCompleted] = useState(false);
  //------------------------------------------------------------------------------------------------------------------
  //added on 26-12-2025 by rajakumari.m----------------------------------------------------------------------------

  const [isViewingCompletedStep, setIsViewingCompletedStep] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState(null);
  //---------------------------------------------------------------------------------------------------------------
  const PROVISIONAL_NOC_STEP_INDICES = useMemo(() => [0, 1, 2, 3, 4], []);
  const OC_PROCESS_STEP_RANGE = useMemo(() => [5, 6, 7, 8, 9, 10], []);


  console.log(viewedStepDetails, "deeeeeeeeeeeeeeeeeeeeeeeee2333333333333");

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
      feepaidstatus: "YES",
      stepStatus_1: "YES", // Site Inspection Status
      stepStatus_2: "YES", // Queries Received?
      stepStatus_3: "YES", // Committee Approved?
      stepStatus_4: "YES", // Provisional Status?
      stepStatus_6: "YES", // Site Inspection Status? (OC)
      stepStatus_7: "YES", // Queries Received? (OC)
      stepStatus_8: "YES", // Committee Approved? (OC)
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

          const provisionalNOCStepsCompleted =
            PROVISIONAL_NOC_STEP_INDICES.every(
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
          // ----------------------------added on 23-12-2025 by rajakumari.m----------------------------
          // Check if all steps completed
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
            setIsAllStepsCompleted(true);
            setImmediateNextStepIndex(PROVISIONAL_NOC_STEP_INDICES.length * 2);
            setViewedStepConceptualIndex(-1);
            return Promise.resolve(null);
          }
          // -----------------------------------------------------------------------------------------------

          if (nextStepFound) {
            const apiUrl = `${API_BASE_URL}/fire-step-details/${encodeURIComponent(
              selectedPlant
            )}/${encodeURIComponent(
              nextStepFound.PROCESS
            )}/${encodeURIComponent(currentStepType)}`;
            return axios.get(apiUrl);
          } else {
            // const allOCStepsCompleted = PROVISIONAL_NOC_STEP_INDICES.every(
            //   (index) =>
            //     steps[index] &&
            //     fetchedData.some(
            //       (item) =>
            //         item.PROCESS === steps[index].PROCESS &&
            //         item.OC_UPDATED === "YES"
            //     )
            // );
            // if (provisionalNOCStepsCompleted && allOCStepsCompleted) {
            //   setImmediateNextStepIndex(PROVISIONAL_NOC_STEP_INDICES.length * 2);
            // }
            // return Promise.resolve(null);
          }
        })
      // In your main useEffect (around line 270-280), update the setFormData call:
// In the main useEffect that runs when selectedPlant changes, update the setFormData part:
.then((detailsRes) => {
  if (detailsRes && detailsRes.data) {
    const details = detailsRes.data;
    setNextStepDetails(details);
    setLatestLogs(details);
    setSetData(details);

    // Check if this step should have radio buttons (steps 1-4 for Provisional, 6-9 for OC)
    const shouldHaveRadioButtons =
      (immediateNextStepIndex > 0 && immediateNextStepIndex < 5) || // Steps 1-4
      (immediateNextStepIndex >= 6 && immediateNextStepIndex <= 9); // Steps 6-9

    // Always default to "YES" for radio button steps
    const stepStatus = "YES";

    setFormData((prev) => ({
      ...prev,
      applyDate: details.APPLY_DT || "",
      comments: details.COMMENTS || "",
      logs: details.LOG || "",
      feePaid: details.FEE_PAID || "",
      feeAmount: details.FEE_AMOUNT || "",
      acknowledgeName: details.ACKNOWLEDGE_NAME || "",
      noOfTowers: details.NO_OF_TOWERS || "",
      feepaidstatus: details.FEE_PAID_STATUS || "YES",
      site: "YES", // Default to YES
      queries: "YES", // Default to YES
      committe: "YES", // Default to YES
      provisional: "YES", // Default to YES
      // Set radio button status to YES
      ...(shouldHaveRadioButtons && {
        [`stepStatus_${immediateNextStepIndex}`]: "YES",
      }),
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
      feepaidstatus: "",
      site: "YES", // Still default to YES
      queries: "YES", // Still default to YES
      committe: "YES", // Still default to YES
      provisional: "YES", // Still default to YES
      // Also reset all stepStatus fields
      stepStatus_1: "YES",
      stepStatus_2: "YES",
      stepStatus_3: "YES",
      stepStatus_4: "YES",
      stepStatus_6: "YES",
      stepStatus_7: "YES",
      stepStatus_8: "YES",
      stepStatus_9: "YES",
    }));
  }
})
        .catch((err) =>
          console.error("Error during data fetching process:", err)
        );
    }
  }, [selectedPlant, steps, PROVISIONAL_NOC_STEP_INDICES]);
// Add this useEffect near your other useEffects:
useEffect(() => {
  // Reset radio buttons to "YES" when step index changes to a radio button step
  const shouldHaveRadioButtons =
    (immediateNextStepIndex > 0 && immediateNextStepIndex < 5) || 
    (immediateNextStepIndex >= 6 && immediateNextStepIndex <= 9);

  if (shouldHaveRadioButtons && !isViewingCompletedStep) {
    console.log(`Resetting step ${immediateNextStepIndex} to YES`);
    
    // Update the specific step status
    setFormData((prev) => ({
      ...prev,
      [`stepStatus_${immediateNextStepIndex}`]: "YES",
    }));

    // Also update the specific field names
    if (immediateNextStepIndex === 1) {
      setFormData((prev) => ({ ...prev, site: "YES" }));
    } else if (immediateNextStepIndex === 2) {
      setFormData((prev) => ({ ...prev, queries: "YES" }));
    } else if (immediateNextStepIndex === 3) {
      setFormData((prev) => ({ ...prev, committe: "YES" }));
    } else if (immediateNextStepIndex === 4) {
      setFormData((prev) => ({ ...prev, provisional: "YES" }));
    }
  }
}, [immediateNextStepIndex, isViewingCompletedStep]);
  //added on 26-12-2025 by rajakumari.m---------------------------------------------------------
  // Handler for clicking on process tiles
  // Update your handleStepClick function (around line 274)
 const handleStepClick = async (processName, stepType, conceptualIndex) => {
  if (!selectedPlant) {
    Swal.fire("Error", "Please select a plant first", "error");
    return;
  }

  setViewedStepConceptualIndex(conceptualIndex);

  try {
    const apiUrl = `${API_BASE_URL}/fire-step-details/${encodeURIComponent(
      selectedPlant
    )}/${encodeURIComponent(processName)}/${encodeURIComponent(stepType)}`;

    const detailsRes = await axios.get(apiUrl);
    const details = detailsRes.data;

    console.log("✅ Fetched Data for " + processName + ":", details);
    setViewedStepDetails(details);

    // Check if this step is completed
    const isCompleted = storeData.some(
      (item) =>
        item.PROCESS === processName &&
        (item.UPDATED === "YES" || item.OC_UPDATED === "YES") &&
        item.STEPTYPE === stepType
    );

    setIsViewingCompletedStep(isCompleted);

    // Check if this is a radio button step
    const isRadioStep = 
      (conceptualIndex > 0 && conceptualIndex < 5) || 
      (conceptualIndex >= 6 && conceptualIndex <= 9);

    // Prepare form data
    const formUpdate = {
      applyDate: details?.APPLY_DT || "",
      comments: details?.COMMENTS || "",
      noOfTowers: details?.NO_OF_TOWERS || "",
      feepaidstatus: details?.FEE_PAID_STATUS || "",
      feePaid: details?.FEE_PAID || "",
      feeAmount: details?.FEE_AMOUNT || "",
      site: "YES", // Default to YES
      queries: "YES", // Default to YES
      committe: "YES", // Default to YES
      provisional: "YES", // Default to YES
      loc: selectedPlant,
    };

    // For radio button steps, set to "YES" as default
    if (isRadioStep) {
      // Only override if it's not a completed step (completed steps should show their actual status)
      if (!isCompleted) {
        formUpdate[`stepStatus_${conceptualIndex}`] = "YES";
      } else {
        formUpdate[`stepStatus_${conceptualIndex}`] = details?.STATUS || "YES";
      }
    }

    setFormData((prev) => ({ ...prev, ...formUpdate }));

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
  } catch (error) {
    console.error("Error fetching step details:", error);
    setViewedStepDetails(null);
    setSelectedLogs([]);
    setIsViewingCompletedStep(false);
  }
};
  //----------------------------------------------------------------------------------------------------------
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
        setFormData((prev) => ({
          ...prev,
          [`stepStatus_${immediateNextStepIndex}`]: "YES",
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

    //  --- : 'fetch User';
    let currentUserName = loggedInUser.username;

    const payload = new FormData();
    payload.append("loc", formData.loc);
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("comments", formData.comments || "");
    payload.append("applyDate", formData.applyDate || "");
    payload.append("username", currentUserName || "");

    payload.append("site", formData.site || "");
    payload.append("queries", formData.queries || "");
    payload.append("committe", formData.committe || "");
    payload.append("provisional", formData.provisional || "");
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });
    payload.append("steptype", currentProcess);

    // Add Number of Towers, Fee Amount, and Fee Paid Status only for Application Submission
    if (
      immediateNextStepIndex === 0 &&
      immediateNextStep?.PROCESS === "Application Submission"
    ) {
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
      (item) =>
        item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim() &&
        item.STEPTYPE === currentProcess
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

      // 1. Reset Plant Selection State
      setSelectedPlant("");

      // 2. Reset Context Data (Clears Left Side Colors and Header)
      setStoreData([]);
      setHeaderData(null);

      // 3. Reset Step Tracking (Clears Right Side Docs and Middle Form)
      setImmediateNextStep(null);
      setImmediateNextStepIndex(-1);
      setNextStepDetails(null);
      setLatestLogs([]);
      setCurrentProcess("");
      setProvisionalNOCCompleted(false);

      // 4. Reset View Modes (Exit any "View Mode")
      setViewedStepConceptualIndex(-1);
      setViewedStepDetails(null);
      setIsViewingCompletedStep(false);
      setIsAllStepsCompleted(false);

      // 5. Reset Files and Errors
      setNewDocs([]);
      setAcknowledgeDocs([]);
      setErrors({});

      // 6. Reset Form Data to Initial State
      setFormData({
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
        site: "",
        queries: "",
        committe: "",
        provisional: "",
        stepStatus_1: "YES",
        stepStatus_2: "YES",
        stepStatus_3: "YES",
        stepStatus_4: "YES",
        stepStatus_6: "YES",
        stepStatus_7: "YES",
        stepStatus_8: "YES",
        stepStatus_9: "YES",
      });

      // --- END OF RESET LOGIC ---
      // setFormData((prev) => ({
      //   ...prev,
      //   loc: "",
      //   applyDate: "",
      //   comments: "",
      //   feePaid: "",
      //   feeAmount: "",
      //   acknowledgeName: "",
      //   noOfTowers: "",
      //   feepaidstatus: "",
      // }));
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

  // Add this function near your other handler functions (around line 400)
  // Add this function near your other handler functions (around line 400)
// Update the handleBackToCurrentStep function:
const handleBackToCurrentStep = () => {
  setViewedStepConceptualIndex(-1);
  setViewedStepDetails(null);
  setIsViewingCompletedStep(false);

  // Reset form data to current step data with YES as default
  if (nextStepDetails) {
    // Always set to "YES" for radio button steps when returning to current step
    let stepStatus = "YES"; // Force default to YES
    
    // Check if this is a step that should have radio buttons (1-4, 6-9)
    const shouldHaveRadioButtons = 
      (immediateNextStepIndex > 0 && immediateNextStepIndex < 5) || 
      (immediateNextStepIndex >= 6 && immediateNextStepIndex <= 9);
    
    setFormData((prev) => ({
      ...prev,
      applyDate: nextStepDetails.APPLY_DT || "",
      comments: "", // Clear comments for fresh input
      noOfTowers: nextStepDetails.NO_OF_TOWERS || "",
      feepaidstatus: nextStepDetails.FEE_PAID_STATUS || "",
      feePaid: nextStepDetails.FEE_PAID || "",
      feeAmount: nextStepDetails.FEE_AMOUNT || "",
      site: "YES", // Force to YES
      queries: "YES", // Force to YES
      committe: "YES", // Force to YES
      provisional: "YES", // Force to YES
      // Set the radio button status to YES for all steps
      ...(shouldHaveRadioButtons && {
        [`stepStatus_${immediateNextStepIndex}`]: "YES",
      }),
    }));
  }
};
  const handleDeleteDocument = async (docType, fileName, index) => {
    try {
      const result = await Swal.fire({
        title: "Delete Document?",
        text: `Are you sure you want to delete ${fileName}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
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
              const filteredDocs = parsedDocs.filter(
                (doc) => doc.file_name !== fileName
              );
              updatedDetails.UPLOAD_DOC = JSON.stringify(filteredDocs);
            } catch (error) {
              console.error("Error updating UPLOAD_DOC:", error);
            }
          } else if (docType === "ACK_DOC" && updatedDetails.ACK_DOC) {
            try {
              const parsedDocs = JSON.parse(updatedDetails.ACK_DOC);
              const filteredDocs = parsedDocs.filter(
                (doc) => doc.file_name !== fileName
              );
              updatedDetails.ACK_DOC = JSON.stringify(filteredDocs);
            } catch (error) {
              console.error("Error updating ACK_DOC:", error);
            }
          }

          setNextStepDetails(updatedDetails);
        }

        if (storeData && storeData.length > 0) {
          const updatedStoreData = storeData.map((item) => {
            if (
              item.PROCESS === immediateNextStep.PROCESS &&
              item.STEPTYPE === currentProcess
            ) {
              const updatedItem = { ...item };

              if (docType === "UPLOAD_DOC" && updatedItem.UPLOAD_DOC) {
                try {
                  const parsedDocs = JSON.parse(updatedItem.UPLOAD_DOC);
                  const filteredDocs = parsedDocs.filter(
                    (doc) => doc.file_name !== fileName
                  );
                  updatedItem.UPLOAD_DOC = JSON.stringify(filteredDocs);
                } catch (error) {
                  console.error("Error updating storeData UPLOAD_DOC:", error);
                }
              } else if (docType === "ACK_DOC" && updatedItem.ACK_DOC) {
                try {
                  const parsedDocs = JSON.parse(updatedItem.ACK_DOC);
                  const filteredDocs = parsedDocs.filter(
                    (doc) => doc.file_name !== fileName
                  );
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

        Swal.fire("Deleted!", "Document has been deleted.", "success");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      Swal.fire("Error!", "Failed to delete document.", "error");
    }
  };



  const renderDocumentHistory = () => {
    // 1. Determine which data source to use (Viewed Step OR Current Step)
    const details = viewedStepDetails || nextStepDetails;

    // 2. Safety check: If nothing exists, return empty
    if (
      !details ||
      typeof details !== "object" ||
      Object.keys(details).length === 0
    ) {
      return (
        <p className="text-muted mb-0">No previous documents for this step.</p>
      );
    }

    // 3. Prepare Document Lists
    let generalDocuments = [];
    let acknowledgementReceipts = [];

    // FIX: Use 'details' instead of 'nextStepDetails'
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

    // FIX: Use 'details' instead of 'nextStepDetails'
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

    // 4. FIX FOR LOGS: Determine which logs to show
    let logsToShow = [];
    if (viewedStepDetails) {
      // If viewing history, use logs from the viewed details
      if (viewedStepDetails.LOG) {
        try {
          logsToShow = JSON.parse(viewedStepDetails.LOG);
        } catch (error) {
          console.error("Failed to parse logs:", error);
        }
      }
    } else {
      // If viewing current step, use the existing helper function
      logsToShow = getCurrentStepLogs();
    }

    return (
      <div
        className="d-flex flex-column"
        style={{ height: "100%", maxHeight: "330px" }}
      >
        <Card
          style={{
            padding: "10px",
            flex: "1 1 auto",
            minHeight: "0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            width: "300px",
          }}
        >
          <div
            style={{
              flex: "1 1 auto",
              overflowY: "auto",
              paddingRight: "5px",
            }}
          >
            {/* General Documents Section */}
            <div style={{ marginBottom: "15px" }}>
              <h6 className="text-primary mb-2">General Uploaded Documents</h6>
              {generalDocuments.length > 0 ? (
                <div
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    padding: "5px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <ul className="list-unstyled mb-0">
                    {generalDocuments.map((doc, idx) => (
                      <li
                        key={`gen-doc-${idx}`}
                        className="d-flex justify-content-between align-items-center mb-1 p-1"
                        style={{
                          backgroundColor: "white",
                          borderRadius: "3px",
                          borderBottom:
                            idx < generalDocuments.length - 1
                              ? "1px solid #e9ecef"
                              : "none",
                        }}
                      >
                        <div
                          className="text-truncate"
                          style={{
                            maxWidth: "calc(100% - 40px)",
                            flexShrink: 1,
                          }}
                        >
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none text-dark"
                            style={{ fontSize: "13px" }}
                          >
                            <FaFileAlt
                              className="me-2"
                              style={{ minWidth: "16px" }}
                            />
                            <span
                              className="text-truncate"
                              style={{
                                display: "inline-block",
                                maxWidth: "calc(100% - 30px)",
                                verticalAlign: "middle",
                              }}
                            >
                              {doc.name}
                            </span>
                          </a>
                        </div>
                        {/* Only show delete button if NOT viewing a completed/history step */}
                        {!isViewingCompletedStep && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="flex-shrink-0"
                            style={{
                              padding: "2px 6px",
                              fontSize: "11px",
                              minWidth: "30px",
                              height: "24px",
                            }}
                            onClick={() =>
                              handleDeleteDocument("UPLOAD_DOC", doc.name, idx)
                            }
                            title="Delete document"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p
                  className="text-muted mb-0 small"
                  style={{ fontSize: "13px" }}
                >
                  No general documents were uploaded for this step.
                </p>
              )}
            </div>

            {/* Acknowledgement Documents Section */}
            <div style={{ marginBottom: "15px" }}>
              {/* Show header if documents exist OR if it's the specific step where they are relevant */}
              {(acknowledgementReceipts.length > 0 ||
                immediateNextStepIndex === 0) && (
                  <h6 className="text-primary mb-2">Acknowledgement Receipts</h6>
                )}

              {acknowledgementReceipts.length > 0 ? (
                <div
                  style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    padding: "5px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <ul className="list-unstyled mb-0">
                    {acknowledgementReceipts.map((doc, idx) => (
                      <li
                        key={`ack-doc-${idx}`}
                        className="d-flex justify-content-between align-items-center mb-1 p-1"
                        style={{
                          backgroundColor: "white",
                          borderRadius: "3px",
                          borderBottom:
                            idx < acknowledgementReceipts.length - 1
                              ? "1px solid #e9ecef"
                              : "none",
                        }}
                      >
                        <div
                          className="text-truncate"
                          style={{
                            maxWidth: "calc(100% - 40px)",
                            flexShrink: 1,
                          }}
                        >
                          <a
                            href={doc?.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none text-dark"
                            style={{ fontSize: "13px" }}
                          >
                            <FaFileAlt
                              className="me-2"
                              style={{ minWidth: "16px" }}
                            />
                            <span
                              className="text-truncate"
                              style={{
                                display: "inline-block",
                                maxWidth: "calc(100% - 30px)",
                                verticalAlign: "middle",
                              }}
                            >
                              {doc?.name}
                            </span>
                          </a>
                        </div>
                        {/* Only show delete button if NOT viewing a completed/history step */}
                        {!isViewingCompletedStep && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="flex-shrink-0"
                            style={{
                              padding: "2px 6px",
                              fontSize: "11px",
                              minWidth: "30px",
                              height: "24px",
                            }}
                            onClick={() =>
                              handleDeleteDocument("ACK_DOC", doc.name, idx)
                            }
                            title="Delete receipt"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                // Only show placeholder if we are in the specific step and no docs exist
                immediateNextStepIndex === 0 && (
                  <p
                    className="text-muted mb-0 small"
                    style={{ fontSize: "13px" }}
                  ></p>
                )
              )}
            </div>
          </div>
        </Card>

        {/* Logs Button Section */}
        <div
          className="p-2 border-top bg-light text-center"
          style={{ flexShrink: 0 }}
        >
          <Button
            variant="info"
            size="sm"
            onClick={() => {
              // FIX: Use the logs we calculated above
              setSelectedLogs(logsToShow);
              setShowLogsModal(true);
            }}
            // FIX: Disable based on the calculated logs array
            disabled={!logsToShow || logsToShow.length === 0}
            style={{
              minWidth: "120px",
              fontSize: "13px",
              padding: "4px 12px",
            }}
          >
            {!logsToShow || logsToShow.length === 0
              ? "No Logs Available"
              : `View Logs (${logsToShow.length})`}
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
              currentConceptualIndex =
                idx + PROVISIONAL_NOC_STEP_INDICES.length;
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
                {/* <Nav.Link
                  eventKey={currentConceptualIndex}
                  disabled={!clickable}
                  className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                  style={{ cursor: clickable ? "pointer" : "not-allowed" }}
                >
                  {statusIcon}
                  <span>{step.PROCESS}</span>
                </Nav.Link> */}
                {/* -------------------added on 23-12-2025 by rajakumari.m ------------------------ */}
                {/* // Replace the Nav.Link in renderProcessColumn with: */}
                <Nav.Link
                  eventKey={currentConceptualIndex}
                  disabled={!clickable}
                  active={viewedStepConceptualIndex === currentConceptualIndex}
                  onClick={() => {
                    if (clickable) {
                      handleStepClick(
                        step.PROCESS,
                        isOCPhase ? "OCPROCESS" : "ProvisionalNOC",
                        currentConceptualIndex
                      );
                    }
                  }}
                  className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                  style={{ cursor: clickable ? "pointer" : "not-allowed" }}
                >
                  {statusIcon}
                  <span>{step.PROCESS}</span>
                </Nav.Link>

                {/* ---------------------------------------------------------------------------- */}
              </Nav.Item>
            );
          })}
        </Nav>
      </Col>
    );
  };

  const FeeAmount = storeData[0]?.FEE_AMOUNT;
  const NumberOfTowers = storeData[0]?.NO_OF_TOWERS;

  const handleBackClick = () => {
    setSelectedPlant("");

    // 2. Reset Context Data (Clears Left Side Colors and Header)
    setStoreData([]);
    setHeaderData(null);

    // 3. Reset Step Tracking (Clears Right Side Docs and Middle Form)
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setNextStepDetails(null);
    setLatestLogs([]);
    setCurrentProcess("");
    setProvisionalNOCCompleted(false);

    // 4. Reset View Modes (Exit any "View Mode")
    setViewedStepConceptualIndex(-1);
    setViewedStepDetails(null);
    setIsViewingCompletedStep(false);
    setIsAllStepsCompleted(false);

    // 5. Reset Files and Errors
    setNewDocs([]);
    setAcknowledgeDocs([]);
    setErrors({});

    // 6. Reset Form Data to Initial State
    setFormData({
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
      site: "",
      queries: "",
      committe: "",
      provisional: "",
      stepStatus_1: "YES",
      stepStatus_2: "YES",
      stepStatus_3: "YES",
      stepStatus_4: "YES",
      stepStatus_6: "YES",
      stepStatus_7: "YES",
      stepStatus_8: "YES",
      stepStatus_9: "YES",
    });

    // --- END OF RESET LOGIC ---
    // setFormData((prev) => ({
    //   ...prev,
    //   loc: "",
    //   applyDate: "",
    //   comments: "",
    //   feePaid: "",
    //   feeAmount: "",
    //   acknowledgeName: "",
    //   noOfTowers: "",
    //   feepaidstatus: "",
    // }));
    setNewDocs([]);
    setAcknowledgeDocs([]);

  };


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

            {isAllStepsCompleted && viewedStepConceptualIndex === -1 ? (
              <div className="d-flex align-items-center justify-content-center h-100">
                <Card className="p-4 shadow-sm text-center position-relative" style={{ maxWidth: '600px' }}>

                  {/* Button in top-right corner of card */}
                  <button
                    onClick={handleBackClick}
                    className="btn btn-success position-absolute"
                    style={{ top: '15px', right: '15px' }}
                  >
                    <FaArrowLeft className="me-1" /> Back to Start
                  </button>

                  <Card.Body>
                    <FaCheckCircle size={64} className="text-success mb-3" />
                    <h3 className="text-success mb-3">Congratulations! 🎉</h3>
                    <h5 className="text-muted mb-4">All process steps have been completed successfully!</h5>
                    <Alert variant="success">
                      <Alert.Heading>Project Completion Status</Alert.Heading>
                      <p>
                        All <strong>{PROVISIONAL_NOC_STEP_INDICES.length * 2}</strong> steps for <strong>{selectedPlant}</strong> have been completed successfully.
                      </p>
                      <p>
                        Both <strong>Provisional NOC</strong> and <strong>OC Process</strong> are fully completed.
                      </p>
                      <hr />
                      <p className="mb-0">
                        Click on any completed step above to view its details.
                      </p>
                    </Alert>
                  </Card.Body>
                </Card>
              </div>
            ) : viewedStepConceptualIndex !== -1 && isViewingCompletedStep ? (
              // Show this when viewing a completed step
              // <div className="mb-4">
              // added on 29-12-2025 by rajakumari.m -------------------------------------------------------------------
              <div
                className="mb-4 border rounded p-3"
                style={{
                  height: "400px",
                  overflowY: "auto",
                }}
              >
                {/* //--------------------------------------------------------------------------  */}

                {/* Display form fields in view-only mode */}
                {/* <div className="bg-light p-3 rounded border"> */}
                <h5 className="mb-3 text-success  fw-bold"> {steps[viewedStepConceptualIndex % PROVISIONAL_NOC_STEP_INDICES.length].PROCESS}
                  <> Towers: <span className="text-dark">{NumberOfTowers} (Completed)</span></>
                </h5>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleBackToCurrentStep}
                >
                  ← Back to Current Step
                </Button>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Plant</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.loc}
                        readOnly
                        className="bg-white"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        {viewedStepConceptualIndex === 1
                          ? "Inspection Date"
                          : "Apply Date"}
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={
                          viewedStepDetails?.APPLY_DT || formData.applyDate
                        }
                        readOnly

                        // added on 4-1-2026 by rajakumari.m-------------------------------------------------
                        style={{
                          backgroundColor: isViewingCompletedStep ? '#e9ecef' : '',
                          color: isViewingCompletedStep ? '#6c757d' : '',
                          cursor: isViewingCompletedStep ? 'not-allowed' : ''
                        }}
                      // /------------------------------------------------------------------------------------------
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Display completed step information */}
                {viewedStepDetails?.COMMENTS && (
                  <Row className="mb-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Comments</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={viewedStepDetails.COMMENTS}
                          readOnly
                          // added on 4-1-2026 by rajakumari.m-------------------------------------------------
                          style={{
                            backgroundColor: isViewingCompletedStep ? '#e9ecef' : '',
                            color: isViewingCompletedStep ? '#6c757d' : '',
                            cursor: isViewingCompletedStep ? 'not-allowed' : ''
                          }}
                        // /------------------------------------------------------------------------------------------

                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {/* Show Fee Amount and Number of Towers if they exist */}
                {(viewedStepDetails?.FEE_AMOUNT ||
                  viewedStepDetails?.NO_OF_TOWERS) && (
                    <Row className="mb-3">
                      {viewedStepDetails?.NO_OF_TOWERS && (
                        <Col md={6}>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Number Of Towers</Form.Label>
                              <Form.Control
                                type="text"
                                name="noOfTowers"
                                value={formData.noOfTowers || ""}
                                disabled
                                // onChange={handleChange}
                                style={{
                                  backgroundColor: isViewingCompletedStep ? '#e9ecef' : '',
                                  color: isViewingCompletedStep ? '#6c757d' : '',
                                  cursor: isViewingCompletedStep ? 'not-allowed' : ''
                                }}
                              />
                            </Form.Group>
                          </Col>
                        </Col>
                      )}
                      {viewedStepDetails?.FEE_AMOUNT && (
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Fee Amount</Form.Label>
                            <Form.Control
                              type="text"
                              value={viewedStepDetails.FEE_AMOUNT}
                              readOnly
                              // added on 4-1-2026 by rajakumari.m-------------------------------------------------
                              style={{
                                backgroundColor: isViewingCompletedStep ? '#e9ecef' : '',
                                color: isViewingCompletedStep ? '#6c757d' : '',
                                cursor: isViewingCompletedStep ? 'not-allowed' : ''
                              }}
                            // /------------------------------------------------------------------------------------------
                            />
                          </Form.Group>
                        </Col>
                      )}
                    </Row>
                  )}

                {/* Show Fee Paid Status if it exists */}
                {viewedStepDetails?.FEE_PAID_STATUS && (
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Fee Paid Status</Form.Label>
                        <Form.Control
                          type="text"
                          value={viewedStepDetails.FEE_PAID_STATUS}
                          readOnly
                          // added on 4-1-2026 by rajakumari.m-------------------------------------------------
                          style={{
                            backgroundColor: isViewingCompletedStep ? '#e9ecef' : '',
                            color: isViewingCompletedStep ? '#6c757d' : '',
                            cursor: isViewingCompletedStep ? 'not-allowed' : ''
                          }}
                        // /------------------------------------------------------------------------------------------
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {/* Show status for steps with radio buttons */}
                {isViewingCompletedStep && (
                  <>

                    {viewedStepConceptualIndex === 1 && (
                      <Row className="mb-3">
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Site Inspection Status</Form.Label>
                            <Form.Control
                              type="text"
                              value={
                                viewedStepDetails?.SIT_INFSTIN_STATUS ||
                                formData.site ||
                                "YES"
                              }
                              readOnly
                              className="bg-light"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    )}
                    {viewedStepConceptualIndex === 2 && (
                      <Row className="mb-3">
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Queries Received?</Form.Label>
                            <Form.Control
                              type="text"
                              value={
                                viewedStepDetails?.QUERIES_RECIEVED ||
                                formData.queries ||
                                "Not Available"
                              }
                              readOnly
                              className="bg-light"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    )}
                    {viewedStepConceptualIndex === 3 && (
                      <Row className="mb-3">
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Committee Approved?</Form.Label>
                            <Form.Control
                              type="text"
                              value={
                                viewedStepDetails?.COMMITE_APRVD ||
                                formData.committe ||
                                "Not Available"
                              }
                              readOnly
                              className="bg-light"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    )}

                    {/* Step 4: Provisional Status */}
                    {viewedStepConceptualIndex === 4 && (
                      <Row className="mb-3">
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Provisional Status?</Form.Label>
                            <Form.Control
                              type="text"
                              value={
                                viewedStepDetails?.PROVSINL_STATUS ||
                                formData.provisional ||
                                "Not Available"
                              }
                              readOnly
                              className="bg-light"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    )}  </>
                )}



                {/* Show Upload button in disabled state */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Label>Upload Application Documents</Form.Label>
                    <Button
                      variant="outline-secondary"
                      className="form-control"
                      disabled
                    >
                      Upload Docs (Disabled)
                    </Button>
                  </Col>
                </Row>

                {/* Disabled Submit Button */}
                <div className="d-grid mt-3">
                  <Button
                    variant="success"
                    size="md"
                    disabled
                    className="w-100"
                  >
                    ✅ Step Completed (View Only)
                  </Button>
                  <p className="text-muted text-center small mt-1">
                    This step has already been completed and cannot be modified
                  </p>
                </div>
                {/* </div> */}
              </div>
            ) : (
              <>
                {immediateNextStep && (
                  <h4 className="mb-3 text-primary fw-bold">
                    {immediateNextStep.PROCESS}
                    {/* Show Towers and FeeAmount only for steps 1-4 (after Application Submission) */}
                    {immediateNextStepIndex >= 1 &&
                      immediateNextStepIndex <= 4 &&
                      NumberOfTowers && (
                        <>
                          {" "}
                          | Towers:{" "}
                          <span className="text-dark">{NumberOfTowers}</span>
                        </>
                      )}
                    {immediateNextStepIndex >= 1 &&
                      immediateNextStepIndex <= 4 &&
                      FeeAmount && (
                        <>
                          {" "}
                          | FeeAmount:{" "}
                          <span className="text-dark">{FeeAmount}</span>
                        </>
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
                        disabled={
                          !formData.loc ||
                          (nextStepDetails && nextStepDetails.APPLY_DT) ||
                          isViewingCompletedStep
                        }
                        onChange={handleChange}
                        isInvalid={!!errors.applyDate}
                        style={{
                          backgroundColor: isViewingCompletedStep ? '#e9ecef' : '',
                          color: isViewingCompletedStep ? '#6c757d' : '',
                          cursor: isViewingCompletedStep ? 'not-allowed' : ''
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.applyDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Show Number of Towers and Fee Amount only for Application Submission */}
                <Row className="mb-3">
                  {immediateNextStepIndex === 0 &&
                    immediateNextStep?.PROCESS === "Application Submission" && (
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
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [`stepStatus_${immediateNextStepIndex}`]:
                                    "YES",
                                }))
                              }
                              disabled={isViewingCompletedStep}
                            />
                            <Form.Check
                              type="radio"
                              label="No"
                              name="feepaidstatus"
                              value="NO"
                              checked={formData.feepaidstatus === "NO"}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [`stepStatus_${immediateNextStepIndex}`]:
                                    e.target.value,
                                }))
                              }
                              disabled={isViewingCompletedStep}
                            />
                          </div>
                        </Form.Group>
                      </Col>
                    )}
                  {/* Column 1: Number of Towers */}
                  {immediateNextStepIndex === 0 &&
                    immediateNextStep?.PROCESS === "Application Submission" && (
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Number Of Towers</Form.Label>
                          <Form.Control
                            type="text"
                            name="noOfTowers"
                            value={formData.noOfTowers || ""}
                            disabled
                          // disabled={!formData.loc || isViewingCompletedStep}
                          // onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    )}

                  {/* Column 2: Fee Paid Radio */}

                  {/* Column 3: Fee Amount - Only shown if feepaidstatus is YES */}
                  {immediateNextStepIndex === 0 &&
                    immediateNextStep?.PROCESS === "Application Submission" &&
                    formData.feepaidstatus === "YES" ? (
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Fee Amount</Form.Label>
                        <Form.Control
                          type="text"
                          name="feeAmount"
                          value={formData.feeAmount || ""}
                          disabled={!formData.loc || isViewingCompletedStep}
                          onChange={handleChange}
                          style={{
                            backgroundColor: isViewingCompletedStep ? '#e9ecef' : '',
                            color: isViewingCompletedStep ? '#6c757d' : '',
                            cursor: isViewingCompletedStep ? 'not-allowed' : ''
                          }}
                        />
                      </Form.Group>
                    </Col>
                  ) : immediateNextStepIndex === 0 &&
                    immediateNextStep?.PROCESS === "Application Submission" ? (
                    // Empty column to maintain layout when Fee Amount is not shown
                    <Col md={4}></Col>
                  ) : null}
                </Row>


                {immediateNextStepIndex === 1 && (
  <Form.Group>
    <Form.Label>Site Inspection Status</Form.Label>
    <Form.Check
      type="radio"
      label="Yes"
      name="site"
      value="YES"
      checked={formData.site === "YES" || formData.stepStatus_1 === "YES"}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          site: "YES",
          stepStatus_1: "YES",
        }))
      }
      disabled={isViewingCompletedStep}
    />
    <Form.Check
      type="radio"
      label="No"
      name="site"
      value="NO"
      checked={formData.site === "NO" || formData.stepStatus_1 === "NO"}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          site: "NO",
          stepStatus_1: "NO",
        }))
      }
      disabled={isViewingCompletedStep}
    />
  </Form.Group>
)}
               

                {
                  immediateNextStepIndex === 2 && (
                    <Form.Group>
                      <Form.Label>Queries Received?</Form.Label>
                      <Form.Check
                        type="radio"
                        label="Yes"
                        name="queries"
                        value="YES"
                        checked={
                          formData.queries === "YES" ||
                          nextStepDetails?.QUERIES_RECIEVED === "YES"
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            queries: "YES",
                            stepStatus_2: "YES",
                          }))
                        }
                        disabled={isViewingCompletedStep}
                      />
                      <Form.Check
                        type="radio"
                        label="No"
                        name="queries"
                        value="NO"
                        checked={
                          formData.queries === "NO" ||
                          nextStepDetails?.QUERIES_RECIEVED === "NO"
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            queries: "NO",
                            stepStatus_2: "NO",
                          }))
                        }
                        disabled={isViewingCompletedStep}
                      />
                    </Form.Group>
                  )
                }

                {
                  immediateNextStepIndex === 3 && (
                    <Form.Group>
                      <Form.Label>Committee Approved?</Form.Label>
                      <Form.Check
                        type="radio"
                        label="Yes"
                        name="committe"
                        value="YES"
                        checked={
                          formData.committe === "YES" ||
                          nextStepDetails?.COMMITE_APRVD === "YES"
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            committe: "YES",
                            stepStatus_3: "YES",
                          }))
                        }
                        disabled={isViewingCompletedStep}
                      />
                      <Form.Check
                        type="radio"
                        label="No"
                        name="committe"
                        value="NO"
                        checked={
                          formData.committe === "NO" ||
                          nextStepDetails?.COMMITE_APRVD === "NO"
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            committe: "NO",
                            stepStatus_3: "NO",
                          }))
                        }
                        disabled={isViewingCompletedStep}
                      />
                    </Form.Group>
                  )
                }

                {
                  immediateNextStepIndex === 4 && (
                    <Form.Group>
                      <Form.Label>Provisional Status?</Form.Label>
                      <Form.Check
                        type="radio"
                        label="Yes"
                        name="provisional"
                        value="YES"
                        checked={
                          formData.provisional === "YES" ||
                          nextStepDetails?.PROVSINL_STATUS === "YES"
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            provisional: "YES",
                            stepStatus_4: "YES",
                          }))
                        }
                        disabled={isViewingCompletedStep}
                      />
                      <Form.Check
                        type="radio"
                        label="No"
                        name="provisional"
                        value="NO"
                        checked={
                          formData.provisional === "NO" ||
                          nextStepDetails?.PROVSINL_STATUS === "NO"
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            provisional: "NO",
                            stepStatus_4: "NO",
                          }))
                        }
                        disabled={isViewingCompletedStep}
                      />
                    </Form.Group>
                  )
                }
                {/* {immediateNextStepIndex > 0 && immediateNextStepIndex < 5 && (
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
      checked={formData[`stepStatus_${immediateNextStepIndex}`] === "YES"}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          [`stepStatus_${immediateNextStepIndex}`]: "YES",
        }))
      }
      disabled={isViewingCompletedStep}
      className={isViewingCompletedStep ? 'text-muted' : ''}
    />
    <Form.Check
      type="radio"
      inline
      label="No"
      name={`stepStatus_${immediateNextStepIndex}`}
      id={`stepNo_${immediateNextStepIndex}`}
      value="NO"
      checked={formData[`stepStatus_${immediateNextStepIndex}`] === "NO"}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          [`stepStatus_${immediateNextStepIndex}`]: e.target.value,
        }))
      }
      disabled={isViewingCompletedStep}
      className={isViewingCompletedStep ? 'text-muted' : ''}
    />
  </div>
                  </Form.Group>
                )} */}

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Label>Upload Application Documents</Form.Label>
                    <Button
                      variant="outline-secondary"
                      className="form-control"
                      onClick={() => setShowUploadModal(true)}
                      disabled={isViewingCompletedStep}
                      style={{
                        backgroundColor: isViewingCompletedStep ? '#e9ecef' : '',
                        color: isViewingCompletedStep ? '#6c757d' : '',
                        borderColor: isViewingCompletedStep ? '#dee2e6' : '',
                        cursor: isViewingCompletedStep ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Upload Docs {newDocs.length > 0 && `(${newDocs.length} files)`}
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
    disabled={!formData.loc || isViewingCompletedStep}
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
                    disabled={
                      !formData.loc || isSubmitting || isViewingCompletedStep
                    }
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>

                  {/* Optional: Show a disabled button when viewing completed step */}
                  {isViewingCompletedStep && (
                    <div className="mt-2">
                      <Button
                        variant="success"
                        size="md"
                        className="w-100"
                        disabled
                      >
                        ✅ Step Completed (View Only)
                      </Button>
                      <p className="text-muted text-center small mt-1">
                        This step has already been completed and cannot be
                        modified
                      </p>
                    </div>
                  )}
                </div>
              </> // {/*added on 23-12-2025 by rajakumari.m */}
            )}{" "}
            {/*added on 23-12-2025 by rajakumari.m */}
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

      <Modal
        show={showLogsModal}
        onHide={() => setShowLogsModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Logs for {immediateNextStep?.PROCESS}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "300px", overflowY: "auto" }}>
          {selectedLogs.length === 0 ? (
            <p>No logs available</p>
          ) : (
            selectedLogs.map((log, i) => (
              <div key={i} className="mb-2">
                <strong>{log?.date || "Unknown Date"}:</strong>{" "}
                {log?.comment || "No comment"}
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
