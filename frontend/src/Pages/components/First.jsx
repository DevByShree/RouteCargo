import {
    FaWallet,
    FaLeaf,
    FaUsers,
    FaMapMarkerAlt,
    FaShieldAlt,
    FaMap,
} from "react-icons/fa";
import eve from "../../assets/eve.png";
import ind from "../../assets/ind.png";
import phone from "../../assets/phone.png"

const features = [
    {
        icon: FaWallet,
        title: "Cost Efficient",
        text: "Pay only for the space you use.",
    },
    {
        icon: FaLeaf,
        title: "Eco Friendly",
        text: "Reduce empty runs and lower emissions.",
    },
    {
        icon: FaUsers,
        title: "Trusted Community",
        text: "Verified drivers and businesses.",
    },
    {
        icon: FaMapMarkerAlt,
        title: "Real-Time Tracking",
        text: "Know where your goods are, always.",
    },
    {
        icon: FaShieldAlt,
        title: "Secure Payments",
        text: "Multiple payment options with full security.",
    },
    {
        icon: FaMap,
        title: "Pan-India Reach",
        text: "Servicing 51000+ routes across India.",
    },
];

const stats = [
    { value: "1000+", label: "Active Routes" },
    { value: "28+", label: "States Covered" },
    { value: "50K+", label: "Deliveries Completed" },
];

function First() {
    return (
        <div>
            {/* Why Choose RouteShare */}
            <div className="mt-10 pb-8 px-4 sm:px-6 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold">
                    Why Choose RouteShare?
                </h2>
                <p className="font-light text-gray-600 mt-1 text-base sm:text-lg lg:text-xl">
                    A smarter, more efficient way to move goods across India.
                </p>
                <div className="mt-7 w-full max-w-6xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 sm:gap-x-6 gap-y-7">
                    {features.map(({ icon: Icon, title, text }) => (
                        <div
                            key={title}
                            className="flex flex-col items-center text-center"
                        >
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl shrink-0">
                                <Icon />
                            </div>
                            {/* Title */}
                            <h3 className="mt-2 flex items-center justify-center font-bold text-base min-h-[28px]">
                                {title}
                            </h3>
                            {/* Description */}
                            <p className="mt-1 text-sm font-normal text-gray-600 leading-5 max-w-[160px]">
                                {text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pan-India Network */}
            <div className="px-4 sm:px-10 lg:px-20 py-8">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Map */}
                    <div
                        role="img"
                        aria-label="Map of RouteShare's routes across India"
                        className="w-full md:w-1/2 h-[260px] sm:h-[340px] md:h-[420px] bg-cover bg-center rounded-xl overflow-hidden border border-gray-200"
                        style={{ backgroundImage: `url(${ind})` }}
                    />
                    {/* Right Content */}
                    <div className="w-full md:w-1/2">
                        <span className="text-xs font-semibold text-green-700 bg-green-100 rounded-full px-3 py-1 w-fit">
                            PAN-INDIA NETWORK
                        </span>
                        <h2 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight">
                            Connecting Cities.
                            <br />
                            Moving Possibilities.
                        </h2>
                        <p className="mt-2 text-gray-600 text-sm sm:text-base leading-6">
                            From metros to small towns, RouteShare helps you move
                            goods across India with ease. Whether it's a few boxes
                            or a few tons, there's always a truck going your way.
                        </p>
                        {/* Stats */}
                        <div className="flex flex-wrap gap-x-8 gap-y-3 mt-5">
                            {stats.map(({ value, label }) => (
                                <div key={label}>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {value}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {/* Button */}
                        <button
                            type="button"
                            className="mt-5 w-fit border border-blue-600 text-blue-600 px-5 py-2 rounded-md font-semibold text-sm hover:bg-blue-600 hover:text-white transition-colors"
                        >
                            Explore Routes →
                        </button>
                    </div>
                </div>
            </div>

            {/* CTA banner */}
            <div
                className="relative w-full h-[220px] sm:h-[280px] md:h-[330px] bg-cover bg-center mt-5 px-4 sm:px-5"
                style={{ backgroundImage: `url(${eve})` }}
            >
                <div className="flex flex-col justify-center h-full px-4 sm:px-8 md:px-12 gap-1">
                    <span className="text-white font-bold text-2xl sm:text-3xl md:text-4xl">
                        Ready to Move Smarter?
                    </span>
                    <span className="text-white text-sm sm:text-lg md:text-xl font-semibold">
                        Join thousands of businesses and drivers who are already using RouteShare.
                    </span>
                </div>
            </div>

            {/* Phone mockup */}
            <div className="px-4 sm:px-8 lg:px-15">
                <div
                    className="  relative w-full h-[260px] sm:h-[340px] md:h-[430px] bg-cover bg-center  rounded-xl overflow-hidden"
                    style={{ backgroundImage: `url(${phone})` }}
                />
            </div>

            {/* FAQ */}
            <div className="px-4 sm:px-5 py-10">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Everything you need to know about RouteShare.
                    </p>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-6xl mx-auto">
                    {/* Left */}
                    <div className="flex flex-col gap-2">
                        <div className="border border-gray-200 rounded-lg px-4 py-2 flex justify-between items-center text-sm">
                            <span>What is RouteShare?</span>
                            {/* <span>⌄</span> */}
                        </div>
                        <div className="border border-gray-200 rounded-lg px-4 py-2 flex justify-between items-center text-sm">
                            <span>How does payment work?</span>
                            {/* <span>⌄</span> */}
                        </div>
                        <div className="border border-gray-200 rounded-lg px-4 py-2 flex justify-between items-center text-sm">
                            <span>Is my goods safe?</span>
                            {/* <span>⌄</span> */}
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col gap-2">
                        <div className="border border-gray-200 rounded-lg px-4 py-2 flex justify-between items-center text-sm">
                            <span>Can I book partial truck space?</span>
                            {/* <span>⌄</span> */}
                        </div>
                        <div className="border border-gray-200 rounded-lg px-4 py-2 flex justify-between items-center text-sm">
                            <span>How do I become a driver?</span>
                            {/* <span>⌄</span> */}
                        </div>
                        <div className="border border-gray-200 rounded-lg px-4 py-2 flex justify-between items-center text-sm">
                            <span>Which cities do you operate in?</span>
                            {/* <span>⌄</span> */}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-[#06264a] text-white px-6 sm:px-8 md:px-16 py-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Logo + Description */}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">🚚</span>
                            <div>
                                <h2 className="text-xl font-bold">
                                    RouteShare
                                </h2>
                                <p className="text-[8px] text-gray-300">
                                    Move Together. Grow Together.
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-300 mt-4 leading-5 max-w-[220px]">
                            A smarter, greener and more efficient way
                            to move goods across India.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-4 mt-5 text-sm">
                            <span>in</span>
                            <span>♥</span>
                            <span>◎</span>
                            <span>▶</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3">
                            Quick Links
                        </h3>
                        <div className="flex flex-col gap-2 text-xs text-gray-300">
                            <span>For Shippers</span>
                            <span>For Drivers</span>
                            <span>How It Works</span>
                            <span>Pricing</span>
                            <span>About Us</span>
                            <span>Contact</span>
                        </div>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3">
                            Support
                        </h3>
                        <div className="flex flex-col gap-2 text-xs text-gray-300">
                            <span>Help Center</span>
                            <span>Safety</span>
                            <span>Terms & Conditions</span>
                            <span>Privacy Policy</span>
                            <span>FAQs</span>
                        </div>
                    </div>

                    {/* Subscribe */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3">
                            Subscribe
                        </h3>
                        <p className="text-xs text-gray-300 mb-3">
                            Get the latest updates, news, and offers.
                        </p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className=" bg-amber-50 w-full min-w-0 px-3 py-2 text-xs text-gray-700 rounded-l-md outline-none"
                            />
                            <button
                                type="button"
                                className="shrink-0 bg-blue-600 px-4 sm:px-5 py-2 text-xs font-semibold rounded-r-md"
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Line */}
                <div className="max-w-6xl mx-auto border-t border-white/20 mt-7 pt-4 flex flex-col md:flex-row justify-between gap-2 text-[10px] text-gray-300">
                    <span>
                        © 2026 RouteShare. All rights reserved.
                    </span>
                    <span>
                        Built for a Cleaner, Smarter India. 🌱
                    </span>
                </div>
            </footer>
        </div>
    );
}

export default First;