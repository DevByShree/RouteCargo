import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Truck, Package, Building2, Send, CheckCircle2 } from "lucide-react";

const TRUCKS_KEY = "routecargo_vehicles";
const PROFILE_KEY = "routecargo_driver_profile";
const CAPACITY_KEY = "routecargo_capacity_posts";
const field = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const label = "mb-1 block text-xs font-semibold text-slate-600";
const today = new Date().toISOString().slice(0, 10);

export default function RaiseRequest() {

    const navigate = useNavigate();

    const [trucks, setTrucks] = useState(() => JSON.parse(localStorage.getItem(TRUCKS_KEY) || "null") || []);
    const [profile] = useState(() => JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"));
    const [form, setForm] = useState({ truckId: "", availableCapacity: "", date: today, from: "", to: "", loadTypes: ["Small goods", "Industrial goods"], companyName: "", gstNumber: "", contactName: "", contactPhone: "", notes: "" });
    const [message, setMessage] = useState("");

    useEffect(() => {
        setTrucks(JSON.parse(localStorage.getItem(TRUCKS_KEY) || "[]"));
    }, []);

    const selectedTruck = useMemo(() => trucks.find(t => t.id === form.truckId), [trucks, form.truckId]);

    const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const toggleLoad = value => setForm(f => ({ ...f, loadTypes: f.loadTypes.includes(value) ? f.loadTypes.filter(x => x !== value) : [...f.loadTypes, value] }));

    const submit = e => {
        e.preventDefault();
        if (!selectedTruck) {
            setMessage("Please select a registered truck. Add a vehicle first if the list is empty.");
            return;
        }

        if (!form.from.trim() || !form.to.trim() || form.from.trim().toLowerCase() === form.to.trim().toLowerCase()) {
            setMessage("Enter different pickup and destination locations."); return;
        }

        const capacity = Number(form.availableCapacity);

        if (!capacity || capacity <= 0 || capacity > Number(selectedTruck.capacity)) {
            setMessage(`Available capacity must be greater than 0 and no more than ${selectedTruck.capacity} ${selectedTruck.capacityUnit}.`);
            return;
        }

        if (!form.loadTypes.length) {
            setMessage("Select at least one supported load type.");
            return;
        }

        const posts = JSON.parse(localStorage.getItem(CAPACITY_KEY) || "[]");
        const post = { id: `CAP-${Date.now()}`, truckId: selectedTruck.id, truckName: selectedTruck.name, truckNumber: selectedTruck.number, vehicleType: selectedTruck.type, totalCapacity: Number(selectedTruck.capacity), capacityUnit: selectedTruck.capacityUnit, availableCapacity: capacity, date: form.date, from: form.from.trim(), to: form.to.trim(), loadTypes: form.loadTypes, companyName: form.companyName.trim() || profile.companyName || "", gstNumber: form.gstNumber.trim() || profile.gstNumber || "", contactName: form.contactName.trim() || profile.ownerName || "", contactPhone: form.contactPhone.trim() || profile.contactNumber || "", notes: form.notes.trim(), status: "Available", createdAt: new Date().toISOString() };

        localStorage.setItem(CAPACITY_KEY, JSON.stringify([post, ...posts]));

        setMessage("Available truck capacity published successfully.");
        setForm(f => ({ ...f, availableCapacity: "", from: "", to: "", notes: "" }));
    };

    return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl">
        <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Raise Request</h1><p className="mt-1 text-sm text-slate-500">Publish available capacity so customers can match their cargo with your truck.</p></header>
        {message &&
            <div className={`mb-4 rounded-lg border p-3 text-sm ${message.includes("successfully") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{message}</div>}
        <form onSubmit={submit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <section>
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Truck size={18} /> Truck and Capacity</h2>
                {trucks.length === 0 && <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">No registered vehicles found. <button type="button" onClick={() => navigate("/driver/vehicles")} className="font-bold underline">Add a vehicle</button> before publishing capacity.</div>}
                <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                        <span className={label}>Select Truck *</span><select className={field} value={form.truckId} required onChange={e => { update("truckId", e.target.value); update("availableCapacity", "") }}><option value="">Choose a registered truck</option>{trucks.filter(t => t.available !== false).map(t => <option key={t.id} value={t.id}>{t.name} — {t.number}</option>)}</select></label>
                    <label>
                        <span className={label}>Available Capacity *</span><div className="flex"><input className={`${field} rounded-r-none`} type="number" min="0.1" step="0.1" max={selectedTruck?.capacity || undefined} value={form.availableCapacity} onChange={e => update("availableCapacity", e.target.value)} placeholder="Enter available capacity" required /><span className="flex min-w-20 items-center justify-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">{selectedTruck?.capacityUnit || "unit"}</span></div>{selectedTruck && <span className="mt-1 block text-xs text-slate-500">Truck total capacity: {selectedTruck.capacity} {selectedTruck.capacityUnit}</span>}</label>
                </div>
                {selectedTruck && <div className="mt-4 grid gap-3 rounded-lg bg-blue-50 p-4 text-sm sm:grid-cols-3"><div><span className="block text-xs text-blue-700">Vehicle</span><strong className="text-slate-800">{selectedTruck.type}</strong></div><div><span className="block text-xs text-blue-700">Registration</span><strong className="text-slate-800">{selectedTruck.number}</strong></div><div><span className="block text-xs text-blue-700">Total capacity</span><strong className="text-slate-800">{selectedTruck.capacity} {selectedTruck.capacityUnit}</strong></div></div>}
            </section>
            <section>
                <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><MapPin size={18} /> Route and Date</h2><div className="grid gap-4 sm:grid-cols-2"><label><span className={label}>From Location *</span><input className={field} value={form.from} onChange={e => update("from", e.target.value)} placeholder="Pickup city / location" required /></label><label><span className={label}>To Location *</span><input className={field} value={form.to} onChange={e => update("to", e.target.value)} placeholder="Destination city / location" required /></label><label><span className={label}>Available Travel Date *</span><div className="relative"><CalendarDays size={16} className="absolute left-3 top-3 text-slate-400" /><input className={`${field} pl-9`} type="date" min={today} value={form.date} onChange={e => update("date", e.target.value)} required /></div></label><div><span className={label}>Cargo Types Accepted *</span><div className="flex flex-wrap gap-2 pt-1">{["Small goods", "Industrial goods", "Fragile goods", "General cargo"].map(type => <label key={type} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${form.loadTypes.includes(type) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}><input className="accent-blue-600" type="checkbox" checked={form.loadTypes.includes(type)} onChange={() => toggleLoad(type)} />{type}</label>)}</div></div></div></section>
            <section>
                <h2 className="mb-1 flex items-center gap-2 font-semibold text-slate-900"><Building2 size={18} /> Company Details <span className="text-xs font-normal text-slate-400">(optional)</span></h2><p className="mb-4 text-xs text-slate-500">If left blank, your saved profile details will be used.</p><div className="grid gap-4 sm:grid-cols-2"><label><span className={label}>Company Name</span><input className={field} value={form.companyName} onChange={e => update("companyName", e.target.value)} placeholder={profile.companyName || "Company name"} /></label><label><span className={label}>GST Number</span><input className={field} value={form.gstNumber} onChange={e => update("gstNumber", e.target.value)} placeholder={profile.gstNumber || "GST number"} /></label><label><span className={label}>Contact Person</span><input className={field} value={form.contactName} onChange={e => update("contactName", e.target.value)} placeholder={profile.ownerName || "Contact name"} /></label><label><span className={label}>Contact Number</span><input className={field} value={form.contactPhone} onChange={e => update("contactPhone", e.target.value)} placeholder={profile.contactNumber || "Phone number"} /></label><label className="sm:col-span-2"><span className={label}>Notes</span><textarea className={field} rows={3} value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Route preferences, loading instructions or other details" /></label></div></section>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => navigate("/driver/profile")} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={trucks.filter(t => t.available !== false).length === 0} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} /> Publish Availability</button></div>
        </form>
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><CheckCircle2 size={14} /> This demo saves availability in your browser. Connect your API for shared customer visibility.</p>
    </div>
    </main>;
}
