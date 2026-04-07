import { useState } from 'react';
import { Link } from 'react-router-dom';

function formatTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function HeartIcon({ filled }) {
  return (
    <svg
      className={`h-5 w-5 transition-all ${filled ? 'fill-red-500 text-red-500 scale-110' : 'fill-none text-gray-400 dark:text-slate-500'}`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

const categoryColors = {
  TECHNOLOGY:    'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  ACADEMIC:      'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  SPORTS:        'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  ARTS:          'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  CULTURAL:      'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  SOCIAL:        'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  MEDIA:         'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  RELIGIOUS:     'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  FACULTY_MEDIA: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
};

export default function PostCard({ post, clubId, onLikeToggle, showClubHeader = true }) {
  const [liked, setLiked] = useState(post.likedByMe ?? false);
  const [count, setCount] = useState(post.likeCount ?? 0);
  const [liking, setLiking] = useState(false);
  const [pop, setPop] = useState(false);

  async function handleLike() {
    if (liking) return;
    const wasLiked = liked;
    const wasCount = count;

    setPop(true);
    setTimeout(() => setPop(false), 300);

    setLiked(!wasLiked);
    setCount(wasLiked ? wasCount - 1 : wasCount + 1);
    setLiking(true);

    try {
      await onLikeToggle(post.id, !wasLiked);
    } catch {
      setLiked(wasLiked);
      setCount(wasCount);
    } finally {
      setLiking(false);
    }
  }

  const avatarLetter = (post.authorName || '?')[0].toUpperCase();
  const categoryLabel = post.clubCategory
    ? post.clubCategory.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null;
  const categoryStyle = categoryColors[post.clubCategory] ?? 'bg-gray-50 text-gray-600 dark:bg-slate-700 dark:text-slate-400';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      {showClubHeader && (
        <div className="flex items-center gap-3 p-4 sm:p-5 pb-0 sm:pb-0">
          <Link to={`/clubs/${clubId}`} className="flex-shrink-0">
            {post.authorAvatarUrl ? (
              <img src={post.authorAvatarUrl} alt={post.authorName} className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-slate-700" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center ring-2 ring-gray-100 dark:ring-slate-700">
                <span className="text-sm font-bold text-white">{avatarLetter}</span>
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link to={`/clubs/${clubId}`} className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {post.authorName}
              </Link>
              {categoryLabel && (
                <span className={`hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryStyle}`}>
                  {categoryLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 sm:px-5 py-3">
        <p className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Post image — edge-to-edge */}
      {post.imageUrl && (
        <div className="w-full overflow-hidden">
          <img src={post.imageUrl} alt="Post attachment" className="w-full object-cover max-h-96" />
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 sm:px-5 py-3 border-t border-gray-50 dark:border-slate-700 flex items-center">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all disabled:opacity-60
            ${liked ? 'text-red-500' : 'text-gray-500 dark:text-slate-400 hover:text-red-400'}`}
        >
          <span className="inline-flex transition-transform" style={pop ? { animation: 'like-pop 0.3s ease-out' } : undefined}>
            <HeartIcon filled={liked} />
          </span>
          <span>{liked ? 'Liked' : 'Like'}</span>
          {count > 0 && <span className="text-gray-400 dark:text-slate-500 font-normal">{count}</span>}
        </button>

        <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors ml-5">
          <CommentIcon />
          <span className="hidden sm:inline">Comment</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors ml-auto">
          <ShareIcon />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      <style>{`
        @keyframes like-pop {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.35); }
          60%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
