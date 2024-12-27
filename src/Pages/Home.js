import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Line } from 'react-chartjs-2'; // Importing Chart.js for the chart
import Chart from 'chart.js/auto'; // Chart.js setup
import '../style/Home.css';

const Home = () => {
  const [previousQuakes, setPreviousQuakes] = useState([]);
  const [filteredQuakes, setFilteredQuakes] = useState([]);
  const [realTimeQuakes, setRealTimeQuakes] = useState([]);
  const [viewMode, setViewMode] = useState('map'); // Control View: 'map', 'table', '3d'
  const [selectedQuake, setSelectedQuake] = useState(null); // Store the selected earthquake for 3D view
  const [filters, setFilters] = useState({
    date: '', // Combined date field for year/month/day
    minMagnitude: '',
    maxMagnitude: '',
    minDepth: '',
    maxDepth: '',
  });

const fetchPreviousEarthquakes = async () => {
  try {
    const minLatitude = 3.0;  // Southernmost point
    const maxLatitude = 14.4; // Northernmost point
    const minLongitude = 34.4; // Westernmost point
    const maxLongitude = 46.9; // Easternmost point

    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=1900-01-01&endtime=${new Date().toISOString()}&minlatitude=${minLatitude}&maxlatitude=${maxLatitude}&minlongitude=${minLongitude}&maxlongitude=${maxLongitude}&orderby=time&limit=10000`;

    const response = await axios.get(url);
    const data = response.data.features.map((feature) => {
      const { mag, time, place } = feature.properties;
      const [longitude, latitude, depth] = feature.geometry.coordinates;

      // Convert UTC time to Ethiopian Time (UTC+3)
      const utcTime = new Date(time);
      const ethiopianTime = new Date(utcTime.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours for Ethiopian Time

      return {
        time: utcTime, // Keep time in UTC
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

        // Convert UTC time to Ethiopian Time (UTC+3)
        const utcTime = new Date(time);
        const ethiopianTime = new Date(utcTime.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours for Ethiopian Time

        return {
          time: utcTime, // Keep time in UTC
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

    // Apply date filter (year/month/day combined)
    if (filters.date) {
      const [year, month, day] = filters.date.split('/');
      filteredData = filteredData.filter((quake) => {
        const quakeYear = quake.time.getUTCFullYear();
        const quakeMonth = quake.time.getUTCMonth() + 1;
        const quakeDay = quake.time.getUTCDate();
        return (
          (!year || quakeYear === parseInt(year)) &&
          (!month || quakeMonth === parseInt(month)) &&
          (!day || quakeDay === parseInt(day))
        );
      });
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
        <label>Date (yy/mm/dd):</label>
        <input
          type="text"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          placeholder=""
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

  // Chart setup for previous and real-time earthquakes
  const previousChartData = {
    labels: previousQuakes.map((quake) => quake.time.toISOString()), // Labels are in UTC
    datasets: [
      {
        label: 'Previous Earthquakes Magnitude',
        data: previousQuakes.map((quake) => quake.magnitude),
        borderColor: 'orange',
        backgroundColor: 'rgba(255, 165, 0, 0.2)',
        fill: true,
      }
    ]
  };

  const realTimeChartData = {
    labels: realTimeQuakes.map((quake) => quake.time.toISOString()), // Labels are in UTC
    datasets: [
      {
        label: 'Real-Time Earthquakes Magnitude',
        data: realTimeQuakes.map((quake) => quake.magnitude),
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        fill: true,
      }
    ]
  };

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
          <h4>3D View: {selectedQuake.place}</h4>
          {/* Your 3D rendering code */}
        </div>
      )}
    </div>
  );

  const renderTableView = () => (
    <div className="table-view">
      <table>
        <thead>
          <tr>
            <th>Time (UTC)</th>
            <th>Place</th>
            <th>Magnitude</th>
            <th>Depth (km)</th>
          </tr>
        </thead>
        <tbody>
          {filteredQuakes.map((quake, idx) => (
            <tr key={idx}>
              <td>{quake.time.toISOString()}</td>
              <td>{quake.place}</td>
              <td>{quake.magnitude}</td>
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
            style={{ height: '60%', width: '100%' }}
            center={[8.0, 38.5]}
            zoom={7}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {/* Map circles for previous and real-time earthquakes */}
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
                  <b>Time (UTC):</b> {quake.time.toISOString()}
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
                  <b>Time (UTC):</b> {quake.time.toISOString()}
                  <br />
                  <b>Depth:</b> {quake.depth} km
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
        <div className="sidebar">
          <button onClick={() => setViewMode('map')}>Map View</button>
          <button onClick={() => setViewMode('table')}>Table View</button>
          <button onClick={() => setViewMode('3d')}>3D View</button>

          {viewMode === 'map' && <div>{renderFilters()}</div>}
          {viewMode === 'table' && renderTableView()}
          {viewMode === '3d' && render3DView()}

          <Legend />
        </div>
        {/* Chart at the bottom center */}
        <div className="chart-container">
          <div className="chart-section">
            <h4>Previous Earthquake Magnitudes</h4>
            <Line data={previousChartData} />
          </div>
          <div className="chart-section">
            <h4>Real-Time Earthquake Magnitudes</h4>
            <Line data={realTimeChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
