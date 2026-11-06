import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { LazyLoadingConfig } from '../types';

// 懒加载（无限滚动）：
//  - mantine-datatable 的 onScrollToBottom 触发下一批
//  - 首屏 / 加载完成后若内容不足一屏（无法滚动），主动再拉一批，直到填满或 hasMore=false
//  - 200ms 节流，loading 期间不重复触发

interface UseLazyLoadingParams {
  config?: LazyLoadingConfig;
  scrollViewportRef: RefObject<HTMLDivElement | null>;
}

interface UseLazyLoadingResult {
  isLoading: boolean;
  onScrollToBottom: (() => void) | undefined;
}

export function useLazyLoading({ config, scrollViewportRef }: UseLazyLoadingParams): UseLazyLoadingResult {
  const lastFetchRef = useRef(0);

  const fetchMore = useCallback(() => {
    if (!config || config.loading || config.hasMore === false) return;
    const now = Date.now();
    if (now - lastFetchRef.current < 200) return;
    lastFetchRef.current = now;
    const size = config.pageSize ?? 50;
    config.onFetchRows({ startIndex: config.rowCount, endIndex: config.rowCount + size });
  }, [config]);

  // 内容不足一屏时主动填充
  useEffect(() => {
    if (!config || config.loading || config.hasMore === false) return;
    const vp = scrollViewportRef.current;
    if (!vp) return;
    const raf = requestAnimationFrame(() => {
      if (vp.scrollHeight <= vp.clientHeight + 1) fetchMore();
    });
    return () => cancelAnimationFrame(raf);
  }, [config, config?.rowCount, config?.loading, scrollViewportRef, fetchMore]);

  return {
    isLoading: config?.loading ?? false,
    onScrollToBottom: config ? fetchMore : undefined,
  };
}
