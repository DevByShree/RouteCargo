# RouteCargo Product Requirements Document

**Document status:** Source-audited product baseline
**Last reviewed:** 2026-11-22
**Scope:** This document separates implemented behavior from product requirements that are not yet implemented.

## 1. Product overview

RouteCargo is a web marketplace for customers who need goods transported and drivers who publish available capacity on a route. Customers create shipments and parcels, search published capacity, and request bookings. Drivers manage vehicles and availability, then accept or reject bookings.

The repository contains customer and driver roles. It does not contain an admin role or admin portal.

## 2. Problem statement

Customers need a way to find transport capacity that fits their route, date, cargo type, and weight. Drivers need a way to publish unused vehicle capacity and review booking requests. RouteCargo provides these account flows and a booking workflow; production performance, commercial outcomes, and real-world GPS behavior have not been measured.

## 3. Product objectives

### Implemented objectives

- Connect customer shipment and parcel records to driver-published availability.
- Let customers request a booking against a published capacity post.
- Let drivers manage profiles, vehicles, and capacity posts.
- Keep customer and driver routes behind role-aware authentication.
- Provide booking status updates and a code path for browser GPS sharing and customer tracking.

### Not implemented or not verified

- Payment processing, escrow, refunds, and transaction history.
- An admin portal or admin role.
- Ratings, disputes, or proof-of-delivery workflow.
- Physical-device GPS tracking verification.
- Production service levels, monitoring, or backup guarantees.

## 4. Target users

- **Customer:** creates shipments and parcels, searches truck availability, requests or cancels eligible bookings, and views booking and tracking information.
- **Driver:** manages a driver profile and vehicles, publishes and edits eligible availability, reviews booking requests, updates booking status, and shares browser GPS during an in-transit booking.
- **Administrator:** no administrator account role or admin UI/API is implemented.

## 5. Product features

### Customer features present in code

- Customer account registration and sign-in.
- Shipment creation with pickup, destination, and pickup date.
- Parcel creation with type, package count, weight, description, and image data.
- Available-capacity search with route/date and optional capacity, cargo, vehicle type, and price filters.
- Booking request creation and cancellation of pending bookings.
- Booking list, status, assigned driver and vehicle details.
- Tracking page with a planned road route, live truck marker when driver GPS is received, and route-progress estimates.
- Notification list and real-time notification updates.
- Profile updates and profile-photo upload.
- Saved-address UI currently uses local component state; it is not backed by a saved-address API.
- Payments page is a placeholder and does not display real payment records.

### Driver features present in code

- Driver account registration, profile management, and profile-photo upload.
- Driver profile fields include a verification status, but no admin verification workflow exists.
- Vehicle create, update, deactivate, and vehicle file upload/removal.
- Publish, list, edit, and cancel availability posts, subject to post status and booking restrictions.
- Review driver request records and shipment booking records.
- Accept or reject a pending booking.
- Move an accepted booking to In Transit and an in-transit booking to Delivered.
- Browser GPS sharing while one or more bookings are In Transit, subject to browser permission, device support, and network connectivity.

### Admin features

No admin dashboard, admin role, or admin API is present.

## 6. Functional requirements and implementation status

| ID | Requirement | Status |
|---|---|---|
| FR-1 | Register customer and driver accounts; authenticate and restore sessions | Implemented in code |
| FR-2 | Restrict customer and driver pages/APIs by role | Implemented in code |
| FR-3 | Create a shipment and associated parcel records | Implemented in code |
| FR-4 | Driver manages vehicles and capacity posts | Implemented in code |
| FR-5 | Customer searches compatible available capacity | Implemented in code |
| FR-6 | Customer requests a booking and capacity is reserved | Implemented in code using MongoDB transactions |
| FR-7 | Driver accepts/rejects bookings and updates status | Implemented in code |
| FR-8 | Persist latest driver GPS location for an eligible booking | Implemented in code; database persistence was not verified in the latest environment check |
| FR-9 | Deliver booking status and GPS updates to the customer in real time | Implemented in code with authenticated Socket.IO connections; authorized customer-to-driver end-to-end delivery is not physically verified |
| FR-10 | Process payment and retain transaction history | Not implemented |
| FR-11 | Provide admin operations and moderation | Not implemented |

## 7. User workflows

### Customer shipment and booking

1. Register or sign in as a customer.
2. Create a shipment with pickup, destination, and pickup date.
3. Add one or more parcel records.
4. Search available capacity, optionally using the shipment to derive route, date, and total weight.
5. Select a capacity post and request a booking.
6. Wait for the assigned driver to accept or reject.
7. View status and assigned driver/vehicle information.
8. If the driver starts the trip and shares browser GPS, view the latest position and estimated progress.
9. A customer can cancel a pending booking; the current API does not allow cancellation after acceptance.

### Driver availability

1. Register or sign in as a driver and maintain a driver profile.
2. Add a vehicle and its capacity details.
3. Publish a capacity post with route, date, available capacity, cargo types, and optional price.
4. Edit an Available post only if it has no non-rejected/non-cancelled booking request.
5. Review customer booking requests and accept or reject them.
6. Cancel eligible availability posts.

## 8. Booking lifecycle

The Booking model permits these statuses: pending, accepted, rejected, cancelled, in_transit, delivered, and completed.

The implemented booking controller transitions are:

- pending → accepted or rejected, by the assigned driver.
- pending → cancelled, by the customer.
- accepted → in_transit, by the assigned driver.
- in_transit → delivered, by the assigned driver.

The booking controller does not expose a transition to completed. Although completed is present in the schema and tracking UI labels, a completed booking transition is not implemented. Marking a booking delivered marks its linked capacity post completed.

## 9. Truck availability lifecycle

CapacityPost schema statuses include draft, available, booking_requested, booked, in_transit, completed, expired, and cancelled.

The implemented flow creates availability as available. Booking requests reserve availableCapacityKg; a post remains available while positive capacity remains and becomes booked when capacity reaches zero. Rejection or pending-booking cancellation restores capacity. Delivery marks the linked capacity post completed. Drivers may cancel posts in available or booking_requested status. Editing is limited to available posts and blocked when a non-rejected/non-cancelled booking exists.

The schema includes additional statuses whose complete transitions are not implemented. Do not interpret the full enum as proof of a complete lifecycle.

## 10. Shipment tracking requirements

- The driver browser uses navigator.geolocation.watchPosition while the booking status is in_transit. It sends actual browser coordinates; the application does not generate sample coordinates.
- The GPS endpoint requires an authenticated driver, a booking assigned to that driver, and booking status in_transit. Latitude, longitude, and optional accuracy are validated.
- TrackingLocation stores one latest location per booking, with customer/driver references and a server-recorded timestamp. It is not a location-history collection.
- The customer may fetch the latest location through the tracking endpoint. Location and status updates are also emitted to the authenticated customer's user room through Socket.IO.
- The customer map geocodes shipment pickup/destination text and requests a planned road route. The truck marker is only shown when a real location record is available.
- Distance travelled and remaining distance are projected onto the planned route. ETA is derived from planned route duration and remaining route distance; it does not include live traffic.
- GPS behavior has not been verified on a physical device. The latest direct MongoDB SRV/DNS check timed out in the execution environment, so database record persistence was not verified.

## 11. Notification requirements

Notifications are stored in MongoDB and scoped in the notification API by the authenticated user. Booking creation, decisions, status changes, and cancellation create notifications. Socket.IO emits notification:new to the recipient's authenticated user room. The frontend lists, marks individual notifications read, marks all read, and displays new notifications in real time.

## 12. Non-functional requirements

These are product expectations, not measured guarantees:

- **Security:** enforce ownership and role checks, store passwords as bcrypt hashes, keep tokens in HTTP-only cookies, validate input, and do not expose secrets.
- **Privacy:** restrict shipment, booking, and location data to involved accounts. The current parcel-list API is an exception: GET /api/parcel is customer-role protected but does not filter records by owner.
- **Reliability:** report unavailable geocoding, routing, GPS, network, and database services without inventing results.
- **Compatibility:** support modern browsers with secure-context geolocation and Socket.IO.
- **Performance and scale:** no performance target, load test, or horizontal-scaling verification is established.

## 13. Security requirements and current controls

Implemented controls include bcrypt password hashing, short-lived JWT access cookies, rotating refresh sessions, active-session checks, role authorization, ownership filters on core booking and availability actions, CORS origin allowlisting, and file-upload validation.

Known gaps include the unscoped parcel list, no rate limiting or security headers observed in the Express app, no admin moderation surface, and no production penetration test. These controls do not constitute a production-readiness assessment.

## 14. System limitations

- No admin portal/API.
- No payment model/API, payment processing, or escrow.
- No saved-address backend.
- No tracking history; only the latest location per booking is stored.
- No live traffic ETA or proof-of-delivery record.
- GPS needs browser permission, device support, network access, and a secure browser context for non-localhost origins.
- Public Photon/OSRM development fallbacks may be rate-limited or unavailable; production map providers must be configured.
- Physical GPS and authenticated driver-to-customer tracking are unverified.
- The latest direct MongoDB connection/SRV DNS check timed out; actual tracking collection contents are unverified.

## 15. Future enhancements

- Scope parcel listing to the authenticated owner.
- Add an admin role, review workflow, and auditable verification tools.
- Add payment records and an integrated payment provider.
- Add tracking history, delivery confirmation, and verified physical-device testing.
- Add production-grade routing/geocoding configuration, observability, rate limiting, and deployment hardening.
- Add tests for real database booking, availability edit, authorization, and tracking persistence.

## 16. Related documentation

- [Architecture](architecture.md)
- [System design](SystemDesign.md)
- [Project README](../README.md)
- [Current project context](../context.md)
