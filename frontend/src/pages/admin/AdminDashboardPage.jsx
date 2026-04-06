import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { getUserStats } from '../../api/adminApi';

function UsersIcon()  { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function CheckIcon()  { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>; }
function BanIcon()    { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>; }
function MailIcon()   { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }
function ShieldIcon() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>; }
function BriefcaseIcon() { return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }

function StatSkeleton() {
  return <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-28" />;
}

function QuickActionCard({ title, description, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:border-indigo-200 hover:shadow-sm transition-all group"
    >
      <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </button>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxFaculty = stats
    ? Math.max(...Object.values(stats.byFaculty ?? {}), 1)
    : 1;

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide stats for SLIIT UNI-Connect</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {loading ? (
            [...Array(5)].map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Total Students"    value={stats?.totalStudents ?? 0}    icon={<UsersIcon />}  color="indigo" />
              <StatCard label="Active Accounts"   value={stats?.activeStudents ?? 0}   icon={<CheckIcon />}  color="green" />
              <StatCard label="Inactive Accounts" value={stats?.inactiveStudents ?? 0} icon={<BanIcon />}    color="red" />
              <StatCard label="Unverified Emails" value={stats?.unverifiedStudents ?? 0} icon={<MailIcon />} color="amber" />
              <StatCard label="Club Admins"        value={stats?.clubAdmins ?? 0}       icon={<ShieldIcon />} color="blue" />
            </>
          )}
        </div>

        {/* Faculty breakdown */}
        {!loading && stats?.byFaculty && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Students by Faculty</h2>
            <div className="space-y-3">
              {Object.entries(stats.byFaculty).map(([faculty, count]) => (
                <div key={faculty} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-36 flex-shrink-0 text-right">{faculty}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxFaculty) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right flex-shrink-0">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionCard
              title="Manage Users"
              description="View and manage all student accounts"
              icon={<UsersIcon />}
              onClick={() => navigate('/admin/users')}
            />
            <QuickActionCard
              title="Faculty Managers"
              description="Manage FM accounts by faculty"
              icon={<BriefcaseIcon />}
              onClick={() => navigate('/admin/faculty-managers')}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
