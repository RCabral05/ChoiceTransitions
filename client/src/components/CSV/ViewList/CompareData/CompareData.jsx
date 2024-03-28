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
                setHeadersOrder(allHeaders);
                const headersSelection = allHeaders.reduce((acc, header) => ({ ...acc, [header]: true }), {});
                setSelectedHeaders(headersSelection);
            }
        }

      
    }, [sheetData, stateData, state]);

    const combineAndFilterData = (dataOne, dataTwo) => {
        // Step 1: Combine both sets of data
        const combined = [...dataOne, ...dataTwo];
        const uniqueData = [];
        const duplicates = []; // To store duplicates for logging
      
        // Step 2: Filter out duplicates
        combined.forEach(item => {

            if (!item["Contact Full Name"]) {
                uniqueData.push(item); // Consider it unique and skip further checks
                return; // Exit this iteration
            }
            const duplicateIndex = uniqueData.findIndex(uniqueItem => {
                if (!uniqueItem["Contact Full Name"]) return false;
                const isFullNameMatch = uniqueItem["Contact Full Name"] === item["Contact Full Name"];
                if (!isFullNameMatch) return false; // Names don't match; proceed to the next criteria
    
                const isAddressMatch = uniqueItem["Company St 1"] === item["Company St 1"];
                if (!isAddressMatch) return false; // Addresses don't match; considered unique
    
                // Address matches, check emails
                const bothHaveEmails = uniqueItem["Email 1"] && item["Email 1"];
                const bothLackEmails = !uniqueItem["Email 1"] && !item["Email 1"];
                const emailsMatch = uniqueItem["Email 1"] === item["Email 1"];
    
                return bothLackEmails || (bothHaveEmails && emailsMatch);
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
        // console.log("uniques found:", uniqueData);
    
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

        <p>Combined Data Length: {combinedData.length}</p>
        <table>
            <thead>
                <tr>
                    {headersOrder.filter(header => selectedHeaders[header]).map(header => (
                        <th key={header}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {combinedData.map((item, index) => (
                    <tr key={index}>
                        {headersOrder.filter(header => selectedHeaders[header]).map(header => (
                            <td key={header}>{item[header] || 'N/A'}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </>
    );
    
};

export default CompareData;
