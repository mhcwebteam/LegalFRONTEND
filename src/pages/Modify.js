import React, { useState } from 'react';
import CardWithHeader from '../components/CardWithHeader';
import PcbTabs from '../components/PcbTabs';
import PollutionTable from '../components/PcbModifyTable';
import AirportModifyTable from "../components/AirportModifyTable"
import WaterModifyTable from '../components/WaterModifyTable';
import GhmcModify from '../components/GhmcModify';
import FireModifyTable from '../components/FireModifyTable';
import ReraModifyTable from '../components/ReraModifyTable';

const tabList = [
  'Pollution Control Board',
  'Airport Authority',
   'Fire',
  'HMDA',
  'Water',
   'Rera',
  'Miscellaneous',
];

const Modify = () => {
  const [key, setKey] = useState(tabList[0]);

  return (
    <CardWithHeader title="Modify Section">
      <PcbTabs keyState={key} setKey={setKey} tabList={tabList}>
        {key === 'Pollution Control Board' && <PollutionTable />}
        {key === 'Airport Authority' && <AirportModifyTable />}
        {key === 'Fire' &&  <FireModifyTable />}
           {key === 'HMDA' && <GhmcModify/>}
        {key === 'Water' && <WaterModifyTable/>}
        {key === 'Rera' &&  <ReraModifyTable/>}
        {key === 'Miscellaneous' && <p>This is the miscellaneous tab.</p>}


      </PcbTabs>
    </CardWithHeader>
  );
};

export default Modify;
