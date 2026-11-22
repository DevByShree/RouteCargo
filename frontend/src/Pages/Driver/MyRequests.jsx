import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarDays, Package, Phone, Building2, CheckCircle2, XCircle, Truck, IndianRupee, Filter, Pencil, Save, X } from "lucide-react";
import { driverApi, normalizeCapacity, normalizeRequest } from "../../API/driverApi";
import { useFormDraft } from "../../Authentication/useFormDraft";
const RouteMap = lazy(() => import("../components/RouteMap"));
const NO_ROUTE_STOPS = [];
const statusClasses = { Pending: "bg-amber-50 text-amber-700", Accepted: "bg-emerald-50 text-emerald-700", Rejected: "bg-rose-50 text-rose-700", "In Transit": "bg-blue-50 text-blue-700", Completed: "bg-slate-100 text-slate-700" };
const capacityToKg = (value, unit) => /^(ton|tons)$/i.test(String(unit || "")) ? Number(value) * 1000 : /^(kg|kgs)$/i.test(String(unit || "")) ? Number(value) : 0;
const pickAvailabilityEdit = value => value ? ({ id: value.id, vehicleId: value.vehicleId, vehicleName: value.vehicleName, vehicleNumber: value.vehicleNumber, availableCapacity: value.availableCapacity, date: value.date, from: value.from, to: value.to, loadTypes: value.loadTypes, price: value.price, priceType: value.priceType, companyName: value.companyName, contactNumber: value.contactNumber, notes: value.notes }) : null;
const validAvailabilityEdit = value => value === null || (value && typeof value === "object"
  && typeof value.id === "string" && value.id.length <= 100 && typeof value.availableCapacity === "string"
  && typeof value.vehicleId === "string" && value.vehicleId.length <= 100
  && typeof value.date === "string" && typeof value.from === "string" && typeof value.to === "string"
  && value.from.length <= 160 && value.to.length <= 160
  && Array.isArray(value.loadTypes) && value.loadTypes.every(item => ["Small goods", "Industrial goods", "Fragile goods", "General cargo"].includes(item))
  && (value.price == null || (typeof value.price === "number" && Number.isFinite(value.price) && value.price >= 0))
  && (value.priceType == null || ["fixed", "negotiable"].includes(value.priceType)));
const restoreAvailabilityEdit = value => value;

export default function MyRequests() {
  const [searchParams] = useSearchParams();
  const notificationBookingId = searchParams.get("bookingId");
  const [requests, setRequests] = useState([]);
  const [capacityPosts, setCapacityPosts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingPost, setEditingPost, clearEditingDraft] = useFormDraft({ formId: "availability-edit", initialValue: null, pick: pickAvailabilityEdit, validate: validAvailabilityEdit, restore: restoreAvailabilityEdit });
  const [savingPost, setSavingPost] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [gpsState, setGpsState] = useState({ tripIds: "", message: "" });
  const lastGpsSentAt = useRef(0);
  useEffect(() => {
    Promise.all([driverApi.listRequests(), driverApi.listCapacity(), driverApi.listBookings(), driverApi.listVehicles()])
      .then(([nextRequests, nextPosts, nextBookings, nextVehicles]) => { setRequests(nextRequests); setCapacityPosts(nextPosts); setBookings(nextBookings); setVehicles(nextVehicles); })
      .catch(e => setError(e.message));
  }, []);
  const activeTripIds = bookings.filter(booking => booking.status === "in_transit").map(booking => booking._id).join(",");
  const gpsError = gpsState.tripIds === activeTripIds ? gpsState.message : "";
  useEffect(() => {
    if (!activeTripIds || !navigator.geolocation) return undefined;
    const tripIds = activeTripIds.split(",");
    const options = { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 };
    const sendPosition = async (position, force = false) => {
      const now = Date.now();
      if (!force && now - lastGpsSentAt.current < 8000) return;
      lastGpsSentAt.current = now;
      const gps = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      const results = await Promise.allSettled(tripIds.map(id => driverApi.updateTrackingLocation(id, gps)));
      if (results.some(result => result.status === "rejected")) {
        setGpsState({ tripIds: activeTripIds, message: "Live GPS could not be sent. Check your connection and location permission." });
      } else setGpsState({ tripIds: activeTripIds, message: "" });
    };
    const handleGpsError = error => {
      const message = error.code === error.PERMISSION_DENIED
        ? "Location permission is off. Allow location access in your browser to share live GPS."
        : error.code === error.POSITION_UNAVAILABLE
          ? "Your device cannot determine its current location. Live GPS is unavailable."
          : "GPS is taking too long to respond. Live location will resume when a position is available.";
      setGpsState({ tripIds: activeTripIds, message });
    };
    const watchId = navigator.geolocation.watchPosition(position => sendPosition(position), handleGpsError, options);
    const retryWithFreshPosition = () => navigator.geolocation.getCurrentPosition(position => sendPosition(position, true), handleGpsError, options);
    window.addEventListener("online", retryWithFreshPosition);
    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener("online", retryWithFreshPosition);
    };
  }, [activeTripIds]);
  useEffect(() => {
    if (!notificationBookingId || !bookings.length) return undefined;
    const timer = window.setTimeout(() => document.getElementById(`booking-${notificationBookingId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    return () => window.clearTimeout(timer);
  }, [notificationBookingId, bookings]);
  const updateBooking = async (booking, action, status) => {
    try {
      const result = action === "accept" ? await driverApi.acceptBooking(booking._id)
        : action === "reject" ? await driverApi.rejectBooking(booking._id)
          : await driverApi.updateBookingStatus(booking._id, status);
      setBookings(rows => rows.map(row => row._id === booking._id ? { ...row, ...(result || {}), status: status || (action === "accept" ? "accepted" : "rejected") } : row));
    } catch (requestError) { setError(requestError.message || "Could not update this booking."); }
  };
  const counts = useMemo(() => ({ All: requests.length, Pending: requests.filter(r=>r.status==="Pending").length, Accepted: requests.filter(r=>r.status==="Accepted").length, Rejected: requests.filter(r=>r.status==="Rejected").length, "In Transit": requests.filter(r=>r.status==="In Transit").length, Completed: requests.filter(r=>r.status==="Completed").length }), [requests]);
  const filtered = requests.filter(r => (filter === "All" || r.status === filter) && `${r.id} ${r.customerName} ${r.from} ${r.to} ${r.loadType}`.toLowerCase().includes(search.toLowerCase()));
  const decide = async (id, status) => { try { const updated = normalizeRequest(await driverApi.updateRequestStatus(id, status)); setRequests(rs=>rs.map(r=>r.id===id?updated:r)); setNotice(`Request ${id} ${status.toLowerCase()}.`); setTimeout(()=>setNotice(""),2500); } catch (e) { setError(e.message); } };
  const editPost = post => setEditingPost({
    ...post,
    vehicleId: String(post.vehicleId?._id || post.truckId || post.vehicleId || ""),
    vehicleName: post.vehicleName || post.truckName || post.vehicleId?.name || "",
    vehicleNumber: post.vehicleNumber || post.truckNumber || post.vehicleId?.number || "",
    availableCapacity: String(post.availableCapacityKg ?? capacityToKg(post.availableCapacity, post.capacityUnit)),
    capacityUnit: "kg",
    date: post.date || "",
    from: post.from || "",
    to: post.to || "",
    loadTypes: Array.isArray(post.loadTypes) ? post.loadTypes : [],
    companyName: post.companyName || "",
    contactNumber: post.contactNumber || post.contactPhone || "",
    notes: post.notes || "",
  });
  const updatePost = (key, value) => setEditingPost(post => ({ ...post, [key]: value }));
  const editingVehicle = editingPost ? vehicles.find(vehicle => vehicle.id === editingPost.vehicleId) : null;
  const togglePostLoad = value => setEditingPost(post => ({
    ...post,
    loadTypes: post.loadTypes.includes(value) ? post.loadTypes.filter(item => item !== value) : [...post.loadTypes, value],
  }));
  const savePost = async event => {
    event.preventDefault();
    if (!editingPost) return;
    if (!editingPost.vehicleId) { setError("Select a vehicle for this availability."); return; }
    if (!Number.isFinite(Number(editingPost.availableCapacity)) || Number(editingPost.availableCapacity) <= 0) { setError("Enter an available capacity greater than zero."); return; }
    const selectedVehicle = vehicles.find(vehicle => vehicle.id === editingPost.vehicleId);
    if (!selectedVehicle) { setError("The selected vehicle is no longer in your vehicle list."); return; }
    if (Number(editingPost.availableCapacity) > capacityToKg(selectedVehicle.capacity, selectedVehicle.capacityUnit)) { setError("Available capacity cannot exceed the selected vehicle capacity."); return; }
    if (!editingPost.loadTypes.length) { setError("Select at least one cargo type."); return; }
    setSavingPost(true);
    setError("");
    try {
      const updated = normalizeCapacity(await driverApi.updateCapacity(editingPost.id, {
        vehicleId: editingPost.vehicleId,
        availableCapacityKg: Number(editingPost.availableCapacity),
        date: editingPost.date,
        from: editingPost.from.trim(),
        to: editingPost.to.trim(),
        loadTypes: editingPost.loadTypes,
        price: editingPost.price,
        priceType: editingPost.priceType,
        companyName: editingPost.companyName?.trim(),
        contactNumber: editingPost.contactNumber?.trim(),
        notes: editingPost.notes?.trim(),
      }));
      setCapacityPosts(posts => posts.map(post => post.id === updated.id ? { ...post, ...updated, vehicleId: selectedVehicle.id, truckId: selectedVehicle.id, truckName: selectedVehicle.name, truckNumber: selectedVehicle.number, vehicleType: selectedVehicle.type, totalCapacity: selectedVehicle.capacity, capacityUnit: "kg" } : post));
      clearEditingDraft();
      setNotice("Published availability updated.");
      setTimeout(() => setNotice(""), 2500);
    } catch (e) { setError(e.message); }
    finally { setSavingPost(false); }
  };
  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="mb-6"><h1 className="text-2xl font-bold text-slate-900">My Requests</h1><p className="mt-1 text-sm text-slate-500">Review customer cargo requests and decide which loads you want to transport.</p></header>
    {notice && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
    {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4"><h2 className="text-lg font-bold text-slate-900">Shipment booking requests</h2><p className="mt-1 text-sm text-slate-500">Requests from customers who booked your published availability.</p></div>
      {bookings.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No shipment booking requests yet.</p> : <div className="space-y-3">{bookings.map(booking => {
        const shipment = booking.shipmentRef || {};
        const customer = booking.customerId || {};
        const status = booking.status || "pending";
        return <article id={`booking-${booking._id}`} key={booking._id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
          <div><p className="font-semibold">{shipment.pickup || "Pickup"} → {shipment.destination || "Destination"}</p><p className="mt-1 text-sm text-slate-500">{customer.name || "Customer"} · {Number(booking.requestedCapacityKg || 0).toLocaleString("en-IN")} kg · {booking.vehicleId?.name || "Vehicle"}</p><span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">{status.replaceAll("_", " ")}</span></div>
          {status === "pending" ? <div className="flex gap-2"><button onClick={() => updateBooking(booking, "accept")} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Accept</button><button onClick={() => updateBooking(booking, "reject")} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">Reject</button></div> : status === "accepted" ? <button onClick={() => updateBooking(booking, "status", "in_transit")} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Mark in transit</button> : status === "in_transit" ? <button onClick={() => updateBooking(booking, "status", "delivered")} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white">Mark delivered</button> : null}
          {status === "in_transit" && <p role={gpsError || !navigator.geolocation ? "alert" : "status"} className={`w-full rounded-lg p-3 text-sm ${gpsError || !navigator.geolocation ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>{gpsError || (!navigator.geolocation ? "This browser does not support GPS location sharing." : "Sharing live GPS from this device while the shipment is in transit.")}</p>}
          {["accepted", "in_transit"].includes(status) && <Suspense fallback={<div className="flex h-72 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">Loading interactive map…</div>}>
            <RouteMap key={`driver-route-${booking._id}`} from={shipment.pickup || ""} to={shipment.destination || ""}
              intermediateStops={shipment.intermediateStops || NO_ROUTE_STOPS} actionLabel={status === "in_transit" ? "Start Navigation" : "Open planned route"} className="w-full"/>
          </Suspense>}
        </article>;
      })}</div>}
    </section>
    <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-lg font-bold text-slate-900">Published Availability</h2><p className="mt-1 text-sm text-slate-500">Trips and available truck capacity you have published.</p></div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{capacityPosts.length} post{capacityPosts.length === 1 ? "" : "s"}</span>
      </div>
      {capacityPosts.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">You have not published any availability yet.</p> : <div className="space-y-3">{capacityPosts.map(post => <article key={post.id} className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{post.from} <span className="text-blue-600">→</span> {post.to}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${post.status === "Available" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{post.status}</span></div><p className="mt-1 text-sm text-slate-600">{post.truckName || post.vehicleType || "Vehicle"}{post.truckNumber ? ` · ${post.truckNumber}` : ""}</p><p className="mt-1 text-xs text-slate-500">{post.date || "Date not set"} · {post.availableCapacity} {post.capacityUnit} available · {(post.loadTypes || []).join(", ")}</p></div>
        <button type="button" disabled={post.status !== "Available"} onClick={() => editPost(post)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Pencil size={15}/> Edit availability</button>
      </article>)}</div>}
      {editingPost && <form onSubmit={savePost} className="mt-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">Edit published availability</h3><button type="button" onClick={clearEditingDraft} className="rounded-md p-1 text-slate-500 hover:bg-white" aria-label="Cancel editing"><X size={18}/></button></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold text-slate-600">Vehicle / truck<select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" required value={editingPost.vehicleId} onChange={e => { const vehicle = vehicles.find(item => item.id === e.target.value); setEditingPost(current => ({ ...current, vehicleId: e.target.value, vehicleName: vehicle?.name || "", vehicleNumber: vehicle?.number || "" })); }}><option value="">Select vehicle</option>{vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id} disabled={!vehicle.available && vehicle.id !== editingPost.vehicleId}>{vehicle.name} · {vehicle.number} · {vehicle.type}{vehicle.available ? "" : " (unavailable)"}</option>)}</select><span className="mt-1 block font-normal">Registration: {editingVehicle?.number || editingPost.vehicleNumber || "Not available"}</span></label>
          <label className="text-xs font-semibold text-slate-600">Available capacity (KG)<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" type="number" min="0.1" step="0.1" max={editingVehicle ? capacityToKg(editingVehicle.capacity, editingVehicle.capacityUnit) : undefined} required value={editingPost.availableCapacity} onChange={e => updatePost("availableCapacity", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">Travel date<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" type="date" required value={editingPost.date} onChange={e => updatePost("date", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">From<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" required value={editingPost.from} onChange={e => updatePost("from", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">To<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" required value={editingPost.to} onChange={e => updatePost("to", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">Price (optional)<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" type="number" min="0" step="0.01" value={editingPost.price ?? ""} onChange={e => updatePost("price", e.target.value === "" ? null : Number(e.target.value))}/></label>
          <label className="text-xs font-semibold text-slate-600">Price type<select className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" value={editingPost.priceType || "negotiable"} onChange={e => updatePost("priceType", e.target.value)}><option value="negotiable">Negotiable</option><option value="fixed">Fixed</option></select></label>
          <label className="text-xs font-semibold text-slate-600">Company name<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" value={editingPost.companyName || ""} onChange={e => updatePost("companyName", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">Contact number<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" value={editingPost.contactNumber || ""} onChange={e => updatePost("contactNumber", e.target.value)}/></label>
          <fieldset className="sm:col-span-2 lg:col-span-3"><legend className="mb-2 text-xs font-semibold text-slate-600">Cargo types accepted</legend><div className="flex flex-wrap gap-2">{["Small goods", "Industrial goods", "Fragile goods", "General cargo"].map(type => <label key={type} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"><input type="checkbox" checked={editingPost.loadTypes.includes(type)} onChange={() => togglePostLoad(type)}/>{type}</label>)}</div></fieldset>
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2 lg:col-span-3">Notes<textarea className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" rows="2" value={editingPost.notes || ""} onChange={e => updatePost("notes", e.target.value)}/></label>
        </div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={clearEditingDraft} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Discard draft</button><button disabled={savingPost} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save size={15}/>{savingPost ? "Saving…" : "Save changes"}</button></div>
      </form>}
    </section>
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{["All","Pending","Accepted","Rejected","In Transit","Completed"].map(s=><button key={s} onClick={()=>setFilter(s)} className={`rounded-xl border p-3 text-left ${filter===s?"border-blue-300 bg-blue-50 ring-1 ring-blue-100":"border-slate-200 bg-white hover:bg-slate-50"}`}><p className="text-xs font-medium text-slate-500">{s}</p><p className="mt-1 text-xl font-bold text-slate-900">{counts[s]}</p></button>)}</div>
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Filter size={16} className="absolute left-3 top-3 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by request, customer, route or cargo..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"/></div><p className="self-center text-sm text-slate-500">{filtered.length} request{filtered.length===1?"":"s"}</p></div>
    {filtered.length===0 ? <div className="rounded-xl border border-slate-200 bg-white p-12 text-center"><Package size={32} className="mx-auto text-slate-300"/><h2 className="mt-3 font-semibold text-slate-800">No requests found</h2><p className="mt-1 text-sm text-slate-500">Try another filter or search term.</p></div> : <div className="space-y-4">{filtered.map(r=><article key={r.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-slate-500">{r.id}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[r.status] || statusClasses.Pending}`}>{r.status}</span><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{r.loadType}</span></div><h2 className="mt-3 flex flex-wrap items-center gap-2 text-lg font-bold text-slate-900"><span>{r.from}</span><span className="text-blue-500">→</span><span>{r.to}</span></h2><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="flex items-start gap-2 text-sm"><CalendarDays size={16} className="mt-0.5 shrink-0 text-slate-400"/><div><p className="text-xs text-slate-500">Pickup date</p><p className="font-medium text-slate-800">{r.date || "Not specified"}</p></div></div><div className="flex items-start gap-2 text-sm"><Package size={16} className="mt-0.5 shrink-0 text-slate-400"/><div><p className="text-xs text-slate-500">Cargo weight</p><p className="font-medium text-slate-800">{r.weight} {r.unit || "tons"}</p></div></div><div className="flex items-start gap-2 text-sm"><IndianRupee size={16} className="mt-0.5 shrink-0 text-slate-400"/><div><p className="text-xs text-slate-500">Offered price</p><p className="font-semibold text-slate-900">₹{Number(r.amount || 0).toLocaleString("en-IN")}</p></div></div><div className="flex items-start gap-2 text-sm"><Building2 size={16} className="mt-0.5 shrink-0 text-slate-400"/><div><p className="text-xs text-slate-500">Customer company</p><p className="font-medium text-slate-800">{r.companyName || r.customerName}</p></div></div></div>{r.description && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{r.description}</p>}<div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><span className="font-semibold text-slate-700">Customer:</span>{r.customerName}</span><span className="inline-flex items-center gap-1.5"><Phone size={13}/>{r.customerPhone || "Contact not provided"}</span></div></div>
      {r.status === "Pending" ? <div className="flex shrink-0 gap-2 lg:flex-col"><button onClick={()=>decide(r.id,"Accepted")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><CheckCircle2 size={16}/> Accept</button><button onClick={()=>decide(r.id,"Rejected")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"><XCircle size={16}/> Reject</button></div> : r.status === "Accepted" ? <button onClick={()=>decide(r.id,"In Transit")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Truck size={16}/> Mark In Transit</button> : r.status === "In Transit" ? <button onClick={()=>decide(r.id,"Completed")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900">Mark Completed</button> : null}
    </div></article>)}</div>}
    <p className="mt-4 text-xs text-slate-400">Requests and status updates are synced with your account.</p>
  </div></main>;
}
