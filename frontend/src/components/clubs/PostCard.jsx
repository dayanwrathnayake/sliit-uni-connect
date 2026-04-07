import { useState } from 'react';

function formatTimeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/**
 * PostCard — renders a single club post with optimistic like toggle.
 */
export default function PostCard({ post, clubId, onLikeToggle }) {
  const [liked, setLiked] = useState(post.likedByMe ?? false);
  const [count, setCount] = useState(post.likeCount ?? 0);
  const [liking, setLiking] = useState(false);

  async function handleLike() {
    if (liking) return;
    const wasLiked = liked;
    const wasCount = count;

    // Optimistic update
    setLiked(!wasLiked);
    setCount(wasLiked ? wasCount - 1 : wasCount + 1);
    setLiking(true);

    try {
      await onLikeToggle(post.id, !wasLiked);
    } catch {
      // Revert on failure
      setLiked(wasLiked);
      setCount(wasCount);
    } finally {
      setLiking(false);
    }
  }

  const avatarLetter = (post.authorName || post.clubName || '?')[0].toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {post.authorAvatarUrl || post.clubProfilePicUrl ? (
          <img
            src={post.authorAvatarUrl || post.clubProfilePicUrl}
            alt={post.authorName || post.clubName}
            className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{avatarLetter}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {post.authorName || post.clubName}
          </p>
          <p className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
        {post.content}
      </p>

      {/* Post image */}
      {post.imageUrl && (
        <div className="mt-3 rounded-lg overflow-hidden bg-gray-50">
          <img
            src={post.imageUrl}
            alt="Post attachment"
            className="w-full object-cover max-h-80"
          />
        </div>
      )}

      {/* Like button */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={liking}
          className="flex items-center gap-1.5 text-sm font-medium transition-all disabled:opacity-60 group/like"
        >
          <svg
            className={`h-5 w-5 transition-all ${
              liked
                ? 'fill-red-500 text-red-500 scale-110'
                : 'fill-none text-gray-400 group-hover/like:text-red-400 group-hover/like:scale-105'
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={liked ? 0 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className={`${liked ? 'text-red-500' : 'text-gray-500'} transition-colors`}>
            {count > 0 ? count : ''}
          </span>
        </button>
        <span className="text-xs text-gray-300">
          {count === 1 ? '1 like' : count > 1 ? `${count} likes` : ''}
        </span>
      </div>
    </div>
  );
}
