const express = require('express');
const router = express.Router();
const db = require('../server/database');

// Submit feedback
router.post('/', async (req, res) => {
  try {
    const { movie_id, movie_rating, organization_rating, comments } = req.body;
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO feedback (movie_id, movie_rating, organization_rating, comments) VALUES (?, ?, ?, ?)',
        [movie_id, movie_rating, organization_rating, comments],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.status(201).json({ id: result.id, message: 'Feedback trimis cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la trimiterea feedback-ului' });
  }
});

// Get feedback by movie
router.get('/movie/:movie_id', async (req, res) => {
  try {
    const feedback = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM feedback WHERE movie_id = ? ORDER BY created_at DESC',
        [req.params.movie_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea feedback-ului' });
  }
});

module.exports = router;
