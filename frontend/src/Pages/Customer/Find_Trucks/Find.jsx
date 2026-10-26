import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    BadgeCheck, MapPin, Star, SlidersHorizontal, ChevronDown, Pencil, Package,
    Ruler, Timer, CalendarDays, ArrowRight, ArrowLeft, Check, SearchX, Truck as TruckIcon,
} from "lucide-react";
import tc from "../../../assets/tc.png";
import ind from "../../../assets/ind.png";

const DEFAULT_PICKUP = { location: "Pune, Maharashtra", date: "22 Sep 2026", time: "09:00 AM" };
const DEFAULT_DELIVERY = { location: "Mumbai, Maharashtra", date: "23 Sep 2026", time: "06:00 PM" };
const DEFAULT_PARCEL = { category: "Electronics", packages: 10, weight: 1200, volume: 0.72 };

// Accepts either a plain string ("Pune, Maharashtra") or an object ({ location, date, time })
const toPlace = (value, fallback) =>
    !value ? fallback : typeof value === "string" ? { location: value, date: "", time: "" } : { ...fallback, ...value };

const cityOf = (v) => (v || "").split(",")[0].trim();
const rupees = (n) => `₹ ${n.toLocaleString("en-IN")}`;
const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const VEHICLE_TYPES = ["Closed Body", "Open Body", "Container", "Refrigerated"];
const SORTS = {
    best: { label: "Best Match", fn: (a, b) => b.matchPercent - a.matchPercent },
    price: { label: "Price: Low to High", fn: (a, b) => a.price - b.price },
    rating: { label: "Highest Rated", fn: (a, b) => b.rating - a.rating },
    capacity: { label: "Most Space Free", fn: (a, b) => (b.total - b.used) - (a.total - a.used) },
};

const inputBase =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

/* ---------- Pieces ---------- */
function Card({ className = "", children }) {
    return (
        <section className={`min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
            {children}
        </section>
    );
}

function Detail({ icon: Icon, label, value }) {
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Icon className="h-3.5 w-3.5" /> {label}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-slate-900" title={value}>{value}</div>
        </div>
    );
}

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