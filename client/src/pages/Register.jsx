import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import './Register.css'

function Register() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  
  const [movie, setMovie] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Load saved data from localStorage
    const savedName = localStorage.getItem('userName')
    const savedEmail = localStorage.getItem('userEmail')
    const savedAge = localStorage.getItem('userAge')
    
    if (savedName || savedEmail || savedAge) {
      setFormData(prev => ({
        ...prev,
        name: savedName || '',
        email: savedEmail || '',
        age: savedAge || ''
      }))
    }

    fetchMovie()
  }, [movieId])

  const fetchMovie = async () => {
    try {
      const response = await api.get(`/movies/${movieId}`)
      setMovie(response.data)
    } catch (error) {
      console.error('Error fetching movie:', error)
      setError('Filmul nu a fost găsit')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    // Validation
    if (!formData.name || !formData.email || !formData.age) {
      setError('Toate câmpurile sunt obligatorii')
      setSubmitting(false)
      return
    }

    const ageNum = parseInt(formData.age)
    if (isNaN(ageNum) || ageNum < 0) {
      setError('Vârsta trebuie să fie un număr valid')
      setSubmitting(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Email invalid')
      setSubmitting(false)
      return
    }

    try {
      const response = await api.post('/registrations', {
        movie_id: movieId,
        name: formData.name,
        email: formData.email,
        age: ageNum
      })

      // Save to localStorage
      localStorage.setItem('userName', formData.name)
      localStorage.setItem('userEmail', formData.email)
      localStorage.setItem('userAge', formData.age)

      setSuccess(true)

      // Redirect to feedback after 5 seconds
      setTimeout(() => {
        navigate(`/feedback/${movieId}/${response.data.id}`)
      }, 5000)

    } catch (error) {
      console.error('Registration error:', error)
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Eroare la înregistrare')
      } else {
        setError('Eroare la înregistrare. Încearcă din nou.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Se încarcă...</p>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="error-container">
        <p>Filmul nu a fost găsit</p>
        <Link to="/" className="back-button">Înapoi la filme</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h2>Rezervare reușită!</h2>
        <p>Codul QR a fost trimis pe email-ul tău</p>
        <p>Vei fi redirecționat către pagina de feedback în 5 secunde...</p>
      </div>
    )
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>🎬 Rezervare Bilet</h1>
        
        <div className="movie-summary">
          <h2>{movie.title}</h2>
          <p>📅 {movie.projection_date} la {movie.projection_time}</p>
          <p>📍 {movie.location || 'Cinema Donduseni'}</p>
          <p>👶 Vârstă: {movie.min_age} - {movie.max_age} ani</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
            {error.includes('social media') && (
              <div className="social-links">
                <p>Urmărește-ne pentru actualizări:</p>
                <a href="https://facebook.com/crtcinema" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="https://instagram.com/crtcinema" target="_blank" rel="noopener noreferrer">Instagram</a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Nume complet *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Introduceți numele complet"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="exemplu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Vârstă *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="0"
              max="120"
              placeholder="Vârsta dumneavoastră"
            />
            <small>Restricție: {movie.min_age} - {movie.max_age} ani</small>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? 'Se procesează...' : 'Rezervă'}
          </button>
        </form>

        <Link to="/" className="back-link">Înapoi la filme</Link>
      </div>
    </div>
  )
}

export default Register
