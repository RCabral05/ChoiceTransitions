import React from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useCSV } from '../../../context/CSVContext'; // Adjust the path as needed
import './styles.css';

const UploadCSV = () => {
  const { updateCSVData, updateExcelData, uploadedFiles, removeFileData } = useCSV(); // Use the updated custom hooks

  const handleFileChange = (e) => {
    Array.from(e.target.files).forEach(file => { // Updated to handle multiple file uploads
      const fileType = file.name.split('.').pop();

      if (fileType === 'csv') {
        parseCSV(file);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        parseExcel(file);
      } else {
        console.error('Unsupported file type');
      }
    });
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      complete: (result) => {
        updateCSVData(result.data, file.name); // Include file name
      },
      header: true,
    });
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      const wb = XLSX.read(buffer, { type: 'buffer' });
      const sheetsData = wb.SheetNames.map((name) => ({
        sheetName: name,
        data: XLSX.utils.sheet_to_json(wb.Sheets[name], { raw: false }) // Adjusted for more consistent data
      }));
      updateExcelData(sheetsData, file.name); // Include file name
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className='upload'>
      <input type="file" accept=".csv, .xlsx, .xls" multiple onChange={handleFileChange} />
      <div>
        <h3>Uploaded Files:</h3>
        <ul>
          {uploadedFiles.map(fileName => (
            <li key={fileName}>
              {fileName} <button onClick={() => removeFileData(fileName)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UploadCSV;
