# RouteShare — Unused Truck Capacity Logistics Marketplace

> Turn unused truck capacity into additional revenue by matching it with parcels traveling along the same route.

##  What This Is

RouteShare is a web-based logistics marketplace that connects **customers** who need to ship parcels with **drivers** who are *already traveling* on a specific route and have unused vehicle capacity.

Instead of a truck traveling from Pune → Mumbai with 500 KG of empty space, that space becomes bookable — other customers can ship their parcels along the same route, paying less than a dedicated truck, while the driver earns extra revenue from a trip they were making anyway.

This is **not** an on-demand vehicle-booking clone (like Porter). Every booking is matched against a driver's **pre-existing, self-declared trip** — the platform never dispatches a driver on demand.

##  Core Differentiator

| Traditional platforms (Porter, etc.) | RouteShare |
|---|---|
| Driver is dispatched on-demand | Driver publishes a trip they're already making |
| One truck = one customer (exclusive) | One truck = multiple customers (shared capacity) |
| Flat point-to-point pricing | Pricing based on route overlap, detour, weight/volume share |
| Trip is created *because* of an order | Trip exists *independently*; orders match into it |
| Empty return legs are wasted | Return trips are bookable capacity |

##  Roles

- **Customer** — searches routes, books partial/full capacity, tracks shipment, pays, rates driver
- **Driver** — registers, completes KYC, adds vehicle, publishes trips with available capacity, accepts bookings, shares live location, manages earnings
- **Admin** — verifies drivers/vehicles, oversees trips/bookings/payments, resolves disputes, monitors platform analytics

##  MVP Feature Set

- Driver KYC & vehicle management
- "I'm Already Going There" trip creation
- Auto-calculated available capacity (total − already loaded)
- Route-based matching engine
- Partial/volume-based capacity booking
- Multi-customer consolidation per truck
- Live GPS tracking (WebSocket-based)
- Dynamic pricing (distance + weight/volume + capacity)
- Escrow-style payments with OTP proof of delivery
- Ratings, cancellations, and dispute handling
- Admin dashboard with core oversight tools

##  Post-MVP Differentiators

- Return-trip / empty-leg matching
- Detour distance calculation
- Capacity utilization score (per driver)
- Dead-mile / empty-run analytics (platform-wide)
- Route overlap % based ranking

##  Explicitly Out of Scope

- Instant/on-demand dispatch without a pre-existing trip
- Full-truck-only exclusive booking as the default flow
- Unrelated services (movers, bike taxi, food delivery)
- Flat point-to-point pricing that ignores route/capacity/detour

##  Tech Direction (high level)

- **Frontend:** Web app (React or similar), separate customer/driver/admin portals
- **Backend:** REST APIs + WebSocket service for live tracking
- **Database:** PostgreSQL (normalized schema — User, Trip, Vehicle, Shipment, Booking, Payment, Tracking, etc.)
- **Real-time:** Socket.IO/WebSockets for GPS updates and notifications
- **Payments:** Gateway integration with escrow/hold-and-release model
- **Maps/Routing:** Third-party maps API for route overlap and ETA calculation

##  Project Docs

- `refined-project-prompt.md` — full product/tech specification prompt used to generate detailed documentation (architecture, DB schema, API design, matching engine, roadmap, etc.)

##  Status

Concept / documentation stage — architecture and detailed specs being defined before development begins.