import Navbar from "../Layout/Navbar"
import heroBg from "../assets/hero.png";
import map from "../assets/map.png"
import First from "./components/First";
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import { FaUserCheck, FaShieldAlt, FaChartLine, FaUsers, FaCube, FaClipboardList, FaSearch, FaBox, FaCalendarCheck, FaMapMarkerAlt, FaCheckCircle, } from "react-icons/fa";

const steps = [
    {
        icon: FaClipboardList,
        title: "Enter parcel details",
        text: "Tell us what you want to ship and where.",
    },
    {
        icon: FaSearch,
        title: "Find matching trucks",
        text: "Get trucks already travelling on your route.",
    },
    {
        icon: FaBox,
        title: "Choose capacity",
        text: "Book only the space you need.",
    },
    {
        icon: FaCalendarCheck,
        title: "Send booking request",
        text: "Driver accepts and confirms.",
    },
    {
        icon: FaMapMarkerAlt,
        title: "Track delivery",
        text: "Track in real time and get proof of delivery.",
    },
];

const stats = [
    { icon: FaUsers, value: "10K+", label: "Verified Drivers" },
    { icon: FaCube, value: "50K+", label: "Shipments Delivered" },
    { icon: FaChartLine, value: "30%", label: "Lower Shipping Cost" },
    { icon: FaShieldAlt, value: "100%", label: "Secure & Reliable" },
];

const shipperPoints = [
    "Wide network of verified drivers",
    "Pay only for the space you need",
    "Real-time tracking",
    "Secure payments",
    "Dedicated support",
];

const driverPoints = [
    "Add your existing trips",
    "Fill unused capacity",
    "Increase your earnings",
    "Flexible and easy to use",
    "Be part of a greener future",
];

function LandingPage() {
    return (
        <div className="">
            {/* Hero */}
            <div
                className="relative min-h-[560px] sm:min-h-[600px] bg-cover bg-center bg-gray-900"
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                {/* Dark overlay so text stays readable over the photo */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />

                <div className="relative">
                    <Navbar />
                </div>

                <div className="relative py-8 px-6 sm:px-10 flex flex-col items-start gap-3 max-w-3xl">
                    <span className="text-xs sm:text-sm border border-gray-300 rounded-xl font-semibold bg-green-100 text-green-900 px-4 sm:px-5 py-1">
                        Smarter Logistics. Greener Tomorrow. 🌱
                    </span>

                    <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight text-white">
                        Ship Smarter.
                        <br />
                        <span className="text-blue-400">Fill Empty Truck Space.</span>
                    </h1>

                    <p className="max-w-xl text-base sm:text-lg text-gray-100">
                        Find available truck capacity on routes that are already
                        travelled and pay only for the space you need.
                    </p>

                    <div className="py-2 flex flex-col sm:flex-row gap-3 sm:gap-6 w-full sm:w-auto">
                        <button
                            type="button"
                            className="text-center text-white bg-blue-700 hover:bg-blue-800 transition-colors rounded-xl px-5 py-3 sm:py-4 font-semibold"
                        >
                            Find Transport ⟶
                        </button>
                        <button
                            type="button"
                            className="text-center text-blue-700 font-bold bg-white/90 hover:bg-white transition-colors border border-blue-500 px-5 py-3 sm:py-4 rounded-xl"
                        >
                            Become a Driver
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {[
                            { icon: FaUserCheck, label: "Verified Users" },
                            { icon: FaShieldAlt, label: "Secure Payments" },
                            { icon: FaChartLine, label: "Lower Costs" },
                            { icon: FaUsers, label: "Trusted by Business" },
                        ].map(({ icon: Icon, label }) => (
                            <span
                                key={label}
                                className="flex items-center gap-2 border border-white/30 rounded-xl px-4 sm:px-5 py-2 bg-white/20 backdrop-blur-sm text-sm sm:text-base text-white"
                            >
                                <Icon className="text-blue-300 text-lg sm:text-2xl shrink-0" />
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Route card - only shown from md up so it doesn't collide with hero text on mobile */}
                <div className="hidden md:block absolute top-24 lg:top-28 right-6 lg:right-10 bg-white rounded-xl shadow-lg px-4 py-3 w-56 lg:w-64">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">Pune ➝ Mumbai</span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                            Mon, 22 Sep 2026
                        </span>
                    </div>
                    <img
                        src={map}
                        alt="Map of the Pune to Mumbai route"
                        className="w-full h-32 object-cover rounded-lg mt-2"
                    />
                </div>
            </div>

            {/* Stats bar */}
            <div className="relative z-10 mx-4 sm:mx-10 -mt-10 sm:-mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 bg-white rounded-xl px-4 sm:px-6 py-4 shadow-md">
                {stats.map(({ icon: Icon, value, label }) => (
                    <div key={label} className="flex items-center gap-3">
                        <Icon className="text-blue-600 text-2xl sm:text-3xl shrink-0" />
                        <div className="flex flex-col">
                            <span className="font-bold text-lg sm:text-xl">{value}</span>
                            <span className="text-xs text-gray-600">{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* How it works */}
            <div className="pt-10 px-6 flex flex-col items-center text-center">
                <h2 className="text-2xl font-semibold">How it Works</h2>
                <p className="text-lg font-light text-gray-600 mt-1">
                    Get your goods delivered in 5 simple steps
                </p>
            </div>

            <div className="mt-10 px-6 sm:px-10 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10">
                {steps.map(({ icon: Icon, title, text }, i) => (
                    <div key={title} className="relative flex flex-col items-center text-center px-2">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                                <Icon className="text-blue-600 text-2xl" />
                            </div>
                            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                {i + 1}
                            </span>
                        </div>

                        <h3 className="font-bold text-lg mt-3">{title}</h3>
                        <p className="mt-2 text-base font-light text-gray-600">{text}</p>
                    </div>
                ))}
            </div>

            {/* Shippers / Drivers */}
            <div className="flex flex-col md:flex-row gap-6 mt-20 px-6 sm:px-10">
                {/* Shippers */}
                <div
                    className="relative w-full md:w-1/2 min-h-[460px] md:min-h-[420px] bg-cover bg-center rounded-xl overflow-hidden"
                    style={{ backgroundImage: `url(${img1})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end gap-3 px-6 py-8 ">
                        <span className="font-bold text-blue-700 bg-blue-100 rounded-2xl px-5 py-2 w-fit">
                            For Shippers
                        </span>

                        <h3 className="font-bold text-2xl sm:text-3xl text-white ">
                            Lower Costs. Faster Deliveries.
                        </h3>

                        <p className="font-light text-base sm:text-lg text-gray-100">
                            Find reliable trucks, book partial capacity and ship your goods
                            at lower costs with real-time tracking.
                        </p>

                        <div className="flex flex-col gap-2 mt-2">
                            {shipperPoints.map((point) => (
                                <div key={point} className="flex items-center gap-2">
                                    <FaCheckCircle className="text-blue-400 text-xl shrink-0" />
                                    <span className="text-white text-sm sm:text-base">{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Drivers */}
                <div
                    className="relative w-full md:w-1/2 min-h-[460px] md:min-h-[420px] bg-cover bg-center rounded-xl overflow-hidden"
                    style={{ backgroundImage: `url(${img2})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="relative h-full flex flex-col justify-end gap-3 px-6 py-8">
                        <span className="font-bold text-green-700 bg-green-100 rounded-2xl px-5 py-2 w-fit">
                            For Drivers
                        </span>

                        <h3 className="font-bold text-2xl sm:text-3xl text-white">
                            Already Going There? Carry More. Earn More.
                        </h3>

                        <p className="font-light text-base sm:text-lg text-gray-100">
                            Monetize your empty truck space by adding your existing trips
                            and accept multiple customers on the same route.
                        </p>

                        <div className="flex flex-col gap-2 mt-2">
                            {driverPoints.map((point) => (
                                <div key={point} className="flex items-center gap-2">
                                    <FaCheckCircle className="text-green-400 text-xl shrink-0" />
                                    <span className="text-white text-sm sm:text-base">{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <First />

            </div>
        </div>
    )
}

export default LandingPage