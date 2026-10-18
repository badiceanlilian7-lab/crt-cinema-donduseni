import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import './Home.css'

function Home() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies')
      setMovies(response.data)
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Se încarcă filmele...</p>
      </div>
    )
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🎬 CRT Cinema Donduseni</h1>
        <p>Rezervă-ți biletul online</p>
      </header>

      <div className="movies-grid">
        {movies.length === 0 ? (
          <div className="no-movies">
            <p>Nu există filme disponibile momentan</p>
          </div>
        ) : (
          movies.map(movie => (
            <div key={movie.id} className="movie-card">
              {movie.poster && (
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="movie-poster"
                />
              )}
              <div className="movie-info">
                <h2 className="movie-title">{movie.title}</h2>
                <p className="movie-description">{movie.description}</p>
                
                <div className="movie-details">
                  <div className="detail-item">
                    <span className="detail-label">📅 Data:</span>
                    <span className="detail-value">{movie.projection_date}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">⏰ Ora:</span>
                    <span className="detail-value">{movie.projection_time}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📍 Locație:</span>
                    <span className="detail-value">{movie.location || 'Cinema Donduseni'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">👶 Vârstă:</span>
                    <span className="detail-value">{movie.min_age} - {movie.max_age} ani</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">💺 Locuri:</span>
                    <span className="detail-value">
                      {movie.available_seats !== undefined ? movie.available_seats : movie.total_seats} / {movie.total_seats}
                    </span>
                  </div>
                </div>

                <div className="seat-status">
                  {(movie.available_seats !== undefined ? movie.available_seats : movie.total_seats) > 0 ? (
                    <span className="status-available">✅ Locuri disponibile</span>
                  ) : (
                    <span className="status-full">❌ Nu mai sunt locuri</span>
                  )}
                </div>

                <Link 
                  to={`/register/${movie.id}`}
                  className={`reserve-button ${(movie.available_seats !== undefined ? movie.available_seats : movie.total_seats) === 0 ? 'disabled' : ''}`}
                  onClick={(e) => {
                    if ((movie.available_seats !== undefined ? movie.available_seats : movie.total_seats) === 0) {
                      e.preventDefault()
                    }
                  }}
                >
                  Rezervă Bilet
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="home-footer">
        <Link to="/admin" className="admin-link">Admin</Link>
      </footer>
    </div>
  )
}

export default Home
