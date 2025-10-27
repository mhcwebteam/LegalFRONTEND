// src/components/FormGroup.js
import React from 'react';

const FormGroup = ({ label, children, col = 6 }) => (
  <div className={`form-group col-md-${col} mb-3`}>
    <label className="form-label">{label}</label>
    {children}
  </div>
);

export default FormGroup;
