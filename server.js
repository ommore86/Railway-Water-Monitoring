const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const sensorRoutes = require("./routes/sensor.routes");
const userRoutes = require("./routes/userRoutes");
const masterDataRoutes=require("./routes/masterDataRoutes");
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/users", userRoutes);
app.use("/api/master",masterDataRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("🚆 Railway Water Monitoring Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));