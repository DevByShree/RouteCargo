<<<<<<< HEAD
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

=======
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Package, Phone, Building2, CheckCircle2, XCircle, Truck, IndianRupee, Filter, Pencil, Save, X } from "lucide-react";
import { driverApi, normalizeCapacity, normalizeRequest } from "../../API/driverApi";
const statusClasses = { Pending: "bg-amber-50 text-amber-700", Accepted: "bg-emerald-50 text-emerald-700", Rejected: "bg-rose-50 text-rose-700", "In Transit": "bg-blue-50 text-blue-700", Completed: "bg-slate-100 text-slate-700" };

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [capacityPosts, setCapacityPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [savingPost, setSavingPost] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    Promise.all([driverApi.listRequests(), driverApi.listCapacity()])
      .then(([nextRequests, nextPosts]) => { setRequests(nextRequests); setCapacityPosts(nextPosts); })
      .catch(e => setError(e.message));
  }, []);
  const counts = useMemo(() => ({ All: requests.length, Pending: requests.filter(r=>r.status==="Pending").length, Accepted: requests.filter(r=>r.status==="Accepted").length, Rejected: requests.filter(r=>r.status==="Rejected").length, "In Transit": requests.filter(r=>r.status==="In Transit").length, Completed: requests.filter(r=>r.status==="Completed").length }), [requests]);
  const filtered = requests.filter(r => (filter === "All" || r.status === filter) && `${r.id} ${r.customerName} ${r.from} ${r.to} ${r.loadType}`.toLowerCase().includes(search.toLowerCase()));
  const decide = async (id, status) => { try { const updated = normalizeRequest(await driverApi.updateRequestStatus(id, status)); setRequests(rs=>rs.map(r=>r.id===id?updated:r)); setNotice(`Request ${id} ${status.toLowerCase()}.`); setTimeout(()=>setNotice(""),2500); } catch (e) { setError(e.message); } };
  const editPost = post => setEditingPost({
    ...post,
    availableCapacity: post.availableCapacity ?? "",
    date: post.date || "",
    from: post.from || "",
    to: post.to || "",
    loadTypes: Array.isArray(post.loadTypes) ? post.loadTypes : [],
    companyName: post.companyName || "",
    contactNumber: post.contactNumber || post.contactPhone || "",
    notes: post.notes || "",
  });
  const updatePost = (key, value) => setEditingPost(post => ({ ...post, [key]: value }));
  const togglePostLoad = value => setEditingPost(post => ({
    ...post,
    loadTypes: post.loadTypes.includes(value) ? post.loadTypes.filter(item => item !== value) : [...post.loadTypes, value],
  }));
  const savePost = async event => {
    event.preventDefault();
    if (!editingPost) return;
    if (!editingPost.loadTypes.length) { setError("Select at least one cargo type."); return; }
    setSavingPost(true);
    setError("");
    try {
      const updated = normalizeCapacity(await driverApi.updateCapacity(editingPost.id, {
        availableCapacity: Number(editingPost.availableCapacity),
        date: editingPost.date,
        from: editingPost.from.trim(),
        to: editingPost.to.trim(),
        loadTypes: editingPost.loadTypes,
        companyName: editingPost.companyName.trim(),
        contactNumber: editingPost.contactNumber.trim(),
        notes: editingPost.notes.trim(),
      }));
      setCapacityPosts(posts => posts.map(post => post.id === updated.id ? { ...post, ...updated, totalCapacity: post.totalCapacity, truckName: post.truckName, truckNumber: post.truckNumber, vehicleType: post.vehicleType } : post));
      setEditingPost(null);
      setNotice("Published availability updated.");
      setTimeout(() => setNotice(""), 2500);
    } catch (e) { setError(e.message); }
    finally { setSavingPost(false); }
  };
  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="mb-6"><h1 className="text-2xl font-bold text-slate-900">My Requests</h1><p className="mt-1 text-sm text-slate-500">Review customer cargo requests and decide which loads you want to transport.</p></header>
    {notice && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
    {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-lg font-bold text-slate-900">Published Availability</h2><p className="mt-1 text-sm text-slate-500">Trips and available truck capacity you have published.</p></div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{capacityPosts.length} post{capacityPosts.length === 1 ? "" : "s"}</span>
      </div>
      {capacityPosts.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">You have not published any availability yet.</p> : <div className="space-y-3">{capacityPosts.map(post => <article key={post.id} className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{post.from} <span className="text-blue-600">→</span> {post.to}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${post.status === "Available" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{post.status}</span></div><p className="mt-1 text-sm text-slate-600">{post.truckName || post.vehicleType || "Vehicle"}{post.truckNumber ? ` · ${post.truckNumber}` : ""}</p><p className="mt-1 text-xs text-slate-500">{post.date || "Date not set"} · {post.availableCapacity} {post.capacityUnit} available · {(post.loadTypes || []).join(", ")}</p></div>
        <button type="button" disabled={post.status !== "Available"} onClick={() => editPost(post)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Pencil size={15}/> Edit availability</button>
      </article>)}</div>}
      {editingPost && <form onSubmit={savePost} className="mt-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">Edit published availability</h3><button type="button" onClick={() => setEditingPost(null)} className="rounded-md p-1 text-slate-500 hover:bg-white" aria-label="Cancel editing"><X size={18}/></button></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold text-slate-600">Available capacity<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" type="number" min="0.1" step="0.1" max={editingPost.totalCapacity || undefined} required value={editingPost.availableCapacity} onChange={e => updatePost("availableCapacity", e.target.value)}/><span className="mt-1 block font-normal">{editingPost.capacityUnit}</span></label>
          <label className="text-xs font-semibold text-slate-600">Travel date<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" type="date" required value={editingPost.date} onChange={e => updatePost("date", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">From<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" required value={editingPost.from} onChange={e => updatePost("from", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">To<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" required value={editingPost.to} onChange={e => updatePost("to", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">Company name<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" value={editingPost.companyName} onChange={e => updatePost("companyName", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">Contact number<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" value={editingPost.contactNumber} onChange={e => updatePost("contactNumber", e.target.value)}/></label>
          <fieldset className="sm:col-span-2 lg:col-span-3"><legend className="mb-2 text-xs font-semibold text-slate-600">Cargo types accepted</legend><div className="flex flex-wrap gap-2">{["Small goods", "Industrial goods", "Fragile goods", "General cargo"].map(type => <label key={type} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"><input type="checkbox" checked={editingPost.loadTypes.includes(type)} onChange={() => togglePostLoad(type)}/>{type}</label>)}</div></fieldset>
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2 lg:col-span-3">Notes<textarea className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" rows="2" value={editingPost.notes} onChange={e => updatePost("notes", e.target.value)}/></label>
        </div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setEditingPost(null)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button disabled={savingPost} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save size={15}/>{savingPost ? "Saving…" : "Save changes"}</button></div>
      </form>}
    </section>
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{["All","Pending","Accepted","Rejected","In Transit","Completed"].map(s=><button key={s} onClick={()=>setFilter(s)} className={`rounded-xl border p-3 text-left ${filter===s?"border-blue-300 bg-blue-50 ring-1 ring-blue-100":"border-slate-200 bg-white hover:bg-slate-50"}`}><p className="text-xs font-medium text-slate-500">{s}</p><p className="mt-1 text-xl font-bold text-slate-900">{counts[s]}</p></button>)}</div>
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Filter size={16} className="absolute left-3 top-3 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by request, customer, route or cargo..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"/></div><p className="self-center text-sm text-slate-500">{filtered.length} request{filtered.length===1?"":"s"}</p></div>
    {filtered.length===0 ? <div className="rounded-xl border border-slate-200 bg-white p-12 text-center"><Package size={32} className="mx-auto text-slate-300"/><h2 className="mt-3 font-semibold text-slate-800">No requests found</h2><p className="mt-1 text-sm text-slate-500">Try another filter or search term.</p></div> : <div className="space-y-4">{filtered.map(r=><article key={r.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-slate-500">{r.id}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[r.status] || statusClasses.Pending}`}>{r.status}</span><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{r.loadType}</span></div><h2 className="mt-3 flex flex-wrap items-center gap-2 text-lg font-bold text-slate-900"><span>{r.from}</span><span className="text-blue-500">→</span><span>{r.to}</span></h2><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="flex items-start gap-2 text-sm"><CalendarDays size={16} className="mt-0.5 shrink-0 text-slate-400"/><div><p className="text-xs text-slate-500">Pickup date</p><p className="font-medium text-slate-800">{r.date || "Not specified"}</p></div></div><div className="flex items-start gap-2 text-sm"><Package size={16} className="mt-0.5 shrink-0 text-slate-400"/><div><p className="text-xs text-slate-500">Cargo weight</p><p className="font-medium text-slate-800">{r.weight} {r.unit || "tons"}</p></div></div><div className="flex items-start gap-2 text-sm"><IndianRupee size={16} className="mt-0.5 shrink-0 text-slate-400"/><div><p className="text-xs text-slate-500">Offered price</p><p className="font-semibold text-slate-900">₹{Number(r.amount || 0).toLocaleString("en-IN")}</p></div></div><div className="flex items-start gap-2 text-sm"><Building2 size={16} className="mt-0.5 shrink-0 text-slate-400"/><div><p className="text-xs text-slate-500">Customer company</p><p className="font-medium text-slate-800">{r.companyName || r.customerName}</p></div></div></div>{r.description && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{r.description}</p>}<div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><span className="font-semibold text-slate-700">Customer:</span>{r.customerName}</span><span className="inline-flex items-center gap-1.5"><Phone size={13}/>{r.customerPhone || "Contact not provided"}</span></div></div>
      {r.status === "Pending" ? <div className="flex shrink-0 gap-2 lg:flex-col"><button onClick={()=>decide(r.id,"Accepted")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><CheckCircle2 size={16}/> Accept</button><button onClick={()=>decide(r.id,"Rejected")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"><XCircle size={16}/> Reject</button></div> : r.status === "Accepted" ? <button onClick={()=>decide(r.id,"In Transit")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Truck size={16}/> Mark In Transit</button> : r.status === "In Transit" ? <button onClick={()=>decide(r.id,"Completed")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900">Mark Completed</button> : null}
    </div></article>)}</div>}
    <p className="mt-4 text-xs text-slate-400">Requests and status updates are synced with your account.</p>
  </div></main>;
}
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
