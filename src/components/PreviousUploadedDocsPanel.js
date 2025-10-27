// import React, { useState } from "react";
// import { Card, ListGroup, Button } from "react-bootstrap";
// import { API_BASE_URLS, API_DOC_URL } from "../config/Config";
// import { BoxArrowUpRight } from "react-bootstrap-icons";
// import { FaTrashAlt } from "react-icons/fa";
// import axios from "axios";
// import Swal from "sweetalert2";

// // MUI Components
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Typography,
//   IconButton
// } from "@mui/material";
// import { Delete, Close } from "@mui/icons-material";

// // ------------------ Document List Component ------------------
// const DocumentList = ({ title, docs, docType, onDelete }) => {
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [docToDelete, setDocToDelete] = useState(null);

//   if (!docs || docs.length === 0) {
//     return null;
//   }

//   const handleDeleteClick = (doc) => {
//     setDocToDelete(doc);
//     setDeleteConfirmOpen(true);
//   };

//   const confirmDelete = () => {
//     if (docToDelete) {
//       onDelete(docType, docToDelete.name);
//     }
//     setDeleteConfirmOpen(false);
//     setDocToDelete(null);
//   };

//   const cancelDelete = () => {
//     setDeleteConfirmOpen(false);
//     setDocToDelete(null);
//   };

//   return (
//     <>
//       <h6 className="mt-2 mb-1 text-warning">{title}</h6>
//       <ListGroup variant="flush">
//         {docs.map((doc, idx) => (
//           <ListGroup.Item
//             key={idx}
//             className="d-flex align-items-center justify-content-between"
//           >
//             {/* Document link */}
//             <div className="d-flex align-items-center">
//               <BoxArrowUpRight className="me-3" color="royalblue" size={20} />
//               <a
//                 href={doc.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="fw-bold text-decoration-none"
//               >
//                 {doc.name}
//               </a>
//             </div>

//             {/* Delete button */}
//             <Button
//               variant="outline-danger"
//               size="sm"
//               onClick={() => handleDeleteClick(doc)}
//             >
//               <FaTrashAlt />
//             </Button>
//           </ListGroup.Item>
//         ))}
//       </ListGroup>

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteConfirmOpen}
//         onClose={cancelDelete}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
//       >
//         <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
//           <Delete color="error" sx={{ mr: 1 }} />
//           Confirm Deletion
//         </DialogTitle>
//         <DialogContent>
//           <Typography>
//             Are you sure you want to delete <strong>"{docToDelete?.name}"</strong>? 
//             This action cannot be undone.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={cancelDelete} color="primary">
//             Cancel
//           </Button>
//           <Button onClick={confirmDelete} color="error" autoFocus>
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// // ------------------ Main Panel ------------------
// const PreviousUploadedDocsPanel = ({ firstStep }) => {
//   if (!firstStep) {
//     return (
//       <Card className="h-100">
//         <Card.Body className="d-flex align-items-center justify-content-center">
//           <p className="text-muted mb-0">No step details available.</p>
//         </Card.Body>
//       </Card>
//     );
//   }

//   // Handle delete document
//   const handleDelete = async (docType, fileName) => {
//     try {
//       const res = await axios.delete(`${API_BASE_URLS}/water/document`, {
//         data: {
//           loc: firstStep.LOC,
//           process: firstStep.PROCESS,
//           doc_type: docType,
//           file_name: fileName,
//         },
//       });

//       Swal.fire("Deleted!", res.data.message, "success");
//     } catch (err) {
//       Swal.fire(
//         "Error!",
//         err.response?.data?.message || "Failed to delete file",
//         "error"
//       );
//     }
//   };

//   // Parse document JSON fields
//   const parseDocs = (nameField, pathField) => {
//     try {
//       if (!firstStep[nameField] || !firstStep[pathField]) {
//         return [];
//       }
//       const names = JSON.parse(firstStep[nameField]);
//       const paths = JSON.parse(firstStep[pathField]);
//       return names.map((name, idx) => ({
//         name,
//         url: `${API_DOC_URL}/storage/${paths[idx].replace(/\\/g, "/")}`,
//       }));
//     } catch (e) {
//       console.error(`Failed to parse document JSON for ${nameField}:`, e);
//       return [];
//     }
//   };

//   // Regular documents
//   const planDocs = parseDocs("PLAN_DOC_NAME", "PLAN_DOC_PATH");
//   const linkDocs = parseDocs("TITLE_DOC_NAME", "TITLE_DOC_PATH");
//   const landDocs = parseDocs("LAND_DOC_NAME", "LAND_DOC_PATH");
//   const othDocs = parseDocs("OTH_DOC_NAME", "OTH_DOC_PATH");
//   const feasDocs = parseDocs("FEAS_DOC_NAME", "FEAS_DOC_PATH");
//   const amountDocs = parseDocs("AMOUNT_PAID_DOC_NAME", "AMOUNT_PAID_DOC_PATH");

//   // Amendment documents
//   const amendLinkDocs = parseDocs("AMEND_LINK_DOC_NAME", "AMEND_LINK_DOC_PATH");
//   const amendLandDocs = parseDocs("AMEND_LAND_DOC_NAME", "AMEND_LAND_DOC_PATH");
//   const amendOthDocs = parseDocs("AMEND_OTH_DOC_NAME", "AMEND_OTH_DOC_PATH");

//   return (
//     <Card className="h-100 shadow-sm">
//       <Card.Body className="d-flex flex-column h-100">
//         <Card.Title as="h5" className="mb-3 border-bottom pb-2">
//           Previously Uploaded Documents
//         </Card.Title>

//         <div
//           className="flex-grow-1 overflow-auto"
//           style={{ maxHeight: "400px" }}
//         >
//           {/* Regular Docs */}
//           <DocumentList
//             title="Plan Documents"
//             docs={planDocs}
//             docType="PLAN"
//             onDelete={handleDelete}
//           />
//           <DocumentList
//             title="Link Documents"
//             docs={linkDocs}
//             docType="TITLE"
//             onDelete={handleDelete}
//           />
//           <DocumentList
//             title="Land Documents"
//             docs={landDocs}
//             docType="LAND"
//             onDelete={handleDelete}
//           />
//           <DocumentList
//             title="Other Documents"
//             docs={othDocs}
//             docType="OTH"
//             onDelete={handleDelete}
//           />
//           <DocumentList
//             title="Feasibility Documents"
//             docs={feasDocs}
//             docType="FEAS"
//             onDelete={handleDelete}
//           />
//           <DocumentList
//             title="Amount Documents"
//             docs={amountDocs}
//             docType="AMOUNT_PAID"
//             onDelete={handleDelete}
//           />

//           {/* Amendment Docs */}
//           {(amendLinkDocs.length > 0 ||
//             amendLandDocs.length > 0 ||
//             amendOthDocs.length > 0) && (
//             <>
//               <hr className="my-3" />
//               <h6 className="text-danger">Amendment Documents</h6>
//               <DocumentList
//                 title="Amendment Link Documents"
//                 docs={amendLinkDocs}
//                 docType="AMEND_LINK"
//                 onDelete={handleDelete}
//               />
//               <DocumentList
//                 title="Amendment Land Documents"
//                 docs={amendLandDocs}
//                 docType="AMEND_LAND"
//                 onDelete={handleDelete}
//               />
//               <DocumentList
//                 title="Amendment Other Documents"
//                 docs={amendOthDocs}
//                 docType="AMEND_OTH"
//                 onDelete={handleDelete}
//               />
//             </>
//           )}
//         </div>
//       </Card.Body>
//     </Card>
//   );
// };

// export default PreviousUploadedDocsPanel;


// import React, { useState, useEffect } from "react";
// import { Card, ListGroup, Button } from "react-bootstrap";
// import { API_BASE_URLS, API_DOC_URL } from "../config/Config";
// import { BoxArrowUpRight } from "react-bootstrap-icons";
// import { FaTrashAlt } from "react-icons/fa";
// import axios from "axios";
// import Swal from "sweetalert2";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Typography,
// } from "@mui/material";
// import { Delete } from "@mui/icons-material";

// // ------------------ Document List Component ------------------
// const DocumentList = ({ title, docs, docType, onDelete }) => {
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [docToDelete, setDocToDelete] = useState(null);

//   if (!docs || docs.length === 0) {
//     return null;
//   }

//   const handleDeleteClick = (doc) => {
//     setDocToDelete(doc);
//     setDeleteConfirmOpen(true);
//   };

//   const confirmDelete = () => {
//     if (docToDelete) {
//       onDelete(docType, docToDelete.name);
//     }
//     setDeleteConfirmOpen(false);
//     setDocToDelete(null);
//   };

//   const cancelDelete = () => {
//     setDeleteConfirmOpen(false);
//     setDocToDelete(null);
//   };

//   return (
//     <>
//       <h6 className="mt-2 mb-1 text-warning">{title}</h6>
//       <ListGroup variant="flush">
//         {docs.map((doc, idx) => (
//           <ListGroup.Item
//             key={idx}
//             className="d-flex align-items-center justify-content-between"
//           >
//             <div className="d-flex align-items-center">
//               <BoxArrowUpRight className="me-3" color="royalblue" size={20} />
//               <a
//                 href={doc.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="fw-bold text-decoration-none"
//               >
//                 {doc.name}
//               </a>
//             </div>
//             <Button
//               variant="outline-danger"
//               size="sm"
//               onClick={() => handleDeleteClick(doc)}
//             >
//               <FaTrashAlt />
//             </Button>
//           </ListGroup.Item>
//         ))}
//       </ListGroup>

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={deleteConfirmOpen} onClose={cancelDelete}>
//         <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
//           <Delete color="error" sx={{ mr: 1 }} />
//           Confirm Deletion
//         </DialogTitle>
//         <DialogContent>
//           <Typography>
//             Are you sure you want to delete{" "}
//             <strong>"{docToDelete?.name}"</strong>? This action cannot be undone.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={cancelDelete} color="primary">
//             Cancel
//           </Button>
//           <Button onClick={confirmDelete} color="error" autoFocus>
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// // ------------------ Main Panel ------------------
// const PreviousUploadedDocsPanel = ({ firstStep }) => {
//   const [docsState, setDocsState] = useState({
//     plan: [],
//     link: [],
//     land: [],
//     oth: [],
//     feas: [],
//     amount: [],
//     amendLink: [],
//     amendLand: [],
//     amendOth: [],
//   });

//   // Parse docs helper
//   const parseDocs = (nameField, pathField) => {
//     try {
//       if (!firstStep[nameField] || !firstStep[pathField]) return [];
//       const names = JSON.parse(firstStep[nameField]);
//       const paths = JSON.parse(firstStep[pathField]);
//       return names.map((name, idx) => ({
//         name,
//         url: `${API_DOC_URL}/storage/${paths[idx].replace(/\\/g, "/")}`,
//       }));
//     } catch (e) {
//       console.error(`Failed to parse document JSON for ${nameField}:`, e);
//       return [];
//     }
//   };

//   // Load docs when firstStep changes
//   useEffect(() => {
//     if (!firstStep) return;

//     setDocsState({
//       plan: parseDocs("PLAN_DOC_NAME", "PLAN_DOC_PATH"),
//       link: parseDocs("TITLE_DOC_NAME", "TITLE_DOC_PATH"),
//       land: parseDocs("LAND_DOC_NAME", "LAND_DOC_PATH"),
//       oth: parseDocs("OTH_DOC_NAME", "OTH_DOC_PATH"),
//       feas: parseDocs("FEAS_DOC_NAME", "FEAS_DOC_PATH"),
//       amount: parseDocs("AMOUNT_PAID_DOC_NAME", "AMOUNT_PAID_DOC_PATH"),
//       amendLink: parseDocs("AMEND_LINK_DOC_NAME", "AMEND_LINK_DOC_PATH"),
//       amendLand: parseDocs("AMEND_LAND_DOC_NAME", "AMEND_LAND_DOC_PATH"),
//       amendOth: parseDocs("AMEND_OTH_DOC_NAME", "AMEND_OTH_DOC_PATH"),
//     });
//   }, [firstStep]);

//   // Delete handler
//   const handleDelete = async (docType, fileName) => {
//     try {
//       const res = await axios.delete(`${API_BASE_URLS}/water/document`, {
//         data: {
//           loc: firstStep.LOC,
//           process: firstStep.PROCESS,
//           doc_type: docType,
//           file_name: fileName,
//         },
//       });

//       setDocsState((prev) => ({
//         ...prev,
//         [mapDocTypeToStateKey(docType)]: prev[
//           mapDocTypeToStateKey(docType)
//         ].filter((d) => d.name !== fileName),
//       }));

//       Swal.fire("Deleted!", res.data.message, "success");
//     } catch (err) {
//       Swal.fire(
//         "Error!",
//         err.response?.data?.message || "Failed to delete file",
//         "error"
//       );
//     }
//   };

//   const mapDocTypeToStateKey = (docType) => {
//     switch (docType) {
//       case "PLAN":
//         return "plan";
//       case "TITLE":
//         return "link";
//       case "LAND":
//         return "land";
//       case "OTH":
//         return "oth";
//       case "FEAS":
//         return "feas";
//       case "AMOUNT_PAID":
//         return "amount";
//       case "AMEND_LINK":
//         return "amendLink";
//       case "AMEND_LAND":
//         return "amendLand";
//       case "AMEND_OTH":
//         return "amendOth";
//       default:
//         return "";
//     }
//   };

//   if (!firstStep) {
//     return (
//       <Card>
//         <Card.Body className="d-flex align-items-center justify-content-center">
//           <p className="text-muted mb-0">No step details available.</p>
//         </Card.Body>
//       </Card>
//     );
//   }

//   return (
//  <Card className="shadow-sm">
//   <Card.Body className="d-flex flex-column">
//     <Card.Title as="h5" className="mb-3 border-bottom pb-2">
//       Previously Uploaded Documents
//     </Card.Title>

//     <div
//       style={{
//         maxHeight: "300px",
//         overflowY: "scroll",
//         scrollbarWidth:'thin',
//         overflowX: "hidden"
//       }}
//     >
//       <DocumentList title="Plan Documents" docs={docsState.plan} docType="PLAN" onDelete={handleDelete} />
//       <DocumentList title="Link Documents" docs={docsState.link} docType="TITLE" onDelete={handleDelete} />
//       <DocumentList title="Land Documents" docs={docsState.land} docType="LAND" onDelete={handleDelete} />
//       <DocumentList title="Other Documents" docs={docsState.oth} docType="OTH" onDelete={handleDelete} />
//       <DocumentList title="Feasibility Documents" docs={docsState.feas} docType="FEAS" onDelete={handleDelete} />
//       <DocumentList title="Amount Documents" docs={docsState.amount} docType="AMOUNT_PAID" onDelete={handleDelete} />

//       {(docsState.amendLink.length > 0 ||
//         docsState.amendLand.length > 0 ||
//         docsState.amendOth.length > 0) && (
//         <>
//           <hr className="my-3" />
//           <h6 className="text-danger">Amendment Documents</h6>
//           <DocumentList title="Amendment Link Documents" docs={docsState.amendLink} docType="AMEND_LINK" onDelete={handleDelete} />
//           <DocumentList title="Amendment Land Documents" docs={docsState.amendLand} docType="AMEND_LAND" onDelete={handleDelete} />
//           <DocumentList title="Amendment Other Documents" docs={docsState.amendOth} docType="AMEND_OTH" onDelete={handleDelete} />
//         </>
//       )}
//     </div>
//   </Card.Body>
// </Card>

//   );
// };

// export default PreviousUploadedDocsPanel;
import React, { useState } from "react";
import { Card, ListGroup, Button } from "react-bootstrap";
import { API_BASE_URLS, API_DOC_URL } from "../config/Config";
import { BoxArrowUpRight } from "react-bootstrap-icons";
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

// MUI Components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton
} from "@mui/material";
import { Delete, Close } from "@mui/icons-material";

// ------------------ Document List Component ------------------
const DocumentList = ({ title, docs, docType, onDelete, deletedDocs = [] }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // Filter out deleted documents
  const filteredDocs = docs.filter(doc => 
    !deletedDocs.some(deletedDoc => 
      deletedDoc.docType === docType && deletedDoc.fileName === doc.name
    )
  );

  if (!filteredDocs || filteredDocs.length === 0) {
    return null;
  }

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (docToDelete) {
      try {
        await onDelete(docType, docToDelete.name);
        // Close dialog after successful deletion
        setDeleteConfirmOpen(false);
        setDocToDelete(null);
      } catch (error) {
        // Keep dialog open if deletion failed
        console.error('Deletion failed:', error);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDocToDelete(null);
  };

  return (
    <>
      <h6 className="mt-2 mb-1 text-warning">{title}</h6>
      <ListGroup variant="flush">
        {filteredDocs.map((doc, idx) => (
          <ListGroup.Item
            key={`${docType}-${doc.name}-${idx}`}
            className="d-flex align-items-center justify-content-between"
          >
            {/* Document link */}
            <div className="d-flex align-items-center">
              <BoxArrowUpRight className="me-3" color="royalblue" size={20} />
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="fw-bold text-decoration-none"
              >
                {doc.name}
              </a>
            </div>

            {/* Delete button */}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleDeleteClick(doc)}
            >
              <FaTrashAlt />
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <Delete color="error" sx={{ mr: 1 }} />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{docToDelete?.name}"</strong>? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}
           style={{ backgroundColor: "#9b9e94ff", color: "white", border: "none" }} 
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ------------------ Main Panel ------------------
const PreviousUploadedDocsPanel = ({ firstStep, onDocumentsChange }) => {
  // State to track deleted documents locally
  const [deletedDocuments, setDeletedDocuments] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!firstStep) {
    return (
      <Card className="h-100">
        <Card.Body className="d-flex align-items-center justify-content-center">
          <p className="text-muted mb-0">No step details available.</p>
        </Card.Body>
      </Card>
    );
  }

  // Handle delete document
  const handleDelete = async (docType, fileName) => {
    if (isDeleting) return; // Prevent multiple simultaneous deletes
    
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URLS}/water/document`, {
        data: {
          loc: firstStep.LOC,
          process: firstStep.PROCESS,
          doc_type: docType,
          file_name: fileName,
        },
      });

      // Add to deleted documents list for immediate UI update
      setDeletedDocuments(prev => [...prev, { docType, fileName }]);

      // Call parent callback if provided to update parent state
      if (onDocumentsChange) {
        onDocumentsChange();
      }

      Swal.fire("Deleted!", res.data.message, "success");
    } catch (err) {
      console.error('Delete error:', err);
      Swal.fire(
        "Error!",
        err.response?.data?.message || "Failed to delete file",
        "error"
      );
      throw err; // Re-throw to prevent dialog from closing
    } finally {
      setIsDeleting(false);
    }
  };

  // Parse document JSON fields
  const parseDocs = (nameField, pathField) => {
    try {
      if (!firstStep[nameField] || !firstStep[pathField]) {
        return [];
      }
      const names = JSON.parse(firstStep[nameField]);
      const paths = JSON.parse(firstStep[pathField]);
      return names.map((name, idx) => ({
        name,
        url: `${API_DOC_URL}/storage/${paths[idx].replace(/\\/g, "/")}`,
      }));
    } catch (e) {
      console.error(`Failed to parse document JSON for ${nameField}:`, e);
      return [];
    }
  };

  // Regular documents
  const planDocs = parseDocs("PLAN_DOC_NAME", "PLAN_DOC_PATH");
  const linkDocs = parseDocs("TITLE_DOC_NAME", "TITLE_DOC_PATH");
  const landDocs = parseDocs("LAND_DOC_NAME", "LAND_DOC_PATH");
  const othDocs = parseDocs("OTH_DOC_NAME", "OTH_DOC_PATH");
  const feasDocs = parseDocs("FEAS_DOC_NAME", "FEAS_DOC_PATH");
  const amountDocs = parseDocs("AMOUNT_PAID_DOC_NAME", "AMOUNT_PAID_DOC_PATH");

  // Amendment documents
  const amendLinkDocs = parseDocs("AMEND_LINK_DOC_NAME", "AMEND_LINK_DOC_PATH");
  const amendLandDocs = parseDocs("AMEND_LAND_DOC_NAME", "AMEND_LAND_DOC_PATH");
  const amendOthDocs = parseDocs("AMEND_OTH_DOC_NAME", "AMEND_OTH_DOC_PATH");

  // Check if we have any documents after filtering deletions
  const hasAnyDocuments = () => {
    const allDocs = [
      { docs: planDocs, type: "PLAN" },
      { docs: linkDocs, type: "TITLE" },
      { docs: landDocs, type: "LAND" },
      { docs: othDocs, type: "OTH" },
      { docs: feasDocs, type: "FEAS" },
      { docs: amountDocs, type: "AMOUNT_PAID" },
      { docs: amendLinkDocs, type: "AMEND_LINK" },
      { docs: amendLandDocs, type: "AMEND_LAND" },
      { docs: amendOthDocs, type: "AMEND_OTH" }
    ];

    return allDocs.some(({ docs, type }) => {
      const filteredDocs = docs.filter(doc => 
        !deletedDocuments.some(deletedDoc => 
          deletedDoc.docType === type && deletedDoc.fileName === doc.name
        )
      );
      return filteredDocs.length > 0;
    });
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex flex-column h-100">
        <Card.Title as="h5" className="mb-3 border-bottom pb-2">
          Previously Uploaded Documents
        </Card.Title>

        {!hasAnyDocuments() ? (
          <div className="d-flex align-items-center justify-content-center flex-grow-1">
            <p className="text-muted mb-0">No documents available.</p>
          </div>
        ) : (
          <div
            className="flex-grow-1 overflow-auto"
            style={{ maxHeight: "300px", scrollbarWidth:'thin' }}
          >
            {/* Regular Docs */}
            <DocumentList
              title="Plan Documents"
              docs={planDocs}
              docType="PLAN"
              onDelete={handleDelete}
              deletedDocs={deletedDocuments}
            />
            <DocumentList
              title="Link Documents"
              docs={linkDocs}
              docType="TITLE"
              onDelete={handleDelete}
              deletedDocs={deletedDocuments}
            />
            <DocumentList
              title="Land Documents"
              docs={landDocs}
              docType="LAND"
              onDelete={handleDelete}
              deletedDocs={deletedDocuments}
            />
            <DocumentList
              title="Other Documents"
              docs={othDocs}
              docType="OTH"
              onDelete={handleDelete}
              deletedDocs={deletedDocuments}
            />
            <DocumentList
              title="Feasibility Documents"
              docs={feasDocs}
              docType="FEAS"
              onDelete={handleDelete}
              deletedDocs={deletedDocuments}
            />
            <DocumentList
              title="Amount Documents"
              docs={amountDocs}
              docType="AMOUNT_PAID"
              onDelete={handleDelete}
              deletedDocs={deletedDocuments}
            />

            {/* Amendment Docs */}
            {(amendLinkDocs.length > 0 ||
              amendLandDocs.length > 0 ||
              amendOthDocs.length > 0) && (
              <>
                <hr className="my-3" />
                <h6 className="text-danger">Amendment Documents</h6>
                <DocumentList
                  title="Amendment Link Documents"
                  docs={amendLinkDocs}
                  docType="AMEND_LINK"
                  onDelete={handleDelete}
                  deletedDocs={deletedDocuments}
                />
                <DocumentList
                  title="Amendment Land Documents"
                  docs={amendLandDocs}
                  docType="AMEND_LAND"
                  onDelete={handleDelete}
                  deletedDocs={deletedDocuments}
                />
                <DocumentList
                  title="Amendment Other Documents"
                  docs={amendOthDocs}
                  docType="AMEND_OTH"
                  onDelete={handleDelete}
                  deletedDocs={deletedDocuments}
                />
              </>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PreviousUploadedDocsPanel;