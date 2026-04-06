import { useState, useRef, useEffect } from 'react';

const roleBadge = {
  STUDENT:     'bg-gray-100 text-gray-700',
  CLUB_ADMIN:  'bg-indigo-100 text-indigo-700',
  DEPT_LEADER: 'bg-purple-100 text-purple-700',
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

function ActionMenu({ user, onDeactivate, onActivate, onVerifyEmail, onViewDetail }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        title="Actions"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-1 overflow-hidden">
          <button onClick={() => { setOpen(false); onViewDetail(user.id); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            View Details
          </button>
          {!user.isEmailVerified && (
            <button onClick={() => { setOpen(false); onVerifyEmail(user.id); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50">
              Verify Email
            </button>
          )}
          {user.isActive ? (
            <button onClick={() => { setOpen(false); onDeactivate(user.id); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              Deactivate
            </button>
          ) : (
            <button onClick={() => { setOpen(false); onActivate(user.id); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50">
              Activate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function UserTable({ users, loading, onDeactivate, onActivate, onVerifyEmail, onViewDetail }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Student ID', 'Name', 'Faculty', 'Role', 'Status', 'Email Verified', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading && users.length === 0 ? (
            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{user.studentId}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {user.profilePicUrl ? (
                      <img src={user.profilePicUrl} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-700 text-xs font-bold">
                          {user.displayName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-gray-800 whitespace-nowrap">{user.displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{user.faculty || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[user.role] ?? roleBadge.STUDENT}`}>
                    {user.role?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.isActive ? (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                  ) : (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {user.isEmailVerified ? (
                    <svg className="h-4 w-4 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-gray-300 text-lg leading-none">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ActionMenu
                    user={user}
                    onDeactivate={onDeactivate}
                    onActivate={onActivate}
                    onVerifyEmail={onVerifyEmail}
                    onViewDetail={onViewDetail}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
