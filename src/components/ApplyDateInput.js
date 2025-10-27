import React from 'react';

const ApplyDateInput = ({ value, onChange, className }) => (
  <input
    type="date"
    name="applyDate"
    value={value}
    onChange={onChange}
    className={className}
  />
);

export default ApplyDateInput;
