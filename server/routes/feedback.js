const express = require('express');
const db = require('../database');

const router = express.Router();

// Submit feedback
router.post('/', (req, res) => {
  const { movie_id, registration_id, name, movie_rating, organization_rating, comments } = req.body;

  if (!movie_id || !name || !movie_rating || !organization_rating) {
    return res.status(400).json({ error: 'Movie ID, name, and ratings are required' });
  }

  if (movie_rating < 1 || movie_rating > 5 || organization_rating < 1 || organization_rating > 5) {
    return res.status(400).json({ error: 'Ratings must be between 1 and 5' });
  }

  db.run(
    'INSERT INTO feedback (movie_id, registration_id, name, movie_rating, organization_rating, comments) VALUES (?, ?, ?, ?, ?, ?)',
    [movie_id, registration_id, name, movie_rating, organization_rating, comments],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Feedback submitted successfully' });
    }
  );
});

// Get feedback by movie
router.get('/movie/:movieId', (req, res) => {
  db.all(
    'SELECT * FROM feedback WHERE movie_id = ? ORDER BY created_at DESC',
    [req.params.movieId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Get all feedback
router.get('/', (req, res) => {
  db.all(
    `SELECT f.*, m.title as movie_title 
     FROM feedback f 
     JOIN movies m ON f.movie_id = m.id 
     ORDER BY f.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Get feedback count
router.get('/stats/total', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM feedback', [], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ total: result.total });
  });
});

module.exports = router;
