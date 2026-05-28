---
name: wails-window
description: 窗口创建、配置、控制、frameless、多窗口、窗口事件、自定义。当用户问到 app.Window / WebviewWindow / WebviewWindowOptions / SetTitle / SetSize / Frameless / Center / 多窗口管理 / 窗口事件监听时使用。
---

# Wails v3 - 窗口管理

Wails 提供统一的跨平台窗口管理 API。

## 何时使用本 SKILL

- 创建主窗口或子窗口（settings/about/dialog 形式）
- 设置标题、尺寸、位置、最小/最大尺寸、AlwaysOnTop、透明度、阴影
- 实现 frameless 窗口（自定义标题栏 + 拖拽区）
- 管理多窗口、按 Name 查找、窗口间通信
- 监听窗口事件（resize/move/focus/blur/close）
- 配置 Mac/Windows/Linux 平台特定的窗口选项（visualEffectMaterial、TitleBar 样式等）

## 关键摘要

### 创建窗口

```go
// 基础窗口（800x600）
window := app.Window.New()

// 带选项
window := app.Window.NewWithOptions(application.WebviewWindowOptions{
    Name:   "main",                    // 命名后可 GetByName 查找
    Title:  "My App",
    Width:  1200, Height: 800,
    X: 100, Y: 100,
    MinWidth: 400, MinHeight: 300,
    MaxWidth: 1920, MaxHeight: 1080,
    AlwaysOnTop: false,
    Frameless:   false,
    Hidden:      false,
    URL:         "http://wails.localhost/",
    BackgroundColour: application.NewRGB(255, 255, 255),
})

// 查找
if w, ok := app.Window.GetByName("main"); ok { w.Show() }
all := app.Window.GetAll()
current := app.Window.Current()
```

### 常用窗口操作

```go
window.SetTitle("New Title")
window.SetSize(width, height)
window.SetPosition(x, y)
window.Center()
window.Show()       // 显示
window.Hide()       // 隐藏
window.Close()      // 关闭
window.Focus()
window.Minimise()   // Minimize 别名
window.Maximise()
window.Restore()
window.Fullscreen() // 全屏切换
window.SetAlwaysOnTop(true)
window.Reload()
window.OpenDevTools() // dev 模式可用
window.EmitEvent("custom", data)  // 仅发到该窗口
```

### Frameless 窗口（无边框）

```go
window := app.Window.NewWithOptions(application.WebviewWindowOptions{
    Frameless: true,
    Width: 800, Height: 600,
})
```

前端需自定义标题栏，并把 CSS 拖拽区设为：
```css
.titlebar {
  -webkit-app-region: drag;     /* 该区域可拖拽窗口 */
}
.titlebar button {
  -webkit-app-region: no-drag;  /* 按钮可点击 */
}
```

Windows 系统按钮（最小化/最大化/关闭）需自己实现，调用 `window.Minimise()` 等。

### 窗口事件（窗口级）

```go
import "github.com/wailsapp/wails/v3/pkg/events"

window.OnWindowEvent(events.Common.WindowResize, func(e *application.WindowEvent) {
    fmt.Println("resized")
})

window.OnWindowEvent(events.Common.WindowMove, ...)
window.OnWindowEvent(events.Common.WindowFocus, ...)
window.OnWindowEvent(events.Common.WindowLostFocus, ...)
window.OnWindowEvent(events.Common.WindowClosing, ...)  // 关闭前
```

### 多窗口模式

每个窗口独立但共享应用状态：
```go
mainWin := app.Window.NewWithOptions(application.WebviewWindowOptions{
    Name: "main", URL: "http://wails.localhost/",
})

settingsWin := app.Window.NewWithOptions(application.WebviewWindowOptions{
    Name: "settings", URL: "http://wails.localhost/settings",
    Hidden: true,
})

// 显示设置（菜单点击）
if w, ok := app.Window.GetByName("settings"); ok { w.Show() }
```

广播事件给所有窗口：
```go
app.Event.Emit("global-event", data)  // 所有 Events.On() 收到
```

仅发送给单个窗口：
```go
window.EmitEvent("window-only", data)
```

### 平台特定窗口选项

**Mac**（`MacOptions`）：
```go
Mac: application.MacWindow{
    InvisibleTitleBarHeight: 50,
    Backdrop:                application.MacBackdropTranslucent,
    TitleBar:                application.MacTitleBarHiddenInset,
    Appearance:              application.MacAppearanceDarkAqua,
    DisableShadow:           false,
}
```

**Windows**（`WindowsWindow`）：
```go
Windows: application.WindowsWindow{
    BackdropType:                application.Mica, // None/Mica/Acrylic/Tabbed
    DisableIcon:                 false,
    Theme:                       application.SystemDefault, // Dark/Light/System
    HiddenOnTaskbar:             false,
    DisableFramelessWindowDecorations: false,
}
```

**Linux**（`LinuxWindow`）：
```go
Linux: application.LinuxWindow{
    Icon:        "icon.png",
    WindowIsTranslucent: false,
}
```

## References 索引

| 主题 | 文件 |
|------|------|
| 窗口基础（创建/控制/查找） | [basics.md](./references/basics.md) |
| 窗口事件（resize/move/focus 等完整列表） | [events.md](./references/events.md) |
| Frameless 窗口（自定义标题栏完整教程） | [frameless.md](./references/frameless.md) |
| 多窗口模式（窗口间通信、状态共享） | [multiple.md](./references/multiple.md) |
| WebviewWindowOptions 完整选项列表 | [options.md](./references/options.md) |
| WebviewWindow 方法参考（API Reference） | [window-reference.md](./references/window-reference.md) |
| 自定义窗口指南 | [customising-windows.md](./references/customising-windows.md) |

## 链接到其他 SKILL

- 应用入口创建 → `wails-application`
- 完整事件系统 / 应用事件 → `wails-events`
- 拖拽文件到窗口 → `wails-runtime-features`
- 上下文菜单（窗口右键菜单） → `wails-menus-dialogs`
