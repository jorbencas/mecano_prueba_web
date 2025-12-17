import { useCallback } from 'react';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export const useFetchWithTimeout = () => {
  const fetchWithTimeout = useCallback(async (url: string, options: FetchOptions = {}) => {
    const { timeout = 2000, ...fetchOptions } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }, []);

  return fetchWithTimeout;
};
