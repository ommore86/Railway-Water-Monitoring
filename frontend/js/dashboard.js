const API = "https://railway-water-backend.onrender.com/api/";

async function loadData(){
try{
const res = await fetch(API);
const data = await res.json();

```
const table = document.getElementById("dataTable");
table.innerHTML="";

let healthy=0, low=0, critical=0;

data.forEach(row => {

let status="Healthy";
let cls="goodText";

if(row.water_level < 50){
status="Low";
cls="low";
low++;
}

if(row.water_level < 25){
status="CRITICAL";
cls="critical";
critical++;
}

if(row.water_level >= 50) healthy++;

const tr = document.createElement("tr");

function cell(text, className=""){
const td=document.createElement("td");
td.textContent=text;
if(className) td.className=className;
return td;
}

tr.appendChild(cell(row.station_number));
tr.appendChild(cell(row.train_name || "-"));
tr.appendChild(cell(row.coach_number || "-"));
tr.appendChild(cell(row.water_level + "%"));
tr.appendChild(cell(status, cls));
tr.appendChild(cell(new Date(row.received_at).toLocaleTimeString()));

table.appendChild(tr);
});


document.getElementById("healthyCount").innerText=healthy;
document.getElementById("lowCount").innerText=low;
document.getElementById("criticalCount").innerText=critical;
```

}catch(e){
console.error("Fetch error",e);
}
}

setInterval(loadData,3000);
loadData();

function logout(){
localStorage.removeItem("token");
window.location.href="login.html";
}
