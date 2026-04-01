import PageLayout from '../components/layout/PageLayout';
import { useAuthStore } from '../store/authStore';

const PLACEHOLDER_CARDS = [
  { id: 'feed',     title: 'Feed',     emoji: '📰', description: 'Campus news, events, and posts from your network.' },
  { id: 'calendar', title: 'Calendar', emoji: '📅', description: 'Upcoming events, deadlines, and club meetings.' },
  { id: 'shop',     title: 'Shop',     emoji: '🛍️', description: 'Buy and sell with your fellow SLIIT students.' },
];

export default function HomePage() {
  const { displayName, faculty } = useAuthStore();

  const facultyLabel = faculty
    ? faculty.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : null;

  return (
    <PageLayout>
      {/* Welcome banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/20 p-6 sm:p-8">
        <p className="text-indigo-400 text-sm font-medium mb-1">Welcome back 👋</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {displayName ?? 'Student'}
        </h2>
        {facultyLabel && (
          <p className="text-slate-400 text-sm">{facultyLabel}</p>
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
    </PageLayout>
  );
}
