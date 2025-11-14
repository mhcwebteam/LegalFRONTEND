import React, { useState } from 'react';
import CardWithHeader from '../components/CardWithHeader';
import PcbTabs from '../components/PcbTabs';
import PollutionTable from '../components/PcbUpdateTable';
import WaterUpdateTable from '../components/WaterUpdateTable';
import GhmcUpdate from '../components/GhmcUpdate';
import AirportUpdateTable from '../components/AirportUpdateTable';
import FireUpdateTable from '../components/FireUpdateTable';
import ReraUpdateTable from '../components/ReraUpdateTable';


const tabList = [
  'Pollution Control Board',
  'Airport Authority',
  'HMDA',
  'Fire',
  'Water',
    'Rera',
  'Miscellaneous'
];

const Update = () => {
   const [key, setKey] = useState(tabList[0]);
  return (
   <CardWithHeader title="Update Section">

     <PcbTabs keyState={key} setKey={setKey} tabList={tabList}>
        {key === 'Pollution Control Board' && <PollutionTable />}
        {key === 'Airport Authority' && <AirportUpdateTable/>}
        {key === 'HMDA' && <GhmcUpdate/>}
        {key === 'Fire' && <FireUpdateTable/>}
        {key === 'Water' && <WaterUpdateTable/>}
              {key === 'Rera' &&  <ReraUpdateTable/>}
           {key === 'Miscellaneous' && <p>This is the Miscellaneous tab.</p>}
      </PcbTabs>
    </CardWithHeader>
  );

};

export default Update;