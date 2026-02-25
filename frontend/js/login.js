const API = "https://railway-water-backend.onrender.com/api";

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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
      alert(data.message || "Login failed");
      return;
    }

    // store session
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("station", data.station || "");
    localStorage.setItem("name", data.name);

    // role based redirect
    if (data.role === "superadmin")
      window.location.href = "superadmin.html";
    else if (data.role === "admin")
      window.location.href = "admin.html";
    else
      window.location.href = "dashboard.html";

  } catch (err) {
    alert("Server not reachable");
    console.error(err);
  }
}