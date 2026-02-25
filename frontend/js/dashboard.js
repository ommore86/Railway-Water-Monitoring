const API = "https://railway-water-backend.onrender.com/api/latest";

// SESSION DATA
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toLowerCase();

// NOT LOGGED IN
if (!token) {
  window.location.href = "login.html";
}

// ---------------- START APP AFTER PAGE LOAD ----------------
document.addEventListener("DOMContentLoaded", () => {

  console.log("Logged in as:", role);

  // show admin panel
  if (role === "admin" || role === "superadmin" || role === "super_admin") {
    const panel = document.getElementById("adminPanel");
    if (panel) {
      panel.style.display = "block";
      loadUsers();
    }
  }

  // START LIVE DATA (THIS WAS MISSING)
  loadData();
  setInterval(loadData, 3000);
});


// ---------------- LOAD WATER DATA ----------------
async function loadData() {
  try {

    const res = await fetch(API, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (res.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();

    console.log("Water Data:", data);

    const table = document.getElementById("dataTable");
    if (!table) return;

    table.innerHTML = "";

    let healthy = 0, low = 0, critical = 0;

    data.forEach(row => {

      let status = "Healthy";
      let cls = "goodText";

      if (row.water_level < 50) {
        status = "Low";
        cls = "low";
        low++;
      }

      if (row.water_level < 25) {
        status = "CRITICAL";
        cls = "critical";
        critical++;
      }

      if (row.water_level >= 50) healthy++;

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${row.station_number}</td>
        <td>${row.train_name || row.train_number}</td>
        <td>${row.coach_number}</td>
        <td>${row.water_level}%</td>
        <td class="${cls}">${status}</td>
        <td>${new Date(row.received_at).toLocaleTimeString()}</td>
      `;

      table.appendChild(tr);
    });

    document.getElementById("healthyCount").innerText = healthy;
    document.getElementById("lowCount").innerText = low;
    document.getElementById("criticalCount").innerText = critical;

  } catch (e) {
    console.log("Fetch error", e);
  }
}


// ---------------- LOGOUT ----------------
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}


// ---------------- LOAD USERS ----------------
async function loadUsers() {
  try {
    const res = await fetch("https://railway-water-backend.onrender.com/api/users", {
      headers: { Authorization: "Bearer " + token }
    });

    const users = await res.json();

    console.log("Users:", users);

    const table = document.getElementById("usersTable");
    if (!table) return;

    table.innerHTML = "";

    users.forEach(u => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${u.station_access || "-"}</td>
      `;
      table.appendChild(tr);
    });

  } catch (e) {
    console.log("User load error", e);
  }
}


// ---------------- CREATE USER ----------------
async function createUser() {

  const body = {
    name: document.getElementById("u_name").value,
    email: document.getElementById("u_email").value,
    password: document.getElementById("u_pass").value,
    role: document.getElementById("u_role").value,
    station_access: document.getElementById("u_station").value
  };

  const res = await fetch("https://railway-water-backend.onrender.com/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  alert(data.message || "Done");
  loadUsers();
}


// ---------------- ADD TRAIN ----------------
async function addTrain(){
  const train_number=document.getElementById("train_no").value;
  const train_name=document.getElementById("train_name").value;

  const res=await fetch("https://railway-water-backend.onrender.com/api/master/train",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer "+token
    },
    body:JSON.stringify({train_number,train_name})
  });

  alert((await res.json()).message||"Done");
}


// ---------------- ADD STATION ----------------
async function addStation(){
  const station_number=document.getElementById("station_no").value;
  const station_name=document.getElementById("station_name").value;

  const res=await fetch("https://railway-water-backend.onrender.com/api/master/station",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer "+token
    },
    body:JSON.stringify({station_number,station_name})
  });

  alert((await res.json()).message||"Done");
}