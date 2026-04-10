import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllClubs } from '../../api/clubApi';

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_BG = [
  'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30',
  'bg-slate-50 dark:bg-slate-700/40 border-slate-100 dark:border-slate-700',
  'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/20',
];

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2 animate-pulse">
      <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-28" />
        <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-16" />
      </div>
      <div className="h-3 w-10 bg-gray-200 dark:bg-slate-700 rounded" />
    </div>
  );
}

export default function LeaderboardSnapshotWidget() {
  const [clubs, setClubs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllClubs()
      .then((data) => {
        const sorted = [...data]
          .sort((a, b) => (b.followerCount ?? 0) - (a.followerCount ?? 0))
          .slice(0, 3);
        setClubs(sorted);
      })
      .catch(() => setClubs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
          <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 3h14a2 2 0 012 2v2a4 4 0 01-4 4H7a4 4 0 01-4-4V5a2 2 0 012-2zm7 13v3m-4 1h8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Top Clubs
        </h3>
        <Link
          to="/clubs"
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-1">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : clubs.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">No clubs yet</p>
      ) : (
        <div className="space-y-2">
          {clubs.map((club, i) => (
            <Link
              key={club.id}
              to={`/clubs/${club.id}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all hover:shadow-sm ${RANK_BG[i]}`}
            >
              {/* Rank medal */}
              <span className="text-base flex-shrink-0">{MEDAL[i]}</span>

              {/* Avatar */}
              {club.profilePicUrl ? (
                <img
                  src={club.profilePicUrl}
                  alt={club.name}
                  className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-white">{club.name?.[0]?.toUpperCase()}</span>
                </div>
              )}

              {/* Name + followers */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 dark:text-slate-200 truncate">{club.name}</p>
              </div>
              <span className="text-[11px] font-medium text-gray-400 dark:text-slate-500 flex-shrink-0">
                {club.followerCount ?? 0} followers
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
