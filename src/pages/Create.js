import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import './Create.css';
import {TabIcons, TabLabels} from '../components/TabIcons';

const Create = () => {
  const navigate = useNavigate();
   // Get token and user from localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // Optional: redirect if not logged in
  // useEffect(() => {
  //   if (!token) {
  //     navigate('/login');
  //   }
  // }, [navigate, token]);

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

 
  </div>
     {/* Right Side: Notifications */}

</div>

  );
};

export default Create;
