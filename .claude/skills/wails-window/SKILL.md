---
name: wails-window
description: 窗口创建、配置、控制、frameless、多窗口、窗口事件、自定义、macOS Liquid Glass / 毛玻璃、macOS 刘海窗口（Notch Window）、NSPanel 窗口类、每窗口权限（摄像头 / 麦克风 / 定位 / 通知）。当用户问到 app.Window / WebviewWindow / WebviewWindowOptions / SetTitle / SetSize / SetZoom / Frameless / --wails-draggable / Center / 多窗口管理 / 窗口事件监听 / Liquid Glass / MacBackdropLiquidGlass / NewNotchWindow / notch / MacWindowClassPanel / NSPanel / Permissions / getUserMedia / PermissionCamera 时使用。
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
if w, ok := app.Window.GetByName("main"); ok { w.Show() }   // 也有 Get(name) / GetByID(id)
all := app.Window.GetAll()
current := app.Window.Current()
app.Window.OnCreate(func(w application.Window) { /* 任意窗口创建时 */ })
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
window.Fullscreen() // 进入全屏（切换用 ToggleFullscreen()）
window.SetZoom(0.8) // v3.1.0：framed 窗口允许 <1.0（frameless 仍下限 1.0；≤0/NaN/Inf 被忽略）
window.SetAlwaysOnTop(true)
window.Reload()
window.OpenDevTools() // dev 模式可用；macOS 上需 -tags private_mac_apis，否则 no-op
window.EmitEvent("custom", data)  // 仅发到该窗口
```

### Frameless 窗口（无边框）

```go
window := app.Window.NewWithOptions(application.WebviewWindowOptions{
    Frameless: true,
    Width: 800, Height: 600,
})
```

前端需自定义标题栏，并用 Wails 的 CSS 自定义属性标记拖拽区（**不是** Electron 的 `-webkit-app-region`）：
```css
.titlebar {
  --wails-draggable: drag;      /* 该区域可拖拽窗口 */
}
.titlebar button {
  --wails-draggable: no-drag;   /* 按钮可点击 */
}
```

Windows 系统按钮（最小化/最大化/关闭）需自己实现，调用 `window.Minimise()` 等。

### 窗口事件（窗口级）

```go
import "github.com/wailsapp/wails/v3/pkg/events"

window.OnWindowEvent(events.Common.WindowDidResize, func(e *application.WindowEvent) {
    fmt.Println("resized")
})

window.OnWindowEvent(events.Common.WindowDidMove, ...)
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

**Mac**（`MacWindow`）：
```go
Mac: application.MacWindow{
    InvisibleTitleBarHeight: 50,
    Backdrop:                application.MacBackdropTranslucent, // 透明 webview 需 -tags private_mac_apis
    TitleBar:                application.MacTitleBarHiddenInset,
    Appearance:              application.MacAppearanceDarkAqua,
    DisableShadow:           false,
    WindowClass:             application.MacWindowClassWindow,   // 或 MacWindowClassPanel（NSPanel）
    // PanelPreferences: application.MacPanelPreferences{FloatingPanel, NonActivating, BecomesKeyOnlyIfNeeded, UtilityWindow}
}
```

**macOS 私有 API 变更（beta.19 起，易踩）**：`MacBackdropTransparent` / `Translucent` / `LiquidGlass` 只在用 `-tags private_mac_apis` 构建时才让 **WKWebView 变透明**；不带 tag 时 native 毛玻璃照样配置，但 webview 不透明、看不到效果。详见 `wails-build` 的 `private-macos-apis.md`。

**Liquid Glass（macOS 26 原生，旧系统回退为 translucent）**：`Mac.Backdrop: application.MacBackdropLiquidGlass` + `Mac.LiquidGlass: application.MacLiquidGlass{Style, ...}`（`GroupID` / `GroupSpacing` 也依赖 private_mac_apis）。详见 `options.md`。

**刘海窗口（Notch Window，macOS）**：`app.Window.NewNotchWindow(application.NotchWindowOptions{...})` 返回 `*NotchWindow`（`Show()` / `Hide()` / `Close()` / `Visibility()`），贴合刘海形状、带展开动画；透明 webview 同样需要 private_mac_apis。详见 `notch-windows.md`。

### 每窗口权限（`WebviewWindowOptions.Permissions`）

```go
Permissions: map[application.PermissionType]application.Permission{
    application.PermissionMicrophone: application.PermissionAllow,
    application.PermissionCamera:     application.PermissionAllow,
},
```
类型：`PermissionMicrophone` / `PermissionCamera` / `PermissionGeolocation` / `PermissionNotifications` / `PermissionClipboardRead`；取值 `PermissionDefault`（0，平台原生行为）/ `PermissionAllow` / `PermissionDeny`。Linux WebKitGTK 无原生弹窗：Default 下摄像头/麦克风**允许**，定位/通知/剪贴板读取目前始终拒绝。macOS 仍需 Info.plist 用途描述 + entitlements。详见 `permissions.md`。

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
    Icon:                []byte{ /* PNG 字节 */ },
    WindowIsTranslucent: false,
    WebviewGpuPolicy:    application.WebviewGpuPolicyOnDemand,
    MenuStyle:           application.LinuxMenuStyleMenuBar, // GTK4 可选 LinuxMenuStylePrimaryMenu（header bar 汉堡按钮）
}
```

### 行为修复（v3.0 → v3.1，无 API 变化）

- 最小/最大尺寸约束在全屏 / 最大化期间保持，且约束变化不会把全屏或最大化窗口改尺寸。
- macOS `SetRelativePosition` 相对屏幕工作区（beta.32）；屏幕坐标在 macOS / GTK 统一为 DIP（混合 DPI）。
- macOS 不再派发 `WindowDidUpdate` / `WindowWillUpdate`（每帧触发、会吃掉用户点击的 transient activation，导致 `navigator.clipboard.writeText()` 报 `NotAllowedError`）。

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
| 刘海窗口（Notch Window，macOS） | [notch-windows.md](./references/notch-windows.md) |
| 每窗口权限（摄像头 / 麦克风 / 定位 / 通知） | [permissions.md](./references/permissions.md) |

## 链接到其他 SKILL

- 应用入口创建 → `wails-application`
- 完整事件系统 / 应用事件 → `wails-events`
- 拖拽文件到窗口 → `wails-runtime-features`
- 上下文菜单（窗口右键菜单） → `wails-menus-dialogs`
