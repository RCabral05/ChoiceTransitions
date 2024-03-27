import React, { createContext, useContext, useState } from 'react';

const CSVContext = createContext();

export const CSVProvider = ({ children }) => {
  const [dataByState, setDataByState] = useState({});
  const [records, setRecords] = useState(0);

  const [dataBySheet, setDataBySheet] = useState({});
  const [excelRecords, setExcelRecords] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Added to track uploaded files

  const updateCSVData = (csvData, fileName) => {
    // Assuming csvData is an array of objects
    const newStateData = csvData.reduce((acc, row) => {
      const state = row['Company State Abbr'] || 'Unknown';
      if (!acc[state]) acc[state] = [];
      acc[state].push(row);
      return acc;
    }, {});

    const totalRecords = Object.values(newStateData).reduce((sum, currentArray) => sum + currentArray.length, 0);

    setDataByState(newStateData);
    setRecords(records + totalRecords); // Increment records count

    if (!uploadedFiles.includes(fileName)) {
      setUploadedFiles([...uploadedFiles, fileName]); // Track uploaded file
    }
  };

  const updateExcelData = (excelData, fileName) => {
    // Assuming excelData is an array of objects { sheetName: string, data: Array }
    const newSheetData = excelData.reduce((acc, { sheetName, data }) => {
      acc[sheetName] = data;
      return acc;
    }, {});

    const totalRecords = excelData.reduce((sum, { data }) => sum + data.length, 0);

    setDataBySheet(newSheetData);
    setExcelRecords(excelRecords + totalRecords); // Increment excelRecords count

    if (!uploadedFiles.includes(fileName)) {
      setUploadedFiles([...uploadedFiles, fileName]); // Track uploaded file
    }
  };

  const removeFileData = (fileName) => {
    // Remove the file from the uploadedFiles array
    setUploadedFiles(uploadedFiles.filter(file => file !== fileName));

    // Additional logic to remove data associated with that file needs to be implemented
    // This might include resetting dataByState, dataBySheet, and adjusting records, excelRecords as needed
  };

  return (
    <CSVContext.Provider value={{ 
      dataByState, 
      updateCSVData, 
      records, 
      dataBySheet, 
      updateExcelData, 
      excelRecords, 
      uploadedFiles, 
      removeFileData 
    }}>
      {children}
    </CSVContext.Provider>
  );
};

export const useCSV = () => useContext(CSVContext);
