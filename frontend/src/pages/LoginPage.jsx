import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

// ── Inline icons ──────────────────────────────────────────────────────────
function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );
}

// ── Feature item for left panel ───────────────────────────────────────────
function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10">
        {icon}
      </div>
      <span className="text-sm text-slate-400">{text}</span>
    </div>
  );
}

// ── SVG icons for features ────────────────────────────────────────────────
const IconUsers = (
  <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconBell = (
  <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const IconCalendar = (
  <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconFeed = (
  <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' });

  // Already logged in — redirect away
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async ({ email, password }) => {
    setApiError('');
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Unable to connect. Please try again.';
      setApiError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 py-12">
      {/* Ambient glow behind the card */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* ── Split card ── */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] shadow-2xl md:grid md:grid-cols-2">

          {/* ── LEFT PANEL ── */}
          <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#0a0f1e] p-10 md:flex">
            {/* Corner glows */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-indigo-600/20 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-violet-600/15 blur-[70px]" />

            {/* Logo */}
            <div className="relative flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/30">
                <span className="text-base font-bold text-white">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">SLIIT UNI-Connect</span>
            </div>

            {/* Heading + features */}
            <div className="relative space-y-6">
              <div>
                <h2 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-white">
                  Your campus,<br />connected.
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  The official platform for SLIIT students — clubs, events, and your university community in one place.
                </p>
              </div>
              <div className="space-y-3">
                <Feature icon={IconUsers} text="Follow clubs & societies" />
                <Feature icon={IconBell} text="Real-time notifications" />
                <Feature icon={IconCalendar} text="Upcoming events feed" />
                <Feature icon={IconFeed} text="Personalised home feed" />
              </div>
            </div>

            {/* Footer */}
            <p className="relative text-xs text-slate-600">SLIIT © 2025 · UNI-Connect Platform</p>
          </div>

          {/* ── RIGHT PANEL (form) ── */}
          <div className="flex flex-col justify-center bg-[#0d1424] px-8 py-10">

            {/* Mobile-only logo */}
            <div className="mb-8 flex items-center gap-2 md:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700">
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <span className="text-base font-bold text-white">SLIIT UNI-Connect</span>
            </div>

            <div className="mb-7">
              <h1 className="text-xl font-semibold text-slate-100">Welcome back</h1>
              <p className="mt-1 text-sm text-slate-500">Sign in to your student account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-slate-500" htmlFor="login-email">
                  SLIIT Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="it23xxxxxx@my.sliit.lk"
                  className={`w-full rounded-lg border bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-red-500/60' : 'border-white/[0.08] focus:border-indigo-500/50'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-[11px] font-medium uppercase tracking-widest text-slate-500" htmlFor="login-password">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-indigo-400 transition hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`w-full rounded-lg border bg-white/[0.04] px-4 py-2.5 pr-11 text-sm text-slate-200 placeholder-slate-600 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.password ? 'border-red-500/60' : 'border-white/[0.08] focus:border-indigo-500/50'
                    }`}
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* API error */}
              {apiError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">{apiError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-150 hover:from-indigo-500 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0d1424] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <><Spinner /> Signing in…</> : 'Sign In'}
              </button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-indigo-400 transition hover:text-indigo-300">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
