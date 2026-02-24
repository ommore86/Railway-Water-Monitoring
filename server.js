const express = require("express");
const cors = require("cors");
const dashboardRoutes = require("./routes/dashboardRoutes");
require("dotenv").config();
require("./config/db");

const sensorRoutes = require("./routes/sensorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// connect routes
app.use("/api", sensorRoutes);

app.use("/api", dashboardRoutes);

// test route
app.get("/", (req, res) => {
    res.send("Server running successfully 🚆");
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});