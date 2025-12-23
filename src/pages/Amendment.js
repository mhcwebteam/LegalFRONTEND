
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, CardHeader, Form } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../config/Config";
import { useNavigate } from "react-router-dom"; // Add this import

import PcbTabs from "../components/PcbTabs";
import PlantSelector from "../components/PlantSelector";
import CategorySelector from "../components/CategorySelector";

import "../pages/Amendment.css";
import CardWithHeader from "../components/CardWithHeader";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

const Amendment = () => {
  const [key, setKey] = useState("Pollution Control Board");
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [amendmentStatus, setamendmentStatus] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const tabList = [
    "Pollution Control Board",
    "Airport Authority",
    "Fire",
    "HMDA"
  ];

  useEffect(() => {
    if (!selectedPlant) {
      setCategories([]);
      setCategory("");
      return;
    }

    axios
      .get(`${API_BASE_URL}/categories/${selectedPlant}`)
      .then((res) => {
        console.log("Fetched categories:", res.data);
        setCategories(Array.isArray(res.data) ? res.data : [res.data]);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setCategories([]);
      });
  }, [selectedPlant]);

  useEffect(() => {
    if (selectedPlant && key === "Airport Authority") {
      setamendmentStatus("Yes");
    } else {
      setamendmentStatus("");
    }
  }, [selectedPlant, key]);

  useEffect(() => {
    if (!key) return;

    axios
      .get(`${API_BASE_URL}/amnd_plants?process=${encodeURIComponent(key)}`)
      .then((res) => {
        console.log(`Fetched plants for ${key}:`, res.data);
        setPlants(res.data);
      })
      .catch((err) => console.error(err));
  }, [key]);

  const handlePlantChange = (e) => {
    const newPlant = e.target.value;
    setSelectedPlant(newPlant);
    setCategory("");
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleCreate = async () => {
    // Validation
    if (!selectedPlant) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please select a Plant",
      });
      return;
    }

    if (key === "Pollution Control Board" && !category) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please select a Category for Pollution Control Board",
      });
      return;
    }

    if (key === "Airport Authority" && !amendmentStatus) {
      await Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please select Amendment Status",
      });
      return;
    }

    // Show confirmation dialog
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to create an amendment for ${selectedPlant}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, create it!',
      cancelButtonText: 'No, cancel',
      reverseButtons: true
    });

    // If user cancels, return without doing anything
    if (!confirmation.isConfirmed) {
      return;
    }

    const payload = {
      plant: selectedPlant,
      category:
        key === "Pollution Control Board"
          ? category
          : key === "Airport Authority"
          ? amendmentStatus
          : null,
      process: key,
    };
    
    console.log("Payload to API:", payload);

    try {
      // Show loading indicator
      Swal.fire({
        title: 'Creating...',
        text: 'Please wait while we create the amendment',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await axios.post(`${API_BASE_URL}/amendments`, payload);
      
      // Hide loading indicator
      Swal.close();
      
      // Show success message
      const result = await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Amendment created successfully!",
        showCancelButton: true,
        confirmButtonText: 'Go to Details',
        cancelButtonText: 'Stay Here',
        reverseButtons: true
      });

      // If user clicks "Go to Details", navigate to create page
      if (result.isConfirmed) {
        // Navigate to the create page with data
        // You can pass data via state or query params
        navigate('/create');
      } else {
        // User chose to stay here, you can reset the form if needed
        setSelectedPlant("");
        setCategory("");
        setamendmentStatus("");
      }
      
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create amendment.",
      });
    }
  };

  return (
    <CardWithHeader title="Amendment Section">
      <PcbTabs keyState={key} setKey={setKey} tabList={tabList}>
        {key === "Pollution Control Board"}
        {key === "Airport Authority"}
        {key === "Fire" && <p>This is the Fire tab.</p>}
        {key === "HMDA" && <p>This is the HMDA tab.</p>}
      
        <Row className="g-3 align-items-end">
          <Col md={12}>
            <p>Currently Selected Tab: {key}</p>
          </Col>
          <Col md={4} className="amendment-plant-wrapper">
            <PlantSelector
              plants={plants}
              selectedPlant={selectedPlant}
              onChange={handlePlantChange}
            />
          </Col>

          <Col md={4}>
            {key === "Pollution Control Board" ? (
              <CategorySelector
                category={category}
                categories={categories}
                onChange={(e) => setCategory(e.target.value)}
              />
            ) : key === "Airport Authority" ? (
              <Form.Select
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: "9px 18px",
                  borderRadius: "6px",
                  fontWeight: 500,
                  minHeight: "44px",
                  fontSize: "15px",
                  border: "2px solid #007bff",
                  boxShadow: "0 2px 6px rgba(0, 123, 255, 0.2)",
                  transition: "all 0.3s ease-in-out",
                  width: "60%",
                  cursor: "pointer",
                }}
                value={amendmentStatus}
                onChange={(e) => setamendmentStatus(e.target.value)}
              >
                <option value=""> -- Amendment Status --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </Form.Select>
            ) : null}
          </Col>

          <Col md={4}>
            <div className="mb-1">
              <Button variant="primary" className="w-50" onClick={handleCreate}>
                Create
              </Button>
            </div>
          </Col>
        </Row>
      </PcbTabs>
    </CardWithHeader>
  );
};

export default Amendment;