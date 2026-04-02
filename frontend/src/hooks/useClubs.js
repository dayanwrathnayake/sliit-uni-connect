import { useState, useCallback, useEffect } from 'react';
import { getAllClubs } from '../api/clubApi';

/**
 * Fetches all approved clubs.
 *
 * @returns {{ clubs, loading, error, refetch }}
 */
export function useClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllClubs();
      setClubs(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load clubs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { clubs, loading, error, refetch: fetch };
}

export default useClubs;
