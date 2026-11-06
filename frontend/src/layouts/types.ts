// 布局预设（Layout Preset）：应用外壳的"网格布局"配置。
//
// 外壳 AppLayout 是一个 CSS Grid（grid-template-areas: title / nav / main），
// 预设只声明三件事，CSS 据 data-* 属性切换网格区域：
//   - nav.variant   ：导航组件形态（图标栏 / 展开侧栏 / 水平导航条 / 浮动 Dock / 无常驻导航）
//   - nav.placement ：导航放在哪（左 / 右 / 标题栏下方 / 嵌入标题栏 / 底部 / 抽屉）
//   - frame         ：内容区外框（flush 贴边 / inset 浮动卡片，四周留白 + 圆角）
// 新增预设 = 在 presets.ts 里组合一行，不需要改 AppLayout。

export type NavVariant =
  | 'rail' // 64px 图标栏（图标 + Tooltip）
  | 'sidebar' // 展开侧栏（图标 + 文字，可折叠为图标栏）
  | 'bar' // 水平导航条（图标 + 文字）
  | 'dock' // 底部居中浮动 Dock（图标）
  | 'none'; // 无常驻导航（配合 placement: 'drawer'）

export type NavPlacement =
  | 'left'
  | 'right'
  | 'top' // 标题栏下方独占一行
  | 'titlebar' // 嵌入标题栏（节省垂直空间）
  | 'bottom' // 浮于内容区底部
  | 'float' // 悬浮于内容区，可拖拽（吸附左 / 右边缘，竖向）
  | 'drawer'; // 标题栏菜单按钮 → 抽屉

export type LayoutFrame = 'flush' | 'inset';

export interface LayoutPreset {
  id: string;
  labelKey: string; // i18n：设置页卡片标题
  descriptionKey: string; // i18n：设置页卡片说明
  nav: { variant: NavVariant; placement: NavPlacement };
  frame: LayoutFrame;
}
