import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

function GridIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function CubeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function ShoppingBagIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

const navItems = [
  { to: '/admin/dashboard',         label: 'Dashboard Overview',  Icon: GridIcon },
  { to: '/admin/users',             label: 'User Management',     Icon: UsersIcon },
  { to: '/admin/faculty-managers',  label: 'Faculty Managers',    Icon: BriefcaseIcon },
  { to: '/admin/clubs/pending',     label: 'Club Approvals',      Icon: CheckCircleIcon },
  { to: '/admin/shop/products',     label: 'Product Management',  Icon: CubeIcon },
  { to: '/admin/shop/orders',       label: 'Order Management',    Icon: ShoppingBagIcon },
  { to: '/admin/approvals',         label: 'Event Approvals',     Icon: CheckCircleIcon },
];

const activeClass   = 'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/20';
const inactiveClass = 'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200 transition-colors';

export default function AdminSidebar() {
  const navigate    = useNavigate();
  const { displayName, clearAuth } = useAuthStore();

  function handleLogout() {
    clearAuth();
    navigate('/staff/login');
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-screen sticky top-0 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center leading-none">
            <span className="font-black text-amber-400 tracking-tight text-lg">SLIIT</span>
            <span className="font-black text-gray-800 dark:text-white tracking-tight text-lg">&nbsp;UC</span>
          </div>
          <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 mx-0.5" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user info + logout */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-8 w-8 rounded-full bg-indigo-500/20 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-700 dark:text-indigo-400 font-bold text-xs">
              {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{displayName}</p>
            <span className="inline-block text-[10px] bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 rounded-full px-2 py-0.5 font-medium mt-0.5">
              System Admin
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </aside>
  );
}
