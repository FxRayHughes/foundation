import type { FoundationThemePreset } from '../types';

// 暗色主题：深灰画布 + 中灰面板，与默认白色主题语义槽位完全对齐。
// 选色参考 Tailwind slate / zinc 调色板，避免纯黑导致的对比度过强。
export const darkPreset: FoundationThemePreset = {
  name: 'foundation-dark',
  label: 'Dark',
  mode: 'dark',
  palette: {
    bg: {
      base: '#0b0d10',
      sidebar: '#15181d',
      content: '#1c1f24',
      surface: '#22262d',
      elevated: '#2a2f37',
      hover: 'rgba(255, 255, 255, 0.06)',
      active: 'rgba(96, 165, 250, 0.16)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      muted: '#64748b',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    accent: '#60a5fa',
    accentHover: '#93c5fd',
    status: {
      danger: '#f87171',
      success: '#4ade80',
      warning: '#fbbf24',
    },
  },
};
