import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

const PLACEHOLDER_CARDS = [
  {
    id: 'feed',
    title: 'Feed',
    emoji: '📰',
    description: 'Campus news, events, and posts from your network.',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    emoji: '📅',
    description: 'Upcoming events, deadlines, and club meetings.',
  },
  {
    id: 'shop',
    title: 'Shop',
    emoji: '🛍️',
    description: 'Buy and sell with your fellow SLIIT students.',
  },
];

export default function HomePage() {
  const { logout } = useAuth();
  const { displayName, role, faculty } = useAuthStore();

  const roleBadgeColor = {
    SYSTEM_ADMIN: 'bg-red-500/15 text-red-400 border-red-500/20',
    FACULTY_MANAGER: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    DEPT_LEADER: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    CLUB_ADMIN: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    STUDENT: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  }[role] || 'bg-slate-500/15 text-slate-400 border-slate-500/20';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Navbar ── */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight hidden sm:block">
              SLIIT UNI Connect
            </span>
          </div>

          {/* User controls */}
          <div className="flex items-center gap-3">
            {/* Role badge */}
            <span className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadgeColor}`}>
              {role}
            </span>
            {/* Display name */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {displayName?.charAt(0)?.toUpperCase() ?? '?'}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-200 hidden sm:block">{displayName}</span>
            </div>
            {/* Logout */}
            <button
              onClick={logout}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome banner */}
        <div className="mb-10 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20 p-6 sm:p-8">
          <p className="text-indigo-400 text-sm font-medium mb-1">Welcome back 👋</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {displayName ?? 'Student'}
          </h2>
          {faculty && (
            <p className="text-slate-400 text-sm">
              {faculty.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          )}
        </div>

        {/* Coming-soon cards */}
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Features coming soon
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLACEHOLDER_CARDS.map((card) => (
            <div
              key={card.id}
              className="group rounded-2xl bg-slate-900 border border-slate-800 p-6 hover:border-indigo-500/30 transition-all duration-200 cursor-default"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl group-hover:bg-indigo-600/20 transition">
                {card.emoji}
              </div>
              <h4 className="text-base font-semibold text-white mb-1">{card.title}</h4>
              <p className="text-slate-500 text-sm mb-4">{card.description}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
