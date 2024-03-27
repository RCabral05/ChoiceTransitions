import React from 'react';
import Papa from 'papaparse';
import { useCSV } from '../../../context/CSVContext'; // Adjust the path as needed

const UploadCSV = () => {
  const { updateCSVData } = useCSV(); // Use the custom hook

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          updateCSVData(result.data); // Update the context state
        },
        header: true,
      });
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
    </div>
  );
};

export default UploadCSV;
