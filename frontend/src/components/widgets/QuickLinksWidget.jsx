import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { canApproveClubs } from '../../utils/roles';

const links = [
  {
    to: '/clubs',
    label: 'Clubs',
    description: 'Browse & join',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    color: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100',
  },
  {
    to: '/events',
    label: 'Events',
    description: 'What\'s happening',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    color: 'text-purple-600 bg-purple-50 group-hover:bg-purple-100',
  },
  {
    to: '/profile/me',
    label: 'Profile',
    description: 'Your info',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    color: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100',
  },
  {
    to: '/notifications',
    label: 'Alerts',
    description: 'Notifications',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    color: 'text-amber-600 bg-amber-50 group-hover:bg-amber-100',
  },
];

/**
 * QuickLinksWidget — grid of shortcut links for easy campus navigation.
 */
export default function QuickLinksWidget() {
  const store = useAuthStore();

  // Optionally add approvals link for admin/FM
  const allLinks = canApproveClubs(store)
    ? [
        ...links,
      ]
    : links;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        Quick Links
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {allLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-all"
          >
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${link.color}`}>
              {link.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                {link.label}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
