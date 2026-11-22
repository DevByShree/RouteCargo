# RouteCargo System Design

**Last source audit:** 2026-11-22
**Status:** Describes repository implementation. Production and physical-device behavior are explicitly marked unverified.

## 1. System overview

RouteCargo is a React single-page application for customer shipment/parcel creation and driver truck-capacity management. An Express API applies authentication and role checks, controllers use Mongoose models, MongoDB persists business records, and Socket.IO delivers notifications, booking-status changes, and the latest GPS updates.

There is no admin portal, payment backend, or payment model. The GPS workflow is implemented in source but has not been proven with an authenticated physical driver device and customer session.

## 2. Component design

| Component | Responsibility |
|---|---|
| React Router and route guards | Public, customer, and driver route composition; client-side role-aware navigation |
| AuthProvider and useAuth | Restore account session, expose user state, handle sign-in/sign-out and auth expiry |
| API wrapper | Cookie credentials, JSON/FormData requests, refresh-and-retry on protected 401 responses |
| Customer pages | Dashboard, shipment and parcel forms, truck search, booking list/cancel, tracking, profile |
| Driver pages | Driver profile, vehicles, capacity publication/editing, booking/request decisions and status updates |
| RouteMap and mapServices | Geocode text locations, calculate road route, render Leaflet markers and OSM tile layer |
| Express app | CORS/origin guard, parsers, static upload endpoints, route mounts, 404 and error responses |
| Authentication middleware | Verify JWT and active AuthSession, attach user, enforce customer/driver role |
| Controllers | Domain validation and booking, capacity, upload, notification, and tracking behavior |
| Mongoose models | Persistence schema, references, validation, indexes, and status enums |
| Socket.IO server/hub | Authenticate sockets and send per-user notification/status/location events |

The backend is organized as routes → controllers → models. A separate domain service layer is not present.

## 3. Module responsibilities

### Frontend

- frontend/src/App.jsx declares the route tree.
- frontend/src/Authentication contains AuthProvider, route guards, and account-scoped draft helpers.
- frontend/src/API/api.js is the main fetch client and auth refresh coordinator.
- frontend/src/API/driverApi.js and older service modules adapt domain requests.
- frontend/src/Pages/Customer contains shipment, parcel, availability search, booking, profile, and tracking pages.
- frontend/src/Pages/Driver contains driver profile, vehicle, capacity, and request/booking pages.
- frontend/src/Pages/components/RouteMap.jsx wraps Leaflet/React-Leaflet route display.

The payment page and saved-address page do not call a payment or address backend.

### Backend

- backend/server.js checks required auth/database configuration, connects MongoDB, ensures auth indexes, attaches Socket.IO, and starts the HTTP listener.
- backend/src/app.js configures middleware, static uploads, route groups, and error handling.
- backend/src/routes defines route methods and applies authentication/authorization.
- backend/src/controllers contains application workflow logic.
- backend/src/models defines persistent schemas.
- backend/src/realtime authenticates sockets and emits events.
- backend/src/config/authIndexes.js manages auth-related indexes.
- backend/src/utils contains phone and route normalization.

## 4. Database entities and relationships

~~~mermaid
erDiagram
    USER ||--o| DRIVER_PROFILE : profile
    USER ||--o{ AUTH_SESSION : sessions
    USER ||--o{ VEHICLE : owns
    USER ||--o{ CAPACITY_POST : publishes
    VEHICLE ||--o{ CAPACITY_POST : vehicle
    USER ||--o{ SHIPMENT : customer
    SHIPMENT ||--o{ PARCEL : includes
    SHIPMENT ||--o{ BOOKING : shipment
    USER ||--o{ BOOKING : customer
    USER ||--o{ BOOKING : driver
    VEHICLE ||--o{ BOOKING : assigned
    CAPACITY_POST ||--o{ BOOKING : reserves
    BOOKING ||--o| TRACKING_LOCATION : latest_location
    USER ||--o{ NOTIFICATION : recipient
    USER ||--o{ CARGO_REQUEST : request_reference
~~~

Key records:

- User contains account role and credentials/profile fields. Supported roles are customer and driver.
- AuthSession stores hashed refresh-token/session-family state, expiration, revocation, and replacement reference.
- DriverProfile is unique per User and stores contact/company/verification fields.
- Vehicle belongs to a driver and stores registration, type, capacity, dimensions, availability, and file metadata.
- CapacityPost belongs to a driver and vehicle and stores route/date, available capacity in source units and kilograms, cargo types, optional price, and status.
- Shipment belongs to a customer and has a numeric sequence ID, pickup, destination, and pickup date.
- Parcel references shipment and customer, with cargo type, package count, weightKg, description, and image data.
- Booking references customer, driver, shipment, capacity post, vehicle, and driver profile; it stores requestedCapacityKg, amount, and status.
- TrackingLocation stores exactly one latest location per booking through a unique bookingId index.
- Notification belongs to a recipient and may refer to a booking.
- CargoRequest remains as a separate request model. Counter provides shipment/parcel sequences.

There is no Payment model. Model definitions do not prove that production collections contain data; the recent read-only database check could not confirm that.

## 5. API design

The backend mounts /api/auth, /api/driver, /api/shipments, /api/parcel, /api/booking, and /api/notifications. GET / returns a simple text response, not a database readiness check.

| Route group | Operations in the source |
|---|---|
| Auth | signup, signin, refresh, signout, current-user read/update, profile photo upload/removal, driver-only check |
| Driver | customer availability search; driver profile CRUD-style read/update; vehicle CRUD and file operations; request list/status update; capacity list/create/update/cancel |
| Shipments | customer shipment create |
| Parcels | customer parcel create/list |
| Bookings | create, customer list, driver list, involved-user get, accept, reject, status update, pending cancel, tracking get/post |
| Notifications | authenticated list, mark one read, mark all read |

The route inventory with exact methods and roles is in context.md. There is no payment or admin route group.

## 6. Authentication and authorization

1. Sign-up accepts customer or driver roles; passwords are bcrypt-hashed.
2. Sign-in creates a short-lived access JWT and refresh-token session, delivered using HTTP-only cookies.
3. AuthSession stores a hash of the refresh token and session-family metadata; refresh rotates tokens and detects reuse.
4. REST authentication verifies JWT algorithm, issuer, audience, claims, and active session. A Bearer token is accepted as a REST fallback.
5. Role middleware restricts driver and customer APIs. Controllers also apply ownership filters for bookings, vehicles, and availability.
6. Socket.IO authenticates from the rc_access cookie, validates the active session, then joins user and session rooms.
7. Signout revokes the refresh-token family and disconnects the associated session room.

Implemented security controls do not include observed rate limiting, helmet, or an admin permission model. GET /api/parcel is an ownership-scoping exception: it is role-protected but returns Parcel.find() across users.

## 7. Booking state transitions

~~~mermaid
stateDiagram-v2
    [*] --> pending
    pending --> accepted: assigned driver accepts
    pending --> rejected: assigned driver rejects
    pending --> cancelled: customer cancels
    accepted --> in_transit: assigned driver starts trip
    in_transit --> delivered: assigned driver confirms delivery
    rejected --> [*]
    cancelled --> [*]
    delivered --> [*]
~~~

The schema includes completed, but the booking controller exposes no transition to completed. The driver UI marks a booking in transit and delivered. Those actions do not create a separate cargo-pickup timestamp or delivery-proof record.

## 8. Availability state transitions

~~~mermaid
stateDiagram-v2
    [*] --> available: driver publishes
    available --> available: capacity partially reserved
    available --> booked: capacity reaches zero
    booked --> available: rejection or cancellation restores positive capacity
    available --> cancelled: driver cancels
    available --> completed: linked booking delivered
    booked --> completed: linked booking delivered
    completed --> [*]
    cancelled --> [*]
~~~

The CapacityPost enum also includes draft, booking_requested, in_transit, and expired, but the controller does not implement a complete transition path for each enum value. A booking request does not always change the post status: positive remaining capacity keeps it available. The controller blocks editing unless the post status is available and no booking other than rejected/cancelled is linked.

## 9. Real-time tracking sequence

~~~mermaid
sequenceDiagram
    participant Driver as Driver browser
    participant GPS as Browser geolocation API
    participant API as Express booking controller
    participant Booking as Booking model
    participant Location as TrackingLocation model
    participant Socket as Socket.IO
    participant Customer as Customer tracking page
    participant Map as Leaflet map

    Driver->>GPS: watchPosition for in_transit bookings
    GPS-->>Driver: Device GPS fix
    Driver->>API: POST /api/booking/id/tracking with coordinates
    API->>Booking: Require matching driver and in_transit status
    Booking-->>API: Booking owner and assignment
    API->>Location: Upsert latest location by bookingId
    API->>Socket: Emit tracking:location to customer user room
    Socket-->>Customer: bookingId and current coordinates
    Customer->>Map: Replace truck marker position
    Customer->>API: GET tracking on selection/load/reconnect
    API->>Booking: Verify customer or assigned driver
    API->>Location: Read latest saved point
    Location-->>Customer: Current point or null
~~~

Driver tracking is conditional on actual browser geolocation support and permission. The driver page throttles posts, sends an immediate fix from watchPosition, and requests a fresh position when the browser reports online. The backend rechecks booking ownership/status for each update. Delivered status removes the booking from the driver's active in-transit set. The customer fetches the last saved location on booking selection/page load and refreshes it after Socket.IO reconnects.

TrackingLocation is a latest-value store, not a breadcrumb/history log. Socket updates are sent to the customer user room; the client additionally filters by bookingId. Physical device GPS and authorized customer delivery have not been verified.

## 10. Map and journey calculation

- Leaflet renders OSM-compatible tiles, pickup/destination markers, planned road polyline, and a truck marker only when a saved GPS location exists.
- Photon resolves text locations and OSRM returns road geometry/distance/duration by default in development.
- Production requires configured geocoding and routing service URLs. Tile URL is configurable.
- Route progress projects GPS onto the planned route and computes travelled/remaining distance. It withholds those metrics when GPS is too far from the route.
- ETA scales the planned route duration by remaining distance. It is not a traffic-aware ETA.
- Shipment currently stores textual place strings; provider geocoding supplies map coordinates at render time.

## 11. Error handling

- Controllers return JSON envelopes with success/message/data where implemented.
- Authentication distinguishes missing, invalid, expired, or revoked sessions.
- Route guards send unauthenticated users to sign-in and users with the wrong role to their role dashboard.
- Tracking UI explains missing/unavailable GPS and Socket.IO connection loss; the map never creates a random location.
- Map service errors are shown when geocoding/routing fails.
- Express has a final 404 response and error middleware. Multer errors are converted to 400 responses; other untyped errors return a generic 500.
- The backend root route is not a database health endpoint.
- MongoDB SRV DNS resolution and a bounded read-only connection timed out in the current verification environment. No location document was inspected.

## 12. Security architecture

Implemented:

- bcrypt password hashing.
- HTTP-only access/refresh cookies and rotating refresh sessions.
- JWT signature/claims/session checks on REST and Socket.IO connections.
- Role checks for driver/customer route groups.
- Ownership checks for most booking and driver-resource operations.
- Coordinate range validation and booking-status gate before GPS writes.
- CORS allowlist with credential support and state-changing origin guard.
- File upload MIME/size validation and owner-aware vehicle-document access.

Known risks and limits:

- Parcel listing is not filtered by user.
- No rate limiter or security-header middleware was found in the Express app.
- Admin role/moderation and payment security are not implemented.
- No production security review or physical-device tracking test has been completed.

## 13. Scalability considerations

Current implementation is a single backend process with a Socket.IO in-memory hub and one MongoDB database. For multiple backend instances, Socket.IO rooms need a shared adapter, and MongoDB transaction/write capacity must be evaluated. Location updates overwrite a single document per booking, keeping storage bounded by bookings but omitting movement history. Public development map services may not fit production load or availability needs.

No load, failover, or horizontal-scaling tests are documented.

## 14. Environment and local commands

Backend environment names read by code include PORT, MONGO_URI, JWT_SECRET, CLIENT_ORIGINS, CLIENT_URL, REFRESH_TOKEN_DAYS, COOKIE_SAME_SITE, and DEFAULT_PHONE_COUNTRY_CODE. Frontend environment names include VITE_API_BASE, legacy VITE_API_URL/VITE_BASE_URL, VITE_OSM_TILE_URL, VITE_GEOCODING_BASE_URL, and VITE_ROUTING_BASE_URL.

Run npm ci separately in backend and frontend. Backend scripts are npm run dev, npm start, npm test. Frontend scripts are npm run dev, npm run build, npm run lint, npm test, and npm run preview. The API uses MongoDB transactions for booking and some auth flows, so the database deployment must support transactions.
