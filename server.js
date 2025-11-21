// server.js
const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/email');
require('dotenv').config();

const app = express();

// Allow both localhost and production
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

// Routes
app.use('/api/email', emailRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', time: new Date().toISOString() });
});

// For local development
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Email server running at http://localhost:${PORT}`);
    });
}

// Export for Vercel
module.exports = app;