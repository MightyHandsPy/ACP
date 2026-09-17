import { useRef, useEffect, useState, useCallback } from 'react'
import type { LocationData } from '../../hooks/useGoogleMapsApi'

interface LocationPickerProps {
  type: 'pickup' | 'delivery'
  value: LocationData | null
  onChange: (location: LocationData | null) => void
  label?: string
  placeholder?: string
}

const INDIA_BOUNDS = {
  north: 35.5,
  south: 6.5,
  east: 97.5,
  west: 68.0,
}

/**
 * LocationPicker — compact location selector.
 * Input + map toggle. Map appears inline when the user
 * clicks the map icon, and collapses once a location is confirmed.
 */
export function LocationPicker({
  type,
  value,
  onChange,
  label,
  placeholder,
}: LocationPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  const [mapOpen, setMapOpen] = useState(false)
  const [geoLocating, setGeoLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [addressText, setAddressText] = useState(value?.address || '')

  const labelColor = type === 'pickup' ? '#c8963e' : '#5b9bd5'
  const markerLabel = type === 'pickup' ? 'P' : 'D'

  // Sync when value changes externally
  useEffect(() => {
    setAddressText(value?.address || '')
  }, [value?.address])

  // Initialize Google Maps when map is opened
  useEffect(() => {
    if (!mapOpen) return

    const g = window.google?.maps
    if (!g || !mapRef.current) return

    // Prevent double-init
    if (mapInstanceRef.current) {
      // Just resize and re-center
      const map = mapInstanceRef.current
      if (value) {
        map.panTo({ lat: value.latitude, lng: value.longitude })
        map.setZoom(14)
        markerRef.current?.setPosition({ lat: value.latitude, lng: value.longitude })
      }
      g.event.trigger(map, 'resize')
      return
    }

    const mapCenter = value
      ? { lat: value.latitude, lng: value.longitude }
      : { lat: 20.5937, lng: 78.9629 }

    const map = new g.Map(mapRef.current, {
      center: mapCenter,
      zoom: value ? 14 : 5,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a1a' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a3a' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6a6a7a' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      ],
    })

    mapInstanceRef.current = map
    geocoderRef.current = new g.Geocoder()

    // Marker
    const markerColor = type === 'pickup' ? '#c8963e' : '#5b9bd5'
    const marker = new g.Marker({
      position: mapCenter,
      map,
      draggable: true,
      label: {
        text: markerLabel,
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: 'bold',
      },
      icon: {
        path: g.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: markerColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    })
    markerRef.current = marker

    if (value) {
      marker.setPosition({ lat: value.latitude, lng: value.longitude })
      map.setCenter({ lat: value.latitude, lng: value.longitude })
      map.setZoom(14)
    }

    // Drag end → reverse geocode
    g.event.addListener(marker, 'dragend', () => {
      const pos = marker.getPosition()
      if (!pos) return
      const lat = pos.lat()
      const lng = pos.lng()

      geocoderRef.current?.geocode(
        { location: { lat, lng } },
        (results: any[], status: string) => {
          if (status === 'OK' && results?.[0]) {
            setAddressText(results[0].formatted_address)
            onChange({
              address: results[0].formatted_address,
              latitude: lat,
              longitude: lng,
              placeId: results[0].place_id,
            })
          } else {
            const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
            setAddressText(fallback)
            onChange({ address: fallback, latitude: lat, longitude: lng })
          }
        },
      )
    })

    // Autocomplete on the input
    if (inputRef.current) {
      const autocomplete = new g.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'place_id'],
        componentRestrictions: { country: 'in' },
        bounds: new g.LatLngBounds(
          { lat: INDIA_BOUNDS.south, lng: INDIA_BOUNDS.west },
          { lat: INDIA_BOUNDS.north, lng: INDIA_BOUNDS.east },
        ),
        strictBounds: false,
      })

      autocompleteRef.current = autocomplete

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.geometry?.location) return

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()

        marker.setPosition({ lat, lng })
        map.panTo({ lat, lng })
        map.setZoom(14)

        const addr = place.formatted_address || ''
        setAddressText(addr)
        onChange({
          address: addr,
          latitude: lat,
          longitude: lng,
          placeId: place.place_id,
        })
      })
    }

    return () => {
      g.event.clearInstanceListeners(marker)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapOpen])

  // Use My Location
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported.')
      return
    }
    setGeoLocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const marker = markerRef.current
        const map = mapInstanceRef.current

        if (marker) marker.setPosition({ lat, lng })
        if (map) { map.panTo({ lat, lng }); map.setZoom(14) }

        if (geocoderRef.current) {
          geocoderRef.current.geocode(
            { location: { lat, lng } },
            (results: any[], status: string) => {
              setGeoLocating(false)
              if (status === 'OK' && results?.[0]) {
                setAddressText(results[0].formatted_address)
                onChange({ address: results[0].formatted_address, latitude: lat, longitude: lng, placeId: results[0].place_id })
              } else {
                const fb = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
                setAddressText(fb)
                onChange({ address: fb, latitude: lat, longitude: lng })
              }
            },
          )
        } else {
          setGeoLocating(false)
          const fb = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          setAddressText(fb)
          onChange({ address: fb, latitude: lat, longitude: lng })
        }
      },
      (error) => {
        setGeoLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission denied.')
        } else {
          setGeoError('Could not get location.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [onChange])

  // Clear
  const handleClear = useCallback(() => {
    setAddressText('')
    if (markerRef.current) markerRef.current.setPosition({ lat: 20.5937, lng: 78.9629 })
    if (mapInstanceRef.current) { mapInstanceRef.current.setCenter({ lat: 20.5937, lng: 78.9629 }); mapInstanceRef.current.setZoom(5) }
    onChange(null)
  }, [onChange])

  // Confirm on map — collapse map
  const handleConfirmMap = useCallback(() => {
    setMapOpen(false)
  }, [])

  return (
    <div className={`lp ${mapOpen ? 'lp--open' : ''}`}>
      {/* Label + confirmed address display */}
      <div className="lp__header">
        <label className="lp__label">
          <span className="lp__label-dot" style={{ backgroundColor: labelColor }} aria-hidden="true" />
          {label || (type === 'pickup' ? 'Pickup Location' : 'Delivery Location')}
        </label>
        {value && !mapOpen && (
          <span className="lp__confirmed">{value.address}</span>
        )}
      </div>

      {/* Input row */}
      <div className="lp__input-row">
        <input
          ref={inputRef}
          type="text"
          className="lp__input"
          placeholder={placeholder || `Search ${type} location...`}
          value={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          onFocus={() => {
            if (!mapOpen && window.google?.maps) setMapOpen(true)
          }}
          aria-label={label || `${type} location`}
        />
        <button
          type="button"
          className="lp__btn lp__btn--map"
          onClick={() => setMapOpen(!mapOpen)}
          aria-label={mapOpen ? 'Close map' : 'Open map'}
          title={mapOpen ? 'Close map' : 'Open map'}
        >
          {mapOpen ? '✕' : '🗺️'}
        </button>
        <button
          type="button"
          className="lp__btn lp__btn--mylocation"
          onClick={handleUseMyLocation}
          disabled={geoLocating}
          aria-label="Use my current location"
          title="Use my current location"
        >
          {geoLocating ? '⏳' : '📍'}
        </button>
        {value && (
          <button
            type="button"
            className="lp__btn lp__btn--clear"
            onClick={handleClear}
            aria-label="Clear location"
            title="Clear location"
          >
            ✕
          </button>
        )}
      </div>

      {geoError && <p className="lp__error" role="alert">{geoError}</p>}

      {/* Inline map — toggles open/closed */}
      <div className={`lp__map-wrapper ${mapOpen ? 'lp__map-wrapper--open' : ''}`}>
        <div ref={mapRef} className="lp__map" />
        <div className="lp__map-actions">
          <span className="lp__map-hint">
            Drag marker or search to set location
          </span>
          <button
            type="button"
            className="lp__btn lp__btn--confirm"
            onClick={handleConfirmMap}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
