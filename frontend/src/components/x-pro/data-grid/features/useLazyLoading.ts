import { useEffect, useRef, useCallback } from 'react';
import type { LazyLoadingConfig } from '../types';

interface UseLazyLoadingParams {
  config?: LazyLoadingConfig;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface UseLazyLoadingResult {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  totalRowCount: number;
}

export function useLazyLoading({
  config,
  containerRef,
}: UseLazyLoadingParams): UseLazyLoadingResult {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastFetchRef = useRef<number>(0);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!config || config.loading) return;
      const entry = entries[0];
      if (entry?.isIntersecting) {
        const now = Date.now();
        if (now - lastFetchRef.current < 200) return;
        lastFetchRef.current = now;
        config.onFetchRows({ startIndex: config.rowCount, endIndex: config.rowCount + 50 });
      }
    },
    [config],
  );

  useEffect(() => {
    if (!config || !sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(handleIntersect, {
      root: containerRef.current,
      rootMargin: '200px',
      threshold: 0,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [config, containerRef, handleIntersect]);

  return {
    sentinelRef,
    isLoading: config?.loading ?? false,
    totalRowCount: config?.rowCount ?? 0,
  };
}
