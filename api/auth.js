const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Initialize database tables
async function initDB(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS movies (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      poster TEXT,
      projection_date DATE NOT NULL,
      projection_time TIME NOT NULL,
      location VARCHAR(255),
      min_age INTEGER,
      max_age INTEGER,
      total_seats INTEGER NOT NULL,
      available_seats INTEGER NOT NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      movie_id INTEGER REFERENCES movies(id),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      age INTEGER NOT NULL,
      qr_code VARCHAR(255) UNIQUE NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      movie_id INTEGER REFERENCES movies(id),
      movie_rating INTEGER CHECK (movie_rating >= 1 AND movie_rating <= 5),
      organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if admin exists, if not create default
  const adminResult = await db.query('SELECT * FROM admins WHERE username = $1', ['lilian']);
  if (adminResult.rows.length === 0) {
    const hashedPassword = await bcrypt.hash('292009', 10);
    await db.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['lilian', hashedPassword]);
  }
}

// Login
router.post('/login', async (req, res) => {
  try {
    const db = req.db;
    await initDB(db);
    
    const { username, password } = req.body;
    
    const result = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ error: 'Credențiale invalide' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credențiale invalide' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'crt_cinema_secret_key_2024_secure_random_string',
      { expiresIn: '24h' }
    );

    res.json({ token, username: admin.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Eroare la autentificare' });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'crt_cinema_secret_key_2024_secure_random_string');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
