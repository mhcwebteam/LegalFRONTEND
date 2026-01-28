
import React, { useEffect, useState, useContext } from "react";
import { Nav, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config/Config";
import { FaArrowLeft, FaCheckCircle, FaUpload } from "react-icons/fa";
import { Context } from "../context/ContextData";
import ReusableDialog from "./ReusableDialog";
import ProjectInfoHeader from "./ProjectInfoHeader";
import WaterDocUploadModal from "./WaterDocUploadModal";
import PreviousGhmcDocs from "./PreviousGhmcDocs";
import { getMasterByLoc } from "../api/Api";
import EmailSelectionModal from "./EmailModal"
import Swal from "sweetalert2";
import FeePaidAdditionalDetails from "./FeePaidAdditionalDetails";

const GhmcUpdate = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const {
    storeData,
    setStoreData,
    totalMasterData,
    setHeaderData,
    headerData,
    setRespModifyData,
  } = useContext(Context);

  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [nextStepDetails, setNextStepDetails] = useState(null);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [loc, setLoc] = useState([]);

  // 👇 NEW STATE: Track if we're viewing a specific step
  const [isViewingSpecificStep, setIsViewingSpecificStep] = useState(false);
const [recordExists, setRecordExists] = useState(false);
  const [viewedStep, setViewedStep] = useState(null);
  const [viewedStepDetails, setViewedStepDetails] = useState(null);
      const [loggedInUser, setLoggedInUser] = useState(null);   //------------login user state
  const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);
  const [formData, setFormData] = useState({
    loc: "",
    applyDate: "",
    comments: "",
    process: "",
    organisation: "",
    project_name: "",
    location: "",
    status: "",
    noOfTowers: "",

    BG_FromDate: "",
  BG_ToDate: "",
  BG_Number: "",
  CAR_FromDate: "",
  CAR_ToDate: "",
  CAR_Number: "",
  PDC_Date: "",
  PDC_Number: "",
  MortgageReleased: "",
  });

  const [feasibilityDocs, setFeasibilityDocs] = useState([]);
  const [AmountPaidDocs, setAmountPaidDocs] = useState([]);
  const [linkDocs, setLinkDocs] = useState([]);
  const [landDocs, setLandDocs] = useState([]);
  const [othDocs, setOthDocs] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showFeasibilityModal, setShowFeasibilityModal] = useState(false);
  const [amountPaidDocModal, setAmountPaidDocModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [organizationType, setOrganizationType] = useState("");
  const [isFirstProcess, setIsFirstProcess] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentProcess, setCurrentProcess] = useState("");

  const [errors, setErrors] = useState({});
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    message: "",
    confirmText: "OK",
    open: false,
  });

 
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

      
  // Check if viewing the immediate next step (not a completed step)
  const isViewingNextStep = () => {
    return viewedStep?.PROCESS === immediateNextStep?.PROCESS;
  };

    const checkRecordExists = () => {
    if (selectedPlant && immediateNextStep) {
      const exists = storeData.some(item => 
        item.PROCESS?.toLowerCase().trim() === immediateNextStep.PROCESS?.toLowerCase().trim() &&
        item.loc?.toLowerCase().trim() === selectedPlant.toLowerCase().trim()
      );

      
      setRecordExists(exists);
      console.log("Record exists check:", exists, "for process:", immediateNextStep?.PROCESS, "plant:", selectedPlant);
    } else {
      setRecordExists(false);
    }
  };

    useEffect(() => {
      checkRecordExists();
    }, [storeData, selectedPlant, immediateNextStep]);
const handleEmailSubmit = () => {
  // Only allow submit if we're viewing the immediate next step
  if (!isViewingNextStep()) {
    Swal.fire({
      icon: "warning",
      title: "Cannot Submit",
      text: "Cannot submit a completed step. Please select the next pending step.",
      confirmButtonText: "OK"
    });
    return;
  }

  if (!recordExists) {
    Swal.fire({
      icon: "warning",
      title: "Process Not Initialized",
      text: `The process "${immediateNextStep?.PROCESS}" has not been initialized for plant "${selectedPlant}". Please submit in the Modify section.`,
      confirmButtonText: "OK"
    });
    return;
  }

  const newErrors = {};
  
  // Basic validations
  if (!formData.loc) newErrors.loc = "Plant selection is required";
  if (!formData.applyDate) newErrors.applyDate = "Apply date is required";
  
  // 🔥 STRICT VALIDATION: ALL Fee Paid Details fields are mandatory
  const isFeePaidProcess = immediateNextStep?.PROCESS === "Fee Paid Details";
  
  if (isFeePaidProcess) {
    // Bank Guarantee fields - ALL required
    if (!formData.BG_FromDate) {
      newErrors.BG_FromDate = "BG From Date is required";
    }
    if (!formData.BG_ToDate) {
      newErrors.BG_ToDate = "BG To Date is required";
    }
    if (!formData.BG_Number || formData.BG_Number.trim() === "") {
      newErrors.BG_Number = "BG Number is required";
    }

    // CAR Policy fields - ALL required
    if (!formData.CAR_FromDate) {
      newErrors.CAR_FromDate = "CAR From Date is required";
    }
    if (!formData.CAR_ToDate) {
      newErrors.CAR_ToDate = "CAR To Date is required";
    }
    if (!formData.CAR_Number || formData.CAR_Number.trim() === "") {
      newErrors.CAR_Number = "CAR Number is required";
    }

    // PDC fields - ALL required
    if (!formData.PDC_Date) {
      newErrors.PDC_Date = "PDC Date is required";
    }
    if (!formData.PDC_Number || formData.PDC_Number.trim() === "") {
      newErrors.PDC_Number = "PDC Number is required";
    }

    // Mortgage Released - Required
    if (!formData.MortgageReleased) {
      newErrors.MortgageReleased = "Please select Mortgage Released option";
    }
  }
  
  // If there are validation errors, show them
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    
    // Scroll to first error field
    const firstErrorField = Object.keys(newErrors)[0];
    const errorElement = document.getElementById(firstErrorField) || 
                        document.querySelector(`[name="${firstErrorField}"]`);
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      errorElement.focus();
    }
    
    // Show comprehensive error alert with list of missing fields
    Swal.fire({
      icon: "error",
      title: "Incomplete Form",
      html: `
        Please fill all required fields
      `,
      confirmButtonText: "OK",
      width: '500px'
    });
    return;
  }
  
  // Clear errors if validation passes
  setErrors({});
  
  // Only show email modal if all validations pass
  setShowEmailModal(true);
};
  // const handleEmailSubmit = () => {
  //   // Only allow submit if we're viewing the immediate next step
  //   if (!isViewingNextStep()) {
  //     alert("Cannot submit a completed step. Please select the next pending step.");
  //     return;
  //   }

  //  if (!recordExists) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Process Not Initialized",
  //       text: `The process "${immediateNextStep?.PROCESS}" has not been initialized for plant "${selectedPlant}". Please submit in the Modify section.`,
  //       confirmButtonText: "OK"
  //     });
  //     return;
  //   }
    
    
  
  //   const newErrors = {};
  //   if (!formData.loc) newErrors.loc = "Plant selection is required";
  //   if (!formData.applyDate) newErrors.applyDate = "Apply date is required";
  //   setShowEmailModal(true);
  // };

  const areAllStepsCompleted = () => {
    if (!steps.length || !storeData.length) return false;
    
    const completedSteps = storeData
      .filter((item) => item.UPDATED === "YES")
      .map((item) => item.PROCESS);
    
    return steps.every((step) => completedSteps.includes(step.PROCESS));
  };

  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);
    await handleConfirmSubmit(emails);
  };

  const renderCompletionMessage = () => {
  return (
    <div className="position-relative text-center p-5">
      {/* Back Button in top right corner - Moved down a bit */}
      <button 
        onClick={() => {
          // Reset everything to show fresh form
          setSelectedPlant("");
          setHeaderData(null);
          setSelectedProcessDetails(null);
          setImmediateNextStep(null);
          setImmediateNextStepIndex(-1);
          setFormData({
            loc: "",
            applyDate: "",
            comments: "",
            process: "",
            organisation: "",
            project_name: "",
            location: "",
            status: "",
            noOfTowers: "",
            TotalProjectArea: "",
            ProjectBuildArea: "",
            ProjectName: "",
            noOfFlats: "",
            KLD: "",
            amountPaid: "",
            OldAmount: "",
            TotalAmount: "",
            Size: "",
            Ghmc: "",
          });
          setStoreData([]);
          setSteps([]);
          setSubmitted(false);
          setIsViewingSpecificStep(false);
        }}
        className="position-absolute top-0 end-0 btn btn-success mt-5 me-3"
      >
        <FaArrowLeft className="me-1" /> Back to Start
      </button>
      
      <FaCheckCircle size={80} className="text-success mb-4" />
      <h2 className="text-success mb-3 fw-bold">Congratulations! 🎉</h2>
      <h5 className="text-muted mb-4">All process steps have been completed successfully!</h5>
      <Alert variant="success" className="mx-auto" style={{ maxWidth: '600px' }}>
        <Alert.Heading>Project Completion Status</Alert.Heading>
        <p className="mb-2">
          All <strong>{steps.length}</strong> steps for <strong>{selectedPlant}</strong> have been completed.
        </p>
        <hr />
        <p className="mb-0">
          The project is now ready for the next phase or final approval.
        </p>
      </Alert>
    </div>
  );
};

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/GHMC-plants`)
      .then((res) => {
        setLoc(res.data);
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  useEffect(() => {
    setIsFirstProcess(immediateNextStepIndex === 0);
  }, [immediateNextStepIndex]);

  useEffect(() => {
    if (!selectedPlant) return;

    console.log("Fetching GHMC processes for plant:", selectedPlant);

    axios
      .get(`${API_BASE_URL}/GHMC-process`, {
        params: { plant: selectedPlant },
      })
      .then((res) => {
        console.log("Response from GHMC-process:", res.data);
        setSteps(res.data || []);
        if (res.data && res.data.length > 0) setActiveStep(0);
      })
      .catch((err) => console.error("Error fetching processes:", err));
  }, [selectedPlant]);

  useEffect(() => {
    if (steps.length > 0 && Array.isArray(storeData)) {
      const completed = storeData
        .filter((i) => i.UPDATED === "YES")
        .map((i) => i.PROCESS);
      const next = steps.find((s) => !completed.includes(s.PROCESS));
      if (next) {
        setImmediateNextStep(next);
        setImmediateNextStepIndex(steps.indexOf(next));
        if (selectedPlant && next) {
          handleStepClick(next, selectedPlant);
        }
      } else {
        setImmediateNextStep(null);
        setImmediateNextStepIndex(-1);
        setViewedStep(null);
        setViewedStepDetails(null);
        // 👇 Reset viewing state when all completed
        setIsViewingSpecificStep(false);
      }
    } else {
      setImmediateNextStep(null);
      setImmediateNextStepIndex(-1);
      setViewedStep(null);
      setViewedStepDetails(null);
      setIsViewingSpecificStep(false);
    }
  }, [steps, storeData, selectedPlant]);

 

  useEffect(() => {
  let isMounted = true; 

  if (selectedPlant) {
    // Clear history-viewing states so form focuses on the NEW active step
    setNextStepDetails(null);
    setViewedStepDetails(null);

    axios.get(`${API_BASE_URL}/GHMC-data?plant=${selectedPlant}`)
      .then((res) => {
        if (!isMounted) return; 
        const data = res.data || [];
    
        setStoreData(data);

        if (data.length > 0) {
          const firstStep = data[0];
          setOrganizationType(firstStep.Organization || "GHMC");
        }
      })
      .catch((err) => console.error("Error fetching process history:", err));
  }

  return () => { isMounted = false; };
}, [selectedPlant]);

  function parseJsonArraySafe(value) {
    if (!value) return [];
    try {
      if (Array.isArray(value)) return value;
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      if (typeof value === "string")
        return value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      return [];
    }
  }

  const combineAndParseDocArrays = (data, namesKey, pathsKey) => {
    const names = parseJsonArraySafe(data[namesKey]);
    const paths = parseJsonArraySafe(data[pathsKey]);
    const combined = [];
    const minLength = Math.min(names.length, paths.length);
    for (let i = 0; i < minLength; i++) {
      if (names[i] && paths[i]) {
        combined.push({ name: names[i], path: paths[i] });
      }
    }
    return combined;
  };

  useEffect(() => {
    if (selectedPlant && immediateNextStepIndex !== -1 && steps.length > 0) {
      const nextStepName = steps[immediateNextStepIndex]?.PROCESS;
      if (!nextStepName) return;

      axios
        .get(
          `${API_BASE_URL}/GHMC-step-details/${encodeURIComponent(
            selectedPlant
          )}/${encodeURIComponent(nextStepName)}`
        )
        .then((res) => {
          const data = res.data || {};
          console.log("Raw GHMC-step-details response (Immediate Next Step):", data);

          const parsed = {
            ...data,
            tower_docs: combineAndParseDocArrays(
              data, "tower_doc_name", "tower_doc_path"
            ),
            feas_docs: combineAndParseDocArrays(
              data, "feas_doc_name", "feas_doc_path"
            ),
            amount_docs: combineAndParseDocArrays(
              data, "amount_doc_name", "amount_doc_path"
            ),
          };
          setNextStepDetails(parsed);
        })
        .catch((err) => {
          console.error("Error fetching GHMC-step-details (Immediate Next Step):", err);
          setNextStepDetails(null);
        });
    } else {
      setNextStepDetails(null);
    }
  }, [selectedPlant, immediateNextStepIndex, steps]);

   const handleChange = async (e) => {
    const { name, value } = e.target;
  
    if (name === "loc") {
      // 1. IMMEDIATELY CLEAR ALL STATE to prevent old data flicker
      setSelectedPlant(value);
      setStoreData([]);
      setSteps([]);
      setHeaderData(null);
      setNextStepDetails(null);
      setViewedStepDetails(null);
      setSelectedProcessDetails(null);
      setSubmitted(false);
      setIsViewingSpecificStep(false);
          setNextStepDetails(null);
         setImmediateNextStepIndex(-1);
      // Clear All Documents
      setFeasibilityDocs([]);
  
      // 2. DEFINE A CLEAN EMPTY STATE
      const emptyFormData = {
        loc: value,
        applyDate: "",
        Comments: "",
        organisation: "",
        project_name: "",
        location: "",
        status: "",
        noOfTowers: "",
        TotalProjectArea: "",
        ProjectBuildArea: "",
        ProjectName: "",
        noOfFlats: "", 
        KLD: "",      
        OldAmount: "", 
        TotalAmount: "", 
        Size: "",
        Ghmc: "",

        BG_FromDate: "",
        BG_ToDate: "",
        BG_Number: "",
        CAR_FromDate: "",
        CAR_ToDate: "",
        CAR_Number: "",
        PDC_Date: "",
        PDC_Number: "",
        MortgageReleased: "",
      };
  
      setFormData(emptyFormData);
  
      if (!value) return;
  
      // 3. FETCH NEW MASTER DATA
      try {
        const res = await getMasterByLoc(value);
        if (res) {
          setHeaderData(res);
          const org = res.Organization || "GHMC";
          setOrganizationType(org);
  
          setFormData(prev => ({
            ...emptyFormData,
            organisation: org,
            noOfTowers: res.NUMBER_OF_TOWERS || "",
            TotalProjectArea: res.TOTAL_PROJECT_AREA || "",
            ProjectBuildArea: res.PROJECT_BUILD_AREA || "",
            ProjectName: res.PROJECT_NAME || "",
            location: res.LOCATION || "",
            status: res.STATUS || "",
            noOfFlats: res.NUMBER_OF_FLATS || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching master data:", err);
      }
    } 
    // ... rest of your calculations for noOfFlats / OldAmount
    else if (name === "noOfFlats") {
      const nocs = value ? Math.ceil(Number(value) / 2) : "";
      setFormData((prev) => ({ ...prev, noOfFlats: value, KLD: nocs }));
    }
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  
  const handleConfirmSubmit = async (emails) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    //  --- : 'fetch User';
    let currentUserName = loggedInUser.username;

    const payload = new FormData();

    // NEW: Add Fee Paid Additional Details to the payload
    payload.append("BG_FromDate", formData.BG_FromDate || "");
    payload.append("BG_ToDate", formData.BG_ToDate || "");
    payload.append("BG_Number", formData.BG_Number || "");
    payload.append("CAR_FromDate", formData.CAR_FromDate || "");
    payload.append("CAR_ToDate", formData.CAR_ToDate || "");
    payload.append("CAR_Number", formData.CAR_Number || "");
    payload.append("PDC_Date", formData.PDC_Date || "");
    payload.append("PDC_Number", formData.PDC_Number || "");
    payload.append("MortgageReleased", formData.MortgageReleased || "");

    payload.append("Organization", formData.organisation || "");
    payload.append("project_name", formData.project_name || "");
    payload.append("location", formData.location || "");
    payload.append("status", formData.status || "");

    payload.append("loc", formData.loc);
    payload.append("applyDate", formData.applyDate);
    payload.append("process", immediateNextStep?.PROCESS || "");
    payload.append("Comments", formData.comments || "");
    payload.append("GHMC", formData.Ghmc || "");
    payload.append("OldAmount", formData.OldAmount || "");
    payload.append("Size_Of_Connection", formData.Size || "");
    payload.append("noOfFlats", formData.noOfFlats || "");
    payload.append("totalProjectArea", formData.TotalProjectArea || "");
    payload.append("projectBuildArea", formData.ProjectBuildArea || "");
    payload.append("noOfTowers", formData.noOfTowers || "");
    payload.append("TotalAmount", formData.TotalAmount || "");
    payload.append("username", currentUserName || "");
    
    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    feasibilityDocs.forEach((file) => payload.append("feas_doc_name[]", file));

    console.log("📦 Payload being sent to GHMC-update:", payload);

    try {
      const res = await axios.post(`${API_BASE_URL}/GHMC-update`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const refreshed = await axios.get(
        `${API_BASE_URL}/GHMC-data?plant=${formData.loc}`
      );
      setStoreData(refreshed.data || []);

      const master = await getMasterByLoc(formData.loc);
      if (master) setHeaderData(master);

      setFormData((prev) => ({
        ...prev,
        applyDate: "",
        comments: "",
        noOfFlats: "",
        KLD: "",
        amountPaid: "",
        status: "",
        reason: "",
        noOfTowers: "",
        ProjectBuildArea: "",
      }));

      setLinkDocs([]);
      setLandDocs([]);
      setOthDocs([]);
      setFeasibilityDocs([]);
      setAmountPaidDocs([]);
      setNextStepDetails(null);
      setSubmitted(true);

      setRespModifyData?.(res?.data?.data);
      
    await Swal.fire({
            icon: "success",
            title:"Submitted!",
            text: "Your data has been saved successfully.",
            timer: 1500,
            showConfirmButton: false,
          });

    } catch (err) {
      console.error("❌ Submission failed:", err);
      setDialogConfig({
        title: "Error",
        message: "Submission failed. Please try again.",
        confirmText: "OK",
        open: true,
      });
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
    }
  };

  const isProcessCompleted = (processName) => {
    return storeData?.some(
      (item) => item.PROCESS === processName && item.UPDATED === "YES"
    );
  };

  // 👇 MODIFIED: Set viewing state when step is clicked
  const handleStepClick = async (step, plant) => {
    if (!plant) return;
    
    setViewedStep(step);
    setCurrentProcess(step.PROCESS);
    
    // 👇 Set that we're viewing a specific step
    setIsViewingSpecificStep(true);
    setShowEmailModal(false); // Close email modal if open

    // Reset submitted state only if it's the immediate next step
    if (step.PROCESS === immediateNextStep?.PROCESS) {
      setSubmitted(false);
    }

    try {
      const storedCompletedStep = storeData.find(
        (item) => item.PROCESS === step.PROCESS && item.UPDATED === "YES"
      );

      let dataToParse;
      if (storedCompletedStep) {
        console.log("📜 Viewing completed process from storeData:", step.PROCESS);
        dataToParse = storedCompletedStep;
        setSubmitted(true); 
             setSelectedProcessDetails(storedCompletedStep);// Mark as submitted if already completed
      } else {
        console.log("🌐 Fetching live step details for:", step.PROCESS);
        const res = await axios.get(
          `${API_BASE_URL}/GHMC-step-details/${encodeURIComponent(
            plant
          )}/${encodeURIComponent(step.PROCESS)}`
        );
        dataToParse = res.data || {};
             setSelectedProcessDetails(null);
        setSubmitted(false);
    // Not submitted yet
      }

      const parsed = {
        ...dataToParse,
        tower_docs: combineAndParseDocArrays(
          dataToParse, "tower_doc_name", "tower_doc_path"
        ),
        feas_docs: combineAndParseDocArrays(
          dataToParse, "feas_doc_name", "feas_doc_path"
        ),
        amount_docs: combineAndParseDocArrays(
          dataToParse, "amount_doc_name", "amount_doc_path"
        ),
      };

      setFormData((prev) => ({
        ...prev,
        applyDate: parsed.applyDate || "",
        status: parsed.STATUS || "",
        reason: parsed.REASON || "",
        comments: parsed.Comments || parsed.COMMENTS || "",
        noOfFlats: parsed.NUMBER_OF_FLATS || parsed.noOfFlats || "",
        KLD: parsed.feas_doc_name || "",
        amountPaid: parsed.AMOUNT_PAID || "",
        Ghmc: parsed.GHMC || "",
        OldAmount: parsed.OLD_AMOUNT || parsed.OldAmount || "",
        Size: parsed.SIZE_OF_CONNECTION || parsed.Size || "",
        TotalAmount: parsed.TOTAL_AMOUNT || "",
        TotalProjectArea: parsed.TOTAL_PROJECT_AREA || "",
        noOfTowers: parsed.noOfTowers || "",
        ProjectBuildArea: parsed.PROJECT_BUILD_AREA || "",

        // NEW: Mapping for Fee Paid Additional Details
        BG_FromDate: parsed.BG_FromDate || "",
        BG_ToDate: parsed.BG_ToDate || "",
        BG_Number: parsed.BG_Number || "",
        CAR_FromDate: parsed.CAR_FromDate || "",
        CAR_ToDate: parsed.CAR_ToDate || "",
        CAR_Number: parsed.CAR_Number || "",
        PDC_Date: parsed.PDC_Date || "",
        PDC_Number: parsed.PDC_Number || "",
        MortgageReleased: parsed.MortgageReleased || "",
      }));

      setViewedStepDetails(parsed);

    } catch (err) {
      console.error("❌ Error fetching step details:", err);
      setViewedStepDetails(null);
      setSubmitted(false);
      setFormData((prev) => ({
        ...prev,
        applyDate: "", comments: "", process: "", reason: "", status: "",
        noOfFlats: "", KLD: "", amountPaid: "", Ghmc: "", OldAmount: "",
        Size: "", TotalAmount: "", TotalProjectArea: "", noOfTowers: "",
        ProjectBuildArea: "",
      }));
    }
  };

const NumberOfTowers = storeData?.[0]?.noOfTowers;

  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        {/* Left Sidebar */}
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <span className="fw-bold m-3">
              {organizationType ? `${organizationType} Process Steps` : 'Process Steps'}
            </span>

            <Nav variant="pills" className="flex-column">
              {steps.map((step, idx) => {
                let variant = "secondary";
                let clickable = false;
                let statusIcon = "⏸️";

                const isCompleted = storeData?.some(
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
                        handleStepClick(step, selectedPlant);
                      }}
                      className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                      style={{
                        cursor: clickable ? "pointer" : "not-allowed"
                      }}
                    >
                      {statusIcon}
                      <span>
                        {step.PROCESS}
                      </span>
                    </Nav.Link>
                  </Nav.Item>
                );
              })}
            </Nav>
          </div>
        </Col>

        {/* Center Form */}
        <Col
          md={6}
          className="d-flex flex-column"
          style={{ height: "400px", overflowY: "auto" }}
        >
          {areAllStepsCompleted() && !isViewingSpecificStep ? (
            <div className="p-3 border rounded bg-light d-flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
              {renderCompletionMessage()}
            </div>
          ) : (
            <Form className="p-3 border rounded bg-light">
              {/* <h4 className="mb-3 text-warning fw-bold">
                    {immediateNextStep && (
                  <h4 className="mb-3  fw-bold">
                    {immediateNextStep.PROCESS}
                    {NumberOfTowers && <> | Towers Count: <span className="text-dark">{NumberOfTowers}</span></>}
                  
                  </h4>
                )}
              </h4> */}
              {/* ADD THIS INSTEAD */}
<h4 className="mb-3 fw-bold">
  {/* Priority 1: The step the user just clicked (currentProcess) */}
  {/* Priority 2: The next pending step (immediateNextStep) */}
  <span className={isViewingSpecificStep && !isViewingNextStep() ? "text-info" : "text-warning"}>
    {currentProcess || immediateNextStep?.PROCESS}
  </span>

  {/* Display Tower count if available */}
  {NumberOfTowers && (
    <span className="text-muted ms-2" style={{ fontSize: '0.8em' }}>
      | Towers Count: <span className="text-dark">{NumberOfTowers}</span>
    </span>
  )}
</h4>

{/* Optional: Add a "Viewing Mode" badge if it's a completed step */}
{!isViewingNextStep() && isViewingSpecificStep && (
  // <div className="mb-2">
  //   <span className="badge bg-info text-dark">Viewing Completed Step</span>
  // </div>'''
  ''
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
    {/* Conditional label based on current step */}
    <Form.Label>
      {currentProcess === "Fee Paid Details" || immediateNextStep?.PROCESS === "Fee Paid Details" 
        ? "Fee Paid Date" 
        : "Apply Date"}
    </Form.Label>
    <Form.Control
      type="date"
      name="applyDate"
      value={formData.applyDate || ""}
      max={new Date().toISOString().split("T")[0]}
      onChange={handleChange}
      disabled={
        // Disable if:
        // 1. No plant selected OR
        // 2. We're viewing a completed step (selectedProcessDetails exists) OR
        // 3. We're not viewing the immediate next step
        !formData.loc || 
        !!selectedProcessDetails || 
        !isViewingNextStep()
      }
    />
    <Form.Control.Feedback type="invalid">
      {errors.applyDate}
    </Form.Control.Feedback>
  </Form.Group>
</Col>
              </Row>

{/* NEW: Conditional Rendering for Fee Paid Details Step (READONLY) */}
{/* {(currentProcess === "Fee Paid Details" || immediateNextStep?.PROCESS === "Fee Paid Details") && (
  <FeePaidAdditionalDetails
    formData={formData}
    handleChange={handleChange}
    isDisabled={!!selectedProcessDetails}
    // isDisabled={true} // Forces all fields to be read-only/disabled
  />
)} */}
{(isViewingSpecificStep 
    ? viewedStep?.PROCESS === "Fee Paid Details" 
    : immediateNextStep?.PROCESS === "Fee Paid Details"
) && (
  <FeePaidAdditionalDetails
    formData={formData}
    handleChange={handleChange}
    errors={errors}
    isDisabled={false}             
    disableMortgageOnly={true}     
  />
)}


              <Row className="mb-2">
                <Col md={12}>
                  <Form.Group controlId="formCommentsDisplay">
                    <Form.Label>Comments</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="comments"
                      value={formData.comments || ""}
                      readOnly
                      onChange={handleChange}
                      disabled={!isViewingNextStep()}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid">
                {/* 👇 Show "Back to Completion" button when viewing completed step */}
                {areAllStepsCompleted() && isViewingSpecificStep && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setIsViewingSpecificStep(false);
                      setViewedStep(null);
                      setViewedStepDetails(null);
                      setCurrentProcess("");
                    }}
                    className="w-100 fw-semibold mb-2"
                  >
                    ← Back to Completion Message
                  </Button>
                )}

                {/* Only show Submit button for the immediate next step */}
                {isViewingNextStep() && (
                  <Button
                    variant={submitted ? "success" : "primary"}
                    size="md"
                    onClick={handleEmailSubmit}
                    className="w-100 fw-semibold"
                    disabled={!formData.loc || isSubmitting || submitted || !recordExists}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : submitted
                      ? "Submitted"
                      : "Submit"}
                  </Button>
                )}
                
                {/* Show view-only button for completed steps */}
                {!isViewingNextStep() && isViewingSpecificStep && (
                  <Button variant="secondary" size="md" className="w-100 fw-semibold" disabled>
                    {isProcessCompleted(viewedStep?.PROCESS) 
                      ? "Completed (View Only)" 
                      : "Not Available"}
                  </Button>
                )}
              </div>
            </Form>
          )}
        </Col>

        {/* Right Section: Previous Docs */}
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill w-50">
            <PreviousGhmcDocs docsData={viewedStepDetails} />
          </div>
        </Col>
      </Row>

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
      />

      {/* Only show email modal when needed */}
      {formData?.loc && formData?.applyDate && immediateNextStep && isViewingNextStep() && (
        <EmailSelectionModal
          show={showEmailModal}
          onHide={() => setShowEmailModal(false)}
          onSubmit={handleEmailSelectionSubmit}
          processName={immediateNextStep?.PROCESS}
          plantName={formData.loc}
          applyDate={formData.applyDate}
          comments={formData.comments}
        />
      )}
     
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

export default GhmcUpdate;



