import { keyframes } from '@emotion/react';
import type { SxProps, Theme } from '@mui/material';

// Shimmer 动画：从左到右扫过的高光，让骨架"活"起来。
// 用 background-position 平移，比 transform translateX 性能更稳（不会创建合成层闪烁）。
export const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

// Skeleton 样式工厂：所有取色经 theme.palette.foundation，跟随主题切换。
// - base：底色（与 sidebar / surface 中间色，读 bg.elevated）
// - highlight：扫过的高光（hover）
export const skeletonStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  // 用 linear-gradient 制造扫光带；200% 宽度让动画扫过整个元素再循环
  const stripe = `linear-gradient(90deg, ${fp.bg.elevated} 0%, ${fp.bg.hover} 50%, ${fp.bg.elevated} 100%)`;

  return {
    base: {
      backgroundColor: fp.bg.elevated,
      backgroundImage: stripe,
      backgroundSize: '200% 100%',
      backgroundRepeat: 'no-repeat',
      animation: `${shimmer} 1.4s ease-in-out infinite`,
      // 浏览器在低性能模式下尊重 prefers-reduced-motion：关掉扫光，仅保留底色
      '@media (prefers-reduced-motion: reduce)': {
        animation: 'none',
      },
    },
    rect: {
      borderRadius: 1.5, // 12px：方形圆角语言
    },
    text: {
      borderRadius: 0.5,
      height: 12,
    },
    circle: {
      borderRadius: '50%',
    },
  };
};
