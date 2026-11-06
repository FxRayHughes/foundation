// 用户界面偏好（行为开关）：
// - 主题不在这里（颜色 / 模式属于"配色"，归 styles/themes/）
// - 这里只放与"行为 / 显隐"相关的开关，比如菜单 logo / Tooltip 是否显示
// 任何新增项请保持 boolean 优先；复杂偏好（枚举 / 数值）也可以加，但请就近写默认值
export interface Preferences {
  showLogo: boolean;       // Sidebar 顶部品牌方块是否显示
  showTooltip: boolean;    // Sidebar 菜单按钮是否显示 Tooltip
  layout: string;          // 布局预设 id（见 src/layouts；未知值回落到 'classic'）
  navCollapsed: boolean;   // 展开侧栏（variant: 'sidebar'）是否折叠为图标栏
  floatDockSide: string;   // 悬浮 Dock 吸附的边：'left' | 'right'
  floatDockY: number;      // 悬浮 Dock 中心的垂直位置（占内容区高度的比例 0–1，窗口缩放后仍成立）
}

export interface PreferencesContextValue {
  preferences: Preferences;
  // 后端值是否已读回（读失败也置 true —— 表示"不会再变了"，用默认值）
  ready: boolean;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  reset: () => void;
}

export const DEFAULT_PREFERENCES: Preferences = {
  showLogo: true,
  showTooltip: true,
  layout: 'classic',
  navCollapsed: false,
  floatDockSide: 'right',
  floatDockY: 0.5,
};
