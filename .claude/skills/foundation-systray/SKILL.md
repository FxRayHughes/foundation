---
name: foundation-systray
description: Foundation 系统托盘使用指南：SystrayService（Enable/Disable）、注册式模块系统、托盘面板弹窗（MUI 风格）、内置模块（AppStatus/QuickActions/Notifications/ExitButton）、新增模块标准操作，以及 settings.ts 功能配置。
---

# Foundation 系统托盘

Foundation 内置一套**注册式系统托盘**方案，点击托盘图标弹出 MUI 风格的面板窗口。面板内容通过模块注册表动态组装，业务方可自由增删模块。

- **后端 Service**：`internal/app/systray.go` — `SystrayService`（Enable/Disable/IsEnabled）
- **前端面板**：`frontend/src/systray/` — 注册式模块系统 + MUI 面板
- **前端配置**：`frontend/src/settings.ts` — 功能开关（默认不启用）
- **入口**：`frontend/systray.html` + `frontend/src/systrayEntry.tsx`

> 托盘面板是真正的 OS 窗口（Frameless + AlwaysOnTop + Hidden），点击托盘图标弹出，失焦自动隐藏。

---

## 1. 铁律

| # | 规则 | 原因 |
|---|------|------|
| 1 | **托盘默认不启用** | `settings.ts` 中 `systray.enabled: false`，需显式调用 `SystrayService.enable()` |
| 2 | **面板 UI 必须走 MUI + `theme.palette.foundation.*`** | 视觉一致性 |
| 3 | **面板文案必须走 i18n**（`useT()` + `t('systray.*')`） | 禁止硬编码 |
| 4 | **模块通过 registry 注册** | 禁止在 SystrayPanel 中硬编码模块列表 |
| 5 | **模块自注册**（副作用 import） | `import '@/systray/modules/XXX'` 触发注册 |
| 6 | **托盘面板不共享主窗口 React 树** | 跨窗口数据走事件总线 |

---

## 2. 架构总览

```
┌─────────────────────────────────────────────────────────┐
│  主窗口                                                  │
│  settings.ts → SystrayService.enable() → 后端启用托盘    │
└─────────────────────────────┬───────────────────────────┘
                              │ Wails bindings
                              ▼
┌─────────────────────────────────────────────────────────┐
│  后端 SystrayService                                     │
│  internal/app/systray.go                                 │
│  - Enable(): 创建 SystemTray + AttachWindow              │
│  - Disable(): 标记禁用                                   │
│  - IsEnabled(): 查询状态                                 │
└─────────────────────────────┬───────────────────────────┘
                              │ systray.html (320×420, Frameless)
                              ▼
┌─────────────────────────────────────────────────────────┐
│  托盘面板窗口                                            │
│  systrayEntry.tsx → SystrayPanel                         │
│  registry.list() → 按 order 渲染注册模块                  │
│  modules/AppStatus | QuickActions | Notifications | Exit │
└─────────────────────────────────────────────────────────┘
```

---

## 3. settings.ts 功能配置

`frontend/src/settings.ts` 是应用功能配置中心（与 `main.tsx` 同级）：

```ts
export interface FoundationSettings {
  systray: {
    enabled: boolean;
  };
}

export const settings: FoundationSettings = {
  systray: {
    enabled: false,  // 改为 true 则启动时自动启用托盘
  },
};
```

业务方可在此文件中扩展更多功能开关。

---

## 4. 启用/禁用托盘

### 从前端控制

```ts
import { SystrayService } from '@/services/systray';

// 启用托盘（托盘图标出现在系统通知区域）
await SystrayService.enable();

// 禁用托盘
await SystrayService.disable();

// 查询状态
const enabled = await SystrayService.isEnabled();
```

### 启动时自动启用（基于 settings.ts）

在 `App.tsx` 或入口处：
```ts
import { settings } from '@/settings';
import { SystrayService } from '@/services/systray';

if (settings.systray.enabled) {
  SystrayService.enable();
}
```

---

## 5. 注册式模块系统

### 核心概念

```ts
// frontend/src/systray/types.ts
interface SystrayModule {
  id: string;              // 唯一标识
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
| `QuickActions` | 20 | 显示主窗口、打开设置 |
| `Notifications` | 30 | 最近活动列表（占位） |
| `ExitButton` | 100 | 退出应用 |

---

## 6. 新增托盘模块（标准操作）

### Step 1：创建模块文件夹

```
frontend/src/systray/modules/<ModuleName>/
├── <ModuleName>.tsx    — React 组件
└── index.ts            — 自注册到 registry
```

### Step 2：编写组件

```tsx
// frontend/src/systray/modules/MyModule/MyModule.tsx
import { Box, Typography, useTheme } from '@mui/material';
import { useT } from '@/i18n';

export const MyModule = () => {
  const theme = useTheme();
  const fp = theme.palette.foundation;
  const t = useT();

  return (
    <Box sx={{ px: 2, py: 1.5, borderTop: `1px solid ${fp.divider}` }}>
      <Typography sx={{ fontSize: 13, color: fp.text.primary }}>
        {t('systray.myModule.title')}
      </Typography>
    </Box>
  );
};
```

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

---

## 7. 面板窗口行为

| 行为 | 说明 |
|------|------|
| 弹出位置 | 托盘图标附近（`AttachWindow` + `WindowOffset(5)`） |
| 隐藏触发 | 面板失焦自动隐藏（Wails 内置行为） |
| 窗口尺寸 | 320×420（平台文件中配置） |
| 任务栏 | Windows 上 `HiddenOnTaskbar: true` |

---

## 8. 文件清单

```
后端：
  internal/app/systray.go              — SystrayService（Enable/Disable/IsEnabled）
  internal/app/systray_windows.go      — Windows 平台窗口配置
  internal/app/systray_darwin.go       — macOS 平台窗口配置
  internal/app/systray_linux.go        — Linux 平台窗口配置

前端配置：
  frontend/src/settings.ts             — 应用功能配置中心

前端入口：
  frontend/systray.html                — 托盘面板 HTML 入口
  frontend/src/systrayEntry.tsx        — 托盘面板 React 入口

前端模块系统：
  frontend/src/systray/
  ├── types.ts                         — SystrayModule 接口
  ├── registry.ts                      — 模块注册表
  ├── SystrayPanel.tsx                 — 面板容器 View
  ├── useSystrayPanel.ts               — 面板 ViewModel
  ├── SystrayPanel.styles.ts           — 面板样式
  ├── lang/                            — i18n
  ├── index.ts                         — 汇总导出
  └── modules/                         — 内置模块
      ├── AppStatus/                   — 应用状态 (order: 10)
      ├── QuickActions/                — 快捷操作 (order: 20)
      ├── Notifications/               — 通知列表 (order: 30)
      └── ExitButton/                  — 退出按钮 (order: 100)

前端 Service：
  frontend/src/services/systray/       — SystrayService 包装层
```

---

## 9. 反例

| 错误做法 | 正确做法 | 原因 |
|----------|----------|------|
| 在 SystrayPanel 中硬编码模块列表 | 用 `systrayRegistry.list()` 动态获取 | 违反注册式架构 |
| 模块中直接 import 主窗口的 Context | 通过事件总线 `broadcast` 通信 | 跨窗口不共享 React 树 |
| 启动时直接在 `app.go` 中调用 `Enable()` | 前端根据 `settings.ts` 按需调用 | 默认不启用 |
| 托盘面板硬编码中文文案 | 使用 `useT()` + i18n key | 违反 i18n 铁律 |
| 模块文件不写 `index.ts` 自注册 | 必须在 `index.ts` 中 `systrayRegistry.register(...)` | 副作用 import 是注册机制 |

---

## 10. 后端 Service API

```go
// Enable 启用系统托盘（创建托盘图标 + 面板窗口）
func (s *SystrayService) Enable()

// Disable 禁用系统托盘（标记状态，Wails v3 暂不支持运行时移除）
func (s *SystrayService) Disable()

// IsEnabled 返回托盘是否已启用
func (s *SystrayService) IsEnabled() bool
```

---

## 11. 与子窗口系统的关系

托盘面板和子窗口共享同一套事件通信总线：

```ts
import { broadcast, onBroadcast, getWindowId } from '@/services/childwindow';

// 托盘面板中的 QuickActions 模块通过 broadcast 通知主窗口
broadcast({ from: getWindowId(), type: 'app:show-window' });

// 主窗口监听
onBroadcast((msg) => {
  if (msg.type === 'app:show-window') {
    // 显示并聚焦主窗口
  }
});
```

托盘面板窗口 ID 固定为 `"systray-panel"`（在平台文件的 `Name` 字段中设置）。
