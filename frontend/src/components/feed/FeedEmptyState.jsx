import { useNavigate } from 'react-router-dom';

function ActionCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-700 rounded-xl p-4 text-left transition-all group w-full"
    >
      <div className="h-9 w-9 rounded-lg bg-white dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 shadow-sm transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{title}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

export default function FeedEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-8 text-center">
      <div className="mx-auto h-20 w-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-5">
        <svg className="h-10 w-10 text-indigo-400 dark:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-1">Your feed is waiting</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
        Follow clubs to see their posts, updates, and announcements right here.
      </p>

      <div className="space-y-2 max-w-sm mx-auto">
        <ActionCard
          onClick={() => navigate('/clubs')}
          title="Follow your first club"
          description="Browse clubs by faculty and interest"
          icon={
            <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <ActionCard
          onClick={() => navigate('/profile/edit')}
          title="Complete your profile"
          description="Add a photo, bio, and department info"
          icon={
            <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <ActionCard
          onClick={() => navigate('/clubs')}
          title="Explore trending clubs"
          description="See what's popular on campus right now"
          icon={
            <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
