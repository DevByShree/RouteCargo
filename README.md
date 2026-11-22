# RouteCargo

RouteCargo is a customer and driver transport marketplace. Customers can submit shipments and parcels, find published truck capacity, request bookings, and follow shipment status. Drivers can manage their profile and vehicles, publish capacity, and process assigned bookings.

The repository contains a React frontend and an Express/MongoDB backend. This README describes code found in the repository; features present in source have not all been verified against a live production database or physical GPS device.

## Features in the repository

- Customer and driver accounts with access and refresh session handling.
- Driver profiles, vehicle records and document/photo uploads.
- Customer shipments and parcel requests.
- Driver-published route capacity and customer truck search.
- Booking requests, driver decisions, cancellation, and status changes.
- Persistent notifications delivered through Socket.IO.
- Shipment tracking page with Leaflet maps, road-route lookup, browser GPS publication by the driver, and customer live updates.
- Customer and driver profiles.

Not implemented as backend features: admin portal, payment processing/records, and saved-address synchronization. Check the PRD and architecture docs for scope and limitations.

## Technology

| Area | Stack |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4, Axios, Leaflet, React-Leaflet, Socket.IO client |
| Backend | Node.js, Express 5, Mongoose 9, MongoDB, JWT, bcryptjs, Socket.IO |
| Uploads | Multer and backend-managed uploaded files |

## Repository layout

~~~text
backend/
  server.js
  src/
    config/ controllers/ middleware/ models/ routes/
  scripts/
  .env.example
frontend/
  src/
    API/ Layout/ Pages/
  .env.example
docs/
  PRD.md
  architecture.md
  SystemDesign.md
AGENTS.md
context.md
requirement.txt
~~~

The API code uses routes, controllers, middleware, and Mongoose models. A separate domain service layer is not present.

## Prerequisites

- Node.js compatible with Vite 8 and the installed dependencies.
- npm.
- MongoDB reachable using a connection string. Booking flows use database transactions, so use a MongoDB replica set or transaction-capable deployment.
- A modern browser. Driver GPS requires permission and a secure browser origin (normally HTTPS outside localhost).

## Install

Install each application independently:

~~~bash
cd backend
npm ci
~~~

In a second terminal:

~~~bash
cd frontend
npm ci
~~~

## Configure environment

Copy backend/.env.example to backend/.env, then set deployment-specific values. Never commit credentials or paste real secrets into documentation.

~~~dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/routecargo
DEFAULT_PHONE_COUNTRY_CODE=91
JWT_SECRET=<random-secret-at-least-32-bytes>
CLIENT_ORIGINS=http://localhost:5173
REFRESH_TOKEN_DAYS=30
COOKIE_SAME_SITE=lax
~~~

CLIENT_URL is also accepted by backend code as a fallback if CLIENT_ORIGINS is unset. Use a transaction-capable MongoDB deployment for booking operations.

Frontend map provider settings are in frontend/.env.example:

~~~dotenv
VITE_API_BASE=http://localhost:5000
VITE_OSM_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_GEOCODING_BASE_URL=
VITE_ROUTING_BASE_URL=
~~~

VITE_API_BASE is the current API setting. The frontend retains VITE_API_URL and VITE_BASE_URL as compatibility fallbacks. Blank geocoding/routing values use the development Photon and OSRM demo services; configure appropriate providers for deployment. Respect third-party service usage policies.

## Run locally

Terminal 1:

~~~bash
cd backend
npm run dev
~~~

Terminal 2:

~~~bash
cd frontend
npm run dev
~~~

Open the Vite URL shown in the terminal (normally http://localhost:5173). The backend listens on port 5000 by default. GET / returns a simple text response and does not confirm MongoDB readiness.

## Checks

From backend/:

~~~bash
npm test
~~~

From frontend/:

~~~bash
npm test
npm run lint
npm run build
~~~

The frontend production build may report a large-chunk warning. A successful build alone does not verify API connectivity, MongoDB transactions, live sockets, or physical GPS.

## GPS tracking setup

- Tracking publishes the driver's browser geolocation for bookings in transit. The browser must grant location permission; on real devices use HTTPS or another browser-trusted secure origin.
- Ensure the frontend API base and backend CORS allowlist use the same reachable host/origin. Cookie authentication uses credentialed requests.
- The backend accepts GPS only from the assigned, authenticated driver while the booking is in transit. Tracking reads are limited to the customer and assigned driver.
- Socket.IO carries location updates to the customer account; the tracking page also fetches the latest persisted location on load/reconnect.
- Map tiles, geocoding, and route calculation depend on configured external services. Route ETA is based on planned route duration and reported progress; it is not live traffic ETA.
- Physical device GPS accuracy, end-to-end driver/customer delivery, reconnect behavior, and production map-provider reliability have not been verified in this repository audit. No simulated GPS is used as evidence.

## Screenshots

Add current application screenshots here when available:

- Customer shipment and truck search: docs/screenshots/customer-search.png (placeholder)
- Driver capacity management: docs/screenshots/driver-capacity.png (placeholder)
- Shipment tracking: docs/screenshots/shipment-tracking.png (placeholder)

## Known limitations

- MongoDB connectivity could not be confirmed during the 2026-11-22 audit: the configured Atlas SRV hostname DNS lookup did not complete within the bounded check. The database records and live persisted workflow were therefore not inspected.
- Live physical GPS and authorized two-browser tracking are unverified.
- Parcel listing currently lacks an owner filter in its database query; review before exposing it to untrusted users.
- There is no admin portal or payment backend.
- The application has not had a production security, load, or operational-readiness review.

## Further documentation

- [Product requirements and implementation status](docs/PRD.md)
- [System architecture](docs/architecture.md)
- [Detailed system design](docs/SystemDesign.md)
- [Current work context](context.md)
