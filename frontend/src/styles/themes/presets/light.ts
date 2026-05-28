import type { FoundationThemePreset } from '../types';

// 明亮主题：偏纯白画布 + 可见的按钮底色。
// 设计目标：
//  - 主区域基本是白：base / content / surface 都用 #ffffff
//  - 按钮 / 输入框 / 卡片使用 bg.elevated（#eef1f6）默认就能看出底色
//  - sidebar 用 #f6f7fa 与 content 拉开一级层级
//  - 圆角弱化由 buildMuiTheme 统一控制（borderRadius: 4）
export const lightPreset: FoundationThemePreset = {
  name: 'foundation-light',
  label: 'Light',
  mode: 'light',
  palette: {
    bg: {
      base: '#ffffff',
      sidebar: '#f6f7fa',
      content: '#ffffff',
      surface: '#ffffff',
      elevated: '#eef1f6',  // 按钮 / 输入框默认底色，未选中也可见
      hover: 'rgba(15, 23, 42, 0.08)',
      active: 'rgba(37, 99, 235, 0.14)',
    },
    text: {
      primary: '#0b1220',
      secondary: '#3f4a5a',
      muted: '#8a93a4',
    },
    divider: 'rgba(15, 23, 42, 0.10)',
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    status: {
      danger: '#dc2626',
      success: '#16a34a',
      warning: '#d97706',
    },
  },
};
