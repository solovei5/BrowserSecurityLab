const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginModeSelect = document.getElementById("loginMode");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loadEmailsBtn = document.getElementById("loadEmailsBtn");
const showCsrfBtn = document.getElementById("showCsrfBtn");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const emailsContainer = document.getElementById("emailsContainer");

let currentCsrfToken = null;

async function refreshUser() {
  const res = await fetch("/api/me", { credentials: "include" });
  const data = await res.json();

  if (data.loggedIn) {
    currentCsrfToken = data.csrfToken;
    statusEl.textContent = `Logged in as ${data.username} | TTL left: ${data.ttlLeftSeconds}s`;
  } else {
    currentCsrfToken = null;
    statusEl.textContent = "Not logged in";
    emailsContainer.innerHTML = "";
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

  outputEl.textContent = await res.text();
  await refreshUser();
  await loadEmails();
}

async function logout() {
  const res = await fetch("/api/logout", {
    method: "POST",
    credentials: "include"
  });

  outputEl.textContent = await res.text();
  await refreshUser();
}

async function loadEmails() {
  const res = await fetch("/api/emails", {
    credentials: "include"
  });

  const text = await res.text();
  outputEl.textContent = text;

  if (!res.ok) {
    emailsContainer.innerHTML = "";
    return;
  }

  const data = JSON.parse(text);
  renderEmails(data.emails);
}

function renderEmails(emails) {
  if (!emails.length) {
    emailsContainer.innerHTML = "<p>No emails left.</p>";
    return;
  }

  emailsContainer.innerHTML = emails.map(email => `
    <div class="email">
      <div class="email-top">
        <div>
          <strong>#${email.id}</strong> — ${email.subject}<br>
          <small>From: ${email.from}</small>
        </div>
        <div>
          <button onclick="deleteEmailVulnerable(${email.id})">Delete via GET</button>
          <button onclick="deleteEmailProtected(${email.id})">Delete via POST + CSRF</button>
        </div>
      </div>
    </div>
  `).join("");
}

/*
  Task 1 vulnerable delete
*/
async function deleteEmailVulnerable(id) {
  const res = await fetch(`/api/emails/delete/${id}`, {
    method: "GET",
    credentials: "include"
  });

  outputEl.textContent = await res.text();
  await loadEmails();
}

/*
  Task 4 protected delete
*/
async function deleteEmailProtected(id) {
  const res = await fetch(`/api/emails/delete/${id}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": currentCsrfToken || ""
    },
    body: JSON.stringify({
      _csrf_token: currentCsrfToken || ""
    })
  });

  outputEl.textContent = await res.text();
  await loadEmails();
}

function showCsrfToken() {
  outputEl.textContent = `CSRF token: ${currentCsrfToken}`;
}

loginBtn.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);
loadEmailsBtn.addEventListener("click", loadEmails);
showCsrfBtn.addEventListener("click", showCsrfToken);

window.deleteEmailVulnerable = deleteEmailVulnerable;
window.deleteEmailProtected = deleteEmailProtected;

refreshUser();