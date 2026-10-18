const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../server/database');
const authRoutes = require('../server/routes/auth');
const movieRoutes = require('../server/routes/movies');
const registrationRoutes = require('../server/routes/registrations');
const feedbackRoutes = require('../server/routes/feedback');
const qrRoutes = require('../server/routes/qr');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../server/uploads')));
app.use('/qrcodes', express.static(path.join(__dirname, '../server/qrcodes')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/qr', qrRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = app;
