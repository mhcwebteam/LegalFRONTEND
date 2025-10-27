import React, { useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { API_BASE_URL } from '../config/Config';
import FormRow from '../components/FormRow';
import FormGroup from '../components/FormGroup';
import PlantSelect from '../components/PlantSelect';
import ApplyDateInput from '../components/ApplyDateInput';
import FileUpload from '../components/FileUpload';
import FormSection from '../components/FormSection'; 
import ProcessField from '../components/ProcessField';
import './PollutionForm.css';
import './Airport.css';
import { FaLeaf } from 'react-icons/fa'; 
import AirportDocUploadModal from "../components/AirportDocUploadModal";

const AirportForm = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
const [linkDocs, setLinkDocs] = useState([]);
const [landDocs, setLandDocs] = useState([]);
const [othDocs, setOthDocs] = useState([]);


  const [formData, setFormData] = useState({
    loc: '',
    process: '',
    applyDate: '',
    document: null,
    totalPrjArea: '',
    noOfNocs: ''
  });

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/airport-process`); 
        console.log('API Response:', res.data);
        setFormData((prev) => ({
          ...prev,
          process: res.data[0].PROCESS,
        }));
      } catch (err) {
        console.error("Error fetching airport process name:", err);
      }
    };
    fetchProcess();
  }, []);

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => {
    if (name === 'totalPrjArea') {
      const nocs = Math.ceil(Number(value) / 5); // divide by 5 and get roof value
      return {
        ...prev,
        totalPrjArea: value,
        noOfNocs: value ? nocs : ''
      };
    }
    return {
      ...prev,
      [name]: value,
    };
  });
};


   const handleProcessChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      process: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      document: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formPayload = new FormData();
    formPayload.append('loc', formData.loc);
    formPayload.append('process', formData.process);
    formPayload.append('applyDate', formData.applyDate);
    formPayload.append('document', formData.document);
    formPayload.append('totalPrjArea', formData.totalPrjArea);
    formPayload.append('noOfNocs', formData.noOfNocs);


   linkDocs.forEach(f => formPayload.append('link_docs[]', f));
  landDocs.forEach(f => formPayload.append('land_docs[]', f));
  othDocs.forEach(f => formPayload.append('oth_docs[]', f));

// ✅ Log all form data before sending
  console.log('--- FormData being submitted ---');
  for (let [key, value] of formPayload.entries()) {
    console.log(`${key}:`, value);
  }
    try {
      const response = await axios.post(`${API_BASE_URL}/airport-submit`, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Airport form submitted successfully!');
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      alert('Submission failed. Please try again.');
    }
  };
const handleBackClick = () => {
    navigate('/create');
  };
  return (
    <>
      <form className="container1" onSubmit={handleSubmit}>
        {/* <FormSection title="Airport Control Board Form"> */}
        <FormSection 
          title={
              <div 
              className="animated-title-wrapper"
              >
                
                <div className="icon-heading-container">
                  <FaLeaf className="pollution-icon" />
                  <h2 className="animated-heading">
                    {"Airport Control Board Form".split("").map((char, idx) => (
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

          > {/*  reused */}
          <FormRow>
            <FormGroup label="Project Name">
              <PlantSelect value={formData.loc} onChange={handleChange} className="form-control" />
            </FormGroup>

            <FormGroup label="Process">
              <ProcessField 
                  apiUrl={`${API_BASE_URL}/airport-process`} 
                  value={formData.process} 
                  onChange={handleProcessChange} 
                  className="form-control" 
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup label="Apply Date">
              <ApplyDateInput value={formData.applyDate} onChange={handleChange}
                  className="form-control"  />
            </FormGroup>

            {/* <FormGroup label="Upload Document">
              <FileUpload onChange={handleFileChange} />
            </FormGroup> */}

            <FormGroup label="Upload Documents">
              <button type="button" className="btn form-control" onClick={() => setShowModal(true)}>
                Upload Documents
              </button>
            </FormGroup>

          </FormRow>

          <FormRow>
            <FormGroup label="Total Project Area (in acres)">
              <input
                type="number"
                name="totalPrjArea"
                value={formData.totalPrjArea}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter area"
              />
            </FormGroup>

            <FormGroup label="Number of NOCs">
              <input
                type="number"
                name="noOfNocs"
                value={formData.noOfNocs}
                readOnly
                className="form-control"
              />
            </FormGroup>
          </FormRow>

          <div className="form-actions">
            <button type="submit" className="btn-grad">
              Submit
            </button>
          </div>
        </FormSection>
      </form>

      <AirportDocUploadModal
  show={showModal}
  onClose={() => setShowModal(false)}
  linkDocs={linkDocs}
  setLinkDocs={setLinkDocs}
  landDocs={landDocs}
  setLandDocs={setLandDocs}
  othDocs={othDocs}
  setOthDocs={setOthDocs}
/>

    </>

  );
};

export default AirportForm;
