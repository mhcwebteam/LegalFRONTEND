import axios from "axios";
import {  API_BASE_URLS } from "../config/Config";

export const submitWaterForm = async (formPayload) => {

  try {
    const response = await axios.post(
      `${API_BASE_URLS}/water-submit`,
      formPayload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log(response,"resp!!!!!!!!!!!!!!!!!!!!!!!!");
    return response.data;
  } catch (error) {
    console.error("Error submitting water form:", error);
    throw error;
  }
};
   export const submitReraForm = async (formPayload) => {
    try {
      const response = await axios.post(`${API_BASE_URLS}/rera-data`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('RERA API Error:', error);
      throw error;
    }
  };
  
   export const ReragetMethod = async () => {
      try {
        const res = await axios.get(`${API_BASE_URLS}/rera`);
         return res.data;
        
      } catch (err) {
        console.error("Error fetching rera process name:", err);
            throw err;
      }
    };
 

    export const fetchWaterDataByPlant =  async (selectedPlant)  => {
      
      try {
        const res = await axios.get(
      `${API_BASE_URLS}/water-data?plant=${selectedPlant}`)
      return res.data;
  }
     catch (err) {
        console.error("Error fetching selected plant data:", err);
            throw err;
      }

      }

      export const SelectedModifyPlants =  async ()   => {

              try {
        const res =  await axios
      .get(`${API_BASE_URLS}/water-plants`);


      
      return res.data;
  }
     catch (err) {
        console.error("Error fetching selected plant data:", err);
            throw err;
      }
 
      }


  export const createMaster = async (masterData) => {

  try {
        const response = await axios.post(
      `${API_BASE_URLS}/master-submit`,
     masterData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response?.data;
  } catch (error) {
    console.error("Error creating master:", error.response?.data || error.message);
    throw error;
  }
};

export const getMasterByLoc = async (loc) => {
console.log(loc)
  try {
    const res = await axios.get(`${API_BASE_URLS}/master/${loc}`);
    console.log(res.data.data, "full response");


      return res.data.data; 
 
  } catch (error) {
    console.error("Error fetching master by loc:", error.response?.data || error.message);
    throw error;
  }
};

export const getMasterData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URLS}/master`);
    console.log("ResponseDaa:",response);
    return response.data;
  } catch (error) {
    console.error("Error fetching master data:", error);
    throw error;
  }
};
