import { useRef, useEffect } from 'react'
import { SITE } from '../../config/site'

const STEP_COLORS = [
  '#c9a24c', // gold
  '#5b9bd5', // steel blue
  '#6aaa64', // sage green
  '#c9775c', // terracotta
  '#b07cc6', // lavender
]

export function Process() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.15 },
    )

    const steps = el.querySelectorAll('.process__step')
    steps.forEach((step) => observer.observe(step))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="process" className="process" ref={sectionRef}>
      <div className="process__container">
        <h2 className="section-title">How ACP Works</h2>
        <div className="process__timeline">
          {SITE.process.map((item, i) => (
            <div
              key={item.step}
              className="process__step"
              style={{ transitionDelay: `${0.12 * i}s` }}
            >
              <div
                className="process__step-badge"
                style={{
                  background: `linear-gradient(135deg, ${STEP_COLORS[i % STEP_COLORS.length]}, ${STEP_COLORS[i % STEP_COLORS.length]}88)`,
                }}
              >
                <span className="process__step-number">{item.step}</span>
              </div>
              <div className="process__step-content">
                <h3 className="process__step-title" style={{ color: STEP_COLORS[i % STEP_COLORS.length] }}>
                  {item.title}
                </h3>
                <p className="process__step-desc">{item.description}</p>
              </div>
              {i < SITE.process.length - 1 && (
                <div
                  className="process__step-connector"
                  style={{
                    background: `linear-gradient(to bottom, ${STEP_COLORS[i % STEP_COLORS.length]}66, transparent)`,
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
