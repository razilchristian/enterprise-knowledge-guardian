"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Load something from the backend once, with loading and error state.
 *
 * The fetch is kept out of the effect body so no setState happens
 * synchronously during render — React 19 flags that, and it causes cascading
 * renders. `reload` is for explicit refresh buttons.
 *
 * Pass a stable `fetcher` (module-level function or useCallback), otherwise
 * this refetches on every render.
 */
export function useApi<T>(fetcher: () => Promise<T>): State<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    fetcher()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Something went wrong.")
      )
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    run();
  }, [run]);

  const reload = useCallback(() => {
    setLoading(true);
    run();
  }, [run]);

  return { data, loading, error, reload };
}
