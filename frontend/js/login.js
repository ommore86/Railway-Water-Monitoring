const API = "https://railway-water-backend.onrender.com/api";

let forgotModal, resetModal;

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Bootstrap modals so we can control them via JS
    forgotModal = new bootstrap.Modal(document.getElementById("forgotModal"));
    resetModal = new bootstrap.Modal(document.getElementById("resetModal"));
});

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
  localStorage.setItem("email", email);
  localStorage.setItem("email",data.email);
  localStorage.setItem("station",data.station||"");

  window.location.href="dashboard.html";
}

function emailInput(id){
  return document.getElementById(id).value.trim();
}

/* ---------------- FORGOT ---------------- */

function openForgot() {
    forgotModal.show();
}

async function sendReset() {
    const email = document.getElementById("fp_email").value.trim();
    if (!email) return alert("Please enter your email");

    try {
        const res = await fetch(`${API}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (res.ok) {
            alert("SUCCESS!\nYour Reset Token is: " + data.reset_token + "\n\n(In a real app, this would be emailed to you)");
            
            // Auto-fill the token into the next modal
            document.getElementById("rp_token").value = data.reset_token;
            
            // Switch Modals
            forgotModal.hide();
            resetModal.show();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Server error. Please try again later.");
    }
}

async function resetPassword() {
    const token = document.getElementById("rp_token").value.trim();
    const newPassword = document.getElementById("rp_password").value.trim();

    if (!token || !newPassword) return alert("Please fill all fields");
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");

    try {
        const res = await fetch(`${API}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
            resetModal.hide();
            // Clear inputs
            document.getElementById("rp_token").value = "";
            document.getElementById("rp_password").value = "";
        }
    } catch (err) {
        alert("Error resetting password.");
    }
}