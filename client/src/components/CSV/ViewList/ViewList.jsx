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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className='viewList-con'>
      <div className="View-toggle-buttons">
        <div className="View-list-select-container">
            <select onChange={handleStateChange} value={selectedState} className="view-list-state-select">
              <option value="">Select a State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
        </div>
        {activeView === 'compareData' && <button onClick={() => setActiveView('viewList')}>View List</button>}
        {activeView === 'viewList' && <button onClick={() => setActiveView('compareData')}>Compare Data</button>}
      </div>
  
      {activeView === 'viewList' && (
        <>
            <div className="viewList-section">
                <button onClick={() => setIsModalOpen(true)}>Edit Headers</button>
                <p className="View-list-record-count">Number of Records (Seamless): {sortedData.length}</p>
            </div>
          

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
          <div className="View-list-container">
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
          <CompareData stateData={sortedData} sheetData={dataBySheet} state={selectedState}/>
        </div>
      )}
    </div>
  );  
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
  
  

export default ViewList;
