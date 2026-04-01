import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

function CheckIcon() {
  return (
    <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await api.get(`/api/auth/verify-email?token=${token}`);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SLIIT UNI Connect</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-10 text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <h2 className="text-lg font-semibold text-white mb-2">Verifying your email…</h2>
              <p className="text-slate-400 text-sm">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckIcon />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Email verified!</h2>
              <p className="text-slate-400 text-sm mb-6">
                Your email has been verified. You can now sign in to SLIIT UNI Connect.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 text-sm transition-all"
              >
                Sign In
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
                <XIcon />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Link invalid or expired</h2>
              <p className="text-slate-400 text-sm mb-6">
                This verification link is invalid or has already expired. Please register again or contact support.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-2.5 text-sm transition-all"
              >
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
