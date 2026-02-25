// ================= CONFIG =================
const API = "https://railway-water-backend.onrender.com/api/latest";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const name = localStorage.getItem("name");

// ================= SECURITY =================
if (!token) {
  window.location.href = "login.html";
}

// ================= ROLE BASED UI =================
window.onload = () => {

  // show username
  const title = document.querySelector(".topbar h2");
  if (title && name) title.innerText += " - " + name;

  // create admin buttons dynamically
  if (role === "admin" || role === "super_admin") {
    const btn = document.createElement("button");
    btn.innerText = "User Management";
    btn.onclick = () => window.location.href = "users.html";
    btn.style.marginRight = "10px";

    document.querySelector(".topbar").prepend(btn);
  }

  if (role === "super_admin") {
    const btn2 = document.createElement("button");
    btn2.innerText = "Admin Panel";
    btn2.onclick = () => alert("Super Admin Controls Coming");
    btn2.style.marginRight = "10px";

    document.querySelector(".topbar").prepend(btn2);
  }
};


// ================= FETCH DATA =================
async function loadData(){
  try{
    const res = await fetch(API,{
      headers:{
        "Authorization":"Bearer "+token
      }
    });

    if(res.status===401){
      localStorage.clear();
      window.location.href="login.html";
      return;
    }

    const data = await res.json();

    const table = document.getElementById("dataTable");
    table.innerHTML="";

    let healthy=0, low=0, critical=0;

    data.forEach(row=>{
      let status="Healthy";
      let cls="goodText";

      if(row.water_level<50){
        status="Low";
        cls="low";
        low++;
      }

      if(row.water_level<25){
        status="CRITICAL";
        cls="critical";
        critical++;
      }

      if(row.water_level>=50) healthy++;

      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td>${row.station_number}</td>
        <td>${row.train_name || row.train_number}</td>
        <td>${row.coach_number}</td>
        <td>${row.water_level}%</td>
        <td class="${cls}">${status}</td>
        <td>${new Date(row.received_at).toLocaleTimeString()}</td>
      `;
      table.appendChild(tr);
    });

    document.getElementById("healthyCount").innerText=healthy;
    document.getElementById("lowCount").innerText=low;
    document.getElementById("criticalCount").innerText=critical;

  }catch(e){
    console.log("Fetch error",e);
  }
}


// ================= AUTO REFRESH =================
setInterval(loadData,3000);
loadData();


// ================= LOGOUT =================
function logout(){
  localStorage.clear();
  window.location.href="login.html";
}