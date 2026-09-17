import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 9 KEYFRAME CINEMATIC CAMERA PATH
 *
 * The truck sits at origin [0, 0, 0].
 * Cabin front faces +Z, cargo container extends into -Z.
 *
 * Camera physically moves:
 *   FORWARD → LEFT → SIDE → REAR → FOLLOWING
 *
 * NOT a simple Z-dolly. X, Y, and Z all change.
 */

// [progress, [camX, camY, camZ], [lookX, lookY, lookZ], fov?]
type KF = [number, [number, number, number], [number, number, number], number?]

const DESKTOP_PATH: KF[] = [
  // KF01: Opening — low, offset right, truck far ahead
  [0.00, [12, 3.5, 36],   [0, 2.0, 0],   42],

  // KF02: Approaching — moving forward, still offset right
  [0.12, [8, 2.8, 26],    [0, 2.0, 0],   44],

  // KF03: Close-up — truck fills frame, truck-level height
  [0.25, [5, 2.2, 12],    [0, 2.0, 0],   46],

  // KF04: Front three-quarter — camera begins crossing
  [0.38, [7, 2.8, 6],     [0, 2.0, 0],   46],

  // KF05: Camera crosses to left side
  [0.48, [-6, 2.5, 5],    [0, 2.0, 0],   48],

  // KF06: Side/cargo view — container fills frame
  [0.58, [-10, 2.8, 1],   [0, 2.0, -1],  50],

  // KF07: Rear three-quarter — camera curves behind
  [0.70, [-7, 3.2, -8],   [0, 2.0, -2],  50],

  // KF08: Following view — behind the truck, road ahead
  // (truck has moved ~5 units forward at this point)
  [0.82, [0, 3.8, -16],   [0, 1.5, 4],   48],

  // KF09: Truck travelling away — camera low, road-level
  // (truck has moved ~9 units forward)
  [0.92, [0, 2.5, -24],   [0, 1.2, 9],   46],

  // KF10: Final pull-away / transition
  // (truck has moved 12 units forward)
  [1.00, [0, 4.0, -30],   [0, 1.0, 12],  44],
]

const MOBILE_PATH: KF[] = [
  // KF01: Opening
  [0.00, [10, 4.0, 32],   [0, 2.0, 0],   50],

  // KF02: Approaching
  [0.12, [7, 3.2, 22],    [0, 2.0, 0],   52],

  // KF03: Close-up
  [0.25, [4, 2.8, 13],    [0, 2.2, 0],   54],

  // KF04: Front three-quarter
  [0.38, [6, 3.2, 7],     [0, 2.0, 0],   54],

  // KF05: Crosses to left
  [0.48, [-7, 3.0, 6],    [0, 2.0, 0],   56],

  // KF06: Side/cargo
  [0.58, [-12, 3.2, 2],   [0, 2.0, -1],  58],

  // KF07: Rear three-quarter
  [0.70, [-8, 3.5, -8],   [0, 2.0, -2],  56],

  // KF08: Following (truck moved ~5 units)
  [0.82, [0, 4.2, -16],   [0, 1.5, 4],   54],

  // KF09: Truck travelling away (truck moved ~9 units)
  [0.92, [0, 3.0, -22],   [0, 1.2, 9],   52],

  // KF10: Transition (truck moved 12 units)
  [1.00, [0, 5.0, -28],   [0, 1.0, 12],  50],
]

interface CinematicCameraProps {
  progress: number
  isMobile: boolean
  reducedMotion?: boolean
}

function lerpKF(a: KF, b: KF, t: number): { pos: THREE.Vector3; lookAt: THREE.Vector3; fov: number } {
  const e = t * t * (3 - 2 * t) // smoothstep
  return {
    pos: new THREE.Vector3(
      THREE.MathUtils.lerp(a[1][0], b[1][0], e),
      THREE.MathUtils.lerp(a[1][1], b[1][1], e),
      THREE.MathUtils.lerp(a[1][2], b[1][2], e),
    ),
    lookAt: new THREE.Vector3(
      THREE.MathUtils.lerp(a[2][0], b[2][0], e),
      THREE.MathUtils.lerp(a[2][1], b[2][1], e),
      THREE.MathUtils.lerp(a[2][2], b[2][2], e),
    ),
    fov: THREE.MathUtils.lerp(a[3] ?? 45, b[3] ?? 45, e),
  }
}

function evaluatePath(path: KF[], t: number) {
  const ct = Math.max(0, Math.min(1, t))
  let lower = path[0]
  let upper = path[path.length - 1]

  for (let i = 0; i < path.length - 1; i++) {
    if (ct >= path[i][0] && ct <= path[i + 1][0]) {
      lower = path[i]
      upper = path[i + 1]
      break
    }
  }

  const range = upper[0] - lower[0]
  const localT = range > 0 ? (ct - lower[0]) / range : 0
  return lerpKF(lower, upper, localT)
}

export function CinematicCamera({ progress, isMobile, reducedMotion = false }: CinematicCameraProps) {
  const { camera } = useThree()
  const path = isMobile ? MOBILE_PATH : DESKTOP_PATH

  const targetPos = useRef(new THREE.Vector3(12, 3.5, 36))
  const targetLookAt = useRef(new THREE.Vector3(0, 2.0, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 2.0, 0))

  useFrame((_, delta) => {
    const { pos, lookAt, fov } = evaluatePath(path, progress)

    // Update FOV dynamically for cinematic perspective shift
    const perspCam = camera as THREE.PerspectiveCamera
    if (Math.abs(perspCam.fov - fov) > 0.1) {
      perspCam.fov = THREE.MathUtils.lerp(perspCam.fov, fov, 0.05)
      perspCam.updateProjectionMatrix()
    }

    if (reducedMotion) {
      camera.position.copy(pos)
      camera.lookAt(lookAt)
      return
    }

    targetPos.current.copy(pos)
    targetLookAt.current.copy(lookAt)

    // Frame-rate independent smoothing — responsive
    const smoothing = 0.90
    const factor = 1 - Math.pow(smoothing, delta * 60)

    camera.position.lerp(targetPos.current, factor)
    currentLookAt.current.lerp(targetLookAt.current, factor)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
