// src/components/FileUpload.js
import React, { forwardRef } from 'react';

const FileUpload = forwardRef(({ name = 'document', onChange, multiple = false }, ref) => {
  return (
    <input
      type="file"
      ref={ref}
      name={name}
      className="form-control"
      onChange={onChange}
      multiple={multiple}
    />
  );
});

export default FileUpload;
