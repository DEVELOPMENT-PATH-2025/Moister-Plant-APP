import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Global state for sensor data
let irData = { detected: false, count: 0, lastUpdate: Date.now() };
let moistureData = { moisture: 45, temp: 24.4, humidity: 42, pump: false, lastUpdate: Date.now() };

// IR API
app.post('/api/ir/data', (req, res) => {
    const { detected } = req.body;
    if (detected && !irData.detected) irData.count++;
    irData.detected = Boolean(detected);
    irData.lastUpdate = Date.now();
    res.json({ success: true, count: irData.count });
});

app.get('/api/ir/status', (req, res) => res.json(irData));

// Moisture API
app.post('/api/moisture/data', (req, res) => {
    const { moisture, temp, humidity, pump } = req.body;
    moistureData = { 
        moisture: moisture !== undefined ? moisture : moistureData.moisture, 
        temp: temp !== undefined ? temp : moistureData.temp, 
        humidity: humidity !== undefined ? humidity : moistureData.humidity,
        pump: pump !== undefined ? pump : moistureData.pump,
        lastUpdate: Date.now() 
    };
    res.json({ success: true });
});

app.get('/api/moisture/status', (req, res) => res.json(moistureData));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus IoT Server running on http://localhost:${PORT}`);
});
