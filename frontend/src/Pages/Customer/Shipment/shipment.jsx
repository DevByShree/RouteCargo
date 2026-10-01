import { useState } from "react";
import {
  Home, PackagePlus, Truck, CalendarCheck, Crosshair, Wallet, MapPin, Bell, User,
  Search, X, Calendar, Clock, Info, ExternalLink, Plus, Minus, ArrowRight,
  CircleHelp, LogOut, Sprout, Package, Route, Timer, Ruler, ChevronDown, FileText,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", icon: Home },
  { label: "Create Shipment", icon: PackagePlus, active: true },
  { label: "Find Trucks", icon: Truck },
  { label: "My Bookings", icon: CalendarCheck },
  { label: "Tracking", icon: Crosshair },
  { label: "Payments", icon: Wallet },
  { label: "Saved Addresses", icon: MapPin },
  { label: "Notifications", icon: Bell, badge: 3 },
  { label: "Profile", icon: User },
];

const STEPS = [
  { title: "Pickup & Delivery", sub: "Locations and schedule" },
  { title: "Parcel Details", sub: "Weight, size, type" },
  { title: "Find Trucks", sub: "View matching trucks" },
  { title: "Review & Book", sub: "Confirm and send request" },
];

const PICKUP_CHIPS = ["Pune", "Hinjawadi", "Chakan", "Bhosari"];
const DELIVERY_CHIPS = ["Mumbai", "Navi Mumbai", "Thane", "Panvel"];

const fmtDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const fmtTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

function Label({ children }) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children} <span className="text-red-500">*</span>
    </label>
  );
}

function LocationField({ label, value, onChange, chips }) {
  return (
    <div className="min-w-0">
      <Label>{label}</Label>
      <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <Search className="h-4 w-4 shrink-0 text-slate-500" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none"
        />
        {value && (
          <button onClick={() => onChange("")} aria-label={`Clear ${label}`} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = value.toLowerCase().startsWith(c.toLowerCase());
          return (
            <button
              key={c}
              onClick={() => onChange(`${c}, Maharashtra`)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "bg-blue-100 text-blue-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateTimeField({ label, type, icon: Icon, value, onChange, display }) {
  return (
    <div className="min-w-0">
      <Label>{label}</Label>
      <div className="relative flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
        <span className="truncate text-sm text-slate-800">{display}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}

function RouteMap({ from, to }) {
  return (
    <div className="relative h-72 overflow-hidden rounded-xl border border-slate-200 bg-[#e9efe4]">
      <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {/* sea */}
        <path d="M0 0 H150 C170 60 130 110 160 170 C185 220 150 260 170 300 H0 Z" fill="#cfe3f3" />
        {/* terrain patches */}
        <path d="M300 40 C380 10 470 50 540 30 C620 10 700 60 800 40 V0 H300 Z" fill="#dde8d3" />
        <path d="M420 230 C520 200 640 250 800 220 V300 H400 Z" fill="#dfe9d6" />
        {/* highways */}
        <path d="M60 180 C260 150 420 120 560 150 S720 215 800 235" stroke="#f4d58d" strokeWidth="5" fill="none" opacity=".8" />
        <path d="M330 0 C350 90 420 160 470 300" stroke="#fff" strokeWidth="4" fill="none" opacity=".8" />
        {/* route */}
        <path
          d="M165 128 C215 130 250 150 285 165 S350 185 420 185 S520 200 575 235 S650 255 665 262"
          stroke="#1d3fd6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx="305" cy="130" r="4" fill="#1d3fd6" stroke="#fff" strokeWidth="2" />
        <circle cx="565" cy="228" r="4" fill="#1d3fd6" stroke="#fff" strokeWidth="2" />
        <circle cx="665" cy="262" r="5" fill="#1d3fd6" stroke="#fff" strokeWidth="2" />
        {/* labels */}
        <g fontSize="13" fill="#334155" fontWeight="500">
          <text x="330" y="52">Thane</text>
          <text x="440" y="48">Kalyan</text>
          <text x="330" y="108">Navi Mumbai</text>
          <text x="440" y="242">Lonavala</text>
        </g>
        <g fontSize="15" fill="#0f172a" fontWeight="700">
          <text x="100" y="168">{from.split(",")[0] || "Origin"}</text>
          <text x="685" y="270">{to.split(",")[0] || "Destination"}</text>
        </g>
        {/* markers */}
        <path d="M165 128 m-12 -26 a14 14 0 1 1 24 0 c0 12 -12 26 -12 26 s-12 -14 -12 -26z" fill="#ef4444" transform="translate(0,6)" />
        <circle cx="165" cy="112" r="5" fill="#fff" />
        <path d="M665 262 m-12 -26 a14 14 0 1 1 24 0 c0 12 -12 26 -12 26 s-12 -14 -12 -26z" fill="#16a34a" transform="translate(0,-6)" />
        <circle cx="665" cy="224" r="5" fill="#fff" />
        <g fontSize="11" fill="#fff" fontWeight="700">
          <rect x="400" y="168" width="38" height="18" rx="3" fill="#3b5bdb" />
          <text x="406" y="181">NH48</text>
          <rect x="190" y="255" width="38" height="18" rx="3" fill="#6b8bd8" />
          <text x="195" y="268">NH60</text>
        </g>
      </svg>

      {/* route card */}
      <div className="absolute left-3 top-3 w-60 rounded-lg bg-white p-4 shadow-md">
        <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
          {from.split(",")[0] || "—"} <ArrowRight className="h-4 w-4" /> {to.split(",")[0] || "—"}
        </div>
        <p className="mt-1 text-sm text-slate-500">~150 km &nbsp;•&nbsp; ~3-4 hours</p>
        <span className="mt-3 inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
          Popular Route
        </span>
      </div>

      <button className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-blue-700 shadow-md hover:bg-slate-50">
        View on Maps <ExternalLink className="h-4 w-4" />
      </button>

      <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-lg bg-white shadow-md">
        <button aria-label="Zoom in" className="p-2.5 hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
        <div className="h-px bg-slate-200" />
        <button aria-label="Zoom out" className="p-2.5 hover:bg-slate-50"><Minus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-3 text-slate-500">
        <Icon className="h-5 w-5 text-slate-400" /> {label}
      </span>
      {children}
    </div>
  );
}

export default function Shipment() {
  const [pickup, setPickup] = useState("Pune, Maharashtra");
  const [delivery, setDelivery] = useState("Mumbai, Maharashtra");
  const [pickupDate, setPickupDate] = useState("2026-09-22");
  const [pickupTime, setPickupTime] = useState("09:00");
  const [deliveryDate, setDeliveryDate] = useState("2026-09-23");
  const [deliveryTime, setDeliveryTime] = useState("18:00");

  const valid = pickup && delivery && pickupDate && pickupTime && deliveryDate && deliveryTime;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      
      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        

        <main className="flex-1 p-6">
          <nav className="text-sm text-slate-600">
            Create Shipment <span className="mx-1">›</span>
            <span className="font-medium text-slate-900">Pickup & Delivery</span>
          </nav>

          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Create a New Shipment</h1>
              <p className="mt-1 text-slate-600">Tell us about your shipment and we'll find the best trucks for you.</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50">
              <FileText className="h-4 w-4" /> Save as Draft
            </button>
          </div>

          {/* Stepper */}
          <ol className="mt-6 grid gap-4 rounded-xl bg-white px-6 py-5 sm:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${
                    i === 0 ? "bg-blue-700 text-white" : "border-2 border-slate-200 text-slate-600"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="whitespace-nowrap font-medium">{s.title}</span>
                    {i < 3 && <span className={`hidden h-px flex-1 xl:block ${i === 0 ? "bg-blue-700" : "bg-slate-200"}`} />}
                  </div>
                  <div className="text-sm text-slate-500">{s.sub}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_350px]">
            {/* Form card */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-6 w-6 fill-blue-600 text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold text-blue-950">Pickup & Delivery Information</h2>
                  <p className="text-sm text-slate-500">Enter the pickup and delivery details for your shipment.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <LocationField label="Pickup Location" value={pickup} onChange={setPickup} chips={PICKUP_CHIPS} />
                <LocationField label="Delivery Location" value={delivery} onChange={setDelivery} chips={DELIVERY_CHIPS} />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DateTimeField label="Pickup Date" type="date" icon={Calendar} value={pickupDate} onChange={setPickupDate} display={pickupDate ? fmtDate(pickupDate) : "Select date"} />
                <DateTimeField label="Pickup Time" type="time" icon={Clock} value={pickupTime} onChange={setPickupTime} display={pickupTime ? fmtTime(pickupTime) : "Select time"} />
                <DateTimeField label="Expected Delivery Date" type="date" icon={Calendar} value={deliveryDate} onChange={setDeliveryDate} display={deliveryDate ? fmtDate(deliveryDate) : "Select date"} />
                <DateTimeField label="Expected Delivery Time" type="time" icon={Clock} value={deliveryTime} onChange={setDeliveryTime} display={deliveryTime ? fmtTime(deliveryTime) : "Select time"} />
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-slate-700">
                <Info className="h-4 w-4 shrink-0 text-blue-600" />
                We'll find trucks that are already traveling on this route or nearby routes.
              </div>

              <div className="mt-4">
                <RouteMap from={pickup} to={delivery} />
              </div>
            </section>

            {/* Summary card */}
            <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                <Package className="h-9 w-9 text-amber-600" strokeWidth={1.5} />
                <div>
                  <h2 className="text-lg font-bold text-blue-950">Shipment Summary</h2>
                  <p className="text-sm text-slate-500">Quick overview of your shipment details.</p>
                </div>
              </div>

              <div className="relative mt-5 space-y-6 pl-8">
                <span className="absolute left-[9px] top-3 h-[calc(100%-1.5rem)] w-px bg-slate-200" />
                <div className="relative">
                  <span className="absolute -left-8 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                    <span className="h-3 w-3 rounded-full bg-emerald-600" />
                  </span>
                  <div className="font-semibold">Pickup</div>
                  <div className="text-slate-700">{pickup || "—"}</div>
                  <div className="text-sm text-slate-500">
                    {pickupDate && pickupTime ? `${fmtDate(pickupDate)}, ${fmtTime(pickupTime)}` : "Date not set"}
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-8 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                  </span>
                  <div className="font-semibold">Delivery</div>
                  <div className="text-slate-700">{delivery || "—"}</div>
                  <div className="text-sm text-slate-500">
                    {deliveryDate && deliveryTime ? `${fmtDate(deliveryDate)}, ${fmtTime(deliveryTime)}` : "Date not set"}
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                <SummaryStat icon={Ruler} label="Distance (approx.)"><span className="font-medium">150 km</span></SummaryStat>
                <SummaryStat icon={Timer} label="Estimated Time"><span className="font-medium">3-4 hours</span></SummaryStat>
                <SummaryStat icon={Route} label="Popular Route">
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">High Availability</span>
                </SummaryStat>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-slate-700">
                <Sprout className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p><b className="font-semibold">Tip:</b> Early bookings get more truck options and better prices!</p>
              </div>

              <button
                disabled={!valid}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Next: Parcel Details <ArrowRight className="h-4 w-4" />
              </button>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}