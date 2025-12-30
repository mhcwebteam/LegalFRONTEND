import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Sidebar.css';

const menuItems = [
  { label: 'Create', icon: '🆕', path: '/create' },
    { label: 'Edit', icon: '✍️', path: '/Edit' },
  { label: 'Modify', icon: '🔧', path: '/modify' },
  { label: 'Update', icon: '✏️', path: '/update' },
  { label: 'Amendment', icon: '📝', path: '/amendment' },
  { label: 'Tax Return', icon: '💰', path: '/taxreturns' },
  { label: 'Report', icon: '👁️', path: '/report' },
];

const Sidebar = ({ isMobile, isOpen, closeSidebar, setIsHovered, isHovered }) => {
  const location = useLocation();

  const sidebarVariants = isMobile
    ? {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 }},
        closed: { x: -220, transition: { type: 'spring', stiffness: 300, damping: 30 }},
      }
    : {
        expanded: { width: 180, transition: { duration: 0.3 }},
        collapsed: { width: 60, transition: { duration: 0.3 }},
      };

  const listVariants = {
    expanded: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    },
    collapsed: {}
  };

  const itemVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: 'easeOut' }
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  };

  const animateState = isMobile
    ? (isOpen ? 'open' : 'closed')
    : (isHovered ? 'expanded' : 'collapsed');

  return (
    <motion.div
      className="sidebar"
      variants={sidebarVariants}
      animate={animateState}
      initial={false}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {isMobile && (
        <button className="close-btn d-md-none" onClick={closeSidebar}>
          ✖
        </button>
      )}

      <motion.div className="menu-items" variants={listVariants} animate={animateState}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={isMobile ? closeSidebar : undefined}
            >
              <motion.div
                className={`nav-link-content ${isActive ? 'active' : ''}`}
                whileHover={{
                  scale: 1.05,
                  x: 5,
                  backgroundColor: '#334155',
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                animate={isActive ? { scale: 1.05, backgroundColor: '#1e293b' } : { scale: 1, backgroundColor: 'transparent' }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <span className="icon">{item.icon}</span>
                <motion.span className="label" variants={itemVariants}>
                  {(isMobile || isHovered) && item.label}
                </motion.span>
              </motion.div>
            </NavLink>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
