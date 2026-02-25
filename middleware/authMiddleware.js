const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "railway_secret";

// VERIFY TOKEN
exports.verifyToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token)
        return res.status(401).json({ error: "No token provided" });

    // remove Bearer if present
    if (token.startsWith("Bearer "))
        token = token.slice(7, token.length);

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("JWT ERROR:", err.message);
        return res.status(401).json({ error: "Invalid token" });
    }
};

// ROLE CHECK
exports.allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return res.status(403).json({ error: "Forbidden" });

        next();
    };
};