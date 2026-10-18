const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'cinema.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create movies table
  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      min_age INTEGER DEFAULT 0,
      max_age INTEGER DEFAULT 100,
      total_seats INTEGER NOT NULL,
      projection_date TEXT NOT NULL,
      projection_time TEXT NOT NULL,
      poster TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create registrations table
  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      age INTEGER NOT NULL,
      qr_code TEXT NOT NULL UNIQUE,
      scanned BOOLEAN DEFAULT 0,
      scanned_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies(id)
    )
  `);

  // Create feedback table
  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      registration_id INTEGER,
      name TEXT NOT NULL,
      movie_rating INTEGER NOT NULL,
      organization_rating INTEGER NOT NULL,
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies(id),
      FOREIGN KEY (registration_id) REFERENCES registrations(id)
    )
  `);

  // Create admins table
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (!err) {
      // Create default admin if not exists
      const defaultPassword = bcrypt.hashSync('292009', 10);
      db.run(
        'INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)',
        ['lilian', defaultPassword]
      );
    }
  });

  console.log('Database tables initialized');
}

module.exports = db;
