import { useState, useEffect } from 'react';
import apiClient from '../http/apiClient';

interface Feature {
  id: string;
  code: string;
  name: string;
  disabled: boolean;
}

let cachedFeatures: string[] | null = null;
let loadingPromise: Promise<string[]> | null = null;

/**
 * Fetches the current user's active features from GET /api/features/active.
 * Results are cached for the session lifetime (cleared on logout via clearFeaturesCache).
 */
export const clearFeaturesCache = () => {
  cachedFeatures = null;
  loadingPromise = null;
};

const fetchFeatures = async (): Promise<string[]> => {
  if (cachedFeatures) return cachedFeatures;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const res = await apiClient.get('/features/active') as unknown;
      const raw = res as { data?: Feature[] } | Feature[];
      const list: Feature[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { data?: Feature[] }).data)
          ? (raw as { data: Feature[] }).data
          : [];
      cachedFeatures = list.map(f => f.code);
      return cachedFeatures;
    } catch {
      cachedFeatures = [];
      return [];
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
};

/**
 * Hook that returns the current user's feature codes and a helper to check permissions.
 */
export const useFeatures = () => {
  const [features, setFeatures] = useState<string[]>(cachedFeatures ?? []);
  const [isLoading, setIsLoading] = useState(!cachedFeatures);

  useEffect(() => {
    if (cachedFeatures) {
      setFeatures(cachedFeatures);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetchFeatures().then(f => {
      setFeatures(f);
      setIsLoading(false);
    });
  }, []);

  const can = (featureCode: string): boolean => features.includes(featureCode);

  return { features, isLoading, can };
};
