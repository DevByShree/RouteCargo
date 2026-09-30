import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function CustomerLayout() {
    return (
        <div className="flex min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Page Content */}
            <main className="flex-1 min-w-0">
                <Outlet />
            </main>

        </div>
    );
}

export default CustomerLayout;