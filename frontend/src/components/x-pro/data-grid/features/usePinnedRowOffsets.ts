import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

// 钉住行的 sticky 偏移：测量每一行置顶 / 置底 <tr> 的真实高度并累加，
// 内容换行变高时不会互相覆盖。ResizeObserver 监听行高变化。
// 未测量前用 FALLBACK_ROW_HEIGHT 估算（只影响首帧）。

const FALLBACK_ROW_HEIGHT = 40;
const ROW_SELECTOR = (side: 'top' | 'bottom') => `tbody tr[data-pinned-row="${side}"]`;

interface UsePinnedRowOffsetsParams {
  containerRef: RefObject<HTMLElement | null>;
  topCount: number;
  bottomCount: number;
  /** 记录 / 列变化时重新挂载监听 */
  deps: unknown;
}

export interface PinnedRowOffsets {
  /** 第 i 个置顶行距表头底部的像素偏移 */
  top: (i: number) => number;
  /** 倒数第 i 个置底行（0 = 最底）距底部（footer 顶部）的像素偏移 */
  bottom: (fromEnd: number) => number;
}

const sameArray = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);

const sumBefore = (heights: number[], n: number) => {
  let s = 0;
  for (let i = 0; i < n; i++) s += heights[i] ?? FALLBACK_ROW_HEIGHT;
  return s;
};

export function usePinnedRowOffsets({
  containerRef,
  topCount,
  bottomCount,
  deps,
}: UsePinnedRowOffsetsParams): PinnedRowOffsets {
  const [topHeights, setTopHeights] = useState<number[]>([]);
  const [bottomHeights, setBottomHeights] = useState<number[]>([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || topCount + bottomCount === 0) return;

    const measure = () => {
      const top = Array.from(container.querySelectorAll<HTMLElement>(ROW_SELECTOR('top'))).map(
        (tr) => tr.getBoundingClientRect().height,
      );
      // 置底行按"距底部"顺序存：最后一行在前
      const bottom = Array.from(container.querySelectorAll<HTMLElement>(ROW_SELECTOR('bottom')))
        .map((tr) => tr.getBoundingClientRect().height)
        .reverse();
      setTopHeights((cur) => (sameArray(cur, top) ? cur : top));
      setBottomHeights((cur) => (sameArray(cur, bottom) ? cur : bottom));
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    container
      .querySelectorAll<HTMLElement>(`${ROW_SELECTOR('top')}, ${ROW_SELECTOR('bottom')}`)
      .forEach((tr) => ro.observe(tr));
    return () => ro.disconnect();
  }, [containerRef, topCount, bottomCount, deps]);

  return {
    top: (i) => sumBefore(topHeights, i),
    bottom: (fromEnd) => sumBefore(bottomHeights, fromEnd),
  };
}
