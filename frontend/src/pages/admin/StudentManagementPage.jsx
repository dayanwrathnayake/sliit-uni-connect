import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import StudentTable from '../../components/admin/StudentTable';
import CreateStudentModal from '../../components/admin/CreateStudentModal';
import EditStudentModal from '../../components/admin/EditStudentModal';
import ViewStudentDetailModal from '../../components/admin/ViewStudentDetailModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import ToastContainer from '../../components/common/ToastContainer';
import { useToast } from '../../hooks/useToast';
import { getStudents, activateStudent, deactivateStudent, deleteStudent, getStudentStats } from '../../api/adminApi';
import { exportStudentsAsPDF, exportStudentsAsCSV } from '../../utils/studentExport';

const FACULTIES = [
  { value: '', label: 'All Faculties' },
  { value: 'Faculty of Computing', label: 'Computing' },
  { value: 'Faculty of Engineering', label: 'Engineering' },
  { value: 'Faculty of Business', label: 'Business' },
  { value: 'Faculty of Humanities & Science', label: 'Humanities & Science' },
];

const STATUSES = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// Mock data for testing (remove when backend is ready)
const MOCK_STUDENTS = [
  { studentId: 'ENG12345', displayName: 'John Doe', email: 'eng12345@my.sliit.lk', faculty: 'Engineering', role: 'STUDENT', isActive: true, isEmailVerified: true, points: 150 },
  { studentId: 'CS12346', displayName: 'Sarah Johnson', email: 'cs12346@my.sliit.lk', faculty: 'Computing', role: 'STUDENT', isActive: true, isEmailVerified: true, points: 280 },
  { studentId: 'BUS12347', displayName: 'Mike Smith', email: 'bus12347@my.sliit.lk', faculty: 'Business', role: 'CLUB_ADMIN', isActive: true, isEmailVerified: false, points: 95 },
  { studentId: 'CS12348', displayName: 'Emily Davis', email: 'cs12348@my.sliit.lk', faculty: 'Computing', role: 'STUDENT', isActive: false, isEmailVerified: true, points: 420 },
  { studentId: 'HUM12349', displayName: 'Robert Brown', email: 'hum12349@my.sliit.lk', faculty: 'Humanities & Science', role: 'STUDENT', isActive: true, isEmailVerified: true, points: 310 },
  { studentId: 'ENG12350', displayName: 'Jessica Lee', email: 'eng12350@my.sliit.lk', faculty: 'Engineering', role: 'DEPT_LEADER', isActive: true, isEmailVerified: true, points: 550 },
  { studentId: 'CS12351', displayName: 'David Wilson', email: 'cs12351@my.sliit.lk', faculty: 'Computing', role: 'STUDENT', isActive: true, isEmailVerified: true, points: 180 },
  { studentId: 'BUS12352', displayName: 'Lisa Anderson', email: 'bus12352@my.sliit.lk', faculty: 'Business', role: 'STUDENT', isActive: true, isEmailVerified: false, points: 220 },
];

export default function StudentManagementPage() {
  const { toast, showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudentId, setViewStudentId] = useState(null);
  const [deleteStudent_, setDeleteStudent] = useState(null);
  const [filters, setFilters] = useState({ search: '', faculty: '', status: '' });
  const [apiError, setApiError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const sentinelRef = useRef(null);

  const hasActiveFilter = filters.search || filters.faculty || filters.status;

  // Fetch students
  const fetchStudents = async (pageNum, reset = false) => {
    try {
      setLoading(true);
      setApiError(null);
      
      // Use mock data if already in mock mode
      if (useMockData) {
        if (reset) {
          setStudents(MOCK_STUDENTS.slice(0, 20));
        } else {
          setStudents(prev => [...prev, ...MOCK_STUDENTS.slice((pageNum) * 20, (pageNum + 1) * 20)]);
        }
        setHasMore(false);
        setPage(pageNum);
        return;
      }

      const response = await getStudents({
        page: pageNum,
        size: 20,
        search: filters.search,
        faculty: filters.faculty,
        status: filters.status === 'active' ? 'true' : filters.status === 'inactive' ? 'false' : '',
      });
      
      if (reset) {
        setStudents(response.data.data || response.data);
      } else {
        setStudents(prev => [...prev, ...(response.data.data || response.data)]);
      }
      
      setHasMore((response.data.data || response.data).length === 20);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load students:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load students';
      setApiError(errorMsg);
      showToast(errorMsg, 'error');
      
      // Switch to mock data on API error
      if (!useMockData) {
        setUseMockData(true);
        if (reset) {
          setStudents(MOCK_STUDENTS.slice(0, 20));
        }
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchStudents(page + 1); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, page]);

  // Reset and fetch on filter change
  useEffect(() => {
    fetchStudents(0, true);
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchStudents(0, true);
  }, []);

  // CRUD Handlers
  const handleDeactivate = async (studentId) => {
    try {
      await deactivateStudent(studentId);
      showToast('Student deactivated');
      fetchStudents(0, true);
    } catch {
      showToast('Failed to deactivate student', 'error');
    }
  };

  const handleActivate = async (studentId) => {
    try {
      await activateStudent(studentId);
      showToast('Student activated');
      fetchStudents(0, true);
    } catch {
      showToast('Failed to activate student', 'error');
    }
  };

  const handleDelete = (student) => {
    setDeleteStudent(student);
  };

  const handleEdit = (student) => {
    setEditStudent(student);
  };

  const handleViewDetail = (studentId) => {
    setViewStudentId(studentId);
  };

  const handleExportPDF = () => {
    try {
      exportStudentsAsPDF(students, filters);
      showToast('Generating PDF report...');
    } catch (err) {
      showToast('Failed to export PDF', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      exportStudentsAsCSV(students, filters);
      showToast('CSV file downloaded');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
            <span className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full px-3 py-1 text-sm font-medium">
              {students.length} shown
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={students.length === 0}
              className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export as PDF report"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
            <button
              onClick={handleExportCSV}
              disabled={students.length === 0}
              className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export as CSV file"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Student
            </button>
          </div>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-200">Backend API Error</h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">{apiError}</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                  ℹ️ Showing sample data for demonstration. Please ensure the backend `/api/admin/students` endpoint is implemented and running.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-slate-400 mb-1">Total Students</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-slate-400 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{students.filter(s => s.isActive).length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-slate-400 mb-1">Inactive</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{students.filter(s => !s.isActive).length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
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
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {hasActiveFilter && (
            <button
              onClick={() => setFilters({ search: '', faculty: '', status: '' })}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Table */}
        <StudentTable
          students={students}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onViewDetail={handleViewDetail}
        />

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
        {loading && students.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <CreateStudentModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              showToast('Student created successfully');
              fetchStudents(0, true);
            }}
          />
        )}

        {/* Edit Modal */}
        {editStudent && (
          <EditStudentModal
            student={editStudent}
            onClose={() => setEditStudent(null)}
            onSave={() => {
              fetchStudents(0, true);
            }}
          />
        )}

        {/* View Detail Modal */}
        {viewStudentId && (
          <ViewStudentDetailModal
            studentId={viewStudentId}
            onClose={() => setViewStudentId(null)}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteStudent_ && (
          <DeleteConfirmationModal
            student={deleteStudent_}
            onClose={() => setDeleteStudent(null)}
            onConfirm={() => {
              fetchStudents(0, true);
            }}
          />
        )}

        <ToastContainer toast={toast} />
      </div>
    </AdminLayout>
  );
}
