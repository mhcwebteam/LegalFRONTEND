// // src/context/WaterContext.js
import React, { createContext, useEffect, useState } from "react";
import { getMastercode, getMasterData, getReturns, SelectedModifyPlants, useGhmcAll, useMasterData, useSelectedPlant } from "../api/Api";
import { API_BASE_URLS } from "../config/Config";
import axios from "axios";

export const Context = createContext(
  {
  selectPlant: [],

}
);

export const AppProvider = ({ children }) => {
  const [waterData, setWaterData] = useState(null);
  const [formReraData, setFormReraData] = useState(null);
    const [plants, setPlants] = useState([]);
    const [storeData, setStoreData] = useState([]);
    const [respModifyData, setRespModifyData] = useState([]);
    const [masterPostData, setMasterData] = useState(null);
    
    const [masterGetData, setMasterGetData] = useState([]);
    const [totalMasterData, setTotalMasterData] = useState([]);
        const [totalMasterCode, setTotalMasterCode] = useState([]);

const [headerData, setHeaderData] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState("");

  // const {
  //   data: selectedPlants,
  // } = useSelectedPlant(selectedPlant);



const { data: masterData, isLoading, error ,  refetch: refetchGhmcData} = useMasterData();
//  const { data: totalGhmcData, loading} =  useGhmcAll();


useEffect(() => {
  async function fetchPlants() {
    const data = await SelectedModifyPlants();
    setPlants(data);
  }
  fetchPlants();
}, [waterData]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMasterData();
        console.log(data, "API Response");
        setTotalMasterData(data);
      } catch (err) {
        console.error("Error loading master data:", err);
      }
    };

    fetchData();
  }, [masterPostData]);






  useEffect(() => {
    const fetchMastercode = async () => {
      try {
        const data = await getMastercode();
        setTotalMasterCode(data);
      } catch (err) {
        console.error("Error loading master data:", err);
      }
    };

    fetchMastercode();
  }, []);


  return (
    <Context.Provider value={{ waterData, setWaterData,
     setFormReraData,formReraData, 
     storeData, setStoreData,
     plants,setRespModifyData,selectedPlant, setSelectedPlant,masterData,
      totalMasterCode, setTotalMasterCode,
     respModifyData,masterPostData, setMasterData,masterGetData, setMasterGetData,totalMasterData,setHeaderData,headerData}}>
      {children}
    </Context.Provider>
  );
};



// src/context/WaterContext.js
// import React, { createContext, useEffect, useState } from "react";
// import {
//   SelectedModifyPlants,
//   useGhmcAll,
//   useMasterData,
//   useSelectedPlant,
// } from "../api/Api";
// import axios from "axios";
// import { API_BASE_URLS } from "../config/Config";

// export const Context = createContext({
//   selectPlant: [],
// });

// export const AppProvider = ({ children }) => {
//   const [waterData, setWaterData] = useState(null);
//   const [formReraData, setFormReraData] = useState(null);
//   const [plants, setPlants] = useState([]);
//   const [storeData, setStoreData] = useState([]);
//   const [respModifyData, setRespModifyData] = useState([]);
//   const [masterPostData, setMasterData] = useState(null);
//   const [masterGetData, setMasterGetData] = useState([]);
//   const [totalMasterData, setTotalMasterData] = useState([]);
//   const [headerData, setHeaderData] = useState(null);
//   const [selectedPlant, setSelectedPlant] = useState("");

//   // ✅ React Query hooks
//   const {
//     data: masterData,
//     isLoading: masterLoading,
//     error: masterError,
//   } = useMasterData();





//   const {
//     data: totalGhmcData,
//     isLoading: ghmcLoading,
//     error: ghmcError,
//   } = useGhmcAll();



//   useEffect(() => {
//     async function fetchPlants() {
//       const data = await SelectedModifyPlants();
//       setPlants(data);
//     }
//     fetchPlants();
//   }, [waterData]);

//   // ✅ Combine all loading & error states for easy access
//   const isLoading = masterLoading || ghmcLoading;
//   const hasError = masterError || ghmcError;

//   return (
//     <Context.Provider
//       value={{
//         // data
//         waterData,
//         formReraData,
//         storeData,
//         plants,
//         respModifyData,
//         masterData,
//         totalGhmcData,
//         masterPostData,
//         masterGetData,
//         totalMasterData,
//         headerData,
//         selectedPlant,

//         // setters
//         setWaterData,
//         setFormReraData,
//         setStoreData,
//         setRespModifyData,
//         setMasterData,
//         setMasterGetData,
//         setHeaderData,
//         setSelectedPlant,

//         // loading & error
//         isLoading,
//         hasError,
//       }}
//     >
//       {children}
//     </Context.Provider>
//   );
// };


// import React, { createContext, useEffect, useState } from "react";
// import {
//   SelectedModifyPlants,
//   useGhmcAll,
//   useMasterData,
//   useRefreshGhmcData,
// } from "../api/Api";
// import axios from "axios";
// import { API_BASE_URLS } from "../config/Config";

// export const Context = createContext({
//   selectPlant: [],
// });

// export const AppProvider = ({ children }) => {
//   const [waterData, setWaterData] = useState(null);
//   const [formReraData, setFormReraData] = useState(null);
//   const [plants, setPlants] = useState([]);
//   const [storeData, setStoreData] = useState([]);
//   const [respModifyData, setRespModifyData] = useState([]);
//   const [masterPostData, setMasterData] = useState(null);
//   const [masterGetData, setMasterGetData] = useState([]);
//   const [totalMasterData, setTotalMasterData] = useState([]);
//   const [headerData, setHeaderData] = useState(null);
//   const [selectedPlant, setSelectedPlant] = useState("");

//   // ✅ React Query hooks
//   const {
//     data: masterData,
//     isLoading: masterLoading,
//     error: masterError,
//   } = useMasterData();

//   const {
//     data: totalGhmcData,
//     isLoading: ghmcLoading,
//     error: ghmcError,
//     refetch: refetchGhmcData, // ✅ Get refetch function
//   } = useGhmcAll();


//   const refreshGhmcData = useRefreshGhmcData();

//   useEffect(() => {
//     async function fetchPlants() {
//       const data = await SelectedModifyPlants();
//       setPlants(data);
//     }
//     fetchPlants();
//   }, [waterData]);

//   // ✅ Combine all loading & error states for easy access
//   const isLoading = masterLoading || ghmcLoading;
//   const hasError = masterError || ghmcError;

//   return (
//     <Context.Provider
//       value={{
//         // data
//         waterData,
//         formReraData,
//         storeData,
//         plants,
//         respModifyData,
//         masterData,
//         totalGhmcData,
//         masterPostData,
//         masterGetData,
//         totalMasterData,
//         headerData,
//         selectedPlant,

//         // setters
//         setWaterData,
//         setFormReraData,
//         setStoreData,
//         setRespModifyData,
//         setMasterData,
//         setMasterGetData,
//         setHeaderData,
//         setSelectedPlant,
//         refreshGhmcData,
//         refetchGhmcData,

//         // loading & error
//         isLoading,
//         hasError,
//       }}
//     >
//       {children}
//     </Context.Provider>
//   );
// };