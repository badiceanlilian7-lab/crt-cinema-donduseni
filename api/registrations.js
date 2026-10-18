const express = require('express');
const router = express.Router();
const db = require('../server/database');

// Create registration
router.post('/', async (req, res) => {
  try {
    const { movie_id, name, email, age } = req.body;
    
    // Check if email already registered for this movie
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM registrations WHERE movie_id = ? AND email = ?',
        [movie_id, email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existing) {
      return res.status(400).json({ error: 'Această adresă de email este deja înregistrată pentru acest film' });
    }

    // Get movie details
    const movie = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM movies WHERE id = ?', [movie_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!movie) {
      return res.status(404).json({ error: 'Filmul nu a fost găsit' });
    }

    if (movie.available_seats <= 0) {
      return res.status(400).json({ error: 'Nu mai sunt locuri disponibile' });
    }

    // Create registration
    const qr_code = `CRT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO registrations (movie_id, name, email, age, qr_code, used) VALUES (?, ?, ?, ?, ?, 0)',
        [movie_id, name, email, age, qr_code],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Update available seats
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE movies SET available_seats = available_seats - 1 WHERE id = ?',
        [movie_id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({ 
      id: result.id, 
      qr_code,
      message: 'Înregistrare realizată cu succes' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Eroare la înregistrare' });
  }
});

// Get registrations by movie
router.get('/movie/:movie_id', async (req, res) => {
  try {
    const registrations = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM registrations WHERE movie_id = ? ORDER BY created_at DESC',
        [req.params.movie_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea înregistrărilor' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as total, SUM(CASE WHEN used = 0 THEN 1 ELSE 0 END) as unused FROM registrations',
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea statisticilor' });
  }
});

module.exports = router;
