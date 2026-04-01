import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Wraps any route that requires a specific role.
 * Prop:
 *   allowedRoles — string[] — e.g. ['SYSTEM_ADMIN', 'FACULTY_MANAGER']
 *
 * If the user's role is NOT in allowedRoles → redirect to /unauthorized.
 * Otherwise → render the nested route via <Outlet />.
 */
function RoleProtectedRoute({ allowedRoles = [] }) {
  const { role } = useAuthStore();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;
