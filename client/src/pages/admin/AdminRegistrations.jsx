import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import './AdminRegistrations.css'

function AdminRegistrations() {
  const navigate = useNavigate()
  
  const [movies, setMovies] = useState([])
  const [registrations, setRegistrations] = useState([])
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
      fetchRegistrations(selectedMovie)
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

  const fetchRegistrations = async (movieId) => {
    try {
      const response = await api.get(`/registrations/movie/${movieId}`)
      setRegistrations(response.data)
    } catch (error) {
      console.error('Error fetching registrations:', error)
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

  return (
    <div className="admin-registrations">
      <header className="page-header">
        <h1>📝 Vizualizare Înregistrări</h1>
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

      {registrations.length === 0 ? (
        <div className="no-registrations">
          <p>Nu există înregistrări pentru acest film</p>
        </div>
      ) : (
        <div className="registrations-table">
          <table>
            <thead>
              <tr>
                <th>Nume</th>
                <th>Email</th>
                <th>Vârstă</th>
                <th>Cod QR</th>
                <th>Statut</th>
                <th>Data Înregistrării</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr key={reg.id}>
                  <td>{reg.name}</td>
                  <td>{reg.email}</td>
                  <td>{reg.age}</td>
                  <td className="qr-code">{reg.qr_code}</td>
                  <td>
                    <span className={`status ${reg.scanned ? 'scanned' : 'not-scanned'}`}>
                      {reg.scanned ? '✅ Scanat' : '⏳ Nescanat'}
                    </span>
                  </td>
                  <td>{new Date(reg.created_at).toLocaleDateString('ro-RO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminRegistrations
