import React, { useState } from 'react';
import CardWithHeader from '../components/CardWithHeader';
import PcbTabs from '../components/PcbTabs';
import PollutionTable from '../components/PcbModifyTable';
import AirportModifyTable from '../components/AirportModifyTable1';
import WaterModifyTable from '../components/WaterModifyTable';
import GhmcModify from '../components/GhmcModify';

const tabList = [
  'Pollution Control Board',
  'Airport Authority',
  'HMDA',
  'Fire',
  'Water',
  'RERA',
  'Miscellaneous',
];

const Modify = () => {
  const [key, setKey] = useState(tabList[0]);

  return (
    <CardWithHeader title="Modify Section">
      <PcbTabs keyState={key} setKey={setKey} tabList={tabList}>
        {key === 'Pollution Control Board' && <PollutionTable />}
        {key === 'Airport Authority' && <AirportModifyTable />}
        {key === 'HMDA' && <GhmcModify/>}
        {key === 'Fire' && <p>This is the Fire tab.</p>}
        {key === 'Water' && <WaterModifyTable/>}
        {/* {key === 'RERA' && } */}
        {key === 'Miscellaneous' && <p>This is the miscellaneous tab.</p>}


      </PcbTabs>
    </CardWithHeader>
  );
};

export default Modify;
