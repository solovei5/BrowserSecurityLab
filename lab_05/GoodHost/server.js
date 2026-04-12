
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = {
  alice: {
    username: "alice",
    password: "alice123",
    sessionId: "alice-session-111"
  },
  john: {
    username: "john",
    password: "john123",
    sessionId: "john-session-222"
  }
};

function parseCookies(cookieHeader = "") {
  const cookies = {};
  cookieHeader.split(";").forEach(part => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return;
    cookies[key] = rest.join("=");
  });
  return cookies;
}

function getCurrentUser(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const sessionId = cookies.SessionID;

  return Object.values(users).find(user => user.sessionId === sessionId) || null;
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/me", (req, res) => {
  const user = getCurrentUser(req);

  if (!user) {
    return res.json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    username: user.username
  });
});

/*
  Lab 5 Task 1:
  HttpOnly cookie
*/
app.get("/login", (req, res) => {
  const { username, password } = req.query;

  if (!username || !password) {
    return res.status(400).send("Missing username or password");
  }

  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).send("Invalid credentials");
  }

  res.setHeader("Set-Cookie", `SessionID=${user.sessionId}; Path=/; HttpOnly`);
  res.send(`Login successful as ${user.username} with HttpOnly cookie`);
});

/*
  Lab 5 Task 2:
  HttpOnly + Secure cookie
*/
app.get("/login-secure", (req, res) => {
  const { username, password } = req.query;

  if (!username || !password) {
    return res.status(400).send("Missing username or password");
  }

  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).send("Invalid credentials");
  }

  res.setHeader("Set-Cookie", `SessionID=${user.sessionId}; Path=/; HttpOnly; Secure`);
  res.send(`Login successful as ${user.username} with HttpOnly + Secure cookie`);
});

app.get("/logout", (req, res) => {
  res.setHeader("Set-Cookie", "SessionID=; Path=/; Max-Age=0");
  res.send("Logged out");
});

app.get("/api/emails", (req, res) => {
  console.log("GoodHost /api/emails Cookie:", req.headers.cookie || "(none)");

  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ error: "Not authorized" });
  }

  res.json({
    message: `Emails for ${user.username}`,
    emails: [
      { from: "boss@company.com", subject: "Meeting at 10:00" },
      { from: "friend@gmail.com", subject: "Weekend plans" }
    ]
  });
});

app.get("/other", (req, res) => {
  console.log("GoodHost /other Cookie:", req.headers.cookie || "(none)");
  res.send("This is another page");
});

app.listen(PORT, () => {
  console.log(`GoodHost running at http://localhost:${PORT}`);
});
