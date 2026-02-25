const express = require("express");
const router = express.Router();
const db = require("../config/mysql");
const { verifyToken } = require("../middleware/authMiddleware");

// latest readings
router.get("/latest", verifyToken, async (req, res) => {
  try {

    let query = `
      SELECT 
        s.station_number,
        t.train_name,
        s.train_number,
        s.coach_number,
        s.water_level,
        s.received_at
      FROM sensor_data s
      LEFT JOIN trains t 
        ON s.train_number = t.train_number
    `;

    // USER sees only own station
    if(req.user.role === "user"){
      query += ` WHERE s.station_number = ? ORDER BY s.received_at DESC LIMIT 50`;
      const [rows] = await db.query(query,[req.user.station]);
      return res.json(rows);
    }

    // ADMIN & SUPERADMIN see all
    query += ` ORDER BY s.received_at DESC LIMIT 50`;
    const [rows] = await db.query(query);

    res.json(rows);

  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;