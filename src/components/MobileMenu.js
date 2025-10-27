import React from 'react';
import { NavLink } from 'react-router-dom';
import './MobileMenu.css';

const MobileMenu = ({ closeMenu }) => {
  return (
    <>
      <div className="mobile-menu">
        <button className="close-btn" onClick={closeMenu}>
          &times;
        </button>
        <NavLink to="/create" onClick={closeMenu} activeClassName="active">
          Create
        </NavLink>
        <NavLink to="/update" onClick={closeMenu} activeClassName="active">
          Update
        </NavLink>
        <NavLink to="/modify" onClick={closeMenu} activeClassName="active">
          Modify
        </NavLink>
        <NavLink to="/view" onClick={closeMenu} activeClassName="active">
          View
        </NavLink>
      </div>
      <div className="mobile-menu-overlay" onClick={closeMenu}></div>
    </>
  );
};

export default MobileMenu;
