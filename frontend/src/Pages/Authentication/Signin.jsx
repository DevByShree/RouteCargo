import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../API/api";

const Signin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(location.state?.message || "");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const res = await authAPI.signin({
                email: form.email,
                password: form.password,
            });
            // Token is stored as httpOnly cookie by backend; also persist for
            // existing localStorage-based UI (Navbar) and role-based redirect.
            if (res.token) {
                localStorage.setItem("token", res.token);
                localStorage.setItem("role", res.user.role);
            }
            if (res.user.role === "driver") {
                navigate("/driver");
            } else {
                navigate("/user");
            }
        } catch (err) {
            setError(err.data?.message || "Sign in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-11 py-14">

                <h1 className="text-3xl font-bold text-black mb-2">
                    Welcome Back
                </h1>

                <p className="text-gray-500 mb-10">
                    Sign in to continue to RouteCargo
                </p>

                {success && (
                    <div className="mb-6 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
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
                                name="password"
                                value={form.password}
                                onChange={handleChange}
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
                        type="submit"
                        disabled={loading}
                        className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:bg-gray-300"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>

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
