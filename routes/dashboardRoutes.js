const express = require("express");
const router = express.Router();
const db = require("../config/mysql");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/latest", verifyToken, async (req, res) => {
  try {

    const { station, train } = req.query;

    let query = `
      SELECT 
        s.station_number,
        s.train_number,
        t.train_name,
        s.coach_number,
        s.water_level,
        s.received_at
      FROM sensor_data s
      LEFT JOIN trains t ON s.train_number = t.train_number
      WHERE 1=1
    `;

    let params = [];

    // 🔐 USER restriction
    if (req.user.role === "user") {
      query += ` AND s.station_number = ?`;
      params.push(req.user.station);
    }

    // 🔎 FILTERS
    if (station) {
      query += ` AND s.station_number = ?`;
      params.push(station);
    }

    if (train) {
      query += ` AND s.train_number = ?`;
      params.push(train);
    }

    query += ` ORDER BY s.received_at DESC LIMIT 50`;

    const [rows] = await db.query(query, params);
    res.json(rows);

  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;