const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Verify JWT from httpOnly cookie and attach user to request
exports.authenticate = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Not authenticated, please sign in" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ success: false, message: "Invalid or expired token" });
    }
};

// Restrict route to specific role(s)
exports.authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res
            .status(403)
            .json({
                success: false,
                message: "Not authorized to access this resource",
            });
    }
    next();
};
