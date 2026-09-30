import { useState } from "react";
import tc from "../../../assets/tc.png"

function MyBookings() {

    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { id: "all", label: "All Bookings", count: 2 },
        { id: "pending", label: "Pending", count: 1 },
        { id: "accepted", label: "Accepted", count: 1 },
        { id: "transit", label: "In Transit", count: 0 },
        { id: "delivered", label: "Delivered", count: 0 },
        { id: "cancelled", label: "Cancelled", count: 0 },
    ];

    const bookings = [
        {
            id: "#BK2026092201",
            date: "22 Sep 2026, 10:30 AM",
            image: tc,
            driverImage: tc,
            transporter: "Ramesh Transport",
            rating: 4.8,
            reviews: 120,
            vehicleNo: "MH12 AB 1234",
            vehicle: "Tata 10 Ton (Closed Body)",
            from: "Pune",
            fromTime: "22 Sep, 09:00 AM",
            to: "Mumbai",
            toTime: "23 Sep, 06:00 PM",
            packages: "10 packages",
            weight: "1,200 kg",
            volume: "0.72 m³",
            status: "pending",
            statusLabel: "Pending",
            note: "Driver will respond soon",
            subNote: "Usually within a few hours.",
        },
        {
            id: "#BK2026092107",
            date: "21 Sep 2026, 04:15 PM",
            image: tc,
            driverImage: tc,
            transporter: "Patil Logistics",
            rating: 4.6,
            reviews: 98,
            vehicleNo: "MH14 CD 5678",
            vehicle: "Eicher 7 Ton",
            from: "Nashik",
            fromTime: "21 Sep, 05:00 PM",
            to: "Mumbai",
            toTime: "22 Sep, 11:00 PM",
            packages: "5 packages",
            weight: "800 kg",
            volume: "0.45 m³",
            status: "accepted",
            statusLabel: "Accepted",
            note: "Driver accepted your request",
            subNote: "Proceed with payment to confirm.",
        },
    ];

    const statusStyles = {
        pending: "bg-amber-50 text-amber-700",
        accepted: "bg-green-50 text-green-700",
        transit: "bg-blue-50 text-blue-700",
        delivered: "bg-green-50 text-green-700",
        cancelled: "bg-red-50 text-red-700",
    };

    const statusIcons = {
        pending: "🕐",
        accepted: "✓",
        transit: "🚚",
        delivered: "✓",
        cancelled: "✕",
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 lg:px-8 pt-5 pb-3">
                <div>
                    <div className="font-bold text-2xl text-gray-900">My Bookings</div>
                    <span className="text-gray-500 text-sm">Track and manage all your shipments in one place.</span>
                </div>
                <button className="bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition self-start sm:self-auto">
                    + Create New Shipment
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white border-t border-b border-gray-200 w-full flex items-center gap-6 px-4 sm:px-6 lg:px-8 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`shrink-0 py-3.5 text-sm font-semibold border-b-2 transition
                            ${activeTab === tab.id
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Filter bar */}
            <div className="flex flex-col md:flex-row gap-3 px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by booking ID, driver name, route..."
                        className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white"
                    />
                </div>
                <select className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white">
                    <option>All Status</option>
                </select>
                <select className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white">
                    <option>All Time</option>
                </select>
                <select className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white">
                    <option>Latest First</option>
                </select>
            </div>

            {/* Bookings list */}
            <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8">

                {bookings.map((b) => (
                    <div key={b.id} className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col lg:flex-row gap-4 items-start">

                        {/* ID + image */}
                        <div className="flex gap-3 w-full lg:w-56 shrink-0">
                            <img
                                src={b.image}
                                alt={b.transporter}
                                className="w-24 h-16 rounded-md bg-gray-200 object-cover shrink-0"
                            />
                            <div className="flex flex-col justify-center">
                                <span className="font-semibold text-sm text-gray-900">{b.id}</span>
                                <span className="text-xs text-gray-400">{b.date}</span>
                            </div>
                        </div>

                        {/* Driver info */}
                        <div className="flex items-center gap-2 w-full lg:w-44 shrink-0">
                            <img
                                src={b.image}
                                alt={b.transporter}
                                className="w-9 h-9 rounded-full bg-gray-200 shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-sm truncate">{b.transporter}</span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <span>⭐ {b.rating} ({b.reviews})</span>
                                </div>
                                <span className="text-xs text-green-600">✓ Verified</span>
                            </div>
                        </div>

                        {/* Vehicle */}
                        <div className="hidden xl:flex flex-col gap-0.5 w-32 shrink-0 text-xs text-gray-500">
                            <span>{b.vehicleNo}</span>
                            <span>{b.vehicle}</span>
                        </div>

                        {/* Route */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-green-600">🟢 {b.from}</span>
                                <span className="text-xs text-gray-400">{b.fromTime}</span>
                            </div>
                            <span className="text-gray-300">→</span>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-red-600">📍 {b.to}</span>
                                <span className="text-xs text-gray-400">{b.toTime}</span>
                            </div>
                        </div>

                        {/* Package info */}
                        <div className="hidden md:flex flex-col gap-0.5 w-32 shrink-0 text-xs text-gray-500">
                            <span>📅 {b.packages}</span>
                            <span>⚖️ {b.weight}</span>
                            <span>📦 {b.volume}</span>
                        </div>

                        {/* Status + action */}
                        <div className="flex flex-col gap-2 w-full lg:w-48 shrink-0">
                            <span className={`inline-flex items-center gap-1 self-start px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[b.status]}`}>
                                {statusIcons[b.status]} {b.statusLabel}
                            </span>
                            <span className="text-xs font-medium text-gray-700">{b.note}</span>
                            <span className="text-xs text-gray-400">{b.subNote}</span>
                        </div>

                        {/* Right action */}
                        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 self-stretch lg:self-center">
                            {b.status === "accepted" ? (
                                <button className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition w-full lg:w-auto">
                                    Pay Now
                                </button>
                            ) : (
                                <span className="text-gray-300 hidden lg:inline">›</span>
                            )}
                        </div>

                    </div>
                ))}

            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-4 text-xs text-gray-400">
                Showing 1–2 of 2 bookings
            </div>

        </div>
    );
}

export default MyBookings;