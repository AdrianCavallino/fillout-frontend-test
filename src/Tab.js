import React from 'react';

function Tab({ label, active, onClick }) {
  return (
    <button
      className={`tab-button${active ? ' active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default Tab; 