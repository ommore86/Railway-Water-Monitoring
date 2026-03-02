const BASE = "https://railway-water-backend.onrender.com/api";
let currentFilter = "";
let firstLoad = true;
let refreshTimer = null;
let openTrains = new Set();

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

  // SECURITY CHECK: If a non-admin tries to access restricted pages, force them to Dashboard
  if (!isAdmin && (page === "users" || page === "train" || page === "station")) {
    console.warn("Unauthorized access attempt blocked.");
    page = "dashboard";
  }

  // Hide all sections
  document.getElementById("dashboardPage").classList.add("hidden");
  document.getElementById("usersPage").classList.add("hidden");
  document.getElementById("trainPage").classList.add("hidden");
  document.getElementById("stationPage").classList.add("hidden");

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

  if (page === "train") {
    document.getElementById("trainPage").classList.remove("hidden");
    document.getElementById("link-train").classList.add("active");
    document.getElementById("pageTitle").innerText = "Train Master";
    loadTrains();
  }

  if (page === "station") {
    document.getElementById("stationPage").classList.remove("hidden");
    document.getElementById("link-station").classList.add("active");
    document.getElementById("pageTitle").innerText = "Station Master";
    loadStations();
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

  // Populate profile dropdown
  const email = localStorage.getItem("email") || "";
  const station = localStorage.getItem("station") || "";
  document.getElementById("profileName").innerText = name || "User";
  document.getElementById("profileEmail").innerText = email;
  document.getElementById("profileRole").innerText = (role || "user").toUpperCase();
  document.getElementById("profileStation").innerHTML =
    station ? `<span class="station-badge">${station}</span>` : '<span style="color:#aaa">Not Assigned</span>';

  // Initial Data Load
  loadData();

  // Setup Admin Buttons and Initial Page
  loadUsersIfAdmin();
  showPage("dashboard");

  // Auto-refresh for Dashboard Data
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    // Check if dashboardPage is NOT hidden
    const isDashboardVisible = !document.getElementById("dashboardPage").classList.contains("hidden");
    if (isDashboardVisible) {
      loadData(currentFilter);
    }
  }, 5000);

  // Close profile dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const wrapper = document.querySelector(".user-pill-wrapper");
    const dropdown = document.getElementById("profileDropdown");
    if (wrapper && !wrapper.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
});

// ---------------- ADMIN DETECTION ----------------
function loadUsersIfAdmin() {
  // Normalize role check for all admin variations
  const isAdmin = (role === "admin" || role === "super_admin" || role === "superadmin");

  const usersBtn = document.getElementById("link-users");
  const trainBtn = document.getElementById("link-train");
  const stationBtn = document.getElementById("link-station");

  if (isAdmin) {
    if (usersBtn) usersBtn.classList.remove("hidden");
    if (trainBtn) trainBtn.classList.remove("hidden");
    if (stationBtn) stationBtn.classList.remove("hidden");
    // Only load users list if they are actually an admin
    if (document.getElementById("usersPage").style.display !== "none") {
      loadUsers();
    }
  } else {
    // Strictly hide for standard users
    if (usersBtn) usersBtn.classList.add("hidden");
    if (trainBtn) trainBtn.classList.add("hidden");
    if (stationBtn) stationBtn.classList.add("hidden");
  }
}

// ---------------- LOAD WATER DATA ----------------
async function loadData(query = "") {
  try {
    const res = await fetch(`${BASE}/latest${query}`, {
      headers: { Authorization: "Bearer " + token }
    });
    const rawData = await res.json();
    const tableBody = document.getElementById("dataTable");

    // 1. Group Data by Train Number
    const trains = {};
    let totalHealthy = 0, totalLow = 0, totalCritical = 0;

    rawData.forEach(row => {
      const tNum = row.train_number;
      if (!trains[tNum]) {
        trains[tNum] = {
          station: row.station_number,
          name: row.train_name || row.train_number,
          time: row.received_at,
          coaches: [],
          h: 0, l: 0, c: 0
        };
      }

      let status = "Healthy";
      if (row.water_level < 25) {
        status = "Critical"; trains[tNum].c++; totalCritical++;
      } else if (row.water_level < 50) {
        status = "Low"; trains[tNum].l++; totalLow++;
      } else {
        status = "Healthy"; trains[tNum].h++; totalHealthy++;
      }
      trains[tNum].coaches.push({ no: row.coach_number, lv: row.water_level, st: status });
    });

    // 2. Build the new HTML string in a variable first
    let newHTML = "";

    Object.keys(trains).forEach(tNum => {
      const t = trains[tNum];
      const detailId = `details-${tNum}`;
      // Check memory: if train was open, keep it open in the new HTML
      const isExpanded = openTrains.has(detailId);

      newHTML += `
        <tr class="train-row ${isExpanded ? 'expanded' : ''}" data-id="${detailId}" onclick="toggleTrainDetails('${detailId}', this)">
          <td><i class="fas fa-chevron-down expand-icon"></i></td>
          <td><b>${t.station}</b></td>
          <td>${t.name} <small>(${tNum})</small></td>
          <td>${t.coaches.length} Coaches</td>
          <td>
            <span class="status-badge status-good">${t.h} H</span>
            <span class="status-badge status-low">${t.l} L</span>
            <span class="status-badge status-critical">${t.c} C</span>
          </td>
          <td>${new Date(t.time).toLocaleTimeString()}</td>
        </tr>
        <tr id="${detailId}" class="coach-details-row ${isExpanded ? '' : 'hidden'}">
          <td colspan="6">
            <div class="coach-grid">
              ${t.coaches.map(c => {
                // Only apply the 'inner-blink' to the badge if status is Critical
                const blinkClass = (c.st === 'Critical') ? 'inner-blink' : '';
                
                return `
                  <div class="coach-card card-${c.st.toLowerCase()}">
                    <small style="font-size: 11px; color: #666; font-weight: bold; text-transform: uppercase;">
                      Coach ${c.no}
                    </small>
                    
                    <div class="water-pct">
                      ${c.lv}%
                    </div>
                    
                    <span class="status-badge status-${c.st.toLowerCase()} ${blinkClass}" 
                          style="font-size: 11px; padding: 4px 10px; margin-top: 10px; min-width: 80px;">
                      ${c.st}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </td>
        </tr>`;
    });

    // 3. Update the Table
    if (tableBody.innerHTML !== newHTML) {
      tableBody.innerHTML = newHTML;
    }

    // 4. Update the LIVE TIMESTAMP (The part you requested)
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const refreshEl = document.getElementById("refreshStatus");
    if (refreshEl) {
      refreshEl.innerText = `Live: Last updated at ${timeStr}`;
    }

    // Update Top Cards
    document.getElementById("healthyCount").innerText = totalHealthy;
    document.getElementById("lowCount").innerText = totalLow;
    document.getElementById("criticalCount").innerText = totalCritical;

    if (firstLoad && rawData.length > 0) {
      populateFilters([...new Set(rawData.map(r => r.station_number))], [...new Set(rawData.map(r => r.train_number))]);
    }

  } catch (err) {
    console.error("Fetch error:", err);
    const refreshEl = document.getElementById("refreshStatus");
    if (refreshEl) refreshEl.innerText = "Live: Connection error...";
  }
}

function toggleTrainDetails(id, rowEl) {
  const detailsRow = document.getElementById(id);

  if (detailsRow.classList.contains('hidden')) {
    detailsRow.classList.remove('hidden');
    rowEl.classList.add('expanded');
    openTrains.add(id); // This saves the state for the refresh
  } else {
    detailsRow.classList.add('hidden');
    rowEl.classList.remove('expanded');
    openTrains.delete(id); // This removes it from memory
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
  openTrains.clear(); // Clear memory so new filtered results start fresh
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
let highlightTrainNo = null;
let highlightStationNo = null;

async function loadTrains() {
  try {
    const res = await fetch(`${BASE}/master/trains`, {
      headers: { Authorization: "Bearer " + token }
    });
    const trains = await res.json();
    const table = document.getElementById("trainListTable");
    table.innerHTML = "";

    trains.forEach((t, i) => {
      const isHighlight = (highlightTrainNo && t.train_number === highlightTrainNo);
      table.innerHTML += `
        <tr class="${isHighlight ? 'row-highlight' : ''}">
          <td>${i + 1}</td>
          <td><b>${t.train_number}</b></td>
          <td>${t.train_name}</td>
        </tr>`;
    });

    // Scroll to highlighted row
    if (highlightTrainNo) {
      const highlighted = table.querySelector('.row-highlight');
      if (highlighted) highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => { highlightTrainNo = null; }, 3500);
    }
  } catch (err) {
    console.error("Error loading trains:", err);
  }
}

async function loadStations() {
  try {
    const res = await fetch(`${BASE}/master/stations`, {
      headers: { Authorization: "Bearer " + token }
    });
    const stations = await res.json();
    const table = document.getElementById("stationListTable");
    table.innerHTML = "";

    stations.forEach((s, i) => {
      const isHighlight = (highlightStationNo && s.station_number === highlightStationNo);
      table.innerHTML += `
        <tr class="${isHighlight ? 'row-highlight' : ''}">
          <td>${i + 1}</td>
          <td><b>${s.station_number}</b></td>
          <td>${s.station_name}</td>
        </tr>`;
    });

    if (highlightStationNo) {
      const highlighted = table.querySelector('.row-highlight');
      if (highlighted) highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => { highlightStationNo = null; }, 3500);
    }
  } catch (err) {
    console.error("Error loading stations:", err);
  }
}

async function addTrain() {
  const train_number = document.getElementById("train_no").value.trim();
  const train_name = document.getElementById("train_name").value.trim();
  if (!train_number || !train_name) return alert("Please fill both fields");

  const res = await fetch(`${BASE}/master/train`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ train_number, train_name })
  });
  const data = await res.json();
  alert(data.message || data.error);

  if (res.ok) {
    document.getElementById("train_no").value = "";
    document.getElementById("train_name").value = "";
    highlightTrainNo = train_number;
    loadTrains();
  }
}

async function addStation() {
  const station_number = document.getElementById("station_no").value.trim();
  const station_name = document.getElementById("station_name").value.trim();
  if (!station_number || !station_name) return alert("Please fill both fields");

  const res = await fetch(`${BASE}/master/station`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ station_number, station_name })
  });
  const data = await res.json();
  alert(data.message || data.error);

  if (res.ok) {
    document.getElementById("station_no").value = "";
    document.getElementById("station_name").value = "";
    highlightStationNo = station_number;
    loadStations();
  }
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
    highlightTrainNo = no;
    loadTrains();
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
    highlightStationNo = no;
    loadStations();
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

// ---------------- PROFILE DROPDOWN ----------------
function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  dropdown.classList.toggle("show");
}

// ---------------- CHANGE PASSWORD ----------------
function openChangePassword() {
  document.getElementById("profileDropdown").classList.remove("show");
  document.getElementById("changePwdModal").classList.add("show");
  document.getElementById("currentPwd").value = "";
  document.getElementById("newPwd").value = "";
  document.getElementById("confirmPwd").value = "";
  document.getElementById("pwdMsg").innerText = "";
  document.getElementById("pwdMsg").className = "pwd-msg";
}

function closeChangePassword() {
  document.getElementById("changePwdModal").classList.remove("show");
}

async function submitChangePassword() {
  const currentPassword = document.getElementById("currentPwd").value.trim();
  const newPassword = document.getElementById("newPwd").value.trim();
  const confirmPassword = document.getElementById("confirmPwd").value.trim();
  const msgEl = document.getElementById("pwdMsg");

  msgEl.innerText = "";
  msgEl.className = "pwd-msg";

  if (!currentPassword || !newPassword || !confirmPassword) {
    msgEl.innerText = "Please fill in all fields";
    msgEl.className = "pwd-msg error";
    return;
  }

  if (newPassword.length < 6) {
    msgEl.innerText = "New password must be at least 6 characters";
    msgEl.className = "pwd-msg error";
    return;
  }

  if (newPassword !== confirmPassword) {
    msgEl.innerText = "New passwords do not match";
    msgEl.className = "pwd-msg error";
    return;
  }

  try {
    const res = await fetch(`${BASE}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();

    if (res.ok) {
      msgEl.innerText = data.message;
      msgEl.className = "pwd-msg success";
      setTimeout(() => closeChangePassword(), 1500);
    } else {
      msgEl.innerText = data.message;
      msgEl.className = "pwd-msg error";
    }
  } catch (err) {
    msgEl.innerText = "Server error. Please try again.";
    msgEl.className = "pwd-msg error";
  }
}

window.addEventListener("beforeunload", () => {
  if (refreshTimer) clearInterval(refreshTimer);
});