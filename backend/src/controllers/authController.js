const jwt = require('jsonwebtoken');
const User = require('../models/User');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const publicUser = u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role
});

function sendToken(user, status, res) {
    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, process.env.JWT_SECRET,
        { expiresIn: '7d' });

    return res.status(status)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token,
            user: publicUser(user)
        });
}

exports.signup = async (req, res) => {
    try {

        let { name, email, password, role } = req.body;

        name = String(name || '').trim();
        email = String(email || '').trim().toLowerCase();

        if (!name || !email || !password)
            return res.status(400).json({
                success: false, message: 'Name, email, and password are required'
            });

        if (String(password).length < 6)
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        if (await User.findOne({ email }))
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });

        const user = await User.create({
            name,
            email,
            password,
            role: role === 'driver' ? 'driver' : 'customer'
        });

        return res.status(201).json({
            success: true,
            message: 'Account created successfully. Please sign in.',
            user: publicUser(user)
        });
    }
    catch (e) {
        if (e.code === 11000)
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        return res.status(500).json({
            success: false,
            message: 'Unable to create account'
        });
    }
};


exports.signin = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase(),
            password = req.body.password; if (!email || !password)
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        return sendToken(user, 200, res);
    }
    catch {
        return res.status(500).json({
            success: false,
            message: 'Unable to sign in'
        });
    }
};

exports.me = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({
        success: false,
        message: 'User not found'
    });
    return res.json({
        success: true,
        user
    });
};

exports.signout = (req, res) => res.clearCookie('token', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
}).json({
    success: true,
    message: 'Signed out'
});
