const express = require('express');
const router = express.Router();

// Get all movies
router.get('/', async (req, res) => {
  try {
    const db = req.db;
    const result = await db.query('SELECT * FROM movies ORDER BY projection_date ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea filmelor' });
  }
});

// Get single movie
router.get('/:id', async (req, res) => {
  try {
    const db = req.db;
    const result = await db.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Filmul nu a fost găsit' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea filmului' });
  }
});

// Create movie
router.post('/', async (req, res) => {
  try {
    const db = req.db;
    const { title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats } = req.body;
    
    const result = await db.query(
      'INSERT INTO movies (title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats, available_seats) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      [title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats, total_seats]
    );
    
    res.status(201).json({ id: result.rows[0].id, message: 'Film creat cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la crearea filmului' });
  }
});

// Update movie
router.put('/:id', async (req, res) => {
  try {
    const db = req.db;
    const { title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats } = req.body;
    
    await db.query(
      'UPDATE movies SET title = $1, description = $2, poster = $3, projection_date = $4, projection_time = $5, location = $6, min_age = $7, max_age = $8, total_seats = $9 WHERE id = $10',
      [title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats, req.params.id]
    );
    
    res.json({ message: 'Film actualizat cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea filmului' });
  }
});

// Delete movie
router.delete('/:id', async (req, res) => {
  try {
    const db = req.db;
    await db.query('DELETE FROM movies WHERE id = $1', [req.params.id]);
    res.json({ message: 'Film șters cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea filmului' });
  }
});

module.exports = router;
