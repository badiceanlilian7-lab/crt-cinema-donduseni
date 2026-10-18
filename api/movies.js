const express = require('express');
const router = express.Router();
const db = require('../server/database');

// Get all movies
router.get('/', async (req, res) => {
  try {
    const movies = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM movies ORDER BY projection_date ASC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea filmelor' });
  }
});

// Get single movie
router.get('/:id', async (req, res) => {
  try {
    const movie = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM movies WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (!movie) {
      return res.status(404).json({ error: 'Filmul nu a fost găsit' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea filmului' });
  }
});

// Create movie
router.post('/', async (req, res) => {
  try {
    const { title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats } = req.body;
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO movies (title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats, available_seats) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats, total_seats],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    
    res.status(201).json({ id: result.id, message: 'Film creat cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la crearea filmului' });
  }
});

// Update movie
router.put('/:id', async (req, res) => {
  try {
    const { title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats } = req.body;
    
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE movies SET title = ?, description = ?, poster = ?, projection_date = ?, projection_time = ?, location = ?, min_age = ?, max_age = ?, total_seats = ? WHERE id = ?',
        [title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats, req.params.id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({ message: 'Film actualizat cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea filmului' });
  }
});

// Delete movie
router.delete('/:id', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM movies WHERE id = ?', [req.params.id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.json({ message: 'Film șters cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea filmului' });
  }
});

module.exports = router;
