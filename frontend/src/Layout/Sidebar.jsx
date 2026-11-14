<<<<<<< HEAD
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    House, FilePlus2, Truck, Package, CalendarDays, CircleDot, CreditCard,
    MapPin, UserRound, ChevronLeft, ChevronRight, Menu, X, LogOut,
} from "lucide-react";
import { authAPI, removeToken } from "../API/api";

const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: House },
    { name: "Create Shipment", path: "/shipment", icon: FilePlus2 },
    { name: "Parcel Details", path: "/parcel", icon: Package },
    { name: "Find Trucks", path: "/Find", icon: Truck },
    { name: "My Bookings", path: "/Booking", icon: CalendarDays },
    { name: "Tracking", path: "/track", icon: CircleDot },
    { name: "Payments", path: "/payment", icon: CreditCard },
    { name: "Saved Addresses", path: "/Address", icon: MapPin },
    { name: "Profile", path: "/profile", icon: UserRound },
    // Optional: add `badge: 3` to any item to show a count
];

const STORAGE_KEY = "sidebar-collapsed";

function readCollapsed() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) return saved === "1";
    } catch {
        // ignore
    }
    // No saved choice: start collapsed on tablet widths
    return typeof window !== "undefined" && window.innerWidth < 1024;
}

function Brand({ collapsed }) {
    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
                <Truck className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className={`truncate text-xl font-bold text-blue-700 ${collapsed ? "md:hidden" : ""}`}>RouteShare</span>
        </div>
    );
}

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(readCollapsed); // desktop: icons only
    const [mobileOpen, setMobileOpen] = useState(false); // mobile: off-canvas drawer
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
        } catch {
            // ignore
        }
    }, [collapsed]);

    // Close the drawer after navigating
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Close on Escape + lock page scroll while the drawer is open
    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [mobileOpen]);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await authAPI.signout();
        } catch {
            // ignore network/auth errors on logout
        }
        removeToken();
        try {
            localStorage.removeItem("role");
        } catch {
            // ignore
        }
        navigate("/");
    };

    // On md+ the label is hidden only when collapsed. On mobile the drawer always shows labels.
    const hideOnCollapsed = collapsed ? "md:hidden" : "";
    const iconBtn =
        "flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

    return (
        <>
            {/* Mobile top bar (hidden on md+) */}
            <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden">
                <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen} className={iconBtn}>
                    <Menu size={22} />
                </button>
                <Brand collapsed={false} />
            </header>

            {/* Mobile overlay */}
            <div
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 md:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />

            {/* Sidebar */}
            <aside
                aria-label="Main navigation"
                className={`fixed inset-y-0 left-0 z-50 flex w-[260px] max-w-[85vw] flex-col overflow-y-auto overflow-x-hidden border-r border-slate-200 bg-white transition-all duration-300
          ${mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
          md:sticky md:top-0 md:h-screen md:max-w-none md:shrink-0 md:translate-x-0 md:shadow-none
          ${collapsed ? "md:w-[76px]" : "md:w-[260px]"}`}
            >
                {/* Header */}
                <div className={`flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-4 ${collapsed ? "md:justify-center md:px-0" : ""}`}>
                    <div className={collapsed ? "md:hidden" : ""}>
                        <Brand collapsed={false} />
                    </div>
                    {collapsed && (
                        <span className="hidden h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white md:flex">
                            <Truck className="h-5 w-5" />
                        </span>
                    )}

                    {/* Mobile: close drawer */}
                    <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className={`${iconBtn} md:hidden`}>
                        <X size={20} />
                    </button>

                    {/* Desktop: collapse (the expand button appears below the header when collapsed) */}
                    {!collapsed && (
                        <button
                            type="button"
                            onClick={() => setCollapsed(true)}
                            aria-label="Collapse sidebar"
                            aria-expanded="true"
                            className={`${iconBtn} hidden md:flex`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                </div>

                {/* Expand button when collapsed */}
                {collapsed && (
                    <div className="hidden justify-center pt-3 md:flex">
                        <button type="button" onClick={() => setCollapsed(false)} aria-label="Expand sidebar" className={iconBtn}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* Menu */}
                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    <ul className="space-y-1">
                        {menuItems.map(({ name, path, icon: Icon, badge }) => (
                            <li key={name}>
                                <NavLink
                                    to={path}
                                    title={collapsed ? name : undefined}
                                    className={({ isActive }) =>
                                        `relative flex items-center gap-3.5 rounded-lg px-4 py-3 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    ${collapsed ? "md:justify-center md:gap-0 md:px-0" : ""}
                    ${isActive ? "bg-blue-50 font-semibold text-blue-700" : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && <span className="absolute left-0 top-2 h-[calc(100%-1rem)] w-1 rounded-r-full bg-blue-700" aria-hidden="true" />}
                                            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.9} className="shrink-0" />
                                            <span className={`whitespace-nowrap ${hideOnCollapsed}`}>{name}</span>
                                            {badge && (
                                                <span className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white ${hideOnCollapsed}`}>
                                                    {badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="mt-auto shrink-0 border-t border-slate-200 p-3">
                    <button
                        type="button"
                        title={collapsed ? "Logout" : undefined}
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className={`flex w-full items-center gap-3.5 rounded-lg px-4 py-3 text-left text-[15px] font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-wait disabled:opacity-60
              ${collapsed ? "md:justify-center md:gap-0 md:px-0" : ""}`}
                    >
                        <LogOut size={22} strokeWidth={1.9} className="shrink-0" />
                        <span className={`whitespace-nowrap ${hideOnCollapsed}`}>{loggingOut ? "Logging out..." : "Logout"}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
=======
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { House, FilePlus2, Truck, Package, CalendarDays, CircleDot, CreditCard, MapPin, UserRound, ChevronLeft, ChevronRight, Menu, X, PlusSquare, ListChecks, User, LogOut, } from "lucide-react";
import { authAPI, removeToken } from "../API/api";

const userMenuItems = [
    { name: "Dashboard", path: "/user", icon: House },
    { name: "Create Shipment", path: "/user/shipment", icon: FilePlus2 },
    { name: "Parcel Details", path: "/user/parcel", icon: Package },
    { name: "Find Trucks", path: "/user/Find", icon: Truck },
    { name: "My Bookings", path: "/user/Booking", icon: CalendarDays },
    { name: "Tracking", path: "/user/track", icon: CircleDot },
    { name: "Payments", path: "/user/payment", icon: CreditCard },
    { name: "Saved Addresses", path: "/user/Address", icon: MapPin },
    { name: "Profile", path: "/user/profile", icon: UserRound },
];

const driverMenuItems = [
    { name: "Dashboard", path: "/driver", icon: House, },
    { name: "Raise Request", path: "/driver/raise-request", icon: PlusSquare, },
    { name: "My Requests", path: "/driver/my-requests", icon: ListChecks, },
    { name: "Vehicles", path: "/driver/vehicles", icon: Truck, },
    { name: "Profile", path: "/driver/profile", icon: User, },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const role = localStorage.getItem("role")?.toLowerCase();

    const menuItems =
        role === "driver" ? driverMenuItems : userMenuItems;

    // Desktop: collapsed to icons only (starts collapsed on tablet widths)
    const [collapsed, setCollapsed] = useState(
        () => typeof window !== "undefined" && window.innerWidth < 1024
    );
    // Mobile: off-canvas drawer
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close the drawer after navigating
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Close on Escape + lock page scroll while the drawer is open
    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [mobileOpen]);

    const handleLogout = async () => {
        try {
            await authAPI.signout();
        } catch {
            // ignore network/auth errors on logout
        }
        removeToken();
        try {
            localStorage.removeItem("role");
        } catch {
            // ignore
        }
        navigate("/");
    };

    // On md+ screens the label is hidden only when collapsed.
    // On mobile the drawer always shows labels.
    const hideOnCollapsed = collapsed ? "md:hidden" : "";

    return (
        <>
            <header className=" md:hidden fixed top-0 inset-x-0 z-30 h-14 px-4 flex items-center gap-3 bg-[#F8FAFE] border-b border-gray-200 " >
                <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className=" w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 " >
                    <Menu size={22} />
                </button>
                <span className="font-bold text-xl text-blue-600">
                    RouteShare
                </span>
            </header>

            <div onClick={() => setMobileOpen(false)} aria-hidden="true" className={` md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"} `} />

            <aside className={` fixed inset-y-0 left-0 z-50 w-65 max-w-[85vw] flex flex-col overflow-y-auto overflow-x-hidden bg-[#F8FAFE] border-r border-gray-200 transition-all duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0 md:max-w-none ${collapsed ? "md:w-17.5" : "md:w-65"} `} >
                <div className={` flex items-center justify-between px-4 pt-4 ${collapsed ? "md:justify-center md:px-0" : ""} `} >
                    <span className={`font-bold text-xl text-blue-600 px-2 ${hideOnCollapsed}`} >
                        RouteShare
                    </span>

                    <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className=" md:hidden w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 " >
                        <X size={20} />
                    </button>

                    <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className=" hidden md:flex w-9 h-9 rounded-lg hover:bg-gray-100 items-center justify-center text-gray-600 " > {collapsed ? (<ChevronRight size={20} />) : (<ChevronLeft size={20} />)}
                    </button>
                </div>

                {/* Menu */}
                <nav className="pt-6 pb-4 px-3 flex-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <button key={item.name} type="button" title={collapsed ? item.name : undefined} onClick={() => navigate(item.path)} className={` w-full mb-1 px-4 py-3 rounded-lg cursor-pointer transition flex items-center gap-4 text-left ${collapsed ? "md:justify-center md:gap-0" : ""} ${isActive ? "bg-[#E8F1FF] text-blue-600 font-semibold" : "text-[#263D70] hover:bg-gray-100"} `} >
                                <Icon size={22} strokeWidth={2} className="shrink-0" />
                                <span className={`text-[15px] whitespace-nowrap ${hideOnCollapsed}`} >
                                    {item.name}
                                </span>

                                {item.badge && (
                                    <span className={` ml-auto w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold ${hideOnCollapsed} `} >
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto p-3 border-t border-gray-200">
                    <button type="button" title={collapsed ? "Logout" : undefined} onClick={handleLogout} className={` w-full px-4 py-3 rounded-lg cursor-pointer transition flex items-center gap-4 text-left text-gray-800 hover:text-black hover:bg-gray-200/80 ${collapsed ? "md:justify-center md:gap-0" : ""} `} >
                        <LogOut size={22} strokeWidth={2} className="shrink-0 text-gray-700" />
                        <span className={`text-[15px] font-medium whitespace-nowrap ${hideOnCollapsed}`} >
                            Logout
                        </span>
                    </button>
                </div>

            </aside>
        </>
    );
}

export default Sidebar;
>>>>>>> 70b053697d292abc5ba02ed2984539de8b4cb543
