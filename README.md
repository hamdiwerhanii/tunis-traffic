# Tunis Traffic

**A full-stack web app for checking live traffic in Tunis and planning when to leave.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)
![TomTom](https://img.shields.io/badge/TomTom-Traffic_%26_Routing-DF1B12)
![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Testing and Quality](#testing-and-quality)
- [Design Decisions and Limitations](#design-decisions-and-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Overview

Commuters in Tunis have no quick, central place to check traffic and decide when to leave. General navigation apps can do this, but they take several taps to give a simple overview of the city. **Tunis Traffic** opens straight onto a full-screen map of Tunis with live, colour-coded traffic on every road. Floating panels let you search for places, jump to your GPS position, save favourites and calculate a traffic-aware route to a popular destination.

The project is split into two apps:

- **Frontend** (`frontend/`): a single-page Next.js dashboard built on Leaflet and OpenStreetMap. It calls TomTom for traffic tiles and routing and Nominatim for place search, directly from the browser.
- **Backend** (`backend/`): a NestJS REST API with MongoDB that stores **favourite places** and **search history**. Data is grouped by an anonymous session ID, so no login is needed.

It was built as a 48-hour full-stack bootcamp project.

---

## Features

### Map and live traffic
- Full-screen Leaflet map centred on Avenue Habib Bourguiba (zoom 13), with OpenStreetMap base tiles.
- **TomTom Traffic Flow** tiles colour roads by how congested they are.
- **TomTom Traffic Incidents** tiles show accidents, roadworks and other events.
- **My Location** button that uses the browser Geolocation API to centre the map on you.

### Search and places
- Place search powered by **Nominatim** (OpenStreetMap geocoding), limited to Tunisia (`countrycodes=tn`), with up to 5 suggestions.
- **Quick places**: one-click shortcuts to 8 popular destinations, including Tunis-Carthage Airport, Bardo Museum, La Marsa, Lac de Tunis, the Medina, La Goulette, Ariana and Manouba.
- **Place action bar** for the selected place. You can save it as a favourite, and each selection is added to your search history automatically.

### Traffic-aware routing ("When should I leave?")
- Calculates a car route from your current location to one of the popular destinations, using the **TomTom Routing API** with `traffic=true`.
- Asks for up to 5 alternative routes and **picks the one with the lowest traffic delay**.
- Draws the route on the map in a colour based on the delay: green (< 2 min), yellow (2–4 min), orange (5–9 min) or red (10 min or more). The map then zooms to fit the route.
- Shows the distance, the travel time and the traffic delay.
- Optional **arrival time**: if you set one, the app works out the recommended departure time.

### Traffic status panel
- Estimates the current traffic level (Low / Moderate / Heavy) from **Tunis peak hours**:
  - Morning rush: 07:30–09:00
  - Evening rush: 16:30–18:30
  - "Moderate" in the 30 minutes before and after each peak, and "Low" on weekends and at night.
- Shows the current or next peak period and refreshes every minute.
- Note: this panel is a time-based estimate and does not use live data (see [Limitations](#design-decisions-and-limitations)).

### Favourites and search history (persisted)
- Save, list and remove favourite places. They are stored in MongoDB, and the backend rejects duplicates.
- Recent searches are listed newest first and can be cleared in one action. The backend keeps the **20 most recent entries** per session and deletes older ones automatically.
- Each browser gets an **anonymous session ID**, a UUID stored in `localStorage`. Accounts are not required.

### Backend API
- REST endpoints with request validation (`class-validator` and a global `ValidationPipe` with `whitelist`).
- Interactive **Swagger / OpenAPI** documentation at `/api`.
- A `/health` endpoint.
- CORS limited to the configured frontend URL.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend framework** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling / UI** | Tailwind CSS v4, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` icons |
| **State and data fetching** | Zustand (map state), TanStack React Query v5 (server state and caching) |
| **Map** | Leaflet 1.9 + OpenStreetMap tiles |
| **External APIs** | TomTom Traffic Flow and Incidents tiles, TomTom Routing API, Nominatim geocoding |
| **Backend** | NestJS 11, `@nestjs/config`, `@nestjs/swagger`, `class-validator` / `class-transformer` |
| **Database** | MongoDB via Mongoose 9 (`@nestjs/mongoose`) |
| **Tooling** | pnpm, ESLint 9, Prettier, Jest 30 + Supertest |

---

## Architecture

```
┌──────────────────────────────────┐        ┌──────────────────────────────┐
│            FRONTEND              │  REST  │           BACKEND            │
│     Next.js · localhost:3000     │ ─────► │    NestJS · localhost:5000   │
│                                  │        │                              │
│  • Leaflet map (OSM tiles)       │        │  • /favorite                 │
│  • Zustand map store             │        │  • /search-history           │
│  • React Query (API cache)       │        │  • /health                   │
│  • Anonymous sessionId           │        │  • Swagger UI at /api        │
└───────────────┬──────────────────┘        └──────────────┬───────────────┘
                │ direct browser calls                     │ Mongoose
                ▼                                          ▼
   TomTom (traffic tiles, routing)                      MongoDB
   Nominatim (place search)
```

The backend only stores user data. Traffic, routing and geocoding requests go straight from the browser to TomTom and Nominatim.

---

## Project Structure

```
tunis-traffic/
├── frontend/                          # Next.js app (port 3000)
│   ├── public/                        # Static assets
│   └── src/
│       ├── app/
│       │   ├── layout.tsx             # Root layout, fonts, providers
│       │   ├── page.tsx               # Home page -> TrafficDashboard
│       │   └── globals.css            # Global styles + Leaflet overrides
│       ├── api/
│       │   ├── api.client.ts          # Fetch wrapper (uses NEXT_PUBLIC_BACKEND_URL)
│       │   ├── favorite.api.ts        # Favorites endpoints
│       │   └── search-history.api.ts  # Search history endpoints
│       ├── lib/
│       │   ├── providers.tsx          # React Query provider
│       │   ├── queryClient.ts
│       │   ├── session.ts             # Anonymous sessionId in localStorage
│       │   └── utils.ts               # cn() helper
│       ├── modules/traffic/components/
│       │   ├── TrafficDashboard.tsx   # Main screen layout
│       │   ├── TrafficMap.tsx         # Leaflet map container
│       │   ├── SearchBar.tsx          # Nominatim search
│       │   ├── QuickPlaces.tsx        # Popular destinations
│       │   ├── FavoritesPanel.tsx
│       │   ├── SearchHistoryPanel.tsx
│       │   ├── PlaceActionBar.tsx     # Save favourite / auto-record history
│       │   ├── TrafficStatusPanel.tsx # Peak-hour traffic estimate
│       │   └── DepartureHelper.tsx    # "When should I leave?" routing
│       ├── shared/
│       │   ├── components/            # Button, Input
│       │   ├── constants/trafficConstants.ts  # Tunis centre, peak times, places
│       │   ├── hooks/                 # useLeafletMap, useTrafficLevel, useSessionId
│       │   └── store/mapStore.ts      # Zustand store
│       └── types/                     # Shared TypeScript types
│
├── backend/                           # NestJS API (port 5000)
│   ├── src/
│   │   ├── main.ts                    # Bootstrap, Swagger, CORS, ValidationPipe
│   │   ├── app.module.ts              # Config + MongoDB connection
│   │   ├── app.controller.ts          # GET /health
│   │   ├── favorite/                  # Controller, service, DTO, schema
│   │   └── search-history/            # Controller, service, DTO, schema
│   └── test/                          # e2e test config
│
├── APP_GUIDE.md                       # In-depth walkthrough of the codebase
├── PLAN.md                            # Planning / design document
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **pnpm** (`npm install -g pnpm`)
- **MongoDB**, either a local instance or a MongoDB Atlas connection string
- A free **TomTom developer API key** (see below)

### 1. Clone the repository

```bash
git clone https://github.com/hamdiwerhanii/tunis-traffic.git
cd tunis-traffic
```

### 2. Backend setup

```bash
cd backend
pnpm install
```

Create a `backend/.env` file. The repository does not include an example file. The backend also loads `.env.development` or `.env.production` when `NODE_ENV` matches.

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string (required) | `mongodb://localhost:27017/tunis_traffic_db` |
| `NEST_PUBLIC_FRONTEND_URL` | Origin allowed by CORS | `http://localhost:3000` |
| `PORT` | API port (defaults to `5000`) | `5000` |

```bash
pnpm run start:dev
# API:     http://localhost:5000
# Swagger: http://localhost:5000/api
```

### 3. Frontend setup

```bash
cd frontend
pnpm install
```

Create a `frontend/.env.local` file:

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Base URL of the NestJS API (defaults to `http://localhost:5000`) | `http://localhost:5000` |
| `NEXT_PUBLIC_TOMTOM_API_KEY` | TomTom key for the traffic tiles and routing | `your_tomtom_api_key` |

```bash
pnpm run dev
# App: http://localhost:3000
```

> Without `NEXT_PUBLIC_TOMTOM_API_KEY` the map still loads, but it has no traffic overlay and route calculation will fail.

### 4. Get a TomTom API key (free)

1. Sign up at [developer.tomtom.com](https://developer.tomtom.com).
2. Create an app in the dashboard and copy its API key.
3. Paste the key into `frontend/.env.local` as `NEXT_PUBLIC_TOMTOM_API_KEY`.

TomTom's free tier is enough for development and demos.

### Available scripts

| Location | Command | Description |
|---|---|---|
| `backend/` | `pnpm run start:dev` | Start the API in watch mode |
| `backend/` | `pnpm run build` / `pnpm run start:prod` | Build and run the compiled API |
| `backend/` | `pnpm run test` / `test:e2e` / `test:cov` | Unit tests, e2e tests and coverage |
| `backend/` | `pnpm run lint` / `pnpm run format` | ESLint and Prettier |
| `frontend/` | `pnpm run dev` | Start the Next.js dev server |
| `frontend/` | `pnpm run build` / `pnpm run start` | Production build and serve |
| `frontend/` | `pnpm run lint` | ESLint |

---

## API Reference

Base URL: `http://localhost:5000`. The interactive documentation is at **`/api`** (Swagger UI).
No endpoint requires authentication. Data is scoped by the anonymous `sessionId`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check that returns `{ status, timestamp }` |
| `GET` | `/favorite?sessionId=` | List a session's favourites, newest first |
| `POST` | `/favorite` | Add a favourite. Returns `400` if the place is already saved |
| `DELETE` | `/favorite/:id?sessionId=` | Remove a favourite. Returns `404` if not found |
| `GET` | `/search-history?sessionId=&limit=` | List recent searches (`limit` defaults to 10) |
| `POST` | `/search-history` | Record a search. Only the 20 most recent are kept per session |
| `DELETE` | `/search-history?sessionId=` | Clear history and return `{ deletedCount }` |

**Example: create a favourite**

```json
POST /favorite
{
  "name": "Tunis-Carthage Airport",
  "address": "Tunis Carthage International Airport, Tunisia",
  "lat": 36.851,
  "lng": 10.2272,
  "sessionId": "a1b2c3d4-uuid-session"
}
```

`POST /search-history` uses the same shape, with `query` (required) and `placeName` (optional) instead of `name` and `address`.

---

## Testing and Quality

```bash
# Backend unit tests (Jest)
cd backend
pnpm run test

# Frontend type check + production build
cd frontend
pnpm run build
```

The backend has spec files for `AppController`, `FavoriteService` and `SearchHistoryService`, plus an e2e test setup. They are mostly the generated starter tests, so coverage is minimal. The frontend has no automated tests.

---

## Design Decisions and Limitations

| Decision | Trade-off |
|---|---|
| **Anonymous sessions** instead of accounts | No sign-up is needed, but data is tied to one browser and is lost if `localStorage` is cleared |
| **TomTom free tier** | Fine for demos, but rate-limited. The API key is a `NEXT_PUBLIC_` variable and is visible in the browser |
| **Time-based traffic status panel** | Uses peak-hour rules, not live data. It is a general guide, not accurate per road |
| **Route destinations** | The departure helper only routes to the 8 built-in popular places, not to any searched place |
| **Single page** | Simple architecture, but there are no separate routes or SEO pages |

---

## Roadmap

- Replace anonymous sessions with real user accounts so favourites work across devices.
- Calculate the traffic status panel from live TomTom flow or incident data.
- Allow routing to any searched place or saved favourite.
- Move TomTom calls behind the backend so the API key is not exposed and requests can be rate-limited.
- Add Arabic and French translations.
- Expand automated tests (backend services and frontend components).
- Add deployment configuration (no hosting setup is included yet).

---

## Contributing

Contributions are welcome. Fork the repository and create a feature branch (`git checkout -b feature/my-change`). Commit your changes and open a pull request. Please run `pnpm run lint` in both apps before you submit.

---

## License

No license file is currently included; all rights reserved by the author.

---

## Author

**Hamdi Werhani**: GitHub [@hamdiwerhanii](https://github.com/hamdiwerhanii)
