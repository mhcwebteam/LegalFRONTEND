import React, { useState } from 'react';
import CardWithHeader from '../components/CardWithHeader';
import PcbTabs from '../components/PcbTabs';
import PollutionTable from '../components/PcbUpdateTable';
import WaterUpdateTable from '../components/WaterUpdateTable';

const tabList = [
  'Pollution Control Board',
  'Airport Authority',
  'HMDA',
  'Fire',
  'Water',
  'Miscellaneous'
];

const Update = () => {
   const [key, setKey] = useState(tabList[0]);
  return (
   <CardWithHeader title="Update Section">

     <PcbTabs keyState={key} setKey={setKey} tabList={tabList}>
        {key === 'Pollution Control Board' && <PollutionTable />}
        {key === 'Airport Authority' && <p>This is the Airport Authority tab.</p>}
        {key === 'HMDA' && <p>This is the HMDA tab.</p>}
        {key === 'Fire' && <p>This is the Fire tab.</p>}
        {key === 'Water' && <WaterUpdateTable/>}
           {key === 'Miscellaneous' && <p>This is the Miscellaneous tab.</p>}
      </PcbTabs>
    </CardWithHeader>
  );

};

export default Update;  