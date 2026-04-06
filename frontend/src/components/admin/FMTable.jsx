function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function FMTable({ managers, loading, onDeactivate, onRefresh }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Name', 'Email', 'Faculty', 'Status', 'Created', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
          ) : managers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                No Faculty Managers found — create one below.
              </td>
            </tr>
          ) : (
            managers.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{m.displayName}</td>
                <td className="px-4 py-3 text-gray-600">{m.email}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{m.faculty ?? '—'}</td>
                <td className="px-4 py-3">
                  {m.isActive ? (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                  ) : (
                    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(m.createdAt)}</td>
                <td className="px-4 py-3">
                  {m.isActive && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Deactivate ${m.displayName}? They will no longer be able to log in.`)) {
                          onDeactivate(m.id);
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
