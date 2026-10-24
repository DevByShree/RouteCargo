import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    PlusSquare,
    ListChecks,
    User,
    ChevronDown,
    Menu,
    X,
    Truck,
    LogOut,
    ArrowLeftRight,
    HelpCircle,
    Check
} from "lucide-react";
import rohitAvatar from "../assets/driver/rohit_avatar.png";

const navItems = [
    {
        name: "Raise Request",
        path: "/driver/raise-request",
        aliasPaths: ["/driver"],
        icon: PlusSquare,
    },
    {
        name: "My Requests",
        path: "/driver/my-requests",
        aliasPaths: ["/driver/requests"],
        icon: ListChecks,
    },
    {
        name: "Profile",
        path: "/driver/profile",
        aliasPaths: [],
        icon: User,
    },
];

function DriverLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false);
        setUserDropdownOpen(false);
    }, [location.pathname]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest("#user-profile-menu")) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Prevent body scroll when mobile drawer is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [mobileOpen]);

    const isPathActive = (item) => {
        if (location.pathname === item.path) return true;
        if (item.aliasPaths && item.aliasPaths.includes(location.pathname)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-[#F4F6F9] flex flex-col md:flex-row text-slate-900 font-sans antialiased">
            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-40 bg-[#121E31] text-white h-16 px-4 flex items-center justify-between border-b border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400">
                            <Truck size={20} />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">RouteCargo</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <img
                        src={rohitAvatar}
                        alt="Rohit Singh"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                </div>
            </header>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
                    aria-hidden="true"
                />
            )}

            {/* Sidebar (Desktop + Mobile Drawer) */}
            <aside
                className={`
                    fixed md:sticky top-0 inset-y-0 left-0 z-50
                    w-64 bg-[#121E31] text-white flex flex-col
                    transition-transform duration-300 ease-in-out
                    border-r border-slate-800/80
                    md:translate-x-0 md:h-screen md:shrink-0
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                {/* Brand / Logo */}
                <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="text-blue-400 flex items-center justify-center">
                            <Truck size={26} className="stroke-[2.3]" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            RouteCargo
                        </span>
                    </div>

                    {/* Mobile close button */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="p-4 flex-1 flex flex-col gap-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = isPathActive(item);
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => navigate(item.path)}
                                className={`
                                    w-full px-4 py-3 rounded-lg text-sm font-medium
                                    flex items-center gap-3.5 transition-all text-left
                                    cursor-pointer
                                    ${active
                                        ? "bg-[#1A73E8] text-white shadow-sm font-semibold"
                                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                                    }
                                `}
                            >
                                <Icon size={20} className={active ? "text-white" : "text-slate-400"} />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer / Switch Role */}
                <div className="p-4 border-t border-slate-800/80">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 transition"
                    >
                        <ArrowLeftRight size={16} />
                        <span>Switch to Customer</span>
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
                {/* Top Desktop Bar */}
                <header className="hidden md:flex h-16 bg-white border-b border-gray-200/90 px-8 items-center justify-end sticky top-0 z-30 shadow-2xs">
                    {/* User Profile dropdown */}
                    <div id="user-profile-menu" className="relative">
                        <button
                            onClick={() => setUserDropdownOpen((prev) => !prev)}
                            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-gray-200 text-left cursor-pointer"
                        >
                            <img
                                src={rohitAvatar}
                                alt="Rohit Singh"
                                className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200 shadow-2xs"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900 leading-tight">
                                    Rohit Singh
                                </span>
                                <span className="text-xs text-slate-400 leading-tight">
                                    Driver
                                </span>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`text-slate-400 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {userDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 text-sm">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="font-medium text-slate-800">Rohit Singh</p>
                                    <p className="text-xs text-slate-400">rohit.singh@gmail.com</p>
                                    <span className="inline-block mt-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        Verified Driver
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        setUserDropdownOpen(false);
                                        navigate("/driver/profile");
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                                >
                                    <User size={16} className="text-slate-400" />
                                    <span>Profile Settings</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setUserDropdownOpen(false);
                                        navigate("/dashboard");
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                                >
                                    <ArrowLeftRight size={16} className="text-slate-400" />
                                    <span>Switch to Customer</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setUserDropdownOpen(false);
                                        alert("Support contact: support@routecargo.in / 1800-123-CARGO");
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                                >
                                    <HelpCircle size={16} className="text-slate-400" />
                                    <span>Help & Support</span>
                                </button>

                                <div className="border-t border-gray-100 my-1"></div>

                                <button
                                    onClick={() => {
                                        setUserDropdownOpen(false);
                                        navigate("/signin");
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                                >
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content Outlet */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DriverLayout;

