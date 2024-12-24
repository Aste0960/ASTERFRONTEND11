import React, { useState, useEffect } from 'react';
import { fetchEarthquakeData } from '../Service/earthquakeService';
import '../style/EarthquakeList.css';

const EarthquakeList = () => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchEarthquakeData();
      setEarthquakes(data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="earthquake-list">
      <h2>Recent Earthquakes</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {earthquakes.map((quake) => (
            <li key={quake.id}>
              <strong>Magnitude:</strong> {quake.magnitude}, 
              <strong> Location:</strong> {quake.place}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EarthquakeList;
