const express = require("express");
const router = express.Router();
const Sensor = require("../models/sensor.model");

// POST: receive sensor data
router.post("/upload", async (req, res) => {
  try {
    const data = new Sensor(req.body);
    await data.save();

    res.status(200).json({
      success: true,
      message: "Sensor data saved"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;