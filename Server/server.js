require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { initClerk } = require('./middleware/auth');
const loanRoutes = require('./routes/loans');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://brother-bank-sage.vercel.app'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(initClerk);

// routes
app.use('/api/loans', loanRoutes);

// upload-related error handler
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 2MB limit.'
            });
        }

        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err?.message?.includes('Only image files')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    next(err);
});

// health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// connect to MongoDB and start server
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });
