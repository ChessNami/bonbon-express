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

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Bonbon Express Backend API' });
});

// API routes
app.use('/api/email', emailRoutes);

// 404 Handler for unmatched routes
app.use('/api/not-found', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

module.exports = app;