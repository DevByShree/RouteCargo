import { useNavigate } from "react-router-dom";
import {
    Truck, Clock, ClipboardCheck, Ban, ChevronRight, Plus, Maximize2, MapPin,
    ArrowRight, Navigation, PackageSearch,
} from "lucide-react";
import indImage from "../../../assets/ind.png";

const STATS = [
    { label: "Available Trucks", value: 8, Icon: Truck, bg: "bg-blue-50", color: "text-blue-600", to: "/Find" },
    { label: "Active Bookings", value: 5, Icon: Clock, bg: "bg-orange-50", color: "text-orange-500", to: "" },
    { label: "Completed", value: 12, Icon: ClipboardCheck, bg: "bg-emerald-50", color: "text-emerald-600", to: "" },
    { label: "Booking Cancelled", value: 3, Icon: Ban, bg: "bg-red-50", color: "text-red-600", to: "" },
];

// Replace with data from your API
const TRIPS = [
    { id: "#TR2026092201", pickup: "Pune", destination: "Mumbai", vehicle: "Tata 10 Ton", vehicleNo: "MH12 AB 1234", status: "In Transit", eta: "Today, 06:00 PM" },
    { id: "#TR2026092107", pickup: "Nashik", destination: "Mumbai", vehicle: "Eicher 7 Ton", vehicleNo: "MH14 CD 5678", status: "Loading", eta: "Tomorrow, 11:00 PM" },
];

const TRIP_STATUS = {
    "In Transit": { style: "bg-blue-50 text-blue-700", dot: "bg-blue-600" },
    Loading: { style: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
};

function Card({ title, action, children, className = "" }) {
    return (
        <section className={`flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 ${className}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="truncate text-lg font-bold text-blue-950">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

function PinLabel({ left, top, label, color }) {
    return (
        <div className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center" style={{ left, top }}>
            <span className="whitespace-nowrap rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-slate-800 shadow-sm">{label}</span>
            <MapPin className={`h-6 w-6 fill-current ${color}`} strokeWidth={1.5} />
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <main className="w-full px-7 pb-8 pt-10">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Welcome back, Shree!</h1>
                        <p className="mt-1 text-slate-600">Here's your shipping summary.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/shipment")}
                        className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800"
                    >
                        <Plus className="h-4 w-4" /> Create New Shipment
                    </button>
                </div>

                {/* Stats */}
                <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-7">
                    {STATS.map(({ label, value, Icon, bg, color, to }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => navigate(to)}
                            className="group flex min-w-0 items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200"
                        >
                            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
                                <Icon className="h-6 w-6" strokeWidth={1.7} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-2xl font-bold text-slate-900">{value}</span>
                                <span className="block truncate text-sm text-slate-500">{label}</span>
                            </span>
                            <ChevronRight className="hidden h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-blue-600 sm:block" />
                        </button>
                    ))}
                </div>

                {/* Main content */}
                <div className="mt-7 grid items-stretch gap-7 xl:grid-cols-12">
                    <Card
                        title="Active Trips"
                        className="xl:col-span-8"
                        action={
                            <button type="button" onClick={() => navigate("/bookings")} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800">
                                {/* View all <ChevronRight className="h-4 w-4" /> */}
                            </button>
                        }
                    >
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full min-w-[700px] text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-xs font-medium text-slate-600">
                                        {["Trip ID", "Route", "Vehicle", "Status", "ETA", ""].map((h, i) => (
                                            <th key={i} className="px-4 py-3 font-medium">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {TRIPS.map((t) => {
                                        const st = TRIP_STATUS[t.status];
                                        return (
                                            <tr key={t.id} className="text-slate-700 hover:bg-slate-50/70">
                                                <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">{t.id}</td>
                                                <td className="whitespace-nowrap px-4 py-4">
                                                    <span className="flex items-center gap-2 font-medium text-slate-900">
                                                        {t.pickup} <ArrowRight className="h-3.5 w-3.5 text-slate-400" /> {t.destination}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-slate-900">{t.vehicle}</div>
                                                    <div className="text-xs text-slate-400">{t.vehicleNo}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${st.style}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} /> {t.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-4">{t.eta}</td>
                                                <td className="px-4 py-4 text-right">
                                                    {/* <button
                                                        type="button"
                                                        onClick={() => navigate("/tracking", { state: { trip: t } })}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Navigation className="h-3.5 w-3.5" /> Track
                                                    </button> */}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {TRIPS.length === 0 && (
                                <div className="flex flex-col items-center gap-3 py-12 text-center">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                        <PackageSearch className="h-6 w-6 text-slate-400" />
                                    </span>
                                    <p className="font-semibold text-slate-800">No active trips</p>
                                    <p className="text-sm text-slate-500">Create a shipment to see your trips here.</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card title="Live Tracking" className="xl:col-span-4">
                        <div
                            className="relative min-h-64 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 bg-cover bg-center"
                            style={{ backgroundImage: `url(${indImage})` }}
                            role="img"
                            aria-label="Map showing the route from Pune to Mumbai"
                        >
                            <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
                                <path
                                    d="M40 50 C 90 70, 120 60, 170 110 S 230 150, 250 165"
                                    fill="none"
                                    stroke="#2563eb"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                />
                            </svg>

                            <PinLabel left="13.3%" top="25%" label="Mumbai" color="text-red-500" />
                            <PinLabel left="83.3%" top="82.5%" label="Pune" color="text-emerald-600" />

                            <button
                                type="button"
                                // onClick={() => navigate("/tracking")}
                                aria-label="Open full tracking map"
                                className="absolute right-3 top-3 rounded-lg bg-white p-2 text-slate-700 shadow-md hover:bg-slate-50"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </button>
                        </div>
                    </Card>
                </div>
            </main >
        </div >
    );
}