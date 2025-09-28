const express = require('express');
//const fetch = require('node-fetch');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Your JSON file URL - replace with your actual Azure URL
const TIRUKKURAL_JSON_URL = 'https://sttirukkuralmvp.blob.core.windows.net/tirukkural/tirukkural.json';

// API endpoint to fetch Tirukkural data
app.get('/api/tirukkural', async (req, res) => {
  try {
    console.log('Fetching Tirukkural data from:', TIRUKKURAL_JSON_URL);
    
    /* const response = await fetch(TIRUKKURAL_JSON_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json(); */

    const response = await axios.get(TIRUKKURAL_JSON_URL);
    let data = response.data;
    
    /* console.log('Response status:', response.status);
    console.log('Content type:', response.headers['content-type']);
    console.log('Data type received:', typeof data);
    console.log('Data length:', typeof data === 'string' ? data.length : 'Not a string'); */
    
    // If data is a string, parse it as JSON
    if (typeof data === 'string') {
      //console.log('First 200 chars:', data.substring(0, 200));
      //console.log('Last 200 chars:', data.substring(data.length - 200));
      
      try {
        data = JSON.parse(data);
        //console.log('JSON parsing successful');
      } catch (parseError) {
        //console.log('JSON parse error:', parseError.message);
        //console.log('Data ends with:', data.substring(data.length - 50));
        throw new Error('Invalid JSON data received');
      }
    }
    
    //console.log('Final data type:', typeof data);
    //console.log('Is array:', Array.isArray(data));
    //console.log('Array length:', Array.isArray(data) ? data.length : 'Not an array');
    
    // Send the data back to frontend
    res.json({
      success: true,
      data: data,
      count: Array.isArray(data) ? data.length : Object.keys(data).length
    });
    
  } catch (error) {
    console.error('Error fetching Tirukkural data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Tirukkural data',
      message: error.message
    });
  }
});

// Health check endpoint for Azure
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Tirukkural app running on port ${port}`);
  console.log(`Visit: http://localhost:${port}`);
});
