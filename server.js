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
    const data = response.data;
    
    // If data is a string, parse it as JSON
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    
    // Debug logging
    console.log('Data type:', typeof data);
    console.log('Is array after parsing:', Array.isArray(data));
    console.log('First item:', data[0] ? JSON.stringify(data[0]).substring(0, 200) : 'No first item');
    console.log('Array length:', Array.isArray(data) ? data.length : 'Not an array');
    
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
