import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './styles.css';

const CompareData = ({stateData, sheetData, state}) => {
    const [data, setData] = useState([]);
    const [combinedData, setCombinedData] = useState([]);
    console.log('excel data', data);
    console.log('combined data', combinedData);
    const [selectedHeaders, setSelectedHeaders] = useState({});
    const [headersOrder, setHeadersOrder] = useState([]);

    useEffect(() => {
        // console.log("Sheet Data:", sheetData);
        // console.log("State Data:", stateData);
        // console.log("State:", state);

        // Iterate over sheetData as an object
        Object.entries(sheetData).forEach(([sheetName, data]) => {
            if(sheetName === state){
                setData(data);
            }
        });

        if (stateData && sheetData[state]) {
            const dataToCompare = sheetData[state];
            
            const combined = combineAndFilterData(stateData, dataToCompare);
            setCombinedData(combined);
            if (combined.length > 0) {
                const allHeaders = Object.keys(combined[0]);
                console.log(allHeaders);
                setHeadersOrder(allHeaders);
                const headersSelection = allHeaders.reduce((acc, header) => ({ ...acc, [header]: true }), {});
                setSelectedHeaders(headersSelection);
            }
        }

      
    }, [sheetData, stateData, state]);

    const combineAndFilterData = (dataOne, dataTwo) => {
        const combined = [...dataOne, ...dataTwo];
        const uniqueData = [];
        const duplicates = []; // To store duplicates for logging
    
        combined.forEach(item => {
            if (!item["Contact Full Name"]) {
                uniqueData.push(item); // Consider it unique and skip further checks
                return; // Exit this iteration
            }
            
            // Split name into parts and prepare for comparison
            const itemNameParts = item["Contact Full Name"].split(' ').filter(Boolean);
            const lastName = itemNameParts[itemNameParts.length - 1].toLowerCase();
            const firstName = itemNameParts[0].toLowerCase();
    
            const duplicateIndex = uniqueData.findIndex(uniqueItem => {
                if (!uniqueItem["Contact Full Name"]) return false;
    
                const uniqueNameParts = uniqueItem["Contact Full Name"].split(' ').filter(Boolean);
                const uniqueLastName = uniqueNameParts[uniqueNameParts.length - 1].toLowerCase();
                const uniqueFirstName = uniqueNameParts[0].toLowerCase();
    
                // Check last names match
                if (lastName !== uniqueLastName) return false;
    
                // If last names match, check first names
                if (firstName !== uniqueFirstName) return false;
    
                // If first names also match, check Company Street 1
                if (uniqueItem["Company Street 1"] !== item["Company Street 1"]) return false;
    
                // If addresses match, check emails
                const bothHaveEmails = uniqueItem["Email 1"] && item["Email 1"];
                const bothLackEmails = !uniqueItem["Email 1"] && !item["Email 1"];
                const emailsMatch = uniqueItem["Email 1"] === item["Email 1"];
    
                // Determine duplicate based on email criteria
                if (bothLackEmails || (bothHaveEmails && emailsMatch)) {
                    // It's a duplicate if both lack emails or both have matching emails
                    return true;
                } else if (uniqueItem["Email 1"] && !item["Email 1"] || !uniqueItem["Email 1"] && item["Email 1"]) {
                    // Not a duplicate if only one item has an email
                    return false;
                }
    
                // If none of the conditions match, it's not a duplicate
                return false;
            });
    
            if (duplicateIndex === -1) {
                // No duplicate found; item is unique
                uniqueData.push(item);
            } else {
                // Duplicate found; log the duplicate pair
                duplicates.push({ uniqueItem: uniqueData[duplicateIndex], duplicateItem: item });
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
    
    

    
    


    return (
        <>
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="headers" direction="horizontal">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="header-container">
                        {headersOrder.map((header, index) => (
                            <Draggable key={header} draggableId={header} index={index}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="header-item">
                                        <input type="checkbox" checked={selectedHeaders[header]} onChange={() => toggleHeaderSelected(header)} />
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
        <div className="compare-toolbar">
            <p style={{color:'white'}}>Combined Data Length: {combinedData.length}</p>
            <button onClick={exportToCSV}>Export</button>
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
