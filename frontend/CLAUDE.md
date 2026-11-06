[根目录](../CLAUDE.md) > **frontend**

# frontend - React 19 + Mantine 9 前端模块

## 模块职责

提供应用的用户界面。技术栈 React 19 + TypeScript（strict）+ Mantine 9 + CSS Modules + Vite 8，按 MVVM 分层（View / ViewModel hook / Style / Service）。提供干净的两栏布局（侧边栏 + 主内容）、自绘标题栏、方形圆角按钮主题、注册式多主题系统。生产构建产物 `frontend/dist` 由 `main.go` 通过 `embed.FS` 打入 Go 二进制。

## 入口与启动

- HTML 入口：`frontend/index.html`
- TS 入口：`frontend/src/main.tsx`（`import '@/styles'` 引入全局样式 + 创建 React 19 root）；子窗口入口 `frontend/child.html` + `src/child.tsx`；托盘面板入口 `frontend/systray.html` + `src/systrayEntry.tsx`。三个入口都挂 `<I18nProvider><FoundationThemeProvider>`，经 `appsettings:changed` 事件保持主题 / 语言同步
- 应用根：`frontend/src/App.tsx`（注册主题预设 / locale + `<I18nProvider>` + `<FoundationThemeProvider>`（内含 `MantineProvider`）+ `PreferencesProvider` + `RouterProvider` + `AppLayout`）
- Vite 配置：`frontend/vite.config.ts`
  - dev server 绑定 `127.0.0.1:9245`（可通过 `WAILS_VITE_PORT` 覆盖）
  - 别名：`@ → src/`、`@bindings → bindings/`
  - 启用 `@vitejs/plugin-react` + `@wailsio/runtime/plugins/vite`
  - 多入口：`build.rolldownOptions.input = { main: index.html, child: child.html, systray: systray.html }`（Vite 8 用 `rolldownOptions`，见「骨架屏与首屏优化」的分包规则）

## 对外接口

模块对外为浏览器 UI，不暴露 HTTP API。与后端的交互边界：

| 交互方式 | 当前用法 | 涉及文件 |
|----------|----------|----------|
| 方法调用 | `GreetService.greet(name)` | `src/services/greet/GreetService.ts` 包装 `@bindings/foundation/internal/services/greet` |
| 偏好读写 | `PreferencesService.{get/set/list/delete/reset}` | `src/services/preferences/PreferencesService.ts` |
| 应用设置 | `AppSettingsService.{get,setThemeChoice,setCustomTheme,resetCustomTheme,setLocaleChoice,onChanged}` | `src/services/appsettings/AppSettingsService.ts` |
| 数据存储 | `StorageService.{getStats,setCustomPath,resetPath}` | `src/services/storage/StorageService.ts` |
| 原生对话框 | `NativeDialogs.{openFile,openFiles,openDirectory,saveFile,confirm,info,warning,error}` | `src/services/dialogs/NativeDialogs.ts` |
| 表格导出 | `ExportService.saveCSV({ defaultFilename, content, title?, filterLabel? })` / `saveXLSX({ defaultFilename, table, title?, filterLabel? })`：原生「另存为」→ 后端 `exportsvc.WriteCSV`（UTF-8 BOM）/ `WriteXLSX`（excelize，表头加粗冻结、数字保持数值），统一 `filex.WriteAtomic` 落盘；取消返回 `null`，写失败 reject；`title` / `filterLabel` 由调用方传 `t()` 结果 | `src/services/export/ExportService.ts` 包装 `@bindings/foundation/internal/services/exportsvc` |
| 子进程 | `SubprocessService`（白名单命令） | `src/services/subprocess/SubprocessService.ts` |
| 子窗口 | `ChildWindowService.{open,close,list}` + 事件总线 `broadcast` / `onBroadcast` / `sendToWindow` | `src/services/childwindow/` |
| 系统托盘 | `SystrayService.{enable,disable,isEnabled,setMenuLabels}`（开关由后端持久化到 preferences `systray.enabled`，启动自动恢复） | `src/services/systray/SystrayService.ts` 包装 `@bindings/foundation/internal/app/systrayservice` |
| 事件订阅 | `time` 事件 → `useTimeEvent()` | `src/shared/hooks/useTimeEvent.ts` |
| 事件订阅 | `appsettings:changed`（payload = 字段名）→ `AppSettingsService.onChanged(cb)`，`FoundationThemeProvider`（200ms 防抖）/ `I18nProvider` 据此重拉 | `src/services/appsettings/AppSettingsService.ts` |
| 窗口控制 | 最小化 / 最大化 / 关闭 | `src/components/TitleBar/useWindowControls.ts` 调用 `Window.Minimise/Maximise/Close` |

## 关键依赖与配置

`frontend/package.json` 关键字段：

- `type: module`
- 运行时依赖：`react ^19.2.6`、`react-dom ^19.2.6`、`@mantine/core 9.7.5`、`@mantine/hooks 9.7.5`、`@mantine/charts 9.7.5`（+ `recharts 3.10.1`）、`mantine-datatable 9.4.0`、`@tabler/icons-react 3.50.0`、`clsx`、`@wailsio/runtime 3.1.0`（锁定版本，不用 latest）
- 开发依赖：`vite ^8.0.14`、`@vitejs/plugin-react ^6.0.2`、`typescript ^6.0.3`、`@types/react`、`@types/react-dom`
- 脚本：`dev` / `build` / `build:dev` / `preview` / `typecheck`

`frontend/tsconfig.json`：strict 全开，`noUncheckedIndexedAccess`，`paths` 别名 `@/* @bindings/*`，`allowJs: true`（Wails 生成的 bindings 是 .js）。

## MVVM 规范摘要

完整规范见 [DEVELOPMENT.md](./DEVELOPMENT.md)。核心四条铁律：

1. **每个组件 / 页面独立文件夹**，至少含 `<Name>.tsx`（View）、`use<Name>.ts`（ViewModel）、`<Name>.module.css`（Style，CSS Modules）、`index.ts`（出口）。带文案的页面再补 `lang/{<code>.ts, index.ts}`。Style 文件标准范例：`src/components/Sidebar/Sidebar.module.css`（Sidebar 状态全部来自 `useRouter()` / `usePreferences()`，因此省略了 ViewModel）。
2. **View 不写业务**（仅消费 ViewModel），**ViewModel 不返回 JSX**（仅返回数据 + 回调）。
3. **ViewModel 不直接 import** `@wailsio/runtime` 或 `@bindings/*`，必须经 `services/` 层。**ViewModel 不持有翻译后的字符串** —— 暴露 i18n key 给 View，由 View 调 `t()`。
4. **任何人类可见字符串必须走 `t()`** —— 见下方"i18n 规范"小节。

## 路由规范（铁律 / 强约束）

> **本节为代码审查准入门槛。任何新增页面 PR 不遵守这里的规则将被拒绝。**

### 核心约束

1. **路由表是唯一事实源** —— 所有页面必须在 `src/routes.tsx` 注册一条 `RouteDefinition`，禁止在任何组件里硬编码 `if (page === 'xxx')` 或独立的页面切换 state。
2. **导航只能通过 `useRouter().navigate(id)`** —— 不允许传递 `onNavigate` 回调、不允许直接读写"当前页"的全局状态、不允许新建并行的路由系统。
3. **页面 = pages/<Name>/ 文件夹，三件齐全** —— `<Name>.tsx` + `use<Name>.ts`（即使空也要有，便于扩展）+ `<Name>.module.css` + `index.ts`，与其他组件相同 MVVM 结构。
4. **`AppLayout` 不接收 `children`** —— 主内容由 `<RouterOutlet />` 从路由表渲染。新增页面**绝不**改 `AppLayout`。
5. **Sidebar 不维护菜单数组** —— 它从 `useRouter()` 的 `primary` / `footer` 自动读取，新增带导航的页面只需在 `routes.tsx` 设置 `slot`。

### 添加一个新页面（标准操作）

```tsx
// 1. 写页面：pages/AccountPage/{AccountPage.tsx, useAccountPage.ts, AccountPage.module.css, index.ts}
//    若有人类可见文案，再加 pages/AccountPage/lang/{zh-CN.ts, en-US.ts, index.ts}

// 2. 在 src/routes.tsx 追加一项
import { IconUser } from '@tabler/icons-react';
import { AccountPage } from '@/pages/AccountPage';

export const routes: RouteDefinition[] = [
  // ...
  {
    id: 'account',           // 唯一；导航用 navigate('account')
    labelKey: 'route.account', // i18n key（公用 locale 已注册），Sidebar tooltip 等读这个
    label: 'Account',         // 兜底字面量（labelKey 缺失时用）
    icon: IconUser,           // Sidebar 图标（@tabler/icons-react 的 Icon 组件）
    element: <AccountPage />,
    slot: 'primary',          // 'primary' 顶部 / 'footer' 底部 / 'hidden' 不上 Sidebar
    keepAlive: false,         // 可选；默认 false。true 表示离开后保留页面 state
  },
];

// 3. 在 src/i18n/locales/<code>.ts 公用 route.* 节点补一条 'account: ...'
// 4. 在 src/pages/AccountPage/index.ts 导出 registerAccountPageLocales
// 5. App.tsx 顶部调一次 registerAccountPageLocales()
```

**完成。** 不需要改 `AppLayout` / `Sidebar` / `App.tsx` —— 系统会自动接管。

### 在页面内跳转

```ts
const { navigate, active } = useRouter();
navigate('settings');         // 跳转到 settings 页
console.log(active.id);       // 当前激活页 id
```

### `RouteSlot` 语义

| slot | 行为 |
|------|------|
| `'primary'`（默认） | Sidebar 顶部主导航区 |
| `'footer'` | Sidebar 底部固定区（如 Settings） |
| `'hidden'` | 不在 Sidebar 上出现，但仍可通过 `navigate(id)` 进入（如向导、详情页） |

### `keepAlive` 语义（页面状态缓存）

| 值 | 行为 | 适用场景 |
|----|------|----------|
| `false`（默认） | 离开页面立即卸载组件，再次进入时全新挂载 —— `useState` / `useRef` / 滚动位置 / 表单输入 **全部丢失** | 大多数页面：设置、详情、纯展示页 |
| `true` | 首次访问后常驻 DOM，离开时 `display: none` 隐藏；再次进入时**保留所有 state** | 填到一半的表单、长列表带滚动位置、有昂贵首次加载的页面 |

**实现细节**（`src/router/RouterOutlet.tsx`）：

- `keepAlive: true` 的路由由 `RouterOutlet` 用一层包装 `<div style="display: contents | none">` 控制显隐，激活时 `contents` 在布局上等价于直接渲染，不会引入额外盒子层级。
- 缓存按需建立：路由首次被 `navigate` 命中后才会挂载，从未访问过的 `keepAlive` 路由不会预渲染，避免启动阻塞。
- 缓存仅存活在当前会话；刷新窗口（dev 热重载、wails 重启）会重置全部缓存。
- **不要滥用**：keepAlive 页面的 `useEffect` 不会因为离开而触发清理，定时器 / 订阅必须自己在切走时暂停 —— 可用 `useRouter().active.id === '<self>'` 判断。

### 反例（PR 中出现这些会被打回）

❌ 在 `App.tsx` 里搞自己的 `useState<'home' | 'settings'>`：

```tsx
const [page, setPage] = useState<'home' | 'settings'>('home');
return page === 'home' ? <HomePage /> : <SettingsPage />;
```

❌ 给 `Sidebar` 传 `onNavigate` / `items` props：

```tsx
<Sidebar items={[...]} onNavigate={(id) => setPage(id)} />
```

❌ 在 `AppLayout` 接收 `children` 来自己塞页面：

```tsx
<AppLayout><MyPage /></AppLayout>
```

❌ 引入第三方路由库（react-router 等）—— 桌面应用不需要 URL，引入只会带来无意义的复杂度。如有特殊需求请先与维护者讨论。

✅ 永远只走 `routes.tsx` + `<RouterOutlet />` + `useRouter()`。

### 路由系统文件

```
src/router/
├── types.ts              # RouteDefinition / RouteSlot / RouterContextValue
├── RouterProvider.tsx    # <RouterProvider> + useRouter()
├── RouterOutlet.tsx      # 渲染当前激活路由的 element
└── index.ts              # 出口

src/routes.tsx            # 路由表（唯一事实源）
```



- 主题系统：`src/styles/themes/`（注册式，唯一事实源；详见 `.claude/skills/foundation-theme/SKILL.md`）。
  - `types.ts`：`FoundationPalette` 语义槽位（`bg.*` / `text.*` / `divider` / `accent` / `status.*`）
  - `presets/light.ts`：默认白色预设（`foundation-light`）
  - `presets/dark.ts`：暗色预设（`foundation-dark`）
  - `presets/obsidian.ts`：纯黑紫调预设（`foundation-obsidian`）
  - `registry.ts`：单例 `themeRegistry`（`register` / `list` / `subscribe`）
  - `buildMantineTheme.ts`：preset → Mantine theme 编译器。① `cssVariablesResolver` 把 `FoundationPalette` 注入为 CSS 变量 `--fd-*`；② `accent` 生成 10 级色阶注册为 Mantine 主色 `foundation`（`primaryColor`）；③ Mantine 语义变量（`--mantine-color-body/text/dimmed/default*/error/anchor`）映射到 `--fd-*`；④ 导出 `FOUNDATION_CSS_VARS`（槽位 → `'var(--fd-xxx)'` 字符串对照表）
  - `mantineComponents.module.css`：Mantine 原生组件（Button / ActionIcon / Paper / Card / Popover / Menu / Input / Tooltip）的全局样式覆盖，由 `buildMantineTheme` 经 `classNames` 注入
  - `useFoundationPalette.ts`：JS 侧读取当前预设的真实色值（仅 canvas / 算透明度等必须拿具体色值的场景）
  - `ThemeProvider.tsx`：`<FoundationThemeProvider>`（渲染 `MantineProvider`，`forceColorScheme={preset.mode}`）+ `useFoundationTheme()`（运行时切换；mount 时异步从 `AppSettingsService` 拉 themeChoice + customTheme，hydrate 进 registry）
  - `customTheme.ts`：用户自定义主题（`foundation-custom`）—— `seedFromPreset` / `previewCustomTheme` / `hydrateCustomTheme` / `unregisterCustomTheme` / `parseStoredCustomTheme`。**持久化已迁到 SQLite**（`appsettings.custom_theme` JSON 字段），不再走 localStorage
  - `index.ts`：`registerFoundationThemes()` 启动时调用一次（幂等）
  - 预设可选字段 `mantineOverrides`（`MantineThemeOverride`）：对单个预设深合并覆盖 Mantine theme（字号 / 圆角 / 组件 defaultProps），颜色仍只通过 `palette` 表达
- 全局样式：`src/styles/index.ts`（按序 import `@mantine/core/styles.css` → `@mantine/charts/styles.css` → `mantine-datatable/styles.css` → `global.css`），由 `main.tsx` / `child.tsx` 以 `import '@/styles'` 引入一次；`global.css` 替代原 CssBaseline（body 底色 / 滚动条），颜色只用 `--fd-*`。
- 用户偏好系统：`src/preferences/`（与主题分离 —— 主题管"配色"，偏好管"行为/显隐"）。`<PreferencesProvider>` + `usePreferences()`，**持久化走 SQLite**（`preferences` 表，每键一行）。mount 时异步拉取，UI 用默认值兜底首屏。
- 国际化系统：`src/i18n/`（注册式 + 页面级语言包；详见 `.claude/skills/foundation-i18n/SKILL.md`）。
  - 公用 locale：`src/i18n/locales/<code>.ts`（仅放跨页面 keys：`app.*` / `sidebar.*` / `titleBar.*` / `route.*` / `common.*`）
  - 页面级语言包：`src/pages/<Name>/lang/<code>.ts`，由 page 的 `register<Name>Locales()` 通过 `localeRegistry.extend(code, partial)` 深合并
  - `<I18nProvider>` 在 Provider 链最外层；组件用 `useT()` / `useI18n()` 消费
  - localeChoice **走 SQLite**（`appsettings.locale_choice`），'auto' 跟随浏览器 `navigator.languages`
- **i18n 铁律**：任何"人类可见字符串"必须经 `t('key')` 输出 —— 包括 JSX 文本、`aria-label`、`placeholder`、Tooltip title、按钮文字、错误文案、常量字符串。**禁止**在 `.tsx` / `.ts` 里硬编码中文 / 英文字面量给用户看。新增页面必须配套 `lang/{<code>.ts}`，已有 locale **必须** keys 完全对齐。
- 颜色铁律：组件样式（`<Name>.module.css`）只能用 `var(--fd-*)`；JS 侧需要引用颜色（`@mantine/charts` 的 `color`、内联 `style`、SVG `fill`）用 `FOUNDATION_CSS_VARS.*`；必须拿真实色值时才用 `useFoundationPalette()`。除 `styles/themes/presets/*.ts` 外禁止硬编码十六进制；Mantine 组件不传 `color` 即走主色 `foundation`，**不要**传内置色名（`color="blue"` 等），状态色用 `var(--fd-danger/success/warning)`。
- 组件库铁律：UI 只用 Mantine（`@mantine/core` / `@mantine/hooks`）；图表用 `@mantine/charts`，高级图表（Heatmap / Funnel / Radar / Candlestick / Sankey / Gantt / Treemap / Zoomable）用 `src/components/x-pro/charts`；表格用 `src/components/x-pro/data-grid`（基于 `mantine-datatable`，列定义 `DataGridColumn<T>`）。**禁止**引入 `@mui/*` / `@emotion/*`、`sx` / `styled` 写法、CSS-in-JS。详见 `.claude/skills/foundation-mantine/SKILL.md`（及 `foundation-mantine-components` / `foundation-mantine-icons` / `foundation-mantine-charts` / `foundation-mantine-datatable`）。
- 圆角规则（**方形圆角设计**）：theme `radius` 刻度为 xs 2 / sm 4 / md 8 / lg 12 / xl 16，`defaultRadius: 'sm'`
  - 按钮 / ActionIcon：Mantine 默认 `radius="sm"`（4px）；自绘按钮 / 列表项写 `border-radius: 6px`
  - Paper / 卡片 / 容器：`8px`（`radius="md"`）
  - 不使用圆形按钮（`999` / `radius="xl"` 当胶囊）
- 拖拽：`style={{ '--wails-draggable': 'drag' }}`；按钮区用 `'no-drag'` 阻止穿透。

## 骨架屏与首屏优化

启动 → React mount 之间的白屏在 wails 桌面应用上特别明显（Windows / Linux 无边框窗口尤甚）。本脚手架内置三层方案：

1. **首屏静态骨架（消除白屏）** —— `frontend/index.html` 内联了一段 CSS + 静态 HTML 骨架（标题栏 36 + Sidebar 64 + 主内容三段），webview 拿到 HTML 立刻可见，色值与默认 light 主题对齐，`prefers-color-scheme: dark` 时切到 dark preset 颜色。React mount 完成后由 `main.tsx` 在 rAF 后给 `#startup-skeleton` 加 `.fade-out` 触发 160ms 淡出，再移除节点（兜底 800ms 强制移除）。**不要把骨架塞进 `#root`** —— `createRoot.render()` 会清空根节点，骨架就废了；它必须是 `#root` 的兄弟。
2. **页面级骨架屏组件** —— `src/components/Skeleton/{Skeleton.tsx, Skeleton.module.css}` 提供 `<Skeleton variant="rect|text|circle">` 与 `<SkeletonText lines={n} />`。颜色取 `var(--fd-bg-elevated)` / `var(--fd-bg-hover)`，shimmer 用 CSS `@keyframes`（写在 module.css 里），自动尊重 `prefers-reduced-motion`。每个 page 同目录补一份 `<Name>.skeleton.tsx` 复刻版式（避免"骨架→真实"切换时跳动）。
3. **lazy import + Suspense 兜底** —— 在 `RouteDefinition` 上加 `fallback?: ReactNode`（推荐传该页面的骨架屏组件）。`<RouterOutlet />` 自动用 `<Suspense fallback={route.fallback}>` 包裹每个 element。重型页面（`SettingsPage` 含调色板编辑器）用 `React.lazy(() => import('@/pages/X/X'))` 按需加载；轻量页面（`HomePage`）保持同步即可。**lazy 必须 import 具体文件**（如 `@/pages/SettingsPage/SettingsPage`），不要走 `index.ts` —— 否则与其他静态 import 同 index 的代码合并到主 bundle，分包失效。

新增页面时建议三件齐：`<Name>.tsx` + `<Name>.skeleton.tsx` + 在 `routes.tsx` 配 `fallback`。骨架屏不消费 `t()` —— 它是版式占位，不出文字。

### 分包规则（首屏 chunk 不被懒加载页面污染）

源自 `frontend/vite.config.ts` 注释，违反任何一条都会让懒加载页面的 chunk 在首屏被预加载：

- **Vite 8（rolldown）用 `build.rolldownOptions`**：`rollupOptions` 只是兼容别名，两者同时写时 `rollupOptions` 会被忽略。多入口（main / child / systray）写在 `rolldownOptions.input`；分包交给 rolldown 默认策略。
- **懒加载页面的骨架用独立样式**：`<Name>.skeleton.tsx` 配 `<Name>.skeleton.module.css`，**不要** import 懒加载页面自己的 `<Name>.module.css`。骨架随首屏（`routes.tsx` 静态 import）加载，共用 CSS Module 会把懒加载页面 chunk 拉进首屏预加载。参考 `SettingsPage.skeleton.module.css` / `XProDemoPage.skeleton.module.css`；同步加载的 `HomePage` 骨架可直接复用 `HomePage.module.css`。
- **语言包注册从 `'<sub>/lang'` 导入**：`App.tsx` 用 `@/pages/<Name>/lang`，`SettingsPage/lang/index.ts` 用 `../<sub>/lang`，**不要**从 `'<sub>'` / `'<Name>'` 的 index 导入 —— index 会连带导出 View，把整个页面静态拉进来。
- 首屏 chunk 变大时，优先排查"静态 import 链误把懒加载页面拉进来"。

## 持久化（SQLite + GORM，铁律）

> 完整使用指南见 `.claude/skills/foundation-persistence/SKILL.md`（加表三步、业务 service 接入、Provider 异步化模式、反例）。本节只列前端关心的边界。

应用所有跨会话状态**统一走后端 SQLite**，不允许在前端写 `localStorage` / `sessionStorage` 做用户数据持久化。

**为什么不用 web storage**：
- 数据量大时 5–10 MB 配额会爆
- 隐私模式 / 浏览器清缓存会无声丢数据
- 无法跨设备迁移、无法切换存储位置
- 加密 / 备份 / 完整性校验都做不了

**前端持久化通道**（按职责选）：

| 用途 | 通道 | 后端表 |
|------|------|--------|
| 行为偏好（开关 / 显隐 / 用户设置型布尔 / 数值） | `PreferencesService.{get,set,list}` | `preferences`（KV） |
| 应用核心设置（主题选择 / 自定义主题 JSON / 语言选择） | `AppSettingsService.*` | `app_settings`（单行） |
| 数据库自身的位置 / 大小 | `StorageService.{getStats,setCustomPath,resetPath}` | `storage.json`（独立配置文件，不在 db 里） |
| 业务数据（消息 / 任务 / 历史 / …） | 业务方在 `internal/storage/models.go` 加 `&YourModel{}` 到 `AllModels`，重启自动建表，写新 service 暴露 | 自定义表 |

**Provider 异步化模式**（`PreferencesProvider` / `FoundationThemeProvider` / `I18nProvider` 均如此）：

1. 首屏用默认值 / `'auto'` / `'system'` 立即渲染，**不阻塞 UI**
2. mount `useEffect` 调对应 `XxxService.get()` 异步拉取
3. 校验通过后 `setState` 替换为后端值（含 deep merge 默认）
4. 后续 `setX(...)` 同步走后端，写失败**不回滚 UI**（业务方可加 toast）

**禁止的反例**：

❌ 在前端组件里直接 `window.localStorage.setItem('foundation:my-flag', '1')`
❌ 在 `useState` 初始函数里同步读 localStorage（会让 SSR 不一致 + 与异步加载分裂）
❌ 把 SQLite 数据再 mirror 一份到 localStorage 做"快缓存" —— 真要快缓存请走后端的 cache_size + mmap，不要前后两套真相

✅ 全部通过 `services/<domain>/XxxService.ts` 走后端

## 原生对话框规范（铁律）

项目内**所有打开 / 保存 / 选择文件夹 / 确认 / 错误提示** 必须走 `NativeDialogs`（封装 Wails v3 的 `Dialogs.*`）。**禁止**使用浏览器 `alert` / `confirm` / `prompt` / `<input type="file">` —— 在 Wails webview 里观感不一致、不能选系统目录、不能定制按钮文案。

```ts
import { NativeDialogs } from '@/services';

// 选一个 .db 文件保存
const path = await NativeDialogs.saveFile({
  title: t('xxx.dialog.title'),
  filename: 'foundation.db',
  filters: [{ displayName: 'SQLite (*.db)', pattern: '*.db;*.sqlite' }],
});
if (path) { /* path 是绝对路径 */ }

// 选目录
const dir = await NativeDialogs.openDirectory({ title: t('...') });

// 选已有文件（单选 / 多选）
const file = await NativeDialogs.openFile({ filters: [...] });
const files = await NativeDialogs.openFiles({ filters: [...] });

// 二选一确认
const ok = await NativeDialogs.confirm({
  title: t('...'),
  message: t('...'),
  okLabel: t('...'),
  cancelLabel: t('...'),
});

// 提示 / 警告 / 错误
await NativeDialogs.info(title, message);
await NativeDialogs.warning(title, message);
await NativeDialogs.error(title, message);
```

**所有对话框文案必须走 `t()`** —— 标题、消息、按钮、过滤器名称都不允许硬编码字面量。

## Icon 规范（铁律）

**任何 UI 中的图标必须用 `@tabler/icons-react` 提供的 React 组件**，禁止使用：

- ❌ Emoji 当 icon（`📁` `🗑️` `⚙️` `🌐` `❤️` 等）—— 跨平台渲染不一致（Windows / macOS / Linux 字形差异巨大）、不可换色、不能跟随 `currentColor`、屏幕阅读器朗读不可控、违反方圆设计语言
- ❌ Unicode 几何符号（`✓` `✗` `←` `→` `★` 等）—— 字体可用性不稳，方圆几何不一致
- ❌ 内联 `<svg>` 字面量（除非 Tabler 确实没有合适图标）—— 缺失统一尺寸 / 描边规范
- ❌ 其它 icon 包（`@mui/icons-material` / `react-icons` / `lucide-react` / `heroicons` 等）—— 线宽与几何语言会与 Tabler 体系冲突

✅ 正确写法：

```tsx
import { Button } from '@mantine/core';
import { IconFolderOpen, IconRestore, IconTrash } from '@tabler/icons-react';

<Button leftSection={<IconFolderOpen size={20} stroke={1.75} />}>
  {t('xxx.label')}
</Button>
```

**风格选择**：统一使用默认的 outline（线条）图标，`stroke={1.75}`（与方圆设计语言的圆角线条对齐）。`IconXxxFilled` 实心变体仅在需要强调 / 切换态对比时使用（如收藏已选中），不要在同一区域混用。

**尺寸规则**（`size` 单位 px）：
- `16`–`18`：行内文本 / 小号按钮（`size="xs"`）/ 表格单元格
- `20`：按钮 `leftSection` / ActionIcon / 表格行（默认首选）
- `24`：Sidebar 导航图标
- `32`–`40`：状态卡片 / 空状态 / 子窗口提示图标
- 不要用 `style` 内联改尺寸，用 `size` prop；需要额外样式时给 `className`

**色彩**：
- 默认跟随 `currentColor` —— 让按钮 / 文本颜色驱动 icon 颜色
- 需要语义色时在 `*.module.css` 里写 `color: var(--fd-accent)` / `var(--fd-danger)` / `var(--fd-success)` / `var(--fd-warning)`，不要给 icon 传十六进制

**类型**：路由 / 配置里存图标组件时用 `import type { Icon } from '@tabler/icons-react'`（如 `RouteDefinition.icon?: Icon`）。

**aria**：
- 装饰性 icon（旁边已有文字）→ 不需要 aria-label，让 screen reader 跳过即可
- 纯 icon 按钮（无可见文字）→ 在外层 `ActionIcon` / 按钮上写 `aria-label={t('...')}`，不在 icon 本身写

**新增 Icon 时优先级**：先在 [Tabler Icons](https://tabler.io/icons) 搜 → 找不到再考虑写自定义 SVG（放在 `src/components/icons/`，按 Tabler 风格封装：24 viewBox、`stroke="currentColor"`、接收 `size` / `stroke` props）。详见 `.claude/skills/foundation-mantine-icons/SKILL.md`。

## 设置页：子目录隔离规范

`src/pages/SettingsPage` 是「框架 + 子页面」结构：

```
SettingsPage/
├── SettingsPage.tsx           # 框架：左列入口列表 + 右列分发
├── SettingsPage.skeleton.tsx
├── SettingsPage.module.css   # 仅"框架"样式：root / list / detail / 共享 section
├── useSettingsPage.ts         # 仅管 items + activeItemId（不持业务状态）
├── index.ts                   # 出口：SettingsPage / Skeleton / registerSettingsPageLocales
├── lang/                      # 顶层文案：eyebrow / title / list / themes
│   ├── zh-CN.ts
│   ├── en-US.ts
│   └── index.ts               # 调子页面所有 register<Sub>Locales（级联）
├── personalization/           # 子页面 1：主题 + 显示偏好 + 自定义主题
│   ├── Personalization.tsx
│   ├── usePersonalization.ts
│   ├── Personalization.module.css
│   ├── lang/{zh-CN,en-US,index}.ts
│   └── index.ts               # 出口：Personalization + registerPersonalizationLocales
├── language/                  # 子页面 2：语言选择
│   └── ...（同上结构）
└── database/                  # 子页面 3：数据存储路径管理
    └── ...（同上结构）
```

### 加新子页面（标准操作）

1. 在 `SettingsPage/<sub>/` 下建一套 `<Sub>.tsx` + `use<Sub>.ts` + `<Sub>.module.css` + `index.ts` + `lang/{zh-CN,en-US,index}.ts`
2. `<Sub>/lang/index.ts` 实现 `register<Sub>Locales()`（参考 `database/lang/index.ts`）
3. `SettingsPage/lang/index.ts` 内 `import { register<Sub>Locales } from '../<sub>/lang'`（从 `lang` 导入，不从 `../<sub>` index，避免把子页面 View 拉进首屏 chunk）并添加调用
4. `SettingsPage/useSettingsPage.ts` 的 `items` 追加一项 `{ id, labelKey, descriptionKey }`
5. `SettingsPage/lang/{zh-CN,en-US}.ts` 在 `settings.list.<id>.{label,description}` 加文案
6. `SettingsPage.tsx` 右列分发处加 `{vm.activeItem.id === '<id>' && <Sub />}`

**约束**：
- 子页面**不向外暴露内部业务**（只导出顶层 View 组件 + register 函数）
- 子页面文案 **namespace** 严格对应：`settings.<sub>.*`（不要塞顶层 `settings.sections.<sub>` 的扁平形态）
- 子页面**专属样式**写在 `<Sub>.module.css`；**共享样式**（section 卡片标题 / hint 等）走 `SettingsPage.module.css`，子页面 `import shared from '../SettingsPage.module.css'` 后与自身 `classes` 混用（`className={clsx(shared.section, classes.card)}`）；颜色一律 `var(--fd-*)`
- 子页面之间禁止互相 import —— 如有公共逻辑，提到 `services/` 或 `shared/`

### 反例

❌ 把所有子页面挤回 `SettingsPage.tsx`（一个文件几百行 + ViewModel 字段爆炸）
❌ 子页面文案合并到 `SettingsPage/lang/zh-CN.ts` 顶层（违反隔离，多人协作冲突）
❌ 子页面 import 兄弟子页面的 hook（`personalization/` import `database/useDatabase`）


## 数据模型

Sidebar 不持有数据模型 —— 导航项完全来自 `src/routes.tsx` 的 `RouteDefinition`（`icon?: Icon` 为 `@tabler/icons-react` 组件）。数据表格的列模型见 `src/components/x-pro/data-grid/types.ts`（`DataGridColumn<T>` / `DataGridRow`）。

## 测试与质量

- 当前未配置测试框架（无 Vitest / Playwright）。
- TypeScript strict 模式 + `noUncheckedIndexedAccess` 已开启。
- 推荐：Vitest 覆盖 `use<Page>` ViewModel hook（纯函数，易测），Playwright 覆盖窗口控制 / 关键页面流程。

## 常见问题 (FAQ)

- Q：`@bindings/foundation/...` 报模块找不到？
  - A：bindings 是 Wails 在 dev / generate 时生成的。首次执行 `wails3 dev` 或 `wails3 generate bindings` 后才会出现。该目录已 `.gitignore`。
- Q：改了 Go module 名后前端报错？
  - A：bindings 路径前缀就是 module 名。改 `go.mod` 后必须重新跑 `wails3 generate bindings`，并修改 `src/services/greet/GreetService.ts` 中的 `@bindings/foundation/...` 路径。
- Q：能否换回 JavaScript？
  - A：可以，但会丢失 ViewModel 类型契约。如果要换，请保留 `<Name>.types.ts` 写 JSDoc 类型；不推荐。
- Q：标题栏拖拽不工作？
  - A：检查根容器是否设置了 `'--wails-draggable': 'drag'`，且按钮区设置了 `'no-drag'`。Windows / Linux 无边框窗口完全依赖此 CSS 变量。
- Q：macOS 上为什么标题栏左侧空了一块？
  - A：那是给系统红绿灯按钮预留的 72px spacer（`TitleBar.tsx` 中 `isMac && <div className={classes.macSpacer} />`）。

## 相关文件清单

```
frontend/
├── DEVELOPMENT.md             # 前端开发规范（MVVM）
├── index.html                 # HTML 入口（主窗口，含内联首屏骨架）
├── child.html                 # 子窗口 HTML 入口
├── systray.html               # 托盘面板 HTML 入口
├── package.json               # 依赖与脚本
├── vite.config.ts             # Vite 配置 + 路径别名 + rolldownOptions 多入口（main / child / systray）
├── tsconfig.json              # TS strict + paths
├── public/                    # 静态资源
│   ├── wails.png
│   ├── react.svg
│   └── Inter-Medium.ttf
├── bindings/                  # wails3 generate bindings 产物（.gitignore）
└── src/
    ├── main.tsx               # import '@/styles' + React 19 createRoot
    ├── child.tsx              # 子窗口入口（I18nProvider + FoundationThemeProvider，按 query 路由）
    ├── systrayEntry.tsx       # 托盘面板入口（I18nProvider + FoundationThemeProvider + SystrayPanel）
    ├── App.tsx                # I18nProvider + ThemeProvider + PreferencesProvider + RouterProvider
    ├── vite-env.d.ts
    ├── routes.tsx             # 路由表（唯一事实源）
    ├── i18n/                  # 国际化系统（详见 foundation-i18n SKILL）
    │   ├── types.ts
    │   ├── registry.ts        # localeRegistry（register / extend / list / subscribe）
    │   ├── I18nProvider.tsx   # <I18nProvider> + useI18n() / useT()
    │   ├── index.ts
    │   └── locales/{zh-CN,en-US}.ts   # 公用 locale（不含页面级文案）
    ├── router/                # key-based 桌面路由（无 URL）
    │   ├── types.ts
    │   ├── RouterProvider.tsx
    │   ├── RouterOutlet.tsx   # 含 keepAlive 缓存逻辑
    │   └── index.ts
    ├── preferences/           # 显示偏好（showLogo / showTooltip）
    │   ├── types.ts
    │   ├── PreferencesProvider.tsx
    │   └── index.ts
    ├── styles/
    │   ├── index.ts           # 全局样式入口（Mantine core/charts/datatable 样式 + global.css）
    │   ├── global.css         # 全局基础样式（替代 CssBaseline），只用 --fd-*
    │   └── themes/                # 注册式主题系统（详见 foundation-theme SKILL）
    │       ├── types.ts
    │       ├── buildMantineTheme.ts   # preset → Mantine theme + --fd-* CSS 变量 + FOUNDATION_CSS_VARS
    │       ├── mantineComponents.module.css  # Mantine 原生组件全局覆盖
    │       ├── useFoundationPalette.ts
    │       ├── registry.ts
    │       ├── ThemeProvider.tsx
    │       ├── customTheme.ts # 用户自定义主题（foundation-custom）
    │       ├── index.ts
    │       └── presets/{light,dark,obsidian}.ts
    ├── shared/
    │   ├── platform.ts        # isWindows / isMac / isLinux
    │   ├── events.ts          # AppEvents 常量
    │   └── hooks/
    │       └── useTimeEvent.ts
    ├── services/
    │   ├── index.ts
    │   ├── greet/GreetService.ts
    │   ├── preferences/PreferencesService.ts
    │   ├── appsettings/AppSettingsService.ts   # 含 onChanged（appsettings:changed）
    │   ├── storage/StorageService.ts
    │   ├── dialogs/NativeDialogs.ts
    │   ├── export/ExportService.ts            # saveCSV / saveXLSX（原生「另存为」+ 后端 exportsvc）
    │   ├── subprocess/SubprocessService.ts
    │   ├── childwindow/                       # ChildWindowService + 事件总线 bus.ts
    │   └── systray/SystrayService.ts          # enable / disable / isEnabled / setMenuLabels
    ├── components/
    │   ├── AppLayout/         # 两栏外壳（TitleBar + Sidebar + RouterOutlet）；useAppLayout 推送托盘菜单文案 + 处理 app:open-settings
    │   ├── TitleBar/          # 自绘标题栏 + 三联控制按钮（按 OS 隐藏）
    │   ├── Sidebar/           # 左侧导航 + 底部 Settings 按钮
    │   ├── Skeleton/          # 骨架屏基础组件（Skeleton / SkeletonText）
    │   ├── ChildTitleBar/     # 子窗口标题栏（关闭按钮 aria-label = t('titleBar.controls.close')）
    │   └── x-pro/
    │       ├── charts/        # 高级图表（Heatmap / Funnel / Radar / Candlestick / Sankey / Gantt / Treemap / Zoomable）
    │       └── data-grid/     # 数据表格（mantine-datatable 封装，DataGridColumn<T> + Pro/Premium 功能）
    ├── childwindows/          # 子窗口类型（Confirm / Message / Blank，详见 foundation-childwindow SKILL）
    ├── systray/               # 托盘面板模块系统（详见 foundation-systray SKILL）
    └── pages/
        ├── HomePage/          # 示例页：Greet 调用 + Time 事件
        │   ├── HomePage.tsx
        │   ├── HomePage.skeleton.tsx  # ← 该页骨架屏
        │   ├── useHomePage.ts
        │   ├── HomePage.module.css
        │   ├── lang/{zh-CN,en-US,index}.ts
        │   └── index.ts
        └── SettingsPage/      # 设置页：主题 / 显示偏好 / 自定义主题 / 语言
            ├── SettingsPage.tsx
            ├── SettingsPage.skeleton.tsx
            ├── SettingsPage.skeleton.module.css   # 骨架独立样式（不与懒加载页面共用）
            ├── useSettingsPage.ts
            ├── SettingsPage.module.css
            ├── personalization/ language/ database/   # 子页面（各自 View / VM / module.css / lang）
            ├── lang/{zh-CN,en-US,index}.ts
            └── index.ts
```

## 变更记录 (Changelog)

- 2026-05-28 13:09:44：初始化模块文档（React 18）。
- 2026-05-28（升级）：升级到 React 19.2.6 + MUI 9.0.1 + TypeScript 6.0.3 + Vite 8.0.14；切换为 TypeScript（strict）；引入 MVVM 规范与 `DEVELOPMENT.md`；新增 `AppLayout` / `TitleBar` / `ServerList` / `ChannelList` 组件；新增 `services/` 与 `shared/` 分层；引入 `@/`、`@bindings/` 别名。
- 2026-05-28（基座化）：移除 Discord 风格三栏（删除 `ServerList` / `ChannelList`），改为干净的两栏（`Sidebar` + 主内容）；左下角加入 `Settings` 按钮；引入注册式主题系统 `src/styles/themes/`，内置 `foundation-light`（默认白）+ `foundation-dark`，新增 `<FoundationThemeProvider>` 与 `useFoundationTheme()`；按钮统一为方形圆角（`borderRadius: 6`），不再使用圆形；新增 `foundation-theme` SKILL。
- 2026-05-28（i18n）：新增国际化系统 `src/i18n/`（注册式 + 页面级语言包），内置 `zh-CN`（默认）/ `en-US`；公用文案与页面文案分离（`src/i18n/locales/` 与 `src/pages/<Name>/lang/`），通过 `localeRegistry.extend(code, partial)` 深合并；引入 `<I18nProvider>` / `useT()` / `useI18n()`；TitleBar / Sidebar / HomePage / SettingsPage 全部接入 `t()`；路由表 `RouteDefinition` 增加 `labelKey`；设置页拆出独立的"语言"入口；新增 `foundation-i18n` SKILL，确立"任何人类可见字符串必须走 `t()`"铁律。
- 2026-05-28（首屏骨架）：新增 `src/components/Skeleton/` 基础骨架组件（`Skeleton` / `SkeletonText`，shimmer 跟随主题）；HomePage / SettingsPage 各自补 `<Name>.skeleton.tsx`；`RouteDefinition` 增加 `fallback`，`RouterOutlet` 包裹 `<Suspense>`；`SettingsPage` 走 `React.lazy` 拆出独立 chunk（约 17KB），主 bundle 减小；`index.html` 内联首屏静态骨架（独立于 `#root`，160ms 淡出），`prefers-color-scheme` 适配明暗，`prefers-reduced-motion` 关闭扫光，消除 webview 启动 → React mount 间的白屏。
- 2026-05-28（持久化迁移 SQLite）：后端引入 `internal/storage` 模块（modernc/sqlite + GORM AutoMigrate + WAL + 单连接池），暴露 `preferences` / `appsettings` / `storagesvc` 三个 Wails service；前端 `PreferencesProvider` / `FoundationThemeProvider` / `I18nProvider` 全部异步化，**移除 localStorage**，统一改走 `PreferencesService` / `AppSettingsService`；`customTheme` 不再写本地 storage（持久化由 `appsettings.custom_theme` 字段承担）；新增 `NativeDialogs` 服务封装 Wails v3 `Dialogs.*`，**禁止使用浏览器 alert/confirm/prompt**；设置页新增「数据存储」子项，支持原生「另存为」对话框切换数据库路径 + 重置回默认。
- 2026-05-28（设置页子目录隔离）：`SettingsPage` 重构为「框架 + 子页面」结构 —— `personalization/` / `language/` / `database/` 三个子目录各自独立 `<Sub>.tsx` + `use<Sub>.ts` + `<Sub>.styles.ts` + `lang/`；顶层 `useSettingsPage` 仅管 items + activeItemId；新增子页面遵循同样规范（导出顶层 View + register 函数，文案命名空间 `settings.<sub>.*`）。
- 2026-05-28（数据可视化 + 表清理 + Icon 规范）：升级 `@mui/x-charts@^9.3.0`；数据存储页新增双图（PieChart 占比 + 横向 BarChart 字节，颜色取自 `theme.palette.foundation.*`），表清单逐项清空（仅对 `Clearable=true` 的表启用，带原生确认对话框）；后端 `internal/storage/models.go` 引入 `ModelDescriptor`（labelKey / clearable），`storagesvc` 新增 `GetTableStats` / `ClearTable`；新增 Icon 规范铁律：禁止 emoji / Unicode / 第三方 icon 包，必须用 `@mui/icons-material` 的 `*Rounded` 系列（与方圆设计语言对齐）。
- 2026-11-06（UI 库迁移 MUI → Mantine）：`@mui/*` / `@emotion/*` 全部移除，改用 `@mantine/core` 9.7.5 + `@mantine/hooks` + `@mantine/charts`（recharts 3.10.1）+ `mantine-datatable` 9.4.0 + `@tabler/icons-react` 3.50.0；主题编译器 `buildMuiTheme.ts` → `buildMantineTheme.ts`（`FoundationPalette` → CSS 变量 `--fd-*` + 主色 `foundation` 10 级色阶 + Mantine 语义变量映射，`FOUNDATION_CSS_VARS` / `useFoundationPalette()` 供 JS 侧），预设字段 `muiOverrides` → `mantineOverrides`；MVVM Style 文件由 `<Name>.styles.ts`（sx 工厂）改为 `<Name>.module.css`（CSS Modules），颜色一律 `var(--fd-*)`；全局样式 `src/styles/global.css` 经 `import '@/styles'` 引入；Icon 铁律改为 `@tabler/icons-react`；`@wailsio/runtime` 锁定 3.1.0。
