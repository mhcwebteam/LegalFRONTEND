import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, API_BASE_URLS } from '../config/Config';
import { FaLeaf, FaFire, FaBuilding, FaCalendarAlt, FaUpload, FaMoneyBill, FaFileAlt, FaCheckCircle, FaWater } from 'react-icons/fa';
import { ChevronLeft, FileText, Home, Flame, MessageSquareMore, Calculator, Store, FileCheck, FolderUp, MapPinned, User } from "lucide-react";
import WaterDocUploadModal from "../components/WaterDocUploadModal";
import PlantSelect from '../components/PlantSelect';
import ApplyDateInput from '../components/ApplyDateInput';
import { ToastContainer, toast } from 'react-toastify';
import ProcessField from '../components/ProcessField';
import ReusableDialog from "../components/ReusableDialog";
import ProjectInfoHeader from "../components/ProjectInfoHeader"
import "../pages/Fire.css";
import { getMasterByLoc, submitFireForm, submitWaterForm } from "../api/Api";
import { Context } from "../context/ContextData";
import ReraDocUploadModal from "../components/ReraDocUploadModal";
import FlatsPerTowerModal from "../components/FlatsPerTowerModal";





const FireForm = () => {
  const navigate = useNavigate();
  const { totalMasterData, setHeaderData, headerData, setMasterGetData, setMasterData } = useContext(Context);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [acknowledgeDocs, setAcknowledgeDocs] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [towerFlats, setTowerFlats] = useState({});
  const [showFlatsModal, setShowFlatsModal] = useState(false);

  const [newDocs, setNewDocs] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);




  const [formData, setFormData] = useState({
    loc: "",
    process: "",
    applyDate: "",
    document: null,
    noOfFlats: "",
    Comments: "",
    noOfTowers: "",
    BuildArea: "",
    ProjectArea: "",
    TotalArea: "",
    ProjectName: "",
    feePaid: "",
    feeAmount: "",
    acknowledgeName: "",
  });

      useEffect(() => {
        if (!headerData?.LOC && Array.isArray(totalMasterData) && totalMasterData.length > 0) {
            const defaultLoc = totalMasterData[totalMasterData.length - 1]?.LOC;
            fetchDataForLoc(defaultLoc);
        }
    }, [totalMasterData]);

    const fetchDataForLoc = async (loc) => {
        try {
            const res = await getMasterByLoc(loc);
            if (res) {
                setHeaderData(res);
            }
        } catch (error) {
            console.error("Error fetching initial loc data:", error);
        }
    };


  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/fire-process`);

      
        setFormData((prev) => ({
          ...prev,
          process: res.data[0].PROCESS,
        }));
      } catch (err) {
        console.error("Error fetching fire process name:", err);
      }
    };
    fetchProcess();
  }, []);

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "radio") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }


   if (name === "loc") {
      setFormData((prev) => ({
        ...prev,
        loc: value,
      }));

      // If empty value, clear everything
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

      // Fetch master data for the selected location
      try {
        const res = await getMasterByLoc(value);
        if (res && Object.keys(res).length > 0) {
          setHeaderData(res);

          setFormData((prev) => ({
            ...prev,
      
          }));
        } else {
          console.warn('⚠️ No master data found for location:', value);
          setHeaderData({});
          setFormData((prev) => ({
            ...prev,
            applyDate: "",

          }));
        }
      } catch (err) {
        console.error("❌ Error fetching master by loc:", err);
        setHeaderData({});
        setFormData((prev) => ({
          ...prev,
          applyDate: "",
      
        }));
      }
      return;
    }

    // Normal case
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProcessChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      process: value,
    }));
  };

  const handleSaveFlats = (flatsData) => {
    setTowerFlats(flatsData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.loc) newErrors.loc = "Project location is required.";
    if (!formData.process) newErrors.process = "Process type is required.";
    if (!formData.feePaid) newErrors.feePaid = "Please specify if fee is paid.";

    if (formData.feePaid === "YES" && !formData.feeAmount)
      newErrors.feeAmount = "Fee amount is required when fee is paid.";
    if (!formData.acknowledgeName)
      newErrors.acknowledgeName = "Acknowledge name is required.";

    // New validation for acknowledgeDocs
    if (acknowledgeDocs.length === 0) {
      newErrors.acknowledgeDocs =
        "Please upload at least one acknowledgement receipt.";
    }

    // if (acknowledgeDocs.length === 0) {
    //   newErrors.acknowledgeDocs =
    //     "Please upload at least one acknowledge receipt.";
    // }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false);
    setIsSubmitting(true);

    const formPayload = new FormData();
    formPayload.append("loc", formData.loc);
    formPayload.append("process", formData.process);
    formPayload.append("applyDate", formData.applyDate);
    formPayload.append("noOfFlats", formData.noOfFlats);
    formPayload.append("comments", formData.Comments); // Ensure 'comments' matches backend expected key
    formPayload.append("feePaid", formData.feePaid);
    formPayload.append("feeAmount", formData.feeAmount);
    formPayload.append("acknowledgeName", formData.acknowledgeName);
    formPayload.append("noOfTowers", formData.noOfTowers);
    formPayload.append("BuildArea", formData.BuildArea);
    formPayload.append("ProjectArea", formData.ProjectArea);
    formPayload.append("TotalArea", formData.TotalArea);
    formPayload.append("ProjectName", formData.ProjectName);

    // Append document arrays
    acknowledgeDocs.forEach((f) => formPayload.append("Acknowledge_Doc[]", f));
    newDocs.forEach((f) => formPayload.append("New_Doc[]", f));

    // Append towerFlats data as a JSON string
    formPayload.append("towerFlats", JSON.stringify(towerFlats));

    console.log("--- FormData Payload ---");
    for (let [key, value] of formPayload.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File (name: ${value.name}, type: ${value.type}, size: ${value.size} bytes)`
        );
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    console.log("------------------------");

    try {
      // Ensure submitFireForm returns the actual response data
      const response = await submitFireForm(formPayload); // Change 'data' to 'response' for clarity
      console.log("API Response:", response); // Log the full response

      // Access message from the response object
      toast.success(response.message);

      // Reset form
      setFormData({
        loc: "",
        process: "",
        applyDate: "",
        document: null, // This might not be needed anymore as docs are separate
        noOfFlats: "",
        Comments: "", // Keep Comments as empty string
        noOfTowers: "",
        BuildArea: "",
        ProjectArea: "",
        TotalArea: "",
        ProjectName: "",
        feePaid: "",
        feeAmount: "",
        acknowledgeName: "",
      });

      // Reset document states and towerFlats
      setAcknowledgeDocs([]);
      setNewDocs([]);
      setTowerFlats({});

      navigate("/create"); // Redirect after success
    } catch (err) {
      console.error("Submission error:", err); // Log the full error object
      // Use optional chaining for safer access to nested properties
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Submission failed. Please try again."
      );

      // Log validation errors if present
      if (err.response?.data?.errors) {
        console.error("Validation Errors:", err.response.data.errors);

      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate("/create");
  };





  return (
    <div className="fire-form-wrapper">
      <div className="fire-form-background"></div>
      <form
        className={`fire-form-container ${
          formData.loc || formData.ProjectName ? "with-info-header" : ""
        }`}
        onSubmit={handleSubmit}
      >
        {/* MAIN HEADER */}
        <div className="fire-form-header">
          <div className="fire-header-content">
            <div className="fire-title-section">
              <div className="fire-icon-wrapper">
                <Flame className="fire-icon" size={38} />
              </div>
              <h1 className="fire-form-title">
                Fire Control Board Application
              </h1>
            </div>

            <button
              type="button"
              onClick={handleBackClick}
              className="fire-back-button-modern"
              title="Go back"
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        </div>

        <ProjectInfoHeader formData={formData} />

        <div className="form-content">
          <div className="form-section">
            <div className="section-header">
              <Home className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Project Information:</h3>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Plant Name*
                </label>
                <div className="input-wrapper">
                  <select
                    name="loc"
                    value={formData.loc}
                    onChange={handleChange}
                    className="highlight-input"
                  >
                    <option value="" hidden>
                      Select Plant
                    </option>
                    {totalMasterData.map((ele, index) => (
                      <option key={index} value={ele.LOC}>
                        {ele.LOC}
                      </option>
                    ))}
                  </select>

                  <div className="error-container">
                    {errors.loc && <p className="error-text">{errors.loc}</p>}
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">
                  <FaLeaf className="label-icon" /> Process Type
                </label>
                <div className="input-wrapper">
                  <ProcessField
                    apiUrl={`${API_BASE_URL}/water-process`}
                    value={formData.process}
                    onChange={handleProcessChange}
                    className="modern-input dropdown-bottom"
                  />
                  <div className="error-container">
                    {errors.process && (
                      <p className="error-text">{errors.process}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="form-section">
            <div className="section-header">
              <FileText className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Application Details:</h3>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="field-label">
                  <FaCalendarAlt className="label-icon" /> Application Date*
                </label>
                <div className="input-wrapper">
                  <input
                    type="date"
                    name="applyDate"
                    value={formData.applyDate}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Select Application Date"
                  />
             
                  <div className="error-container">
                    {errors.applyDate && (
                      <p className="error-text">{errors.applyDate}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-field">
                <label className="field-label">
                  <FaUpload className="label-icon" /> Upload Documents*
                </label>
                <div className="upload-container">
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <FaUpload className="upload-icon" /> Upload Files
                    {newDocs.length > 0 && (
                      <span className="upload-count">
                        ({newDocs.length} files)
                      </span>
                    )}
                  </button>
                  {errors.documents && (
                    <p className="error-text">{errors.documents}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="form-section">
            <div className="section-header">
              <FaUpload className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Documents:</h3>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field">
                <label className="field-label">
                  <FaMoneyBill className="label-icon" /> Acknowledgement name
                </label>
                <div className="input-wrapper">
                  <input
                    type="text" // Changed to text
                    name="acknowledgeName" // Changed name to acknowledgeName
                    value={formData.acknowledgeName} // Changed value to formData.acknowledgeName
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter Acknowledge Name" // Updated placeholder
                  />
                  <div className="error-container">
                    {errors.acknowledgeName && (
                      <p className="error-text">{errors.acknowledgeName}</p>
                    )}{" "}
                    {/* Updated error */}
                  </div>
                </div>
              </div>
              <div className="form-field">
                <label className="field-label">
                  <FaUpload className="label-icon" /> Acknowledgement Receipt*
                </label>
                <div className="upload-container">
                  <button
                    type="button"
                    className="upload-button"
                    onClick={() => setShowAcknowledgeModal(true)} // Corrected: Use setShowAcknowledgeModal
                  >
                    <FaUpload className="upload-icon" /> Upload Receipts
                    {acknowledgeDocs.length > 0 && (
                      <span className="upload-count">
                        ({acknowledgeDocs.length} files)
                      </span>
                    )}
                  </button>
                  <div className="error-container">
                    {errors.acknowledgeDocs && (
                      <p className="error-text">{errors.acknowledgeDocs}</p>
                    )}
                  </div>
                </div>
              </div>
              {/* <div className="form-field full-width">
                <label className="field-label" style={{ marginTop: "-20px" }}>
                  <MessageSquareMore className="label-icon" /> Address
                </label>
                <div className="input-wrapper">
                  <textarea
                    name="Comments"
                    value={formData.Comments}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter your comments"
                    rows="2"
                  />
                </div>
              </div> */}
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <FileCheck className="section-icon" size={20} />
              <h3 style={{ color: "#0e7bdae7" }}>Water Requirement:</h3>
            </div>

            <div className="form-grid three-columns">
              <div className="form-group">
                <label className="field-label">Fee Paid?</label>{" "}
                {/* Changed label for clarity */}
                <div className="radio-group-horizontal">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="feePaid" // Changed name to feePaid
                      value="YES"
                      checked={formData.feePaid === "YES"}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    <span className="radiomark"></span>
                    Yes
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="feePaid" // Changed name to feePaid
                      value="NO"
                      checked={formData.feePaid === "NO"}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    <span className="radiomark"></span>
                    No
                  </label>
                </div>
                {/* Add error display for feePaid */}
                <div className="error-container">
                  {errors.feePaid && (
                    <p className="error-text">{errors.feePaid}</p>
                  )}
                </div>
              </div>

              {formData.feePaid === "YES" && ( // Conditional rendering
                <div className="form-field">
                  <label className="field-label">
                    <FaMoneyBill className="label-icon" /> Fee amount paid*{" "}
                    {/* Added asterisk for mandatory */}
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="feeAmount" // Changed name to feeAmount
                      value={formData.feeAmount} // Changed value to formData.feeAmount
                      onChange={handleChange}
                      className="modern-input"
                      placeholder="Enter the Fee Amount" // Updated placeholder
                      step="0.01"
                      min="0"
                    />
                    <div className="error-container">
                      {errors.feeAmount && (
                        <p className="error-text">{errors.feeAmount}</p>
                      )}{" "}
                      {/* Changed error */}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-field">
                <label className="field-label">
                  <FaBuilding className="label-icon" /> Number of Towers*
                </label>
                <div className="input-wrapper">
                  <select
                    name="noOfTowers"
                    value={formData.noOfTowers}
                    onChange={(e) => {
                      // Handle change for the dropdown
                      handleChange(e); // Update formData.noOfTowers
                      const selectedTowers = parseInt(e.target.value);
                      if (selectedTowers > 0) {
                        // Initialize towerFlats state for the new number of towers
                        const initialFlats = {};
                        for (let i = 1; i <= selectedTowers; i++) {
                          initialFlats[`Tower ${i}`] =
                            towerFlats[`Tower ${i}`] || ""; // Retain existing if switching from e.g. 3 to 2 then back to 3
                        }
                        setTowerFlats(initialFlats);
                        setShowFlatsModal(true); // Open the modal
                      } else {
                        setShowFlatsModal(false); // Close modal if no towers selected
                        setTowerFlats({}); // Clear flats if no towers
                      }
                    }}
                    className="modern-input"
                  >
                    <option value="">Select Number of Towers</option>
                    {[...Array(15)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <div className="error-container">
                    {errors.noOfTowers && (
                      <p className="error-text">{errors.noOfTowers}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-field full-width">
                <label className="field-label" style={{ marginTop: "-20px" }}>
                  <MessageSquareMore className="label-icon" /> Comments
                </label>
                <div className="input-wrapper">
                  <textarea
                    name="Comments"
                    value={formData.Comments}
                    onChange={handleChange}
                    className="modern-input"
                    placeholder="Enter your comments"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className={`submit-button ${isSubmitting ? "submitting" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaWater className="submit-icon" /> Submit
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <ReusableDialog
        open={confirmOpen}
        title="Confirm Submission"
        message="Are you sure you want to submit this fire application? You will be redirected to the create page after successful submission."
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        confirmText="Submit"
        cancelText="Cancel"
        isLoading={isSubmitting}
      />

      <ReraDocUploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        files={newDocs}
        setFiles={setNewDocs}
        title="Upload Application Documents"
      />

      <ReraDocUploadModal
        show={showAcknowledgeModal}
        onClose={() => setShowAcknowledgeModal(false)}
        files={acknowledgeDocs} // Use the new state for files
        setFiles={setAcknowledgeDocs} // Use the new state setter
        title="Upload Acknowledgement Receipts"
      />

      <FlatsPerTowerModal
        show={showFlatsModal}
        onClose={() => setShowFlatsModal(false)}
        numberOfTowers={parseInt(formData.noOfTowers) || 0}
        towerFlats={towerFlats}
        onSave={handleSaveFlats}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default FireForm;










