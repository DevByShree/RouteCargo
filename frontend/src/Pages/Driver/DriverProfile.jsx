import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building2, Truck, Pencil, Save, Plus, Camera, Trash2 } from "lucide-react";
import { driverApi } from "../../API/driverApi";
import { API_BASE, authAPI } from "../../API/api";
import { useAuth } from "../../Authentication/useAuth";
const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";
const labelClass = "mb-1 block text-xs font-semibold text-slate-600";

export default function DriverProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({});
  const [trucks, setTrucks] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const photoInput = useRef(null);
  useEffect(() => { Promise.all([driverApi.getProfile(), driverApi.listVehicles()]).then(([currentProfile, vehicles]) => { setProfile(currentProfile || {}); setTrucks(vehicles); }).catch(e => setError(e.message)); }, []);
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);
  const update = (key, value) => setProfile(p => ({ ...p, [key]: value }));
  const save = async () => { try { setProfile(await driverApi.saveProfile({ ...profile, yearEstablishment: profile.yearEstablishment || null })); setEditing(false); setSaved(true); setError(""); setTimeout(() => setSaved(false), 2500); } catch (e) { setError(e.message); } };
  const uploadPhoto = async event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoMessage("");
    setPhotoBusy(true);
    try {
      const response = await authAPI.uploadProfilePhoto(file);
      const profilePhoto = response.data?.profilePhoto || "";
      updateUser({ profilePhoto });
      setPhotoPreview("");
      setPhotoMessage("Profile photo updated.");
    } catch (uploadError) {
      setPhotoMessage(uploadError.data?.message || uploadError.message || "Could not upload the photo.");
    } finally { setPhotoBusy(false); }
  };
  const removePhoto = async () => {
    setPhotoBusy(true);
    setPhotoMessage("");
    try { await authAPI.removeProfilePhoto(); updateUser({ profilePhoto: "" }); setPhotoPreview(""); setPhotoMessage("Profile photo removed."); }
    catch (removeError) { setPhotoMessage(removeError.data?.message || removeError.message || "Could not remove the photo."); }
    finally { setPhotoBusy(false); }
  };
  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4"><div className="flex flex-col items-center gap-2">
          {photoPreview || user?.profilePhoto ? <img src={photoPreview || `${API_BASE}${user.profilePhoto}`} alt={`${user?.name || "Driver"} profile`} className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-100"/> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-700 text-2xl font-bold text-white">{(user?.name || "D").split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase()}</span>}
          <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadPhoto}/>
          <div className="flex gap-2"><button type="button" disabled={photoBusy} onClick={() => photoInput.current?.click()} className="inline-flex items-center gap-1 rounded border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-700 disabled:opacity-50"><Camera size={13}/>{photoBusy ? "Uploading…" : user?.profilePhoto ? "Change" : "Upload Photo"}</button>{user?.profilePhoto && <button type="button" disabled={photoBusy} onClick={removePhoto} className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 disabled:opacity-50"><Trash2 size={13}/>Remove</button>}</div>
          {photoMessage && <span role="status" className="text-xs text-slate-500">{photoMessage}</span>}
        </div><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile</h1><p className="mt-1 text-sm text-slate-500">Manage your personal and transport company details.</p></div></div>
        <button onClick={() => editing ? save() : setEditing(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">{editing ? <Save size={16}/> : <Pencil size={16}/>} {editing ? "Save Profile" : "Edit Profile"}</button>
      </header>
      {saved && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Profile saved.</div>}{error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
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
