// import React, { useState } from 'react';
// import CardWithHeader from '../components/CardWithHeader';
// import PcbTabs from '../components/PcbTabs';
// import PollutionTable from '../components/PcbModifyTable';
// import AirportModifyTable from "../components/AirportModifyTable"
// import WaterModifyTable from '../components/WaterModifyTable';
// import GhmcModify from '../components/GhmcModify';
// import FireModifyTable from '../components/FireModifyTable';
// import ReraModifyTable from '../components/ReraModifyTable';

////const tabList = [
//   'Pollution Control Board',
//   'Airport Authority',
//    'Fire',
//   'HMDA',
//   'Water',
//    'Rera',
//   'Miscellaneous',
// ];

// //const Modify = () => {
//  // const [key, setKey] = useState(tabList[0]);

//   return (
//    / <CardWithHeader title="Modify Section">
//    //   <PcbTabs keyState={key} setKey={setKey} tabList={tabList}>
//         //{key === 'Pollution Control Board' && <PollutionTable />}
//         //{key === 'Airport Authority' && <AirportModifyTable />}
//        // {key === 'Fire' &&  <FireModifyTable />}
//         //   {key === 'HMDA' && <GhmcModify/>}
//        // {key === 'Water' && <WaterModifyTable/>}
//       //  {key === 'Rera' &&  <ReraModifyTable/>}
//       //  {key === 'Miscellaneous' && <p>This is the miscellaneous tab.</p>}


//       </PcbTabs>
//     </CardWithHeader>
//   );
// };

// export default// //Modify;


import React, { useState, useEffect, useMemo } from 'react';
import CardWithHeader from '../components/CardWithHeader';
import PcbTabs from '../components/PcbTabs';
import PollutionTable from '../components/PcbModifyTable';
import AirportModifyTable from "../components/AirportModifyTable";
import WaterModifyTable from '../components/WaterModifyTable';
import GhmcModify from '../components/GhmcModify';
import FireModifyTable from '../components/FireModifyTable';
import ReraModifyTable from '../components/ReraModifyTable';
import { API_BASE_URL } from '../config/Config'; // Ensure this import exists

const Modify = () => {
  // 1. State for Dynamic Tabs
  const [activeTab, setActiveTab] = useState('');
  const [visibleTabLabels, setVisibleTabLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Define Mapping: Backend ID -> Frontend Tab Label
  // The Keys must match the 'id' returned by your Laravel PermissionController
  const tabConfig = useMemo(() => ({
    'pollution': { label: 'Pollution Control Board', component: <PollutionTable /> },
    'airport':   { label: 'Airport Authority',       component: <AirportModifyTable /> },
    'fire':      { label: 'Fire',                    component: <FireModifyTable /> },
    'hmda':      { label: 'HMDA',                    component: <GhmcModify /> },
    'water':     { label: 'Water',                   component: <WaterModifyTable /> },
    'rera':      { label: 'Rera',                    component: <ReraModifyTable /> },
    'miscellaneous': { label: 'Miscellaneous',       component: <p>This is the miscellaneous tab.</p> }
  }), []);

  // 3. Fetch User Permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      // Get User from LocalStorage
      let currentUser = null;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
        }
      } catch (e) {
        console.error("Error parsing user:", e);
      }

      // Extract Email (Case Insensitive Check)
      const email = currentUser?.Email || currentUser?.email || currentUser?.EMAIL;

      if (!email) {
        console.warn("No email found, cannot load permissions.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Call the same Open Route API
        const response = await fetch(`${API_BASE_URL}/user-permissions?email=${email}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && Array.isArray(data.allowedTabs)) {
            // Filter: Only keep tabs that match the allowed IDs
            const allowedLabels = [];
            
            // We iterate through our config to maintain the order (Pollution -> Airport -> etc)
            Object.keys(tabConfig).forEach(backendId => {
                if (data.allowedTabs.includes(backendId)) {
                    allowedLabels.push(tabConfig[backendId].label);
                }
            });

            setVisibleTabLabels(allowedLabels);

            // Set the first tab as active automatically
            if (allowedLabels.length > 0) {
              setActiveTab(allowedLabels[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [tabConfig]);

  // 4. Helper to render the correct component based on the Label string
  const renderActiveComponent = () => {
    // Find the config entry where the label matches the activeTab
    const configEntry = Object.values(tabConfig).find(cfg => cfg.label === activeTab);
    return configEntry ? configEntry.component : null;
  };

  return (
    <CardWithHeader title="Modify Section">
      {loading ? (
        <div style={{ padding: '20px', color: 'white' }}>Loading permissions...</div>
      ) : visibleTabLabels.length > 0 ? (
        <PcbTabs 
          keyState={activeTab} 
          setKey={setActiveTab} 
          tabList={visibleTabLabels}
        >
          {/* Render the component dynamically */}
          {renderActiveComponent()}
        </PcbTabs>
      ) : (
        <div style={{ padding: '20px', color: 'white' }}>
           No permissions assigned or User not found.
        </div>
      )}
    </CardWithHeader>
  );
};

export default Modify;