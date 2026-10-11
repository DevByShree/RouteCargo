import { FaTruck, FaClipboardCheck, FaRegClock, FaMapMarkerAlt } from "react-icons/fa";
import { FiChevronRight, FiPlus, FiMaximize2 } from "react-icons/fi";
import indImage from "../../../assets/ind.png";
import { FaBan } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const stats = [
    { label: "Available Trucks", value: "8", Icon: FaTruck, bg: "bg-blue-100", color: "text-blue-600" },
    { label: "Active Bookings", value: "5", Icon: FaRegClock, bg: "bg-orange-100", color: "text-orange-500" },
    { label: "Completed", value: "12", Icon: FaClipboardCheck, bg: "bg-green-100", color: "text-green-600" },
    { label: "Booking Cancelled", value: "3", Icon: FaBan, bg: "bg-red-100", color: "text-red-600" },
];

function Card({ title, children, className = "" }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-5 min-w-0 flex flex-col ${className}`}>
            <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-bold text-slate-900 truncate">{title}</h2>
            </div>
            {children}
        </div>
    );
}
function MapPin({ left, top, label, color }) {
    return (
        <div
            className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-full"
            style={{ left, top }}>
            <span className="text-xs font-medium whitespace-nowrap bg-white/70 rounded px-1">{label}</span>
            <FaMapMarkerAlt size={22} className={color} />
        </div>
    );
}

function Dashboard() {
    const navigate = useNavigate();
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4 sm:gap-5 max-w-screen-2xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome back, Shree!</h1>
                    <p className="text-sm sm:text-base text-gray-600">Here's your shipping summary</p>
                </div>
                <button
                    onClick={() => navigate("/shipment")}
                    className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 sm:px-6 py-3 rounded-lg flex items-center gap-2 shrink-0">
                    <FiPlus size={18} /> Create New Shipment
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map(({ label, value, Icon, bg, color }) => (
                    <div key={label} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:shadow min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center ${bg} ${color}`}>
                            <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xl sm:text-2xl font-bold text-slate-900">{value}</p>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
                        </div>
                        <FiChevronRight className="text-gray-400 hidden sm:block shrink-0" size={18} />
                    </div>
                ))}
            </div>

            {/* Main content: stacked below xl, 8/4 split at xl */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5">
                <Card title="Active Trips" className="xl:col-span-8">
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <table className="w-full min-w-[650px] text-left text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-600 border-y border-slate-100">
                                    <th className="px-2 py-3 font-semibold">Trip ID</th>
                                    <th className="px-2 py-3 font-semibold">Pickup</th>
                                    <th className="px-2 py-3 font-semibold">Destination</th>
                                    <th className="px-2 py-3 font-semibold">Vehicle</th>
                                    <th className="px-2 py-3 font-semibold">Status</th>
                                    <th className="px-2 py-3 font-semibold">ETA</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {/* Backend data yahan map hoga */}
                            </tbody>
                        </table>

                        {/* Empty state */}
                        <div className="hidden py-8 text-center text-sm text-slate-500">
                            No active trips found.
                        </div>
                    </div>
                </Card>

                <Card title="Live Tracking" className="xl:col-span-4">
                    {/* <div className="relative flex-1 min-h-56 sm:min-h-64 rounded-lg bg-linear-to-br from-sky-100 to-green-100 overflow-hidden"> */}
                    <div
                        className="relative flex-1 min-h-56 sm:min-h-64 rounded-lg bg-cover bg-center overflow-hidden"
                        style={{ backgroundImage: `url(${indImage})` }}                     >
                        <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                            <path
                                d="M40 50 C 90 70, 120 60, 170 110 S 230 150, 250 165"
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="3"
                                vectorEffect="non-scaling-stroke" />
                        </svg>

                        <MapPin left="13.3%" top="25%" label="Mumbai" color="text-red-500" />
                        <MapPin left="83.3%" top="82.5%" label="Pune" color="text-green-600" />

                        <button className="absolute top-3 right-3 bg-white rounded-md p-2 shadow text-gray-700" aria-label="Expand map">
                            <FiMaximize2 size={14} />
                        </button>
                    </div>
                </Card>

                {/* <Card title="Recent Activity" className="xl:col-span-8">
                </Card> */}
            </div>
        </div>
    );
}

export default Dashboard;