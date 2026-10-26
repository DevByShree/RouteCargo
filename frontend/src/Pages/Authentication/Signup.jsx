import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../API/api";

const Signup = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await authAPI.signup({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
            });
            navigate("/signin", {
                state: { message: "Account created successfully! Please sign in." },
            });
        } catch (err) {
            setError(err.data?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">

            {/* SIGNUP FORM CARD */}
            <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl px-10 py-12">

                <h1 className="text-3xl font-bold mb-2">
                    Create Account
                </h1>

                <p className="text-gray-500 mb-8">
                    Sign up to get started
                </p>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Full Name */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Role */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Register as
                        </label>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="user"
                                    checked={form.role === "user"}
                                    onChange={handleChange}
                                    className="form-radio text-blue-600"
                                />
                                user
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="driver"
                                    checked={form.role === "driver"}
                                    onChange={handleChange}
                                    className="form-radio text-blue-600"
                                />
                                Driver
                            </label>
                        </div>
                    </div>

                    {/* Signup Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300`}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>

                </form>

                {/* Sign In */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/signin"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Sign In
                    </Link>
                </p>

            </div>

        </div>
    );
};

export default Signup;
