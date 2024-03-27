import React from 'react';
import { useLocation } from 'react-router-dom';
import GoogleMap from '../components/GoogleAPI/GoogleMap/GoogleMap'; // Ensure the import path is correct

const StateMapPage = () => {
  const location = useLocation();
  console.log(location);
  
  // Correctly accessing the state name based on the provided object structure
  const stateName = location.state?.state; // Correctly access the 'state' property

  console.log('state name', stateName);

  return (
    <div>
      {stateName && <GoogleMap stateName={stateName} />}
    </div>
  );
};

export default StateMapPage;
