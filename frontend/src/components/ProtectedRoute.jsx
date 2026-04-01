import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

/**
 * Wraps any route that requires the user to be authenticated.
 * - While the session is loading (refresh-token check on mount) → full-screen spinner
 * - Not authenticated → redirect to /login
 * - Authenticated → render the nested route via <Outlet />
 */
function ProtectedRoute() {
  const { isLoading } = useAuth();
  const { isAuthenticated } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          {/* Animated spinner */}
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-400 tracking-wide">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
