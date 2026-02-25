const db = require("../database/mysql");

exports.getDashboard = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT coachId,
             AVG(waterLevel) as avgWater,
             AVG(temperature) as avgTemp,
             MAX(timestamp) as lastUpdate
      FROM sensors
      GROUP BY coachId
    `);

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "Dashboard error" });
  }
};