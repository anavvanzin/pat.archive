const express = require('express');
const fetch = require('node-fetch'); // Keep this, but we need to ensure it's available
const app = express();
const PORT = 8080;

app.get('/api/audio-proxy', async (req, res) => {
    const audioUrl = req.query.url;
    if (!audioUrl) {
        return res.status(400).send('Missing url parameter');
    }

    try {
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        
        // Node-fetch response buffer
        const buffer = await response.buffer();
        res.set('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
        res.set('Access-Control-Allow-Origin', '*');
        res.send(buffer);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
