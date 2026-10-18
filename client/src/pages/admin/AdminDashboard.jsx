import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalRegistrations: 0,
    scannedRegistrations: 0,
    totalFeedback: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin/login')
      return
    }

    fetchStats()
  }, [navigate])

  const fetchStats = async () => {
    try {
      const [moviesRes, regsRes, scannedRes, feedbackRes] = await Promise.all([
        api.get('/movies'),
        api.get('/registrations/stats/total'),
        api.get('/registrations/stats/scanned'),
        api.get('/feedback/stats/total')
      ])

      setStats({
        totalMovies: moviesRes.data.length,
        totalRegistrations: regsRes.data.total,
        scannedRegistrations: scannedRes.data.total,
        totalFeedback: feedbackRes.data.total
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
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
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>🎬 Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Deconectare</button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎥</div>
          <div className="stat-value">{stats.totalMovies}</div>
          <div className="stat-label">Filme Active</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.totalRegistrations}</div>
          <div className="stat-label">Total Înregistrări</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.scannedRegistrations}</div>
          <div className="stat-label">Participanți Prezenți</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.totalFeedback}</div>
          <div className="stat-label">Feedback-uri Primite</div>
        </div>
      </div>

      <nav className="dashboard-nav">
        <button onClick={() => navigate('/admin/movies')} className="nav-button">
          🎥 Gestionare Filme
        </button>
        <button onClick={() => navigate('/admin/registrations')} className="nav-button">
          📝 Vizualizare Înregistrări
        </button>
        <button onClick={() => navigate('/admin/feedback')} className="nav-button">
          ⭐ Vizualizare Feedback
        </button>
        <button onClick={() => navigate('/admin/scanner')} className="nav-button">
          📱 Scanner QR
        </button>
      </nav>
    </div>
  )
}

export default AdminDashboard
