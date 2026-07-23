import React from 'react';

export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  id,
  style = {},
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }}>
      <label 
        htmlFor={id} 
        style={{ 
          fontSize: '12px', 
          fontWeight: 'bold', 
          marginBottom: '6px',
          color: '#333',
          textAlign: 'center', // Centers labels neatly above input boxes
          whiteSpace: 'nowrap'
        }}
      >
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          height: '38px',
          padding: '0 10px',
          boxSizing: 'border-box',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontSize: '14px',
          backgroundColor: '#fff',
          outline: 'none',
        }}
      />
    </div>
  );
}