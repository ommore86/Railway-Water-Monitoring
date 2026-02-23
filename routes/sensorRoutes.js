const express = require("express");
const router = express.Router();
const { receiveSensorData } = require("../controllers/sensorController");

router.post("/sensor-data", receiveSensorData);

module.exports = router;