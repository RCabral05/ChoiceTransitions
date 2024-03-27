import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GoogleMap = ({ stateName }) => {
  const [radius, setRadius] = useState(5000); // Default radius of 5km
  const [position, setPosition] = useState({ lat: null, lng: null }); // Store the marker's position
  const mapRef = useRef(null); // Ref for the map container
  const circleRef = useRef(null); // Ref for the circle
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const initMap = () => {
      if (!stateName || !apiKey) return;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: stateName }, (results, status) => {
        if (status === 'OK') {
          const mapCenter = results[0].geometry.location;
          const map = new window.google.maps.Map(mapRef.current, {
            zoom: 13,
            center: mapCenter,
          });

          const marker = new window.google.maps.Marker({
            position: mapCenter,
            map: map,
            draggable: true, // Make the marker draggable
            title: stateName,
          });

          // Update the marker position state when the marker is dragged
          marker.addListener('dragend', () => {
            const newPosition = marker.getPosition();
            setPosition({ lat: newPosition.lat(), lng: newPosition.lng() });
            // Ensure the circle stays centered around the marker
            if (circleRef.current) {
              circleRef.current.setCenter(newPosition);
            }
          });

          // Create and reference the circle around the marker
          const circle = new window.google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map,
            center: mapCenter,
            radius, // Initial radius
            editable: true,
          });
          circleRef.current = circle;

          window.google.maps.event.addListener(circle, 'radius_changed', () => {
            const newRadius = circle.getRadius();
            if (newRadius > 50000) { // Check if the new radius exceeds 50,000 meters
              circle.setRadius(50000); // Reset the radius to 50,000 meters
              setRadius(50000); // Update your React state if necessary
            } else {
              setRadius(newRadius); // Update your React state with the new radius
            }
          });
          
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    };

    // Dynamically load the Google Maps script
    const scriptId = "google-maps-script";
    if (window.google) {
      initMap();
      return;
    }

    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    window.initMap = initMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(document.getElementById(scriptId));
      window.initMap = undefined;
    };
  }, [stateName, apiKey]);

  // Separate effect for updating the circle's radius smoothly
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  const fetchNearbyDentists = async () => {
    if (!position || position.lat === null || position.lng === null) {
      console.error("Marker position is not set.");
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}api/nearby-dentists`, {
        stateName,
      });
      console.log('Nearby dentists:', response.data); // Here you can handle the response data
    } catch (error) {
      console.error('Error fetching nearby dentists:', error);
    }
  };

  return (
    <div className='map'>
        <div className="map-toolbar">
            <h1 style={{color:'white'}}>{stateName}</h1>
        </div>
        <div ref={mapRef} style={{ height: '550px', width: '75%', borderRadius:'10px' }}></div>
        <input
            type="range"
            min="1000"
            max="50000"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10))}
            style={{ width: '600px', marginTop: '10px' }}
        />
        <p style={{color:'white'}}>Radius: {Math.round(radius)} meters</p>
        <button onClick={fetchNearbyDentists}>Find Nearby Dentists</button>
    </div>
  );
};

export default GoogleMap;
