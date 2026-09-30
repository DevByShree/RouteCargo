import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiGrid } from "react-icons/fi";
import logo from "../assets/logo.png";

const navLinks = [
    { label: "For Shippers", to: "/" },
    { label: "For Drivers", to: "/" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", to: "/" },
    { label: "About", to: "/" },
    { label: "Contact", to: "/" },
];

const focusRing =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2";

const checkLoggedIn = () => {
    try {
        return Boolean(localStorage.getItem("token"));
    } catch {
        return false;
    }
};

function NavItem({ link, className, onClick }) {
    if (link.href) {
        return (
            <a href={link.href} onClick={onClick} className={className}>
                {link.label}
            </a>
        );
    }
    return (
        <Link to={link.to} onClick={onClick} className={className}>
            {link.label}
        </Link>
    );
}

function Navbar() {
    const [open, setOpen] = useState(false);
    const isLoggedIn = checkLoggedIn();
    const close = () => setOpen(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const linkClass = `text-gray-700 hover:text-blue-600 font-medium transition-colors rounded ${focusRing}`;

    return (
        <nav aria-label="Main" className="w-full h-17 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3">
                {/* Logo */}
                <Link to="/" aria-label="RouteShare home" className={`rounded ${focusRing}`}>
                    <img src={logo} alt="RouteShare" className="w-28 sm:w-32 lg:w-36 h-auto" />
                </Link>

                {/* Desktop links */}
                <div className="hidden lg:flex items-center gap-8 text-sm">
                    {navLinks.map((link) => (
                        <NavItem key={link.label} link={link} className={linkClass} />
                    ))}
                </div>

                {/* Desktop right side */}
                <div className="hidden lg:flex items-center gap-3">
                    {isLoggedIn ? (
                        <Link
                            to="/dashboard"
                            aria-label="Go to dashboard"
                            title="Dashboard"
                            className={`w-11 h-11 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors ${focusRing}`}
                        >
                            <FiGrid size={20} />
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/signin"
                                className={`py-2.5 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 rounded-lg transition-colors ${focusRing}`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className={`py-2.5 px-5 text-sm text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors ${focusRing}`}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    aria-label={open ? "Close menu" : "Open menu"}
                    className={`lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 ${focusRing}`}
                >
                    {open ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div id="mobile-menu" className="lg:hidden border-t border-gray-200 px-4 sm:px-6 pb-5">
                    <div className="flex flex-col py-2">
                        {navLinks.map((link) => (
                            <NavItem
                                key={link.label}
                                link={link}
                                onClick={close}
                                className={`py-3 border-b border-gray-100 ${linkClass}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-3 mt-3">
                        {isLoggedIn ? (
                            <Link
                                to="/dashboard"
                                onClick={close}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors ${focusRing}`}
                            >
                                <FiGrid size={18} /> Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/signin"
                                    onClick={close}
                                    className={`flex-1 text-center py-2.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors ${focusRing}`}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={close}
                                    className={`flex-1 text-center py-2.5 text-sm text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors ${focusRing}`}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;