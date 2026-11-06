import { useMemo } from 'react';
import type { MantineColor } from '@mantine/core';
import { FOUNDATION_CSS_VARS } from '@/styles/themes';

// 系列色板：前段取 Foundation 主题变量（随主题切换自动生效），
// 后段补 Mantine 内置色阶 token（'violet.5' 等，由 @mantine/charts 的 getThemeColor 解析成 CSS 变量）。
// 返回值可直接喂给 @mantine/charts 的 color / colors 字段，也可用于自绘 SVG 的 style.fill。
// 禁止在这里写十六进制。
const SERIES_COLORS: readonly MantineColor[] = [
  FOUNDATION_CSS_VARS.accent,
  FOUNDATION_CSS_VARS.status.success,
  FOUNDATION_CSS_VARS.status.warning,
  FOUNDATION_CSS_VARS.status.danger,
  FOUNDATION_CSS_VARS.accentHover,
  FOUNDATION_CSS_VARS.text.secondary,
  FOUNDATION_CSS_VARS.text.muted,
  'violet.5',
  'pink.5',
  'cyan.5',
  'orange.5',
  'lime.6',
  'grape.5',
  'teal.5',
  'indigo.5',
];

export function useChartColors(count?: number): string[] {
  return useMemo(() => {
    if (!count) return [...SERIES_COLORS];
    return Array.from({ length: count }, (_, i) => SERIES_COLORS[i % SERIES_COLORS.length]!);
  }, [count]);
}
