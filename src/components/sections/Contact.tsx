import { useRef, useEffect, useState, FormEvent, useCallback } from 'react'
import { SITE } from '../../config/site'
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi'
import type { LocationData, RouteResult } from '../../hooks/useGoogleMapsApi'
import { LocationPicker } from '../ui/LocationPicker'

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const [submitted, setSubmitted] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [movingType, setMovingType] = useState('')
  const [message, setMessage] = useState('')

  // Location data
  const [pickup, setPickup] = useState<LocationData | null>(null)
  const [delivery, setDelivery] = useState<LocationData | null>(null)
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Google Maps
  const mapsStatus = useGoogleMapsApi()
  const mapsAvailable = mapsStatus.loaded && !mapsStatus.error
  const mapsMissing = mapsStatus.error === 'NO_KEY'
  const mapsFailed = mapsStatus.error === 'LOAD_FAILED'

  // IntersectionObserver for animation
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

    const children = el.querySelectorAll('.contact__animate')
    children.forEach((child) => observer.observe(child))

    return () => observer.disconnect()
  }, [])

  // Calculate distance when both locations are set
  useEffect(() => {
    if (!pickup || !delivery || !window.google?.maps?.geometry) {
      if (pickup && delivery && !window.google?.maps?.geometry) {
        // Geometry lib not loaded — try straight-line distance
        const R = 6371
        const dLat = ((delivery.latitude - pickup.latitude) * Math.PI) / 180
        const dLng = ((delivery.longitude - pickup.longitude) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((pickup.latitude * Math.PI) / 180) *
            Math.cos((delivery.latitude * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const dist = Math.round(R * c * 10) / 10
        setRouteResult({ distanceKm: dist, distanceText: `${dist} km` })
      }
      return
    }

    // Use Google Maps Distance Matrix for driving distance
    const g = (window as any).google?.maps
    const service = new g.DistanceMatrixService()
    service.getDistanceMatrix(
      {
        origins: [{ lat: pickup.latitude, lng: pickup.longitude }],
        destinations: [{ lat: delivery.latitude, lng: delivery.longitude }],
        travelMode: g.TravelMode.DRIVING,
        region: 'in',
      },
      (response: any, status: string) => {
        if (status === 'OK' && response?.rows?.[0]?.elements?.[0]?.distance) {
          const element = response.rows[0].elements[0]
          const dist = Math.round((element.distance.value / 1000) * 10) / 10
          setRouteResult({
            distanceKm: dist,
            distanceText: element.distance.text,
          })
        } else {
          // Fallback: straight-line
          const R = 6371
          const dLat = ((delivery.latitude - pickup.latitude) * Math.PI) / 180
          const dLng = ((delivery.longitude - pickup.longitude) * Math.PI) / 180
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((pickup.latitude * Math.PI) / 180) *
              Math.cos((delivery.latitude * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const dist = Math.round(R * c * 10) / 10
          setRouteResult({ distanceKm: dist, distanceText: `~${dist} km` })
        }
      },
    )
  }, [pickup?.latitude, pickup?.longitude, delivery?.latitude, delivery?.longitude])

  // Handle location change
  const handlePickupChange = useCallback((loc: LocationData | null) => {
    setPickup(loc)
    setErrors((prev) => ({ ...prev, pickup: '' }))
  }, [])

  const handleDeliveryChange = useCallback((loc: LocationData | null) => {
    setDelivery(loc)
    setErrors((prev) => ({ ...prev, delivery: '' }))
  }, [])

  // Form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Please enter your name.'
    if (!phone.trim()) newErrors.phone = 'Please enter your phone number.'
    if (!pickup) newErrors.pickup = 'Please select your pickup location.'
    if (!delivery) newErrors.delivery = 'Please select your delivery location.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const quoteData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      pickup: {
        address: pickup!.address,
        latitude: pickup!.latitude,
        longitude: pickup!.longitude,
        placeId: pickup!.placeId,
      },
      delivery: {
        address: delivery!.address,
        latitude: delivery!.latitude,
        longitude: delivery!.longitude,
        placeId: delivery!.placeId,
      },
      distanceKm: routeResult?.distanceKm ?? null,
      movingType,
      message,
    }

    console.log('Quote request:', quoteData)
    setSubmitted(true)
  }

  return (
    <section id="contact" className="contact" ref={sectionRef}>
      <div className="contact__container">
        {/* Final CTA header */}
        <div className="contact__header contact__animate">
          <h2 className="contact__headline">{SITE.finalCta.headline}</h2>
          <p className="contact__subtext">{SITE.finalCta.text}</p>
        </div>

        <div className="contact__layout">
          {/* Quote form */}
          <form className="contact__form contact__animate" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="contact__success">
                <h3>Thank you!</h3>
                <p>We've received your quote request and will get back to you shortly.</p>
              </div>
            ) : (
              <>
                {/* Name + Phone */}
                <div className="contact__form-row">
                  <div className="contact__field">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })) }}
                      required
                      placeholder="Your full name"
                    />
                    {errors.name && <span className="contact__field-error">{errors.name}</span>}
                  </div>
                  <div className="contact__field">
                    <label htmlFor="phone">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: '' })) }}
                      required
                      placeholder="Phone number"
                    />
                    {errors.phone && <span className="contact__field-error">{errors.phone}</span>}
                  </div>
                </div>

                {/* Email */}
                <div className="contact__field">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address (optional)"
                  />
                </div>

                {/* ── PICKUP LOCATION ── */}
                <div className="contact__field contact__field--full">
                  {mapsAvailable ? (
                    <LocationPicker
                      type="pickup"
                      value={pickup}
                      onChange={handlePickupChange}
                      label="Pickup Location *"
                      placeholder="Search pickup address..."
                    />
                  ) : (
                    <div className="lp lp--fallback">
                      <label className="lp__label">
                        <span className="lp__label-dot lp__label-dot--pickup" aria-hidden="true" />
                        Pickup Location *
                      </label>
                      <div className="lp__input-row">
                        <input
                          type="text"
                          className="lp__input"
                          value={pickup?.address || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              setPickup({ address: e.target.value, latitude: 0, longitude: 0 })
                            } else {
                              setPickup(null)
                            }
                            setErrors((p) => ({ ...p, pickup: '' }))
                          }}
                          placeholder="Enter pickup address"
                        />
                      </div>
                      {errors.pickup && <span className="contact__field-error">{errors.pickup}</span>}
                    </div>
                  )}
                  {errors.pickup && mapsAvailable && (
                    <span className="contact__field-error">{errors.pickup}</span>
                  )}
                </div>

                {/* ── DELIVERY LOCATION ── */}
                <div className="contact__field contact__field--full">
                  {mapsAvailable ? (
                    <LocationPicker
                      type="delivery"
                      value={delivery}
                      onChange={handleDeliveryChange}
                      label="Delivery Location *"
                      placeholder="Search delivery address..."
                    />
                  ) : (
                    <div className="lp lp--fallback">
                      <label className="lp__label">
                        <span className="lp__label-dot lp__label-dot--delivery" aria-hidden="true" />
                        Delivery Location *
                      </label>
                      <div className="lp__input-row">
                        <input
                          type="text"
                          className="lp__input"
                          value={delivery?.address || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              setDelivery({ address: e.target.value, latitude: 0, longitude: 0 })
                            } else {
                              setDelivery(null)
                            }
                            setErrors((p) => ({ ...p, delivery: '' }))
                          }}
                          placeholder="Enter delivery address"
                        />
                      </div>
                      {errors.delivery && <span className="contact__field-error">{errors.delivery}</span>}
                    </div>
                  )}
                  {errors.delivery && mapsAvailable && (
                    <span className="contact__field-error">{errors.delivery}</span>
                  )}
                </div>

                {/* ── DISTANCE BANNER (compact, inline) ── */}
                {pickup && delivery && routeResult && (
                  <div className="contact__distance-bar">
                    <span className="contact__distance-bar-icon" aria-hidden="true">🚛</span>
                    {routeResult.distanceKm ? (
                      <span>
                        Estimated distance: <strong>{routeResult.distanceText}</strong>
                      </span>
                    ) : (
                      <span>Both locations saved</span>
                    )}
                  </div>
                )}

                {/* Moving Type */}
                <div className="contact__field">
                  <label htmlFor="movingType">Moving Type</label>
                  <select
                    id="movingType"
                    value={movingType}
                    onChange={(e) => setMovingType(e.target.value)}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="household">Household Relocation</option>
                    <option value="office">Office Relocation</option>
                    <option value="cargo">Cargo Transportation</option>
                    <option value="local">Local Moving</option>
                    <option value="long-distance">Long-Distance Moving</option>
                    <option value="storage">Warehouse & Storage</option>
                  </select>
                </div>

                {/* Message */}
                <div className="contact__field contact__field--full">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Tell us about your move..."
                  />
                </div>

                {/* Maps warning */}
                {(mapsMissing || mapsFailed) && (
                  <p className="contact__maps-warning">
                    ⚠️ Map temporarily unavailable. Please enter your pickup and delivery locations manually.
                    {!mapsMissing && ' If the issue persists, check your API key.'}
                  </p>
                )}

                <button type="submit" className="acp-btn acp-btn--primary contact__submit">
                  Request a Quote
                </button>
              </>
            )}
          </form>

          {/* Contact info */}
          <div className="contact__info contact__animate">
            <div className="contact__info-block">
              <h4>Phone</h4>
              <a href={`tel:${SITE.contact.phone.replace(/\s/g, '')}`}>{SITE.contact.phone}</a>
            </div>
            <div className="contact__info-block">
              <h4>Email</h4>
              <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a>
            </div>
            <div className="contact__info-block">
              <h4>Address</h4>
              <a href={SITE.contact.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                <p style={{ cursor: 'pointer' }}>{SITE.contact.address}</p>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__container">
          <span className="footer__brand">ACP</span>
          <span className="footer__copy">&copy; {new Date().getFullYear()} ACP Cargo Movers & Packers. All rights reserved.</span>
        </div>
      </footer>
    </section>
  )
}
