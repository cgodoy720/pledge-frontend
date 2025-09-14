import { useState, useEffect, useRef } from 'react'

export const useAnimatedNumber = (targetValue, duration = 1500) => {
  const [displayValue, setDisplayValue] = useState(targetValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef(null)
  const currentTargetRef = useRef(targetValue)
  const startValueRef = useRef(targetValue)
  const startTimeRef = useRef(null)

  useEffect(() => {
    // If target hasn't changed, don't animate
    if (targetValue === currentTargetRef.current) return

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Set up new animation
    setIsAnimating(true)
    startValueRef.current = displayValue // Start from current displayed value
    currentTargetRef.current = targetValue // Track the current target
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
        (currentTargetRef.current - startValueRef.current) * easeOutCubic

      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(currentTargetRef.current)
        setIsAnimating(false)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetValue, duration]) // Removed displayValue from dependencies

  return { displayValue, isAnimating }
}
