import React, { useState } from 'react';
import Tab from './Tab';

const tabData = [
  { label: 'Page 1', content: <div>This is Page 1</div> },
  { label: 'Page 2', content: <div>This is Page 2</div> },
  { label: 'Page 3', content: <div>This is Page 3</div> },
];

function Tabs() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabData.map((tab, idx) => (
          <Tab
            key={tab.label}
            label={tab.label}
            active={activeIndex === idx}
            onClick={() => setActiveIndex(idx)}
          />
        ))}
      </div>
      <div className="tabs-content">
        {tabData[activeIndex].content}
      </div>
    </div>
  );
}

export default Tabs; 