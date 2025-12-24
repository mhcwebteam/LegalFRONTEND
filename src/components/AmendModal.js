
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { API_DOC_URL } from "../config/Config";
import { useRef, useState } from "react";
import Swal from "sweetalert2";
import EmailAmendModal from "./EmailAmendModal";
import { toast } from "react-toastify";


const AmendModal = ({
  show,
  onClose,
  amendData,
  setAmendData,
  onSubmit,
  onDeleteFile,
  onSendAmendEmail,
  emailAmendRecipients,
}) => {


  console.log("ammmmmmmmmm", amendData);

  const fileInputRef = useRef(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedAmendEmails, setSelectedAmendEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    amendDate: "",
    comments: "",
  });



  const handleDeleteFile = async (docPath, idx) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this file?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await onDeleteFile(docPath);

      setAmendData((prev) => {
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
      console.error("Delete failed", err);
      await Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to delete the file. Please try again later.",
      });
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!amendData.amendDate) {
      newErrors.amendDate = "Please enter Amendment Date";
    }

    if (!amendData.comments.trim()) {
      newErrors.comments = "Please enter Comments";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleOpenEmailModal = () => {
    if (!validateForm()) return;

    setShowEmailModal(true);
  };



  // ✅ Handle Email Modal Submit
  const handleSendAmendEmail = async (amendEmailData) => {
    setLoading(true);          // ⏳ START LOADING
    setShowEmailModal(false);

    try {
      await onSendAmendEmail(amendData, amendEmailData); // API call from parent
    } catch (error) {
      console.error("Email Send Failed:", error);
    }

    setLoading(false);         // ⏳ STOP LOADING
  };


const formatDate = (date) => {
  if (!date) return "";

  // Split date & time safely
  const [fullDate, time] = date.split(" ");

  const [y, m, d] = fullDate.split("-");

  // If no time → return only date
  return time ? `${d}-${m}-${y} ${time}` : `${d}-${m}-${y}`;
};



const receivedDateProcesses = [
  "Received TOR",
  "EC (Environmetal Clearance)",
  "Application for CFE",
  "Received CFE",
]

console.log("a,,,,,,,,,,,,,",amendData.applyDate);

  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        dialogClassName="modal-dialog-scrollable"
        centered

      >
        <Modal.Header closeButton>
          <Modal.Title>Amend Process Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* PLANT */}
            <Form.Group className="mb-3">
              <Form.Label>Plant</Form.Label>
              <Form.Control
                type="text"
                value={amendData.plant}
                className="form-control"
                readOnly
              />
            </Form.Group>

            {/* PROCESS */}
            <Form.Group className="mb-3">

              <Form.Label>Process</Form.Label>
              
              <Form.Control type="text" value={amendData.process} readOnly />
            </Form.Group>

            {/* APPLY DATE */}
                      <Form.Group className="mb-3">
            <Form.Label> Apply Date 
                <span style={{ color: "red" }}>*</span>
            </Form.Label>
            
                    <Form.Control type="text" value={formatDate(amendData?.applyDate)} readOnly />
                                 
                      </Form.Group>
          
          
          
        {receivedDateProcesses.includes(amendData.process) && (
  <Form.Group className="mb-3">
    <Form.Label>Received Date</Form.Label>
    <Form.Control
      type="date"
      value={amendData.receivedDate}
      onChange={(e) =>
        setAmendData((prev) => ({ ...prev, receivedDate: e.target.value }))
      }
    />
  </Form.Group>
)}


            {/* AMENDMENT DATE */}
            <Form.Group className="mb-3">
              <Form.Label>Amendment Date
                {amendData.amendDecision === "Yes" && (
                  <span style={{ color: "red" }}>*</span>
                )}
              </Form.Label>

              <Form.Control
                type="date"
                value={amendData.amendDate}
              max={new Date().toISOString().split("T")[0]} 
                onChange={(e) =>
                  setAmendData((prev) => ({
                    ...prev,
                    amendDate: e.target.value,
                  }))
                }
              />

              {errors.amendDate && (
                <div className="text-danger" style={{ fontSize: "14px" }}>
                  {errors.amendDate}
                </div>
              )}

            </Form.Group>

            {/* CATEGORY */}
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" value={amendData.category} readOnly />
            </Form.Group>

            {/* NEW - AMENDMENT DROPDOWN LIST */}
            <Form.Group className="mb-3">
              <Form.Label>
                Amendment Dropdown List <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Select
                value={amendData.amendDecision || "Yes"}
                onChange={(e) =>
                  setAmendData((prev) => ({
                    ...prev,
                    amendDecision: e.target.value,
                  }))
                }
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Form.Select>
            </Form.Group>

            {/* Conditional Radio Button for "Returns Submit" in Amend Modal */}
            {amendData.process ===
              "Comply EC conditions and submit half yearly returns and compliance Reports" && (
                <Form.Group className="mb-3">
                  <Form.Label>Returns Submit</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Yes"
                      name="amendReturnsSubmit" // Use a different name for amend modal to avoid conflicts
                      id="amendReturnsSubmitYes"
                      value="Yes"
                      checked={amendData.amendreturnsSubmitted === "Yes"}
                      onChange={(e) =>
                        setAmendData((prev) => ({
                          ...prev,
                          amendreturnsSubmitted: e.target.value,
                        }))
                      }
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="No"
                      name="amendReturnsSubmit"
                      id="amendReturnsSubmitNo"
                      value="No"
                      checked={amendData.amendreturnsSubmitted === "No"}
                      onChange={(e) =>
                        setAmendData((prev) => ({
                          ...prev,
                          amendreturnsSubmitted: e.target.value,
                        }))
                      }
                    />
                  </div>
                </Form.Group>
              )}

            <div className="mb-3">
              <strong>Previously Uploaded Amendment Files:</strong>
              <ul className="mb-2 list-unstyled">
                {amendData.existingDocs.map((docPath, idx) => {
                  const cleanedPath = docPath.replace(/[[\]'"%]/g, "").trim();
                  const displayName =
                    amendData.existingNames[idx]?.trim() ||
                    `Document ${idx + 1}`;

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
                        {displayName}
                      </a>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteFile(docPath, idx)}
                      >
                        Delete
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>


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
                  setAmendData((prev) => ({
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


            {amendData.selectedFiles.length > 0 && (
              <div className="mb-2">
                <strong>Files to Upload:</strong>
                <ul className="list-unstyled">
                  {amendData.selectedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="d-flex justify-content-between align-items-center border p-2 rounded mb-1"
                    >
                      <span>{file.name}</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          const updatedFiles = [...amendData.selectedFiles];
                          updatedFiles.splice(index, 1);
                          setAmendData((prev) => ({
                            ...prev,
                            selectedFiles: updatedFiles,
                          }));
                          fileInputRef.current.value = null; // ✅ clear file input
                        }}
                      >
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}


            {amendData.oldComments && (
              <Form.Group className="mb-3">
                <Form.Label>Logs</Form.Label>

                <div
                  style={{
                    backgroundColor: "#e9ecef",
                    padding: "10px",
                    borderRadius: "5px",
                    height: "80px",
                    overflowY: "auto",
                    border: "1px solid #ced4da",
                  }}
                >
                  {(() => {
                    const raw = amendData.oldComments;

                    const isJSON =
                      (raw.startsWith("{") && raw.endsWith("}")) ||
                      (raw.startsWith("[") && raw.endsWith("]"));

                    // -------------------------
                    // 🔹 IF IT IS NOT JSON → SHOW LINE-BY-LINE BULLETED
                    // -------------------------
                    if (!isJSON) {
                      return raw
                        .split(/\r?\n/)
                        .filter((line) => line.trim() !== "")
                        .map((line, i) => (
                          <div
                            key={i}
                            style={{ display: "flex", alignItems: "start", gap: "6px" }}
                          >
                            <span style={{ fontWeight: "bold" }}>•</span>
                            <span>{line.trim()}</span>
                          </div>
                        ));
                    }

                    // -------------------------
                    // 🔹 IF JSON → SHOW STRUCTURED
                    // -------------------------
                    try {
                      const logEntries = JSON.parse(raw);

                      if (!Array.isArray(logEntries) || logEntries.length === 0) {
                        return <p>No detailed logs available.</p>;
                      }

                      return logEntries.map((entry, index) => (
                        <div key={index} className="mb-2">
                          <strong>Date:</strong> {formatDate(entry.date)} <br />
                          <strong>Comment:</strong> {entry.comment}
                          {index < logEntries.length - 1 && <hr />}
                        </div>
                      ));
                    } catch (error) {
                      console.error("JSON parse failed:", error);

                      return raw
                        .split(/\r?\n/)
                        .filter((line) => line.trim() !== "")
                        .map((line, i) => (
                          <div
                            key={i}
                            style={{ display: "flex", alignItems: "start", gap: "6px" }}
                          >
                            <span style={{ fontWeight: "bold" }}>•</span>
                            <span>{line.trim()}</span>
                          </div>
                        ));
                    }
                  })()}
                </div>
              </Form.Group>
            )}



            {/* NEW COMMENTS */}
            <Form.Group className="mb-3">
              <Form.Label>
                New Comments{" "}
                {amendData.amendDecision === "Yes" && (
                  <span style={{ color: "red" }}>*</span>
                )}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={amendData.comments}
                onChange={(e) =>
                  setAmendData((prev) => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
                placeholder="Enter your amendment remarks"
              />
              {errors.comments && (
                <div className="text-danger" style={{ fontSize: "14px" }}>{errors.comments}</div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
      <Modal.Footer>
  <Button 
    variant="secondary" 
    onClick={onClose}
    disabled={loading}  // ✅ Disable Cancel during processing
  >
    Cancel
  </Button>

  <Button 
    variant="primary" 
    onClick={handleOpenEmailModal} 
    disabled={loading}  // ✅ Disable Send Email during processing
  >
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


      <EmailAmendModal
        show={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        emailAmendRecipients={emailAmendRecipients}
        selectedAmendEmails={selectedAmendEmails}
        setSelectedAmendEmails={setSelectedAmendEmails}
        // onSendAmendEmail={handleEmailSubmit}
        onSendAmendEmail={handleSendAmendEmail}
        modalData={amendData}

      />
    </>
  );
};

export default AmendModal;