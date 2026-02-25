const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "railway_secret";

// Verify login token
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).json({ error: "No token provided" });

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, SECRET);

        req.user = decoded; // {id, role, station}
        next();

    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

// Allow only specific roles
exports.allowRoles = (...roles) => {
    return (req, res, next) => {

        if (!req.user)
            return res.status(401).json({ error: "Not authenticated" });

        if (!roles.includes(req.user.role))
            return res.status(403).json({ error: "Forbidden: Access denied" });

        next();
    };
};