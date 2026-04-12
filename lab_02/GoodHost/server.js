const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const versionPath = path.join(__dirname, 'version.txt');
const configPath = path.join(__dirname, 'config.json');

const version = fs.readFileSync(versionPath, 'utf-8').trim();
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

console.log(`[System] Starting ${config.appName} v${version}...`);

if (config.mode === 'mode1') {
  app.use(cors());
}

app.use((req, res, next) => {
  if (config.mode === 'csp-strict') {
    res.setHeader('Content-Security-Policy', "default-src 'self';");
  }

  if (config.mode === 'csp-balanced') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src *; style-src *; script-src 'self' http://localhost:4000 http://localhost:6100;"
    );
  }

  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const emails = [
  {
    id: 1,
    sender: 'alice@example.com',
    subject: 'Welcome to SecureMail',
    body: 'Hello John, welcome to SecureMail Pro. Your account is ready.'
  },
  {
    id: 2,
    sender: 'support@trustco.com',
    subject: 'Support Ticket Update',
    body: 'Your support request has been received. We will contact you soon.'
  }
];

app.get('/api/emails', (req, res) => {
  res.json(emails);
});

app.get('/api/config', (req, res) => {
  res.json(config);
});

app.listen(PORT, () => {
  console.log(`GoodHost running at http://localhost:${PORT}`);
});