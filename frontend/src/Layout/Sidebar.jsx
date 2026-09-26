function Sidebar() {

    const menuItems = [
        "Dashboard",
        "Create Shipment",
        "Find Trucks",
        "My Bookings",
        "Tracking",
        "Payments",
        "Saved Addresses",
        "Notifications",
        "Profile",
    ];

    return (
        <div className="w-[260px] min-h-screen bg-white border-r border-gray-200">

            <div className="pt-5">

                {menuItems.map((item) => (
                    <div
                        key={item}
                        className={`mx-3 mb-1 px-4 py-3 rounded-lg cursor-pointer transition
                            ${item === "Dashboard"
                                ? "bg-blue-50 text-blue-600 font-semibold"
                                : "text-gray-600 hover:bg-gray-50"
                            }
                        `}
                    >
                        {item}
                    </div>
                ))}

            </div>

        </div>
    );
}

export default Sidebar;