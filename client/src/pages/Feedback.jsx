import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import './Feedback.css'

function Feedback() {
  const { movieId, registrationId } = useParams()
  const navigate = useNavigate()
  
  const [movie, setMovie] = useState(null)
  const [formData, setFormData] = useState({
    movie_rating: 0,
    organization_rating: 0,
    comments: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [skipped, setSkipped] = useState(false)

  useEffect(() => {
    fetchMovie()
  }, [movieId])

  const fetchMovie = async () => {
    try {
      const response = await api.get(`/movies/${movieId}`)
      setMovie(response.data)
    } catch (error) {
      console.error('Error fetching movie:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (type, value) => {
    setFormData({
      ...formData,
      [type]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await api.post('/feedback', {
        movie_id: movieId,
        registration_id: registrationId,
        name: 'Participant',
        movie_rating: formData.movie_rating,
        organization_rating: formData.organization_rating,
        comments: formData.comments
      })

      navigate('/')
    } catch (error) {
      console.error('Feedback error:', error)
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    setSkipped(true)
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Se încarcă...</p>
      </div>
    )
  }

  if (skipped) {
    return (
      <div className="skip-container">
        <p>Feedback-ul a fost sărit. Mulțumim!</p>
      </div>
    )
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <h1>⭐ Feedback</h1>
        
        {movie && (
          <div className="movie-info">
            <h2>{movie.title}</h2>
            <p>Apreciază experiența ta la cinema</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="rating-section">
            <label>Cum ți s-a părut filmul?</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= formData.movie_rating ? 'active' : ''}`}
                  onClick={() => handleRatingChange('movie_rating', star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="rating-section">
            <label>Cum apreciezi organizarea?</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= formData.organization_rating ? 'active' : ''}`}
                  onClick={() => handleRatingChange('organization_rating', star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="comments-section">
            <label htmlFor="comments">Comentarii (opțional)</label>
            <textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Lasă un comentariu..."
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={submitting || formData.movie_rating === 0 || formData.organization_rating === 0}
            >
              {submitting ? 'Se trimite...' : 'Trimite Feedback'}
            </button>
            
            <button 
              type="button" 
              className="skip-button"
              onClick={handleSkip}
            >
              Sari peste
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Feedback
