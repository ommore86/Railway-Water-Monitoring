const db = require("../config/mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "user", station_access = null } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, role, station_access) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashed, role, station_access]
    );

    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT id, name, email, password, role, station_access FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid email" });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ message: "Invalid password" });

    // JWT now contains role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        station: user.station_access
      },
      process.env.JWT_SECRET || "railway_secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login success",
      token,
      role: user.role,
      station: user.station_access,
      name: user.name
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
};