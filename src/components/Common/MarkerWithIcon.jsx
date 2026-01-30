// src/MarkerWithIcon.js - FINAL VERSION for Permanent Labels

import React, { useMemo } from 'react';
import { Marker } from '@react-google-maps/api';
import { getLocationProps, getMarkerIconProperties } from './LocationMapModal'; 

/**
 * A dedicated component to safely render a Marker and use Hooks, 
 * now including the location name as a permanent map label.
 */
const MarkerWithIcon = ({ location }) => {
    
    const markerIcon = useMemo(() => {
        // This Hook is called correctly inside a function component.
        
        if (window.google) {
            const baseProps = getMarkerIconProperties(location);
            
            return {
                ...baseProps,
                scaledSize: new window.google.maps.Size(30, 30),
                anchor: new window.google.maps.Point(15, 30),
                
                // --- THIS IS THE KEY TO DISPLAYING THE LOCATION NAME ---
                label: {
                    text: location.name, // Use the location name as the marker label
                    color: '#000000',    // Black text color
                    fontSize: '10px',    // Smaller font size for map readability
                    fontWeight: 'bold',  // Bold text
                }
            };
        }
        return undefined; 
    }, [location.type, location.name]); 

    if (!markerIcon) return null;

    return (
        <Marker
            position={{ lat: location.lat, lng: location.lng }}
            icon={markerIcon} 
        />
    );
};

export default MarkerWithIcon;