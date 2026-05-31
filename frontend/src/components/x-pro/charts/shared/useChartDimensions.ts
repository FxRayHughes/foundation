import { useState, useEffect, type RefObject } from 'react';

export interface ChartDimensions {
  width: number;
  height: number;
}

export function useChartDimensions(
  containerRef: RefObject<HTMLElement | null>,
  fixedWidth?: number,
  fixedHeight?: number,
): ChartDimensions {
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: fixedWidth ?? 0,
    height: fixedHeight ?? 0,
  });

  useEffect(() => {
    if (fixedWidth && fixedHeight) {
      setDimensions({ width: fixedWidth, height: fixedHeight });
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setDimensions({
        width: fixedWidth ?? Math.floor(width),
        height: fixedHeight ?? Math.floor(height),
      });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, fixedWidth, fixedHeight]);

  return dimensions;
}
