---
name: wails-events
description: Wails v3 事件系统：自定义事件、应用事件、窗口事件、events.Common 常量、ApplicationEvent / WindowEvent 类型、JS Events.On / Events.Emit。当用户问到「Emit / On / Off / OnMultiple / OnApplicationEvent / RegisterHook / RegisterApplicationEventHook / OnWindowEvent / RegisterEvent[T] / bindings/events 事件名常量 / events.Common.WindowFocus / WindowClosing / ThemeChanged / BatteryChanged / 事件命名空间 common: windows: mac: linux:」时使用。
---

# Wails v3 - 事件系统

Wails 提供统一的 **pub/sub** 事件系统：Go ↔ JavaScript ↔ window-to-window 三向通信，支持自定义事件、系统事件、窗口事件。

## 何时使用本 SKILL

- 实现 Go ↔ JS 跨语言通信
- 监听系统事件（主题变更、电源、应用激活/失活）
- 监听窗口事件（focus/blur/resize/move/close）
- 多窗口间消息广播
- 长任务进度推送（用 events 而非返回大数组）
- 取消/订阅管理（unsubscribe func）

## 关键摘要

### 命名空间

| 前缀 | 平台 | 例子 |
|------|------|------|
| `common:` | 全平台 | `common:WindowFocus` |
| `windows:` | Windows | `windows:APMSuspend` |
| `mac:` | macOS | `mac:ApplicationDidBecomeActive` |
| `linux:` | Linux | `linux:WindowMaximize` |
| 无前缀（用户自定义） | - | `user-logged-in`, `my-app:data-updated` |

### Go 端

```go
import (
    "github.com/wailsapp/wails/v3/pkg/application"
    "github.com/wailsapp/wails/v3/pkg/events"
)

// === 自定义事件 ===
// 发送
app.Event.Emit("user-logged-in", map[string]any{"id": 123})

// 监听（返回 unsubscribe）
unsub := app.Event.On("user-logged-in", func(e *application.CustomEvent) {
    data := e.Data.(map[string]any)
    _ = data
})
unsub()  // 取消订阅

// 限次（Go 侧没有 Once，用 OnMultiple(name, cb, n)）
app.Event.OnMultiple("event-name", func(e *application.CustomEvent) { ... }, 1)

// 移除该事件所有监听 / 全部重置
app.Event.Off("user-logged-in")
app.Event.Reset()

// 同步钩子（可 e.Cancel()）
app.Event.RegisterApplicationEventHook(events.Common.ApplicationStarted, func(e *application.ApplicationEvent) { ... })
window.RegisterHook(events.Common.WindowClosing, func(e *application.WindowEvent) { e.Cancel() })

// === 应用事件（lifecycle / system） ===
app.Event.OnApplicationEvent(events.Common.ApplicationStarted, func(e *application.ApplicationEvent) {
    // 启动完成
})

app.Event.OnApplicationEvent(events.Common.ThemeChanged, func(e *application.ApplicationEvent) {
    if e.Context().IsDarkMode() {
        app.Logger.Info("dark mode")
    }
})

// === 窗口事件（仅监听单个窗口） ===
window.OnWindowEvent(events.Common.WindowFocus, func(e *application.WindowEvent) {
    // focused
})

window.OnWindowEvent(events.Common.WindowClosing, func(e *application.WindowEvent) {
    e.Cancel()  // 阻止关闭
})
```

### 常用 events.Common 常量

（按 v3.1.0 `pkg/events/events.go` 的 `events.Common` 核对）

| 应用级 | 窗口级 |
|--------|--------|
| `ApplicationStarted` | `WindowFocus` / `WindowLostFocus` |
| `ApplicationOpenedWithFile` | `WindowMinimise` / `WindowUnMinimise` |
| `ApplicationLaunchedWithUrl` | `WindowMaximise` / `WindowUnMaximise` / `WindowRestore` |
| `ThemeChanged` | `WindowFullscreen` / `WindowUnFullscreen` |
| `SystemDidWake` / `SystemWillSleep` | `WindowDidResize` / `WindowDidMove` |
| `BatteryChanged` / `NetworkChanged` | `WindowDPIChanged` / `WindowFilesDropped` |
| `ScreenLocked` / `ScreenUnlocked` | `WindowShow` / `WindowHide` / `WindowClosing` |
| `LowMemory` | `WindowRuntimeReady` / `WindowToggleFrameless` |
| | `WindowZoom` / `WindowZoomIn` / `WindowZoomOut` / `WindowZoomReset` |

系统主题变化的平台事件：`events.Linux.SystemThemeChanged` 等（v3.1.0 修复 GTK4 下不触发）。

⚠️ **应用关闭** 不是事件常量。用 `OnShutdown(func())` 或 `application.Options.OnShutdown`。

### 平台特定事件

`events.Mac.*` / `events.Windows.*` / `events.Linux.*` 提供平台特定事件常量。详见 reference 文件。
⚠️ macOS **不再派发** `WindowDidUpdate` / `WindowWillUpdate`（beta.30：每个 run-loop 都触发、会吃掉用户点击的 transient activation）——别再监听它们。

### 投递语义（v3.1.0）

- Go 侧监听器按 **emit 顺序串行**回调（之前可能乱序 / 并发）。
- 应用事件 hook 即使没有监听器也会执行（beta.13）。

### 类型化事件 + `bindings/events` 常量（beta.33）

```go
type UserLoginData struct { Name string `json:"name"` }
func init() { application.RegisterEvent[UserLoginData]("user:login") }   // 名字必须是编译期常量
```
`wails3 generate bindings` 会生成事件数据类型和 `bindings/events` 模块（`user:login` → `UserLogin`）：
```ts
import { Events } from '@wailsio/runtime'
import { UserLogin } from './bindings/events'
Events.On(UserLogin, (e) => { e.data.name /* 已类型化 */ })
```
`-noevents` 关闭这部分生成。Foundation 的 `internal/events/events.go` 走的就是 `RegisterEvent[T]`。

### JavaScript 端

```javascript
import { Events } from '@wailsio/runtime';

// 监听
const off = Events.On('user-logged-in', (event) => {
    // event.data = Go 端 Emit 的载荷
    // event.sender = 发送窗口（如有）
    console.log(event.data);
});
off();  // 取消订阅

// 单次 / 限次
Events.Once('done', (event) => { ... });
Events.OnMultiple('tick', handler, 3);

// 取消某事件 / 全部
Events.Off('user-logged-in');
Events.OffAll();

// 发送（Go 可监听）；返回 Promise<boolean>
await Events.Emit('myapp:close-window');
await Events.Emit('myapp:disconnect-requested', 'id-123');
```

### 仅发到单个窗口

```go
// Go
window.EmitEvent("window-only-event", data)
```

```js
// JS：仅当前窗口收到
Events.On('window-only-event', handler);
```

### 取消事件（钩子拦截 Emit）

`Emit()` 返回 bool，`true` 表示某个钩子取消了 emit。

### 流式数据模式

避免返回大数组，改用事件：

```go
func (s *FileService) ProcessLargeFile(path string) error {
    file, _ := os.Open(path)
    defer file.Close()
    scanner := bufio.NewScanner(file)
    n := 0
    for scanner.Scan() {
        n++
        s.app.Event.Emit("file-progress", map[string]any{
            "line": n, "text": scanner.Text(),
        })
    }
    return scanner.Err()
}
```

## References 索引

| 主题 | 文件 |
|------|------|
| 事件系统完整指南 | [system.md](./references/system.md) |
| 窗口事件细节 | [window-events.md](./references/window-events.md) |
| Events API Reference（API 参考） | [events-reference.md](./references/events-reference.md) |
| Events Guide（实战指南，含命名空间） | [events-guide.md](./references/events-guide.md) |

## 链接到其他 SKILL

- 应用入口与 OnShutdown → `wails-application`
- 窗口与窗口选项 → `wails-window`
- Service 内部 emit 事件 → `wails-bindings`
