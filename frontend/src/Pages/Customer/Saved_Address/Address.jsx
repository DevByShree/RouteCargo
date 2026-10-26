import { useEffect, useMemo, useRef, useState } from "react";
import {
    Plus, Search, X, MapPin, Pencil, Trash2, Star, AlertCircle, SearchX, Home, Building2, Warehouse,
} from "lucide-react";

// Replace with data from your API
const INITIAL_ADDRESSES = [
    { id: 1, name: "Home", isDefault: true, line1: "123, Sai Nagar, Hinjewadi", city: "Pune", state: "Maharashtra", pincode: "411057", type: "both" },
    { id: 2, name: "Office", isDefault: false, line1: "6th Floor, Tech Park One, Hinjewadi Phase 1", city: "Pune", state: "Maharashtra", pincode: "411057", type: "both" },
    { id: 3, name: "Warehouse", isDefault: false, line1: "Plot No. 45, MIDC Area, Chakan", city: "Pune", state: "Maharashtra", pincode: "410501", type: "pickup" },
    { id: 4, name: "Mumbai Address", isDefault: false, line1: "A-102, Andheri Industrial Estate, Andheri (E)", city: "Mumbai", state: "Maharashtra", pincode: "400069", type: "delivery" },
    { id: 5, name: "Nashik Warehouse", isDefault: false, line1: "Gat No. 123, Satpur MIDC", city: "Nashik", state: "Maharashtra", pincode: "422007", type: "delivery" },
    { id: 6, name: "Delhi Office", isDefault: false, line1: "B-27, Sector 62", city: "Noida", state: "Delhi", pincode: "201309", type: "delivery" },
];

const TYPE_LABEL = { both: "Pickup & Delivery", pickup: "Pickup", delivery: "Delivery" };
const TYPE_STYLE = {
    both: "bg-blue-50 text-blue-700",
    pickup: "bg-emerald-50 text-emerald-700",
    delivery: "bg-orange-50 text-orange-700",
};
const TABS = [
    { id: "all", label: "All Addresses" },
    { id: "pickup", label: "Pickup Addresses" },
    { id: "delivery", label: "Delivery Addresses" },
];

const EMPTY_FORM = { name: "", line1: "", city: "", state: "", pincode: "", type: "both", isDefault: false };

const labelIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("home")) return Home;
    if (n.includes("warehouse")) return Warehouse;
    if (n.includes("office")) return Building2;
    return MapPin;
};

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

/* ---------- Modal shell (dialog, Escape, backdrop click, scroll lock) ---------- */
function Modal({ titleId, onClose, children }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onMouseDown={(e) => e.stopPropagation()}
                className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl sm:p-7"
            >
                {children}
            </div>
        </div>
    );
}

function FormField({ id, label, error, children }) {
    return (
        <div className="min-w-0">
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
                {label} <span className="text-red-500">*</span>
            </label>
            {children}
            {error && (
                <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" /> {error}
                </p>
            )}
        </div>
    );
}

/* ---------- Add / Edit address ---------- */
function AddressModal({ initial, onClose, onSave }) {
    const editing = !!initial;
    const [form, setForm] = useState(initial ? { ...initial } : EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const firstRef = useRef(null);

    useEffect(() => { firstRef.current?.focus(); }, []);

    const set = (name, value) => {
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const err = {};
        if (!form.name.trim()) err.name = "Enter a label for this address.";
        if (!form.line1.trim()) err.line1 = "Enter the street address.";
        if (!form.city.trim()) err.city = "Enter the city.";
        if (!form.state.trim()) err.state = "Enter the state.";
        if (!/^\d{6}$/.test(form.pincode)) err.pincode = "Enter a 6-digit pincode.";
        setErrors(err);
        if (Object.keys(err).length) return;

        onSave({
            ...form,
            id: initial?.id ?? Date.now(),
            name: form.name.trim(),
            line1: form.line1.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
        });
        onClose();
    };

    const input = (field) =>
        `h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${errors[field]
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
        }`;
    const aria = (field) => ({ "aria-invalid": !!errors[field], "aria-describedby": errors[field] ? `${field}-error` : undefined });

    return (
        <Modal titleId="address-modal-title" onClose={onClose}>
            <div className="flex items-center justify-between">
                <h2 id="address-modal-title" className="text-xl font-bold text-blue-950">
                    {editing ? "Edit Address" : "Add New Address"}
                </h2>
                <button type="button" onClick={onClose} aria-label="Close" className={`rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 ${focusRing}`}>
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                <FormField id="name" label="Label" error={errors.name}>
                    <input ref={firstRef} id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Home, Office, Warehouse" className={input("name")} {...aria("name")} />
                </FormField>

                <FormField id="line1" label="Address" error={errors.line1}>
                    <input id="line1" value={form.line1} onChange={(e) => set("line1", e.target.value)} placeholder="Flat / Plot no., Street, Area" className={input("line1")} {...aria("line1")} />
                </FormField>

                <div className="grid gap-5 sm:grid-cols-2">
                    <FormField id="city" label="City" error={errors.city}>
                        <input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} className={input("city")} {...aria("city")} />
                    </FormField>
                    <FormField id="state" label="State" error={errors.state}>
                        <input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} className={input("state")} {...aria("state")} />
                    </FormField>
                </div>

                <FormField id="pincode" label="Pincode" error={errors.pincode}>
                    <input
                        id="pincode"
                        value={form.pincode}
                        onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        placeholder="6-digit pincode"
                        className={input("pincode")}
                        {...aria("pincode")}
                    />
                </FormField>

                <fieldset>
                    <legend className="mb-2 text-sm font-medium text-slate-700">Address type</legend>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(TYPE_LABEL).map(([value, label]) => (
                            <label
                                key={value}
                                className={`flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2.5 text-center text-xs font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 ${form.type === value ? "border-blue-700 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <input type="radio" name="type" value={value} checked={form.type === value} onChange={() => set("type", value)} className="sr-only" />
                                {label}
                            </label>
                        ))}
                    </div>
                </fieldset>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                    <input type="checkbox" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-blue-700" />
                    Set as default address
                </label>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Cancel
                    </button>
                    <button type="submit" className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800">
                        {editing ? "Save Changes" : "Save Address"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/* ---------- Delete confirmation ---------- */
function ConfirmDelete({ address, onClose, onConfirm }) {
    return (
        <Modal titleId="delete-modal-title" onClose={onClose}>
            <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50">
                    <Trash2 className="h-5 w-5 text-red-600" />
                </span>
                <div>
                    <h2 id="delete-modal-title" className="text-lg font-bold text-blue-950">Delete this address?</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        <b className="font-semibold text-slate-800">{address.name}</b> will be removed from your saved addresses. This can't be undone.
                    </p>
                </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Cancel
                </button>
                <button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700">
                    Delete
                </button>
            </div>
        </Modal>
    );
}

/* ---------- Page ---------- */
export default function Address() {
    const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
    const [activeTab, setActiveTab] = useState("all");
    const [query, setQuery] = useState("");
    const [modal, setModal] = useState(null); // { mode: "add" } | { mode: "edit", address } | { mode: "delete", address }

    const closeModal = () => setModal(null);

    const saveAddress = (saved) => {
        setAddresses((prev) => {
            const base = saved.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
            return base.some((a) => a.id === saved.id)
                ? base.map((a) => (a.id === saved.id ? saved : a))
                : [saved, ...base];
        });
    };

    const makeDefault = (id) =>
        setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));

    const deleteAddress = (id) => {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        closeModal();
    };

    const count = (id) =>
        id === "all" ? addresses.length : addresses.filter((a) => a.type === "both" || a.type === id).length;

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return addresses
            .filter((a) => activeTab === "all" || a.type === "both" || a.type === activeTab)
            .filter((a) => !q || `${a.name} ${a.line1} ${a.city} ${a.state} ${a.pincode}`.toLowerCase().includes(q))
            .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)); // default first
    }, [addresses, activeTab, query]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <main className="w-full px-7 pb-8 pt-20 md:pt-10">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Saved Addresses</h1>
                        <p className="mt-1 text-slate-600">Manage your frequently used pickup and delivery locations.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setModal({ mode: "add" })}
                        className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800"
                    >
                        <Plus className="h-4 w-4" /> Add New Address
                    </button>
                </div>

                {/* Tabs + search */}
                <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div role="tablist" aria-label="Address type" className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                        {TABS.map((tab) => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    role="tab"
                                    type="button"
                                    aria-selected={active}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${active ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    {tab.label}
                                    <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                                        {count(tab.id)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 lg:w-80">
                        <Search className="h-4 w-4 shrink-0 text-slate-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search addresses"
                            placeholder="Search addresses..."
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="text-slate-400 hover:text-slate-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Address cards */}
                <ul className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                    {visible.map((a) => {
                        const Icon = labelIcon(a.name);
                        return (
                            <li key={a.id} className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                                        <Icon className="h-5 w-5 text-blue-600" strokeWidth={1.8} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="truncate text-base font-bold text-slate-900">{a.name}</h2>
                                            {a.isDefault && (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                    <Star className="h-3 w-3 fill-blue-600 text-blue-600" /> Default
                                                </span>
                                            )}
                                        </div>
                                        <span className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${TYPE_STYLE[a.type]}`}>
                                            {TYPE_LABEL[a.type]}
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm text-slate-700">{a.line1}</p>
                                <p className="text-sm text-slate-500">{a.city}, {a.state} - {a.pincode}</p>

                                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setModal({ mode: "edit", address: a })}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                                    >
                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                    </button>
                                    {!a.isDefault && (
                                        <button
                                            type="button"
                                            onClick={() => makeDefault(a.id)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                        >
                                            <Star className="h-3.5 w-3.5" /> Make default
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setModal({ mode: "delete", address: a })}
                                        className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Delete
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {visible.length === 0 && (
                    <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                            <SearchX className="h-6 w-6 text-slate-400" />
                        </span>
                        <p className="font-semibold text-slate-800">No addresses found</p>
                        <p className="text-sm text-slate-500">
                            {query || activeTab !== "all" ? "Try a different search or tab." : "Add your first address to get started."}
                        </p>
                        {!query && activeTab === "all" && (
                            <button type="button" onClick={() => setModal({ mode: "add" })} className="mt-1 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                                Add New Address
                            </button>
                        )}
                    </div>
                )}
            </main>

            {modal?.mode === "add" && <AddressModal onClose={closeModal} onSave={saveAddress} />}
            {modal?.mode === "edit" && <AddressModal initial={modal.address} onClose={closeModal} onSave={saveAddress} />}
            {modal?.mode === "delete" && (
                <ConfirmDelete address={modal.address} onClose={closeModal} onConfirm={() => deleteAddress(modal.address.id)} />
            )}
        </div>
    );
}