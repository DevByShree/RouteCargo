import { useEffect, useRef, useState } from "react";
import { authAPI } from "../../../API/api";
import { User, Mail, Phone, Building2, Pencil, Check, X, AlertCircle, BadgeCheck } from "lucide-react";

const FIELDS = [
    { name: "name", label: "Full Name", icon: User, type: "text", placeholder: "Your full name", autoComplete: "name" },
    { name: "email", label: "Email", icon: Mail, type: "email", placeholder: "you@example.com", autoComplete: "email" },
    { name: "phone", label: "Phone", icon: Phone, type: "tel", placeholder: "10-digit mobile number", autoComplete: "tel", inputMode: "numeric" },
    { name: "company", label: "Company", icon: Building2, type: "text", placeholder: "Company name (optional)", autoComplete: "organization", optional: true },
];

const EMPTY_USER = { name: "", email: "", phone: "", company: "", role: "customer" };

// Make sure every field is a string so inputs never get undefined
const normalize = (u = {}) => ({
    name: u.name || "",
    email: u.email || "",
    phone: u.phone ? String(u.phone) : "",
    company: u.company || "",
    role: u.role || "customer",
});

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const initials = (name) =>
    (name || "").trim().split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

function validate(d) {
    const errors = {};
    if (!d.name.trim()) errors.name = "Enter your full name.";
    if (!d.email.trim()) errors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) errors.email = "Enter a valid email address.";
    // Phone is optional here because accounts created at signup may not have one yet
    if (d.phone.trim() && !/^\d{10}$/.test(d.phone.trim())) errors.phone = "Phone number must be 10 digits.";
    return errors;
}

function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
}

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [editing, setEditing] = useState(false);
    const [user, setUser] = useState(EMPTY_USER);
    const [draft, setDraft] = useState(EMPTY_USER);
    const [errors, setErrors] = useState({});
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState("");
    const timer = useRef(null);

    // Load the real logged-in user (no more hardcoded name)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await authAPI.me();
                if (cancelled) return;
                const u = normalize(res?.user);
                setUser(u);
                setDraft(u);
            } catch (error) {
                if (!cancelled) setLoadError(error?.data?.message || "Could not load your profile. Please refresh the page.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => () => clearTimeout(timer.current), []);

    const changed = FIELDS.some((f) => draft[f.name] !== user[f.name]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDraft((d) => ({ ...d, [name]: name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    };

    const startEdit = () => {
        setDraft(user);
        setErrors({});
        setApiError("");
        setSaved(false);
        setEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const found = validate(draft);
        setErrors(found);
        if (Object.keys(found).length) return;

        setSaving(true);
        setApiError("");
        try {
            const payload = {
                name: draft.name.trim(),
                email: draft.email.trim(),
                phone: draft.phone.trim(),
                company: draft.company.trim(),
            };
            // NOTE: your backend must accept phone and company too, otherwise they won't persist after a refresh.
            // If it rejects unknown fields, remove them from this payload.
            const res = await authAPI.updateMe(payload);
            const next = normalize({ ...user, ...payload, ...(res?.user || {}) });
            setUser(next);
            setDraft(next);
            setEditing(false);
            setSaved(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setSaved(false), 3000);
            // Tell the navbar the profile changed
            window.dispatchEvent(new CustomEvent("profileUpdated", { detail: { name: next.name } }));
        } catch (error) {
            // Keep the last saved profile on failure
            setApiError(error?.data?.message || "Could not update profile. Please try again.");
            setSaved(false);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setDraft(user);
        setErrors({});
        setApiError("");
        setEditing(false);
    };

    const card = "min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7";

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <main className="w-full px-7 pb-8 pt-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-blue-950">Profile</h1>
                <p className="mt-1 text-slate-600">Manage your personal details.</p>

                {loadError && (
                    <p role="alert" className="mt-7 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0" /> {loadError}
                    </p>
                )}

                <div className="mt-7 grid items-start gap-7 lg:grid-cols-[320px_1fr]">
                    {/* Identity card */}
                    <section className={`${card} flex flex-col items-center text-center`}>
                        {loading ? (
                            <div className="flex w-full flex-col items-center gap-3">
                                <Skeleton className="h-24 w-24 !rounded-full" />
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-6 w-24 !rounded-full" />
                                <Skeleton className="mt-4 h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ) : (
                            <>
                                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-700 text-3xl font-bold text-white ring-4 ring-blue-50">
                                    {initials(user.name)}
                                </span>
                                <h2 className="mt-4 max-w-full truncate text-lg font-bold text-blue-950" title={user.name}>
                                    {user.name || "Your name"}
                                </h2>
                                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    <BadgeCheck className="h-3.5 w-3.5" /> {capitalize(user.role)}
                                </span>

                                <dl className="mt-6 w-full space-y-3 border-t border-slate-100 pt-5 text-left text-sm">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                                        <dd className="truncate text-slate-700" title={user.email}>{user.email || "Not added"}</dd>
                                    </div>
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                                        <dd className="text-slate-700">{user.phone ? `+91 ${user.phone}` : "Not added"}</dd>
                                    </div>
                                    {user.company && (
                                        <div className="flex min-w-0 items-center gap-3">
                                            <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                                            <dd className="truncate text-slate-700" title={user.company}>{user.company}</dd>
                                        </div>
                                    )}
                                </dl>
                            </>
                        )}
                    </section>

                    {/* Details card */}
                    <section className={card}>
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
                            <div>
                                <h2 className="text-lg font-bold text-blue-950">Personal Details</h2>
                                <p className="text-sm text-slate-500">
                                    {editing ? "Update your details and save your changes." : "Your account information."}
                                </p>
                            </div>
                            {!editing && !loading && !loadError && (
                                <button
                                    type="button"
                                    onClick={startEdit}
                                    className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                                >
                                    <Pencil className="h-4 w-4" /> Edit Profile
                                </button>
                            )}
                        </div>

                        {saved && (
                            <p role="status" className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
                                <Check className="h-4 w-4 shrink-0" /> Profile updated.
                            </p>
                        )}

                        {apiError && (
                            <p role="alert" className="mt-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0" /> {apiError}
                            </p>
                        )}

                        <form onSubmit={handleSave} noValidate>
                            <div className="mt-7 grid gap-6 sm:grid-cols-2">
                                {FIELDS.map(({ name, label, icon: Icon, type, placeholder, autoComplete, inputMode, optional }) => {
                                    const err = errors[name];
                                    return (
                                        <div key={name} className="min-w-0">
                                            <label htmlFor={name} className="mb-2 block text-sm font-medium text-slate-700">
                                                {label}
                                                {(optional || name === "phone") && <span className="font-normal text-slate-400"> (Optional)</span>}
                                            </label>
                                            {loading ? (
                                                <Skeleton className="h-11 w-full" />
                                            ) : editing ? (
                                                <>
                                                    <div
                                                        className={`flex h-11 items-center gap-2 rounded-lg border bg-white px-3 transition focus-within:ring-2 ${err
                                                                ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                                                                : "border-slate-200 focus-within:border-blue-500 focus-within:ring-blue-100"
                                                            }`}
                                                    >
                                                        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                                                        <input
                                                            id={name}
                                                            name={name}
                                                            type={type}
                                                            inputMode={inputMode}
                                                            autoComplete={autoComplete}
                                                            value={draft[name]}
                                                            onChange={handleChange}
                                                            placeholder={placeholder}
                                                            aria-invalid={!!err}
                                                            aria-describedby={err ? `${name}-error` : undefined}
                                                            className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                                                        />
                                                    </div>
                                                    {err && (
                                                        <p id={`${name}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                                                            <AlertCircle className="h-3.5 w-3.5" /> {err}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex h-11 items-center gap-2 rounded-lg bg-slate-50 px-3">
                                                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                                                    <span className="min-w-0 truncate text-sm font-medium text-slate-900" title={user[name]}>
                                                        {user[name] || <span className="font-normal text-slate-400">Not added</span>}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {editing && (
                                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                    >
                                        <X className="h-4 w-4" /> Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!changed || saving}
                                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                                    >
                                        <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}