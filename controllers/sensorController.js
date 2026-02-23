const db = require("../config/db");

exports.receiveSensorData = async (req, res) => {
    try {
        const { station_id, station_name, train_no, train_name, coaches } = req.body;

        // 1️⃣ Insert station if not exists
        await db.promise().query(
            `INSERT INTO stations (station_id, station_name)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE station_name = VALUES(station_name)`,
            [station_id, station_name]
        );

        // 2️⃣ Insert train if not exists
        await db.promise().query(
            `INSERT INTO trains (train_no, train_name)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE train_name = VALUES(train_name)`,
            [train_no, train_name]
        );

        // 3️⃣ Process each coach
        for (const coach of coaches) {

            // insert coach
            await db.promise().query(
                `INSERT INTO coaches (train_no, coach_no)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE coach_no = coach_no`,
                [train_no, coach.coach_no]
            );

            // UPSERT water level (NO DUPLICATES)
            await db.promise().query(
                `INSERT INTO water_levels (station_id, train_no, coach_no, water_level)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    water_level = VALUES(water_level),
                    updated_at = CURRENT_TIMESTAMP`,
                [station_id, train_no, coach.coach_no, coach.water_level]
            );
        }

        res.json({ message: "Sensor data stored successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};