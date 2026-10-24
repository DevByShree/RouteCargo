import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Calendar,
    Truck,
    Package,
    ShoppingBag,
    User,
    Phone,
    Building2,
    FileText,
    Info,
    UploadCloud,
    X,
    CheckCircle2,
    ArrowRight
} from "lucide-react";

import truckFront from "../../assets/driver/truck_front.png";
import truckSide from "../../assets/driver/truck_side.png";
import truckBack from "../../assets/driver/truck_back.png";

const VEHICLE_TYPES = [
    "Tata 14 Wheeler",
    "Ashok Leyland 16 Wheeler",
    "Eicher 12 Wheeler",
    "Tata 10 Wheeler",
    "BharatBenz 14 Wheeler",
    "Mahindra Bolero Maxi Truck (1.5 Ton)",
    "Container 20ft",
    "Container 32ft Multi-Axle",
    "Trailer 40ft"
];

const LOAD_TYPES = [
    "Electronics",
    "Cement",
    "Construction Material",
    "Textile",
    "FMCG",
    "Industrial Machinery",
    "Agricultural Produce",
    "Chemicals / Liquids",
    "Auto Parts",
    "Any Load Type"
];

function RaiseRequest() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Form state matching screenshot defaults / inputs
    const [formData, setFormData] = useState({
        // Trip Details
        pickupLocation: "",
        dropLocation: "",
        preferredDate: "",
        expectedAmount: "",

        // Vehicle Details
        vehicleType: "",
        truckNumber: "",
        vehicleCapacity: "",

        // Load Details
        loadType: "",
        approximateWeight: "",

        // Owner / Transport Details
        ownerName: "",
        ownerContact: "",
        transportCompanyName: "",
        gstNumber: "",

        // Notes
        additionalNotes: "",
    });

    // Uploaded photos state with initial screenshot photos
    const [photos, setPhotos] = useState([
        { id: "p1", url: truckFront, label: "Front View" },
        { id: "p2", url: truckSide, label: "Side View" },
        { id: "p3", url: truckBack, label: "Rear View" },
    ]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        if (photos.length + files.length > 5) {
            alert("Maximum 5 photos allowed.");
            return;
        }

        const newPhotos = files.map((file, idx) => ({
            id: `upload-${Date.now()}-${idx}`,
            url: URL.createObjectURL(file),
            label: file.name,
        }));

        setPhotos((prev) => [...prev, ...newPhotos]);
    };

    const removePhoto = (idToRemove) => {
        setPhotos((prev) => prev.filter((p) => p.id !== idToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.pickupLocation.trim()) newErrors.pickupLocation = "Pickup location is required";
        if (!formData.dropLocation.trim()) newErrors.dropLocation = "Drop location is required";
        if (!formData.preferredDate) newErrors.preferredDate = "Date is required";
        if (!formData.expectedAmount) newErrors.expectedAmount = "Expected amount is required";
        if (!formData.vehicleType) newErrors.vehicleType = "Select vehicle type";
        if (!formData.truckNumber.trim()) newErrors.truckNumber = "Truck number is required";
        if (!formData.loadType) newErrors.loadType = "Select load type";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccessModal(true);
        }, 800);
    };

    return (
        <div className="pb-12">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                    Raise Driver Request
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1">
                    Fill in the trip, vehicle and owner details to list your truck for a load.
                </p>
            </div>

            {/* Main Form Form */}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: Sections 1 to 4 */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {/* 1. Trip Details */}
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
                            <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <span>1. Trip Details</span>
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* From (Pickup Location) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        From (Pickup Location)
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <MapPin size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.pickupLocation}
                                            onChange={(e) => handleInputChange("pickupLocation", e.target.value)}
                                            placeholder="Enter pickup location"
                                            className={`
                                                w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400
                                                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition
                                                ${errors.pickupLocation ? "border-rose-400" : "border-gray-200"}
                                            `}
                                        />
                                    </div>
                                    {errors.pickupLocation && (
                                        <p className="text-rose-500 text-xs mt-1">{errors.pickupLocation}</p>
                                    )}
                                </div>

                                {/* To (Drop Location) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        To (Drop Location)
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <MapPin size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.dropLocation}
                                            onChange={(e) => handleInputChange("dropLocation", e.target.value)}
                                            placeholder="Enter drop location"
                                            className={`
                                                w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400
                                                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition
                                                ${errors.dropLocation ? "border-rose-400" : "border-gray-200"}
                                            `}
                                        />
                                    </div>
                                    {errors.dropLocation && (
                                        <p className="text-rose-500 text-xs mt-1">{errors.dropLocation}</p>
                                    )}
                                </div>

                                {/* Preferred Date */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Preferred Date
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <Calendar size={18} />
                                        </div>
                                        <input
                                            type="date"
                                            value={formData.preferredDate}
                                            onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                                            className={`
                                                w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400
                                                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition
                                                ${errors.preferredDate ? "border-rose-400" : "border-gray-200"}
                                            `}
                                        />
                                    </div>
                                    {errors.preferredDate && (
                                        <p className="text-rose-500 text-xs mt-1">{errors.preferredDate}</p>
                                    )}
                                </div>

                                {/* Expected Amount */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                                        <span>Expected Amount (₹)</span>
                                        <span title="Expected freight fare for the complete trip." className="text-slate-400 hover:text-blue-600 cursor-pointer">
                                            <Info size={14} />
                                        </span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-500 font-semibold text-sm pointer-events-none">
                                            ₹
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.expectedAmount}
                                            onChange={(e) => handleInputChange("expectedAmount", e.target.value)}
                                            placeholder="Enter expected amount"
                                            className={`
                                                w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400
                                                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition
                                                ${errors.expectedAmount ? "border-rose-400" : "border-gray-200"}
                                            `}
                                        />
                                    </div>
                                    {errors.expectedAmount && (
                                        <p className="text-rose-500 text-xs mt-1">{errors.expectedAmount}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Vehicle Details */}
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
                            <h2 className="text-base font-semibold text-slate-900 mb-4">
                                2. Vehicle Details
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Vehicle Type */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Vehicle Type
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <Truck size={18} />
                                        </div>
                                        <select
                                            value={formData.vehicleType}
                                            onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                                            className={`
                                                w-full pl-10 pr-8 py-2.5 bg-white border rounded-lg text-sm text-slate-800
                                                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none
                                                ${errors.vehicleType ? "border-rose-400" : "border-gray-200"}
                                            `}
                                        >
                                            <option value="">Select vehicle type</option>
                                            {VEHICLE_TYPES.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 text-slate-400 pointer-events-none text-xs">
                                            ▼
                                        </div>
                                    </div>
                                    {errors.vehicleType && (
                                        <p className="text-rose-500 text-xs mt-1">{errors.vehicleType}</p>
                                    )}
                                </div>

                                {/* Truck Number with IND Badge */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Truck Number
                                    </label>
                                    <div className={`
                                        flex items-center border rounded-lg overflow-hidden bg-white
                                        focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition
                                        ${errors.truckNumber ? "border-rose-400" : "border-gray-200"}
                                    `}>
                                        <div className="px-2.5 py-2.5 bg-slate-50 border-r border-gray-200 flex items-center gap-1 select-none">
                                            <span className="text-[10px] font-bold tracking-wider text-blue-700 border border-blue-600/40 rounded px-1 py-0.5 bg-white">
                                                IND
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.truckNumber}
                                            onChange={(e) => handleInputChange("truckNumber", e.target.value.toUpperCase())}
                                            placeholder="e.g. MH12AB1234"
                                            className="w-full px-3 py-2.5 text-sm uppercase tracking-wider font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                                        />
                                    </div>
                                    {errors.truckNumber && (
                                        <p className="text-rose-500 text-xs mt-1">{errors.truckNumber}</p>
                                    )}
                                </div>

                                {/* Vehicle Capacity (optional) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Vehicle Capacity <span className="text-slate-400 font-normal">(optional)</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <ShoppingBag size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.vehicleCapacity}
                                            onChange={(e) => handleInputChange("vehicleCapacity", e.target.value)}
                                            placeholder="e.g. 10 tons"
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Load Details */}
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
                            <h2 className="text-base font-semibold text-slate-900 mb-4">
                                3. Load Details
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Load Type */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Load Type
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <Package size={18} />
                                        </div>
                                        <select
                                            value={formData.loadType}
                                            onChange={(e) => handleInputChange("loadType", e.target.value)}
                                            className={`
                                                w-full pl-10 pr-8 py-2.5 bg-white border rounded-lg text-sm text-slate-800
                                                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition appearance-none
                                                ${errors.loadType ? "border-rose-400" : "border-gray-200"}
                                            `}
                                        >
                                            <option value="">Select load type</option>
                                            {LOAD_TYPES.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 text-slate-400 pointer-events-none text-xs">
                                            ▼
                                        </div>
                                    </div>
                                    {errors.loadType && (
                                        <p className="text-rose-500 text-xs mt-1">{errors.loadType}</p>
                                    )}
                                </div>

                                {/* Approximate Weight */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Approximate Weight
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <ShoppingBag size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.approximateWeight}
                                            onChange={(e) => handleInputChange("approximateWeight", e.target.value)}
                                            placeholder="e.g. 5 tons"
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Owner / Transportation Details */}
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
                            <h2 className="text-base font-semibold text-slate-900 mb-4">
                                4. Owner / Transportation Details
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Owner Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Owner Name
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.ownerName}
                                            onChange={(e) => handleInputChange("ownerName", e.target.value)}
                                            placeholder="Enter owner name"
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                {/* Owner Contact Number */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Owner Contact Number
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.ownerContact}
                                            onChange={(e) => handleInputChange("ownerContact", e.target.value)}
                                            placeholder="Enter contact number"
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                {/* Transport Company Name (optional) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Transport Company Name <span className="text-slate-400 font-normal">(optional)</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <Building2 size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.transportCompanyName}
                                            onChange={(e) => handleInputChange("transportCompanyName", e.target.value)}
                                            placeholder="Enter company name"
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>

                                {/* GST Number (optional) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        GST Number <span className="text-slate-400 font-normal">(optional)</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                                            <FileText size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.gstNumber}
                                            onChange={(e) => handleInputChange("gstNumber", e.target.value.toUpperCase())}
                                            placeholder="Enter GST number"
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sections 5, 6 and Submit button */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* 5. Truck Photos */}
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
                            <h2 className="text-base font-semibold text-slate-900 mb-1">
                                5. Truck Photos
                            </h2>
                            <p className="text-xs text-slate-500 mb-4">
                                Upload clear photos of your truck (front, back or side view).
                            </p>

                            {/* Dropzone */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="
                                    border-2 border-dashed border-gray-200 hover:border-blue-500/60
                                    bg-slate-50/70 hover:bg-blue-50/30 rounded-xl p-6
                                    flex flex-col items-center justify-center text-center cursor-pointer transition group
                                "
                            >
                                <div className="w-10 h-10 rounded-full bg-white shadow-2xs border border-gray-100 flex items-center justify-center text-slate-600 group-hover:text-blue-600 mb-2 transition">
                                    <UploadCloud size={20} />
                                </div>
                                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition">
                                    Click to upload photos
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    JPG, PNG (Max 5 images)
                                </p>
                            </div>

                            {/* Photos preview thumbnails */}
                            {photos.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    {photos.map((photo) => (
                                        <div
                                            key={photo.id}
                                            className="relative aspect-4/3 rounded-lg overflow-hidden border border-gray-200 group bg-slate-100 shadow-2xs"
                                        >
                                            <img
                                                src={photo.url}
                                                alt={photo.label}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                            {/* Delete 'X' button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removePhoto(photo.id);
                                                }}
                                                aria-label="Remove photo"
                                                className="
                                                    absolute top-1.5 right-1.5 w-5 h-5 rounded-full
                                                    bg-black/75 hover:bg-black text-white
                                                    flex items-center justify-center text-xs transition cursor-pointer
                                                "
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 6. Additional Notes (optional) */}
                        <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-5 sm:p-6">
                            <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <FileText size={18} className="text-slate-500" />
                                <span>6. Additional Notes <span className="text-slate-400 font-normal text-xs">(optional)</span></span>
                            </h2>
                            <textarea
                                rows={4}
                                value={formData.additionalNotes}
                                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                                placeholder="Add any additional details for the trip..."
                                className="w-full p-3.5 bg-white border border-gray-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                            />
                        </div>

                        {/* Raise Request Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                                w-full py-3.5 px-6 rounded-lg text-white font-semibold text-sm
                                bg-[#1A73E8] hover:bg-blue-700 active:scale-[0.99]
                                transition shadow-sm cursor-pointer flex items-center justify-center gap-2
                                ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}
                            `}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Listing Your Truck...</span>
                                </>
                            ) : (
                                <span>Raise Request</span>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            Driver Request Raised!
                        </h3>
                        <p className="text-sm text-slate-500 mt-2 mb-6">
                            Your truck <span className="font-semibold text-slate-800">{formData.truckNumber || "MH12AB1234"}</span> has been listed for load matching on route <span className="font-semibold text-slate-800">{formData.pickupLocation || "Pickup"} → {formData.dropLocation || "Drop"}</span>.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => navigate("/driver/my-requests")}
                                className="flex-1 bg-[#1A73E8] hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span>View My Requests</span>
                                <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setFormData({
                                        pickupLocation: "",
                                        dropLocation: "",
                                        preferredDate: "",
                                        expectedAmount: "",
                                        vehicleType: "",
                                        truckNumber: "",
                                        vehicleCapacity: "",
                                        loadType: "",
                                        approximateWeight: "",
                                        ownerName: "",
                                        ownerContact: "",
                                        transportCompanyName: "",
                                        gstNumber: "",
                                        additionalNotes: "",
                                    });
                                }}
                                className="px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-slate-50 text-slate-700 font-medium text-sm transition cursor-pointer"
                            >
                                Raise Another
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RaiseRequest;

