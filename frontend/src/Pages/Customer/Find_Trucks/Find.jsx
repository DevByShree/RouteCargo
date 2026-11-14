import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    BadgeCheck, MapPin, Star, SlidersHorizontal, ChevronDown, Pencil, Package,
    Ruler, Timer, CalendarDays, ArrowRight, ArrowLeft, SearchX, Search, X,
    Clock, CheckCircle2, Loader2, AlertCircle, Truck as TruckIcon,
} from "lucide-react";
import tc from "../../../assets/tc.png";
import ind from "../../../assets/ind.png";
import { getShipmentId } from "../../../API/Parcelapi";
import { getAvailableTrucks, createBooking, cancelBooking } from "../../../API/Truckapi";

// Pages (must match the paths in your router)
const SHIPMENT_ROUTE = "/user/shipment";
const SIGNIN_ROUTE = "/signin";

const EMPTY_PLACE = { location: "", date: "", time: "" };

// Accepts either a plain string ("Pune, Maharashtra") or an object ({ location, date, time })
const toPlace = (value) =>
    !value ? EMPTY_PLACE : typeof value === "string" ? { location: value, date: "", time: "" } : { ...EMPTY_PLACE, ...value };

const cityOf = (v) => (v || "").split(",")[0].trim();
const rupees = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;
const initials = (name) => (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const VEHICLE_TYPES = ["Closed Body", "Open Body", "Container", "Refrigerated"];
const SORTS = {
    best: { label: "Best Match", fn: (a, b) => b.matchPercent - a.matchPercent },
    price: { label: "Price: Low to High", fn: (a, b) => a.price - b.price },
    rating: { label: "Highest Rated", fn: (a, b) => b.rating - a.rating },
    capacity: { label: "Most Space Free", fn: (a, b) => (b.total - b.used) - (a.total - a.used) },
};

const PRICE_MIN = 1000;
const PRICE_MAX = 50000;
const DEFAULT_FILTERS = { maxPrice: PRICE_MAX, minMatch: 0, types: [], verifiedOnly: false };

// Shown only when the trucks API is not available yet
const SAMPLE_TRUCKS = [
    { id: 1, name: "Ramesh Transport", verified: true, matchPercent: 92, vehicle: "Tata 10 Ton (Closed Body)", type: "Closed Body", vehicleNo: "MH12 AB 1234", used: 3.5, total: 10, price: 8500, driver: "Ramesh Kumar", rating: 4.8, reviews: 120 },
    { id: 2, name: "Shree Logistics", verified: true, matchPercent: 88, vehicle: "Eicher 8 Ton (Container)", type: "Container", vehicleNo: "MH14 CD 5678", used: 2, total: 8, price: 7200, driver: "Suresh Patil", rating: 4.6, reviews: 84 },
    { id: 3, name: "Sahyadri Carriers", verified: false, matchPercent: 76, vehicle: "Ashok Leyland 12 Ton (Open Body)", type: "Open Body", vehicleNo: "MH12 EF 9012", used: 6, total: 12, price: 9800, driver: "Anil Jadhav", rating: 4.2, reviews: 41 },
    { id: 4, name: "CoolMove Freight", verified: true, matchPercent: 81, vehicle: "Mahindra 5 Ton (Refrigerated)", type: "Refrigerated", vehicleNo: "MH43 GH 3456", used: 1, total: 5, price: 12400, driver: "Imran Shaikh", rating: 4.9, reviews: 203 },
];

const inputBase =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

/* ---------- Pieces ---------- */
function Card({ className = "", children }) {
    return (
        <section className={`min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
            {children}
        </section>
    );
}

function Detail({ icon: Icon, label, value }) {
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Icon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{label}</span>
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-slate-900" title={value}>{value}</div>
        </div>
    );
}

/* Compact filter dropdown that sits next to the search bar */
function FilterMenu({ filters, setFilters, reset, activeCount }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click or Escape
    useEffect(() => {
        if (!open) return;
        const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const toggleType = (t) =>
        setFilters((f) => ({
            ...f,
            types: f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t],
        }));

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-haspopup="dialog"
                className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 sm:px-4"
            >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeCount > 0 && (
                    <span className="rounded-full bg-blue-700 px-1.5 py-0.5 text-xs leading-none text-white">{activeCount}</span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Filters"
                    className="fixed inset-x-3 top-auto z-30 mt-2 max-h-[75vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:w-80"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-blue-950">Filters</h2>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={reset} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                                Reset all
                            </button>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="text-slate-400 hover:text-slate-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                                <label htmlFor="maxPrice">Max price</label>
                                <span className="text-blue-700">{rupees(filters.maxPrice)}</span>
                            </div>
                            <input
                                id="maxPrice"
                                type="range"
                                min={PRICE_MIN}
                                max={PRICE_MAX}
                                step={500}
                                value={filters.maxPrice}
                                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
                                className="w-full accent-blue-700"
                            />
                            <div className="mt-1 flex justify-between text-xs text-slate-400"><span>{rupees(PRICE_MIN)}</span><span>{rupees(PRICE_MAX)}</span></div>
                        </div>

                        <div>
                            <label htmlFor="minMatch" className="mb-2 block text-sm font-medium text-slate-700">Route match</label>
                            <div className="relative">
                                <select
                                    id="minMatch"
                                    value={filters.minMatch}
                                    onChange={(e) => setFilters((f) => ({ ...f, minMatch: Number(e.target.value) }))}
                                    className={`${inputBase} appearance-none pr-9`}
                                >
                                    <option value={0}>Any</option>
                                    <option value={70}>70% or more</option>
                                    <option value={85}>85% or more</option>
                                    <option value={90}>90% or more</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500" />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 text-sm font-medium text-slate-700">Vehicle type</div>
                            <div className="grid grid-cols-2 gap-2">
                                {VEHICLE_TYPES.map((t) => (
                                    <label key={t} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={filters.types.includes(t)}
                                            onChange={() => toggleType(t)}
                                            className="h-4 w-4 rounded border-slate-300 accent-blue-700"
                                        />
                                        {t}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <label className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
                            Verified transporters only
                            <input
                                type="checkbox"
                                checked={filters.verifiedOnly}
                                onChange={(e) => setFilters((f) => ({ ...f, verifiedOnly: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 accent-blue-700"
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        Show results
                    </button>
                </div>
            )}
        </div>
    );
}

function TruckCard({ truck, status, onRequest, onCancel }) {
    const free = Math.max(truck.total - truck.used, 0);
    const percent = truck.total ? Math.round((truck.used / truck.total) * 100) : 0;

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 sm:p-5">
            {/* Stacked on mobile, 2 columns on tablet, 4 columns on large screens */}
            <div className="grid gap-4 sm:grid-cols-[9rem_1fr] md:gap-5 2xl:grid-cols-[9rem_1fr_10rem_11rem]">
                <img
                    src={truck.image || tc}
                    alt={truck.name}
                    className="h-40 w-full rounded-lg bg-slate-100 object-cover sm:h-28 sm:w-36"
                />

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{truck.name}</h3>
                        {truck.verified && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                <BadgeCheck className="h-3.5 w-3.5" /> Verified
                            </span>
                        )}
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 sm:ml-auto">
                            {truck.matchPercent}% Route Match
                        </span>
                    </div>

                    <p className="mt-1.5 text-sm text-slate-700">{truck.vehicle}</p>
                    <p className="text-xs text-slate-400">{truck.vehicleNo}</p>

                    <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 shrink-0 text-blue-600" /> <span className="truncate">{truck.route}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        <span>Departs {truck.dep}</span>
                        <span>Arrives {truck.arr}</span>
                    </div>
                </div>

                {/* Space + price */}
                <div className="min-w-0 sm:col-span-1 sm:col-start-2 2xl:col-start-auto">
                    <div className="flex items-end justify-between gap-3 2xl:block">
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-slate-500">Space available</div>
                            <div className="text-sm font-semibold text-slate-900">
                                {free} Ton free <span className="font-normal text-slate-400">of {truck.total}</span>
                            </div>
                            <div
                                className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"
                                role="progressbar"
                                aria-valuenow={percent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label="Capacity used"
                            >
                                <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                            </div>
                        </div>
                        <div className="shrink-0 text-right 2xl:mt-3 2xl:text-left">
                            <div className="text-xl font-bold text-slate-900">{rupees(truck.price)}</div>
                            {truck.total > 0 && (
                                <div className="text-xs text-slate-400">{rupees(Math.round(truck.price / truck.total))} per Ton</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Driver + action */}
                <div className="flex min-w-0 flex-col gap-3 sm:col-start-2 2xl:col-start-auto 2xl:items-end 2xl:justify-between">
                    <div className="flex items-center justify-between gap-3 2xl:w-full 2xl:flex-col 2xl:items-end">
                        <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-800 2xl:order-first">
                            View details
                        </button>
                        <div className="flex items-center gap-2.5 2xl:flex-row-reverse">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                                {initials(truck.driver)}
                            </span>
                            <div className="min-w-0 2xl:text-right">
                                <div className="truncate text-sm font-semibold text-slate-800">{truck.driver}</div>
                                <div className="flex items-center gap-1 text-xs text-slate-500 2xl:justify-end">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {truck.rating} ({truck.reviews})
                                </div>
                            </div>
                        </div>
                    </div>

                    {status === "pending" ? (
                        <div className="w-full space-y-2">
                            <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
                                <Clock className="h-4 w-4" /> Status: Pending
                            </div>
                            <button
                                type="button"
                                onClick={() => onCancel(truck.id)}
                                className="w-full text-center text-xs font-medium text-red-600 hover:text-red-800"
                            >
                                Cancel request
                            </button>
                        </div>
                    ) : status === "accepted" ? (
                        <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" /> Status: Accepted
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onRequest(truck.id)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-800"
                        >
                            Request Booking <ArrowRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

/* Confirmation popup used for both "request" and "cancel request" */
function ConfirmDialog({ dialog, truck, busy, error, needsSignIn, onSignIn, onConfirm, onClose }) {
    const isCancel = dialog.type === "cancel";

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose, busy]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl sm:p-6"
            >
                <h2 id="confirm-title" className="text-lg font-bold text-blue-950">
                    {isCancel ? "Cancel this request?" : "Request this truck?"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                    {isCancel
                        ? "The transporter will no longer see your booking request. You can request again later."
                        : "Your booking request will be sent to the transporter. You can cancel it while it is pending."}
                </p>

                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
                    <div className="font-semibold text-slate-900">{truck.name}</div>
                    <div className="text-slate-600">{truck.vehicle}</div>
                    <div className="mt-1 flex items-center justify-between text-slate-500">
                        <span className="truncate">{truck.route}</span>
                        <span className="ml-3 shrink-0 font-semibold text-slate-900">{rupees(truck.price)}</span>
                    </div>
                </div>

                {error && (
                    <div role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                        <p className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                        </p>
                        {needsSignIn && (
                            <button type="button" onClick={onSignIn} className="ml-6 mt-1 font-medium underline hover:text-red-900">
                                Go to sign in
                            </button>
                        )}
                    </div>
                )}

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                        {isCancel ? "Keep request" : "Cancel"}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        autoFocus
                        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-70 ${isCancel ? "bg-red-600 hover:bg-red-700" : "bg-blue-700 hover:bg-blue-800"}`}
                    >
                        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                        {busy ? (isCancel ? "Cancelling..." : "Sending...") : isCancel ? "Yes, cancel request" : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------- Page ---------- */
export default function Find({ formData }) {
    const navigate = useNavigate();
    const { state } = useLocation();

    // Data comes from a prop, or from the Parcel page: navigate(FIND_ROUTE, { state: { pickup, destination, shipment, shipmentId, parcels } })
    const shipmentId = state?.shipmentId ?? getShipmentId(state?.shipment);
    const source = formData || {
        pickup: state?.pickup ?? state?.shipment?.pickup,
        destination: state?.destination ?? state?.shipment?.destination,
    };
    const pickup = toPlace(source.pickup);
    const delivery = toPlace(source.delivery || source.destination);

    const parcelList = state?.parcels || [];
    const parcel = {
        category: [...new Set(parcelList.map((p) => p.type))].join(", ") || "No parcels",
        packages: parcelList.reduce((sum, p) => sum + (p.qty || 0), 0),
    };
    const distance = source.distance || "—";
    const estimatedTime = source.estimatedTime || "—";

    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [sort, setSort] = useState("best");
    const [query, setQuery] = useState("");
    const [requests, setRequests] = useState({}); // { [truckId]: { id: bookingId, status } }
    const [dialog, setDialog] = useState(null);   // { type: "request" | "cancel", truckId }
    const [busy, setBusy] = useState(false);
    const [dialogError, setDialogError] = useState("");
    const [needsSignIn, setNeedsSignIn] = useState(false);

    // Trucks from the API (fallback: sample trucks when the API is not available)
    const [apiTrucks, setApiTrucks] = useState(null);
    const [trucksLoading, setTrucksLoading] = useState(true);

    const fromLabel = cityOf(pickup.location) || "—";
    const toLabel = cityOf(delivery.location) || "—";
    const route = `${fromLabel} → ${toLabel}`;
    const dep = [pickup.date, pickup.time].filter(Boolean).join(" ") || "Flexible";
    const arr = [delivery.date, delivery.time].filter(Boolean).join(" ") || "Flexible";

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const list = await getAvailableTrucks(shipmentId);
            if (cancelled) return;
            setApiTrucks(list);
            setTrucksLoading(false);
        })();
        return () => { cancelled = true; };
    }, [shipmentId]);

    const usingSample = !trucksLoading && apiTrucks === null;

    const trucks = useMemo(
        () => (apiTrucks ?? (trucksLoading ? [] : SAMPLE_TRUCKS)).map((t) => ({
            ...t,
            route: t.route || route,
            dep: t.dep || dep,
            arr: t.arr || arr,
        })),
        [apiTrucks, trucksLoading, route, dep, arr]
    );

    const q = query.trim().toLowerCase();
    const visible = trucks
        .filter((t) =>
            !q ||
            [t.name, t.driver, t.vehicle, t.vehicleNo, t.type].some((field) => String(field || "").toLowerCase().includes(q))
        )
        .filter((t) => t.price <= filters.maxPrice)
        .filter((t) => t.matchPercent >= filters.minMatch)
        .filter((t) => !filters.types.length || filters.types.includes(t.type))
        .filter((t) => !filters.verifiedOnly || t.verified)
        .sort(SORTS[sort].fn);

    const activeCount =
        (filters.maxPrice !== DEFAULT_FILTERS.maxPrice) +
        (filters.minMatch !== DEFAULT_FILTERS.minMatch) +
        filters.types.length +
        (filters.verifiedOnly ? 1 : 0);

    const reset = () => setFilters(DEFAULT_FILTERS);
    const clearAll = () => { setFilters(DEFAULT_FILTERS); setQuery(""); };

    const resetDialogState = () => { setDialogError(""); setNeedsSignIn(false); };
    const openRequest = (id) => { if (!requests[id]) { resetDialogState(); setDialog({ type: "request", truckId: id }); } };
    const openCancel = (id) => { if (requests[id]) { resetDialogState(); setDialog({ type: "cancel", truckId: id }); } };
    const closeDialog = () => { if (!busy) setDialog(null); };

    const confirmDialog = async () => {
        if (!dialog || busy) return;
        const { type, truckId } = dialog;

        setBusy(true);
        resetDialogState();
        try {
            if (type === "request") {
                // POST /api/booking  { truckId, shipmentId }
                const booking = await createBooking({ truckId, shipmentId });
                setRequests((r) => ({ ...r, [truckId]: { id: booking.id, status: booking.status } }));
            } else {
                await cancelBooking(requests[truckId]?.id);
                setRequests((r) => {
                    const { [truckId]: _removed, ...rest } = r;
                    return rest;
                });
            }
            setDialog(null);
        } catch (err) {
            if (err.code === "NOT_SIGNED_IN") setNeedsSignIn(true);
            setDialogError(err.message || "Something went wrong. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    const dialogTruck = dialog ? trucks.find((t) => t.id === dialog.truckId) : null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <main className="mx-auto w-full max-w-[1500px] px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-7 lg:pt-10">
                <h1 className="text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl">Find Available Trucks</h1>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">
                    {trucksLoading
                        ? "Looking for trucks on your route..."
                        : `We found ${trucks.length} trucks travelling on your route or nearby routes.`}
                </p>

                {usingSample && (
                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        The trucks list could not be loaded from the server, so sample trucks are shown. Booking requests still use your real shipment.
                    </p>
                )}

                <div className="mt-6 grid items-start gap-6 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-7">
                    {/* Results column */}
                    <div className="min-w-0 space-y-5">
                        {/* Toolbar: search + filters + sort */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative min-w-0 flex-1">
                                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search transporter, driver or vehicle"
                                    aria-label="Search trucks"
                                    className={`${inputBase} pl-9 ${query ? "pr-9" : ""}`}
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => setQuery("")}
                                        aria-label="Clear search"
                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <FilterMenu filters={filters} setFilters={setFilters} reset={reset} activeCount={activeCount} />
                                <div className="relative min-w-0 flex-1 sm:flex-none">
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        aria-label="Sort by"
                                        className={`${inputBase} appearance-none pr-9 sm:w-44`}
                                    >
                                        {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500" />
                                </div>
                            </div>
                        </div>

                        {trucksLoading ? (
                            <div className="space-y-4">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="text-sm font-bold text-blue-950">{visible.length} Trucks Found</div>

                                {visible.map((t) => (
                                    <TruckCard
                                        key={t.id}
                                        truck={t}
                                        status={requests[t.id]?.status}
                                        onRequest={openRequest}
                                        onCancel={openCancel}
                                    />
                                ))}

                                {!visible.length && (
                                    <Card className="flex flex-col items-center gap-3 py-14 text-center">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                            <SearchX className="h-6 w-6 text-slate-400" />
                                        </span>
                                        <p className="font-semibold text-slate-800">No trucks match your search</p>
                                        <p className="text-sm text-slate-500">Try a different name, raise the price limit or remove a filter.</p>
                                        <button type="button" onClick={clearAll} className="mt-1 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
                                            Clear search and filters
                                        </button>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>

                    {/* Map + shipment details (below results on mobile/tablet, side column on desktop) */}
                    <div className="grid min-w-0 gap-6 md:grid-cols-2 lg:sticky lg:top-6 lg:grid-cols-1 lg:gap-7">
                        <Card>
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-sm font-bold text-blue-950">Route Map</h2>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                                    <TruckIcon className="h-3.5 w-3.5" /> Nearby trucks ({trucks.length})
                                </span>
                            </div>
                            <img src={ind} alt={`Route map for ${route}`} className="mt-3 h-40 w-full rounded-lg bg-slate-100 object-cover" />
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-blue-950">Your Shipment Details</h2>
                                <button
                                    type="button"
                                    onClick={() => navigate(SHIPMENT_ROUTE)}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                                >
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                </button>
                            </div>

                            <div className="relative mt-5 space-y-5 pl-7">
                                <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-slate-200" />
                                <div className="relative min-w-0">
                                    <span className="absolute -left-7 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-600 ring-1 ring-emerald-200" />
                                    <div className="text-xs text-slate-500">Pickup</div>
                                    <div className="truncate text-sm font-semibold" title={pickup.location}>{pickup.location || "—"}</div>
                                    {dep !== "Flexible" && <div className="text-xs text-slate-400">{pickup.date}{pickup.time && `, ${pickup.time}`}</div>}
                                </div>
                                <div className="relative min-w-0">
                                    <span className="absolute -left-7 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500 ring-1 ring-red-200" />
                                    <div className="text-xs text-slate-500">Delivery</div>
                                    <div className="truncate text-sm font-semibold" title={delivery.location}>{delivery.location || "—"}</div>
                                    {arr !== "Flexible" && <div className="text-xs text-slate-400">{delivery.date}{delivery.time && `, ${delivery.time}`}</div>}
                                </div>
                            </div>

                            <div className="mt-5 flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                                <Package className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-900" title={parcel.category}>{parcel.category}</div>
                                    <div className="text-xs text-slate-500">
                                        {parcel.packages} {parcel.packages === 1 ? "package" : "packages"}
                                        {parcelList.length > 0 && ` · ${parcelList.length} ${parcelList.length === 1 ? "item" : "items"}`}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
                                <Detail icon={Ruler} label="Distance" value={distance} />
                                <Detail icon={Timer} label="Est. time" value={estimatedTime} />
                                <Detail icon={CalendarDays} label="Pref. date" value={pickup.date || "Flexible"} />
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="mt-7 border-t border-slate-200 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:px-6"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                </div>
            </main>

            {dialog && dialogTruck && (
                <ConfirmDialog
                    dialog={dialog}
                    truck={dialogTruck}
                    busy={busy}
                    error={dialogError}
                    needsSignIn={needsSignIn}
                    onSignIn={() => navigate(SIGNIN_ROUTE)}
                    onConfirm={confirmDialog}
                    onClose={closeDialog}
                />
            )}
        </div>
    );
}