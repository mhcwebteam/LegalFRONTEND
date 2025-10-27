import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { TabIcons, TabLabels } from './TabIcons';
import './PcbTabs.css';

const PcbTabs = ({ keyState, setKey, tabList, children }) => {
  return (
    <Tabs activeKey={keyState} onSelect={setKey} fill justify className="mb-3 custom-tabs">
      {tabList.map((tab) => {
        const key = tab.toLowerCase().replace(/\s+/g, '');
        const isActive = keyState === tab;

        return (
          <Tab
            key={tab}
            eventKey={tab}
            title={`${TabIcons[key] || ''} ${TabLabels[key] || tab}`}
          >
            {isActive && children}
          </Tab>
        );
      })}
    </Tabs>
  );
};

export default PcbTabs;
