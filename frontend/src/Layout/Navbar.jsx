
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    return (
        <nav className="w-full bg-white border-b border-gray-200 px-5 mt-1">
            <div className="flex items-center justify-between px-6 lg:px-10">
                <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6">
                    <img src={logo} alt="RouteShare" className="w-28 sm:w-32 lg:w-36 h-auto" />
                </div>
                <div className=" flex  items-center gap-8 font-[Inter]">
                    <a href="/">For Shippers</a>
                    <a href="/">For Drivers</a>
                    <a href="/">How It Works</a>
                    <a href="/">Pricing</a>
                    <a href="/">About</a>
                    <a href="/">Contact</a>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/signin")}
                        className="py-5 px-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate("/signup")}
                        className="py-2.5 px-5 text-sm text-white font-semibold rounded-lg hover:bg-blue-700 transition bg-blue-600">
                        Sign Up
                    </button>
                </div>
            </div>

        </nav >
    )
}

export default Navbar