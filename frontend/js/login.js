const API = "https://railway-water-backend.onrender.com/api";

async function login() {

  const email = emailInput("email");
  const password = emailInput("password");

  const res = await fetch(`${API}/auth/login`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({email,password})
  });

  const data = await res.json();
  if(!res.ok) return alert(data.message);

  localStorage.clear();
  localStorage.setItem("token",data.token);
  localStorage.setItem("role",data.role);
  localStorage.setItem("name",data.name);
  localStorage.setItem("email",data.email);
  localStorage.setItem("station",data.station||"");

  window.location.href="dashboard.html";
}

function emailInput(id){
  return document.getElementById(id).value.trim();
}

/* ---------------- FORGOT ---------------- */

function openForgot(){
  new bootstrap.Modal(document.getElementById("forgotModal")).show();
}

async function sendReset(){

  const email=emailInput("fp_email");

  const res=await fetch(`${API}/auth/forgot-password`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({email})
  });

  const data=await res.json();
  alert("Token:\n"+data.reset_token+"\n(temporary display)");

  new bootstrap.Modal(document.getElementById("resetModal")).show();
}

async function resetPassword(){

  const token=emailInput("rp_token");
  const newPassword=emailInput("rp_password");

  const res=await fetch(`${API}/auth/reset-password`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({token,newPassword})
  });

  const data=await res.json();
  alert(data.message);
}