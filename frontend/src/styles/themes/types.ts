import type { MantineThemeOverride } from '@mantine/core';

// FoundationPalette：脚手架专属调色板，编译为 CSS 变量 --fd-*（见 buildMantineTheme.ts），
// JS 侧通过 useFoundationPalette() 读取。
// 所有组件样式只能消费这里定义的语义颜色，不允许硬编码十六进制。
export interface FoundationPalette {
  bg: {
    base: string;       // 标题栏 / 最外层背景
    sidebar: string;    // 侧边栏
    content: string;    // 主内容区（页面默认背景）
    surface: string;    // 卡片 / Paper 表面
    elevated: string;   // 输入框 / 提升层（Tooltip 内层等）
    hover: string;      // hover 半透明覆盖
    active: string;     // active / selected 半透明覆盖
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  divider: string;
  accent: string;
  accentHover: string;
  status: {
    danger: string;
    success: string;
    warning: string;
  };
}

// 主题预设：注册到 themeRegistry，可在运行时切换。
//  - name：唯一标识（必填）
//  - label：UI 显示名（如设置页里的下拉项）
//  - mode：决定 Mantine color scheme（forceColorScheme）
//  - palette：FoundationPalette，会编译为 --fd-* CSS 变量 + Mantine primary 色阶
//  - mantineOverrides：进一步覆盖 Mantine theme（可选，深合并）
export interface FoundationThemePreset {
  name: string;
  label: string;
  mode: 'light' | 'dark';
  palette: FoundationPalette;
  mantineOverrides?: MantineThemeOverride;
}
