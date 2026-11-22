# RouteCargo — Project Work Context

**Last source audit:** 2026-11-22
This is a source-based implementation snapshot, not evidence of production operation. Keep secrets out of this file.

## 1. Stack and structure

- Frontend: React 19, React Router 7, Tailwind CSS 4, Vite 8, Axios, Leaflet/React-Leaflet, Socket.IO client, lucide-react and react-icons.
- Backend: Node.js, Express 5, Mongoose 9, MongoDB, JWT, bcryptjs, cookie-parser, multer, Socket.IO.
- Backend code is organized into routes, controllers, middleware, models, config, realtime, and utils. No separate services layer was found.
- MongoDB models: User, AuthSession, DriverProfile, Vehicle, CapacityPost, CargoRequest, Shipment, Parcel, Booking, TrackingLocation, Notification, Counter.
- Frontend and backend have separate package.json/package-lock.json files.

## 2. Authentication and authorization

- Signup/signin use POST /api/auth/signup and POST /api/auth/signin. User roles are customer and driver.
- Passwords are stored as bcrypt hashes. Access JWTs are short-lived; refresh tokens are rotated and tracked as hashed AuthSession records.
- REST requests authenticate via the rc_access cookie or Authorization Bearer token; Socket.IO authenticates using the cookie and verifies an active session.
- Protected routes enforce role restrictions and relevant record ownership. Signout revokes the session and disconnects its sockets.
- CORS uses CLIENT_ORIGINS, with CLIENT_URL fallback; credentialed requests are enabled. Cookie settings include SameSite and secure behavior based on environment/configuration.
- This source audit did not include a production security assessment.

## 3. API inventory

| Area | Implemented routes |
|---|---|
| Health | GET / |
| Auth | POST /api/auth/signup, /signin, /refresh, /signout; GET /me, /driver-only; PUT /me; POST /me/photo; DELETE /me/photo |
| Driver | GET /api/driver/available-capacity (customer access); driver profile GET/PUT; vehicle GET/POST/PUT/DELETE, upload/document operations; request GET/status PATCH; capacity GET/POST/PUT/DELETE |
| Shipments and parcels | POST /api/shipments; POST/GET /api/parcel |
| Bookings | POST /api/booking; GET /my-bookings, /driver, /:id, /:id/tracking; PUT /:id/accept, /:id/reject, /:id/status; POST /:id/tracking; DELETE /:id |
| Notifications | GET /api/notifications; PATCH /read-all and /:id/read |

Exact prefixes and authorization are defined in backend/src/routes. GET / is a text response, not a readiness probe. Parcel listing currently queries without restricting results to the requesting customer; treat this as an access-control limitation.

## 4. Booking and capacity workflows

Booking controller transitions found:
- pending → accepted or rejected by assigned driver.
- pending → cancelled by customer.
- accepted → in_transit by assigned driver after pickup.
- in_transit → delivered by assigned driver.
- A completed schema/UI value exists, but no controller completion transition was found.

Booking creation and changes/cancellation use MongoDB transactions. CapacityPost availability is decremented/reserved during booking operations and restored on rejection/cancellation where applicable. Delivery marks the linked capacity post completed. Capacity posts support declared statuses including draft, available, booking_requested, booked, in_transit, completed, expired, and cancelled, but only some transitions are implemented. A post remains available when positive capacity remains; zero capacity becomes booked. Editing is restricted when active booking constraints apply.

## 5. Notifications and real-time events

Notifications are persisted in MongoDB. Socket.IO joins authenticated users to per-user rooms and emits notification:new, booking:status, and tracking:location events. The customer client filters tracking updates by booking. Socket authentication uses the active account session.

## 6. Shipment tracking path

- The driver page watches browser geolocation while assigned bookings are in_transit, throttling publication to roughly 8 seconds and refreshing position after network reconnect.
- POST /api/booking/:id/tracking validates coordinates and booking assignment/status, stores the latest TrackingLocation per booking with server timestamp, then emits to the customer's room.
- GET /api/booking/:id/tracking is restricted to the booking customer or assigned driver. Socket updates reach the authorized customer room.
- Customer tracking fetches the current latest position on page/selection/reconnection and updates the Leaflet marker from socket updates without a page reload.
- Maps use Leaflet/React-Leaflet, OSM tiles by default, Photon geocoding and OSRM routing defaults in development. Configure VITE_OSM_TILE_URL, VITE_GEOCODING_BASE_URL, and VITE_ROUTING_BASE_URL for deployment.
- Distance is projected onto the planned road route; ETA derives from planned route duration, not live traffic. Locations far off-route can suppress the progress estimate.
- Browser GPS requires permission and a secure context for normal non-localhost device use. Physical GPS accuracy and a real driver-to-customer workflow have not been verified. No simulated location is evidence.

## 7. Environment names

Backend code and example use PORT, MONGO_URI, DEFAULT_PHONE_COUNTRY_CODE, JWT_SECRET, CLIENT_ORIGINS, CLIENT_URL fallback, REFRESH_TOKEN_DAYS, and COOKIE_SAME_SITE.

Frontend uses VITE_API_BASE, with legacy VITE_API_URL/VITE_BASE_URL fallbacks, plus VITE_OSM_TILE_URL, VITE_GEOCODING_BASE_URL, and VITE_ROUTING_BASE_URL.

## 8. Verification notes and known gaps

During the 2026-11-22 bounded database check, the configured MongoDB Atlas SRV DNS lookup did not finish in the allotted time, and the connection attempt timed out. Database records/counts and persisted real-workflow behavior could not be inspected. This does not establish that credentials are invalid.

The source contains driver capacity editing support; a real edit-save-refresh workflow was not manually verified during this documentation audit. Automated test results are recorded separately in the current task report, not inferred from feature presence.

Other gaps: no admin portal, no payment backend, saved addresses remain client-side, parcel listing lacks owner filtering, no production security/load review, and external map services need deployment configuration. The API root does not report database readiness.

## 9. Related documentation

- docs/PRD.md — product scope and requirements.
- docs/architecture.md — architecture and data flow.
- docs/SystemDesign.md — entities, APIs, and state transitions.
- README.md — setup and run instructions.
