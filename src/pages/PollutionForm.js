import React, { useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from '../config/Config';
import FormRow from '../components/FormRow';
import FormGroup from '../components/FormGroup';
import FormSection from '../components/FormSection'; // ✅ import
import PlantSelect from '../components/PlantSelect';
import ProcessField from '../components/ProcessField';
import ApplyDateInput from '../components/ApplyDateInput';
import FileUpload from '../components/FileUpload';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import pcbIcon from '../assets/pcb2.png'; // adjust path as needed

import './PollutionForm.css';

import { FaLeaf } from 'react-icons/fa'; // Example icon



const PollutionForm = () => {

//------------------fade in----------------
  const fileInputRef = useRef(null);

  const [showHeading, setShowHeading] = useState(false);
  
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
  const cycleDuration = 8000; // total duration in ms for full loop
  const headingDisplayDelay = 1000; // delay before showing heading
  const fadeStartDelay = 4000; // delay before starting fade-out

  let showHeadingTimer = setTimeout(() => setShowHeading(true), headingDisplayDelay);
  let fadeOutTimer = setTimeout(() => setFadeOut(true), fadeStartDelay);
  let resetTimer = setTimeout(() => {
    setShowHeading(false);
    setFadeOut(false);
  }, cycleDuration); // restart cycle

  return () => {
    clearTimeout(showHeadingTimer);
    clearTimeout(fadeOutTimer);
    clearTimeout(resetTimer);
  };
}, [showHeading]);


//------------------end of fade out----------------
 

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loc: '',
    process: '',
    applyDate: '',
    document: [],
    comments: '',
  });

useEffect(() => {
  console.log('PollutionForm mounted');
}, []);

// Toast notification if plant already exists
useEffect(() => {
  if (formData.loc !== '') {
    checkIfPlantExists(formData.loc);
  }
}, [formData.loc]);

const checkIfPlantExists = async (plant) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/check-plant-exists`, { loc: plant });
    if (res.data.exists) {
      toast.error('This plant already has entries.');
      setFormData((prev) => ({ ...prev, loc: '' })); // Reset plant field
    }
  } catch (error) {
    console.error('Failed to check plant:', error);
  }
};


useEffect(() => {
  const fetchProcess = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/processname`);
      const processValue = res.data.process?.[0]?.PROCESS || "";
      setFormData((prev) => ({
        ...prev,
        process: processValue,
      }));
    } catch (err) {
      console.error("Error fetching process:", err);
    }
  };

  fetchProcess();
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    setFormData((prev) => {
      const existingFiles = Array.from(prev.document || []); // ✅ convert to array safely
      const existingNames = existingFiles.map(file => file.name);
      const uniqueNewFiles = newFiles.filter(file => !existingNames.includes(file.name));

      return {
        ...prev,
           document: [...existingFiles, ...uniqueNewFiles],
      };
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔄 Show loading alert
  Swal.fire({
    title: 'Submitting...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  const formPayload = new FormData();
  formPayload.append('loc', formData.loc);
  formPayload.append('process', formData.process);
  formPayload.append('applyDate', formData.applyDate);
  formPayload.append('comments', formData.comments);

  for (let i = 0; i < formData.document.length; i++) {
    formPayload.append('document[]', formData.document[i]);
    formPayload.append('doc_name[]', formData.document[i].name);
  }

  try {
    await axios.post(`${API_BASE_URL}/pollution-submit`, formPayload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // ✅ Show success message
    Swal.fire({
      icon: 'success',
      title: 'Submitted!',
      text: 'Form submitted successfully!',
      confirmButtonText: 'OK',
    }).then(() => {
      // 🔄 Reload the page or reset form
      // Reset the form after user clicks "OK"
        setFormData({
          loc: '',
          // process: '',
          applyDate: '',
          comments: '',
          document: [],
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
    });

  } catch (err) {
    // ❌ Show error
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Something went wrong while submitting.',
    });
  }
};

 const handleBackClick = () => {
    navigate('/create');
  };

  return (
    <>
      <form className="container1" onSubmit={handleSubmit}>
        <FormSection 
        title={
           <div className="animated-title-wrapper">
              <div className="icon-heading-container">
                {/* <img
                  src={pcbIcon}
                  alt="PCB Icon"
                  className="heading-image"
                /> */}

                <h2 className="animated-heading">
                  {"Pollution Control Board Form".split("").map((char, idx) => (
                    <span
                      key={idx}
                      className="letter"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleBackClick}
                className="back-button"
              >
                ←
              </button>
            </div>

          }

        >
        <FormRow>
            <FormGroup label="Project Name" col={6}>
              <PlantSelect value={formData.loc} onChange={handleChange} className="form-control" />
            </FormGroup>

            <FormGroup label="Process" col={6}>
              <ProcessField 
                apiUrl={`${API_BASE_URL}/processname`} 
                value={formData.process} 
                onChange={(value) => setFormData(prev => ({ ...prev, process: value }))} 
                className="form-control" 
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Apply Date" col={6}>
              <ApplyDateInput value={formData.applyDate} onChange={handleChange} className="form-control" />
            </FormGroup>

            <FormGroup label="Upload Document" col={6}>
              <FileUpload onChange={handleFileChange} multiple ref={fileInputRef} />
            </FormGroup>
          </FormRow>

          <FormRow>
    <FormGroup label="Comments" col={6}>
      <textarea
        name="comments"
        value={formData.comments}
        onChange={handleChange}
        className="form-control"
        rows="4"
        placeholder="Enter any additional comments here..."
        style={{
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '10px'
                }}
      />
    </FormGroup>
    {/* No other FormGroup here, so the remaining space is just empty */}
  </FormRow>



          <div className="form-actions">
            <button type="submit" className="btn-grad">
              Submit
            </button>
          </div>
        </FormSection>
        
      </form>
      { /* Toast container at the bottom */}
      <ToastContainer position="top-left" autoClose={3000} 
      style={{ marginTop: '100px', marginLeft: '10px' }}
      />
    </>
  );
};

export default PollutionForm;
