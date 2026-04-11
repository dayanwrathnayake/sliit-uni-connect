import { useState, useRef, useEffect } from 'react';

const roleBadge = {
  STUDENT:     'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300',
  CLUB_ADMIN:  'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
  DEPT_LEADER: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

function ActionMenu({ student, onEdit, onDelete, onActivate, onDeactivate, onViewDetail }) {
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
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
        title="Actions"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg dark:shadow-black/30 z-20 py-1 overflow-hidden">
          <button onClick={() => { setOpen(false); onViewDetail(student.id); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
          <button onClick={() => { setOpen(false); onEdit(student); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          {student.isActive ? (
            <button onClick={() => { setOpen(false); onDeactivate(student.id); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Deactivate
            </button>
          ) : (
            <button onClick={() => { setOpen(false); onActivate(student.id); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Activate
            </button>
          )}
          <div className="my-1 border-t border-gray-200 dark:border-slate-700" />
          <button onClick={() => { setOpen(false); onDelete(student); }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function StudentTable({ students, loading, onEdit, onDelete, onActivate, onDeactivate, onViewDetail }) {
  if (loading && students.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Student ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Faculty</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Points</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <svg className="h-12 w-12 text-gray-400 dark:text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-600 dark:text-slate-400">No students found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Student ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Name</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Email</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Faculty</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Points</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">Status</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
              <td className="px-4 py-3 font-mono text-gray-800 dark:text-slate-200 font-medium">{student.studentId}</td>
              <td className="px-4 py-3 text-gray-800 dark:text-slate-200">{student.displayName}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-slate-400 text-xs">{student.email}</td>
              <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{student.faculty || '-'}</td>
              <td className="px-4 py-3 text-gray-800 dark:text-slate-200 font-medium">{student.points || 0}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  student.isActive
                    ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-400'
                }`}>
                  {student.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <ActionMenu
                  student={student}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                  onViewDetail={onViewDetail}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
