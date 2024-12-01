import { useState, useEffect, useCallback } from 'react';
import { useNotification } from './useNotification';

export const useAsyncData = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const notify = useNotification();

  const loadData = useCallback(async () => {
    if (!fetchFn) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result || null);
      setError(null);
    } catch (err) {
      setError(err);
      notify.error('Error loading data');
      console.error('Error loading data:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, notify]);

  useEffect(() => {
    loadData();
  }, deps);

  return {
    data,
    loading,
    error,
    reload: loadData,
  };
}; 