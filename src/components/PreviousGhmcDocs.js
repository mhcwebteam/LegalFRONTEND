// import React from "react";
// import { Card, ListGroup } from "react-bootstrap";
// import { API_BASE_URL, API_DOC_URL } from "../config/Config";

// /**
//  * Safe GHMC document viewer
//  * - Handles null, undefined, JSON strings, or arrays gracefully.
//  */
// const PreviousGhmcDocs = ({ docsData }) => {

//   console.log('doccccccccccccccccc',docsData?.Comments);
//   // ✅ Early fallback for null or undefined
//   if (!docsData) {
//     return (
//       <Card className="p-3">
//         <p className="text-muted text-center mb-0">No uploaded documents</p>
//       </Card>
//     );
//   }

//   // ⭐ REMOVED: safeParseArray and direct access to docsData?.tower_doc_name
//   // because GhmcModify now prepares docsData differently.

//   // ⭐ MODIFICATION START ⭐
//   // These arrays now directly receive the combined { name, path } objects
//   // from GhmcModify's `nextStepDetails` object.
//   const tower = docsData?.tower_docs || [];
//   const feas = docsData?.feas_docs || [];
//   const amount = docsData?.amount_docs || [];
//   // ⭐ MODIFICATION END ⭐

//   const renderList = (list, title) => {
//     if (!list.length) return null;

//     return (
//       <>
    
//       <div className="mb-3">
//         <h6 className="mb-2">{title}</h6>
//         <ListGroup variant="flush">
//           {list.map((doc, idx) => { // Renamed 'p' to 'doc' for clarity and consistency
//             // ⭐ MODIFICATION START ⭐
//             // We now expect 'doc' to be an object like { name: "...", path: "..." }
//             // If for some reason it's just a string, we handle it as a path.
//             const filenameToDisplay = doc.name || (typeof doc.path === 'string' ? doc.path.split("/").pop() : `file-${idx + 1}`);
//             const path = doc.path || (typeof doc === 'string' ? doc : ''); // Ensure path is a string, fallback to empty
//             // ⭐ MODIFICATION END ⭐

//             const href = `${API_DOC_URL}/storage/${path}`;

//             // If there's no path, we can't create a link, so return null or a disabled item
//             if (!path) {
//                 console.warn(`Document item at index ${idx} in ${title} has no valid path:`, doc);
//                 return null; // Or render a message indicating no valid path
//             }

//             return (
//               <ListGroup.Item
//                 key={idx}
//                 className="d-flex justify-content-between align-items-center"
//               >
//                 <a
//                   href={href}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="text-decoration-none"
//                 >
//                   {filenameToDisplay} {/* Use the new display name */}
//                 </a>
//               </ListGroup.Item>
//             );
//           })}
//         </ListGroup>

      
//       </div>

      

//           </>
//     );
//   };

//   return (
//     <>
   
//     <Card className="p-3">
//       <h6 className="text-center mb-3">Previously Uploaded Documents</h6>
//       {renderList(tower, "Tower Documents")}
//       {renderList(feas, "Feasibility Documents")}
//       {renderList(amount, "Amount Paid Documents")}
//       {!tower.length && !feas.length && !amount.length && (
//         <p className="text-muted text-center mb-0">
//           No documents uploaded for this step.
//         </p>
//       )}



//     </Card>

//     <Card>
//         <div>hiiiiiiiiiiiiiii</div>
//     </Card>

//      </>
//   );
// };

// export default PreviousGhmcDocs;



import React from "react";
import { Card, ListGroup } from "react-bootstrap";
import { API_BASE_URL, API_DOC_URL } from "../config/Config";

const PreviousGhmcDocs = ({ docsData }) => {
  

  if (!docsData) {
    return (
      <Card className="p-3">
        <p className="text-muted text-center mb-0">No uploaded documents</p>
      </Card>
    );
  }

  const tower = docsData?.tower_docs || [];
  const feas = docsData?.feas_docs || [];
  const amount = docsData?.amount_docs || [];

  const renderList = (list, title) => {
    if (!list.length) return null;

    return (
      <div className="mb-3">
        <h6 className="mb-2">{title}</h6>
        <ListGroup variant="flush">
          {list.map((doc, idx) => {
            const filenameToDisplay = doc.name || (typeof doc.path === 'string' ? doc.path.split("/").pop() : `file-${idx + 1}`);
            const path = doc.path || (typeof doc === 'string' ? doc : '');

            const href = `${API_DOC_URL}/storage/${path}`;

            if (!path) {
              console.warn(`Document item at index ${idx} in ${title} has no valid path:`, doc);
              return null;
            }

            return (
              <ListGroup.Item
                key={idx}
                className="d-flex justify-content-between align-items-center"
              >

                         <div
      key={doc.id}
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
     
    >
      📄 {filenameToDisplay}
    </div>
                {/* <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none"
                >
                  {filenameToDisplay}
                </a> */}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </div>
    );
  };

  return (
    <div className="d-flex flex-column" style={{ height: '100%' }}>
      <Card className="p-3 mb-2" style={{ height: '80%', overflow: 'auto' }}>
        <h6 className="text-center mb-3">Previously Uploaded Documents</h6>
        {renderList(tower, "Tower Documents")}
        {renderList(feas, "Feasibility Documents")}
        {renderList(amount, "Amount Paid Documents")}
        {!tower.length && !feas.length && !amount.length && (
          <p className="text-muted text-center mb-0">
            No documents uploaded for this step.
          </p>
        )}
      </Card>

 <Card className="m-2 p-2" style={{ height: '25%', overflow: 'hidden' }}>
  <h6 className="mb-2">Comments</h6>
  <div
    style={{
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}
  >
    {docsData?.Comments || 'No comments available'}
  </div>
</Card>
    </div>
  );
};

export default PreviousGhmcDocs;
  // {docsData?.Comments || 'No comments available'}