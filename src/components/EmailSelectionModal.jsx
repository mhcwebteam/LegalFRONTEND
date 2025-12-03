// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form } from 'react-bootstrap';
// import { Mail, Send } from 'lucide-react';
// import { Box, Checkbox, Chip, FormControlLabel, Typography } from '@mui/material';
// import Swal from 'sweetalert2';

// const EmailSelectionModal = ({
//   show,
//   onClose,
//   emailRecipients,
//   selectedEmails,
//   setSelectedEmails,
//   onSendEmail,
//   modalData // Pass modalData to access process, plant, etc.
// }) => {
  
//   // Handler for Email Checkbox Toggle
//   const handleEmailToggle = (email) => {
//     setSelectedEmails(prev =>
//       prev.includes(email)
//         ? prev.filter(e => e !== email)
//         : [...prev, email]
//     );
//   };

//   // Remove Selected Email
//   const handleRemoveEmail = (email) => {
//     setSelectedEmails(prev => prev.filter(e => e !== email));
//   };

//   const handleSubmit = async () => {
//     if (selectedEmails.length === 0) {
//       Swal.fire({
//         icon: 'warning',
//         text: 'Please select at least one email recipient.',
//       });
//       return;
//     }
//  onClose();
//    onSendEmail(selectedEmails);
     
//   };

//   return (
//     <Modal show={show} onHide={onClose} centered size="xl"  dialogClassName="modal-dialog-scrollable">
//       <Modal.Header closeButton>
//         <Modal.Title className="d-flex align-items-center gap-2">
//           <Mail size={24} className="text-primary" />
//           Select Email Recipients
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {/* <Box>
//           <Typography variant="h6" className="fw-semibold">
//             Available Recipients:
//           </Typography>
//           <Box className="mb-4 p-3 border rounded" style={{ maxHeight: '70vh', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
            
//             <div className="row"
//                 style={{
//                     // maxHeight: '2000px',
//                     overflowY: 'auto',
//                 }}>
//               {emailRecipients.map((recipient) => (
//                 <div key={recipient.id} className="col-md-6 mb-2">
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={selectedEmails.includes(recipient.EMAIL)}
//                         onChange={() => handleEmailToggle(recipient.EMAIL)}
//                         sx={{
//                           color: '#007bff',
//                           '&.Mui-checked': {
//                             color: '#007bff',
//                           },
//                         }}
//                       />
//                     }
//                     label={
//                       <span className="d-flex flex-column">
//                         <strong style={{ fontSize: '14px' }}>{recipient.EMAIL}</strong>
//                       </span>
//                     }
//                     sx={{
//                       width: '100%',
//                       margin: 0,
//                       '&:hover': {
//                         backgroundColor: '#e3f2fd',
//                         borderColor: '#007bff',
//                       },
//                     }}
//                   />
//                 </div>
//               ))}
//             </div>
//           </Box>

//           {selectedEmails.length > 0 && (
//             <Box className="mb-3 p-3 border rounded" style={{ backgroundColor: '#e7f3ff' }}>
//               <Typography variant="subtitle2" className="mb-2 fw-semibold text-primary">
//                 Selected Recipients ({selectedEmails.length}):
//               </Typography>
//               <Box className="d-flex flex-wrap gap-2">
//                 {selectedEmails.map((email, index) => (
//                   <Chip
//                     key={index}
//                     label={email}
//                     onDelete={() => handleRemoveEmail(email)}
//                     size="small"
//                     sx={{
//                       backgroundColor: '#007bff',
//                       color: 'white',
//                       '& .MuiChip-deleteIcon': {
//                         color: 'white',
//                         '&:hover': {
//                           color: '#ff6b6b',
//                         },
//                       },
//                     }}
//                   />
//                 ))}
//               </Box>
//             </Box>
//           )}

//           <Box className="mb-3 p-3 border rounded" style={{ backgroundColor: '#f0f0f0' }}>
//             <Typography variant="subtitle2" className="mb-2 fw-semibold">
//               Email Content Details:
//             </Typography>
//             <Typography variant="body2">
//               <strong className="text-muted">Process:</strong> {modalData.process || 'N/A'} <br />
//               <strong className="text-muted">Plant:</strong> {modalData.plant || 'N/A'} <br />
//               <strong className="text-muted">Apply Date:</strong> {modalData.applyDate || 'N/A'} <br />
//               <strong className="text-muted">Comments:</strong> {modalData.comments || 'No additional comments.'}
//             </Typography>
//           </Box>

//         </Box> */}

//                   <Box>
//             {/* Static Email Recipients with Checkboxes */}
//             <Typography variant="h6" className="fw-semibold">
//               Available Recipients:
//             </Typography>
//             <Box className="mb-4 p-3 border rounded" style={{ maxHeight: '1000px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
//               <div className="row">
//                 {emailRecipients?.map((recipient) => (
//                   <div key={recipient.id} className="row-md-6 mb-2">
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           checked={selectedEmails.includes(recipient.EMAIL)}
//                           onChange={() => handleEmailToggle(recipient.EMAIL)}
//                           sx={{
//                             color: '#007bff',
//                             '&.Mui-checked': {
//                               color: '#007bff',
//                             },
//                           }}
//                         />
//                       }
//                       label={
//                         <span className="d-flex flex-column">
//                           <strong style={{ fontSize: '14px' }}>{recipient.EMAIL}</strong>
                    
//                         </span>
//                       }
//                       sx={{
//                         width: '100%',
//                         margin: 0,
                
                 
//                         '&:hover': {
//                           backgroundColor: '#e3f2fd',
//                           borderColor: '#007bff',
//                         },
//                       }}
//                     />
//                   </div>
//                 ))}
//               </div>
//             </Box>

//             {/* Selected Emails Display */}
//             {selectedEmails?.length > 0 && (
//               <Box className="mb-3 p-3 border rounded" style={{ backgroundColor: '#e7f3ff' }}>
//                 <Typography variant="subtitle2" className="mb-2 fw-semibold text-primary">
//                   Selected Recipients ({selectedEmails.length}):
//                 </Typography>
//                 <Box className="d-flex flex-wrap gap-2">
//                   {selectedEmails?.map((email, index) => (
//                     <Chip
//                       key={index}
//                       label={email}
//                       onDelete={() => handleRemoveEmail(email)}
//                       size="small"
//                       sx={{
//                         backgroundColor: '#007bff',
//                         color: 'white',
//                         '& .MuiChip-deleteIcon': {
//                           color: 'white',
//                           '&:hover': {
//                             color: '#ff6b6b',
//                           },
//                         },
//                       }}
//                     />
//                   ))}
//                 </Box>
//               </Box>
//             )}

      
//           </Box>

//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button
//           variant="primary"
//           onClick={handleSubmit}
//           disabled={selectedEmails?.length === 0}
//         >
//           <Send size={16} className="me-1" />
//           Submit ({selectedEmails?.length})
//         </Button>
//       </Modal.Footer>
//     </Modal>

    
//   );
// };

// export default EmailSelectionModal;


import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Mail, Send } from 'lucide-react';
import { Box, Checkbox, Chip, FormControlLabel, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import Swal from 'sweetalert2';

const EmailSelectionModal = ({
  show,
  onClose,
  emailRecipients,
  selectedEmails,
  setSelectedEmails,
  onSendEmail,
  modalData
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Handler for Email Checkbox Toggle
  const handleEmailToggle = (email) => {
    setSelectedEmails(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  // Remove Selected Email
  const handleRemoveEmail = (email) => {
    setSelectedEmails(prev => prev.filter(e => e !== email));
  };

  // When Submit button is clicked
  const handleSubmitClick = () => {
    if (selectedEmails.length === 0) {
      Swal.fire({
        icon: 'warning',
        text: 'Please select at least one email recipient.',
      });
      return;
    }
    
    // Show confirmation dialog
    setConfirmOpen(true);
  };

  // When user confirms in the dialog
  const handleConfirmSubmit = () => {
    // Close both modals
    setConfirmOpen(false);
    onClose();
    
    // Send the emails
    onSendEmail(selectedEmails);
    
    // Clear selected emails
    setSelectedEmails([]);
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
  };

  return (
    <>
      <Modal show={show} onHide={onClose} centered size="xl" dialogClassName="modal-dialog-scrollable">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Mail size={24} className="text-primary" />
            Select Email Recipients
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Box>
            <Typography variant="h6" className="fw-semibold">
              Available Recipients:
            </Typography>
               <Box className="mb-4 p-3 border rounded" style={{ maxHeight: '1000px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                       <div className="row">
                         {emailRecipients?.map((recipient) => (
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

            {selectedEmails?.length > 0 && (
              <Box className="mb-3 p-3 border rounded" style={{ backgroundColor: '#e7f3ff' }}>
                <Typography variant="subtitle2" className="mb-2 fw-semibold text-primary">
                  Selected Recipients ({selectedEmails.length}):
                </Typography>
                <Box className="d-flex flex-wrap gap-2">
                  {selectedEmails?.map((email, index) => (
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

            {/* Optional: Show update details if modalData is provided */}
            {modalData && (
              <Box className="mb-3 p-3 border rounded" style={{ backgroundColor: '#f0f0f0' }}>
                <Typography variant="subtitle2" className="mb-2 fw-semibold">
                  Update Details:
                </Typography>
                <Typography variant="body2">
                  {modalData.updateType && (
                    <>
                      <strong className="text-muted">Update Type:</strong> {modalData.updateType || 'N/A'} <br />
                    </>
                  )}
                  {modalData.PROCESS && (
                    <>
                      <strong className="text-muted">Process:</strong> {modalData.PROCESS || 'N/A'} <br />
                    </>
                  )}
                  {modalData.APPLY_DT && (
                    <>
                      <strong className="text-muted">Apply Date:</strong> {modalData.APPLY_DT || 'N/A'} <br />
                    </>
                  )}
                  {modalData.process && (
                    <>
                      <strong className="text-muted">Process:</strong> {modalData.process || 'N/A'} <br />
                    </>
                  )}
                  {modalData.category && (
                    <>
                      <strong className="text-muted">Amendment Type:</strong> {modalData.category || 'N/A'} <br />
                    </>
                  )}
                </Typography>
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
            onClick={handleSubmitClick} 
            disabled={selectedEmails?.length === 0}
          >
            <Send size={16} className="me-1" />
            Submit ({selectedEmails?.length})
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
            startIcon={<Send size={16} />}
          >
            Confirm & Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmailSelectionModal;