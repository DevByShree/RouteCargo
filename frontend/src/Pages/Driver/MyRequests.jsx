import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Package,
    ShoppingBag,
    Calendar,
    Truck,
    User,
    Building2,
    Clock,
    CheckCircle2,
    XCircle,
    MoreVertical,
    X,
    FileSpreadsheet,
    MapPin,
    ArrowRight,
    IndianRupee,
    Phone
} from "lucide-react";

import truckTata14 from "../../assets/driver/truck_tata_14.png";
import truckAshok16 from "../../assets/driver/truck_ashok_16.png";
import truckEicher12 from "../../assets/driver/truck_eicher_12.png";
import truckTata10 from "../../assets/driver/truck_tata_10.png";
import truckBharatBenz from "../../assets/driver/truck_bharatbenz.png";

const INITIAL_REQUESTS = [
    {
        id: "REQ-001",
        from: "Pune",
        to: "Mumbai",
        loadType: "Electronics",
        weight: "8 tons",
        preferredDate: "18 Oct 2026",
        vehicleType: "Tata 14 Wheeler",
        truckNumber: "MH12AB1234",
        driverName: "Rohit Singh",
        driverPhone: "+91 98765 43210",
        companyName: "Singh Transport Pvt. Ltd.",
        gstNumber: "27ABCDE1234F1Z5",
        expectedAmount: "₹ 45,000",
        rawAmount: 45000,
        raisedOn: "15 Oct 2026, 10:30 AM",
        status: "Pending",
        image: truckTata14,
        notes: "Fragile electronic appliances. Palletized and shrink wrapped.",
    },
    {
        id: "REQ-002",
        from: "Nagpur",
        to: "Bhopal",
        loadType: "Cement",
        weight: "15 tons",
        preferredDate: "20 Oct 2026",
        vehicleType: "Ashok Leyland 16 Wheeler",
        truckNumber: "MH40XY5678",
        driverName: "Rohit Singh",
        driverPhone: "+91 98765 43210",
        companyName: "Singh Transport Pvt. Ltd.",
        gstNumber: "27ABCDE1234F1Z5",
        expectedAmount: "₹ 60,000",
        rawAmount: 60000,
        raisedOn: "14 Oct 2026, 02:15 PM",
        status: "Accepted",
        image: truckAshok16,
        notes: "Tarpaulin cover required to protect from weather conditions.",
    },
    {
        id: "REQ-003",
        from: "Delhi",
        to: "Jaipur",
        loadType: "Construction Material",
        weight: "10 tons",
        preferredDate: "12 Oct 2026",
        vehicleType: "Eicher 12 Wheeler",
        truckNumber: "RJ14CD9876",
        driverName: "Rohit Singh",
        driverPhone: "+91 98765 43210",
        companyName: "Singh Transport Pvt. Ltd.",
        gstNumber: "27ABCDE1234F1Z5",
        expectedAmount: "₹ 38,000",
        rawAmount: 38000,
        raisedOn: "10 Oct 2026, 09:40 AM",
        status: "Completed",
        image: truckEicher12,
        notes: "Delivered smoothly at Sitapura Industrial Area, Jaipur.",
    },
    {
        id: "REQ-004",
        from: "Mumbai",
        to: "Surat",
        loadType: "Textile",
        weight: "5 tons",
        preferredDate: "08 Oct 2026",
        vehicleType: "Tata 10 Wheeler",
        truckNumber: "MH01PQ4321",
        driverName: "Rohit Singh",
        driverPhone: "+91 98765 43210",
        companyName: "Singh Transport Pvt. Ltd.",
        gstNumber: "27ABCDE1234F1Z5",
        expectedAmount: "₹ 25,000",
        rawAmount: 25000,
        raisedOn: "06 Oct 2026, 11:20 AM",
        status: "Cancelled",
        image: truckTata10,
        notes: "Cancelled by driver due to schedule conflict.",
    },
    {
        id: "REQ-005",
        from: "Pune",
        to: "Nashik",
        loadType: "FMCG",
        weight: "7 tons",
        preferredDate: "28 Oct 2026",
        vehicleType: "BharatBenz 14 Wheeler",
        truckNumber: "MH12ZX7789",
        driverName: "Rohit Singh",
        driverPhone: "+91 98765 43210",
        companyName: "Singh Transport Pvt. Ltd.",
        gstNumber: "27ABCDE1234F1Z5",
        expectedAmount: "₹ 32,000",
        rawAmount: 32000,
        raisedOn: "02 Oct 2026, 04:10 PM",
        status: "Pending",
        image: truckBharatBenz,
        notes: "Packaged grocery cargo for regional distribution center.",
    },
];

function MyRequests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState(INITIAL_REQUESTS);
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Compute status counts dynamically
    const counts = {
        All: requests.length,
        Pending: requests.filter((r) => r.status === "Pending").length,
        Accepted: requests.filter((r) => r.status === "Accepted").length,
        Completed: requests.filter((r) => r.status === "Completed").length,
        Cancelled: requests.filter((r) => r.status === "Cancelled").length,
    };

    const filteredRequests = requests.filter((req) => {
        if (activeFilter === "All") return true;
        return req.status === activeFilter;
    });

    const handleCancelRequest = (id) => {
        setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r))
        );
        setActiveMenuId(null);
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case "Pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                        <Clock size={14} className="stroke-[2.2]" />
                        <span>Pending</span>
                    </span>
                );
            case "Accepted":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle2 size={14} className="stroke-[2.2]" />
                        <span>Accepted</span>
                    </span>
                );
            case "Completed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                        <Truck size={14} className="stroke-[2.2]" />
                        <span>Completed</span>
                    </span>
                );
            case "Cancelled":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                        <XCircle size={14} className="stroke-[2.2]" />
                        <span>Cancelled</span>
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                        My Requests
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base mt-1">
                        View and manage all your raised truck requests.
                    </p>
                </div>

                {/* + Raise New Request Button */}
                <button
                    onClick={() => navigate("/driver/raise-request")}
                    className="
                        self-start sm:self-auto
                        bg-[#1A73E8] hover:bg-blue-700 text-white font-medium text-sm
                        px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer
                    "
                >
                    <Plus size={18} className="stroke-[2.5]" />
                    <span>Raise New Request</span>
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
                {["All", "Pending", "Accepted", "Completed", "Cancelled"].map((tab) => {
                    const isActive = activeFilter === tab;
                    const count = counts[tab] || 0;

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveFilter(tab)}
                            className={`
                                px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer
                                ${isActive
                                    ? "bg-[#1A73E8] text-white shadow-2xs"
                                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                                }
                            `}
                        >
                            {tab} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center shadow-2xs">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                        <FileSpreadsheet size={28} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800">
                        No requests found in "{activeFilter}"
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 mb-5">
                        You don't have any requests in this status category currently.
                    </p>
                    <button
                        onClick={() => navigate("/driver/raise-request")}
                        className="bg-[#1A73E8] hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
                    >
                        Raise a New Request
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredRequests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-white rounded-xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
                        >
                            {/* Left: Truck Thumbnail */}
                            <div className="w-24 h-20 sm:w-28 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-gray-200 shadow-2xs">
                                <img
                                    src={req.image}
                                    alt={req.vehicleType}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Column 1: Route & Load Details */}
                            <div className="flex-1 min-w-[180px]">
                                <h3 className="text-base font-bold text-slate-900 mb-2">
                                    {req.from} <span className="text-slate-400 font-normal">→</span> {req.to}
                                </h3>
                                <div className="flex flex-col gap-1 text-xs text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Package size={15} className="text-slate-400 shrink-0" />
                                        <span>{req.loadType}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag size={15} className="text-slate-400 shrink-0" />
                                        <span>{req.weight}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={15} className="text-slate-400 shrink-0" />
                                        <span>{req.preferredDate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Vehicle & Owner Details */}
                            <div className="flex-1 min-w-[210px] flex flex-col gap-1 text-xs text-slate-700">
                                <div className="flex items-center gap-2 font-medium">
                                    <Truck size={15} className="text-slate-400 shrink-0" />
                                    <span>{req.vehicleType}</span>
                                </div>
                                <div className="flex items-center gap-2 font-semibold">
                                    <span className="text-[10px] font-bold tracking-wider text-blue-700 border border-blue-600/40 rounded px-1 bg-slate-50">
                                        IND
                                    </span>
                                    <span>{req.truckNumber}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <User size={15} className="text-slate-400 shrink-0" />
                                    <span>{req.driverName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Building2 size={15} className="text-slate-400 shrink-0" />
                                    <span>{req.companyName}</span>
                                </div>
                            </div>

                            {/* Column 3: Expected Amount & Raised On */}
                            <div className="min-w-[150px] flex flex-col">
                                <div className="text-lg font-bold text-slate-900">
                                    {req.expectedAmount}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    (Expected Amount)
                                </div>
                                <div className="mt-2 text-[11px] text-slate-400">
                                    Raised on
                                </div>
                                <div className="text-xs font-medium text-slate-600">
                                    {req.raisedOn}
                                </div>
                            </div>

                            {/* Column 4: Status Badge & Actions */}
                            <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                <div>
                                    {renderStatusBadge(req.status)}
                                </div>

                                <div className="flex items-center gap-2 relative">
                                    <button
                                        onClick={() => setSelectedRequest(req)}
                                        className="
                                            border border-gray-200 hover:border-gray-300 hover:bg-slate-50
                                            text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-lg
                                            transition cursor-pointer
                                        "
                                    >
                                        View Details
                                    </button>

                                    {/* Three dots button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === req.id ? null : req.id);
                                        }}
                                        aria-label="More options"
                                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition cursor-pointer"
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {/* Action Dropdown Menu */}
                                    {activeMenuId === req.id && (
                                        <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 text-xs font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(req);
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <span>View Full Summary</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    alert(`Trip ID: ${req.id} copied to clipboard!`);
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <span>Copy Trip ID</span>
                                            </button>
                                            {req.status !== "Cancelled" && (
                                                <button
                                                    onClick={() => handleCancelRequest(req.id)}
                                                    className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                                >
                                                    <span>Cancel Request</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedRequest(null)}
                            aria-label="Close"
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={selectedRequest.image}
                                alt={selectedRequest.vehicleType}
                                className="w-16 h-14 rounded-lg object-cover border border-gray-200 shadow-2xs"
                            />
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {selectedRequest.from} → {selectedRequest.to}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-500">ID: {selectedRequest.id}</span>
                                    {renderStatusBadge(selectedRequest.status)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs mb-4">
                            <div>
                                <span className="text-slate-400 block mb-0.5">Vehicle</span>
                                <span className="font-semibold text-slate-800">{selectedRequest.vehicleType}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Registration</span>
                                <span className="font-semibold text-slate-800">{selectedRequest.truckNumber}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Load Type</span>
                                <span className="font-semibold text-slate-800">{selectedRequest.loadType}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Load Weight</span>
                                <span className="font-semibold text-slate-800">{selectedRequest.weight}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Preferred Date</span>
                                <span className="font-semibold text-slate-800">{selectedRequest.preferredDate}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Expected Amount</span>
                                <span className="font-bold text-blue-600 text-sm">{selectedRequest.expectedAmount}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-3 flex flex-col gap-2 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Driver / Owner:</span>
                                <span className="font-medium text-slate-900">{selectedRequest.driverName}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Contact:</span>
                                <span className="font-medium text-slate-900">{selectedRequest.driverPhone}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Company:</span>
                                <span className="font-medium text-slate-900">{selectedRequest.companyName}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>GST Number:</span>
                                <span className="font-medium text-slate-900">{selectedRequest.gstNumber}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Raised On:</span>
                                <span className="font-medium text-slate-900">{selectedRequest.raisedOn}</span>
                            </div>
                            {selectedRequest.notes && (
                                <div className="mt-2 bg-amber-50/70 p-3 rounded-lg border border-amber-200/60 text-slate-700">
                                    <span className="font-semibold block mb-0.5 text-amber-800">Trip Notes:</span>
                                    {selectedRequest.notes}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyRequests;

