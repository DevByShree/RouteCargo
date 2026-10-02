import { useState } from "react";
import {
  Package, Box, Weight, ChevronDown, Minus, Plus, Check, Info, Pencil, Trash2,
  ClipboardList, ArrowLeft, ArrowRight, SquarePen,
} from "lucide-react";

const STEPS = [
  { title: "Pickup & Delivery", sub: "Locations and schedule" },
  { title: "Parcel Details", sub: "Weight, size, type" },
  { title: "Find Trucks", sub: "View matching trucks" },
  { title: "Review & Book", sub: "Confirm and send request" },
];

const PARCEL_TYPES = ["Electronics", "Furniture", "Machinery", "Textiles", "Food & Perishables", "Documents", "Other"];
const MAX_DESC = 500;

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

function InputBox({ icon: Icon, unit, ...props }) {
  return (
    <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      <span className="flex w-10 shrink-0 items-center justify-center text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <input
        {...props}
        className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-800 outline-none"
      />
      {unit && (
        <span className="flex w-12 shrink-0 items-center justify-center border-l border-slate-200 bg-slate-50 text-sm text-slate-500">
          {unit}
        </span>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-6 w-6 shrink-0 text-blue-600" strokeWidth={1.6} />
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

export default function ParcelDetails() {
  const [type, setType] = useState("Electronics");
  const [count, setCount] = useState(10);
  const [weight, setWeight] = useState("1200");
  const [dims, setDims] = useState({ l: "120", w: "80", h: "75" });
  const [desc, setDesc] = useState("Electronic equipment - Handle with care.");
  const [items, setItems] = useState([
    { id: 1, name: "LED Panels", weight: 600, dims: "120 × 80 × 75", qty: 5 },
    { id: 2, name: "Control Units", weight: 600, dims: "120 × 80 × 75", qty: 5 },
  ]);

  const setDim = (k) => (e) => setDims((d) => ({ ...d, [k]: e.target.value }));

  // Volume of one package, in m³ (cm × cm × cm ÷ 1,000,000)
  const volume = ((+dims.l || 0) * (+dims.w || 0) * (+dims.h || 0)) / 1_000_000;
  const volumeText = volume ? volume.toFixed(2) : "0";

  const addItem = () =>
    setItems((list) => [
      ...list,
      { id: Date.now(), name: `Item ${list.length + 1}`, weight: 0, dims: `${dims.l} × ${dims.w} × ${dims.h}`, qty: 1 },
    ]);
  const removeItem = (id) => setItems((list) => list.filter((i) => i.id !== id));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="mx-auto p-6">
        <nav className="text-sm text-slate-600">
          Create Shipment <span className="mx-1">›</span>
          <span className="font-medium text-slate-900">Parcel Details</span>
        </nav>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-blue-950">Parcel Details</h1>
        <p className="mt-1 text-slate-600">
          Enter information about your parcels, including weight, size, and type.
        </p>

        {/* Stepper */}
        <ol className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white px-6 py-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s, i) => {
            const done = i < 1;
            const current = i === 1;
            return (
              <li key={s.title} className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                    done || current ? "bg-blue-700 text-white" : "border border-slate-300 text-slate-600"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`whitespace-nowrap text-sm font-medium ${current ? "text-blue-700" : ""}`}>{s.title}</span>
                    {i < 3 && <span className={`hidden h-px flex-1 xl:block ${done ? "bg-blue-700" : "bg-slate-200"}`} />}
                  </div>
                  <div className="text-xs text-slate-500">{s.sub}</div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Parcel information */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-7 w-7 text-orange-500" strokeWidth={1.6} />
              <div>
                <h2 className="text-base font-bold text-blue-950">Parcel Information</h2>
                <p className="text-sm text-slate-500">Add details about your shipment to find the best trucks.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1.1fr_1fr]">
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

              <Field label="Total Weight (kg)" required>
                <InputBox icon={Weight} unit="kg" value={weight} onChange={(e) => setWeight(e.target.value.replace(/\D/g, ""))} />
              </Field>

              <Field label="Total Volume (m³)" required>
                <InputBox icon={Box} unit="m³" value={volumeText} readOnly aria-label="Total volume" />
              </Field>
            </div>

            <h3 className="mb-3 mt-6 text-sm font-medium text-slate-700">Dimensions (per package)</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Length (cm)" required>
                <InputBox icon={Box} unit="cm" value={dims.l} onChange={setDim("l")} inputMode="numeric" />
              </Field>
              <Field label="Width (cm)" required>
                <InputBox icon={Box} unit="cm" value={dims.w} onChange={setDim("w")} inputMode="numeric" />
              </Field>
              <Field label="Height (cm)" required>
                <InputBox icon={Box} unit="cm" value={dims.h} onChange={setDim("h")} inputMode="numeric" />
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

            <div className="mt-3 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-slate-700">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              Provide accurate parcel details to get the best truck matches and accurate pricing.
            </div>
          </section>

          {/* Summary */}
          <aside className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 h-7 w-7 text-orange-500" strokeWidth={1.6} />
                <div>
                  <h2 className="text-base font-bold text-blue-950">Shipment Summary</h2>
                  <p className="text-sm text-slate-500">Quick overview of your shipment details.</p>
                </div>
              </div>
              <button className="flex shrink-0 items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50">
                <SquarePen className="h-3.5 w-3.5" /> Edit Pickup & Delivery
              </button>
            </div>

            <div className="relative mt-5 space-y-5 pl-7">
              <span className="absolute left-[5px] top-3 h-[calc(100%-1.5rem)] w-px bg-slate-200" />
              <div className="relative">
                <span className="absolute -left-7 top-1 h-3 w-3 rounded-full bg-emerald-500" />
                <div className="text-sm font-semibold">Pickup</div>
                <div className="text-sm text-slate-700">Pune, Maharashtra</div>
                <div className="text-xs text-slate-500">22 Sept 2026, 09:00 AM</div>
              </div>
              <div className="relative">
                <span className="absolute -left-7 top-1 h-3 w-3 rounded-full bg-red-500" />
                <div className="text-sm font-semibold">Delivery</div>
                <div className="text-sm text-slate-700">Mumbai, Maharashtra</div>
                <div className="text-xs text-slate-500">23 Sept 2026, 06:00 PM</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-y-5 rounded-lg bg-blue-50 p-5">
              <Stat icon={Box} label="Parcel Type" value={type} />
              <Stat icon={Package} label="No. of Packages" value={count} />
              <Stat icon={Weight} label="Total Weight" value={`${fmt(weight)} kg`} />
              <Stat icon={Box} label="Total Volume" value={`${volumeText} m³`} />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-950">Package Items</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-medium text-slate-600">
                    {["#", "Item Name", "Weight (kg)", "Dimensions (cm)", "Qty", "Action"].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, i) => (
                    <tr key={it.id}>
                      <td className="px-3 py-3 text-slate-600">{i + 1}</td>
                      <td className="px-3 py-3">{it.name}</td>
                      <td className="px-3 py-3">{it.weight}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{it.dims}</td>
                      <td className="px-3 py-3">{it.qty}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <button aria-label={`Edit ${it.name}`} className="text-blue-600 hover:text-blue-800">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(it.id)}
                            aria-label={`Delete ${it.name}`}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                        No items yet. Select Add Item to list what's in your packages.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </aside>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
          <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-700 px-8 py-3 text-sm font-medium text-white hover:bg-blue-800">
            Next: Find Trucks <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}