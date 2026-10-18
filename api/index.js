const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../server/database');
const authRoutes = require('./auth');
const movieRoutes = require('./movies');
const registrationRoutes = require('./registrations');
const feedbackRoutes = require('./feedback');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = app;
