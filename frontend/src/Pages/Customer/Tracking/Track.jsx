import { useEffect, useRef, useState } from "react";
import {
    Link2, Check, Clock, MapPin, CircleDot, Package, Scale, Boxes, ArrowRight, Phone,
    MessageCircle, BadgeCheck, Star, Truck, Gauge, Ruler, Timer, FileText, PartyPopper,
    PackageCheck, PackageOpen, Route as RouteIcon,
} from "lucide-react";
import mapImg from "../../../assets/map.png";

// Replace with data from your API / location.state
const SHIPMENT = {
    id: "BK2026091803",
    status: "In Transit",
    transporter: "Shree Roadlines",
    vehicleNo: "MH12 XY 9012",
    vehicle: "Ashok Leyland 12 Ton",
    pickup: { location: "Pune", state: "Maharashtra", date: "18 Sep 2026", time: "09:00 AM" },
    delivery: { location: "Bengaluru", state: "Karnataka", date: "20 Sep 2026", time: "08:00 PM" },
    parcelType: "Electronics",
    packages: 15,
    weight: "2,400 kg",
    volume: "1.10 m³",
    eta: "Today, 08:00 PM",
};

const LIVE = {
    currentLocation: "Near Hubballi, Karnataka",
    lastUpdated: "19 Sep 2026, 04:20 PM",
    speed: "80 km/h",
    coveredKm: 820,
    remainingKm: 280,
};

const DRIVER = { name: "Amit Jadhav", phone: "+910000000000", rating: 4.5, reviews: 76, verified: true };

const ACTIVITY = [
    { icon: Truck, title: "Crossed Hubballi toll plaza", time: "19 Sep, 04:20 PM", done: true, current: true },
    { icon: Truck, title: "Left Belagavi checkpoint", time: "19 Sep, 01:05 PM", done: true },
    { icon: PackageCheck, title: "Parcel picked up from Pune", time: "18 Sep, 09:20 AM", done: true },
    { icon: Check, title: "Booking confirmed and paid", time: "17 Sep, 06:45 PM", done: true },
];

const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function Card({ className = "", children }) {
    return (
        <section className={`min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
            {children}
        </section>
    );
}

function Row({ icon: Icon, label, children }) {
    return (
        <div className="flex items-start justify-between gap-4 text-sm">
            <span className="flex shrink-0 items-center gap-2 text-slate-500">
                <Icon className="h-4 w-4 text-slate-400" /> {label}
            </span>
            <span className="min-w-0 text-right font-semibold text-slate-900">{children}</span>
        </div>
    );
}

export default function TrackShipment() {
    const [mapMode, setMapMode] = useState("map"); // hook this up to your map library (roadmap / satellite)
    const [copied, setCopied] = useState(false);
    const timer = useRef(null);
    const s = SHIPMENT;

    const totalKm = LIVE.coveredKm + LIVE.remainingKm;
    const percent = Math.round((LIVE.coveredKm / totalKm) * 100);

    useEffect(() => () => clearTimeout(timer.current), []);

    const shareLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/track/${s.id}`);
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt("Copy this tracking link:", `${window.location.origin}/track/${s.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <main className="w-full px-7 pb-8 pt-10">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Track Your Shipment</h1>
                        <p className="mt-1 text-slate-600">Real-time location and delivery status of your shipment.</p>
                    </div>
                    <button
                        type="button"
                        onClick={shareLink}
                        className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                    >
                        {copied ? <><Check className="h-4 w-4" /> Link copied</> : <><Link2 className="h-4 w-4" /> Share Tracking Link</>}
                    </button>
                </div>

                {/* Summary bar */}
                <Card className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-[1.3fr_1.4fr_1fr_auto] xl:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                            <Truck className="h-7 w-7 text-blue-700" strokeWidth={1.6} />
                        </span>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold text-blue-950">#{s.id}</span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> {s.status}
                                </span>
                            </div>
                            <div className="mt-0.5 truncate text-sm text-slate-700">{s.transporter}</div>
                            <div className="truncate text-xs text-slate-500">{s.vehicleNo} · {s.vehicle}</div>
                        </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                                <CircleDot className="h-3.5 w-3.5 text-emerald-600" /> {s.pickup.location}
                            </div>
                            <div className="text-xs text-slate-400">{s.pickup.date}, {s.pickup.time}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                                <MapPin className="h-3.5 w-3.5 text-red-500" /> {s.delivery.location}
                            </div>
                            <div className="text-xs text-slate-400">{s.delivery.date}, {s.delivery.time}</div>
                        </div>
                    </div>

                    <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><Boxes className="h-4 w-4 text-slate-400" /> {s.packages} packages</div>
                        <div className="flex items-center gap-2"><Scale className="h-4 w-4 text-slate-400" /> {s.weight}</div>
                        <div className="flex items-center gap-2"><Package className="h-4 w-4 text-slate-400" /> {s.volume}</div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 md:col-span-2 xl:col-span-1">
                        <Clock className="h-6 w-6 shrink-0 text-blue-600" strokeWidth={1.7} />
                        <div>
                            <div className="text-xs text-slate-500">Estimated Arrival</div>
                            <div className="text-sm font-bold text-slate-900">{s.eta}</div>
                            <div className="text-xs text-slate-500">~{LIVE.remainingKm} km remaining</div>
                        </div>
                    </div>
                </Card>

                <div className="mt-7 grid items-start gap-7 lg:grid-cols-[1fr_340px]">
                    {/* Left column */}
                    <div className="min-w-0 space-y-7">
                        <Card>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-base font-bold text-blue-950">Live Tracking</h2>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
                                    </span>
                                </div>
                                <div role="group" aria-label="Map type" className="flex gap-1 rounded-lg bg-slate-100 p-1">
                                    {["map", "satellite"].map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            aria-pressed={mapMode === m}
                                            onClick={() => setMapMode(m)}
                                            className={`rounded-md px-3.5 py-1.5 text-xs font-medium capitalize transition ${mapMode === m ? "bg-blue-700 text-white" : "text-slate-600 hover:text-slate-900"
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200">
                                <img src={mapImg} alt={`Live map showing ${LIVE.currentLocation}`} className="h-80 w-full bg-slate-100 object-cover sm:h-[26rem]" />

                                <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white p-4 shadow-lg sm:inset-x-auto sm:left-3 sm:w-72">
                                    <div className="flex items-start gap-2.5">
                                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                        </span>
                                        <div className="min-w-0">
                                            <div className="text-xs text-slate-500">Current location</div>
                                            <div className="text-sm font-semibold text-slate-900">{LIVE.currentLocation}</div>
                                            <div className="text-xs text-slate-400">Updated {LIVE.lastUpdated}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-500"><Gauge className="h-3.5 w-3.5" /> Speed</div>
                                        <div className="text-right font-semibold text-slate-900">{LIVE.speed}</div>
                                        <div className="flex items-center gap-1.5 text-slate-500"><Timer className="h-3.5 w-3.5" /> Arrival</div>
                                        <div className="text-right font-semibold text-slate-900">{s.eta}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Journey progress */}
                            <div className="mt-6">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-semibold text-slate-900">{percent}% of journey completed</span>
                                    <span className="text-slate-500">{totalKm} km total</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Journey progress">
                                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5" /> {LIVE.coveredKm} km covered</span>
                                    <span className="flex items-center gap-1.5"><RouteIcon className="h-3.5 w-3.5" /> {LIVE.remainingKm} km remaining</span>
                                </div>
                            </div>
                        </Card>

                        {/* Recent activity */}
                        <Card>
                            <h2 className="text-base font-bold text-blue-950">Recent Activity</h2>
                            <ol className="relative mt-5 space-y-6">
                                <span className="absolute bottom-3 left-[15px] top-3 w-px bg-slate-200" aria-hidden="true" />
                                {ACTIVITY.map((a, i) => {
                                    const Icon = a.icon;
                                    return (
                                        <li key={i} className="relative flex items-start gap-4">
                                            <span
                                                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${a.current ? "bg-blue-700 text-white" : "bg-emerald-50 text-emerald-600"
                                                    }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <div className="min-w-0 pt-0.5">
                                                <div className={`text-sm ${a.current ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>{a.title}</div>
                                                <div className="text-xs text-slate-400">{a.time}</div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </Card>
                    </div>

                    {/* Right column */}
                    <div className="min-w-0 space-y-7">
                        <Card>
                            <h2 className="text-base font-bold text-blue-950">Driver Information</h2>
                            <div className="mt-4 flex items-center gap-3">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
                                    {initials(DRIVER.name)}
                                </span>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900">{DRIVER.name}</div>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {DRIVER.rating} ({DRIVER.reviews})</span>
                                        {DRIVER.verified && <span className="flex items-center gap-1 text-emerald-600"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <a href={`tel:${DRIVER.phone}`} className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    <Phone className="h-4 w-4" /> Call
                                </a>
                                <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    <MessageCircle className="h-4 w-4" /> Chat
                                </button>
                            </div>
                            <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                    <Truck className="h-5 w-5 text-slate-500" />
                                </span>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900">{s.transporter}</div>
                                    <div className="truncate text-xs text-slate-500">{s.vehicleNo} · {s.vehicle}</div>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-blue-950">Shipment Details</h2>
                                <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800">
                                    <FileText className="h-3.5 w-3.5" /> View Invoice
                                </button>
                            </div>
                            <div className="mt-4 space-y-3.5">
                                <Row icon={PackageOpen} label="Parcel type">{s.parcelType}</Row>
                                <Row icon={Boxes} label="Packages">{s.packages}</Row>
                                <Row icon={Scale} label="Total weight">{s.weight}</Row>
                                <Row icon={Package} label="Total volume">{s.volume}</Row>
                                <div className="border-t border-slate-100 pt-3.5">
                                    <Row icon={CircleDot} label="Pickup">
                                        {s.pickup.location}, {s.pickup.state}
                                        <span className="block text-xs font-normal text-slate-400">{s.pickup.date}, {s.pickup.time}</span>
                                    </Row>
                                </div>
                                <Row icon={MapPin} label="Delivery">
                                    {s.delivery.location}, {s.delivery.state}
                                    <span className="block text-xs font-normal text-slate-400">{s.delivery.date}, {s.delivery.time}</span>
                                </Row>
                            </div>
                        </Card>

                        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <div>
                                <div className="text-sm font-semibold text-emerald-800">Your shipment is on track</div>
                                <div className="text-xs text-emerald-700">We'll notify you at each important update.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}