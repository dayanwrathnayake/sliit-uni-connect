import AdminLayout from '../../components/admin/AdminLayout';
import UserOverviewCards from '../../components/admin/UserOverviewCards';

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Manage students, club administrators, and faculty managers in your institution
          </p>
        </div>

        {/* Overview Cards */}
        <UserOverviewCards />
      </div>
    </AdminLayout>
  );
}
