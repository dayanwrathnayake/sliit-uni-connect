import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isClubAdmin } from '../../utils/roles';

export default function CreatePostCard() {
  const store = useAuthStore();
  const { profilePicUrl, displayName } = store;
  const isAdmin = isClubAdmin(store);
  const firstLetter = (displayName || '?')[0].toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 mb-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 flex-shrink-0"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center ring-2 ring-white dark:ring-slate-700 flex-shrink-0">
            <span className="text-sm font-bold text-white">{firstLetter}</span>
          </div>
        )}

        {isAdmin ? (
          /* Club admins — link to their club to create a post */
          <Link
            to="/clubs"
            className="flex-1 rounded-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-700 px-4 py-2 text-sm text-gray-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            Share something with your club members…
          </Link>
        ) : (
          /* Regular students — encourage them to follow clubs */
          <Link
            to="/clubs"
            className="flex-1 rounded-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-700 px-4 py-2 text-sm text-gray-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            Follow clubs to see their updates here…
          </Link>
        )}
      </div>

      {/* Quick action buttons */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
        <Link
          to="/clubs"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Clubs
        </Link>
        <Link
          to="/events"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Events
        </Link>
        <Link
          to="/shop"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Shop
        </Link>
      </div>
    </div>
  );
}
