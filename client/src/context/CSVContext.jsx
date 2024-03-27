import React, { createContext, useContext, useState } from 'react';

const CSVContext = createContext();

export const CSVProvider = ({ children }) => {
  const [dataByState, setDataByState] = useState({});
  const [records, setRecords] = useState(0);
  console.log(dataByState);

  const updateCSVData = (csvData) => {
    const newStateData = csvData.reduce((acc, row) => {
      const state = row['Company State Abbr'] || 'Unknown';
      if (!acc[state]) acc[state] = [];
      acc[state].push(row);
      return acc;
    }, {});

    const totalRecords = Object.values(newStateData).reduce((sum, currentArray) => sum + currentArray.length, 0);

    setDataByState(newStateData);
    setRecords(totalRecords); 
  };

  return (
    <CSVContext.Provider value={{ dataByState, updateCSVData, records }}>
      {children}
    </CSVContext.Provider>
  );
};

export const useCSV = () => useContext(CSVContext);
