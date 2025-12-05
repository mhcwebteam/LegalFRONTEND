



import axios from "axios";
import { API_BASE_URL, API_BASE_URL1, RETURNS_URL } from "../config/Config";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const submitWaterForm = async (formPayload) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/water-submit`,
      formPayload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error submitting water form:", error);
    throw error;
  }
};

export const submitReraForm = async (formPayload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/rera-submit`, formPayload, {
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
    const res = await axios.get(`${API_BASE_URL}/rera`);
    return res.data;
  } catch (err) {
    console.error("Error fetching rera process name:", err);
    throw err;
  }
};

export const fetchWaterDataByPlant = async (selectedPlant) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/water-data?plant=${selectedPlant}`)
    return res.data;
  } catch (err) {
    console.error("Error fetching selected plant data:", err);
    throw err;
  }
}

export const SelectedModifyPlants = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/water-plants`);
    return res.data;
  } catch (err) {
    console.error("Error fetching selected plant data:", err);
    throw err;
  }
}

export const createMaster = async (masterData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/master-submit`,
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
  console.log("locccccccccc", loc);

  try {
    const res = await axios.get(`${API_BASE_URL}/master/${loc}`);
    console.log(res.data.data, "full response");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching master by loc:", error.response?.data || error.message);
    throw error;
  }
};

export const useMasterData = () => {
  return useQuery({
    queryKey: ["masterData"],
    queryFn: async () => {
      try {
        const resp = await axios.get(`${API_BASE_URL}/master`);
        console.log("✅ Fetched Master Data:", resp.data);
        return resp.data;
      } catch (error) {
        console.error("❌ Error fetching master data:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,        
    refetchOnReconnect: true,   
    staleTime: 0,               
    cacheTime: 0,               
  });
};



export const useRefreshGhmcData = () => {
  const queryClient = useQueryClient();
  
  const refreshGhmcData = async () => {
    await queryClient.invalidateQueries(["getAll"]);
    await queryClient.refetchQueries(["getAll"]);
  };
  
  return refreshGhmcData;
};

export const getMasterData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/master`);
    return response.data;
  } catch (error) {
    console.error("Error fetching master data:", error);
    throw error;
  }
};


export const submitFireForm = async (formPayload) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/fire-submit`,
      formPayload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("FIRE API Error:", error);
    throw error;
  }
};


export const getMastercode = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/company-codes`);

    console.log(response?.data?.companyCodes,"hi iam111111111111111111");
    return response.data;
  } catch (error) {
    console.error("Error fetching master data:", error);
    throw error;
  }
};



//--------------------------





