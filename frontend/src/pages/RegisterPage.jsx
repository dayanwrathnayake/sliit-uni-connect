import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

// ── Faculty detection ─────────────────────────────────────────────────────
const FACULTY_MAP = {
  IT: 'Faculty of Computing',
  EN: 'Faculty of Engineering',
  BM: 'Faculty of Business',
  HS: 'Faculty of Humanities & Science',
};

function detectFaculty(studentId) {
  if (!studentId || studentId.length < 2) return null;
  const prefix = studentId.slice(0, 2).toUpperCase();
  return FACULTY_MAP[prefix] || false; // false = invalid prefix
}

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
  return <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />;
}

// ── Faculty badge ─────────────────────────────────────────────────────────
function FacultyBadge({ studentId }) {
  const faculty = detectFaculty(studentId);
  if (faculty === null) return null; // fewer than 2 chars — show nothing

  if (faculty === false) {
    return (
      <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-400">
        ✗ Invalid SLIIT ID prefix
      </span>
    );
  }

  return (
    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
      ✓ {faculty}
    </span>
  );
}

export default function RegisterPage() {
  const { isLoading } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' });

  const studentIdValue = watch('studentId', '');
  const passwordValue = watch('password', '');

  // Auto-derive the email from the student ID
  const derivedEmail = studentIdValue
    ? `${studentIdValue.toLowerCase()}@my.sliit.lk`
    : '';

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (formData) => {
    setApiError('');
    try {
      await api.post('/api/auth/register', {
        studentId: formData.studentId.toUpperCase(),
        email: derivedEmail,
        password: formData.password,
        displayName: formData.displayName,
        referralCode: formData.referralCode || '',
      });
      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Unable to connect. Please try again.';
      setApiError(msg);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Account created!</h2>
            <p className="text-slate-400 text-sm mb-6">
              Please check your email to verify your account before signing in.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 text-sm transition-all"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* ── Logo ── */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SLIIT UNI Connect</span>
          </div>
          <p className="text-slate-400 text-sm">Your campus, connected.</p>
        </div>

        {/* ── Card ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-6">Create your account</h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-name">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder="Dayan Wishwanath"
                className={`w-full rounded-lg bg-slate-800 border px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.displayName ? 'border-red-500' : 'border-slate-700'}`}
                {...register('displayName', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
              />
              {errors.displayName && <p className="mt-1.5 text-xs text-red-400">{errors.displayName.message}</p>}
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-sid">
                SLIIT Student ID
              </label>
              <input
                id="reg-sid"
                type="text"
                autoComplete="off"
                placeholder="IT23413474"
                style={{ textTransform: 'uppercase' }}
                className={`w-full rounded-lg bg-slate-800 border px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono tracking-widest ${errors.studentId ? 'border-red-500' : 'border-slate-700'}`}
                {...register('studentId', {
                  required: 'Student ID is required',
                  pattern: {
                    value: /^[A-Za-z]{2}\d{6,8}$/,
                    message: 'Format: 2 letters + 6–8 digits (e.g. IT23413474)',
                  },
                })}
              />
              <FacultyBadge studentId={studentIdValue} />
              {errors.studentId && <p className="mt-1.5 text-xs text-red-400">{errors.studentId.message}</p>}
            </div>

            {/* Email — auto-filled from Student ID, read-only */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-email">
                Email address
                <span className="ml-2 text-xs font-normal text-slate-500">(auto-filled)</span>
              </label>
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  readOnly
                  tabIndex={-1}
                  value={derivedEmail}
                  placeholder="Enter your Student ID above"
                  className="w-full rounded-lg bg-slate-700/50 border border-slate-700 px-4 py-2.5 text-slate-400 placeholder-slate-600 text-sm cursor-not-allowed select-none"
                />
                {derivedEmail && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">Generated from your Student ID — cannot be changed</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className={`w-full rounded-lg bg-slate-800 border px-4 py-2.5 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.password ? 'border-red-500' : 'border-slate-700'}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition" tabIndex={-1} aria-label="Toggle password">
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-confirm">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className={`w-full rounded-lg bg-slate-800 border px-4 py-2.5 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.confirmPassword ? 'border-red-500' : 'border-slate-700'}`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === passwordValue || 'Passwords do not match',
                  })}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition" tabIndex={-1} aria-label="Toggle confirm password">
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-referral">
                Referral Code <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                id="reg-referral"
                type="text"
                autoComplete="off"
                placeholder="Optional — enter a friend's referral code"
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                {...register('referralCode')}
              />
            </div>

            {/* API error */}
            {apiError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400">{apiError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 mt-2"
            >
              {isSubmitting ? <><Spinner /> Creating account…</> : 'Create Account'}
            </button>
          </form>
        </div>

        {/* ── Footer ── */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
