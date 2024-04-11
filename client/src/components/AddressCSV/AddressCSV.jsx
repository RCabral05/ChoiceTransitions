import React, { useState } from 'react';
import Papa from 'papaparse';
import { width } from '@mui/system';

const AddressCSV = () => {
  const [firstFileData, setFirstFileData] = useState([]);
  const [secondFileData, setSecondFileData] = useState([]);
  const [csvFileName, setCsvFileName] = useState('fullList.csv');
  console.log('first', firstFileData);
  console.log('second', secondFileData);

  const [fullList, setFullList] = useState([]);

  const handleFirstFileUpload = (event) => {
    const file = event.target.files[0];
    parseCSV(file, setFirstFileData);
  };

  const handleSecondFileUpload = (event) => {
    const file = event.target.files[0];
    parseCSV(file, setSecondFileData);
  };

  const parseCSV = (file, setData) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setData(results.data);
      },
    });
  };

  const compareAndCompileList = () => {
    // Map for street addresses to zip codes
    const addressZipMap = secondFileData.reduce((acc, data) => {
      const normalizedInputAddress = data?.input_address?.toLowerCase().trim().replace(/\s+[A-Z]{2}$/, '');
      acc[normalizedInputAddress] = data.zip;
      return acc;
    }, {});
  
    // Map for cities to zip codes for filling missing zips
    const cityZipMap = secondFileData.reduce((acc, data) => {
      const normalizedCity = data?.city?.toLowerCase().trim();
      if (normalizedCity && data.zip) {
        acc[normalizedCity] = data.zip; // Assume the last zip code for a city is the most accurate
      }
      return acc;
    }, {});
  
    const compiledData = firstFileData.map((data) => {
      const normalizedFirstAddress = data['Company Street 1']?.toLowerCase().trim();
      let zipCode = Object.keys(addressZipMap).find(secondAddress =>
        secondAddress === normalizedFirstAddress
      );
  
      if (!zipCode && data['Company City']) {
        // If the zip code is missing, look up the city in the cityZipMap
        const normalizedCity = data['Company City']?.toLowerCase().trim();
        zipCode = cityZipMap[normalizedCity];
      }
  
      // If there's a match or city zip code, add the zip code to the 'Company Post Code' field
      if (zipCode) {
        return { ...data, 'Company Post Code': addressZipMap[zipCode] || zipCode };
      }
      return data;
    });
  
    setFullList(compiledData);
  };
  


  const exportToCSV = (fileName = 'fullList.csv') => {
    // Convert the fullList array to a CSV string
    const csv = Papa.unparse(fullList);
    // Create a Blob from the CSV string
    const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    // Create a link element
    const downloadLink = document.createElement("a");
    // Create a URL for the blob
    const url = URL.createObjectURL(csvBlob);
    downloadLink.href = url;
    // Set the download attribute of the link to specify the file name
    downloadLink.setAttribute('download', fileName);
    // Append the link to the document
    document.body.appendChild(downloadLink);
    // Trigger the click event on the link
    downloadLink.click();
    // Remove the link after download
    document.body.removeChild(downloadLink);
  };
  

  
  

  return (
    <div style={{ marginTop: '20px', width:'100%', display:'flex', flexDirection:'column'}}>
      (Upload Empty ZIP)
      <input type="file" onChange={handleFirstFileUpload} accept=".csv" />
      (Upload CSV From Bot)
      <input type="file" onChange={handleSecondFileUpload} accept=".csv" />
      <button onClick={compareAndCompileList}>Match and Compile List</button>
      <div>
        {fullList.length > 0 && (
            <>
                <input 
                    type="text" 
                    value={csvFileName} 
                    onChange={(e) => setCsvFileName(e.target.value)} 
                    placeholder="Enter file name" 
                />
                <button onClick={() => exportToCSV(csvFileName)}>Export as CSV</button>
                <textarea value={JSON.stringify(fullList, null, 2)} rows="10" cols="50" readOnly />
            </>
        )}
      </div>
    </div>
  );
};

export default AddressCSV;
