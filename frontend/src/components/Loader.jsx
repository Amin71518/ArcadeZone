import React from 'react';
import './Loader.css';

const Loader = ({ size = 40, color = '#3498db' }) => {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderColor: color,
    borderTopColor: 'transparent',
  };

  return (
    <div className="loader-container">
      <div className="loader-spinner" style={spinnerStyle}></div>
    </div>
  );
};

export default Loader;