const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crt_cinema',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `);

  await pool.query(`
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

  await pool.query(`
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

  await pool.query(`
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
  const adminResult = await pool.query('SELECT * FROM admins WHERE username = $1', ['lilian']);
  if (adminResult.rows.length === 0) {
    const hashedPassword = await bcrypt.hash('292009', 10);
    await pool.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['lilian', hashedPassword]);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client/dist in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
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

app.get('/api/auth/verify', (req, res) => {
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

// Movies routes
app.get('/api/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY projection_date ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea filmelor' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Filmul nu a fost găsit' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea filmului' });
  }
});

app.post('/api/movies', async (req, res) => {
  try {
    const { title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats } = req.body;
    
    const result = await pool.query(
      'INSERT INTO movies (title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats, available_seats) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      [title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats, total_seats]
    );
    
    res.status(201).json({ id: result.rows[0].id, message: 'Film creat cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la crearea filmului' });
  }
});

app.put('/api/movies/:id', async (req, res) => {
  try {
    const { title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats } = req.body;
    
    await pool.query(
      'UPDATE movies SET title = $1, description = $2, poster = $3, projection_date = $4, projection_time = $5, location = $6, min_age = $7, max_age = $8, total_seats = $9 WHERE id = $10',
      [title, description, poster, projection_date, projection_time, location, min_age, max_age, total_seats, req.params.id]
    );
    
    res.json({ message: 'Film actualizat cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea filmului' });
  }
});

app.delete('/api/movies/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM movies WHERE id = $1', [req.params.id]);
    res.json({ message: 'Film șters cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la ștergerea filmului' });
  }
});

// Registrations routes
app.post('/api/registrations', async (req, res) => {
  try {
    const { movie_id, name, email, age } = req.body;
    
    const existing = await pool.query(
      'SELECT * FROM registrations WHERE movie_id = $1 AND email = $2',
      [movie_id, email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Această adresă de email este deja înregistrată pentru acest film' });
    }

    const movie = await pool.query('SELECT * FROM movies WHERE id = $1', [movie_id]);

    if (movie.rows.length === 0) {
      return res.status(404).json({ error: 'Filmul nu a fost găsit' });
    }

    if (movie.rows[0].available_seats <= 0) {
      return res.status(400).json({ error: 'Nu mai sunt locuri disponibile' });
    }

    const qr_code = `CRT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await pool.query(
      'INSERT INTO registrations (movie_id, name, email, age, qr_code, used) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING id',
      [movie_id, name, email, age, qr_code]
    );

    await pool.query('UPDATE movies SET available_seats = available_seats - 1 WHERE id = $1', [movie_id]);

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

app.get('/api/registrations/movie/:movie_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM registrations WHERE movie_id = $1 ORDER BY created_at DESC',
      [req.params.movie_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea înregistrărilor' });
  }
});

app.get('/api/registrations/stats', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN used = FALSE THEN 1 ELSE 0 END) as unused FROM registrations'
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea statisticilor' });
  }
});

// Feedback routes
app.post('/api/feedback', async (req, res) => {
  try {
    const { movie_id, movie_rating, organization_rating, comments } = req.body;
    
    const result = await pool.query(
      'INSERT INTO feedback (movie_id, movie_rating, organization_rating, comments) VALUES ($1, $2, $3, $4) RETURNING id',
      [movie_id, movie_rating, organization_rating, comments]
    );

    res.status(201).json({ id: result.rows[0].id, message: 'Feedback trimis cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la trimiterea feedback-ului' });
  }
});

app.get('/api/feedback/movie/:movie_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM feedback WHERE movie_id = $1 ORDER BY created_at DESC',
      [req.params.movie_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la încărcarea feedback-ului' });
  }
});

// Serve frontend for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  });
}

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

module.exports = app;
