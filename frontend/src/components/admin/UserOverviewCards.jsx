import { Link } from 'react-router-dom';

export default function UserOverviewCards() {
  const cards = [
    {
      title: 'Student Management',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Manage all students, create, edit, delete, and control student status',
      stats: { count: 1234, label: 'Students' },
      link: '/admin/users/students',
      color: 'indigo',
    },
    {
      title: 'Club Admin Management',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      description: 'Manage club administrators and their permissions',
      stats: { count: 156, label: 'Club Admins' },
      link: '/admin/users/club-admins',
      color: 'purple',
    },
    {
      title: 'Faculty Manager Management',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Manage faculty managers and their permissions',
      stats: { count: 45, label: 'Managers' },
      link: '/admin/users/faculty-managers',
      color: 'amber',
    },
  ];

  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      border: 'border-indigo-200 dark:border-indigo-500/30',
      icon: 'text-indigo-600 dark:text-indigo-400',
      button: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      stat: 'text-indigo-700 dark:text-indigo-300',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      border: 'border-purple-200 dark:border-purple-500/30',
      icon: 'text-purple-600 dark:text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-500 text-white',
      stat: 'text-purple-700 dark:text-purple-300',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      border: 'border-amber-200 dark:border-amber-500/30',
      icon: 'text-amber-600 dark:text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-500 text-white',
      stat: 'text-amber-700 dark:text-amber-300',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => {
        const colors = colorMap[card.color];
        return (
          <div
            key={card.title}
            className={`${colors.bg} ${colors.border} border rounded-xl overflow-hidden transition-all hover:shadow-lg`}
          >
            <div className="p-6">
              {/* Icon */}
              <div className={`${colors.icon} mb-4`}>
                {card.icon}
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                {card.description}
              </p>

              {/* Stats */}
              <div className="mb-6 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <p className={`text-2xl font-bold ${colors.stat}`}>
                  {card.stats.count.toLocaleString()}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                  {card.stats.label}
                </p>
              </div>

              {/* Link Button */}
              <Link
                to={card.link}
                className={`block w-full text-center py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${colors.button}`}
              >
                Go to Management →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
