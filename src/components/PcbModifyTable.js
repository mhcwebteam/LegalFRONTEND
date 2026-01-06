



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
  const token = localStorage.getItem('token');
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
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [errors, setErrors] = useState({
    applyDate: "",
    comments: "",
    recievedDate: ""
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
    receivedDate: "",
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
    // amendreceiveDate: "",
    category: "",
    selectedFiles: [],
    existingDocs: [],
    existingNames: [],
    comments: "",
    oldComments: "",
    amendreturnsSubmitted: "",

  });

  console.log(amendData, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

  // --- 2. Check User Login ---
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    const userString = localStorage.getItem('user'); // Changed to 'user' to be safe
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
      console.log(modalData.process, "modalData.processmodalData.processmodalData.process");

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

  const receivedDateProcesses = [
    "Received TOR",
    "EC (Environmetal Clearance)",
    "Application for CFE",
    "Received CFE",
  ]

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

          console.log(res.data, "pcb----------------store");
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
    if (amendCategories.includes("AMEND5")) {
      currentTimelineMode = "AMEND5";
    } else if (amendCategories.includes("AMEND4")) {
      currentTimelineMode = "AMEND4";
    } else if (amendCategories.includes("AMEND3")) {
      currentTimelineMode = "AMEND3";
    } else if (amendCategories.includes("AMEND2")) {
      currentTimelineMode = "AMEND2";
    } else if (amendCategories.includes("AMEND1")) {
      currentTimelineMode = "AMEND1";
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
    const isExistingRecord = !!storeInfo.APPLY_DT;

    const isExist = !!storeInfo.RECEIVED_DT;

    setModalData({
      plant: selectedPlant,
      process: row.PROCESS,
      applyDate: storeInfo.APPLY_DT || "",
      receivedDate: storeInfo?.RECEIVED_DT || "",
      selectedFiles: [],
      existingDocs,
      existingNames,
      comments: "",
      returnsSubmitted: storeInfo.RETURNS_SUBMITTED,
      logs: storeInfo.LOG || "",
      isExistingRecord,
      isExist
    });

    setShowModal(true);
  };


  //------------------updated on 26-12-2025 by rajakumari.m------------------------------------
  // Handlers for Amend
  const handleAmendClick = async (row, category) => {
    try {
      const storeInfo =
        storeData.find((item) => item.PROCESS === row.PROCESS) || {};

      const endpoint = `${API_BASE_URL}/amendment-data/${selectedPlant}/${encodeURIComponent(
        row.PROCESS
      )}`;
      const res = await axios.get(endpoint);

      console.log("✅ API Response Data for Amendment:", res.data);

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

      // ✅ FIX: Get received date from amendment data first, then fall back to store info
      const amendReceivedDate = data[`${prefix}_RECEIVED_DT`] || "";



      // Check if amendment already exists (has amendDate)
      const isExistingAmendment = !!amendDate;
      const isExist = !!amendReceivedDate;

      setAmendData({
        plant: selectedPlant,
        process: row.PROCESS,
        applyDate: storeInfo?.APPLY_DT || "",
        amendReceivedDate,
        amendDate,
        category,
        selectedFiles: [],
        existingDocs,
        existingNames,
        comments: "",
        oldComments,
        amendDecision: "Yes",
        amendreturnsSubmitted: amendreturnsubmit,
        isExistingAmendment,
        isExist
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
  //--------------------------------------------------------------------------------------------- 

  // Remove Selected Email
  // const handleRemoveEmail = (email) => {
  //   setSelectedEmails((prev) => prev.filter((e) => e !== email));
  // };

  // Submit Edit Modal
  const handleSendEmail = async () => {
    if (selectedEmails.length === 0) {
      Swal.fire({
        icon: "warning",
        text: "Please select at least one email recipient.",
      });
      return;
    }

    //  --- : 'fetch User';
    let currentUserName = loggedInUser.username;
    setLoading(true);
    const formData = new FormData();
    formData.append("loc", modalData.plant);
    formData.append("process", modalData.process);
    formData.append("applyDate", modalData.applyDate);
    formData.append("receivedDate", modalData.receivedDate || "");
    formData.append("comments", modalData.comments);
    formData.append('username', currentUserName);



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
    console.log("-----------111--------------");
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


      setShowModal(false);
      setShowEmailModal(false);
      setLoading(false);
      setSelectedEmails([]);


      const response = await axios.get(
        `${API_BASE_URL}/pcb-store/${selectedPlant}`
      );
      setStoreData(response.data);

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


  const handleAmendSubmit = async () => {


    const {
      plant,
      process,
      applyDate,
      amendReceivedDate,
      amendDate,
      selectedFiles,
      comments,
      category,
      amendreturnsSubmitted,
      selectedEmails,
    } = amendData;

    const isExistingRecord = storeData.some(
      (item) =>
        item.PROCESS?.toLowerCase().trim() === process?.toLowerCase().trim()
    );

    // const endpoint = isExistingRecord
    //   ? `${API_BASE_URL}/amendment-updt`
    //   : `${API_BASE_URL}/amendment-submit`;

    const formData = new FormData();
    formData.append("loc", plant);
    formData.append("process", process);
    formData.append("applyDate", applyDate);
    formData.append("amendreceivedDate", amendReceivedDate);
    formData.append("amendDate", amendDate);
    formData.append("comments", comments);
    formData.append("category", category);
    formData.append("amendreturnsSubmitted", amendreturnsSubmitted);
    // formData.append("receivedDate",null);
    selectedFiles.forEach((file) => {
      formData.append("document[]", file);
      formData.append("doc_name[]", file.name);
    });

    // ✅ Log for clarity
    console.log("📤 Submitting Amendment Data:", amendData);
    console.log("📤 Selected Emailsssss:", selectedEmails);

    try {
      // ✅ Step 1: Submit Amendment
      // await axios.post(endpoint, formData, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });

      await Swal.fire({
        icon: "success",
        title: "Amendment Submitted",
        text: `Amendment (${category}) submitted successfully.`,
      });

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


  useEffect(() => {
    setHeaderData(null);
  }, []);


  const handleSendAmendEmail = async (amendDataFromModal, selectedEmails) => {
    let freshStoreData = [];

    if (amendDataFromModal.plant) {
      try {
        const response = await axios.get(`${API_BASE_URL}/pcb-store/${amendDataFromModal.plant}`);
        freshStoreData = response.data;

        setStoreData(freshStoreData); // Update state too
        console.log("Fresh store data fetched:", freshStoreData);
      } catch (err) {
        console.error("Error fetching fresh data:", err);
        // Fall back to existing storeData
        freshStoreData = storeData;
      }
    }

    const payload = new FormData();

    // Add all normal fields
    payload.append("plant", amendDataFromModal.plant);
    payload.append("process", amendDataFromModal.process);
    payload.append("applyDate", amendDataFromModal.applyDate || amendDataFromModal.amendDate);
    payload.append("amendreceivedDate", amendDataFromModal?.amendReceivedDate || "");
    // payload.append("receivedDate", amendDataFromModal.receivedDate);
    payload.append("amendDate", amendDataFromModal.amendDate);
    payload.append("comments", amendDataFromModal.comments);
    payload.append("category", amendDataFromModal.category);

    // Emails → convert to JSON
    let finalEmailList = [];

    if (Array.isArray(selectedEmails)) {
      finalEmailList = selectedEmails;
    } else if (selectedEmails && Array.isArray(selectedEmails.selectedAmendEmails)) {
      finalEmailList = selectedEmails.selectedAmendEmails;
    }

    console.log("📧 FINAL EMAIL LIST BEING SENT:", finalEmailList);

    payload.append("emails", JSON.stringify(finalEmailList));


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



      const isExistingRecord = freshStoreData.some(
        (item) =>
          item.PROCESS?.trim().toLowerCase() === amendDataFromModal.process?.trim().toLowerCase()
      );



      const endpoint = isExistingRecord
        ? `${API_BASE_URL}/amendment-updt`
        : `${API_BASE_URL}/amendment-submit`;

        // added on 4-1-2025 by rajakumari.m----------------------------------------------------
 const response = await axios.post(endpoint, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  console.log("✅ Backend response:", response.data);
  setShowAmendModal(false);
  setShowAmendEmailModal(false); // Add this if you have a separate email modal

  // Show success popup similar to the regular submission
  await Swal.fire({
    icon: "success",
    title: "Successfully",
    text: "Amendment submitted successfully!",
    showConfirmButton: false,
    timer: 2000,
  });

} catch (error) {
  console.error("❌ Email sending failed:", error);
  await Swal.fire({
    icon: "error",
    title: "Submission Failed",
    text: "Something went wrong. Please try again.",
  });
}

  //---------------------------------------------------------------------------------------------------

      // const response = await axios.post(endpoint, payload, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });

      // console.log("✅ Backend response:", response.data);
      // setShowAmendModal(false);

      // await Swal.fire({
      //   icon: "success",
      //   title: "Email Sent!",
      //   text: `Amendment (${amendDataFromModal.category}) email sent to ${selectedEmails?.selectedAmendEmails} recipient(s).`,
      // });



    
    
  };


  const handleDeleteFile = async (docPath) => {
    await axios.post(`${API_BASE_URL}/delete-amendment-file`, {
      docPath,
      plant: amendData.plant,
      process: amendData.process,
      category: amendData.category,
    });
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

                          // First, check if this step is completed in the current mode
                          let isCompletedInMode = false;

                          if (currentTimelineMode === "action") {
                            isCompletedInMode = storeInfo?.UPDATED === "YES";
                          } else if (currentTimelineMode === "AMEND1") {
                            isCompletedInMode = storeInfo?.AMEND1_STATUS === "YES";
                          } else if (currentTimelineMode === "AMEND2") {
                            isCompletedInMode = storeInfo?.AMEND2_STATUS === "YES";
                          } else if (currentTimelineMode === "AMEND3") {
                            isCompletedInMode = storeInfo?.AMEND3_STATUS === "YES";
                          } else if (currentTimelineMode === "AMEND4") {
                            isCompletedInMode = storeInfo?.AMEND4_STATUS === "YES";
                          } else if (currentTimelineMode === "AMEND5") {
                            isCompletedInMode = storeInfo?.AMEND5_STATUS === "YES";
                          }

                          // Get the last completed index for the current mode
                          let lastCompletedIndex = -1;

                          if (currentTimelineMode === "action") {
                            lastCompletedIndex = lastUpdatedIndex;
                          } else {
                            lastCompletedIndex = lastAmendedIndexMap[currentTimelineMode] ?? -1;
                          }

                          // Determine the color
                          if (isCompletedInMode) {
                            timelineColor = "green"; // Completed step
                          } else if (index === lastCompletedIndex + 1) {
                            timelineColor = "red"; // Current step (next after last completed)
                          } else {
                            timelineColor = "grey"; // Not yet started
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
                Apply Date
                <span style={{ color: "red" }}>*</span>
              </Form.Label>

              <Form.Control
                type="date"
                value={modalData.applyDate}
                max={new Date().toISOString().split("T")[0]}
                readOnly={modalData.isExistingRecord} // Make readonly if record exists
                onChange={(e) => {
                  // Only allow changes if it's NOT an existing record
                  if (!modalData.isExistingRecord) {
                    setModalData((prev) => ({
                      ...prev,
                      applyDate: e.target.value,
                    }));
                  }
                }}
                className={modalData.isExistingRecord ? "bg-light" : ""}
              />


              {!modalData.applyDate && errors.applyDate && (
                <div className="text-danger" style={{ fontSize: "14px" }}>{errors.applyDate}</div>
              )}
            </Form.Group>



            {receivedDateProcesses.includes(modalData.process) && (
              <Form.Group className="mb-3">
                <Form.Label>
                  Received Date <span style={{ color: "red" }}>*</span>
                </Form.Label>

                <Form.Control
                  type="date"
                  value={modalData.receivedDate || ""}
                  max={new Date().toISOString().split("T")[0]}

                  //  readOnly={modalData.isExist}
                  onChange={(e) => {
                    // Only allow changes if it's NOT an existing record
                    if (!modalData.isExist) {
                      setModalData((prev) => ({
                        ...prev,
                        receivedDate: e.target.value,
                      }));
                    }
                  }}
                  className={modalData.isExist ? "bg-light" : ""}


                // onChange={(e) =>
                //   setModalData((prev) => ({
                //     ...prev,
                //     receivedDate: e.target.value,
                //   }))
                // }
                />


              </Form.Group>
            )}


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
                          {formatDate(entry.date)}
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
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
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
