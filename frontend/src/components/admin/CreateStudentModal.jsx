import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getPasswordStrength, getStrengthColors, getRequirementStatus, validatePassword } from '../../utils/passwordValidation';
import { createStudent } from '../../api/adminApi';

const FACULTIES = {
  IT: 'Faculty of Computing',
  EN: 'Faculty of Engineering',
  BM: 'Faculty of Business',
  HS: 'Faculty of Humanities & Science',
};

function detectFaculty(studentId) {
  if (!studentId || studentId.length < 2) return null;
  const prefix = studentId.slice(0, 2).toUpperCase();
  return FACULTIES[prefix] || null;
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
const WarnIcon = () => (
  <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);
const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

// ─── Password Strength Meter Component ────────────────────────────────────────
const PasswordStrengthMeter = ({ password }) => {
  const { strength, score, label } = getPasswordStrength(password);
  const colors = getStrengthColors(strength);
  
  return (
    <div className="mt-2.5 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full overflow-hidden border border-gray-300 dark:border-slate-600">
          <div
            className={`h-full ${colors.bg} transition-all duration-300 ease-out`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${colors.text} whitespace-nowrap`}>
          {label}
        </span>
      </div>
    </div>
  );
};

// ─── Requirements Checklist Component ──────────────────────────────────────────
const PasswordRequirementsChecklist = ({ password, showChecklist }) => {
  if (!showChecklist) return null;
  
  const requirements = getRequirementStatus(password);

  return (
    <div className="mt-3 space-y-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30 p-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
        Requirements:
      </p>
      <div className="space-y-1.5">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={`text-sm font-semibold transition-colors duration-200 ${req.color}`}>
              {req.icon}
            </span>
            <span className={`text-xs transition-colors duration-200 ${req.isMet ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-slate-500'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CreateStudentModal({ onClose, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({ mode: 'onTouched' });

  const studentIdValue = watch('studentId', '');
  const passwordValue = watch('password', '');
  const faculty = detectFaculty(studentIdValue);
  const derivedEmail = studentIdValue ? `${studentIdValue.toLowerCase()}@my.sliit.lk` : '';

  const onSubmit = async (formData) => {
    setApiError('');
    setIsSubmitting(true);
    try {
      await createStudent({
        studentId: formData.studentId.toUpperCase(),
        displayName: formData.displayName,
        email: derivedEmail,
        password: formData.password,
        role: formData.role,
      });
      onSuccess();
      reset();
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to create student');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Student</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-slate-400 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 ${
                errors.displayName
                  ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                  : 'focus:ring-indigo-500'
              }`}
              {...register('displayName', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
            />
            {errors.displayName && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <WarnIcon />{errors.displayName.message}
              </p>
            )}
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-slate-400 mb-2">
              Student ID *
            </label>
            <input
              type="text"
              placeholder="e.g. IT23413474"
              style={{ textTransform: 'uppercase' }}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:ring-2 ${
                errors.studentId
                  ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                  : 'focus:ring-indigo-500'
              }`}
              {...register('studentId', {
                required: 'Student ID is required',
                pattern: {
                  value: /^[A-Za-z]{2}\d{6,8}$/,
                  message: 'Format: 2 letters + 6–8 digits (e.g. IT23413474)',
                },
              })}
            />
            {faculty && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                ✓ {faculty}
              </span>
            )}
            {faculty === null && studentIdValue && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">
                ✗ Invalid SLIIT ID prefix
              </span>
            )}
            {errors.studentId && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <WarnIcon />{errors.studentId.message}
              </p>
            )}
          </div>

          {/* Email - Auto-filled */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-slate-400 mb-2">
              Email * (Auto-filled)
            </label>
            <input
              type="email"
              readOnly
              value={derivedEmail}
              placeholder="it2xxxxxxx@my.sliit.lk"
              className="w-full cursor-not-allowed rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-gray-100 dark:bg-slate-700/50 text-gray-700 dark:text-slate-400 placeholder-gray-500 dark:placeholder-slate-600 outline-none"
            />
            <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-500">Generated from your Student ID - cannot be changed</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-slate-400 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 chars"
                className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                }`}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                  validate: {
                    uppercase: (v) => /[A-Z]/.test(v) || 'Add an uppercase letter',
                    lowercase: (v) => /[a-z]/.test(v) || 'Add a lowercase letter',
                    number: (v) => /[0-9]/.test(v) || 'Add a number',
                    special: (v) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) || 'Add a special character',
                  },
                })}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {passwordValue && <PasswordStrengthMeter password={passwordValue} />}
            {passwordFocused && passwordValue && <PasswordRequirementsChecklist password={passwordValue} showChecklist={true} />}
            {errors.password && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <WarnIcon />{errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-slate-400 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter password"
                className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                    : 'focus:ring-indigo-500'
                }`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === passwordValue || 'Passwords do not match',
                })}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <WarnIcon />{errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-slate-400 mb-2">
              Role *
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('role', { required: 'Role is required' })}
            >
              <option value="">Select a role</option>
              <option value="STUDENT">Student</option>
              <option value="CLUB_ADMIN">Club Admin</option>
              <option value="DEPT_LEADER">Dept Leader</option>
            </select>
            {errors.role && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <WarnIcon />{errors.role.message}
              </p>
            )}
          </div>

          {/* API Error */}
          {apiError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3">
              <span className="mt-0.5"><WarnIcon /></span>
              <p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {isSubmitting ? (
                <><Spinner />Creating...</>
              ) : (
                'Create Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
