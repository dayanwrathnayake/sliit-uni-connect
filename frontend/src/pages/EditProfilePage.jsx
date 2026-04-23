import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import PageLayout from '../components/layout/PageLayout';
import AvatarUploader from '../components/profile/AvatarUploader';


// ── Faculty → department mapping ─────────────────────────────────────────
// Each faculty only shows its own departments in the dropdown.
const FACULTY_DEPARTMENTS = {
  COMPUTING: [
    'Information Technology',
    'Data Science',
    'Software Engineering',
    'Cyber Security',
    'Computer Systems Engineering',
  ],
  ENGINEERING: [
    'Electrical & Electronic Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Material Science & Engineering',
  ],
  BUSINESS: [
    'Business Management',
    'Accounting & Finance',
    'Marketing',
    'Human Resource Management',
    'Entrepreneurship',
  ],
  HUMANITIES_AND_SCIENCE: [
    'English',
    'Psychology',
    'Mathematics',
    'Physics',
    'Applied Sciences',
  ],
};

// Fallback: all departments flattened (UNKNOWN faculty or not set)
const ALL_DEPARTMENTS = Object.values(FACULTY_DEPARTMENTS).flat();

// ── Spinner ───────────────────────────────────────────────────────────────
function Spinner() {
  return <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />;
}

// ── Toast ─────────────────────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-xl">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  );
}

// ── Read-only field (Student ID / Email) ──────────────────────────────────
function ReadOnlyField({ id, label, value, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor={id}>
        {label}
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-700/60 px-2 py-0.5 text-xs font-normal text-slate-500">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Cannot be changed
        </span>
      </label>
      <input
        id={id}
        type="text"
        value={value || ''}
        readOnly
        disabled
        className="w-full rounded-lg bg-slate-800/50 border border-slate-700/50 px-4 py-2.5 text-slate-500 text-sm cursor-not-allowed select-none font-mono"
      />
      {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
    </div>
  );
}

export default function EditProfilePage() {
  const { userId, profilePicUrl, setAuth, accessToken, refreshToken, role, faculty } = useAuthStore();
  const navigate = useNavigate();

  const [pendingPicUrl, setPendingPicUrl] = useState(profilePicUrl || null);
  const [apiError, setApiError] = useState('');
  const [toast, setToast] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);


  // Fetch full profile (has studentId, email, department, bio, etc.)
  useEffect(() => {
    if (!userId) return;
    api.get(`/api/users/${userId}/profile`)
      .then(({ data }) => setCurrentProfile(data))
      .catch(() => { });
  }, [userId]);


  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onTouched' });

  // Pre-populate editable fields when profile loads
  useEffect(() => {
    if (currentProfile) {
      reset({
        displayName: currentProfile.displayName || '',
        bio: currentProfile.bio || '',
        department: currentProfile.department || '',
      });
      if (currentProfile.profilePicUrl) {
        setPendingPicUrl(currentProfile.profilePicUrl);
      }
    }
  }, [currentProfile, reset]);

  const bioValue = watch('bio', '');

  // Pick the department list based on the user's faculty
  const departmentOptions = FACULTY_DEPARTMENTS[faculty] ?? ALL_DEPARTMENTS;

  const onSubmit = async (formData) => {
    setApiError('');
    try {
      const { data } = await api.put('/api/users/profile', {
        displayName: formData.displayName,
        bio: formData.bio,
        department: formData.department || null,
        profilePicUrl: pendingPicUrl || null,
      });

      // Keep Zustand in sync — especially displayName and profilePicUrl
      setAuth({
        accessToken,
        refreshToken,
        userId,
        displayName: data.displayName,
        role,
        faculty,
        profilePicUrl: data.profilePicUrl,
      });

      setToast(true);
      setTimeout(() => {
        setToast(false);
        navigate('/profile/me');
      }, 1500);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to save changes. Please try again.');
    }
  };

  const facultyLabel = {
    COMPUTING: 'Computing',
    ENGINEERING: 'Engineering',
    BUSINESS: 'Business',
    HUMANITIES_AND_SCIENCE: 'Humanities & Science',
  }[faculty] ?? faculty;

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto">

        {/* ── Page header ── */}
        <div className="mb-6 flex items-center gap-3">
          <Link to="/profile/me" className="text-slate-400 hover:text-white transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── Avatar ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            <AvatarUploader
              currentImageUrl={pendingPicUrl}
              onUploadSuccess={(url) => setPendingPicUrl(url)}
            />
          </div>

          {/* ── Read-only account info ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
              Account Information
            </p>

            <ReadOnlyField
              id="edit-sid"
              label="Student ID"
              value={currentProfile?.studentId}
            // hint="Your SLIIT-assigned student ID cannot be changed."
            />

            <ReadOnlyField
              id="edit-email"
              label="Email Address"
              value={currentProfile?.email}
            // hint="Contact SLIIT IT support to change your email."
            />
          </div>

          {/* ── Editable fields ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
              Profile Details
            </p>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="edit-name">
                Display Name
              </label>
              <input
                id="edit-name"
                type="text"
                autoComplete="name"
                className={`w-full rounded-lg bg-slate-800 border px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${errors.displayName ? 'border-red-500' : 'border-slate-700'}`}
                {...register('displayName', {
                  required: 'Display name is required',
                  minLength: { value: 2, message: 'Must be at least 2 characters' },
                })}
              />
              {errors.displayName && (
                <p className="mt-1.5 text-xs text-red-400">{errors.displayName.message}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="edit-bio">
                Bio
              </label>
              <textarea
                id="edit-bio"
                rows={4}
                maxLength={300}
                placeholder="Tell your campus community a bit about yourself…"
                className={`w-full rounded-lg bg-slate-800 border px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none ${errors.bio ? 'border-red-500' : 'border-slate-700'}`}
                {...register('bio', {
                  maxLength: { value: 300, message: 'Bio must be 300 characters or less' },
                })}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.bio
                  ? <p className="text-xs text-red-400">{errors.bio.message}</p>
                  : <span />}
                <p className={`text-xs ${(bioValue?.length ?? 0) > 280 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {bioValue?.length ?? 0} / 300
                </p>
              </div>
            </div>

            {/* Department — filtered by faculty */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300" htmlFor="edit-dept">
                  Department <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                {/* {faculty && facultyLabel && (
                  <span className="text-xs text-slate-500">
                    Select Your {facultyLabel} Department
                  </span>
                )} */}
              </div>
              <div className="relative">
                <select
                  id="edit-dept"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none pr-10"
                  {...register('department')}
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {/* Chevron icon */}
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ── API error ── */}
          {apiError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm text-red-400">{apiError}</p>
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            {isSubmitting ? <><Spinner /> Saving…</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {toast && <Toast message="Profile updated!" />}
    </PageLayout>
  );
}
