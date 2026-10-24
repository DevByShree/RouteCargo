import { Link } from "react-router-dom";

const DriverDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Driver Portal
                </h1>
                <p className="text-gray-500 mb-6">
                    Driver UI under construction. You are logged in as a driver.
                </p>
                <Link
                    to="/signin"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
                >
                    Go to Sign In
                </Link>
            </div>
        </div>
    );
};

export default DriverDashboard;
