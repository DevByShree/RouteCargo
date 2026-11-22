import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Package, RefreshCw, Search, Truck, XCircle } from "lucide-react";
import { bookingAPI } from "../../../API/api";

const tabs = ["all", "pending", "accepted", "in_transit", "delivered", "cancelled", "rejected"];
const labels = { all: "All Bookings", pending: "Pending", accepted: "Accepted", in_transit: "In Transit", delivered: "Delivered", cancelled: "Cancelled", rejected: "Rejected", completed: "Delivered" };
const classes = { pending: "bg-amber-50 text-amber-700", accepted: "bg-emerald-50 text-emerald-700", in_transit: "bg-blue-50 text-blue-700", delivered: "bg-green-50 text-green-700", completed: "bg-green-50 text-green-700", cancelled: "bg-slate-100 text-slate-600", rejected: "bg-rose-50 text-rose-700" };
const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);

export default function MyBookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { const result = await bookingAPI.mine(); setBookings(result.data || []); setError(""); }
    catch (e) { setError(e.message || "Could not load your bookings."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const counts = useMemo(() => Object.fromEntries(tabs.map(tab => [tab, tab === "all" ? bookings.length : bookings.filter(b => b.status === tab || (tab === "delivered" && b.status === "completed")).length])), [bookings]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter(b => activeTab === "all" || b.status === activeTab || (activeTab === "delivered" && b.status === "completed"))
      .filter(b => !q || [b._id, b.shipmentRef?.pickup, b.shipmentRef?.destination, b.driverProfileId?.companyName, b.driverId?.name, b.vehicleId?.name].some(v => String(v || "").toLowerCase().includes(q)));
  }, [bookings, activeTab, query]);
  const cancel = async booking => {
    setBusy(String(booking._id)); setError("");
    try { await bookingAPI.cancel(booking._id); await load(); }
    catch (e) { setError(e.data?.message || e.message); }
    finally { setBusy(""); }
  };
  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-7"><div className="mx-auto max-w-6xl">
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-bold text-blue-950">My Bookings</h1><p className="mt-1 text-slate-600">Bookings created by your account.</p></div><div className="flex gap-2"><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"><RefreshCw size={15}/> Refresh</button><button type="button" onClick={() => navigate("/user/shipment")} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">New shipment</button></div></header>
    {location.state?.message && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{location.state.message}</p>}{error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5">{tabs.map(tab => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm ${activeTab === tab ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{labels[tab]}<span className="text-xs">{counts[tab]}</span></button>)}</div>
    <label className="mb-5 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3"><Search size={16} className="text-slate-400"/><input aria-label="Search bookings" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search route, driver, truck, or booking ID" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
    {loading ? <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading your bookings…</p> : !filtered.length ? <section className="rounded-xl border border-slate-200 bg-white p-12 text-center"><Package size={32} className="mx-auto text-slate-300"/><h2 className="mt-3 font-semibold">No bookings found</h2><p className="mt-1 text-sm text-slate-500">Real booking requests will appear after you book an available truck.</p></section> : <div className="space-y-3">{filtered.map(b => {
      const shipment = b.shipmentRef || {}; const status = b.status || "pending";
      const driver = b.driverProfileId?.companyName || b.driverProfileId?.ownerName || b.driverId?.name || "Driver";
      return <article key={b._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-slate-500">Booking {String(b._id).slice(-8).toUpperCase()} · {new Date(b.createdAt).toLocaleString("en-IN")}</p><h2 className="mt-1 font-semibold">{driver}</h2><p className="text-sm text-slate-600">{b.vehicleId?.name || "Truck"} · {b.vehicleId?.type || ""}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[status] || "bg-slate-100 text-slate-700"}`}>{labels[status] || status}</span></div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><p className="flex items-center gap-2"><MapPin size={15}/>{shipment.pickup || "Pickup"} → {shipment.destination || "Destination"}</p><p className="flex items-center gap-2"><CalendarDays size={15}/>{shipment.pickupDate ? new Date(shipment.pickupDate).toLocaleDateString("en-IN") : "Date not set"}</p><p className="flex items-center gap-2"><Truck size={15}/>{Number(b.requestedCapacityKg || 0).toLocaleString("en-IN")} kg requested</p><p className="font-semibold">{money(b.amount)}</p></div>
        {status === "pending" && <button type="button" disabled={busy === String(b._id)} onClick={() => cancel(b)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50"><XCircle size={15}/>{busy === String(b._id) ? "Cancelling…" : "Cancel request"}</button>}
      </article>;
    })}</div>}
  </div></main>;
}
