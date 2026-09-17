# ACP Cargo Movers & Packers

A premium 3D scroll-driven website for ACP Cargo Movers & Packers, featuring a cinematic Three.js truck experience, glassmorphism design, and an interactive Google Maps location picker.

## Tech Stack

- **React 18** + **TypeScript**
- **Three.js** / **React Three Fiber** — 3D truck hero
- **GSAP ScrollTrigger** — cinematic scroll animation
- **Lenis** — smooth scroll
- **Google Maps API** — interactive location picker with autocomplete, draggable markers, and route calculation
- **Vite** — build tool

## Setup

### Prerequisites

- Node.js 18+ installed
- npm installed

### Install & Run

```bash
npm install
cp .env.example .env
# Edit .env and add your Google Maps API key
npm run dev
```

The site runs at **http://localhost:5173/**

### Google Maps API

The location picker in the quote form requires a Google Maps API key.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use an existing one)
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API
4. Create an API key at **APIs & Services → Credentials**
5. Add to `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```
6. Under **API restrictions**, allow the 4 APIs above (or set to "None" for unrestricted)

> If no API key is set, the form still works with manual text input — maps just won't render.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── 3d/
│   │   ├── cinematic/          # Cinematic hero engine
│   │   │   ├── CinematicTruckHero.tsx   # Main hero component
│   │   │   ├── CinematicCamera.tsx      # Scroll-driven camera path
│   │   │   ├── CinematicTruck.tsx       # GLB truck loader
│   │   │   ├── CinematicRoad.tsx        # 3D road environment
│   │   │   └── CinematicLighting.tsx    # Scene lighting
│   │   ├── ACPTruck.tsx        # Legacy truck component
│   │   ├── CameraRig.tsx       # Legacy camera rig
│   │   ├── Environment.tsx     # 3D environment/fog
│   │   └── TruckScene.tsx      # Legacy truck scene
│   ├── sections/
│   │   ├── About.tsx
│   │   ├── Services.tsx
│   │   ├── Process.tsx
│   │   ├── WhyACP.tsx
│   │   ├── Coverage.tsx
│   │   └── Contact.tsx         # Quote form with location picker
│   └── ui/
│       ├── Navbar.tsx
│       ├── LoadingScreen.tsx
│       ├── Button.tsx
│       ├── LocationPicker.tsx      # Google Maps autocomplete + map
│       └── CombinedRouteMap.tsx    # Route visualization
├── config/
│   └── site.ts                 # ★ All content & business info
├── hooks/
│   ├── useScrollProgress.ts
│   ├── useResponsive.ts
│   └── useGoogleMapsApi.ts
├── styles/
│   ├── global.css              # Theme, variables, layout
│   └── location-picker.css     # Map picker styles
├── App.tsx
└── main.tsx

public/
├── models/
│   └── ACP-Truck.glb           # Tata Signa cargo truck GLB
└── favicon.svg
```

## Customization

### Change Content

Edit **`src/config/site.ts`** — all text, services, navigation, and contact info lives in one file.

### Change Colors / Theme

Edit CSS variables in **`src/styles/global.css`** under `:root`.

### Change 3D Truck Model

Replace **`public/models/ACP-Truck.glb`** with your own GLB file. The model auto-loads at startup.

### Change Phone / Email / Address

Edit the `contact` section in **`src/config/site.ts`**.

## Features

- Cinematic 3D scroll-driven hero with Tata Signa cargo truck
- Camera orbit around truck (approach → close-up → side → rear → following)
- Glassmorphism dark theme with gold accents
- Playfair Display serif headlines
- Interactive Google Maps location picker (autocomplete, drag marker, reverse geocode)
- Route calculation between pickup and delivery locations
- Responsive design (desktop, tablet, mobile)
- Reduced motion support
- WebGL fallback for unsupported browsers
- Loading screen with progress
