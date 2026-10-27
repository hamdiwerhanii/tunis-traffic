# Tunis Traffic

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)

Check traffic in Tunis before you drive. Tunis Traffic shows a live traffic map, tells you whether it is rush hour, finds streets and places, remembers your favorite places and recent searches, and answers the question every commuter asks: **"When should I leave?"**

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Reference](#api-reference)
- [Security](#security)
- [Testing and Quality](#testing-and-quality)
- [Design Decisions and Limitations](#design-decisions-and-limitations)
- [License](#license)

## Features

### Map and live traffic
- Full-screen map of Greater Tunis (OpenStreetMap), limited to Tunisia.
- Live congestion and incidents from TomTom when the server has an API key. The key never reaches the browser: tiles are proxied by the API.

### Rush hour status
- Light, moderate or heavy traffic estimated from the usual weekday rush hours (07:30–09:00 and 16:30–18:30), always computed in **Tunis time**.
- Tells you when the next rush hour starts, and knows that weekends are quiet.

### Search and places
- Search streets and places in Tunisia with a keyboard-friendly autocomplete (arrows, Enter, Escape).
- One-tap shortcuts to popular places: the airport, the Medina, the Bardo Museum, La Marsa and more.

### "When should I leave?"
- From your location to any searched, saved or popular place.
- Optionally pick an arrival time: the app works out the departure time.
- Uses TomTom traffic-aware routing when configured, otherwise OSRM (distance and driving time without traffic). The route is drawn on the map.

### Saved places and recent searches
- Save places and find your last searches on any visit, **without an account**: each browser gets an anonymous, private session.
- Repeated searches move to the top instead of duplicating; history keeps the last 20 places.

### Works everywhere
- Desktop sidebar layout, and a phone layout with a collapsible bottom sheet so the map stays visible.
- Keyboard and screen reader friendly (labelled controls, tabs, combobox, live regions), reduced-motion support.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript 6, Tailwind CSS 4, TanStack Query 5, Zustand 5, Leaflet 1.9, lucide-react |
| Backend | NestJS 12 (native ES modules), Mongoose 9, class-validator, Swagger/OpenAPI, Helmet, @nestjs/throttler |
| Database | MongoDB |
| External services | OpenStreetMap tiles, Nominatim (search), OSRM (routing), TomTom Traffic and Routing (optional) |
| Tooling | pnpm workspace, ESLint 10, Prettier, Vitest 4, Testing Library, axe-core, Supertest, mongodb-memory-server, GitHub Actions, Dependabot |

## Architecture

```
Browser ──► Next.js (frontend, port 3000)
              │  /api/*  is proxied (same origin, first-party cookie)
              ▼
            NestJS API (backend, port 5000)
              ├── favorites, search-history ──► MongoDB
              ├── places   ──► Nominatim (cached, max 1 request/second)
              ├── routes   ──► TomTom Routing  or  OSRM
              └── traffic  ──► TomTom traffic tiles (cached, Tunisia only)
```

- **One origin for the browser.** Next.js rewrites `/api/*` to the API, so there is no CORS and the session cookie is a normal first-party cookie.
- **Anonymous sessions.** On the first request the API sets an `httpOnly`, `SameSite=Lax` cookie containing a random UUID. Every favorite and history entry is tied to it, and the browser never sends or chooses a session id itself.
- **External services stay on the server.** API keys, rate limits, caching and the Nominatim usage policy are handled in one place.

## Project Structure

```
tunis-traffic/
├── backend/                         NestJS API
│   ├── src/
│   │   ├── common/                  session cookie, validation helpers, upstream fetch, cache, geo
│   │   ├── config/                  validated environment variables
│   │   ├── favorites/               saved places (schema, DTOs, service, controller)
│   │   ├── search-history/          recent searches
│   │   ├── places/                  place search (Nominatim)
│   │   ├── routes/                  route planning (TomTom or OSRM)
│   │   ├── traffic/                 live traffic status and tiles
│   │   ├── health/                  health check
│   │   ├── app.module.ts  app.setup.ts  bootstrap.ts  main.ts  demo.ts
│   ├── scripts/verify-build.mjs     checks the compiled build loads as native ES modules
│   └── test/                        API tests (Vitest + Supertest + in-memory MongoDB)
├── frontend/                        Next.js app
│   ├── src/
│   │   ├── app/                     layout, page, global styles, icon
│   │   ├── lib/                     API client, query client, helpers
│   │   ├── modules/Traffic/         api, components, constants, hooks, store, types, utils
│   │   └── shared/                  shared components and providers
│   └── __tests__/unit/              unit, component and accessibility tests
├── .github/                         CI workflow and Dependabot
├── package.json                     workspace scripts
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js **20.19 or newer**
- pnpm 10 (`npm install -g pnpm`)
- MongoDB 6+ for normal use (not needed for the demo mode)

### 1. Install

```bash
git clone https://github.com/hamdiwerhanii/tunis-traffic.git
cd tunis-traffic
pnpm install
```

### 2. Try it instantly (demo mode)

Runs the API with a temporary in-memory MongoDB, so nothing needs to be installed or configured:

```bash
pnpm dev:demo
```

Open http://localhost:3000. API docs: http://localhost:5000/api/docs. Data is lost when you stop the server.

### 3. Run with your own MongoDB

```bash
cp backend/.env.example backend/.env       # set MONGODB_URI, optionally TOMTOM_API_KEY
cp frontend/.env.example frontend/.env.local
pnpm dev
```

### 4. Enable live traffic (optional, free)

1. Create an account at [developer.tomtom.com](https://developer.tomtom.com) and copy your API key.
2. Put it in `backend/.env` as `TOMTOM_API_KEY=...` and restart the API.

The map then shows live congestion and incidents, and trip times include traffic delays.

## Environment Variables

### backend/.env

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `MONGODB_URI` | MongoDB connection string (**required** outside demo mode) | none |
| `TOMTOM_API_KEY` | Enables live traffic tiles and traffic-aware routing | empty (off) |
| `NOMINATIM_URL` | Place search server | `https://nominatim.openstreetmap.org` |
| `OSRM_URL` | Routing server used without TomTom | `https://router.project-osrm.org` |
| `CONTACT_EMAIL` | Contact sent to Nominatim in the User-Agent, as its policy asks | empty |
| `SWAGGER_ENABLED` | Serve the API docs at `/api/docs` | `true` |
| `TRUST_PROXY` | Express `trust proxy` setting, so rate limits see the real client IP behind Next.js | `loopback` |

The API refuses to start if a variable is invalid, with a clear message.

### frontend/.env.local

| Variable | Description | Default |
| --- | --- | --- |
| `BACKEND_URL` | Where Next.js forwards `/api/*` requests | `http://localhost:5000` |

## Scripts

Run from the repository root:

| Command | What it does |
| --- | --- |
| `pnpm dev` | API (watch mode) and web app together |
| `pnpm dev:demo` | Same, with an in-memory database |
| `pnpm build` | Production build of both apps |
| `pnpm start` | Start both production builds |
| `pnpm lint` | ESLint on both apps |
| `pnpm typecheck` | TypeScript checks on both apps |
| `pnpm test` | All tests |

## API Reference

All routes are under `/api`. Interactive docs: `/api/docs` (Swagger UI), raw spec: `/api/docs-json`.

| Method | Route | Description |
| --- | --- | --- |
| GET | `/health` | API and database status |
| GET | `/favorites` | Your saved places |
| POST | `/favorites` | Save a place `{ name, address?, lat, lng }` (max 50, no duplicates) |
| DELETE | `/favorites/:id` | Remove one of your saved places |
| GET | `/search-history?limit=10` | Your recent searches (1–20) |
| POST | `/search-history` | Record a search `{ query, placeName?, lat, lng }` |
| DELETE | `/search-history` | Clear your history |
| GET | `/places?q=bardo` | Search places in Tunisia (2–100 characters) |
| GET | `/routes?fromLat&fromLng&toLat&toLng&arriveAt?` | Plan a car trip and get the departure time |
| GET | `/traffic/status` | Whether live traffic is available |
| GET | `/traffic/tiles/:layer/:z/:x/:y` | Live traffic tile (`flow` or `incidents`) |

Coordinates must be inside Tunisia. Errors use the standard NestJS format: `{ statusCode, message, error }`.

## Security

- **Private data per browser:** favorites and history are tied to an `httpOnly` cookie set by the server. Clients cannot read, choose or forge another session.
- **Strict input validation:** every body, query and URL parameter is validated and unknown fields are rejected. Coordinates are limited to Tunisia, text lengths are capped, ids are checked.
- **No secrets in the browser:** the TomTom key stays on the server; tiles and routes are proxied.
- **Rate limiting** per client IP, with tighter limits on search and routing, plus caching to respect the free tiers of external services.
- **Security headers:** Helmet on the API; Content Security Policy, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` on the web app.
- **No HTML injection:** map popups render place names as text, never as HTML.
- **0 known vulnerabilities** in dependencies (`pnpm audit`), kept up to date by Dependabot.

## Testing and Quality

```bash
pnpm test        # 44 API tests + 35 web tests
pnpm lint
pnpm typecheck
```

- **API:** Vitest and Supertest against the real NestJS app and an in-memory MongoDB. External services are mocked. Covers session isolation, validation, duplicates and limits, history ordering, caching, upstream failures, TomTom and OSRM routing, and tile rules.
- **Web:** Vitest, Testing Library and axe-core. Covers the API client, time and traffic logic, search keyboard flow, saving places, trip planning and accessibility of every panel.
- **CI:** GitHub Actions runs lint, type checks, tests, both builds and a native ES module check of the API build on every push and pull request.

## Design Decisions and Limitations

- **Rush hour status is an estimate** based on usual peak hours, not a measurement. Live congestion comes from the TomTom layer when it is enabled.
- **OSRM fallback has no traffic data**, so without a TomTom key trip times are free-flow estimates. The app says so next to the result.
- **No accounts on purpose:** anonymous sessions keep the app instant to use. Clearing cookies starts a new session.
- **Public OSRM and Nominatim servers** are fine for a demo and light use. For heavier traffic, point `OSRM_URL` and `NOMINATIM_URL` to your own instances.

## License

[MIT](LICENSE) © Hamdi Werhani. Map data © OpenStreetMap contributors. Traffic data © TomTom.

**Author:** Hamdi Werhani, GitHub [@hamdiwerhanii](https://github.com/hamdiwerhanii)
