import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

const FALLBACK_COLORS = [
  '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa',
  '#fb923c', '#2dd4bf', '#e879f9', '#84cc16', '#f87171',
];

export function useChartColors(count?: number): string[] {
  const theme = useTheme();
  const fp = theme.palette.foundation;

  return useMemo(() => {
    const base = [
      fp.accent,
      fp.status.success,
      fp.status.warning,
      fp.status.danger,
      fp.accentHover,
      fp.text.secondary,
      fp.text.muted,
      ...FALLBACK_COLORS,
    ];
    if (!count) return base;
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(base[i % base.length]!);
    }
    return result;
  }, [fp, count]);
}
