import { useEffect, useRef, useState } from "react";
import {
    FaWallet,
    FaLeaf,
    FaUsers,
    FaMapMarkerAlt,
    FaShieldAlt,
    FaMap,
    FaArrowRight,
    FaTruck,
    FaLinkedinIn,
    FaInstagram,
    FaFacebookF,
    FaYoutube,
} from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import eve from "../../assets/eve.png";
import ind from "../../assets/ind.png";
import phone from "../../assets/phone.png";

const features = [
    { icon: FaWallet, title: "Cost Efficient", text: "Pay only for the space you use." },
    { icon: FaLeaf, title: "Eco Friendly", text: "Reduce empty runs and lower emissions." },
    { icon: FaUsers, title: "Trusted Community", text: "Verified drivers and businesses." },
    { icon: FaMapMarkerAlt, title: "Real-Time Tracking", text: "Know where your goods are, always." },
    { icon: FaShieldAlt, title: "Secure Payments", text: "Multiple payment options with full security." },
    { icon: FaMap, title: "Pan-India Reach", text: "Servicing 51000+ routes across India." },
];

const stats = [
    { to: 1000, suffix: "+", label: "Active Routes" },
    { to: 28, suffix: "+", label: "States Covered" },
    { to: 50, suffix: "K+", label: "Deliveries Completed" },
];

// Placeholder answers - apne hisaab se badal lena
const faqs = [
    {
        q: "What is RouteShare?",
        a: "RouteShare connects shippers with trucks that are already travelling your route, so you pay only for the space you need.",
    },
    {
        q: "How does payment work?",
        a: "You pay securely online when you confirm a booking. UPI, cards, net banking and wallets are supported.",
    },
    {
        q: "Are my goods safe?",
        a: "Drivers are verified, and you can track your shipment in real time until delivery is confirmed.",
    },
    {
        q: "Can I book partial truck space?",
        a: "Yes. Choose the capacity you need and book just that part of the truck.",
    },
    {
        q: "How do I become a driver?",
        a: "Sign up as a driver, add your vehicle details and the trips you already make, and start accepting booking requests.",
    },
    {
        q: "Which cities do you operate in?",
        a: "RouteShare covers routes across India, from metros to small towns. Search your route to see available trucks.",
    },
];

const quickLinks = [
    { label: "For Shippers", href: "#" },
    { label: "For Drivers", href: "#" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#" },
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
];

const supportLinks = [
    { label: "Help Center", href: "#" },
    { label: "Safety", href: "#" },
    { label: "Terms & Conditions", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "FAQs", href: "#faq" },
];

const socials = [
    { icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
    { icon: FaInstagram, label: "Instagram", href: "#" },
    { icon: FaFacebookF, label: "Facebook", href: "#" },
    { icon: FaYoutube, label: "YouTube", href: "#" },
];

const focusRing =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400";

/* ---------- Small animation helpers (also used by LandingPage) ---------- */
const prefersReduced = () =>
    typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Fade + slide up when scrolled into view
export function Reveal({ children, delay = 0, className = "" }) {
    const ref = useRef(null);
    const [on, setOn] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el || !("IntersectionObserver" in window) || prefersReduced()) {
            setOn(true);
            return;
        }
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setOn(true);
                    io.disconnect();
                }
            },
            { threshold: 0.12 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: on ? 1 : 0,
                transform: on ? "none" : "translateY(16px)",
                transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

// Number counts up once when visible
export function CountUp({ to, suffix = "", duration = 1200 }) {
    const ref = useRef(null);
    const [n, setN] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!("IntersectionObserver" in window) || prefersReduced()) {
            setN(to);
            return;
        }
        let raf;
        const io = new IntersectionObserver(
            ([e]) => {
                if (!e.isIntersecting) return;
                io.disconnect();
                let t0;
                const tick = (t) => {
                    if (t0 === undefined) t0 = t;
                    const p = Math.min((t - t0) / duration, 1);
                    setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
                    if (p < 1) raf = requestAnimationFrame(tick);
                };
                raf = requestAnimationFrame(tick);
            },
            { threshold: 0.4 }
        );
        io.observe(el);
        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [to, duration]);
    return (
        <span ref={ref}>
            {n}
            {suffix}
        </span>
    );
}

function FaqItem({ id, q, a, open, onToggle }) {
    return (
        <div className="border border-gray-200 rounded-lg bg-white">
            <h3>
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${id}`}
                    className={`w-full flex justify-between items-center gap-3 px-4 py-3 text-left text-sm sm:text-base font-medium rounded-lg ${focusRing}`}
                >
                    {q}
                    <FiChevronDown
                        aria-hidden="true"
                        className={`shrink-0 text-gray-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    />
                </button>
            </h3>
            <div
                id={`faq-panel-${id}`}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
                <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-sm text-gray-600 leading-6">{a}</p>
                </div>
            </div>
        </div>
    );
}

function First() {
    const [openFaq, setOpenFaq] = useState(null);
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

    const handleSubscribe = (e) => {
        e.preventDefault();
        // TODO: yahan newsletter API call lagao
        setSubscribed(true);
        setEmail("");
    };

    const half = Math.ceil(faqs.length / 2);
    const faqColumns = [faqs.slice(0, half), faqs.slice(half)];

    return (
        <div>
            {/* Why Choose RouteShare */}
            <section className="mt-10 pb-2 px-4 sm:px-6 flex flex-col items-center text-center">
                <Reveal>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Why Choose RouteShare?</h2>
                    <p className="text-gray-600 mt-2 text-base sm:text-lg">
                        A smarter, more efficient way to move goods across India.
                    </p>
                </Reveal>
                <ul className="mt-6 w-full max-w-6xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 sm:gap-x-6 gap-y-6">
                    {features.map(({ icon: Icon, title, text }, i) => (
                        <li key={title}>
                            <Reveal delay={i * 70} className="group flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                                    <Icon aria-hidden="true" />
                                </div>
                                <h3 className="mt-3 font-bold text-base text-slate-900">{title}</h3>
                                <p className="mt-1 text-sm text-gray-600 leading-5 max-w-[170px]">{text}</p>
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Pan-India Network */}
            <section className="px-4 sm:px-10 lg:px-20 py-6">
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center">
                    <Reveal className="w-full md:w-1/2">
                        <div
                            role="img"
                            aria-label="Map of RouteShare's routes across India"
                            className="w-full h-[240px] sm:h-[300px] md:h-[360px] bg-cover bg-center rounded-xl overflow-hidden border border-gray-200"
                            style={{ backgroundImage: `url(${ind})` }}
                        />
                    </Reveal>
                    <Reveal delay={120} className="w-full md:w-1/2">
                        <span className="inline-block text-xs font-semibold text-green-700 bg-green-100 rounded-full px-3 py-1">
                            Pan-India network
                        </span>
                        <h2 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight text-slate-900">
                            Connecting Cities.
                            <br />
                            Moving Possibilities.
                        </h2>
                        <p className="mt-3 text-gray-600 text-sm sm:text-base leading-6 max-w-lg">
                            From metros to small towns, RouteShare helps you move goods across India with ease.
                            Whether it's a few boxes or a few tons, there's always a truck going your way.
                        </p>

                        <dl className="flex flex-wrap gap-x-10 gap-y-4 mt-5">
                            {stats.map(({ to, suffix, label }) => (
                                <div key={label}>
                                    <dd className="text-2xl font-bold text-slate-900 order-first">
                                        <CountUp to={to} suffix={suffix} />
                                    </dd>
                                    <dt className="text-sm text-gray-600">{label}</dt>
                                </div>
                            ))}
                        </dl>

                        <button
                            type="button"
                            className={`group mt-5 inline-flex items-center gap-2 border border-blue-600 text-blue-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-600 hover:text-white transition-all duration-200 hover:-translate-y-0.5 ${focusRing}`}
                        >
                            Explore Routes
                            <FaArrowRight aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                    </Reveal>
                </div>
            </section>

            {/* CTA banner */}
            <section
                className="relative w-full min-h-[220px] sm:min-h-[250px] md:min-h-[280px] bg-cover bg-center mt-6"
                style={{ backgroundImage: `url(${eve})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
                <Reveal className="relative flex flex-col justify-center items-start h-full min-h-[220px] sm:min-h-[250px] md:min-h-[280px] px-6 sm:px-10 md:px-16 gap-3 py-6">
                    <h2 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl">Ready to Move Smarter?</h2>
                    <p className="text-gray-100 text-sm sm:text-lg max-w-xl">
                        Join thousands of businesses and drivers who are already using RouteShare.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                        <button
                            type="button"
                            className={`group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${focusRing}`}
                        >
                            Get Started
                            <FaArrowRight aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                        <button
                            type="button"
                            className={`bg-white/10 hover:bg-white/20 border border-white/60 text-white font-semibold px-6 py-3 rounded-xl backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${focusRing}`}
                        >
                            Become a Driver
                        </button>
                    </div>
                </Reveal>
            </section>

            {/* Phone mockup */}
            <section className="px-4 sm:px-8 lg:px-16 mt-6">
                <Reveal>
                    <div
                        role="img"
                        aria-label="RouteShare app shown on a phone"
                        className="relative w-full h-[240px] sm:h-[300px] md:h-[380px] bg-cover bg-center rounded-xl overflow-hidden"
                        style={{ backgroundImage: `url(${phone})` }}
                    />
                </Reveal>
            </section>

            {/* FAQ */}
            <section id="faq" className="px-4 sm:px-6 py-10">
                <Reveal className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">Everything you need to know about RouteShare.</p>
                </Reveal>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-6xl mx-auto items-start">
                    {faqColumns.map((col, c) => (
                        <div key={c} className="flex flex-col gap-3">
                            {col.map((item, i) => {
                                const index = c * half + i;
                                return (
                                    <FaqItem
                                        key={item.q}
                                        id={index}
                                        q={item.q}
                                        a={item.a}
                                        open={openFaq === index}
                                        onToggle={() => toggleFaq(index)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#06264a] text-white px-6 sm:px-8 md:px-16 py-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Logo + description */}
                    <div>
                        <div className="flex items-center gap-2">
                            <FaTruck aria-hidden="true" className="text-3xl text-blue-400" />
                            <div>
                                <p className="text-xl font-bold leading-tight">RouteShare</p>
                                <p className="text-xs text-gray-300">Move Together. Grow Together.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300 mt-4 leading-6 max-w-[240px]">
                            A smarter, greener and more efficient way to move goods across India.
                        </p>
                        <div className="flex gap-3 mt-5">
                            {socials.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className={`w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 ${focusRing}`}
                                >
                                    <Icon aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <nav aria-label="Quick links">
                        <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
                        <ul className="flex flex-col gap-2 text-sm text-gray-300">
                            {quickLinks.map((l) => (
                                <li key={l.label}>
                                    <a href={l.href} className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200">
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Support */}
                    <nav aria-label="Support">
                        <h3 className="font-semibold text-sm mb-3">Support</h3>
                        <ul className="flex flex-col gap-2 text-sm text-gray-300">
                            {supportLinks.map((l) => (
                                <li key={l.label}>
                                    <a href={l.href} className="inline-block hover:text-white hover:translate-x-0.5 transition-all duration-200">
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Subscribe */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3">Subscribe</h3>
                        <p className="text-sm text-gray-300 mb-3">Get the latest updates, news, and offers.</p>
                        {subscribed ? (
                            <p role="status" className="text-sm text-green-300">
                                Thanks for subscribing!
                            </p>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex">
                                <label htmlFor="newsletter-email" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="newsletter-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="bg-white w-full min-w-0 px-3 py-2 text-sm text-gray-800 rounded-l-md outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <button
                                    type="submit"
                                    className="shrink-0 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold rounded-r-md transition-colors"
                                >
                                    Subscribe
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto border-t border-white/20 mt-6 pt-4 flex flex-col md:flex-row justify-between gap-2 text-xs text-gray-300">
                    <span>© 2026 RouteShare. All rights reserved.</span>
                    <span className="inline-flex items-center gap-1.5">
                        Built for a Cleaner, Smarter India. <FaLeaf aria-hidden="true" className="text-green-400" />
                    </span>
                </div>
            </footer>
        </div>
    );
}

export default First;