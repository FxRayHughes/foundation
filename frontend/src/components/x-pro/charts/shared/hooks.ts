import { useRef, useState, useEffect, useCallback } from 'react';
import type { ChartDimensions, ChartMargin } from './types';

const DEFAULT_MARGIN: ChartMargin = { top: 0, right: 0, bottom: 0, left: 0 };

export function useChartDimensions(
  width?: number,
  height?: number,
  margin: ChartMargin = DEFAULT_MARGIN,
): { ref: React.RefObject<HTMLDivElement | null>; dimensions: ChartDimensions } {
  const ref = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState<{ width: number; height: number }>({
    width: width ?? 400,
    height: height ?? 300,
  });

  useEffect(() => {
    if (width !== undefined && height !== undefined) return;
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      setMeasured({ width: w || 400, height: h || 300 });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  const finalWidth = width ?? measured.width;
  const finalHeight = height ?? measured.height;

  const dimensions: ChartDimensions = {
    width: finalWidth,
    height: finalHeight,
    innerWidth: finalWidth - margin.left - margin.right,
    innerHeight: finalHeight - margin.top - margin.bottom,
    margin,
  };

  return { ref, dimensions };
}

export function useChartColors(colorMap?: string[]): (index: number) => string {
  const defaultColors = [
    '#60a5fa', '#f472b6', '#34d399', '#fbbf24',
    '#a78bfa', '#fb923c', '#22d3ee', '#e879f9',
    '#4ade80', '#f87171', '#38bdf8', '#c084fc',
  ];
  const colors = colorMap ?? defaultColors;
  return useCallback((index: number) => colors[index % colors.length]!, [colors]);
}
