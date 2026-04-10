import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { staffLogin } from '../api/staffApi';
import { useAuthStore } from '../store/authStore';
import { parseJwt } from '../utils/parseJwt';

/* ─────────────────────────────────────────
   Shared micro-components
───────────────────────────────────────── */
const Logo = () => (
  <div>
    <div className="flex items-center leading-none">
      <span className="font-black text-amber-400 tracking-tight text-3xl">SLIIT</span>
      <span className="font-black text-white tracking-tight text-3xl">&nbsp;UNI CONNECT</span>
    </div>
    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400/60">Staff Portal</p>
  </div>
);

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

const MailIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

/* Security-themed background illustration */
const SecurityIllustration = () => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
    {/* Outer ring */}
    <circle cx="200" cy="200" r="160" stroke="rgba(249,115,22,0.12)" strokeWidth="1" strokeDasharray="6 4" />
    <circle cx="200" cy="200" r="120" stroke="rgba(249,115,22,0.08)" strokeWidth="1" strokeDasharray="4 6" />
    <circle cx="200" cy="200" r="80" stroke="rgba(249,115,22,0.06)" strokeWidth="1" />

    {/* Central shield */}
    <path d="M200 120 L240 138 L240 176 Q240 210 200 230 Q160 210 160 176 L160 138 Z"
      fill="rgba(249,115,22,0.06)" stroke="rgba(249,115,22,0.25)" strokeWidth="1.5" />
    <path d="M200 140 L228 154 L228 180 Q228 206 200 220 Q172 206 172 180 L172 154 Z"
      fill="rgba(249,115,22,0.04)" stroke="rgba(249,115,22,0.15)" strokeWidth="1" />
    {/* Checkmark inside shield */}
    <path d="M188 180 L196 188 L214 166" stroke="rgba(249,115,22,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

    {/* Satellite nodes */}
    {[
      [200, 55], [320, 145], [340, 265], [200, 345], [60, 265], [80, 145],
    ].map(([cx, cy], i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r="6" fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="2.5" fill="rgba(249,115,22,0.5)" />
        <line x1={cx} y1={cy} x2="200" y2="200" stroke="rgba(249,115,22,0.07)" strokeWidth="1" />
      </g>
    ))}

    {/* Floating lock icons */}
    <rect x="50" y="50" width="18" height="14" rx="2" fill="none" stroke="rgba(249,115,22,0.2)" strokeWidth="1" />
    <path d="M54 50 V46 Q59 41 64 46 V50" fill="none" stroke="rgba(249,115,22,0.2)" strokeWidth="1" />

    <rect x="330" y="320" width="18" height="14" rx="2" fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="1" />
    <path d="M334 320 V316 Q339 311 344 316 V320" fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="1" />

    <rect x="340" y="80" width="14" height="11" rx="2" fill="none" stroke="rgba(249,115,22,0.12)" strokeWidth="1" />
    <path d="M343 80 V77 Q347 73 351 77 V80" fill="none" stroke="rgba(249,115,22,0.12)" strokeWidth="1" />
  </svg>
);

/* Role card */
const RoleCard = ({ icon, title, desc, accent }) => (
  <div className={`flex items-start gap-3 rounded-xl border ${accent.border} ${accent.bg} px-4 py-3`}>
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${accent.iconBorder} ${accent.iconBg}`}>
      {icon}
    </div>
    <div>
      <p className="text-[13px] font-semibold text-slate-100 leading-tight">{title}</p>
      <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* Input base style */
const inputBase = (hasError) =>
  `w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-150 focus:ring-2 ${
    hasError
      ? 'border-red-500/40 bg-red-500/5 focus:ring-red-500/20'
      : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14] focus:border-orange-500/50 focus:ring-orange-500/20 focus:bg-white/[0.06]'
  }`;

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function StaffLoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await staffLogin({ email: email.toLowerCase().trim(), password });
      const payload = parseJwt(response.accessToken);

      setAuth({
        accessToken: response.accessToken,
        refreshToken: null,
        userId: null,
        displayName: response.displayName,
        email: email.toLowerCase().trim(),
        role: response.role,
        faculty: response.faculty ?? null,
        userType: 'STAFF',
        profilePicUrl: null,
      });

      if (payload.role === 'SYSTEM_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/admin/clubs/pending');
      }
    } catch (err) {
      const msg = err?.response?.data?.error;
      setError(msg || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a14] px-4 py-10">
      <div className="w-full max-w-[1100px]">

        {/* ══════════ CARD ══════════ */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.6)] md:grid md:grid-cols-[55%_45%]">

          {/* ══════════ LEFT PANEL ══════════ */}
          <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-b from-[#1a0f00] via-[#120c0e] to-[#080c1a] px-10 pt-8 pb-6 overflow-hidden">

            {/* Corner glows */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-orange-500/20 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-12 -right-10 h-48 w-48 rounded-full bg-amber-500/10 blur-[80px]" />

            {/* Dot-grid texture */}
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-40"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(249,115,22,0.15) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* Security illustration as background */}
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-25">
              <SecurityIllustration />
            </div>

            {/* ① Logo + Main content */}
            <div className="relative z-10 space-y-5">
              <div>
                <Logo />
              </div>

              {/* Main content */}
              <div className="space-y-5">
                {/* Headline */}
                <div>
                  <h2 className="text-[28px] font-extrabold leading-tight tracking-tight text-white">
                    Staff Administration<br />
                    <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                      Portal
                    </span>
                  </h2>
                  <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                    Manage clubs, approvals, and platform settings for the SLIIT UNI-Connect ecosystem.
                  </p>
                </div>

                {/* Role cards */}
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">Staff Roles</p>
                  <div className="flex flex-col gap-3">
                    <RoleCard
                      icon={
                        <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      }
                      title="System Administrator"
                      desc="Full platform control, user management & analytics"
                      accent={{
                        border: 'border-orange-500/15',
                        bg: 'bg-orange-500/[0.06]',
                        iconBorder: 'border-orange-500/25',
                        iconBg: 'bg-orange-500/10',
                      }}
                    />
                    <RoleCard
                      icon={
                        <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                      }
                      title="Faculty Manager"
                      desc="Club approvals, faculty oversight & event review"
                      accent={{
                        border: 'border-amber-500/15',
                        bg: 'bg-amber-500/[0.06]',
                        iconBorder: 'border-amber-500/25',
                        iconBg: 'bg-amber-500/10',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ③ Footer */}
            <div className="relative z-10">
              {/* Security notice */}
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-orange-500/10 bg-orange-500/[0.05] px-4 py-3">
                <ShieldIcon />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Access restricted to authorised SLIIT staff only. All activity is monitored and logged.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-700">© 2026 SLIIT · UNI-Connect Platform</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-700">
                  <ShieldIcon />
                  <span>Secured</span>
                </div>
              </div>
            </div>

          </div>
          {/* ══════════ END LEFT PANEL ══════════ */}

          {/* ══════════ RIGHT PANEL ══════════ */}
          <div className="flex flex-col bg-[#0b1020] px-10 py-7">

            {/* Mobile logo */}
            <div className="mb-8 md:hidden">
              <Logo />
            </div>

            {/* ── ZONE ① Top: Badge + Heading ── */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold text-orange-400">
                <ShieldIcon />
                Staff Access
              </span>
              <div className="mt-4">
                <h1 className="text-[26px] font-bold tracking-tight text-white">Staff Sign In</h1>
                <p className="mt-1.5 text-[13px] text-slate-500">
                  For System Administrators and Faculty Managers only
                </p>
              </div>
            </div>

            {/* ── ZONE ② Middle: Form ── */}
            <form onSubmit={handleSubmit} noValidate className="mt-7 flex-1 space-y-4">

              {/* Error alert */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-[13px] text-red-400">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="staff-email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <MailIcon />
                  </span>
                  <input
                    id="staff-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@sliit.lk"
                    required
                    className={inputBase(false)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="staff-password">
                  Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <LockIcon />
                  </span>
                  <input
                    id="staff-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={`${inputBase(false)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label="Toggle password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-500 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {loading ? 'Signing in…' : 'Sign in to Staff Portal'}
              </button>

            </form>

            {/* ── ZONE ③ Bottom: Student link + Trust badges ── */}
            <div className="mt-5">
              <div className="mb-4 h-px w-full bg-white/[0.06]" />
              <p className="text-center text-sm text-slate-500">
                Student?{' '}
                <Link to="/login" className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300">
                  Login here →
                </Link>
              </p>
              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-700">
                <div className="flex items-center gap-1">
                  <ShieldIcon />
                  <span>256-bit SSL</span>
                </div>
                <span>·</span>
                <span>SLIIT Official</span>
                <span>·</span>
                <span>Staff Only</span>
              </div>
            </div>

          </div>
          {/* ══════════ END RIGHT PANEL ══════════ */}

        </div>
      </div>
    </div>
  );
}
