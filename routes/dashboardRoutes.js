const express = require("express");
const router = express.Router();
const { getStations, getTrainsByStation, getTrainCoaches } = require("../controllers/dashboardController");

router.get("/stations", getStations);
router.get("/trains/:station_id", getTrainsByStation);
router.get("/coaches/:train_no", getTrainCoaches);

module.exports = router;