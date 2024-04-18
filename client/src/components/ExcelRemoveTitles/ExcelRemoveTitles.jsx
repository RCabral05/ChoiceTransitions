import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ExcelFullList } from './ExcelFullList';
import './styles.css';

export const ExcelRemoveTitles = () => {
  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [data, setData] = useState([]);
  const [workbookBuffer, setWorkbookBuffer] = useState(null); // Store the read file buffer
  const [removedNames, setRemovedNames] = useState([]); // To store and display removed names
  console.log(data);
  const [filename, setFilename] = useState('ExportedData');

  const removeTitles = [
    'United States Air Force',
    'US Air Force',
    'Texas A&M College of Dentistry',
    'The University of Texas Health Science Center at Houston School of Dentistry',
    'The University of Texas Medical Branch',
    'Midwestern State University',
    'U.s. Army Network Enterprise Technology Command',
    'Veterans Health Care System of the Ozarks',
    'UAMS',
    'Arkansas Department of Human Services & Owner of Huntington Learning Center',
    'University of Arkansas',
    'University of Arkansas for Medical Sciences',
    'University of Michigan',
    'University of Detroit Mercy School of Dentistry',
    'University of Michigan School of Dentistry',
    'University of Detroit Mercy',
    'University Family Dentistry',
    'International College of Dentists',
    'Lansing Community College',
    'Spring Arbor University',
    'University of Michigan Medical School',
    'University of Michigan School of Dentistry Mexican Dentist',
    'University of North Carolina at Chapel Hill',
    'East Carolina University',
    'United States Army Reserve',
    'UNC',
    'University of North Carolina',
    'Retire from Rentals',
    'UNC at Chapel Hill',
    'East Carolina University School of Dental Medicine',
    'Unc School of Dentistry',
    'University Hospitals',
    'University of Cincinnati',
    'Case Western Reserve University',
    'The Ohio State University',
    'Case Western Reserve University',
    'Cleveland Dental Institute',
    'MedVet Medical & Cancer Centers for Pets',
    'Case Western Reserve University School of Dental Medicine',
    'The Ohio State University at Newark',
    'Medical University of South Carolina',
    'Midlands Technical College',
    'Universidade Federal De Santa Catarina',
    'US Army Medical Department',
    'The University of Texas Health Science Center',
    'Texas A&M University',
    'United States Air Force Dental Corp.',
    'United States Air Force Reserve',
    'The University of Texas Health Science Center at Houston',
    'TAMU',
    'Texas A&M University School of Dentistry',
    'UAB School of Dentistry',
    'New York Dental School',
    'University of Alabama at Birmingham',
    'Brightwood College',
    'UAB Medicine',
    'US Air Force Reserve',
    'Augusta University',
    'U.s. Air Force Reserve',
    'University of Mississippi Medical Center',
    'UMMC',
    'The University of Tennessee Health Science Center',
    'Vanderbilt University Medical Center',
    'United States Department of the Air Force',
    'University General Dentists',
    'Uthsc',
    'Florida State University College.',
    'Nova Southeastern University',
    'University of Miami',
    'University of Florida Dental Clinic',
    'University of Florida',
    'Remington College',
    'University of Florida College of Dentistry',
    'Miami Dade College, Broward College and Nova Southeastern University',
    'University of Miami, Miller School of Medicine',
    'University of Florida-Seminole AEGD',
    'Florida International University',
    'University at Buffalo',
    'New York University',
    'Tel Aviv University',
    'North Shore University Hospital',
    'University of Rochester',
    'NYU',
    'United States Army',
    'University Pediatric Dentistry',
    'Columbia University in the City of New York',
    'Stony Brook School of Dental Medicine',
    'United Nations',
    'Staten Island University Hospital',
    'NYU College of Dentistry',
    'U.s. Army Dental Corps',
    'Brookdale University Hospital and Medical Center',
    'New York University College of Dentistry',
    'New York University Abu Dhabi',
    'University of Rochester Medical Center',
    'Nyu School of Dentistry',
    'Stony Brook University Hospital',
    'U.S Army',
    'Columbia University',
    'Nassau University Medical Center',
    'Columbia University in the City of New York',
    'University Pediatric Dentistry',
    'U.s. Army Active Duty',
    'The Harvard School of Dental Medicine',
    'NYU Lutheran',
    'New York Medical College',
    'State University of New York at Buffalo'
];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
    readExcel(file);
  };

  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target.result;
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      setWorkbookBuffer(buffer);
      const sheetNames = workbook.SheetNames;
      const sheetOptions = sheetNames.map((name, index) => ({
        name,
        index
      }));
      setSheets(sheetOptions);
      if (sheetNames.length > 0) {
        const firstSheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        filterData(firstSheetData);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filterData = (sheetData) => {
    const filteredData = [];
    const namesRemoved = [];

    sheetData.forEach(entry => {
      if (removeTitles.includes(entry['Company Name'])) {
        namesRemoved.push(entry['Company Name']); // Log the removed name
      } else {
        filteredData.push(entry);
      }
    });

    setData(filteredData);
    setRemovedNames(namesRemoved); // Update state to keep track of removed names
    console.log("Removed names:", namesRemoved);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered Data');
    XLSX.writeFile(wb, `${filename}.csv`);
  };

  const handleSheetChange = (event) => {
    const sheetIndex = parseInt(event.target.value);
    setSelectedSheetIndex(sheetIndex);
    const sheetName = sheets[sheetIndex].name;
    const workbook = XLSX.read(workbookBuffer, { type: 'buffer' });
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    filterData(sheetData);
  };

  return (
    <div className='excelData'>
      <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
      {sheets.length > 0 && (
        <select value={selectedSheetIndex} onChange={handleSheetChange}>
          {sheets.map((sheet, index) => (
            <option key={index} value={index}>
              {sheet.name}
            </option>
          ))}
        </select>
      )}
      <input
        type="text"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
        placeholder="Enter filename"
      />
      <button onClick={handleExport}>Export as CSV</button>
      <div>
        Filtered Data: <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      {removedNames.length > 0 && (
        <div>
          Removed Names: <pre>{JSON.stringify(removedNames, null, 2)}</pre>
        </div>
      )}


      <ExcelFullList />
    </div>
  );
};
