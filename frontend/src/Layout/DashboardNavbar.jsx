import { Bell, ChevronDown } from "lucide-react";

function DashboardNavbar() {
    return (
        <nav className="h-[68px] sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-6">

            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="text-2xl">
                    🚚
                </div>

                <div>
                    <h1 className="text-xl font-bold text-blue-700 leading-none">
                        Route<span className="text-green-500">Share</span>
                    </h1>

                    <p className="text-[7px] text-gray-400 mt-1">
                        Move Together. Go Further.
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 sm:gap-5">

                {/* Notification */}
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <Bell size={19} />
                    <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] bg-red-500 rounded-full"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                        SJ
                    </div>

                    <div className="hidden sm:block leading-tight">
                        <p className="text-xs font-semibold text-gray-800">
                            Shree Joshi
                        </p>

                        <p className="text-[10px] text-gray-400">
                            Customer
                        </p>
                    </div>

                    <ChevronDown size={15} className="text-gray-500" />
                </div>

            </div>

        </nav>
    );
}

export default DashboardNavbar;
