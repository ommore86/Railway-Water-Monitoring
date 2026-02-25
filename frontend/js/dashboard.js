const API = "https://railway-water-backend.onrender.com/api/latest";

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
const name = localStorage.getItem("name");

// not logged in
if (!token) {
  window.location.href = "login.html";
}

// show logged user name
document.addEventListener("DOMContentLoaded", () => {
  const topbar = document.querySelector(".topbar h2");
  if (topbar) topbar.innerText += " | " + name + " (" + role + ")";
});

async function loadData(){
  try{
    const res = await fetch(API,{
      headers:{
        "Authorization": "Bearer " + token
      }
    });

    if(res.status === 401){
      localStorage.clear();
      window.location.href="login.html";
      return;
    }

    if(!res.ok) throw new Error("Server not responding");

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

function logout(){
  localStorage.clear();
  window.location.href="login.html";
}

setInterval(loadData,3000);
loadData();