import React, { useState, useEffect, useContext } from "react";
import { Container, Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PlantSelector from "../components/PlantSelector";
import PcbTabs from "../components/PcbTabs";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";
import "../pages/Update.css";
import AmendModal from "../components/AmendModal";
import CardWithHeader from "../components/CardWithHeader";
import { useRef } from "react";
import Swal from "sweetalert2";
import { Context } from "../context/ContextData"; 
import { getMasterByLoc } from "../api/Api";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { Mail, Send } from "lucide-react";
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Typography,
} from "@mui/material";

import EmailSelectionModal from "../components/EmailSelectionModal"; // Adjust path as needed
import { toast } from "react-toastify";

const PcbModifyTable = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState("Pollution Control Board");
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [pcbProcesses, setPcbProcesses] = useState([]);
  // const [storeData, setStoreData] = useState([]);
  const [amendmentRecords, setAmendmentRecords] = useState([]);
  const [amendCategories, setAmendCategories] = useState([]);
  const [status, setStatus] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [latestAmend, setLatestAmend] = useState(0);

  const [selectedEmails, setSelectedEmails] = useState([]);
  const [customEmail, setCustomEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState({
  applyDate: "",
  comments: "",
});

  const {
    totalMasterData = [],
    setHeaderData,
    headerData,
    storeData,
    setStoreData,
  } = useContext(Context);
  // console.log("emailRecipientsemailRecipients",selectedEmails)
  const fileInputRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    plant: "",
    process: "",
    applyDate: "",
    selectedFiles: [],
    existingDocs: [],
    existingNames: [],
    comments: "",
    returnsSubmitted: "", // Initialize this new field
    logs: "", // Added logs to modalData state
  });


 
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [amendData, setAmendData] = useState({
    plant: "",
    process: "",
    applyDate: "",
    category: "",
    selectedFiles: [],
    existingDocs: [],
    existingNames: [],
    comments: "",
    oldComments: "",
    amendreturnsSubmitted: "",

     receivedDate: "", 
  });


  // ---------------------- EMAIL (Amend) HANDLERS ----------------------
const [emailAmendRecipients, setEmailAmendRecipients] = useState([]);
const [selectedAmendEmails, setSelectedAmendEmails] = useState([]);
const [showAmendEmailModal, setShowAmendEmailModal] = useState(false);


//         useEffect(() => {
//   setHeaderData(null); // Reset header data when component loads
// }, [setHeaderData]);



useEffect(() => {
  axios
    .get(`${API_BASE_URL}/pcb-emails`)
    .then((res) => {
      setEmailAmendRecipients(res.data || []);
    })
    .catch((err) => console.error("❌ Error fetching amendment emails:", err));
}, []);

  // Handle Email Submit - Opens Email Modal

  const validateForm = () => {
  let newErrors = {};

  if (!modalData.applyDate) {
    newErrors.applyDate = "Please select Apply Date";
  }

  if (!modalData.comments || !modalData.comments.trim()) {
    newErrors.comments = "Please enter Comments";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  const handleEmailSubmit = async () => {

   if (!validateForm()) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/pcb-emails`);
      setEmailRecipients(response.data);
     console.log(modalData.process,"modalData.processmodalData.processmodalData.process");

      // Pre-fill email subject and message
      setEmailSubject(`Process Update: ${modalData.process}`);
      setEmailMessage(
        `Dear Team,\n\nPlease find the update for the process: ${modalData.process}\n\nPlant: ${modalData.plant}\nApply Date: ${modalData.applyDate}\n\nComments: ${modalData.comments}\n\nBest Regards`
      );

      setShowEmailModal(true);
    } catch (error) {
      console.error("❌ Failed to fetch email recipients:", error);

      setShowEmailModal(true);
    }
  };



  // Handle Email Checkbox Toggle

  // Load initial data
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/pcb-processes`)
      .then((res) => setPcbProcesses(res.data));
    axios.get(`${API_BASE_URL}/plants`).then((res) => setPlants(res.data));
  }, []);

  // Fetch store data on plant change
  useEffect(() => {
    if (selectedPlant) {
      axios
        .get(`${API_BASE_URL}/pcb-store/${selectedPlant}`)
        .then((res) => {
    
          setStoreData(res.data);

          console.log(res,"pcb----------------store");
        })
        .catch((err) => console.error(err));
    } else {
      setStoreData([]);
    }
  }, [selectedPlant]);

  useEffect(() => {
    if (selectedPlant && key) {
      axios
        .get(`${API_BASE_URL}/amendments/${selectedPlant}/${key}`)
        .then((res) => {
          const records = res.data.data || [];
          console.log("✅ Amendment API records:", records);
          setAmendmentRecords(records);

          // Status for process column
          const processRecord = records.find((r) => r.PROCESS === key);
          setStatus(processRecord?.STATUS || "");

          // Only categories with STATUS = 'created'
          const createdRecords = records.filter((r) => r.STATUS === "created");
          const categories = [
            ...new Set(createdRecords.map((r) => r.CATEGORY)),
          ];
          setAmendCategories(categories);
          console.log("✅ Amendment API categories:", categories);

          // 👉 Find latest amendment number
          const latest =
            Math.max(
              ...categories.map((c) => parseInt(c.replace("AMEND", "")) || 0)
            ) || 0;
          setLatestAmend(latest); // store in state
        })
        .catch((err) => {
          console.error("❌ Failed to check amendment status:", err);
          setAmendmentRecords([]);
          setAmendCategories([]);
          setStatus("");
        });
    }
  }, [selectedPlant, key]);

  // Timeline: find last updated step
  const updatedStatusMap = storeData.reduce((acc, item) => {
    if (item.UPDATED === "YES") {
      acc[item.PROCESS] = true;
    }
    return acc;
  }, {});

  let lastUpdatedIndex = -1;
  pcbProcesses.forEach((row, index) => {
    if (updatedStatusMap[row.PROCESS]) {
      lastUpdatedIndex = index;
    }
  });

  //amend ---------

  // amend ---------
  let lastAmendedIndexMap = {};

  amendCategories.forEach((category) => {
    let lastIndex = -1;
    pcbProcesses.forEach((row, index) => {
      const storeInfo = storeData.find((item) => item.PROCESS === row.PROCESS);
      let amendStatus = "";

      if (category === "AMEND1") {
        amendStatus = storeInfo?.AMEND1_STATUS || "";
      } else if (category === "AMEND2") {
        amendStatus = storeInfo?.AMEND2_STATUS || "";
      } else if (category === "AMEND3") {
        amendStatus = storeInfo?.AMEND3_STATUS || "";
      } else if (category === "AMEND4") {
        amendStatus = storeInfo?.AMEND4_STATUS || "";
      } else if (category === "AMEND5") {
        amendStatus = storeInfo?.AMEND5_STATUS || "";
      }

      if (amendStatus === "YES") {
        lastIndex = index;
      }
    });
    lastAmendedIndexMap[category] = lastIndex;
  });

  // 🔒 Disable earlier amendments when higher amendments exist
  Object.keys(lastAmendedIndexMap).forEach((category) => {
    const amendNum = parseInt(category.replace("AMEND", ""), 10);

    const higherAmendExists = Object.keys(lastAmendedIndexMap).some((cat) => {
      const num = parseInt(cat.replace("AMEND", ""), 10);
      return num > amendNum && lastAmendedIndexMap[cat] !== -1;
    });

    if (higherAmendExists) {
      // Mark this amendment as disabled
      lastAmendedIndexMap[category] = "DISABLED";
    }
  });

  // 💥 Add here
  // const disableECColumn = amendCategories.includes("AMEND2");
  const disableECColumn = lastAmendedIndexMap["AMEND2"] === "DISABLED";
  // 🔥 Determine which mode timeline should use
  let currentTimelineMode = "action";
  if (status === "created") {
    if (amendCategories.includes("AMEND2")) {
      currentTimelineMode = "AMEND2";
    } else if (amendCategories.includes("AMEND1")) {
      currentTimelineMode = "AMEND1";
    } else if (amendCategories.includes("AMEND3")) {
      currentTimelineMode = "AMEND3";
    } else if (amendCategories.includes("AMEND4")) {
      currentTimelineMode = "AMEND4";
    } else if (amendCategories.includes("AMEND5")) {
      currentTimelineMode = "AMEND5";
    }
  }

  // 🔥 Get last completed index for the timeline
  let lastIndexForTimeline = -1;
  if (currentTimelineMode === "action") {
    lastIndexForTimeline = lastUpdatedIndex;
  } else {
    lastIndexForTimeline = lastAmendedIndexMap[currentTimelineMode] ?? -1;
  }

  // Handlers for Edit
  const handleEditClick = (row) => {
    const storeInfo =
      storeData.find((item) => item.PROCESS === row.PROCESS) || {};
    const existingDocs = storeInfo.DOC_PATH
      ? storeInfo.DOC_PATH.split(",")
      : [];
    const existingNames = storeInfo.DOC_NAME
      ? storeInfo.DOC_NAME.split(",")
      : [];

    setModalData({
      plant: selectedPlant,
      process: row.PROCESS,
      applyDate: storeInfo.APPLY_DT || "",
      selectedFiles: [],
      existingDocs,
      existingNames,
      comments: "",
      returnsSubmitted: storeInfo.RETURNS_SUBMITTED,
      logs: storeInfo.LOG || "",
    });

    setShowModal(true);
  };


  // Handlers for Amend
  const handleAmendClick = async (row, category) => {
    try {
      const storeInfo =
        storeData.find((item) => item.PROCESS === row.PROCESS) || {};

        console.log(row,'storeinfiiiiiiiiiiiiiiiiiiiiii',storeData, "storeInfostoreInfo",storeInfo);

      const endpoint = `${API_BASE_URL}/amendment-data/${selectedPlant}/${encodeURIComponent(
        row.PROCESS
      )}`;
      const res = await axios.get(endpoint);

      // --- START: Console log API response data ---
      console.log("✅ API Response Data for Amendment11:", res.data);

      const data = res.data;

      const prefix = `${category}`;

      const existingDocs = data[`${prefix}_DOC_PATH`]
        ? JSON.parse(data[`${prefix}_DOC_PATH`])
        : [];
      const existingNames = data[`${prefix}_DOC_NAME`]
        ? JSON.parse(data[`${prefix}_DOC_NAME`])
        : [];
      const amendDate = data[`${prefix}_DATE`] || "";
      const oldComments = data[`${prefix}_COMMENTS`] || "";
      const amendreturnsubmit = data[`${prefix}_RETURNS_SUBMITTED`] || "";

      setAmendData({
        plant: selectedPlant,
        process: row.PROCESS,
        applyDate: storeData[0].APPLY_DT || "",
        amendDate,
        category,
        selectedFiles: [],
        existingDocs,
        existingNames,
        comments: "",
        oldComments,
        amendDecision: "Yes",
        amendreturnsSubmitted: amendreturnsubmit,
         receivedDate: data.RECEIVED_DT || "",
      });

      setShowAmendModal(true);
    } catch (error) {
      console.error(
        "❌ handleAmendClick - Failed to fetch amendment data:",
        error
      );
      alert("Failed to load amendment data. Please try again.");
    }
  };
  // Remove Selected Email
  const handleRemoveEmail = (email) => {
    setSelectedEmails((prev) => prev.filter((e) => e !== email));
  };
  // Submit Edit Modal
  const handleSendEmail = async () => {
    if (selectedEmails.length === 0) {
      Swal.fire({
        icon: "warning",
        text: "Please select at least one email recipient.",
      });
      return;
    }

  setLoading(true);          
    const formData = new FormData();
    formData.append("loc", modalData.plant);
    formData.append("process", modalData.process);
    formData.append("applyDate", modalData.applyDate);
    formData.append("comments", modalData.comments);

    selectedEmails.forEach((email, i) => {
      formData.append(`emails[${i}]`, email);
    });
    // Only append returnsSubmitted if the process matches
    if (
      modalData.process ===
      "Comply EC conditions and submit half yearly returns and compliance Reports"
    ) {
      formData.append("returnsSubmitted", modalData.returnsSubmitted);
    }
    modalData.selectedFiles.forEach((file) => {
      formData.append("document[]", file);
      formData.append("doc_name[]", file.name);
    });

    // --- START: Console log FormData content ---
    console.log("--- FormData Contents ---");
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    console.log("-------------------------");
    // --- END: Console log FormData content ---

    const existingRecord = storeData.find(
      (item) =>
        item.PROCESS?.trim().toLowerCase() ===
        modalData.process.trim().toLowerCase()
    );

    const apiUrl = existingRecord
      ? `${API_BASE_URL}/pcb-store-update`
      : `${API_BASE_URL}/pollution-submit`;

    try {
      await axios.post(apiUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // alert(existingRecord ? 'Updated successfully' : 'Inserted successfully');
      setShowModal(false);
      setShowEmailModal(false);
       setLoading(false);    
      setSelectedEmails([]);
      const response = await axios.get(
        `${API_BASE_URL}/pcb-store/${selectedPlant}`
      );
      setStoreData(response.data);

      console.log("formData:", formData.loc);
      const master = await getMasterByLoc(modalData.plant);

      if (master) {
        setHeaderData(master);
      }

      await Swal.fire({
        icon: "success",
        title: existingRecord
          ? "Updated Successfully"
          : "Inserted Successfully",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("❌ Submission failed:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  const handleDeleteEditFile = async (docPath, idx) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this file?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    console.log(docPath,"ddddddddddddddddddddddddddddddd");

    try {
      await axios.post(`${API_BASE_URL}/delete-edit-file`, {
        docPath,
        plant: modalData.plant,
        process: modalData.process,
      });

      // Remove file from state
      setModalData((prev) => {
        const updatedDocs = [...prev.existingDocs];
        const updatedNames = [...prev.existingNames];
        updatedDocs.splice(idx, 1);
        updatedNames.splice(idx, 1);
        return {
          ...prev,
          existingDocs: updatedDocs,
          existingNames: updatedNames,
        };
      });

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "File deleted successfully.",
      });
    } catch (err) {
      console.error("❌ Failed to delete file:", err);
      await Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to delete the file. Please try again later.",
      });
    }
  };


  // Add this helper function at the top of your component, after imports
const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    return dateString; // Return original if parsing fails
  }
};

  // Submit Amend Modal
  // const handleAmendSubmit = async () => {
  //   const {
  //     plant,
  //     process,
  //     applyDate,
  //     amendDate,
  //     selectedFiles,
  //     comments,
  //     category,
  //     amendreturnsSubmitted,
  //   } = amendData;

  //   // ✅ Check if amendment already exists
  //   // ✅ Use locally available storeData to check existence
  //   const isExistingRecord = storeData.some(
  //     (item) =>
  //       item.PROCESS?.toLowerCase().trim() === process?.toLowerCase().trim()
  //   );

  //   console.log("📦 Record exists in storeData:", isExistingRecord);

  //   // ✅ Choose appropriate endpoint
  //   const endpoint = isExistingRecord
  //     ? `${API_BASE_URL}/amendment-updt`
  //     : `${API_BASE_URL}/amendment-submit`;

  //   console.log(`📡 Triggering API: ${endpoint}`);
  //   const formData = new FormData();
  //   formData.append("loc", plant);
  //   formData.append("process", process);
  //   formData.append("applyDate", applyDate);
  //   formData.append("amendDate", amendDate);
  //   formData.append("comments", comments);
  //   formData.append("category", category);
  //   formData.append("amendreturnsSubmitted", amendreturnsSubmitted);

  //   selectedFiles.forEach((file) => {
  //     formData.append("document[]", file);
  //     formData.append("doc_name[]", file.name);
  //   });
  //   // 👇 Log FormData key-value pairs
  //   for (let pair of formData.entries()) {
  //     console.log(`${pair[0]}:`, pair[1]);
  //   }
  //   try {
  //     await axios.post(endpoint, formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     await Swal.fire({
  //       icon: "success",
  //       title: "Success",
  //       text: `Amendment (${category}) submitted successfully`,
  //     });
  //     setShowAmendModal(false);

  //     const response = await axios.get(`${API_BASE_URL}/pcb-store/${plant}`);
  //     setStoreData(response.data);
  //   } catch (error) {
  //     console.error("❌ Amendment submission failed:", error);
  //     await Swal.fire({
  //       icon: "error",
  //       title: "Submission Failed",
  //       text: "Please try again later or contact support.",
  //     });
  //   }
  // };


  const handleAmendSubmit = async () => {
  const {
    plant,
    process,
    applyDate,
    amendDate,
    selectedFiles,
    comments,
    category,
    amendreturnsSubmitted,
    selectedEmails, // ✅ Add selected emails here
  } = amendData;

  const isExistingRecord = storeData.some(
    (item) =>
      item.PROCESS?.toLowerCase().trim() === process?.toLowerCase().trim()
  );

  const endpoint = isExistingRecord
    ? `${API_BASE_URL}/amendment-updt`
    : `${API_BASE_URL}/amendment-submit`;

  const formData = new FormData();
  formData.append("loc", plant);
  formData.append("process", process);
  formData.append("applyDate", applyDate);
  formData.append("amendDate", amendDate);
  formData.append("comments", comments);
  formData.append("category", category);
  formData.append("amendreturnsSubmitted", amendreturnsSubmitted);

  selectedFiles.forEach((file) => {
    formData.append("document[]", file);
    formData.append("doc_name[]", file.name);
  });

  // ✅ Log for clarity
  console.log("📤 Submitting Amendment Data:", amendData);
  console.log("📤 Selected Emailsssss:", selectedEmails);

  try {
    // ✅ Step 1: Submit Amendment
    await axios.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    await Swal.fire({
      icon: "success",
      title: "Amendment Submitted",
      text: `Amendment (${category}) submitted successfully.`,
    });

    // ✅ Step 2: Send Email Notification
    // if (selectedEmails && selectedEmails.length > 0) {
    //   await handleSendAmendEmail({
    //     plant,
    //     process,
    //     applyDate,
    //     amendDate,
    //     comments,
    //     category,
    //     selectedEmails,
    //   });
    // } else {
    //   console.warn("⚠️ No email recipients selected. Skipping email step.");
    // }

    // ✅ Step 3: Refresh PCB store data
    const response = await axios.get(`${API_BASE_URL}/pcb-store/${plant}`);
    setStoreData(response.data);

    setShowAmendModal(false);
  } catch (error) {
    console.error("❌ Amendment submission failed:", error);
    await Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: "Please try again later or contact support.",
    });
  }
};



const handleSendAmendEmail = async (amendDataFromModal, selectedEmails) => {
  console.log("📨 handleSendAmendEmail triggered!");
  console.log("📦 Incoming amendData:", amendDataFromModal);
  console.log("📬 Selected Emails:", selectedEmails.selectedAmendEmails);

 
  const payload = new FormData();

  // Add all normal fields
  payload.append("plant", amendDataFromModal.plant);
  payload.append("process", amendDataFromModal.process);
  payload.append("applyDate", amendDataFromModal.applyDate);
  payload.append("amendDate", amendDataFromModal.amendDate);
  payload.append("comments", amendDataFromModal.comments);
  payload.append("category", amendDataFromModal.category);

  // Emails → convert to JSON
  payload.append(
    "emails",
    JSON.stringify(selectedEmails.selectedAmendEmails || [])
  );

  payload.append(
    "existingDocs",
    JSON.stringify(amendDataFromModal.existingDocs || [])
  );
  payload.append(
    "existingNames",
    JSON.stringify(amendDataFromModal.existingNames || [])
  );

  payload.append("oldComments", amendDataFromModal.oldComments || "");
  payload.append("amendDecision", amendDataFromModal.amendDecision || "");
  payload.append(
    "amendreturnsSubmitted",
    amendDataFromModal.amendreturnsSubmitted || ""
  );

  // Add NEW FILES
  if (amendDataFromModal.selectedFiles?.length > 0) {
    amendDataFromModal.selectedFiles.forEach((file) => {
      payload.append("selectedFiles[]", file);
    });
  }

  console.log("📤 Sending payload (FormData) to backend →");

  for (let [key, value] of payload.entries()) {
    console.log("🔍", key, value);
  }


  try {
    // Check if record already exists
    const isExistingRecord = storeData.some(
      (item) =>
        item.PROCESS?.toLowerCase().trim() ===
        amendDataFromModal.process?.toLowerCase().trim()
    );

    const endpoint = isExistingRecord
      ? `${API_BASE_URL}/amendment-updt`
      : `${API_BASE_URL}/amendment-submit`;

    // Send the request with correct headers
    const response = await axios.post(endpoint, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Backend response:", response.data);
 setShowAmendModal(false);
 
    await Swal.fire({
      icon: "success",
      title: "Email Sent!",
      text: `Amendment (${amendDataFromModal.category}) email sent to ${selectedEmails?.selectedAmendEmails} recipient(s).`,
    });



  } catch (error) {
    console.error("❌ Email sending failed:", error);
    await Swal.fire({
      icon: "error",
      title: "Email Sending Failed",
      text: "Amendment submitted successfully, but email notification failed.",
    });
  }
};


  const handleDeleteFile = async (docPath) => {
    await axios.post(`${API_BASE_URL}/delete-amendment-file`, {
      docPath,
      plant: amendData.plant,
      process: amendData.process,
      category: amendData.category,
    });
  };


  

  const handleSendAmendmentEmail = async (emails, amendData) => {
    try {
      const payload = {
        recipients: emails,
        process: amendData.process,
        plant: amendData.plant,
        applyDate: amendData.applyDate,
        comments: amendData.comments,
      };

      const response = await axios.post(
        `${API_BASE_URL}/sendAmendmentMail`,
        payload
      );

      if (response.data.success) {
        Swal.fire("Success", "Amendment email sent successfully!", "success");
      } else {
        Swal.fire("Error", "Failed to send amendment email.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong while sending email.", "error");
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    // Prevent API call if no value selected
    if (!value || value.trim() === "") {
      setSelectedPlant("");
      setHeaderData(null);
      setModalData((prev) => ({
        ...prev,
        applyDate: "",
      }));
      return;
    }

    try {
      setSelectedPlant(value);

      // Fetch master data by location
      const res = await getMasterByLoc(value);

      // Check if response exists and has data
      if (res && Object.keys(res).length > 0) {
        setHeaderData(res);
        setModalData((prev) => ({
          ...prev,
          applyDate: res.APPLICATION_DATE || "",
        }));
      } else {
        // Handle case when no data is returned
        console.warn("⚠️ No master data found for location:", value);
        setHeaderData(null);
        setModalData((prev) => ({
          ...prev,
          applyDate: "",
        }));

        // Optional: Show user-friendly message
        await Swal.fire({
          icon: "warning",
          title: "No Data Found",
          text: "No master data available for the selected plant.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching master data:", error);

      // Set default values on error
      setHeaderData(null);
      setModalData((prev) => ({
        ...prev,
        applyDate: "",
      }));

      // Show error to user
      await Swal.fire({
        icon: "error",
        title: "Error Loading Data",
        text:
          error.response?.status === 404
            ? "Plant data not found. Please select a valid plant."
            : "Failed to load plant data. Please try again.",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  // Custom button styles
  const buttonStyles = {
    updated: {
      backgroundColor: "#28a745",
      borderColor: "#28a745",
      color: "white",
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "none",
      cursor: "not-allowed",
    },
    edit: {
      backgroundColor: "#007bff",
      borderColor: "#007bff",
      color: "white",
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    pending: {
      backgroundColor: "#6c757d",
      borderColor: "#6c757d",
      color: "white",
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "none",
      cursor: "not-allowed",
    },
    amended: {
      backgroundColor: "#17a2b8",
      borderColor: "#17a2b8",
      color: "white",
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "none",
      cursor: "not-allowed",
    },
    amend: {
      backgroundColor: "#ffc107",
      borderColor: "#ffc107",
      color: "#212529",
      fontSize: "12px",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
  };
  return (
    <>
      <PlantSelector
        plants={plants}
        selectedPlant={selectedPlant}
        // onChange={(e) => setSelectedPlant(e.target.value)}
        onChange={handleChange}
        customMarginTop="-10px"
      />

      <div className="mt-1">
        <ProjectInfoHeader data={headerData} />
      </div>

      {selectedPlant ? (
        <div
          className="custom-tbl"
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            marginTop: "5px",
            height: "calc(100vh - 380px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
            <table
              className="table table-hover table-sm compact-table"
              style={{ margin: 0 }}
            >
              <thead
                className="custom-thead"
                style={{ backgroundColor: "#a8c5d1" }}
              >
                <tr>
                  <th
                    style={{
                      width: "30px",
                      borderBottom: "2px solid #dee2e6",
                      backgroundColor: "#a8c5d1",
                    }}
                  ></th>
                  <th
                    style={{
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                      backgroundColor: "#a8c5d1",
                    }}
                  >
                    S.No
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                      backgroundColor: "#a8c5d1",
                    }}
                  >
                    Process
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                      backgroundColor: "#a8c5d1",
                    }}
                  >
                    Apply Date
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #dee2e6",
                      fontWeight: "600",
                      backgroundColor: "#a8c5d1",
                    }}
                  >
                    Action
                  </th>
                  {amendCategories.map((cat) => (
                    <th
                      key={cat}
                      style={{
                        borderBottom: "2px solid #dee2e6",
                        fontWeight: "600",
                        backgroundColor: "#a8c5d1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pcbProcesses.map((row, index) => {
                  const storeInfo = storeData.find(
                    (item) => item.PROCESS === row.PROCESS
                  );

                  const isUpdated = !!storeInfo;
                  const isNextStep = index === lastUpdatedIndex + 1;

                  let buttonContent;
                  if (status === "created") {
                    buttonContent =
                      storeInfo?.UPDATED === "YES" ? (
                        <button className="btn btn-success btn-sm" disabled>
                          Updated
                        </button>
                      ) : (
                        <button className="btn btn-secondary btn-sm" disabled>
                          Pending
                        </button>
                      );
                  } else {
                    buttonContent =
                      storeInfo?.UPDATED === "YES" ? (
                        <button className="btn btn-success btn-sm" disabled>
                          Updated
                        </button>
                      ) : isNextStep ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEditClick(row)}
                        >
                          Edit
                        </button>
                      ) : (
                        <button className="btn btn-secondary btn-sm" disabled>
                          Pending
                        </button>
                      );
                  }

                  //---------amend----------

                  return (
                    <tr
                      key={row.PROCESS}
                      className={!isUpdated ? "table-secondary" : ""}
                    >
                      <td className="timeline-cell">
                        {(() => {
                          // Determine timeline color for this row
                          let timelineColor = "grey";
                          let isCompletedInMode = false;

                          if (currentTimelineMode === "action") {
                            isCompletedInMode = storeInfo?.UPDATED === "YES";
                          } else if (currentTimelineMode === "AMEND1") {
                            isCompletedInMode =
                              storeInfo?.AMEND1_STATUS === "YES";
                          } else if (currentTimelineMode === "AMEND2") {
                            isCompletedInMode =
                              storeInfo?.AMEND2_STATUS === "YES";
                          } else if (currentTimelineMode === "AMEND3") {
                            isCompletedInMode =
                              storeInfo?.AMEND3_STATUS === "YES";
                          } else if (currentTimelineMode === "AMEND4") {
                            isCompletedInMode =
                              storeInfo?.AMEND4_STATUS === "YES";
                          } else if (currentTimelineMode === "AMEND5") {
                            isCompletedInMode =
                              storeInfo?.AMEND5_STATUS === "YES";
                          }

                          if (isCompletedInMode) {
                            timelineColor = "green";
                          } else if (index === lastIndexForTimeline + 1) {
                            timelineColor = "red";
                          }

                          return (
                            <>
                              <span className={`dot ${timelineColor}`}></span>
                              {index !== pcbProcesses.length - 1 && (
                                <div className={`line ${timelineColor}`}></div>
                              )}
                            </>
                          );
                        })()}
                      </td>
                      <td>{row.SNO}</td>
                      <td>
                        <em>{row.PROCESS}</em>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {formatDate(storeInfo?.APPLY_DT || "-")}
                      </td>
                      <td>{buttonContent}</td>
                      {amendCategories.map((category) => {
                        // disable older amendment columns if a newer one exists
                        const amendNum =
                          parseInt(category.replace("AMEND", "")) || 0;
                        const isDisabledAmend = amendNum < latestAmend; // ✅ older amendments will be greyed out

                        let amendStatus = "";
                        if (category === "AMEND1")
                          amendStatus = storeInfo?.AMEND1_STATUS || "";
                        else if (category === "AMEND2")
                          amendStatus = storeInfo?.AMEND2_STATUS || "";
                        else if (category === "AMEND3")
                          amendStatus = storeInfo?.AMEND3_STATUS || "";
                        else if (category === "AMEND4")
                          amendStatus = storeInfo?.AMEND4_STATUS || "";
                        else if (category === "AMEND5")
                          amendStatus = storeInfo?.AMEND5_STATUS || "";

                        const lastIndex = lastAmendedIndexMap[category] ?? -1;

                        let button;
                        if (category === "AMEND1" && disableECColumn) {
                          button =
                            amendStatus === "YES" ? (
                              <button
                                className="btn btn-success btn-sm"
                                disabled
                              >
                                Amended
                              </button>
                            ) : (
                              <button
                                className="btn btn-secondary btn-sm"
                                disabled
                              >
                                Pending
                              </button>
                            );
                        } else {
                          if (amendStatus === "YES") {
                            button = (
                              <button
                                className="btn btn-success btn-sm"
                                disabled
                              >
                                Amended
                              </button>
                            );
                          } else if (
                            index === lastIndex + 1 &&
                            !isDisabledAmend
                          ) {
                            button = (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleAmendClick(row, category)}
                              >
                                Amend
                              </button>
                            );
                          } else {
                            button = (
                              <button
                                className="btn btn-secondary btn-sm"
                                disabled
                              >
                                Pending
                              </button>
                            );
                          }
                        }

                        return (
                          <td
                            key={category}
                            className={isDisabledAmend ? "disabled-cell" : ""}
                          >
                            {button}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="alert alert-info mt-4">
          Please select a plant to view data.
        </div>
      )}

<Modal
  show={showModal}
  onHide={() => setShowModal(false)}
  centered
///-----------------------------------------20/11/2025---------------------------------
  dialogClassName="modal-dialog-scrollable"
  ///-----------------------------------------20/11/2025---------------------------------
>
        <Modal.Header closeButton>
          <Modal.Title>Edit Process Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Plant</Form.Label>
              <Form.Control type="text" value={modalData.plant} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Process</Form.Label>
              <Form.Control type="text" value={modalData.process} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">

          <Form.Label>
  {modalData.process === "Received TOR" ? "Received Date" : "Apply Date"}
  <span style={{ color: "red" }}>*</span>
</Form.Label>

              <Form.Control
                type="date"
                value={modalData.applyDate}
                  max={new Date().toISOString().split("T")[0]} 
                onChange={(e) =>
                  setModalData((prev) => ({
                    ...prev,
                    applyDate: e.target.value,
                  }))
                }
                 
              />
                        {errors.applyDate && (
    <div className="text-danger" style={{ fontSize: "14px" }}>{errors.applyDate}</div>
  )}  
            </Form.Group>

            {/* Conditional Radio Button for "Returns Submit" */}
            {modalData.process ===
              "Comply EC conditions and submit half yearly returns and compliance Reports" && (
              <Form.Group className="mb-3">
                <Form.Label>Returns Submit</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    label="Yes"
                    name="returnsSubmit"
                    id="returnsSubmitYes"
                    value="Yes"
                    checked={modalData.returnsSubmitted === "Yes"} // Assuming a new state field `returnsSubmitted` in modalData
                    onChange={(e) =>
                      setModalData((prev) => ({
                        ...prev,
                        returnsSubmitted: e.target.value,
                      }))
                    }
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="No"
                    name="returnsSubmit"
                    id="returnsSubmitNo"
                    value="No"
                    checked={modalData.returnsSubmitted === "No"} // Assuming a new state field `returnsSubmitted` in modalData
                    onChange={(e) =>
                      setModalData((prev) => ({
                        ...prev,
                        returnsSubmitted: e.target.value,
                      }))
                    }
                  />
                </div>
              </Form.Group>
            )}

            {/* Display Logs */}
            {/* Display Logs - Structured Format (Updated for JSON) */}
            {modalData.logs && (
              <Form.Group className="mb-3">
                <Form.Label>Logs</Form.Label>
                <div
                  style={{
                    backgroundColor: "#e9ecef",
                    padding: "10px",
                    borderRadius: "5px",
                    maxHeight: "200px", // Adjust as needed
                    overflowY: "auto", // Make it scrollable if content overflows
                    border: "1px solid #ced4da",
                  }}
                >
                  {(() => {
                    try {
                      // Attempt to parse the JSON string
                      const logEntries = JSON.parse(modalData.logs);
                      if (
                        !Array.isArray(logEntries) ||
                        logEntries.length === 0
                      ) {
                        return (
                          <p>No detailed logs available or invalid format.</p>
                        );
                      }
                      return logEntries.map((entry, index) => (
                        <div key={index} className="mb-2">
                          <strong style={{ whiteSpace: "nowrap" }}>
                            Date:
                          </strong>{" "}
                          {entry.date}
                          <br />
                          <strong style={{ whiteSpace: "nowrap" }}>
                            Comment:
                          </strong>{" "}
                          {entry.comment}
                          {index < logEntries.length - 1 && (
                            <hr
                              style={{
                                margin: "10px 0",
                                borderColor: "#cdd4da",
                              }}
                            />
                          )}
                        </div>
                      ));
                    } catch (error) {
                      console.error("Failed to parse log data:", error);
                      return <p>Error loading logs: Invalid JSON format.</p>;
                    }
                  })()}
                </div>
              </Form.Group>
            )}

            <div className="mb-3">
              <strong>Previously Uploaded Files:</strong>
{/* ////--------------------20/11/2025---------------------- */}
  {Array.isArray(modalData.existingDocs) &&
 modalData.existingDocs.length > 0 &&
 modalData.existingDocs.some(doc => doc && doc !== "null" && doc !== "[]") ? (
  <ul className="mb-2 list-unstyled">
    {modalData.existingDocs
      .filter(doc => doc && doc !== "null" && doc !== "[]")
      .map((docPath, idx) => {
        const cleanedPath = docPath.replace(/[\[\]"'%]/g, "").trim();
        const rawName = modalData.existingNames[idx] || `Document ${idx + 1}`;
        const cleanedName = rawName.replace(/[\[\]"'%]/g, "").split("/").pop().trim();

        return (
          <li
            key={idx}
            className="d-flex justify-content-between align-items-center mb-1 border p-2 rounded"
          >
            <a
              href={`${API_DOC_URL}/storage/${cleanedPath}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {cleanedName}
            </a>

            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDeleteEditFile(docPath, idx)}
            >
              Delete
            </Button>
          </li>
        );
      })}
  </ul>
) : (
  <p className="text-muted">No documents uploaded.</p>
)}

{/* ////--------------------20/11/2025---------------------- */}


            </div>
{/*  20/11/2025--------------/// */}
         <Form.Group className="mb-3">
  <Form.Label>Upload Document (PDF Only)</Form.Label>
  <Form.Control
    type="file"
    multiple
    accept="application/pdf"
    ref={fileInputRef}
    onChange={(e) => {
      const files = Array.from(e.target.files);

      const invalidFiles = files.filter(
        (file) => file.type !== "application/pdf"
      );

      if (invalidFiles.length > 0) {
        toast.error("Only PDF files are allowed!");
        
        // Clear input
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
        return; // Stop here
      }

      // Add valid PDF files
      setModalData((prev) => ({
        ...prev,
        selectedFiles: [...prev.selectedFiles, ...files],
      }));

      // Clear the input after selection
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }}
  />
</Form.Group>
{/*  20/11/2025--------------/// */}

            {modalData.selectedFiles.length > 0 && (
              <div className="mb-2">
                <strong>Files to Upload:</strong>
                <ul className="list-unstyled">
                  {modalData.selectedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="d-flex justify-content-between align-items-center mb-1 border p-2 rounded"
                    >
                      {file.name}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setModalData((prev) => {
                            const updatedFiles = prev.selectedFiles.filter(
                              (_, i) => i !== index
                            );

                            // Clear file input if all files are removed
                            if (
                              updatedFiles.length === 0 &&
                              fileInputRef.current
                            ) {
                              fileInputRef.current.value = null;
                            }

                            return {
                              ...prev,
                              selectedFiles: updatedFiles,
                            };
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* <Form.Group className="mb-3">
                  <Form.Label>Logs</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={modalData.logs}
                    readOnly
                    style={{ backgroundColor: "#e9ecef" }} // Optional: style to indicate read-only
                  />
                </Form.Group> */}

            <Form.Group className="mb-3">
              <Form.Label>Comments
                      <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={modalData.comments}
                onChange={(e) =>
                  setModalData((prev) => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
              />
          {errors.comments && (
    <div className="text-danger" style={{ fontSize: "14px" }}>{errors.comments}</div>
  )}      
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled ={loading}>
            Cancel
          </Button>
  

          <Button variant="primary" onClick={handleEmailSubmit} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              "Send Email"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Email Selection Modal */}

      <EmailSelectionModal
        show={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        emailRecipients={emailRecipients}
        selectedEmails={selectedEmails}
        setSelectedEmails={setSelectedEmails}
        onSendEmail={handleSendEmail} // Pass the existing handler
        modalData={modalData} // Pass modalData to the new component
      />

      <AmendModal
        show={showAmendModal}
        onClose={() => setShowAmendModal(false)}
        amendData={amendData}
        setAmendData={setAmendData}
        onSubmit={handleAmendSubmit}
        onDeleteFile={handleDeleteFile}
  emailAmendRecipients={emailAmendRecipients}
  onSendAmendEmail={handleSendAmendEmail}
      />
    </>
  );
};

export default PcbModifyTable;
