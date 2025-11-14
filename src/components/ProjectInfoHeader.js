import React, { useContext, useState } from 'react';
import { Collapse, IconButton, Tooltip } from '@mui/material';
import { ChevronUp, ChevronDown, Building2, Home, MapPin, Calculator, Users, House } from 'lucide-react';
import { Context } from '../context/ContextData';


const ProjectInfoHeader = ({ data }) => {

  const context = useContext(Context);
  const headerData = data || context.headerData;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const labelsToLimit = ["Address", "Location", "Project Name"];

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const infoItems = [
    { icon: <MapPin size={16} />, label: 'Location', value: headerData?.LOC || '—', color: '#3b82f6' },
    { icon: <Building2 size={16} />, label: 'Project Name', value: headerData?.PROJECT_NAME || '—', color: '#10b981' },
    { icon: <Building2 size={16} />, label: 'Creation Date', value: formatDate(headerData?.APPLICATION_DATE), color: '#10b981' },
    { icon: <Home size={16} />, label: 'No. of Towers', value: headerData?.NUMBER_OF_TOWERS || '—', color: '#f59e0b' },
    { icon: <Home size={16} />, label: 'Total Project Area', value: headerData?.TOTAL_PROJECT_AREA ? `${headerData.TOTAL_PROJECT_AREA} Acres` : '—', color: '#f59e0b' },
    { icon: <Calculator size={16} />, label: 'Project BuildUp Area', value: headerData?.PROJECT_BUILD_AREA ? `${headerData.PROJECT_BUILD_AREA} sq ft` : '—', color: '#ef4444' },
    { icon: <House size={16} />, label: 'No. of Flats', value: headerData?.NUMBER_OF_FLATS || '—', color: '#8b5cf6' },
    { icon: <Users size={16} />, label: 'Address', value: headerData?.ADDRESS || '—', color: '#8b5cf6' },
  ];

  return (
    <div className="project-info-header">
      <div className="header-toggle" onClick={toggleCollapse}>
        <div className="toggle-content">
          <span className="toggle-title">Project Information</span>
          <IconButton size="small" className="toggle-button"
            onClick={e => { e.stopPropagation(); toggleCollapse(); }}>
            {isCollapsed ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
          </IconButton>
        </div>
      </div>
      <Collapse in={!isCollapsed}>
        <div className="info-content">
          <div className="info-row-scroll">
            {infoItems.map((item, index) => (
              <div key={index} className="info-chip">
                <div className="info-chip-icon" style={{ color: item.color }}>
                  {item.icon}
                </div>
                <div>
                  <div className="info-chip-label">{item.label}</div>
                  <Tooltip title={item.value} arrow>
                    <div
                      className="info-chip-value"
                      style={labelsToLimit.includes(item.label)
                        ? { maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                        : {}}
                    >
                      {item.value}
                    </div>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Collapse>
    </div>
  );
};
export default ProjectInfoHeader;

