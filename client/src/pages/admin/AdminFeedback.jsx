import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import './AdminFeedback.css'

function AdminFeedback() {
  const navigate = useNavigate()
  
  const [movies, setMovies] = useState([])
  const [feedback, setFeedback] = useState([])
  const [selectedMovie, setSelectedMovie] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin/login')
      return
    }

    fetchMovies()
  }, [navigate])

  useEffect(() => {
    if (selectedMovie) {
      fetchFeedback(selectedMovie)
    }
  }, [selectedMovie])

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies')
      setMovies(response.data)
      if (response.data.length > 0) {
        setSelectedMovie(response.data[0].id.toString())
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeedback = async (movieId) => {
    try {
      const response = await api.get(`/feedback/movie/${movieId}`)
      setFeedback(response.data)
    } catch (error) {
      console.error('Error fetching feedback:', error)
    }
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Se încarcă...</p>
      </div>
    )
  }

  return (
    <div className="admin-feedback">
      <header className="page-header">
        <h1>⭐ Vizualizare Feedback</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          ← Înapoi la Dashboard
        </button>
      </header>

      <div className="filter-section">
        <label htmlFor="movie-select">Selectează Film:</label>
        <select
          id="movie-select"
          value={selectedMovie}
          onChange={(e) => setSelectedMovie(e.target.value)}
        >
          {movies.map(movie => (
            <option key={movie.id} value={movie.id}>
              {movie.title} - {movie.projection_date}
            </option>
          ))}
        </select>
      </div>

      {feedback.length === 0 ? (
        <div className="no-feedback">
          <p>Nu există feedback pentru acest film</p>
        </div>
      ) : (
        <div className="feedback-list">
          {feedback.map(item => (
            <div key={item.id} className="feedback-card">
              <div className="feedback-header">
                <h3>{item.name}</h3>
                <span className="feedback-date">
                  {new Date(item.created_at).toLocaleDateString('ro-RO')}
                </span>
              </div>

              <div className="feedback-ratings">
                <div className="rating-item">
                  <span className="rating-label">Film:</span>
                  <span className="rating-stars">{renderStars(item.movie_rating)}</span>
                  <span className="rating-value">({item.movie_rating}/5)</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">Organizare:</span>
                  <span className="rating-stars">{renderStars(item.organization_rating)}</span>
                  <span className="rating-value">({item.organization_rating}/5)</span>
                </div>
              </div>

              {item.comments && (
                <div className="feedback-comments">
                  <h4>Comentarii:</h4>
                  <p>{item.comments}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminFeedback
