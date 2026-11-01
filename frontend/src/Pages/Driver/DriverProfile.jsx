import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, MapPin, Building2, Truck, Pencil, Save, Plus } from "lucide-react";

const PROFILE_KEY = "routecargo_driver_profile";
const TRUCKS_KEY = "routecargo_vehicles";
const defaultProfile = {
  ownerName: "Rohit Singh", contactNumber: "+91 98765 43210", email: "rohit.singh@gmail.com",
  altNumber: "", address: "Bhopal, Madhya Pradesh, India", companyName: "Singh Transport Pvt. Ltd.",
  gstNumber: "27ABCDE1234F1Z5", companyAddress: "Transport Nagar, Bhopal, Madhya Pradesh", yearEstablishment: "2020"
};
const sampleTrucks = [
  { id: "truck-1", name: "Truck 1", number: "MH12AB1234", type: "Tata 14 Wheeler", capacity: 8, capacityUnit: "tons", fuelType: "Diesel", modelYear: "2022", documents: [], photos: [], available: true },
  { id: "truck-2", name: "Truck 2", number: "MH40XY5678", type: "Ashok Leyland 16 Wheeler", capacity: 15, capacityUnit: "tons", fuelType: "Diesel", modelYear: "2021", documents: [], photos: [], available: true },
  { id: "truck-3", name: "Truck 3", number: "RJ14CD9876", type: "Eicher 12 Wheeler", capacity: 10, capacityUnit: "tons", fuelType: "Diesel", modelYear: "2023", documents: [], photos: [], available: true }
];
const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";
const labelClass = "mb-1 block text-xs font-semibold text-slate-600";

export default function DriverProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => ({ ...defaultProfile, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") }));
  const [trucks, setTrucks] = useState(() => JSON.parse(localStorage.getItem(TRUCKS_KEY) || "null") || sampleTrucks);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => localStorage.setItem(TRUCKS_KEY, JSON.stringify(trucks)), [trucks]);
  const update = (key, value) => setProfile(p => ({ ...p, [key]: value }));
  const save = () => { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile</h1><p className="mt-1 text-sm text-slate-500">Manage your personal and transport company details.</p></div>
        <button onClick={() => editing ? save() : setEditing(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">{editing ? <Save size={16}/> : <Pencil size={16}/>} {editing ? "Save Profile" : "Edit Profile"}</button>
      </header>
      {saved && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Profile saved on this device.</div>}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 font-semibold text-slate-900"><User size={18}/> Personal / Owner Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[ ["ownerName","Owner Name"], ["contactNumber","Contact Number"], ["email","Email Address"], ["altNumber","Alternative Number"], ["address","Address"] ].map(([key,title]) => <label key={key} className={key === "address" ? "sm:col-span-2" : ""}><span className={labelClass}>{title}{key === "altNumber" ? " (optional)" : ""}</span><input className={inputClass} disabled={!editing} value={profile[key] || ""} onChange={e=>update(key,e.target.value)} type={key === "email" ? "email" : "text"}/></label>)}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 font-semibold text-slate-900"><Building2 size={18}/> Transport Company Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[["companyName","Company Name"],["gstNumber","GST Number"],["yearEstablishment","Year Established"],["companyAddress","Company Address"]].map(([key,title])=><label key={key} className={key === "companyAddress" ? "sm:col-span-2" : ""}><span className={labelClass}>{title}</span><input className={inputClass} disabled={!editing} value={profile[key] || ""} onChange={e=>update(key,e.target.value)}/></label>)}
          </div>
        </section>
      </div>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 font-semibold text-slate-900"><Truck size={18}/> My Vehicles</h2><p className="mt-1 text-sm text-slate-500">A summary of your registered trucks.</p></div><button onClick={()=>navigate("/driver/vehicles")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={16}/> Add Vehicle</button></div>
        {trucks.length === 0 ? <p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">No vehicles added yet.</p> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{trucks.map(t=><article key={t.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{t.name || t.type}</p><p className="mt-1 text-sm text-slate-500">{t.number}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.available === false ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>{t.available === false ? "Unavailable" : "Available"}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Vehicle type</p><p className="mt-1 font-medium text-slate-800">{t.type}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Capacity</p><p className="mt-1 font-medium text-slate-800">{t.capacity} {t.capacityUnit}</p></div></div><button onClick={()=>navigate("/driver/vehicles")} className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800">Manage vehicle →</button></article>)}</div>}
      </section>
    </div>
  </main>;
}
