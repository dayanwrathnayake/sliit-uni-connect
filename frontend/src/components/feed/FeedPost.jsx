import { useState, useCallback } from 'react';
import PostCard from '../clubs/PostCard';
import { likePost } from '../../api/clubApi';

/**
 * Wraps PostCard for use inside the Home Feed.
 * Handles optimistic like toggling and shows a "From [ClubName]" source label.
 *
 * Props:
 *   post          – FeedPostResponseDTO from the backend
 *   showClubLabel – show "From [clubName]" header (default true)
 */
export default function FeedPost({ post, showClubLabel = true }) {
  const [liked, setLiked]         = useState(post.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const handleLikeToggle = useCallback(async () => {
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      await likePost(post.postId);
    } catch {
      // Revert on failure
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  }, [liked, post.postId]);

  // Build a post-shaped object compatible with PostCard
  const postForCard = {
    id:               post.postId,
    content:          post.content,
    imageUrl:         post.imageUrl,
    likeCount,
    likedByMe: liked,
    createdAt:        post.createdAt,
    authorName:       post.clubName,
    authorAvatarUrl:  post.clubProfilePicUrl,
  };

  return (
    <div className="group">
      {showClubLabel && (
        <div className="flex items-center gap-2 mb-1 px-1">
          {post.clubProfilePicUrl ? (
            <img
              src={post.clubProfilePicUrl}
              alt={post.clubName}
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 text-xs font-bold">
                {(post.clubName || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-500">
            From{' '}
            <a
              href={`/clubs/${post.clubId}`}
              className="font-medium text-indigo-600 hover:underline"
            >
              {post.clubName}
            </a>
          </span>
        </div>
      )}

      <PostCard
        post={postForCard}
        clubId={post.clubId}
        onLikeToggle={handleLikeToggle}
      />
    </div>
  );
}
