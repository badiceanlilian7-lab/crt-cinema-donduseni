import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import './AdminMovies.css'

function AdminMovies() {
  const navigate = useNavigate()
  
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMovie, setEditingMovie] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    min_age: 0,
    max_age: 100,
    total_seats: 100,
    projection_date: '',
    projection_time: '',
    poster: null
  })

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin/login')
      return
    }

    fetchMovies()
  }, [navigate])

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

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'poster') {
      setFormData({ ...formData, poster: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const data = new FormData()
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('location', formData.location)
    data.append('min_age', formData.min_age)
    data.append('max_age', formData.max_age)
    data.append('total_seats', formData.total_seats)
    data.append('projection_date', formData.projection_date)
    data.append('projection_time', formData.projection_time)
    if (formData.poster) {
      data.append('poster', formData.poster)
    }
    if (editingMovie && editingMovie.poster) {
      data.append('existing_poster', editingMovie.poster)
    }

    try {
      if (editingMovie) {
        await api.put(`/movies/${editingMovie.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/movies', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      
      setShowModal(false)
      setEditingMovie(null)
      resetForm()
      fetchMovies()
    } catch (error) {
      console.error('Error saving movie:', error)
    }
  }

  const handleEdit = (movie) => {
    setEditingMovie(movie)
    setFormData({
      title: movie.title,
      description: movie.description || '',
      location: movie.location || '',
      min_age: movie.min_age || 0,
      max_age: movie.max_age || 100,
      total_seats: movie.total_seats,
      projection_date: movie.projection_date,
      projection_time: movie.projection_time,
      poster: null
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest film?')) return

    try {
      await api.delete(`/movies/${id}`)
      fetchMovies()
    } catch (error) {
      console.error('Error deleting movie:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      min_age: 0,
      max_age: 100,
      total_seats: 100,
      projection_date: '',
      projection_time: '',
      poster: null
    })
  }

  const openModal = () => {
    resetForm()
    setEditingMovie(null)
    setShowModal(true)
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
    <div className="admin-movies">
      <header className="page-header">
        <h1>🎥 Gestionare Filme</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          ← Înapoi la Dashboard
        </button>
      </header>

      <button onClick={openModal} className="add-button">
        + Adaugă Film Nou
      </button>

      <div className="movies-list">
        {movies.length === 0 ? (
          <div className="no-movies">
            <p>Nu există filme</p>
          </div>
        ) : (
          movies.map(movie => (
            <div key={movie.id} className="movie-item">
              {movie.poster && (
                <img src={movie.poster} alt={movie.title} className="movie-poster-thumb" />
              )}
              <div className="movie-details">
                <h3>{movie.title}</h3>
                <p>📅 {movie.projection_date} la {movie.projection_time}</p>
                <p>📍 {movie.location || 'Cinema Donduseni'}</p>
                <p>👶 {movie.min_age} - {movie.max_age} ani</p>
                <p>💺 {movie.total_seats} locuri</p>
              </div>
              <div className="movie-actions">
                <button onClick={() => handleEdit(movie)} className="edit-button">
                  Editare
                </button>
                <button onClick={() => handleDelete(movie.id)} className="delete-button">
                  Ștergere
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingMovie ? 'Editare Film' : 'Adaugare Film Nou'}</h2>
            <form onSubmit={handleSubmit} className="movie-form">
              <div className="form-group">
                <label>Titlu *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descriere</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Locație</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vârstă Minimă</label>
                  <input
                    type="number"
                    name="min_age"
                    value={formData.min_age}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Vârstă Maximă</label>
                  <input
                    type="number"
                    name="max_age"
                    value={formData.max_age}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Număr Locuri *</label>
                <input
                  type="number"
                  name="total_seats"
                  value={formData.total_seats}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data Proiecției *</label>
                  <input
                    type="date"
                    name="projection_date"
                    value={formData.projection_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ora Proiecției *</label>
                  <input
                    type="time"
                    name="projection_time"
                    value={formData.projection_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Poster (opțional)</label>
                <input
                  type="file"
                  name="poster"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingMovie ? 'Actualizare' : 'Adăugare'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="cancel-button">
                  Anulare
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMovies
