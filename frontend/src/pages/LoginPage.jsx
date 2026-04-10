import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

// ─── Utility icons ────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);
const MailIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const LockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const WarnIcon = () => (
  <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// ─── Shared logo ──────────────────────────────────────────────────────────────
const Logo = ({ size = 'md' }) => (
  <div>
    <div className="flex items-center leading-none">
      <span className={`font-black text-amber-400 tracking-tight ${size === 'sm' ? 'text-xl' : 'text-2xl'}`}>SLIIT</span>
      <span className={`font-black text-white tracking-tight ${size === 'sm' ? 'text-xl' : 'text-2xl'}`}>&nbsp;UNI CONNECT</span>
    </div>
    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400/60">
      Student Porta
    </p>
  </div>
);

// ─── Decorative campus-network illustration ───────────────────────────────────
const NetworkIllustration = () => (
  <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full opacity-90">
    {/* Connection lines */}
    <line x1="60"  y1="90"  x2="130" y2="45"  stroke="#6366f1" strokeWidth="0.7" strokeOpacity="0.4" />
    <line x1="60"  y1="90"  x2="130" y2="135" stroke="#6366f1" strokeWidth="0.7" strokeOpacity="0.4" />
    <line x1="130" y1="45"  x2="200" y2="25"  stroke="#6366f1" strokeWidth="0.7" strokeOpacity="0.3" />
    <line x1="130" y1="45"  x2="210" y2="90"  stroke="#6366f1" strokeWidth="0.7" strokeOpacity="0.4" />
    <line x1="130" y1="135" x2="210" y2="90"  stroke="#6366f1" strokeWidth="0.7" strokeOpacity="0.4" />
    <line x1="130" y1="135" x2="200" y2="155" stroke="#6366f1" strokeWidth="0.7" strokeOpacity="0.3" />
    <line x1="210" y1="90"  x2="270" y2="55"  stroke="#818cf8" strokeWidth="0.7" strokeOpacity="0.35" />
    <line x1="210" y1="90"  x2="275" y2="125" stroke="#818cf8" strokeWidth="0.7" strokeOpacity="0.35" />
    <line x1="60"  y1="90"  x2="25"  y2="55"  stroke="#6366f1" strokeWidth="0.7" strokeOpacity="0.25" />
    <line x1="60"  y1="90"  x2="20"  y2="125" stroke="#6366f1" strokeWidth="0.7" strokeOpacity="0.25" />
    <line x1="130" y1="45"  x2="130" y2="135" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 3" />
    <line x1="60"  y1="90"  x2="210" y2="90"  stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 3" />

    {/* Outer small nodes */}
    <circle cx="25"  cy="55"  r="3"   fill="#4338ca" fillOpacity="0.5" />
    <circle cx="20"  cy="125" r="2.5" fill="#4338ca" fillOpacity="0.4" />
    <circle cx="200" cy="25"  r="3"   fill="#4338ca" fillOpacity="0.5" />
    <circle cx="200" cy="155" r="2.5" fill="#4338ca" fillOpacity="0.4" />
    <circle cx="270" cy="55"  r="3"   fill="#6366f1" fillOpacity="0.5" />
    <circle cx="275" cy="125" r="3"   fill="#6366f1" fillOpacity="0.5" />

    {/* Secondary nodes */}
    <circle cx="130" cy="45"  r="6"   fill="#4f46e5" fillOpacity="0.8" />
    <circle cx="130" cy="45"  r="10"  fill="#4f46e5" fillOpacity="0.15" />
    <circle cx="130" cy="135" r="6"   fill="#4f46e5" fillOpacity="0.8" />
    <circle cx="130" cy="135" r="10"  fill="#4f46e5" fillOpacity="0.15" />
    <circle cx="210" cy="90"  r="7"   fill="#6366f1" fillOpacity="0.85" />
    <circle cx="210" cy="90"  r="13"  fill="#6366f1" fillOpacity="0.12" />

    {/* Central hub — main node */}
    <circle cx="60"  cy="90"  r="18"  fill="#4f46e5" fillOpacity="0.12" />
    <circle cx="60"  cy="90"  r="11"  fill="#4f46e5" fillOpacity="0.25" />
    <circle cx="60"  cy="90"  r="6.5" fill="#6366f1" />
    {/* "S" letter in hub */}
    <text x="60" y="94" textAnchor="middle" fill="#fbbf24" fontSize="7" fontWeight="900" fontFamily="system-ui">S</text>

    {/* Floating avatar rings on secondary nodes */}
    <circle cx="130" cy="45"  r="6"   stroke="#818cf8" strokeWidth="1" fill="#1e1b4b" />
    <text x="130" y="49" textAnchor="middle" fill="#a5b4fc" fontSize="5.5" fontWeight="700" fontFamily="system-ui">A</text>

    <circle cx="130" cy="135" r="6"   stroke="#818cf8" strokeWidth="1" fill="#1e1b4b" />
    <text x="130" y="139" textAnchor="middle" fill="#a5b4fc" fontSize="5.5" fontWeight="700" fontFamily="system-ui">B</text>

    <circle cx="210" cy="90"  r="7"   stroke="#818cf8" strokeWidth="1" fill="#1e1b4b" />
    <text x="210" y="94" textAnchor="middle" fill="#a5b4fc" fontSize="6" fontWeight="700" fontFamily="system-ui">C</text>

    {/* Pulse rings on the hub */}
    <circle cx="60" cy="90" r="22" stroke="#6366f1" strokeWidth="0.6" strokeOpacity="0.2" fill="none" />
    <circle cx="60" cy="90" r="30" stroke="#6366f1" strokeWidth="0.4" strokeOpacity="0.1" fill="none" />
  </svg>
);

// ─── 2×2 feature card ────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, accent }) => (
  <div className={`flex flex-col gap-2.5 rounded-xl border bg-white/[0.03] p-3.5 transition-colors hover:bg-white/[0.055] ${accent.border}`}>
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${accent.iconBg}`}>
      {icon}
    </div>
    <div>
      <p className="text-[12.5px] font-semibold leading-tight text-slate-100">{title}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{desc}</p>
    </div>
  </div>
);

// ─── Feature icons ────────────────────────────────────────────────────────────
const IconClubs = (
  <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconCalendar = (
  <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconVolunteer = (
  <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
const IconShop = (
  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ mode: 'onTouched' });

  if (!isLoading && isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async ({ email, password }) => {
    setApiError('');
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a14] px-4 py-10">

      {/* ── Background atmosphere ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[30%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute right-[15%] bottom-[10%] h-[360px] w-[360px] rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute right-[35%] top-[10%] h-[200px] w-[200px] rounded-full bg-blue-600/5 blur-[90px]" />
      </div>

      <div className="relative w-full max-w-[1100px]">

        {/* ════════════════════ CARD ════════════════════ */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.6)] md:grid md:grid-cols-[55%_45%]">

          {/* ══════════ LEFT PANEL ══════════ */}
          <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-b from-[#13113d] via-[#0e1430] to-[#080c1a] px-10 pt-10 pb-8 overflow-hidden">

            {/* Corner glows */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/25 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-12 -right-10 h-48 w-48 rounded-full bg-violet-500/15 blur-[80px]" />

            {/* Dot-grid texture */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.18) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* Network illustration — absolute background layer */}
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-30">
              <div className="w-full px-4">
                <NetworkIllustration />
              </div>
            </div>

            {/* ① Logo */}
            <div className="relative z-10">
              <Logo size="md" />
            </div>

            {/* ② Headline + content */}
            <div className="relative z-10 space-y-4">

              {/* Headline */}
              <div>
                <h2 className="pt-4 text-[28px] font-extrabold leading-tight tracking-tight text-white">
                  Where SLIIT students<br />
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    connect &amp; thrive.
                  </span>
                </h2>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                  Join 2,500+ students discovering clubs, attending events, volunteering, and staying connected with the SLIIT community - All in one place.
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 divide-x divide-white/[0.08] rounded-xl border border-white/[0.08] bg-white/[0.04]">
                {[
                  { n: '2,500+', label: 'Students' },
                  { n: '50+',    label: 'Active Clubs' },
                  { n: '120+',   label: 'Events / yr' },
                ].map(({ n, label }) => (
                  <div key={label} className="py-3.5 text-center">
                    <p className="text-[15px] font-bold text-white">{n}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Features — 2×2 grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <FeatureCard
                  icon={IconClubs}
                  title="Clubs & Societies"
                  desc="Join clubs across all faculties"
                  accent={{ border: 'border-indigo-500/15', iconBg: 'border-indigo-500/20 bg-indigo-500/10' }}
                />
                <FeatureCard
                  icon={IconCalendar}
                  title="Event Calendar"
                  desc="Browse, RSVP & track events"
                  accent={{ border: 'border-violet-500/15', iconBg: 'border-violet-500/20 bg-violet-500/10' }}
                />
                <FeatureCard
                  icon={IconVolunteer}
                  title="Volunteer & Points"
                  desc="Earn points for activities"
                  accent={{ border: 'border-amber-500/15', iconBg: 'border-amber-500/20 bg-amber-500/10' }}
                />
                <FeatureCard
                  icon={IconShop}
                  title="E-Shop"
                  desc="Club merch & campus store"
                  accent={{ border: 'border-emerald-500/15', iconBg: 'border-emerald-500/20 bg-emerald-500/10' }}
                />
              </div>
            </div>

           

            {/* ④ Footer */}
            <div className="relative z-10 flex items-center justify-between">
              <p className="pt-4 text-[11px] text-slate-700">© 2026 SLIIT · UNI-Connect Platform</p>
              <div className="pt-4 flex items-center gap-1 text-[11px] text-slate-700">
                <ShieldIcon />
                <span>Secured</span>
              </div>
            </div>
          </div>
          {/* ══════════ END LEFT PANEL ══════════ */}

          {/* ══════════ RIGHT PANEL ══════════ */}
          <div className="flex flex-col bg-[#0b1020] px-10 py-10">

            {/* Mobile logo */}
            <div className="mb-8 md:hidden">
              <Logo size="sm" />
            </div>

            {/* ── ZONE ① Top: Badge + Heading ── */}
            <div>
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                SLIIT Verified Student Login
              </span>

              {/* Heading — sits tight below badge */}
              <div className="mt-4">
                <h1 className="text-[26px] font-bold tracking-tight text-white">Welcome back 👋</h1>
                <p className="mt-1.5 text-[13px] text-slate-500">
                  Sign in with your SLIIT student account to continue
                </p>
              </div>
            </div>

            {/* ── ZONE ② Middle: Form ── */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 flex-1 space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="login-email">
                  SLIIT Email Address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <MailIcon />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="it23xxxxxx@my.sliit.lk"
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-150 focus:ring-2 ${
                      errors.email
                        ? 'border-red-500/40 bg-red-500/5 focus:ring-red-500/20'
                        : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14] focus:border-indigo-500/50 focus:ring-indigo-500/20 focus:bg-white/[0.06]'
                    }`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@my\.sliit\.lk$/i,
                        message: 'Enter your @my.sliit.lk student email',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                    <WarnIcon />{errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="login-password">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <LockIcon />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`w-full rounded-xl border py-3 pl-10 pr-11 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-150 focus:ring-2 ${
                      errors.password
                        ? 'border-red-500/40 bg-red-500/5 focus:ring-red-500/20'
                        : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14] focus:border-indigo-500/50 focus:ring-indigo-500/20 focus:bg-white/[0.06]'
                    }`}
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                    <WarnIcon />{errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 shrink-0 cursor-pointer rounded border border-white/20 bg-white/[0.05] accent-indigo-500"
                  {...register('rememberMe')}
                />
                <label htmlFor="remember-me" className="cursor-pointer select-none text-sm text-slate-400 hover:text-slate-300 transition-colors">
                  Remember me for 30 days
                </label>
              </div>

              {/* API error */}
              {apiError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
                  <span className="mt-0.5"><WarnIcon /></span>
                  <p className="text-sm text-red-400">{apiError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0b1020] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {isSubmitting ? (
                  <><Spinner />Signing in…</>
                ) : (
                  <>
                    Sign In to UNI CONNECT
                    <svg className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* ── ZONE ③ Bottom: Register + Trust ── */}
            <div className="mt-8">
              {/* Divider */}
              <div className="mb-6 h-px w-full bg-white/[0.06]" />

              {/* Register */}
              <p className="text-center text-sm text-slate-500">
                New to UNI-Connect?{' '}
                <Link to="/register" className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300">
                  Create your account
                </Link>
              </p>

              {/* Trust badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-700">
                <div className="flex items-center gap-1">
                  <ShieldIcon />
                  <span>256-bit SSL</span>
                </div>
                <span>·</span>
                <span>SLIIT Official</span>
                <span>·</span>
                <span>Data Protected</span>
              </div>
            </div>

          </div>
          {/* ══════════ END RIGHT PANEL ══════════ */}

        </div>

        {/* Below-card staff link */}
        <p className="mt-4 text-center text-xs text-slate-700">
          Staff or admin?{' '}
          <Link to="/staff/login" className="text-slate-500 underline underline-offset-2 transition-colors hover:text-slate-300">
            Access the Staff Portal →
          </Link>
        </p>

      </div>
    </div>
  );
}
