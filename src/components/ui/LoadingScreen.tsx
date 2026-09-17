import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  progress: number // 0–1
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (progress >= 1) {
      setFading(true)
      const timer = setTimeout(() => setVisible(false), 800)
      return () => clearTimeout(timer)
    }
  }, [progress])

  if (!visible) return null

  const percent = Math.round(progress * 100)

  return (
    <div
      className={`loading-screen ${fading ? 'loading-screen--fade' : ''}`}
      role="status"
      aria-label="Loading 3D experience"
    >
      <div className="loading-screen__content">
        <h1 className="loading-screen__logo">ACP</h1>
        <p className="loading-screen__text">Preparing Your Journey...</p>
        <div className="loading-screen__bar">
          <div
            className="loading-screen__bar-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="loading-screen__percent">{percent}%</span>
      </div>
    </div>
  )
}
