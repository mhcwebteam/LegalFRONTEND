

import React, { useState, useEffect } from "react";

const ProcessField = ({ value, className}) => {

 
  return (
    <input
      type="text"
      name="process"
      value={value}
      readOnly
      placeholder="Process"
      className={className}
      style={{ backgroundColor: '#f0f0f0' }}
    />
  );
};

export default ProcessField;

