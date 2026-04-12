
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginModeSelect = document.getElementById("loginMode");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadEmailsBtn = document.getElementById("loadEmailsBtn");
const loadOtherBtn = document.getElementById("loadOtherBtn");
const showCookieBtn = document.getElementById("showCookieBtn");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");

async function refreshUser() {
  try {
    const res = await fetch("/api/me", { credentials: "include" });
    const data = await res.json();

    if (data.loggedIn) {
      statusEl.textContent = `Logged in as ${data.username}`;
    } else {
      statusEl.textContent = "Not logged in";
    }
  } catch (e) {
    statusEl.textContent = "Session check failed";
  }
}

async function login() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const route = loginModeSelect.value;

  if (!username || !password) {
    alert("Enter username and password");
    return;
  }

  const url = `${route}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include"
  });

  const text = await res.text();
  outputEl.textContent = text;
  await refreshUser();
}

async function logout() {
  const res = await fetch("/logout", {
    method: "GET",
    credentials: "include"
  });

  const text = await res.text();
  outputEl.textContent = text;
  await refreshUser();
}

async function loadEmails() {
  const res = await fetch("/api/emails", {
    credentials: "include"
  });
  outputEl.textContent = await res.text();
}

async function loadOther() {
  const res = await fetch("/other", {
    credentials: "include"
  });
  outputEl.textContent = await res.text();
}

function showCookie() {
  outputEl.textContent = `document.cookie = ${document.cookie}`;
}

loginBtn.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);
loadEmailsBtn.addEventListener("click", loadEmails);
loadOtherBtn.addEventListener("click", loadOther);
showCookieBtn.addEventListener("click", showCookie);

refreshUser();
