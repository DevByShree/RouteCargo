import { useState } from "react";
import tc from "../../../assets/tc.png"
import ind from "../../../assets/ind.png"

function Find({ formData }) {

    const [activeStep, setActiveStep] = useState(3);
    const [showFilters, setShowFilters] = useState(false);

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

    const steps = [
        { id: 1, name: "Pickup & Delivery", status: "Completed" },
        { id: 2, name: "Parcel Details", status: "Completed" },
        { id: 3, name: "Find Trucks", status: "View matching trucks" },
        { id: 4, name: "Review & Book", status: "Confirm and send request" },
    ];

    const trucks = [
        {
            id: 1,
            image: tc,
            name: "Ramesh Transport",
            verified: true,
            matchPercent: 92,
            matchLabel: "Route Match",
            vehicle: "Tata 10 Ton (Closed Body)",
            vehicleNo: "MH12 AB 1234",
            route: `${pickup.location.split(",")[0]} → ${delivery.location.split(",")[0]}`,
            depTime: `Dep: ${pickup.date} ${pickup.time}`,
            arrTime: `Arr: ${delivery.date} ${delivery.time}`,
            capacity: "3.5 / 10 Ton",
            capacityPercent: 35,
            price: "₹ 8,500",
            priceNote: "₹ 2,428 per Ton",
            driver: "Ramesh Kumar",
            rating: 4.8,
            reviews: 120,
        },
        {
            id: 2,
            image: tc,
            name: "Patil Logistics",
            verified: true,
            matchPercent: 88,
            matchLabel: "Route Match",
            vehicle: "Eicher 7 Ton (Open Truck)",
            vehicleNo: "MH14 CD 5678",
            route: `${pickup.location.split(",")[0]} → ${delivery.location.split(",")[0]}`,
            depTime: `Dep: ${pickup.date} ${pickup.time}`,
            arrTime: `Arr: ${delivery.date} ${delivery.time}`,
            capacity: "2.0 / 7 Ton",
            capacityPercent: 29,
            price: "₹ 6,200",
            priceNote: "₹ 3,100 per Ton",
            driver: "Suresh Patil",
            rating: 4.6,
            reviews: 98,
        },
        {
            id: 3,
            image: tc,
            name: "Shree Roadlines",
            verified: true,
            matchPercent: 78,
            matchLabel: "Route Match",
            vehicle: "Ashok Leyland 12 Ton (Container)",
            vehicleNo: "MH12 XY 9012",
            route: `${pickup.location.split(",")[0]} → ${delivery.location.split(",")[0]}`,
            depTime: `Dep: ${pickup.date} ${pickup.time}`,
            arrTime: `Arr: ${delivery.date} ${delivery.time}`,
            capacity: "4.0 / 12 Ton",
            capacityPercent: 33,
            price: "₹ 9,800",
            priceNote: "₹ 2,450 per Ton",
            driver: "Amit Jadhav",
            rating: 4.5,
            reviews: 76,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">

            {/* Header */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-3">

                <span className="font-light text-gray-500 text-sm">
                    Create Shipment &gt;{" "}
                </span>

                <span className="font-semibold text-gray-900 text-sm">
                    Find Trucks
                </span>

                <div className="font-bold text-xl sm:text-2xl py-1 text-gray-900">
                    Find Available Trucks
                </div>

                <span className="text-gray-500 text-sm">
                    We found {trucks.length} trucks travelling on your route or nearby routes
                </span>

            </div>

            {/* Steps */}
            <div className="bg-white border-t border-b border-gray-200 w-full flex items-center justify-start sm:justify-center gap-6 sm:gap-10 py-3 px-4 sm:px-6 overflow-x-auto">

                {steps.map((step) => (

                    <div
                        key={step.id}
                        onClick={() => setActiveStep(step.id)}
                        className="flex items-center gap-2 cursor-pointer shrink-0"
                    >

                        {/* Circle */}
                        <span
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold shrink-0 transition text-sm
                                ${activeStep === step.id
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : step.id < activeStep
                                        ? "border-green-600 bg-white text-green-600"
                                        : "border-gray-300 bg-white text-gray-400"
                                }
                            `}
                        >
                            {step.id < activeStep ? "✓" : step.id}
                        </span>

                        {/* Text */}
                        <div className="flex flex-col">
                            <span
                                className={`font-semibold text-xs sm:text-sm whitespace-nowrap transition
                                    ${activeStep === step.id
                                        ? "text-blue-600"
                                        : step.id < activeStep
                                            ? "text-green-600"
                                            : "text-gray-500"
                                    }
                                `}
                            >
                                {step.name}
                            </span>
                            <span className={`hidden sm:inline text-xs ${step.id < activeStep ? "text-green-600" : "text-gray-400"}`}>
                                {step.status}
                            </span>
                        </div>

                    </div>

                ))}

            </div>

            {/* Mobile filter toggle */}
            <button
                onClick={() => setShowFilters((s) => !s)}
                className="lg:hidden mx-4 sm:mx-6 mt-3 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 flex items-center justify-between"
            >
                Filters
                <span className="text-gray-400">{showFilters ? "▲" : "▼"}</span>
            </button>

            {/* Main content: 3 columns on desktop, stacked on mobile/tablet */}
            <div className="flex flex-col lg:flex-row flex-1 gap-4 px-4 sm:px-6 lg:px-8 py-4 items-start">

                {/* Left: Filters */}
                <div className={`${showFilters ? "flex" : "hidden"} lg:flex w-full lg:w-64 shrink-0 bg-white rounded-lg border border-gray-200 p-4 flex-col gap-4`}>

                    <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">Filters</span>
                        <span className="text-xs text-blue-600 cursor-pointer">Reset</span>
                    </div>

                    {/* Vehicle Type */}
                    <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-xs text-gray-700">Vehicle Type</span>
                        <div className="grid grid-cols-2 lg:flex lg:flex-col gap-1.5">
                            {["All Types", "Open Truck", "Container", "Refrigerated", "Trailer", "Mini Truck"].map((v, i) => (
                                <label key={v} className="flex items-center gap-2 text-xs text-gray-600">
                                    <input type="checkbox" defaultChecked={i === 0} readOnly />
                                    {v}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Capacity Range */}
                    <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-xs text-gray-700">Capacity Range</span>
                        <input type="range" min="0" max="100" readOnly className="w-full" />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>0.5 Ton</span>
                            <span>20+ Ton</span>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-xs text-gray-700">Price Range (₹)</span>
                        <input type="range" min="0" max="100" readOnly className="w-full" />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>₹0</span>
                            <span>₹50,000+</span>
                        </div>
                    </div>

                    {/* Departure Date - pulled from the pickup step's form data */}
                    <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-xs text-gray-700">Departure Date</span>
                        <input
                            type="text"
                            readOnly
                            value={pickup.date}
                            className="border border-gray-200 rounded-md px-2 py-1.5 text-xs text-gray-700 w-full"
                        />
                    </div>

                    {/* Additional Filters */}
                    <div className="flex flex-col gap-1.5">
                        <span className="font-semibold text-xs text-gray-700">Additional Filters</span>
                        <div className="grid grid-cols-2 lg:flex lg:flex-col gap-1.5">
                            {["Verified Drivers Only", "Instant Booking", "Pets Allowed", "Fragile Handling", "GPS Enabled"].map((v, i) => (
                                <label key={v} className="flex items-center gap-2 text-xs text-gray-600">
                                    <input type="checkbox" defaultChecked={i === 0 || i === 1} readOnly />
                                    {v}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button className="bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold cursor-pointer hover:bg-blue-700 transition">
                        Apply Filters
                    </button>

                </div>

                {/* Middle: Truck List */}
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
                                className="w-full md:w-28 h-24 md:h-20 rounded-md bg-gray-200 object-cover shrink-0"
                            />

                            {/* Details */}
                            <div className="flex-1 w-full flex flex-col gap-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-bold text-sm">{truck.name}</span>
                                    {truck.verified && (
                                        <span className="text-xs text-green-600 bg-green-100 rounded px-1.5 py-0.5">
                                            ✓ Verified
                                        </span>
                                    )}
                                    <span className="text-xs text-blue-600 bg-blue-100 rounded px-1.5 py-0.5 md:ml-auto">
                                        {truck.matchPercent}% {truck.matchLabel}
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

                    {/* Info banner */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800">
                        🌱 Found more trucks! These trucks are already travelling on your route, giving you lower prices and faster delivery.
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Find;