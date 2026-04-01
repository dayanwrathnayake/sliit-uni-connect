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

          {/* ── Protected routes ──────────────────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/"              element={<HomePage />} />

            {/* Profile — /profile/me resolved inside ProfilePage */}
            <Route path="/profile/edit"  element={<EditProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />

            <Route path="/clubs"     element={<ComingSoon label="Clubs & Societies" />} />
            <Route path="/events"    element={<ComingSoon label="Events" />} />
            <Route path="/volunteer" element={<ComingSoon label="Volunteer Hub" />} />
            <Route path="/shop"      element={<ComingSoon label="Student Shop" />} />

            {/* Admin — SYSTEM_ADMIN only */}
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
