import type { FoundationThemePreset } from '../types';

// 黑曜：纯黑画布 + 紫罗兰强调，对比度高于普通暗色，适合长时间工作。
// 与 dark 预设语义槽位完全一致，仅替换颜色值。
export const obsidianPreset: FoundationThemePreset = {
  name: 'foundation-obsidian',
  label: 'Obsidian',
  mode: 'dark',
  palette: {
    bg: {
      base: '#000000',
      sidebar: '#0a0a0c',
      content: '#0f0f12',
      surface: '#16161b',
      elevated: '#1c1c22',
      hover: 'rgba(167, 139, 250, 0.08)',
      active: 'rgba(167, 139, 250, 0.18)',
    },
    text: {
      primary: '#f5f5f7',
      secondary: '#c4c4cc',
      muted: '#6b6b78',
    },
    divider: 'rgba(255, 255, 255, 0.06)',
    accent: '#a78bfa',
    accentHover: '#c4b5fd',
    status: {
      danger: '#f87171',
      success: '#4ade80',
      warning: '#fbbf24',
    },
  },
};
