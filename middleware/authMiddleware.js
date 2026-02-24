const jwt = require("jsonwebtoken");

const SECRET = "railway_secret_key";

// verify login token
exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token)
        return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.split(" ")[1], SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// allow only specific roles
exports.allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return res.status(403).json({ error: "Forbidden: insufficient permission" });

        next();
    };
};