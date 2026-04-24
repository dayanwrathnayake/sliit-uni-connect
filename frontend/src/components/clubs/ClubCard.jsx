import { useNavigate } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';

function firstLetter(name) {
  return (name || '?')[0].toUpperCase();
}

export default function ClubCard({ club }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/clubs/${club.id}`)}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden group"
    >
      {/* Banner */}
      <div className="h-32 w-full bg-cover bg-center overflow-hidden relative z-0"
        style={club.bannerUrl ? { backgroundImage: `url(${club.bannerUrl})` } : undefined}
      >
        {!club.bannerUrl && (
          <div className="h-32 w-full bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:scale-105 transition-transform duration-300" />
        )}
        {club.bannerUrl && (
          <div className="h-32 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: `url(${club.bannerUrl})` }}
          />
        )}
      </div>

      {/* Avatar + Info */}
      <div className="px-4 pb-4">
        {/* Avatar — overlaps banner */}
        <div className="-mt-8 mb-3 relative z-10">
          {club.profilePicUrl ? (
            <img
              src={club.profilePicUrl}
              alt={club.name}
              className="h-16 w-16 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-sm"
            />
          ) : (
            <div className="h-16 w-16 rounded-full border-4 border-white dark:border-slate-800 bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-2xl font-bold text-white">
                {firstLetter(club.name)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 leading-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {club.name}
          </h3>
        </div>
        <div className="mt-1 mb-1.5">
          <CategoryBadge category={club.category} />
        </div>

        {club.description && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {club.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {club.followerCount ?? 0} {club.followerCount === 1 ? 'follower' : 'followers'}
        </div>
      </div>
    </div>
  );
}
