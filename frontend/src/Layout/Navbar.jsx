import { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiGrid } from "react-icons/fi";
import logo from "../assets/logo.png";

const navLinks = [
    { label: "Home", to: "/" },
    { label: "Find Trucks", to: "/Find" },
    { label: "How It Works", hash: "#how-it-works" },
    { label: "For Shippers", hash: "#for-shippers" },
    { label: "For Drivers", hash: "#for-drivers" },
];

const NAV_OFFSET = 80; // height of the sticky navbar, used when scrolling to sections

const focusRing =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] focus-visible:ring-offset-2";

const readLoggedIn = () => {
    try {
        return Boolean(localStorage.getItem("token"));
    } catch {
        return false;
    }
};

function scrollToHash(hash) {
    const el = hash && document.getElementById(hash.slice(1));
    if (!el) return false;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    return true;
}

function NavItem({ link, className, activeClass, onNavigate, mobile }) {
    const { pathname, hash } = useLocation();
    const navigate = useNavigate();

    // Section links (#how-it-works etc.): smooth scroll on the home page,
    // otherwise go home first. No full page reload either way.
    if (link.hash) {
        const active = pathname === "/" && hash === link.hash;
        const handleClick = (e) => {
            e.preventDefault();
            onNavigate?.();
            if (pathname === "/") {
                scrollToHash(link.hash);
                window.history.replaceState(null, "", `/${link.hash}`);
            } else {
                navigate(`/${link.hash}`);
            }
        };
        return (
            <a
                href={`/${link.hash}`}
                onClick={handleClick}
                aria-current={active ? "location" : undefined}
                className={`${className} ${active ? activeClass : ""}`}
            >
                {link.label}
            </a>
        );
    }

    return (
        <NavLink
            to={link.to}
            end={link.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
                `${className} ${isActive && !(link.to === "/" && hash) ? activeClass : ""}`
            }
        >
            {link.label}
        </NavLink>
    );
}

function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(readLoggedIn);
    const { pathname, hash } = useLocation();
    const close = useCallback(() => setOpen(false), []);

    // Shadow + blur once the page is scrolled
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Keep login state in sync (login/logout in another tab, or after sign-in)
    useEffect(() => {
        const sync = () => setIsLoggedIn(readLoggedIn());
        window.addEventListener("storage", sync);
        window.addEventListener("focus", sync);
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("focus", sync);
        };
    }, []);

    // Re-check login and close the drawer on every route change
    useEffect(() => {
        setIsLoggedIn(readLoggedIn());
        setOpen(false);
    }, [pathname]);

    // Scroll to the section when the URL has a hash (also after navigating from another page)
    useEffect(() => {
        if (!hash) return;
        const id = requestAnimationFrame(() => scrollToHash(hash));
        return () => cancelAnimationFrame(id);
    }, [pathname, hash]);

    // Drawer: close on Escape, lock page scroll, close if the screen becomes desktop-wide
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        const mq = window.matchMedia("(min-width: 1024px)");
        const onChange = (e) => e.matches && setOpen(false);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        mq.addEventListener("change", onChange);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", onKey);
            mq.removeEventListener("change", onChange);
        };
    }, [open]);

    const linkClass = `relative text-sm font-medium text-[#475569] transition-colors hover:text-[#2563EB] rounded ${focusRing}`;
    // Desktop: blue text + a small underline bar under the current page/section
    const desktopActive =
        "!text-[#2563EB] after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:rounded-full after:bg-[#2563EB]";
    const mobileActive = "!text-[#2563EB] font-semibold";
    const ctaClass = `inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-[#1D4ED8] active:translate-y-0 ${focusRing}`;

    return (
        <nav
            aria-label="Main"
            className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${scrolled
                    ? "border-[#E2E8F0] bg-white/90 shadow-md shadow-slate-900/5 backdrop-blur-md supports-[backdrop-filter]:bg-white/80"
                    : "border-transparent bg-white"
                }`}
        >
            <div
                className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled ? "py-2" : "py-3"
                    }`}
            >
                {/* Logo */}
                <Link to="/" aria-label="RouteCargo home" className={`shrink-0 rounded ${focusRing}`}>
                    <img src={logo} alt="RouteCargo" className="h-auto w-28 sm:w-32" />
                </Link>

                {/* Desktop links */}
                <div className="hidden items-center gap-7 lg:flex">
                    {navLinks.map((link) => (
                        <NavItem key={link.label} link={link} className={linkClass} activeClass={desktopActive} />
                    ))}
                </div>

                {/* Desktop actions */}
                <div className="hidden items-center gap-2 lg:flex">
                    {isLoggedIn ? (
                        <Link
                            to="/dashboard"
                            aria-label="Go to dashboard"
                            title="Dashboard"
                            className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] text-[#0B1F3A] transition-colors hover:bg-[#DBEAFE] ${focusRing}`}
                        >
                            <FiGrid size={18} />
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/signin"
                                className={`rounded-lg px-3 py-2.5 text-sm font-medium text-[#0B1F3A] transition-colors hover:text-[#2563EB] ${focusRing}`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className={`rounded-lg border border-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] transition-colors hover:bg-[#0B1F3A] hover:text-white ${focusRing}`}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                    <Link to="/Find" className={ctaClass}>
                        Find a Truck
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    aria-label={open ? "Close menu" : "Open menu"}
                    className={`rounded-lg p-2 text-[#0B1F3A] transition-colors hover:bg-[#DBEAFE] lg:hidden ${focusRing}`}
                >
                    {open ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Mobile drawer (always mounted so open/close can animate) */}
            <div
                id="mobile-menu"
                className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out lg:hidden ${open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
                    }`}
            >
                <div className="overflow-hidden">
                    <div
                        className={`max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-[#E2E8F0] bg-white px-4 pb-5 transition-opacity duration-300 sm:px-6 ${open ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <div className="flex flex-col py-2">
                            {navLinks.map((link) => (
                                <NavItem
                                    key={link.label}
                                    link={link}
                                    mobile
                                    onNavigate={close}
                                    className={`border-b border-slate-100 py-3 text-base ${linkClass}`}
                                    activeClass={mobileActive}
                                />
                            ))}
                        </div>
                        <div className="mt-3 flex flex-col gap-3">
                            <Link to="/Find" onClick={close} className={`${ctaClass} w-full`}>
                                Find a Truck
                            </Link>
                            {isLoggedIn ? (
                                <Link
                                    to="/dashboard"
                                    onClick={close}
                                    className={`flex items-center justify-center gap-2 rounded-lg border border-[#0B1F3A] py-2.5 text-sm font-semibold text-[#0B1F3A] hover:bg-[#DBEAFE] ${focusRing}`}
                                >
                                    <FiGrid size={18} /> Dashboard
                                </Link>
                            ) : (
                                <div className="flex gap-3">
                                    <Link
                                        to="/signin"
                                        onClick={close}
                                        className={`flex-1 rounded-lg border border-[#2563EB] py-2.5 text-center text-sm font-medium text-[#2563EB] transition-colors hover:bg-[#DBEAFE] ${focusRing}`}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={close}
                                        className={`flex-1 rounded-lg border border-[#0B1F3A] py-2.5 text-center text-sm font-semibold text-[#0B1F3A] transition-colors hover:bg-[#0B1F3A] hover:text-white ${focusRing}`}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;