import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Mail, Send } from 'lucide-react';
import {
  Checkbox,
  FormControlLabel,
  Chip,
  Box,
  Typography
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URLS } from '../config/Config';

const EmailSelectionModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  processName = '',
  plantName = '',
  applyDate = '',
  comments = ''
}) => {
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch email recipients when modal opens


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
      const response = await axios.get(`${API_BASE_URLS}/pcb-emails`);
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

  const handleSubmit = () => {
    if (selectedEmails.length > 0) {
      onSubmit(selectedEmails);
   
      setSelectedEmails([]);
    }
  };

  const handleClose = () => {
    setSelectedEmails([]);
    onHide();
  };

  return (
    <>

 
<Modal show={show} onHide={handleClose} centered size="lg">

          <Box className=" p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
            <Typography variant="subtitle2" className="fw-semibold mb-2">
              Process Information:
            </Typography>
            <div className="small">
              <div><strong>Process:</strong> {processName}</div>
              {plantName && <div><strong>Plant:</strong> {plantName}</div>}
              {applyDate && <div><strong>Apply Date:</strong> {formatDate(applyDate)}</div>}
              {comments && <div><strong>Comments:</strong> {comments}</div>}
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
          onClick={handleSubmit}
          disabled={selectedEmails.length === 0}
        >
          <Send size={16} className="me-1" />
          Submit ({selectedEmails.length})
        </Button>
      </Modal.Footer>
    </Modal>

 
    </>
 
  );
};

export default EmailSelectionModal;