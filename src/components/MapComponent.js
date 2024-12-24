import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Default icon setup for markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = () => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        // Replace with your actual data fetching logic
        const response = await fetch('https://api.example.com/coordinates');
        const data = await response.json();
        const { latitude, longitude } = data;

        if (!isNaN(latitude) && !isNaN(longitude)) {
          setCoordinates([latitude, longitude]);
        } else {
          console.error('Fetched invalid coordinates.');
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, []);

  if (loading) {
    return <div>Loading map...</div>;
  }

  if (!coordinates) {
    return <div>Error: Invalid coordinates.</div>;
  }

  return (
    <div className="map-container">
      <MapContainer center={coordinates} zoom={13} className="h-[54vh] z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={coordinates}>
          <Popup>
            Latitude: {coordinates[0]}, Longitude: {coordinates[1]}
          </Popup>
        </Marker>
      </MapContainer>
      {/* Render your additional data here */}
      <div className="data-section">
        {/* Your data display components */}
      </div>
    </div>
  );
};

export default MapComponent;
