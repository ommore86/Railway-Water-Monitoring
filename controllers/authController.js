const db = require("../config/mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const SECRET = process.env.JWT_SECRET || "railway_secret";


/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = "user", station_access = null } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const [exists] = await db.query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users(name,email,password,role,station_access) VALUES(?,?,?,?,?)",
      [name, email, hashed, role, station_access]
    );

    res.json({ message: "User created successfully" });

  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};


/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT id,name,email,password,role,station_access FROM users WHERE email=?",
      [email]
    );

    if (!rows.length) return res.status(401).json({ message: "Invalid email" });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role, station: user.station_access },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      station: user.station_access,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
};


/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [rows] = await db.query("SELECT id FROM users WHERE email=?", [email]);
    if (!rows.length)
      return res.json({ message: "If account exists, reset link generated" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 min

    await db.query(
      "UPDATE users SET reset_token=?, reset_expiry=? WHERE email=?",
      [token, expiry, email]
    );

    // Later you connect nodemailer
    res.json({
      message: "Reset token generated",
      reset_token: token
    });

  } catch (err) {
    res.status(500).json({ message: "Error generating reset token" });
  }
};


/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const [rows] = await db.query(
      "SELECT id FROM users WHERE reset_token=? AND reset_expiry > NOW()",
      [token]
    );

    if (!rows.length)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password=?, reset_token=NULL, reset_expiry=NULL WHERE id=?",
      [hashed, rows[0].id]
    );

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Reset failed" });
  }
};