import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useResponsive } from '../../hooks/useResponsive'

/**
 * Lightweight 3D environment: road, ground, fog, cinematic lighting.
 * Noir Luxe — warm cinematic lighting.
 */
export function SceneEnvironment() {
  const { isMobile } = useResponsive()

  return (
    <>
      {/* Fog for atmospheric depth */}
      <fog attach="fog" args={['#0c0e12', 50, 140]} />

      {/* Ambient fill — very subtle warm */}
      <ambientLight intensity={0.12} color="#c9a24c" />

      {/* Main key light — warm directional from front-right */}
      <directionalLight
        position={[12, 18, 15]}
        intensity={2.2}
        color="#ffeedd"
        castShadow
        shadow-mapSize-width={isMobile ? 1024 : 2048}
        shadow-mapSize-height={isMobile ? 1024 : 2048}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0005}
      />

      {/* Fill light — subtle warm from left */}
      <directionalLight
        position={[-12, 6, -8]}
        intensity={0.3}
        color="#8899cc"
      />

      {/* Rim / back light — warm gold from behind for silhouette edge */}
      <pointLight position={[0, 8, -25]} intensity={1.5} color="#c9a24c" distance={60} decay={2} />

      {/* Overhead fill */}
      <hemisphereLight args={['#1a1a2e', '#0c0e12', 0.2]} />

      {/* Headlights — skip on mobile */}
      {!isMobile && (
        <>
          <spotLight
            position={[-3, 1.5, 5]}
            angle={0.3}
            penumbra={0.8}
            intensity={0.8}
            color="#ffffcc"
            distance={15}
            target-position={[0, 0, 0]}
          />
          <spotLight
            position={[3, 1.5, 5]}
            angle={0.3}
            penumbra={0.8}
            intensity={0.8}
            color="#ffffcc"
            distance={15}
            target-position={[0, 0, 0]}
          />
        </>
      )}

      <Road />

      {!isMobile && <DustParticles />}
    </>
  )
}

/**
 * Road with reflective surface and lane markings.
 */
function Road() {
  const roadRef = useRef<THREE.Mesh>(null)

  return (
    <group>
      {/* Main road surface */}
      <mesh ref={roadRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[8, 300]} />
        <meshStandardMaterial
          color="#1a1a1e"
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>

      {/* Road edge line - left */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.9, 0.001, 0]}>
        <planeGeometry args={[0.1, 300]} />
        <meshStandardMaterial color="#ffffff" opacity={0.2} transparent />
      </mesh>

      {/* Road edge line - right */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.9, 0.001, 0]}>
        <planeGeometry args={[0.1, 300]} />
        <meshStandardMaterial color="#ffffff" opacity={0.2} transparent />
      </mesh>

      {/* Road shoulder - left */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, -0.02, 0]} receiveShadow>
        <planeGeometry args={[1, 300]} />
        <meshStandardMaterial color="#14161c" roughness={0.9} />
      </mesh>

      {/* Road shoulder - right */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, -0.02, 0]} receiveShadow>
        <planeGeometry args={[1, 300]} />
        <meshStandardMaterial color="#14161c" roughness={0.9} />
      </mesh>

      <CenterLine />

      {/* Ground plane beyond road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#0a0c10" roughness={1} />
      </mesh>
    </group>
  )
}

/**
 * Dashed center line.
 */
function CenterLine() {
  const dashes = useMemo(() => {
    const items: { z: number; length: number }[] = []
    for (let z = -150; z < 150; z += 4) {
      items.push({ z, length: 2 })
    }
    return items
  }, [])

  return (
    <group position={[0, 0.005, 0]}>
      {dashes.map((dash, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, dash.z]} receiveShadow>
          <planeGeometry args={[0.15, dash.length]} />
          <meshStandardMaterial color="#ffffff" opacity={0.35} transparent />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Subtle floating dust particles.
 */
function DustParticles() {
  const count = 80
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = Math.random() * 15 + 1
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return arr
  }, [])

  const ref = useRef<THREE.Points>(null)

  useFrame((_, delta) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] += delta * 0.15
      if (pos.array[i * 3 + 1] > 16) pos.array[i * 3 + 1] = 1
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#dbb86a" transparent opacity={0.25} sizeAttenuation />
    </points>
  )
}
