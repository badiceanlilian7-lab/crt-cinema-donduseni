import axios from 'axios'

const api = axios.create({
  baseURL: 'https://crt-cinema-donduseni.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
