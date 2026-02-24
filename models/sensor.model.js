const express = require("express");
const router = express.Router();
const db = require("../config/mysql");

// Upload sensor data
router.post("/upload", async (req, res) => {
  try {
    const { coachId, stationId, waterLevel, temperature } = req.body;

    if (!coachId || !stationId || waterLevel == null || temperature == null) {
      return res.status(400).json({
        success: false,
        message: "Missing sensor fields"
      });
    }

    await db.execute(
      `INSERT INTO sensor_data (coach_id, station_id, water_level, temperature)
       VALUES (?, ?, ?, ?)`,
      [coachId, stationId, waterLevel, temperature]
    );

    res.json({
      success: true,
      message: "Sensor data stored successfully"
    });

  } catch (error) {
    console.error("DB ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Database insert failed"
    });
  }
});

module.exports = router;