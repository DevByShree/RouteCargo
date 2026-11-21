import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";

function Layout() {
    useEffect(() => {
        document.documentElement.classList.remove("dark");
        try {
            localStorage.removeItem("theme");
        } catch {
            // ignore
        }
    }, []);

    return (
        <div className="min-h-screen flex bg-slate-50 text-slate-900">
            {/* Sidebar */}
            <Sidebar />

            {/* Page Content */}
            <main className="flex-1 min-w-0 flex flex-col bg-slate-50">
                <DashboardNavbar />
                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;
