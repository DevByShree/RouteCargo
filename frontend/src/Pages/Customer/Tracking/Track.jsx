import { useState } from "react";
import mapImg from "../../../assets/map.png";

function TrackShipment() {

    const [mapMode, setMapMode] = useState("map");

    const shipment = {
        id: "BK2026091803",
        status: "In Transit",
        image: "",
        transporter: "Shree Roadlines",
        vehicleNo: "MH12 XY 9012",
        vehicle: "Ashok Leyland 12 Ton",
        pickup: { location: "Pune", date: "18 Sep 2026", time: "09:00 AM" },
        delivery: { location: "Bengaluru", date: "20 Sep 2026", time: "08:00 PM" },
        packages: 15,
        weight: "2,400 kg",
        volume: "1.10 m³",
        eta: "Today, 08:00 PM",
        remaining: "~280 km remaining",
    };

    const timeline = [
        { label: "Booking Confirmed", time: "18 Sep, 09:15 AM", state: "done" },
        { label: "Driver Assigned", time: "18 Sep, 10:30 AM", state: "done" },
        { label: "Picked Up", time: "18 Sep, 11:45 AM", state: "done" },
        { label: "In Transit", time: "19 Sep, 04:20 PM", state: "active" },
        { label: "Near Destination", time: "ETA 19 Sep, 06:30 PM", state: "pending" },
        { label: "Delivered", time: "ETA 20 Sep, 08:00 PM", state: "pending" },
    ];

    const liveInfo = {
        currentLocation: "Near Hubballi, Karnataka",
        lastUpdated: "Last updated: 19 Sep 2026, 04:20 PM",
        speed: "80 km/h",
        distanceCovered: "820 km",
        distanceRemaining: "280 km",
        estimatedArrival: "Today, 08:00 PM",
    };

    const driver = {
        image: "",
        name: "Amit Jadhav",
        rating: 4.5,
        reviews: 76,
        verified: true,
        vehicleImage: "",
        transporter: "Shree Roadlines",
        vehicleNo: "MH12 XY 9012",
        vehicle: "Ashok Leyland 12 Ton",
    };

    const shipmentDetails = [
        { label: "Parcel Type", value: "Electronics" },
        { label: "Total Packages", value: "15" },
        { label: "Total Weight", value: "2,400 kg" },
        { label: "Total Volume", value: "1.10 m³" },
    ];

    const recentActivity = [
        { label: "Picked Up", time: "18 Sep, 11:45 AM", note: "Shipment picked up from Pune", state: "done" },
        { label: "In Transit", time: "19 Sep, 04:20 PM", note: "Near Hubballi, Karnataka", state: "active" },
        { label: "Next Stop", time: "19 Sep, 06:30 PM", note: "Approaching Bengaluru", state: "pending" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 lg:px-8 pt-5 pb-3">
                <div>
                    <span className="text-sm text-gray-500">
                        Tracking <span className="mx-1">&gt;</span> {shipment.id}
                    </span>
                    <div className="font-bold text-2xl text-gray-900 mt-1">Track Your Shipment</div>
                    <span className="text-gray-500 text-sm">Real-time location and delivery status of your shipment.</span>
                </div>
                <button className="border border-gray-200 bg-white rounded-lg px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition self-start sm:self-auto flex items-center gap-2">
                    🔗 Share Tracking Link
                </button>
            </div>

            {/* Summary bar */}
            <div className="mx-4 sm:mx-6 lg:mx-8 bg-white rounded-lg border border-gray-200 p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center">

                <div className="flex gap-3 w-full lg:w-64 shrink-0">
                    <img
                        src={shipment.image}
                        alt={shipment.transporter}
                        className="w-20 h-16 rounded-md bg-gray-200 object-cover shrink-0"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{shipment.id}</span>
                            <span className="text-xs text-green-600 bg-green-50 rounded-full px-2 py-0.5 font-semibold">
                                ● {shipment.status}
                            </span>
                        </div>
                        <span className="text-xs text-gray-600 truncate">{shipment.transporter}</span>
                        <span className="text-xs text-gray-400">{shipment.vehicleNo} • {shipment.vehicle}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-green-600 font-semibold">🟢 {shipment.pickup.location}</span>
                        <span className="text-xs text-gray-400">{shipment.pickup.date}, {shipment.pickup.time}</span>
                    </div>
                    <span className="text-gray-300">→</span>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-red-600 font-semibold">📍 {shipment.delivery.location}</span>
                        <span className="text-xs text-gray-400">{shipment.delivery.date}, {shipment.delivery.time}</span>
                    </div>
                </div>

                <div className="hidden md:flex flex-col gap-0.5 w-32 shrink-0 text-xs text-gray-500">
                    <span>📅 {shipment.packages} packages</span>
                    <span>⚖️ {shipment.weight}</span>
                    <span>📦 {shipment.volume}</span>
                </div>

                <div className="bg-blue-50 rounded-lg px-4 py-2.5 flex items-center gap-3 w-full lg:w-auto">
                    <span className="text-blue-600 text-xl">🕐</span>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Estimated Arrival</span>
                        <span className="font-bold text-sm text-gray-900">{shipment.eta}</span>
                        <span className="text-xs text-gray-400">{shipment.remaining}</span>
                    </div>
                </div>

            </div>

            {/* Timeline */}
            <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 bg-white rounded-lg border border-gray-200 p-5 overflow-x-auto">
                <div className="flex items-start min-w-[600px]">
                    {timeline.map((step, i) => (
                        <div key={step.label} className="flex-1 flex flex-col items-center text-center relative">
                            {i !== 0 && (
                                <div
                                    className={`absolute top-4 right-1/2 w-full h-0.5 -z-0
                                        ${step.state === "pending" && timeline[i - 1].state === "pending"
                                            ? "border-t-2 border-dashed border-gray-300"
                                            : step.state === "pending"
                                                ? "border-t-2 border-dashed border-gray-300"
                                                : "bg-green-500"
                                        }`}
                                />
                            )}
                            <span
                                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0
                                    ${step.state === "done"
                                        ? "bg-green-500 text-white"
                                        : step.state === "active"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-400"
                                    }`}
                            >
                                {step.state === "done" ? "✓" : step.state === "active" ? "🚚" : "✓"}
                            </span>
                            <span className="text-xs font-semibold text-gray-900 mt-2">{step.label}</span>
                            <span className="text-xs text-gray-400">{step.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main content: map + side panel */}
            <div className="flex flex-col lg:flex-row gap-4 px-4 sm:px-6 lg:px-8 py-4 items-start">

                {/* Left: Live map + recent activity */}
                <div className="flex-1 w-full flex flex-col gap-4 min-w-0">

                    <div className="bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-3">

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">Live Tracking</span>
                                <span className="text-xs text-green-600 bg-green-50 rounded-full px-2 py-0.5 font-semibold">● Live</span>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setMapMode("map")}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${mapMode === "map" ? "bg-blue-600 text-white" : "text-gray-500"}`}
                                >
                                    Map
                                </button>
                                <button
                                    onClick={() => setMapMode("satellite")}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${mapMode === "satellite" ? "bg-blue-600 text-white" : "text-gray-500"}`}
                                >
                                    Satellite
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <img
                                src={mapImg}
                                alt="Live map"
                                className="w-full h-72 sm:h-96 rounded-lg bg-gray-200 object-cover"
                            />

                            {/* Current location overlay */}
                            <div className="absolute left-3 bottom-3 bg-white rounded-lg border border-gray-200 shadow-md p-3 w-56 flex flex-col gap-2">
                                <div className="flex items-start gap-1.5">
                                    <span className="text-blue-600 mt-0.5">📍</span>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500">Current Location</span>
                                        <span className="text-xs font-semibold">{liveInfo.currentLocation}</span>
                                        <span className="text-xs text-gray-400">{liveInfo.lastUpdated}</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-2 flex flex-col gap-1 text-xs text-gray-600">
                                    <div className="flex justify-between"><span>⚡ Speed</span><span className="font-semibold">{liveInfo.speed}</span></div>
                                    <div className="flex justify-between"><span>📏 Distance Covered</span><span className="font-semibold">{liveInfo.distanceCovered}</span></div>
                                    <div className="flex justify-between"><span>📏 Distance Remaining</span><span className="font-semibold">{liveInfo.distanceRemaining}</span></div>
                                    <div className="flex justify-between"><span>🕐 Estimated Arrival</span><span className="font-semibold">{liveInfo.estimatedArrival}</span></div>
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3">
                        <span className="font-bold text-sm">Recent Activity</span>
                        <div className="flex items-start gap-2 overflow-x-auto">
                            {recentActivity.map((a, i) => (
                                <div key={a.label} className="flex items-start gap-2 shrink-0">
                                    <div className="flex flex-col items-center">
                                        <span
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                                                ${a.state === "done" ? "bg-green-500 text-white" : a.state === "active" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}
                                        >
                                            {a.state === "pending" ? "" : "●"}
                                        </span>
                                        {i !== recentActivity.length - 1 && (
                                            <span className="w-16 sm:w-24 h-0.5 border-t-2 border-dashed border-gray-300 mt-3" />
                                        )}
                                    </div>
                                    <div className="flex flex-col -mt-0.5 mr-4">
                                        <span className="text-xs font-semibold text-gray-900">{a.label}</span>
                                        <span className="text-xs text-gray-400">{a.time}</span>
                                        <span className="text-xs text-gray-500">{a.note}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right: Driver + Shipment details */}
                <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">

                    {/* Driver Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3">
                        <span className="font-bold text-sm">Driver Information</span>

                        <div className="flex items-center gap-3">
                            <img
                                src={driver.image}
                                alt={driver.name}
                                className="w-11 h-11 rounded-full bg-gray-200 shrink-0"
                            />
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">{driver.name}</span>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <span>⭐ {driver.rating} ({driver.reviews})</span>
                                    <span className="text-green-600">✓ Verified</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 border border-gray-200 rounded-md py-2 text-sm font-semibold text-gray-700 flex items-center justify-center gap-1 hover:bg-gray-50 transition">
                                📞 Call
                            </button>
                            <button className="flex-1 border border-gray-200 rounded-md py-2 text-sm font-semibold text-gray-700 flex items-center justify-center gap-1 hover:bg-gray-50 transition">
                                💬 Chat
                            </button>
                        </div>

                        <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
                            <img
                                src={driver.vehicleImage}
                                alt={driver.transporter}
                                className="w-11 h-11 rounded-md bg-gray-200 object-cover shrink-0"
                            />
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">{driver.transporter}</span>
                                <span className="text-xs text-gray-400">{driver.vehicleNo} • {driver.vehicle}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipment Details */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-sm">Shipment Details</span>
                            <span className="text-xs text-blue-600 cursor-pointer">View Invoice</span>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            {shipmentDetails.map((d) => (
                                <div key={d.label} className="flex justify-between text-xs">
                                    <span className="text-gray-500">📦 {d.label}</span>
                                    <span className="font-semibold text-gray-900">{d.value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-xs items-start">
                                <span className="text-gray-500">📍 Pickup Location</span>
                                <div className="flex flex-col items-end">
                                    <span className="font-semibold text-gray-900">{shipment.pickup.location}, Maharashtra</span>
                                    <span className="text-gray-400">{shipment.pickup.date}, {shipment.pickup.time}</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs items-start">
                                <span className="text-gray-500">📍 Delivery Location</span>
                                <div className="flex flex-col items-end">
                                    <span className="font-semibold text-gray-900">{shipment.delivery.location}, Karnataka</span>
                                    <span className="text-gray-400">{shipment.delivery.date}, {shipment.delivery.time}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info banner */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
                        <span className="text-lg">📦</span>
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-emerald-800">Your shipment is on track! 🎉</span>
                            <span className="text-xs text-emerald-700">We'll notify you at each important update.</span>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default TrackShipment;