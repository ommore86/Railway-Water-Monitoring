const db = require("../config/mysql");

// 1️⃣ Get all stations
exports.getStations = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM stations");
        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
};

// 2️⃣ Get trains at station
exports.getTrainsByStation = async (req, res) => {
    try {
        const { station_id } = req.params;

        const [rows] = await db.promise().query(
            `SELECT DISTINCT t.train_no, t.train_name
             FROM water_levels w
             JOIN trains t ON w.train_no = t.train_no
             WHERE w.station_id = ?`,
            [station_id]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
};

// 3️⃣ Get coaches + water level of train
exports.getTrainCoaches = async (req, res) => {
    try {
        const { train_no } = req.params;

        const [rows] = await db.promise().query(
            `SELECT coach_no, water_level, updated_at
             FROM water_levels
             WHERE train_no = ?`,
            [train_no]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json(err);
    }
};