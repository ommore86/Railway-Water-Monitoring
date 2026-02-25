const API = "https://railway-water-backend.onrender.com/api/latest";

// get stored token
const token = localStorage.getItem("token");

// if not logged in
if(!token){
  window.location.href="login.html";
}

async function loadData(){
  try{

    const res = await fetch(API,{
      headers:{
        "Authorization":"Bearer " + token
      }
    });

    if(res.status===401){
      localStorage.clear();
      alert("Session expired. Login again");
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

setInterval(loadData,3000);
loadData();

function logout(){
  localStorage.clear();
  window.location.href="login.html";
}