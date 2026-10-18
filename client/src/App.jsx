import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Feedback from './pages/Feedback'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMovies from './pages/admin/AdminMovies'
import AdminRegistrations from './pages/admin/AdminRegistrations'
import AdminFeedback from './pages/admin/AdminFeedback'
import QRScanner from './pages/admin/QRScanner'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register/:movieId" element={<Register />} />
        <Route path="/feedback/:movieId/:registrationId" element={<Feedback />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/movies" element={<AdminMovies />} />
        <Route path="/admin/registrations" element={<AdminRegistrations />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="/admin/scanner" element={<QRScanner />} />
      </Routes>
    </Router>
  )
}

export default App
