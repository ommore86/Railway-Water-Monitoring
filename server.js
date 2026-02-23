const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const sensorRoutes = require("./routes/sensorRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// connect routes
app.use("/api", sensorRoutes);

// test route
app.get("/", (req, res) => {
    res.send("Server running successfully 🚆");
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});