import { useState } from 'react';
import { deleteStudent } from '../../api/adminApi';
import { useToast } from '../../hooks/useToast';

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4v2m0 5v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

export default function DeleteConfirmationModal({ student, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  async function handleDelete() {
    setError(null);
    setLoading(true);

    try {
      const response = await deleteStudent(student.id);
      const message = response.data?.message || `Student "${student.displayName}" has been deleted`;
      showToast(message, 'success');
      onConfirm();
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete student';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Student</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="text-red-500 dark:text-red-400">
              <WarningIcon />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Are you sure?
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              This action cannot be undone. The student record will be permanently deleted from the system.
            </p>
          </div>

          {/* Student Info */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100/50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {student.displayName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {student.displayName}
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400 font-mono">
                  {student.studentId}
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400 truncate">
                  {student.email}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Warning Message */}
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              ⚠️ This will remove all associated data including transactions, event registrations, and activity history.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading && <SpinnerIcon />}
            {loading ? 'Deleting...' : 'Delete Student'}
          </button>
        </div>
      </div>
    </div>
  );
}
