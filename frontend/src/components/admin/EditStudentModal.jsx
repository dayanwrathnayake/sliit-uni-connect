import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { updateStudent } from '../../api/adminApi';
import { useToast } from '../../hooks/useToast';

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m6.364.636l-.707.707M21 12h-1m-.636 6.364l-.707-.707M12 21v-1m-6.364-.636l.707-.707M3 12h1m.636-6.364l.707.707" />
    </svg>
  );
}

export default function EditStudentModal({ student, onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      displayName: student?.displayName || '',
      role: student?.role || 'STUDENT',
      points: student?.points || 0,
      isActive: student?.isActive ?? true,
    },
  });

  const isActive = watch('isActive');

  async function onSubmit(data) {
    setError(null);
    setLoading(true);

    try {
      await updateStudent(student.studentId, {
        displayName: data.displayName,
        role: data.role,
        points: parseInt(data.points, 10),
        isActive: data.isActive,
      });
      showToast(`Student "${data.displayName}" updated successfully`);
      onSave();
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update student';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 p-6 border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Student</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <input
              {...register('displayName', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
              type="text"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-colors ${
                errors.displayName
                  ? 'border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400'
                  : 'border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              }`}
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-500">{errors.displayName.message}</p>
            )}
          </div>

          {/* Student ID (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Student ID
            </label>
            <input
              type="text"
              value={student?.studentId || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg font-mono bg-gray-50 dark:bg-slate-600 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Read-only</p>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={student?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-600 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Read-only</p>
          </div>

          {/* Faculty (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Faculty
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={student?.faculty || 'N/A'}
                disabled
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-600 text-gray-900 dark:text-white"
              />
              <span className="inline-block px-2.5 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded-full">
                ✓
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Read-only</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Role
            </label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="STUDENT">Student</option>
              <option value="CLUB_ADMIN">Club Admin</option>
              <option value="DEPT_LEADER">Dept Leader</option>
            </select>
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Loyalty Points
            </label>
            <input
              {...register('points', {
                required: 'Points is required',
                min: { value: 0, message: 'Points cannot be negative' },
              })}
              type="number"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-colors ${
                errors.points
                  ? 'border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400'
                  : 'border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              }`}
            />
            {errors.points && (
              <p className="mt-1 text-xs text-red-500">{errors.points.message}</p>
            )}
          </div>

          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              Account Status
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                {...register('isActive')}
                type="checkbox"
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className={`ml-3 text-sm font-medium ${
                isActive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {isActive ? 'Active Account' : 'Inactive Account'}
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {isActive ? 'Student can login and use the platform' : 'Student is suspended from the platform'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading && <SpinnerIcon />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
