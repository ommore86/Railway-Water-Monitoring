const API = "https://railway-water-backend.onrender.com/api";

async function login() {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!email || !password){
    alert("Enter email and password");
    return;
  }

  try {

    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // 🔥 CLEAR OLD SESSION FIRST
    localStorage.clear();

    // 🔥 SAVE SESSION PROPERLY
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);
    localStorage.setItem("station", data.station || "");

    console.log("Saved role:", data.role);

    // small delay ensures storage completes
    setTimeout(() => {

      if (data.role === "superadmin" || data.role === "super_admin")
        window.location.href = "superadmin.html";
      else if (data.role === "admin")
        window.location.href = "dashboard.html";
      else
        window.location.href = "dashboard.html";

    }, 200);

  } catch (err) {
    console.error(err);
    alert("Server not reachable");
  }
}