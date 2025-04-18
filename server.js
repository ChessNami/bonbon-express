const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/email');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);

// 404 Handler for non-API routes
app.use('/api/not-found', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Export for Vercel serverless
module.exports = app;