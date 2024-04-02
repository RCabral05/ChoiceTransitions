import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './styles.css';

const CompareData = ({stateData, sheetData, state, deletedNames}) => {
    const [data, setData] = useState([]);
    const person = [];
    const [combinedData, setCombinedData] = useState([]);
    console.log('excel data', data);
    console.log('combined data', combinedData);
    console.log('deleted names', deletedNames);
    const [selectedHeaders, setSelectedHeaders] = useState({});
    const [headersOrder, setHeadersOrder] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const removeTitles = [
        '',
    ]; //FILL WITH TITLES THAT NEED TO BE REMOVED
    const [delName, setDelName] = useState([]);
    console.log('delName', delName);

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

    const combineAndFilterData = (dataOne, dataTwo, delName) => {
        const combined = [...dataOne, ...dataTwo];
        const uniqueData = [];
        const duplicates = []; // To store duplicates for logging
        const entriesToRemoveDeleted = [];
        console.log('e', person);
        const entriesToRemoveTitle = [];
        const entriesToRemove = entriesToRemoveDeleted + entriesToRemoveTitle;
        console.log("R", entriesToRemove);

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
                console.log('?', isDeletedName);
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

                // Check last names and first names match
                if (lastName === uniqueLastName && firstName === uniqueFirstName) {
                    // Check if addresses match
                    if (uniqueItem["Company Street 1"] === item["Company Street 1"]) {
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
                        // If both have emails and they don't match, or both don't have emails, they are considered non-duplicates, hence do nothing here.
                    }
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
        // Ask the user for the file name
        const fileName = prompt("Please enter a name for your CSV file:", "export.csv");
        // If the user pressed cancel, then don't proceed
        if (fileName === null) return;
    
        const selectedHeaderKeys = headersOrder.filter(header => selectedHeaders[header]);
        const csvRows = [
            selectedHeaderKeys.join(','), // CSV header row
            ...combinedData.map(row =>
                selectedHeaderKeys.map(fieldName => JSON.stringify(row[fieldName] || '')).join(',')
            )
        ];
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', fileName); // Use the fileName from prompt
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
            <p style={{color:'white'}}>Combined Data Length: {combinedData.length}</p>
            <div className="compare-toolbar-buttons">
                <button onClick={() => setIsModalOpen(true)}>Edit Headers</button>
                <button onClick={exportToCSV}>Export</button>
            </div>
        </div>
        <div className="CompareData-table-container">
            <table className="CompareData-table">
                <thead className="CompareData-thead">
                <tr>
                    {headersOrder.filter(header => selectedHeaders[header]).map(header => (
                    <th key={header} className="CompareData-th">{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {combinedData
                    .sort((a, b) => {
                    const nameA = a["Contact Full Name"].toUpperCase(); // ignore upper and lowercase
                    const nameB = b["Contact Full Name"].toUpperCase(); // ignore upper and lowercase
                    return nameA.localeCompare(nameB); // Utilizing localeCompare for sorting
                    })
                    .map((item, index) => (
                    <tr key={index} className="CompareData-tr">
                        {headersOrder.filter(header => selectedHeaders[header]).map(header => (
                        <td key={header} className="CompareData-td">{item[header] || 'N/A'}</td>
                        ))}
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>

    </>
    );
    
};

export default CompareData;
