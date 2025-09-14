import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import './MainDisplay.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

function MainDisplay() {
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

  // Animated values
  const { displayValue: animatedTotal, isAnimating: totalAnimating } = useAnimatedNumber(totals.grandTotal)
  const { displayValue: animatedPercentage, isAnimating: percentageAnimating } = useAnimatedNumber(totals.goalPercentage)

  // Format the animated total for display
  const formatAnimatedCurrency = (cents) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  useEffect(() => {
    // Fetch initial totals
    const fetchTotals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/totals`)
        setTotals(response.data)
      } catch (error) {
        console.error('Error fetching totals:', error)
      }
    }

    fetchTotals()

    // Setup Socket.io connection for real-time updates
    const socket = io(API_BASE_URL)

    socket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    socket.on('totals_updated', (newTotals) => {
      console.log('Frontend received totals update:', newTotals)
      setTotals(newTotals)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="main-display">
      <div className="main-display__content">
        <div className={`main-display__amount ${totalAnimating ? 'animating' : ''}`}>
          {formatAnimatedCurrency(animatedTotal)}
        </div>
        
        <div className="main-display__progress-bar">
          <div 
            className="main-display__progress-fill"
            style={{ width: `${Math.min(animatedPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default MainDisplay
