import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Package, Plus, RefreshCw, Truck } from "lucide-react";
import { bookingAPI } from "../../../API/api";
import { useAuth } from "../../../Authentication/useAuth";

const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { const result = await bookingAPI.mine(); setBookings(result.data || []); setError(""); }
    catch (requestError) { setError(requestError.message || "Could not load your shipments."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, [load]);
  const active = useMemo(() => bookings.filter(item => ["accepted", "in_transit"].includes(item.status)), [bookings]);
  const completed = useMemo(() => bookings.filter(item => ["delivered", "completed"].includes(item.status)), [bookings]);
  const stats = [
    ["Booking requests", bookings.length, Package],
    ["Active shipments", active.length, Truck],
    ["Completed deliveries", completed.length, ArrowRight],
  ];
  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold text-blue-950">Welcome back{user?.name ? `, ${user.name}` : ""}</h1><p className="mt-1 text-slate-600">Your shipment and booking activity.</p></div><div className="flex gap-2"><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"><RefreshCw size={15}/> Refresh</button><button type="button" onClick={() => navigate("/user/shipment")} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"><Plus size={16}/> New shipment</button></div></header>
    {error && <p role="alert" className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <section className="mt-7 grid gap-4 sm:grid-cols-3">{stats.map(([label, value, Icon]) => <article key={label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5"><span className="rounded-lg bg-blue-50 p-3 text-blue-700"><Icon size={21}/></span><div><p className="text-2xl font-bold">{loading ? "—" : value}</p><p className="text-sm text-slate-500">{label}</p></div></article>)}</section>
    <section className="mt-7 rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Recent bookings</h2><p className="text-sm text-slate-500">Live requests made from your account.</p></div><button onClick={() => navigate("/user/Booking")} className="text-sm font-semibold text-blue-700">All bookings</button></div>
      {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading bookings…</p> : bookings.length === 0 ? <div className="rounded-lg bg-slate-50 p-8 text-center"><Truck className="mx-auto text-slate-400"/><p className="mt-2 font-semibold">No bookings yet</p><p className="mt-1 text-sm text-slate-500">Create a shipment and find an available truck to get started.</p><button onClick={() => navigate("/user/shipment")} className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Create shipment</button></div> : <div className="divide-y divide-slate-100">{bookings.slice(0, 5).map(item => <article key={item._id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{item.shipmentRef?.pickup || "Pickup"} <span className="px-1 text-slate-400">→</span> {item.shipmentRef?.destination || "Destination"}</p><p className="mt-1 text-sm text-slate-500">{item.vehicleId?.name || "Truck"} · {new Date(item.createdAt).toLocaleDateString("en-IN")}</p></div><div className="text-right"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">{item.status?.replaceAll("_", " ")}</span><p className="mt-1 text-sm font-semibold">{money(item.amount)}</p></div></article>)}</div>}
    </section>
  </main>;
}
