const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
const cookieParser = require('cookie-parser');

const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const driverRoutes = require('./src/routes/driverRoutes');
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) =>
    res.json({
        success: true,
        message: 'RouteCargo Backend is running!'
    }));

app.use('/api/auth', authRoutes);

app.use('/api/driver', driverRoutes);

app.use((req, res) =>
    res.status(404).json({
        success: false,
        message: 'Route not found'
    }));

app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({
        success: false, message: err.status ? err.message : 'Internal server error'
    });
});
async function start() {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET)
        throw new Error('MONGO_URI and JWT_SECRET must be configured in .env');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
        console.log(`Server running on http://localhost:${process.env.PORT || 5000}`
        ));
}

start().catch(e => {
    console.error('Startup failed:', e.message);
    process.exit(1);
});
