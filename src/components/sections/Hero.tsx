import { useEffect, useState } from 'react'
import { CinematicTruckHero } from '../3d/cinematic/CinematicTruckHero'

/**
 * Hero section — now delegates entirely to CinematicTruckHero.
 * The old CameraRig and useScrollProgress code has been removed.
 * ONE authoritative camera system: CinematicCamera inside CinematicTruckHero.
 */
export function Hero() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return <CinematicTruckHero reducedMotion={reducedMotion} />
}
