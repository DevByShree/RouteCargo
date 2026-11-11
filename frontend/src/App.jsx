import { BrowserRouter, Route, Routes } from "react-router-dom";

import LandingPage from "./Pages/LandingPage.jsx";
import Signup from "./Pages/Authentication/Signup.jsx";
import Signin from "./Pages/Authentication/Signin.jsx";
import Dashboard from "./Pages/Customer/Dashboard/dashboard.jsx";
import Find from "./Pages/Customer/Find_Trucks/Find.jsx";
import Booking from "./Pages/Customer/My_Booking/Booking.jsx";
import Track from "./Pages/Customer/Tracking/Track.jsx";
import Address from "./Pages/Customer/Saved_Address/Address.jsx";
import Payments from "./Pages/Customer/Payment/Payment.jsx";
import Profile from "./Pages/Customer/Profile/UserProfile.jsx";
import Shipment from "./Pages/Customer/Shipment/shipment.jsx";
import Parcel from "./Pages/Customer/Parcel/parcel.jsx";

import Layout from "./Layout/Layout.jsx";
import DriverDashboard from "./Pages/Driver/Dashboard.jsx";
import RaiseRequest from "./Pages/Driver/RaiseRequest.jsx";
import MyRequests from "./Pages/Driver/MyRequests.jsx";
import AddVehicles from "./Pages/Driver/AddVehicles.jsx";
import DriverProfile from "./Pages/Driver/DriverProfile.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Find" element={<Find />} />
          <Route path="/Booking" element={<Booking />} />
          <Route path="/track" element={<Track />} />
          <Route path="/Address" element={<Address />} />
          <Route path="/payment" element={<Payments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/shipment" element={<Shipment />} />
          <Route path="/parcel" element={<Parcel />} />

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
