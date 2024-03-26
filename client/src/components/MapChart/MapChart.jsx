import React from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import allStates from './allStates.js'; // Import your state abbreviations and coordinates

const geoUrl = process.env.PUBLIC_URL + "/topojson/states-10m.json";

const MapChart = ({ setTooltipContent }) => {
    const [zoom, setZoom] = React.useState(1); // Initialize zoom state
    
   
    // Function to handle click events on states
    const handleStateClick = (evt, abbreviation) => {
        console.log(abbreviation); // Log the state abbreviation to the console
        // You can also call setTooltipContent here if you want to show tooltip information
        // setTooltipContent(abbreviation);
    };

  
      

  return (
    <div>
      <ComposableMap projection="geoAlbersUsa">
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo} 
                  onClick={(evt) => handleStateClick(evt, geo.properties.name)} // Adjust according to your topojson properties
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
                <Marker key={i} coordinates={state.coordinates} onClick={(evt) => handleStateClick(evt, state.abbreviation)}>
                    <text
                    textAnchor="middle"
                    fill="#000"
                    alignmentBaseline="middle"
                    style={{ fontFamily: "Arial", cursor: 'pointer' }}
                    onClick={(evt) => handleStateClick(evt, state.abbreviation)}
                    >
                    {state.abbreviation}
                    </text>
                </Marker>
            ))}

        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapChart;
