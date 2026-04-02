import { useNavigate } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';

function firstLetter(name) {
  return (name || '?')[0].toUpperCase();
}

/**
 * Club summary card — click navigates to /clubs/:id.
 *
 * @param {{ club: object }} props
 */
export default function ClubCard({ club }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/clubs/${club.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Banner */}
      <div
        className="h-32 w-full bg-cover bg-center"
        style={
          club.bannerUrl
            ? { backgroundImage: `url(${club.bannerUrl})` }
            : undefined
        }
      >
        {!club.bannerUrl && (
          <div className="h-32 w-full bg-gradient-to-r from-indigo-500 to-purple-600" />
        )}
      </div>

      {/* Avatar + Info */}
      <div className="px-4 pb-4">
        {/* Avatar — overlaps banner */}
        <div className="-mt-8 mb-3">
          {club.profilePicUrl ? (
            <img
              src={club.profilePicUrl}
              alt={club.name}
              className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-sm"
            />
          ) : (
            <div className="h-16 w-16 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-2xl font-bold text-white">
                {firstLetter(club.name)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-1">
            {club.name}
          </h3>
          <CategoryBadge category={club.category} />
        </div>

        {club.description && (
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
            {club.description}
          </p>
        )}

        <p className="mt-2 text-xs text-gray-400">
          {club.followerCount ?? 0}{' '}
          {club.followerCount === 1 ? 'follower' : 'followers'}
        </p>
      </div>
    </div>
  );
}
