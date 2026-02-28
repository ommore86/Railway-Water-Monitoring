const db = require("../config/mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // 1. Import Nodemailer

const SECRET = process.env.JWT_SECRET || "railway_secret";

// 2. Configure Email Transporter
// Ensure EMAIL_USER and EMAIL_PASS are in your .env file
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

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

    const [rows] = await db.query("SELECT id, name FROM users WHERE email=?", [email]);
    
    if (!rows.length) return res.status(404).json({ message: "Email not found" });

    // Generate a secure 8-character token
    const token = crypto.randomBytes(4).toString("hex").toUpperCase(); 
    const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes expiry

    // Save token to DB
    await db.query(
      "UPDATE users SET reset_token=?, reset_expiry=? WHERE email=?",
      [token, expiry, email]
    );

    // 3. Email content
    const mailOptions = {
      from: `"Railway Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset Token",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2c3e50; text-align: center;">Password Reset</h2>
          <p>Hello <strong>${rows[0].name}</strong>,</p>
          <p>You requested a password reset. Please use the verification code below:</p>
          <div style="background: #f8f9fa; border: 2px dashed #dee2e6; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #e74c3c; margin: 20px 0;">
            ${token}
          </div>
          <p style="font-size: 12px; color: #7f8c8d; text-align: center;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    };

    // 4. Send the Email
    await transporter.sendMail(mailOptions);

    // 5. Response (token is NOT sent in JSON for security)
    res.json({ message: "Reset token sent to your email." });

  } catch (err) {
    console.error("Mail Error:", err);
    res.status(500).json({ message: "Failed to send reset email." });
  }
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Check if token matches and hasn't expired
    const [rows] = await db.query(
      "SELECT id FROM users WHERE reset_token=? AND reset_expiry > NOW()",
      [token]
    );

    if (!rows.length)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password and clear the reset fields
    await db.query(
      "UPDATE users SET password=?, reset_token=NULL, reset_expiry=NULL WHERE id=?",
      [hashed, rows[0].id]
    );

    res.json({ message: "Password updated successfully! You can now login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset failed" });
  }
};