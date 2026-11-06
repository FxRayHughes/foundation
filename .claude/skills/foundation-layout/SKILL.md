---
name: foundation-layout
description: Foundation 前端布局系统使用指南：布局预设（LayoutPreset = nav.variant × nav.placement × frame，9 个内置 classic / sidebar / topnav / titlebar / right / dock / floating / inset / focus）、layoutRegistry 注册自定义预设、AppLayout CSS Grid 网格区域与 data-* 切换、components/Navigation 导航形态（NavRail / NavSidebar / NavBar / NavDock / NavigationDrawerButton + useNavigation）、TitleBar leading / center 插槽、--fd-titlebar-h 与 macOS 红绿灯对齐规则、悬浮 Dock 拖拽约束、布局偏好持久化与启动就绪信号、E2E 验证。触发词：布局 / 布局预设 / layout preset / layoutRegistry / 导航位置 / 导航形态 / Dock / 悬浮 Dock / 侧栏 / 图标栏 / 顶部导航 / 网格布局 / CSS Grid / AppLayout / TitleBar 插槽 / leading / center / --fd-titlebar-h / 红绿灯对齐 / Navigation / NavRail / Sidebar。
---

# Foundation 布局系统

应用外壳（主窗口）= `components/AppLayout`，一个 **CSS Grid**。外壳长什么样由当前**布局预设**决定，用户在「设置 → 布局」切换，选择持久化到 SQLite。

```
frontend/src/
├── layouts/                      # 布局预设（唯一事实源）
│   ├── types.ts                  # LayoutPreset / NavVariant / NavPlacement / LayoutFrame
│   ├── presets.ts                # BUILTIN_LAYOUTS（9 个，顺序 = 设置页顺序）+ DEFAULT_LAYOUT_ID = 'classic'
│   ├── registry.ts               # layoutRegistry.register / has / list / resolve
│   ├── useLayoutPreset.ts        # { preset, presets, setLayout }
│   └── index.ts
├── components/
│   ├── AppLayout/                # Grid 外壳：AppLayout.tsx + useAppLayout.ts + AppLayout.module.css
│   ├── TitleBar/                 # 标题栏：leading / center 插槽，高度 var(--fd-titlebar-h)
│   ├── Navigation/               # 导航形态
│   │   ├── Navigation.tsx        # 分发器：按 variant 选形态，placement 透传
│   │   ├── useNavigation.ts      # 共享 ViewModel：条目来自路由表 primary / footer
│   │   ├── navLabel.ts           # View 侧翻译：t(labelKey) ?? label
│   │   ├── NavRail/ NavSidebar/ NavBar/ NavDock/ NavigationDrawerButton/
│   │   └── index.ts
│   └── Sidebar/                  # 兼容出口：export { NavRail as Sidebar }（新代码别用）
├── pages/SettingsPage/layout/    # 设置 → 布局（预设卡片 radiogroup + CSS 缩略图 + 折叠开关）
└── shared/appReady.ts            # APP_READY_EVENT / signalAppReady()
```

## 1. 预设模型

```ts
interface LayoutPreset {
  id: string;
  labelKey: string;        // i18n：设置页卡片标题（也用于首页「当前布局」卡片）
  descriptionKey: string;  // i18n：卡片说明
  nav: { variant: NavVariant; placement: NavPlacement };
  frame: LayoutFrame;
}
type NavVariant   = 'rail' | 'sidebar' | 'bar' | 'dock' | 'none';
type NavPlacement = 'left' | 'right' | 'top' | 'titlebar' | 'bottom' | 'float' | 'drawer';
type LayoutFrame  = 'flush' | 'inset';
```

| id | variant | placement | frame | 外观 |
|----|---------|-----------|-------|------|
| `classic`（默认） | rail | left | flush | 左侧 64px 图标栏 |
| `sidebar` | sidebar | left | flush | 图标 + 文字侧栏，可折叠为图标栏 |
| `topnav` | bar | top | flush | 标题栏下方独占一行的水平导航条 |
| `titlebar` | bar | titlebar | flush | 导航嵌入标题栏 `center` 插槽 |
| `right` | rail | right | flush | 图标栏在右 |
| `dock` | dock | bottom | flush | 内容区底部居中浮动 Dock |
| `floating` | dock | float | flush | 竖向悬浮 Dock，可拖拽，吸附左 / 右边缘 |
| `inset` | sidebar | left | inset | 侧栏 + 四周留白的圆角内容卡片 |
| `focus` | none | drawer | flush | 无常驻导航，标题栏 `leading` 菜单按钮呼出抽屉 |

合法组合（`Navigation.tsx` 实际支持的）：`rail` / `sidebar` × `left` / `right`；`bar` × `top` / `titlebar`；`dock` × `bottom` / `float`；`none` × `drawer`。其它组合没有对应渲染分支，不要用。

### 持久化（preferences 表，经 `usePreferences()`）

| 键 | 类型 / 默认 | 含义 |
|----|-------------|------|
| `layout` | `string` / `'classic'` | 当前预设 id；未知 id（旧值 / 卸载的自定义预设）由 `layoutRegistry.resolve` 回落默认 |
| `navCollapsed` | `boolean` / `false` | 展开侧栏（variant `sidebar`）是否折叠为图标栏 |
| `floatDockSide` | `'left' \| 'right'` / `'right'` | 悬浮 Dock 吸附的边 |
| `floatDockY` | `number` / `0.5` | 悬浮 Dock 中心占内容区高度的比例 0–1（窗口缩放后仍成立） |

`setLayout(id)` 只接受已注册 id。禁止用 localStorage 记布局。

## 2. 加一个预设（最常见）

**内置**：在 `layouts/presets.ts` 的 `BUILTIN_LAYOUTS` 里加一行，并在 `pages/SettingsPage/layout/lang/{zh-CN,en-US}.ts` 的 `settings.layout.presets.<id>` 下补 `label` / `description`：

```ts
p('rightDock', 'dock', 'float'),            // 若想默认吸附右侧，floatDockSide 默认就是 right
p('insetRight', 'sidebar', 'right', 'inset'),
```

**业务侧（不改脚手架文件）**：启动时注册（与其它 `register*` 一起放在 `App.tsx` 顶部，渲染前执行；注册表不是响应式的）：

```ts
import { layoutRegistry } from '@/layouts';

layoutRegistry.register({
  id: 'acme-wide',
  labelKey: 'acme.layout.wide.label',            // 文案放在你自己的语言包里，经 localeRegistry.extend 注册
  descriptionKey: 'acme.layout.wide.description',
  nav: { variant: 'bar', placement: 'top' },
  frame: 'inset',
});
```

设置页卡片与缩略图（`LayoutThumbnail`，纯 CSS，按 variant / placement / frame 摆放）会自动出现，无需改设置页。如组合出现新的视觉需求（例如 `inset` + `top` 的边距），只在 `AppLayout.module.css` 加 `data-*` 选择器规则。

**铁律**：新的导航位置 / 外壳组合 = 新预设。**禁止**在 `AppLayout.tsx`、页面或导航组件里写 `if (layout === 'xxx')` 之类的硬编码分支，也不要绕过 `Navigation` 直接把某个导航组件塞进外壳。

## 3. AppLayout 网格区域

`AppLayout.tsx` 只做三件事：把 `data-layout` / `data-placement` / `data-frame` / `data-dock-side`（仅 float）写到根节点；决定导航进哪个位置；渲染 `<RouterOutlet />`。

| placement | 导航放在哪 | grid-template-areas |
|-----------|-----------|---------------------|
| （默认 / titlebar / drawer） | 不占网格（titlebar → `TitleBar center`；drawer → `TitleBar leading` 的 `NavigationDrawerButton`） | `'title' 'main'` |
| `left` | `.nav` 单元 | `'title title' 'nav main'`（列 `auto minmax(0,1fr)`） |
| `right` | `.nav` 单元 | `'title title' 'main nav'` |
| `top` | `.nav` 单元 | `'title' 'nav' 'main'`（行 `auto auto minmax(0,1fr)`） |
| `bottom` | `.nav` 与 `main` **共用** `main` 单元，`align-self: end` 居中浮起，`z-index: 10` | `main` 加 `padding-bottom: 80px` 防遮挡 |
| `float` | `.nav` 与 `main` 共用单元，作为透明覆盖层（`pointer-events: none`），Dock 在层内绝对定位 | `main` 在吸附侧加 `padding-left/right: 88px`（`data-dock-side`） |

`frame='inset'`：根背景改 `--fd-bg-sidebar`，`main` 加 8px margin + 1px divider 边 + 8px 圆角，贴导航一侧 margin 归零；`--nav-divider` 置透明（导航组件用它画分隔线）。

所有尺寸 / 颜色走 CSS Modules + `var(--fd-*)`；列 / 行一律 `minmax(0, 1fr)` 防止内容撑破网格。

## 4. 加一个导航形态（variant）

1. `layouts/types.ts` 的 `NavVariant` 加值（注释写清形态）。
2. 在 `components/Navigation/<NavXxx>/` 建 MVVM 四件：`NavXxx.tsx` + `useNavXxx.ts` + `NavXxx.module.css` + `index.ts`。ViewModel **复用 `useNavigation()`**（`primary` / `footer` / `navigate` / `showTooltip` / `showLogo`），不接收 `items` / `onNavigate` props；View 用 `navLabel(t, item)` 翻译，图标 `<Icon size={…} stroke={1.75} />`（Tabler）。
3. `Navigation.tsx` 的 `switch` 加分支；`Navigation.module.css` 按 `data-variant` 决定外层如何填满单元。
4. `components/Navigation/index.ts` 导出；若需要新的 placement，同步 `NavPlacement` + `AppLayout.tsx` 的 `inGrid` 判断 + `AppLayout.module.css` 网格规则。
5. 设置页缩略图 `pages/SettingsPage/layout/Layout.tsx` 的 `LayoutThumbnail` + `Layout.module.css` 补该形态示意。
6. 新文案（aria-label / Tooltip）放公用 locale `sidebar.*`（`src/i18n/locales/{zh-CN,en-US}.ts`，两份 keys 对齐）。
7. 加预设使用它（第 2 节），并考虑补 E2E 截图（`e2e/screenshots.spec.ts` 的 `LAYOUTS` 列表）。

各形态要点：`NavRail`（`placement: 'left' | 'right'` 决定激活指示条 / 分隔线 / Tooltip 方向）；`NavSidebar`（折叠读写 `navCollapsed`；`inDrawer` 模式始终展开，选中后关闭抽屉）；`NavBar`（`top` 44px 含品牌与底部分隔线 / `titlebar` ≤28px 透明底）；`NavDock`（默认底部横向胶囊；`floating` 竖向 + 拖拽手柄）；`NavigationDrawerButton`（Mantine `Drawer` + 抽屉版 `NavSidebar`）。

## 5. TitleBar 插槽与 macOS 标题栏对齐

```tsx
<TitleBar
  leading={placement === 'drawer' ? <NavigationDrawerButton /> : undefined}  // 标题前
  center={placement === 'titlebar' ? navigation : undefined}                   // 标题后，占剩余宽度
/>
```

- 两个插槽外层自动声明 `--wails-draggable: no-drag`（可点击）；标题栏其余空白仍是 `drag`，窗口照常可拖。
- macOS 左侧有 72px `macSpacer` 给红绿灯；Windows / Linux 右侧是自绘三联按钮。

**高度规则**：标题栏高度只用 CSS 变量 `--fd-titlebar-h`，不要写死 36 / 40。

| 位置 | 定义 |
|------|------|
| `frontend/src/styles/global.css` | `:root { --fd-titlebar-h: 36px }`，`:root[data-platform='darwin'] { 40px }` |
| `frontend/index.html` | 同样两条（启动骨架用）+ `<head>` 内联脚本在首帧前写 `data-platform="darwin"` |
| `internal/app/window_darwin.go` | `InvisibleTitleBarHeight: 40`（整条可拖）+ `TitleBar: macTitleBar()` |

`macTitleBar()` = `MacTitleBarHiddenInset` + `ToolbarStyle = MacToolbarStyleUnifiedCompact`。原因：`HiddenInset` 默认 `Automatic` 工具栏样式常落到 52pt Unified（红绿灯中心约 26pt，偏下且随系统版本 / 全屏变化）；显式 UnifiedCompact 后红绿灯中心稳定在约 19.5–20pt，前端 40px 标题栏正好与之垂直居中。Wails 没有直接设红绿灯坐标的 API。**改任一处（前端高度 / InvisibleTitleBarHeight / ToolbarStyle）必须三处同步**，并在 macOS 真机目测。

## 6. 悬浮 Dock（`floating`）约束

实现：`components/Navigation/NavDock/{NavDock.tsx, useNavDock.ts, NavDock.module.css}`。

- **永远完整处在内容区（`main` 覆盖层）内，绝不进入标题栏**：macOS 顶部 40pt 是原生拖拽区（`InvisibleTitleBarHeight`）且左上是红绿灯，Dock 一旦压上去，手柄的指针事件被系统拖拽吞掉，将再也拖不动。
  - 拖拽中：中心点 x 夹在 `[halfW, width − halfW]`，y 夹在 `[halfH + SAFE_GAP, height − halfH − SAFE_GAP]`（`SAFE_GAP = 12`）。
  - 静止时：以顶边定位，`top: clamp(12px, y% − halfH, 100% − 2·halfH − 12px)`；Dock 实测高度经 `ResizeObserver` 写入 `--dock-half-h`（路由条目数变化时自动更新，首帧兜底 120px）。
  - 吸附边距 `EDGE_GAP = 16`；外壳在吸附侧给 `main` 让出 88px（56 宽 + 16 + 留白），Dock 不遮挡页面内容。
- **指针捕获**：手柄 `setPointerCapture`，同时挂 window 监听兜底；`pointerup` / `pointercancel` / `lostpointercapture` / `window blur`（例如在 macOS 原生拖拽区松手，webview 收不到 pointerup）一律以**最后一个合法位置**提交，避免拖拽状态卡死。
- 松手：按中心点在左半 / 右半决定 `floatDockSide`，`floatDockY = y / height`（比例存储）。
- 键盘可达：手柄 ↑ / ↓ 每次 ±0.05，← / → 换边；**双击手柄复位**到右侧居中（`right`, `0.5`）。
- 手柄是 `<button>`，自身 `--wails-draggable: no-drag`，`touch-action: none`；aria-label / title 用 `t('sidebar.dragDock')`。
- 覆盖层 `pointer-events: none`，只有 Dock 本体 `pointer-events: auto`，不影响页面点击。

改这些逻辑后跑 `e2e/floating-dock.spec.ts`（拖到左上角 / 右下角都留在内容区内、手柄仍可再拖、刷新后位置保持）。

## 7. 启动就绪与防跳变

非默认布局的用户若先看到默认布局再跳变会很难看，因此：

1. `index.html` 静态骨架（按 classic 版式）是 fixed 覆盖层，一直盖着；
2. `PreferencesProvider` 从 SQLite 读回偏好后 `ready = true`（读失败也置 true）；
3. `useAppLayout` 在 `ready` 后调用 `signalAppReady()`（派发 `foundation:app-ready`）；
4. `main.tsx` 监听该事件，rAF ×2 后淡出骨架；**1500ms 兜底**（后端异常也不会一直挡住）。

业务一般不需要直接调用 `signalAppReady`。若首屏还依赖别的异步状态，在 `useAppLayout` 里把条件并进 `ready` 判断，而不是另发信号。

## 8. 路由联动

导航条目只来自路由表（`routes.tsx` 的 `slot: 'primary' | 'footer' | 'hidden'`），所有形态共用。外部直达某个设置子项：`navigate('settings', { section: 'layout' })`（首页「当前布局」卡片就是这么跳的）；`params` 每次 navigate 都会替换。

## 9. 验证

```sh
cd frontend && pnpm typecheck
wails3 task build:server            # 仓库根执行，产物 bin/foundation-server
cd frontend && pnpm e2e             # 含 floating-dock.spec.ts；数据隔离在 .e2e-data/
cd frontend && pnpm e2e:screenshots # 9 种布局截图 → docs/screenshots/layout-<id>.png（需本机 sqlite3）
```

E2E 用的是浏览器（server 模式），没有原生红绿灯；macOS 标题栏对齐只能 `wails3 dev` 真机看。

## 反例

- ❌ `AppLayout.tsx` 里 `if (preset.id === 'myLayout') return <MyShell />` —— 加预设 + CSS 规则。
- ❌ 页面里自己画一条侧栏 / 读 `preferences.layout` 决定排版 —— 页面只管 `main` 区域内容。
- ❌ 导航组件接收 `items` / `onNavigate` props —— 走 `useNavigation()`。
- ❌ 写死 `height: 36px` / `top: 36px` 对齐标题栏 —— 用 `var(--fd-titlebar-h)`。
- ❌ 让浮动元素可以拖进标题栏区域 —— macOS 上会与原生拖拽区 / 红绿灯冲突。
- ❌ 新代码 `import { Sidebar } from '@/components/Sidebar'` —— 用 `@/components/Navigation`。
