---
name: foundation-systray
description: Foundation 系统托盘使用指南：SystrayService（Enable/Disable/IsEnabled/SetMenuLabels，开关持久化到 preferences 表 systray.enabled、启动自动恢复）、注册式模块系统、托盘面板弹窗（Mantine 风格，失焦 / Esc 隐藏、关闭被拦截为隐藏）、内置模块（AppStatus/QuickActions/Notifications/ExitButton）、托盘右键菜单 i18n、新增模块标准操作。
---

# Foundation 系统托盘

Foundation 内置一套**注册式系统托盘**方案：左键点击托盘图标弹出 Mantine 风格的面板窗口，右键弹出原生菜单（显示主窗口 / 退出）。面板内容通过模块注册表动态组装，业务方可自由增删模块。

- **后端 Service**：`internal/app/systray.go` — `SystrayService`（Enable / Disable / IsEnabled / SetMenuLabels）
- **平台差异**：`internal/app/systray_{darwin,windows,linux}.go` — 面板窗口选项 + 托盘图标应用方式
- **前端 Service**：`frontend/src/services/systray/SystrayService.ts` — bindings 包装（enable / disable / isEnabled / setMenuLabels）
- **前端面板**：`frontend/src/systray/` — 注册式模块系统 + Mantine 面板
- **入口**：`frontend/systray.html` + `frontend/src/systrayEntry.tsx`（已在 `vite.config.ts` 的 `build.rolldownOptions.input.systray` 中启用）
- **开关 UI**：首页 `HomePage` 的「系统托盘」卡片（启用 / 禁用按钮 + 状态 + 错误提示）

> 托盘面板是真正的 OS 窗口（Frameless + AlwaysOnTop + Hidden + DisableResize），点击托盘图标弹出，失焦或按 Esc 自动隐藏。

---

## 1. 铁律

| # | 规则 | 原因 |
|---|------|------|
| 1 | **托盘默认不启用**；开关只经 `SystrayService.enable()` / `disable()` 改变 | 后端把状态写进 preferences 表 `systray.enabled`，下次启动由 `restore()` 自动恢复，前端无需在启动时再调 `enable()` |
| 2 | **面板 UI 必须走 Mantine（`@mantine/core`）+ CSS Modules，颜色只用 `var(--fd-*)`** | 视觉一致性；禁止硬编码十六进制 |
| 3 | **面板文案必须走 i18n**（`useT()` + `t('systray.*')`） | 禁止硬编码 |
| 4 | **托盘右键菜单文案也走 i18n**：由主窗口把 `t('app.trayMenu.*')` 经 `SystrayService.setMenuLabels()` 推给后端 | 原生菜单在 Go 侧绘制，无法调用 `t()`；后端只有英文兜底 |
| 5 | **模块通过 registry 注册** | 禁止在 SystrayPanel 中硬编码模块列表 |
| 6 | **模块自注册**（副作用 import） | `import '@/systray/modules/XXX'` 触发注册 |
| 7 | **托盘面板不共享主窗口 React 树** | 跨窗口指令走事件总线（`child:broadcast`）；主题 / 语言经 `appsettings:changed` 同步 |
| 8 | **ViewModel / View 不直接 import `@bindings/*`** | 统一经 `@/services/systray` |

---

## 2. 架构总览

```
┌──────────────────────────────────────────────────────────────┐
│  主窗口                                                       │
│  HomePage 托盘卡片 → useHomePage.toggleSystray()              │
│      → SystrayService.enable() / disable() / isEnabled()      │
│  AppLayout → useAppLayout()                                   │
│      → SystrayService.setMenuLabels({ t('app.trayMenu.*') })  │
│      → onBroadcast('app:open-settings') → navigate('settings')│
└──────────────────────────────┬───────────────────────────────┘
                               │ Wails bindings
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  后端 SystrayService（internal/app/systray.go）               │
│  - Enable(ctx)  : 创建面板窗口 + SystemTray + 右键菜单，持久化 true │
│  - Disable(ctx) : Destroy 托盘 + 关闭面板，持久化 false        │
│  - IsEnabled()  : 托盘是否存在                                │
│  - SetMenuLabels: 更新右键菜单文案（未启用时仅保存）           │
│  - restore()    : 启动时读 preferences `systray.enabled`      │
│  - handleBroadcast: 收到 app:show-window / app:open-settings  │
│      → 隐藏面板 + 显示 / 聚焦主窗口                            │
└──────────────────────────────┬───────────────────────────────┘
                               │ /systray.html (320×420, Frameless)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│  托盘面板窗口（Name: "systray-panel"）                         │
│  systrayEntry.tsx → I18nProvider → FoundationThemeProvider    │
│      → SystrayPanel → registry.list() 按 order 渲染模块        │
│  modules/AppStatus | QuickActions | Notifications | ExitButton│
└──────────────────────────────────────────────────────────────┘
```

---

## 3. 启用 / 禁用托盘

### 从前端控制

```ts
import { SystrayService } from '@/services/systray';

// 启用托盘（托盘图标出现在系统通知区域 / 菜单栏），并持久化开关
await SystrayService.enable();

// 禁用托盘（移除托盘图标并关闭面板窗口），并持久化开关
await SystrayService.disable();

// 查询状态（托盘当前是否存在）
const enabled = await SystrayService.isEnabled();
```

- `Enable` / `Disable` **幂等且并发安全**（同一把互斥锁串行化），重复调用无副作用。
- `Enable` 在 app 尚未 attach 时返回错误 `systray: app not attached`；持久化失败返回 `systray: persist preference: ...`。
- 首页参考实现 `pages/HomePage/useHomePage.ts`：mount 时 `isEnabled()` 读初值；`toggleSystray()` 置 busy → enable/disable → 失败写 `systrayError` → 最后再 `isEnabled()` 以后端真实状态为准。

### 持久化与启动恢复

- 开关存 SQLite `preferences` 表，键 **`systray.enabled`**，值为字符串 `"true"` / `"false"`。
- 后端经 `preferences.Service`（内部走 `holder.Current()`）读写，**不 capture `*storage.DB`**。
- `internal/app/app.go` 在 `application.New` 之后调用：

```go
systraySvc.attach(app, mainWindow)          // 回填 app 与主窗口引用（小写，不暴露给 bindings）
systraySvc.restore(context.Background())    // 值为 "true" 才创建托盘；读失败按禁用处理并打 Warn
```

> 不要在 `app.go` 里直接调用 `Enable()`，也不要在前端启动时自动 `enable()`：是否启用完全由用户上次的选择决定。

---

## 4. 托盘右键菜单（原生菜单 + i18n）

右键菜单由后端绘制，两项：**显示主窗口**（`UnMinimise` + `Show` + `Focus`）、分隔线、**退出**（`app.Quit()`）。

文案来自前端 i18n：`components/AppLayout/useAppLayout.ts` 在 `t` 变化（即语言切换）时推送：

```ts
useEffect(() => {
  void SystrayService.setMenuLabels({
    showWindow: t('app.trayMenu.showWindow'),
    quit: t('app.trayMenu.quit'),
  }).catch(() => {
    // 后端未就绪：沿用后端英文兜底
  });
}, [t]);
```

- 键在公用语言包 `src/i18n/locales/{zh-CN,en-US}.ts` 的 `app.trayMenu.{showWindow,quit}`。
- 后端 `TrayMenuLabels{ShowWindow, Quit}`（JSON `showWindow` / `quit`），空串回落到英文兜底 `"Show Window"` / `"Quit"`。
- 托盘未启用时 `SetMenuLabels` 只保存，下次创建托盘时生效；已启用时 `SetLabel` + `menu.Update`（走 `InvokeSync` 到主线程）。

---

## 5. 注册式模块系统

### 核心概念

```ts
// frontend/src/systray/types.ts
interface SystrayModule {
  id: string;              // 唯一标识（重复 register 同 id 会替换）
  order: number;           // 排序权重（越小越靠上）
  component: ComponentType; // React 组件
}
```

### 注册表 API

```ts
import { systrayRegistry } from '@/systray/registry';

// 注册模块
systrayRegistry.register({ id: 'my-module', order: 50, component: MyModule });

// 注销模块
systrayRegistry.unregister('my-module');

// 获取已注册模块列表（按 order 排序）
const modules = systrayRegistry.list();
```

### 内置模块

| 模块 | order | 功能 |
|------|-------|------|
| `AppStatus` | 10 | 应用名 + 版本 + 运行状态指示灯 |
| `QuickActions` | 20 | 显示主窗口、打开设置（`broadcast` `app:show-window` / `app:open-settings`） |
| `Notifications` | 30 | 最近活动列表（占位） |
| `ExitButton` | 100 | 退出应用（`Application.Quit()`） |

### 面板入口

`frontend/src/systrayEntry.tsx`：

```tsx
registerFoundationThemes();
registerFoundationLocales();
registerSystrayLocales();

const SystrayApp = () => (
  <I18nProvider>
    <FoundationThemeProvider>
      <SystrayPanel />
    </FoundationThemeProvider>
  </I18nProvider>
);
```

- `I18nProvider` / `FoundationThemeProvider` 各自从 `AppSettingsService`（SQLite）读取语言与主题，面板与主窗口外观一致（含自定义主题、跟随系统）。
- 两个 Provider 都订阅 `appsettings:changed`：主窗口切换主题 / 语言后面板实时刷新（详见 `foundation-theme` / `foundation-i18n`）。
- `systray.html` 内联首帧底色（`--fdn-bg-base`，跟随系统明暗），React mount 后由 Mantine + `--fd-*` 接管。

---

## 6. 新增托盘模块（标准操作）

### Step 1：创建模块文件夹

```
frontend/src/systray/modules/<ModuleName>/
├── <ModuleName>.tsx          — React 组件
├── <ModuleName>.module.css   — 样式（CSS Modules，颜色只用 var(--fd-*)）
└── index.ts                  — 自注册到 registry
```

### Step 2：编写组件

```tsx
// frontend/src/systray/modules/MyModule/MyModule.tsx
import { Text } from '@mantine/core';
import { useT } from '@/i18n';
import classes from './MyModule.module.css';

export const MyModule = () => {
  const t = useT();

  return (
    <div className={classes.root}>
      <Text className={classes.title}>{t('systray.myModule.title')}</Text>
    </div>
  );
};
```

```css
/* frontend/src/systray/modules/MyModule/MyModule.module.css */
.root {
  padding: 12px 16px;
  border-top: 1px solid var(--fd-divider);
}

.title {
  font-size: 13px;
  line-height: 1.5;
  color: var(--fd-text-primary);
}
```

> 图标用 `@tabler/icons-react`（如 `<IconEye size={18} stroke={1.75} />`，参考 `QuickActions`）；按钮用 Mantine `<Button variant="subtle" size="xs">`。

### Step 3：自注册

```ts
// frontend/src/systray/modules/MyModule/index.ts
import { systrayRegistry } from '@/systray/registry';
import { MyModule } from './MyModule';

systrayRegistry.register({ id: 'my-module', order: 50, component: MyModule });
```

### Step 4：在入口中导入（触发副作用注册）

在 `frontend/src/systrayEntry.tsx` 追加：

```ts
import '@/systray/modules/MyModule';
```

### Step 5：添加 i18n 文案

在 `frontend/src/systray/lang/zh-CN.ts` 和 `en-US.ts` 中追加：

```ts
systray: {
  // ...existing keys
  myModule: { title: '我的模块' },
}
```

### 需要主窗口配合的动作

面板里要触发主窗口行为时，用 `broadcast({ from: getWindowId(), type: '<app:xxx>' })`：

- 只需「显示 / 聚焦主窗口」：后端 `handleBroadcast` 已处理 `app:show-window` 与 `app:open-settings`（先隐藏面板，再显示主窗口），不依赖主窗口 JS 是否在运行。
- 主窗口内的路由 / 状态变化：在 `components/AppLayout/useAppLayout.ts` 用 `onBroadcast` 处理（参考 `app:open-settings` → `navigate('settings')`）。新增消息类型若也需要唤起主窗口，同步在 `systray.go` 的 `handleBroadcast` 里加 case。

---

## 7. 面板窗口行为

| 行为 | 说明 |
|------|------|
| 弹出 | 左键点击托盘图标切换面板（`tray.AttachWindow(panel).WindowOffset(5)`，Wails 默认行为） |
| 右键 | 原生菜单（未设 `OnRightClick` 时的默认行为） |
| 隐藏触发 | 失焦（`HideOnFocusLost: true`）或按 Esc（`HideOnEscape: true`）；部分 Linux 窗口管理器下 Wails 会自动跳过失焦隐藏 |
| 关闭拦截 | 用户用 Cmd+W / Alt+F4 关闭面板时，`WindowClosing` hook `Cancel()` 并改为 `Hide()`，避免托盘挂着已销毁窗口；`Disable` 与应用退出（`OnShutdown` 置位 `shuttingDown`）时放行真正关闭 |
| 窗口尺寸 | 320×420，`DisableResize: true`（平台文件中配置） |
| 窗口名 | `Name: "systray-panel"`，`URL: "/systray.html"` |
| 托盘图标 | macOS：`SetTemplateIcon`（菜单栏按明暗自动着色）；Windows / Linux：`SetIcon` + `SetDarkModeIcon`。tooltip 为应用名 |
| 任务栏 | Windows 上 `HiddenOnTaskbar: true` |

---

## 8. 文件清单

```
后端：
  internal/app/systray.go              — SystrayService（Enable/Disable/IsEnabled/SetMenuLabels + attach/restore）
  internal/app/systray_windows.go      — Windows 面板窗口选项 + 图标
  internal/app/systray_darwin.go       — macOS 面板窗口选项 + 模板图标
  internal/app/systray_linux.go        — Linux 面板窗口选项 + 图标
  internal/app/app.go                  — 注册 service、attach + restore

前端入口：
  frontend/systray.html                — 托盘面板 HTML 入口
  frontend/src/systrayEntry.tsx        — 托盘面板 React 入口（I18nProvider + FoundationThemeProvider）
  frontend/vite.config.ts              — rolldownOptions.input.systray

前端模块系统：
  frontend/src/systray/
  ├── types.ts                         — SystrayModule 接口
  ├── registry.ts                      — 模块注册表
  ├── SystrayPanel.tsx                 — 面板容器 View
  ├── useSystrayPanel.ts               — 面板 ViewModel
  ├── SystrayPanel.module.css          — 面板样式（CSS Modules）
  ├── lang/                            — i18n（registerSystrayLocales）
  ├── index.ts                         — 汇总导出
  └── modules/                         — 内置模块
      ├── AppStatus/                   — 应用状态 (order: 10)
      ├── QuickActions/                — 快捷操作 (order: 20)
      ├── Notifications/               — 通知列表 (order: 30)
      └── ExitButton/                  — 退出按钮 (order: 100)

前端 Service / 主窗口接入：
  frontend/src/services/systray/       — SystrayService 包装层（enable/disable/isEnabled/setMenuLabels）
  frontend/src/components/AppLayout/useAppLayout.ts — 推送托盘菜单文案 + 处理 app:open-settings
  frontend/src/pages/HomePage/         — 托盘开关卡片（useHomePage.toggleSystray）
```

---

## 9. 反例

| 错误做法 | 正确做法 | 原因 |
|----------|----------|------|
| 在 SystrayPanel 中硬编码模块列表 | 用 `systrayRegistry.list()` 动态获取 | 违反注册式架构 |
| 模块中直接 import 主窗口的 Context | 通过事件总线 `broadcast` 通信 | 跨窗口不共享 React 树 |
| 启动时在 `app.go` 直接 `Enable()` 或前端启动自动 `enable()` | 由 `restore()` 按 preferences `systray.enabled` 恢复 | 默认不启用，尊重用户上次选择 |
| 前端自己用 PreferencesService 写 `systray.enabled` | 只调 `SystrayService.enable()` / `disable()` | 后端在同一把锁内完成创建 / 销毁与持久化，避免状态不一致 |
| 在 Go 里写死中文菜单文案 | 主窗口 `setMenuLabels({ t('app.trayMenu.*') })` | 违反 i18n 铁律，且无法随语言切换 |
| 托盘面板硬编码中文文案 | 使用 `useT()` + i18n key | 违反 i18n 铁律 |
| 模块文件不写 `index.ts` 自注册 | 必须在 `index.ts` 中 `systrayRegistry.register(...)` | 副作用 import 是注册机制 |
| ViewModel 直接 import `@bindings/foundation/internal/app/systrayservice` | 经 `@/services/systray` | 前端调用边界 |

---

## 10. 后端 Service API

```go
// Enable 启用系统托盘（创建托盘图标 + 隐藏的面板窗口），并持久化开关。重复调用无副作用。
func (s *SystrayService) Enable(ctx context.Context) error

// Disable 移除系统托盘并关闭面板窗口，并持久化开关。重复调用无副作用。
func (s *SystrayService) Disable(ctx context.Context) error

// IsEnabled 返回托盘当前是否存在。
func (s *SystrayService) IsEnabled() bool

// SetMenuLabels 更新托盘右键菜单文案。托盘未启用时只保存，下次创建时生效。
func (s *SystrayService) SetMenuLabels(labels TrayMenuLabels)

type TrayMenuLabels struct {
    ShowWindow string `json:"showWindow"`
    Quit       string `json:"quit"`
}
```

内部（小写，不进 bindings）：`attach(app, mainWindow)`、`restore(ctx)`、`createLocked()` / `destroyLocked()`（调用方持锁；原生托盘 `Destroy` 经 `application.InvokeSync` 在主线程执行）、`handleBroadcast`、`showMainWindow`。

---

## 11. 与子窗口系统的关系

托盘面板和子窗口共享同一套事件通信总线：

```ts
import { broadcast, onBroadcast, getWindowId } from '@/services/childwindow';

// 托盘面板中的 QuickActions 模块通过 broadcast 发出指令
broadcast({ from: getWindowId(), type: 'app:open-settings' });

// 主窗口（useAppLayout）监听：只负责路由跳转；显示 / 聚焦主窗口由后端完成
onBroadcast((msg) => {
  if (msg.type === 'app:open-settings') navigate('settings');
});
```

- 后端 `SystrayService` 在托盘存在期间订阅 `child:broadcast`，处理 `app:show-window` / `app:open-settings`（隐藏面板 + 显示主窗口）；`Disable` 时取消订阅。
- 托盘面板的 Wails 窗口名固定为 `"systray-panel"`（平台文件 `Name` 字段）。注意面板 URL 不带 `?id=`，因此面板内 `getWindowId()` 返回默认值 `"main"`。
