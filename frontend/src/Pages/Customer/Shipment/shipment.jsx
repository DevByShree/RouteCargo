import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Search, X, Info, ExternalLink, Plus, Minus, ArrowRight, ArrowUpDown,
  Sprout, Package, Route, Timer, Ruler, FileText, AlertCircle,
} from "lucide-react";

const PICKUP_CHIPS = ["Pune", "Hinjawadi", "Chakan", "Bhosari"];
const DELIVERY_CHIPS = ["Mumbai", "Navi Mumbai", "Thane", "Panvel"];

// Approximate road distance (km) and time for the common routes
const ROUTES = {
  "Pune|Mumbai": { km: 150, time: "3-4 hours", popular: true },
  "Pune|Navi Mumbai": { km: 135, time: "3-3.5 hours", popular: true },
  "Pune|Thane": { km: 160, time: "3.5-4 hours", popular: false },
  "Pune|Panvel": { km: 120, time: "2.5-3 hours", popular: true },
  "Hinjawadi|Mumbai": { km: 140, time: "3-3.5 hours", popular: true },
  "Hinjawadi|Navi Mumbai": { km: 120, time: "2.5-3 hours", popular: true },
  "Hinjawadi|Thane": { km: 150, time: "3-4 hours", popular: false },
  "Hinjawadi|Panvel": { km: 105, time: "2-2.5 hours", popular: true },
  "Chakan|Mumbai": { km: 165, time: "3.5-4.5 hours", popular: false },
  "Chakan|Navi Mumbai": { km: 150, time: "3-4 hours", popular: false },
  "Chakan|Thane": { km: 175, time: "4-4.5 hours", popular: false },
  "Chakan|Panvel": { km: 135, time: "3-3.5 hours", popular: false },
  "Bhosari|Mumbai": { km: 155, time: "3-4 hours", popular: true },
  "Bhosari|Navi Mumbai": { km: 140, time: "3-3.5 hours", popular: true },
  "Bhosari|Thane": { km: 165, time: "3.5-4 hours", popular: false },
  "Bhosari|Panvel": { km: 125, time: "2.5-3 hours", popular: true },
};

const cityOf = (v) => (v || "").split(",")[0].trim();
const inputShell =
  "flex h-11 items-center gap-2 rounded-lg border bg-white px-3 transition focus-within:ring-2";

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-slate-700">
      {children} <span className="text-red-500">*</span>
    </label>
  );
}

function SectionHeader({ icon: Icon, iconClass, title, subtitle, border }) {
  return (
    <div className={`flex items-start gap-3 ${border ? "border-b border-slate-100 pb-5" : ""}`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
        <Icon className={`h-6 w-6 ${iconClass}`} strokeWidth={1.7} />
      </span>
      <div>
        <h2 className="text-lg font-bold text-blue-950">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function LocationField({ id, label, value, onChange, chips, invalid }) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={`${inputShell} ${invalid
            ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
            : "border-slate-200 focus-within:border-blue-500 focus-within:ring-blue-100"
          }`}
      >
        <Search className="h-4 w-4 shrink-0 text-slate-500" />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search city or area"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
        {value && (
          <button type="button" onClick={() => onChange("")} aria-label={`Clear ${label}`} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = cityOf(value).toLowerCase() === c.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(`${c}, Maharashtra`)}
              aria-pressed={active}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-blue-100 text-blue-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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

function RouteMap({ from, to, route }) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`;

  return (
    <div className="relative h-72 overflow-hidden rounded-xl border border-slate-200 bg-[#e9efe4] sm:h-80">
      <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M0 0 H150 C170 60 130 110 160 170 C185 220 150 260 170 300 H0 Z" fill="#cfe3f3" />
        <path d="M300 40 C380 10 470 50 540 30 C620 10 700 60 800 40 V0 H300 Z" fill="#dde8d3" />
        <path d="M420 230 C520 200 640 250 800 220 V300 H400 Z" fill="#dfe9d6" />
        <path d="M60 180 C260 150 420 120 560 150 S720 215 800 235" stroke="#f4d58d" strokeWidth="5" fill="none" opacity=".8" />
        <path d="M330 0 C350 90 420 160 470 300" stroke="#fff" strokeWidth="4" fill="none" opacity=".8" />
        <path
          d="M165 128 C215 130 250 150 285 165 S350 185 420 185 S520 200 575 235 S650 255 665 262"
          stroke="#1d3fd6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx="305" cy="130" r="4" fill="#1d3fd6" stroke="#fff" strokeWidth="2" />
        <circle cx="565" cy="228" r="4" fill="#1d3fd6" stroke="#fff" strokeWidth="2" />
        <circle cx="665" cy="262" r="5" fill="#1d3fd6" stroke="#fff" strokeWidth="2" />
        <g fontSize="13" fill="#334155" fontWeight="500">
          <text x="330" y="52">Thane</text>
          <text x="440" y="48">Kalyan</text>
          <text x="330" y="108">Navi Mumbai</text>
          <text x="440" y="242">Lonavala</text>
        </g>
        <g fontSize="15" fill="#0f172a" fontWeight="700">
          <text x="100" y="168">{cityOf(from) || "Origin"}</text>
          <text x="685" y="270" textAnchor="start">{cityOf(to) || "Destination"}</text>
        </g>
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

      {/* Route card */}
      <div className="absolute left-3 top-3 max-w-[15rem] rounded-lg bg-white p-4 shadow-md">
        <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <span className="truncate">{cityOf(from) || "—"}</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
          <span className="truncate">{cityOf(to) || "—"}</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {route ? `~${route.km} km  •  ~${route.time}` : "Distance not available"}
        </p>
        {route?.popular && (
          <span className="mt-3 inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
            Popular Route
          </span>
        )}
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-blue-700 shadow-md hover:bg-slate-50"
      >
        View on Maps <ExternalLink className="h-4 w-4" />
      </a>

      <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-lg bg-white shadow-md">
        <button type="button" aria-label="Zoom in" className="p-2.5 hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
        <div className="h-px bg-slate-200" />
        <button type="button" aria-label="Zoom out" className="p-2.5 hover:bg-slate-50"><Minus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-3 text-slate-500">
        <Icon className="h-5 w-5 text-slate-400" /> {label}
      </span>
      {children}
    </div>
  );
}

export default function Shipment() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("Pune, Maharashtra");
  const [delivery, setDelivery] = useState("Mumbai, Maharashtra");
  const [touched, setTouched] = useState(false);

  const route = useMemo(
    () => ROUTES[`${cityOf(pickup)}|${cityOf(delivery)}`] || null,
    [pickup, delivery]
  );

  const sameLocation =
    pickup.trim() && delivery.trim() && cityOf(pickup).toLowerCase() === cityOf(delivery).toLowerCase();

  let error = "";
  if (!pickup.trim() || !delivery.trim()) error = "Enter both pickup and delivery locations to continue.";
  else if (sameLocation) error = "Pickup and delivery locations must be different.";
  const valid = !error;

  const swap = () => {
    setPickup(delivery);
    setDelivery(pickup);
  };

  const next = () => {
    if (!valid) return setTouched(true);
    navigate("/parcel", { state: { pickup, destination: delivery } });
  };

  const card = "min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="w-full px-7 pb-8 pt-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Create a New Shipment</h1>
            <p className="mt-1 text-slate-600">Tell us where your goods are going. We'll match you with trucks on the way.</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4" /> Save as Draft
          </button>
        </div>

        <div className="mt-7 grid items-start gap-7 xl:grid-cols-[1fr_360px]">
          {/* Form card */}
          <section className={card}>
            <SectionHeader
              icon={MapPin}
              iconClass="fill-blue-600 text-blue-600"
              title="Pickup & Delivery Information"
              subtitle="Enter the pickup and delivery details for your shipment."
              border
            />

            <div className="mt-7 grid gap-7 md:grid-cols-[1fr_auto_1fr]">
              <LocationField
                id="pickup"
                label="Pickup Location"
                value={pickup}
                onChange={setPickup}
                chips={PICKUP_CHIPS}
                invalid={touched && !pickup.trim()}
              />
              <div className="flex md:pt-[34px]">
                <button
                  type="button"
                  onClick={swap}
                  aria-label="Swap pickup and delivery"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-700 md:rotate-90"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </div>
              <LocationField
                id="delivery"
                label="Delivery Location"
                value={delivery}
                onChange={setDelivery}
                chips={DELIVERY_CHIPS}
                invalid={(touched && !delivery.trim()) || !!sameLocation}
              />
            </div>

            {error && (touched || sameLocation) && (
              <p role="alert" className="mt-4 flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}

            <div className="mt-7 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-slate-700">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              We'll find trucks that are already traveling on this route or nearby routes.
            </div>

            <div className="mt-5">
              <RouteMap from={pickup} to={delivery} route={route} />
            </div>
          </section>

          {/* Summary card */}
          <aside className={`${card} xl:sticky xl:top-6`}>
            <SectionHeader
              icon={Package}
              iconClass="text-orange-500"
              title="Shipment Summary"
              subtitle="Quick overview of your shipment details."
              border
            />

            <div className="relative mt-6 space-y-6 pl-8">
              <span className="absolute left-[9px] top-3 h-[calc(100%-1.5rem)] w-px bg-slate-200" />
              <div className="relative min-w-0">
                <span className="absolute -left-8 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                  <span className="h-3 w-3 rounded-full bg-emerald-600" />
                </span>
                <div className="font-semibold">Pickup</div>
                <div className="truncate text-slate-700" title={pickup}>{pickup || "—"}</div>
              </div>
              <div className="relative min-w-0">
                <span className="absolute -left-8 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                </span>
                <div className="font-semibold">Delivery</div>
                <div className="truncate text-slate-700" title={delivery}>{delivery || "—"}</div>
              </div>
            </div>

            <div className="mt-7 space-y-4 border-t border-slate-100 pt-6">
              <SummaryStat icon={Ruler} label="Distance (approx.)">
                <span className="font-medium">{route ? `${route.km} km` : "—"}</span>
              </SummaryStat>
              <SummaryStat icon={Timer} label="Estimated Time">
                <span className="font-medium">{route ? route.time : "—"}</span>
              </SummaryStat>
              <SummaryStat icon={Route} label="Route Availability">
                {route ? (
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${route.popular ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                  >
                    {route.popular ? "High Availability" : "Moderate Availability"}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </SummaryStat>
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-slate-700">
              <Sprout className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p><b className="font-semibold">Tip:</b> Early bookings get more truck options and better prices!</p>
            </div>

            <button
              type="button"
              onClick={next}
              className={`mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-lg font-medium text-white shadow-sm transition-colors ${valid ? "bg-blue-700 hover:bg-blue-800" : "cursor-not-allowed bg-slate-300"
                }`}
              aria-disabled={!valid}
            >
              Next: Parcel Details <ArrowRight className="h-4 w-4" />
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}