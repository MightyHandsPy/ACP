import { useRef, useEffect } from 'react'
import { SITE } from '../../config/site'

const ITEM_COLORS = [
  '#c9a24c', // gold
  '#5b9bd5', // steel blue
  '#6aaa64', // sage green
  '#c9775c', // terracotta
  '#b07cc6', // lavender
  '#5bb5c4', // teal
]

export function WhyACP() {
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
      { threshold: 0.1 },
    )

    const items = el.querySelectorAll('.why-acp__item')
    items.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="why-acp" className="why-acp" ref={sectionRef}>
      <div className="why-acp__container">
        <h2 className="section-title">Why Choose ACP</h2>
        <div className="why-acp__grid">
          {SITE.whyAcp.map((item, i) => (
            <div
              key={item.title}
              className="why-acp__item"
              style={{
                transitionDelay: `${0.1 * i}s`,
                borderLeftColor: ITEM_COLORS[i % ITEM_COLORS.length],
              }}
            >
              <div
                className="why-acp__item-marker"
                style={{ background: ITEM_COLORS[i % ITEM_COLORS.length] }}
                aria-hidden="true"
              />
              <h3 className="why-acp__item-title">{item.title}</h3>
              <p className="why-acp__item-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
