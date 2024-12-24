import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import '../style/Home.css';

const Home = () => {
  const [previousQuakes, setPreviousQuakes] = useState([]);
  const [filteredQuakes, setFilteredQuakes] = useState([]);
  const [realTimeQuakes, setRealTimeQuakes] = useState([]);
  const [viewMode, setViewMode] = useState('map'); // Control View: 'map', 'table', '3d'
  const [selectedQuake, setSelectedQuake] = useState(null); // Store the selected earthquake for 3D view
  const [filters, setFilters] = useState({
    startYear: '',
    endYear: '',
    minMagnitude: '',
    maxMagnitude: '',
    minDepth: '',
    maxDepth: '',
  });

  const fetchPreviousEarthquakes = async () => {
    try {
      const minLatitude = 3.4; // Southern border
      const maxLatitude = 14.9; // Northern border
      const minLongitude = 32.9; // Western border
      const maxLongitude = 48.0; // Eastern border

      const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=1900-01-01&endtime=${new Date().toISOString()}&minlatitude=${minLatitude}&maxlatitude=${maxLatitude}&minlongitude=${minLongitude}&maxlongitude=${maxLongitude}&orderby=time&limit=10000`;

      const response = await axios.get(url);
      const data = response.data.features.map((feature) => {
        const { mag, time, place } = feature.properties;
        const [longitude, latitude, depth] = feature.geometry.coordinates;
        
        // Convert time to Ethiopian Time (UTC+3)
        const ethiopianTime = new Date(time);
        ethiopianTime.setHours(ethiopianTime.getHours() + 3); // UTC+3 for Ethiopian time
        
        return {
          time: ethiopianTime,
          magnitude: mag,
          depth,
          latitude,
          longitude,
          place: place || 'Unknown',
        };
      });
      setPreviousQuakes(data);
      setFilteredQuakes(data);  // Initially show all previous earthquakes
    } catch (error) {
      console.error('Error fetching previous earthquakes:', error);
    }
  };

  const fetchRealTimeEarthquakes = async () => {
    try {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours
      const endDate = new Date().toISOString();
      const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}&orderby=time`;
      const response = await axios.get(url);
      const data = response.data.features.map((feature) => {
        const { mag, time, place } = feature.properties;
        const [longitude, latitude, depth] = feature.geometry.coordinates;
        
        // Convert time to Ethiopian Time (UTC+3)
        const ethiopianTime = new Date(time);
        ethiopianTime.setHours(ethiopianTime.getHours() + 3); // UTC+3 for Ethiopian time
        
        return {
          time: ethiopianTime,
          magnitude: mag,
          depth,
          latitude,
          longitude,
          place: place || 'Unknown',
        };
      });
      setRealTimeQuakes(data);
    } catch (error) {
      console.error('Error fetching real-time earthquakes:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filteredData = [...previousQuakes];

    // Apply year filters
    if (filters.startYear) {
      filteredData = filteredData.filter(
        (quake) => quake.time.getFullYear() >= parseInt(filters.startYear)
      );
    }
    if (filters.endYear) {
      filteredData = filteredData.filter(
        (quake) => quake.time.getFullYear() <= parseInt(filters.endYear)
      );
    }

    // Apply magnitude filters
    if (filters.minMagnitude) {
      filteredData = filteredData.filter(
        (quake) => quake.magnitude >= parseFloat(filters.minMagnitude)
      );
    }
    if (filters.maxMagnitude) {
      filteredData = filteredData.filter(
        (quake) => quake.magnitude <= parseFloat(filters.maxMagnitude)
      );
    }

    // Apply depth filters
    if (filters.minDepth) {
      filteredData = filteredData.filter(
        (quake) => quake.depth >= parseFloat(filters.minDepth)
      );
    }
    if (filters.maxDepth) {
      filteredData = filteredData.filter(
        (quake) => quake.depth <= parseFloat(filters.maxDepth)
      );
    }

    setFilteredQuakes(filteredData);
  };

  useEffect(() => {
    fetchPreviousEarthquakes();
    fetchRealTimeEarthquakes();

    // Set interval to fetch real-time data every 10 minutes (600,000 ms)
    const interval = setInterval(fetchRealTimeEarthquakes, 600000); // Update every 10 minutes

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const renderFilters = () => (
    <div className="filters">
      <h4>Filters</h4>
      <div className="filter-group">
        <label>Start Year:</label>
        <input
          type="number"
          name="startYear"
          value={filters.startYear}
          onChange={handleFilterChange}
        />
      </div>
      <div className="filter-group">
        <label>End Year:</label>
        <input
          type="number"
          name="endYear"
          value={filters.endYear}
          onChange={handleFilterChange}
        />
      </div>
      <div className="filter-group">
        <label>Min Magnitude:</label>
        <input
          type="number"
          name="minMagnitude"
          step="0.1"
          value={filters.minMagnitude}
          onChange={handleFilterChange}
        />
      </div>
      <div className="filter-group">
        <label>Max Magnitude:</label>
        <input
          type="number"
          name="maxMagnitude"
          step="0.1"
          value={filters.maxMagnitude}
          onChange={handleFilterChange}
        />
      </div>
      <div className="filter-group">
        <label>Min Depth:</label>
        <input
          type="number"
          name="minDepth"
          value={filters.minDepth}
          onChange={handleFilterChange}
        />
      </div>
      <div className="filter-group">
        <label>Max Depth:</label>
        <input
          type="number"
          name="maxDepth"
          value={filters.maxDepth}
          onChange={handleFilterChange}
        />
      </div>
      <button onClick={applyFilters}>Apply Filters</button>
    </div>
  );

  const Legend = () => (
    <div className="legend">
      <h4>Legend</h4>
      <ul>
        <li>
          <span className="orange"></span> Previously Occurred Earthquakes
        </li>
        <li>
          <span className="red"></span> Real-Time Earthquakes
        </li>
      </ul>
    </div>
  );

  const render3DView = () => (
    <div className="3d-view">
      {/* Placeholder for 3D View */}
      {selectedQuake && (
        <div>
          <h4>3D View for Earthquake</h4>
          <p><b>Place:</b> {selectedQuake.place}</p>
          <p><b>Magnitude:</b> {selectedQuake.magnitude}</p>
          <p><b>Time:</b> {selectedQuake.time.toISOString()}</p>
          <p><b>Depth:</b> {selectedQuake.depth} km</p>
        </div>
      )}
    </div>
  );

  const renderTableView = () => (
    <div className="table-view">
      <h4>Earthquake Data Table</h4>
      <table>
        <thead>
          <tr>
            <th>Place</th>
            <th>Magnitude</th>
            <th>Time</th>
            <th>Depth (km)</th>
          </tr>
        </thead>
        <tbody>
          {filteredQuakes.map((quake, index) => (
            <tr key={index}>
              <td>{quake.place}</td>
              <td>{quake.magnitude}</td>
              <td>{quake.time.toLocaleString()}</td> {/* Time in Ethiopian Time */}
              <td>{quake.depth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="app">
      <h1>Earthquake Monitoring System in Ethiopia</h1>
      <div className="content">
        <div className="map-container">
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[8.0, 38.5]}
            zoom={7}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {filteredQuakes.map((quake, idx) => (
              <Circle
                key={`prev-${idx}`}
                center={[quake.latitude, quake.longitude]}
                radius={quake.magnitude * 80} // Adjusted circle radius size
                fillColor="orange"  // Set the color for previously occurred quakes
                color="orange"  // Set the circle border color to orange
                weight={2}
                opacity={0.7}
                fillOpacity={0.5}
                eventHandlers={{
                  click: () => {
                    setSelectedQuake(quake); // Set selected quake for 3D view
                    setViewMode('3d'); // Switch to 3D view
                  },
                }}
              >
                <Popup>
                  <b>Place:</b> {quake.place}
                  <br />
                  <b>Magnitude:</b> {quake.magnitude}
                  <br />
                  <b>Time (Ethiopian Time):</b> {quake.time.toLocaleString()}
                  <br />
                  <b>Depth:</b> {quake.depth} km
                </Popup>
              </Circle>
            ))}
            {realTimeQuakes.map((quake, idx) => (
              <Circle
                key={`real-${idx}`}
                center={[quake.latitude, quake.longitude]}
                radius={quake.magnitude * 80} // Adjusted circle radius size
                fillColor="red"  // Red circle for real-time earthquakes
                color="red"
                weight={1}
                opacity={0.8}
                fillOpacity={0.5}
              >
                <Popup>
                  <b>Place:</b> {quake.place}
                  <br />
                  <b>Magnitude:</b> {quake.magnitude}
                  <br />
                  <b>Time (Ethiopian Time):</b> {quake.time.toLocaleString()}
                  <br />
                  <b>Depth:</b> {quake.depth} km
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>

        {/* Filters and Legend Layout */}
        <div className="filters-container">
          {renderFilters()}
          <div className="legend-and-buttons">
            <Legend />
            {/* View Selection Buttons */}
            <div className="view-buttons">
              <button onClick={() => setViewMode('table')}>View as Table</button>
              <button onClick={() => setViewMode('3d')}>3D View</button>
            </div>
            {/* Render table view or 3D view based on the current mode */}
            {viewMode === 'table' && renderTableView()}
            {viewMode === '3d' && render3DView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
