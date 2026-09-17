import { useEffect, useRef, useState } from 'react'

/**
 * Returns a 0→1 progress value tied to the scroll position
 * within the hero section (the element whose id matches `targetId`).
 * Uses a scroll event listener for tighter sync with Lenis.
 */
export function useScrollProgress(targetId = 'home') {
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return

    const update = () => {
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      if (total <= 0) {
        setProgress(0)
        ticking.current = false
        return
      }
      const p = Math.min(1, Math.max(0, -rect.top / total))
      setProgress(p)
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        rafRef.current = requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    // Also run once immediately
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [targetId])

  return progress
}
