import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../clubs/PostCard';
import { likePost } from '../../api/clubApi';

/**
 * Wraps PostCard for use inside the Home Feed.
 * Handles optimistic like toggling and shows a "From [ClubName]" source label.
 */
export default function FeedPost({ post, showClubLabel = true }) {
  const [liked, setLiked]         = useState(post.likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const handleLikeToggle = useCallback(async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      await likePost(post.postId);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  }, [liked, post.postId]);

  const postForCard = {
    id:               post.postId,
    content:          post.content,
    imageUrl:         post.imageUrl,
    likeCount,
    likedByMe:        liked,
    createdAt:        post.createdAt,
    authorName:       post.clubName,
    authorAvatarUrl:  post.clubProfilePicUrl,
  };

  return (
    <div>
      {showClubLabel && (
        <div className="flex items-center gap-2 mb-1.5 px-1">
          {post.clubProfilePicUrl ? (
            <img
              src={post.clubProfilePicUrl}
              alt={post.clubName}
              className="h-5 w-5 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">
                {(post.clubName || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-500">
            From{' '}
            <Link
              to={`/clubs/${post.clubId}`}
              className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              {post.clubName}
            </Link>
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
