const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/email');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['https://barangay-bonbon.vercel.app'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight requests explicitly (optional, but ensures compatibility)
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);

// 404 Handler for non-API routes
app.use('/api/not-found', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Export for Vercel serverless
module.exports = app;