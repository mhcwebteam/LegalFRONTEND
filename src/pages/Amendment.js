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
    const [existingAmendments, setExistingAmendments] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');
  const navigate = useNavigate(); // Initialize navigate
        const [loggedInUser, setLoggedInUser] = useState(null);   //------------login user state

  const tabList = [
    "Pollution Control Board",
    "Airport Authority",
    "Fire",
    "HMDA"
  ];

  

  useEffect(() => {
    const fetchAllAmendments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/getAmend`);
        
        if (response.data && Array.isArray(response.data)) {
          console.log("Fetched all amendments from API:", response.data);
          setExistingAmendments(response.data);
          
          // Also store in localStorage as backup
          localStorage.setItem("createdAmendments", JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Error fetching amendments:", error);
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem("createdAmendments");
        if (stored) {
          try {
            setExistingAmendments(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to parse stored amendments");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllAmendments();
  }, []);

  //function 

    // --- 2. Check User Login ---
            useEffect(() => {
              if (!token) {
                navigate('/');
                return;
              }
              const userString = localStorage.getItem('user'); // Changed to 'user' to be safe
              if (userString) {
                try {
                  const userObj = JSON.parse(userString);
                  setLoggedInUser(userObj);
                } catch (error) {
                  console.error("Error parsing user data:", error);
                }
              }
              
            }, [token, navigate]);
  

  useEffect(() => {
    if (!selectedPlant) {
      setCategories([]);
      setCategory("");
      return;
    }

    axios
      .get(`${API_BASE_URL}/categories/${selectedPlant}`,{
          params: {
            process: 'Pollution Control Board'
          }
      })
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
  // VALIDATION 1: Check if plant is selected
  if (!selectedPlant) {
    await Swal.fire({
      icon: "warning",
      title: "Missing Plant Selection",
      text: "Please select a Plant before creating an amendment.",
      confirmButtonText: 'OK',
    });
    return;
  }

  // VALIDATION 2: Check if category/status is selected based on tab
  if (key === "Pollution Control Board" && !category) {
    await Swal.fire({
      icon: "warning",
      title: "Missing Category Selection",
      text: "Please select a Category for Pollution Control Board.",
      confirmButtonText: 'OK',
    });
    return;
  }

  if (key === "Airport Authority" && !amendmentStatus) {
    await Swal.fire({
      icon: "warning",
      title: "Missing Amendment Status",
      text: "Please select Amendment Status for Airport Authority.",
      confirmButtonText: 'OK',
    });
    return;
  }

  // For other tabs (Fire, HMDA), add validation if needed
  // if (key === "Fire" && !someCondition) {
  //   await Swal.fire({
  //     icon: "warning",
  //     title: "Missing Information",
  //     text: "Please provide required information for Fire tab.",
  //     confirmButtonText: 'OK',
  //   });
  //   return;
  // }

  // Determine current category value
  const currentCategoryValue =
    key === "Pollution Control Board"
      ? category
      : key === "Airport Authority"
      ? amendmentStatus
      : "";

  // Find the selected category object
  const selectedCategoryObj = categories.find(cat => 
    cat.id === category || cat.CATEGORY === category || cat.CATEGORY === currentCategoryValue
  );
  
  // Get the category name for comparison
  const selectedCategoryName = selectedCategoryObj?.CATEGORY || currentCategoryValue;

  console.log("DEBUG - For duplicate check:", {
    selectedPlant,
    key,
    selectedCategoryName,
    currentCategoryValue
  });

  // DUPLICATE CHECK - Compare with ALL THREE fields
  const isAlreadyAdded = existingAmendments.some(
    (item) =>
      String(item.LOC || '').trim().toLowerCase() === String(selectedPlant || '').trim().toLowerCase() &&
      String(item.PROCESS || '').trim().toLowerCase() === String(key || '').trim().toLowerCase() &&
      String(item.CATEGORY || '').trim().toLowerCase() === String(selectedCategoryName || '').trim().toLowerCase() &&
      item.STATUS === 'created'
  );

  if (isAlreadyAdded) {
    await Swal.fire({
      icon: "error",
      title: "Already Exists!",
      text: `Plant "${selectedPlant}" with category "${selectedCategoryName}" already exists in "${key}" section.`,
      confirmButtonText: 'OK',
    });

      setSelectedPlant("");
  setCategory("");
  setamendmentStatus("");
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

  if (!confirmation.isConfirmed) return;

  // Payload
  let currentUserName = loggedInUser?.username || "Unknown User";

  const payload = {
    plant: selectedPlant,
    username: currentUserName,
    category: currentCategoryValue,
    process: key,
  };

  try {
    // Show loading
    Swal.fire({
      title: 'Creating...',
      text: 'Please wait while we create the amendment',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const response = await axios.post(`${API_BASE_URL}/amendments`, payload);
    
    // ✅ CRITICAL: Add the newly created amendment to existingAmendments
    const newAmendment = response.data;
    
    // Create a format that matches your existing amendments for duplicate check
    const amendmentForState = {
      LOC: newAmendment.plant || selectedPlant,
      PROCESS: newAmendment.process || key,
      CATEGORY: newAmendment.category || currentCategoryValue,
      STATUS: 'created',
      // Add other fields if needed
      ...newAmendment
    };
    
    // Update state with new amendment
    setExistingAmendments(prev => [...prev, amendmentForState]);
    
    // Also update localStorage
    const updatedAmendments = [...existingAmendments, amendmentForState];
    localStorage.setItem("createdAmendments", JSON.stringify(updatedAmendments));
    
    Swal.close();
    
    const result = await Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Amendment created successfully!",
      showCancelButton: true,
      confirmButtonText: 'Go to Details',
      cancelButtonText: 'Stay Here',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      navigate('/create');
    } else {
      // Reset form
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

//   const handleCreate = async () => {
    

// const categoriesWithString = categories.map(cat => ({
//   ...cat,
//   CATEGORY: String(cat.CATEGORY || '')
// }));

//     const isAlreadyAdded = existingAmendments.some(
//       (item) =>
//         String(item.LOC || '').trim().toLowerCase() === String(selectedPlant || '').trim().toLowerCase() &&
//         String(item.PROCESS || '').trim().toLowerCase() === String(key || '').trim().toLowerCase() &&
//         item.CATEGORY  === String(categoriesWithString[0]?.CATEGORY)  && item.STATUS === 'created'
//     );
//         if (isAlreadyAdded) {
//           await Swal.fire({
//             icon: "error",
//             title: "Already Exists!",
//             text: `Plant "${selectedPlant}" with category" already exists in "${key}" section.`,
//             // showCancelButton: true,
//             // cancelButtonText: 'OK',
//           }).then((result) => {
//             if (result.isConfirmed) {
//               // Navigate to amendments list page
             
//             }
//           });
//           return;
//         }
//     // Validation
//     if (!selectedPlant) {
//       await Swal.fire({
//         icon: "warning",
//         title: "Missing Fields",
//         text: "Please select a Plant",
//       });
//       return;
//     }

//     if (key === "Pollution Control Board" && !category) {
//       await Swal.fire({
//         icon: "warning",
//         title: "Missing Fields",
//         text: "Please select a Category for Pollution Control Board",
//       });
//       return;
//     }

//     if (key === "Airport Authority" && !amendmentStatus) {
//       await Swal.fire({
//         icon: "warning",
//         title: "Missing Fields",
//         text: "Please select Amendment Status",
//       });
//       return;
//     }

//     // Show confirmation dialog
//     const confirmation = await Swal.fire({
//       title: 'Are you sure?',
//       text: `Do you want to create an amendment for ${selectedPlant}?`,
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: 'Yes, create it!',
//       cancelButtonText: 'No, cancel',
//       reverseButtons: true
//     });

//     // If user cancels, return without doing anything
//     if (!confirmation.isConfirmed) {
//       return;
//     }

//     //  --- : 'fetch User';
//     let currentUserName = loggedInUser.username;

//     const payload = {
//       plant: selectedPlant,
//       username: currentUserName,
//       category:
//         key === "Pollution Control Board"
//           ? category
//           : key === "Airport Authority"
//           ? amendmentStatus
//           : null,
//       process: key,
//     };
    
//     console.log("Payload to API:", payload);

//     try {
//       // Show loading indicator
//       Swal.fire({
//         title: 'Creating...',
//         text: 'Please wait while we create the amendment',
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         }
//       });

//       const response = await axios.post(`${API_BASE_URL}/amendments`, payload);
      
//       // Hide loading indicator
//       Swal.close();
      
//       // Show success message
//       const result = await Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Amendment created successfully!",
//         showCancelButton: true,
//         confirmButtonText: 'Go to Details',
//         cancelButtonText: 'Stay Here',
//         reverseButtons: true
//       });

//       // If user clicks "Go to Details", navigate to create page
//       if (result.isConfirmed) {
//         // Navigate to the create page with data
//         // You can pass data via state or query params
//         navigate('/create');
//       } else {
//         // User chose to stay here, you can reset the form if needed
//         setSelectedPlant("");
//         setCategory("");
//         setamendmentStatus("");
//       }
      
//     } catch (err) {
//       console.error(err);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to create amendment.",
//       });
//     }
//   };

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





