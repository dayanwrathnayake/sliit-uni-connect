import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getUserStats } from '../../api/adminApi';
import { useAuthStore } from '../../store/authStore';

function Svg({ d, size = 'h-5 w-5' }) {
  return (
    <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 animate-pulse h-28" />
    );
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">{label}</span>
        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{Number(value).toLocaleString()}</p>
    </div>
  );
}

// ── Faculty row ───────────────────────────────────────────────────────────────

function FacultyRow({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-600 dark:text-slate-400">{label}</span>
        <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{count}</span>
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Quick action tile ─────────────────────────────────────────────────────────

function ActionTile({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
    >
      <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-200 transition-colors text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const navigate           = useNavigate();
  const { displayName }    = useAuthStore();
  const [stats, setStats]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const total      = stats?.totalStudents ?? 0;
  const maxFaculty = stats ? Math.max(...Object.values(stats.byFaculty ?? {}), 1) : 1;

  return (
    <AdminLayout>
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-7">

          {/* Header */}
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">{today}</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {displayName ? `Welcome, ${displayName.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">
              SLIIT UNI-Connect — Admin Overview
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Users"
              value={total}
              loading={loading}
              icon={<Svg size="h-4 w-4" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
            />
            <StatCard
              label="Active"
              value={stats?.activeStudents ?? 0}
              loading={loading}
              icon={<Svg size="h-4 w-4" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
            />
            <StatCard
              label="Club Admins"
              value={stats?.clubAdmins ?? 0}
              loading={loading}
              icon={<Svg size="h-4 w-4" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
            />
            <StatCard
              label="Unverified"
              value={stats?.unverifiedStudents ?? 0}
              loading={loading}
              icon={<Svg size="h-4 w-4" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
            />
          </div>

          {/* Quick Actions — full width */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 px-5 pt-5 pb-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">
              Quick Actions
            </p>
            <div className="grid grid-cols-5">
              <ActionTile
                label="User Management"
                onClick={() => navigate('/admin/users')}
                icon={<Svg size="h-5 w-5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
              />
              <ActionTile
                label="Club Management"
                onClick={() => navigate('/admin/clubs')}
                icon={<Svg size="h-5 w-5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
              />
              <ActionTile
                label="Product Management"
                onClick={() => navigate('/admin/shop/products')}
                icon={<Svg size="h-5 w-5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
              />
              <ActionTile
                label="Order Management"
                onClick={() => navigate('/admin/shop/orders')}
                icon={<Svg size="h-5 w-5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
              />
              <ActionTile
                label="Event Approvals"
                onClick={() => navigate('/admin/approvals')}
                icon={<Svg size="h-5 w-5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
              />
            </div>
          </div>

          {/* Users by Faculty — full width below */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-5">
              Users by Faculty
            </p>
            {loading ? (
              <div className="space-y-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-2.5 w-24 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(stats?.byFaculty ?? {}).map(([faculty, count]) => (
                  <FacultyRow key={faculty} label={faculty} count={count} total={total} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
