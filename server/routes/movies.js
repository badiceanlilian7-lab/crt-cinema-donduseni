const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get all movies
router.get('/', (req, res) => {
  db.all('SELECT * FROM movies ORDER BY projection_date ASC, projection_time ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Add available seats count to each movie
    const moviesWithAvailability = rows.map(movie => {
      db.get(
        'SELECT COUNT(*) as count FROM registrations WHERE movie_id = ?',
        [movie.id],
        (err, result) => {
          if (!err) {
            movie.available_seats = movie.total_seats - result.count;
          }
        }
      );
      return movie;
    });

    res.json(rows);
  });
});

// Get single movie
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM movies WHERE id = ?', [req.params.id], (err, movie) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Get registered count
    db.get(
      'SELECT COUNT(*) as count FROM registrations WHERE movie_id = ?',
      [movie.id],
      (err, result) => {
        movie.available_seats = movie.total_seats - result.count;
        res.json(movie);
      }
    );
  });
});

// Create movie
router.post('/', upload.single('poster'), (req, res) => {
  const { title, description, location, min_age, max_age, total_seats, projection_date, projection_time } = req.body;

  if (!title || !total_seats || !projection_date || !projection_time) {
    return res.status(400).json({ error: 'Title, total seats, date and time are required' });
  }

  const poster = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    `INSERT INTO movies (title, description, location, min_age, max_age, total_seats, projection_date, projection_time, poster)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, location, min_age || 0, max_age || 100, total_seats, projection_date, projection_time, poster],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Movie created successfully' });
    }
  );
});

// Update movie
router.put('/:id', upload.single('poster'), (req, res) => {
  const { title, description, location, min_age, max_age, total_seats, projection_date, projection_time } = req.body;

  const poster = req.file ? `/uploads/${req.file.filename}` : req.body.existing_poster;

  db.run(
    `UPDATE movies 
     SET title = ?, description = ?, location = ?, min_age = ?, max_age = ?, 
         total_seats = ?, projection_date = ?, projection_time = ?, poster = ?
     WHERE id = ?`,
    [title, description, location, min_age, max_age, total_seats, projection_date, projection_time, poster, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Movie updated successfully' });
    }
  );
});

// Delete movie
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM movies WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Movie deleted successfully' });
  });
});

module.exports = router;
