---
name: foundation-childwindow
description: Foundation 脚手架的子窗口系统使用指南：ChildWindowService（Open/Close/List）、事件总线通信（定向 / 广播）、预设类型（confirm / message / blank）、新增子窗口类型标准操作，以及"子窗口 MVVM 与主窗口一致、通信只走事件总线"等铁律。
---

# Foundation 子窗口系统

Foundation 内置一套**类型化子窗口**方案，用于需要独立窗口（非模态 Dialog）的场景：

- **后端 Service**：`internal/app/childwindow.go` — Wails Service，管理窗口生命周期
- **前端通信层**：`frontend/src/services/childwindow/` — 基于 Wails 全局事件的消息总线
- **前端子窗口 UI**：`frontend/src/childwindows/<Type>/` — 每种类型独立 MVVM 文件夹
- **入口**：`frontend/child.html` + `frontend/src/child.tsx`（URL query 路由到对应组件）

> 子窗口是**真正的操作系统窗口**，可拖离主窗口范围、独立最小化。不是 MUI Dialog。

---

## 1. 铁律

| # | 规则 | 原因 |
|---|------|------|
| 1 | **子窗口 UI 必须走 MUI + `theme.palette.foundation.*`** | 视觉一致性；禁止硬编码颜色 |
| 2 | **子窗口文案必须走 i18n**（`useT()` + `t('childwindow.<type>.*')`） | 禁止硬编码中/英文 |
| 3 | **子窗口 MVVM 规范与 pages 完全一致** | View 不写业务、ViewModel 不返回 JSX |
| 4 | **窗口间通信只走事件总线**（`services/childwindow/`） | 禁止 localStorage / postMessage / 全局变量 |
| 5 | **ChildTitleBar 不可省略** | 无边框窗口没有标题栏用户无法拖拽和关闭 |
| 6 | **监听器必须清理** | useEffect return 或组件卸载时调用 cancel，防止内存泄漏 |
| 7 | **子窗口不共享主窗口 React 树** | 跨窗口无法 useContext / Redux；数据走事件 |

---

## 2. 何时使用

- 需要用户确认操作（删除、覆盖、不可逆操作）→ `confirm` 类型
- 需要展示操作结果（成功 / 警告 / 错误）→ `message` 类型
- 需要独立可拖拽的自定义面板（详情、编辑器、预览）→ `blank` 类型
- 需要窗口间双向通信（主窗口 ↔ 子窗口 / 子窗口 ↔ 子窗口）

**不适合子窗口的场景**：简单提示（用 MUI Snackbar）、内联表单验证、下拉菜单。

---

## 3. 架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│  主窗口 (main)                                                   │
│  React App → ViewModel → services/childwindow → Wails Events   │
└────────────────────────────┬────────────────────────────────────┘
                             │ Open / Close / List (Wails bindings)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  后端 ChildWindowService                                         │
│  internal/app/childwindow.go                                     │
│  - 创建 webview 窗口（Frameless + AlwaysOnTop + 居中）            │
│  - 管理窗口 ID 注册表                                             │
│  - 关闭时 emit child:closed:<id>                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ child.html?type=<type>&id=<id>&...
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  子窗口 (child-<type>-<n>)                                       │
│  child.tsx → switch(type) → <ConfirmWindow> / <MessageWindow>   │
│  ChildTitleBar (32px, 可拖拽, 关闭按钮)                           │
│  services/childwindow (事件总线 → emitResult / sendToWindow)     │
└─────────────────────────────────────────────────────────────────┘
```

子窗口特征：
- 无边框（`Frameless: true`）+ 前端自绘标题栏（`ChildTitleBar`，32px）
- MUI 主题（`buildMuiTheme(lightPreset)`）
- AlwaysOnTop + DisableResize + 居中显示
- ID 格式：`child-<type>-<number>`（如 `child-confirm-1`）
- 单 HTML 入口 `child.html`，通过 URL query params 路由到不同组件

---

## 4. 预设子窗口类型

| 类型 | 用途 | 默认尺寸 | 内容 |
|------|------|----------|------|
| `confirm` | 确认-取消操作 | 420×220 | 图标 + 消息 + 确认/取消按钮 |
| `message` | 信息/警告/错误展示 | 420×200 | 图标(自动识别 variant) + 消息 + 确定按钮 |
| `blank` | 通用空白窗口 | 600×400 | 仅标题栏 + 空白内容区（业务方扩展） |

---

## 5. 使用方式

### 5.1 从主窗口打开子窗口

```ts
// 通过 Wails bindings 调用后端 Service
import { Open } from '@bindings/foundation/internal/app/ChildWindowService';

// 打开确认窗口（width/height 传 0 使用默认尺寸）
const childId = await Open({
  type: 'confirm',
  title: '确认删除',
  message: '确定要删除这条记录吗？',
  width: 0,
  height: 0,
});

// 打开消息窗口
const childId = await Open({
  type: 'message',
  title: '操作成功',
  message: '数据已保存',
  width: 0,
  height: 0,
});

// 打开空白窗口（自定义尺寸）
const childId = await Open({
  type: 'blank',
  title: '详情',
  message: '',
  width: 800,
  height: 600,
});
```

### 5.2 监听子窗口结果

```ts
import { onChildResult, onChildClosed } from '@/services/childwindow';

// 监听确认结果
const cancel = onChildResult(childId, (result) => {
  if (result.action === 'confirm') {
    // 用户点了确认
  } else if (result.action === 'cancel') {
    // 用户点了取消
  }
});

// 监听子窗口关闭（无论如何关闭）
const cancelClose = onChildClosed(childId, () => {
  // 子窗口已关闭，清理监听
  cancel();
  cancelClose();
});
```

### 5.3 窗口间通信

```ts
import {
  sendToWindow,
  broadcast,
  onMessage,
  onBroadcast,
  getWindowId,
} from '@/services/childwindow';

// 向指定窗口发消息（主窗口 ID 固定为 "main"）
sendToWindow('main', {
  from: getWindowId(),
  type: 'data-updated',
  payload: { id: 123 },
});

// 向另一个子窗口发消息
sendToWindow('child-blank-3', {
  from: getWindowId(),
  type: 'refresh',
  payload: null,
});

// 广播给所有窗口
broadcast({
  from: getWindowId(),
  type: 'theme-changed',
  payload: { theme: 'dark' },
});

// 监听定向消息
const cancel = onMessage((msg) => {
  console.log(`收到来自 ${msg.from} 的消息: ${msg.type}`, msg.payload);
});

// 监听广播
const cancelBroadcast = onBroadcast((msg) => {
  // 处理广播
});

// 清理（组件卸载时必须调用）
useEffect(() => {
  return () => {
    cancel();
    cancelBroadcast();
  };
}, []);
```

---

## 6. 事件协议

| 事件名 | 方向 | 数据类型 | 说明 |
|--------|------|----------|------|
| `child:result:<id>` | 子窗口 → 调用方 | `ChildWindowResult` | 子窗口操作结果（confirm/cancel/close） |
| `child:send:<id>` | 任意 → 指定窗口 | `WindowMessage` | 定向消息 |
| `child:broadcast` | 任意 → 所有窗口 | `WindowMessage` | 广播消息 |
| `child:closed:<id>` | 后端 → 所有窗口 | `null` | 子窗口关闭通知（后端检测到窗口销毁后触发） |

### 类型定义

```ts
interface ChildWindowResult {
  id: string;         // 子窗口 ID
  action: string;     // 'confirm' | 'cancel' | 'close' | 自定义
  payload?: unknown;  // 附加数据（blank 类型自定义）
}

interface WindowMessage {
  from: string;       // 发送方窗口 ID（"main" 或 "child-<type>-<n>"）
  type: string;       // 业务消息类型
  payload: unknown;   // 消息体
}
```

---

## 7. 新增子窗口类型（标准操作）

### Step 1：创建 MVVM 文件夹

在 `frontend/src/childwindows/<NewType>/` 下建立标准结构：

```
<NewType>/
├── <NewType>.tsx           — View（纯展示 + 事件绑定）
├── use<NewType>.ts         — ViewModel（业务逻辑 + 状态）
├── <NewType>.styles.ts     — Style（sx / styled）
├── lang/
│   ├── zh-CN.ts            — 中文文案（namespace: childwindow.<newtype>.*）
│   ├── en-US.ts            — 英文文案
│   └── index.ts            — register<NewType>Locales() 导出
└── index.ts                — 导出 View + register 函数
```

### Step 2：注册到路由

在 `frontend/src/childwindows/index.ts` 追加导出：

```ts
export { default as NewTypeWindow } from './NewType';
export { registerNewTypeLocales } from './NewType/lang';
```

### Step 3：追加 switch case

在 `frontend/src/child.tsx` 的路由 switch 中追加：

```tsx
case 'newtype':
  return <NewTypeWindow id={id} title={title} message={message} />;
```

### Step 4：注册 i18n

在 `frontend/src/child.tsx` 顶部调用：

```ts
import { registerNewTypeLocales } from '@/childwindows';
registerNewTypeLocales();
```

### Step 5（可选）：后端默认尺寸

在 `internal/app/childwindow.go` 的 `resolveSize` 中追加：

```go
case "newtype":
    if opts.Width == 0 { opts.Width = 500 }
    if opts.Height == 0 { opts.Height = 350 }
```

---

## 8. 文件清单

```
后端：
  internal/app/childwindow.go            — ChildWindowService（Open/Close/List）

前端：
  frontend/child.html                     — 子窗口 HTML 入口（独立于 index.html）
  frontend/src/child.tsx                  — 子窗口 React 入口（解析 query → 路由组件）

  frontend/src/components/ChildTitleBar/  — 子窗口专用标题栏（32px, 可拖拽, 关闭按钮）
  │   ├── ChildTitleBar.tsx
  │   ├── ChildTitleBar.styles.ts
  │   └── index.ts

  frontend/src/services/childwindow/      — 事件通信总线
  │   ├── bus.ts                          — 事件常量 + 底层 Wails Events.Emit/On 封装
  │   └── index.ts                        — 高层 API（emitResult / onChildResult /
  │                                         sendToWindow / broadcast / onMessage 等）

  frontend/src/childwindows/              — 子窗口类型组件（每种独立 MVVM 目录）
      ├── index.ts                        — 汇总导出
      ├── ConfirmWindow/                  — 确认-取消
      │   ├── ConfirmWindow.tsx
      │   ├── useConfirmWindow.ts
      │   ├── ConfirmWindow.styles.ts
      │   ├── lang/
      │   └── index.ts
      ├── MessageWindow/                  — 消息提示
      │   ├── MessageWindow.tsx
      │   ├── useMessageWindow.ts
      │   ├── MessageWindow.styles.ts
      │   ├── lang/
      │   └── index.ts
      └── BlankWindow/                    — 空白模板
          ├── BlankWindow.tsx
          ├── useBlankWindow.ts
          ├── BlankWindow.styles.ts
          ├── lang/
          └── index.ts
```

---

## 9. 反例

| ❌ 错误做法 | ✅ 正确做法 | 原因 |
|-------------|-------------|------|
| 在主窗口用 MUI `<Dialog>` 模拟子窗口 | 用 `ChildWindowService.Open` 创建真窗口 | Dialog 无法拖出主窗口范围，不是独立 OS 窗口 |
| 子窗口 `import { useAppContext } from '@/contexts'` | 通过事件总线 `onMessage` 接收数据 | 跨窗口不共享 React 树，Context 取不到值 |
| 用 `window.opener` / `window.postMessage` 通信 | 用 `sendToWindow` / `broadcast` | Wails webview 不支持 opener/postMessage |
| 子窗口硬编码 `<Button>确定</Button>` | `<Button>{t('childwindow.confirm.ok')}</Button>` | 违反 i18n 铁律 |
| 忘记在 `useEffect` 清理事件监听器 | `return () => { cancel(); }` | 内存泄漏 + 重复触发 |
| 子窗口省略 `<ChildTitleBar>` | 始终渲染 `<ChildTitleBar title={title} />` | 无边框窗口没标题栏无法拖拽/关闭 |
| 用 `localStorage` 在窗口间传数据 | 用事件总线 `sendToWindow` | 违反持久化铁律 + 无法实时通知 |
| 在 View 里写业务逻辑（直接 emit 事件） | 业务逻辑放 `use<Type>.ts` ViewModel | 违反 MVVM 规范 |

---

## 10. 后端 Service API

`internal/app/childwindow.go` 暴露以下方法给前端：

```go
// Open 创建并显示一个子窗口，返回窗口 ID
func (s *ChildWindowService) Open(opts ChildWindowOptions) (string, error)

// Close 关闭指定 ID 的子窗口
func (s *ChildWindowService) Close(id string) error

// List 返回当前所有活跃子窗口 ID 列表
func (s *ChildWindowService) List() []string
```

```go
type ChildWindowOptions struct {
    Type    string `json:"type"`    // "confirm" | "message" | "blank" | 自定义
    Title   string `json:"title"`   // 窗口标题（显示在 ChildTitleBar）
    Message string `json:"message"` // 传递给子窗口的消息内容
    Width   int    `json:"width"`   // 宽度（0 = 使用类型默认值）
    Height  int    `json:"height"`  // 高度（0 = 使用类型默认值）
}
```

---

## 11. 最佳实践

1. **封装高层 helper**：对于频繁使用的 confirm 场景，在 ViewModel 中封装：

   ```ts
   async function confirmDelete(itemName: string): Promise<boolean> {
     const id = await ChildWindowService.open({
       type: 'confirm',
       title: t('common.confirmDelete'),
       message: t('common.confirmDeleteMsg', { name: itemName }),
       width: 0, height: 0,
     });
     return new Promise((resolve) => {
       const c1 = onChildResult(id, (r) => {
         resolve(r.action === 'confirm'); c1(); c2();
       });
       const c2 = onChildClosed(id, () => {
         resolve(false); c1(); c2();
       });
     });
   }
   ```

2. **blank 类型扩展**：blank 窗口的 `message` 字段可传 JSON 字符串，子窗口 ViewModel 解析后渲染自定义内容。

3. **主题同步**：子窗口独立加载 MUI 主题。如果主窗口切换了主题，通过 `broadcast` 通知所有子窗口刷新。

4. **生命周期感知**：在 ViewModel 中用 `onChildClosed` 清理关联资源，避免对已关闭窗口发消息。

5. **ChildTitleBar 的 onClose**：`ChildTitleBar` 接受可选 `onClose` 回调。传入时关闭按钮执行该回调（如 confirm 窗口绑定到"取消"逻辑）；不传时默认调用 `Window.Close()`。

---

## 12. 注册子窗口完整教学（从零到可用）

以下以创建一个 `progress`（进度条）类型子窗口为完整示例。

### Step 1：创建 MVVM 文件夹

```
frontend/src/childwindows/ProgressWindow/
├── ProgressWindow.tsx
├── useProgressWindow.ts
├── ProgressWindow.styles.ts
├── lang/
│   ├── zh-CN.ts
│   ├── en-US.ts
│   └── index.ts
└── index.ts
```

### Step 2：编写 ViewModel（`useProgressWindow.ts`）

```ts
import { useState, useEffect } from 'react';
import { getChildWindowParams, onMessage } from '@/services/childwindow';
import type { WindowMessage } from '@/services/childwindow';

export const useProgressWindow = () => {
  const { id, title, message } = getChildWindowParams();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(message);

  useEffect(() => {
    const cancel = onMessage((msg: WindowMessage) => {
      if (msg.type === 'progress-update') {
        const data = msg.payload as { percent: number; status?: string };
        setProgress(data.percent);
        if (data.status) setStatus(data.status);
      }
    });
    return cancel;
  }, []);

  return { id, title, progress, status };
};
```

### Step 3：编写 View（`ProgressWindow.tsx`）

```tsx
import { Box, LinearProgress, Typography, useTheme } from '@mui/material';
import { useT } from '@/i18n';
import { ChildTitleBar } from '@/components/ChildTitleBar';
import { useProgressWindow } from './useProgressWindow';
import { progressWindowStyles } from './ProgressWindow.styles';

export const ProgressWindow = () => {
  const theme = useTheme();
  const styles = progressWindowStyles(theme);
  const t = useT();
  const { title, progress, status } = useProgressWindow();

  return (
    <Box sx={styles.root}>
      <ChildTitleBar title={title || t('childwindow.progress.defaultTitle')} />
      <Box sx={styles.body}>
        <LinearProgress variant="determinate" value={progress} sx={styles.bar} />
        <Typography sx={styles.status}>{status}</Typography>
        <Typography sx={styles.percent}>{progress}%</Typography>
      </Box>
    </Box>
  );
};
```

### Step 4：编写 Style（`ProgressWindow.styles.ts`）

```ts
import type { SxProps, Theme } from '@mui/material';

export const progressWindowStyles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const fp = theme.palette.foundation;
  return {
    root: { height: '100%', display: 'flex', flexDirection: 'column' },
    body: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 3, gap: 2 },
    bar: { borderRadius: 1 },
    status: { fontSize: 13, color: fp.text.secondary, textAlign: 'center' },
    percent: { fontSize: 20, fontWeight: 600, color: fp.text.primary, textAlign: 'center' },
  };
};
```

### Step 5：编写 lang 文件

**`lang/zh-CN.ts`**：
```ts
import type { Messages } from '@/i18n';
export const progressWindowZhCN: Messages = {
  childwindow: { progress: { defaultTitle: '处理中' } },
};
```

**`lang/en-US.ts`**：
```ts
import type { Messages } from '@/i18n';
export const progressWindowEnUS: Messages = {
  childwindow: { progress: { defaultTitle: 'Processing' } },
};
```

**`lang/index.ts`**：
```ts
import { localeRegistry } from '@/i18n';
import { progressWindowZhCN } from './zh-CN';
import { progressWindowEnUS } from './en-US';

let registered = false;
export const registerProgressWindowLocales = (): void => {
  if (registered) return;
  localeRegistry.extend('zh-CN', progressWindowZhCN);
  localeRegistry.extend('en-US', progressWindowEnUS);
  registered = true;
};
```

### Step 6：编写 `index.ts` 导出

```ts
export { ProgressWindow } from './ProgressWindow';
export { registerProgressWindowLocales } from './lang';
```

### Step 7：注册到子窗口系统

**`frontend/src/childwindows/index.ts`** 追加：
```ts
export { ProgressWindow, registerProgressWindowLocales } from './ProgressWindow';
```

**`frontend/src/child.tsx`** 顶部追加注册：
```ts
import { registerProgressWindowLocales } from '@/childwindows/ProgressWindow';
registerProgressWindowLocales();
```

**`frontend/src/child.tsx`** switch 中追加 case：
```tsx
case 'progress':
  content = <ProgressWindow />;
  break;
```

### Step 8（可选）：后端默认尺寸

在 `internal/app/childwindow.go` 的 `resolveSize` 中追加：
```go
case "progress":
    return 380, 180
```

### Step 9：从主窗口使用

```ts
import { ChildWindowService } from '@/services/childwindow/ChildWindowService';
import { sendToWindow } from '@/services/childwindow';

// 打开进度窗口
const id = await ChildWindowService.open({
  type: 'progress',
  title: '正在导出',
  message: '准备中…',
  width: 0, height: 0,
});

// 更新进度（从主窗口向子窗口发消息）
sendToWindow(id, {
  from: 'main',
  type: 'progress-update',
  payload: { percent: 50, status: '已处理 50/100 条' },
});

// 完成后关闭
await ChildWindowService.close(id);
```

---

**完成。** 新类型子窗口从创建到可用只需以上 9 步，核心是 MVVM 文件夹 + 注册到 `child.tsx` + 注册 i18n。
