import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { List } from 'react-bootstrap-icons';
import logo from '../assets/myhomepmlogo1.png';
import './NavbarPage.css';
import { useNavigate } from 'react-router-dom';


const NavbarPage = ({ toggleSidebar }) => {
   const navigate = useNavigate();

  const handleLogout = () => navigate('/');

  const isSmallScreen = window.innerWidth <= 1396;
  
  return (
    <Navbar style={{ backgroundImage: 'linear-gradient(135deg,   rgb(229, 189, 229) 10%, rgb(213 43 198) 100%)',
        minHeight: '50px' }} className="shadow-sm py-1" fixed="top">
      <Container fluid className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          {/* Hamburger menu button: visible only on mobile (md and below) */}
          <Button 
            variant="light" 
            className="d-md-none me-2" 
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <List size={24} />
          </Button>

          {/* Logo */}
          <Navbar.Brand href="/">
            <img src={logo} alt="Logo" height="40" />
          </Navbar.Brand>
        </div>

        {/* Logout button */}
        <Button variant="outline-danger" 
            style={{
              color: 'white',
              backgroundColor: 'transparent',
              border: '1px solid white',
            }}
          onClick={handleLogout}
     onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'} 
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'} // Reset on mouse leave
          >
          Logout
        </Button>
      </Container>
    </Navbar>
  );
};

export default NavbarPage;
