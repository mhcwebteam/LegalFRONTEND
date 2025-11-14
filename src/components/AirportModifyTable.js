




import React, { useEffect, useState, useRef, useMemo, useContext } from "react";
import { Nav, Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL, API_BASE_URLS } from "../config/Config";

import PreviousUploadedDocsModal from "./PreviousUploadedDocsPanel";
import AirportDocUploadModal from "./AirportDocUploadModal";
import AmendmentPanel from "./AmendmentPanel";
import ProjectInfoHeader from "./ProjectInfoHeader";
import { Context } from "../context/ContextData";
import { getMasterByLoc } from "../api/Api";
import { Mail, Send } from "lucide-react";
import { Modal } from 'react-bootstrap';
import {
  Checkbox,
  FormControlLabel,
  TextField,
  Chip,
  Box,
  Typography
} from '@mui/material';
import EmailSelectionModal from "./EmailSelectionModal";



const AirportModifyTable = () => {
  const { totalMasterData, setHeaderData, headerData, setMasterGetData, setMasterData } = useContext(Context);
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [plants, setPlants] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedPlant, setSelectedPlant] = useState("");
  const [stepData, setStepData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [firstStep, setFirstStep] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isFirstProcess, setIsFirstProcess] = useState(true);
  const [linkDocs, setLinkDocs] = useState([]);
  const [landDocs, setLandDocs] = useState([]);
  const [othDocs, setOthDocs] = useState([]);

  const [nextStepDetails, setNextStepDetails] = useState(null);
  const [immediateNextStep, setImmediateNextStep] = useState(null);
  const [immediateNextStepIndex, setImmediateNextStepIndex] = useState(-1);
  const [processingDt, setProcessingdt] = useState("Application");

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);

  const [amendmentStatus, setAmendmentStatus] = useState(null);
  const [isAmendmentActive, setIsAmendmentActive] = useState(false);

  const [amendLinkDocs, setAmendLinkDocs] = useState([]);
  const [amendLandDocs, setAmendLandDocs] = useState([]);
  const [amendOthDocs, setAmendOthDocs] = useState([]);
  const [modalContext, setModalContext] = useState('main');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = () => {
    const newErrors = {};
    if (!formData.plant) newErrors.plant = "Plant selection is required";
    if (!formData.applyDate) newErrors.applyDate = "Apply date is required";

    // if (Object.keys(newErrors).length > 0) {
    //   setErrors(newErrors);
    //   return;
    // }

    // setErrors({});
    setShowEmailModal(true);
  };

  const handleEmailSelectionSubmit = async (emails) => {
    setSelectedEmails(emails);
    setShowEmailModal(false);

    // Proceed with form submission
    await handleConfirmSubmit(emails);
  };



  // Fetch steps
  useEffect(() => {
    axios
      .get(`${API_BASE_URLS}/airport-process`)
      .then((res) => {
        setSteps(res.data);
        if (res.data.length > 0) setActiveStep(0);
      })
      .catch((err) => console.error("Error fetching processes", err));
  }, []);



  useEffect(() => {
    if (immediateNextStepIndex === 0) {
      setIsFirstProcess(true);
    } else {
      setIsFirstProcess(false);
    }
  }, [immediateNextStepIndex]);






  // Fetch plants
  useEffect(() => {
    axios
      .get(`${API_BASE_URLS}/airport-plants`)
      .then((res) => setPlants(res.data))
      .catch((err) => console.error("Error fetching plants", err));
  }, []);

  // Set the correct date label based on the next step
  useEffect(() => {
    if (immediateNextStep && immediateNextStep.PROCESS) {
      const processName = immediateNextStep.PROCESS;
      switch (processName) {
        case "Submit Application": setProcessingdt("Application"); break;
        case "Inspection by Consultant":
        case "Inspection by Authority": setProcessingdt("Inspection"); break;
        case "NOC Received or Not": setProcessingdt("NOC Received"); break;
        case "Appeal Filled": setProcessingdt("Appeal"); break;
        case "NOC for Appeal Status": setProcessingdt("NOC for Appeal"); break;
        default: setProcessingdt("Process"); break;
      }
    } else {
      setProcessingdt("Application");
    }
  }, [immediateNextStep]);



  useEffect(() => {
    // This will run after the component re-renders with the new storeData
    console.log('storeData has been updated:', storeData);
  }, [storeData]);


  useEffect(() => {
    if (immediateNextStep && immediateNextStep.PROCESS) {
      // ... your switch statement logic ...
    } else {
      setProcessingdt("Application");
    }
  }, [immediateNextStep]);

  // ✅ PASTE THE NEW CONSOLIDATED HOOK HERE ✅
  useEffect(() => {
    // 1. Reset all states at the beginning
    setAmendmentStatus(null);
    setIsAmendmentActive(false);
    setFormData((prev) => ({
      plant: prev.plant,
      applyDate: "",
      comments: "",
      amendComments: "",
      amendDate: "",
      totalPrjArea: "",
      prjArea: "",
      nocs: "",
      noOfNocs: "",

    }));
    setNextStepDetails(null);
    setImmediateNextStep(null);
    setImmediateNextStepIndex(-1);
    setStepData([]);
    setStoreData([]);

    // 2. Guard clause: only proceed if a plant and steps are selected/loaded
    if (selectedPlant && steps.length > 0) {
      const processName = "Airport Authority";

      //console.log(selectedPlant,"plantttttt")
      const airportDataUrl = `${API_BASE_URLS}/airport-data?plant=${selectedPlant}`;


      const amendmentCheckUrl = `${API_BASE_URLS}/amendments/${selectedPlant}/${encodeURIComponent(processName)}`;

      // Use Promise.all to fetch main data and amendment status concurrently
      Promise.all([
        axios.get(airportDataUrl),
        axios.get(amendmentCheckUrl)
      ])
        .then(([airportRes, amendmentRes]) => {

          const fetchedData = airportRes.data;

          console.log(fetchedData,"fetching!!!!!!!!!!!!!!!!!!!!!!!!!1");

          const amendmentRecord = amendmentRes.data?.data?.[0] || null;

          // Update data states
          setStepData(fetchedData);
          setStoreData(fetchedData);

          // 3. Determine the correct "next step" USING the data we just fetched
          let nextStep = null;
          let nextStepIndex = -1;
          const isAmendActive = amendmentRecord && amendmentRecord.STATUS === "created";

          if (isAmendActive) {
            setIsAmendmentActive(true);
            setAmendmentStatus(amendmentRecord);
            const completed = fetchedData.filter(i => i.AMEND_STATUS === 'YES').map(i => i.PROCESS);
            nextStep = steps.find(s => !completed.includes(s.PROCESS));
          } else {
            setIsAmendmentActive(false);
            setAmendmentStatus(null);
            if (fetchedData.length > 0) {
              const completed = fetchedData.filter(i => i.UPDATED === 'YES').map(i => i.PROCESS);
              nextStep = steps.find(s => !completed.includes(s.PROCESS));
            } else {
              nextStep = steps[0]; // Default to the first step if no data exists
            }
          }

          if (nextStep) {
            nextStepIndex = steps.indexOf(nextStep);
            setImmediateNextStep(nextStep);
            setImmediateNextStepIndex(nextStepIndex);

            // 4. NOW, fetch the details for the ONE, CORRECT next step
            const nextStepName = nextStep.PROCESS;
            const detailsUrl = `${API_BASE_URLS}/airport-step-details/${encodeURIComponent(selectedPlant)}/${encodeURIComponent(nextStepName)}`;
            console.log("Fetching details for the correct next step:", detailsUrl);

            return axios.get(detailsUrl); // Return this promise for the next .then()
          }

          return Promise.resolve(null); // Return a resolved promise if there's no next step

        })
        .then((detailsRes) => {
          // 5. Set the details from the second API call
          if (detailsRes) {
            console.log("API Response for Step Details:", detailsRes.data);
            setNextStepDetails(detailsRes.data);
          }
        })
        .catch((err) => {
          console.error("Error during data fetching process:", err.message);
          // Reset states on error to be safe
          setAmendmentStatus(null);
          setIsAmendmentActive(false);
        });
    }
  }, [selectedPlant, steps]);

  // ... the rest of your useEffect hooks, like the one that populates the form, should remain ...
  useEffect(() => {
    // This hook is still needed to populate the form once nextStepDetails is ready
    if (nextStepDetails && nextStepDetails.length > 0) {
      // ...
    } else {
      // ...
    }
  }, [nextStepDetails]);

  // Populate form with fetched step details
  useEffect(() => {
    if (nextStepDetails && nextStepDetails.length > 0) {
      const details = nextStepDetails[0];
      setFormData((prev) => ({
        ...prev, applyDate: details.APPLY_DT,
        comments: details.COMMENTS || "",
        // Populate the new amendment fields
        amendComments: details.AMEND_COMMENTS || "",
        amendDate: details.AMEND_DATE || "",
        totalPrjArea: details.AMEND_TOTAL_PRJ_AREA || "",
        prjArea: details.TOTAL_PRJ_AREA || "",
        noOfNocs: details.AMEND_NO_OF_NOCS || "",
        nocs: details.NO_OF_NOCS || "",
      }));
      setFirstStep(details);
    } else {
      setFormData((prev) => ({
        ...prev, applyDate: "", comments: "",
        amendComments: "",
        amendDate: "",
        totalPrjArea: "",
        noOfNocs: "",
        prjArea: "",
        nocs: ""
      }));
      setFirstStep(null);
    }
  }, [nextStepDetails]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    console.log(name, "name", value);

    // --- Step 1: Handle plant selection separately ---
    if (name === "plant") {
      setSelectedPlant(value);

      // Prevent API call if no value selected
      if (!value || value.trim() === '') {
        setFormData((prev) => ({
          ...prev,
          plant: '',
          applyDate: '',
          comments: '',
          amendComments: '',
          amendDate: '',
          totalPrjArea: '',
          noOfNocs: '',
          nocs: '',
          prjArea: ''
        }));
        return;
      }

      try {
        const res = await getMasterByLoc(value);

        if (res) {
          setHeaderData(res);
          console.log("✅ Master data fetched:", res);

          // ✅ CRITICAL FIX: Update formData after getting the response
          setFormData((prev) => ({
            ...prev,
            plant: value, // ✅ Set the plant value
            applyDate: res.APPLICATION_DATE || '',
            prjArea: res.TOTAL_PROJECT_AREA || '' || null,
            nocs: res?.TOTAL_PROJECT_AREA && !isNaN(res.TOTAL_PROJECT_AREA)
              ? Math.ceil(Number(res.TOTAL_PROJECT_AREA) / 5)
              : '' || null,
          }));
        } else {
          console.warn('⚠️ No master data found for location:', value);
          setHeaderData(null);
          setFormData((prev) => ({
            ...prev,
            plant: value,
            applyDate: '',
            comments: '',
            amendComments: '',
            amendDate: '',
            totalPrjArea: '',
            prjArea: '',
            noOfNocs: '',
            nocs: ''
          }));
        }
      } catch (err) {
        console.error("❌ Error fetching master by loc:", err);
        setHeaderData({});
        setFormData((prev) => ({
          ...prev,
          plant: value,
          applyDate: '',
          comments: '',
          amendComments: '',
          amendDate: '',
          totalPrjArea: '',
          prjArea: '',
          noOfNocs: '',
          nocs: ''
        }));
      }

      return;
    }


    if (name === "prjArea") {


      const area = Number(value);
      const nocs = area > 0 ? Math.ceil(area / 5) : "";


      setFormData((prev) => ({
        ...prev,
        //  totalPrjArea: value,
        prjArea: value,
        nocs: nocs,
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

//   const handleConfirmSubmit = async (emails) => {

//   if (!formData.plant || !formData.applyDate) {
//     Swal.fire("Validation Error", "Please select a plant and provide a date.", "error");
//     return;
//   }
  
//   setIsSubmitting(true);

//   const payload = new FormData();
//   payload.append("loc", formData.plant);
//   payload.append("applyDate", formData.applyDate);
//   payload.append("comments", formData.comments || "");
//   payload.append("process", immediateNextStep.PROCESS);
//   payload.append("totalPrjArea", formData.prjArea || "" || null);
//   payload.append("noOfNocs", formData.nocs || "" || null);

//   emails.forEach((email, i) => {
//     payload.append(`emails[${i}]`, email);
//   });

//   linkDocs.forEach((file) => payload.append("link_docs[]", file));
//   landDocs.forEach((file) => payload.append("land_docs[]", file));
//   othDocs.forEach((file) => payload.append("oth_docs[]", file));

//   const existingRecord = storeData.find(
//     (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim() && item.LOC?.trim() === formData.plant?.trim()
//   );
//   const apiUrl = existingRecord ? `${API_BASE_URLS}/airport-modify` : `${API_BASE_URLS}/airport-submit`;

//   try {
//     await axios.post(apiUrl, payload, { headers: { "Content-Type": "multipart/form-data" } });
//     const res = await axios.get(`${API_BASE_URLS}/airport-data?plant=${formData.plant}`);
//     setStoreData(res.data);


//     Swal.fire(existingRecord ? "Updated!" : "Submitted!", "Your data has been saved.", "success");

//     // ✅ CRITICAL: Reset all form state completely after successful submission
//     setFormData({
//       plant: "",
//       applyDate: "",
//       comments: "",
//       totalPrjArea: "",
//       prjArea: "",
//       nocs: "",
//       amendComments: "",
//       amendDate: "",
//       noOfNocs: ""
//     });

//     // ✅ Reset plant selection and related states
//     setSelectedPlant("");
//     setLinkDocs([]); 
//     setLandDocs([]); 
//     setOthDocs([]);
    
//     // ✅ Reset amendment-related states
//     setAmendmentStatus(null);
//     setIsAmendmentActive(false);
    
//     // ✅ Reset step data
//     setStepData([]);
//     setNextStepDetails(null);
//     setImmediateNextStep(null);
//     setImmediateNextStepIndex(-1);
    
//   } catch (error) {
//     console.error("Submission failed:", error);
//     Swal.fire("Error", "Submission failed. Please check the console.", "error");
//   } finally {
//     setIsSubmitting(false);
//   }
// };


  const handleConfirmSubmit = async (emails) => {


    if (!formData.plant || !formData.applyDate) {
      Swal.fire("Validation Error", "Please select a plant and provide a date.", "error");
      return;
    }
      setIsSubmitting(true);

    const payload = new FormData();
    payload.append("loc", formData.plant);
    payload.append("applyDate", formData.applyDate);
    payload.append("comments", formData.comments || "");
    payload.append("process", immediateNextStep.PROCESS);
    payload.append("totalPrjArea", formData.prjArea || "" || null);
    payload.append("noOfNocs", formData.nocs || "" || null);


    emails.forEach((email, i) => {
      payload.append(`emails[${i}]`, email);
    });

    linkDocs.forEach((file) => payload.append("link_docs[]", file));
    landDocs.forEach((file) => payload.append("land_docs[]", file));
    othDocs.forEach((file) => payload.append("oth_docs[]", file));

    const existingRecord = storeData.find(
      (item) => item.PROCESS?.trim() === immediateNextStep.PROCESS?.trim() && item.LOC?.trim() === formData.plant?.trim()
    );
    const apiUrl = existingRecord ? `${API_BASE_URLS}/airport-modify` : `${API_BASE_URLS}/airport-submit`;

    try {
      await axios.post(apiUrl, payload, { headers: { "Content-Type": "multipart/form-data" } });
      const res = await axios.get(`${API_BASE_URLS}/airport-data?plant=${formData.plant}`);
         Swal.fire({
            icon: "success",
            title: "Submitted Successfully!",
            showConfirmButton: false,
            timer: 2000,
          });

      setStoreData(res.data);

       setFirstStep(null); 
   


   setFormData({
        plant: "",
        applyDate: "",
        comments: "",
        totalPrjArea: "",
      prjArea: "",
      nocs: ""
      });

      setLinkDocs([]); setLandDocs([]); setOthDocs([]);
    } catch (error) {
      console.error("Submission failed:", error);
      Swal.fire("Error", "Submission failed. Please check the console.", "error");
    }

    finally {
         setIsSubmitting(false);
    }
    
  };


  const handleAmendmentUpdate = async (dataFromPanel) => {
    if (!selectedPlant || !immediateNextStep) {
      Swal.fire("Error", "No plant or active step selected.", "error");
      return;
    }

    // NEW: Log the raw data object received from the AmendmentPanel
    console.log("Data received from AmendmentPanel:", dataFromPanel);

    const payload = new FormData();
    // Data from parent state
    payload.append("loc", selectedPlant);
    payload.append("process", immediateNextStep.PROCESS);

    // Data from the child panel's state
    payload.append("amendmentDate", dataFromPanel.amendmentDate);
    payload.append("totalPrjArea", dataFromPanel.totalPrjArea);
    payload.append("noOfNocs", dataFromPanel.noOfNocs);
    payload.append("reason", dataFromPanel.reason); // <-- This is your amend_comments

    // Appends any uploaded amendment files
    amendLinkDocs.forEach((file) => payload.append("link_docs[]", file));
    amendLandDocs.forEach((file) => payload.append("land_docs[]", file));
    amendOthDocs.forEach((file) => payload.append("oth_docs[]", file));

    // NEW: Log the final FormData payload before sending
    console.log("--- Submitting Amendment Payload ---");
    for (const [key, value] of payload.entries()) {
      // If the value is a File, it will show the File object. Otherwise, it shows the string value.
      console.log(`${key}:`, value);
    }
    console.log("------------------------------------");

    const apiUrl = `${API_BASE_URLS}/airport-amendment-submit`;
    try {
      // Makes the API call
      await axios.post(apiUrl, payload, { headers: { "Content-Type": "multipart/form-data" } });

      await Swal.fire({ icon: "success", title: "Amendment Step Submitted!", showConfirmButton: false, timer: 2000 });

      // Clear amendment file states after successful submission
      setAmendLinkDocs([]);
      setAmendLandDocs([]);
      setAmendOthDocs([]);

      // ✅ VERY IMPORTANT: Refreshes the data from the server
      const res = await axios.get(`${API_BASE_URLS}/airport-data?plant=${selectedPlant}`);

      console.log(res,"result ajith kumar!!!!!!!!!!!!!!1");
      setStoreData(res.data); // This will trigger your useEffect to find the next step

    } catch (error) {
      console.error("Amendment submission failed:", error);
      Swal.fire("Submission Failed", "Please check the console for details.", "error");
    }
  };



  const openUploadModal = (context) => {
    setModalContext(context); // Set 'main' or 'amendment'
    setShowUploadModal(true);
  };

  const totalProjectArea = stepData?.[0]?.TOTAL_PRJ_AREA;
  const noofNOCS = stepData?.[0]?.NO_OF_NOCS;

  const memoizedStepAmendData = useMemo(() => ({
    date: formData.amendDate,
    comments: formData.amendComments,
    totalPrjArea: formData.totalPrjArea,
    noOfNocs: formData.noOfNocs // <-- ADD THIS LINE
  }), [
    formData.amendDate,
    formData.amendComments,
    formData.totalPrjArea,
    formData.noOfNocs // <-- ADD THE DEPENDENCY
  ]);

  return (
    <>
      <ProjectInfoHeader data={headerData} />
      <Row className="align-items-stretch">
        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-light flex-fill">
            <h6 className="text-center mb-3">Process Steps</h6>
            <Nav variant="pills" className="flex-column">
              {steps.map((step, idx) => {
                let variant = "secondary", clickable = false, statusIcon = "⏸️";
                if (idx < immediateNextStepIndex) {
                  variant = "success"; clickable = true; statusIcon = "✅";
                } else if (idx === immediateNextStepIndex) {
                  variant = "warning"; clickable = true; statusIcon = "⚠️";
                }
                return (
                  <Nav.Item key={idx} className="mb-2">
                    <Nav.Link
                      eventKey={idx}
                      disabled={!clickable}
                      onClick={() => clickable && setActiveStep(idx)}
                      className={`text-dark border border-${variant} bg-${variant} bg-opacity-25 rounded d-flex align-items-center gap-2`}
                      style={{ cursor: clickable ? "pointer" : "not-allowed" }}
                    >
                      {statusIcon} <span>{step.PROCESS}</span>
                    </Nav.Link>
                  </Nav.Item>
                );
              })}
            </Nav>
          </div>
        </Col>

        <Col md={6} className="d-flex flex-column">
          <Form className="p-3 border rounded bg-light">
            {immediateNextStep && (
              <h4 className="mb-3 text-primary fw-bold">
                {immediateNextStep.PROCESS}
                {totalProjectArea && <> | Area: <span className="text-dark">{totalProjectArea}</span></>}
                {noofNOCS && <> | NOCs: <span className="text-dark">{noofNOCS}</span></>}
              </h4>
            )}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Plant</Form.Label>
                  <Form.Select name="plant" value={formData.plant || ""} onChange={handleChange} disabled={!!amendmentStatus}>
                    <option value="">Select Plant</option>
                    {plants.map((p, idx) => <option key={idx} value={p.loc}>{p.loc}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{processingDt} Date</Form.Label>
                  <Form.Control type="date" name="applyDate" value={formData.applyDate || ""} onChange={handleChange} disabled={!!amendmentStatus} />
                </Form.Group>
              </Col>
            </Row>
            <>
{

  isFirstProcess && 
               <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Total Project Area</Form.Label>
                    <Form.Control as="textarea" rows={1} name="prjArea" value={formData.prjArea || ""} onChange={handleChange} disabled={!!amendmentStatus} />
                  </Form.Group>
                </Col>
                <Col md={6}>

                  <Form.Group>
                    <Form.Label>Nocs</Form.Label>
                    <Form.Control as="textarea" rows={1} name="" value={formData.nocs || ""} onChange={handleChange} disabled={!!amendmentStatus} />
                  </Form.Group>
                </Col>
              </Row>
}
             
            </>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Comments</Form.Label>
                  <Form.Control as="textarea" rows={1} name="comments" value={formData.comments || ""} onChange={handleChange} disabled={!!amendmentStatus} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Label>Upload Documents</Form.Label>
                <Button variant="outline-secondary" className="form-control" onClick={() => setShowUploadModal(true)} disabled={!!amendmentStatus}>
                  Upload Docs
                </Button>
              </Col>
            </Row>
            <div className="d-grid mt-4">


              <Button variant="primary" size="md" onClick={handleEmailSubmit}

                     disabled={isSubmitting || !!amendmentStatus || !formData.plant} 
    
               >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Form>
          {amendmentStatus && (
            <div className="mt-4">
              <AmendmentPanel
                amendmentData={amendmentStatus}
                onUpdate={handleAmendmentUpdate}
                setAmendmentStatus={setAmendmentStatus}
                onUploadClick={() => openUploadModal('amendment')}

                // 👇 USE THE MEMOIZED VARIABLE HERE 👇
                stepAmendData={memoizedStepAmendData}
              />
            </div>
          )}
        </Col>

        <Col md={3} className="d-flex">
          <div className="border rounded p-3 bg-white flex-fill w-50">
            <PreviousUploadedDocsModal firstStep={firstStep} />
          </div>
        </Col>
      </Row>



      <EmailSelectionModal
        show={showEmailModal}
        onHide={() => setShowEmailModal(false)}
        onSubmit={handleEmailSelectionSubmit}
        processName={immediateNextStep?.PROCESS}
        plantName={formData.loc}
        applyDate={formData.applyDate}
        comments={formData.comments}
      />
      <AirportDocUploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
         comments={formData.comments}
        linkDocs={modalContext === 'main' ? linkDocs : amendLinkDocs}
        setLinkDocs={modalContext === 'main' ? setLinkDocs : setAmendLinkDocs}
        landDocs={modalContext === 'main' ? landDocs : amendLandDocs}
        setLandDocs={modalContext === 'main' ? setLandDocs : setAmendLandDocs}
        othDocs={modalContext === 'main' ? othDocs : amendOthDocs}
        setOthDocs={modalContext === 'main' ? setOthDocs : setAmendOthDocs}
      />
    </>
  );
};

export default AirportModifyTable;

