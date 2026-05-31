---
name: foundation-mui-navigation
description: MUI 9 导航类组件在 Foundation 项目中的详尽用法。当使用 Tabs/Menu/Drawer/Breadcrumbs/Pagination/Stepper/SpeedDial/BottomNav/Link 时参考。
---

# Foundation × MUI 9 导航类组件

本 SKILL 覆盖所有 MUI 9 导航类组件在 Foundation 项目中的标准用法。

## 何时使用本 SKILL

- 需要实现页面内标签切换（Tabs）
- 需要右键菜单或下拉菜单（Menu）
- 需要侧边抽屉面板（Drawer）
- 需要面包屑导航（Breadcrumbs）
- 需要分页控件（Pagination）
- 需要步骤向导（Stepper）
- 需要快速操作浮动按钮（SpeedDial）
- 需要底部导航栏（BottomNavigation）
- 需要外部链接（Link）

## 覆盖组件

| 组件 | 参考文档 | 一句话用途 |
|------|----------|------------|
| BottomNavigation / BottomNavigationAction | [bottom-navigation.md](references/bottom-navigation.md) | 底部导航栏，移动端主导航 |
| Breadcrumbs | [breadcrumbs.md](references/breadcrumbs.md) | 面包屑，层级路径展示 |
| Drawer / SwipeableDrawer | [drawer.md](references/drawer.md) | 侧边抽屉，辅助导航面板 |
| Link | [link.md](references/link.md) | 文本链接 |
| Menu / MenuItem / MenuList | [menu.md](references/menu.md) | 弹出菜单，上下文操作 |
| Pagination / PaginationItem | [pagination.md](references/pagination.md) | 分页器 |
| SpeedDial / SpeedDialAction / SpeedDialIcon | [speed-dial.md](references/speed-dial.md) | 快速拨号按钮，浮动操作集 |
| Stepper / Step / StepLabel / StepContent / StepButton / StepConnector / MobileStepper | [stepper.md](references/stepper.md) | 步骤条，向导流程 |
| Tabs / Tab / TabScrollButton | [tabs.md](references/tabs.md) | 选项卡，视图切换 |

---

## Foundation 导航铁律

### 1. 路由集成

Foundation 使用自有路由系统，**不用 react-router**。导航组件的 `onChange` 回调应调用 `navigate(id)`：

```tsx
import { useRouter } from '@/shared/hooks/useRouter';

const { navigate } = useRouter();

// Tabs 切换页面
<Tabs value={currentRoute} onChange={(_, id) => navigate(id)}>
  <Tab value="home" label={t('nav.home')} />
  <Tab value="settings" label={t('nav.settings')} />
</Tabs>
```

### 2. 配色

只从 `theme.palette.foundation.*` 取值，导航组件常用：
- 选中态：`fp.accent`
- 未选中态：`fp.text.secondary`
- 背景：`fp.bg.sidebar` 或 `fp.bg.surface`
- 悬停：`fp.bg.hover`

### 3. 图标

导航图标只用 `@mui/icons-material` 的 `*Rounded` 系列。

### 4. i18n

所有导航文案（Tab label、Menu item 文字、Breadcrumb 名称、Stepper 步骤名）走 `t('key')`。

### 5. 样式工厂

复杂导航样式写在 `<Name>.styles.ts`，使用工厂函数模式。
