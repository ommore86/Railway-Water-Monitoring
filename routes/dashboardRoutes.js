const express = require("express");
const router = express.Router();
const { getStations, getTrainsByStation, getTrainCoaches } = require("../controllers/dashboardController");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

router.get("/stations", verifyToken, getStations);

router.get("/trains/:station_id", verifyToken, allowRoles("admin","superadmin"), getTrainsByStation);

router.get("/coaches/:train_no", verifyToken, getTrainCoaches);

module.exports = router;