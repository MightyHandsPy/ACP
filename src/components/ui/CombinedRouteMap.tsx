import { useRef, useEffect, useState } from 'react'
import type { LocationData, RouteResult } from '../../hooks/useGoogleMapsApi'

interface CombinedRouteMapProps {
  pickup: LocationData
  delivery: LocationData
  onRouteResult: (result: RouteResult) => void
}

/**
 * CombinedRouteMap — shows both P and D markers,
 * fits bounds, draws route, calculates distance.
 */
export function CombinedRouteMap({
  pickup,
  delivery,
  onRouteResult,
}: CombinedRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const pickupMarkerRef = useRef<any>(null)
  const deliveryMarkerRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)
  const [routeDrawn, setRouteDrawn] = useState(false)

  useEffect(() => {
    const g = window.google?.maps
    if (!g || !mapRef.current) return

    const pickupPos = { lat: pickup.latitude, lng: pickup.longitude }
    const deliveryPos = { lat: delivery.latitude, lng: delivery.longitude }

    // Create map
    const map = new g.Map(mapRef.current, {
      center: pickupPos,
      zoom: 8,
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

    // Pickup marker — gold
    const pickupMarker = new g.Marker({
      position: pickupPos,
      map,
      draggable: false,
      label: {
        text: 'P',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 'bold',
      },
      icon: {
        path: g.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#c8963e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    })
    pickupMarkerRef.current = pickupMarker

    // Delivery marker — blue
    const deliveryMarker = new g.Marker({
      position: deliveryPos,
      map,
      draggable: false,
      label: {
        text: 'D',
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 'bold',
      },
      icon: {
        path: g.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#5b9bd5',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    })
    deliveryMarkerRef.current = deliveryMarker

    // Fit bounds to show both markers
    const bounds = new g.LatLngBounds()
    bounds.extend(pickupPos)
    bounds.extend(deliveryPos)
    map.fitBounds(bounds, 60)

    // Draw route
    const directionsService = new g.DirectionsService()
    const directionsRenderer = new g.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#c8963e',
        strokeOpacity: 0.8,
        strokeWeight: 3,
      },
    })
    directionsRendererRef.current = directionsRenderer

    directionsService.route(
      {
        origin: pickupPos,
        destination: deliveryPos,
        travelMode: g.TravelMode.DRIVING,
        region: 'in',
      },
      (result: any, status: string) => {
        if (status === 'OK' && result?.routes?.[0]) {
          directionsRenderer.setDirections(result)
          const leg = result.routes[0].legs[0]
          onRouteResult({
            distanceKm: Math.round((leg.distance.value / 1000) * 10) / 10,
            distanceText: leg.distance.text,
          })
          setRouteDrawn(true)
        } else {
          // Route failed — still show both markers
          onRouteResult({ distanceKm: null, distanceText: '' })
          setRouteDrawn(false)
        }
      },
    )

    return () => {
      directionsRenderer.setMap(null)
    }
  // Run when pickup or delivery changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup.latitude, pickup.longitude, delivery.latitude, delivery.longitude])

  return (
    <div className="crm">
      <div className="crm__header">
        <span className="crm__legend">
          <span className="crm__dot crm__dot--pickup" aria-hidden="true" /> Pickup
        </span>
        <span className="crm__legend">
          <span className="crm__dot crm__dot--delivery" aria-hidden="true" /> Delivery
        </span>
      </div>
      <div ref={mapRef} className="crm__map" />
    </div>
  )
}
