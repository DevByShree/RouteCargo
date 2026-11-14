import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Truck, Pencil, Trash2, Save, X, FileText, UploadCloud, Eye } from "lucide-react";
import { driverApi } from "../../API/driverApi";
const blank = { name: "", number: "", type: "Tata 14 Wheeler", capacity: "", capacityUnit: "tons", fuelType: "Diesel", modelYear: "", available: true, documents: [], photos: [] };
const field = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const label = "mb-1 block text-xs font-semibold text-slate-600";
const apiOrigin = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const photoSrc = file => file.preview || (file.url ? `${apiOrigin}${file.url}` : "");
=======
import { Truck, Plus, Pencil, Trash2, Save, X, FileText, UploadCloud } from "lucide-react";

const TRUCKS_KEY = "routecargo_vehicles";
const initialTrucks = [
  { id: "truck-1", name: "Truck 1", number: "MH12AB1234", type: "Tata 14 Wheeler", capacity: 8, capacityUnit: "tons", fuelType: "Diesel", modelYear: "2022", available: true, documents: [], photos: [] },
  { id: "truck-2", name: "Truck 2", number: "MH40XY5678", type: "Ashok Leyland 16 Wheeler", capacity: 15, capacityUnit: "tons", fuelType: "Diesel", modelYear: "2021", available: true, documents: [], photos: [] },
  { id: "truck-3", name: "Truck 3", number: "RJ14CD9876", type: "Eicher 12 Wheeler", capacity: 10, capacityUnit: "tons", fuelType: "Diesel", modelYear: "2023", available: true, documents: [], photos: [] }
];
const blank = { name: "", number: "", type: "Tata 14 Wheeler", capacity: "", capacityUnit: "tons", fuelType: "Diesel", modelYear: "", available: true, documents: [], photos: [] };
const field = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const label = "mb-1 block text-xs font-semibold text-slate-600";
>>>>>>> 56df870949908fa44df9adeccb225d2ffe3e3ead
const vehicleTypes = ["Tata 14 Wheeler", "Ashok Leyland 16 Wheeler", "Eicher 12 Wheeler", "Tata 10 Wheeler", "BharatBenz 14 Wheeler", "Mahindra Bolero Maxi Truck", "Container 20ft", "Container 32ft Multi-Axle", "Trailer 40ft", "Other"];

export default function AddVehicles() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [trucks, setTrucks] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [previewDocument, setPreviewDocument] = useState(null);
  useEffect(() => { driverApi.listVehicles().then(setTrucks).catch(e => setMessage(e.message)); }, []);
  const change = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const addFiles = (key, fileList) => {
    const files = Array.from(fileList || []).map(file => ({ id: `${Date.now()}-${Math.random()}`, name: file.name, type: file.type, size: file.size, file, preview: file.type.startsWith("image/") || file.type === "application/pdf" ? URL.createObjectURL(file) : "" }));
    change(key, [...(form[key] || []), ...files]);
  };
  const removeFile = async (key, id) => {
    const file = form[key].find(f => f.id === id);
    if (file?.url && editingId) {
      try { await driverApi.removeVehicleFile(editingId, encodeURIComponent(file.url.split("/").pop())); setTrucks(await driverApi.listVehicles()); }
      catch (error) { setMessage(error.message); return; }
    }
    change(key, form[key].filter(f => f.id !== id));
  };
  const reset = () => { setForm(blank); setEditingId(null); };
  const submit = async e => {
=======
  const [trucks, setTrucks] = useState(() => JSON.parse(localStorage.getItem(TRUCKS_KEY) || "null") || initialTrucks);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  useEffect(() => localStorage.setItem(TRUCKS_KEY, JSON.stringify(trucks)), [trucks]);
  const change = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const addFiles = (key, fileList) => {
    const files = Array.from(fileList || []).map(file => ({ id: `${Date.now()}-${Math.random()}`, name: file.name, type: file.type, size: file.size, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "" }));
    change(key, [...(form[key] || []), ...files]);
  };
  const removeFile = (key, id) => change(key, form[key].filter(f => f.id !== id));
  const reset = () => { setForm(blank); setEditingId(null); };
  const submit = e => {
>>>>>>> 56df870949908fa44df9adeccb225d2ffe3e3ead
    e.preventDefault();
    if (!form.name.trim() || !form.number.trim() || !form.capacity || Number(form.capacity) <= 0) { setMessage("Enter a vehicle name, registration number and valid capacity."); return; }
    const duplicate = trucks.some(t => t.number.toLowerCase() === form.number.trim().toLowerCase() && t.id !== editingId);
    if (duplicate) { setMessage("This registration number already exists."); return; }
<<<<<<< HEAD
    try {
      const payload = { name: form.name.trim(), number: form.number.trim().toUpperCase(), type: form.type, capacity: Number(form.capacity), capacityUnit: form.capacityUnit, fuelType: form.fuelType, modelYear: form.modelYear || null, available: form.available };
      const result = editingId ? await driverApi.updateVehicle(editingId, payload) : await driverApi.createVehicle(payload);
      const vehicle = result?.data || result;
      const photos = form.photos.filter(f => f.file).map(f => f.file);
      const documents = form.documents.filter(f => f.file).map(f => f.file);
      if (photos.length || documents.length) await driverApi.uploadVehicleFiles(vehicle._id || vehicle.id || editingId, { photos, documents });
      setTrucks(await driverApi.listVehicles()); setMessage(editingId ? "Vehicle updated successfully." : "Vehicle added successfully."); reset();
    } catch (error) { setMessage(error.message); }
  };
  const edit = truck => { const mapFiles = files => (files || []).map((file, index) => ({ ...file, id: file._id || file.id || `${file.url || file.name}-${index}`, name: file.originalName || file.name || "Vehicle file" })); setForm({ ...blank, ...truck, documents: mapFiles(truck.documents), photos: mapFiles(truck.photos) }); setEditingId(truck.id); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async id => { if (window.confirm("Delete this vehicle?")) try { await driverApi.deleteVehicle(id); setTrucks(await driverApi.listVehicles()); setMessage("Vehicle deleted successfully."); } catch (error) { setMessage(error.message); } };
=======
    if (editingId) setTrucks(ts => ts.map(t => t.id === editingId ? { ...form, id: editingId, capacity: Number(form.capacity), number: form.number.trim().toUpperCase() } : t));
    else setTrucks(ts => [...ts, { ...form, id: `truck-${Date.now()}`, capacity: Number(form.capacity), number: form.number.trim().toUpperCase() }]);
    setMessage(editingId ? "Vehicle updated successfully." : "Vehicle added successfully."); reset();
  };
  const edit = truck => { setForm({ ...blank, ...truck, documents: truck.documents || [], photos: truck.photos || [] }); setEditingId(truck.id); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = id => { if (window.confirm("Delete this vehicle?")) setTrucks(ts => ts.filter(t => t.id !== id)); };
>>>>>>> 56df870949908fa44df9adeccb225d2ffe3e3ead
  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-900">Add Vehicles</h1><p className="mt-1 text-sm text-slate-500">Register trucks, upload vehicle photos and keep documents together.</p></div><button onClick={()=>navigate("/driver/profile")} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Back to Profile</button></header>
    {message && <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}
    <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-5 flex items-center gap-2 font-semibold text-slate-900"><Truck size={18}/>{editingId ? "Edit Vehicle" : "Vehicle Details"}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label><span className={label}>Vehicle Name / Nickname *</span><input className={field} value={form.name} onChange={e=>change("name",e.target.value)} placeholder="e.g. Truck 4" required/></label>
        <label><span className={label}>Registration Number *</span><input className={field} value={form.number} onChange={e=>change("number",e.target.value.toUpperCase())} placeholder="MH12AB1234" required/></label>
        <label><span className={label}>Vehicle Type *</span><select className={field} value={form.type} onChange={e=>change("type",e.target.value)}>{vehicleTypes.map(v=><option key={v}>{v}</option>)}</select></label>
        <label><span className={label}>Maximum Capacity *</span><input className={field} type="number" min="0.1" step="0.1" value={form.capacity} onChange={e=>change("capacity",e.target.value)} placeholder="e.g. 10" required/></label>
        <label><span className={label}>Capacity Unit</span><select className={field} value={form.capacityUnit} onChange={e=>change("capacityUnit",e.target.value)}><option value="tons">Tons</option><option value="kg">Kilograms</option><option value="cubic meters">Cubic meters</option><option value="packages">Packages</option></select></label>
        <label><span className={label}>Fuel Type</span><select className={field} value={form.fuelType} onChange={e=>change("fuelType",e.target.value)}>{["Diesel","CNG","Electric","Petrol","LNG","Other"].map(v=><option key={v}>{v}</option>)}</select></label>
        <label><span className={label}>Model Year</span><input className={field} type="number" min="1980" max={new Date().getFullYear()+1} value={form.modelYear} onChange={e=>change("modelYear",e.target.value)} placeholder="e.g. 2023"/></label>
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3"><input type="checkbox" checked={form.available !== false} onChange={e=>change("available",e.target.checked)} className="h-4 w-4 accent-blue-600"/><span className="text-sm font-medium text-slate-700">Vehicle available for bookings</span></label>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
<<<<<<< HEAD
        <section className="rounded-xl border border-dashed border-slate-300 p-4"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><UploadCloud size={17}/> Truck Photos</h3><p className="mb-3 text-xs text-slate-500">Select one or more images.</p><input type="file" accept="image/*" multiple onChange={e=>{addFiles("photos",e.target.files);e.target.value=""}} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"/>{form.photos?.length>0 && <ul className="mt-3 grid gap-3 sm:grid-cols-2">{form.photos.map(f=><li key={f.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2 text-xs"><img src={photoSrc(f)} alt={f.name || "Vehicle photo preview"} className="h-16 w-20 shrink-0 rounded-md bg-slate-200 object-cover"/><span className="min-w-0 flex-1 truncate">{f.name || "Vehicle photo"}</span><button type="button" onClick={()=>removeFile("photos",f.id)} className="text-rose-600">Remove</button></li>)}</ul>}</section>
        <section className="rounded-xl border border-dashed border-slate-300 p-4"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><FileText size={17}/> Vehicle Documents</h3><p className="mb-3 text-xs text-slate-500">RC, insurance, fitness, permit and PUC certificates (PDF or image).</p><input type="file" accept=".pdf,image/*" multiple onChange={e=>{addFiles("documents",e.target.files);e.target.value=""}} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"/>{form.documents?.length>0 && <ul className="mt-3 space-y-2">{form.documents.map(f=><li key={f.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-2 text-xs"><span className="min-w-0 flex-1 truncate">{f.name}</span><button type="button" onClick={()=>setPreviewDocument(f)} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-blue-700 hover:bg-blue-50"><Eye size={13}/> Preview</button><button type="button" onClick={()=>removeFile("documents",f.id)} className="shrink-0 text-rose-600">Remove</button></li>)}</ul>}</section>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2"><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"><X size={16}/> Clear</button><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Save size={16}/>{editingId ? "Update Vehicle" : "Save Vehicle"}</button></div>
    </form>
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-4 font-semibold text-slate-900">Registered Vehicles <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{trucks.length}</span></h2>{trucks.length===0 ? <p className="text-sm text-slate-500">No vehicles registered yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Vehicle</th><th className="px-3 py-3">Registration</th><th className="px-3 py-3">Capacity</th><th className="px-3 py-3">Fuel</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{trucks.map(t=><tr key={t.id}><td className="px-3 py-3"><p className="font-semibold text-slate-800">{t.name}</p><p className="text-xs text-slate-500">{t.type}</p>{t.photos?.length > 0 && <div className="mt-2 flex gap-1.5">{t.photos.slice(0, 3).map((photo, index) => <a key={photo._id || photo.url || index} href={photoSrc(photo)} target="_blank" rel="noreferrer" title={photo.originalName || "View vehicle photo"}><img src={photoSrc(photo)} alt={photo.originalName || `${t.name} photo ${index + 1}`} className="h-10 w-12 rounded border border-slate-200 object-cover"/></a>)}{t.photos.length > 3 && <span className="self-center text-xs text-slate-500">+{t.photos.length - 3} more</span>}</div>}{t.documents?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{t.documents.map((document, index) => <button key={document._id || document.url || index} type="button" onClick={() => setPreviewDocument({ ...document, id: document._id || document.url || index, name: document.originalName || "Vehicle document" })} className="inline-flex max-w-36 items-center gap-1 rounded border border-slate-200 px-1.5 py-1 text-[10px] text-blue-700 hover:bg-blue-50"><Eye size={11}/><span className="truncate">{document.originalName || "Preview document"}</span></button>)}</div>}</td><td className="px-3 py-3 font-medium">{t.number}</td><td className="px-3 py-3">{t.capacity} {t.capacityUnit}</td><td className="px-3 py-3">{t.fuelType}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${t.available===false?"bg-slate-100 text-slate-500":"bg-emerald-50 text-emerald-700"}`}>{t.available===false?"Unavailable":"Available"}</span></td><td className="px-3 py-3"><div className="flex gap-2"><button type="button" onClick={()=>edit(t)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"><Pencil size={13}/> Edit</button><button type="button" onClick={()=>remove(t.id)} className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"><Trash2 size={13}/> Delete</button></div></td></tr>)}</tbody></table></div>}</section>
    {previewDocument && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={`Preview ${previewDocument.name || "document"}`} onClick={() => setPreviewDocument(null)}><section className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={event => event.stopPropagation()}><header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3"><h2 className="min-w-0 truncate text-sm font-semibold text-slate-900">{previewDocument.name || "Document preview"}</h2><div className="flex shrink-0 items-center gap-3"><a href={photoSrc(previewDocument)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 hover:underline">Open in new tab</a><button type="button" onClick={() => setPreviewDocument(null)} className="rounded-md p-1 text-slate-600 hover:bg-slate-100" aria-label="Close preview"><X size={20}/></button></div></header><div className="flex min-h-0 flex-1 items-center justify-center bg-slate-100 p-3">{(previewDocument.type || previewDocument.mimeType || "").startsWith("image/") ? <img src={photoSrc(previewDocument)} alt={previewDocument.name || "Uploaded document"} className="max-h-full max-w-full object-contain"/> : (previewDocument.type === "application/pdf" || previewDocument.mimeType === "application/pdf" || previewDocument.name?.toLowerCase().endsWith(".pdf")) ? <iframe title={previewDocument.name || "PDF document preview"} src={photoSrc(previewDocument)} className="h-full w-full rounded bg-white"/> : <p className="text-sm text-slate-600">This file type cannot be previewed. Use “Open in new tab” to view or download it.</p>}</div></section></div>}
=======
        <section className="rounded-xl border border-dashed border-slate-300 p-4"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><UploadCloud size={17}/> Truck Photos</h3><p className="mb-3 text-xs text-slate-500">Select one or more images.</p><input type="file" accept="image/*" multiple onChange={e=>{addFiles("photos",e.target.files);e.target.value=""}} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"/>{form.photos?.length>0 && <ul className="mt-3 space-y-2">{form.photos.map(f=><li key={f.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-2 text-xs"><span className="truncate">{f.name || "Vehicle photo"}</span><button type="button" onClick={()=>removeFile("photos",f.id)} className="text-rose-600">Remove</button></li>)}</ul>}</section>
        <section className="rounded-xl border border-dashed border-slate-300 p-4"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800"><FileText size={17}/> Vehicle Documents</h3><p className="mb-3 text-xs text-slate-500">RC, insurance, fitness, permit and PUC certificates (PDF or image).</p><input type="file" accept=".pdf,image/*" multiple onChange={e=>{addFiles("documents",e.target.files);e.target.value=""}} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700"/>{form.documents?.length>0 && <ul className="mt-3 space-y-2">{form.documents.map(f=><li key={f.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-2 text-xs"><span className="truncate">{f.name}</span><button type="button" onClick={()=>removeFile("documents",f.id)} className="text-rose-600">Remove</button></li>)}</ul>}</section>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-2"><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"><X size={16}/> Clear</button><button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Save size={16}/>{editingId ? "Update Vehicle" : "Save Vehicle"}</button></div>
    </form>
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-4 font-semibold text-slate-900">Registered Vehicles <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{trucks.length}</span></h2>{trucks.length===0 ? <p className="text-sm text-slate-500">No vehicles registered yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Vehicle</th><th className="px-3 py-3">Registration</th><th className="px-3 py-3">Capacity</th><th className="px-3 py-3">Fuel</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{trucks.map(t=><tr key={t.id}><td className="px-3 py-3"><p className="font-semibold text-slate-800">{t.name}</p><p className="text-xs text-slate-500">{t.type}</p></td><td className="px-3 py-3 font-medium">{t.number}</td><td className="px-3 py-3">{t.capacity} {t.capacityUnit}</td><td className="px-3 py-3">{t.fuelType}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${t.available===false?"bg-slate-100 text-slate-500":"bg-emerald-50 text-emerald-700"}`}>{t.available===false?"Unavailable":"Available"}</span></td><td className="px-3 py-3"><div className="flex gap-2"><button type="button" onClick={()=>edit(t)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"><Pencil size={13}/> Edit</button><button type="button" onClick={()=>remove(t.id)} className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"><Trash2 size={13}/> Delete</button></div></td></tr>)}</tbody></table></div>}</section>
>>>>>>> 56df870949908fa44df9adeccb225d2ffe3e3ead
  </div></main>;
}
