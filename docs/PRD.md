# RouteCargo — Product Requirements Document (PRD)

**Status:** Draft for review
**Version:** 1.0
**Owner:** DevByShree — RouteCargo

---

## 1. Overview

RouteCargo is a transport and logistics marketplace that connects customers who need goods transported with drivers who are already traveling (shared truck capacity). Instead of dispatching trucks on demand, drivers publish trips they are already making, and customers book unused capacity along overlapping routes.

## 2. Problem Statement

- Empty truck capacity is wasted (trucks travel empty).
- Customers lack flexible/affordable transport options.
- Existing platforms (e.g., Porter-style) offer on-demand dispatch, not shared-capacity booking.

## 3. Product Vision

Turn unused truck capacity into revenue by matching parcels with pre-existing driver trips.

## 4. Goals and Non-Goals

**Goals:**
- Driver KYC + vehicle management.
- Trip publication with available capacity.
- Route-based matching engine.
- Partial/volume-based booking.
- Multi-customer consolidation.
- Live tracking, payments, ratings.

**Non-Goals:**
- On-demand dispatch without a pre-existing trip.
- Flat point-to-point pricing ignoring route/capacity/detour.

## 5. Target Users and Roles

- **Customer:** searches routes, books capacity, tracks, pays, rates.
- **Driver:** registers, KYC, publishes trips, accepts bookings, earnings.
- **Admin:** verifies drivers/vehicles, oversight.

## 6. Functional Requirements

### FR-1 — Authentication and Account Management
- Register/login with roles (customer, driver, admin).
- JWT/session-based auth (proposed).

### FR-2 — Driver Onboarding, KYC, Vehicle Management
- Driver registration, KYC documents, vehicle details.

### FR-3 — Trip and Capacity Management
- Driver publishes trip (route, dates, vehicle, capacity).
- Compute available capacity = total − loaded.

### FR-4 — Shipment Booking and Matching
- Customer creates shipment (pickup/delivery, goods, weight/volume).
- System matches compatible trips.

### FR-5 — Booking Acceptance and Assignment
- Driver requests/quotation; owner accepts/rejects; booking assigned.

### FR-6 — Tracking and Status Updates
- Shipment status lifecycle: pickup → in-transit → delivery.

### FR-7 — Payments and Escrow
- Payment records, status updates, OTP-based proof of delivery.

### FR-8 — Admin Oversight
- Verification, dispute handling, analytics.

## 7. Non-Functional Requirements

- Security: encrypted passwords, RBAC, ownership checks, rate limiting, secret management.
- Performance: sub-second API responses for core flows, map rendering.
- Scalability: horizontal backend scaling, DB indexing.
- Availability: monitoring, backups.

## 8. Success Metrics / KPIs

- Completed bookings per month, driver utilization, customer satisfaction, payment success rate.

## 9. Milestones

1. MVP: driver KYC/vehicle + trip creation + booking + tracking + payments.
2. Post-MVP: return trips, dynamic pricing, ratings/disputes.

## 10. Open Questions

- Auth mechanism finalization.
- Database engine finalization (MongoDB verified vs PostgreSQL in README).
- Payment gateway selection.

---

*Related documents: `docs/architecture.md`, `docs/SystemDesign.md`.*
