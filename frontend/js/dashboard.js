let selectedTrain = null;
let refreshInterval = null;

const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");

// redirect if not logged in
if(!token) window.location.href="login.html";

const headers = {
    "Authorization": "Bearer " + token
};

// load stations on start
window.onload = loadStations;


// 1️⃣ Load stations
async function loadStations(){
    const res = await fetch(`${API}/stations`, { headers });
    const stations = await res.json();

    const select = document.getElementById("stationSelect");
    select.innerHTML = "<option>Select Station</option>";

    stations.forEach(s=>{
        select.innerHTML += `<option value="${s.station_id}">${s.station_name}</option>`;
    });

    select.onchange = loadTrains;
}


// 2️⃣ Load trains
async function loadTrains(){
    const station_id = document.getElementById("stationSelect").value;

    const res = await fetch(`${API}/trains/${station_id}`, { headers });
    const trains = await res.json();

    const select = document.getElementById("trainSelect");
    select.innerHTML = "<option>Select Train</option>";

    trains.forEach(t=>{
        select.innerHTML += `<option value="${t.train_no}">${t.train_name}</option>`;
    });
}


// 3️⃣ Load coaches (start live monitoring)
async function loadCoaches(){

    selectedTrain = document.getElementById("trainSelect").value;

    if(refreshInterval) clearInterval(refreshInterval);

    await fetchAndRender();

    // auto refresh every 5 sec
    refreshInterval = setInterval(fetchAndRender, 5000);
}


// 🔥 Main Render Function (UPDATED)
async function fetchAndRender(){

    if(!selectedTrain) return;

    const res = await fetch(`${API}/coaches/${selectedTrain}`, { headers });
    const coaches = await res.json();

    const container = document.getElementById("coachContainer");
    const alertBox = document.getElementById("alertBox");
    const refillList = document.getElementById("refillList");

    container.innerHTML="";
    refillList.innerHTML="";

    let criticalFound = false;

    // sort lowest water first
    coaches.sort((a,b)=>a.water_level-b.water_level);

    coaches.forEach(c=>{
        let levelClass="high";
        let blink="";

        if(c.water_level < 30){
            levelClass="low";
            blink="blink";
            criticalFound=true;
            refillList.innerHTML += `<li>Coach ${c.coach_no} — ${c.water_level}%</li>`;
        }
        else if(c.water_level < 70){
            levelClass="medium";
        }

        container.innerHTML += `
        <div class="col-md-3">
            <div class="card p-3 ${levelClass} ${blink}">
                <h5>Coach ${c.coach_no}</h5>
                <h3>${c.water_level}%</h3>
                <small>Updated: ${new Date(c.updated_at).toLocaleTimeString()}</small>
            </div>
        </div>`;
    });

    // show alert
    if(criticalFound) alertBox.classList.remove("d-none");
    else alertBox.classList.add("d-none");
}


// logout
function logout(){
    localStorage.removeItem("token");
    window.location.href="login.html";
}