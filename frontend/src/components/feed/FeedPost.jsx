import { useState, useCallback } from 'react';
import PostCard from '../clubs/PostCard';
import { likePost } from '../../api/clubApi';

export default function FeedPost({ post }) {
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
    id:              post.postId,
    content:         post.content,
    imageUrl:        post.imageUrl,
    likeCount,
    likedByMe:       liked,
    createdAt:       post.createdAt,
    authorName:      post.clubName,
    authorAvatarUrl: post.clubProfilePicUrl,
    clubCategory:    post.clubCategory,
  };

  return (
    <PostCard
      post={postForCard}
      clubId={post.clubId}
      onLikeToggle={handleLikeToggle}
      showClubHeader
    />
  );
}
