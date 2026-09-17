import { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Preload } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CinematicCamera } from './CinematicCamera'
import { CinematicRoad } from './CinematicRoad'
import { CinematicLighting } from './CinematicLighting'
import { CinematicTruck } from './CinematicTruck'
import { useResponsive } from '../../../hooks/useResponsive'
import { SITE } from '../../../config/site'

gsap.registerPlugin(ScrollTrigger)

interface CinematicTruckHeroProps {
  reducedMotion: boolean
}

/**
 * CinematicTruckHero — the 3D hero engine.
 * Glassmorphism theme: deep gradient backdrop, glowing accents.
 */
export function CinematicTruckHero({ reducedMotion }: CinematicTruckHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [webglSupported, setWebglSupported] = useState(true)
  const { isMobile, pixelRatio } = useResponsive()

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (!gl) setWebglSupported(false)
    } catch {
      setWebglSupported(false)
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        setProgress(self.progress)
      },
    })

    return () => trigger.kill()
  }, [])

  const textOpacity = progress < 0.10 ? 1
    : progress < 0.25 ? 1 - (progress - 0.10) / 0.15
    : 0

  const canvasOpacity = progress > 0.92 ? 1 - (progress - 0.92) / 0.08 : 1
  const scrollHeight = isMobile ? '500vh' : '700vh'

  return (
    <div ref={containerRef} id="home" style={{ height: scrollHeight, position: 'relative' }}>
      {/* ── FIXED 3D CANVAS ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        opacity: canvasOpacity,
      }}>
        {webglSupported ? (
          <Canvas
            shadows
            camera={{
              fov: 42,
              near: 0.1,
              far: 300,
              position: [12, 3.5, 36],
            }}
            dpr={[1, Math.min(pixelRatio, 1.5)]}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.3,
              powerPreference: 'high-performance',
            }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          >
            <CinematicLighting />
            <CinematicRoad />
            <CinematicTruck progress={progress} />

            <ContactShadows
              position={[0, -0.01, 0]}
              opacity={isMobile ? 0.35 : 0.55}
              scale={isMobile ? 25 : 40}
              blur={isMobile ? 1.5 : 2.0}
              far={isMobile ? 8 : 12}
              color="#000000"
            />

            <CinematicCamera
              progress={progress}
              isMobile={isMobile}
              reducedMotion={reducedMotion}
            />

            <Preload all />
          </Canvas>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(145deg, #080b14 0%, #0d1025 30%, #111633 60%, #0a0e1e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: '6rem', opacity: 0.3 }}>🚛</div>
          </div>
        )}

        {/* ── HERO TEXT OVERLAY ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          pointerEvents: 'none',
          opacity: textOpacity,
          transition: 'none',
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: 700,
            padding: '0 clamp(1.25rem, 4vw, 3rem)',
          }}>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(3.5rem, 11vw, 8rem)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#c9a24c',
              lineHeight: 1,
              marginBottom: '0.5rem',
              textShadow: '0 0 60px rgba(201,162,76,0.25), 0 2px 30px rgba(0,0,0,0.5)',
            }}>
              {SITE.hero.headline}
            </h1>

            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(0.8rem, 2vw, 1.1rem)',
              fontWeight: 400,
              letterSpacing: '0.25em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '1.5rem',
            }}>
              {SITE.hero.subheadline}
            </p>

            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.3rem, 2.8vw, 2rem)',
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: '0.75rem',
              color: '#e8eaf0',
            }}>
              {SITE.hero.primaryMessage}
            </p>

            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(0.8rem, 1.1vw, 0.92rem)',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.7,
              marginBottom: '2rem',
              fontWeight: 300,
            }}>
              {SITE.hero.supportingText}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', pointerEvents: 'auto' }}>
              <a href={SITE.hero.ctaPrimary.href} className="acp-btn acp-btn--primary" onClick={(e) => { e.preventDefault(); document.querySelector(SITE.hero.ctaPrimary.href)?.scrollIntoView({ behavior: 'smooth' }) }}>
                {SITE.hero.ctaPrimary.label}
              </a>
              <a href={SITE.hero.ctaSecondary.href} className="acp-btn acp-btn--secondary" onClick={(e) => { e.preventDefault(); document.querySelector(SITE.hero.ctaSecondary.href)?.scrollIntoView({ behavior: 'smooth' }) }}>
                {SITE.hero.ctaSecondary.label}
              </a>
            </div>
          </div>
        </div>

        {/* ── SCROLL INDICATOR ── */}
        {progress < 0.06 && (
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            textAlign: 'center',
          }}>
            <span style={{
              display: 'block',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '0.5rem',
            }}>
              Scroll to explore
            </span>
            <div style={{
              width: 1,
              height: 40,
              background: 'linear-gradient(to bottom, #c9a24c, transparent)',
              margin: '0 auto',
              boxShadow: '0 0 8px rgba(201,162,76,0.25)',
            }} />
          </div>
        )}
      </div>
    </div>
  )
}
