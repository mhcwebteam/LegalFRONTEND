

// import React, {useEffect, useState} from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Create.css';
// import {TabIcons, TabLabels} from '../components/TabIcons';

// const Create = () => {
//   const navigate = useNavigate();

//    const [selectedPlant, setSelectedPlant] = useState('');
//    // Get token and user from localStorage
//   const token = localStorage.getItem('token');
//   const user = JSON.parse(localStorage.getItem('user'));

//   // Optional: redirect if not logged in
//   // useEffect(() => {
//   //   if (!token) {
//   //     navigate('/login');
//   //   }
//   // }, [navigate, token]);

//  const tabs = [
//   {
//       icon: TabIcons.masterproject,  
//       label: TabLabels.masterproject,      
//       route: '/create/masterproject',
//       gradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
//       hoverGradient: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)'
//     },
//   { 
//     icon: TabIcons.pollution, 
//     label: TabLabels.pollution, 
//     route: '/create/pollution',
//     gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     hoverGradient: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
//   },
//   { 
//     icon: TabIcons.airport, 
//     label: TabLabels.airport, 
//     route: '/create/airport',
//     gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
//     hoverGradient: 'linear-gradient(135deg, #e879f9 0%, #ef4444 100%)'
//   },
//   { 
//     icon: TabIcons.hmda, 
//     label: TabLabels.hmda, 
//     route: '/create/hmda',
//     gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
//     hoverGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
//   },
//   { 
//     icon: TabIcons.fire, 
//     label: TabLabels.fire, 
//     route: '/create/fire',
//     gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
//     hoverGradient: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)'
//   },
//   { 
//     icon: TabIcons.water,
//     label: TabLabels.water, 
//     route: '/create/water',
//     gradient: 'linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%)',
//     hoverGradient: 'linear-gradient(135deg, #5eead4 0%, #0284c7 100%)'
//   },
//     {
//     icon: TabIcons.rera,  
//     label: TabLabels.rera,             
//     route: '/create/rera',
//     gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',  
//     hoverGradient: 'linear-gradient(135deg, #fb7185 0%, #fbbf24 100%)'
//   },
//   {
//     icon: TabIcons.miscellaneous,
//     label: TabLabels.miscellaneous,
//     route: '/create/miscellaneous',
//     gradient: 'linear-gradient(135deg, #a18cd1 0%, #d57abcff 100%)',  
//     hoverGradient: 'linear-gradient(135deg, #c084fc 0%, #eb99c3ff 100%)'
//   }

// ];

// // added on 05-11-2025 start from here
//  // Mock data for status updates
//   const statusUpdates = [
//      {
//       type: 'Pollution Control Board',
//       icon: '🌱',
//       title: 'PCB Process',
//       project: 'Tech Park Phase 2',
//       step:2,
//       status: 'UNDER REVIEW',
//       statusColor: '#3b82f6',
//       time: '3 days ago',
//       borderColor: '#667eea'
//     },
//     {
//       type: 'Airport Authority',
//       icon: '✈️',
//       title: 'Airport Process',
//       project: 'Vertex Commercial Complex',
//       applicationId: 'AAI/2025/3456',
//       documentsCount: 1,
//       status: 'PENDING',
//       statusColor: '#f59e0b',
//       time: '1 week ago',
//       borderColor: '#f093fb'
//     },
//     {
      
//       type: 'HMDA/GHMC',
//       icon: '🏢',
//       title: 'HMDA Process',
//       project: 'Grava Residencies Block-A',
//       applicationId: 'HMDA/2025/4521',
//       documentsCount: 3,
//       status: 'PENDING',
//       statusColor: '#f59e0b',
//       time: '2 hours ago',
//       borderColor: '#4facfe'
//     },
//     {
   
//       type: 'Fire',
//       icon: '🔥',
//       title: 'Fire Process',
//       project: 'Downtown Heights',
//       applicationId: 'FIRE/2025/8934',
//       documentsCount: 4,
//       status: 'APPROVED',
//       statusColor: '#10b981',
//       time: '1 day ago',
//       borderColor: '#fa709a'
//     },
//     {
    
//       type: 'Water',
//       icon: '💧',
//       title: 'Water Process',
//       project: 'Green Valley Apartments',
//       applicationId: 'WATER/2025/7823',
//       documentsCount: 2,
//       status: 'REJECTED',
//       statusColor: '#ef4444',
//       time: '4 days ago',
//       borderColor: '#6dd5ed'
//     },
//     {
 
//       type: 'RERA',
//       icon: '🏛️',
//       title: 'RERA Process',
//       project: 'Prime Properties Phase-1',
//       applicationId: 'RERA/2025/9012',
//       documentsCount: 6,
//       status: 'UNDER REVIEW',
//       statusColor: '#3b82f6',
//       time: '2 weeks ago',
//       borderColor: '#ff9a9e'
//     }
   
//   ];

//   const plants = ['All Plants', 'Plant A', 'Plant B', 'Plant C', 'Plant D'];
// //added to here 05-11-2025 end
//   return (
// <div className="create-page">
//   <h2 className="title">Create Approvals</h2>

//   <div className="main-layout">
//     {/* Left Side: Tabs */}
//     <div className="tab-container">
//       {tabs.map((tab, index) => (
//         <div
//           key={index}
//           className="tab-card"
//           onClick={() => navigate(tab.route)}
//           style={{
//             background: tab.gradient,
//             '--hover-gradient': tab.hoverGradient,
//             animationDelay: `${index * 0.2}s`
//           }}
//         >
//           <div className="tab-icon">{tab.icon}</div>
//           <div className="tab-label">{tab.label}</div>
//         </div>
//       ))}
//     </div>

//      <div className="notifications-panel">
//           <div className="notifications-header">
//             <div className="header-title">
//               <span className="status-icon">📊</span>
//               <h3>Status Updates</h3>
//               <span className="notification-badge">{statusUpdates.length}</span>
//             </div>
//           </div>

//           <div className="plant-dropdown">
//             <select 
//               value={selectedPlant} 
//               onChange={(e) => setSelectedPlant(e.target.value)}
//               className="plant-select"
//             >
//               <option value="">Select Plant</option>
//               {plants.map((plant, index) => (
//                 <option key={index} value={plant}>{plant}</option>
//               ))}
//             </select>
//           </div>

//           <div className="status-updates-list">
//             {statusUpdates.map((update, index) => (
//               <div 
//                 key={index} 
//                 className="status-card"
//                 style={{
//                   borderLeftColor: update.borderColor,
//                   animationDelay: `${index * 0.1}s`
//                 }}
//               >
//                 <div className="status-card-header">
//                   <span className="status-type-icon">{update.icon}</span>
//                   <h4>{update.title}</h4>
//                 </div>
                
//                 <div className="status-card-body">
//                   <p className="project-name"><strong>Project:</strong> {update.project}</p>
//                   <p className="application-id"><strong>Step:</strong> {update.step}</p>
//                   <p className="application-id"><strong>Comments:</strong> {update.comments}</p>
//                   <p className="application-id"><strong>Date:</strong> {update.date}</p>
//                   {/* {update.documentsCount && (
//                     <div className="documents-pending">
//                       <span className="doc-badge">{update.documentsCount}</span>
//                       <span>documents pending review</span>
//                     </div>
//                   )} */}
                  
//                   {update.message && (
//                     <div className="status-message">
//                       <span className="check-icon">✓</span>
//                       <span>{update.message}</span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="status-card-footer">
//                   <span 
//                     className="status-badge"
//                     style={{ backgroundColor: update.statusColor }}
//                   >
//                     {update.status}
//                   </span>
//                   <span className="status-time">{update.time}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//   </div>

//   {/* added on 5/11/2025 */}
//      {/* Right Side: Notifications */}
     
          

// </div>

//   );
// };

// export default Create;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Create.css';
import { TabIcons, TabLabels } from '../components/TabIcons';
import { API_BASE_URL } from '../config/Config';

const Create = () => {
  const navigate = useNavigate();
  const [selectedProcess, setSelectedProcess] = useState('All Processes');
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maximizedGroup, setMaximizedGroup] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch status updates from backend
  const fetchStatusUpdates = async (process = 'All Processes') => {
    try {
      setLoading(true);
      setError(null);

      let allData = [];

      if (process === 'All Processes') {
        const endpoints = [
          `${API_BASE_URL}/status-updates`,
          `${API_BASE_URL}/airport-status-updates`,
          `${API_BASE_URL}/ghmc-status-updates`,
          `${API_BASE_URL}/fire-status-updates`,
          `${API_BASE_URL}/water-status-updates`,
          `${API_BASE_URL}/rera-status-updates`,
        ];

        const promises = endpoints.map(url =>
          fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.json())
        );

        const results = await Promise.all(promises);

        results.forEach(data => {
          if (data.success && Array.isArray(data.data)) {
            allData = [...allData, ...data.data];
          }
        });

        setStatusUpdates(allData);
      } else {
        let url = '';

        if (process === 'Airport Authority') {
          url = `${API_BASE_URL}/airport-status-updates`;
        } else if (process === 'RERA') {
          url = `${API_BASE_URL}/rera-status-updates`;
        } else if (process === 'Water') {
          url = `${API_BASE_URL}/water-status-updates`;
        } else if (process === 'Pollution Control Board') {
          console.log('process',process);
          url = `${API_BASE_URL}/status-updates`;
        } else if (process === 'HMDA/GHMC') {
          url = `${API_BASE_URL}/ghmc-status-updates`;
        }else if (process === 'Fire') {
  url = `${API_BASE_URL}/fire-status-updates`;
} else {
          url = `${API_BASE_URL}/status-updates?process=${encodeURIComponent(process)}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch status updates');
        }

        const data = await response.json();

        if (data.success) {
          setStatusUpdates(data.data);
        } else {
          setError(data.message || 'Failed to load status updates');
        }
      }
    } catch (err) {
      console.error('Error fetching status updates:', err);
      setError('Unable to load status updates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusUpdates('All Processes');
  }, [token]);

  const handleProcessChange = (e) => {
    const process = e.target.value;
    setSelectedProcess(process);
    fetchStatusUpdates(process);
  };

  const displayedUpdates = statusUpdates;

  const groupedUpdates = displayedUpdates.reduce((acc, update) => {
    const processType = update.title;
    if (!acc[processType]) {
      acc[processType] = [];
    }
    acc[processType].push(update);
    return acc;
  }, {});

  const tabs = [
    {
      icon: TabIcons.masterproject,
      label: TabLabels.masterproject,
      route: '/create/masterproject',
      gradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
      hoverGradient: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)'
    },
    {
      icon: TabIcons.pollution,
      label: TabLabels.pollution,
      route: '/create/pollution',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      hoverGradient: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
    },
    {
      icon: TabIcons.airport,
      label: TabLabels.airport,
      route: '/create/airport',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      hoverGradient: 'linear-gradient(135deg, #e879f9 0%, #ef4444 100%)'
    },
    {
      icon: TabIcons.hmda,
      label: TabLabels.hmda,
      route: '/create/Ghmc',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      hoverGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
    },
    {
      icon: TabIcons.fire,
      label: TabLabels.fire,
      route: '/create/fire',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      hoverGradient: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)'
    },
    {
      icon: TabIcons.water,
      label: TabLabels.water,
      route: '/create/water',
      gradient: 'linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%)',
      hoverGradient: 'linear-gradient(135deg, #5eead4 0%, #0284c7 100%)'
    },
    {
      icon: TabIcons.rera,
      label: TabLabels.rera,
      route: '/create/rera',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      hoverGradient: 'linear-gradient(135deg, #fb7185 0%, #fbbf24 100%)'
    },
    {
      icon: TabIcons.miscellaneous,
      label: TabLabels.miscellaneous,
      route: '/create/miscellaneous',
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #d57abcff 100%)',
      hoverGradient: 'linear-gradient(135deg, #c084fc 0%, #eb99c3ff 100%)'
    }
  ];

  const processTypes = [
    'All Processes',
    'Pollution Control Board',
    'Airport Authority',
    'HMDA/GHMC',
    'Fire',
    'Water',
    'RERA'
  ];

  return (
    <div className="create-page">
      <h2 className="title">Create Approvals</h2>

      <div className="main-layout">
        {/* Left Side: Tabs */}
        <div className="tab-container">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="tab-card"
              onClick={() => navigate(tab.route)}
              style={{
                background: tab.gradient,
                '--hover-gradient': tab.hoverGradient,
                animationDelay: `${index * 0.2}s`
              }}
            >
              <div className="tab-icon">{tab.icon}</div>
              <div className="tab-label">{tab.label}</div>
            </div>
          ))}
        </div>

        {/* Right Side: Status Updates */}
        <div className="notifications-panel">
          <div className="notifications-header">
            <div className="header-title">
              <span className="status-icon">📊</span>
              <h3>Status Updates</h3>
              <span className="notification-badge">{displayedUpdates.length}</span>
            </div>
          </div>

          <div className="plant-dropdown">
            <select
              value={selectedProcess}
              onChange={handleProcessChange}
              className="plant-select"
            >
              {processTypes.map((process, index) => (
                <option key={index} value={process}>{process}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="status-loading">
              <div className="loading-spinner"></div>
              <p>Loading status updates...</p>
            </div>
          ) : error ? (
            <div className="status-error">
              <p>⚠️ {error}</p>
            </div>
          ) : (
            <div className="status-updates-list">
              {Object.keys(groupedUpdates).length === 0 ? (
                <div className="no-updates">
                  <p>No status updates available for this process</p>
                </div>
              ) : (
                Object.entries(groupedUpdates).map(([processType, updates], groupIndex) => (
                  <div
                    key={groupIndex}
                    className="process-group-card"
                    style={{
                      borderLeftColor: updates[0].borderColor,
                      animationDelay: `${groupIndex * 0.1}s`
                    }}
                  >
                    <div className="process-group-header">
                      <span className="status-type-icon">{updates[0].icon}</span>
                      <h4>{processType}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="plant-count-badge">{updates.length}</span>
                        {updates.length > 1 && (
                          <button
                            className="maximize-btn"
                            onClick={() => setMaximizedGroup({ processType, updates })}
                            title="Maximize to view all plants"
                          >
                            ⛶
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="process-plants-scroll">
                      {updates.map((update, plantIndex) => (
                        <div key={plantIndex} className="plant-item">
                          <div className="plant-item-body">
                            <p className="project-name"><strong>Plant:</strong> {update.plant}</p>
                            <p className="application-id"><strong>Step:</strong> {update.step}</p>
                            <p className="application-id"><strong>Comments:</strong> {update.comments}</p>
                            <p className="application-id"><strong>Date:</strong> {update.date}</p>
                          </div>

                          <div className="plant-item-footer">
                            <span
                              className="status-badge"
                              style={{ backgroundColor: update.statusColor }}
                            >
                              {update.status}
                            </span>
                          </div>

                          {plantIndex < updates.length - 1 && <div className="plant-divider"></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Maximize Modal */}
      {maximizedGroup && (
        <div className="maximize-modal-overlay" onClick={() => setMaximizedGroup(null)}>
          <div className="maximize-modal" onClick={(e) => e.stopPropagation()}>
            <div className="maximize-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="status-type-icon" style={{ fontSize: '28px' }}>
                  {maximizedGroup.updates[0].icon}
                </span>
                <h2>{maximizedGroup.processType}</h2>
                <span className="plant-count-badge" style={{ fontSize: '16px', width: '32px', height: '32px' }}>
                  {maximizedGroup.updates.length}
                </span>
              </div>
              <button
                className="close-modal-btn"
                onClick={() => setMaximizedGroup(null)}
              >
                ✕
              </button>
            </div>

            <div className="maximize-modal-body">
              {maximizedGroup.updates.map((update, index) => (
                <div
                  key={index}
                  className="maximized-plant-card"
                  style={{ borderLeftColor: update.borderColor }}
                >
                  <div className="maximized-plant-header">
                    <h3>Plant {index + 1}: {update.plant}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: update.statusColor }}
                    >
                      {update.status}
                    </span>
                  </div>
                  <div className="maximized-plant-details">
                    <div className="detail-row">
                      <span className="detail-label">Step:</span>
                      <span className="detail-value">{update.step}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Comments:</span>
                      <span className="detail-value">{update.comments}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{update.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create;