
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const logoutClientBtn = document.getElementById("logoutClientBtn");
const logoutSyncBtn = document.getElementById("logoutSyncBtn");
const loadEmailsBtn = document.getElementById("loadEmailsBtn");
const showCookieBtn = document.getElementById("showCookieBtn");
const showSessionsBtn = document.getElementById("showSessionsBtn");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");

async function refreshUser() {
  try {
    const res = await fetch("/api/me", {
      credentials: "include"
    });

    const data = await res.json();

    if (data.loggedIn) {
      statusEl.textContent = `Logged in as ${data.username} | TTL left: ${data.ttlLeftSeconds}s`;
    } else {
      statusEl.textContent = "Not logged in";
    }
  } catch (error) {
    statusEl.textContent = "Session check failed";
  }
}

async function login() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert("Enter username and password");
    return;
  }

  const url = `/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include"
  });

  const text = await res.text();
  outputEl.textContent = text;

  await refreshUser();
}

/*
  Task 1 flawed logout:
  delete cookie only on client side
*/
function clientOnlyLogout() {
  document.cookie = "SessionID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  outputEl.textContent = "Client-only logout done. Browser cookie cleared locally.";
  refreshUser();
}

/*
  Task 2 correct logout:
  ask server to kill session first
  then clear client cookie
*/
async function synchronizedLogout() {
  const res = await fetch("/api/logout", {
    method: "POST",
    credentials: "include"
  });

  const data = await res.json();

  document.cookie = "SessionID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  outputEl.textContent = JSON.stringify(data, null, 2);

  await refreshUser();
}

async function loadEmails() {
  const res = await fetch("/api/emails", {
    credentials: "include"
  });

  const text = await res.text();
  outputEl.textContent = text;

  await refreshUser();
}

function showCookie() {
  outputEl.textContent = `document.cookie = ${document.cookie}`;
}

async function showSessions() {
  const res = await fetch("/api/debug/sessions", {
    credentials: "include"
  });

  const text = await res.text();
  outputEl.textContent = text;
}

loginBtn.addEventListener("click", login);
logoutClientBtn.addEventListener("click", clientOnlyLogout);
logoutSyncBtn.addEventListener("click", synchronizedLogout);
loadEmailsBtn.addEventListener("click", loadEmails);
showCookieBtn.addEventListener("click", showCookie);
showSessionsBtn.addEventListener("click", showSessions);

refreshUser();
setInterval(refreshUser, 5000);
