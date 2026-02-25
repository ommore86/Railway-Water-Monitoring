const express = require("express");
const router = express.Router();
const db = require("../config/mysql");

// latest readings
router.get("/latest", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.station_number,
        t.train_name,
        c.coach_number,
        s.water_level,
        s.received_at
      FROM sensor_data s
      LEFT JOIN trains t ON s.train_number = t.train_number
      LEFT JOIN coaches c ON s.coach_number = c.coach_number
      ORDER BY s.received_at DESC
      LIMIT 20
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

module.exports = router;