import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './Create.css';
import { TabIcons, TabLabels } from '../components/TabIcons';
import { API_BASE_URL } from '../config/Config';

const Create = () => {
  const navigate = useNavigate();
  
  // --- State Variables ---
  const [selectedProcess, setSelectedProcess] = useState('All Processes');
  const [statusUpdates, setStatusUpdates] = useState([]);
  
  // Loading & Error States
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [loadingTabs, setLoadingTabs] = useState(true); // New state for tabs loading
  const [error, setError] = useState(null);
  
  const [maximizedGroup, setMaximizedGroup] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Dynamic Tabs State
  const [visibleTabs, setVisibleTabs] = useState([]); 

  const token = localStorage.getItem('token');

  // --- 1. Define Master List of Tabs ---
  // We use useMemo so this array doesn't recreate on every render
  const allTabs = useMemo(() => [
    {
      id: 'masterproject', 
      icon: TabIcons.masterproject,
      label: TabLabels.masterproject,
      route: '/create/masterproject',
      gradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
      hoverGradient: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)'
    },
    {
      id: 'pollution',
      icon: TabIcons.pollution,
      label: TabLabels.pollution,
      route: '/create/pollution',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      hoverGradient: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
    },
    {
      id: 'airport',
      icon: TabIcons.airport,
      label: TabLabels.airport,
      route: '/create/airport',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      hoverGradient: 'linear-gradient(135deg, #e879f9 0%, #ef4444 100%)'
    },

    {
      id: 'fire',
      icon: TabIcons.fire,
      label: TabLabels.fire,
      route: '/create/fire',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      hoverGradient: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)'
    },

        {
      id: 'hmda', // Make sure this ID matches your DB response
      icon: TabIcons.hmda,
      label: TabLabels.hmda,
      route: '/create/Ghmc',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      hoverGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
    },
    {
      id: 'water',
      icon: TabIcons.water,
      label: TabLabels.water,
      route: '/create/water',
      gradient: 'linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%)',
      hoverGradient: 'linear-gradient(135deg, #5eead4 0%, #0284c7 100%)'
    },
    {
      id: 'rera',
      icon: TabIcons.rera,
      label: TabLabels.rera,
      route: '/create/rera',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      hoverGradient: 'linear-gradient(135deg, #fb7185 0%, #fbbf24 100%)'
    },
    {
      id: 'miscellaneous',
      icon: TabIcons.miscellaneous,
      label: TabLabels.miscellaneous,
      route: '/create/miscellaneous',
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #d57abcff 100%)',
      hoverGradient: 'linear-gradient(135deg, #c084fc 0%, #eb99c3ff 100%)'
    }
  ], []);

  // --- 2. Check User Login ---
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    const userString = localStorage.getItem('user'); // Changed to 'user' to be safe
    if (userString) {
      try {
        const userObj = JSON.parse(userString);
        setLoggedInUser(userObj);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [token, navigate]);

  // --- 3. Fetch Tabs based on User Role ---
 // --- 3. Fetch Tabs based on User Role ---
  useEffect(() => {
    const fetchUserPermissions = async () => {
      // 1. Get User Data: Try State first, then fallback to LocalStorage
      let currentUser = loggedInUser;
      
      if (!currentUser) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            currentUser = JSON.parse(storedUser);
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }
      }

      console.log("Debug - User Object:", currentUser);

      // --- FIX: Check 'Email' (Title Case) as well ---
      const email = currentUser?.Email || currentUser?.email || currentUser?.EMAIL;
      
      console.log("Debug - Email to fetch:", email);

      // 4. Safety Check
      if (!email) {
        console.warn("⚠️ Stopping Fetch: No email property found.");
        return; 
      }

      try {
        setLoadingTabs(true);
        // 5. Call API
        const response = await fetch(`${API_BASE_URL}/user-permissions?email=${email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.success && Array.isArray(data.allowedTabs)) {
          const filteredTabs = allTabs.filter(tab => 
            data.allowedTabs.includes(tab.id)
          );
          setVisibleTabs(filteredTabs);
        } else {
          console.warn("API returned success:false or invalid tabs");
          setVisibleTabs([]); 
        }

      } catch (err) {
        console.error('Error fetching permissions:', err);
      } finally {
        setLoadingTabs(false);
      }
    };

    fetchUserPermissions();
  }, [token, loggedInUser, allTabs]);
  // --- 4. Fetch Status Updates ---
  const fetchStatusUpdates = async (process = 'All Processes') => {
    try {
      setLoadingUpdates(true);
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

        if (process === 'Airport Authority') url = `${API_BASE_URL}/airport-status-updates`;
        else if (process === 'RERA') url = `${API_BASE_URL}/rera-status-updates`;
        else if (process === 'Water') url = `${API_BASE_URL}/water-status-updates`;
        else if (process === 'Pollution Control Board') url = `${API_BASE_URL}/status-updates`;
        else if (process === 'HMDA/GHMC') url = `${API_BASE_URL}/ghmc-status-updates`;
        else if (process === 'Fire') url = `${API_BASE_URL}/fire-status-updates`;
        else url = `${API_BASE_URL}/status-updates?process=${encodeURIComponent(process)}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch status updates');

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
      setLoadingUpdates(false);
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

  const groupedUpdates = statusUpdates.reduce((acc, update) => {
    const processType = update.title;
    if (!acc[processType]) {
      acc[processType] = [];
    }
    acc[processType].push(update);
    return acc;
  }, {});

  const processTypes = [
    'All Processes',
    'Pollution Control Board',
    'Airport Authority',
    'Fire',
      'HMDA/GHMC',
    'Water',
    'RERA'
  ];

  // --- Render ---
  return (
    <div className="create-page">
      <h2 className="title">Create Approvals</h2>

      <div className="main-layout">
        {/* Left Side: Dynamic Tabs */}
        <div className="tab-container">
          {loadingTabs ? (
             <div className="loading-tabs" style={{color: 'white', padding: '20px'}}>
               Loading menu...
             </div>
          ) : visibleTabs.length > 0 ? (
            visibleTabs.map((tab, index) => (
              <div
                key={tab.id}
                className="tab-card"
                onClick={() => navigate(tab.route)}
                style={{
                  background: tab.gradient,
                  '--hover-gradient': tab.hoverGradient,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="tab-icon">{tab.icon}</div>
                <div className="tab-label">{tab.label}</div>
              </div>
            ))
          ) : (
            <div className="no-tabs-message" style={{color: 'white', padding: '20px'}}>
               No permissions assigned.
            </div>
          )}
        </div>

        {/* Right Side: Status Updates */}
        <div className="notifications-panel">
          <div className="notifications-header">
            <div className="header-title">
              <span className="status-icon">📊</span>
              <h3>Status Updates</h3>
              <span className="notification-badge">{statusUpdates.length}</span>
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

          {loadingUpdates ? (
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