const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const registrationRoutes = require('./routes/registrations');
const feedbackRoutes = require('./routes/feedback');
const qrRoutes = require('./routes/qr');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/qrcodes', express.static(path.join(__dirname, 'qrcodes')));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Access at: http://localhost:${PORT}`);
    console.log(`Network access at: http://192.168.1.14:${PORT}`);
  } else {
    console.log(`Production mode - Server is live`);
  }
});
