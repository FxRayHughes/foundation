import type { LayoutPreset } from './types';

// 内置布局预设。顺序即设置页展示顺序；第一项为默认（经典网格）。
// 文案 key 在 SettingsPage/layout/lang 下（settings.layout.presets.<id>.*）。
const p = (
  id: string,
  variant: LayoutPreset['nav']['variant'],
  placement: LayoutPreset['nav']['placement'],
  frame: LayoutPreset['frame'] = 'flush',
): LayoutPreset => ({
  id,
  labelKey: `settings.layout.presets.${id}.label`,
  descriptionKey: `settings.layout.presets.${id}.description`,
  nav: { variant, placement },
  frame,
});

export const BUILTIN_LAYOUTS: LayoutPreset[] = [
  p('classic', 'rail', 'left'), // 经典：左侧图标栏（默认）
  p('sidebar', 'sidebar', 'left'), // 展开侧栏：图标 + 文字，可折叠
  p('topnav', 'bar', 'top'), // 顶部导航：标题栏下方水平导航条
  p('titlebar', 'bar', 'titlebar'), // 融合标题栏：导航嵌入标题栏
  p('right', 'rail', 'right'), // 右侧栏：图标栏在右
  p('dock', 'dock', 'bottom'), // 底部 Dock：内容区底部浮动
  p('floating', 'dock', 'float'), // 悬浮 Dock：右侧竖向浮动，可拖拽，松手吸附左 / 右边缘
  p('inset', 'sidebar', 'left', 'inset'), // 浮动卡片：侧栏 + 圆角内容卡片
  p('focus', 'none', 'drawer'), // 专注：无常驻导航，菜单按钮呼出抽屉
];

export const DEFAULT_LAYOUT_ID = 'classic';
