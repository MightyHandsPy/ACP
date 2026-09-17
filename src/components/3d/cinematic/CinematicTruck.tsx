import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const TRUCK_PATH = '/models/ACP-Truck.glb'

interface CinematicTruckProps {
  progress: number
}

/**
 * The ACP truck — loaded from GLB.
 * Moves forward slightly during 70–100% to create
 * the impression the truck is beginning its journey.
 *
 * 0–70%: stationary
 * 70–100%: gradually moves forward along Z axis
 */
export function CinematicTruck({ progress }: CinematicTruckProps) {
  const group = useRef<THREE.Group>(null)
  const { scene } = useGLTF(TRUCK_PATH)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  // Truck movement: stationary until 70%, then moves forward
  useFrame(() => {
    if (!group.current) return
    if (progress < 0.70) {
      group.current.position.z = 0
    } else {
      // Ease in the forward movement
      const moveT = (progress - 0.70) / 0.30
      const eased = moveT * moveT // quadratic ease-in
      group.current.position.z = eased * 12 // moves 12 units forward
    }
  })

  return (
    <group ref={group} scale={1} position={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  )
}

useGLTF.preload(TRUCK_PATH)
