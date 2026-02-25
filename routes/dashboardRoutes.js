const express = require("express");
const router = express.Router();
const db = require("../config/mysql");

const { verifyToken, allowRoles } = require("../middleware/authMiddleware");


// ================= GET LATEST SENSOR DATA =================
router.get(
  "/latest",
  verifyToken,                          // must be logged in
  allowRoles("user", "admin", "super_admin"), // all roles allowed
  async (req, res) => {
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

      let params = [];

      // 🔐 USER → only their station data
      if (req.user.role === "user") {
        query += ` WHERE s.station_number = ? `;
        params.push(req.user.station);
      }

      // Admin & SuperAdmin → full data (no filter)

      query += `
        ORDER BY s.received_at DESC
        LIMIT 50
      `;

      const [rows] = await db.query(query, params);

      res.json(rows);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  }
);

module.exports = router;