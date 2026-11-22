import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Search, Truck, RefreshCw, BadgeCheck, Package } from "lucide-react";
import { driverApi } from "../../../API/driverApi";
import { clearRememberedShipment, getRememberedShipment } from "../../../API/Shipmentapi";
import { API_BASE, bookingAPI } from "../../../API/api";
import { useFormDraft } from "../../../Authentication/useFormDraft";
import { useAuth } from "../../../Authentication/useAuth";
import { clearStoredDraft, formDraftKey } from "../../../Authentication/formDraftStorage.js";
import { clearShipmentDraftImages } from "../../../Authentication/shipmentImageDraftStorage.js";

const currency = value => value == null
  ? "Price on request"
  : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
const indiaDateLabel = value => value
  ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium" }).format(new Date(value))
  : "Not specified";

export default function Find() {
  const location = useLocation();
  const navigate = useNavigate();
  const shipment = location.state?.shipment;
  const { user } = useAuth();
  const rememberedShipment = getRememberedShipment(user?.id);
  const shipmentId = location.state?.shipmentId || shipment?.shipmentid || shipment?.shipmentId || Number(sessionStorage.getItem("currentShipmentId")) || rememberedShipment?.shipmentId || null;
  const [posts, setPosts] = useState([]);
  const [filters, setFilters, clearFilters] = useFormDraft({
    formId: "find-trucks-filters",
    initialValue: { type: "", cargoType: "", maxPrice: "", sort: "best" },
    validate: value => value && typeof value === "object"
      && typeof value.type === "string" && value.type.length <= 80
      && ["", "Small goods", "Industrial goods", "Fragile goods", "General cargo"].includes(value.cargoType)
      && typeof value.maxPrice === "string" && (value.maxPrice === "" || /^\d{1,10}(\.\d{1,2})?$/.test(value.maxPrice))
      && ["best", "price"].includes(value.sort),
  });
  const { type, cargoType, maxPrice, sort } = filters;
  const setType = value => setFilters(current => ({ ...current, type: value }));
  const setCargoType = value => setFilters(current => ({ ...current, cargoType: value }));
  const setMaxPrice = value => setFilters(current => ({ ...current, maxPrice: value }));
  const setSort = value => setFilters(current => ({ ...current, sort: value }));
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!shipmentId) return;
    setLoading(true);
    setError("");
    try {
      setPosts(await driverApi.listPublicCapacity({ shipmentId, type, cargoType, maxPrice, sort }));
    } catch (requestError) {
      if (requestError.status === 404 && requestError.data?.message === "Shipment not found") {
        sessionStorage.removeItem("currentShipmentId");
        setError("This shipment is no longer available. Create a new shipment to search for trucks.");
      } else {
        setError(requestError.message || "Could not load available trucks.");
      }
    } finally {
      setLoading(false);
    }
  }, [shipmentId, type, cargoType, maxPrice, sort]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const route = useMemo(() => ({
    from: shipment?.pickup || location.state?.pickup || rememberedShipment?.pickup || "",
    to: shipment?.destination || location.state?.destination || rememberedShipment?.destination || "",
    date: indiaDateLabel(shipment?.pickupDate || rememberedShipment?.pickupDate),
  }), [shipment, location.state, rememberedShipment]);

  const book = async post => {
    setBookingId(post.id);
    setError("");
    try {
      await bookingAPI.create({ availabilityId: post.id, shipmentId });
      clearFilters();
      clearStoredDraft(formDraftKey({ role: user?.role, userId: user?.id, formId: `parcel-details-${shipmentId || "pending"}` }));
      try { await clearShipmentDraftImages(user?.id, shipmentId); } catch { /* Booking succeeded; stale local image blobs are harmless and scoped to this user and shipment. */ }
      sessionStorage.removeItem("currentShipmentId");
      clearRememberedShipment(user?.id);
      navigate("/user/Booking", { state: { message: "Booking request sent." } });
    } catch (requestError) {
      setError(requestError.data?.message || requestError.message || "Could not send the booking request.");
    } finally {
      setBookingId("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-7">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-2xl font-bold">Find Available Trucks</h1><p className="mt-1 text-sm text-slate-600">Live availability matching your saved shipment route, date, and parcel weight.</p></div>
          <button type="button" onClick={load} disabled={loading || !shipmentId} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"><RefreshCw size={15}/> Refresh</button>
        </header>
        {!shipmentId ? <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Create a shipment and add parcel weight before searching for trucks.<button type="button" onClick={() => navigate("/user/shipment")} className="ml-2 font-semibold underline">Create shipment</button></section> : <>
          <section className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
            <p className="flex items-center gap-2 text-sm"><MapPin size={16} className="text-emerald-600"/>{route.from} → {route.to}</p>
            <p className="flex items-center gap-2 text-sm"><CalendarDays size={16} className="text-blue-600"/>Pickup: {route.date}</p>
            <label className="flex items-center gap-2 text-sm"><Search size={16} className="text-slate-500"/><select value={type} onChange={e => setType(e.target.value)} className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1"><option value="">All truck types</option>{["Tata", "Ashok", "Eicher", "Container", "Trailer", "Other"].map(value => <option key={value}>{value}</option>)}</select></label>
            <label className="flex items-center gap-2 text-sm"><Package size={16} className="text-slate-500"/><select aria-label="Accepted cargo type" value={cargoType} onChange={e => setCargoType(e.target.value)} className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1"><option value="">All cargo types</option>{["Small goods", "Industrial goods", "Fragile goods", "General cargo"].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
            <label className="text-sm sm:col-start-2">Maximum listed price <input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="ml-2 w-28 rounded border border-slate-200 px-2 py-1" placeholder="Any"/></label>
            <label className="text-sm">Sort <select value={sort} onChange={e => setSort(e.target.value)} className="ml-2 rounded border border-slate-200 px-2 py-1"><option value="best">Best route/date</option><option value="price">Lowest price</option></select></label>
            <button type="button" onClick={clearFilters} className="justify-self-start rounded border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Clear filters</button>
          </section>
          {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <p className="mb-3 text-sm font-semibold text-slate-700">{loading ? "Searching live availability…" : `${posts.length} matching ${posts.length === 1 ? "truck" : "trucks"}`}</p>
          {!loading && posts.length === 0 ? <section className="rounded-xl border border-slate-200 bg-white p-12 text-center"><Truck size={32} className="mx-auto text-slate-300"/><h2 className="mt-3 font-semibold">No available trucks for this shipment</h2><p className="mt-1 text-sm text-slate-500">Availability must match the route and exact pickup date ({route.date}). A truck posted for November 23 will not match a November 21 shipment.</p></section> : <div className="space-y-3">
            {posts.map(post => <article key={post.id} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex gap-3">{post.photos?.[0]?.url ? <img src={`${API_BASE}${post.photos[0].url}`} alt="Truck" className="h-20 w-24 rounded-lg bg-slate-100 object-cover"/> : <div className="flex h-20 w-24 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Truck size={28}/></div>}
                <div className="min-w-0"><h2 className="font-semibold">{post.vehicleName} <span className="font-normal text-slate-500">· {post.vehicleType}</span></h2><p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-slate-600"><MapPin size={14}/>{post.from} → {post.to}</p><p className="mt-1 text-sm text-slate-600">{post.driverName} · {post.driver?.verificationStatus === "approved" ? <span className="inline-flex items-center gap-1 text-emerald-700"><BadgeCheck size={14}/> Verified</span> : "Profile active"}</p><p className="mt-1 text-xs text-slate-500">{new Date(post.date).toLocaleDateString("en-IN")} · {post.availableCapacityKg.toLocaleString("en-IN")} kg capacity available</p></div>
              </div>
              <div className="flex items-center justify-between gap-4 md:justify-end"><div><p className="font-bold">{currency(post.price)}{post.priceType === "negotiable" ? " · negotiable" : ""}</p><p className="text-xs text-slate-500">Expected freight</p></div><button type="button" onClick={() => book(post)} disabled={Boolean(bookingId)} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{bookingId === post.id ? "Sending…" : "Book truck"}</button></div>
            </article>)}
          </div>}
        </>}
      </div>
    </main>
  );
}
