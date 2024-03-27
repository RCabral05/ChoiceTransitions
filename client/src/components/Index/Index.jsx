// Index.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadCSV from '../CSV/UploadCSV/UploadCSV'; // Import the UploadCSV component
import './styles.css';

export const Index = () => {
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState([]);

  const handleNavigation = (path) => {
    if(path === '/view-list'){
      navigate(path, { state: { csvData } }); // Pass the CSV data via navigation state
    } else {
      navigate(path);
    }
  };

  return (
    <div className="index">
      <div className="index-content">
        <div className="btn-group">
          <UploadCSV onDataProcessed={setCsvData} />

          <button onClick={() => handleNavigation('/view-list')}>View List</button>
          <button onClick={() => handleNavigation('/map')}>View Map</button>
          <button onClick={() => handleNavigation('/yet-another-path')}>Yet Another Action</button>
        </div>
      </div>
    </div>
  );
};
