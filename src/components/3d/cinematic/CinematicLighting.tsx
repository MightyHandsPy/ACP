import { useResponsive } from '../../../hooks/useResponsive'

/**
 * Cinematic lighting rig.
 * Multiple lights create depth, rim definition, and atmospheric mood.
 */
export function CinematicLighting() {
  const { isMobile } = useResponsive()

  return (
    <>
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#08080e', 40, 160]} />

      {/* Ambient base — very subtle cool fill */}
      <ambientLight intensity={0.12} color="#b0c4de" />

      {/* Hemisphere — sky/ground color bleed */}
      <hemisphereLight args={['#1a1a2e', '#080808', 0.2]} />

      {/* ── KEY LIGHT: Warm directional from front-right ── */}
      <directionalLight
        position={[15, 22, 18]}
        intensity={2.2}
        color="#ffeedd"
        castShadow
        shadow-mapSize-width={isMobile ? 1024 : 2048}
        shadow-mapSize-height={isMobile ? 1024 : 2048}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
      />

      {/* ── FILL LIGHT: Cool blue from left side ── */}
      <directionalLight
        position={[-14, 8, -10]}
        intensity={0.3}
        color="#5588bb"
      />

      {/* ── RIM LIGHT: Warm orange from behind — edge definition ── */}
      <pointLight
        position={[5, 10, -28]}
        intensity={1.8}
        color="#ff8844"
        distance={60}
        decay={2}
      />

      {/* ── GROUND BOUNCE: Subtle warm uplight ── */}
      <pointLight
        position={[0, -2, 0]}
        intensity={0.15}
        color="#ffcc88"
        distance={20}
        decay={2}
      />

      {/* ── HEADLIGHT ACCENTS: Two spots on truck front ── */}
      {!isMobile && (
        <>
          <spotLight
            position={[-3, 1.8, 6]}
            angle={0.35}
            penumbra={0.8}
            intensity={0.6}
            color="#ffffcc"
            distance={18}
            target-position={[0, 1.5, 0]}
          />
          <spotLight
            position={[3, 1.8, 6]}
            angle={0.35}
            penumbra={0.8}
            intensity={0.6}
            color="#ffffcc"
            distance={18}
            target-position={[0, 1.5, 0]}
          />
        </>
      )}
    </>
  )
}
