const API = "https://railway-water-backend.onrender.com/api";

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Invalid login");
      return;
    }

    // ===== STORE SESSION =====
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);

    // ⭐ ALL ROLES GO TO SAME DASHBOARD
    window.location.href = "dashboard.html";

  } catch (err) {
    alert("Server not reachable");
    console.error(err);
  }
}