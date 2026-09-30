import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(true);

    const menuItems = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Create Shipment", path: "/create-shipment" },
        { name: "Find Trucks", path: "/Find" },
        { name: "My Bookings", path: "/Booking" },
        { name: "Tracking", path: "/track" },
        { name: "Payments", path: "/payments" },
        { name: "Saved Addresses", path: "/Address" },
        { name: "Notifications", path: "/notifications" },
        { name: "Profile", path: "/profile" },
    ];

    return (
        <div
            className={`
                min-h-screen bg-white border-r border-gray-200
                transition-all duration-300
                ${isOpen ? "w-[260px]" : "w-[70px]"}
            `}
        >

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4">

                {/* Logo / Name */}
                {isOpen && (
                    <span className="font-bold text-xl text-blue-600">
                        RouteShare
                    </span>
                )}

                {/* Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600"
                >
                    {isOpen ? "←" : "→"}
                </button>

            </div>


            {/* Menu */}
            <div className="pt-5">

                {menuItems.map((item) => {

                    const isActive = location.pathname === item.path;

                    return (
                        <div
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`
                                mx-3 mb-1 px-4 py-3 rounded-lg
                                cursor-pointer transition
                                ${isActive
                                    ? "bg-blue-50 text-blue-600 font-semibold"
                                    : "text-gray-600 hover:bg-gray-50"
                                }
                            `}
                        >

                            {isOpen ? (
                                <span>{item.name}</span>
                            ) : (
                                <span className="text-center block">
                                    {item.name.charAt(0)}
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