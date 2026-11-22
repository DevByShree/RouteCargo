# RouteCargo Architecture

**Last source audit:** 2026-11-22
**Status convention:** “Implemented in code” describes repository behavior; it does not mean a workflow has been verified in production or on a physical device.

## 1. Scope and implementation status

RouteCargo is a React customer/driver marketplace connected to an Express and MongoDB backend. The code includes account/session handling, shipments, parcels, driver profiles, vehicles, capacity posts, bookings, notifications, and a browser GPS tracking path.

There is no implemented admin role/UI/API and no payment backend. The GPS path exists in source, but physical-device tracking and actual MongoDB location persistence were not verified. A direct MongoDB SRV/DNS check timed out in the execution environment.

## 2. Technology and external dependencies

| Layer | Verified implementation |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4, JavaScript/JSX |
| UI libraries | lucide-react, react-icons |
| Maps | Leaflet, React-Leaflet, OpenStreetMap raster tiles by default |
| Geocoding | Photon default in development; configurable through VITE_GEOCODING_BASE_URL |
| Road routing | OSRM demo endpoint default in development; configurable through VITE_ROUTING_BASE_URL |
| Frontend API | Axios wrapper in frontend/src/API/api.js; some older API modules also exist |
| Realtime client | socket.io-client |
| Backend | Node.js, Express 5, Mongoose 9, MongoDB |
| Authentication | jsonwebtoken, bcryptjs, cookie-parser |
| Uploads | multer and file validation middleware |
| Realtime server | socket.io attached to the HTTP server |

The development geocoder and routing defaults are public services, not a production availability guarantee. Configure production providers. The standard OSM tile URL can be overridden with VITE_OSM_TILE_URL.

## 3. Repository structure

~~~text
RouteCargo/
├── README.md
├── AGENTS.md
├── context.md
├── requirement.txt
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   └── SystemDesign.md
├── backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── realtime/
│       ├── routes/
│       └── utils/
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── API/
        ├── Authentication/
        ├── Layout/
        └── Pages/
~~~

Frontend pages are grouped under Authentication, Customer, Driver, and components. Authentication holds the context, protected/guest route guards, and account-scoped draft storage. Layout holds role-aware navigation and notifications.

Backend controllers contain most domain logic directly; there is not a separate service layer. Models are under backend/src/models, and routes mount them through backend/src/app.js.

## 4. Runtime architecture

~~~mermaid
flowchart LR
    Browser["Customer or driver browser<br/>React, React Router, Leaflet"]
    APIClient["Axios API wrapper<br/>cookie credentials and refresh"]
    Express["Express REST API"]
    Auth["JWT and active-session middleware"]
    Controllers["Route controllers"]
    Mongo[("MongoDB via Mongoose")]
    SocketClient["Socket.IO client<br/>authenticated rc_access cookie"]
    SocketServer["Socket.IO server"]
    Room["Authenticated user and session rooms"]
    MapServices["Photon geocoding<br/>OSRM road routing"]
    Tiles["OpenStreetMap tiles"]

    Browser --> APIClient
    APIClient --> Express
    Express --> Auth
    Auth --> Controllers
    Controllers --> Mongo
    SocketClient <--> SocketServer
    SocketServer --> Room
    Controllers -. "notification, booking status,<br/>tracking location events" .-> Room
    Browser --> MapServices
    Browser --> Tiles
~~~

The customer and driver browser routes are guarded for usability. Backend authentication and authorization are the security boundary.

## 5. Frontend architecture

The route tree is in frontend/src/App.jsx.

- Public: /, /signup, /signin.
- Customer routes under ProtectedRoute role=customer and Layout: /user, /user/Find, /user/Booking, /user/track, /user/address, /user/payment, /user/profile, /user/shipment, /user/parcel.
- Driver routes under ProtectedRoute role=driver and Layout: /driver, /driver/raise-request, /driver/my-requests, /driver/profile, /driver/vehicles.
- No admin route is present.

AuthProvider restores the account from the refresh-cookie API. The frontend stores a session hint, not the access or refresh token. Draft helpers keep selected form data scoped to the account and role.

The primary API wrapper sends cookies with requests, retries a protected request once after an access-token 401 by refreshing the session, and coordinates refresh requests where the browser supports navigator.locks. Older API modules exist; verify call sites before changing them.

## 6. Backend request and authentication architecture

Express setup in backend/src/app.js applies CORS with credentials and an origin allowlist, JSON/urlencoded body parsing, cookie parsing, static upload paths, an origin guard for state-changing API requests, route mounting, a JSON 404, and centralized error handling.

Backend startup in backend/server.js requires MONGO_URI and a JWT_SECRET of at least 32 bytes, connects Mongoose, ensures auth indexes, creates the HTTP server and Socket.IO server, then listens on PORT (default 5000).

Authentication middleware accepts the rc_access cookie or a Bearer access token, verifies an HS256 JWT with issuer/audience, then checks an active AuthSession. The authorize middleware enforces customer or driver roles. The Socket.IO handshake uses the rc_access cookie and validates the active session; it does not use the REST Bearer fallback.

~~~mermaid
sequenceDiagram
    participant B as Browser
    participant F as Axios wrapper
    participant A as Express auth middleware
    participant S as AuthSession collection
    participant C as Controller

    B->>F: API request with credentials
    F->>A: rc_access cookie or Bearer token
    A->>A: Verify JWT issuer, audience, algorithm, role
    A->>S: Check active family and expiry
    S-->>A: Session exists or missing
    A->>C: Attach authenticated user
    C-->>B: JSON response
    Note over F,B: On 401, refresh cookie may rotate and the original request is retried once
~~~

## 7. Booking and availability flow

Customers create a shipment and parcel records, search driver capacity, and post a booking request using a capacity post ID. The booking controller checks shipment ownership, route/date compatibility, driver/vehicle eligibility, and remaining capacity. Capacity reservation and booking creation run inside a MongoDB transaction.

Drivers accept/reject pending bookings. Accepted bookings can move to in_transit and then delivered. Rejection and pending cancellation restore reserved capacity. Booking status changes create stored notifications and emit booking:status to the customer.

Availability editing is owner-scoped, limited to available posts, and blocked when a non-rejected/non-cancelled booking references the post. Capacity is stored in both display units and kilograms.

~~~mermaid
sequenceDiagram
    participant U as Customer
    participant UI as React client
    participant API as Booking controller
    participant DB as MongoDB
    participant D as Driver
    participant RT as Socket.IO

    U->>UI: Create shipment and parcel
    U->>UI: Select availability and request booking
    UI->>API: POST /api/booking
    API->>DB: Transaction: validate and reserve capacity
    API->>DB: Create pending booking and notification
    API-->>D: Booking appears in driver list
    D->>API: Accept or reject pending booking
    API->>DB: Update booking and create customer notification
    API->>RT: Emit notification:new and booking:status
    RT-->>U: Deliver to customer user room
    D->>API: Set in_transit, then delivered
    API->>DB: Update booking; complete linked capacity on delivery
    API->>RT: Emit status and notification updates
~~~

The booking enum also contains completed, but the booking controller does not currently expose a completed transition.

## 8. Socket.IO architecture

A single Socket.IO server is attached to the HTTP server. On connection, an authenticated socket joins user:<userId> and session:<sessionId>. The realtime notification hub emits:

- notification:new to a notification recipient.
- booking:status to the booking customer.
- tracking:location to the booking customer.

Signout disconnects sockets in the revoked session room. Tracking payloads include bookingId, coordinates, optional GPS accuracy, and server recordedAt. The customer client filters tracking updates by currently selected booking ID.

The hub sends tracking updates to the customer's user room; server-side booking ownership checks occur before location reads and writes. There are no client-controlled arbitrary room-join events.

## 9. Driver-to-customer GPS data flow

~~~mermaid
sequenceDiagram
    participant D as Driver browser
    participant G as Browser geolocation
    participant API as Express booking API
    participant B as Booking collection
    participant L as TrackingLocation collection
    participant S as Socket.IO server
    participant C as Customer browser
    participant M as Leaflet map

    D->>G: watchPosition while booking is in_transit
    G-->>D: Device-provided GPS fix
    D->>API: POST /api/booking/:id/tracking
    API->>B: Match booking, driver ID, and in_transit status
    B-->>API: Authorized booking and customer ID
    API->>L: Upsert latest location for booking
    API->>S: Emit tracking:location to customer user room
    S-->>C: bookingId and latest coordinates
    C->>M: Update truck marker without page reload
    C->>API: GET /api/booking/:id/tracking on page load/reconnect
    API->>B: Confirm requester is booking customer or driver
    API->>L: Read latest location
    L-->>C: Restore saved last position
~~~

The driver watch runs only for bookings whose client state is in_transit. Updates are throttled to roughly one send per eight seconds per driver-page watcher. When the browser comes online, the code requests a fresh geolocation fix. Status updates to delivered remove the booking from the watcher set.

TrackingLocation has a unique bookingId, so only the latest position is retained; there is no historical breadcrumb store. GPS values are accepted only if numeric and within latitude/longitude bounds. The backend assigns recordedAt when it persists the update.

**Verification caveat:** this describes source code. Physical-device GPS, authorized end-to-end delivery, database record persistence, and marker movement have not been verified. A direct MongoDB SRV lookup and bounded connection attempt timed out in the verification environment.

## 10. Map and route integration

RouteMap uses geocoded pickup/destination text, optional intermediate stops, road-route geometry, and OSM raster tiles. In development, mapServices falls back to Photon and the OSRM public demo service. Production requires configured geocoding and routing URLs. Map tile URLs may be overridden.

Tracking progress projects the latest GPS fix onto the planned route geometry. ETA is a proportional estimate based on OSRM route duration; it does not use live traffic. If GPS is too far from the planned route, progress/ETA are unavailable rather than fabricated. Shipment records store textual pickup/destination fields; the map geocodes those fields when rendering.

## 11. Database architecture

| Model | Responsibility and key references |
|---|---|
| User | Customer/driver account, email, optional phone/company/profile-photo path, bcrypt password hash, role |
| AuthSession | Refresh-token hash, session family, expiry, revocation and replacement metadata |
| DriverProfile | One profile per user; business/contact fields, active flag, verification status |
| Vehicle | Driver-owned vehicle details, dimensions/capacity, availability, photo/document metadata |
| CapacityPost | Driver/vehicle availability, route/date, capacity in display units and kg, price, cargo types, status |
| Shipment | Customer-owned pickup, destination, pickup date, numeric shipment ID |
| Parcel | Shipment/customer association, cargo details, weight, image metadata |
| Booking | Customer, driver, shipment, availability, vehicle, requested capacity, amount, status |
| TrackingLocation | Latest location per booking with customer/driver IDs and server timestamp |
| Notification | Recipient, type, message, optional booking reference, read timestamp |
| CargoRequest | Legacy/request workflow record with customer and optional driver references |
| Counter | Sequences for numeric shipment and parcel IDs |

~~~mermaid
erDiagram
    USER ||--o| DRIVER_PROFILE : owns
    USER ||--o{ VEHICLE : registers
    USER ||--o{ CAPACITY_POST : publishes
    VEHICLE ||--o{ CAPACITY_POST : assigned_to
    USER ||--o{ SHIPMENT : creates
    SHIPMENT ||--o{ PARCEL : contains
    USER ||--o{ PARCEL : owns
    SHIPMENT ||--o{ BOOKING : requested_for
    USER ||--o{ BOOKING : customer
    USER ||--o{ BOOKING : driver
    VEHICLE ||--o{ BOOKING : assigned_vehicle
    CAPACITY_POST ||--o{ BOOKING : booked_from
    BOOKING ||--o| TRACKING_LOCATION : latest_position
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ AUTH_SESSION : has
    USER ||--o{ CARGO_REQUEST : customer_or_driver
~~~

Counter is a technical sequence model, not a business relationship. Some legacy/numeric IDs in Booking are retained for compatibility. MongoDB records were not inspected during this source audit.

## 12. API surface

Detailed route inventory is in [context.md](../context.md). Route groups mounted by the application:

- /api/auth — signup, signin, refresh, signout, current-user profile, profile photo, driver-only check.
- /api/driver — customer availability search; driver profile, vehicle, vehicle-file, request, and capacity operations.
- /api/shipments — create shipment.
- /api/parcel — create and list parcels.
- /api/booking — create/list/get/cancel bookings, accept/reject, status updates, and protected tracking read/write.
- /api/notifications — list and mark notifications read.
- GET / — simple process response; it does not perform a database health check.

There is no payment API or admin API.

## 13. Security and known limitations

- Access and refresh credentials are HTTP-only cookies. Access JWTs expire after 15 minutes; refresh duration defaults to 30 days and is capped at 90.
- Passwords use bcrypt hashing. Active sessions are checked on protected API and Socket.IO connections.
- CORS uses CLIENT_ORIGINS or CLIENT_URL and allows credentials.
- Vehicle and profile uploads use file validation and size limits.
- Parcel creation checks shipment ownership, but GET /api/parcel currently calls Parcel.find() without an owner filter. This is a documented access-control gap.
- No rate limiter, helmet/security-header middleware, admin moderation, payment processing, or verified production deployment is present.
- MongoDB transaction workflows require a deployment that supports transactions. The example local URI does not configure a replica set.

## 14. Environment configuration

Backend variables read by source code: PORT, MONGO_URI, JWT_SECRET, CLIENT_ORIGINS, CLIENT_URL, REFRESH_TOKEN_DAYS, COOKIE_SAME_SITE, DEFAULT_PHONE_COUNTRY_CODE. JWT_SECRET must be at least 32 bytes. CLIENT_ORIGINS is the preferred comma-separated frontend-origin allowlist.

Frontend variables: VITE_API_BASE (canonical API origin), VITE_API_URL and VITE_BASE_URL (legacy API-base fallbacks), VITE_OSM_TILE_URL, VITE_GEOCODING_BASE_URL, and VITE_ROUTING_BASE_URL. Vite exposes VITE_ variables to the browser; never put secrets in them.

## 15. Development and verification commands

Run npm ci inside backend and frontend separately. Backend scripts: npm run dev, npm start, npm test. Frontend scripts: npm run dev, npm run build, npm run lint, npm test, npm run preview.

See the root [README](../README.md) for setup instructions and unverified integration notes.
