import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * Cinematic road — extends far in both directions.
 * Includes shoulders, edge lines, and center dashes.
 */
export function CinematicRoad() {
  return (
    <group>
      {/* Main road surface — dark asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[9, 400]} />
        <meshStandardMaterial color="#181818" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Road edge — left white line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.3, 0.001, 0]}>
        <planeGeometry args={[0.12, 400]} />
        <meshStandardMaterial color="#ffffff" opacity={0.2} transparent />
      </mesh>

      {/* Road edge — right white line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.3, 0.001, 0]}>
        <planeGeometry args={[0.12, 400]} />
        <meshStandardMaterial color="#ffffff" opacity={0.2} transparent />
      </mesh>

      {/* Shoulder — left */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[1.4, 400]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
      </mesh>

      {/* Shoulder — right */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[1.4, 400]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
      </mesh>

      {/* Center dashed line */}
      <CenterDashes />

      {/* Ground plane — dark, infinite feel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#0c0c10" roughness={1} />
      </mesh>
    </group>
  )
}

function CenterDashes() {
  const dashes = useMemo(() => {
    const items: number[] = []
    for (let z = -200; z < 200; z += 5) {
      items.push(z)
    }
    return items
  }, [])

  return (
    <group position={[0, 0.002, 0]}>
      {dashes.map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z]}>
          <planeGeometry args={[0.18, 2.5]} />
          <meshStandardMaterial color="#ffffff" opacity={0.35} transparent />
        </mesh>
      ))}
    </group>
  )
}
