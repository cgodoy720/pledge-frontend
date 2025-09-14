import { useState, useEffect, useRef } from 'react'

export const useAnimatedNumber = (targetValue, duration = 1000) => {
  // Ensure we always work with numbers
  const target = Number(targetValue) || 0
  
  const [displayValue, setDisplayValue] = useState(target)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef(null)
  const lastTargetRef = useRef(target)

  useEffect(() => {
    // Ensure we have a valid number
    const newTarget = Number(target)
    if (isNaN(newTarget)) return
    
    // If target hasn't actually changed, don't animate
    if (newTarget === lastTargetRef.current) return

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const startValue = Number(displayValue) || 0
    const targetDiff = newTarget - startValue
    
    // If difference is very small, just set it immediately
    if (Math.abs(targetDiff) < 1) {
      setDisplayValue(newTarget)
      lastTargetRef.current = newTarget
      return
    }

    setIsAnimating(true)
    lastTargetRef.current = newTarget
    
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Simple easing
      const easeProgress = 1 - Math.pow(1 - progress, 2)
      
      const currentValue = startValue + (targetDiff * easeProgress)
      setDisplayValue(Math.round(currentValue))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(newTarget)
        setIsAnimating(false)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [target, duration])

  return { displayValue: Number(displayValue) || 0, isAnimating }
}
