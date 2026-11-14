// src/API/Truckapi.js
import { BASE_URL, authHeaders } from "./Shipmentapi";

/* ===================================================================
   ENDPOINTS - change here if your backend routes are different.
   Known from Postman:  POST /api/booking  { truckId, shipmentId }
   Guessed (not in Postman yet): the trucks list and cancel routes.
   =================================================================== */
const ENDPOINTS = {
    availableTrucks: (shipmentId) => `/api/trucks/available?shipmentId=${encodeURIComponent(shipmentId)}`,
    createBooking: "/api/booking",
    cancelBooking: (bookingId) => `/api/booking/${encodeURIComponent(bookingId)}`,
};

const call = async (path, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: "include",
        headers: authHeaders(),
        ...options,
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, json };
};

const fail = (res, fallback) => {
    const e = new Error(
        res.status === 401 || res.status === 403
            ? res.json?.message || "Your session has expired. Please sign in again."
            : res.json?.message || res.json?.error || fallback
    );
    if (res.status === 401 || res.status === 403) e.code = "NOT_SIGNED_IN";
    throw e;
};

/* ===================================================================
   Response -> UI mapping. If your truck fields have other names,
   fix them here (one place only).
   =================================================================== */
export function normalizeTruck(t) {
    const total = Number(t.totalCapacity ?? t.capacity ?? 0);
    const free = t.availableCapacity ?? t.freeCapacity;
    const used = free != null ? Math.max(total - Number(free), 0) : Number(t.usedCapacity ?? 0);

    return {
        id: t.truckId ?? t.truckid ?? t._id ?? t.id,
        name: t.transporterName ?? t.companyName ?? t.name ?? "Transporter",
        verified: Boolean(t.verified ?? t.isVerified),
        matchPercent: Number(t.matchPercent ?? t.routeMatch ?? 0),
        vehicle: t.vehicle ?? t.vehicleName ?? t.vehicleModel ?? "",
        type: t.vehicleType ?? t.type ?? "",
        vehicleNo: t.vehicleNo ?? t.vehicleNumber ?? t.registrationNo ?? "",
        route: t.route ?? (t.from && t.to ? `${t.from} → ${t.to}` : ""),
        dep: t.departure ?? t.departureTime ?? "",
        arr: t.arrival ?? t.arrivalTime ?? "",
        used,
        total,
        price: Number(t.price ?? t.estimatedPrice ?? 0),
        driver: t.driverName ?? t.driver?.name ?? t.driver ?? "Driver",
        rating: Number(t.rating ?? 0),
        reviews: Number(t.reviews ?? t.reviewCount ?? 0),
        image: t.image ?? t.imageUrl ?? null,
    };
}

const normalizeStatus = (s) => {
    const v = String(s || "pending").toLowerCase();
    if (["accepted", "approved", "confirmed"].includes(v)) return "accepted";
    if (["rejected", "declined"].includes(v)) return "rejected";
    return "pending";
};

export const normalizeBooking = (b = {}) => ({
    id: b.bookingId ?? b.bookingid ?? b._id ?? b.id ?? null,
    status: normalizeStatus(b.status),
});

/* ===================================================================
   API calls
   =================================================================== */

/** Trucks on / near the shipment's route. Returns null if the endpoint is not available. */
export async function getAvailableTrucks(shipmentId) {
    if (shipmentId == null) return null;
    try {
        const res = await call(ENDPOINTS.availableTrucks(shipmentId));
        if (!res.ok) return null;
        const list = res.json.data ?? res.json.trucks ?? (Array.isArray(res.json) ? res.json : null);
        return Array.isArray(list) ? list.map(normalizeTruck) : null;
    } catch {
        return null;
    }
}

/** POST /api/booking  { truckId, shipmentId }  (409 = already requested -> treated as pending) */
export async function createBooking({ truckId, shipmentId }) {
    if (shipmentId == null) throw new Error("Shipment not found. Go back and create the shipment first.");

    const res = await call(ENDPOINTS.createBooking, {
        method: "POST",
        body: JSON.stringify({ truckId, shipmentId }),
    });

    if (res.ok || res.status === 409) {
        return normalizeBooking(res.json.data ?? res.json.booking ?? res.json);
    }
    fail(res, "Could not send the booking request. Please try again.");
}

/** DELETE a pending booking request */
export async function cancelBooking(bookingId) {
    if (bookingId == null) throw new Error("Could not find this booking. Refresh the page and try again.");
    const res = await call(ENDPOINTS.cancelBooking(bookingId), { method: "DELETE" });
    if (!res.ok) fail(res, "Could not cancel the request. Please try again.");
}