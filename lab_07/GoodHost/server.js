const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = {
  alice: { username: "alice", password: "alice123" },
  john: { username: "john", password: "john123" }
};

const SESSION_TTL_MS = 2 * 60 * 1000;
const activeSessions = new Map();

const emailStore = {
  alice: [
    { id: 1, from: "boss@company.com", subject: "Meeting at 10:00" },
    { id: 2, from: "friend@gmail.com", subject: "Weekend plans" },
    { id: 3, from: "shop@example.com", subject: "Your order update" }
  ],
  john: [
    { id: 1, from: "team@work.com", subject: "Sprint planning" },
    { id: 2, from: "bank@example.com", subject: "Account notice" }
  ]
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

function generateRandomToken(size = 24) {
  return crypto.randomBytes(size).toString("hex");
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

function requireSession(req, res, next) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized. Session missing, invalid, or expired." });
  }
  req.session = session;
  next();
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
    ttlLeftSeconds: Math.ceil(ttlLeftMs / 1000),
    csrfToken: session.csrfToken
  });
});

/*
  Lab 7 Task 1/3
  Modes:
  - /login-lax
  - /login-strict
  - /login-none
*/
app.get("/login-lax", (req, res) => {
  handleLogin(req, res, "Lax");
});

app.get("/login-strict", (req, res) => {
  handleLogin(req, res, "Strict");
});

app.get("/login-none", (req, res) => {
  handleLogin(req, res, "None");
});

function handleLogin(req, res, sameSiteValue) {
  const { username, password } = req.query;

  if (!username || !password) {
    return res.status(400).send("Missing username or password");
  }

  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).send("Invalid credentials");
  }

  const sessionId = generateSessionId(user.username);
  const csrfToken = generateRandomToken(16);

  activeSessions.set(sessionId, {
    username: user.username,
    createdAt: Date.now(),
    csrfToken
  });

  let cookie = `SessionID=${sessionId}; Path=/; HttpOnly; SameSite=${sameSiteValue}`;
  res.setHeader("Set-Cookie", cookie);
  res.send(`Login successful as ${user.username} with SameSite=${sameSiteValue}`);
}

app.post("/api/logout", requireSession, (req, res) => {
  activeSessions.delete(req.session.sessionId);
  res.json({ success: true, message: "Server-side session terminated" });
});

app.get("/api/emails", requireSession, (req, res) => {
  const emails = emailStore[req.session.username] || [];
  res.json({
    message: `Emails for ${req.session.username}`,
    emails
  });
});

/*
  Task 1: vulnerable delete via GET
*/
app.get("/api/emails/delete/:id", requireSession, (req, res) => {
  const id = Number(req.params.id);
  const emails = emailStore[req.session.username] || [];
  const before = emails.length;

  emailStore[req.session.username] = emails.filter(email => email.id !== id);

  const deleted = emailStore[req.session.username].length < before;

  res.json({
    success: deleted,
    message: deleted
      ? `Email #${id} deleted via vulnerable GET route`
      : `Email #${id} not found`
  });
});

/*
  Task 4: hardened delete via POST + CSRF token
*/
app.post("/api/emails/delete/:id", requireSession, (req, res) => {
  const id = Number(req.params.id);
  const incomingToken = req.get("x-csrf-token") || req.body._csrf_token;

  if (!incomingToken || incomingToken !== req.session.csrfToken) {
    return res.status(403).json({ error: "Forbidden. Invalid CSRF token." });
  }

  const emails = emailStore[req.session.username] || [];
  const before = emails.length;

  emailStore[req.session.username] = emails.filter(email => email.id !== id);

  const deleted = emailStore[req.session.username].length < before;

  res.json({
    success: deleted,
    message: deleted
      ? `Email #${id} deleted via protected POST route`
      : `Email #${id} not found`
  });
});

app.get("/api/debug/sessions", (req, res) => {
  cleanupExpiredSessions();
  res.json(
    Array.from(activeSessions.entries()).map(([sessionId, sessionData]) => ({
      sessionId,
      username: sessionData.username,
      createdAt: sessionData.createdAt,
      csrfToken: sessionData.csrfToken
    }))
  );
});

app.listen(PORT, () => {
  console.log(`GoodHost running at http://mail-lab.test:${PORT}`);
  console.log(`Alternative local URL: http://localhost:${PORT}`);
});