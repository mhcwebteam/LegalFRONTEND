import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CategorySelector = ({ category, categories, onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null); // ✅ Step 1: create ref

  const handleSelect = (selected) => {
    onChange({ target: { value: selected } });
    setOpen(false);
  };

   // ✅ Step 2: Close on outside click
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
      width: '300px',
      margin: '12px auto 0 auto',
      position: 'relative',
      cursor: 'pointer',
      fontSize: '10px',
    },
    header: {
      backgroundColor: '#f0f0f0',
      padding: '9px 18px',
      borderRadius: '6px',
      fontWeight: 500,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '44px',
      fontSize: '15px',
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
      fontSize: '14.5px',
      lineHeight: 1.4,
      cursor: 'pointer',
    },
    lastItem: {
      borderBottom: 'none',
    },
  };

  return (
    <div ref={dropdownRef} style={styles.container}>
      <div style={styles.header} onClick={() => setOpen(!open)}>
        {category || '-- Select a Category --'}
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
              visible: { transition: { staggerChildren: 0.05 } },
              hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
            }}
          >
            {categories.map((item, index) => (
              <motion.li
                key={item.CATEGORY ?? `cat-${index}`}
                style={{
                  ...styles.item,
                  ...(index === categories.length - 1 ? styles.lastItem : {}),
                }}
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: '#f2f2f2',
                }}
                onClick={() => handleSelect(item.CATEGORY)}
              >
                {item.CATEGORY}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategorySelector;
