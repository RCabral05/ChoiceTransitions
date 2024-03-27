import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import allStates from './allStates.js'; // Import your state abbreviations and coordinates
import GoogleMap from '../GoogleMap/GoogleMap.jsx';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const geoUrl = process.env.PUBLIC_URL + "/topojson/states-10m.json";

const MapChart = ({ setTooltipContent }) => {
    const [selectedState, setSelectedState] = useState(null); // Add state management for selected state
    const navigate = useNavigate();

    // Function to handle click events on states
    const handleStateClick = (evt, state) => {
        console.log(state); // Log the state abbreviation to the console
        navigate('/state-map', { state: { state } });
    };

    // Function to handle selection from the dropdown
    const handleSelectChange = (event) => {
        const state = event.target.value;
        console.log(state); // Log the selected state abbreviation to the console
        // Perform any action on state selection
        navigate('/state-map', { state: { state } });
    };


    return (
        <div className='map'>
            <div className="map-toolbar">
                <label htmlFor="state">SELECT STATE</label>
                <select onChange={handleSelectChange} className="state-dropdown">
                    {allStates.map((state, index) => (
                        <option key={index} value={state.name}>
                            {state.name}
                        </option>
                    ))}
                </select>
            </div>
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
                                            hover: { fill: "#6495ED", outline: "none", cursor: "pointer" }, // This ensures the hover effect applies to the state area
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
                                    style={{ fontFamily: "Arial", cursor: 'pointer', pointerEvents: 'none' }} // Ensure the text does not interfere with the hover effect
                                >
                                    {state.abbreviation}
                                </text>
                            </Marker>
                        ))}
                    </ZoomableGroup>
                </ComposableMap>
                {selectedState && <GoogleMap stateName={selectedState} />}
            </div>
        </div>
    );
};

export default MapChart;
