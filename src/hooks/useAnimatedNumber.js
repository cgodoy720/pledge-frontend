import { useState, useEffect, useRef } from 'react'

export const useAnimatedNumber = (targetValue, duration = 1500) => {
  const [displayValue, setDisplayValue] = useState(targetValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef(null)
  const startValueRef = useRef(targetValue)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (targetValue === displayValue) return

    setIsAnimating(true)
    startValueRef.current = displayValue
    startTimeRef.current = null

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = startValueRef.current + 
        (targetValue - startValueRef.current) * easeOutCubic

      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(targetValue)
        setIsAnimating(false)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetValue, duration, displayValue])

  return { displayValue, isAnimating }
}
