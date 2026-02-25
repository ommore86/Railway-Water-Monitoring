const db = require("../database/mysql");

exports.addSensorData = async (req, res) => {
  try {
    const { coachId, stationId, waterLevel, temperature } = req.body;

    await db.query(
      `INSERT INTO sensors (coachId, stationId, waterLevel, temperature)
       VALUES (?, ?, ?, ?)`,
      [coachId, stationId, waterLevel, temperature]
    );

    res.json({ success: true, message: "Data stored successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

exports.getSensorData = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM sensors ORDER BY timestamp DESC LIMIT 100`
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
};