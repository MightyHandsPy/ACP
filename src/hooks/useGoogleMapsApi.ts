import { useState, useEffect, useCallback } from 'react'

/**
 * Google Maps JavaScript API type declarations
 * We declare these globally so TypeScript understands the google.maps namespace.
 */

declare global {
  interface Window {
    google?: {
      maps?: {
        Map: any
        Marker: any
        Autocomplete: any
        Geocoder: any
        DirectionsService: any
        DirectionsRenderer: any
        DistanceMatrixService: any
        LatLngBounds: any
        LatLng: any
        Size: any
        SymbolPath: any
        TravelMode: any
        geometry: any
        event: any
        places: {
          Autocomplete: any
        }
      }
    }
    initGoogleMaps?: () => void
  }
}

// eslint-disable-next-line no-unused-vars
declare const google: any

export interface GoogleMapsStatus {
  loaded: boolean
  error: string | null
  apiKey: string | null
}

/**
 * Lazily loads the Google Maps JavaScript API.
 * Only loads when called, not on initial page load.
 */
export function useGoogleMapsApi(): GoogleMapsStatus {
  const [status, setStatus] = useState<GoogleMapsStatus>({
    loaded: false,
    error: null,
    apiKey: null,
  })

  const load = useCallback(() => {
    // Already loaded
    if (window.google?.maps) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
      setStatus({ loaded: true, error: null, apiKey })
      return
    }

    const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || ''

    if (!apiKey) {
      setStatus({
        loaded: false,
        error: 'NO_KEY',
        apiKey: null,
      })
      return
    }

    // Already loading
    if (document.getElementById('google-maps-script')) return

    // Set up callback
    window.initGoogleMaps = () => {
      setStatus({ loaded: true, error: null, apiKey })
    }

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps&loading=async`
    script.async = true
    script.defer = true
    script.onerror = () => {
      setStatus({
        loaded: false,
        error: 'LOAD_FAILED',
        apiKey,
      })
    }

    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return status
}

/**
 * Type definitions for Google Maps
 */
export interface LocationData {
  address: string
  latitude: number
  longitude: number
  placeId?: string
}

export interface RouteResult {
  distanceKm: number | null
  distanceText: string
}
