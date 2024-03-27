import React, { createContext, useContext, useState } from 'react';

const CSVContext = createContext();

export const CSVProvider = ({ children }) => {
  const [dataByState, setDataByState] = useState({});

  const updateCSVData = (csvData) => {
    const newStateData = csvData.reduce((acc, row) => {
      const state = row['Company State Abbr'] || 'Unknown';
      if (!acc[state]) acc[state] = [];
      acc[state].push(row);
      return acc;
    }, {});

    setDataByState(newStateData);
  };

  return (
    <CSVContext.Provider value={{ dataByState, updateCSVData }}>
      {children}
    </CSVContext.Provider>
  );
};

export const useCSV = () => useContext(CSVContext);
