const db = require("../database/mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "railway_secret_key";

// SIGNUP
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role, station_id } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.promise().query(
            "INSERT INTO users (name, email, password, role, station_id) VALUES (?, ?, ?, ?, ?)",
            [name, email, hashedPassword, role || "user", station_id || null]
        );

        res.json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: "Email already exists" });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.promise().query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0)
            return res.status(401).json({ error: "User not found" });

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign(
            { id: user.id, role: user.role, station_id: user.station_id },
            SECRET,
            { expiresIn: "8h" }
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json(err);
    }
};