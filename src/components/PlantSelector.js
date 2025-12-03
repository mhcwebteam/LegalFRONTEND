import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PlantSelector = ({ plants, selectedPlant, onChange, customMarginTop }) => {
console.log(plants,"plaaaaaaaaaaaaaaaaaaaaaaaa")

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null); // ✅ Add ref to root container

  useEffect(() => {
    console.log('Screen width:', window.innerWidth);
  }, []);

  const handleSelect = (plant) => {
 
    onChange({ target: { value: plant } });

    
    setOpen(false);

    
  };

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const styles = {
    container: {
      width: '260px',
      margin: 'auto',
  // marginTop: window.innerWidth <= 1396 ? customMarginTop : '0px',
  // //marginBottom: window.innerWidth <= 1396 ? '-5px' : '10px',
      position: 'relative',
      cursor: 'pointer',
      fontSize: '7px',
    },
    header: {
      backgroundColor: '#f0f0f0',
      padding: '5px 10px',
      borderRadius: '6px',
     marginTop:'-12px',
      fontWeight: 500,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '15px',
      fontSize: '12px',
      border: '2px solid #007bff', 
      boxShadow: '0 2px 6px rgba(0, 123, 255, 0.2)', 
      transition: 'all 0.3s ease-in-out', 
    },
    arrow: {
      fontSize: '13px',
      marginLeft: '10px',
    },
    list: {
      listStyle: 'none',
      margin: '8px 0 0 0',
      padding: 0,
      position: 'absolute',
      width: '100%',
      backgroundColor: '#fff',
      borderRadius: '6px',
      boxShadow: '0 2px 14px rgba(0, 0, 0, 0.12)',
      zIndex: 100,
      maxHeight: '240px',
      overflowY: 'auto',
      overflowX: 'hidden',   
    },
    item: {
      padding: '12px 18px',
      borderBottom: '1px solid #eee',
      transition: 'background-color 0.2s',
      fontSize: '14.5px',
      lineHeight: 1.4,
    },
    itemHover: {
  backgroundColor: '#305e8fff',
  boxShadow: 'inset 0 0 6px rgba(0, 123, 255, 0.2)', 
    },
  };

  return (
    <div style={styles.container} ref={dropdownRef}> {/* ✅ Attach ref */}
      <div
        style={styles.header}
        onClick={() => setOpen(!open)}
      >
        {selectedPlant || '-- Select a Plant --'}
        <span style={styles.arrow}>{open ? '▲' : '▼'}</span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            style={styles.list}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: {
                transition: { staggerChildren: 0.05 },
              },
              hidden: {
                transition: { staggerChildren: 0.03, staggerDirection: -1 },
              },
            }}
          >
            {plants.map((plant) => (
              <motion.li
                key={plant.loc}
                style={styles.item}
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: styles.itemHover.backgroundColor,
                  color: '#ffffff',
                }}
                onClick={() => handleSelect(plant.loc)}
              >
                {plant.loc}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlantSelector;
