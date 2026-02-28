const db = require("../config/mysql");

exports.addSensorData = async (req, res) => {
  try {
    const {
      station_code,
      station_name,
      train_number,
      train_name,
      coaches // This is now our array of coach objects
    } = req.body;

    // Validation: Ensure coaches is an array
    if (!coaches || !Array.isArray(coaches)) {
      return res.status(400).json({ error: "Invalid data format. 'coaches' must be an array." });
    }

    // 1) Upsert Station (Once per request)
    await db.query(
      `INSERT INTO stations (station_number, station_name)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE station_name = VALUES(station_name)`,
      [station_code, station_name || 'Unknown Station']
    );

    // 2) Upsert Train (Once per request)
    await db.query(
      `INSERT INTO trains (train_number, train_name)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE train_name = VALUES(train_name)`,
      [train_number, train_name || 'Unknown Train']
    );

    // 3) Loop through the coaches array and save each reading
    for (const coach of coaches) {
      const { coach_number, water_level } = coach;

      // Upsert Coach Registry
      await db.query(
        `INSERT INTO coaches (coach_number, train_number)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE train_number = VALUES(train_number)`,
        [coach_number, train_number]
      );

      // Upsert Latest Sensor Reading
      await db.query(
        `INSERT INTO sensor_data
         (station_number, train_number, coach_number, water_level)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         water_level = VALUES(water_level),
         received_at = CURRENT_TIMESTAMP`,
        [station_code, train_number, coach_number, water_level]
      );
    }

    res.json({ 
      success: true, 
      message: `Processed ${coaches.length} coaches for Train ${train_number}` 
    });

  } catch (err) {
    console.error("MYSQL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};