import { useState, useEffect, useCallback } from 'react';
import { getFacultyManagers } from '../api/adminApi';

export function useFacultyManagers() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFacultyManagers();
      setManagers(res.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load faculty managers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { managers, loading, error, refresh };
}

export default useFacultyManagers;
