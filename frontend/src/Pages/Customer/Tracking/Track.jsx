import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { BadgeCheck, CalendarDays, Check, Circle, MapPin, RefreshCw, Truck } from "lucide-react";
import { API_BASE, bookingAPI } from "../../../API/api";
const RouteMap = lazy(() => import("../../components/RouteMap"));

const labels = { pending: "Awaiting driver response", accepted: "Accepted", in_transit: "In Transit", delivered: "Delivered", completed: "Completed", rejected: "Booking rejected", cancelled: "Booking cancelled" };
const timeline = ["Booking Requested", "Booking Accepted", "Truck Assigned", "In Transit", "Delivered", "Completed"];
const progressIndex = { pending: 0, accepted: 2, in_transit: 3, delivered: 4, completed: 5 };
const formatPrice = value => value == null
  ? "Not available"
  : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
const isAssigned = status => ["accepted", "in_transit", "delivered", "completed"].includes(status);

const toRadians = degrees => degrees * Math.PI / 180;
function distanceKm(a, b) {
  const [lat1, lon1] = a.map(toRadians);
  const [lat2, lon2] = b.map(toRadians);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function routeProgress(route, position) {
  if (!route?.positions?.length || !position) return null;
  const points = route.positions;
  let total = 0;
  const lengths = points.slice(1).map((point, index) => {
    const length = distanceKm(points[index], point);
    total += length;
    return length;
  });
  if (!total) return null;
  let prior = 0;
  let nearest = { distance: Infinity, travelled: 0 };
  points.slice(1).forEach((point, index) => {
    const start = points[index];
    const end = point;
    const scaleX = Math.cos(toRadians((start[0] + end[0]) / 2));
    const ax = start[1] * scaleX;
    const ay = start[0];
    const bx = end[1] * scaleX;
    const by = end[0];
    const px = position.longitude * scaleX;
    const py = position.latitude;
    const dx = bx - ax;
    const dy = by - ay;
    const denominator = dx * dx + dy * dy;
    const fraction = denominator ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / denominator)) : 0;
    const offset = Math.hypot(px - (ax + fraction * dx), py - (ay + fraction * dy));
    const snapped = [start[0] + (end[0] - start[0]) * fraction, start[1] + (end[1] - start[1]) * fraction];
    const offsetKm = distanceKm([position.latitude, position.longitude], snapped);
    if (offset < nearest.distance) nearest = { distance: offset, offsetKm, travelled: prior + lengths[index] * fraction };
    prior += lengths[index];
  });
  if (nearest.offsetKm > Math.max(5, (Number(position.accuracyMeters) || 0) * 2 / 1000)) return null;
  const roadDistance = Number(route.distanceKm) || total;
  const travelled = Math.min(roadDistance, roadDistance * nearest.travelled / total);
  return { travelled, remaining: Math.max(0, roadDistance - travelled), roadDistance };
}

function formatEta(route, progress) {
  if (!route?.durationSeconds || !progress || !progress.roadDistance) return "Unavailable";
  const eta = new Date(Date.now() + route.durationSeconds * 1000 * progress.remaining / progress.roadDistance);
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(eta);
}

export default function TrackShipment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedBookingId = searchParams.get("bookingId");
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingState, setTrackingState] = useState({ bookingId: "", position: null, message: "" });
  const [routeState, setRouteState] = useState({ bookingId: "", route: null });
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await bookingAPI.mine();
      const rows = result.data || [];
      setBookings(rows);
      setSelected(current => rows.some(row => row._id === requestedBookingId)
        ? requestedBookingId
        : rows.some(row => row._id === current) ? current : rows[0]?._id || "");
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load shipment status.");
    } finally { setLoading(false); }
  }, [requestedBookingId]);
  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, [load]);

  const booking = bookings.find(item => item._id === selected);
  const shipment = booking?.shipmentRef || {};
  const driver = booking?.driverId;
  const vehicle = booking?.vehicleId;
  const assigned = isAssigned(booking?.status);
  const terminalDecline = ["rejected", "cancelled"].includes(booking?.status);
  const currentProgress = progressIndex[booking?.status] ?? 0;
  const vehiclePhoto = vehicle?.photos?.[0]?.url;
  const bookingId = booking?._id;
  const livePosition = trackingState.bookingId === bookingId ? trackingState.position : null;
  const trackingMessage = trackingState.bookingId === bookingId ? trackingState.message : "";
  const route = routeState.bookingId === bookingId ? routeState.route : null;
  const progress = routeProgress(route, livePosition);

  useEffect(() => {
    if (!bookingId) return undefined;
    let active = true;
    const refreshTracking = () => bookingAPI.tracking(bookingId).then(result => {
      if (!active) return;
      setTrackingState(current => {
        if (current.bookingId === bookingId && current.position) {
          const latest = Date.parse(current.position.recordedAt) || 0;
          const fetched = Date.parse(result.data?.recordedAt) || 0;
          if (!result.data || latest > fetched) return { ...current, message: "" };
        }
        return { bookingId, position: result.data || null, message: result.data ? "" : "No live GPS update has been received from the driver's device yet." };
      });
    }).catch(() => {
      if (active) setTrackingState(current => current.bookingId === bookingId && current.position
        ? current
        : { bookingId, position: null, message: "Could not load the latest GPS location." });
    });
    refreshTracking();

    const socket = io(API_BASE, { withCredentials: true });
    socket.on("tracking:location", update => {
      if (update.bookingId !== bookingId) return;
      setTrackingState({ bookingId, position: update, message: "" });
    });
    socket.on("booking:status", update => {
      if (update.bookingId !== bookingId) return;
      setBookings(rows => rows.map(row => row._id === bookingId ? { ...row, status: update.status, updatedAt: update.updatedAt } : row));
    });
    socket.on("connect_error", () => setTrackingState(current => current.bookingId === bookingId ? { ...current, message: "Live connection unavailable. The latest available GPS update is shown." } : current));
    socket.on("disconnect", reason => {
      if (reason !== "io client disconnect") setTrackingState(current => current.bookingId === bookingId ? { ...current, message: "Live connection lost. Waiting to reconnect; the last GPS update remains visible." } : current);
    });
    socket.on("connect", () => {
      setTrackingState(current => current.bookingId === bookingId ? { ...current, message: "" } : current);
      refreshTracking();
    });
    return () => { active = false; socket.disconnect(); };
  }, [bookingId]);

  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-8"><div className="mx-auto max-w-5xl">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold text-blue-950">Shipment tracking</h1><p className="mt-1 text-slate-600">Booking progress, driver details, and live GPS when available.</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"><RefreshCw size={15}/> Refresh</button></header>
    {error && <p role="alert" className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {!loading && bookings.length > 0 && <label className="mt-6 block text-sm font-semibold">Choose booking<select value={selected} onChange={event => setSelected(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5">{bookings.map(item => <option key={item._id} value={item._id}>{item.shipmentRef?.pickup || "Pickup"} → {item.shipmentRef?.destination || "Destination"} · {labels[item.status] || item.status}</option>)}</select></label>}
    {loading ? <p className="mt-6 rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading shipment status…</p> : !booking ? <section className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center"><Truck size={34} className="mx-auto text-slate-400"/><h2 className="mt-3 font-semibold">No booked shipments to track</h2><p className="mt-1 text-sm text-slate-500">Your shipment status will appear after you request a truck.</p><button onClick={() => navigate("/user/Booking")} className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">View bookings</button></section> : <>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Booking {booking._id}</p><h2 className="mt-1 text-xl font-bold">{labels[booking.status] || booking.status}</h2></div><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold capitalize text-blue-700">{booking.status?.replaceAll("_", " ")}</span></div>
        <div className="my-6 grid gap-4 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Pickup</p><p className="mt-1 flex items-center gap-2 font-semibold"><MapPin size={16} className="text-emerald-600"/>{shipment.pickup || "Not available"}</p><p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={14}/>{shipment.pickupDate ? new Date(shipment.pickupDate).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "Date not specified"}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Delivery</p><p className="mt-1 flex items-center gap-2 font-semibold"><MapPin size={16} className="text-rose-600"/>{shipment.destination || "Not available"}</p></div></div>
        {terminalDecline ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">This booking ended as {booking.status}. No driver or truck assignment is active.</p> : <ol aria-label="Booking status timeline" className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{timeline.map((step, index) => {
          const complete = index <= currentProgress;
          return <li key={step} className={`rounded-lg border p-3 text-sm ${complete ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-500"}`}><span className="flex items-center gap-2">{complete ? <Check size={16}/> : <Circle size={16}/>}<span className="font-semibold">{step}</span></span></li>;
        })}</ol>}
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-slate-100 p-4"><p className="text-xs text-slate-500">Cargo type</p><p className="mt-1 font-semibold">{booking.cargoType || "Not specified"}</p></div><div className="rounded-lg border border-slate-100 p-4"><p className="text-xs text-slate-500">Cargo weight</p><p className="mt-1 font-semibold">{Number(booking.cargoWeightKg ?? booking.requestedCapacityKg ?? 0).toLocaleString("en-IN")} kg</p></div><div className="rounded-lg border border-slate-100 p-4"><p className="text-xs text-slate-500">Agreed price</p><p className="mt-1 font-semibold">{formatPrice(booking.amount)}</p></div></div>
      </section>

      <Suspense fallback={<div className="mt-5 flex h-72 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">Loading interactive map…</div>}>
        <RouteMap key={`booking-route-${booking._id}`} from={shipment.pickup || ""} to={shipment.destination || ""}
          intermediateStops={shipment.intermediateStops || []} livePosition={livePosition} onRouteCalculated={nextRoute => setRouteState({ bookingId, route: nextRoute })} className="mt-5" />
      </Suspense>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-label="Live journey information">
        <h2 className="text-lg font-bold">Live journey</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Distance travelled</p><p className="mt-1 font-semibold">{progress ? `${progress.travelled.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Unavailable"}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Remaining distance</p><p className="mt-1 font-semibold">{progress ? `${progress.remaining.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Unavailable"}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Estimated arrival</p><p className="mt-1 font-semibold">{formatEta(route, progress)}</p></div>
          <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Last GPS update</p><p className="mt-1 font-semibold">{livePosition?.recordedAt ? new Date(livePosition.recordedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "Not received"}</p></div>
        </div>
        {trackingMessage && <p role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{trackingMessage}</p>}
        {!livePosition && booking.status === "in_transit" && !trackingMessage && <p role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Live GPS is unavailable until the driver’s device shares a location.</p>}
        {livePosition && route && !progress && <p role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Journey distance and ETA are unavailable because the GPS position is too far from the planned road route.</p>}
        {livePosition && <p className="mt-3 text-xs text-slate-500">ETA uses the planned road route and does not include live traffic.</p>}
      </section>

      {assigned && <section className="mt-5 grid gap-5 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><BadgeCheck size={19} className="text-emerald-600"/>Assigned driver & truck owner</h2>
          <div className="flex items-center gap-4">{driver?.profilePhoto ? <img src={`${API_BASE}${driver.profilePhoto}`} alt={`${driver.name} profile`} className="h-16 w-16 rounded-full object-cover"/> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">{(driver?.name || "D").split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase()}</span>}<div><p className="font-semibold">{driver?.name || booking.driverProfileId?.ownerName || "Driver"}</p><p className="text-sm text-slate-600">{booking.driverProfileId?.companyName || "Vehicle owner and assigned driver"}</p></div></div>
          <dl className="mt-5 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-500">Phone</dt><dd className="font-medium">{driver?.phone || "Not available"}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Email</dt><dd className="break-all text-right font-medium">{driver?.email || "Not available"}</dd></div></dl>
          <p className="mt-4 text-xs text-slate-500">The current vehicle record identifies its registered driver as its owner.</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Truck size={19} className="text-blue-700"/>Assigned truck</h2>
          {vehiclePhoto ? <img src={`${API_BASE}${vehiclePhoto}`} alt="Assigned truck" className="mb-4 h-36 w-full rounded-lg bg-slate-100 object-cover"/> : <div className="mb-4 flex h-36 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Truck size={42}/></div>}
          <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Registration</dt><dd className="mt-1 font-semibold">{vehicle?.number || "Not available"}</dd></div><div><dt className="text-slate-500">Type</dt><dd className="mt-1 font-semibold">{vehicle?.type || "Not available"}</dd></div><div><dt className="text-slate-500">Model</dt><dd className="mt-1 font-semibold">{vehicle?.name || vehicle?.modelYear || "Not available"}</dd></div><div><dt className="text-slate-500">Capacity</dt><dd className="mt-1 font-semibold">{vehicle?.capacity != null ? `${vehicle.capacity} ${vehicle.capacityUnit || ""}` : "Not available"}</dd></div></dl>
        </article>
      </section>}
    </>}
  </div></main>;
}
