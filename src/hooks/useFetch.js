import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching data from the API.
 *
 * Manages loading, error, and data states in a single hook,
 * following the unidirectional data flow pattern.
 *
 * @param {Function} fetchFn - Async function that returns { data }
 * @param {Array} deps - Dependency array to trigger re-fetch
 * @returns {{ data, loading, error, refetch }}
 *
 * @example
 * const { data: accounts, loading, error, refetch } = useFetch(fetchAccounts);
 */
export function useFetch(fetchFn, deps = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchFn();
      setState({ data: response.data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: err.message });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}
