import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    House,
    FilePlus2,
    Truck,
    Package,
    CalendarDays,
    CircleDot,
    CreditCard,
    MapPin,
    // Bell,
    UserRound,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    LogOut,
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
    // { name: "Notifications", path: "/notifications", icon: Bell, badge: 3 },
    { name: "Profile", path: "/profile", icon: UserRound },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

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
            {/* Mobile top bar (hidden on md+) */}
            <header
                className="
                    md:hidden
                    fixed top-0 inset-x-0 z-30
                    h-14 px-4
                    flex items-center gap-3
                    bg-[#F8FAFE]
                    border-b border-gray-200
                "
            >
                <button
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                    className="
                        w-9 h-9 rounded-lg
                        hover:bg-gray-100
                        flex items-center justify-center
                        text-gray-600
                    "
                >
                    <Menu size={22} />
                </button>
                <span className="font-bold text-xl text-blue-600">
                    RouteShare
                </span>
            </header>

            {/* Mobile overlay */}
            <div
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
                className={`
                    md:hidden
                    fixed inset-0 z-40
                    bg-black/40
                    transition-opacity duration-300
                    ${mobileOpen
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }
                `}
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    w-[260px] max-w-[85vw]
                    flex flex-col
                    overflow-y-auto overflow-x-hidden
                    bg-[#F8FAFE]
                    border-r border-gray-200
                    transition-all duration-300
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:sticky md:top-0 md:h-screen md:shrink-0
                    md:translate-x-0 md:max-w-none
                    ${collapsed ? "md:w-[70px]" : "md:w-[260px]"}
                `}
            >
                {/* Header */}
                <div
                    className={`
                        flex items-center justify-between px-4 pt-4
                        ${collapsed ? "md:justify-center md:px-0" : ""}
                    `}
                >
                    <span
                        className={`font-bold text-xl text-blue-600 px-2 ${hideOnCollapsed}`}
                    >
                        RouteShare
                    </span>

                    {/* Mobile: close drawer */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                        className="
                            md:hidden
                            w-9 h-9 rounded-lg
                            hover:bg-gray-100
                            flex items-center justify-center
                            text-gray-600
                        "
                    >
                        <X size={20} />
                    </button>

                    {/* Desktop: collapse / expand */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={
                            collapsed ? "Expand sidebar" : "Collapse sidebar"
                        }
                        className="
                            hidden md:flex
                            w-9 h-9 rounded-lg
                            hover:bg-gray-100
                            items-center justify-center
                            text-gray-600
                        "
                    >
                        {collapsed ? (
                            <ChevronRight size={20} />
                        ) : (
                            <ChevronLeft size={20} />
                        )}
                    </button>
                </div>

                {/* Menu */}
                <nav className="pt-6 pb-4 px-3 flex-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.name}
                                type="button"
                                title={collapsed ? item.name : undefined}
                                onClick={() => navigate(item.path)}
                                className={`
                                    w-full mb-1
                                    px-4 py-3
                                    rounded-lg
                                    cursor-pointer
                                    transition
                                    flex items-center gap-4
                                    text-left
                                    ${collapsed ? "md:justify-center md:gap-0" : ""}
                                    ${isActive
                                        ? "bg-[#E8F1FF] text-blue-600 font-semibold"
                                        : "text-[#263D70] hover:bg-gray-100"
                                    }
                                `}
                            >
                                <Icon
                                    size={22}
                                    strokeWidth={2}
                                    className="shrink-0"
                                />
                                <span
                                    className={`text-[15px] whitespace-nowrap ${hideOnCollapsed}`}
                                >
                                    {item.name}
                                </span>

                                {/* Notification Badge */}
                                {item.badge && (
                                    <span
                                        className={`
                                            ml-auto w-5 h-5
                                            flex items-center justify-center
                                            rounded-full
                                            bg-red-500 text-white
                                            text-xs font-semibold
                                            ${hideOnCollapsed}
                                        `}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Section - Single Logout Button */}
                <div className="mt-auto p-3 border-t border-gray-200">
                    <button
                        type="button"
                        title={collapsed ? "Logout" : undefined}
                        onClick={handleLogout}
                        className={`
                            w-full
                            px-4 py-3
                            rounded-lg
                            cursor-pointer
                            transition
                            flex items-center gap-4
                            text-left
                            text-gray-800 hover:text-black hover:bg-gray-200/80
                            ${collapsed ? "md:justify-center md:gap-0" : ""}
                        `}
                    >
                        <LogOut
                            size={22}
                            strokeWidth={2}
                            className="shrink-0 text-gray-700"
                        />
                        <span
                            className={`text-[15px] font-medium whitespace-nowrap ${hideOnCollapsed}`}
                        >
                            Logout
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
