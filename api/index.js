const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const authRoutes = require('./auth');
const movieRoutes = require('./movies');
const registrationRoutes = require('./registrations');
const feedbackRoutes = require('./feedback');

const app = express();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crt_cinema',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Make db available to routes
app.use((req, res, next) => {
  req.db = pool;
  next();
});

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
