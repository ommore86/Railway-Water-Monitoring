const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  coachId: String,
  stationId: String,
  waterLevel: Number,
  temperature: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Sensor", sensorSchema);