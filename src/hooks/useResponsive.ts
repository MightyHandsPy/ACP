import { useEffect, useState } from 'react'

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  pixelRatio: number
  width: number
  height: number
}

const breakpoints = { mobile: 768, tablet: 1024 }

function getInitialState(): ResponsiveState {
  if (typeof window === 'undefined') {
    return { isMobile: false, isTablet: false, isDesktop: true, pixelRatio: 2, width: 1920, height: 1080 }
  }
  const w = window.innerWidth
  const h = window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  return {
    isMobile: w < breakpoints.mobile,
    isTablet: w >= breakpoints.mobile && w < breakpoints.tablet,
    isDesktop: w >= breakpoints.tablet,
    pixelRatio: dpr,
    width: w,
    height: h,
  }
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState(getInitialState)

  useEffect(() => {
    const onResize = () => setState(getInitialState())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return state
}
