import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Mail, Send } from "lucide-react";
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Swal from "sweetalert2";

const EmailAmendModal = ({
  show,
  onClose,
  emailAmendRecipients,
  selectedAmendEmails,
  setSelectedAmendEmails,
  onSendAmendEmail,
  modalData,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Handler for Email Checkbox Toggle
  const handleAmendEmailToggle = (email) => {
    setSelectedAmendEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  // Remove Selected Email
  const handleAmendRemoveEmail = (email) => {
    setSelectedAmendEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleAmendSubmit = () => {
    if (selectedAmendEmails.length === 0) {
      Swal.fire({
        icon: "warning",
        text: "Please select at least one email recipient.",
      });
      return;
    }

    // Show confirmation dialog instead of directly sending
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    const emailAmendData = {
      ...modalData,
      selectedAmendEmails: selectedAmendEmails,
    };

    console.log("📤 Sending full emailData to parent:", emailAmendData);
    
    // Close confirmation dialog
    setConfirmOpen(false);
    
    // Call parent function to send email
    onSendAmendEmail(emailAmendData);
    
    // Close email modal
    onClose();
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
  };

  useEffect(() => {
    if (!show) {
      setSelectedAmendEmails([]);
    }
  }, [show, setSelectedAmendEmails]);

  return (
    <>
      <Modal 
        show={show} 
        onHide={onClose} 
        centered 
        size="xl" 
        dialogClassName="modal-dialog-scrollable"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Mail size={24} className="text-primary" />
            Select Email Recipients
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Box>
            {/* Static Email Recipients with Checkboxes */}
            <Typography variant="h6" className="fw-semibold">
              Available Recipients:
            </Typography>
            <Box
              className="mb-4 p-3 border rounded"
              style={{
                maxHeight: "1000px",
                overflowY: "auto",
                backgroundColor: "#f8f9fa",
              }}
            >
              <div className="row">
                {emailAmendRecipients?.map((recipient) => (
                  <div key={recipient.id} className="row-md-6 mb-2">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedAmendEmails.includes(recipient.EMAIL)}
                          onChange={() => handleAmendEmailToggle(recipient.EMAIL)}
                          sx={{
                            color: "#007bff",
                            "&.Mui-checked": {
                              color: "#007bff",
                            },
                          }}
                        />
                      }
                      label={
                        <span className="d-flex flex-column">
                          <strong style={{ fontSize: "14px" }}>
                            {recipient.EMAIL}
                          </strong>
                        </span>
                      }
                      sx={{
                        width: "100%",
                        margin: 0,
                        "&:hover": {
                          backgroundColor: "#e3f2fd",
                          borderColor: "#007bff",
                        },
                      }}
                    />
                  </div>
                ))}
              </div>
            </Box>

            {/* Selected Emails Display */}
            {selectedAmendEmails?.length > 0 && (
              <Box
                className="mb-3 p-3 border rounded"
                style={{ backgroundColor: "#e7f3ff" }}
              >
                <Typography
                  variant="subtitle2"
                  className="mb-2 fw-semibold text-primary"
                >
                  Selected Recipients ({selectedAmendEmails.length}):
                </Typography>
                <Box className="d-flex flex-wrap gap-2">
                  {selectedAmendEmails.map((email, index) => (
                    <Chip
                      key={index}
                      label={email}
                      onDelete={() => handleAmendRemoveEmail(email)}
                      size="small"
                      sx={{
                        backgroundColor: "#007bff",
                        color: "white",
                        "& .MuiChip-deleteIcon": {
                          color: "white",
                          "&:hover": {
                            color: "#ff6b6b",
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAmendSubmit}
            disabled={selectedAmendEmails?.length === 0}
          >
            <Send size={16} className="me-1" />
            Submit ({selectedAmendEmails?.length || 0})
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Confirm Submission
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to send emails to {selectedAmendEmails?.length || 0} recipient(s)?
            <br />
            <br />
            <strong>Selected recipients:</strong>
            <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, maxHeight: '200px', overflowY: 'auto' }}>
              {selectedAmendEmails?.map((email, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', py: 0.5 }}>
                  • {email}
                </Typography>
              ))}
            </Box>
            <br />
            
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirm} variant="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSubmit} 
            variant="primary"
            
            autoFocus
            startIcon={<Send size={16} />}
          >
            Confirm & Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmailAmendModal;