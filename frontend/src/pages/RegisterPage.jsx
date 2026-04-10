import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

// ─── Faculty detection ────────────────────────────────────────────────────────
const FACULTY_MAP = {
  IT: 'Faculty of Computing',
  EN: 'Faculty of Engineering',
  BM: 'Faculty of Business',
  HS: 'Faculty of Humanities & Science',
};
function detectFaculty(studentId) {
  if (!studentId || studentId.length < 2) return null;
  const prefix = studentId.slice(0, 2).toUpperCase();
  return FACULTY_MAP[prefix] || false;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
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
const UserIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IdIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c0 1.306.835 2.417 2 2.829" />
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
const GiftIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

// ─── Shared logo ──────────────────────────────────────────────────────────────
const Logo = ({ size = 'md' }) => (
  <div>
    <div className="flex items-center leading-none">
      <span className={`font-black text-amber-400 tracking-tight ${size === 'sm' ? 'text-xl' : 'text-3xl'}`}>SLIIT</span>
      <span className={`font-black text-white tracking-tight ${size === 'sm' ? 'text-xl' : 'text-3xl'}`}>&nbsp;UNI CONNECT</span>
    </div>
    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400/60">
      Student Portal
    </p>
  </div>
);

// ─── Faculty badge ────────────────────────────────────────────────────────────
const FacultyBadge = ({ studentId }) => {
  const faculty = detectFaculty(studentId);
  if (faculty === null) return null;
  if (faculty === false) return (
    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-400">
      ✗ Invalid SLIIT ID prefix
    </span>
  );
  return (
    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
      ✓ {faculty}
    </span>
  );
};

// ─── Step indicator ───────────────────────────────────────────────────────────
const Step = ({ number, title, desc, isLast }) => (
  <div className="flex gap-3.5">
    <div className="flex flex-col items-center">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white shadow-md shadow-indigo-500/30">
        {number}
      </div>
      {!isLast && (
        <div className="mt-1 w-px flex-1 bg-gradient-to-b from-indigo-500/40 to-transparent" style={{ minHeight: '24px' }} />
      )}
    </div>
    <div className="pb-5 pt-1 min-w-0">
      <p className="text-[13px] font-semibold text-slate-100 leading-tight">{title}</p>
      <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

// ─── Mini feature card ────────────────────────────────────────────────────────
const MiniCard = ({ icon, title, accent }) => (
  <div className={`flex items-center gap-2.5 rounded-xl border bg-white/[0.03] px-3 py-2.5 ${accent.border}`}>
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${accent.iconBg}`}>
      {icon}
    </div>
    <p className="text-[12px] font-semibold text-slate-200">{title}</p>
  </div>
);

// ─── Feature icons ────────────────────────────────────────────────────────────
const IconClubs = (
  <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconCalendar = (
  <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconVolunteer = (
  <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
const IconShop = (
  <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

// ─── Input base class helper ──────────────────────────────────────────────────
const inputBase = (hasError) =>
  `w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-150 focus:ring-2 ${
    hasError
      ? 'border-red-500/40 bg-red-500/5 focus:ring-red-500/20'
      : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.14] focus:border-indigo-500/50 focus:ring-indigo-500/20 focus:bg-white/[0.06]'
  }`;

// ─── Main component ───────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { isLoading } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ mode: 'onTouched' });

  const studentIdValue = watch('studentId', '');
  const passwordValue  = watch('password', '');
  const derivedEmail   = studentIdValue ? `${studentIdValue.toLowerCase()}@my.sliit.lk` : '';

  if (!isLoading && isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (formData) => {
    setApiError('');
    try {
      await api.post('/api/auth/register', {
        studentId:    formData.studentId.toUpperCase(),
        email:        derivedEmail,
        password:     formData.password,
        displayName:  formData.displayName,
        referralCode: formData.referralCode || '',
      });
      setSuccess(true);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Unable to connect. Please try again.');
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060a14] px-4">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/10 blur-[130px]" />
        </div>
        <div className="relative w-full max-w-md text-center">
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b1020] px-10 py-12 shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Account created! 🎉</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Check your inbox at{' '}
              <span className="font-medium text-slate-300">{derivedEmail}</span>{' '}
              and verify your email before signing in.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-violet-500"
            >
              Go to Sign In
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Register page ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a14] px-4 py-10">

      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[30%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute right-[15%] bottom-[10%] h-[360px] w-[360px] rounded-full bg-violet-600/8 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[1100px]">

        {/* ════════════ CARD ════════════ */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.6)] md:grid md:grid-cols-[55%_45%]">

          {/* ══════════ LEFT PANEL ══════════ */}
          <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-b from-[#13113d] via-[#0e1430] to-[#080c1a] px-10 pt-7 pb-6 overflow-hidden">

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

            {/* ① Logo + Main content */}
            <div className="relative z-10 space-y-13">
            <div>
              <Logo size="md" />
            </div>

            {/* ② Main content */}
            <div className="space-y-7">

              {/* Headline */}
              <div>
                <h2 className="text-[28px] font-extrabold leading-tight tracking-tight text-white">
                  Join the SLIIT<br />
                  <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    community today.
                  </span>
                </h2>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-400">
                  Create your free account in minutes and unlock everything the SLIIT campus has to offer — clubs, events, rewards, and more.
                </p>
              </div>

              {/* 3-step process */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                  How it works
                </p>
                <Step number="1" title="Enter your Student ID" desc="We auto-detect your faculty and generate your SLIIT email" />
                <Step number="2" title="Set your password" desc="Choose a strong password to secure your account" />
                <Step number="3" title="Verify your email" desc="Click the link we send to activate your account" isLast />
              </div>

              {/* What you unlock */}
              <div>
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                  What you unlock
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <MiniCard icon={IconClubs}     title="Clubs & Societies" accent={{ border: 'border-indigo-500/15', iconBg: 'border-indigo-500/20 bg-indigo-500/10' }} />
                  <MiniCard icon={IconCalendar}  title="Event Calendar"    accent={{ border: 'border-violet-500/15', iconBg: 'border-violet-500/20 bg-violet-500/10' }} />
                  <MiniCard icon={IconVolunteer} title="Volunteer & Points" accent={{ border: 'border-amber-500/15',  iconBg: 'border-amber-500/20 bg-amber-500/10'  }} />
                  <MiniCard icon={IconShop}      title="E-Shop"            accent={{ border: 'border-emerald-500/15', iconBg: 'border-emerald-500/20 bg-emerald-500/10' }} />
                </div>
              </div>
            </div>
            </div>

            {/* ③ Footer */}
            <div className="relative z-10 flex items-center justify-between">
              <p className="text-[11px] text-slate-700">© 2026 SLIIT · UNI-Connect Platform</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-700">
                <ShieldIcon />
                <span>Secured</span>
              </div>
            </div>
          </div>
          {/* ══════════ END LEFT PANEL ══════════ */}

          {/* ══════════ RIGHT PANEL ══════════ */}
          <div className="flex flex-col bg-[#0b1020] px-10 py-7">

            {/* Mobile logo */}
            <div className="mb-8 md:hidden">
              <Logo size="sm" />
            </div>

            {/* ── ZONE ① Top: Badge + Heading ── */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                New Student Registration
              </span>
              <div className="mt-4">
                <h1 className="text-[26px] font-bold tracking-tight text-white">Create your account 🎓</h1>
                <p className="mt-1.5 text-[13px] text-slate-500">
                  Join 2,500+ students already on UNI-Connect
                </p>
              </div>
            </div>

            {/* ── ZONE ② Middle: Form ── */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 flex-1 space-y-3">

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="reg-name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <UserIcon />
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Dayan Wishwanath"
                    className={inputBase(errors.displayName)}
                    {...register('displayName', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                  />
                </div>
                {errors.displayName && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                    <WarnIcon />{errors.displayName.message}
                  </p>
                )}
              </div>

              {/* Student ID */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="reg-sid">
                  SLIIT Student ID
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <IdIcon />
                  </span>
                  <input
                    id="reg-sid"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g.IT23413474"
                    style={{ textTransform: 'uppercase' }}
                    className={`${inputBase(errors.studentId)} font-mono tracking-widest`}
                    {...register('studentId', {
                      required: 'Student ID is required',
                      pattern: {
                        value: /^[A-Za-z]{2}\d{6,8}$/,
                        message: 'Format: 2 letters + 6–8 digits (e.g. IT23413474)',
                      },
                    })}
                  />
                </div>
                <FacultyBadge studentId={studentIdValue} />
                {errors.studentId && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                    <WarnIcon />{errors.studentId.message}
                  </p>
                )}
              </div>

              {/* Email — auto-filled */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="reg-email">
                  Email Address
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] normal-case tracking-normal text-slate-500">
                    Auto-filled
                  </span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                    <MailIcon />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    readOnly
                    tabIndex={-1}
                    value={derivedEmail}
                    placeholder="it2xxxxxxx@my.sliit.lk"
                    className="w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-10 text-sm text-slate-500 placeholder-slate-700 outline-none select-none"
                  />
                  {derivedEmail && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-600">Generated from your Student ID - cannot be changed</p>
              </div>

              {/* Password + Confirm — side by side */}
              <div className="flex flex-col gap-2">
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="reg-password">
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <LockIcon />
                    </span>
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min. 8 chars"
                      className={`${inputBase(errors.password)} pr-10`}
                      {...register('password', {
                        required: 'Required',
                        minLength: { value: 8, message: 'Min. 8 characters' },
                      })}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1} aria-label="Toggle password" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300 focus:outline-none">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                      <WarnIcon />{errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="reg-confirm">
                    Confirm
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <LockIcon />
                    </span>
                    <input
                      id="reg-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter"
                      className={`${inputBase(errors.confirmPassword)} pr-10`}
                      {...register('confirmPassword', {
                        required: 'Required',
                        validate: v => v === passwordValue || 'Passwords do not match',
                      })}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} aria-label="Toggle confirm" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300 focus:outline-none">
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                      <WarnIcon />{errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Referral Code */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="reg-referral">
                  Referral Code
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] normal-case tracking-normal text-slate-500">
                    Optional
                  </span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <GiftIcon />
                  </span>
                  <input
                    id="reg-referral"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter a friend's referral code"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all hover:border-white/[0.14] focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20"
                    {...register('referralCode')}
                  />
                </div>
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
                className="group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0b1020] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {isSubmitting ? (
                  <><Spinner />Creating account…</>
                ) : (
                  <>
                    Create My Account
                    <svg className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* ── ZONE ③ Bottom: Sign in + Trust ── */}
            <div className="mt-5">
              <div className="mb-4 h-px w-full bg-white/[0.06]" />
              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300">
                  Sign in
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
