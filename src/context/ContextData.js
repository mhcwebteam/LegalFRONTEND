// src/context/WaterContext.js
import React, { createContext, useEffect, useState } from "react";
import { getMasterData, SelectedModifyPlants } from "../api/Api";

export const Context = createContext();

export const AppProvider = ({ children }) => {
  const [waterData, setWaterData] = useState(null);
  const [formReraData, setFormReraData] = useState(null);
    const [plants, setPlants] = useState([]);
    const [storeData, setStoreData] = useState([]);
    const [respModifyData, setRespModifyData] = useState([]);
    const [masterPostData, setMasterData] = useState(null);
    const [masterGetData, setMasterGetData] = useState([]);
    const [totalMasterData, setTotalMasterData] = useState([]);
const [headerData, setHeaderData] = useState(null);



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
        setTotalMasterData(data);
      } catch (err) {
        console.error("Error loading master data:", err);
      }
    };

    fetchData();
  }, [masterPostData]);



  return (
    <Context.Provider value={{ waterData, setWaterData,
     setFormReraData,formReraData, 
     storeData, setStoreData,
     plants,setRespModifyData,
     respModifyData,masterPostData, setMasterData,masterGetData, setMasterGetData,totalMasterData,setHeaderData,headerData}}>
      {children}
    </Context.Provider>
  );
};
