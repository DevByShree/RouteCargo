import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./Pages/Authentication/Signup.jsx";
import Signin from "./Pages/Authentication/signin.jsx";
import LandingPage from "./Pages/LandingPage";

import Dashboard from "./Pages/Customer/Dashboard/dashboard.jsx";
import Find from "./Pages/Customer/Find_Trucks/Find.jsx";
import Booking from "./Pages/Customer/My_Booking/Booking.jsx";
import Track from "./Pages/Customer/Tracking/track";
import Address from "./Pages/Customer/Saved_Address/Address.jsx";
import Payments from "./Pages/Customer/Payment/Payment.jsx";
import Profile from "./Pages/Customer/Profile/Profile.jsx";
import Shipment from "./Pages/Customer/Shipment/shipment.jsx";

import CustomerLayout from "./Layout/CustomerLayout";


function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />


                {/* Customer Pages */}
                <Route element={<CustomerLayout />}>

                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/Find" element={<Find />} />
                    <Route path="/Booking" element={<Booking />} />
                    <Route path="/track" element={<Track />} />
                    <Route path="/address" element={<Address />} />
                    <Route path="/payment" element={<Payments />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/shipment" element={<Shipment />} />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;