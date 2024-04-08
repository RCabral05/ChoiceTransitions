import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ExportIcon from '@mui/icons-material/Downloading';
import RuleIcon from '@mui/icons-material/Rule';
import './styles.css';

const CompareData = ({stateData, sheetData, state, deletedNames}) => {
    const [data, setData] = useState([]);
    const [person, setPerson] = useState([]);
    const [addressMismatchLog] = useState([]);
    const [combinedData, setCombinedData] = useState([]);
    const [selectedHeaders, setSelectedHeaders] = useState({});
    const [headersOrder, setHeadersOrder] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alreadyMailed, setAlreadyMailed] = useState([]);
    const [delName, setDelName] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const fileInputRef = useRef(null); 
    const removeTitles = [
        'DMD Candidate',
    ];

    // console.log('delName', delName);
    console.log('excel data', data);
    console.log('combined data', combinedData);
    console.log('deleted names from excel', deletedNames);
    console.log('address already mailed', alreadyMailed);
    console.log('address mismatch (rd = road)', addressMismatchLog);
    console.log('contact existed but email updated', person);

    useEffect(() => {
        // Directly access sheetData for the current state if it exists
        const sheetDataForState = sheetData[state];
        
        if (sheetDataForState) {
            // Set the data for the current state
            setData(sheetDataForState);
    
            // Proceed to combine and filter data as needed
            const initialCombined = combineAndFilterData(stateData, sheetDataForState, []);
            setCombinedData(initialCombined);
            
            // Setup headers based on the combined data
            if (initialCombined.length > 0) {
                const allHeaders = Object.keys(initialCombined[0]);
                setHeadersOrder(allHeaders);
                const headersSelection = allHeaders.reduce((acc, header) => ({ ...acc, [header]: true }), {});
                setSelectedHeaders(headersSelection);
            }
        }
    }, [sheetData, stateData, state]); // Dependencies include stateData, sheetData, and state
    

    useEffect(() => {
        // Filter deleted names based on the state and re-filter combined data if necessary
        const namesFromState = deletedNames.filter(del => del.State === state);
        setDelName(namesFromState);
    
        if (namesFromState.length > 0 && stateData && sheetData[state]) {
            // Only re-filter if we have deleted names for the current state
            const reFilteredCombined = combineAndFilterData(stateData, sheetData[state], namesFromState);
            setCombinedData(reFilteredCombined);
        }
    }, [deletedNames, state, stateData, sheetData]);

    const normalizeText = (text) => {
        if (!text) return '';
        return text.toLowerCase()
                   .replace(/\b(st|street)\b/gi, 'street')
                   .replace(/\b(ave|avenue)\b/gi, 'avenue')
                   .replace(/\b(rd|road)\b/gi, 'road')
                   .replace(/\b(dr|drive)\b/gi, 'drive')
                   .replace(/\b(blvd|boulevard)\b/gi, 'boulevard')
                   .replace(/\b(ln|lane)\b/gi, 'lane')
                   .replace(/\b(ct|court)\b/gi, 'court')
                   .replace(/\b(sq|square)\b/gi, 'square')
                   .replace(/\b(xing|crossing)\b/gi, 'crossing')
                   .replace(/\b(pl|place)\b/gi, 'place')
                   .replace(/\b(hwy|highway)\b/gi, 'highway')
                   .replace(/\b(ste|suite)\b/gi, 'suite')
                   .replace(/\b(pt|point)\b/gi, 'point')
                   .replace(/\b(cir|circle)\b/gi, 'circle');
    };
    
    
    

    const combineAndFilterData = (dataOne, dataTwo, delName) => {
        const combined = [...dataOne, ...dataTwo];
        const uniqueData = [];
        const duplicates = []; // To store duplicates for logging
        const entriesToRemoveDeleted = [];
        console.log('Contact exists but email updated', person);
        const entriesToRemoveTitle = [];
        const entriesToRemove = entriesToRemoveDeleted + entriesToRemoveTitle;
        console.log("Entries to remove", entriesToRemove);

       // Filter out entries based on titles
        const filteredByTitles = combined.filter(item => {
            if (item.Title && removeTitles.includes(item.Title)) {
                entriesToRemoveTitle.push(item); // Add to entriesToRemove if title matches
                return false; // Exclude this item from the result
            }
            return true; // Include this item in the result
        });

        console.log("Entries removed due to title match:", entriesToRemoveTitle);

        // Further filter out entries based on deleted names
        const filteredCombined = filteredByTitles.filter(item => {
            if (!item["Contact Full Name"]) return true; // Skip if no name provided

            const itemNameParts = item["Contact Full Name"].split(' ').filter(Boolean);
            const firstName = itemNameParts[0].toLowerCase();
            const lastName = itemNameParts[itemNameParts.length - 1].toLowerCase();

            const isDeletedName = delName?.some(delN => 
                delN.FirstName.toLowerCase() === firstName && 
                delN.LastName.toLowerCase() === lastName
            );

            if (isDeletedName) {
                // console.log('?', isDeletedName);
                entriesToRemoveDeleted.push(item); // Optionally log removed entries
                return false; // Exclude this item
            }
            return true;
        });

        console.log("Entries removed due to matching deleted names:", entriesToRemoveDeleted);

        filteredCombined.forEach(item => {
            if (!item["Contact Full Name"]) {
                uniqueData.push(item); // Consider it unique and skip further checks
                return; // Exit this iteration
            }
    
            const itemNameParts = item["Contact Full Name"].split(' ').filter(Boolean);
            const lastName = itemNameParts[itemNameParts.length - 1].toLowerCase();
            const firstName = itemNameParts[0].toLowerCase();
    
            let foundDuplicate = false;
            
            for (let i = 0; i < uniqueData.length; i++) {
                const uniqueItem = uniqueData[i];
                if (!uniqueItem["Contact Full Name"]) continue;
    
                const uniqueNameParts = uniqueItem["Contact Full Name"].split(' ').filter(Boolean);
                const uniqueLastName = uniqueNameParts[uniqueNameParts.length - 1].toLowerCase();
                const uniqueFirstName = uniqueNameParts[0].toLowerCase();

                const normalizedUniqueAddress = normalizeText(uniqueItem["Company Street 1"]);
                const normalizedItemAddress = normalizeText(item["Company Street 1"]);
                // Check last names and first names match
                if (lastName === uniqueLastName && firstName === uniqueFirstName) {
                    const normalizedUniqueAddress = normalizeText(uniqueItem["Company Street 1"]);
                    const normalizedItemAddress = normalizeText(item["Company Street 1"]);
                    const originalUniqueAddress = uniqueItem["Company Street 1"].toLowerCase();
                    const originalItemAddress = item["Company Street 1"].toLowerCase();
                    if (normalizedUniqueAddress === normalizedItemAddress) {
                        if (originalUniqueAddress !== normalizedUniqueAddress || originalItemAddress !== normalizedItemAddress) {
                            // Log the address mismatches if the normalized addresses match but original ones do not
                            addressMismatchLog.push({
                                uniqueName: uniqueItem["Contact Full Name"],
                                itemName: item["Contact Full Name"],
                                originalUniqueAddress,
                                originalItemAddress,
                                normalizedUniqueAddress,
                                normalizedItemAddress
                            });
                        }
                        foundDuplicate = true; // Set as duplicate because addresses match after normalization
                        break;
                    }
                    // Check if addresses match
                    // Now, handle email logic according to new rules
                    if (uniqueItem["Email 1"] && !item["Email 1"]) {
                        // The existing item has an email, and the new item does not; consider it a duplicate, but do nothing (prefer the one with the email).
                        const personExists = person.some(ppl => 
                            ppl.updated["Contact Full Name"] === uniqueItem["Contact Full Name"] && 
                            ppl.updated["Email 1"] === uniqueItem["Email 1"]
                        );
    
                        if (!personExists) {
                            person.push({
                                updated: uniqueItem // Push the uniqueItem since it contains the email
                            });
                        }
                        foundDuplicate = true;
                        break;
                    } else if (!uniqueItem["Email 1"] && item["Email 1"]) {
                        // The new item has an email, and the existing item does not; replace the existing item with the new one.
                        uniqueData[i] = item; // Replace with the item that has an email.
                        foundDuplicate = true;
                        break;
                    } else if (uniqueItem["Email 1"] === item["Email 1"]) {
                        // Both items have the same email; consider it a duplicate, do nothing.
                        foundDuplicate = true;
                        break;
                    }

                    if (uniqueItem["Company Street 1"].toLowerCase() !== normalizedUniqueAddress || item["Company Street 1"].toLowerCase() !== normalizedItemAddress) {
                        addressMismatchLog.push({
                            name:uniqueItem["Contact Full Name"],
                            originalUniqueAddress: uniqueItem["Company Street 1"],
                            originalItemAddress: item["Company Street 1"],
                        });

                    }
                    // If both have emails and they don't match, or both don't have emails, they are considered non-duplicates, hence do nothing here.
                }
            }
    
            if (!foundDuplicate) {
                // No duplicate found according to the new rules; item is unique.
                uniqueData.push(item);
            } else {
                // Duplicate found; log the duplicate pair or handle accordingly.
                duplicates.push(item); // You might want to adjust what gets pushed here based on your needs.
            }
        });
    
        // Optionally log duplicates
        console.log("Duplicates found:", duplicates);
    
        return uniqueData;
    };
    
    
    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(headersOrder);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setHeadersOrder(items);
    };

    const toggleHeaderSelected = (header) => {
        setSelectedHeaders(prevHeaders => ({
            ...prevHeaders,
            [header]: !prevHeaders[header]
        }));
    };

    const exportToCSV = () => {
        const fileName = prompt("Please enter a name for your CSV file:", "export");
        if (fileName === null) return; // If the user pressed cancel, then don't proceed
    
        let csvHeaders = [];
        let csvRows = [];
    
        // Define headers and row data based on the selectedOption
        if (selectedOption === "Emails") {
            csvHeaders = ["Contact Full Name", "Company Name", "Email 1", "Personal Email"];
            csvRows = displayData.map(row => 
                csvHeaders.map(fieldName => JSON.stringify(row[fieldName] || '')).join(',')
            );
        } else if (selectedOption === "CompanyStreet" || selectedOption === "CompanyStreetUpdated" || selectedOption==="CompanyStreetCSVCheck") {
            csvHeaders = ["Contact Full Name", "Company Name", "Company Street 1", "Company Street 2"];
            csvRows = displayData.map(row => 
                csvHeaders.map(fieldName => JSON.stringify(row[fieldName] || '')).join(',')
            );
        } else {
            // Default to all selected headers if no specific option is selected
            csvHeaders = headersOrder.filter(header => selectedHeaders[header]);
            csvRows = combinedData.map(row =>
                csvHeaders.map(fieldName => JSON.stringify(row[fieldName] || '')).join(',')
            );
        }
    
        // Combine headers and rows for CSV
        const csvString = [
            csvHeaders.join(','), // CSV header row
            ...csvRows
        ].join('\n');
    
        // Create and download the CSV file
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    
    const Modal = ({ isOpen, children, onClose }) => {
        if (!isOpen) return null;
      
        // Function to stop click event propagation
        const handleModalContentClick = (e) => {
          e.stopPropagation();
        };
      
        return (
          <div className="Modal-overlay" onClick={onClose}>
            <div className="Modal" onClick={handleModalContentClick}>
              <button className="Modal-close" onClick={onClose}>×</button>
              {children}
            </div>
          </div>
        );
    };


    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const getFilteredOrSortedData = () => {
        if (!selectedOption) return combinedData;

        if (selectedOption === "Emails") {
            return combinedData
                .filter(item => item["Email 1"]) // Filter items that have an email
                .map(item => ({
                    "Contact Full Name": item["Contact Full Name"],
                    "Company Name": item["Company Name"],
                    "Email 1": item["Email 1"],
                    "Personal Email": item["Personal Email"],
                })); // Return only Contact Full Name and Email 1 / personal email
        }
        if (selectedOption === "CompanyStreet"){
            return combinedData
                .filter(item => item["Company Street 1"]) // Filter items that have an address
                .map(item => ({
                    "Contact Full Name": item["Contact Full Name"],
                    "Company Name": item["Company Name"],
                    "Company Street 1": item["Company Street 1"],
                    "Company Street 2": item["Company Street 2"]
                })); // Return only Contact Full Name and Address 1 / 2
        }
        if (selectedOption === "CompanyStreetUpdated") {
            console.log('names removed:', person); // Debug: Log the person array to verify its structure and contents
        
            return combinedData
                .filter(item => item["Company Street 1"]) // Ensure item has an address
                .filter(item => {
                    if (!item["Contact Full Name"]) {
                        return item; // This effectively skips the item
                    }
                    // Normalize names for comparison to handle case differences
                    const itemNameNormalized = item["Contact Full Name"].toLowerCase().trim();
                    
                    // Check if the item's full name matches any name in the `person` array
                    const isUpdatedPerson = person.some(ppl => {
                        const personNameNormalized = ppl.updated["Contact Full Name"].toLowerCase().trim();
                        // console.log(`Comparing: '${personNameNormalized}' with '${itemNameNormalized}'`);
                        return personNameNormalized === itemNameNormalized;
                    });
                    
        
                    // console.log('Is updated person:', isUpdatedPerson, 'for', item["Contact Full Name"]);
                    return !isUpdatedPerson; // Exclude if found in `person`
                })
                .map(item => ({
                    "Contact Full Name": item["Contact Full Name"],
                    "Company Name": item["Company Name"],
                    "Company Street 1": item["Company Street 1"],
                    "Company Street 2": item["Company Street 2"]
                }));
        }
        if (selectedOption === "CompanyStreetCSVCheck"){
            if (alreadyMailed.length === 0) {
                return []; // Return an empty array or another suitable default value
            }
            return combinedData
                .filter(item => item["Company Street 1"]) // Ensure item has an address
                .filter(item => {
                    if (!item["Contact Full Name"]) {
                        return item; // This effectively skips the item
                    }
                    // Normalize names for comparison to handle case differences
                    const itemNameNormalized = item["Contact Full Name"].toLowerCase().trim();
                    
                    // Check if the item's full name matches any name in the `person` array
                    const isUpdatedPerson = alreadyMailed.some(ppl => {
                        const personNameNormalized = ppl["Contact Full Name"].toLowerCase().trim();
                        // console.log(`Comparing: '${personNameNormalized}' with '${itemNameNormalized}'`);
                        return personNameNormalized === itemNameNormalized;
                    });
                    
        
                    // console.log('Is updated person:', isUpdatedPerson, 'for', item["Contact Full Name"]);
                    return !isUpdatedPerson; // Exclude if found in `person`
                })
                .map(item => ({
                    "Contact Full Name": item["Contact Full Name"],
                    "Company Name": item["Company Name"],
                    "Company Street 1": item["Company Street 1"],
                    "Company Street 2": item["Company Street 2"]
                }));
        }
        if (selectedOption === "excelData") {
            if (data.length === 0) {
                return []; // Return an empty array or another suitable default value
            }
            return data
                .filter(item => item["Company Street 1"] && item["Contact Full Name"]) // Ensure item has an address and a contact name
                .map(item => ({
                    ...item // Spread operator to return all fields of the item
                }));
        }
        if (selectedOption === "deletedNamesFromExcel") {
            if (deletedNames.length === 0) {
                return []; // Return an empty array as a default value if there are no entries
            }
            return deletedNames
                .filter(item => item["FirstName"] && item["LastName"]) // Ensure each item has a first and last name
                .map(item => ({
                    ...item // Use the spread operator to return all fields of the item
                }));
        }
        if (selectedOption === "AddressMisMatch") {
            if (addressMismatchLog.length === 0) {
                return []; // Return an empty array as a default value if there are no entries
            }
            return addressMismatchLog
                .filter(item => item["normalizedItemAddress"] && item["normalizedUniqueAddress"]) // Ensure item has an address and a contact name
                .map(item => ({
                    ...item // Spread operator to return all fields of the item
                }));
        }
        if (selectedOption === "ContactExistsButEmailUpdated") {
            if (person.length === 0) {
                return []; // Return an empty array as a default value if there are no entries
            }
            return person
                .filter(item => item.updated && item.updated["Company Street 1"] && item.updated["Contact Full Name"]) // Ensure item has an address and a contact name
                .map(item => ({
                    ...item.updated // Spread operator to return all fields from the 'updated' object
                }));
        } 
    };

    const displayData = getFilteredOrSortedData();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                parseCsv(text); // Function to parse CSV text
            };
            reader.readAsText(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    
    const parseCsv = (text) => {
        // Simple CSV parsing
        const lines = text.split('\n');
        const result = [];
        const headers = lines[0].split(',');
    
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            const obj = {};
            const currentline = lines[i].split(',');
    
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }
    
            result.push(obj);
        }
    
        setAlreadyMailed(result); // Update state with parsed data
    };

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="headers">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="View-list-headers-container">
                                {headersOrder.map((header, index) => (
                                    <Draggable key={header} draggableId={header} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={selectedHeaders[header] ? "header-selected" : "header-unselected"} onClick={() => toggleHeaderSelected(header)}>
                                                {header}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </Modal>
            <div className="compare-toolbar">
                <p style={{color:'white'}}>Combined Data Length: {displayData.length}</p>
                <div className="compare-toolbar-buttons">
                    <select onChange={handleSelectChange} value={selectedOption} className="view-list-state-select">
                            <option value="">Full {state} List</option>
                            {/* Replace these options with your actual options */}
                            <option value="Emails">Emails</option>
                            <option value="CompanyStreet">Addresses</option>
                            <option value="CompanyStreetUpdated">Addresses - Updated New Email Contacts Removed</option>
                            <option value="CompanyStreetCSVCheck">Addresses - Already Emailed</option>
                            <option value="excelData">Excel Data</option>
                            <option value="deletedNamesFromExcel">Deleted Names From Excel</option>
                            <option value="AddressMisMatch">Address MisMatch (rd = road)</option>
                            <option value="ContactExistsButEmailUpdated">Contact Exists Email Updated</option>
                    </select>
                    {selectedOption === "" && (
                        <>
                            <button onClick={() => setIsModalOpen(true)}><RuleIcon/></button>
                        </>
                    )}
                    <button onClick={exportToCSV}><ExportIcon/></button>
                    {selectedOption === "CompanyStreetCSVCheck" && (
                        <>
                            <input
                                type="file"
                                id="csvFileInput"
                                accept=".csv"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                style={{ display: 'none' }} // Hide the file input
                            />
                            <button
                                onClick={handleUploadClick}
                                className="view-list-state-select"
                                startIcon={<UploadFileIcon />}
                                component="span"
                            >
                                <UploadFileIcon style={{padding:'0', margin:'0'}}/>
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className="CompareData-table-container">
                <table className="CompareData-table">
                    <thead className="CompareData-thead">
                        <tr>
                            {selectedOption === "Emails" ? (
                                <>
                                    <th className="CompareData-th">Contact Full Name</th>
                                    <th className="CompareData-th">Company Name</th>
                                    <th className="CompareData-th">Email 1</th>
                                    <th className="CompareData-th">Personal Email</th>
                                </>
                            ) : selectedOption === "CompanyStreet" ? ( /* New condition */
                                <>
                                    <th className="CompareData-th">Contact Full Name</th>
                                    <th className="CompareData-th">Company Name</th>
                                    <th className="CompareData-th">Company Street 1</th>
                                    <th className="CompareData-th">Company Street 2</th>
                                </>
                                
                            ) : selectedOption === "CompanyStreetUpdated" ? (
                                <>
                                    <th className="CompareData-th">Contact Full Name</th>
                                    <th className="CompareData-th">Company Name</th>
                                    <th className="CompareData-th">Company Street 1</th>
                                    <th className="CompareData-th">Company Street 2</th>
                                </>
                            ) : selectedOption === "CompanyStreetCSVCheck" ? (
                                <>
                                    <th className="CompareData-th">Contact Full Name</th>
                                    <th className="CompareData-th">Company Name</th>
                                    <th className="CompareData-th">Company Street 1</th>
                                    <th className="CompareData-th">Company Street 2</th>
                                </>
                            ) : selectedOption === "ContactExistsButEmailUpdated" ? (
                                <>
                                    <th className="CompareData-th">Contact Full Name</th>
                                    <th className="CompareData-th">Company Name</th>
                                    <th className="CompareData-th">Company Street 1</th>
                                    <th className="CompareData-th">Company Street 2</th>
                                    <th className="CompareData-th">Company City</th>
                                    <th className="CompareData-th">Company State</th>
                                    <th className="CompareData-th">Company Post Code</th>
                                    <th className="CompareData-th">Email 1</th>
                                    <th className="CompareData-th">Personal Email</th>
                                </>
                            ) : selectedOption === "AddressMisMatch" ? (
                                <>
                                    <th className="CompareData-th">Item Name</th>
                                    <th className="CompareData-th">Name</th>
                                    <th className="CompareData-th">Normalized Item Address</th>
                                    <th className="CompareData-th">Normalized Unique Address</th>
                                    <th className="CompareData-th">Original Item Address</th>
                                    <th className="CompareData-th">Original Unique Address</th>
                                </>
                            ) : selectedOption === "excelData" ? (
                                <>
                                    <th className="CompareData-th">Contact Full Name</th>
                                    <th className="CompareData-th">Company Name</th>
                                    <th className="CompareData-th">Company Street 1</th>
                                    <th className="CompareData-th">Company Street 2</th>
                                    <th className="CompareData-th">Company City</th>
                                    <th className="CompareData-th">Company State</th>
                                    <th className="CompareData-th">Company Post Code</th>
                                    <th className="CompareData-th">Email 1</th>
                                    <th className="CompareData-th">Personal Email</th>
                                    <th className="CompareData-th">Contact Phone</th>
                                    <th className="CompareData-th">Company Website</th>
                                    <th className="CompareData-th">Company County Name</th>
                                    <th className="CompareData-th">List</th>
                                </>
                            ) : selectedOption === "deletedNamesFromExcel" ? (
                                <>
                                    <th className="CompareData-th">State</th>
                                    <th className="CompareData-th">First Name</th>
                                    <th className="CompareData-th">Middle Name</th>
                                    <th className="CompareData-th">Last Name</th>
                                </>
                            ) : (
                                headersOrder.filter(header => selectedHeaders[header]).map(header => (
                                    <th key={header} className="CompareData-th">{header}</th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.length === 0 ? (
                            <tr>
                                <td className="CompareData-td" colSpan="3">Upload Emailed CSV</td>
                            </tr>
                        ) : displayData
                            .sort((a, b) => {
                                const nameA = a["Contact Full Name"] ? a["Contact Full Name"].toUpperCase() : '';
                                const nameB = b["Contact Full Name"] ? b["Contact Full Name"].toUpperCase() : '';
                                return nameA.localeCompare(nameB);
                            })
                            .map((item, index) => (
                                <tr key={index} className="CompareData-tr">
                                    {selectedOption === "Emails" ? (
                                        <>
                                            <td className="CompareData-td">{item["Contact Full Name"]}</td>
                                            <td className="CompareData-td">{item["Company Name"]}</td>
                                            <td className="CompareData-td">{item["Email 1"]}</td>
                                            <td className="CompareData-td">{item["Personal Email"]}</td>
                                        </>
                                    ) : selectedOption === "CompanyStreet" ? ( /* New condition */
                                        <>
                                            <td className="CompareData-td">{item["Contact Full Name"]}</td>
                                            <td className="CompareData-td">{item["Company Name"]}</td>
                                            <td className="CompareData-td">{item["Company Street 1"]}</td>
                                            <td className="CompareData-td">{item["Company Street 2"]}</td>
                                        </>
                                    ) : selectedOption === "CompanyStreetUpdated" ? (
                                        <>
                                            <td className="CompareData-td">{item["Contact Full Name"]}</td>
                                            <td className="CompareData-td">{item["Company Name"]}</td>
                                            <td className="CompareData-td">{item["Company Street 1"]}</td>
                                            <td className="CompareData-td">{item["Company Street 2"]}</td>
                                        </>
                                    ) : selectedOption === "CompanyStreetCSVCheck" ? (
                                        <>
                                            
                                            <td className="CompareData-td">{item["Contact Full Name"]}</td>
                                            <td className="CompareData-td">{item["Company Name"]}</td>
                                            <td className="CompareData-td">{item["Company Street 1"]}</td>
                                            <td className="CompareData-td">{item["Company Street 2"]}</td>
                                        </>
                                    ) : selectedOption === "ContactExistsButEmailUpdated" ? (
                                        <>
                                            <td className="CompareData-td">{item["Contact Full Name"]}</td>
                                            <td className="CompareData-td">{item["Company Name"]}</td>
                                            <td className="CompareData-td">{item["Company Street 1"]}</td>
                                            <td className="CompareData-td">{item["Company Street 2"]}</td>
                                            <td className="CompareData-td">{item["Company City"]}</td>
                                            <td className="CompareData-td">{item["Company State"]}</td>
                                            <td className="CompareData-td">{item["Company Post Code"]}</td>
                                            <td className="CompareData-td">{item["Email 1"]}</td>
                                            <td className="CompareData-td">{item["Personal Email"]}</td>
                                        </>
                                    ) : selectedOption === "AddressMisMatch" ? (
                                        <>
                                            <td className="CompareData-td">{item["itemName"]}</td>
                                            <td className="CompareData-td">{item["uniqueName"]}</td>
                                            <td className="CompareData-td">{item["normalizedItemAddress"]}</td>
                                            <td className="CompareData-td">{item["normalizedUniqueAddress"]}</td>
                                            <td className="CompareData-td">{item["originalItemAddress"]}</td>
                                            <td className="CompareData-td">{item["originalUniqueAddress"]}</td>
                                        </>
                                    ) : selectedOption === "excelData" ? (
                                        <>
                                            <td className="CompareData-td">{item["Contact Full Name"]}</td>
                                            <td className="CompareData-td">{item["Company Name"]}</td>
                                            <td className="CompareData-td">{item["Company Street 1"]}</td>
                                            <td className="CompareData-td">{item["Company Street 2"]}</td>
                                            <td className="CompareData-td">{item["Company City"]}</td>
                                            <td className="CompareData-td">{item["Company State"]}</td>
                                            <td className="CompareData-td">{item["Company Post Code"]}</td>
                                            <td className="CompareData-td">{item["Email 1"]}</td>
                                            <td className="CompareData-td">{item["Personal Email"]}</td>
                                            <td className="CompareData-td">{item["Contact Phone"]}</td>
                                            <td className="CompareData-td">{item["Company Website"]}</td>
                                            <td className="CompareData-td">{item["County Name"]}</td>
                                            <td className="CompareData-td">{item["List"]}</td>
                                        </>
                                    ) : selectedOption === "deletedNamesFromExcel" ? (
                                        <>
                                            <td className="CompareData-td">{item["State"]}</td>
                                            <td className="CompareData-td">{item["FirstName"]}</td>
                                            <td className="CompareData-td">{item["MiddleName"]}</td>
                                            <td className="CompareData-td">{item["LastName"]}</td>
                                        </>
                                    ) : (
                                        headersOrder.filter(header => selectedHeaders[header]).map(header => (
                                            <td key={header} className="CompareData-td">{item[header] || 'N/A'}</td>
                                        ))
                                    )}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </>
    );
    
};

export default CompareData;
