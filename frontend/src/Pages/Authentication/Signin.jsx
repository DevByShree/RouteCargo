import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const Signin = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-11 py-14">

                <h1 className="text-3xl font-bold text-black mb-2">
                    Welcome Back
                </h1>

                <p className="text-gray-500 mb-10">
                    Sign in to continue to RouteCargo
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full h-[54px] px-4 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
                    />
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Password
                    </label>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="w-full h-[54px] px-4 pr-12 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                    Sign In
                </button>

                <p className="text-center text-sm text-gray-500 mt-7">
                    Don't have an account?{" "}

                    <Link
                        to="/signup"
                        className="text-blue-600 font-semibold cursor-pointer hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default Signin;