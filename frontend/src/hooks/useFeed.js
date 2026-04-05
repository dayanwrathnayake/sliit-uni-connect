import { useState, useCallback, useRef } from 'react';
import { getFeed } from '../api/feedApi';

/**
 * Manages paginated feed state with infinite scroll support.
 *
 * Returns:
 *   posts    - accumulated posts across all loaded pages
 *   loading  - true while fetching
 *   error    - string error message or null
 *   hasMore  - false when all pages have been loaded
 *   loadMore - fetches the next page and appends to posts
 *   refresh  - resets to page 0 and re-fetches
 */
export function useFeed() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef               = useRef(0);

  const fetchPage = useCallback(async (pageNum, replace = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFeed({ page: pageNum, size: 10 });
      // data = { content, totalPages, totalElements, number }
      setPosts((prev) => replace ? data.content : [...prev, ...data.content]);
      setHasMore(data.number < data.totalPages - 1);
      pageRef.current = pageNum;
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchPage(pageRef.current + 1, false);
  }, [loading, hasMore, fetchPage]);

  const refresh = useCallback(() => {
    pageRef.current = 0;
    setPosts([]);
    setHasMore(true);
    setError(null);
    fetchPage(0, true);
  }, [fetchPage]);

  return { posts, loading, error, hasMore, loadMore, refresh };
}

export default useFeed;
