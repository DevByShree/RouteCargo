import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus, Search, ChevronDown, ChevronRight, Star, BadgeCheck, Clock, Check, Truck,
    X, Package, Scale, Boxes, ArrowRight, SearchX, CircleDot, MapPin,
} from "lucide-react";
import tc from "../../../assets/tc.png";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();

const STATUS = {
    pending: { label: "Pending", icon: Clock, style: "bg-amber-50 text-amber-700" },
    accepted: { label: "Accepted", icon: Check, style: "bg-emerald-50 text-emerald-700" },
    transit: { label: "In Transit", icon: Truck, style: "bg-blue-50 text-blue-700" },
    delivered: { label: "Delivered", icon: BadgeCheck, style: "bg-emerald-50 text-emerald-700" },
    cancelled: { label: "Cancelled", icon: X, style: "bg-red-50 text-red-700" },
};

const TABS = [
    { id: "all", label: "All Bookings" },
    ...Object.entries(STATUS).map(([id, s]) => ({ id, label: s.label })),
];

const TIME_FILTERS = {
    all: { label: "All Time", days: Infinity },
    30: { label: "Last 30 days", days: 30 },
    90: { label: "Last 90 days", days: 90 },
};

const SORTS = {
    latest: { label: "Latest First", fn: (a, b) => b.createdAt - a.createdAt },
    oldest: { label: "Oldest First", fn: (a, b) => a.createdAt - b.createdAt },
};

// Replace with data from your API
const BOOKINGS = [
    {
        id: "#BK2026092201", createdAt: NOW - 3 * DAY, image: tc, transporter: "Ramesh Transport", rating: 4.8, reviews: 120,
        vehicleNo: "MH12 AB 1234", vehicle: "Tata 10 Ton (Closed Body)", from: "Pune", fromTime: "22 Sep, 09:00 AM",
        to: "Mumbai", toTime: "23 Sep, 06:00 PM", packages: 10, weight: "1,200 kg", volume: "0.72 m³", status: "pending",
        note: "Driver will respond soon", subNote: "Usually within a few hours.",
    },
    {
        id: "#BK2026092107", createdAt: NOW - 4 * DAY, image: tc, transporter: "Patil Logistics", rating: 4.6, reviews: 98,
        vehicleNo: "MH14 CD 5678", vehicle: "Eicher 7 Ton", from: "Nashik", fromTime: "21 Sep, 05:00 PM",
        to: "Mumbai", toTime: "22 Sep, 11:00 PM", packages: 5, weight: "800 kg", volume: "0.45 m³", status: "accepted",
        note: "Driver accepted your request", subNote: "Proceed with payment to confirm.",
    },
    {
        id: "#BK2026091514", createdAt: NOW - 10 * DAY, image: tc, transporter: "Sahyadri Carriers", rating: 4.2, reviews: 41,
        vehicleNo: "MH12 EF 9012", vehicle: "Ashok Leyland 12 Ton", from: "Pune", fromTime: "15 Sep, 08:00 AM",
        to: "Thane", toTime: "15 Sep, 02:00 PM", packages: 14, weight: "2,400 kg", volume: "1.20 m³", status: "transit",
        note: "Your shipment is on the way", subNote: "Expected delivery today, 02:00 PM.",
    },
    {
        id: "#BK2026090803", createdAt: NOW - 25 * DAY, image: tc, transporter: "Shree Logistics", rating: 4.6, reviews: 84,
        vehicleNo: "MH14 GH 3456", vehicle: "Eicher 8 Ton (Container)", from: "Chakan", fromTime: "08 Sep, 07:00 AM",
        to: "Navi Mumbai", toTime: "08 Sep, 03:00 PM", packages: 8, weight: "1,050 kg", volume: "0.60 m³", status: "delivered",
        note: "Delivered successfully", subNote: "Received on 08 Sep, 03:10 PM.",
    },
    {
        id: "#BK2026082220", createdAt: NOW - 60 * DAY, image: tc, transporter: "CoolMove Freight", rating: 4.9, reviews: 203,
        vehicleNo: "MH43 JK 7890", vehicle: "Mahindra 5 Ton (Refrigerated)", from: "Pune", fromTime: "22 Aug, 06:00 AM",
        to: "Panvel", toTime: "22 Aug, 12:00 PM", packages: 3, weight: "400 kg", volume: "0.30 m³", status: "cancelled",
        note: "Booking was cancelled", subNote: "No payment was taken.",
    },
];

const fmtDate = (ms) =>
    new Date(ms).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });

const selectCls =
    "h-11 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Select({ value, onChange, options, label }) {
    return (
        <div className="relative">
            <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${selectCls} w-full`}>
                {Object.entries(options).map(([key, o]) => <option key={key} value={key}>{o.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
        </div>
    );
}

function Meta({ icon: Icon, children }) {
    return (
        <span className="flex items-center gap-2 text-sm text-slate-600">
            <Icon className="h-4 w-4 shrink-0 text-slate-400" /> {children}
        </span>
    );
}

function BookingCard({ b, onPay, onTrack }) {
    const s = STATUS[b.status];
    const StatusIcon = s.icon;

    return (
        <article className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200">
            {/* Top row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
                <div className="flex items-baseline gap-3">
                    <span className="text-sm font-bold text-blue-950">{b.id}</span>
                    <span className="text-xs text-slate-400">{fmtDate(b.createdAt)}</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.style}`}>
                    <StatusIcon className="h-3.5 w-3.5" /> {s.label}
                </span>
            </div>

            {/* Body */}
            <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-[1.3fr_1.2fr_1fr_1.1fr_auto] xl:items-center">
                {/* Transporter */}
                <div className="flex min-w-0 items-center gap-3">
                    <img src={b.image} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-slate-100 object-cover" />
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">{b.transporter}</div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {b.rating} ({b.reviews})
                        </div>
                        <div className="mt-0.5 truncate text-xs text-slate-500" title={`${b.vehicleNo} · ${b.vehicle}`}>
                            {b.vehicleNo} · {b.vehicle}
                        </div>
                    </div>
                </div>

                {/* Route */}
                <div className="relative min-w-0 space-y-4 pl-6">
                    <span className="absolute left-[6px] top-2 h-[calc(100%-1rem)] w-px bg-slate-200" />
                    <div className="relative">
                        <CircleDot className="absolute -left-6 top-0.5 h-3.5 w-3.5 text-emerald-600" />
                        <div className="text-sm font-semibold text-slate-900">{b.from}</div>
                        <div className="text-xs text-slate-400">{b.fromTime}</div>
                    </div>
                    <div className="relative">
                        <MapPin className="absolute -left-6 top-0.5 h-3.5 w-3.5 text-red-500" />
                        <div className="text-sm font-semibold text-slate-900">{b.to}</div>
                        <div className="text-xs text-slate-400">{b.toTime}</div>
                    </div>
                </div>

                {/* Parcel */}
                <div className="space-y-1.5">
                    <Meta icon={Boxes}>{b.packages} packages</Meta>
                    <Meta icon={Scale}>{b.weight}</Meta>
                    <Meta icon={Package}>{b.volume}</Meta>
                </div>

                {/* Note */}
                <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800">{b.note}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{b.subNote}</div>
                </div>

                {/* Action */}
                <div className="flex items-center md:col-span-2 xl:col-span-1 xl:justify-end">
                    {b.status === "accepted" ? (
                        <button type="button" onClick={() => onPay(b)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800 xl:w-auto">
                            Pay Now <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : b.status === "transit" ? (
                        <button type="button" onClick={() => onTrack(b)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-6 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 xl:w-auto">
                            Track <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button type="button" className="flex w-full items-center justify-center gap-1 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 xl:w-auto">
                            View details <ChevronRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function MyBookings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all");
    const [query, setQuery] = useState("");
    const [time, setTime] = useState("all");
    const [sort, setSort] = useState("latest");

    const counts = useMemo(() => {
        const c = { all: BOOKINGS.length };
        BOOKINGS.forEach((b) => { c[b.status] = (c[b.status] || 0) + 1; });
        return c;
    }, []);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const maxAge = TIME_FILTERS[time].days * DAY;
        return BOOKINGS
            .filter((b) => activeTab === "all" || b.status === activeTab)
            .filter((b) => NOW - b.createdAt <= maxAge)
            .filter(
                (b) =>
                    !q ||
                    [b.id, b.transporter, b.from, b.to, b.vehicleNo].some((v) => v.toLowerCase().includes(q))
            )
            .sort(SORTS[sort].fn);
    }, [activeTab, query, time, sort]);

    const hasFilters = query || time !== "all" || activeTab !== "all";
    const clearAll = () => { setQuery(""); setTime("all"); setActiveTab("all"); };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <main className="w-full px-7 pb-8 pt-10">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">My Bookings</h1>
                        <p className="mt-1 text-slate-600">Track and manage all your shipments in one place.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/shipment")}
                        className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800"
                    >
                        <Plus className="h-4 w-4" /> Create New Shipment
                    </button>
                </div>

                {/* Tabs */}
                <div role="tablist" aria-label="Booking status" className="mt-7 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                    {TABS.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                role="tab"
                                type="button"
                                aria-selected={active}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${active ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {tab.label}
                                <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                                    {counts[tab.id] || 0}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_180px]">
                    <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                        <Search className="h-4 w-4 shrink-0 text-slate-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search bookings"
                            placeholder="Search by booking ID, transporter, route..."
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="text-slate-400 hover:text-slate-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Select label="Time period" value={time} onChange={setTime} options={TIME_FILTERS} />
                    <Select label="Sort order" value={sort} onChange={setSort} options={SORTS} />
                </div>

                {/* List */}
                <div className="mt-5 space-y-5">
                    {visible.map((b) => (
                        <BookingCard
                            key={b.id}
                            b={b}
                            onPay={(x) => navigate("/payments", { state: { booking: x } })}
                            onTrack={(x) => navigate("/tracking", { state: { booking: x } })}
                        />
                    ))}

                    {!visible.length && (
                        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                <SearchX className="h-6 w-6 text-slate-400" />
                            </span>
                            <p className="font-semibold text-slate-800">No bookings found</p>
                            <p className="text-sm text-slate-500">
                                {hasFilters ? "Try a different search or clear your filters." : "Create a shipment to see your bookings here."}
                            </p>
                            {hasFilters && (
                                <button type="button" onClick={clearAll} className="mt-1 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <p className="mt-6 text-xs text-slate-500">
                    {visible.length
                        ? `Showing 1–${visible.length} of ${visible.length} booking${visible.length === 1 ? "" : "s"}`
                        : "Showing 0 bookings"}
                </p>
            </main>
        </div>
    );
}