const express = require("express");
const router = express.Router();
const { receiveSensorData } = require("../controllers/sensorController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

router.post("/upload", receiveSensorData);

module.exports = router;