import type { ThemeOptions } from '@mui/material/styles';

// FoundationPalette：脚手架专属调色板，挂在 MUI theme.palette.foundation 上。
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
//  - mode：决定 MUI 默认配色方向（影响 contrast 计算）
//  - palette：FoundationPalette，会被合并到 MUI palette
//  - muiOverrides：进一步覆盖 MUI ThemeOptions（可选）
export interface FoundationThemePreset {
  name: string;
  label: string;
  mode: 'light' | 'dark';
  palette: FoundationPalette;
  muiOverrides?: ThemeOptions;
}
