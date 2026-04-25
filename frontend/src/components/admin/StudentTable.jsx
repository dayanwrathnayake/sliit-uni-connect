const roleBadge = {
  STUDENT:     'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300',
  CLUB_ADMIN:  'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
  DEPT_LEADER: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
};

const roleLabel = {
  STUDENT:     'Student',
  CLUB_ADMIN:  'Club Admin',
  DEPT_LEADER: 'Dept Leader',
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function StudentTable({ students, loading, onEdit, onDelete, onViewDetail }) {
  const headers = ['Student ID', 'Name', 'Email', 'Faculty', 'Role', 'Actions'];

  if (loading && students.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left">
                  {h}
                </th>
              ))}
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
      <div className="flex justify-center py-16">
        <div className="text-center">
          <svg className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-slate-400">No users found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider text-left whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
          {students.map((student) => (
            <tr
              key={student.studentId || student.id}
              className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              {/* Student ID */}
              <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-slate-400 whitespace-nowrap">
                {student.studentId}
              </td>

              {/* Name + Avatar */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {student.profilePicUrl ? (
                    <img src={student.profilePicUrl} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                        {student.displayName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-gray-800 dark:text-slate-200 whitespace-nowrap">
                    {student.displayName}
                  </span>
                </div>
              </td>

              {/* Email */}
              <td className="px-4 py-3 text-xs text-gray-600 dark:text-slate-400">
                {student.email}
              </td>

              {/* Faculty */}
              <td className="px-4 py-3 text-gray-700 dark:text-slate-300 whitespace-nowrap">
                {student.faculty || '—'}
              </td>

              {/* Role */}
              <td className="px-4 py-3">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[student.role] ?? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'}`}>
                  {roleLabel[student.role] ?? (student.role ?? 'Student')}
                </span>
              </td>

              {/* Actions — Update + Delete */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(student)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-300 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update
                  </button>
                  <button
                    onClick={() => onDelete(student)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
