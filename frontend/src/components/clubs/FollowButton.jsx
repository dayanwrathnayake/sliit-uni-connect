import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { followClub, unfollowClub } from '../../api/clubApi';
import { isStudent } from '../../utils/roles';

/**
 * Follow/Unfollow button — only renders for STUDENT userType.
 *
 * @param {{
 *   clubId: string,
 *   initialIsFollowing: boolean,
 *   followerCount: number,
 *   onToggle: (newIsFollowing: boolean, newCount: number) => void
 * }} props
 */
export default function FollowButton({ clubId, initialIsFollowing, followerCount, onToggle }) {
  const store = useAuthStore();
  const [following, setFollowing] = useState(initialIsFollowing);
  const [count, setCount] = useState(followerCount ?? 0);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Only students can follow
  if (!isStudent(store)) return null;

  async function handleToggle() {
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await unfollowClub(clubId);
        setFollowing(false);
        setCount((c) => Math.max(0, c - 1));
        onToggle?.(false, Math.max(0, count - 1));
      } else {
        await followClub(clubId);
        setFollowing(true);
        setCount((c) => c + 1);
        onToggle?.(true, count + 1);
      }
    } catch {
      // Silently revert — no change needed since we haven't applied change on error path
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = following
    ? hovered
      ? 'Unfollow'
      : 'Following'
    : 'Follow';

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-60
        ${following
          ? 'border border-indigo-600 text-indigo-600 hover:bg-red-50 hover:border-red-400 hover:text-red-500'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }
      `}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : null}
      {buttonLabel}
    </button>
  );
}
