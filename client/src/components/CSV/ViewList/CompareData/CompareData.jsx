import React, { useState, useEffect } from 'react';

const CompareData = ({stateData, sheetData, state}) => {
    const [data, setData] = useState([]);
    const [combinedData, setCombinedData] = useState([]);
    console.log('excel data', data);
    console.log('combined data', combinedData);

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
        }
    }, [sheetData, stateData, state]);

    const combineAndFilterData = (dataOne, dataTwo) => {
        // Step 1: Combine both sets of data
        const combined = [...dataOne, ...dataTwo];
        const uniqueData = [];
        const duplicates = []; // To store duplicates for logging
    
        // Step 2: Filter out duplicates
        combined.forEach(item => {
            const duplicateIndex = uniqueData.findIndex(uniqueItem => {
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
    
    


    return (
        <>
            <p>Combined Data Length: {combinedData.length}</p>
            <table>
                <thead>
                    <tr>
                        <th>Company Name</th>
                        <th>Contact Full Name</th>
                        <th>Company City</th>
                        <th>Company State Abbr</th>
                        <th>Company Street 1</th>
                        <th>Company Street 2</th>
                        <th>Company Post Code</th>
                        <th>Contact Phone 1</th>
                        <th>Email 1</th>
                        <th>Personal Email</th>
                        <th>Title</th>
                        <th>Website</th>
                    </tr>
                </thead>
                <tbody>
                    {combinedData
                        .sort((a, b) => a["Contact Full Name"].localeCompare(b["Contact Full Name"]))
                        .map((item, index) => (
                            <tr key={index}>
                                <td>{item["Company Name"]}</td>
                                <td>{item["Contact Full Name"]}</td>
                                <td>{item["Company City"]}</td>
                                <td>{item["Company State Abbr"]}</td>
                                <td>{item["Company Street 1"]}</td>
                                <td>{item["Company Street 2"]}</td>
                                <td>{item["Company Post Code"]}</td>
                                <td>{item["Contact Phone 1"]}</td>
                                <td>{item["Email 1"]}</td>
                                <td>{item["Personal Email"]}</td>
                                <td>{item["Title"]}</td>
                                <td>{item["Website"]}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </>
    );
    
};

export default CompareData;
