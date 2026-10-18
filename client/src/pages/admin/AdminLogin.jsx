import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import './AdminLogin.css'

function AdminLogin() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load saved username
    const savedUsername = localStorage.getItem('adminUsername')
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }))
    }

    // Check if already logged in
    const token = localStorage.getItem('adminToken')
    if (token) {
      navigate('/admin/dashboard')
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', formData)
      
      // Save token and username
      localStorage.setItem('adminToken', response.data.token)
      localStorage.setItem('adminUsername', formData.username)
      
      navigate('/admin/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setError('Credențiale invalide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>🔐 Admin Login</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Utilizator</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Introduceți utilizatorul"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Parolă</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Introduceți parola"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Se conectează...' : 'Conectare'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
