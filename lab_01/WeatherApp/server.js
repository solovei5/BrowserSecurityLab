const express = require('express');

const app = express();
const PORT = 5000;

const breachMode = process.argv.includes('--mode') && process.argv.includes('breach1');

app.get('/weather.js', (req, res) => {
  res.type('application/javascript');

  if (breachMode) {
    res.send(`
      alert("HACKED: I can see your cookies: " + document.cookie + " and User: " + document.getElementById('username').innerText);
    `);
  } else {
    res.send(`
      console.log("Weather Widget: Current temperature is 22°C");
    `);
  }
});

app.listen(PORT, () => {
  console.log(`WeatherApp running at http://localhost:${PORT} | mode=${breachMode ? 'breach1' : 'normal'}`);
});