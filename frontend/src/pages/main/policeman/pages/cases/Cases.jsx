import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CaseOverview from './CaseOverview';
import CaseDetails from './CaseDetails';
import CaseAction from './CaseAction';

const Cases = () => {
  return (
    <div>
      {/* Removed top navbar links */}
      <Routes>
        <Route index element={<CaseOverview />} />
        <Route path="details" element={<CaseDetails />} />
        <Route path="action" element={<CaseAction />} />
        
      </Routes>
    </div>
  );
};

export default Cases;
