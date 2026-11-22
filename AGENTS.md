# AGENTS.md — RouteCargo Project Instructions

## 1. Project purpose and scope

RouteCargo connects customers who need goods transported with drivers and transport providers. Product scope includes customer/driver accounts, vehicles, shipment and parcel requests, driver capacity publication, bookings, notifications, and shipment tracking. These are implemented to varying degrees; consult the source and the docs before treating a capability as verified.

There is no admin portal or payment backend in the inspected implementation.

## 2. Verified technology stack

- Frontend: React 19, React Router 7, Tailwind CSS 4, Vite 8, JavaScript/JSX, Axios, Leaflet, React-Leaflet, Socket.IO client, lucide-react, react-icons.
- Backend: Node.js, Express 5, Mongoose 9, MongoDB, dotenv, cors, jsonwebtoken, bcryptjs, cookie-parser, multer, Socket.IO; nodemon for development.
- Database: MongoDB via Mongoose. Models exist under backend/src/models.
- Separate route/service domain layer: routes, controllers, middleware, models are present; a separate services layer was not found.

## 3. Repository structure

- backend/: Express entry point, src/config, controllers, middleware, models, routes, realtime, utils, scripts, package manifests and .env.example.
- frontend/: React/Vite app, src/API, Layout, Pages, map components/services, package manifests and .env.example.
- docs/: PRD.md, architecture.md, SystemDesign.md.
- README.md: setup and project overview.
- context.md: current implementation notes.
- requirement.txt: package-name/version inventory only; npm manifests and lockfiles are authoritative.

## 4. System implementation snapshot

The frontend communicates with the Express API using credentialed Axios requests and uses cookie-backed JWT sessions with refresh. REST endpoints cover authentication, driver profiles/vehicles/capacity, shipments, parcels, bookings/tracking, and notifications. Socket.IO authenticates user sessions and delivers notifications, booking status, and tracking-location events.

Customer and driver roles are implemented. Admin, payment processing, and synchronized saved-address features are not implemented. Tracking code exists, but real-device and production end-to-end behavior has not been verified.

## 5. Data and business state

Mongoose models include User, AuthSession, DriverProfile, Vehicle, CapacityPost, CargoRequest, Shipment, Parcel, Booking, TrackingLocation, Notification, and Counter. Booking status changes implemented in controller include pending to accepted/rejected, pending to cancelled, accepted to in_transit, and in_transit to delivered. A completed schema/UI label exists, but no controller completion transition was found.

Capacity publication and booking update CapacityPost state/capacity; not every declared status has a corresponding transition. See docs/SystemDesign.md for state details and limitations.

## 6. Security and operational notes

Authentication uses bcrypt password hashes, signed JWT access tokens, rotating refresh sessions, role checks, and ownership checks on relevant operations. Cookie/CORS settings are environment-configured. Parcel listing currently lacks customer ownership scoping. Never expose secrets. Booking operations use MongoDB transactions and require a transaction-capable deployment. The root GET / response is not a database readiness check.

## 7. Development commands

Run each project from its own directory:

- Backend: npm run dev, npm start, npm test.
- Frontend: npm run dev, npm test, npm run lint, npm run build, npm run preview.

Environment variable names and setup are documented in README.md and each .env.example. Never copy real credentials into documentation.

## 8. Documentation sources

Keep docs/PRD.md, docs/architecture.md, docs/SystemDesign.md, README.md and context.md aligned with source. Separate implemented-in-code from tested/verified behavior. Do not claim physical GPS, live database behavior, or production readiness without evidence.

## 9. Future AI behavior and explicit permission requirements

Future AI assistants must:

1. Read AGENTS.md and relevant docs before starting work.
2. Inspect existing implementations before suggesting new code.
3. Reuse existing components, models, APIs, and utilities.
4. Preserve the current architecture and conventions.
5. Never assume a feature, API, or database field exists without verification.
6. Explain the proposed change and list exact affected files.
7. Request explicit approval before editing any file.
8. Modify only approved files/functionality.
9. Never perform unrelated refactoring or automatic fixes.
10. Ask again if approved scope expands.
11. Never expose secrets or run destructive database operations without permission.
12. Report all changes and actual test results after approved implementation.
13. When asked to explain/review, do not modify.
14. State uncertainty rather than inventing answers.

A request to inspect, debug, explain, or plan does not grant permission to edit files.

## 10. Project state summary

The project has an integrated React frontend and Express/MongoDB backend. Main implemented flows include account/session management, customer shipments/parcels, driver vehicles/capacity, booking status handling, notifications, and code for live tracking. MongoDB connectivity, physical GPS end-to-end behavior, and production readiness remain unverified. See context.md for the latest audit caveats.
