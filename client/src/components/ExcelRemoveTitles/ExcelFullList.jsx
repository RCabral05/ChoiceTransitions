import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './styles.css';

export const ExcelFullList = () => {
  const [csvDataOne, setCsvDataOne] = useState([]);
  const [csvDataTwo, setCsvDataTwo] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  console.log('1', csvDataOne);
  console.log('2', csvDataTwo);
  console.log('combined', combinedData);

  const handleFileUpload = (event, setData) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setData(data);
    };
    reader.readAsArrayBuffer(file);
  };

  const updatePostCodes = () => {
    let newDataOne = csvDataOne.map(dataOneItem => {
      if (!dataOneItem['Company Post Code']) { // Check if 'Company Post Code' is missing
        const matchingEntry = csvDataTwo.find(dataTwoItem => dataTwoItem['Company Street 1'] === dataOneItem['Company Street 1']);
        if (matchingEntry) {
            console.log('matching', matchingEntry);
          return { ...dataOneItem, 'Company Post Code': matchingEntry['Company Post Code'] }; // Update 'Company Post Code'
        }
      }
      return dataOneItem; // Return the item as is if no update is needed
    });

    setCsvDataOne(newDataOne); // Set the updated data back to state
  };
  const escapeCSV = (str) => {
    if (str === undefined || str === null) { // Check if the string is undefined or null
      return '""'; // Return empty quotes for CSV format
    }
    // Escape double quotes and wrap the string in double quotes
    return `"${String(str).replace(/"/g, '""')}"`; 
  };

  const exportToCSV = () => {
    const fileName = prompt("Please enter a name for your CSV file:", "combined_data.csv");
    if (!fileName) {
      return; // if the user pressed cancel, then don't proceed
    }

    let csvContent = ["Contact Full Name", "Company Name", "Title", "Company Street 1", "Company Street 2",
      "Company City", "Company State Abbr", "Company Post Code", "Email 1", "Personal Email", "Contact Phone 1", "Company Website"].join(",") + "\r\n";

    csvDataOne.forEach(item => {
      const row = [
        escapeCSV(item['Contact Full Name']),
        escapeCSV(item['Company Name']),
        escapeCSV(item['Title']),
        escapeCSV(item['Company Street 1']),
        escapeCSV(item['Company Street 2']),
        escapeCSV(item['Company City']),
        escapeCSV(item['Company State Abbr']),
        escapeCSV(item['Company Post Code']),
        escapeCSV(item['Email 1']),
        escapeCSV(item['Personal Email']),
        escapeCSV(item['Contact Phone 1']),
        escapeCSV(item['Website']),
      ];
      csvContent += row.join(",") + "\r\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link); // Required for Firefox
    link.click(); // This will download the file
    document.body.removeChild(link); // Clean up
    URL.revokeObjectURL(url); // Free up memory by releasing the object URL
  };

  
  return (
    <div className='excelData'>
        <div className="excel-content">
            (COMBINED DATA CSV)
            <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={(e) => handleFileUpload(e, setCsvDataOne)}
                style={{marginBottom: '20px'}}
            />
            (EXCEL STATE (CLEAN) CSV)
            <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={(e) => handleFileUpload(e, setCsvDataTwo)}
            />
            <button onClick={updatePostCodes}>Update Post Codes</button>
            <button onClick={exportToCSV}>Export to CSV</button>
    
        </div>
       
        <div>
            {csvDataOne.map((item, index) => (
            <div key={index}>
                {item['Company Street 1']} - {item['Company Post Code']}
            </div>
            ))}
        </div>
    </div>
  );
};
