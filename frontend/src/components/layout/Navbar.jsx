import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { avatarColour, initials } from '../profile/ProfileCard';
import { canApproveClubs, isStudent } from '../../utils/roles';
// ADD THIS
import NotificationBell from '../notifications/NotificationBell';

export default function Navbar() {
  const { logout } = useAuth();
  const store = useAuthStore();
  const { displayName, profilePicUrl, isAuthenticated } = store;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colour = avatarColour(displayName || '');
  const abbr = initials(displayName || '?');

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight hidden sm:block">
              SLIIT UNI Connect
            </span>
          </Link>

          {/* ── Desktop nav links + right side ── */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && (
              <div className="flex items-center gap-1">
                <Link
                  to="/home"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/clubs"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Clubs
                </Link>
                {canApproveClubs(store) && (
                  <Link
                    to="/admin/clubs/pending"
                    className="px-3 py-1.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-slate-800 rounded-lg transition-colors font-medium"
                  >
                    Approvals
                  </Link>
                )}
              </div>
            )}
            {/* ADD THIS: bell icon for students */}
            {isAuthenticated && isStudent(store) && <NotificationBell />}

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar + name button */}
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-slate-800 transition-all"
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${colour}`}>
                    {profilePicUrl ? (
                      <img src={profilePicUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-white">{abbr}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <svg className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1 overflow-hidden">
                    <Link
                      to="/profile/me"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      to="/profile/edit"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </Link>
                    <div className="my-1 border-t border-slate-700" />
                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-all">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${colour}`}>
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white">{abbr}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-white">{displayName}</span>
              </div>
              <Link to="/profile/me" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors">My Profile</Link>
              <Link to="/clubs" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors">Clubs</Link>
              {canApproveClubs(store) && (
                <Link to="/admin/clubs/pending" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-orange-400 hover:bg-slate-800 transition-colors font-medium">Approvals</Link>
              )}
              <Link to="/profile/edit" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors">Edit Profile</Link>
              <button onClick={() => { setMobileOpen(false); logout(); }} className="block w-full text-left rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-slate-800 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-indigo-400 hover:bg-slate-800">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
