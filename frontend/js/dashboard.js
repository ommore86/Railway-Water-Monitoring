const API = "https://railway-water-backend.onrender.com/api/latest";

// get token from login
const token = localStorage.getItem("token");

// if not logged in -> go back to login
if (!token) {
  window.location.href = "login.html";
}

async function loadData() {
  try {

    const res = await fetch(API, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    if (res.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();

    const table = document.getElementById("dataTable");
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

// logout button
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

setInterval(loadData, 3000);
loadData();

// ROLE BASED UI
const role = localStorage.getItem("role");

if(role==="admin" || role==="super_admin"){
  document.getElementById("adminPanel").style.display="block";
  loadUsers();
}

// LOAD USERS
async function loadUsers(){
  const res=await fetch("https://railway-water-backend.onrender.com/api/users",{
    headers:{Authorization:"Bearer "+token}
  });
  const users=await res.json();

  const table=document.getElementById("usersTable");
  table.innerHTML="";

  users.forEach(u=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${u.station_access||"-"}</td>
    `;
    table.appendChild(tr);
  });
}

// CREATE USER
async function createUser(){
  const body={
    name:document.getElementById("u_name").value,
    email:document.getElementById("u_email").value,
    password:document.getElementById("u_pass").value,
    role:document.getElementById("u_role").value,
    station_access:document.getElementById("u_station").value
  };

  await fetch("https://railway-water-backend.onrender.com/api/users",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer "+token
    },
    body:JSON.stringify(body)
  });

  loadUsers();
}