import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./Pages/Authentication/Signup.jsx";
import Signin from "./Pages/Authentication/Signin.jsx";
import LandingPage from "./Pages/LandingPage";

import Dashboard from "./Pages/Customer/Dashboard/dashboard.jsx";
import Find from "./Pages/Customer/Find_Trucks/Find.jsx";
import Booking from "./Pages/Customer/My_Booking/Booking.jsx";
import TrackShipment from "./Pages/Customer/Tracking/Track.jsx";
import Address from "./Pages/Customer/Saved_Address/Address.jsx";
import Payments from "./Pages/Customer/Payment/Payment.jsx";
import UserProfile from "./Pages/Customer/Profile/UserProfile.jsx";
import Shipment from "./Pages/Customer/Shipment/shipment.jsx";
import Parcel from "./Pages/Customer/Parcel/parcel.jsx";

import Layout from "./Layout/Layout.jsx";
import DriverDashboard from "./Pages/Driver/Dashboard";
import RaiseRequest from "./Pages/Driver/RaiseRequest.jsx"
import MyRequests from "./Pages/Driver/MyRequests.jsx";
import AddVehicles from "./Pages/Driver/AddVehicles.jsx";
import DriverProfile from "./Pages/Driver/DriverProfile.jsx";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />


                {/* Customer Pages */}
                <Route element={<Layout />}>

                    <Route path="/user" element={<Dashboard />} />
                    <Route path="/user/Find" element={<Find />} />
                    <Route path="/user/Booking" element={<Booking />} />
                    <Route path="/user/track" element={<TrackShipment />} />
                    <Route path="/user/address" element={<Address />} />
                    <Route path="/user/payment" element={<Payments />} />
                    <Route path="/user/profile" element={<UserProfile />} />
                    <Route path="/user/shipment" element={<Shipment />} />
                    <Route path="/user/parcel" element={<Parcel />} />

                    <Route path="/driver" element={<DriverDashboard />} />
                    <Route path="/driver/raise-request" element={<RaiseRequest />} />
                    <Route path="/driver/my-requests" element={<MyRequests />} />
                    <Route path="/driver/profile" element={<DriverProfile />} />
                    <Route path="/driver/vehicles" element={<AddVehicles />} />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;