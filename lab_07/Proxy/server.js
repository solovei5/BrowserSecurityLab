const express = require("express");

const app = express();
const PORT = 8080;
const TARGET = "http://localhost:3000";

let mode = "normal";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/proxy-mode/:value", (req, res) => {
  const value = req.params.value;

  if (!["normal", "breach"].includes(value)) {
    return res.status(400).send("Invalid mode");
  }

  mode = value;
  console.log(`Proxy mode changed to: ${mode}`);
  res.send(`Proxy mode changed to: ${mode}`);
});

app.use(async (req, res) => {
  try {
    const targetUrl = `${TARGET}${req.originalUrl}`;

    if (mode === "breach") {
      console.log("=== PROXY INTERCEPT ===");
      console.log("Method:", req.method);
      console.log("Path:", req.originalUrl);
      console.log("Cookie header:", req.headers.cookie || "(none)");
      console.log("=======================");
    }

    const headers = { ...req.headers };
    delete headers.host;

    const options = {
      method: req.method,
      headers,
      redirect: "manual"
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      options.body = JSON.stringify(req.body);
      if (!headers["content-type"]) {
        options.headers["content-type"] = "application/json";
      }
    }

    const response = await fetch(targetUrl, options);

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Proxy error");
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
});