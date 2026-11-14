<<<<<<< HEAD
<<<<<<< HEAD
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    BadgeCheck, MapPin, Star, SlidersHorizontal, ChevronDown, Pencil, Package,
    Ruler, Timer, CalendarDays, ArrowRight, ArrowLeft, Check, SearchX, Truck as TruckIcon,
} from "lucide-react";
import tc from "../../../assets/tc.png";
import ind from "../../../assets/ind.png";
=======
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657
import { useEffect, useState } from "react";
import tc from "../../../assets/tc.png"
import ind from "../../../assets/ind.png"
import { driverApi } from "../../../API/driverApi";
<<<<<<< HEAD
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657

function Find({ formData }) {

<<<<<<< HEAD
<<<<<<< HEAD
// Accepts either a plain string ("Pune, Maharashtra") or an object ({ location, date, time })
const toPlace = (value, fallback) =>
    !value ? fallback : typeof value === "string" ? { location: value, date: "", time: "" } : { ...fallback, ...value };
=======
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657
    const [showFilters, setShowFilters] = useState(false);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");
    useEffect(() => { driverApi.listPublicCapacity().then(setPosts).catch(e => setError(e.message)); }, []);
<<<<<<< HEAD
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657

    const {
        pickup = {
            location: "Pune, Maharashtra",
            date: "22 Sep 2026",
            time: "09:00 AM",
        },
        delivery = {
            location: "Mumbai, Maharashtra",
            date: "23 Sep 2026",
            time: "06:00 PM",
        },
        parcel = {
            category: "Electronics",
            packages: 10,
            weight: 1200,
            volume: 0.72,
        },
        distance = "150 Km",
        estimatedTime = "3-4 Hrs",
    } = formData || {};

<<<<<<< HEAD
<<<<<<< HEAD
const VEHICLE_TYPES = ["Closed Body", "Open Body", "Container", "Refrigerated"];
const SORTS = {
    best: { label: "Best Match", fn: (a, b) => b.matchPercent - a.matchPercent },
    price: { label: "Price: Low to High", fn: (a, b) => a.price - b.price },
    rating: { label: "Highest Rated", fn: (a, b) => b.rating - a.rating },
    capacity: { label: "Most Space Free", fn: (a, b) => (b.total - b.used) - (a.total - a.used) },
};
=======
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657
    const trucks = posts.map(post => ({
        id: post.id,
        image: tc,
        name: post.companyName || post.contactName || "RouteCargo Driver",
        verified: false,
        matchPercent: 0,
        matchLabel: "Published trip",
        vehicle: post.vehicleType || post.truckName || "Truck",
        vehicleNo: post.truckNumber || "",
        route: `${post.from} → ${post.to}`,
        depTime: `Travel date: ${post.date}`,
        arrTime: `Accepts: ${(post.loadTypes || []).join(", ")}`,
        capacity: `${post.availableCapacity} ${post.capacityUnit} available`,
        capacityPercent: post.totalCapacity ? Math.min(100, Number(post.availableCapacity) / Number(post.totalCapacity) * 100) : 100,
        price: "Contact driver",
        priceNote: post.contactPhone || "Contact details available after sign in",
        driver: post.contactName || post.companyName || "Driver",
        rating: "—",
        reviews: 0,
    }));
<<<<<<< HEAD
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">

<<<<<<< HEAD
<<<<<<< HEAD
function Detail({ icon: Icon, label, value }) {
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Icon className="h-3.5 w-3.5" /> {label}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-slate-900" title={value}>{value}</div>
=======
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657
            {/* Header */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-3">
                <div className="font-bold text-xl sm:text-2xl py-1 text-gray-900">
                    Find Available Trucks
                </div>
                <span className="text-gray-500 text-sm">
                    We found {trucks.length} trucks travelling on your route or nearby routes
                </span>
                {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
            </div>
            <button
                onClick={() => setShowFilters((s) => !s)}
                className="lg:hidden mx-4 sm:mx-6 mt-3 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 flex items-center justify-between"
            >
                Filters
                <span className="text-gray-400">{showFilters ? "▲" : "▼"}</span>
            </button>

            <div className="flex flex-col lg:flex-row flex-1 gap-4 px-4 sm:px-6 lg:px-8 py-4 items-start">
                <div className="flex-1 w-full flex flex-col gap-3 min-w-0">

                    <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 lg:bg-transparent lg:px-0 lg:py-0">
                        <span className="font-bold text-sm">{trucks.length} Trucks Found</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="hidden sm:inline">Sort by</span>
                            <select className="border border-gray-200 rounded-md px-2 py-1 text-xs">
                                <option>Best Match</option>
                            </select>
                        </div>
                    </div>

                    {trucks.map((truck) => (
                        <div key={truck.id} className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col md:flex-row gap-3 items-start">
                            {/* Image placeholder */}
                            <img
                                src={truck.image}
                                alt={truck.name}
                                className="w-full md:w-28 h-24 md:h-20 rounded-md bg-gray-200 object-cover shrink-0" />
                            {/* Details */}
                            <div className="flex-1 w-full flex flex-col gap-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-bold text-sm">{truck.name}</span>
                                    <span className="text-xs text-blue-600 bg-blue-100 rounded px-1.5 py-0.5 md:ml-auto">
                                        {truck.matchLabel}
                                    </span>
                                </div>

                                <span className="text-xs text-gray-600">{truck.vehicle}</span>
                                <span className="text-xs text-gray-400">{truck.vehicleNo}</span>

                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <span>📍 {truck.route}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
                                    <span>{truck.depTime}</span>
                                    <span>{truck.arrTime}</span>
                                </div>
                            </div>

                            {/* Capacity + Price */}
                            <div className="flex flex-col gap-1 w-full md:w-32 shrink-0">
                                <span className="text-xs text-gray-500">Available Capacity</span>
                                <span className="font-semibold text-xs">{truck.capacity}</span>
                                <div className="h-1.5 bg-gray-200 rounded overflow-hidden">
                                    <div className="h-full bg-blue-600" style={{ width: `${truck.capacityPercent}%` }} />
                                </div>
                                <span className="font-bold text-sm text-gray-900 mt-1">{truck.price}</span>
                                <span className="text-xs text-gray-400">{truck.priceNote}</span>
                            </div>

                            {/* Driver + Actions */}
                            <div className="flex flex-col items-start md:items-end gap-1.5 w-full md:w-36 shrink-0">
                                <span className="text-xs text-blue-600 cursor-pointer">View Details</span>
                                <div className="flex items-center gap-1.5">
                                    <img
                                        src=""
                                        alt={truck.driver}
                                        className="w-6 h-6 rounded-full bg-gray-200"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">{truck.driver}</span>
                                        <span className="text-xs text-gray-400">⭐ {truck.rating} ({truck.reviews})</span>
                                    </div>
                                </div>
                                <button className="bg-blue-600 text-white rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-blue-700 transition w-full">
                                    Request Booking →
                                </button>
                            </div>

                        </div>
                    ))}

                </div>

                {/* Right: Map + Shipment Details */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">

                    {/* Map */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-xs">Route Map</span>
                            <span className="text-xs text-blue-600">Nearby Trucks ({trucks.length})</span>
                        </div>
                        <img
                            src={ind}
                            alt="Route Map"
                            className="w-full h-40 rounded-md bg-gray-200 object-cover"
                        />
                    </div>

                    {/* Shipment Details - fully driven by formData */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-2.5">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-xs">Your Shipment Details</span>
                            <span className="text-xs text-blue-600 cursor-pointer">✎ Edit</span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-green-600">🟢 Pickup</span>
                            <span className="text-xs font-semibold">{pickup.location}</span>
                            <span className="text-xs text-gray-400">{pickup.date}, {pickup.time}</span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-red-600">🔴 Delivery</span>
                            <span className="text-xs font-semibold">{delivery.location}</span>
                            <span className="text-xs text-gray-400">{delivery.date}, {delivery.time}</span>
                        </div>

                        <div className="border-t border-gray-200 pt-2 flex flex-col gap-0.5">
                            <span className="text-xs font-semibold">📦 {parcel.category}</span>
                            <span className="text-xs text-gray-400">
                                {parcel.packages} packages • {parcel.weight} kg • {parcel.volume} m³
                            </span>
                        </div>

                        <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500">
                            <div className="flex flex-col">
                                <span>Distance</span>
                                <span className="font-semibold text-gray-900">{distance}</span>
                            </div>
                            <div className="flex flex-col">
                                <span>Est. Time</span>
                                <span className="font-semibold text-gray-900">{estimatedTime}</span>
                            </div>
                            <div className="flex flex-col">
                                <span>Pref. Date</span>
                                <span className="font-semibold text-gray-900">{pickup.date}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

<<<<<<< HEAD
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
=======
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657
        </div>
    );
}

<<<<<<< HEAD
<<<<<<< HEAD
function FilterPanel({ filters, setFilters, reset }) {
    const toggleType = (t) =>
        setFilters((f) => ({
            ...f,
            types: f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t],
        }));

    return (
        <Card className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-blue-950">Filters</h2>
                <button type="button" onClick={reset} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                    Reset all
                </button>
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                    <label htmlFor="maxPrice">Max price</label>
                    <span className="text-blue-700">{rupees(filters.maxPrice)}</span>
                </div>
                <input
                    id="maxPrice"
                    type="range"
                    min={5000}
                    max={15000}
                    step={500}
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
                    className="w-full accent-blue-700"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-400"><span>₹ 5,000</span><span>₹ 15,000</span></div>
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
                <div className="space-y-2">
                    {VEHICLE_TYPES.map((t) => (
                        <label key={t} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
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
        </Card>
    );
}

function TruckCard({ truck, requested, onRequest }) {
    const free = truck.total - truck.used;
    const percent = Math.round((truck.used / truck.total) * 100);

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200">
            <div className="flex flex-col gap-5 md:flex-row">
                <img
                    src={truck.image}
                    alt={truck.name}
                    className="h-32 w-full shrink-0 rounded-lg bg-slate-100 object-cover md:h-28 md:w-36"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{truck.name}</h3>
                        {truck.verified && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                <BadgeCheck className="h-3.5 w-3.5" /> Verified
                            </span>
                        )}
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 md:ml-auto">
                            {truck.matchPercent}% Route Match
                        </span>
                    </div>

                    <p className="mt-1.5 text-sm text-slate-700">{truck.vehicle}</p>
                    <p className="text-xs text-slate-400">{truck.vehicleNo}</p>

                    <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 shrink-0 text-blue-600" /> {truck.route}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        <span>Departs {truck.dep}</span>
                        <span>Arrives {truck.arr}</span>
                    </div>
                </div>

                <div className="w-full shrink-0 md:w-40">
                    <div className="text-xs text-slate-500">Space available</div>
                    <div className="text-sm font-semibold text-slate-900">{free} Ton free <span className="font-normal text-slate-400">of {truck.total}</span></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Capacity used">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="mt-3 text-xl font-bold text-slate-900">{rupees(truck.price)}</div>
                    <div className="text-xs text-slate-400">{rupees(Math.round(truck.price / truck.total))} per Ton</div>
                </div>

                <div className="flex w-full shrink-0 flex-col justify-between gap-3 md:w-44 md:items-end">
                    <button type="button" className="self-start text-xs font-medium text-blue-600 hover:text-blue-800 md:self-end">
                        View details
                    </button>
                    <div className="flex items-center gap-2.5 md:flex-row-reverse">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                            {initials(truck.driver)}
                        </span>
                        <div className="md:text-right">
                            <div className="text-sm font-semibold text-slate-800">{truck.driver}</div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 md:justify-end">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {truck.rating} ({truck.reviews})
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onRequest(truck.id)}
                        disabled={requested}
                        className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${requested
                                ? "cursor-default bg-emerald-50 text-emerald-700"
                                : "bg-blue-700 text-white shadow-sm hover:bg-blue-800"
                            }`}
                    >
                        {requested ? <><Check className="h-4 w-4" /> Request sent</> : <>Request Booking <ArrowRight className="h-4 w-4" /></>}
                    </button>
                </div>
            </div>
        </article>
    );
}

/* ---------- Page ---------- */
export default function Find({ formData }) {
    const navigate = useNavigate();
    const { state } = useLocation();

    // Data can come from a prop, or from the shipment returned by the API (navigate("/Find", { state: { shipment } }))
    const source = formData || state?.shipment || {};
    const pickup = toPlace(source.pickup, DEFAULT_PICKUP);
    const delivery = toPlace(source.delivery || source.destination, DEFAULT_DELIVERY);
    const parcel = { ...DEFAULT_PARCEL, ...(source.parcel || {}) };
    const distance = source.distance || "150 Km";
    const estimatedTime = source.estimatedTime || "3-4 Hrs";

    const defaults = { maxPrice: 15000, minMatch: 0, types: [], verifiedOnly: false };
    const [filters, setFilters] = useState(defaults);
    const [sort, setSort] = useState("best");
    const [showFilters, setShowFilters] = useState(false);
    const [requested, setRequested] = useState([]);

    const route = `${cityOf(pickup.location)} → ${cityOf(delivery.location)}`;
    const dep = [pickup.date, pickup.time].filter(Boolean).join(" ") || "Flexible";
    const arr = [delivery.date, delivery.time].filter(Boolean).join(" ") || "Flexible";

    const trucks = useMemo(
        () => [
            { id: 1, image: tc, name: "Ramesh Transport", verified: true, matchPercent: 92, vehicle: "Tata 10 Ton (Closed Body)", type: "Closed Body", vehicleNo: "MH12 AB 1234", used: 3.5, total: 10, price: 8500, driver: "Ramesh Kumar", rating: 4.8, reviews: 120 },
            { id: 2, image: tc, name: "Shree Logistics", verified: true, matchPercent: 88, vehicle: "Eicher 8 Ton (Container)", type: "Container", vehicleNo: "MH14 CD 5678", used: 2, total: 8, price: 7200, driver: "Suresh Patil", rating: 4.6, reviews: 84 },
            { id: 3, image: tc, name: "Sahyadri Carriers", verified: false, matchPercent: 76, vehicle: "Ashok Leyland 12 Ton (Open Body)", type: "Open Body", vehicleNo: "MH12 EF 9012", used: 6, total: 12, price: 9800, driver: "Anil Jadhav", rating: 4.2, reviews: 41 },
            { id: 4, image: tc, name: "CoolMove Freight", verified: true, matchPercent: 81, vehicle: "Mahindra 5 Ton (Refrigerated)", type: "Refrigerated", vehicleNo: "MH43 GH 3456", used: 1, total: 5, price: 12400, driver: "Imran Shaikh", rating: 4.9, reviews: 203 },
        ].map((t) => ({ ...t, route, dep, arr })),
        [route, dep, arr]
    );

    const visible = trucks
        .filter((t) => t.price <= filters.maxPrice)
        .filter((t) => t.matchPercent >= filters.minMatch)
        .filter((t) => !filters.types.length || filters.types.includes(t.type))
        .filter((t) => !filters.verifiedOnly || t.verified)
        .sort(SORTS[sort].fn);

    const activeFilters =
        (filters.maxPrice !== 15000) + (filters.minMatch !== 0) + filters.types.length + filters.verifiedOnly;

    const reset = () => setFilters(defaults);
    const request = (id) => setRequested((r) => (r.includes(id) ? r : [...r, id]));

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <main className="w-full px-7 pb-8 pt-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Find Available Trucks</h1>
                <p className="mt-1 text-slate-600">
                    We found {trucks.length} trucks travelling on your route or nearby routes.
                </p>

                <div className="mt-7 grid items-start gap-7 lg:grid-cols-[1fr_300px] xl:grid-cols-[240px_1fr_300px]">
                    {/* Filters */}
                    <div className="min-w-0 lg:col-span-2 xl:col-span-1">
                        <button
                            type="button"
                            onClick={() => setShowFilters((s) => !s)}
                            aria-expanded={showFilters}
                            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm xl:hidden"
                        >
                            <span className="flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4" /> Filters
                                {activeFilters > 0 && (
                                    <span className="rounded-full bg-blue-700 px-2 py-0.5 text-xs text-white">{activeFilters}</span>
                                )}
                            </span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                        </button>
                        <div className={`${showFilters ? "mt-4 block" : "hidden"} xl:sticky xl:top-6 xl:mt-0 xl:block`}>
                            <FilterPanel filters={filters} setFilters={setFilters} reset={reset} />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="min-w-0 space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-sm font-bold text-blue-950">{visible.length} Trucks Found</span>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <label htmlFor="sort">Sort by</label>
                                <div className="relative">
                                    <select
                                        id="sort"
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        className={`${inputBase} w-auto appearance-none pr-9`}
                                    >
                                        {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-500" />
                                </div>
                            </div>
                        </div>

                        {visible.map((t) => (
                            <TruckCard key={t.id} truck={t} requested={requested.includes(t.id)} onRequest={request} />
                        ))}

                        {!visible.length && (
                            <Card className="flex flex-col items-center gap-3 py-14 text-center">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                    <SearchX className="h-6 w-6 text-slate-400" />
                                </span>
                                <p className="font-semibold text-slate-800">No trucks match these filters</p>
                                <p className="text-sm text-slate-500">Raise the price limit or remove a filter to see more trucks.</p>
                                <button type="button" onClick={reset} className="mt-1 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
                                    Reset filters
                                </button>
                            </Card>
                        )}
                    </div>

                    {/* Map + shipment details */}
                    <div className="min-w-0 space-y-7 lg:sticky lg:top-6">
                        <Card>
                            <div className="flex items-center justify-between">
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
                                    onClick={() => navigate("/shipment")}
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
                                    <div className="truncate text-sm font-semibold" title={pickup.location}>{pickup.location}</div>
                                    {dep !== "Flexible" && <div className="text-xs text-slate-400">{pickup.date}{pickup.time && `, ${pickup.time}`}</div>}
                                </div>
                                <div className="relative min-w-0">
                                    <span className="absolute -left-7 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500 ring-1 ring-red-200" />
                                    <div className="text-xs text-slate-500">Delivery</div>
                                    <div className="truncate text-sm font-semibold" title={delivery.location}>{delivery.location}</div>
                                    {arr !== "Flexible" && <div className="text-xs text-slate-400">{delivery.date}{delivery.time && `, ${delivery.time}`}</div>}
                                </div>
                            </div>

                            <div className="mt-5 flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                                <Package className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900">{parcel.category}</div>
                                    <div className="text-xs text-slate-500">
                                        {parcel.packages} packages · {parcel.weight} kg · {parcel.volume} m³
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
        </div>
    );
}
=======
export default Find;
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
=======
export default Find;
>>>>>>> 96d284424f2df9dbc6d4d4a4c2f2a1ceae46b657
