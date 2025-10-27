// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const PlantSelect = ({ value, onChange, required = true, className}) => {
//   const [plants, setPlants] = useState([]);

//   useEffect(() => {
//     axios.get("http://192.168.8.91:8084/inactive/phpapi/plant_api.php")
//       .then(res => {
//         setPlants(res.data)
//         // console.log(plants);
//   })
//       .catch(err => console.error("Failed to fetch plant data", err));
//   }, []);

//   return (
//     <select
//       name="loc"
//       value={value}
//       onChange={onChange}
//       required={required}
//       className={className}
//       //  style={{ border: "2px solid #0d6efd" }} 
//     >
//       <option value="">Select Plant</option>
//       {plants.map((plant, idx) => (
//         <option key={idx} value={plant.PLANT_NAME}>
//           {plant.PLANT_NAME}
//         </option>
//       ))}
//     </select>
//   );
// };

// export default PlantSelect;


import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Context } from '../context/ContextData';


const PlantSelect = ({ value, onChange, required = true, className}) => {

      const {plants} = useContext(Context);

  const [plantsData, setPlantsData] = useState([]);


  useEffect(() => {
    axios.get("http://192.168.8.91:8084/inactive/phpapi/plant_api.php")
      .then(res => {
        setPlantsData(res.data)
       console.log(res.data,"tuytuyty");
  })
      .catch(err => console.error("Failed to fetch plant data", err));
  }, []);

 const availablePlants = plantsData.filter(
  (plant) => !plants.some((sel) => sel.loc === plant.PLANT_NAME)
);
  
  return (
    <select
      name="loc"
      value={value}
      onChange={onChange}
      required={required}
      className={className}
      //  style={{ border: "2px solid #0d6efd" }} 
    >
      <option value="">Select Plant</option>
      {availablePlants?.map((plants, idx) => (
        <option key={idx} value={plants.PLANT_NAME}>
          {plants.PLANT_NAME}
        </option>
      ))}
    </select>
  );
};

export default PlantSelect;
