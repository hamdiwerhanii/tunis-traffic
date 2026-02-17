# 🚦 Tunis Traffic — Complete App Guide

> **This guide explains every part of the app in detail, written for you to present your work confidently.**

---

## 📌 1. What Is This App?

**Tunis Traffic** is a real-time traffic monitoring web application focused on the city of **Tunis, Tunisia**. It helps drivers:
- **See live traffic** on every road (green = clear, red = jammed)
- **Search for places** in Tunis by name
- **Calculate routes** that avoid congested roads
- **Save favorite places** for quick access
- **View search history** of previously searched places
- **Know peak hours** so they can plan their trips

---

## 🏗️ 2. Project Architecture (Big Picture)

The app is a **full-stack application** with two parts:

```
┌────────────────────────────────┐     ┌───────────────────────────┐
│        FRONTEND                │     │        BACKEND            │
│   (Next.js + TypeScript)       │     │   (NestJS + TypeScript)   │
│                                │     │                           │
│   • User Interface (React)     │────▶│   • REST API              │
│   • Map (Leaflet + OSM)        │     │   • MongoDB Database      │
│   • Traffic tiles (TomTom)     │     │   • Favorites CRUD        │
│   • Routing (TomTom)           │     │   • Search History CRUD   │
│   • Search (Nominatim)         │     │                           │
│   • State (Zustand)            │     │   localhost:5000           │
│                                │     │                           │
│   localhost:3000               │     │                           │
└────────────────────────────────┘     └───────────────────────────┘
```

**Frontend** = what the user sees (map, buttons, panels)  
**Backend** = saves data in database (favorites, search history)

---

## 📂 3. Folder Structure Explained

### Frontend (`frontend/src/`)

```
frontend/src/
│
├── app/                          ← Next.js App Router
│   ├── layout.tsx                   Root layout (imports CSS, font)
│   ├── page.tsx                     Home page (renders TrafficDashboard)
│   └── globals.css                  Global styles + Leaflet overrides
│
├── api/                          ← API client layer (talks to backend)
│   ├── api.client.ts                Base HTTP client (GET, POST, DELETE)
│   ├── favorite.api.ts              Favorites API functions
│   └── search-history.api.ts        Search history API functions
│
├── lib/                          ← Utilities & configuration
│   ├── session.ts                   Anonymous session ID (localStorage)
│   ├── queryClient.ts               React Query configuration
│   ├── providers.tsx                React Query provider wrapper
│   └── utils.ts                     Helper utilities
│
├── modules/traffic/components/   ← All UI components (feature-based)
│   ├── TrafficDashboard.tsx         Main dashboard (orchestrates everything)
│   ├── TrafficMap.tsx               Map container (renders Leaflet map)
│   ├── SearchBar.tsx                Search input with autocomplete
│   ├── TrafficStatusPanel.tsx       Shows current traffic level
│   ├── DepartureHelper.tsx          Route calculator panel
│   ├── QuickPlaces.tsx              Quick access to popular places
│   ├── FavoritesPanel.tsx           Saved favorite places
│   ├── SearchHistoryPanel.tsx       Recent search history
│   └── PlaceActionBar.tsx           Actions for selected place
│
├── shared/                       ← Shared code used across the app
│   ├── components/                  Reusable UI components (Button, Input)
│   ├── constants/
│   │   └── trafficConstants.ts      Peak hours, places, traffic levels
│   ├── hooks/
│   │   ├── useLeafletMap.ts         🗺️ THE CORE HOOK (map + traffic + routing)
│   │   ├── useTrafficLevel.ts       Traffic level estimation by time
│   │   └── useSessionId.ts          Session ID hook
│   └── store/
│       └── mapStore.ts              Zustand global state
│
└── types/                        ← TypeScript type definitions
    └── trafficTypes/index.ts        TrafficLevel, MapPosition, etc.
```

### Backend (`backend/src/`)

```
backend/src/
│
├── main.ts                       ← Entry point (starts server, Swagger)
├── app.module.ts                 ← Root module (imports all modules)
│
├── favorite/                     ← Favorites feature module
│   ├── favorite.module.ts           Module registration
│   ├── favorite.controller.ts       REST endpoints (GET, POST, DELETE)
│   ├── favorite.service.ts          Business logic (CRUD operations)
│   ├── dto/create-favorite.dto.ts   Validation for incoming data
│   └── schema/favorite.schema.ts   MongoDB schema definition
│
└── search-history/               ← Search history feature module
    ├── search-history.module.ts     Module registration
    ├── search-history.controller.ts REST endpoints
    ├── search-history.service.ts    Business logic
    ├── dto/create-search-history.dto.ts  Validation
    └── schema/search-history.schema.ts   MongoDB schema
```

---

## 🔄 4. How The App Flows (Step by Step)

### Flow 1: App Opens → Traffic is Displayed

```
1. User opens http://localhost:3000
2. Next.js renders page.tsx → TrafficDashboard component
3. TrafficDashboard renders TrafficMap component
4. TrafficMap calls useLeafletMap().initMap()
5. initMap does 3 things:
   a. Creates a Leaflet map centered on Tunis (lat: 36.8065, lng: 10.1815)
   b. Loads OpenStreetMap tiles (base map — roads, buildings)
   c. Loads TomTom Traffic Flow tiles ON TOP (colored roads — real-time!)
   d. Loads TomTom Incident tiles ON TOP (accidents, closures)
6. User immediately sees the map with colored traffic roads!
```

**Where does the traffic data come from?**
- TomTom collects GPS data from millions of phones and cars worldwide
- TomTom processes it into colored tile images (updated every ~2 minutes)
- Our app loads those tile images as a transparent overlay on the map
- Green = free flow, Yellow = slow, Orange = congested, Red = jammed

### Flow 2: User Searches for a Place

```
1. User types "Tunis-Carthage Airport" in the SearchBar
2. SearchBar calls searchPlace() from useLeafletMap hook
3. searchPlace() sends HTTP request to Nominatim API:
   GET https://nominatim.openstreetmap.org/search?q=Tunis-Carthage+Airport&countrycodes=tn
4. Nominatim returns a list of matching places with lat/lng coordinates
5. SearchBar shows dropdown with results
6. User clicks a result
7. selectSearchResult() is called:
   a. Pans the map to the selected coordinates
   b. Places a marker pin on the map
   c. Updates Zustand store with selected place info
8. PlaceActionBar appears showing actions (Add to Favorites, etc.)
```

### Flow 3: User Calculates a Route (AVOIDS TRAFFIC!)

```
1. User clicks "My Location" → browser asks for GPS permission
2. locateUser() gets GPS coordinates → places marker on map
3. User selects a destination (e.g., Bardo Museum) in DepartureHelper
4. User clicks "Calculate Route"
5. calculateRoute() sends request to TomTom Routing API:
   GET https://api.tomtom.com/routing/1/calculateRoute/
       {origin}:{destination}/json
       ?traffic=true           ← uses real-time traffic
       &travelMode=car
       &routeType=fastest
       &maxAlternatives=5      ← asks for 6 routes total
6. TomTom returns 6 alternative routes, each with:
   - travelTimeInSeconds (with traffic)
   - trafficDelayInSeconds (how much delay from traffic)
   - List of GPS points forming the route path
7. Our app picks the route with the LEAST trafficDelayInSeconds
   → This is the key: we don't pick the fastest, we pick the one
      with the least traffic!
8. The route is drawn on the map as a colored polyline:
   - Green line = no traffic delay
   - Yellow line = 2-5 min delay
   - Orange line = 5-10 min delay
   - Red line = 10+ min delay
9. Result panel shows: "28 min (no traffic delay)" or "35 min (7 min delay)"
```

### Flow 4: User Saves a Favorite Place

```
1. User searches "La Marsa Beach" → selects it
2. PlaceActionBar appears with "Add to Favorites" button
3. User clicks "Add to Favorites"
4. Frontend sends POST to backend:
   POST http://localhost:5000/favorite
   Body: { name: "La Marsa Beach", lat: 36.87, lng: 10.32, sessionId: "abc-123" }
5. Backend (NestJS):
   a. Validates the data (DTO validation)
   b. Checks for duplicates (same sessionId + same coordinates)
   c. Saves to MongoDB
6. Frontend refetches favorites list using React Query
7. "La Marsa Beach" now appears in the Favorites panel
```

### Flow 5: Traffic Status Panel Updates

```
1. TrafficStatusPanel uses the useTrafficLevel() hook
2. This hook checks the CURRENT TIME on the user's device
3. It compares against Tunis peak hours:
   - Morning Rush: 07:30 - 09:00
   - Evening Rush: 16:30 - 18:30
4. Logic:
   - Weekend? → "Low Traffic" (Saturday/Sunday)
   - During peak hours? → "Heavy Traffic"
   - 30 minutes near peak? → "Medium Traffic"
   - Late night (22:00-06:00)? → "Low Traffic"
   - Any other time? → "Low Traffic"
5. The panel shows:
   - Current level (Low/Medium/Heavy) with color
   - Whether we're in peak hours or not
   - When the next peak starts
   - The peak hour schedule
   - A color legend (green/orange/red dots)
```

---

## 🗺️ 5. The Core Hook: `useLeafletMap.ts`

This is the **brain of the app**. It handles everything map-related:

| Function | What it does |
|---|---|
| `initMap()` | Creates the Leaflet map + loads OSM tiles + loads TomTom traffic tiles |
| `searchPlace(query)` | Searches for places using Nominatim API |
| `selectSearchResult(result)` | Pans map to selected place + adds marker |
| `panToPlace(lat, lng, name)` | Moves the map to specific coordinates |
| `locateUser()` | Gets user's GPS location via browser API |
| `calculateRoute(origin, dest)` | Calculates traffic-avoiding route via TomTom |
| `clearRoute()` | Removes the drawn route from the map |

---

## 🌐 6. External APIs Used (All Free)

| API | What it does | URL called | Cost |
|---|---|---|---|
| **OpenStreetMap Tiles** | Base map (roads, buildings, labels) | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | Free, no key |
| **TomTom Traffic Flow** | Real-time colored roads | `https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png` | Free (2,500/day) |
| **TomTom Incidents** | Accidents, closures, construction | `https://api.tomtom.com/traffic/map/4/tile/incidents/s3/{z}/{x}/{y}.png` | Free |
| **TomTom Routing** | Traffic-aware route calculation | `https://api.tomtom.com/routing/1/calculateRoute/...` | Free (2,500/day) |
| **Nominatim** | Search places by name (geocoding) | `https://nominatim.openstreetmap.org/search?q=...` | Free, no key |

---

## 💾 7. Backend & Database

### Tech Stack:
- **NestJS** — Node.js backend framework (TypeScript)
- **MongoDB** — NoSQL database (stores documents)
- **Mongoose** — MongoDB ORM for NestJS

### Database Collections (Tables):

**`favorites` collection:**
```json
{
  "_id": "65a1b2c3...",
  "name": "La Marsa Beach",
  "address": "La Marsa, Tunis, Tunisia",
  "lat": 36.8784,
  "lng": 10.3248,
  "sessionId": "abc-123-def-456",    ← links to browser session
  "createdAt": "2026-02-16T14:30:00Z",
  "updatedAt": "2026-02-16T14:30:00Z"
}
```

**`searchhistories` collection:**
```json
{
  "_id": "65b2c3d4...",
  "query": "bardo museum",
  "placeName": "Bardo Museum",
  "lat": 36.8094,
  "lng": 10.1342,
  "sessionId": "abc-123-def-456",
  "createdAt": "2026-02-16T15:00:00Z"
}
```

### REST API Endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/favorite?sessionId=xxx` | Get all favorites for a session |
| `POST` | `/favorite` | Add a new favorite place |
| `DELETE` | `/favorite/:id?sessionId=xxx` | Remove a favorite |
| `GET` | `/search-history?sessionId=xxx&limit=10` | Get search history |
| `POST` | `/search-history` | Record a new search |
| `DELETE` | `/search-history?sessionId=xxx` | Clear all search history |

### How Session Works (No Login Required):
- When a user visits the app for the first time, a **random UUID** is generated
- This UUID is saved in the browser's **localStorage** as `tunis_traffic_session_id`
- Every API call includes this sessionId to identify the user
- No password, no email — just a unique browser session
- If the user clears their browser data, they get a new session

---

## 🧱 8. State Management (Zustand)

The app uses **Zustand** (a lightweight state manager) to share data between components:

```
mapStore.ts contains:
├── center           → Current map center coordinates
├── zoom             → Current zoom level
├── userLocation     → User's GPS location (after clicking "My Location")
├── trafficLevel     → Current traffic level (low/medium/heavy)
├── isLocating       → Whether GPS is being fetched
├── searchQuery      → Current search text
├── selectedPlace    → Currently selected place (name, address, lat, lng)
└── selectedDestination → Selected destination for routing
```

**Why Zustand instead of props?**
- Multiple components need the same data (e.g., `selectedPlace` is used by PlaceActionBar, DepartureHelper, etc.)
- Zustand provides a global store that any component can read from
- No need to pass props through many levels of components

---

## 🎨 9. UI Components Breakdown

### `TrafficDashboard.tsx` — The Main Component
- **Role:** Orchestrates all other components
- **Contains:** Map + Header + Bottom panels
- **State it manages:** `mapHelpers` (reference to map functions)

### `TrafficMap.tsx` — Map Container
- **Role:** Renders the `<div>` where Leaflet draws the map
- **Calls:** `useLeafletMap().initMap()` inside a `useEffect`
- **Reports back:** Calls `onMapReady(helpers)` when map is initialized

### `SearchBar.tsx` — Place Search
- **Role:** Input field with dropdown autocomplete
- **Uses:** Nominatim API (via `searchPlace()`)
- **Debouncing:** Waits 300ms after user stops typing before searching

### `TrafficStatusPanel.tsx` — Traffic Level Display
- **Role:** Shows if traffic is Low/Medium/Heavy right now
- **Uses:** `useTrafficLevel()` hook
- **Shows:** Current status, peak hours schedule, traffic legend

### `DepartureHelper.tsx` — Route Calculator
- **Role:** "When Should I Leave?" panel
- **Features:** Pick destination, optional arrival time, calculate route
- **Uses:** `calculateRoute()` from `useLeafletMap` hook

### `QuickPlaces.tsx` — Quick Access Buttons
- **Role:** Predefined popular destinations (Airport, Bardo, La Marsa...)
- **Source:** `POPULAR_PLACES` constant array
- **Click action:** Pans map to that place

### `FavoritesPanel.tsx` — Saved Places
- **Role:** Shows user's saved favorite places
- **Data from:** Backend API (`GET /favorite`)
- **Features:** Expand/collapse, click to pan, remove favorites

### `SearchHistoryPanel.tsx` — Recent Searches
- **Role:** Shows previously searched places
- **Data from:** Backend API (`GET /search-history`)
- **Features:** Expand/collapse, click to pan, clear all history

### `PlaceActionBar.tsx` — Place Actions
- **Role:** Shows action buttons when a place is selected
- **Features:** Add to favorites, directions, etc.

---

## 🔑 10. Key Technical Concepts

### Why Lazy Import for Leaflet?
```typescript
const getLeaflet = async () => {
    const leaflet = await import("leaflet");
    return leaflet.default;
};
```
Leaflet accesses `window` at import time. Next.js renders on the **server** first (SSR), where `window` doesn't exist. Using `import()` dynamically loads Leaflet only in the browser.

### How TomTom Traffic Tiles Work:
- The map is divided into a grid of small square images called "tiles"
- Each tile has coordinates: `z` (zoom level), `x` (column), `y` (row)
- TomTom generates transparent PNG tiles with colored road lines
- Leaflet places these tiles ON TOP of the OpenStreetMap tiles
- Result: you see the base map with colored traffic overlay

### How Route Selection Works:
```
TomTom gives us 6 routes:
  Route 1: 25 min, 8 min traffic delay    ← lots of traffic
  Route 2: 30 min, 3 min traffic delay    ← some traffic
  Route 3: 28 min, 0 min traffic delay    ← NO traffic ✅ PICKED!
  Route 4: 35 min, 1 min traffic delay    ← almost no traffic
  Route 5: 22 min, 12 min traffic delay   ← fastest but stuck in jam
  Route 6: 32 min, 5 min traffic delay    ← moderate traffic

We pick Route 3 because it has the LEAST traffic delay (0 min),
even though Route 5 is faster (22 min vs 28 min).
```

---

## 🏃 11. How to Run the App

### Backend:
```bash
cd backend
pnpm install
# Set up .env with MONGODB_URI
pnpm run start:dev        # Starts on http://localhost:5000
```

### Frontend:
```bash
cd frontend
pnpm install
# .env.local has NEXT_PUBLIC_TOMTOM_API_KEY
pnpm run dev              # Starts on http://localhost:3000
```

### Environment Variables:

**Frontend (`.env.local`):**
```
NEXT_PUBLIC_TOMTOM_API_KEY=8dmKLuWbfriOdjLwuASu2PIhMRa7h5o1
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

**Backend (`.env`):**
```
MONGODB_URI=mongodb+srv://...
NEST_PUBLIC_FRONTEND_URL=http://localhost:3000
PORT=5000
```

---

## 📊 12. Summary Table — What Uses What

| Feature | Frontend Component | Hook/API | External Service |
|---|---|---|---|
| Map display | TrafficMap | useLeafletMap | OpenStreetMap |
| Traffic colors | TrafficMap | useLeafletMap | TomTom Flow API |
| Traffic incidents | TrafficMap | useLeafletMap | TomTom Incidents API |
| Place search | SearchBar | useLeafletMap | Nominatim |
| Route calculation | DepartureHelper | useLeafletMap | TomTom Routing API |
| Traffic level panel | TrafficStatusPanel | useTrafficLevel | None (time-based) |
| Favorites | FavoritesPanel | React Query | NestJS Backend + MongoDB |
| Search history | SearchHistoryPanel | React Query | NestJS Backend + MongoDB |
| User location | My Location button | useLeafletMap | Browser Geolocation API |
| Quick places | QuickPlaces | Constants | None (hardcoded) |

---

## 🎤 13. Presentation Script (2-3 minutes)

> "This is **Tunis Traffic**, a real-time traffic monitoring app for the city of Tunis.
>
> When you open the app, you immediately see a **live map** with colored roads. The colors come from **TomTom's real-time traffic API**, which collects GPS data from millions of devices worldwide.
> - Green roads = traffic flowing freely
> - Red roads = traffic jam
>
> Users can **search for any place** in Tunis using the search bar, powered by the **Nominatim geocoding API**.
>
> The most important feature is the **route calculator**. When a user wants to go somewhere, the app asks **TomTom for 6 alternative routes**, then automatically picks the one with the **least traffic** — not just the fastest, but the one that avoids congested roads.
>
> The app also shows a **Traffic Status panel** that tells you if it's currently peak hour in Tunis (07:30-09:00 morning, 16:30-18:30 evening).
>
> Users can **save favorite places** and view their **search history**, stored in a **MongoDB database** through a **NestJS REST API** backend.
>
> The entire stack is: **Next.js** frontend, **NestJS** backend, **MongoDB** database, with **Leaflet** for the map, **TomTom** for traffic and routing, and **Nominatim** for search. All external services are **free tier — no paid APIs**."

---

*Good luck with your presentation! 🎓🚦*
