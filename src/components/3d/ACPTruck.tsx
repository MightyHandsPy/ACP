import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const TRUCK_PATH = `${import.meta.env.BASE_URL}models/ACP-Truck.glb`

interface ACPTruckProps {
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  visible?: boolean
}

export function ACPTruck({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  visible = true,
}: ACPTruckProps) {
  const group = useRef<THREE.Group>(null)

  const { scene } = useGLTF(TRUCK_PATH)

  // Clone scene to avoid mutating the original
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)

    // Enable shadows on all meshes
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        // Preserve PBR materials — they already exist in the GLB
      }
    })

    return clone
  }, [scene])

  // Dispose cloned scene on unmount
  // (handled by Three.js GC when the group is removed from the scene)

  return (
    <group ref={group} scale={scale} position={position} rotation={rotation} visible={visible}>
      <primitive object={clonedScene} />
    </group>
  )
}

// Pre-load the model so it's ready when the scene mounts
useGLTF.preload(TRUCK_PATH)
