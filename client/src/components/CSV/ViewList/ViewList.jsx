import React, { useState, useMemo } from 'react';
import { useCSV } from '../../../context/CSVContext';
import './styles.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import CompareData from './CompareData/CompareData';

const ViewList = () => {
  const { dataByState, dataBySheet } = useCSV();
  const [selectedState, setSelectedState] = useState('');
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [headersOrder, setHeadersOrder] = useState([]);
  const [activeView, setActiveView] = useState('viewList');
  // Sort states alphabetically
  const states = Object.keys(dataByState).sort();

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
    const headers = Object.keys(dataByState[e.target.value][0] || {});
    
    // Initialize selectedHeaders with all headers set to true (selected)
    const initialSelectedHeaders = headers.reduce((acc, header) => {
      acc[header] = true;
      return acc;
    }, {});
    
    setSelectedHeaders(initialSelectedHeaders);
    setHeadersOrder(headers); // Initialize headers order when state changes
  };
  

  // Sort the displayed data alphabetically by "Contact Full Name"
  const sortedData = useMemo(() => selectedState ? [...dataByState[selectedState]].sort((a, b) => {
    const nameA = a["Contact Full Name"].toUpperCase();
    const nameB = b["Contact Full Name"].toUpperCase();
    return nameA.localeCompare(nameB);
  }) : [], [selectedState, dataByState]);

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
      <div className="view-toggle-buttons">
        <button onClick={() => setActiveView('viewList')}>View List</button>
        <button onClick={() => setActiveView('compareData')}>Compare Data</button>
      </div>
  
      {activeView === 'viewList' && (
        <>
          <div className="view-list-select-container">
            <select onChange={handleStateChange} value={selectedState} className="view-list-state-select">
              <option value="">Select a State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="headers">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="view-list-headers-container">
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
          <div className="view-list-container">
            <p className="view-list-record-count">Number of Records: {sortedData.length}</p>
            <table className="view-list-table">
                <thead>
                    <tr>
                    {headersOrder.filter(header => selectedHeaders[header]).map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {headersOrder.filter(header => selectedHeaders[header]).map((header, index) => (
                        <td key={index}>{row[header]}</td>
                        ))}
                    </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </>
      )}
  
      {activeView === 'compareData' && (
        <div>
          {/* Placeholder for Compare Data view content */}
          <p>Compare Data view is under construction.</p>
          <CompareData stateData={sortedData} sheetData={dataBySheet} state={selectedState}/>
        </div>
      )}
    </>
  );  
};

export default ViewList;
