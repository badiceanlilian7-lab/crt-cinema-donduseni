const express = require('express');
const db = require('../database');

const router = express.Router();

// Validate and scan QR code
router.post('/scan', (req, res) => {
  const { qr_code } = req.body;

  if (!qr_code) {
    return res.status(400).json({ error: 'QR code is required' });
  }

  db.get(
    `SELECT r.*, m.title as movie_title, m.projection_date, m.projection_time, m.location 
     FROM registrations r 
     JOIN movies m ON r.movie_id = m.id 
     WHERE r.qr_code = ?`,
    [qr_code],
    (err, registration) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!registration) {
        return res.status(404).json({ error: 'Invalid QR code' });
      }

      // Check if already scanned
      if (registration.scanned) {
        return res.status(400).json({ 
          error: 'QR code already used',
          status: 'already_scanned',
          data: registration
        });
      }

      // Check if expired (2 days after movie date)
      const movieDate = new Date(registration.projection_date);
      const expiryDate = new Date(movieDate);
      expiryDate.setDate(expiryDate.getDate() + 2);
      const now = new Date();

      if (now > expiryDate) {
        return res.status(400).json({ 
          error: 'QR code expired',
          status: 'expired',
          data: registration
        });
      }

      // Mark as scanned
      db.run(
        'UPDATE registrations SET scanned = 1, scanned_at = CURRENT_TIMESTAMP WHERE id = ?',
        [registration.id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            status: 'success',
            message: 'Scan successful',
            data: registration
          });
        }
      );
    }
  );
});

// Get QR code info (without scanning)
router.post('/validate', (req, res) => {
  const { qr_code } = req.body;

  if (!qr_code) {
    return res.status(400).json({ error: 'QR code is required' });
  }

  db.get(
    `SELECT r.*, m.title as movie_title, m.projection_date, m.projection_time, m.location 
     FROM registrations r 
     JOIN movies m ON r.movie_id = m.id 
     WHERE r.qr_code = ?`,
    [qr_code],
    (err, registration) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!registration) {
        return res.status(404).json({ error: 'Invalid QR code' });
      }

      // Check expiry
      const movieDate = new Date(registration.projection_date);
      const expiryDate = new Date(movieDate);
      expiryDate.setDate(expiryDate.getDate() + 2);
      const now = new Date();

      const isExpired = now > expiryDate;

      res.json({
        valid: true,
        scanned: registration.scanned,
        expired: isExpired,
        data: registration
      });
    }
  );
});

module.exports = router;
