const db = require("../config/mysql");

exports.addSensorData = async (req, res) => {
  try {
    const {
      station_code,
      station_name,
      train_number,
      train_name,
      coach_number,
      water_level,
      temperature
    } = req.body;

    // 1️⃣ Station
    let [station] = await db.query(
      "SELECT id FROM stations WHERE station_code = ?",
      [station_code]
    );

    let station_id;
    if (station.length === 0) {
      const [result] = await db.query(
        "INSERT INTO stations (station_code, station_name) VALUES (?, ?)",
        [station_code, station_name]
      );
      station_id = result.insertId;
    } else {
      station_id = station[0].id;
    }

    // 2️⃣ Train
    let [train] = await db.query(
      "SELECT id FROM trains WHERE train_number = ?",
      [train_number]
    );

    let train_id;
    if (train.length === 0) {
      const [result] = await db.query(
        "INSERT INTO trains (train_number, train_name) VALUES (?, ?)",
        [train_number, train_name]
      );
      train_id = result.insertId;
    } else {
      train_id = train[0].id;
    }

    // 3️⃣ Coach
    let [coach] = await db.query(
      "SELECT id FROM coaches WHERE coach_number=? AND train_id=?",
      [coach_number, train_id]
    );

    let coach_id;
    if (coach.length === 0) {
      const [result] = await db.query(
        "INSERT INTO coaches (coach_number, train_id) VALUES (?, ?)",
        [coach_number, train_id]
      );
      coach_id = result.insertId;
    } else {
      coach_id = coach[0].id;
    }

    // 4️⃣ Sensor Data
    await db.query(
      `INSERT INTO sensor_data 
      (station_id, train_id, coach_id, water_level, temperature)
      VALUES (?, ?, ?, ?, ?)`,
      [station_id, train_id, coach_id, water_level, temperature]
    );

    res.json({ message: "Data stored successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};