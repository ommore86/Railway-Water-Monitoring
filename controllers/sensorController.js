const db = require("../config/mysql");

exports.addSensorData = async (req, res) => {
  try {
    const {
      station_code,
      station_name,
      train_number,
      train_name,
      coach_number,
      water_level
    } = req.body;

    // match DB column names
    const station_number = station_code;

    // ---------- 1) Station ----------
    await db.query(
      `INSERT INTO stations (station_number, station_name)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE station_name = VALUES(station_name)`,
      [station_number, station_name]
    );

    // ---------- 2) Train ----------
    await db.query(
      `INSERT INTO trains (train_number, train_name)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE train_name = VALUES(train_name)`,
      [train_number, train_name]
    );

    // ---------- 3) Coach ----------
    await db.query(
      `INSERT INTO coaches (coach_number, train_number)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE train_number = VALUES(train_number)`,
      [coach_number, train_number]
    );

    // ---------- 4) Sensor reading ----------
    await db.query(
      `INSERT INTO sensor_data
       (station_number, train_number, coach_number, water_level)
       VALUES (?, ?, ?, ?)`,
      [station_number, train_number, coach_number, water_level]
    );

    res.json({ message: "Data stored successfully" });

  } catch (err) {
    console.error("MYSQL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};