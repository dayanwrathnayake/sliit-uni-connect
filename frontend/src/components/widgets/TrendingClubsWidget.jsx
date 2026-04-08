import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllClubs } from '../../api/clubApi';

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24" />
        <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded w-16" />
      </div>
    </div>
  );
}

export default function TrendingClubsWidget() {
  const [clubs, setClubs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllClubs()
      .then((data) => {
        const sorted = [...data].sort((a, b) => (b.followerCount ?? 0) - (a.followerCount ?? 0));
        setClubs(sorted.slice(0, 3));
      })
      .catch(() => setClubs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Trending Clubs</h3>
        <Link to="/clubs" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">
          View all
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
        <div className="space-y-1">
          {clubs.map((club, i) => (
            <Link
              key={club.id}
              to={`/clubs/${club.id}`}
              className="flex items-center gap-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 px-1 -mx-1 transition-colors"
            >
              <div className="relative flex-shrink-0">
                {club.profilePicUrl ? (
                  <img src={club.profilePicUrl} alt={club.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{club.name?.[0]?.toUpperCase()}</span>
                  </div>
                )}
                {i === 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-400 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    1
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{club.name}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  {club.followerCount ?? 0} {club.followerCount === 1 ? 'follower' : 'followers'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
