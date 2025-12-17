import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/Config';

const Report = () => {
  const [plants, setPlants] = useState([]);
  const [reportData, setReportData] = useState({});
  const [processSteps, setProcessSteps] = useState({});
  const [applicationCreatedDates, setApplicationCreatedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // const API_BASE_URL = 'http://127.0.0.1:8000/api';
  // const token = localStorage.getItem('token');

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
    'HMDA/GHMC': 'ghmc_steps',
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

        console.log("reportResponsereportResponsereportResponse",reportResponse);

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

    // Sort by LEVEL or created_at to ensure correct order
    return matchingRecords.sort((a, b) => {
      const dateA = new Date(a.created_at || a.APPLY_DT || 0);
      const dateB = new Date(b.created_at || b.APPLY_DT || 0);
      return dateA - dateB;
    });
  };

  // Function to get process steps with completion status and duration
  const getProcessStepsWithStatus = (plantName, processName) => {
    const stepsKey = processToStepsKey[processName];
    
    if (!stepsKey || !processSteps[stepsKey]) {
      return [];
    }

    const steps = processSteps[stepsKey];
    const records = getAllRecordsForPlant(plantName, processName);

    // Sort steps by LEVEL
    const sortedSteps = [...steps].sort((a, b) => {
      const levelA = parseInt(a.LEVEL) || 0;
      const levelB = parseInt(b.LEVEL) || 0;
      return levelA - levelB;
    });

    // Get application created date for this plant
    const appCreatedDate = applicationCreatedDates[plantName];

    // Map steps with their completion status and duration
    return sortedSteps.map((step, index) => {
      // Find matching record for this step
      const matchingRecord = records.find(record => {
        const recordProcess = record.PROCESS || record.STATUS || '';
        return recordProcess.trim().toLowerCase() === step.PROCESS.trim().toLowerCase();
      });

      if (matchingRecord) {
        // Calculate duration
        let duration = null;
        let startDate = null;
        let endDate = matchingRecord.updated_at || matchingRecord.APPLY_DT;

        if (index === 0) {
          // First step: duration from application created_at to this step's updated_at
          startDate = appCreatedDate || matchingRecord.created_at;
        } else {
          // Subsequent steps: duration from previous step's updated_at to current step's updated_at
          const prevRecord = records[index - 1];
          startDate = prevRecord ? (prevRecord.updated_at || prevRecord.APPLY_DT) : matchingRecord.created_at;
        }

        duration = calculateDuration(startDate, endDate);

        return {
          stepName: step.PROCESS,
          level: step.LEVEL,
          status: 'COMPLETED',
          date: matchingRecord.APPLY_DT || matchingRecord.applyDate || '',
          comments: matchingRecord.COMMENTS || matchingRecord.Comments || '',
          duration: duration,
          createdAt: matchingRecord.created_at,
          updatedAt: matchingRecord.updated_at
        };
      } else {
        return {
          stepName: step.PROCESS,
          level: step.LEVEL,
          status: 'PENDING',
          date: '',
          comments: '',
          duration: null
        };
      }
    });
  };

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
    
    // Find ALL matching records for this plant
    const matchingRecords = storeData.filter(record => {
      const loc = record.LOC || record.loc;
      return loc && loc.trim().toLowerCase() === plantName.trim().toLowerCase();
    });

    if (matchingRecords.length === 0) {
      return { process: '-', date: '', comments: '' };
    }

    // Return ONLY the latest record (last one in the array)
    const latestRecord = matchingRecords[matchingRecords.length - 1];

    return {
      process: latestRecord.PROCESS || latestRecord.STATUS || 'PENDING',
      date: latestRecord.APPLY_DT || latestRecord.applyDate || '',
      comments: latestRecord.COMMENTS || latestRecord.Comments || ''
    };
  };

  const downloadSecondTableAsExcel = () => {
    // Create CSV content
    let csvContent = '';
    
    // Add headers
    const headers = ['S.No', 'PLANTS', ...processes];
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    plants.forEach((plant, rowIndex) => {
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

  const renderFirstTable = (title) => (
    <div style={{ marginBottom: '15px' }}>
      <h3 style={{ 
        margin: '0 0 6px 0', 
        color: '#333', 
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        {title}
      </h3>
      <div style={{ 
        maxHeight: 'calc(42vh - 60px)',
        overflowX: 'auto',
        overflowY: 'auto',
        backgroundColor: '#fff', 
        border: '1px solid #ddd',
        borderRadius: '8px',
        position: 'relative'
      }}>
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
              {processes.map((process, index) => (
                <th key={index} style={{ 
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  padding: '10px 12px', 
                  textAlign: 'center',
                  fontWeight: 'bold', 
                  border: '1px solid #ddd', 
                  fontSize: '12px',
                  minWidth: '180px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10
                }}>
                  {process}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plants.map((plant, rowIndex) => (
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
                      verticalAlign: 'top'
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  
  const renderTable = (title) => (
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
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
        >
          <span>⬇️</span>
          <span>Download</span>
        </button>
      </div>
      <div style={{ 
        maxHeight: 'calc(50vh - 80px)',
        overflowX: 'auto',
        overflowY: 'auto',
        backgroundColor: '#fff', 
        border: '1px solid #ddd',
        borderRadius: '8px',
        position: 'relative'
      }}>
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
              {processes.map((process, index) => (
                <th key={index} style={{ 
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  padding: '10px 12px', 
                  textAlign: 'center',
                  fontWeight: 'bold', 
                  border: '1px solid #ddd', 
                  fontSize: '12px',
                  minWidth: '300px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10
                }}>
                  {process}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plants.map((plant, rowIndex) => (
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
                      verticalAlign: 'top'
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
            ))}
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
        {renderTable('DETAILED PROCESS STEPS')}
      </div>
    </div>
  );
};

export default Report;
