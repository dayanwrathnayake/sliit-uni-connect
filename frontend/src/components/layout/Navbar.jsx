import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { avatarColour, initials } from '../profile/ProfileCard';
import { canApproveClubs, isStudent } from '../../utils/roles';
import NotificationBell from '../notifications/NotificationBell';
import useCartStore from '../../store/cartStore';

function SunIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

export default function Navbar() {
  const { logout } = useAuth();
  const store = useAuthStore();
  const { displayName, profilePicUrl, isAuthenticated } = store;
  const { isDark, toggleTheme } = useThemeStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const items = useCartStore(state => state.items);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const [badgeAnimate, setBadgeAnimate] = useState(false);

  useEffect(() => {
    if (itemCount > 0) {
      setBadgeAnimate(true);
      const timer = setTimeout(() => setBadgeAnimate(false), 400);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

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
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-0.5 flex-shrink-0">
            <span className="text-xl font-black text-amber-400 tracking-tight">SLIIT</span>
            <span className="text-xl font-black text-white tracking-tight"> UNI CONNECT</span>
          </Link>

          {/* ── Desktop nav links + right side ── */}
          <div className="hidden sm:flex items-center gap-2">
            {isAuthenticated && (
              <div className="flex items-center gap-1">
                <Link
                  to="/home"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/events"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Calendar
                </Link>
                <Link
                  to="/my-events"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  My Events
                </Link>
                <Link
                  to="/clubs"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Clubs
                </Link>
                <Link
                  to="/shop"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  E-Shop
                  to="/chat"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Chat
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

            {/* Dark/Light toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Notification bell (students only) */}
            {isAuthenticated && isStudent(store) && <NotificationBell />}

            {isAuthenticated && (
              <Link
                to="/shop/cart"
                id="nav-cart-link"
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Shopping Cart"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className={`absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm transition-transform ${badgeAnimate ? 'animate-pulse-scale' : 'zoom-in duration-300'}`}>
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
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

          {/* ── Mobile right side ── */}
          <div className="sm:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
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
              <Link to="/home" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors">Home</Link>
              <Link to="/profile/me" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors">My Profile</Link>
              <Link to="/clubs" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors">Clubs</Link>
              <Link to="/shop" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors">E-Shop</Link>
              <Link to="/shop/cart" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-between">
                <span>View Cart</span>
                {itemCount > 0 && <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{itemCount}</span>}
              </Link>
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
