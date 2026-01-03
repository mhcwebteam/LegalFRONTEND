



import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Mail, Send } from 'lucide-react';
import {
  Checkbox,
  FormControlLabel,
  Chip,
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL, API_BASE_URLS} from '../config/Config';

const EmailSelectionModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  processName = '',
  plantName = '',
  applyDate = '',
    comments = '',
  reason = '',
  status = ''
}) => {
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    // Expecting format: "YYYY-MM-DD"
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr; // Return as-is if not in expected format

    const [year, month, day] = parts;
    return `${day}-${month}-${year}`; // ✅ dd-mm-yyyy
  };

  useEffect(() => {
    if (show) {
      fetchEmailRecipients();
    }
  }, [show]);

  const fetchEmailRecipients = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/pcb-emails`);
      setEmailRecipients(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch email recipients:', error);
      setEmailRecipients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailToggle = (email) => {
    setSelectedEmails(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleRemoveEmail = (email) => {
    setSelectedEmails(prev => prev.filter(e => e !== email));
  };

  const handleSubmitClick = () => {
    if (selectedEmails.length > 0) {
      setConfirmOpen(true);
    }
  };

  const handleConfirmSubmit = () => {
    onSubmit(selectedEmails);
    setSelectedEmails([]);
    setConfirmOpen(false);
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
  };

  const handleClose = () => {
    setSelectedEmails([]);
    onHide();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="lg" dialogClassName="modal-dialog-scrollable">
        <Box className=" p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <Typography variant="subtitle2" className="fw-semibold mb-2">
            Process Information:
          </Typography>
          <div className="small">
            <div><strong>Process:</strong> {processName}</div>
            {plantName && <div><strong>Plant:</strong> {plantName}</div>}
            {applyDate && <div><strong>Apply Date:</strong> {formatDate(applyDate)}</div>}
            {status === "YES" && comments && (
              <div><strong>Comments:</strong> {comments}</div>
            )}
            
            {/* Show reason if status is NO */}
            {status === "NO" && reason && (
              <div><strong>Reason:</strong> {reason}</div>
            )}
          </div>
        </Box>
        
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Mail size={24} className="text-primary" />
            Select Email Recipients
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Box>
            {/* Static Email Recipients with Checkboxes */}
            <Typography variant="h6" className="fw-semibold ">
              Available Recipients:
            </Typography>
            <Box className=" border rounded" style={{ maxHeight: '1000px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
              <div className="row">
                {emailRecipients.map((recipient) => (
                  <div key={recipient.id} className="row-md-6 mb-2">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedEmails.includes(recipient.EMAIL)}
                          onChange={() => handleEmailToggle(recipient.EMAIL)}
                          sx={{
                            color: '#007bff',
                            '&.Mui-checked': {
                              color: '#007bff',
                            },
                          }}
                        />
                      }
                      label={
                        <span className="d-flex flex-column">
                          <strong style={{ fontSize: '14px' }}>{recipient.EMAIL}</strong>
                        </span>
                      }
                      sx={{
                        width: '100%',
                        margin: 0,
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                          borderColor: '#007bff',
                        },
                      }}
                    />
                  </div>
                ))}
              </div>
            </Box>

            {/* Selected Emails Display */}
            {selectedEmails.length > 0 && (
              <Box className="mb-3 p-3 border rounded" style={{ backgroundColor: '#e7f3ff' }}>
                <Typography variant="subtitle2" className=" fw-semibold text-primary">
                  Selected Recipients ({selectedEmails.length}):
                </Typography>
                <Box className="d-flex flex-wrap gap-2 mb-3">
                  {selectedEmails.map((email, index) => (
                    <Chip
                      key={index}
                      label={email}
                      onDelete={() => handleRemoveEmail(email)}
                      size="small"
                      sx={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                          color: 'white',
                          '&:hover': {
                            color: '#ff6b6b',
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
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitClick}
            disabled={selectedEmails.length === 0}
          >
            <Send size={16} className="me-1" />
            Submit ({selectedEmails.length})
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Material-UI Confirmation Dialog */}
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
            Are you sure you want to send emails to {selectedEmails.length} recipient(s)?
            <br />
            <br />
            <strong>Selected recipients:</strong>
            <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              {selectedEmails.map((email, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace' }}>
                  • {email}
                </Typography>
              ))}
            </Box>
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
            startIcon={<Send size={5} />}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmailSelectionModal;