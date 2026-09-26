import Sidebar from "../../../Layout/Sidebar.jsx"
import DashboardNavbar from "../../../Layout/DashboardNavbar.jsx";

function Dashboard() {
    return (
        <div className="flex min-h-screen">

            <Sidebar />
            <DashboardNavbar />

            <div className="flex-1">
            </div>

        </div>
    );
}

export default Dashboard;