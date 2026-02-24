const express = require("express");
const router = express.Router();
const { receiveSensorData } = require("../controllers/sensorController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

router.post("/sensor-data", verifyToken, allowRoles("superadmin"), receiveSensorData);

module.exports = router;