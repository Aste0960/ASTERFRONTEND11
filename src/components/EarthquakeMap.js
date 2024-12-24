// EarthquakeMap.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const EarthquakeMap = () => {
  const [earthquakes, setEarthquakes] = useState([]);

  useEffect(() => {
    // Fetch earthquake data for Ethiopia
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-01-01&endtime=2024-12-31&latitude=9.145&longitude=40.489673&maxradius=5'
        );
        const data = await response.json();
        setEarthquakes(data.features);
      } catch (error) {
        console.error('Error fetching earthquake data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <MapContainer center={[9.145, 40.489673]} zoom={6} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {earthquakes.map((earthquake, index) => (
        <Marker
          key={index}
          position={[
            earthquake.geometry.coordinates[1],
            earthquake.geometry.coordinates[0],
          ]}
        >
          <Popup>
            <strong>Magnitude:</strong> {earthquake.properties.mag}<br />
            <strong>Location:</strong> {earthquake.properties.place}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default EarthquakeMap;
