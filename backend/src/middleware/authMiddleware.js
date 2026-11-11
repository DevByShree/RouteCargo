const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.token;
    
        if (!token)
            return res.status(401).json({ success: false, message: 'Not authenticated, please sign in' });

        const d = jwt.verify(token, process.env.JWT_SECRET);
    
        req.user = { id: d.id, role: d.role }; next();
    }
    catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

exports.authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
        return res.status(403).json({ success: false, message: 'Not authorized to access this resource' });
    next();
};
