import { Link } from "react-router-dom";

const Signup = () => {
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

                {/* Full Name */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                    </label>

                    <input
                        type="text"
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
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    />
                </div>

                {/* Password */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    />
                </div>

                {/* Signup Button */}
                <button
                    type="button"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                    Create Account
                </button>

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