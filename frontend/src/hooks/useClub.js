import { useState, useCallback, useEffect } from 'react';
import { getClub, getClubPosts } from '../api/clubApi';

/**
 * Fetches a single club and its posts in parallel.
 *
 * @param {string} clubId
 * @returns {{ club, posts, loading, error, refetch }}
 */
export function useClub(clubId) {
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    try {
      const [clubData, postsData] = await Promise.all([
        getClub(clubId),
        getClubPosts(clubId),
      ]);
      setClub(clubData);
      setPosts(postsData);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load club');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { club, posts, loading, error, refetch: fetch };
}

export default useClub;
