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
app.use('/api/email', emailRoutes);

app.use('/api/not-found', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

module.exports = app;