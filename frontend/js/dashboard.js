const BASE = "https://railway-water-backend.onrender.com/api";
let currentFilter = "";

// session
const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toLowerCase();
const name = localStorage.getItem("name");

if (!token) window.location.href = "login.html";

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("loginInfo").innerText =
    `👤 ${name} (${role})`;

  loadData();
  loadUsersIfAdmin();
});


// ---------------- LOAD WATER DATA ----------------
async function loadData(query="") {

  const res = await fetch(`${BASE}/latest${query}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  const table = document.getElementById("dataTable");
  table.innerHTML = "";

  let healthy=0, low=0, critical=0;

  const stations=new Set();
  const trains=new Set();

  data.forEach(row => {

    stations.add(row.station_number);
    trains.add(row.train_number);

    let status="Healthy",cls="goodText";

    if(row.water_level<50){status="Low";cls="low";low++;}
    if(row.water_level<25){status="CRITICAL";cls="critical";critical++;}
    if(row.water_level>=50)healthy++;

    table.innerHTML+=`
      <tr>
        <td>${row.station_number}</td>
        <td>${row.train_name||row.train_number}</td>
        <td>${row.coach_number}</td>
        <td>${row.water_level}%</td>
        <td class="${cls}">${status}</td>
        <td>${new Date(row.received_at).toLocaleTimeString()}</td>
      </tr>`;
  });

  document.getElementById("healthyCount").innerText=healthy;
  document.getElementById("lowCount").innerText=low;
  document.getElementById("criticalCount").innerText=critical;

  populateFilters(stations,trains);
}


// ---------------- FILTER ----------------
function applyFilter(){

  const st=document.getElementById("filterStation").value;
  const tr=document.getElementById("filterTrain").value;

  let query="?";
  if(st) query+=`station=${st}&`;
  if(tr) query+=`train=${tr}`;

  currentFilter=query;
  loadData(query);
}

function clearFilter(){
  currentFilter="";
  loadData();
}


// ---------------- DROPDOWNS ----------------
function populateFilters(stations,trains){

  const s=document.getElementById("filterStation");
  const t=document.getElementById("filterTrain");

  if(s.options.length===1){
    stations.forEach(v=>s.innerHTML+=`<option value="${v}">${v}</option>`);
  }

  if(t.options.length===1){
    trains.forEach(v=>t.innerHTML+=`<option value="${v}">${v}</option>`);
  }
}


// ---------------- ADMIN ----------------
function loadUsersIfAdmin(){
  if(role==="admin"||role==="superadmin"||role==="super_admin"){
    document.getElementById("adminPanel").style.display="block";
    loadUsers();
  }
}

async function loadUsers(){

  const res=await fetch(`${BASE}/users`,{
    headers:{Authorization:"Bearer "+token}
  });

  const users=await res.json();
  const table=document.getElementById("usersTable");
  table.innerHTML="";

  users.forEach(u=>{
    table.innerHTML+=`
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${u.station_access||"-"}</td>
      </tr>`;
  });
}


// ---------------- LOGOUT ----------------
function logout(){
  localStorage.clear();
  window.location.href="login.html";
}