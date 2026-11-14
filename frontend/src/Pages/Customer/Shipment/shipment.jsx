import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin, Search, X, Info, ExternalLink, Plus, Minus, ArrowRight, ArrowUpDown,
    Sprout, Package, Route, Timer, Ruler, FileText, AlertCircle, Loader2,
} from "lucide-react";
import { createShipment, getLocations, getRouteInfo, getUserId } from "../../../../src/API/Shipmentapi";

// Route of the Parcel Details page (must match the path in your router)
const PARCEL_ROUTE = "/user/parcel";

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

function LocationField({ id, label, value, onChange, options, loading, invalid, disabled }) {
    // Suggestions come from the API and are filtered by what the user types
    const typed = cityOf(value).toLowerCase();
    const suggestions = options
        .filter((o) => o.toLowerCase().includes(typed))
        .sort((x, y) => {
            const xs = x.toLowerCase().startsWith(typed) ? 0 : 1;
            const ys = y.toLowerCase().startsWith(typed) ? 0 : 1;
            return xs - ys || x.localeCompare(y);
        })
        .slice(0, 8);

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
                    disabled={disabled}
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                {value && !disabled && (
                    <button type="button" onClick={() => onChange("")} aria-label={`Clear ${label}`} className="text-slate-400 hover:text-slate-600">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="mt-3 flex min-h-[1.75rem] flex-wrap gap-2">
                {loading ? (
                    <>
                        <span className="h-7 w-16 animate-pulse rounded-md bg-slate-100" />
                        <span className="h-7 w-20 animate-pulse rounded-md bg-slate-100" />
                        <span className="h-7 w-14 animate-pulse rounded-md bg-slate-100" />
                    </>
                ) : (
                    suggestions.map((c) => {
                        const active = typed === c.toLowerCase();
                        return (
                            <button
                                key={c}
                                type="button"
                                disabled={disabled}
                                onClick={() => onChange(c)}
                                aria-pressed={active}
                                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-blue-100 text-blue-900" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {c}
                            </button>
                        );
                    })
                )}
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
                <g fontSize="15" fill="#0f172a" fontWeight="700">
                    <text x="100" y="168">{cityOf(from) || "Origin"}</text>
                    <text x="685" y="270" textAnchor="start">{cityOf(to) || "Destination"}</text>
                </g>
                <path d="M165 128 m-12 -26 a14 14 0 1 1 24 0 c0 12 -12 26 -12 26 s-12 -14 -12 -26z" fill="#ef4444" transform="translate(0,6)" />
                <circle cx="165" cy="112" r="5" fill="#fff" />
                <path d="M665 262 m-12 -26 a14 14 0 1 1 24 0 c0 12 -12 26 -12 26 s-12 -14 -12 -26z" fill="#16a34a" transform="translate(0,-6)" />
                <circle cx="665" cy="224" r="5" fill="#fff" />
            </svg>

            {/* Route card */}
            <div className="absolute left-3 top-3 max-w-[15rem] rounded-lg bg-white p-4 shadow-md">
                <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <span className="truncate">{cityOf(from) || "—"}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                    <span className="truncate">{cityOf(to) || "—"}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                    {route ? `~${route.km} km${route.time ? `  •  ~${route.time}` : ""}` : "Distance not available"}
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

    // Form values
    const [pickup, setPickup] = useState("");
    const [delivery, setDelivery] = useState("");
    const [touched, setTouched] = useState(false);

    // Locations from the API (used as suggestions)
    const [pickupOptions, setPickupOptions] = useState([]);
    const [deliveryOptions, setDeliveryOptions] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(true);
    const [locationsError, setLocationsError] = useState("");

    // Route info (distance / time) from the API
    const [route, setRoute] = useState(null);

    // Submit state
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");
    const [needsSignIn, setNeedsSignIn] = useState(false);

    /* ----- Load pickup / delivery locations ----- */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { pickup: p, delivery: d } = await getLocations();
                if (cancelled) return;
                setPickupOptions(p);
                setDeliveryOptions(d);
            } catch (err) {
                if (!cancelled) setLocationsError(err.message || "Could not load location suggestions.");
            } finally {
                if (!cancelled) setLocationsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    /* ----- Validation ----- */
    const sameLocation =
        pickup.trim() && delivery.trim() && cityOf(pickup).toLowerCase() === cityOf(delivery).toLowerCase();

    let error = "";
    if (!pickup.trim() || !delivery.trim()) error = "Enter both pickup and delivery locations to continue.";
    else if (sameLocation) error = "Pickup and delivery locations must be different.";
    const valid = !error;

    /* ----- Fetch distance / time when both locations are valid ----- */
    useEffect(() => {
        if (!valid) { setRoute(null); return; }
        let cancelled = false;
        const timer = setTimeout(async () => {
            const info = await getRouteInfo(cityOf(pickup), cityOf(delivery));
            if (!cancelled) setRoute(info);
        }, 400); // wait until the user stops typing
        return () => { cancelled = true; clearTimeout(timer); };
    }, [pickup, delivery, valid]);

    const clearApiState = () => { setApiError(""); setNeedsSignIn(false); };
    const changePickup = (v) => { setPickup(v); clearApiState(); };
    const changeDelivery = (v) => { setDelivery(v); clearApiState(); };

    const swap = () => {
        setPickup(delivery);
        setDelivery(pickup);
    };

    const next = async () => {
        if (!valid) return setTouched(true);
        if (submitting) return; // prevents double submit

        clearApiState();

        // The id of whoever is signed in right now (read when the button is clicked,
        // so it always matches the current user – nothing is hardcoded).
        const userId = getUserId();
        if (userId === null || userId === undefined || userId === "") {
            setNeedsSignIn(true);
            setApiError("You are not signed in. Please sign in again.");
            return;
        }

        setSubmitting(true);
        try {
            // POST /api/shipments -> { UserId, pickup, destination }
            // If the same shipment already exists (409) we continue with the existing one.
            const { shipment } = await createShipment({
                userId,
                pickup: cityOf(pickup),
                destination: cityOf(delivery),
            });

            // Keep the id so the Parcel page still works after a refresh
            const shipmentId = shipment?.shipmentid ?? shipment?.shipmentId ?? shipment?.id;
            if (shipmentId != null) sessionStorage.setItem("currentShipmentId", String(shipmentId));

            navigate(PARCEL_ROUTE, { state: { pickup, destination: delivery, shipment } });
        } catch (err) {
            if (err.code === "NOT_SIGNED_IN") setNeedsSignIn(true);
            setApiError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const card = "min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7";

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <main className="w-full px-4 pb-8 pt-8 sm:px-7 sm:pt-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl">Create a New Shipment</h1>
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
                                onChange={changePickup}
                                options={pickupOptions}
                                loading={locationsLoading}
                                invalid={touched && !pickup.trim()}
                                disabled={submitting}
                            />
                            <div className="flex md:pt-[34px]">
                                <button
                                    type="button"
                                    onClick={swap}
                                    disabled={submitting}
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
                                onChange={changeDelivery}
                                options={deliveryOptions}
                                loading={locationsLoading}
                                invalid={(touched && !delivery.trim()) || !!sameLocation}
                                disabled={submitting}
                            />
                        </div>

                        {locationsError && (
                            <p className="mt-4 text-xs text-amber-700">
                                {locationsError} You can still type the city name yourself.
                            </p>
                        )}

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
                                <span className="font-medium">{route?.time || "—"}</span>
                            </SummaryStat>
                            {route && route.popular != null && (
                                <SummaryStat icon={Route} label="Route Availability">
                                    <span
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${route.popular ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                            }`}
                                    >
                                        {route.popular ? "High Availability" : "Moderate Availability"}
                                    </span>
                                </SummaryStat>
                            )}
                        </div>

                        <div className="mt-7 flex items-start gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-slate-700">
                            <Sprout className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                            <p><b className="font-semibold">Tip:</b> Early bookings get more truck options and better prices!</p>
                        </div>

                        {apiError && (
                            <div role="alert" className="mt-5 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                                <p className="flex items-start gap-2">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {apiError}
                                </p>
                                {needsSignIn && (
                                    <button
                                        type="button"
                                        onClick={() => navigate("/signin")}
                                        className="mt-2 ml-6 font-medium underline hover:text-red-900"
                                    >
                                        Go to sign in
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={next}
                            disabled={submitting}
                            className={`mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg font-medium text-white shadow-sm transition-colors ${submitting
                                ? "cursor-wait bg-blue-400"
                                : valid
                                    ? "bg-blue-700 hover:bg-blue-800"
                                    : "cursor-not-allowed bg-slate-300"
                                }`}
                            aria-disabled={!valid || submitting}
                        >
                            {submitting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Creating shipment...</>
                            ) : (
                                <>Next: Parcel Details <ArrowRight className="h-4 w-4" /></>
                            )}
                        </button>
                    </aside>
                </div>
            </main>
        </div>
    );
}