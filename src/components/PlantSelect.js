


import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Context } from '../context/ContextData';
import { API_BASE_URL } from '../config/Config';

const PlantSelect = ({ 
  value, 
  onChange, 
  selectedPlantCode, 
  required = true, 
  className,
  disabled = false 
}) => {
  const { plants } = useContext(Context);
  const [plantsData, setPlantsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if plantCode is selected
    if (!selectedPlantCode) {
      setPlantsData([]);
      return;
    }

    const fetchPlants = async () => {


      try {
        setLoading(true);
        setError(null);
        
        // ✅ Pass plant code as query parameter
             const res = await axios.get(`${API_BASE_URL}/getDependPlant/${selectedPlantCode}`);
        
        console.log(res.data, "API Response for plant code:", selectedPlantCode);
        
        // Handle the response based on your API structure
        if (res.data.plants) {
          setPlantsData(res.data.plants);
        } else if (Array.isArray(res.data)) {
          setPlantsData(res.data);
        }
        
      } catch (err) {
        console.error("Failed to fetch plant data", err);
        setError(err.message);
        setPlantsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [selectedPlantCode]); // Re-fetch when selectedPlantCode changes

  return (
    <select
      name="loc"
      value={value}
      onChange={onChange}
      required={required}
      className={className}
      disabled={disabled || loading || !selectedPlantCode}
      style={{ width: "300px" , marginTop:"3px"}}

    >
      <option value="">
        {!selectedPlantCode 
          ? "Select plant code first" 
          : loading 
          ? "Loading plants..." 
          : "Select Plant"}
      </option>
      {error && (
        <option value="" disabled>
          Error loading plants
        </option>
      )}
      {plantsData?.map((plant, idx) => (
        <option className='' key={idx} value={plant.plant_name || plant.PLANT_NAME}>
          {plant.plant_name || plant.PLANT_NAME}
        </option>
      ))}
    </select>
  );
};

export default PlantSelect;