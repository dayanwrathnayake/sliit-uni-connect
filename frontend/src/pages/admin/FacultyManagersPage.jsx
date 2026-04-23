import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import FMTable from '../../components/admin/FMTable';
import CreateFMModal from '../../components/admin/CreateFMModal';
import ToastContainer from '../../components/common/ToastContainer';
import { useFacultyManagers } from '../../hooks/useFacultyManagers';
import { useToast } from '../../hooks/useToast';
import { deactivateFacultyManager } from '../../api/adminApi';

export default function FacultyManagersPage() {
  const { managers, loading, refresh } = useFacultyManagers();
  const { toast, showToast }           = useToast();
  const [createOpen, setCreateOpen]    = useState(false);

  async function handleDeactivate(staffId) {
    try {
      await deactivateFacultyManager(staffId);
      showToast('Faculty Manager deactivated');
      refresh();
    } catch {
      showToast('Failed to deactivate', 'error');
    }
  }

  // Faculty summary badges — count active FMs per faculty
  const facultyCounts = managers.reduce((acc, m) => {
    if (m.faculty) {
      const label = facultyLabel(m.faculty);
      acc[label] = (acc[label] ?? 0) + 1;
    }
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="h-full overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-gray-800">Faculty Managers</h1>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Faculty Manager
          </button>
        </div>

        {/* Faculty summary badges */}
        {Object.keys(facultyCounts).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(facultyCounts).map(([faculty, count]) => (
              <span
                key={faculty}
                className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 font-medium"
              >
                {faculty}
                <span className="bg-indigo-200 text-indigo-800 rounded-full px-1.5 font-bold">{count}</span>
              </span>
            ))}
          </div>
        )}

        {/* Table */}
        <FMTable
          managers={managers}
          loading={loading}
          onDeactivate={handleDeactivate}
          onRefresh={refresh}
        />

        {/* Create FM modal */}
        {createOpen && (
          <CreateFMModal
            onClose={() => setCreateOpen(false)}
            onCreated={() => { setCreateOpen(false); refresh(); }}
          />
        )}

        <ToastContainer toast={toast} />
      </div>
    </AdminLayout>
  );
}

function facultyLabel(faculty) {
  const map = {
    COMPUTING:              'Computing',
    ENGINEERING:            'Engineering',
    BUSINESS:               'Business',
    HUMANITIES_AND_SCIENCE: 'Humanities & Science',
  };
  return map[faculty] ?? faculty;
}
