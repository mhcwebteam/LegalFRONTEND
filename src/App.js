import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login'; 
import NavbarPage from './components/NavbarPage';
import Sidebar from './components/Sidebar';
import Create from './pages/Create';
import Update from './pages/Update';
import Modify from './pages/Modify';
import Amendment from './pages/Amendment';
import View from './pages/View';
import PollutionForm from './pages/PollutionForm';
import Airport from './pages/Airport'; 
import TaxReturns from './pages/TaxReturns';
import './App.css';
import bgImage from './assets/bg5.jpg';
import WaterForm from './pages/Water';
import { AppProvider } from './context/ContextData';
import ReraForm from './pages/ReraForm';
import ProjectDetails from './pages/ProjectDetails';
import Fireform from './pages/Fireform';
import Ghmc from './pages/Ghmc';



function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);


  // Listen to window resize to update isMobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Automatically close sidebar if switching to desktop
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <AppProvider>
      <NavbarPage toggleSidebar={toggleSidebar} />

      {/* Sidebar: 
          - On mobile: show only if isSidebarOpen 
          - On desktop: always show */}
          <div
  style={{
    // backgroundImage: `url(${bgImage})`,
        backgroundColor: '#d8dad5ff',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    minHeight: '100vh',
    margin: '0px',
    padding: '0px',
  }}
>
 
      {(isMobile && isSidebarOpen) || !isMobile ? (
        <Sidebar
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          closeSidebar={closeSidebar}
          setIsHovered={setIsSidebarHovered}
          isHovered={isSidebarHovered}  // 👈 Pass the state setter
        />
      ) : null}

      {/* Overlay only on mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div className="overlay" onClick={closeSidebar} />
      )}

      {/* Main content padding: 
          - On desktop add margin-left for sidebar space
          - On mobile full width */}
      <div
        className="main-content"
        style={{
          marginTop: '50px',
          padding: '20px',
          marginLeft: !isMobile ? (isSidebarHovered ? 180 : 60) : 0,
          transition: 'margin-left 0.3s ease',
        }}
        onClick={() => isSidebarOpen && isMobile && closeSidebar()}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<Create />} />
          <Route path="/update" element={<Update />} />
          <Route path="/modify" element={<Modify />} />
          <Route path="/amendment" element={<Amendment />} />
          <Route path="/taxreturns" element={<TaxReturns/>} />
          <Route path="/view" element={<View />} />

          <Route path="/create/pollution" element={<PollutionForm />} />
           <Route path="/create/airport" element={<Airport />} />
           <Route path="/create/water" element={<WaterForm />} />
             <Route path="/create/rera" element={<ReraForm />} />
             <Route path="/create/fire" element={<Fireform />} />
             <Route path = "/create/Ghmc" element = {<Ghmc/>} />
             <Route path="/create/masterproject" element={<ProjectDetails />} />
           

             


          {/*<Route path="/create/hmda" element={<HmdaForm />} />
          <Route path="/create/fire" element={<FireForm />} /> */}
          <Route
            path="*"
            element={<h2>Welcome! Select a tab from the sidebar.</h2>}
          />
        </Routes>
      </div>
       
</div>
    </AppProvider>
  );
}

export default App;
