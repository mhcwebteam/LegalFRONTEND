import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/Config';

const Report = () => {
  const [plants, setPlants] = useState([]);
  const [reportData, setReportData] = useState({});
  const [processSteps, setProcessSteps] = useState({});
  const [applicationCreatedDates, setApplicationCreatedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [showSearch1, setShowSearch1] = useState(false);
  const [showSearch2, setShowSearch2] = useState(false);
  const searchRef1 = useRef(null);
  const searchRef2 = useRef(null);

  // Process colors for headers only
  const processColors = {
    'Pollution Control Board': {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: 'white'
    },
    'Airport Authority': {
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      textColor: 'white'
    },
    'HMDA/GHMC': {
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      textColor: 'white'
    },
    'Fire': {
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      textColor: 'white'
    },
    'Water': {
      gradient: 'linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%)',
      textColor: 'white'
    },
    'RERA': {
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      textColor: 'white'
    }
  };

  const processes = [
    'Pollution Control Board',
    'Airport Authority',
    'HMDA/GHMC',
    'Fire',
    'Water',
    'RERA'
  ];

  const processToDataKey = {
    'Pollution Control Board': 'pcb_store',
    'Airport Authority': 'airport_store',
    'HMDA/GHMC': 'ghmc_store',
    'Fire': 'fire_store',
    'Water': 'water_store',
    'RERA': 'rera_store'
  };

  const processToStepsKey = {
    'Pollution Control Board': 'pcb_steps',
    'Airport Authority': 'airport_steps',
    'HMDA/GHMC': ['ghmc_steps', 'hmda_steps'],
    'Fire': 'fire_steps',
    'Water': 'water_steps',
    'RERA': 'rera_steps'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

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
              // 'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.json())
        );

        const results = await Promise.all(promises);

        let allData = [];
        results.forEach(data => {
          if (data.success && Array.isArray(data.data)) {
            allData = [...allData, ...data.data];
          }
        });

        const plantsMap = {};
        const appCreatedDates = {};

        allData.forEach(update => {
          const plantName = update.plant;

          if (!plantsMap[plantName]) {
            plantsMap[plantName] = {
              plant_name: plantName
            };
          }

          // Store the earliest created_at date for each plant (application creation date)
          if (update.created_at) {
            const key = `${plantName}`;
            if (!appCreatedDates[key] || new Date(update.created_at) < new Date(appCreatedDates[key])) {
              appCreatedDates[key] = update.created_at;
            }
          }
        });

        setApplicationCreatedDates(appCreatedDates);
        const uniquePlants = Object.values(plantsMap);

        // Fetch report data
        const reportResponse = await fetch(`${API_BASE_URL}/report/data`, {
          headers: {
            // 'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("reportResponsereportResponsereportResponse", reportResponse);

        const reportResult = await reportResponse.json();

        if (reportResult.success) {
          setReportData(reportResult.data);
        }

        // Fetch process steps
        const stepsResponse = await fetch(`${API_BASE_URL}/process-steps`, {
          headers: {
            // 'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const stepsResult = await stepsResponse.json();

        if (stepsResult.success) {
          setProcessSteps(stepsResult.data);
        }

        setPlants(uniquePlants);
        setLoading(false);

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
        setPlants([]);
      }
    };

    fetchData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef1.current && !searchRef1.current.contains(event.target)) {
        setShowSearch1(false);
      }
      if (searchRef2.current && !searchRef2.current.contains(event.target)) {
        setShowSearch2(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // // Filter plants based on search term
  // const filteredPlants1 = plants.filter(plant =>
  //   plant.plant_name?.toLowerCase().includes(searchTerm1.toLowerCase())
  // );

  // const filteredPlants2 = plants.filter(plant =>
  //   plant.plant_name?.toLowerCase().includes(searchTerm2.toLowerCase())
  // );

  // Calculate duration in days between two dates
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Function to get all records for a plant and process
  const getAllRecordsForPlant = (plantName, processName) => {
    const dataKey = processToDataKey[processName];

    if (!dataKey || !reportData[dataKey]) {
      return [];
    }

    const storeData = reportData[dataKey];

    // Find ALL matching records for this plant
    const matchingRecords = storeData.filter(record => {
      const loc = record.LOC || record.loc;
      return loc && loc.trim().toLowerCase() === plantName.trim().toLowerCase();
    });

    // Sort by created_at to ensure correct order
    return matchingRecords.sort((a, b) => {
      const dateA = new Date(a.created_at || a.APPLY_DT || 0);
      const dateB = new Date(b.created_at || b.APPLY_DT || 0);
      return dateA - dateB;
    });
  };

  // Function to get process steps with completion status and duration
  const getProcessStepsWithStatus = (plantName, processName) => {
    const stepsKey = processToStepsKey[processName];

    if (!stepsKey) {
      return [];
    }

    let allSteps = [];

    // Get records from the data store first
    const records = getAllRecordsForPlant(plantName, processName);

    // Special handling for Fire process - we need to duplicate steps for Provisional NOC and OC Process
    if (processName === 'Fire' && processSteps['fire_steps']) {
      // First, get the base steps from fire_steps (should be 5 steps)
      const baseSteps = [...processSteps['fire_steps']];
      
      // For Fire process, we need to show 10 tiles:
      // First 5 for Provisional NOC, next 5 for OC Process
      allSteps = baseSteps.map((step, index) => ({
        ...step,
        stepType: 'Provisional NOC', // First 5 steps are for Provisional NOC
        displayName: `${step.PROCESS} (Provisional NOC)`
      }));

      // Add the same 5 steps again for OC Process
      const ocSteps = baseSteps.map((step, index) => ({
        ...step,
        stepType: 'OC Process', // Next 5 steps are for OC Process
        displayName: `${step.PROCESS} (OC Process)`
      }));

      allSteps = [...allSteps, ...ocSteps];
    }
    // For GHMC/HMDA, determine which organization steps to use based on the records
    else if (processName === 'HMDA/GHMC' && Array.isArray(stepsKey)) {
      // Check the Organization field in the records to determine which steps to load
      const organization = records.length > 0 ? records[0].Organization : null;

      if (organization) {
        const orgLower = organization.toLowerCase();
        if (orgLower.includes('ghmc')) {
          // Load only GHMC steps
          if (processSteps['ghmc_steps']) {
            allSteps = [...processSteps['ghmc_steps']];
          }
        } else if (orgLower.includes('hmda')) {
          // Load only HMDA steps
          if (processSteps['hmda_steps']) {
            allSteps = [...processSteps['hmda_steps']];
          }
        }
      } else {
        // No records yet - show default GHMC steps
        if (processSteps['ghmc_steps']) {
          allSteps = [...processSteps['ghmc_steps']];
        }
      }
    } else {
      // Handle both single key and array of keys for other processes
      const keys = Array.isArray(stepsKey) ? stepsKey : [stepsKey];

      keys.forEach(key => {
        if (processSteps[key]) {
          allSteps = [...allSteps, ...processSteps[key]];
        }
      });
    }

    if (allSteps.length === 0) {
      return [];
    }

    // Sort steps by LEVEL
    const sortedSteps = [...allSteps].sort((a, b) => {
      const levelA = parseInt(a.LEVEL) || 0;
      const levelB = parseInt(b.LEVEL) || 0;
      return levelA - levelB;
    });

    const appCreatedDate = applicationCreatedDates[plantName];

    return sortedSteps.map((step, index) => {
      // Find matching record for this step
      let matchingRecord = null;
      
      if (processName === 'Fire' && step.stepType) {
        // For Fire process, match both PROCESS name AND STEPTYPE
        matchingRecord = records.find(record => {
          const recordProcess = record.PROCESS || record.STATUS || '';
          const recordStepType = record.STEPTYPE || '';
          
          return recordProcess.trim().toLowerCase() === step.PROCESS.trim().toLowerCase() &&
                 recordStepType.trim().toLowerCase() === step.stepType.trim().toLowerCase();
        });
      } else {
        // For other processes, match only by PROCESS name
        matchingRecord = records.find(record => {
          const recordProcess = record.PROCESS || record.STATUS || '';
          return recordProcess.trim().toLowerCase() === step.PROCESS.trim().toLowerCase();
        });
      }

      const isUpdated = matchingRecord &&
        matchingRecord.UPDATED &&
        matchingRecord.UPDATED.toString().trim().toUpperCase() === 'YES';

      if (isUpdated) {
        let duration = null;
        let startDate = null;
        let endDate = matchingRecord.updated_at || matchingRecord.APPLY_DT;

        if (index === 0) {
          startDate = appCreatedDate || matchingRecord.created_at;
        } else {
          let prevCompletedStep = null;
          for (let i = index - 1; i >= 0; i--) {
            const prevStepName = sortedSteps[i].PROCESS;
            const prevStepType = sortedSteps[i].stepType;
            
            let prevRecord = null;
            
            if (processName === 'Fire' && prevStepType) {
              // For Fire process, find previous record with matching PROCESS and STEPTYPE
              prevRecord = records.find(record => {
                const recordProcess = record.PROCESS || record.STATUS || '';
                const recordStepType = record.STEPTYPE || '';
                
                return recordProcess.trim().toLowerCase() === prevStepName.trim().toLowerCase() &&
                       recordStepType.trim().toLowerCase() === prevStepType.trim().toLowerCase();
              });
            } else {
              // For other processes
              prevRecord = records.find(record => {
                const recordProcess = record.PROCESS || record.STATUS || '';
                return recordProcess.trim().toLowerCase() === prevStepName.trim().toLowerCase();
              });
            }

            if (prevRecord && prevRecord.UPDATED &&
              prevRecord.UPDATED.toString().trim().toUpperCase() === 'YES') {
              prevCompletedStep = prevRecord;
              break;
            }
          }

          if (prevCompletedStep) {
            startDate = prevCompletedStep.updated_at || prevCompletedStep.APPLY_DT;
          } else {
            startDate = appCreatedDate || matchingRecord.created_at;
          }
        }

        duration = calculateDuration(startDate, endDate);

        return {
          stepName: step.displayName || step.PROCESS,
          level: step.LEVEL,
          status: 'COMPLETED',
          date: matchingRecord.APPLY_DT || matchingRecord.applyDate || '',
          comments: matchingRecord.COMMENTS || matchingRecord.Comments || '',
          duration: duration,
          createdAt: matchingRecord.created_at,
          updatedAt: matchingRecord.updated_at,
          stepType: step.stepType || null
        };
      } else {
        const isModified = matchingRecord &&
          matchingRecord.UPDATED &&
          matchingRecord.UPDATED.toString().trim().toUpperCase() !== 'YES';

        return {
          stepName: step.displayName || step.PROCESS,
          level: step.LEVEL,
          status: isModified ? 'MODIFIED' : 'PENDING',
          date: matchingRecord ? (matchingRecord.APPLY_DT || matchingRecord.applyDate || '') : '',
          comments: matchingRecord ? (matchingRecord.COMMENTS || matchingRecord.Comments || '') : '',
          duration: null,
          createdAt: matchingRecord ? matchingRecord.created_at : null,
          updatedAt: matchingRecord ? matchingRecord.updated_at : null,
          stepType: step.stepType || null
        };
      }
    });
  };

  const hasCompletedAllProcesses = (plantName) => {
  for (const process of processes) {
    const stepsWithStatus = getProcessStepsWithStatus(plantName, process);
    
    if (stepsWithStatus.length === 0) {
      return false;
    }
    
    const allCompleted = stepsWithStatus.every(step => step.status === 'COMPLETED');
    
    if (!allCompleted) {
      return false;
    }
  }
  
  return true;
};

// Then, use it in the filter (place this AFTER hasCompletedAllProcesses function)
const filteredPlants1 = plants
  .filter(plant => !hasCompletedAllProcesses(plant.plant_name))
  .filter(plant => plant.plant_name?.toLowerCase().includes(searchTerm1.toLowerCase()));

const filteredPlants2 = plants
  .filter(plant => !hasCompletedAllProcesses(plant.plant_name))
  .filter(plant => plant.plant_name?.toLowerCase().includes(searchTerm2.toLowerCase()));

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Function to get cell data - returns ONLY the latest record (for first table)
  const getCellData = (plantName, processName) => {
    const dataKey = processToDataKey[processName];

    if (!dataKey || !reportData[dataKey]) {
      return { process: '-', date: '', comments: '' };
    }

    const storeData = reportData[dataKey];

    const matchingRecords = storeData.filter(record => {
      const loc = record.LOC || record.loc;
      return loc && loc.trim().toLowerCase() === plantName.trim().toLowerCase();
    });

    if (matchingRecords.length === 0) {
      return { process: '-', date: '', comments: '' };
    }

    // For Fire process, we need to handle both Provisional NOC and OC Process
    if (processName === 'Fire') {
      // Group records by STEPTYPE
      const provisionalRecords = matchingRecords.filter(record => 
        record.STEPTYPE && record.STEPTYPE.toLowerCase().includes('provisional')
      );
      const ocRecords = matchingRecords.filter(record => 
        record.STEPTYPE && record.STEPTYPE.toLowerCase().includes('oc')
      );

      // Get latest from each group
      const latestProvisional = provisionalRecords.length > 0 
        ? provisionalRecords[provisionalRecords.length - 1] 
        : null;
      const latestOC = ocRecords.length > 0 
        ? ocRecords[ocRecords.length - 1] 
        : null;

      // Combine information for display
      if (latestProvisional || latestOC) {
        const processes = [];
        const dates = [];
        const comments = [];

        if (latestProvisional) {
          processes.push(`Provisional: ${latestProvisional.PROCESS || 'PENDING'}`);
          dates.push(latestProvisional.APPLY_DT || '');
          comments.push(latestProvisional.COMMENTS || '');
        }

        if (latestOC) {
          processes.push(`OC: ${latestOC.PROCESS || 'PENDING'}`);
          dates.push(latestOC.APPLY_DT || '');
          comments.push(latestOC.COMMENTS || '');
        }

        return {
          process: processes.join(' | '),
          date: dates.filter(d => d).join(' | '),
          comments: comments.filter(c => c).join(' | ')
        };
      }
    }

    // For other processes, get the latest record
    const latestRecord = matchingRecords[matchingRecords.length - 1];

    let comments = latestRecord.COMMENTS || latestRecord.Comments || '';
    if (processName === 'Water' && !comments && latestRecord.REASON) {
      comments = latestRecord.REASON;
    }

    return {
      process: latestRecord.PROCESS || latestRecord.STATUS || 'PENDING',
      date: latestRecord.APPLY_DT || latestRecord.applyDate || '',
      comments: comments
    };
  };

  // Download function for first table
  const downloadFirstTableAsExcel = () => {
    let csvContent = '';

    // Add headers
    const headers = ['S.No', 'PLANTS', ...processes.map(p => `${p} (Status)`), ...processes.map(p => `${p} (Date)`), ...processes.map(p => `${p} (Comments)`)];
    csvContent += headers.join(',') + '\n';

    // Add data rows
    filteredPlants1.forEach((plant, rowIndex) => {
      const row = [rowIndex + 1, `"${plant.plant_name || 'Unknown Plant'}"`];

      processes.forEach(process => {
        const cellData = getCellData(plant.plant_name, process);
        row.push(`"${cellData.process}"`);
        row.push(`"${formatDate(cellData.date)}"`);
        row.push(`"${cellData.comments}"`);
      });

      csvContent += row.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Work_In_Progress_Plants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download function for second table
  const downloadSecondTableAsExcel = () => {
    let csvContent = '';

    // Add headers
    const headers = ['S.No', 'PLANTS', ...processes];
    csvContent += headers.join(',') + '\n';

    // Add data rows
    filteredPlants2.forEach((plant, rowIndex) => {
      const row = [rowIndex + 1, `"${plant.plant_name || 'Unknown Plant'}"`];

      processes.forEach(process => {
        const stepsWithStatus = getProcessStepsWithStatus(plant.plant_name, process);

        if (stepsWithStatus.length > 0) {
          const stepsSummary = stepsWithStatus.map(step => {
            let info = `${step.stepName}: ${step.status}`;
            if (step.status === 'COMPLETED' && step.date) {
              info += ` (${formatDate(step.date)})`;
            }
            if (step.status === 'COMPLETED' && step.duration !== null) {
              info += ` - Duration: ${step.duration} days`;
            }
            if (step.status === 'COMPLETED' && step.comments) {
              info += ` - ${step.comments}`;
            }
            return info;
          }).join(' | ');
          row.push(`"${stepsSummary}"`);
        } else {
          row.push('"No steps available"');
        }
      });

      csvContent += row.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Detailed_Process_Steps_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compact Search Bar Component
  const CompactSearchBar = ({ searchTerm, setSearchTerm, showSearch, setShowSearch, placeholder, resultCount, totalCount }) => {
    const inputRef = useRef(null);

    // Focus input when dropdown opens
    useEffect(() => {
      if (showSearch && inputRef.current) {
        inputRef.current.focus();
      }
    }, [showSearch]);

    return (
      <div style={{ position: 'relative' }} ref={searchRef1}>
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.3s',
            width: '120px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
        >
          <span>🔍</span>
          <span>Search</span>
        </button>

        {showSearch && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '5px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 100,
            width: '250px',
            padding: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginLeft: '8px',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#666',
              textAlign: 'center',
              padding: '4px',
              borderTop: '1px solid #eee',
              marginTop: '8px'
            }}>
              Showing {resultCount} of {totalCount} plants
            </div>
          </div>
        )}
      </div>
    );
  };

  // Compact Search Bar Component for Second Table
  const CompactSearchBar2 = ({ searchTerm, setSearchTerm, showSearch, setShowSearch, placeholder, resultCount, totalCount }) => {
    const inputRef = useRef(null);

    // Focus input when dropdown opens
    useEffect(() => {
      if (showSearch && inputRef.current) {
        inputRef.current.focus();
      }
    }, [showSearch]);

    return (
      <div style={{ position: 'relative' }} ref={searchRef2}>
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.3s',
            width: '120px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
        >
          <span>🔍</span>
          <span>Search</span>
        </button>

        {showSearch && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '5px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 100,
            width: '250px',
            padding: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2196F3'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginLeft: '8px',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#666',
              textAlign: 'center',
              padding: '4px',
              borderTop: '1px solid #eee',
              marginTop: '8px'
            }}>
              Showing {resultCount} of {totalCount} plants
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFirstTable = (title) => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px'
      }}>
        <h3 style={{
          margin: '0',
          color: '#333',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <CompactSearchBar
            searchTerm={searchTerm1}
            setSearchTerm={setSearchTerm1}
            showSearch={showSearch1}
            setShowSearch={setShowSearch1}
            placeholder="Search plants..."
            resultCount={filteredPlants1.length}
            totalCount={plants.length}
          />
          <button
            onClick={downloadFirstTableAsExcel}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.3s',
              width: '120px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
          >
            <span>⬇️</span>
            <span>Download</span>
          </button>
        </div>
      </div>

      <div
        style={{
          maxHeight: 'calc(42vh - 80px)',
          overflowX: 'auto',
          overflowY: 'auto',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          position: 'relative'
        }}
      >
        <table style={{
          borderCollapse: 'collapse',
          backgroundColor: '#fff',
          fontSize: '11px',
          width: '100%'
        }}>
          <thead>
            <tr>
              <th style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '1px solid #ddd',
                fontSize: '12px',
                minWidth: '60px',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                S.No
              </th>
              <th style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: 'bold',
                border: '1px solid #ddd',
                fontSize: '12px',
                minWidth: '200px',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                PLANTS
              </th>
              {processes.map((process, index) => {
                const colors = processColors[process] || { gradient: '#2196F3', textColor: 'white' };
                return (
                  <th key={index} style={{
                    background: colors.gradient,
                    color: colors.textColor,
                    padding: '10px 12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    border: '1px solid #ddd',
                    fontSize: '12px',
                    minWidth: process === 'Fire' ? '220px' : '180px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    {process}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredPlants1.length === 0 ? (
              <tr>
                <td colSpan={processes.length + 2} style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#999',
                  fontStyle: 'italic'
                }}>
                  {searchTerm1 ? `No plants found matching "${searchTerm1}"` : 'No plants available'}
                </td>
              </tr>
            ) : (
              filteredPlants1.map((plant, rowIndex) => (
                <tr key={rowIndex} style={{
                  transition: 'background-color 0.3s'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{
                    backgroundColor: '#f5f5f5',
                    fontWeight: '600',
                    textAlign: 'center',
                    color: '#333',
                    padding: '8px',
                    border: '1px solid #ddd',
                    fontSize: '11px'
                  }}>
                    {rowIndex + 1}
                  </td>
                  <td style={{
                    backgroundColor: '#e3f2fd',
                    fontWeight: '600',
                    textAlign: 'left',
                    color: '#1976D2',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    fontSize: '11px'
                  }}
                    title={plant.plant_name || 'Unknown Plant'}
                  >
                    {plant.plant_name || 'Unknown Plant'}
                  </td>
                  {processes.map((process, colIndex) => {
                    const cellData = getCellData(plant.plant_name, process);

                    return (
                      <td key={colIndex} style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        textAlign: 'left',
                        fontSize: '10px',
                        backgroundColor: rowIndex % 2 === 1 ? '#f9f9f9' : '#fff',
                        verticalAlign: 'top',
                        minWidth: process === 'Fire' ? '220px' : '180px'
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <div style={{
                            fontWeight: '600',
                            color: cellData.process === 'APPROVED' || cellData.process.includes('Received') || cellData.process.includes('NOC Received') ? '#4caf50' :
                              cellData.process === 'PENDING' || cellData.process.includes('Submit') || cellData.process.includes('Application') ? '#ff9800' :
                                cellData.process === '-' ? '#999' : '#1976d2'
                          }}>
                            {cellData.process}
                          </div>
                          {cellData.date && (
                            <div style={{
                              fontSize: '9px',
                              color: '#666',
                              fontStyle: 'italic'
                            }}>
                              📅 {formatDate(cellData.date)}
                            </div>
                          )}
                          {cellData.comments && (
                            <div style={{
                              fontSize: '9px',
                              color: '#555',
                              marginTop: '2px',
                              lineHeight: '1.3'
                            }}
                              title={cellData.comments}
                            >
                              💬 {cellData.comments}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSecondTable = (title) => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px'
      }}>
        <h3 style={{
          margin: '0',
          color: '#333',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <CompactSearchBar2
            searchTerm={searchTerm2}
            setSearchTerm={setSearchTerm2}
            showSearch={showSearch2}
            setShowSearch={setShowSearch2}
            placeholder="Search plants..."
            resultCount={filteredPlants2.length}
            totalCount={plants.length}
          />
          <button
            onClick={downloadSecondTableAsExcel}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.3s',
              width: '120px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
          >
            <span>⬇️</span>
            <span>Download</span>
          </button>
        </div>
      </div>

      <div
        style={{
          maxHeight: 'calc(50vh - 80px)',
          overflowX: 'auto',
          overflowY: 'auto',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          position: 'relative'
        }}
      >
        <table style={{
          borderCollapse: 'collapse',
          backgroundColor: '#fff',
          fontSize: '11px',
          width: '100%'
        }}>
          <thead>
            <tr>
              <th style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '1px solid #ddd',
                fontSize: '12px',
                minWidth: '60px',
                position: 'sticky',
                top: 0,
                left: 0,
                zIndex: 20
              }}>
                S.No
              </th>
              <th style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: 'bold',
                border: '1px solid #ddd',
                fontSize: '12px',
                minWidth: '200px',
                position: 'sticky',
                top: 0,
                left: '60px',
                zIndex: 20
              }}>
                PLANTS
              </th>
              {processes.map((process, index) => {
                const colors = processColors[process] || { gradient: '#2196F3', textColor: 'white' };
                return (
                  <th key={index} style={{
                    background: colors.gradient,
                    color: colors.textColor,
                    padding: '10px 12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    border: '1px solid #ddd',
                    fontSize: '12px',
                    minWidth: process === 'Fire' ? '700px' : '300px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    {process}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredPlants2.length === 0 ? (
              <tr>
                <td colSpan={processes.length + 2} style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#999',
                  fontStyle: 'italic'
                }}>
                  {searchTerm2 ? `No plants found matching "${searchTerm2}"` : 'No plants available'}
                </td>
              </tr>
            ) : (
              filteredPlants2.map((plant, rowIndex) => (
                <tr key={rowIndex} style={{
                  transition: 'background-color 0.3s'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{
                    backgroundColor: '#f5f5f5',
                    fontWeight: '600',
                    textAlign: 'center',
                    color: '#333',
                    padding: '8px',
                    border: '1px solid #ddd',
                    fontSize: '11px',
                    position: 'sticky',
                    left: 0,
                    zIndex: 5
                  }}>
                    {rowIndex + 1}
                  </td>
                  <td style={{
                    backgroundColor: '#e3f2fd',
                    fontWeight: '600',
                    textAlign: 'left',
                    color: '#1976D2',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    fontSize: '11px',
                    position: 'sticky',
                    left: '60px',
                    zIndex: 5
                  }}
                    title={plant.plant_name || 'Unknown Plant'}
                  >
                    {plant.plant_name || 'Unknown Plant'}
                  </td>
                  {processes.map((process, colIndex) => {
                    const stepsWithStatus = getProcessStepsWithStatus(plant.plant_name, process);

                    return (
                      <td key={colIndex} style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        textAlign: 'left',
                        fontSize: '10px',
                        backgroundColor: rowIndex % 2 === 1 ? '#f9f9f9' : '#fff',
                        verticalAlign: 'top',
                        minWidth: process === 'Fire' ? '700px' : '300px'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          overflowX: 'auto',
                          overflowY: 'hidden',
                          paddingBottom: '4px',
                          maxWidth: '100%'
                        }}>
                          {stepsWithStatus.length > 0 ? (
                            stepsWithStatus.map((step, stepIndex) => (
                              <div key={stepIndex} style={{
                                minWidth: '140px',
                                maxWidth: '140px',
                                padding: '8px',
                                border: `2px solid ${step.status === 'COMPLETED' ? '#4caf50' : '#ff9800'}`,
                                borderRadius: '6px',
                                backgroundColor: step.status === 'COMPLETED' ? '#e8f5e9' : '#fff3e0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}>
                                <div style={{
                                  fontWeight: '700',
                                  fontSize: '10px',
                                  color: step.status === 'COMPLETED' ? '#2e7d32' : '#e65100',
                                  marginBottom: '4px',
                                  wordWrap: 'break-word'
                                }}>
                                  {step.stepName}
                                </div>
                                <div style={{
                                  fontSize: '8px',
                                  fontWeight: '600',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  backgroundColor: step.status === 'COMPLETED' ? '#4caf50' : '#ff9800',
                                  color: 'white',
                                  textAlign: 'center',
                                  marginBottom: '4px'
                                }}>
                                  {step.status}
                                </div>
                                {step.status === 'COMPLETED' && (
                                  <>
                                    {step.date && (
                                      <div style={{
                                        fontSize: '8px',
                                        color: '#555',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        marginBottom: '4px'
                                      }}>
                                        <span>📅</span>
                                        <span>{formatDate(step.date)}</span>
                                        {step.duration !== null && (
                                          <span style={{
                                            fontSize: '9px',
                                            fontWeight: '700',
                                            color: '#1565c0',
                                            backgroundColor: '#e3f2fd',
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            border: '1px solid #90caf9',
                                            marginLeft: '4px'
                                          }}>
                                            ⏱️ {step.duration}d
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {step.comments && (
                                      <div style={{
                                        fontSize: '8px',
                                        color: '#555',
                                        marginTop: '2px',
                                        lineHeight: '1.3',
                                        wordWrap: 'break-word',
                                        maxHeight: '40px',
                                        overflow: 'hidden'
                                      }}
                                        title={step.comments}
                                      >
                                        💬 {step.comments}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ))
                          ) : (
                            <div style={{
                              color: '#999',
                              fontStyle: 'italic',
                              padding: '8px'
                            }}>
                              No steps available
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#666' }}>
          Loading plants and report data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#d32f2f', fontWeight: '600' }}>
          Error: {error}
        </div>
        <div style={{ textAlign: 'center', padding: '10px', fontSize: '14px', color: '#999' }}>
          Please check the console for more details.
        </div>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '16px', color: '#d32f2f', fontWeight: '600' }}>
          No plants found
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '10px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#e0e0e0',
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: '18px',
        fontWeight: 'bold',
        flexShrink: 0
      }}>

      </h2>

      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {renderFirstTable('WORK IN PROGRESS PLANTS')}
        {renderSecondTable('DETAILED PROCESS STEPS')}
      </div>
    </div>
  );
};

export default Report;