import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./Pages/Authentication/Signup.jsx";
import Signin from "./Pages/Authentication/signin.jsx";
import LandingPage from "./Pages/LandingPage";
import Dashboard from "./Pages/Customer/Dashboard/dashboard.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/dashboard" element={<Dashboard />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;