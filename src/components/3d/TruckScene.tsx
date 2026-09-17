import { Suspense, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Preload } from '@react-three/drei'
import * as THREE from 'three'
import { ACPTruck } from './ACPTruck'
import { SceneEnvironment } from './Environment'
import { CameraRig } from './CameraRig'
import { useResponsive } from '../../hooks/useResponsive'

interface TruckSceneProps {
  scrollProgress: number
  reducedMotion?: boolean
}

export function TruckScene({ scrollProgress, reducedMotion = false }: TruckSceneProps) {
  const { isMobile, isTablet, pixelRatio } = useResponsive()

  // Truck scale adjusted for mobile
  const truckScale = isMobile ? 0.85 : 1

  return (
    <Canvas
      shadows
      camera={{ fov: isMobile ? 50 : 45, near: 0.1, far: 200, position: [0, 4, 35] }}
      dpr={[1, Math.min(pixelRatio, 2)]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <SceneEnvironment />

        {/* The hero truck */}
        <ACPTruck
          scale={truckScale}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
        />

        {/* Contact shadows for grounding — lighter on mobile */}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={isMobile ? 0.4 : 0.6}
          scale={isMobile ? 20 : 30}
          blur={isMobile ? 1.5 : 2.5}
          far={isMobile ? 8 : 10}
          color="#000000"
        />

        {/* Scroll-driven camera */}
        <CameraRig scrollProgress={scrollProgress} isMobile={isMobile} reducedMotion={reducedMotion} />

        <Preload all />
      </Suspense>
    </Canvas>
  )
}
