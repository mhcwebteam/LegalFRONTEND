import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/Config';

const Report = () => {
  const [plants, setPlants] = useState([]);
  const [reportData, setReportData] = useState({});
  const [processSteps, setProcessSteps] = useState({});
  const [applicationCreatedDates, setApplicationCreatedDates] = useState({});
  const [activeAmendments, setActiveAmendments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [searchTerm3, setSearchTerm3] = useState('');
  const [showSearch1, setShowSearch1] = useState(false);
  const [showSearch2, setShowSearch2] = useState(false);
  const [showSearch3, setShowSearch3] = useState(false);
  const searchRef1 = useRef(null);
  const searchRef2 = useRef(null);
  const searchRef3 = useRef(null);

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
    'Fire': {
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      textColor: 'white'
    },
    'HMDA/GHMC': {
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
    'Fire',
    'HMDA/GHMC',
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
  const getLatestComment = (commentsField) => {
    if (!commentsField) return '';

    // If it's already a simple string (not JSON), return it
    if (typeof commentsField === 'string' && !commentsField.startsWith('[')) {
      return commentsField;
    }

    try {
      // Try to parse as JSON array
      const commentsArray = typeof commentsField === 'string'
        ? JSON.parse(commentsField)
        : commentsField;

      if (Array.isArray(commentsArray) && commentsArray.length > 0) {
        // Sort by date descending to get the latest
        const sorted = commentsArray.sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return dateB - dateA; // Latest first
        });

        // Return the latest comment
        return sorted[0].comment || '';
      }

      return '';
    } catch (e) {
      // If parsing fails, return the original string
      return commentsField;
    }
  };

  const getActiveAmendment = (plantName) => {
    const plantKey = plantName.trim().toLowerCase();
    const amendmentCategory = activeAmendments[plantKey];

    if (!amendmentCategory) {
      return null;
    }

    const match = amendmentCategory.match(/AMEND(\d+)/i);
    if (match) {
      return parseInt(match[1]);
    }

    return null;
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

          if (update.created_at) {
            const key = `${plantName}`;
            if (!appCreatedDates[key] || new Date(update.created_at) < new Date(appCreatedDates[key])) {
              appCreatedDates[key] = update.created_at;
            }
          }
        });

        setApplicationCreatedDates(appCreatedDates);
        const uniquePlants = Object.values(plantsMap);

        const reportResponse = await fetch(`${API_BASE_URL}/report/data`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const reportResult = await reportResponse.json();

        if (reportResult.success) {
          setReportData(reportResult.data);
        }

        const amendmentsResponse = await fetch(`${API_BASE_URL}/report/amendments`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const amendmentsResult = await amendmentsResponse.json();

        if (amendmentsResult.success) {
          const amendmentsMap = {};
          amendmentsResult.data.forEach(amend => {
            const plantName = (amend.LOC || amend.loc || '').trim().toLowerCase();
            const category = amend.CATEGORY || '';
            amendmentsMap[plantName] = category;
          });
          setActiveAmendments(amendmentsMap);
        }

        const stepsResponse = await fetch(`${API_BASE_URL}/process-steps`, {
          headers: {
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef1.current && !searchRef1.current.contains(event.target)) {
        setShowSearch1(false);
      }
      if (searchRef2.current && !searchRef2.current.contains(event.target)) {
        setShowSearch2(false);
      }
      if (searchRef3.current && !searchRef3.current.contains(event.target)) {
        setShowSearch3(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // If dates are invalid, return null
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }

    // Set both dates to midnight to calculate full days
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const diffTime = Math.abs(endMidnight - startMidnight);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Add 1 to include both start and end dates
    return diffDays + 1;
  };

  const getAllRecordsForPlant = (plantName, processName) => {
    const dataKey = processToDataKey[processName];

    if (!dataKey || !reportData[dataKey]) {
      return [];
    }

    const storeData = reportData[dataKey];

    const matchingRecords = storeData.filter(record => {
      const loc = record.LOC || record.loc;
      return loc && loc.trim().toLowerCase() === plantName.trim().toLowerCase();
    });

    return matchingRecords.sort((a, b) => {
      const dateA = new Date(a.created_at || a.APPLY_DT || 0);
      const dateB = new Date(b.created_at || b.APPLY_DT || 0);
      return dateA - dateB;
    });
  };

  const getProcessStepsWithStatus = (plantName, processName) => {
    const stepsKey = processToStepsKey[processName];

    if (!stepsKey) {
      return [];
    }

    let allSteps = [];

    const records = getAllRecordsForPlant(plantName, processName);

    if (processName === 'Pollution Control Board') {
      const activeAmendment = getActiveAmendment(plantName);

      if (processSteps['pcb_steps']) {
        allSteps = [...processSteps['pcb_steps']];
      }

      if (allSteps.length === 0) {
        return [];
      }

      const sortedSteps = [...allSteps].sort((a, b) => {
        const levelA = parseInt(a.LEVEL) || 0;
        const levelB = parseInt(b.LEVEL) || 0;
        return levelA - levelB;
      });

      return sortedSteps.map((step, index) => {
        let matchingRecord = records.find(record => {
          const recordProcess = record.PROCESS || record.STATUS || '';
          return recordProcess.trim().toLowerCase() === step.PROCESS.trim().toLowerCase();
        });

        if (!matchingRecord) {
          return {
            stepName: activeAmendment ? `${step.PROCESS} (Amendment ${activeAmendment})` : step.PROCESS,
            level: step.LEVEL,
            status: 'PENDING',
            date: '',
            comments: '',
            duration: null,
            applyDate: null,
            updatedAt: null
          };
        }

        let isCompleted = false;
        let comments = '';
        let applyDate = '';
        let updatedDate = '';
        let duration = null;

        if (activeAmendment) {
          const amendPrefix = `AMEND${activeAmendment}_`;
          const statusField = matchingRecord[`${amendPrefix}STATUS`];
          const updatedField = matchingRecord[`${amendPrefix}UPDATED`];
          const amendDateField = matchingRecord[`${amendPrefix}DATE`];

          // CHANGE THIS LINE - use the helper function
          comments = getLatestComment(matchingRecord[`${amendPrefix}COMMENTS`]) || '';

          isCompleted = statusField !== null &&
            statusField !== undefined &&
            statusField !== '' &&
            (statusField.toString().trim().toLowerCase() === 'yes' ||
              statusField.toString().trim().toLowerCase() === 'completed' ||
              statusField.toString().trim().toLowerCase() === 'done' ||
              statusField.toString().trim() === '1' ||
              statusField === 1 ||
              statusField === true);

          updatedDate = matchingRecord.updated_at || '';
          applyDate = amendDateField || '';

          if (isCompleted && applyDate && updatedDate) {
            duration = calculateDuration(applyDate, updatedDate);
          }
        } else {
          const updatedField = matchingRecord.UPDATED;
          comments = matchingRecord.COMMENTS || '';

          isCompleted = updatedField !== null &&
            updatedField !== undefined &&
            updatedField !== '' &&
            (updatedField.toString().trim().toLowerCase() === 'yes' ||
              updatedField.toString().trim() === '1' ||
              updatedField === 1 ||
              updatedField === true ||
              updatedField.toString().trim().toLowerCase() === 'completed' ||
              updatedField.toString().trim().toLowerCase() === 'done');

          updatedDate = matchingRecord.updated_at || '';
          applyDate = matchingRecord.APPLY_DT || '';

          if (isCompleted && applyDate && updatedDate) {
            duration = calculateDuration(applyDate, updatedDate);
          }
        }

        return {
          stepName: activeAmendment ? `${step.PROCESS} (Amendment ${activeAmendment})` : step.PROCESS,
          level: step.LEVEL,
          status: isCompleted ? 'COMPLETED' : 'PENDING',
          date: applyDate,
          comments: comments,
          duration: duration,
          applyDate: applyDate,
          updatedAt: updatedDate
        };
      });
    }
    if (processName === 'Fire' && processSteps['fire_steps']) {
      const baseSteps = [...processSteps['fire_steps']];

      allSteps = baseSteps.map((step, index) => ({
        ...step,
        stepType: 'Provisional NOC',
        displayName: `${step.PROCESS} (Provisional NOC)`
      }));

      const ocSteps = baseSteps.map((step, index) => ({
        ...step,
        stepType: 'OC',
        displayName: `${step.PROCESS} (OC Process)`
      }));

      allSteps = [...allSteps, ...ocSteps];
    }
    else if (processName === 'HMDA/GHMC' && Array.isArray(stepsKey)) {
      const organization = records.length > 0 ? records[0].Organization : null;

      if (organization) {
        const orgLower = organization.toLowerCase();
        if (orgLower.includes('ghmc')) {
          if (processSteps['ghmc_steps']) {
            allSteps = [...processSteps['ghmc_steps']];
          }
        } else if (orgLower.includes('hmda')) {
          if (processSteps['hmda_steps']) {
            allSteps = [...processSteps['hmda_steps']];
          }
        }
      } else {
        if (processSteps['ghmc_steps']) {
          allSteps = [...processSteps['ghmc_steps']];
        }
      }
    } else {
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

    const sortedSteps = [...allSteps].sort((a, b) => {
      const levelA = parseInt(a.LEVEL) || 0;
      const levelB = parseInt(b.LEVEL) || 0;
      if (processName === 'Fire' && a.stepType && b.stepType) {
        if (a.stepType !== b.stepType) {
          return a.stepType === 'Provisional NOC' ? -1 : 1;
        }
      }

      return levelA - levelB;
    });

    return sortedSteps.map((step, index) => {
      let matchingRecord = null;

      if (processName === 'Fire' && step.stepType) {
        matchingRecord = records.find(record => {
          const recordProcess = record.PROCESS || record.STATUS || '';
          const recordStepType = (record.STEPTYPE || '').toString().trim();

          const normalizedRecordStepType = recordStepType.toLowerCase();
          const normalizedStepType = step.stepType.toLowerCase();

          const normalizedRecordProcess = recordProcess.trim().toLowerCase();
          const normalizedStepProcess = step.PROCESS.trim().toLowerCase();

          let stepTypeMatch = false;

          if (step.stepType === 'Provisional NOC') {
            stepTypeMatch = normalizedRecordStepType.includes('provisional') ||
              normalizedRecordStepType.includes('noc') ||
              (normalizedRecordStepType === 'provisional noc');
          } else if (step.stepType === 'OC') {
            stepTypeMatch = (normalizedRecordStepType.includes('oc') && !normalizedRecordStepType.includes('noc')) ||
              normalizedRecordStepType === 'oc process' ||
              normalizedRecordStepType === 'occupancy certificate' ||
              normalizedRecordStepType === 'oc';
          }

          const processMatch = normalizedRecordProcess === normalizedStepProcess;

          return processMatch && stepTypeMatch;
        });
      } else {
        matchingRecord = records.find(record => {
          const recordProcess = record.PROCESS || record.STATUS || '';
          return recordProcess.trim().toLowerCase() === step.PROCESS.trim().toLowerCase();
        });
      }


      let isCompleted = false;
      let stepDate = '';
      let stepComments = '';
      let duration = null;

      if (matchingRecord) {
        stepDate = matchingRecord.APPLY_DT || matchingRecord.applyDate || '';
stepComments = matchingRecord.COMMENTS || matchingRecord.Comments || '';
// For Water process, also check REASON field
if (processName === 'Water' && !stepComments && matchingRecord.REASON) {
  stepComments = matchingRecord.REASON;
}
        // For Fire process, check the appropriate field based on step type
        let updatedField;
        if (processName === 'Fire' && step.stepType) {
          if (step.stepType === 'OC') {
            // For OC steps, check OC_UPDATED field
            updatedField = matchingRecord.OC_UPDATED;
          } else {
            // For Provisional NOC steps, check UPDATED field
            updatedField = matchingRecord.UPDATED;
          }
        } else {
          // For other processes, use UPDATED field
          updatedField = matchingRecord.UPDATED;
        }

        const applyDate = matchingRecord.APPLY_DT || matchingRecord.applyDate || '';
        const updatedDate = matchingRecord.updated_at || '';

        if (updatedField !== null && updatedField !== undefined) {
          const updatedStr = updatedField.toString().trim().toUpperCase();

          isCompleted = updatedStr === 'YES' ||
            updatedStr === '1' ||
            updatedField === 1 ||
            updatedField === true ||
            updatedStr === 'COMPLETED' ||
            updatedStr === 'DONE' ||
            updatedStr === 'TRUE';
        } else {
          // If UPDATED field doesn't exist or is empty, step is PENDING
          isCompleted = false;
        }

        // Calculate duration using APPLY_DT and updated_at
        if (isCompleted && applyDate && updatedDate) {
          duration = calculateDuration(applyDate, updatedDate);
        }
      } else {
        isCompleted = false;
      }

      return {
        stepName: step.displayName || step.PROCESS,
        level: step.LEVEL,
        status: isCompleted ? 'COMPLETED' : 'PENDING',
        date: stepDate,
        comments: stepComments,
        duration: duration,
        applyDate: stepDate,
        updatedAt: matchingRecord ? (matchingRecord.updated_at || '') : '',
        stepType: step.stepType || null
      };
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

  const filteredPlants1 = plants
    .filter(plant => !hasCompletedAllProcesses(plant.plant_name))
    .filter(plant => plant.plant_name?.toLowerCase().includes(searchTerm1.toLowerCase()));

  const filteredPlants2 = plants
    .filter(plant => !hasCompletedAllProcesses(plant.plant_name))
    .filter(plant => plant.plant_name?.toLowerCase().includes(searchTerm2.toLowerCase()));

  // Get completed plants
  const completedPlants = plants.filter(plant => hasCompletedAllProcesses(plant.plant_name));
  const filteredPlants3 = completedPlants.filter(plant =>
    plant.plant_name?.toLowerCase().includes(searchTerm3.toLowerCase())
  );

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

    if (matchingRecords.length > 0) {
  // Get the most recent record (even if not completed)
  const mostRecentRecord = matchingRecords.sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at || a.APPLY_DT || 0);
    const dateB = new Date(b.updated_at || b.created_at || b.APPLY_DT || 0);
    return dateB - dateA;
  })[0];

  let comments = mostRecentRecord.COMMENTS || mostRecentRecord.Comments || '';
  
  // For Water process, also check REASON field
  if (processName === 'Water' && !comments && mostRecentRecord.REASON) {
    comments = mostRecentRecord.REASON;
  }

  return {
    process: mostRecentRecord.PROCESS || mostRecentRecord.STATUS || 'PENDING',
    date: mostRecentRecord.APPLY_DT || mostRecentRecord.applyDate || '',
    comments: comments
  };
}

return { process: '-', date: '', comments: '' };

    if (processName === 'Pollution Control Board') {
      const activeAmendment = getActiveAmendment(plantName);
      const stepsWithStatus = getProcessStepsWithStatus(plantName, processName);

      if (stepsWithStatus.length > 0) {
        // Find the last COMPLETED step only
        let lastCompletedStep = null;

        for (let i = stepsWithStatus.length - 1; i >= 0; i--) {
          if (stepsWithStatus[i].status === 'COMPLETED') {
            lastCompletedStep = stepsWithStatus[i];
            break;
          }
        }

        // If there's a completed step, show it
        if (lastCompletedStep) {
          return {
            process: lastCompletedStep.stepName,
            date: lastCompletedStep.date || '',
            comments: getLatestComment(lastCompletedStep.comments) || ''
          };
        }

        // If no completed steps, return default
        return { process: '-', date: '', comments: '' };
      }
    }

    if (processName === 'Fire') {
      const totalSteps = processSteps['fire_steps'] ? processSteps['fire_steps'].length : 5;

      // Count NOC completed steps (using UPDATED field)
      const nocCompletedCount = matchingRecords.filter(record =>
        record.UPDATED &&
        record.UPDATED.toString().trim().toUpperCase() === 'YES'
      ).length;

      // Count OC completed steps (using OC_UPDATED field)
      const ocCompletedCount = matchingRecords.filter(record =>
        record.OC_UPDATED &&
        record.OC_UPDATED.toString().trim().toUpperCase() === 'YES'
      ).length;

      let lastCompletedStep = null;
      let currentPhase = '';

      // If OC has any completed steps, show latest OC step
      if (ocCompletedCount > 0) {
        const ocCompleted = matchingRecords.filter(record =>
          record.OC_UPDATED &&
          record.OC_UPDATED.toString().trim().toUpperCase() === 'YES'
        ).sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || a.APPLY_DT || 0);
          const dateB = new Date(b.updated_at || b.created_at || b.APPLY_DT || 0);
          return dateB - dateA;
        });

        if (ocCompleted.length > 0) {
          lastCompletedStep = ocCompleted[0];
          currentPhase = 'OC Process';
        }
      }
      // Otherwise, if NOC has completed steps, show latest NOC step
      else if (nocCompletedCount > 0) {
        const nocCompleted = matchingRecords.filter(record =>
          record.UPDATED &&
          record.UPDATED.toString().trim().toUpperCase() === 'YES'
        ).sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || a.APPLY_DT || 0);
          const dateB = new Date(b.updated_at || b.created_at || b.APPLY_DT || 0);
          return dateB - dateA;
        });

        if (nocCompleted.length > 0) {
          lastCompletedStep = nocCompleted[0];
          currentPhase = 'Provisional NOC';
        }
      }

      if (lastCompletedStep) {
        return {
          process: `${currentPhase}: ${lastCompletedStep.PROCESS || 'Completed'}`,
          date: lastCompletedStep.APPLY_DT || '',
          comments: lastCompletedStep.COMMENTS || ''
        };
      }

      // No completed steps yet
      return { process: '-', date: '', comments: '' };
    }

    // For other processes, find the last COMPLETED step
    const completedRecords = matchingRecords.filter(record => {
      const updatedField = record.UPDATED;
      if (updatedField !== null && updatedField !== undefined) {
        const updatedStr = updatedField.toString().trim().toUpperCase();
        return updatedStr === 'YES' ||
          updatedStr === '1' ||
          updatedField === 1 ||
          updatedField === true ||
          updatedStr === 'COMPLETED' ||
          updatedStr === 'DONE' ||
          updatedStr === 'TRUE';
      }
      return false;
    });

   if (completedRecords.length > 0) {
  const latestCompletedRecord = completedRecords.sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at || a.APPLY_DT || 0);
    const dateB = new Date(b.updated_at || b.created_at || b.APPLY_DT || 0);
    return dateB - dateA;
  })[0];

  let comments = latestCompletedRecord.COMMENTS || latestCompletedRecord.Comments || '';
  if (processName === 'Water' && !comments && latestCompletedRecord.REASON) {
    comments = latestCompletedRecord.REASON;
  }

  return {
    process: latestCompletedRecord.PROCESS || latestCompletedRecord.STATUS || 'COMPLETED',
    date: latestCompletedRecord.APPLY_DT || latestCompletedRecord.applyDate || '',
    comments: comments
  };
}

    // No completed steps found
    return { process: '-', date: '', comments: '' };
  };

  const getCompletedPlantCellData = (plantName, processName) => {
    // For completed plants, simply return "ALL PROCESS COMPLETED" text
    return {
      process: 'ALL PROCESS COMPLETED',
      date: '',
      comments: 'All steps completed successfully'
    };
  };

  const downloadFirstTableAsExcel = () => {
  let csvContent = '';

  // Combine status, date, and comments into one column per process
  const headers = ['S.No', 'PLANTS', ...processes];
  csvContent += headers.join(',') + '\n';

  filteredPlants1.forEach((plant, rowIndex) => {
    const row = [rowIndex + 1, `"${plant.plant_name || 'Unknown Plant'}"`];

    processes.forEach(process => {
      const cellData = getCellData(plant.plant_name, process);
      
      // Format the cell content exactly like in the table view
      let cellContent = cellData.process || '';
      
      if (cellData.date && cellData.date.trim() !== '') {
        cellContent += `\n ${formatDate(cellData.date)}`;
      }
      
      if (cellData.comments && cellData.comments.trim() !== '') {
        cellContent += `\n ${cellData.comments}`;
      }
      
      // Wrap in quotes to preserve the content structure
      row.push(`"${cellContent.replace(/"/g, '""')}"`);
    });

    csvContent += row.join(',') + '\n';
  });

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


  const downloadSecondTableAsExcel = () => {
    let csvContent = '';

    const headers = ['S.No', 'PLANTS', ...processes];
    csvContent += headers.join(',') + '\n';

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

  const downloadThirdTableAsExcel = () => {
    let csvContent = '';

    const headers = ['S.No', 'PLANTS', ...processes.map(p => `${p} (Status)`), ...processes.map(p => `${p} (Comments)`)];
    csvContent += headers.join(',') + '\n';

    filteredPlants3.forEach((plant, rowIndex) => {
      const row = [rowIndex + 1, `"${plant.plant_name || 'Unknown Plant'}"`];

      processes.forEach(process => {
        const cellData = getCompletedPlantCellData(plant.plant_name, process);
        row.push(`"${cellData.process}"`);
        row.push(`"${cellData.comments}"`);
      });

      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Completed_Plants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CompactSearchBar = ({ searchTerm, setSearchTerm, showSearch, setShowSearch, placeholder, resultCount, totalCount }) => {
    const inputRef = useRef(null);

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

  const CompactSearchBar2 = ({ searchTerm, setSearchTerm, showSearch, setShowSearch, placeholder, resultCount, totalCount }) => {
    const inputRef = useRef(null);

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
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
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

  const CompactSearchBar3 = ({ searchTerm, setSearchTerm, showSearch, setShowSearch, placeholder, resultCount, totalCount }) => {
    const inputRef = useRef(null);

    useEffect(() => {
      if (showSearch && inputRef.current) {
        inputRef.current.focus();
      }
    }, [showSearch]);

    return (
      <div style={{ position: 'relative' }} ref={searchRef3}>
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
                onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
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
    <div style={{
      marginBottom: '15px',
      flex: '0 0 auto' // Don't allow this to grow or shrink
    }}>
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
          height: '300px', // Fixed height
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
    <div style={{
      marginBottom: '15px',
      flex: '0 0 auto' // Don't allow this to grow or shrink
    }}>
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
          height: '300px', // Fixed height
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

  const renderThirdTable = (title) => (
    <div style={{
      marginBottom: '15px',
      flex: '0 0 auto' // Don't allow this to grow or shrink
    }}>
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
          <CompactSearchBar3
            searchTerm={searchTerm3}
            setSearchTerm={setSearchTerm3}
            showSearch={showSearch3}
            setShowSearch={setShowSearch3}
            placeholder="Search completed plants..."
            resultCount={filteredPlants3.length}
            totalCount={completedPlants.length}
          />
          <button
            onClick={downloadThirdTableAsExcel}
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
          height: '150px', // Fixed height
          marginBottom: '100px',
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
            {filteredPlants3.length === 0 ? (
              <tr>
                <td colSpan={processes.length + 2} style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#999',
                  fontStyle: 'italic'
                }}>
                  {searchTerm3 ? `No completed plants found matching "${searchTerm3}"` : 'No completed plants available'}
                </td>
              </tr>
            ) : (
              filteredPlants3.map((plant, rowIndex) => (
                <tr key={rowIndex} style={{
                  transition: 'background-color 0.3s',
                  backgroundColor: '#f0fff4'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f7e9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0fff4'}
                >
                  <td style={{
                    backgroundColor: '#e8f5e9',
                    fontWeight: '600',
                    textAlign: 'center',
                    color: '#2e7d32',
                    padding: '8px',
                    border: '1px solid #ddd',
                    fontSize: '11px'
                  }}>
                    {rowIndex + 1}
                  </td>
                  <td style={{
                    backgroundColor: '#c8e6c9',
                    fontWeight: '600',
                    textAlign: 'left',
                    color: '#1b5e20',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    fontSize: '11px'
                  }}
                    title={plant.plant_name || 'Unknown Plant'}
                  >
                    {plant.plant_name || 'Unknown Plant'}
                  </td>
                  {processes.map((process, colIndex) => {
                    const cellData = getCompletedPlantCellData(plant.plant_name, process);

                    return (
                      <td key={colIndex} style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        textAlign: 'center',
                        fontSize: '10px',
                        backgroundColor: rowIndex % 2 === 1 ? '#f1f8e9' : '#f0fff4',
                        verticalAlign: 'middle',
                        minWidth: process === 'Fire' ? '220px' : '180px'
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            fontWeight: 'bold',
                            color: '#2e7d32',
                            fontSize: '11px',
                            backgroundColor: '#e8f5e9',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '2px solid #4caf50'
                          }}>
                            ✅ {cellData.process}
                          </div>
                          {cellData.comments && (
                            <div style={{
                              fontSize: '9px',
                              color: '#555',
                              marginTop: '2px',
                              fontStyle: 'italic'
                            }}
                              title={cellData.comments}
                            >
                              {cellData.comments}
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
        {/* Page Title */}
      </h2>

      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          minHeight: 'min-content' // Allow content to determine minimum height
        }}>
          {renderFirstTable('WORK IN PROGRESS PLANTS')}
          {renderSecondTable('DETAILED PROCESS STEPS')}
          {renderThirdTable('ALL PROCESSES COMPLETED PLANTS')}
        </div>
      </div>
    </div>
  );
};

export default Report;