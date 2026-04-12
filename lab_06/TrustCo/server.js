
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 4000;

const mode = process.argv.includes('--mode1');

if (mode) {
  app.use(cors());
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/support/messages', (req, res) => {
  res.json({
    status: 'ok',
    message: 'No new support messages'
  });
});

app.listen(PORT, () => {
  console.log(`TrustCo running at http://localhost:${PORT}`);
});
