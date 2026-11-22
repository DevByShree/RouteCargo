import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin, Search, X, Info, ArrowRight, ArrowUpDown,
    Sprout, Package, Timer, Ruler, FileText, AlertCircle, Loader2,
} from "lucide-react";
import { createShipment, getLocations, rememberCurrentShipment } from "../../../API/Shipmentapi";
import { formatRouteDuration, searchPlaces } from "../../../API/mapServices";
import { useFormDraft } from "../../../Authentication/useFormDraft";
import { useAuth } from "../../../Authentication/useAuth";
const RouteMap = lazy(() => import("../../components/RouteMap"));

// Route of the Parcel Details page (must match the path in your router)
const PARCEL_ROUTE = "/user/parcel";
const EMPTY_SHIPMENT_DRAFT = { pickup: "", destination: "", pickupDate: new Date().toISOString().slice(0, 10) };
const validShipmentDraft = value => value && typeof value === "object"
    && typeof value.pickup === "string" && value.pickup.length <= 160
    && typeof value.destination === "string" && value.destination.length <= 160
    && typeof value.pickupDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.pickupDate);

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

function LocationField({ id, label, value, onChange, options, loading, invalid, disabled, places = [], placesLoading = false, onSelectPlace }) {
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
            {(placesLoading || places.length > 0) && <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm" role="listbox" aria-label={`${label} address suggestions`}>
                {placesLoading && <p className="px-2 py-1 text-xs text-slate-500">Searching mapped addresses…</p>}
                {places.map(place => <button key={`${place.latitude}-${place.longitude}-${place.label}`} type="button" role="option" aria-selected={value === place.label}
                    onClick={() => onSelectPlace(place)} className="block w-full rounded-md px-2 py-1.5 text-left text-xs text-slate-700 hover:bg-blue-50">
                    <span className="block font-medium">{place.label}</span>
                    <span className="text-slate-500">{[place.state, place.country].filter(Boolean).join(", ")}</span>
                </button>)}
            </div>}
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
    const { user } = useAuth();

    // Form values
    const [shipmentDraft, setShipmentDraft, clearShipmentDraft] = useFormDraft({ formId: "create-shipment", initialValue: EMPTY_SHIPMENT_DRAFT, validate: validShipmentDraft });
    const { pickup, destination: delivery, pickupDate } = shipmentDraft;
    const setPickup = (value) => setShipmentDraft((draft) => ({ ...draft, pickup: value }));
    const setDelivery = (value) => setShipmentDraft((draft) => ({ ...draft, destination: value }));
    const setPickupDate = (value) => setShipmentDraft((draft) => ({ ...draft, pickupDate: value }));
    const [touched, setTouched] = useState(false);
    const [pickupPlace, setPickupPlace] = useState(null);
    const [deliveryPlace, setDeliveryPlace] = useState(null);
    const [route, setRoute] = useState(null);
    const [pickupMatches, setPickupMatches] = useState([]);
    const [deliveryMatches, setDeliveryMatches] = useState([]);
    const [pickupSearchLoading, setPickupSearchLoading] = useState(false);
    const [deliverySearchLoading, setDeliverySearchLoading] = useState(false);

    // Locations from the API (used as suggestions)
    const [pickupOptions, setPickupOptions] = useState([]);
    const [deliveryOptions, setDeliveryOptions] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(true);
    const [locationsError, setLocationsError] = useState("");

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

    useEffect(() => {
        if (pickup.trim().length < 3 || pickupPlace?.label === pickup.trim()) return undefined;
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setPickupSearchLoading(true);
            try { setPickupMatches(await searchPlaces(pickup, { signal: controller.signal, limit: 4 })); }
            catch (searchError) { if (searchError.name !== "AbortError") setPickupMatches([]); }
            finally { if (!controller.signal.aborted) setPickupSearchLoading(false); }
        }, 450);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [pickup, pickupPlace?.label]);

    useEffect(() => {
        if (delivery.trim().length < 3 || deliveryPlace?.label === delivery.trim()) return undefined;
        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setDeliverySearchLoading(true);
            try { setDeliveryMatches(await searchPlaces(delivery, { signal: controller.signal, limit: 4 })); }
            catch (searchError) { if (searchError.name !== "AbortError") setDeliveryMatches([]); }
            finally { if (!controller.signal.aborted) setDeliverySearchLoading(false); }
        }, 450);
        return () => { window.clearTimeout(timer); controller.abort(); };
    }, [delivery, deliveryPlace?.label]);

    /* ----- Validation ----- */
    const sameLocation =
        pickup.trim() && delivery.trim() && cityOf(pickup).toLowerCase() === cityOf(delivery).toLowerCase();

    let error = "";
    if (!pickup.trim() || !delivery.trim()) error = "Enter both pickup and delivery locations to continue.";
    else if (sameLocation) error = "Pickup and delivery locations must be different.";
    const valid = !error;

    const clearApiState = () => { setApiError(""); setNeedsSignIn(false); };
    const changePickup = (v) => { setPickup(v); setPickupPlace(null); setPickupMatches([]); setPickupSearchLoading(false); setRoute(null); clearApiState(); };
    const changeDelivery = (v) => { setDelivery(v); setDeliveryPlace(null); setDeliveryMatches([]); setDeliverySearchLoading(false); setRoute(null); clearApiState(); };
    const selectPickupPlace = place => { setPickup(place.label); setPickupPlace(place); setPickupMatches([]); setPickupSearchLoading(false); setRoute(null); clearApiState(); };
    const selectDeliveryPlace = place => { setDelivery(place.label); setDeliveryPlace(place); setDeliveryMatches([]); setDeliverySearchLoading(false); setRoute(null); clearApiState(); };

    const swap = () => {
        setPickup(delivery);
        setDelivery(pickup);
        setPickupPlace(deliveryPlace);
        setDeliveryPlace(pickupPlace);
        setPickupMatches([]);
        setDeliveryMatches([]);
        setPickupSearchLoading(false);
        setDeliverySearchLoading(false);
        setRoute(null);
    };

    const next = async () => {
        if (!valid) return setTouched(true);
        if (submitting) return; // prevents double submit

        clearApiState();

        // The id of whoever is signed in right now (read when the button is clicked,
        // so it always matches the current user – nothing is hardcoded).
        setSubmitting(true);
        try {
            // POST /api/shipments -> { UserId, pickup, destination }
            // If the same shipment already exists (409) we continue with the existing one.
            const { shipment } = await createShipment({
                pickup: cityOf(pickup),
                destination: cityOf(delivery),
                pickupDate,
            });
            clearShipmentDraft();

            // Keep the id so the Parcel page still works after a refresh
            const shipmentId = shipment?.shipmentid ?? shipment?.shipmentId ?? shipment?.id;
            if (shipmentId != null) {
                sessionStorage.setItem("currentShipmentId", String(shipmentId));
                rememberCurrentShipment(user?.id, shipment);
            }

            navigate(PARCEL_ROUTE, { state: { pickup, destination: delivery, pickupDate, shipment } });
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
                                places={pickupMatches}
                                placesLoading={pickupSearchLoading}
                                onSelectPlace={selectPickupPlace}
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
                                places={deliveryMatches}
                                placesLoading={deliverySearchLoading}
                                onSelectPlace={selectDeliveryPlace}
                                invalid={(touched && !delivery.trim()) || !!sameLocation}
                                disabled={submitting}
                            />
                        </div>

                        <div className="mt-5 max-w-sm">
                            <label htmlFor="pickup-date" className="mb-1 block text-sm font-medium text-slate-700">Pickup date</label>
                            <input id="pickup-date" type="date" min={new Date().toISOString().slice(0, 10)} value={pickupDate} onChange={e => setPickupDate(e.target.value)} required disabled={submitting} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500" />
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
                            <Suspense fallback={<div className="flex h-72 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 sm:h-80">Loading interactive map…</div>}>
                                <RouteMap from={pickup} to={delivery} fromPlace={pickupPlace} toPlace={deliveryPlace} onRouteCalculated={setRoute} />
                            </Suspense>
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
                                <span className="font-medium">{route ? `${route.distanceKm.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "—"}</span>
                            </SummaryStat>
                            <SummaryStat icon={Timer} label="Estimated Time">
                                <span className="font-medium">{route ? `${formatRouteDuration(route.durationSeconds)} estimated` : "—"}</span>
                            </SummaryStat>
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

                        <div className="mt-5 flex items-center justify-between gap-3">
                            <button type="button" onClick={clearShipmentDraft} disabled={submitting} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">Clear form</button>
                            <button
                            type="button"
                            onClick={next}
                            disabled={submitting}
                            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-lg font-medium text-white shadow-sm transition-colors ${submitting
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
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
