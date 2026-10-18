const express = require('express');
const router = express.Router();

// Create registration
router.post('/', async (req, res) => {
  try {
    const db = req.db;
    const { movie_id, name, email, age } = req.body;
    
    // Check if email already registered for this movie
    const existing = await db.query(
      'SELECT * FROM registrations WHERE movie_id = $1 AND email = $2',
      [movie_id, email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Această adresă de email este deja înregistrată pentru acest film' });
    }

    // Get movie details
    const movie = await db.query('SELECT * FROM movies WHERE id = $1', [movie_id]);

    if (movie.rows.length === 0) {
      return res.status(404).json({ error: 'Filmul nu a fost găsit' });
    }

    if (movie.rows[0].available_seats <= 0) {
      return res.status(400).json({ error: 'Nu mai sunt locuri disponibile' });
    }

    // Create registration
    const qr_code = `CRT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await db.query(
      'INSERT INTO registrations (movie_id, name, email, age, qr_code, used) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING id',
      [movie_id, name, email, age, qr_code]
    );

    // Update available seats
    await db.query('UPDATE movies SET available_seats = available_seats - 1 WHERE id = $1', [movie_id]);

    res.status(201).json({ 
      id: result.rows[0].id, 
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
    const db = req.db;
    const result = await db.query(
      'SELECT * FROM registrations WHERE movie_id = $1 ORDER BY created_at DESC',
      [req.params.movie_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea înregistrărilor' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const db = req.db;
    const result = await db.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN used = FALSE THEN 1 ELSE 0 END) as unused FROM registrations'
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea statisticilor' });
  }
});

module.exports = router;
