import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, User, LogOut, Truck, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authAPI, getToken, removeToken } from "../API/api";

// Replace with data from your notifications API
const INITIAL_NOTIFICATIONS = [
    { id: 1, title: "Booking accepted", text: "Patil Logistics accepted your request #BK2026092107.", time: "10 min ago", unread: true },
    { id: 2, title: "Shipment in transit", text: "Your shipment #BK2026091514 is on the way to Thane.", time: "2 hours ago", unread: true },
    { id: 3, title: "Payment received", text: "₹ 8,500 paid for booking #SH00123.", time: "Yesterday", unread: false },
];

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

function DashboardNavbar() {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null); // null | "notifications" | "profile"
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const containerRef = useRef(null);

    // Load the logged-in user from the existing auth API
    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await authAPI.me();
                if (res?.user) setUser(res.user);
            } catch {
                if (!getToken()) navigate("/signin", { replace: true });
            }
        };
        loadUser();
    }, [navigate]);

    // Keep the navbar user in sync when the profile name changes elsewhere (e.g. Profile page save)
    useEffect(() => {
        const onProfileUpdated = (e) => {
            const name = e?.detail?.name;
            if (name) setUser((prev) => ({ ...prev, name }));
        };
        window.addEventListener("profileUpdated", onProfileUpdated);
        return () => window.removeEventListener("profileUpdated", onProfileUpdated);
    }, []);

    // Close any open dropdown on outside click or Escape
    useEffect(() => {
        if (!openMenu) return;
        const onClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpenMenu(null);
        };
        const onKey = (e) => e.key === "Escape" && setOpenMenu(null);
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [openMenu]);

    const userName = user?.name || "User";
    const initials =
        userName.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "U";
    const unreadCount = notifications.filter((n) => n.unread).length;

    const toggle = (name) => setOpenMenu((m) => (m === name ? null : name));
    const go = (path) => {
        setOpenMenu(null);
        navigate(path);
    };
    const markAllRead = () => setNotifications((list) => list.map((n) => ({ ...n, unread: false })));
    const markRead = (id) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));

    const handleLogout = async () => {
        setOpenMenu(null);
        try {
            await authAPI.signout();
        } catch {
            // ignore signout errors; still clear local auth state
        }
        removeToken();
        try {
            localStorage.removeItem("role");
        } catch {
            // ignore
        }
        navigate("/signin");
    };

    const panel = (isOpen) =>
        `absolute right-0 mt-2 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl transition duration-150 motion-reduce:transition-none ${isOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`;

    return (
        // On mobile the sidebar's fixed top bar (h-14) sits above this, so we stick just below it
        <nav className="sticky top-14 z-40 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 md:top-0 lg:px-8">
            {/* Logo (hidden on mobile: the sidebar top bar already shows it) */}
            <button
                type="button"
                onClick={() => navigate("/dashboard")}
                aria-label="RouteShare home"
                className={`hidden items-center gap-2.5 rounded-lg md:flex ${focusRing}`}
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
                    <Truck className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="text-left">
                    <span className="block text-xl font-extrabold leading-none tracking-tight text-blue-700">
                        Route<span className="text-emerald-500">Share</span>
                    </span>
                    <span className="mt-1 block text-[10px] leading-none text-slate-400">Move Together. Go Further.</span>
                </span>
            </button>

            {/* Right section */}
            <div ref={containerRef} className="ml-auto flex items-center gap-2 sm:gap-3">
                {/* Notifications */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => toggle("notifications")}
                        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
                        aria-haspopup="true"
                        aria-expanded={openMenu === "notifications"}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700 ${focusRing}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <div className={`${panel(openMenu === "notifications")} -right-14 w-[calc(100vw-2rem)] max-w-sm sm:right-0`}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <h2 className="text-sm font-bold text-blue-950">Notifications</h2>
                            {unreadCount > 0 && (
                                <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800">
                                    <Check className="h-3.5 w-3.5" /> Mark all as read
                                </button>
                            )}
                        </div>
                        <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                            {notifications.map((n) => (
                                <li key={n.id}>
                                    <button
                                        type="button"
                                        onClick={() => markRead(n.id)}
                                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${n.unread ? "bg-blue-50/40" : ""}`}
                                    >
                                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-blue-600" : "bg-transparent"}`} aria-hidden="true" />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold text-slate-900">{n.title}</span>
                                            <span className="block text-sm text-slate-600">{n.text}</span>
                                            <span className="mt-0.5 block text-xs text-slate-400">{n.time}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                            {notifications.length === 0 && (
                                <li className="px-4 py-8 text-center text-sm text-slate-500">You're all caught up.</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => toggle("profile")}
                        aria-label={`Account menu for ${userName}`}
                        aria-haspopup="menu"
                        aria-expanded={openMenu === "profile"}
                        className={`flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-slate-100 ${focusRing}`}
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                            {initials}
                        </span>
                        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 motion-reduce:transition-none ${openMenu === "profile" ? "rotate-180" : ""}`} />
                    </button>

                    <div role="menu" aria-label="Account" className={`${panel(openMenu === "profile")} w-52`}>
                        <div className="py-1.5">
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => go("/profile")}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                <User className="h-4 w-4 text-slate-500" /> My Profile
                            </button>
                        </div>

                        <div className="border-t border-slate-100 py-1.5">
                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default DashboardNavbar;