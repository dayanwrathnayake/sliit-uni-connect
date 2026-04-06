import { useState, useEffect, useCallback, useRef } from 'react';
import { getUsers } from '../api/adminApi';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useAdminUsers() {
  const [users, setUsers]     = useState([]);
  const [page, setPage]       = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [filters, setFilters] = useState({ search: '', faculty: '', role: '' });

  const debouncedSearch = useDebounce(filters.search, 400);

  // Stable ref to avoid stale closures in fetch
  const filtersRef = useRef(filters);
  filtersRef.current = { ...filters, search: debouncedSearch };

  const fetchPage = useCallback(async (pageNum, replace = false) => {
    setLoading(true);
    setError(null);
    try {
      const { search, faculty, role } = filtersRef.current;
      const res = await getUsers({ page: pageNum, size: 20, search, faculty, role });
      const data = res.data;
      const items = data.content ?? [];
      setUsers((prev) => (replace ? items : [...prev, ...items]));
      setHasMore(!data.last);
      setPage(pageNum);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch from page 0 when debounced search or other filters change
  useEffect(() => {
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.faculty, filters.role, fetchPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchPage(page + 1, false);
  }, [loading, hasMore, page, fetchPage]);

  const refresh = useCallback(() => {
    fetchPage(0, true);
  }, [fetchPage]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ search: '', faculty: '', role: '' });
  }, []);

  return {
    users,
    page,
    hasMore,
    loading,
    error,
    filters,
    loadMore,
    refresh,
    setFilter,
    resetFilters,
  };
}

export default useAdminUsers;
