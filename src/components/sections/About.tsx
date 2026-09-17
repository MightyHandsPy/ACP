import { useRef, useEffect } from 'react'
import { SITE } from '../../config/site'

export function About() {
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

    const children = el.querySelectorAll('.about__animate')
    children.forEach((child) => observer.observe(child))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="about" ref={sectionRef}>
      <div className="about__container">
        {/* Decorative accent bar */}
        <div className="about__accent-bar about__animate" aria-hidden="true" />
        <h2 className="about__headline about__animate">{SITE.about.headline}</h2>
        {SITE.about.paragraphs.map((p, i) => (
          <p key={i} className="about__text about__animate" style={{ transitionDelay: `${0.15 * (i + 1)}s` }}>
            {p}
          </p>
        ))}
        {/* Colored stat blocks */}
        <div className="about__stats about__animate">
          <div className="about__stat">
            <span className="about__stat-number">10+</span>
            <span className="about__stat-label">Years Experience</span>
          </div>
          <div className="about__stat about__stat--teal">
            <span className="about__stat-number">5K+</span>
            <span className="about__stat-label">Deliveries</span>
          </div>
          <div className="about__stat about__stat--amber">
            <span className="about__stat-number">100%</span>
            <span className="about__stat-label">Commitment</span>
          </div>
        </div>
      </div>
    </section>
  )
}
