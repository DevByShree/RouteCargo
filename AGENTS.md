# AGENTS.md — RouteCargo Project Instructions

## 1. Project Purpose and Scope

RouteCargo is a transport and logistics marketplace that connects users who need goods transported with drivers and transportation providers who can fulfil those shipments.

The platform may include:
- User registration, login, authentication, and role-based access.
- Driver registration, KYC, and vehicle management.
- Truck/vehicle management.
- Shipment creation with pickup/delivery locations.
- Goods info, truck requirements, pricing.
- Driver requests/quotations; owner accept/reject.
- Booking confirmation and assignment.
- Shipment status updates and delivery tracking.
- Payment records and transaction status.
- User/driver/admin dashboards.

Treat these as product requirements, not proof of implementation.

## 2. Verified Technology Stack

- **Frontend:** React 19, React Router v7, Tailwind CSS v4, Vite 8, ESLint 10, JavaScript/JSX, `lucide-react`, `react-icons`, `@types/react` (dev only).
- **Backend:** Node.js, Express 5, Mongoose 9 (MongoDB), `dotenv`, `cors`, `nodemon` (dev).
- **Database:** MongoDB via Mongoose ODM (connection via `MONGO_URI`; no models defined yet).

## 3. Repository Structure and Important File Locations

- `backend/` — `server.js`, `src/{config,controllers,middleware,models,routes}/` (mostly empty), `package.json`, `package-lock.json`, `.env` (`PORT`, `MONGO_URI`).
- `frontend/` — `src/{App.jsx, main.jsx, index.css, Layout/, Pages/, API/}`, `vite.config.js`, `eslint.config.js`, `package.json`, `package-lock.json`, `README.md`.
- `docs/` — `architecture.md`, `PRD.md`, `SystemDesign.md`.
- `requirement.txt` — root-level npm package list for frontend + backend.

## 4. Current System Architecture

- React SPA ↔ Express backend ↔ MongoDB.
- Frontend currently has **no API integration** (no fetch/axios; `src/API/` empty).
- Backend currently exposes only `GET /` and attempts MongoDB connection; scaffolding folders are empty.
- Integration phase pending.

## 5. Frontend and Backend Architecture

- Frontend: layout routes under `CustomerLayout`; local state only; auth token read from `localStorage.token` (never written yet).
- Backend: planned layered architecture (routes → controllers → services → models, middleware, auth).

## 6. Database Entities and Relationships

- Planned entities: User, Driver, Vehicle, Trip, Shipment, Booking, Payment, Tracking.
- Relationships: User 1—N Driver; Driver 1—N Trip; Trip → Shipment/Booking; Shipment → Tracking; Booking → Payment.

## 7. Verified API Inventory

- Verified: `GET /` — health check.
- Proposed: full REST API (auth, drivers, trips, shipments, bookings, payments, tracking).

## 8. Business Workflows

- Documented at product level; implementation pending.

## 9. Implementation Status

- Frontend pages implemented (local-state UI) / not implemented (Driver, Admin).
- Backend minimal / scaffolding empty.

## 10. Security and Data Integrity

- No auth/validation yet; `.env` gitignored; never expose secrets or run destructive DB ops without permission.

## 11. Development and Testing Instructions

- Backend: `cd backend && npm run dev`.
- Frontend: `npm run dev`, `npm run build`, `npm run lint`.

## 12. Known Issues and Unresolved Questions

- No frontend↔backend integration; empty backend scaffolding; driver portal pending; backend recently stripped.

## 13. Future AI Behavior and Explicit Permission Requirements

Future AI assistants must:

1. Read `AGENTS.md` and relevant docs before starting work.
2. Inspect existing implementations before suggesting new code.
3. Reuse existing components, models, APIs, and utilities.
4. Preserve the current architecture and conventions.
5. Never assume a feature, API, or DB field exists without verification.
6. Explain the proposed change and list exact affected files.
7. Request explicit approval before editing any file.
8. Modify only approved files/functionality.
9. Never perform unrelated refactoring or automatic fixes.
10. Ask again if approved scope expands.
11. Never expose secrets or run destructive DB operations without permission.
12. Report all changes and actual test results after approved implementation.
13. When asked to explain/review, do not modify.
14. State uncertainty rather than inventing answers.

A request to inspect, debug, explain, or plan does not grant permission to edit files.

## 14. Project State Summary for Future Handoffs

- **Stack:** React 19 SPA + Express 5 + Mongoose/MongoDB.
- **Current state:** Frontend UI scaffolded; backend minimal; integration not started.
- **Docs:** `docs/architecture.md`, `docs/PRD.md`, `docs/SystemDesign.md`.
- **Next likely work:** backend API scaffold + frontend integration.
