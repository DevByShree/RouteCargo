import { Search, Bell, ChevronDown } from "lucide-react";

function DashboardNavbar() {
    return (
        <nav className="h-[68px] bg-white border-b w-full  border-gray-200 flex items-center justify-between px-6">

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


            {/* Search */}
            <div className="flex-1 max-w-[430px] mx-10">
                <div className="h-[38px] border border-gray-200 rounded-lg flex items-center px-3 gap-2">
                    <Search size={17} className="text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search shipments, trucks, locations..."
                        className="w-full outline-none text-sm text-gray-600 placeholder:text-gray-400"
                    />
                </div>
            </div>


            {/* Right Section */}
            <div className="flex items-center gap-5">

                {/* Notification */}
                <button className="relative text-gray-600 hover:text-blue-600">
                    <Bell size={19} />

                    <span className="absolute -top-1 -right-1 w-[6px] h-[6px] bg-red-500 rounded-full"></span>
                </button>


                {/* Profile */}
                <div className="flex items-center gap-2 cursor-pointer">

                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                        SJ
                    </div>

                    <div className="leading-tight">
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