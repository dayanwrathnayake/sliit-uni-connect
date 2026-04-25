import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminLayout from '../../components/admin/AdminLayout';
import StudentTable from '../../components/admin/StudentTable';
import CreateStudentModal from '../../components/admin/CreateStudentModal';
import EditStudentModal from '../../components/admin/EditStudentModal';
import ViewStudentDetailModal from '../../components/admin/ViewStudentDetailModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import ToastContainer from '../../components/common/ToastContainer';
import { useToast } from '../../hooks/useToast';
import { getUsers, deleteStudent } from '../../api/adminApi';

const FACULTIES = [
  { value: '', label: 'All Faculties' },
  { value: 'COMPUTING', label: 'Computing' },
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'HUMANITIES_AND_SCIENCE', label: 'Humanities & Science' },
];

const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'CLUB_ADMIN', label: 'Club Admin' },
];

export default function AdminUsersPage() {
  const { toast, showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUserId, setViewUserId] = useState(null);
  const [deleteUser_, setDeleteUser] = useState(null);
  const [filters, setFilters] = useState({ search: '', faculty: '', role: '' });
  const sentinelRef = useRef(null);

  const hasActiveFilter = filters.search || filters.faculty || filters.role;

  const [pdfLoading, setPdfLoading] = useState(false);

  async function downloadPdf() {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      // Fetch ALL matching users (no pagination) for the PDF
      const response = await getUsers({
        page: 0,
        size: 9999,
        search: filters.search,
        faculty: filters.faculty,
        role: filters.role,
      });
      const data = response.data?.content ?? response.data?.data ?? response.data ?? [];
      const list = Array.isArray(data) ? data : [];

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // ── Header bar ──────────────────────────────────────────────
      doc.setFillColor(67, 56, 202); // indigo-700
      doc.rect(0, 0, 297, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('SLIIT UNI-Connect - User List', 10, 13);

      // Timestamp + filter context (right-aligned)
      const now = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
      const filterParts = [
        filters.role ? `Role: ${filters.role.replace('_', ' ')}` : null,
        filters.faculty ? `Faculty: ${filters.faculty.replace('_', ' ')}` : null,
        filters.search ? `Search: "${filters.search}"` : null,
      ].filter(Boolean);
      const subtitle = filterParts.length ? filterParts.join(' · ') : 'All Users';
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${subtitle}  |  Generated: ${now}`, 287, 13, { align: 'right' });

      // ── Table ───────────────────────────────────────────────────
      const roleLabel = { STUDENT: 'Student', CLUB_ADMIN: 'Club Admin', DEPT_LEADER: 'Dept Leader' };

      autoTable(doc, {
        startY: 24,
        head: [['#', 'Student ID', 'Name', 'Email', 'Faculty', 'Role', 'Points']],
        body: list.map((u, i) => [
          i + 1,
          u.studentId ?? '—',
          u.displayName ?? '—',
          u.email ?? '—',
          u.faculty ?? '—',
          roleLabel[u.role] ?? u.role ?? '—',
          u.points ?? 0,
        ]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 255] },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 28 },
          3: { cellWidth: 60 },
          6: { halign: 'center', cellWidth: 18 },
        },
      });

      // ── Footer ──────────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`Page ${p} of ${pageCount}`, 287, 205, { align: 'right' });
      }

      const slug = [
        'users',
        filters.role || 'all',
        filters.faculty || 'all-faculties',
        new Date().toISOString().slice(0, 10),
      ].join('_');
      doc.save(`${slug}.pdf`);
      showToast('PDF downloaded successfully', 'success');
    } catch {
      showToast('Failed to generate PDF', 'error');
    } finally {
      setPdfLoading(false);
    }
  }

  async function fetchUsers(pageNum, reset = false) {
    try {
      setLoading(true);
      const response = await getUsers({
        page: pageNum,
        size: 20,
        search: filters.search,
        faculty: filters.faculty,
        role: filters.role,
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
            <div className="flex items-center gap-2">
              {/* Export PDF */}
              <button
                onClick={downloadPdf}
                disabled={pdfLoading || users.length === 0}
                title={pdfLoading ? 'Generating PDF…' : 'Download as PDF'}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pdfLoading ? (
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                )}
                {pdfLoading ? 'Downloading…' : 'Download PDF'}
              </button>

              {/* Add User */}
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
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            {hasActiveFilter && (
              <button
                onClick={() => setFilters({ search: '', faculty: '', role: '' })}
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
