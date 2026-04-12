const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 6000;

const mode = process.argv.includes('--mode1');

if (mode) {
  app.use(cors());
}

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`StaticHost running at http://localhost:${PORT}`);
});