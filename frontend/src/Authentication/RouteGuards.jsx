import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-slate-600" aria-live="polite">
      Restoring your session…
    </main>
  );
}

export function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/signin" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "driver" ? "/driver" : "/user"} replace />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (user) return <Navigate to={user.role === "driver" ? "/driver" : "/user"} replace />;
  return <Outlet />;
}
