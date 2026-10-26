
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Counter its make a id for user 
const Counter =
    mongoose.models.Counter ||
    mongoose.model(
        "Counter",
        new mongoose.Schema({
            _id: { type: String, required: true },
            seq: { type: Number, default: 0 },
        })
    );

// Generate JWT and set cookie
const sendToken = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return res
        .status(statusCode)
        .cookie("token", token, COOKIE_OPTIONS)
        .json({
            success: true,
            user: {
                id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token: token,
        });
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required",
            });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        if (!["user", "driver"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be user or driver",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        // Atomically generate the next numeric ID
        const counter = await Counter.findByIdAndUpdate(
            "userId",
            { $inc: { seq: 1 } },
            { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
        );

        const user = await User.create({
            userId: counter.seq,
            name: name.trim(),
            email: normalizedEmail,
            password,
            role,
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully. Please sign in.",
            user: {
                id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or user ID already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create account",
        });
    }
};

// POST /api/auth/signin
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        return sendToken(user, 200, res);
    } catch (error) {
        console.error("Signin error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to sign in",
        });
    }
};

// GET /api/auth/me
exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.json({
            success: true,
            user: {
                id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get user",
        });
    }
};

// POST /api/auth/signout
exports.signout = (req, res) => {
    return res
        .clearCookie("token", COOKIE_OPTIONS)
        .json({
            success: true,
            message: "Signed out successfully",
        });
};

// PUT /api/auth/me — update the authenticated user's profile
exports.updateMe = async (req, res) => {
    try {
        const { name, email } = req.body || {};

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (name !== undefined) {
            const trimmedName = String(name).trim();
            if (!trimmedName) {
                return res.status(400).json({ success: false, message: "Name is required" });
            }
            user.name = trimmedName;
        }

        if (email) {
            const trimmedEmail = String(email).trim().toLowerCase();
            const existing = await User.findOne({ email: trimmedEmail, _id: { $ne: req.user.id } });
            if (existing) {
                return res.status(400).json({ success: false, message: "Email already registered" });
            }
            user.email = trimmedEmail;
        }

        await user.save();

        const updatedUser = await User.findById(req.user.id);
        return res.json({
            success: true,
            user: {
                id: updatedUser.userId,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update profile" });
    }
};
