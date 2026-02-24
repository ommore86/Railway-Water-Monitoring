const express = require("express");
const router = express.Router();
const { getStations, getTrainsByStation, getTrainCoaches } = require("../controllers/dashboardController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

// all logged users
router.get("/stations", verifyToken, getStations);

// only admin & superadmin
router.get("/trains/:station_id", verifyToken, allowRoles("admin","superadmin"), getTrainsByStation);

// all logged users
router.get("/coaches/:train_no", verifyToken, getTrainCoaches);

module.exports = router;