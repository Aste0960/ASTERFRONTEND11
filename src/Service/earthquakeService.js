import axios from 'axios';

export const fetchEarthquakeData = async () => {
  try {
    const response = await axios.get(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson'
    );
    return response.data.features.map((feature) => ({
      id: feature.id,
      place: feature.properties.place,
      magnitude: feature.properties.mag,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
    }));
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return [];
  }
};
