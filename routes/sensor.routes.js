const express = require("express");
const router = express.Router();
const sensorController = require("../controllers/sensorController");

router.post("/add", sensorController.addSensorData);

module.exports = router;