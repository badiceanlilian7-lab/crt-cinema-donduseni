const express = require('express');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Generate unique QR code
const generateQRCode = async (data) => {
  const qrDir = path.join(__dirname, '../qrcodes');
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }

  const qrCode = `CRT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const qrPath = path.join(qrDir, `${qrCode}.png`);

  await QRCode.toFile(qrPath, qrCode, {
    width: 300,
    margin: 2
  });

  return qrCode;
};

// Create registration
router.post('/', async (req, res) => {
  const { movie_id, name, email, age } = req.body;

  if (!movie_id || !name || !email || !age) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if movie exists and get details
  db.get('SELECT * FROM movies WHERE id = ?', [movie_id], async (err, movie) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Check age restrictions
    if (age < movie.min_age || age > movie.max_age) {
      return res.status(400).json({ 
        error: `Age restriction: Must be between ${movie.min_age} and ${movie.max_age} years old` 
      });
    }

    // Check available seats
    db.get(
      'SELECT COUNT(*) as count FROM registrations WHERE movie_id = ?',
      [movie_id],
      async (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const registeredCount = result.count;
        if (registeredCount >= movie.total_seats) {
          return res.status(400).json({ 
            error: 'No more seats available. Follow us on social media for updates!',
            social_media: {
              facebook: 'https://facebook.com/crtcinema',
              instagram: 'https://instagram.com/crtcinema'
            }
          });
        }

        try {
          // Generate QR code
          const qrCode = await generateQRCode();

          // Insert registration
          db.run(
            'INSERT INTO registrations (movie_id, name, email, age, qr_code) VALUES (?, ?, ?, ?, ?)',
            [movie_id, name, email, age, qrCode],
            async function(err) {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              // Send email
              try {
                await sendEmail({
                  to: email,
                  subject: 'Rezervare Bilet - CRT Cinema Donduseni',
                  movie: movie.title,
                  date: movie.projection_date,
                  time: movie.projection_time,
                  location: movie.location,
                  age: age,
                  qrCode: qrCode
                });
              } catch (emailError) {
                console.error('Email error:', emailError);
                // Continue even if email fails
              }

              res.json({
                id: this.lastID,
                qrCode,
                message: 'Registration successful'
              });
            }
          );
        } catch (qrError) {
          return res.status(500).json({ error: 'QR code generation failed' });
        }
      }
    );
  });
});

// Get registrations by movie
router.get('/movie/:movieId', (req, res) => {
  db.all(
    `SELECT r.*, m.title as movie_title 
     FROM registrations r 
     JOIN movies m ON r.movie_id = m.id 
     WHERE r.movie_id = ? 
     ORDER BY r.created_at DESC`,
    [req.params.movieId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Get all registrations
router.get('/', (req, res) => {
  db.all(
    `SELECT r.*, m.title as movie_title 
     FROM registrations r 
     JOIN movies m ON r.movie_id = m.id 
     ORDER BY r.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Get statistics
router.get('/stats/total', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM registrations', [], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ total: result.total });
  });
});

// Get scanned count
router.get('/stats/scanned', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM registrations WHERE scanned = 1', [], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ total: result.total });
  });
});

module.exports = router;
