import { FaTruck, FaTruckMoving, FaTruckPickup, FaWallet, FaClipboardCheck, FaRegClock, FaLeaf, FaStar, FaUserCircle, FaMapMarkerAlt, FaRegCheckSquare, FaRegCalendarAlt, FaRegCalendarCheck, FaShippingFast, FaCreditCard, FaCheck, FaBoxOpen, } from "react-icons/fa";
import { FiChevronRight, FiPlus, FiArrowRight, FiBox, FiMaximize2 } from "react-icons/fi";

const stats = [
    { label: "Active Shipments", value: "4", Icon: FaTruck, bg: "bg-blue-100", color: "text-blue-600" },
    { label: "Pending Requests", value: "2", Icon: FaRegClock, bg: "bg-orange-100", color: "text-orange-500" },
    { label: "Completed Deliveries", value: "12", Icon: FaClipboardCheck, bg: "bg-green-100", color: "text-green-600" },
    { label: "Total Spent", value: "₹ 48,250", Icon: FaWallet, bg: "bg-purple-100", color: "text-purple-600" },
];

const statusStyle = {
    "In Transit": "bg-green-100 text-green-700",
    "Picked Up": "bg-blue-100 text-blue-700",
    "Booking Confirmed": "bg-orange-100 text-orange-600",
    Delivered: "bg-green-100 text-green-700",
    Scheduled: "bg-blue-100 text-blue-700",
    Pending: "bg-orange-100 text-orange-600",
};

const activeShipments = [
    { id: "#SH00123", from: "Pune", to: "Mumbai", load: "2 Ton", cargo: "Electronics", status: "In Transit", etaLabel: "ETA", eta: "22 Sep, 4:30 PM" },
    { id: "#SH00120", from: "Mumbai", to: "Nashik", load: "1.5 Ton", cargo: "Machinery", status: "Picked Up", etaLabel: "ETA", eta: "23 Sep, 11:20 AM" },
    { id: "#SH00118", from: "Pune", to: "Ahmedabad", load: "0.8 Ton", cargo: "Packaging", status: "Booking Confirmed", etaLabel: "ETA", eta: "25 Sep, 9:00 AM" },
    { id: "#SH00115", from: "Nashik", to: "Indore", load: "1.2 Ton", cargo: "Food Products", status: "Delivered", etaLabel: "Delivered", eta: "20 Sep, 2:15 PM" },
];

const upcoming = [
    { id: "#SH00128", from: "Pune", to: "Bengaluru", load: "1.8 Ton", cargo: "Auto Parts", date: "28 Sep 2026", time: "09:00 AM", status: "Scheduled" },
    { id: "#SH00130", from: "Mumbai", to: "Jaipur", load: "2.5 Ton", cargo: "Textiles", date: "30 Sep 2026", time: "08:00 AM", status: "Pending" },
    { id: "#SH00132", from: "Pune", to: "Delhi", load: "1 Ton", cargo: "Documents", date: "02 Oct 2026", time: "10:00 AM", status: "Scheduled" },
];

const spending = [
    { month: "Apr", amount: 12000 },
    { month: "May", amount: 15000 },
    { month: "Jun", amount: 19500 },
    { month: "Jul", amount: 25000 },
    { month: "Aug", amount: 31000 },
    { month: "Sep", amount: 37000 },
];
const MAX_SPEND = 40000;

const activity = [
    { text: "Booking confirmed", ref: "#SH00118", time: "", Icon: FaRegCalendarCheck, bg: "bg-green-100", color: "text-green-600" },
    { text: "Payment of ₹8,500 completed", ref: "#SH00120", time: "3 hours ago", Icon: FaCreditCard, bg: "bg-blue-100", color: "text-blue-600" },
    { text: "Driver started trip", ref: "#SH00123", time: "1 day ago", Icon: FaTruckPickup, bg: "bg-orange-100", color: "text-orange-500" },
    { text: "Shipment delivered", ref: "#SH00115", time: "2 days ago", Icon: FaCheck, bg: "bg-green-100", color: "text-green-600" },
    { text: "New booking request", ref: "#SH00128", time: "2 days ago", Icon: FaBoxOpen, bg: "bg-purple-100", color: "text-purple-600" },
];

const quickActions = [
    { label: "Create New Shipment", Icon: FaRegCheckSquare },
    { label: "Find Available Trucks", Icon: FaTruckMoving },
    { label: "Track a Shipment", Icon: FaShippingFast },
    { label: "Manage Bookings", Icon: FaRegCalendarAlt },
    { label: "Saved Addresses", Icon: FaMapMarkerAlt },
];

function Card({ title, children, action = "View All", className = "" }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm p-5 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">{title}</h2>
                {action && <button className="text-sm text-blue-600 font-medium">{action}</button>}
            </div>
            {children}
        </div>
    );
}

function Badge({ status }) {
    return <span className={`text-xs font-medium px-3 py-1 rounded-md whitespace-nowrap ${statusStyle[status]}`}>{status}</span>;
}

function ShipmentIcon() {
    return (
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <FaTruck size={16} />
        </div>
    );
}

function Route({ from, to }) {
    return (
        <p className="text-sm flex items-center gap-1.5">
            {from} <FiArrowRight className="text-gray-500" /> <b>{to}</b>
        </p>
    );
}

function Load({ load, cargo }) {
    return (
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <FiBox className="text-amber-700" /> {load} • {cargo}
        </p>
    );
}

function Dashboard() {
    return (
        <div className="px-8 py-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, Shree! 👋</h1>
                    <p className="text-gray-600">Here's your shipping summary</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-blue-50 text-sm text-gray-700 rounded-lg px-4 py-2 hidden md:flex items-center gap-2">
                        “Smarter shipping today, a greener tomorrow.” <FaLeaf className="text-green-600" />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2">
                        <FiPlus size={18} /> Create New Shipment
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map(({ label, value, Icon, bg, color }) => (
                    <div key={label} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} ${color}`}>
                            <Icon size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-2xl font-bold text-slate-900">{value}</p>
                            <p className="text-sm text-gray-600">{label}</p>
                        </div>
                        <FiChevronRight className="text-gray-400" size={18} />
                    </div>
                ))}
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <Card title="Active Shipments" className="xl:col-span-5">
                    <ul className="divide-y">
                        {activeShipments.map((s) => (
                            <li key={s.id} className="flex items-center gap-3 py-3">
                                <ShipmentIcon />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold">{s.id}</p>
                                    <Route from={s.from} to={s.to} />
                                    <Load load={s.load} cargo={s.cargo} />
                                </div>
                                <Badge status={s.status} />
                                <div className="text-xs text-gray-500 w-28 text-right">
                                    <p>{s.etaLabel}</p>
                                    <p className="text-sm text-gray-700">{s.eta}</p>
                                </div>
                                <FiChevronRight className="text-gray-400" size={18} />
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card title="Live Tracking" className="xl:col-span-4">
                    {/* Map placeholder - yahan Google Maps / Leaflet laga sakte ho */}
                    <div className="relative h-64 rounded-lg bg-gradient-to-br from-sky-100 to-green-100 overflow-hidden">
                        <svg viewBox="0 0 300 200" className="absolute inset-0 w-full h-full">
                            <path d="M40 50 C 90 70, 120 60, 170 110 S 230 150, 250 165" fill="none" stroke="#2563eb" strokeWidth="3" />
                        </svg>

                        {/* Pins */}
                        <FaMapMarkerAlt
                            size={22}
                            className="absolute text-red-500 -translate-x-1/2 -translate-y-full"
                            style={{ left: "13.3%", top: "25%" }}
                        />
                        <FaMapMarkerAlt
                            size={22}
                            className="absolute text-green-600 -translate-x-1/2 -translate-y-full"
                            style={{ left: "83.3%", top: "82.5%" }}
                        />
                        <span className="absolute left-2 top-[30%] text-xs font-medium">Mumbai</span>
                        <span className="absolute right-4 top-[72%] text-xs font-medium">Pune</span>

                        <button className="absolute top-3 right-3 bg-white rounded-md p-2 shadow text-gray-700">
                            <FiMaximize2 size={14} />
                        </button>

                        <div className="absolute bottom-3 left-3 right-3 bg-white rounded-lg shadow p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center text-amber-700">
                                <FaTruck size={18} />
                            </div>
                            <div className="flex-1 text-xs">
                                <p className="font-semibold">
                                    #SH00123 <span className="ml-1 bg-green-100 text-green-700 px-2 py-0.5 rounded">In Transit</span>
                                </p>
                                <p className="flex items-center gap-1">
                                    Pune <FiArrowRight /> Mumbai
                                </p>
                                <p className="text-gray-500">ETA: 4:30 PM</p>
                            </div>
                            <FaUserCircle size={36} className="text-gray-400" />
                            <div className="text-xs">
                                <p className="font-semibold">Ramesh Kumar</p>
                                <p className="flex items-center gap-1">
                                    <FaStar className="text-orange-400" /> 4.8 (120)
                                </p>
                                <p className="text-gray-500">MH12 AB 1234</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="xl:col-span-3 flex flex-col gap-5">
                    <div className="rounded-xl p-5 text-white bg-gradient-to-br from-slate-700 to-slate-900">
                        <h3 className="font-bold text-lg">Need to ship something?</h3>
                        <p className="text-sm text-slate-200 mt-1">Find trucks that are already going your way and save up to 30%.</p>
                        {/* <button className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
                            Create Shipment →
                        </button> */}
                    </div>
                    <Card title="Quick Actions" action={null}>
                        <ul className="flex flex-col gap-3">
                            {quickActions.map(({ label, Icon }) => (
                                <li key={label} className="flex items-center gap-3 text-sm cursor-pointer hover:text-blue-600">
                                    <Icon className="text-blue-600" size={16} />
                                    <span className="flex-1">{label}</span>
                                    <FiChevronRight className="text-gray-400" size={16} />
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <Card title="Upcoming Shipments" className="xl:col-span-4">
                    <ul className="divide-y">
                        {upcoming.map((s) => (
                            <li key={s.id} className="flex items-center gap-3 py-3">
                                <ShipmentIcon />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold">{s.id}</p>
                                    <Route from={s.from} to={s.to} />
                                    <Load load={s.load} cargo={s.cargo} />
                                </div>
                                <div className="text-xs text-gray-600 text-right">
                                    <p>{s.date}</p>
                                    <p>{s.time}</p>
                                </div>
                                <Badge status={s.status} />
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card title="Spending Overview" action={null} className="xl:col-span-4">
                    <p className="text-3xl font-bold">₹ 28,450</p>
                    <p className="text-sm text-green-600 mb-4">↑ 12% from last month</p>
                    <div className="flex items-end gap-3 h-40 border-b border-l pl-2">
                        {spending.map((s, i) => (
                            <div key={s.month} className="flex-1 flex flex-col items-center justify-end h-full">
                                <div
                                    title={`₹ ${s.amount.toLocaleString("en-IN")}`}
                                    className={`w-full rounded-t ${i === spending.length - 1 ? "bg-blue-600" : "bg-blue-400"}`}
                                    style={{ height: `${(s.amount / MAX_SPEND) * 100}%` }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 pl-2 mt-1 text-xs text-gray-500">
                        {spending.map((s) => (
                            <span key={s.month} className="flex-1 text-center">
                                {s.month}
                            </span>
                        ))}
                    </div>
                </Card>

                <Card title="Recent Activity" className="xl:col-span-4">
                    <ul className="flex flex-col gap-3">
                        {activity.map(({ text, ref, time, Icon, bg, color }, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${bg} ${color}`}>
                                    <Icon size={15} />
                                </div>
                                <div className="flex-1 text-sm">
                                    <p>{text}</p>
                                    <p className="text-xs text-gray-500">{ref}</p>
                                </div>
                                <span className="text-xs text-gray-500">{time}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;