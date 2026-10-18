const express = require('express');
const router = express.Router();

// Submit feedback
router.post('/', async (req, res) => {
  try {
    const db = req.db;
    const { movie_id, movie_rating, organization_rating, comments } = req.body;
    
    const result = await db.query(
      'INSERT INTO feedback (movie_id, movie_rating, organization_rating, comments) VALUES ($1, $2, $3, $4) RETURNING id',
      [movie_id, movie_rating, organization_rating, comments]
    );

    res.status(201).json({ id: result.rows[0].id, message: 'Feedback trimis cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la trimiterea feedback-ului' });
  }
});

// Get feedback by movie
router.get('/movie/:movie_id', async (req, res) => {
  try {
    const db = req.db;
    const result = await db.query(
      'SELECT * FROM feedback WHERE movie_id = $1 ORDER BY created_at DESC',
      [req.params.movie_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea feedback-ului' });
  }
});

module.exports = router;
