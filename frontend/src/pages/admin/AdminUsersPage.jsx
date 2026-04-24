import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import StudentTable from '../../components/admin/StudentTable';
import CreateStudentModal from '../../components/admin/CreateStudentModal';
import EditStudentModal from '../../components/admin/EditStudentModal';
import ViewStudentDetailModal from '../../components/admin/ViewStudentDetailModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import ToastContainer from '../../components/common/ToastContainer';
import { useToast } from '../../hooks/useToast';
import { getStudents, deleteStudent } from '../../api/adminApi';

const FACULTIES = [
  { value: '', label: 'All Faculties' },
  { value: 'Faculty of Computing', label: 'Computing' },
  { value: 'Faculty of Engineering', label: 'Engineering' },
  { value: 'Faculty of Business', label: 'Business' },
  { value: 'Faculty of Humanities & Science', label: 'Humanities & Science' },
];

export default function AdminUsersPage() {
  const { toast, showToast } = useToast();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [hasMore, setHasMore]   = useState(true);
  const [page, setPage]         = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser]               = useState(null);
  const [viewUserId, setViewUserId]           = useState(null);
  const [deleteUser_, setDeleteUser]          = useState(null);
  const [filters, setFilters]   = useState({ search: '', faculty: '' });
  const sentinelRef = useRef(null);

  const hasActiveFilter = filters.search || filters.faculty;

  async function fetchUsers(pageNum, reset = false) {
    try {
      setLoading(true);
      const response = await getStudents({
        page: pageNum,
        size: 20,
        search: filters.search,
        faculty: filters.faculty,
      });

      const data = response.data?.content ?? response.data?.data ?? response.data ?? [];
      const list = Array.isArray(data) ? data : [];

      if (reset) {
        setUsers(list);
      } else {
        setUsers((prev) => [...(Array.isArray(prev) ? prev : []), ...list]);
      }

      setHasMore(list.length === 20);
      setPage(pageNum);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchUsers(page + 1); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page]);

  // Reset on filter change
  useEffect(() => {
    fetchUsers(0, true);
  }, [filters]);

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">

        {/* Fixed top section */}
        <div className="flex-shrink-0 px-6 pt-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <span className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full px-3 py-1 text-sm font-medium">
                {Array.isArray(users) ? users.length : 0} shown
              </span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by name or student ID…"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 min-w-52 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={filters.faculty}
              onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
              className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {FACULTIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            {hasActiveFilter && (
              <button
                onClick={() => setFilters({ search: '', faculty: '' })}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable table */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <StudentTable
            students={users}
            loading={loading}
            onEdit={setEditUser}
            onDelete={setDeleteUser}
            onViewDetail={setViewUserId}
          />
          <div ref={sentinelRef} className="h-4" />
          {loading && users.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateStudentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { showToast('User created successfully'); fetchUsers(0, true); }}
        />
      )}

      {editUser && (
        <EditStudentModal
          student={editUser}
          onClose={() => setEditUser(null)}
          onSave={() => { showToast('User updated successfully'); fetchUsers(0, true); }}
        />
      )}

      {viewUserId && (
        <ViewStudentDetailModal
          studentId={viewUserId}
          onClose={() => setViewUserId(null)}
        />
      )}

      {deleteUser_ && (
        <DeleteConfirmationModal
          student={deleteUser_}
          onClose={() => setDeleteUser(null)}
          onConfirm={() => { showToast('User deleted'); fetchUsers(0, true); }}
        />
      )}

      <ToastContainer toast={toast} />
    </AdminLayout>
  );
}
