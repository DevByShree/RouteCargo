import { useState, useEffect } from "react";

const initialAddresses = [
    { id: 1, name: "Home", isDefault: true, line1: "123, Sai Nagar, Hinjewadi", line2: "Pune, Maharashtra - 411057", type: "both" },
    { id: 2, name: "Office", line1: "6th Floor, Tech Park One", line2: "Hinjewadi Phase 1, Pune - 411057", type: "both" },
    { id: 3, name: "Warehouse", line1: "Plot No. 45, MIDC Area", line2: "Chakan, Pune - 410501", type: "pickup" },
    { id: 4, name: "Mumbai Address", line1: "A-102, Andheri Industrial Estate", line2: "Andheri (E), Mumbai - 400069", type: "delivery" },
    { id: 5, name: "Nashik Warehouse", line1: "Gat No. 123, Satpur MIDC", line2: "Nashik, Maharashtra - 422007", type: "delivery" },
    { id: 6, name: "Delhi Office", line1: "B-27, Sector 62", line2: "Noida, Delhi - 201309", type: "delivery" },
];

const typeLabel = { both: "Pickup & Delivery", pickup: "Pickup", delivery: "Delivery" };

const emptyForm = {
    name: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    type: "both",
    isDefault: false,
};

function AddAddressModal({ onClose, onSave }) {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    // Escape dabane par band ho jaye
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const validate = () => {
        const err = {};
        if (!form.name.trim()) err.name = "Label zaroori hai";
        if (!form.line1.trim()) err.line1 = "Address zaroori hai";
        if (!form.city.trim()) err.city = "City zaroori hai";
        if (!form.state.trim()) err.state = "State zaroori hai";
        if (!/^\d{6}$/.test(form.pincode)) err.pincode = "6 digit pincode daalo";
        return err;
    };

    const handleSubmit = () => {
        const err = validate();
        setErrors(err);
        if (Object.keys(err).length > 0) return;

        onSave({
            id: Date.now(),
            name: form.name.trim(),
            line1: form.line1.trim(),
            line2: `${form.city.trim()}, ${form.state.trim()} - ${form.pincode}`,
            type: form.type,
            isDefault: form.isDefault,
        });
        onClose();
    };

    const inputClass = (field) =>
        `w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${errors[field] ? "border-red-500" : "border-gray-300"
        }`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // andar click par band na ho
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold">Add New Address</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl leading-none">
                        ×
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium">Label</label>
                        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Home, Office, Warehouse" className={inputClass("name")} />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-medium">Address</label>
                        <input name="line1" value={form.line1} onChange={handleChange} placeholder="Flat / Plot no., Street, Area" className={inputClass("line1")} />
                        {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">City</label>
                            <input name="city" value={form.city} onChange={handleChange} className={inputClass("city")} />
                            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium">State</label>
                            <input name="state" value={form.state} onChange={handleChange} className={inputClass("state")} />
                            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Pincode</label>
                            <input name="pincode" value={form.pincode} onChange={handleChange} maxLength={6} inputMode="numeric" className={inputClass("pincode")} />
                            {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium">Address Type</label>
                            <select name="type" value={form.type} onChange={handleChange} className={inputClass("type")}>
                                <option value="both">Pickup & Delivery</option>
                                <option value="pickup">Pickup</option>
                                <option value="delivery">Delivery</option>
                            </select>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
                        Set as default address
                    </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
                        Save Address
                    </button>
                </div>
            </div>
        </div>
    );
}

function Address() {
    const [addresses, setAddresses] = useState(initialAddresses);
    const [activeTab, setActiveTab] = useState("all");
    const [query, setQuery] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleAdd = (newAddress) => {
        setAddresses((prev) => {
            // naya default ho to purane se default hata do
            const base = newAddress.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
            return [newAddress, ...base];
        });
    };

    const matchesTab = (a) =>
        activeTab === "all" || a.type === "both" || a.type === activeTab;

    const visible = addresses.filter(
        (a) =>
            matchesTab(a) &&
            `${a.name} ${a.line1} ${a.line2}`.toLowerCase().includes(query.toLowerCase())
    );

    const count = (id) =>
        id === "all" ? addresses.length : addresses.filter((a) => a.type === "both" || a.type === id).length;

    const tabs = [
        { id: "all", label: "All Addresses" },
        { id: "pickup", label: "Pickup Addresses" },
        { id: "delivery", label: "Delivery Addresses" },
    ];

    return (
        <div className="px-10 mt-10">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <span className="font-semibold">Saved Addresses</span>
                    <span className="font-bold text-3xl">Your Saved Addresses</span>
                    <span className="font-light">Manage your frequently used pickup and delivery locations.</span>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                    + Add New Address
                </button>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                {tab.label} ({count(tab.id)})
                            </button>
                        ))}
                    </div>

                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search addresses..."
                        className="border rounded-lg px-4 py-2 w-64"
                    />
                </div>

                <ul className="mt-4 divide-y">
                    {visible.map((a) => (
                        <li key={a.id} className="flex items-center justify-between py-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{a.name}</span>
                                    {a.isDefault && (
                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Default</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{a.line1}</p>
                                <p className="text-sm text-gray-600">{a.line2}</p>
                            </div>

                            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded">
                                {typeLabel[a.type]}
                            </span>

                            <div className="flex gap-2">
                                <button className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600">Edit</button>
                                <button
                                    onClick={() => setAddresses((prev) => prev.filter((x) => x.id !== a.id))}
                                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                    {visible.length === 0 && (
                        <li className="py-8 text-center text-gray-500">No addresses found.</li>
                    )}
                </ul>
            </div>

            {showModal && (
                <AddAddressModal onClose={() => setShowModal(false)} onSave={handleAdd} />
            )}
        </div>
    );
}

export default Address;