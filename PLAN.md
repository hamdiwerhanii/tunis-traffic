# Tunis Traffic Quick Check — Project Plan

---

## 🧠 1. Ideation & Scope

### Problem
Commuters in Tunis have no quick, centralized way to check real-time traffic conditions and plan when to leave.

### 2-Sentence Summary
A minimal full-stack web app that shows real-time traffic in Tunis on an interactive map using TomTom's live traffic data, with street search, location detection, and a traffic-aware route calculator. Users can save favorite places and view search history to speed up daily checks.

### Main User
**Daily commuter in Tunis** — someone who drives to work/school and wants to quickly check road conditions before leaving.

### Core Workflow
Open app → See Tunis traffic map → Check current traffic level → (Optional) Search a street → (Optional) Calculate when to leave.

### Clear Outcome
The user knows the current traffic situation and the best time to depart.

---

## ✏️ 2. Design & Product Thinking

### Main User Flow
1. User opens the app
2. Sees full-screen map of Tunis with live traffic overlay (red/orange/green)
3. Sees floating traffic status panel (🟢 Low / 🟠 Medium / 🔴 Heavy + peak hour info)
4. Can search for a street → map pans to it
5. Can click "My Location" → map centers on their GPS position
6. Can use "When Should I Leave?" panel → selects destination & arrival time → gets departure recommendation
7. Saves favorite places for quick access (persisted in DB)
8. Sees recent searches (persisted in DB)

### Screens
| # | Screen | Description |
|---|--------|-------------|
| 1 | Traffic Dashboard | Full-screen map + floating panels (the only screen) |

### User Stories

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| 1 | As a commuter, I want to see real-time traffic on the Tunis map | Map loads with TomTom Traffic tiles always ON, roads show red/orange/green |
| 2 | As a commuter, I want to search for a street | Autocomplete search restricted to Tunisia, map pans to result |
| 3 | As a commuter, I want to see my current location | Clicking "My Location" button uses GPS and places a blue marker |
| 4 | As a commuter, I want to know the current traffic level | Panel shows 🟢/🟠/🔴 based on time of day + peak hour detection |
| 5 | As a commuter, I want to calculate when I should leave | I select destination + arrival time → get departure time + duration |
| 6 | As a commuter, I want to save favorite places | I can add/remove favorites, they persist across sessions |
| 7 | As a commuter, I want to see my recent searches | My last 10 searches are saved and shown for quick re-access |
| 8 | As a commuter, I want quick access to popular Tunis locations | Predefined popular places (Airport, Medina, etc.) are available |

### Data Model (MongoDB)

```
FavoritePlace {
  _id: ObjectId
  name: string (required)
  address: string (optional)
  lat: number (required)
  lng: number (required)
  sessionId: string (required)  // anonymous user identifier
  createdAt: Date
  updatedAt: Date
}

SearchHistory {
  _id: ObjectId
  query: string (required)
  placeName: string (optional)
  lat: number (required)
  lng: number (required)
  sessionId: string (required)
  createdAt: Date
}
```

> **Note:** No auth needed — we use a `sessionId` (UUID) stored in localStorage to identify returning users anonymously.

---

## 🧱 3. Technical Setup

### Stack (Matching BMT)
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS v4 + TanStack Query + Zustand |
| Backend | NestJS + TypeScript + Mongoose + Swagger |
| Database | MongoDB |
| Maps | Leaflet + OpenStreetMap (tiles) + TomTom Traffic Flow & Routing (free tier) + Nominatim (geocoding) |

### Project Structure
```
tunis-traffic/
├── frontend/          # Next.js app (port 3000)
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── api/           # API client + endpoint functions
│   │   ├── lib/           # Providers, queryClient, utils
│   │   ├── modules/
│   │   │   └── traffic/   # Main feature module
│   │   │       └── components/
│   │   ├── shared/
│   │   │   ├── components/  # Reusable UI (Button, Input)
│   │   │   ├── constants/   # Traffic constants
│   │   │   ├── hooks/       # useLeafletMap, useTrafficLevel
│   │   │   └── store/       # Zustand stores
│   │   └── types/           # Type definitions
│   └── .env.local
│
├── backend/           # NestJS app (port 5000)
│   ├── src/
│   │   ├── favorite/      # Favorite places module
│   │   │   ├── dto/
│   │   │   ├── schema/
│   │   │   ├── favorite.controller.ts
│   │   │   ├── favorite.service.ts
│   │   │   └── favorite.module.ts
│   │   ├── search-history/ # Search history module
│   │   │   ├── dto/
│   │   │   ├── schema/
│   │   │   ├── search-history.controller.ts
│   │   │   ├── search-history.service.ts
│   │   │   └── search-history.module.ts
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   └── .env
│
└── PLAN.md
```

---

## ⚙️ 4. Implementation Plan

### Phase 1 — Backend API (NestJS + MongoDB) ✅
1. ✅ Scaffold NestJS project
2. ✅ Create `FavoritePlace` schema + module + controller + service
3. ✅ Create `SearchHistory` schema + module + controller + service
4. ✅ Swagger documentation
5. ✅ CORS setup for frontend

### Phase 2 — Frontend (Next.js) ✅
1. ✅ Move existing frontend code into `frontend/` directory
2. ✅ Wire up API client to NestJS backend
3. ✅ Add favorite places UI (save/remove/list) + PlaceActionBar (Add to Favorites from search)
4. ✅ Add search history panel + auto-record searches on place selection
5. ✅ Connect everything end-to-end

### Phase 3 — Polish ✅
1. ✅ Verify full workflow works (search → auto-record → add favorite → view history)
2. ✅ Error handling (mutation error states, empty states, loading states)
3. ✅ Clean build

