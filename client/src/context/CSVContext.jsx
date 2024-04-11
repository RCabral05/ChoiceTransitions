import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const CSVContext = createContext();

export const CSVProvider = ({ children }) => {
  const [dataByState, setDataByState] = useState({});
  const [records, setRecords] = useState(0);
  const [deletedNames, setDeletedNames] = useState([]);
  const [dataBySheet, setDataBySheet] = useState({});
  const [dataByExcel, setDataByExcel] = useState({});
  console.log('data', dataBySheet);
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

  function chunkArray(array, size) {
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
        chunkedArr.push(array.slice(i, i + size));
    }
    console.log('11111', chunkedArr);
    return chunkedArr;
}

const updateExcelData = async (excelData, fileName) => {
    const sheetsToExclude = ['Template', 'Import', 'Deleted', 'Testing'];
    const batchSize = 100; // Define the size of each batch

    const newSheetData = {};
    
    excelData.forEach(({ sheetName, data }) => {
      if (sheetName === "Deleted") {
          // If the sheet is the 'Deleted' one, set the deleted names
          setDeletedNames(data.map(record => ({
              name: record["Contact Full Name"]?.trim(), // Adjust the key according to your data structure
              reason: record["Reason"]?.trim() // Assuming there's a reason column or similar
          })));
      } else if (!sheetsToExclude.includes(sheetName)) {
          // For all other sheets that are not to be excluded
          const chunkedData = chunkArray(data, batchSize).map(chunk => chunk.map(record => ({
              companyCity: record["Company City"]?.trim() || "",  // Make sure keys match your data source
              companyName: record["Company Name"] || "",
              companyPostCode: record["Company Post Code"] || "",
              companyStateAbbr: record["Company State Abbr"] || "",
              companyStreet1: record["Company Street 1"]?.trim() || "",
              contactFullName: record["Contact Full Name"]?.trim() || "",
              countyName: record["County Name"] || "",
              title: record["Title"] || "",
              companyStreet2: record["Company Street 2"] || "",
              email1: record["Email1"] || "",
              personalEmail: record["Personal Email"] || "",
              contactPhone: record["Contact Phone"] || "",
              companyWebsite: record["Company Website"] || "",
          })));
          newSheetData[sheetName] = chunkedData;
      }
  });

    const totalRecords = excelData
        .filter(sheet => !sheetsToExclude.includes(sheet.sheetName))
        .reduce((sum, { data }) => sum + data.length, 0);

    console.log('new sheet data:', newSheetData);
    setExcelRecords(excelRecords + totalRecords);
    setDataBySheet(newSheetData);

    if (!uploadedFiles.includes(fileName)) {
        setUploadedFiles([...uploadedFiles, fileName]);
    }

    for (const [sheetName, recordChunks] of Object.entries(newSheetData)) {
        for (const records of recordChunks) {
            try {
                const response = await axios.post('http://localhost:3000/upload', records);
                console.log(`${sheetName} batch upload response:`, response.data);
            } catch (error) {
                console.error(`Error uploading ${sheetName} batch:`, error.response ? error.response.data : error.message);
            }
        }
    }
};

const fetchRecords = async (state) => {
  try {
    const url = `http://localhost:3000/records`;
    const response = await axios.get(`${url}?state=${state}`);
    console.log('Records fetched successfully:', response.data);
    setDataByExcel(response.data.data);
    console.log('Excel Records set successfully');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch records:', error.response ? error.response.data : error.message);
    return null;
  }
};





  const removeFileData = (fileName) => {
    // Remove the file from the uploadedFiles array
    setUploadedFiles(uploadedFiles.filter(file => file !== fileName));

    // Additional logic to remove data associated with that file needs to be implemented
    // This might include resetting dataByState, dataBySheet, and adjusting records, excelRecords as needed
  };

  const value = useMemo(() => ({
    dataByState, 
    updateCSVData, 
    records, 
    dataBySheet, 
    dataByExcel, // Added to the value object
    updateExcelData, 
    excelRecords, 
    uploadedFiles, 
    deletedNames, 
    removeFileData,
    fetchRecords
  }), [
    dataByState, 
    records, 
    dataBySheet, 
    dataByExcel, 
    excelRecords, 
    uploadedFiles, 
    deletedNames
  ]);


  return (
    <CSVContext.Provider value={value}>
      {children}
    </CSVContext.Provider>
  );
};

export const useCSV = () => useContext(CSVContext);
