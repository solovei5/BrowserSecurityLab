
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 6100;

const mode1 = process.argv.includes('--mode1');

const reactModeIndex = process.argv.indexOf('--react-mode');
const reactMode = reactModeIndex !== -1 ? process.argv[reactModeIndex + 1] : 'normal';

if (mode1) {
  app.use(cors());
}

app.get('/react-mock.js', (req, res) => {
  res.type('application/javascript');

  if (reactMode === 'breach') {
    return res.send(`alert("CRITICAL: CDN Compromised! Stealing data...");`);
  }

  if (reactMode === 'v101') {
    return res.send(`console.log("React v1.0.1 loaded from CDN (Port 6100)");`);
  }

  return res.send(`console.log("React v1.0.0 loaded from CDN (Port 6100)");`);
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`StaticHost running at http://localhost:${PORT} | react-mode=${reactMode}`);
});
