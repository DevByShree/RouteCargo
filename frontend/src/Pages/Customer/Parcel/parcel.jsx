import { useState, useRef, useEffect } from "react";
import {
  Package, Box, ChevronDown, Minus, Plus, Pencil, Trash2, ClipboardList,
  ArrowLeft, ArrowRight, Image as ImageIcon, Camera, Upload, X, Tag,
} from "lucide-react";

const PARCEL_TYPES = ["Electronics", "Furniture", "Machinery", "Textiles", "Food & Perishables", "Documents", "Other"];
const MAX_DESC = 500;
const MAX_IMAGE_MB = 5;
const MAX_IMAGES = 6;
const Req = () => <span className="text-red-500"> *</span>;

function Field({ label, required, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <Req />}
      </label>
      {children}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Icon className="h-6 w-6 shrink-0 text-blue-600" strokeWidth={1.6} />
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="truncate text-sm font-semibold text-slate-900" title={String(value)}>{value}</div>
      </div>
    </div>
  );
}

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/* ---------- Product images: upload (multiple), drag & drop, or take a photo ---------- */
function ProductImagesField({ images, onChange }) {
  const fileRef = useRef(null);
  const captureRef = useRef(null); // fallback: opens the native camera on phones
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [camOpen, setCamOpen] = useState(false);

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const current = imagesRef.current;
    const room = MAX_IMAGES - current.length;
    const problems = [];
    const accepted = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        problems.push(`${file.name} is not an image.`);
      } else if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        problems.push(`${file.name} is larger than ${MAX_IMAGE_MB} MB.`);
      } else if (accepted.length >= room) {
        problems.push(`You can add up to ${MAX_IMAGES} images.`);
        break;
      } else {
        accepted.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        });
      }
    }
    setError([...new Set(problems)].join(" "));
    if (accepted.length) onChange([...current, ...accepted]);
    if (fileRef.current) fileRef.current.value = "";
    if (captureRef.current) captureRef.current.value = "";
  };

  const removeImage = (id) => {
    const target = images.find((i) => i.id === id);
    if (target) URL.revokeObjectURL(target.url);
    onChange(images.filter((i) => i.id !== id));
    setError("");
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Start / stop the webcam when the camera dialog opens / closes
  useEffect(() => {
    if (!camOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        // No camera access: close the dialog and fall back to the native capture input
        setCamOpen(false);
        captureRef.current?.click();
      }
    })();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [camOpen]);

  const full = images.length >= MAX_IMAGES;

  const openCamera = () => {
    if (full) {
      setError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    setError("");
    if (navigator.mediaDevices?.getUserMedia) setCamOpen(true);
    else captureRef.current?.click();
  };

  const openPicker = () => {
    if (full) {
      setError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    fileRef.current?.click();
  };

  const snap = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        addFiles([new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })]);
        setCamOpen(false);
      },
      "image/jpeg",
      0.9
    );
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const btn =
    "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors";
  const hasImages = images.length > 0;

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      <input ref={captureRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => addFiles(e.target.files)} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed px-4 text-center transition-colors ${hasImages ? "py-4" : "py-6"
          } ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50/60"}`}
      >
        {!hasImages && (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <ImageIcon className="h-6 w-6" strokeWidth={1.6} />
          </span>
        )}
        <div>
          <div className="text-sm font-medium text-slate-800">
            {hasImages ? "Add more photos" : "Drag and drop product photos here"}
          </div>
          <div className="text-xs text-slate-500">
            JPG, PNG or WEBP, up to {MAX_IMAGE_MB} MB each · {images.length}/{MAX_IMAGES} added
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={openPicker} className={`${btn} border-blue-700 bg-blue-700 text-white hover:bg-blue-800`}>
            <Upload className="h-3.5 w-3.5" /> Upload images
          </button>
          <button type="button" onClick={openCamera} className={`${btn} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}>
            <Camera className="h-3.5 w-3.5" /> Take photo
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}

      {hasImages && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <li key={img.id} className="min-w-0">
              <div className="relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  aria-label={`Remove ${img.name}`}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white hover:bg-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-1 truncate text-xs text-slate-500" title={img.name}>{formatSize(img.size)}</div>
            </li>
          ))}
        </ul>
      )}

      {camOpen && (
        <div role="dialog" aria-modal="true" aria-label="Take a product photo" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-bold text-blue-950">Take product photo</h3>
              <button type="button" onClick={() => setCamOpen(false)} aria-label="Close camera" className="text-slate-500 hover:text-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="aspect-[4/3] w-full bg-black object-cover" />
            <div className="flex justify-end gap-2 p-4">
              <button type="button" onClick={() => setCamOpen(false)} className={`${btn} border-slate-300 px-4 text-slate-700 hover:bg-slate-50`}>
                Cancel
              </button>
              <button type="button" onClick={snap} className={`${btn} border-blue-700 bg-blue-700 px-4 text-white hover:bg-blue-800`}>
                <Camera className="h-3.5 w-3.5" /> Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Large gallery shown in the Shipment Summary ---------- */
function ImageGallery({ images }) {
  const [active, setActive] = useState(0);
  const index = Math.min(active, Math.max(images.length - 1, 0));

  if (!images.length) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center sm:h-72">
        <ImageIcon className="h-8 w-8 text-slate-400" strokeWidth={1.4} />
        <p className="text-sm text-slate-500">Product photos will appear here once you add them.</p>
      </div>
    );
  }

  const current = images[index];
  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <img
          src={current.url}
          alt={current.name}
          className="h-64 w-full object-contain sm:h-80"
        />
        <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs text-white">
          {index + 1} / {images.length}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span className="truncate" title={current.name}>{current.name}</span>
        <span className="shrink-0">{formatSize(current.size)}</span>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${img.name}`}
              aria-current={i === index}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 sm:h-20 sm:w-20 ${i === index ? "border-blue-600" : "border-transparent opacity-70 hover:opacity-100"
                }`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ParcelDetails() {
  const [name, setName] = useState("");
  const [type, setType] = useState("Electronics");
  const [count, setCount] = useState(10);
  const [images, setImages] = useState([]); // [{ id, file, url, name, size }]
  const [desc, setDesc] = useState("Electronic equipment - Handle with care.");
  const [parcels, setParcels] = useState([]); // saved parcels shown in the table
  const [formError, setFormError] = useState("");

  // Save the current form as a parcel, then clear the form for the next one
  const addParcel = () => {
    if (!name.trim()) {
      setFormError("Enter a product name to add this parcel.");
      return;
    }
    setParcels((list) => [
      ...list,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: name.trim(), type, qty: count, desc, images },
    ]);
    setName("");
    setCount(1);
    setImages([]);
    setDesc("");
    setFormError("");
  };

  // Move a saved parcel back into the form so it can be changed
  const editParcel = (id) => {
    const p = parcels.find((x) => x.id === id);
    if (!p) return;
    images.forEach((i) => URL.revokeObjectURL(i.url)); // release unsaved photos in the form
    setName(p.name);
    setType(p.type);
    setCount(p.qty);
    setDesc(p.desc);
    setImages(p.images);
    setParcels((list) => list.filter((x) => x.id !== id));
    setFormError("");
  };

  const removeParcel = (id) => {
    const p = parcels.find((x) => x.id === id);
    p?.images.forEach((i) => URL.revokeObjectURL(i.url));
    setParcels((list) => list.filter((x) => x.id !== id));
  };

  // Release preview URLs when the page unmounts
  const imagesRef = useRef(images);
  const parcelsRef = useRef(parcels);
  imagesRef.current = images;
  parcelsRef.current = parcels;
  useEffect(
    () => () => {
      imagesRef.current.forEach((i) => URL.revokeObjectURL(i.url));
      parcelsRef.current.forEach((p) => p.images.forEach((i) => URL.revokeObjectURL(i.url)));
    },
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl">Parcel Details</h1>
        <p className="mt-1 text-slate-600">
          Enter information about your parcels, including weight, size, and type.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Parcel information */}
          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-7 w-7 shrink-0 text-orange-500" strokeWidth={1.6} />
              <div>
                <h2 className="text-base font-bold text-blue-950">Parcel Information</h2>
                <p className="text-sm text-slate-500">Add details about your shipment to find the best trucks.</p>
              </div>
            </div>

            {/* Product name */}
            <div className="mt-6">
              <Field label="Product Name" required>
                <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <span className="flex w-10 shrink-0 items-center justify-center text-slate-500">
                    <Tag className="h-4 w-4" />
                  </span>
                  <input
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFormError(""); }}
                    maxLength={100}
                    placeholder="e.g. LED Panels"
                    className="min-w-0 flex-1 bg-transparent pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </Field>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1.1fr_1fr]">
              <Field label="Parcel Type" required>
                <div className="relative flex h-11 items-center rounded-lg border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <Box className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="h-full w-full appearance-none rounded-lg bg-transparent pl-10 pr-9 text-sm outline-none"
                  >
                    {PARCEL_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" />
                </div>
              </Field>

              <Field label="Number of Packages" required>
                <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <span className="flex w-10 items-center justify-center text-slate-400"><Box className="h-4 w-4" /></span>
                  <button
                    onClick={() => setCount((c) => Math.max(1, c - 1))}
                    aria-label="Decrease packages"
                    className="w-11 border-x border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Minus className="mx-auto h-4 w-4" />
                  </button>
                  <input
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    inputMode="numeric"
                    className="min-w-0 flex-1 text-center text-sm outline-none"
                  />
                  <button
                    onClick={() => setCount((c) => c + 1)}
                    aria-label="Increase packages"
                    className="w-11 border-l border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <Plus className="mx-auto h-4 w-4" />
                  </button>
                </div>
              </Field>
            </div>

            {/* Product images */}
            <div className="mt-6">
              <Field label="Product Images (Optional)">
                <ProductImagesField images={images} onChange={setImages} />
              </Field>
            </div>

            <div className="mt-6">
              <Field label="Description (Optional)">
                <div className="flex rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                  <span className="px-3 pt-3 text-slate-500"><ClipboardList className="h-4 w-4" /></span>
                  <textarea
                    rows={4}
                    maxLength={MAX_DESC}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="min-w-0 flex-1 resize-none rounded-lg bg-transparent py-3 pr-3 text-sm outline-none"
                  />
                </div>
                <div className="mt-1 text-right text-xs text-slate-500">{desc.length}/{MAX_DESC}</div>
              </Field>
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p role="alert" className="min-h-[1rem] text-xs text-red-600">{formError}</p>
              <button
                type="button"
                onClick={addParcel}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
              >
                <Plus className="h-4 w-4" /> Add Parcel
              </button>
            </div>
          </section>

          {/* Summary */}
          <aside className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-7 w-7 shrink-0 text-orange-500" strokeWidth={1.6} />
              <div>
                <h2 className="text-base font-bold text-blue-950">Shipment Summary</h2>
                <p className="text-sm text-slate-500">Quick overview of your shipment details.</p>
              </div>
            </div>

            {/* Product images (large) */}
            <div className="mt-5">
              <ImageGallery images={images} />
            </div>

            <div className="mt-6 rounded-lg bg-blue-50 p-4 sm:p-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Stat icon={Tag} label="Product Name" value={name.trim() || "Not added yet"} />
                </div>
                <Stat icon={Box} label="Parcel Type" value={type} />
                <Stat icon={Package} label="No. of Packages" value={count} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-950">Package Items ({parcels.length})</h3>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-medium text-slate-600">
                    {["#", "Photo", "Product Name", "Type", "Qty", "Action"].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parcels.map((p, i) => (
                    <tr key={p.id}>
                      <td className="px-3 py-3 text-slate-600">{i + 1}</td>
                      <td className="px-3 py-3">
                        {p.images.length ? (
                          <div className="relative h-10 w-10">
                            <img src={p.images[0].url} alt="" className="h-10 w-10 rounded-md border border-slate-200 object-cover" />
                            {p.images.length > 1 && (
                              <span className="absolute -right-1.5 -top-1.5 rounded-full bg-blue-700 px-1.5 text-[10px] font-medium text-white">
                                +{p.images.length - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                            <ImageIcon className="h-4 w-4" />
                          </span>
                        )}
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-3" title={p.name}>{p.name}</td>
                      <td className="whitespace-nowrap px-3 py-3">{p.type}</td>
                      <td className="px-3 py-3">{p.qty}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => editParcel(p.id)} aria-label={`Edit ${p.name}`} className="text-blue-600 hover:text-blue-800">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => removeParcel(p.id)} aria-label={`Delete ${p.name}`} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {parcels.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                        No parcels yet. Fill in the details and select Add Parcel.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </aside>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
          <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:px-6">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-medium text-white hover:bg-blue-800 sm:px-8">
            Next: Find Trucks <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
} 