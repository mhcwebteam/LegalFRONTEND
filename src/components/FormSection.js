// src/components/FormSection.js
import React from 'react';

const FormSection = ({ title, children }) => {
  return (
    <div className="pollution-container">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default FormSection;
