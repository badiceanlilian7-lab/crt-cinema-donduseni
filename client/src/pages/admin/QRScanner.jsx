import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../../api/axios'
import './QRScanner.css'

function QRScanner() {
  const navigate = useNavigate()
  const scannerRef = useRef(null)
  const [html5QrCode, setHtml5QrCode] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin/login')
      return
    }

    startScanner()

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(err => console.error('Error stopping scanner:', err))
      }
    }
  }, [navigate])

  const startScanner = () => {
    const scanner = new Html5Qrcode("reader")
    setHtml5QrCode(scanner)

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    }

    scanner.start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      onScanFailure
    ).catch(err => {
      console.error('Error starting scanner:', err)
      setError('Nu s-a putut accesa camera. Verifică permisiunile.')
    })
  }

  const onScanSuccess = async (decodedText) => {
    if (!scanning) return
    
    setScanning(false)
    await validateQRCode(decodedText)
  }

  const onScanFailure = (error) => {
    // Ignore scan failures (no QR code in view)
  }

  const validateQRCode = async (code) => {
    try {
      const response = await api.post('/qr/scan', { qr_code: code })
      setScanResult(response.data)
      setError('')
    } catch (error) {
      console.error('QR validation error:', error)
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Cod QR invalid')
        setScanResult(error.response.data)
      } else {
        setError('Eroare la validare')
      }
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualCode.trim()) {
      setError('Introdu codul QR')
      return
    }
    await validateQRCode(manualCode.trim())
  }

  const handleRescan = () => {
    setScanResult(null)
    setError('')
    setManualCode('')
    setScanning(true)
  }

  const getStatusIcon = () => {
    if (!scanResult) return null
    
    if (scanResult.status === 'success') {
      return <div className="status-icon success">✅</div>
    } else if (scanResult.status === 'already_scanned') {
      return <div className="status-icon warning">⚠️</div>
    } else if (scanResult.status === 'expired') {
      return <div className="status-icon error">❌</div>
    }
    return <div className="status-icon error">❌</div>
  }

  const getStatusMessage = () => {
    if (!scanResult) return null
    
    if (scanResult.status === 'success') {
      return <div className="status-message success">Scanare reușită - Acces acordat</div>
    } else if (scanResult.status === 'already_scanned') {
      return <div className="status-message warning">Deja scanat - Codul a fost folosit anterior</div>
    } else if (scanResult.status === 'expired') {
      return <div className="status-message error">Cod expirat - Nu mai este valid</div>
    }
    return <div className="status-message error">Eroare la scanare</div>
  }

  return (
    <div className="qr-scanner">
      <header className="page-header">
        <h1>📱 Scanner QR</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          ← Înapoi la Dashboard
        </button>
      </header>

      <div className="scanner-container">
        {scanning && (
          <div className="camera-section">
            <div id="reader" className="qr-reader"></div>
            <p className="scan-instruction">Îndreaptă camera către codul QR</p>
          </div>
        )}

        <div className="manual-section">
          <h3>Sau introdu codul manual:</h3>
          <form onSubmit={handleManualSubmit} className="manual-form">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Introdu codul QR"
              className="manual-input"
            />
            <button type="submit" className="manual-submit">
              Verifică
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {scanResult && scanResult.data && (
        <div className="scan-result">
          {getStatusIcon()}
          {getStatusMessage()}
          
          <div className="participant-details">
            <h3>Detalii Participant</h3>
            <div className="detail-row">
              <span className="detail-label">Nume:</span>
              <span className="detail-value">{scanResult.data.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{scanResult.data.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Vârstă:</span>
              <span className="detail-value">{scanResult.data.age} ani</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Film:</span>
              <span className="detail-value">{scanResult.data.movie_title}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Data:</span>
              <span className="detail-value">{scanResult.data.projection_date}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Ora:</span>
              <span className="detail-value">{scanResult.data.projection_time}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Locație:</span>
              <span className="detail-value">{scanResult.data.location || 'Cinema Donduseni'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Cod QR:</span>
              <span className="detail-value qr-code">{scanResult.data.qr_code}</span>
            </div>
          </div>

          <button onClick={handleRescan} className="rescan-button">
            Scanează din nou
          </button>
        </div>
      )}
    </div>
  )
}

export default QRScanner
