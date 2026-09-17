import { useEffect, useRef, useState, useCallback } from 'react'
import Lenis from 'lenis'
import { Navbar } from './components/ui/Navbar'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Services } from './components/sections/Services'
import { Process } from './components/sections/Process'
import { WhyACP } from './components/sections/WhyACP'
import { Coverage } from './components/sections/Coverage'
import { Contact } from './components/sections/Contact'

export default function App() {
  const [loadProgress, setLoadProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const lenisRef = useRef<Lenis | null>(null)

  // Simulate loading progress (model preloading handled by R3F)
  useEffect(() => {
    let frame = 0
    const totalFrames = 60

    const tick = () => {
      frame++
      const p = Math.min(1, frame / totalFrames)
      setLoadProgress(p)

      if (p < 1) {
        requestAnimationFrame(tick)
      } else {
        setTimeout(() => setReady(true), 200)
      }
    }

    requestAnimationFrame(tick)
  }, [])

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    lenisRef.current = lenis
    // Expose for testing/debugging
    ;(window as any).__lenis = lenis

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      lenisRef.current = null
      delete (window as any).__lenis
    }
  }, [])

  // Handle anchor clicks for smooth scroll
  const handleAnchorClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const anchor = target.closest('a[href^="#"]')
    if (!anchor) return

    const href = anchor.getAttribute('href')
    if (!href || href === '#') return

    if (href === '#home') {
      e.preventDefault()
      e.stopPropagation()
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0)
      } else {
        window.scrollTo(0, 0)
      }
      return
    }

    const el = document.querySelector(href)
    if (el && lenisRef.current) {
      e.preventDefault()
      lenisRef.current.scrollTo(el as HTMLElement, { offset: 0 })
    }
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleAnchorClick, true)
    return () => document.removeEventListener('click', handleAnchorClick, true)
  }, [handleAnchorClick])

  // Reduced motion check
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <>
      <LoadingScreen progress={loadProgress} />

      {ready && (
        <>
          <Navbar />
          <main>
            <Hero />
            <About />
            <Services />
            <Process />
            <WhyACP />
            <Coverage />
            <Contact />
          </main>
        </>
      )}
    </>
  )
}
