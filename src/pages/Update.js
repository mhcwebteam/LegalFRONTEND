// import React, { useState } from 'react';
// import CardWithHeader from '../components/CardWithHeader';
// import PcbTabs from '../components/PcbTabs';
// import PollutionTable from '../components/PcbUpdateTable';
// import WaterUpdateTable from '../components/WaterUpdateTable';
// import GhmcUpdate from '../components/GhmcUpdate';
// import AirportUpdateTable from '../components/AirportUpdateTable';
// import FireUpdateTable from '../components/FireUpdateTable';
// import ReraUpdateTable from '../components/ReraUpdateTable';


// const tabList = [
//   'Pollution Control Board',
//   'Airport Authority',
//    'Fire',
//   'HMDA',
//   'Water',
//     'Rera',
//   'Miscellaneous'
// ];

// const Update = () => {
//    const [key, setKey] = useState(tabList[0]);
//   return (
//    <CardWithHeader title="Update Section">

//      <PcbTabs keyState={key} setKey={setKey} tabList={tabList}>
//         {key === 'Pollution Control Board' && <PollutionTable />}
//         {key === 'Airport Authority' && <AirportUpdateTable/>}
//         {key === 'Fire' && <FireUpdateTable/>}
//         {key === 'HMDA' && <GhmcUpdate/>}
        
//         {key === 'Water' && <WaterUpdateTable/>}
//               {key === 'Rera' &&  <ReraUpdateTable/>}
//            {key === 'Miscellaneous' && <p>This is the Miscellaneous tab.</p>}
//       </PcbTabs>
//     </CardWithHeader>
//   );

// };

// export default Update;

import React, { useState, useEffect, useMemo } from 'react';
import CardWithHeader from '../components/CardWithHeader';
import PcbTabs from '../components/PcbTabs';
import PollutionTable from '../components/PcbUpdateTable';
import WaterUpdateTable from '../components/WaterUpdateTable';
import GhmcUpdate from '../components/GhmcUpdate';
import AirportUpdateTable from '../components/AirportUpdateTable';
import FireUpdateTable from '../components/FireUpdateTable';
import ReraUpdateTable from '../components/ReraUpdateTable';
import { API_BASE_URL } from '../config/Config';

const Update = () => {
  // 1. State for Dynamic Tabs
  const [activeTab, setActiveTab] = useState('');
  const [visibleTabLabels, setVisibleTabLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Define Mapping: Backend ID -> Frontend Tab Label & Component
  // The Keys must match the 'id' returned by your Laravel PermissionController
  // The Component is what was originally inside your return statement
  const tabConfig = useMemo(() => ({
    'pollution': { label: 'Pollution Control Board', component: <PollutionTable /> },
    'airport':   { label: 'Airport Authority',       component: <AirportUpdateTable /> },
    'fire':      { label: 'Fire',                    component: <FireUpdateTable /> },
    'hmda':      { label: 'HMDA',                    component: <GhmcUpdate /> },
    'water':     { label: 'Water',                   component: <WaterUpdateTable /> },
    'rera':      { label: 'Rera',                    component: <ReraUpdateTable /> },
    'miscellaneous': { label: 'Miscellaneous',       component: <p>This is the Miscellaneous tab.</p> }
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
        
        // Call the Open Route API
        const response = await fetch(`${API_BASE_URL}/user-permissions?email=${email}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && Array.isArray(data.allowedTabs)) {
            // Filter: Only keep tabs that match the allowed IDs
            const allowedLabels = [];
            
            // Iterate through our config to maintain the defined order
            Object.keys(tabConfig).forEach(backendId => {
                if (data.allowedTabs.includes(backendId)) {
                    allowedLabels.push(tabConfig[backendId].label);
                }
            });

            setVisibleTabLabels(allowedLabels);

            // Set the first tab as active automatically if we have tabs
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

  // 4. Helper to render the correct component based on the active label
  const renderActiveComponent = () => {
    const configEntry = Object.values(tabConfig).find(cfg => cfg.label === activeTab);
    return configEntry ? configEntry.component : null;
  };

  return (
   <CardWithHeader title="Update Section">
     {loading ? (
        <div style={{ padding: '20px', color: 'white' }}>Loading permissions...</div>
     ) : visibleTabLabels.length > 0 ? (
        <PcbTabs 
          keyState={activeTab} 
          setKey={setActiveTab} 
          tabList={visibleTabLabels}
        >
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

export default Update;