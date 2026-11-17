import { useEffect, useState } from "react";

/**
 * Runs a read request and ignores results after cancellation.
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} load Stable loader for the current resource.
 * @returns {{data: T|null, error: Error|null, setData: import('react').Dispatch<import('react').SetStateAction<T|null>>, retry: () => void}}
 */
export default function useAsync(load) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setError(null);
        }
      },
      (error) => {
        if (!controller.signal.aborted) setError(error);
      },
    );
    return () => controller.abort();
  }, [load, attempt]);

  /** Returns to the loading state and starts another attempt. */
  function retry() {
    setData(null);
    setError(null);
    setAttempt((value) => value + 1);
  }

  return { data, error, setData, retry };
}
