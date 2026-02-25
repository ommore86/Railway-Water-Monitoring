const express = require("express");
const router = express.Router();
const db = require("../config/mysql");
const { verifyToken } = require("../middleware/authMiddleware");

// latest readings
router.get("/latest", verifyToken, async (req, res) => {
  try {

    // ROLE BASED FILTERING
    let query = `
      SELECT 
        station_number,
        train_number,
        coach_number,
        water_level,
        received_at
      FROM sensor_data
    `;

    let params = [];

    // if normal user → only his station data
    if (req.user.role === "user" && req.user.station) {
      query += " WHERE station_number = ?";
      params.push(req.user.station);
    }

    query += " ORDER BY received_at DESC LIMIT 50";

    const [rows] = await db.query(query, params);

    res.json(rows);

  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;