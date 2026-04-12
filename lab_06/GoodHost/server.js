
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = {
  alice: {
    username: "alice",
    password: "alice123"
  },
  john: {
    username: "john",
    password: "john123"
  }
};

const SESSION_TTL_MS = 2 * 60 * 1000;
const activeSessions = new Map();

function parseCookies(cookieHeader = "") {
  const cookies = {};
  cookieHeader.split(";").forEach(part => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return;
    cookies[key] = rest.join("=");
  });
  return cookies;
}

function generateSessionId(username) {
  return `${username}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function cleanupExpiredSessions() {
  const now = Date.now();

  for (const [sessionId, sessionData] of activeSessions.entries()) {
    if (now - sessionData.createdAt > SESSION_TTL_MS) {
      activeSessions.delete(sessionId);
    }
  }
}

function getSessionFromRequest(req) {
  cleanupExpiredSessions();

  const cookies = parseCookies(req.headers.cookie || "");
  const sessionId = cookies.SessionID;

  if (!sessionId) return null;

  const sessionData = activeSessions.get(sessionId);
  if (!sessionData) return null;

  return {
    sessionId,
    ...sessionData
  };
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/me", (req, res) => {
  const session = getSessionFromRequest(req);

  if (!session) {
    return res.json({ loggedIn: false });
  }

  const ttlLeftMs = Math.max(0, SESSION_TTL_MS - (Date.now() - session.createdAt));

  res.json({
    loggedIn: true,
    username: session.username,
    ttlLeftSeconds: Math.ceil(ttlLeftMs / 1000)
  });
});

app.get("/login", (req, res) => {
  const { username, password } = req.query;

  if (!username || !password) {
    return res.status(400).send("Missing username or password");
  }

  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).send("Invalid credentials");
  }

  const sessionId = generateSessionId(user.username);

  activeSessions.set(sessionId, {
    username: user.username,
    createdAt: Date.now()
  });

  res.setHeader("Set-Cookie", `SessionID=${sessionId}; Path=/; HttpOnly`);
  res.send(`Login successful as ${user.username}`);
});

app.get("/api/emails", (req, res) => {
  const session = getSessionFromRequest(req);

  console.log("GET /api/emails");
  console.log("Cookie header:", req.headers.cookie || "(none)");
  console.log("Resolved session:", session ? session.sessionId : "(invalid)");

  if (!session) {
    return res.status(401).json({ error: "Unauthorized. Session missing, invalid, or expired." });
  }

  res.json({
    message: `Emails for ${session.username}`,
    emails: [
      { from: "boss@company.com", subject: "Meeting at 10:00" },
      { from: "friend@gmail.com", subject: "Weekend plans" }
    ]
  });
});

/*
  Task 2: synchronized logout
*/
app.post("/api/logout", (req, res) => {
  const cookies = parseCookies(req.headers.cookie || "");
  const sessionId = cookies.SessionID;

  if (sessionId && activeSessions.has(sessionId)) {
    activeSessions.delete(sessionId);
  }

  res.json({ success: true, message: "Server-side session terminated" });
});

/*
  Optional route to inspect sessions while testing
*/
app.get("/api/debug/sessions", (req, res) => {
  cleanupExpiredSessions();

  const data = Array.from(activeSessions.entries()).map(([sessionId, sessionData]) => ({
    sessionId,
    username: sessionData.username,
    createdAt: sessionData.createdAt
  }));

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`GoodHost running at http://localhost:${PORT}`);
});
