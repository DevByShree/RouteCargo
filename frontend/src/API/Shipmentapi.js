// src/API/Shipmentapi.js
// Base URL: same as {{Base_URL}} in Postman (Vite: VITE_BASE_URL in .env)
export const BASE_URL = (import.meta.env?.VITE_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

/* ------------------------------------------------------------------ */
/* Auth helpers – read whatever your Signin page saved after login     */
/* ------------------------------------------------------------------ */
const readJSON = (raw) => {
    try { return JSON.parse(raw); } catch { return null; }
};

const toNum = (v) => (Number.isNaN(Number(v)) ? v : Number(v));
const clean = (v) => (v || "").replace(/^"|"$/g, "").replace(/^Bearer\s+/i, "");
const looksLikeJwt = (v) => /^[\w-]+\.[\w-]+\.[\w-]+$/.test(v);

// Every key/value saved by the app (localStorage + sessionStorage)
const allEntries = () => {
    const out = [];
    for (const s of [localStorage, sessionStorage]) {
        for (let i = 0; i < s.length; i++) {
            const k = s.key(i);
            out.push([k, s.getItem(k)]);
        }
    }
    return out;
};

// Decode JWT payload (no verification - only to read the user id)
const decodeJwt = (token) => {
    try {
        const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(part));
    } catch {
        return null;
    }
};

const pickId = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    const id =
        obj.UserId ?? obj.userId ?? obj.user_id ?? obj.id ?? obj.Id ??
        obj.user?.UserId ?? obj.user?.userId ?? obj.user?.id ??
        obj.data?.UserId ?? obj.data?.userId ?? obj.data?.id ?? obj.data?.user?.id ?? null;
    return id !== null && id !== undefined && id !== "" ? id : null;
};

export function getToken() {
    for (const [, raw] of allEntries()) {
        if (!raw) continue;
        const c = clean(raw);
        if (looksLikeJwt(c)) return c;
        const obj = readJSON(raw);
        const t = obj?.token || obj?.accessToken || obj?.data?.token;
        if (t) return clean(t);
    }
    return null;
}

/** Logged-in user's id. Returns null when nobody is signed in (no default value). */
export function getUserId() {
    for (const [k, raw] of allEntries()) {
        if (!raw) continue;
        if (/^user_?id$/i.test(k)) return toNum(clean(raw));
        const id = pickId(readJSON(raw));
        if (id !== null) return toNum(id);
    }
    const token = getToken();
    const id = pickId(token ? decodeJwt(token) : null);
    return id !== null ? toNum(id) : null;
}

export const isSignedIn = () => !!getToken() || getUserId() !== null;

export const authHeaders = () => {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

/* ------------------------------------------------------------------ */
/* POST /api/shipments  ->  { UserId, pickup, destination }            */
/* ------------------------------------------------------------------ */
export async function createShipment({ userId, pickup, destination }) {
    if (userId === null || userId === undefined || userId === "") {
        const e = new Error("You are not signed in. Please sign in again.");
        e.code = "NOT_SIGNED_IN";
        throw e;
    }

    const res = await fetch(`${BASE_URL}/api/shipments`, {
        method: "POST",
        credentials: "include", // sends the login cookie (if your backend uses one)
        headers: authHeaders(),
        body: JSON.stringify({
            UserId: userId,
            pickup: pickup.trim().toLowerCase(),
            destination: destination.trim().toLowerCase(),
        }),
    });

    const data = await res.json().catch(() => ({}));

    // Same shipment already exists -> continue with it
    if (res.status === 409) {
        return { shipment: data.shipment || data.data || data, existing: true };
    }

    if (res.status === 401 || res.status === 403) {
        const e = new Error(data.message || "Your session has expired. Please sign in again.");
        e.code = "NOT_SIGNED_IN";
        throw e;
    }

    if (!res.ok) {
        throw new Error(data.message || data.error || `Request failed (${res.status})`);
    }

    return { shipment: data.shipment || data.data || data };
}

/* ------------------------------------------------------------------ */
/* Keep your existing versions of these two if they already work.      */
/* ------------------------------------------------------------------ */
const CITIES = [
    "Agra",
    "Ahmedabad",
    "Ahmednagar",
    "Ajmer",
    "Akola",
    "Aligarh",
    "Allahabad (Prayagraj)",
    "Amravati",
    "Amritsar",
    "Anand",
    "Aurangabad",
    "Bareilly",
    "Belgaum",
    "Bengaluru",
    "Bhavnagar",
    "Bhilai",
    "Bhiwandi",
    "Bhopal",
    "Bhubaneswar",
    "Bikaner",
    "Chandigarh",
    "Chennai",
    "Coimbatore",
    "Cuttack",
    "Dehradun",
    "Delhi",
    "Dhanbad",
    "Durgapur",
    "Erode",
    "Faridabad",
    "Ghaziabad",
    "Goa",
    "Gorakhpur",
    "Guntur",
    "Gurgaon",
    "Guwahati",
    "Gwalior",
    "Hubli",
    "Hyderabad",
    "Indore",
    "Jabalpur",
    "Jaipur",
    "Jalandhar",
    "Jalgaon",
    "Jammu",
    "Jamnagar",
    "Jamshedpur",
    "Jodhpur",
    "Kanpur",
    "Kochi",
    "Kolhapur",
    "Kolkata",
    "Kota",
    "Kozhikode",
    "Lucknow",
    "Ludhiana",
    "Madurai",
    "Mangalore",
    "Meerut",
    "Moradabad",
    "Mumbai",
    "Mysore",
    "Nagpur",
    "Nanded",
    "Nashik",
    "Navi Mumbai",
    "Noida",
    "Panaji",
    "Patna",
    "Pimpri-Chinchwad",
    "Pune",
    "Raipur",
    "Rajkot",
    "Ranchi",
    "Salem",
    "Sangli",
    "Satara",
    "Shirdi",
    "Siliguri",
    "Solapur",
    "Surat",
    "Thane",
    "Thiruvananthapuram",
    "Tiruchirappalli",
    "Udaipur",
    "Ujjain",
    "Vadodara",
    "Varanasi",
    "Vasai-Virar",
    "Vijayawada",
    "Visakhapatnam",
    "Warangal",
];

/** Predefined city suggestions (no backend endpoint needed). */
export async function getLocations() {
    return { pickup: CITIES, delivery: CITIES };
}

export async function getRouteInfo(from, to) {
    try {
        const res = await fetch(
            `${BASE_URL}/api/shipments/route?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
            { credentials: "include", headers: authHeaders() }
        );
        if (!res.ok) return null; // endpoint missing -> "Distance not available"
        return await res.json(); // { km, time, popular }
    } catch {
        return null;
    }
}