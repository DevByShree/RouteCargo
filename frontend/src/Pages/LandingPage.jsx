import Navbar from "../Layout/Navbar";
import heroBg from "../assets/hero.png";
import map from "../assets/map.png";
import First, { Reveal, CountUp } from "./components/First";
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
    { icon: FaUsers, to: 10, suffix: "K+", label: "Verified Drivers" },
    { icon: FaCube, to: 50, suffix: "K+", label: "Shipments Delivered" },
    { icon: FaChartLine, to: 30, suffix: "%", label: "Lower Shipping Cost" },
    { icon: FaShieldAlt, to: 100, suffix: "%", label: "Secure & Reliable" },
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

/* ---------- Truck: load → drive → unload → return (animation only) ---------- */
const TRUCK_CSS = `
@keyframes rc-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)}}
@keyframes rc-road{to{background-position:-32px 0}}
@keyframes rc-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes rc-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}

/* Truck position: wait & load -> drive -> wait & unload -> drive back */
@keyframes rc-trip{
  0%,12%{left:56px}
  44%,58%{left:calc(100% - 110px)}
  90%,100%{left:56px}
}
/* Face right on the way there, face left on the way back */
@keyframes rc-face{
  0%,57.9%{transform:scaleX(1)}
  58%,99%{transform:scaleX(-1)}
  99.1%,100%{transform:scaleX(1)}
}
/* Wheels only turn while the truck is moving */
@keyframes rc-wheelspin{
  0%,12%{transform:rotate(0)}
  44%,58%{transform:rotate(4000deg)}
  90%,100%{transform:rotate(8000deg)}
}
/* Parcel that rides with the truck: lifted in at pickup, slid out at drop-off */
@keyframes rc-cargo{
  0%{opacity:1;transform:translate(-30px,0)}
  3%{opacity:1;transform:translate(-30px,-8px)}
  9%{opacity:1;transform:translate(-4px,-8px)}
  11%,45%{opacity:0;transform:translate(8px,-8px)}
  47%{opacity:1;transform:translate(-4px,-8px)}
  50%{opacity:1;transform:translate(-30px,-8px)}
  54%{opacity:1;transform:translate(-30px,0)}
  55%,95%{opacity:0;transform:translate(-30px,0)}
  100%{opacity:1;transform:translate(-30px,0)}
}
/* Parcel left on the ground at the destination, then collected */
@keyframes rc-ground{
  0%,54%{opacity:0}
  55%,74%{opacity:1}
  80%,100%{opacity:0}
}

.rc-in{animation:rc-in .6s ease both}
.rc-float{animation:rc-float 6s ease-in-out infinite}
.rc-trip{animation:rc-trip 16s ease-in-out infinite}
.rc-face{animation:rc-face 16s linear infinite}
.rc-bob{animation:rc-bob .5s ease-in-out infinite}
.rc-wheel{transform-box:fill-box;transform-origin:center;animation:rc-wheelspin 16s ease-in-out infinite}
.rc-cargo{animation:rc-cargo 16s ease-in-out infinite}
.rc-ground{animation:rc-ground 16s linear infinite}
.rc-box{background:linear-gradient(90deg,transparent 42%,#92400e 42% 58%,transparent 58%),#fbbf24;border:1px solid #b45309}
.rc-road{background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.35) 0 16px,transparent 16px 32px);background-size:32px 2px;background-repeat:repeat-x;background-position:0 100%;animation:rc-road .8s linear infinite}
@media (prefers-reduced-motion:reduce){.rc-trip,.rc-face,.rc-bob,.rc-wheel,.rc-cargo,.rc-ground,.rc-road,.rc-in,.rc-float{animation:none}}`;

function RoadTruck() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-14 h-10 overflow-hidden">
            <div className="rc-road absolute inset-x-0 bottom-0 h-1" />

            {/* Parcel waiting on the ground at the destination (after unloading) */}
            <div
                className="rc-ground rc-box absolute w-4 h-4 rounded-sm"
                style={{ left: "calc(100% - 140px)", bottom: "6px", opacity: 0 }}
            />

            {/* Truck + the parcel that travels with it */}
            <div className="rc-trip absolute bottom-1 w-[72px]" style={{ left: 56 }}>
                <div className="rc-cargo rc-box absolute left-0 bottom-0.5 w-4 h-4 rounded-sm" />
                <div className="rc-face">
                    <svg viewBox="0 0 80 32" className="rc-bob w-[72px]">
                        <rect x="2" y="3" width="46" height="19" rx="2" fill="#fff" />
                        <rect x="2" y="14" width="46" height="3" fill="#2563eb" />
                        <path d="M50 8h14c2 0 3 1 4 2l6 8c1 1 1 2 1 3v3H50z" fill="#2563eb" />
                        <path d="M54 11h9c1 0 2 .5 3 1.5l3 4.5H54z" fill="#dbeafe" />
                        {[14, 34, 62].map((x) => (
                            <g key={x}>
                                <circle cx={x} cy="25" r="5" fill="#111827" />
                                <g className="rc-wheel">
                                    <circle cx={x} cy="25" r="2.4" fill="#9ca3af" />
                                    <line x1={x - 2.4} y1="25" x2={x + 2.4} y2="25" stroke="#4b5563" strokeWidth=".8" />
                                </g>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    );
}

function LandingPage() {
    return (
        <div className="bg-white">
            <style>{TRUCK_CSS}</style>
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
                    <span className="rc-in inline-flex items-center gap-2 rounded-full  text-green-500 border border-gray-600 text-xs sm:text-sm font-semibold px-4 py-1.5">
                        <FaLeaf aria-hidden="true" />
                        Smarter Logistics. Greener Tomorrow.
                    </span>

                    <h1 style={{ animationDelay: ".1s" }} className="rc-in font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white">
                        Ship Smarter.
                        <br />
                        <span className="text-blue-600">Fill Empty Truck Space.</span>
                    </h1>

                    <p style={{ animationDelay: ".2s" }} className="rc-in max-w-xl text-base sm:text-lg text-gray-100">
                        Find available truck capacity on routes that are already travelled and
                        pay only for the space you need.
                    </p>

                    <div style={{ animationDelay: ".3s" }} className="rc-in flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                        <button
                            type="button"
                            className={`group inline-flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 rounded-xl px-6 py-3.5 font-semibold ${focusRing}`}
                        >
                            Find Transport
                            <FaArrowRight aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                        <button
                            type="button"
                            className={`text-center text-white font-semibold bg-white/5 hover:bg-white/20 backdrop-blur-sm border border-white/5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 px-6 py-3.5 rounded-xl ${focusRing}`}
                        >
                            Become a Driver
                        </button>
                    </div>

                    <ul style={{ animationDelay: ".4s" }} className="rc-in flex flex-wrap gap-3 mt-2">
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
                <div className="rc-float hidden md:block absolute top-28 right-6 lg:right-10 bg-white rounded-xl shadow-xl p-4 w-60 lg:w-72">
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

                {/* Truck loads a parcel, drives, unloads it, and returns */}
                <RoadTruck />
            </header>

            <main>
                {/* Stats bar */}
                <Reveal className="relative z-10 mx-4 sm:mx-10 -mt-12">
                    <section
                        aria-label="RouteShare in numbers"
                        className="grid grid-cols-2 md:grid-cols-4 gap-y-5 bg-white rounded-xl px-4 sm:px-6 py-5 shadow-lg md:divide-x"
                    >
                        {stats.map(({ icon: Icon, to, suffix, label }) => (
                            <div key={label} className="group flex items-center gap-3 md:justify-center md:px-4">
                                <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                                    <Icon aria-hidden="true" className="text-blue-600 text-xl" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg sm:text-xl text-slate-900">
                                        <CountUp to={to} suffix={suffix} />
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-600">{label}</span>
                                </div>
                            </div>
                        ))}
                    </section>
                </Reveal>

                {/* How it works */}
                <section id="how-it-works" className="pt-10 px-6">
                    <Reveal className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How it Works</h2>
                        <p className="text-base sm:text-lg text-gray-600 mt-2">
                            Get your goods delivered in 5 simple steps
                        </p>
                    </Reveal>

                    <ol className="mt-8 sm:px-4 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-8">
                        {steps.map(({ icon: Icon, title, text }, i) => (
                            <li key={title} className="group relative flex flex-col items-center text-center px-2">
                                <Reveal delay={i * 90} className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
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
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Shippers / Drivers */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 px-6 sm:px-10">
                    {audiences.map((a, i) => (
                        <Reveal key={a.tag} delay={i * 120} className="h-full">
                            <article
                                className="group relative h-full min-h-[420px] bg-cover bg-center rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                style={{ backgroundImage: `url(${a.image})` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                                <div className="relative h-full min-h-[420px] flex flex-col justify-end gap-3 px-6 py-7">
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
                                        className={`group/btn mt-3 w-fit inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${a.ctaClass} ${focusRing}`}
                                    >
                                        {a.cta}
                                        <FaArrowRight aria-hidden="true" className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                                    </button>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </section>

                <First />
            </main>
        </div>
    );
}

export default LandingPage;