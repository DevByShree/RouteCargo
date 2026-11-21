import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Package, Phone, Building2, CheckCircle2, XCircle, Truck, IndianRupee, Filter, Pencil, Save, X } from "lucide-react";
import { driverApi, normalizeCapacity, normalizeRequest } from "../../API/driverApi";
const statusClasses = { Pending: "bg-amber-50 text-amber-700", Accepted: "bg-emerald-50 text-emerald-700", Rejected: "bg-rose-50 text-rose-700", "In Transit": "bg-blue-50 text-blue-700", Completed: "bg-slate-100 text-slate-700" };

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [capacityPosts, setCapacityPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [savingPost, setSavingPost] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    Promise.all([driverApi.listRequests(), driverApi.listCapacity()])
      .then(([nextRequests, nextPosts]) => { setRequests(nextRequests); setCapacityPosts(nextPosts); })
      .catch(e => setError(e.message));
  }, []);
  const counts = useMemo(() => ({ All: requests.length, Pending: requests.filter(r=>r.status==="Pending").length, Accepted: requests.filter(r=>r.status==="Accepted").length, Rejected: requests.filter(r=>r.status==="Rejected").length, "In Transit": requests.filter(r=>r.status==="In Transit").length, Completed: requests.filter(r=>r.status==="Completed").length }), [requests]);
  const filtered = requests.filter(r => (filter === "All" || r.status === filter) && `${r.id} ${r.customerName} ${r.from} ${r.to} ${r.loadType}`.toLowerCase().includes(search.toLowerCase()));
  const decide = async (id, status) => { try { const updated = normalizeRequest(await driverApi.updateRequestStatus(id, status)); setRequests(rs=>rs.map(r=>r.id===id?updated:r)); setNotice(`Request ${id} ${status.toLowerCase()}.`); setTimeout(()=>setNotice(""),2500); } catch (e) { setError(e.message); } };
  const editPost = post => setEditingPost({
    ...post,
    availableCapacity: post.availableCapacity ?? "",
    date: post.date || "",
    from: post.from || "",
    to: post.to || "",
    loadTypes: Array.isArray(post.loadTypes) ? post.loadTypes : [],
    companyName: post.companyName || "",
    contactNumber: post.contactNumber || post.contactPhone || "",
    notes: post.notes || "",
  });
  const updatePost = (key, value) => setEditingPost(post => ({ ...post, [key]: value }));
  const togglePostLoad = value => setEditingPost(post => ({
    ...post,
    loadTypes: post.loadTypes.includes(value) ? post.loadTypes.filter(item => item !== value) : [...post.loadTypes, value],
  }));
  const savePost = async event => {
    event.preventDefault();
    if (!editingPost) return;
    if (!editingPost.loadTypes.length) { setError("Select at least one cargo type."); return; }
    setSavingPost(true);
    setError("");
    try {
      const updated = normalizeCapacity(await driverApi.updateCapacity(editingPost.id, {
        availableCapacity: Number(editingPost.availableCapacity),
        date: editingPost.date,
        from: editingPost.from.trim(),
        to: editingPost.to.trim(),
        loadTypes: editingPost.loadTypes,
        companyName: editingPost.companyName.trim(),
        contactNumber: editingPost.contactNumber.trim(),
        notes: editingPost.notes.trim(),
      }));
      setCapacityPosts(posts => posts.map(post => post.id === updated.id ? { ...post, ...updated, totalCapacity: post.totalCapacity, truckName: post.truckName, truckNumber: post.truckNumber, vehicleType: post.vehicleType } : post));
      setEditingPost(null);
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-lg font-bold text-slate-900">Published Availability</h2><p className="mt-1 text-sm text-slate-500">Trips and available truck capacity you have published.</p></div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{capacityPosts.length} post{capacityPosts.length === 1 ? "" : "s"}</span>
      </div>
      {capacityPosts.length === 0 ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">You have not published any availability yet.</p> : <div className="space-y-3">{capacityPosts.map(post => <article key={post.id} className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{post.from} <span className="text-blue-600">→</span> {post.to}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${post.status === "Available" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{post.status}</span></div><p className="mt-1 text-sm text-slate-600">{post.truckName || post.vehicleType || "Vehicle"}{post.truckNumber ? ` · ${post.truckNumber}` : ""}</p><p className="mt-1 text-xs text-slate-500">{post.date || "Date not set"} · {post.availableCapacity} {post.capacityUnit} available · {(post.loadTypes || []).join(", ")}</p></div>
        <button type="button" disabled={post.status !== "Available"} onClick={() => editPost(post)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Pencil size={15}/> Edit availability</button>
      </article>)}</div>}
      {editingPost && <form onSubmit={savePost} className="mt-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">Edit published availability</h3><button type="button" onClick={() => setEditingPost(null)} className="rounded-md p-1 text-slate-500 hover:bg-white" aria-label="Cancel editing"><X size={18}/></button></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold text-slate-600">Available capacity<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" type="number" min="0.1" step="0.1" max={editingPost.totalCapacity || undefined} required value={editingPost.availableCapacity} onChange={e => updatePost("availableCapacity", e.target.value)}/><span className="mt-1 block font-normal">{editingPost.capacityUnit}</span></label>
          <label className="text-xs font-semibold text-slate-600">Travel date<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" type="date" required value={editingPost.date} onChange={e => updatePost("date", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">From<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" required value={editingPost.from} onChange={e => updatePost("from", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">To<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" required value={editingPost.to} onChange={e => updatePost("to", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">Company name<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" value={editingPost.companyName} onChange={e => updatePost("companyName", e.target.value)}/></label>
          <label className="text-xs font-semibold text-slate-600">Contact number<input className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" value={editingPost.contactNumber} onChange={e => updatePost("contactNumber", e.target.value)}/></label>
          <fieldset className="sm:col-span-2 lg:col-span-3"><legend className="mb-2 text-xs font-semibold text-slate-600">Cargo types accepted</legend><div className="flex flex-wrap gap-2">{["Small goods", "Industrial goods", "Fragile goods", "General cargo"].map(type => <label key={type} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"><input type="checkbox" checked={editingPost.loadTypes.includes(type)} onChange={() => togglePostLoad(type)}/>{type}</label>)}</div></fieldset>
          <label className="text-xs font-semibold text-slate-600 sm:col-span-2 lg:col-span-3">Notes<textarea className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-800" rows="2" value={editingPost.notes} onChange={e => updatePost("notes", e.target.value)}/></label>
        </div>
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setEditingPost(null)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button disabled={savingPost} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save size={15}/>{savingPost ? "Saving…" : "Save changes"}</button></div>
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
