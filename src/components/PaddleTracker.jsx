import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './PaddleTracker.css'

// Define the tier amounts (same as in backend)
const TIERS = [
  { cents: 10000000, label: '$100K' },
  { cents: 5000000, label: '$50K' },
  { cents: 2500000, label: '$25K' },
  { cents: 1500000, label: '$15K' },
  { cents: 1000000, label: '$10K' },
  { cents: 500000, label: '$5K' },
  { cents: 250000, label: '$2.5K' },
  { cents: 100000, label: '$1K' },
  { cents: 50000, label: '$500' },
  { cents: 25000, label: '$250' }
]

function PaddleTracker() {
  // State to store paddle numbers for each tier
  const [paddleData, setPaddleData] = useState(() => {
    const saved = localStorage.getItem('paddleTrackerData')
    if (saved) {
      return JSON.parse(saved)
    }
    
    // Initialize with empty arrays for each tier
    const initial = {}
    TIERS.forEach(tier => {
      initial[tier.cents] = Array(50).fill('') // 50 slots per tier
    })
    return initial
  })

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('paddleTrackerData', JSON.stringify(paddleData))
  }, [paddleData])

  const updatePaddleNumber = (tierCents, index, value) => {
    setPaddleData(prev => ({
      ...prev,
      [tierCents]: prev[tierCents].map((item, i) => i === index ? value : item)
    }))
  }

  const getFilledCount = (tierCents) => {
    return paddleData[tierCents]?.filter(num => num.trim() !== '').length || 0
  }

  const clearTier = (tierCents) => {
    if (window.confirm('Clear all paddle numbers for this tier?')) {
      setPaddleData(prev => ({
        ...prev,
        [tierCents]: Array(50).fill('')
      }))
    }
  }

  const clearAllData = () => {
    if (window.confirm('Clear ALL paddle tracking data? This cannot be undone.')) {
      const fresh = {}
      TIERS.forEach(tier => {
        fresh[tier.cents] = Array(50).fill('')
      })
      setPaddleData(fresh)
    }
  }

  return (
    <div className="paddle-tracker">
      <div className="paddle-tracker__header">
        <h1 className="paddle-tracker__title">Paddle Number Tracker</h1>
        <div className="paddle-tracker__nav">
          <Link to="/" className="paddle-tracker__nav-link">Main Display</Link>
          <Link to="/input" className="paddle-tracker__nav-link">Input Control</Link>
          <Link to="/overview" className="paddle-tracker__nav-link">Overview</Link>
        </div>
      </div>

      <div className="paddle-tracker__instructions">
        <p>📝 Track individual paddle numbers for each tier. This data is for record-keeping only and does not affect the main display totals.</p>
        <button 
          className="paddle-tracker__clear-all"
          onClick={clearAllData}
        >
          Clear All Data
        </button>
      </div>

      <div className="paddle-tracker__tiers">
        {TIERS.map(tier => (
          <div key={tier.cents} className="paddle-tier-tracker">
            <div className="paddle-tier-tracker__header">
              <h2 className="paddle-tier-tracker__title">{tier.label}</h2>
              <div className="paddle-tier-tracker__info">
                <span className="paddle-tier-tracker__count">
                  {getFilledCount(tier.cents)} paddle numbers entered
                </span>
                <button 
                  className="paddle-tier-tracker__clear"
                  onClick={() => clearTier(tier.cents)}
                >
                  Clear Tier
                </button>
              </div>
            </div>
            
            <div className="paddle-tier-tracker__grid">
              {paddleData[tier.cents]?.map((paddleNum, index) => (
                <input
                  key={index}
                  type="text"
                  className="paddle-tier-tracker__input"
                  value={paddleNum}
                  onChange={(e) => updatePaddleNumber(tier.cents, index, e.target.value)}
                  placeholder={`${index + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PaddleTracker
