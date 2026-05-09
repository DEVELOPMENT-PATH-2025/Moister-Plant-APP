import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve index.html for unknown paths (SPA behavior) or just let express.static handle it
// Since we have multiple HTML files, we don't necessarily want a catch-all to index.html
// But we might want to map '/' to 'index.html'

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus IoT Server running on http://localhost:${PORT}`);
});
