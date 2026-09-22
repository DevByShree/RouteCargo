import Navbar from "../Layout/Navbar"
import heroBg from "../assets/hero.png";
import map from "../assets/map.png"
import { FaUserCheck, FaShieldAlt, FaChartLine, FaUsers, FaCube } from "react-icons/fa";

function LandingPage() {
    return (
        <div>
            <div
                className="relative min-h-[600px] bg-cover bg-center"
                style={{ backgroundImage: `url(${heroBg})` }}>
                {/* Hero content */}
                <div>
                    <Navbar />
                </div>
                <div className="py-8 px-6 sm:px-10 flex flex-col items-start gap-2">
                    <span className="text-xs sm:text-small border border-gray-400 rounded-xl font-semibold bg-green-100 px-5 py-0.5">
                        Smarter Logistics. Greener Tomorrow. 🌱
                    </span>
                    <span className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Ship Smarter.</span>
                    <span className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-blue-700">
                        Fill Empty Truck Space.
                    </span>
                    <span className="max-w-xl text-base sm:text-lg">
                        Find available truck capacity on routes that are already traveled and pay only for the space you need.
                    </span>

                    <div className="py-4 flex flex-col sm:flex-row gap-4 sm:gap-[30px] w-full sm:w-auto">
                        <span className="text-center text-white bg-blue-700 border border-gray-500 rounded-xl px-5 py-3 sm:py-4">
                            Find Transport ⟶
                        </span>
                        <span className="text-center text-blue-600 font-bold border border-blue-500 px-5 py-3 sm:py-4 rounded-xl">
                            Become a Driver
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-2 border border-white/30 rounded-xl px-4 sm:px-5 py-2 bg-white/20 backdrop-blur-sm text-sm sm:text-base">
                            <FaUserCheck className="text-blue-700 text-xl sm:text-3xl" /> Verified Users
                        </span>
                        <span className="flex items-center gap-2 border border-white/30 rounded-xl px-4 sm:px-5 py-2 bg-white/20 backdrop-blur-sm text-sm sm:text-base">
                            <FaShieldAlt className="text-blue-700 text-xl sm:text-3xl" /> Secure Payments
                        </span>
                        <span className="flex items-center gap-2 border border-white/30 rounded-xl px-4 sm:px-5 py-2 bg-white/20 backdrop-blur-sm text-sm sm:text-base">
                            <FaChartLine className="text-blue-700 text-xl sm:text-3xl" /> Lower Costs
                        </span>
                        <span className="flex items-center gap-2 border border-white/30 rounded-xl px-4 sm:px-5 py-2 bg-white/20 backdrop-blur-sm text-sm sm:text-base">
                            <FaUsers className="text-blue-700 text-xl sm:text-3xl" /> Trusted by Business
                        </span>
                    </div>
                </div>

                {/* Route card - hidden on small screens, shown from md up */}
                <div className="hidden md:block absolute top-30 right-6 lg:right-10 bg-white rounded-xl shadow-lg px-4 py-3 w-56 lg:w-65">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">Pune ➝ Mumbai</span>
                        <span className="text-xs text-gray-500">Mon, 22 Sep 2026</span>
                    </div>
                    <img
                        src={map}
                        alt="Pune to Mumbai route"
                        className="w-full h-32 object-cover rounded-lg mt-2"
                    />
                </div>
            </div>

            {/* Stats bar */}
            <div className="relative z-10 mx-4 sm:mx-10 -mt-10 sm:-mt-12 grid grid-cols-2 md:flex md:items-center md:justify-between gap-4 md:gap-0 bg-white rounded-xl px-4 sm:px-3 py-4 shadow-md">
                <div className="flex items-center gap-3">
                    <FaUsers className="text-blue-600 text-2xl sm:text-3xl" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg sm:text-xl">10K+</span>
                        <span className="text-xs text-gray-600">Verified Drivers</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <FaCube className="text-blue-600 text-2xl sm:text-3xl" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg sm:text-xl">50K+</span>
                        <span className="text-xs text-gray-600">Shipments Delivered</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <FaChartLine className="text-blue-600 text-2xl sm:text-3xl" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg sm:text-xl">30%</span>
                        <span className="text-xs text-gray-600">Lower Shipping Cost</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-blue-600 text-2xl sm:text-3xl" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg sm:text-xl">100%</span>
                        <span className="text-xs text-gray-600">Secure & Reliable</span>
                    </div>
                </div>
            </div>

            <div className=" pt-5 flex flex-col items-center text-center ">
                <span className="text-2xl font-semibold ">How it Works</span>
                <span >Get your goods delivered in 5 simple steps</span>
            </div>

        </div>
    )
}

export default LandingPage