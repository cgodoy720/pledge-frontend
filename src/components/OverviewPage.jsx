import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import './OverviewPage.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

function OverviewPage() {
  const [pledges, setPledges] = useState([])
  const [textPledges, setTextPledges] = useState([])
  const [totals, setTotals] = useState({
    grandTotal: 0,
    paddleTotal: 0,
    textTotal: 0,
    grandTotalFormatted: '$0',
    paddleTotalFormatted: '$0',
    textTotalFormatted: '$0',
    goalPercentage: 0
  })
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    fetchAllData()

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
      // Refresh text pledges when totals update (in case new text came in)
      fetchTextPledges()
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchAllData = async () => {
    await Promise.all([
      fetchPledges(),
      fetchTextPledges(),
      fetchTotals()
    ])
  }

  const fetchPledges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/paddle-pledges`)
      setPledges(response.data)
    } catch (error) {
      console.error('Error fetching pledges:', error)
    }
  }

  const fetchTextPledges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/text-pledges`)
      setTextPledges(response.data)
    } catch (error) {
      console.error('Error fetching text pledges:', error)
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatPhone = (phone) => {
    if (!phone) return 'Unknown'
    // Format phone number as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className="overview-page">
      <div className="overview-page__header">
        <h1 className="overview-page__title">Pledge Overview</h1>
        <div className="overview-page__nav">
          <Link to="/" className="overview-page__nav-link">Main Display</Link>
          <Link to="/input" className="overview-page__nav-link">Input Control</Link>
          <div className={`overview-page__status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Live' : '🔴 Disconnected'}
          </div>
        </div>
      </div>

      <div className="overview-page__summary">
        <div className="overview-summary">
          <div className="overview-summary__item overview-summary__item--total">
            <h3>Total Raised</h3>
            <div className="overview-summary__value">{totals.grandTotalFormatted}</div>
            <div className="overview-summary__progress">{totals.goalPercentage.toFixed(1)}% of $1M goal</div>
          </div>
          <div className="overview-summary__item overview-summary__item--paddle">
            <h3>Paddle Pledges</h3>
            <div className="overview-summary__value">{totals.paddleTotalFormatted}</div>
            <div className="overview-summary__count">{pledges.reduce((sum, p) => sum + p.count, 0)} people</div>
          </div>
          <div className="overview-summary__item overview-summary__item--text">
            <h3>Text Pledges</h3>
            <div className="overview-summary__value">{totals.textTotalFormatted}</div>
            <div className="overview-summary__count">{textPledges.length} texts</div>
          </div>
        </div>
      </div>

      <div className="overview-page__content">
        <div className="overview-section">
          <h2 className="overview-section__title">Paddle Pledge Breakdown</h2>
          <div className="paddle-breakdown">
            {pledges.map((pledge) => (
              <div key={pledge.tier_cents} className="paddle-breakdown__item">
                <div className="paddle-breakdown__tier">{pledge.tierFormatted}</div>
                <div className="paddle-breakdown__count">{pledge.count} people</div>
                <div className="paddle-breakdown__total">{pledge.totalFormatted}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="overview-section">
          <h2 className="overview-section__title">Recent Text Pledges</h2>
          <div className="text-pledges">
            {textPledges.length === 0 ? (
              <div className="text-pledges__empty">
                No text pledges yet. They will appear here when SimpleTexting integration is active.
              </div>
            ) : (
              <div className="text-pledges__list">
                {textPledges.map((pledge) => (
                  <div key={pledge.id} className="text-pledge">
                    <div className="text-pledge__amount">{pledge.amountFormatted}</div>
                    <div className="text-pledge__details">
                      <div className="text-pledge__name">{pledge.guest_name || 'Unknown'}</div>
                      <div className="text-pledge__phone">{formatPhone(pledge.phone_number)}</div>
                      <div className="text-pledge__time">{formatDate(pledge.created_at)}</div>
                    </div>
                    {pledge.message && (
                      <div className="text-pledge__message">"{pledge.message}"</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewPage
