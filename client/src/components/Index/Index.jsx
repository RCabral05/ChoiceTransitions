import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadCSV from '../CSV/UploadCSV/UploadCSV'; // Adjust the path as needed
import './styles.css';
import { useCSV } from '../../context/CSVContext';

export const Index = () => {
  const { records } = useCSV();
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState([]);

  const handleNavigation = (path) => {
    navigate(path, { state: { csvData } });
  };

  return (
    <div className="index">
      <div className="index-content">
        <div className="btn-group">
          <UploadCSV onDataProcessed={(data) => {
            setCsvData(data);
            // Assuming 'data' is the CSV data and not just an event, adjust as needed
          }} />
          Total Records: {records}

          {records != 0 && (
            <button onClick={() => handleNavigation('/view-list')}>View List</button>
          )}
        </div>
      </div>
    </div>
  );
};
