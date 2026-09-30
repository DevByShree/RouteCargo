import Navbar from "../Layout/Navbar";
import heroBg from "../assets/hero.png";
import map from "../assets/map.png";
import First from "./components/First";
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import {
    FaUserCheck,
    FaShieldAlt,
    FaChartLine,
    FaUsers,
    FaCube,
    FaClipboardList,
    FaSearch,
    FaBox,
    FaCalendarCheck,
    FaMapMarkerAlt,
    FaCheckCircle,
    FaLeaf,
    FaArrowRight,
} from "react-icons/fa";

const steps = [
    { icon: FaClipboardList, title: "Enter parcel details", text: "Tell us what you want to ship and where." },
    { icon: FaSearch, title: "Find matching trucks", text: "Get trucks already travelling on your route." },
    { icon: FaBox, title: "Choose capacity", text: "Book only the space you need." },
    { icon: FaCalendarCheck, title: "Send booking request", text: "Driver accepts and confirms." },
    { icon: FaMapMarkerAlt, title: "Track delivery", text: "Track in real time and get proof of delivery." },
];

const stats = [
    { icon: FaUsers, value: "10K+", label: "Verified Drivers" },
    { icon: FaCube, value: "50K+", label: "Shipments Delivered" },
    { icon: FaChartLine, value: "30%", label: "Lower Shipping Cost" },
    { icon: FaShieldAlt, value: "100%", label: "Secure & Reliable" },
];

const trustBadges = [
    { icon: FaUserCheck, label: "Verified Users" },
    { icon: FaShieldAlt, label: "Secure Payments" },
    { icon: FaChartLine, label: "Lower Costs" },
    { icon: FaUsers, label: "Trusted by Business" },
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

const audiences = [
    {
        tag: "For Shippers",
        tagClass: "text-blue-700 bg-blue-100",
        checkClass: "text-blue-400",
        image: img1,
        title: "Lower Costs. Faster Deliveries.",
        text: "Find reliable trucks, book partial capacity and ship your goods at lower costs with real-time tracking.",
        points: shipperPoints,
        cta: "Find Transport",
        ctaClass: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
        tag: "For Drivers",
        tagClass: "text-green-700 bg-green-100",
        checkClass: "text-green-400",
        image: img2,
        title: "Already Going There? Carry More. Earn More.",
        text: "Monetize your empty truck space by adding your existing trips and accept multiple customers on the same route.",
        points: driverPoints,
        cta: "Become a Driver",
        ctaClass: "bg-green-600 hover:bg-green-700 text-white",
    },
];

const focusRing =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400";

function LandingPage() {
    return (
        <div className="bg-white">
            {/* Hero */}
            <header
                className="relative bg-cover bg-center bg-gray-900"
                style={{ backgroundImage: `url(${heroBg})` }}
            >
                {/* Overlay: darker on the left where text sits, lighter on the right */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

                <div className="relative">
                    <Navbar />
                </div>

                <div className="relative px-6 sm:px-10 pt-10 pb-24 sm:pb-28 flex flex-col items-start gap-5 max-w-3xl">
                    <span className="inline-flex items-center gap-2 rounded-full  text-green-500 border border-gray-600 text-xs sm:text-sm font-semibold px-4 py-1.5">
                        <FaLeaf aria-hidden="true" />
                        Smarter Logistics. Greener Tomorrow.
                    </span>

                    <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white">
                        Ship Smarter.
                        <br />
                        <span className="text-blue-600">Fill Empty Truck Space.</span>
                    </h1>

                    <p className="max-w-xl text-base sm:text-lg text-gray-100">
                        Find available truck capacity on routes that are already travelled and
                        pay only for the space you need.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                        <button
                            type="button"
                            className={`inline-flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-xl px-6 py-3.5 font-semibold ${focusRing}`}
                        >
                            Find Transport
                            <FaArrowRight aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className={`text-center text-white font-semibold bg-white/5 hover:bg-white/20 backdrop-blur-sm border border-white/5 transition-colors px-6 py-3.5 rounded-xl ${focusRing}`}
                        >
                            Become a Driver
                        </button>
                    </div>

                    <ul className="flex flex-wrap gap-3 mt-2">
                        {trustBadges.map(({ icon: Icon, label }) => (
                            <li
                                key={label}
                                className="flex items-center gap-2 border border-white/5 rounded-xl px-4 py-2 bg-white/5 backdrop-blur-sm text-sm text-white"
                            >
                                <Icon aria-hidden="true" className="text-blue-300 text-lg shrink-0" />
                                {label}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Route card - md and up only, so it never collides with hero text on mobile */}
                <div className="hidden md:block absolute top-28 right-6 lg:right-10 bg-white rounded-xl shadow-xl p-4 w-60 lg:w-72">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm flex items-center gap-1.5">
                            Pune <FaArrowRight className="text-gray-400 text-xs" aria-hidden="true" /> Mumbai
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">Mon, 22 Sep 2026</span>
                    </div>
                    <img
                        src={map}
                        alt="Map of the Pune to Mumbai route"
                        className="w-full h-32 object-cover rounded-lg mt-3"
                    />
                </div>
            </header>

            <main>
                {/* Stats bar */}
                <section
                    aria-label="RouteShare in numbers"
                    className="relative z-10 mx-4 sm:mx-10 -mt-12 grid grid-cols-2 md:grid-cols-4 gap-y-5 bg-white rounded-xl px-4 sm:px-6 py-5 shadow-lg md:divide-x"
                >
                    {stats.map(({ icon: Icon, value, label }) => (
                        <div key={label} className="flex items-center gap-3 md:justify-center md:px-4">
                            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Icon aria-hidden="true" className="text-blue-600 text-xl" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg sm:text-xl text-slate-900">{value}</span>
                                <span className="text-xs sm:text-sm text-gray-600">{label}</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* How it works */}
                <section id="how-it-works" className="pt-16 px-6">
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How it Works</h2>
                        <p className="text-base sm:text-lg text-gray-600 mt-2">
                            Get your goods delivered in 5 simple steps
                        </p>
                    </div>

                    <ol className="mt-12 sm:px-4 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10">
                        {steps.map(({ icon: Icon, title, text }, i) => (
                            <li key={title} className="relative flex flex-col items-center text-center px-2">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Icon aria-hidden="true" className="text-blue-600 text-2xl" />
                                    </div>
                                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                                        {i + 1}
                                    </span>
                                </div>

                                {/* Dashed connector to the next step (large screens only) */}
                                {i < steps.length - 1 && (
                                    <div
                                        aria-hidden="true"
                                        className="hidden lg:block absolute top-7 left-[calc(50%_+_2.25rem)] w-[calc(100%_-_3rem)] border-t-2 border-dashed border-blue-200"
                                    />
                                )}

                                <h3 className="font-bold text-lg mt-4 text-slate-900">{title}</h3>
                                <p className="mt-1 text-base text-gray-600">{text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Shippers / Drivers */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 px-6 sm:px-10">
                    {audiences.map((a) => (
                        <article
                            key={a.tag}
                            className="relative min-h-[480px] bg-cover bg-center rounded-xl overflow-hidden"
                            style={{ backgroundImage: `url(${a.image})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                            <div className="relative h-full min-h-[480px] flex flex-col justify-end gap-3 px-6 py-8">
                                <span className={`font-bold rounded-full px-5 py-1.5 w-fit text-sm ${a.tagClass}`}>
                                    {a.tag}
                                </span>

                                <h3 className="font-bold text-2xl sm:text-3xl text-white">{a.title}</h3>
                                <p className="text-base sm:text-lg text-gray-100">{a.text}</p>

                                <ul className="flex flex-col gap-2 mt-2">
                                    {a.points.map((point) => (
                                        <li key={point} className="flex items-center gap-2">
                                            <FaCheckCircle aria-hidden="true" className={`${a.checkClass} text-xl shrink-0`} />
                                            <span className="text-white text-sm sm:text-base">{point}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    type="button"
                                    className={`mt-3 w-fit inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-colors ${a.ctaClass} ${focusRing}`}
                                >
                                    {a.cta}
                                    <FaArrowRight aria-hidden="true" />
                                </button>
                            </div>
                        </article>
                    ))}
                </section>

                <First />
            </main>
        </div>
    );
}

export default LandingPage;