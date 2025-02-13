const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Proxy endpoint for WazirX
app.get('/api/wazirx', async (req, res) => {
    try {
        const response = await fetch('https://api.wazirx.com/api/v2/tickers');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Proxy endpoint for Binance
app.get('/api/binance', async (req, res) => {
    try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 