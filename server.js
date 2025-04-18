const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/email');
require('dotenv').config();

const app = express();

// Middleware: Allow all origins including localhost:3000
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);

// 404 Handler for non-API routes
app.use('/api/not-found', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Export for Vercel serverless
module.exports = app;
