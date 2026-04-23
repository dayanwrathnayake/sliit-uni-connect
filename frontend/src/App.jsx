import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useThemeStore } from './store/themeStore';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import StaffLoginPage from './pages/StaffLoginPage';
import ClubsDiscoveryPage from './pages/ClubsDiscoveryPage';
import ClubProfilePage from './pages/ClubProfilePage';
import EditClubPage from './pages/EditClubPage';
import ClubApprovalPage from './pages/ClubApprovalPage';
// ADD THIS
import NotificationsPage from './pages/notifications/NotificationsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import StudentManagementPage from './pages/admin/StudentManagementPage';
import FacultyManagersPage from './pages/admin/FacultyManagersPage';
import ShopHomePage from './pages/ShopHomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProductManagement from './pages/admin/ProductManagementPage';
import OrderManagement from './pages/admin/OrderManagementPage';
import CalendarView from './pages/CalendarView';
import EventDetailPage from './pages/EventDetailPage';
import MyEventsPage from './pages/MyEventsPage';
import AdminApprovalPage from './pages/admin/AdminApprovalPage';
import ChatPage from './pages/ChatPage';


// ── "Coming soon" placeholder ─────────────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <p className="text-5xl mb-4">🚧</p>
        <h2 className="text-xl font-bold text-white mb-2">{label}</h2>
        <p className="text-slate-400 text-sm">This section is under construction — check back soon!</p>
      </div>
    </div>
  );
}

export default function App() {
  // Apply persisted theme class to <html> on mount (prevents flash)
  const { isDark, applyTheme } = useThemeStore();
  useEffect(() => { applyTheme(isDark); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ─────────────────────────────────────────── */}
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/staff/login"  element={<StaffLoginPage />} />

          {/* ── Public club pages (viewable without login) ────────────── */}
          <Route path="/clubs"            element={<ClubsDiscoveryPage />} />
          <Route path="/clubs/:clubId"    element={<ClubProfilePage />} />

          {/* ── Protected routes ──────────────────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            {/* Smart root redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />

            {/* Profile */}
            <Route path="/profile/edit"  element={<EditProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />

            {/* Club — protected actions */}
            <Route path="/clubs/:clubId/edit" element={<EditClubPage />} />

            {/* ADD THIS */}
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Admin dashboard routes */}
            <Route path="/admin/dashboard"          element={<AdminDashboardPage />} />
            <Route path="/admin/users"              element={<AdminUsersPage />} />
            <Route path="/admin/users/students"     element={<StudentManagementPage />} />
            <Route path="/admin/faculty-managers"   element={<FacultyManagersPage />} />

            <Route path="/events"           element={<CalendarView />} />
            <Route path="/events/:id"       element={<EventDetailPage />} />
            <Route path="/my-events"        element={<MyEventsPage />} />
            <Route path="/chat"             element={<ChatPage />} />
            <Route path="/admin/approvals"  element={<AdminApprovalPage />} />
            <Route path="/volunteer" element={<ComingSoon label="Volunteer Hub" />} />
            
            {/* E-Shop Routes */}
            <Route path="/shop" element={<ShopHomePage />} />
            <Route path="/shop/product/:productId" element={<ProductDetailPage />} />
            <Route path="/shop/cart" element={<CartPage />} />
            <Route path="/shop/checkout" element={<CheckoutPage />} />
            <Route path="/shop/orders" element={<MyOrdersPage />} />
            
            {/* Admin Shop Routes */}
            <Route path="/admin/shop/products" element={<ProductManagement />} />
            <Route path="/admin/shop/orders" element={<OrderManagement />} />

            {/* Admin — SYSTEM_ADMIN or FACULTY_MANAGER */}
            <Route path="/admin/clubs/pending" element={<ClubApprovalPage />} />

            {/* Legacy admin route */}
            <Route element={<RoleProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
              <Route path="/admin" element={<ComingSoon label="Admin Dashboard" />} />
            </Route>
          </Route>

          {/* ── Catch-all ────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
