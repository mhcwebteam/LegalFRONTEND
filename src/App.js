import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Login'; 
import NavbarPage from './components/NavbarPage';
import Sidebar from './components/Sidebar';
import Create from './pages/Create';
import Update from './pages/Update';
import Modify from './pages/Modify';
import Amendment from './pages/Amendment';
import PollutionForm from './pages/PollutionForm';
import Airport from './pages/Airport'; 
import TaxReturns from './pages/TaxReturns';
import './App.css';
import WaterForm from './pages/Water';
import { AppProvider } from './context/ContextData';
import ReraForm from './pages/ReraForm';
import ProjectDetails from './pages/ProjectDetails';
import Fireform from './pages/Fireform';
import Ghmc from './pages/Ghmc';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EditMasterDetails from './pages/EditMasterDetails';
import Report from './pages/Report';
import SessionTimeout from "./components/SessionTimeout";

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  const queryClient = new QueryClient();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    
    <QueryClientProvider client={queryClient}>
      <AppProvider>
      <SessionTimeout timeoutMins={600} />

        {!isLoginPage && <NavbarPage toggleSidebar={toggleSidebar} />}

        <div
          style={{
            backgroundColor: "#d8dad5ff",
            backgroundSize: "cover",
            minHeight: "100vh",
            margin: 0,
            padding: 0,
          }}
        >
          {/* 🔥 SHOW SIDEBAR ONLY IF NOT LOGIN PAGE */}
          {!isLoginPage && (
            <>
              {(isMobile && isSidebarOpen) || !isMobile ? (
                <Sidebar
                  isMobile={isMobile}
                  isOpen={isSidebarOpen}
                  closeSidebar={closeSidebar}
                  setIsHovered={setIsSidebarHovered}
                  isHovered={isSidebarHovered}
                />
              ) : null}

              {isMobile && isSidebarOpen && (
                <div className="overlay" onClick={closeSidebar} />
              )}
            </>
          )}

          <div
            className="main-content"
            style={{
              marginTop: isLoginPage ? "0px" : "50px",
              padding: isLoginPage ? "0px" : "20px",
              marginLeft: !isLoginPage && !isMobile ? (isSidebarHovered ? 180 : 60) : 0,
              transition: "margin-left 0.3s ease",
            }}
          >
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/create" element={<Create />} />
              <Route path="/Edit" element= {<EditMasterDetails />} />
              <Route path="/update" element={<Update />} />
              <Route path="/modify" element={<Modify />} />
              <Route path="/amendment" element={<Amendment />} />
              <Route path="/taxreturns" element={<TaxReturns />} />
              <Route path="/report" element={<Report />} />
              <Route path="/create/pollution" element={<PollutionForm />} />
              <Route path="/create/airport" element={<Airport />} />
              <Route path="/create/water" element={<WaterForm />} />
              <Route path="/create/rera" element={<ReraForm />} />
              <Route path="/create/fire" element={<Fireform />} />
              <Route path="/create/Ghmc" element={<Ghmc />} />
              <Route path="/create/masterproject" element={<ProjectDetails />} />
              <Route path="*" element={<h2>Welcome! Select a tab from the sidebar.</h2>} />
            </Routes>
          </div>
        </div>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;

