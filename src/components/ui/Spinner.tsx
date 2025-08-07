import React from 'react';

const Spinner: React.FC = () => (
  <div className="p-8 text-center">
    <div className="w-8 h-8 border-4 border-[#89CFF0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    <p className="text-gray-600">Loading…</p>
  </div>
);

export default Spinner;