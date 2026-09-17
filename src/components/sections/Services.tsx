import { useRef, useEffect } from 'react'
import { SITE } from '../../config/site'

const ACCENT_COLORS = [
  'var(--color-accent)',      // gold
  '#5b9bd5',                  // steel blue
  '#c9775c',                  // terracotta
  '#6aaa64',                  // sage green
  '#b07cc6',                  // lavender
  '#d4a843',                  // amber
  '#5bb5c4',                  // teal
  '#c76b8a',                  // rose
]

export function Services() {
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )

    const cards = el.querySelectorAll('.services__card')
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="services" className="services" ref={sectionRef}>
      <div className="services__container">
        <h2 className="section-title services__animate">Our Services</h2>
        <p className="section-subtitle services__animate">
          Comprehensive moving and cargo solutions tailored to your needs.
        </p>
        <div className="services__grid">
          {SITE.services.map((service, i) => (
            <div
              key={service.title}
              className="services__card"
              style={{
                transitionDelay: `${0.08 * i}s`,
                borderTop: `2px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}`,
              }}
            >
              <div
                className="services__card-icon-badge"
                style={{ background: `${ACCENT_COLORS[i % ACCENT_COLORS.length]}15`, color: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
                aria-hidden="true"
              >
                {service.icon}
              </div>
              <h3 className="services__card-title">{service.title}</h3>
              <p className="services__card-desc">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
