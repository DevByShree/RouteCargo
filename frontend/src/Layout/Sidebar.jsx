import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    House,
    FilePlus2,
    Truck,
    CalendarDays,
    CircleDot,
    CreditCard,
    MapPin,
    // Bell,
    UserRound,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(true);

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: House,
        },
        {
            name: "Create Shipment",
            path: "/create-shipment",
            icon: FilePlus2,
        },
        {
            name: "Find Trucks",
            path: "/Find",
            icon: Truck,
        },
        {
            name: "My Bookings",
            path: "/Booking",
            icon: CalendarDays,
        },
        {
            name: "Tracking",
            path: "/track",
            icon: CircleDot,
        },
        {
            name: "Payments",
            path: "/payment",
            icon: CreditCard,
        },
        {
            name: "Saved Addresses",
            path: "/Address",
            icon: MapPin,
        },
        // {
        //     name: "Notifications",
        //     path: "/notifications",
        //     icon: Bell,
        //     badge: 3,
        // },
        {
            name: "Profile",
            path: "/profile",
            icon: UserRound,
        },
    ];
    return (
        <div
            className={`
                min-h-screen
                bg-[#F8FAFE]
                border-r border-gray-200
                transition-all duration-300
                ${isOpen ? "w-[260px]" : "w-[70px]"}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4">
                {isOpen && (
                    <span className="font-bold text-xl text-blue-600 px-2">
                        RouteShare
                    </span>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="
                        w-9 h-9
                        rounded-lg
                        hover:bg-gray-100
                        flex items-center justify-center
                        text-gray-600
                    "
                >
                    {isOpen ? (
                        <ChevronLeft size={20} />
                    ) : (
                        <ChevronRight size={20} />
                    )}
                </button>
            </div>
            {/* Menu */}
            <div className="pt-6">

                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`
                                mx-3 mb-1
                                px-4 py-3
                                rounded-lg
                                cursor-pointer
                                transition
                                flex items-center
                                ${isOpen ? "gap-4" : "justify-center"}
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
                            {isOpen && (
                                <span className="text-[15px]">
                                    {item.name}
                                </span>
                            )}
                            {/* Notification Badge */}
                            {isOpen && item.badge && (
                                <span
                                    className="ml-autow-5 h-5flex items-center justify-centerrounded-full bg-red-500 text-whitetext-xs font-semibold ">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    );
                })}

            </div>

        </div>
    );
}

export default Sidebar;