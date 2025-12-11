// server.js
const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/email');
require('dotenv').config();

const app = express();

// CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3005',
    'https://barangay-bonbon.vercel.app',
    'https://bonbon-experiment.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// === ADD THIS ROOT ROUTE ===
app.get('/', (req, res) => {
    res.json({
        message: 'Barangay Bonbon Email API 🏘️',
        status: 'running',
        time: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
        docs: 'Check /api/health'
    });
});
// ===========================

app.use('/api/email', emailRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', time: new Date().toISOString() });
});

// Local dev only
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Email server running on http://localhost:${PORT}`);
    });
}

module.exports = app;