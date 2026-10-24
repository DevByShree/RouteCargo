import { useState, useRef } from "react";
import {
    Pencil,
    Save,
    User,
    Phone,
    Mail,
    MapPin,
    Building2,
    FileText,
    Calendar,
    Truck,
    Fuel,
    Plus,
    Camera,
    X,
    Check,
    CheckCircle2,
    FileCheck,
    Eye,
    UploadCloud
} from "lucide-react";

import rohitAvatar from "../../assets/driver/rohit_avatar.png";
import truckFront from "../../assets/driver/truck_front.png";
import truckSide from "../../assets/driver/truck_side.png";
import truckBack from "../../assets/driver/truck_back.png";
import truckAshok16 from "../../assets/driver/truck_ashok_16.png";
import truckEicher12 from "../../assets/driver/truck_eicher_12.png";

const VEHICLE_OPTIONS = [
    "Tata 14 Wheeler",
    "Ashok Leyland 16 Wheeler",
    "Eicher 12 Wheeler",
    "Tata 10 Wheeler",
    "BharatBenz 14 Wheeler",
    "Mahindra Bolero Maxi Truck (1.5 Ton)",
    "Container 20ft",
    "Container 32ft Multi-Axle",
];

const FUEL_OPTIONS = ["Diesel", "CNG", "Electric", "Petrol", "LNG"];

const INITIAL_TRUCKS = [
    {
        id: "T1",
        name: "Truck 1",
        number: "MH12AB1234",
        type: "Tata 14 Wheeler",
        capacity: "8",
        capacityUnit: "tons",
        fuelType: "Diesel",
        photos: [
            { id: "p1", url: truckFront },
            { id: "p2", url: truckSide },
            { id: "p3", url: truckBack },
        ],
    },
    {
        id: "T2",
        name: "Truck 2",
        number: "MH40XY5678",
        type: "Ashok Leyland 16 Wheeler",
        capacity: "15",
        capacityUnit: "tons",
        fuelType: "Diesel",
        photos: [
            { id: "p4", url: truckAshok16 },
            { id: "p5", url: truckSide },
        ],
    },
    {
        id: "T3",
        name: "Truck 3",
        number: "RJ14CD9876",
        type: "Eicher 12 Wheeler",
        capacity: "10",
        capacityUnit: "tons",
        fuelType: "Diesel",
        photos: [
            { id: "p6", url: truckEicher12 },
        ],
    },
];

const DOCUMENTS = [
    {
        id: "doc1",
        name: "Driver License",
        file: "license.jpg",
        colorClass: "bg-emerald-50 text-emerald-500 border-emerald-100",
        issueDate: "12 May 2018",
        expiryDate: "11 May 2038",
        docNumber: "DL-0420180019234",
    },
    {
        id: "doc2",
        name: "RC (Registration Certificate)",
        file: "rc.jpg",
        colorClass: "bg-blue-50 text-blue-500 border-blue-100",
        issueDate: "03 Aug 2020",
        expiryDate: "02 Aug 2035",
        docNumber: "RC-MH12AB1234-COMM",
    },
    {
        id: "doc3",
        name: "Insurance",
        file: "insurance.jpg",
        colorClass: "bg-purple-50 text-purple-500 border-purple-100",
        issueDate: "15 Jan 2026",
        expiryDate: "14 Jan 2027",
        docNumber: "POL-ICICI-9941203",
    },
    {
        id: "doc4",
        name: "PUC Certificate",
        file: "puc.jpg",
        colorClass: "bg-amber-50 text-amber-500 border-amber-100",
        issueDate: "01 Sep 2026",
        expiryDate: "28 Feb 2027",
        docNumber: "PUC-MAH-2026-8812",
    },
    {
        id: "doc5",
        name: "GST Certificate (optional)",
        file: "gst.jpg",
        colorClass: "bg-slate-100 text-slate-500 border-slate-200",
        issueDate: "10 Nov 2021",
        expiryDate: "Permanent",
        docNumber: "27ABCDE1234F1Z5",
    },
];

function Profile() {
    const avatarInputRef = useRef(null);
    const truckPhotoInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [saveAlert, setSaveAlert] = useState(false);

    // Personal / Owner Details
    const [personal, setPersonal] = useState({
        ownerName: "Rohit Singh",
        contactNumber: "+91 98765 43210",
        email: "rohit.singh@gmail.com",
        altNumber: "+91 91234 56789",
        address: "Bhopal, Madhya Pradesh, India",
        avatar: rohitAvatar,
    });

    // Transport Company Details
    const [company, setCompany] = useState({
        companyName: "Singh Transport Pvt. Ltd.",
        gstNumber: "27ABCDE1234F1Z5",
        companyAddress: "Transport Nagar, Bhopal, Madhya Pradesh",
        yearEstablishment: "2020",
    });

    // Trucks state
    const [trucks, setTrucks] = useState(INITIAL_TRUCKS);
    const [selectedTruckId, setSelectedTruckId] = useState("T1");

    // Modal state for viewing document
    const [selectedDoc, setSelectedDoc] = useState(null);

    const currentTruck = trucks.find((t) => t.id === selectedTruckId) || trucks[0];

    const handleTruckChange = (field, value) => {
        setTrucks((prev) =>
            prev.map((t) =>
                t.id === selectedTruckId ? { ...t, [field]: value } : t
            )
        );
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPersonal((prev) => ({
                ...prev,
                avatar: URL.createObjectURL(file),
            }));
        }
    };

    const handleTruckPhotoUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const newPhotos = files.map((file, idx) => ({
            id: `tp-${Date.now()}-${idx}`,
            url: URL.createObjectURL(file),
        }));

        setTrucks((prev) =>
            prev.map((t) =>
                t.id === selectedTruckId
                    ? { ...t, photos: [...t.photos, ...newPhotos] }
                    : t
            )
        );
    };

    const removeTruckPhoto = (photoId) => {
        setTrucks((prev) =>
            prev.map((t) =>
                t.id === selectedTruckId
                    ? { ...t, photos: t.photos.filter((p) => p.id !== photoId) }
                    : t
            )
        );
    };

    const addNewTruck = () => {
        const nextNum = trucks.length + 1;
        const newId = `T${Date.now()}`;
        const newTruckItem = {
            id: newId,
            name: `Truck ${nextNum}`,
            number: "MH12CD" + Math.floor(1000 + Math.random() * 9000),
            type: "Tata 14 Wheeler",
            capacity: "10",
            capacityUnit: "tons",
            fuelType: "Diesel",
            photos: [{ id: `new-${Date.now()}`, url: truckFront }],
        };
        setTrucks((prev) => [...prev, newTruckItem]);
        setSelectedTruckId(newId);
    };

    const handleSaveProfile = () => {
        setIsEditing(false);
        setSaveAlert(true);
        setTimeout(() => setSaveAlert(false), 3000);
    };

    return (
        <div className="pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                        Profile
                    </h1>
                    <p className="text-slate-500 text-sm sm:text-base mt-1">
                        Manage your personal, vehicle and company details.
                    </p>
                </div>

                {/* Edit Profile / Save Changes Button */}
                <button
                    onClick={() => {
                        if (isEditing) {
                            handleSaveProfile();
                        } else {
                            setIsEditing(true);
                        }
                    }}
                    className={`
                        self-start sm:self-auto
                        px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer
                        ${isEditing
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-[#1A73E8] hover:bg-blue-700 text-white"
                        }
                    `}
                >
                    {isEditing ? (
                        <>
                            <Save size={16} />
                            <span>Save Profile</span>
                        </>
                    ) : (
                        <>
                            <Pencil size={16} />
                            <span>Edit Profile</span>
                        </>
                    )}
                </button>
            </div>

            {/* Save success toast */}
            {saveAlert && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Profile details have been updated successfully!</span>
                </div>
            )}

            {/* 4 Cards in 2x2 Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* 1. Personal / Owner Details */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                        <User size={18} className="text-slate-600" />
                        <span>Personal / Owner Details</span>
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        {/* Profile Avatar with Camera Upload Badge */}
                        <div className="relative shrink-0">
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-slate-100 shadow-2xs">
                                <img
                                    src={personal.avatar}
                                    alt={personal.ownerName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                aria-label="Change photo"
                                className="
                                    absolute bottom-0 right-0 w-8 h-8 rounded-full
                                    bg-[#1A73E8] hover:bg-blue-700 text-white
                                    flex items-center justify-center shadow-md ring-2 ring-white transition cursor-pointer
                                "
                            >
                                <Camera size={15} />
                            </button>
                        </div>

                        {/* Owner Fields */}
                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Owner Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Owner Name
                                </label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={personal.ownerName}
                                    onChange={(e) =>
                                        setPersonal((p) => ({ ...p, ownerName: e.target.value }))
                                    }
                                    className={`
                                        w-full px-3 py-2 bg-white border rounded-lg text-sm text-slate-900
                                        ${isEditing
                                            ? "border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            : "border-gray-200 bg-slate-50/50 cursor-default"
                                        }
                                    `}
                                />
                            </div>

                            {/* Contact Number */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Contact Number
                                </label>
                                <div className="relative flex items-center">
                                    <Phone size={14} className="absolute left-3 text-slate-400" />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={personal.contactNumber}
                                        onChange={(e) =>
                                            setPersonal((p) => ({ ...p, contactNumber: e.target.value }))
                                        }
                                        className={`
                                            w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-900
                                            ${isEditing
                                                ? "border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                : "border-gray-200 bg-slate-50/50 cursor-default"
                                            }
                                        `}
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative flex items-center">
                                    <Mail size={14} className="absolute left-3 text-slate-400" />
                                    <input
                                        type="email"
                                        disabled={!isEditing}
                                        value={personal.email}
                                        onChange={(e) =>
                                            setPersonal((p) => ({ ...p, email: e.target.value }))
                                        }
                                        className={`
                                            w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-900
                                            ${isEditing
                                                ? "border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                : "border-gray-200 bg-slate-50/50 cursor-default"
                                            }
                                        `}
                                    />
                                </div>
                            </div>

                            {/* Alternative Number */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Alternative Number <span className="text-slate-400 font-normal">(optional)</span>
                                </label>
                                <div className="relative flex items-center">
                                    <Phone size={14} className="absolute left-3 text-slate-400" />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={personal.altNumber}
                                        onChange={(e) =>
                                            setPersonal((p) => ({ ...p, altNumber: e.target.value }))
                                        }
                                        className={`
                                            w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-900
                                            ${isEditing
                                                ? "border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                : "border-gray-200 bg-slate-50/50 cursor-default"
                                            }
                                        `}
                                    />
                                </div>
                            </div>

                            {/* Address (Full Row) */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Address
                                </label>
                                <div className="relative flex items-center">
                                    <MapPin size={14} className="absolute left-3 text-slate-400" />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={personal.address}
                                        onChange={(e) =>
                                            setPersonal((p) => ({ ...p, address: e.target.value }))
                                        }
                                        className={`
                                            w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-900
                                            ${isEditing
                                                ? "border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                : "border-gray-200 bg-slate-50/50 cursor-default"
                                            }
                                        `}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Transport Company Details */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                        <Building2 size={18} className="text-slate-600" />
                        <span>Transport Company Details</span>
                    </h2>

                    <div className="grid grid-cols-1 gap-3.5">
                        {/* Company Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Company Name
                            </label>
                            <div className="relative flex items-center">
                                <Building2 size={15} className="absolute left-3 text-slate-400" />
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={company.companyName}
                                    onChange={(e) =>
                                        setCompany((c) => ({ ...c, companyName: e.target.value }))
                                    }
                                    className={`
                                        w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-900
                                        ${isEditing
                                            ? "border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            : "border-gray-200 bg-slate-50/50 cursor-default"
                                        }
                                    `}
                                />
                            </div>
                        </div>

                        {/* GST Number */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                GST Number <span className="text-slate-400 font-normal">(optional)</span>
                            </label>
                            <div className="relative flex items-center">
                                <FileText size={15} className="absolute left-3 text-slate-400" />
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={company.gstNumber}
                                    onChange={(e) =>
                                        setCompany((c) => ({ ...c, gstNumber: e.target.value.toUpperCase() }))
                                    }
                                    className={`
                                        w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm uppercase text-slate-900
                                        ${isEditing
                                            ? "border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            : "border-gray-200 bg-slate-50/50 cursor-default"
                                        }
                                    `}
                                />
                            </div>
                        </div>

                        {/* Company Address */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Company Address <span className="text-slate-400 font-normal">(optional)</span>
                            </label>
                            <div className="relative flex items-center">
                                <MapPin size={15} className="absolute left-3 text-slate-400" />
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={company.companyAddress}
                                    onChange={(e) =>
                                        setCompany((c) => ({ ...c, companyAddress: e.target.value }))
                                    }
                                    className={`
                                        w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-900
                                        ${isEditing
                                            ? "border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            : "border-gray-200 bg-slate-50/50 cursor-default"
                                        }
                                    `}
                                />
                            </div>
                        </div>

                        {/* Year of Establishment */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Year of Establishment <span className="text-slate-400 font-normal">(optional)</span>
                            </label>
                            <div className="relative flex items-center">
                                <Calendar size={15} className="absolute left-3 text-slate-400" />
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={company.yearEstablishment}
                                    onChange={(e) =>
                                        setCompany((c) => ({ ...c, yearEstablishment: e.target.value }))
                                    }
                                    className={`
                                        w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-900
                                        ${isEditing
                                            ? "border-blue-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            : "border-gray-200 bg-slate-50/50 cursor-default"
                                        }
                                    `}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Truck / Vehicle Details */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                        <Truck size={18} className="text-slate-600" />
                        <span>Truck / Vehicle Details</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Left Sub-column: List of Trucks */}
                        <div className="md:col-span-4 flex flex-col gap-2">
                            {trucks.map((truck) => {
                                const isSelected = truck.id === selectedTruckId;
                                return (
                                    <button
                                        key={truck.id}
                                        type="button"
                                        onClick={() => setSelectedTruckId(truck.id)}
                                        className={`
                                            w-full p-2.5 rounded-lg text-left transition cursor-pointer border
                                            ${isSelected
                                                ? "bg-blue-50/70 border-blue-500 text-blue-700"
                                                : "bg-slate-50/60 border-gray-200 text-slate-700 hover:bg-slate-100"
                                            }
                                        `}
                                    >
                                        <div className="text-xs font-bold leading-tight">
                                            {truck.name}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                            {truck.number}
                                        </div>
                                    </button>
                                );
                            })}

                            {/* + Add New Truck Button */}
                            <button
                                type="button"
                                onClick={addNewTruck}
                                className="w-full py-2 px-3 border border-dashed border-gray-300 hover:border-blue-500 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50/50 flex items-center justify-center gap-1.5 transition cursor-pointer mt-1"
                            >
                                <Plus size={14} />
                                <span>Add New Truck</span>
                            </button>
                        </div>

                        {/* Right Sub-details for selected truck */}
                        <div className="md:col-span-8 flex flex-col gap-3.5">
                            {/* Row 1: Vehicle Type & Truck Number */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Vehicle Type
                                    </label>
                                    <div className="relative flex items-center">
                                        <Truck size={15} className="absolute left-3 text-slate-400" />
                                        <select
                                            disabled={!isEditing}
                                            value={currentTruck.type}
                                            onChange={(e) => handleTruckChange("type", e.target.value)}
                                            className={`
                                                w-full pl-9 pr-7 py-2 bg-white border rounded-lg text-xs sm:text-sm text-slate-800 appearance-none
                                                ${isEditing
                                                    ? "border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                                                    : "border-gray-200 bg-slate-50/50 cursor-default"
                                                }
                                            `}
                                        >
                                            {VEHICLE_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="absolute right-2.5 text-slate-400 text-[10px] pointer-events-none">
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Truck Number
                                    </label>
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                        <div className="px-2 py-2 bg-slate-50 border-r border-gray-200 text-[10px] font-bold text-blue-700 select-none">
                                            IND
                                        </div>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={currentTruck.number}
                                            onChange={(e) =>
                                                handleTruckChange("number", e.target.value.toUpperCase())
                                            }
                                            className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-semibold uppercase text-slate-800 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Vehicle Capacity & Fuel Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Vehicle Capacity
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={currentTruck.capacity}
                                            onChange={(e) =>
                                                handleTruckChange("capacity", e.target.value)
                                            }
                                            className="w-16 px-2.5 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-lg text-slate-800 text-center"
                                        />
                                        <select
                                            disabled={!isEditing}
                                            value={currentTruck.capacityUnit}
                                            onChange={(e) =>
                                                handleTruckChange("capacityUnit", e.target.value)
                                            }
                                            className="flex-1 px-2.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg text-slate-800 bg-white"
                                        >
                                            <option value="tons">tons</option>
                                            <option value="kg">kg</option>
                                            <option value="quintal">quintal</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Fuel Type <span className="text-slate-400 font-normal">(optional)</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <Fuel size={15} className="absolute left-3 text-slate-400" />
                                        <select
                                            disabled={!isEditing}
                                            value={currentTruck.fuelType}
                                            onChange={(e) =>
                                                handleTruckChange("fuelType", e.target.value)
                                            }
                                            className="w-full pl-9 pr-7 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm text-slate-800 appearance-none"
                                        >
                                            {FUEL_OPTIONS.map((f) => (
                                                <option key={f} value={f}>
                                                    {f}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="absolute right-2.5 text-slate-400 text-[10px] pointer-events-none">
                                            ▼
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Truck Photos */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-2">
                                    Truck Photos
                                </label>
                                <input
                                    ref={truckPhotoInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleTruckPhotoUpload}
                                    className="hidden"
                                />
                                <div className="flex flex-wrap gap-2.5 items-center">
                                    {currentTruck.photos.map((p) => (
                                        <div
                                            key={p.id}
                                            className="relative w-16 h-14 rounded-lg overflow-hidden border border-gray-200 bg-slate-100 group shadow-2xs"
                                        >
                                            <img
                                                src={p.url}
                                                alt="Truck"
                                                className="w-full h-full object-cover"
                                            />
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTruckPhoto(p.id)}
                                                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 text-white flex items-center justify-center text-[10px]"
                                                >
                                                    <X size={10} />
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    {/* + Add Photo Dashed Box */}
                                    <button
                                        type="button"
                                        onClick={() => truckPhotoInputRef.current?.click()}
                                        className="w-16 h-14 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 transition cursor-pointer"
                                    >
                                        <Plus size={16} />
                                        <span className="text-[10px] font-medium mt-0.5">Add Photo</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Documents */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
                    <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                        <FileText size={18} className="text-slate-600" />
                        <span>Documents</span>
                    </h2>

                    <div className="flex flex-col gap-3">
                        {DOCUMENTS.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 rounded-xl border border-gray-150 hover:border-gray-300 bg-white hover:bg-slate-50/60 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-9 h-9 rounded-lg border flex items-center justify-center ${doc.colorClass}`}
                                    >
                                        <FileCheck size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                                            {doc.name}
                                        </h4>
                                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                            {doc.file}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedDoc(doc)}
                                    className="
                                        px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-white
                                        text-xs font-medium text-slate-700 transition cursor-pointer shadow-2xs
                                    "
                                >
                                    View
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Document Preview Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setSelectedDoc(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${selectedDoc.colorClass}`}>
                                <FileCheck size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {selectedDoc.name}
                                </h3>
                                <p className="text-xs text-slate-400 font-mono">{selectedDoc.file}</p>
                            </div>
                        </div>

                        {/* Mock document preview card */}
                        <div className="p-5 rounded-xl border-2 border-dashed border-gray-200 bg-slate-50/70 mb-4 text-xs flex flex-col gap-2.5">
                            <div className="flex justify-between border-b border-gray-200/60 pb-2">
                                <span className="text-slate-400">Document No:</span>
                                <span className="font-mono font-semibold text-slate-800">{selectedDoc.docNumber}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200/60 pb-2">
                                <span className="text-slate-400">Issued On:</span>
                                <span className="font-semibold text-slate-800">{selectedDoc.issueDate}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200/60 pb-2">
                                <span className="text-slate-400">Valid Till:</span>
                                <span className="font-semibold text-emerald-600">{selectedDoc.expiryDate}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-slate-400">Verification Status:</span>
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                                    <CheckCircle2 size={12} /> Verified
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedDoc(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
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

export default Profile;

