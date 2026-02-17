# 🚦 Tunis Traffic — Real-Time Traffic Monitoring for Tunis

A full-stack web application that shows **real-time traffic conditions** in Tunis, Tunisia. Drivers can see live traffic colors on every road, search for places, calculate routes that avoid congestion, and save favorite destinations.

## 📌 Problem Statement

Commuters in Tunis have **no quick, centralized way** to check real-time traffic conditions and plan when to leave. Existing navigation apps (Google Maps, Waze) require multiple clicks to get a simple traffic overview. This app provides an **instant traffic snapshot** the moment you open it — no setup needed.

## 🎯 Core Features

- **Real-time traffic overlay** — TomTom live traffic tiles show colored roads (green/yellow/orange/red) on every road
- **Traffic-aware routing** — Calculates routes that avoid congestion (requests 6 alternatives, picks least traffic)
- **Place search** — Search any street or place in Tunisia using Nominatim geocoding
- **GPS location** — Detect user's current position with one click
- **Traffic status panel** — Shows current traffic level based on Tunis peak hours
- **Favorites** — Save frequently visited places (persisted in MongoDB)
- **Search history** — Recent searches saved for quick re-access

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 · TypeScript · Tailwind CSS v4 · React Query · Zustand |
| **Backend** | NestJS · TypeScript · Mongoose · Swagger |
| **Database** | MongoDB |
| **Map** | Leaflet + OpenStreetMap |
| **Traffic** | TomTom Traffic Flow API (free tier) |
| **Routing** | TomTom Routing API (free tier, traffic-aware) |
| **Search** | Nominatim (OpenStreetMap geocoding) |

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+
- pnpm
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone the project
```bash
git clone <your-repo-url>
cd tunis-traffic
```

### 2. Backend Setup
```bash
cd backend
pnpm install

# Configure environment
cp .env.example .env
# Edit .env and set:
#   MONGODB_URI=mongodb://localhost:27017/tunis_traffic_db
#   NEST_PUBLIC_FRONTEND_URL=http://localhost:3000
#   PORT=5000

pnpm run start:dev
# Backend runs on http://localhost:5000
# Swagger docs at http://localhost:5000/api
```

### 3. Frontend Setup
```bash
cd frontend
pnpm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and set:
#   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
#   NEXT_PUBLIC_TOMTOM_API_KEY=<your-tomtom-key>

pnpm run dev
# Frontend runs on http://localhost:3000
```

### 4. Get a TomTom API Key (Free)
1. Go to [https://developer.tomtom.com](https://developer.tomtom.com)
2. Create a free account
3. Create a new app → copy the API key
4. Paste it in `frontend/.env.local` as `NEXT_PUBLIC_TOMTOM_API_KEY`

> Free tier includes 2,500 requests/day — more than enough for development and demos.

## 📂 Project Structure

```
tunis-traffic/
├── frontend/                 # Next.js app (port 3000)
│   ├── src/
│   │   ├── app/              # Next.js App Router (page, layout, CSS)
│   │   ├── api/              # API client for backend communication
│   │   ├── lib/              # Providers, session, utilities
│   │   ├── modules/traffic/  # Traffic feature components
│   │   ├── shared/           # Hooks, store, constants, UI components
│   │   └── types/            # TypeScript type definitions
│   └── .env.local
│
├── backend/                  # NestJS app (port 5000)
│   ├── src/
│   │   ├── favorite/         # Favorites CRUD module
│   │   ├── search-history/   # Search history CRUD module
│   │   └── main.ts           # Entry point + Swagger
│   └── .env
│
├── PLAN.md                   # Project planning document
└── README.md                 # This file
```

## 🔄 Core User Workflow

```
Open app → See live traffic on map → Search a destination → Calculate route (avoids traffic)
                                                          → Save to favorites
                                                          → Check traffic status panel
```

## ⚖️ Trade-offs & Limitations

| Decision | Trade-off |
|---|---|
| **TomTom free tier** | Limited to 2,500 requests/day; sufficient for demo but not production scale |
| **No user authentication** | Used anonymous sessionId (localStorage UUID) — simple but data is lost if browser is cleared |
| **Time-based traffic panel** | The traffic status panel uses peak-hour estimation, not live TomTom data — it's a general guide, not per-road accuracy |
| **Single-page app** | Only one page (dashboard) — simpler architecture but less SEO-friendly |
| **No caching** | Traffic tiles are fetched fresh each time — browser caching handles most of this naturally |

## 🔮 What I Would Improve Next

1. **User authentication** — Replace anonymous sessions with real accounts so favorites persist across devices
2. **Real-time traffic status** — Use TomTom's Traffic Incidents API data to calculate actual citywide congestion level instead of time-based estimation
3. **Push notifications** — Alert users when their usual route has abnormal congestion
4. **Multi-language support** — Add Arabic and French for Tunisian users
5. **Mobile app** — Convert to React Native for a native mobile experience
6. **Route history** — Save calculated routes and compare travel times over time
7. **Production deployment** — Use a CDN for static assets and implement rate limiting on the backend

## 🧪 Testing

```bash
# Run backend tests
cd backend
pnpm run test

# Run frontend build check
cd frontend
pnpm run build
```

## 📄 API Documentation

When the backend is running, visit **http://localhost:5000/api** for the interactive Swagger documentation.

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/favorite?sessionId=xxx` | Get all favorites |
| `POST` | `/favorite` | Add a favorite place |
| `DELETE` | `/favorite/:id?sessionId=xxx` | Remove a favorite |
| `GET` | `/search-history?sessionId=xxx` | Get search history |
| `POST` | `/search-history` | Record a search |
| `DELETE` | `/search-history?sessionId=xxx` | Clear all history |

---

*Built during a 48-hour Full-Stack Bootcamp 🚀*
