import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import UserTable from '../../components/admin/UserTable';
import UserDetailModal from '../../components/admin/UserDetailModal';
import ToastContainer from '../../components/common/ToastContainer';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useToast } from '../../hooks/useToast';
import { deactivateUser, activateUser, verifyUserEmail } from '../../api/adminApi';

const FACULTIES = [
  { value: '',                      label: 'All Faculties' },
  { value: 'COMPUTING',             label: 'Computing' },
  { value: 'ENGINEERING',           label: 'Engineering' },
  { value: 'BUSINESS',              label: 'Business' },
  { value: 'HUMANITIES_AND_SCIENCE', label: 'Humanities & Science' },
];

const ROLES = [
  { value: '',           label: 'All Roles' },
  { value: 'STUDENT',   label: 'Student' },
  { value: 'CLUB_ADMIN', label: 'Club Admin' },
  { value: 'DEPT_LEADER', label: 'Dept Leader' },
];

function exportCsv(users) {
  const headers = ['Student ID', 'Name', 'Email', 'Faculty', 'Role', 'Active', 'Email Verified', 'Points', 'Member Since'];
  const rows = users.map((u) => [
    u.studentId ?? '',
    u.displayName ?? '',
    u.email ?? '',
    u.faculty ?? '',
    u.role ?? '',
    u.isActive ? 'Yes' : 'No',
    u.isEmailVerified ? 'Yes' : 'No',
    u.points ?? 0,
    u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : '',
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'users-export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminUsersPage() {
  const { toast, showToast } = useToast();
  const {
    users, loading, hasMore, filters,
    loadMore, refresh, setFilter, resetFilters,
  } = useAdminUsers();

  const [selectedUserId, setSelectedUserId] = useState(null);
  const sentinelRef = useRef(null);

  const hasActiveFilter = filters.search || filters.faculty || filters.role;

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  async function handleDeactivate(userId) {
    try {
      await deactivateUser(userId);
      showToast('User deactivated');
      refresh();
    } catch { showToast('Failed to deactivate user', 'error'); }
  }

  async function handleActivate(userId) {
    try {
      await activateUser(userId);
      showToast('User activated');
      refresh();
    } catch { showToast('Failed to activate user', 'error'); }
  }

  async function handleVerifyEmail(userId) {
    try {
      await verifyUserEmail(userId);
      showToast('Email verified');
      refresh();
    } catch { showToast('Failed to verify email', 'error'); }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-800">User Management</h1>
            <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm font-medium">
              {users.length} shown
            </span>
          </div>
          <button
            onClick={() => exportCsv(users)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by name or student ID…"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="flex-1 min-w-52 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filters.faculty}
            onChange={(e) => setFilter('faculty', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {FACULTIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select
            value={filters.role}
            onChange={(e) => setFilter('role', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {hasActiveFilter && (
            <button onClick={resetFilters} className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
              Reset Filters
            </button>
          )}
        </div>

        {/* Table */}
        <UserTable
          users={users}
          loading={loading}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
          onVerifyEmail={handleVerifyEmail}
          onViewDetail={(id) => setSelectedUserId(id)}
        />

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
        {loading && users.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        )}

        {/* User detail modal */}
        {selectedUserId && (
          <UserDetailModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
            onRefresh={refresh}
          />
        )}

        <ToastContainer toast={toast} />
      </div>
    </AdminLayout>
  );
}
