// src/components/ReusableDialog.jsx
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

const ReusableDialog = ({
  open,
  title = "Confirmation",
  message = "Are you sure?",
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
          border: "1px solid #e0e0e0",
          p: 1,
          minWidth: 360,
        },
      }}
    >
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          fontWeight: "bold",
          fontSize: "1.2rem",
          borderBottom: "1px solid #eee",
          mb: 1,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          sx={{ fontSize: "0.95rem", color: "text.secondary" }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          sx={{ borderRadius: 2, textTransform: "none", px: 2 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          autoFocus
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReusableDialog;
