import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
            <Route path="/"              element={<HomePage />} />

            {/* Profile */}
            <Route path="/profile/edit"  element={<EditProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />

            {/* Club — protected actions */}
            <Route path="/clubs/:clubId/edit" element={<EditClubPage />} />

            <Route path="/events"    element={<ComingSoon label="Events" />} />
            <Route path="/volunteer" element={<ComingSoon label="Volunteer Hub" />} />
            <Route path="/shop"      element={<ComingSoon label="Student Shop" />} />

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
