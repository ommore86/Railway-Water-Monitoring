const db = require("../database/mysql");

// GET stations
exports.getStations = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM stations");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stations" });
  }
};

// GET trains by station
exports.getTrainsByStation = async (req, res) => {
  try {
    const { station_id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM trains WHERE station_id = ?",
      [station_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trains" });
  }
};

// GET coaches by train
exports.getTrainCoaches = async (req, res) => {
  try {
    const { train_no } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM coaches WHERE train_no = ?",
      [train_no]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coaches" });
  }
};