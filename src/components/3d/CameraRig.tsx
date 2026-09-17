import { useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Camera keyframe format:
 * [scrollProgress, [camX, camY, camZ], [lookX, lookY, lookZ]]
 *
 * The truck sits at origin [0, 0, 0].
 * Cabin front faces +Z, cargo container extends into -Z.
 * Left side of truck = -X, right side = +X.
 *
 * SEQUENCE (reference-inspired):
 *  0%   — OPENING: Low road-level, truck far ahead
 *  0–20% — SLOW APPROACH: Cinematic dolly forward
 *  20–38% — DRAMATIC CLOSE-UP: Truck fills viewport
 *  38–45% — SHORT HOLD: Camera nearly still
 *  45–65% — CAMERA ORBIT: Front → front-side → side
 *  65–78% — CARGO VIEW: Along the side, container prominent
 *  78–90% — REAR/FOLLOWING: Behind the truck on road
 *  90–100% — PULL AWAY: Camera retreats, transition to sections
 */
type Keyframe = [number, [number, number, number], [number, number, number]]

// ─── Desktop keyframes ───────────────────────────────────────────
const DESKTOP_KEYFRAMES: Keyframe[] = [
  // 0% — OPENING: Low cinematic road-level, truck visible in distance
  [0.00, [0, 1.6, 48],     [0, 1.8, 0]],

  // 0–20% — SLOW APPROACH: Dolly forward like a tracking shot
  [0.05, [0, 1.5, 42],     [0, 1.8, 0]],
  [0.10, [0, 1.5, 36],     [0, 1.8, 0]],
  [0.15, [0, 1.5, 28],     [0, 1.8, 0]],
  [0.20, [0, 1.6, 22],     [0, 1.8, 0]],

  // 20–38% — DRAMATIC CLOSE-UP: Truck dominates the viewport
  [0.25, [0, 1.8, 17],     [0, 2.0, 0]],
  [0.30, [0, 2.0, 13],     [0, 2.2, 0]],
  [0.35, [0, 2.0, 10],     [0, 2.2, 0]],
  [0.38, [0, 2.0, 9],      [0, 2.2, 0]],

  // 38–45% — SHORT HOLD: Camera absolutely stationary
  [0.45, [0, 2.0, 9],      [0, 2.2, 0]],

  // 45–65% — CAMERA ORBIT: Sweeps around the front to the side
  [0.48, [-3, 2.1, 8.5],   [0, 2.1, -0.5]],
  [0.52, [-6, 2.3, 7],     [0, 1.9, -1]],
  [0.56, [-9, 2.4, 4],     [0, 1.7, -2]],
  [0.60, [-10.5, 2.5, 1],  [0, 1.5, -3]],
  [0.65, [-11, 2.5, -2],   [0, 1.5, -4]],

  // 65–78% — CARGO VIEW: Along the side, container fills the frame
  [0.68, [-11, 2.4, -4],   [0, 1.5, -4.5]],
  [0.72, [-10.5, 2.3, -7], [0, 1.5, -6]],
  [0.75, [-9, 2.3, -9.5],  [0, 1.5, -7]],
  [0.78, [-7, 2.5, -12],   [0, 1.5, -8]],

  // 78–90% — REAR/FOLLOWING: Behind the truck, road visible ahead
  [0.82, [-4, 3.0, -14],   [0, 1.2, -8]],
  [0.86, [-1, 3.5, -16],   [0, 1.0, -8]],
  [0.90, [0, 4.0, -16],    [0, 0.8, -4]],

  // 90–100% — PULL AWAY: Rise up, truck recedes, road opens
  [0.93, [0, 5.5, -10],    [0, 0.5, 0]],
  [0.96, [0, 8, 5],        [0, 0, 3]],
  [1.00, [0, 12, 50],      [0, 0, 0]],
]

// ─── Mobile keyframes — wider arcs, higher camera, shorter travel ─
const MOBILE_KEYFRAMES: Keyframe[] = [
  // 0% — Opening
  [0.00, [0, 2.0, 42],     [0, 1.8, 0]],

  // 0–20% — Approach
  [0.05, [0, 1.8, 37],     [0, 1.8, 0]],
  [0.10, [0, 1.8, 32],     [0, 1.8, 0]],
  [0.15, [0, 2.0, 26],     [0, 1.8, 0]],
  [0.20, [0, 2.0, 20],     [0, 1.8, 0]],

  // 20–38% — Close-up (wider to avoid phone crop)
  [0.25, [0, 2.2, 17],     [0, 2.0, 0]],
  [0.30, [0, 2.5, 14],     [0, 2.2, 0]],
  [0.35, [0, 2.5, 12.5],   [0, 2.2, 0]],
  [0.38, [0, 2.5, 12],     [0, 2.2, 0]],

  // 38–45% — Hold
  [0.45, [0, 2.5, 12],     [0, 2.2, 0]],

  // 45–65% — Orbit (wider radius)
  [0.48, [-5, 2.8, 11],    [0, 2.1, -0.5]],
  [0.52, [-8, 3.0, 8],     [0, 1.9, -1]],
  [0.56, [-11, 3.0, 5],    [0, 1.7, -2]],
  [0.60, [-13, 3.0, 2],    [0, 1.5, -3]],
  [0.65, [-14, 3.0, -2],   [0, 1.5, -4]],

  // 65–78% — Cargo view
  [0.68, [-14, 2.8, -4],   [0, 1.5, -4.5]],
  [0.72, [-13, 2.8, -7],   [0, 1.5, -6]],
  [0.75, [-11, 2.8, -10],  [0, 1.5, -7]],
  [0.78, [-9, 3.0, -13],   [0, 1.5, -8]],

  // 78–90% — Rear/following
  [0.82, [-5, 3.5, -15],   [0, 1.2, -8]],
  [0.86, [-2, 4.0, -17],   [0, 1.0, -8]],
  [0.90, [0, 5.0, -14],    [0, 0.8, -4]],

  // 90–100% — Pull away
  [0.93, [0, 7, -8],       [0, 0.5, 0]],
  [0.96, [0, 10, 8],       [0, 0, 3]],
  [1.00, [0, 13, 48],      [0, 0, 0]],
]

interface CameraRigProps {
  scrollProgress: number
  isMobile: boolean
  reducedMotion?: boolean
}

export function CameraRig({ scrollProgress, isMobile, reducedMotion = false }: CameraRigProps) {
  const { camera } = useThree()

  const targetPos = useRef(new THREE.Vector3(0, 1.6, 48))
  const targetLookAt = useRef(new THREE.Vector3(0, 1.8, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 1.8, 0))

  const keyframes = isMobile ? MOBILE_KEYFRAMES : DESKTOP_KEYFRAMES

  const interpolateKeyframes = useCallback(
    (t: number): { pos: THREE.Vector3; lookAt: THREE.Vector3 } => {
      const ct = Math.max(0, Math.min(1, t))

      // Find surrounding keyframes
      let lower = keyframes[0]
      let upper = keyframes[keyframes.length - 1]

      for (let i = 0; i < keyframes.length - 1; i++) {
        if (ct >= keyframes[i][0] && ct <= keyframes[i + 1][0]) {
          lower = keyframes[i]
          upper = keyframes[i + 1]
          break
        }
      }

      const range = upper[0] - lower[0]
      const localT = range > 0 ? (ct - lower[0]) / range : 0
      // Smoothstep for cinematic easing between keyframes
      const e = localT * localT * (3 - 2 * localT)

      return {
        pos: new THREE.Vector3(
          THREE.MathUtils.lerp(lower[1][0], upper[1][0], e),
          THREE.MathUtils.lerp(lower[1][1], upper[1][1], e),
          THREE.MathUtils.lerp(lower[1][2], upper[1][2], e),
        ),
        lookAt: new THREE.Vector3(
          THREE.MathUtils.lerp(lower[2][0], upper[2][0], e),
          THREE.MathUtils.lerp(lower[2][1], upper[2][1], e),
          THREE.MathUtils.lerp(lower[2][2], upper[2][2], e),
        ),
      }
    },
    [keyframes],
  )

  useFrame((_, delta) => {
    const { pos, lookAt } = interpolateKeyframes(scrollProgress)

    // Reduced motion: snap immediately
    if (reducedMotion) {
      camera.position.copy(pos)
      camera.lookAt(lookAt)
      return
    }

    targetPos.current.copy(pos)
    targetLookAt.current.copy(lookAt)

    // Frame-rate independent smoothing
    // 0.92 = ~8% per frame at 60fps — responsive but smooth
    const smoothing = 0.92
    const factor = 1 - Math.pow(smoothing, delta * 60)

    camera.position.lerp(targetPos.current, factor)

    currentLookAt.current.lerp(targetLookAt.current, factor)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
