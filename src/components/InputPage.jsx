import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import './InputPage.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

function InputPage() {
  const [pledges, setPledges] = useState([])
  const [totals, setTotals] = useState({
    grandTotal: 0,
    grandTotalFormatted: '$0',
    goalPercentage: 0
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPledges()
    fetchTotals()

    // Setup Socket.io connection for real-time updates
    const socket = io(API_BASE_URL)

    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('totals_updated', (newTotals) => {
      setTotals(newTotals)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchPledges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/paddle-pledges`)
      setPledges(response.data)
    } catch (error) {
      console.error('Error fetching pledges:', error)
    }
  }

  const fetchTotals = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/totals`)
      setTotals(response.data)
    } catch (error) {
      console.error('Error fetching totals:', error)
    }
  }

  const updatePledgeCount = async (tierCents, newCount) => {
    try {
      await axios.put(`${API_BASE_URL}/api/paddle-pledges/${tierCents}`, {
        count: newCount
      })
      // The socket will handle the real-time update
      fetchPledges() // Refresh local state
    } catch (error) {
      console.error('Error updating pledge count:', error)
      alert('Failed to update pledge count')
    }
  }

  const handleCountChange = (tierCents, newCount) => {
    const count = Math.max(0, parseInt(newCount) || 0)
    updatePledgeCount(tierCents, count)
  }

  const incrementCount = (tierCents, currentCount) => {
    updatePledgeCount(tierCents, currentCount + 1)
  }

  const decrementCount = (tierCents, currentCount) => {
    updatePledgeCount(tierCents, Math.max(0, currentCount - 1))
  }

  const resetAllData = async () => {
    if (!window.confirm('Are you sure you want to reset ALL pledge data (paddle + SMS)? This cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      await axios.delete(`${API_BASE_URL}/api/reset`)
      await fetchPledges()
      alert('All pledge data has been reset (paddle + SMS)')
    } catch (error) {
      console.error('Error resetting data:', error)
      alert('Failed to reset data')
    } finally {
      setIsLoading(false)
    }
  }

  const resetSMSData = async () => {
    if (!window.confirm('Are you sure you want to reset SMS pledge data only? This cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      await axios.delete(`${API_BASE_URL}/api/reset-sms`)
      alert('SMS pledge data has been reset')
    } catch (error) {
      console.error('Error resetting SMS data:', error)
      alert('Failed to reset SMS data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="input-page">
      <div className="input-page__header">
        <h1 className="input-page__title">Pledge Input Control</h1>
        <div className="input-page__nav">
          <Link to="/" className="input-page__nav-link">Main Display</Link>
          <Link to="/tracker" className="input-page__nav-link">Paddle Tracker</Link>
          <Link to="/overview" className="input-page__nav-link">Overview</Link>
          <div className={`input-page__status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Live' : '🔴 Disconnected'}
          </div>
        </div>
      </div>

      <div className="input-page__summary">
        <div className="input-page__total">
          <span className="input-page__total-label">Current Total:</span>
          <span className="input-page__total-value">{totals.grandTotalFormatted}</span>
        </div>
        <div className="input-page__progress">
          <span className="input-page__progress-label">Progress:</span>
          <span className="input-page__progress-value">{totals.goalPercentage.toFixed(1)}% of $1M goal</span>
        </div>
      </div>

      <div className="input-page__content">
        <div className="input-page__grid">
          {pledges.map((pledge) => (
            <div key={pledge.tier_cents} className="pledge-tier">
              <div className="pledge-tier__header">
                <h3 className="pledge-tier__amount">{pledge.tierFormatted}</h3>
                <div className="pledge-tier__total">
                  Total: {pledge.totalFormatted}
                </div>
              </div>
              
              <div className="pledge-tier__controls">
                <button 
                  className="pledge-tier__button pledge-tier__button--decrement"
                  onClick={() => decrementCount(pledge.tier_cents, pledge.count)}
                  disabled={pledge.count === 0}
                >
                  -
                </button>
                
                <input
                  type="number"
                  className="pledge-tier__input"
                  value={pledge.count}
                  onChange={(e) => handleCountChange(pledge.tier_cents, e.target.value)}
                  min="0"
                />
                
                <button 
                  className="pledge-tier__button pledge-tier__button--increment"
                  onClick={() => incrementCount(pledge.tier_cents, pledge.count)}
                >
                  +
                </button>
              </div>
              
              <div className="pledge-tier__info">
                {pledge.count} {pledge.count === 1 ? 'person' : 'people'}
              </div>
            </div>
          ))}
        </div>

        <div className="input-page__admin">
          <h3 className="input-page__admin-title">Admin Controls</h3>
          <div className="input-page__admin-buttons">
            <button 
              className="input-page__reset-button input-page__reset-button--all"
              onClick={resetAllData}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset All Data'}
            </button>
            <button 
              className="input-page__reset-button input-page__reset-button--sms"
              onClick={resetSMSData}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset SMS Only'}
            </button>
          </div>
          <div className="input-page__reset-warnings">
            <p className="input-page__reset-warning">
              ⚠️ <strong>Reset All Data:</strong> Clears both paddle counts and SMS pledges
            </p>
            <p className="input-page__reset-warning">
              ⚠️ <strong>Reset SMS Only:</strong> Clears only SMS pledges from Supabase database
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InputPage
