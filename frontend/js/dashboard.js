const BASE = "https://railway-water-backend.onrender.com/api";
let currentFilter = "";
let firstLoad = true;
let refreshTimer = null;

// session
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toLowerCase();
const name = localStorage.getItem("name");

if (!token) window.location.href = "login.html";

// ---------- PAGE NAVIGATION ----------
function showPage(page) {
  document.getElementById("dashboardPage").style.display = "none";
  document.getElementById("usersPage").style.display = "none";
  document.getElementById("masterPage").style.display = "none";

  if (page === "dashboard") {
    document.getElementById("dashboardPage").style.display = "block";
  }
  if (page === "users") {
    document.getElementById("usersPage").style.display = "block";
    loadUsers();
  }
  if (page === "master") {
    document.getElementById("masterPage").style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginInfo").innerText = `👤 ${name} (${role})`;

  // Initial Data Load
  loadData();
  
  // Setup Admin Buttons and Initial Page
  loadUsersIfAdmin();
  showPage("dashboard");

  // Auto-refresh for Dashboard Data
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    // Only refresh if we are actually on the dashboard page
    if (document.getElementById("dashboardPage").style.display !== "none") {
      loadData(currentFilter);
    }
  }, 5000);
});

// ---------------- ADMIN DETECTION ----------------
function loadUsersIfAdmin() {
  const isAdmin = (role === "admin" || role === "super_admin" || role === "superadmin");
  
  const usersBtn = document.getElementById("usersBtn");
  const masterBtn = document.getElementById("masterBtn");

  if (isAdmin) {
    if (usersBtn) usersBtn.style.display = "inline-block";
    if (masterBtn) masterBtn.style.display = "inline-block";
  } else {
    if (usersBtn) usersBtn.style.display = "none";
    if (masterBtn) masterBtn.style.display = "none";
  }
}

// ---------------- LOAD WATER DATA ----------------
async function loadData(query = "") {
  try {
    const res = await fetch(`${BASE}/latest${query}`, {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();

    const table = document.getElementById("dataTable");
    table.innerHTML = "";

    let healthy = 0, low = 0, critical = 0;
    const stations = new Set();
    const trains = new Set();

    data.forEach(row => {
      stations.add(row.station_number);
      trains.add(row.train_number);

      let status = "Healthy", cls = "goodText";
      if (row.water_level < 50) { status = "Low"; cls = "low"; low++; }
      if (row.water_level < 25) { status = "CRITICAL"; cls = "critical"; critical++; }
      if (row.water_level >= 50) healthy++;

      table.innerHTML += `
        <tr>
          <td>${row.station_number}</td>
          <td>${row.train_name || row.train_number}</td>
          <td>${row.coach_number}</td>
          <td>${row.water_level}%</td>
          <td class="${cls}">${status}</td>
          <td>${new Date(row.received_at).toLocaleTimeString()}</td>
        </tr>`;
    });

    document.getElementById("healthyCount").innerText = healthy;
    document.getElementById("lowCount").innerText = low;
    document.getElementById("criticalCount").innerText = critical;

    populateFilters(stations, trains);
  } catch (err) {
    console.error("Error loading water data:", err);
  }
}

// ---------------- FILTER ----------------
function applyFilter() {
  const st = document.getElementById("filterStation").value;
  const tr = document.getElementById("filterTrain").value;
  let query = "?";
  if (st) query += `station=${st}&`;
  if (tr) query += `train=${tr}`;
  currentFilter = query;
  loadData(query);
}

function clearFilter() {
  currentFilter = "";
  document.getElementById("filterStation").value = "";
  document.getElementById("filterTrain").value = "";
  loadData();
}

function populateFilters(stations, trains) {
  if (!firstLoad) return;
  const s = document.getElementById("filterStation");
  const t = document.getElementById("filterTrain");

  stations.forEach(v => {
    if(v) s.innerHTML += `<option value="${v}">${v}</option>`;
  });
  trains.forEach(v => {
    if(v) t.innerHTML += `<option value="${v}">${v}</option>`;
  });
  firstLoad = false;
}

// ---------------- USER MANAGEMENT ----------------
async function loadUsers() {
  try {
    const res = await fetch(`${BASE}/users`, {
      headers: { Authorization: "Bearer " + token }
    });
    const users = await res.json();
    const table = document.getElementById("usersTable");
    table.innerHTML = "";

    users.forEach(u => {
      table.innerHTML += `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${u.station_access || "-"}</td>
        </tr>`;
    });
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

async function createUser() {
  const name = document.getElementById("u_name").value;
  const email = document.getElementById("u_email").value;
  const password = document.getElementById("u_pass").value;
  const role = document.getElementById("u_role").value;
  const station = document.getElementById("u_station").value;

  const res = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ name, email, password, role, station_access: station })
  });
  const result = await res.json();
  alert(result.message);
  loadUsers();
}

async function updateUser() {
  const email = document.getElementById("edit_email").value;
  const name = document.getElementById("edit_name").value;
  const role = document.getElementById("edit_role").value;
  const station = document.getElementById("edit_station").value;

  if (!email) return alert("Email required");

  const res = await fetch(`${BASE}/users/by-email`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ email, name, role, station_access: station })
  });
  const result = await res.json();
  alert(result.message);
  loadUsers();
}

// ---------------- MASTER DATA ----------------
async function addTrain() {
  const train_number = document.getElementById("train_no").value;
  const train_name = document.getElementById("train_name").value;
  const res = await fetch(`${BASE}/master/train`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ train_number, train_name })
  });
  alert((await res.json()).message);
}

async function addStation() {
  const station_number = document.getElementById("station_no").value;
  const station_name = document.getElementById("station_name").value;
  const res = await fetch(`${BASE}/master/station`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ station_number, station_name })
  });
  alert((await res.json()).message);
}

async function updateTrain() {
  const no = document.getElementById("edit_train_no").value;
  const name = document.getElementById("edit_train_name").value;
  const res = await fetch(`${BASE}/master/train/${no}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ train_name: name })
  });
  alert((await res.json()).message);
}

async function updateStation() {
  const no = document.getElementById("edit_station_no").value;
  const name = document.getElementById("edit_station_name").value;
  const res = await fetch(`${BASE}/master/station/${no}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ station_name: name })
  });
  alert((await res.json()).message);
}

// ---------------- LOGOUT ----------------
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

window.addEventListener("beforeunload", () => {
  if (refreshTimer) clearInterval(refreshTimer);
});