import React, { useState } from 'react';
import * as XLSX from 'xlsx';
// import './styles.css';

export const ExcelTexas = () => {
  const [fileDataOne, setFileDataOne] = useState([]);
  const [fileDataTwo, setFileDataTwo] = useState([]);
  console.log('1', fileDataOne);
  console.log('2', fileDataTwo);

  const handleFileUpload = (file, setter) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        setter(data);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleFileChangeOne = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file, setFileDataOne);
  };

  const handleFileChangeTwo = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file, setFileDataTwo);
  };

  const mergeData = () => {
    const namesInDataOne = new Set(fileDataOne.map(item => item['Contact Full Name'].toLowerCase()));
  
    const mergedData = [...fileDataOne];
  
    fileDataTwo.forEach(item => {
      if (!namesInDataOne.has((item.name || "").toLowerCase())) {
        const newData = {
          "Company City": item.City || '',
          "Company Name": item.name || '',
          "Company Post Code": item['ZIP'] || '',
          "Company State Abbr": item.St || '',
          "Company Street 1": item['Delivery Address Suite/Apt'] || '',
          "Company Website": '', // Placeholder as no website is available in Data 2
          "Contact Full Name": item.name || '',
          "Email 1": '', // Placeholder as no email is available in Data 2
          "Title": '' // Placeholder as no title is available in Data 2
        };
        mergedData.push(newData);
      } else {
        // console.log(item);
      }
    });
  
    // Ensure all entries are using the 'Company Post Code' field, whether from Data One or Data Two
    mergedData.forEach(item => {
      if (!item['Company Post Code'] && item['ZIP']) {
        item['Company Post Code'] = item['ZIP'].split('-')[0];
      }
    });
  
    mergedData.sort((a, b) => a['Contact Full Name'].localeCompare(b['Contact Full Name']));
    setFileDataOne(mergedData);
  };
  
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(fileDataOne);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MergedData");
    XLSX.writeFile(wb, "MergedData.xlsx");
  };

  return (
    <div className='excelData'>
        <div className="excel-content">
            (Full List)
            <input type="file" onChange={handleFileChangeOne} accept=".xlsx,.xls" />
            (TX BAL)
            <input type="file" onChange={handleFileChangeTwo} accept=".xlsx,.xls" />
            <button onClick={mergeData}>Merge Data</button>
            <button onClick={exportToExcel}>Export to Excel</button>
            <h3>Merged Data:</h3>
            {/* <pre>{JSON.stringify(fileDataOne, null, 2)}</pre> */}
        </div>
    </div>
  );
};
