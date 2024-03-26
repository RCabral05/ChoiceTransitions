import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import allStates from './allStates.js'; // Import your state abbreviations and coordinates
import './styles.css';

const geoUrl = process.env.PUBLIC_URL + "/topojson/states-10m.json";

const MapChart = ({ setTooltipContent }) => {
    const [view, setView] = useState('map'); // 'map' or 'dropdown' to toggle views

    // Function to handle click events on states
    const handleStateClick = (evt, state) => {
        console.log(state); // Log the state abbreviation to the console
        // You can also call setTooltipContent here if you want to show tooltip information
        // setTooltipContent(abbreviation);
    };

    // Function to handle selection from the dropdown
    const handleSelectChange = (event) => {
        const state = event.target.value;
        console.log(state); // Log the selected state abbreviation to the console
        // Perform any action on state selection
    };

    // Toggle between map and dropdown view
    const toggleView = () => {
        setView(view === 'map' ? 'dropdown' : 'map');
    };

    return (
        <div className='content-container'>
            <button onClick={toggleView} className="toggle-button">
                {view === 'map' ? 'Switch to Dropdown' : 'Switch to Map'}
            </button>
            {view === 'map' ? (
                <div className='map-con'>
                    <ComposableMap projection="geoAlbersUsa">
                        <ZoomableGroup>
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography key={geo.rsmKey} geography={geo} 
                                            onClick={(evt) => handleStateClick(evt, geo.properties.name)}
                                            style={{
                                                default: { fill: "#D6D6DA", outline: "none" },
                                                hover: { fill: "#F53", outline: "none" },
                                                pressed: { fill: "#E42", outline: "none" },
                                            }} 
                                        />
                                    ))
                                }
                            </Geographies>
                            {allStates.map((state, i) => (
                                <Marker key={i} coordinates={state.coordinates} onClick={(evt) => handleStateClick(evt, state.name)}>
                                    <text
                                        textAnchor="middle"
                                        fill="#000"
                                        alignmentBaseline="middle"
                                        style={{ fontFamily: "Arial", cursor: 'pointer' }}
                                    >
                                        {state.abbreviation}
                                    </text>
                                </Marker>
                            ))}
                        </ZoomableGroup>
                    </ComposableMap>
                </div>
            ) : (
                <select onChange={handleSelectChange} className="state-dropdown">
                    {allStates.map((state, index) => (
                        <option key={index} value={state.name}>
                            {state.name}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export default MapChart;
