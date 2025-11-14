// import axios from "axios";
// import { API_BASE_URLS } from "../config/Config";
// import { useQuery } from "@tanstack/react-query";

// export const submitWaterForm = async (formPayload) => {

//   try {
//     const response = await axios.post(
//       `${API_BASE_URLS}/water-submit`,
//       formPayload,
//       {
//         headers: { "Content-Type": "multipart/form-data" },
//       }
//     );

//     console.log(response, "resp!!!!!!!!!!!!!!!!!!!!!!!!");
//     return response.data;
//   } catch (error) {
//     console.error("Error submitting water form:", error);
//     throw error;
//   }
// };
// export const submitReraForm = async (formPayload) => {
//   try {
//     const response = await axios.post(`${API_BASE_URLS}/rera-data`, formPayload, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.error('RERA API Error:', error);
//     throw error;
//   }
// };

// export const ReragetMethod = async () => {
//   try {
//     const res = await axios.get(`${API_BASE_URLS}/rera`);
//     return res.data;

//   } catch (err) {
//     console.error("Error fetching rera process name:", err);
//     throw err;
//   }
// };


// export const fetchWaterDataByPlant = async (selectedPlant) => {

//   try {
//     const res = await axios.get(
//       `${API_BASE_URLS}/water-data?plant=${selectedPlant}`)
//     return res.data;
//   }
//   catch (err) {
//     console.error("Error fetching selected plant data:", err);
//     throw err;
//   }

// }

// export const SelectedModifyPlants = async () => {

//   try {
//     const res = await axios
//       .get(`${API_BASE_URLS}/water-plants`);



//     return res.data;
//   }
//   catch (err) {
//     console.error("Error fetching selected plant data:", err);
//     throw err;
//   }

// }


// export const createMaster = async (masterData) => {

//   try {
//     const response = await axios.post(
//       `${API_BASE_URLS}/master-submit`,
//       masterData,
//       {
//         headers: { "Content-Type": "multipart/form-data" },
//       }
//     );

//     return response?.data;
//   } catch (error) {
//     console.error("Error creating master:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export const getMasterByLoc = async (loc) => {
//   console.log(loc)
//   try {
//     const res = await axios.get(`${API_BASE_URLS}/master/${loc}`);
//     console.log(res.data.data, "full response");


//     return res.data.data;

//   } catch (error) {
//     console.error("Error fetching master by loc:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export const useMasterData = () => {
//   return useQuery({
//     queryKey: ["masterData"],
//     queryFn: async () => {
//       try {
//         const resp = await axios.get(`${API_BASE_URLS}/master`);
//         console.log("✅ Fetched Master Data:", resp.data);
//         return resp.data;
//       } catch (error) {
//         console.error("❌ Error fetching master data:", error);
//         throw error;
//       }
//     },
//     refetchOnWindowFocus: true,
//     refetchOnMount: true,        
//     refetchOnReconnect: true,   
//     staleTime: 0,               
//     cacheTime: 0,               
//   });
// };



// export const useGhmcAll = () => {
//   return useQuery({
//     queryKey: ["getAll"],
//     queryFn: async () => {
//       try {
//         const resp = await axios.get(`${API_BASE_URLS}/get-all`);
//         console.log("Fetched ghmc Data:", resp.data);
//         return resp.data;
//       } catch (error) {
//         console.error("❌ Error fetching ghmc data:", error);
//         throw error;
//       }
//     }               
//   });
// };

// // export const useSelectedPlant = (selectedPlant) => {
// //   console.log(selectedPlant,"selectplant");
// //   return useQuery({
// //     queryKey: ["plant", selectedPlant],
// //     queryFn: async () => {
// //       try {
// //         const resp = await axios.get(`${API_BASE_URLS}/GHMC-data?plant=${selectedPlant}`);
// //         console.log(" Fetched Plant Data:", resp.data);
// //         return resp.data;
// //       } catch (error) {
// //         console.error("❌ Error fetching selected plant data:", error);
// //         throw error;
// //       }
// //     },
// //     enabled: !!selectedPlant,
// //   });
// // };




import axios from "axios";
import { API_BASE_URL, API_BASE_URL1, API_BASE_URLS, RETURNS_URL } from "../config/Config";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const submitWaterForm = async (formPayload) => {
  try {
    const response = await axios.post(
      `${API_BASE_URLS}/water-submit`,
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
    const res = await axios.get(`${API_BASE_URLS}/rera`);
    return res.data;
  } catch (err) {
    console.error("Error fetching rera process name:", err);
    throw err;
  }
};

export const fetchWaterDataByPlant = async (selectedPlant) => {
  try {
    const res = await axios.get(
      `${API_BASE_URLS}/water-data?plant=${selectedPlant}`)
    return res.data;
  } catch (err) {
    console.error("Error fetching selected plant data:", err);
    throw err;
  }
}

export const SelectedModifyPlants = async () => {
  try {
    const res = await axios.get(`${API_BASE_URLS}/water-plants`);
    return res.data;
  } catch (err) {
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

  try {
    const res = await axios.get(`${API_BASE_URLS}/master/${loc}`);
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
        const resp = await axios.get(`${API_BASE_URLS}/master`);
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

export const useGhmcAll = () => {
  return useQuery({
    queryKey: ["getAll"],
    queryFn: async () => {
      try {
        const resp = await axios.get(`${API_BASE_URLS}/get-all`);
        console.log("Fetched ghmc Data:", resp.data);
        return resp.data;
      } catch (error) {
        console.error("❌ Error fetching ghmc data:", error);
        throw error;
      }
    },
    // ✅ Add these to ensure fresh data
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
    const response = await axios.get(`${API_BASE_URLS}/master`);
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
    const response = await axios.get(`${API_BASE_URL1}`);

    console.log(response?.data?.companyCodes,"hi iam");
    return response.data;
  } catch (error) {
    console.error("Error fetching master data:", error);
    throw error;
  }
};



//--------------------------





