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
// Add these updates to your existing dashboard.js showPage function

// ---------- PAGE NAVIGATION WITH SECURITY GUARD ----------
function showPage(page) {
  const isAdmin = (role === "admin" || role === "super_admin" || role === "superadmin");

  // SECURITY CHECK: If a non-admin tries to access Users or Master, force them to Dashboard
  if (!isAdmin && (page === "users" || page === "master")) {
    console.warn("Unauthorized access attempt blocked.");
    page = "dashboard";
  }

  // Hide all sections using the 'hidden' class from our stylish CSS
  document.getElementById("dashboardPage").classList.add("hidden");
  document.getElementById("usersPage").classList.add("hidden");
  document.getElementById("masterPage").classList.add("hidden");

  // Remove active class from all nav items
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  // Show selected section and update UI
  if (page === "dashboard") {
    document.getElementById("dashboardPage").classList.remove("hidden");
    document.getElementById("link-dashboard").classList.add("active");
    document.getElementById("pageTitle").innerText = "Live Dashboard";
    loadData(currentFilter);
  }

  if (page === "users") {
    document.getElementById("usersPage").classList.remove("hidden");
    document.getElementById("link-users").classList.add("active");
    document.getElementById("pageTitle").innerText = "User Management";
    loadUsers();
  }

  if (page === "master") {
    document.getElementById("masterPage").classList.remove("hidden");
    document.getElementById("link-master").classList.add("active");
    document.getElementById("pageTitle").innerText = "Master Data Registry";
  }
}

// Update your loadData table rows to use the new "status-badge" classes
// Inside loadData data.forEach:
/*
  let status = "Healthy", statusCls = "status-good";
  if (row.water_level < 50) { status = "Low"; statusCls = "status-low"; }
  if (row.water_level < 25) { status = "CRITICAL"; statusCls = "status-critical"; }

  table.innerHTML += `
    <tr>
      <td><b>${row.station_number}</b></td>
      <td>${row.train_name || row.train_number}</td>
      <td><span style="background:#eee; padding:2px 8px; border-radius:5px">${row.coach_number}</span></td>
      <td><b>${row.water_level}%</b></td>
      <td><span class="status-badge ${statusCls}">${status}</span></td>
      <td style="color:#888; font-size:0.85rem">${new Date(row.received_at).toLocaleTimeString()}</td>
    </tr>`;
*/

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
  // Normalize role check for all admin variations
  const isAdmin = (role === "admin" || role === "super_admin" || role === "superadmin");

  const usersBtn = document.getElementById("link-users");
  const masterBtn = document.getElementById("link-master");

  if (isAdmin) {
    if (usersBtn) usersBtn.classList.remove("hidden");
    if (masterBtn) masterBtn.classList.remove("hidden");
    // Only load users list if they are actually an admin
    if (document.getElementById("usersPage").style.display !== "none") {
      loadUsers();
    }
  } else {
    // Strictly hide for standard users
    if (usersBtn) usersBtn.classList.add("hidden");
    if (masterBtn) masterBtn.classList.add("hidden");
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

    data.forEach(row => {
      let status = "Healthy", statusCls = "status-good";

      // Logic for status and CSS classes
      if (row.water_level < 50 && row.water_level >= 25) {
        status = "Low";
        statusCls = "status-low";
        low++;
      } else if (row.water_level < 25) {
        status = "CRITICAL";
        statusCls = "status-critical"; // This triggers the CSS animation
        critical++;
      } else {
        healthy++;
      }

      table.innerHTML += `
                <tr>
                    <td><b>${row.station_number}</b></td>
                    <td>${row.train_name || row.train_number}</td>
                    <td><span style="background:#f1f1f1; padding:2px 8px; border-radius:5px">${row.coach_number}</span></td>
                    <td><b>${row.water_level}%</b></td>
                    <td><span class="status-badge ${statusCls}">${status}</span></td>
                    <td style="color:#888; font-size:0.85rem">${new Date(row.received_at).toLocaleTimeString()}</td>
                </tr>`;
    });

    document.getElementById("healthyCount").innerText = healthy;
    document.getElementById("lowCount").innerText = low;
    document.getElementById("criticalCount").innerText = critical;

    // populateFilters(stations, trains); // Keep your existing filter logic
  } catch (err) {
    console.error("Fetch error:", err);
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
    if (v) s.innerHTML += `<option value="${v}">${v}</option>`;
  });
  trains.forEach(v => {
    if (v) t.innerHTML += `<option value="${v}">${v}</option>`;
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

/* ---------------- UPDATE USER (Fixed) ---------------- */
async function updateUser() {
  const email = document.getElementById("edit_email").value.trim();
  const name = document.getElementById("edit_name").value.trim();
  const roleValue = document.getElementById("edit_role").value;
  const station = document.getElementById("edit_station").value.trim();

  if (!email) {
    alert("Please enter the user's email to identify them.");
    return;
  }

  try {
    const res = await fetch(`${BASE}/users/by-email`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        email: email,
        name: name || undefined,
        role: roleValue || undefined,
        station_access: station || undefined
      })
    });

    const data = await res.json();
    alert(data.message || "User updated successfully");
    loadUsers(); // Refresh table

    // Clear inputs
    document.getElementById("edit_email").value = "";
    document.getElementById("edit_name").value = "";
    document.getElementById("edit_station").value = "";
  } catch (err) {
    console.error("Update Error:", err);
    alert("Failed to update user.");
  }
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

/* ---------------- UPDATE TRAIN ---------------- */
async function updateTrain() {
  const no = document.getElementById("edit_train_no").value.trim();
  const name = document.getElementById("edit_train_name").value.trim();

  if (!no || !name) {
    alert("Please enter both Train Number and New Name");
    return;
  }

  try {
    const res = await fetch(`${BASE}/master/train/${no}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ train_name: name })
    });

    const data = await res.json();
    alert(data.message || "Train updated");
    document.getElementById("edit_train_no").value = "";
    document.getElementById("edit_train_name").value = "";
  } catch (err) {
    alert("Error updating train");
  }
}

/* ---------------- UPDATE STATION ---------------- */
async function updateStation() {
  const no = document.getElementById("edit_station_no").value.trim();
  const name = document.getElementById("edit_station_name").value.trim();

  if (!no || !name) {
    alert("Please enter both Station Code and New Name");
    return;
  }

  try {
    const res = await fetch(`${BASE}/master/station/${no}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ station_name: name })
    });

    const data = await res.json();
    alert(data.message || "Station updated");
    document.getElementById("edit_station_no").value = "";
    document.getElementById("edit_station_name").value = "";
  } catch (err) {
    alert("Error updating station");
  }
}

/* --- TASK 1: SIDEBAR TOGGLE --- */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const icon = document.getElementById('toggleIcon');
  
  sidebar.classList.toggle('collapsed');
  
  // Flip the arrow icon
  if (sidebar.classList.contains('collapsed')) {
    icon.classList.replace('fa-chevron-left', 'fa-chevron-right');
  } else {
    icon.classList.replace('fa-chevron-right', 'fa-chevron-left');
  }
}

// ---------------- LOGOUT ----------------
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

window.addEventListener("beforeunload", () => {
  if (refreshTimer) clearInterval(refreshTimer);
});