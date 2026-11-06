import type { Messages } from '@/i18n';

export const layoutZhCN: Messages = {
  settings: {
    layout: {
      title: '布局预设',
      hint: '选择应用外壳的网格布局，点击即生效；导航位置、形态与内容区外框随之切换。',
      currentLine: '当前布局：{{label}}',
      presets: {
        classic: { label: '经典', description: '左侧图标栏，紧凑且信息密度高（默认）' },
        sidebar: { label: '展开侧栏', description: '左侧图标 + 文字侧栏，可折叠为图标栏' },
        topnav: { label: '顶部导航', description: '标题栏下方的水平导航条' },
        titlebar: { label: '融合标题栏', description: '导航嵌入标题栏，节省垂直空间' },
        right: { label: '右侧栏', description: '图标栏放在窗口右侧' },
        dock: { label: '底部 Dock', description: '内容区底部居中的浮动 Dock' },
        floating: { label: '悬浮 Dock', description: '右侧竖向浮动，可拖拽到任意高度、吸附左右边缘' },
        inset: { label: '浮动卡片', description: '展开侧栏 + 四周留白的圆角内容卡片' },
        focus: { label: '专注', description: '无常驻导航，标题栏菜单按钮呼出抽屉' },
      },
      nav: {
        title: '导航选项',
        hint: '调整导航的细节行为。',
        collapsed: {
          label: '展开侧栏默认折叠',
          description: '仅对使用展开侧栏的布局（展开侧栏 / 浮动卡片）生效：折叠为图标栏。',
        },
        collapsedInactive: '当前布局不使用展开侧栏，此选项会在切换到相应布局后生效。',
        moreInPersonalization: '「显示 Logo」与「显示菜单 Tooltip」位于「个性化 → 显示偏好」。',
      },
    },
  },
};
