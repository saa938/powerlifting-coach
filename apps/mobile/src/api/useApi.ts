import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
}

/**
 * Minimal data-fetching hook (loading/error/refetch) so we avoid a heavier data
 * layer. Pass a stable `deps` array; the request re-runs when it changes.
 */
export function useApi<T>(fn: () => Promise<T>, deps: React.DependencyList = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    fn()
      .then((result) => {
        if (mounted.current) setData(result);
      })
      .catch((e: unknown) => {
        if (mounted.current) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    run();
    return () => {
      mounted.current = false;
    };
  }, [run]);

  return { data, error, loading, refetch: run };
}
