const express = require("express");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send(`
    <h1>WeatherApp</h1>
    <ul>
      <li><a href="/weather-promo.html">Open malicious promo page</a></li>
    </ul>
  `);
});

app.listen(PORT, () => {
  console.log(`WeatherApp running at http://weather-lab.test:${PORT}`);
  console.log(`Alternative local URL: http://localhost:${PORT}`);
});