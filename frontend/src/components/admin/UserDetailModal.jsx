import { useState, useEffect } from 'react';
import { getUser, deactivateUser, activateUser, verifyUserEmail } from '../../api/adminApi';

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 dark:text-slate-200 font-medium break-all">{value ?? '—'}</p>
    </div>
  );
}

export default function UserDetailModal({ userId, onClose, onRefresh }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing]   = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getUser(userId)
      .then((res) => setUser(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  async function handleAction(fn) {
    setActing(true);
    try {
      await fn(userId);
      onRefresh?.();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setActing(false);
    }
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl dark:shadow-black/50 max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-700">
        {loading || !user ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                {user.profilePicUrl ? (
                  <img src={user.profilePicUrl} className="w-16 h-16 rounded-full object-cover flex-shrink-0" alt="" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 dark:text-indigo-400 text-2xl font-bold">
                      {user.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">{user.displayName}</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-mono">{user.studentId}</p>
                  {user.faculty && (
                    <span className="inline-block mt-1 text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full px-2 py-0.5 font-medium">
                      {user.faculty}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Email Verified" value={user.isEmailVerified ? 'Yes ✓' : 'No ✗'} />
              <InfoRow label="Faculty" value={user.faculty} />
              <InfoRow label="Department" value={user.department} />
              <InfoRow label="Role" value={user.role?.replace('_', ' ')} />
              <InfoRow label="Account Status" value={user.isActive ? 'Active' : 'Inactive'} />
              <InfoRow label="Points" value={user.points} />
              <InfoRow label="Referral Code" value={user.referralCode} />
              <InfoRow label="Clubs Following" value={user.followedClubsCount} />
              <InfoRow label="Member Since" value={formatDate(user.createdAt)} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-100 dark:border-slate-700">
              {!user.isEmailVerified && (
                <button
                  onClick={() => handleAction(verifyUserEmail)}
                  disabled={acting}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60 transition-colors"
                >
                  Verify Email
                </button>
              )}
              {user.isActive ? (
                <button
                  onClick={() => handleAction(deactivateUser)}
                  disabled={acting}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition-colors"
                >
                  Deactivate Account
                </button>
              ) : (
                <button
                  onClick={() => handleAction(activateUser)}
                  disabled={acting}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60 transition-colors"
                >
                  Activate Account
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
