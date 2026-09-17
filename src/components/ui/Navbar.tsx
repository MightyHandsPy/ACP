import { useState, useEffect } from 'react'
import { SITE } from '../../config/site'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <a href="#home" className="navbar__logo" aria-label="ACP Home">
        ACP
      </a>

      {/* Desktop nav links */}
      <ul className="navbar__links">
        {SITE.navigation.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="navbar__link">
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Hamburger button for mobile */}
      <button
        className={`navbar__hamburger ${open ? 'navbar__hamburger--open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile menu */}
      <div className={`navbar__mobile ${open ? 'navbar__mobile--open' : ''}`}>
        <ul className="navbar__mobile-links">
          {SITE.navigation.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="navbar__mobile-link"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
