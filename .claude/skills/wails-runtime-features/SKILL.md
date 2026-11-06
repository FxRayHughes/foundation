---
name: wails-runtime-features
description: 剪贴板、通知（含声音/附件/定时字段）、屏幕、自启动、平台 API（Dock 服务 / badge）、键盘快捷键（应用级 KeyBinding + 系统级 GlobalShortcut，macOS 键盘布局感知）、平台检测（System.IsMobile/IsDesktop/...）、文件/HTML 拖放、浏览器集成、环境信息、前端 @wailsio/runtime。当用户问到「app.Clipboard / Notifications / app.Screen / Autostart / Dock / KeyBinding / GlobalShortcut / 全局快捷键 / System.IsMac / IsMobile / IsDesktop / EnableFileDrop / OpenURL / app.Env / @wailsio/runtime / Application Window WML Events Browser Dialogs Flags Screens System」等运行时功能时使用。
---

# Wails v3 - Runtime 功能合集

10 类运行时功能（除窗口/菜单外）+ 前端 `@wailsio/runtime` SDK。

## 何时使用本 SKILL

- 调用系统剪贴板（复制/粘贴）
- 发送桌面通知（含交互按钮 / 文本输入）
- 多显示器、DPI 缩放查询
- 注册开机自启动
- macOS Dock badge / progress / 弹跳
- 应用级快捷键（KeyBinding）与系统级全局快捷键（GlobalShortcut）
- OS 文件拖放到应用、HTML 元素拖放
- 默认浏览器打开 URL / 文件
- 系统环境信息（OS / Arch / Theme）
- 前端 JS SDK（Application/Window/Events/Browser/Dialogs/Flags/Screens/System/WML/Clipboard）

## 关键摘要

### 剪贴板（`app.Clipboard`）

```go
ok := app.Clipboard.SetText("Hello!")     // 返回 bool
text, ok := app.Clipboard.Text()          // 读取
```

### 通知（`pkg/services/notifications`）

```go
import "github.com/wailsapp/wails/v3/pkg/services/notifications"

notifier := notifications.New()
app := application.New(application.Options{
    Services: []application.Service{application.NewService(notifier)},
})

// macOS 需先授权
authorized, err := notifier.CheckNotificationAuthorization()
if !authorized {
    authorized, _ = notifier.RequestNotificationAuthorization()
}

// 基础通知
notifier.SendNotification(notifications.NotificationOptions{
    ID: "msg-1", Title: "新消息", Subtitle: "From Alice", Body: "点击查看",
})

// 交互式（先注册 category，再 SendNotificationWithActions）
notifier.RegisterNotificationCategory(notifications.NotificationCategory{
    ID: "MESSAGE_CATEGORY",
    Actions: []notifications.NotificationAction{
        {ID: "REPLY", Title: "回复"},
        {ID: "MARK_READ", Title: "已读"},
    },
})
notifier.OnNotificationResponse(func(r notifications.NotificationResult) { /* r.Response.ActionIdentifier ... */ })
```

`NotificationOptions` 可选增强字段：`Sound` / `Attachments` / `ThreadID` / `InterruptionLevel`（`passive/active/timeSensitive/critical`）/ `Schedule`，平台不支持时忽略。行为变化：被**关闭/划走**的通知不再被报告为点击（v3.1.0）；Windows WinRT toast 失败时直接返回 error、不再回退 PowerShell（beta.31）。

### 屏幕（`app.Screen`）

```go
all := app.Screen.GetAll()       // []*Screen
primary := app.Screen.GetPrimary()
byID := app.Screen.GetByID(id)   // 也有 GetByIndex(i)；当前窗口所在屏幕用 window.GetScreen()
// DIP ↔ 物理像素：DipToPhysicalPoint / PhysicalToDipRect / ScreenNearestDipPoint ...
// （前端 Screens.GetCurrent() 存在；Go 侧 ScreenManager 没有 GetCurrent）

for _, s := range all {
    fmt.Printf("%s %dx%d scale=%.2f primary=%v\n",
        s.Name, s.Size.Width, s.Size.Height, s.ScaleFactor, s.IsPrimary)
}

// Screen 字段：ID, Name, Size{Width,Height}, X, Y, ScaleFactor, IsPrimary,
// WorkArea (可用区域，去除 dock/taskbar), Bounds (全屏区域)
// v3.1.0：macOS 与 GTK 一律按 DIP 报告屏幕（修复混合 DPI 下的 bounds）
```

### 自启动（`app.Autostart`）

```go
// 启用（下次登录生效）
err := app.Autostart.Enable()

// 自定义参数
app.Autostart.EnableWithOptions(application.AutostartOptions{
    Identifier: "com.example.myapp",
    Arguments:  []string{"--hidden"},
})

// 禁用、查询
app.Autostart.Disable()
enabled, err := app.Autostart.IsEnabled()
status, err := app.Autostart.Status()  // 完整状态
```

### Dock / 任务栏（`pkg/services/dock` 服务，**不是** `app.Dock` 字段）

```go
import "github.com/wailsapp/wails/v3/pkg/services/dock"

dockService := dock.New()            // 或 dock.NewWithOptions(dock.BadgeOptions{...})
app := application.New(application.Options{
    Services: []application.Service{application.NewService(dockService)},
})

dockService.SetBadge("3")            // macOS Dock / Windows 任务栏 badge
dockService.SetCustomBadge("!", dock.BadgeOptions{ /* 颜色 / 字体 */ })
dockService.RemoveBadge()
label := dockService.GetBadge()      // *string
dockService.HideAppIcon()            // macOS：隐藏 Dock 图标
dockService.ShowAppIcon()
```

### 应用级快捷键（`app.KeyBinding`，应用聚焦时跨窗口生效）

```go
app.KeyBinding.Add("Ctrl+S", func(window application.Window) {
    window.EmitEvent("file:save", nil)
})

// macOS 用 Cmd 替代
app.KeyBinding.Add("CmdOrCtrl+N", func(w application.Window) { /* */ })
app.KeyBinding.Add("CmdOrCtrl+Shift+P", func(w application.Window) { /* command palette */ })

app.KeyBinding.Remove("Ctrl+S")
all := app.KeyBinding.GetAll()   // []*KeyBinding（没有 RemoveAll）
```

### 系统级全局快捷键（`app.GlobalShortcut`，应用未聚焦也触发）

```go
err := app.GlobalShortcut.Register("CmdOrCtrl+Shift+K", func() { /* 无参回调 */ })
app.GlobalShortcut.Unregister("CmdOrCtrl+Shift+K")
app.GlobalShortcut.UnregisterAll()          // 退出时自动调用
ok := app.GlobalShortcut.IsRegistered("CmdOrCtrl+Shift+K")
list := app.GlobalShortcut.GetAll()         // []string
```
- 原生实现：macOS Carbon Hot Keys、Windows `RegisterHotKey`、X11 `XGrabKey`、Wayland 走 XDG Desktop Portal global shortcuts。
- **beta.29 起 macOS 键盘布局感知**：字母 accelerator 绑定到 AZERTY / QWERTZ / Dvorak 等布局上**标着该字母的键**，而非 QWERTY 物理位置（菜单 accelerator 同理）。
- `Run()` 之前注册的会排队，Run 后生效。详见 `global-shortcuts.md`。

### 文件拖放（系统级）

```go
// 1. 启用窗口
window := app.Window.NewWithOptions(application.WebviewWindowOptions{
    EnableFileDrop: true,
})
```

```html
<!-- 2. 标记拖放目标 -->
<div id="upload" data-file-drop-target>Drop files here</div>
```

```css
/* 3. 拖入时样式（自动加 .file-drop-target-active） */
.drop-zone.file-drop-target-active { border-color: blue }
```

```go
// 4. Go 端监听
window.OnWindowEvent(events.Common.WindowFilesDropped, func(e *application.WindowEvent) {
    files := e.Context().DroppedFiles()  // []string 路径
    targetID := e.Context().TargetID()   // 元素 id
    targetClass := e.Context().TargetClass()
})
```

### HTML 拖放（webview 内）

标准 HTML5 drag-and-drop（不接收 OS 文件）。

### 浏览器集成（`app.Browser`）

```go
app.Browser.OpenURL("https://wails.io")
app.Browser.OpenURL("http://localhost:3000")
app.Browser.OpenFile("/path/to/file.pdf")  // 默认应用打开
```

### 环境信息（`app.Env`）

```go
info := app.Env.Info()
// info.OS:    "windows" / "darwin" / "linux"
// info.Arch:  "amd64" / "arm64"
// info.Debug: bool
// info.OSInfo.Name / Version
// info.PlatformInfo: map[string]any （平台特定）

isDark := app.Env.IsDarkMode()      // Linux v3.1.0 起统一读 org.freedesktop.appearance portal
accent := app.Env.GetAccentColor()
focusFollowsMouse := app.Env.HasFocusFollowsMouse()

// 在文件管理器中显示（selectFile=true 时选中该文件）
err := app.Env.OpenFileManager("/path/to/file", true)

// 用默认应用打开文件 → app.Browser.OpenFile(path)
```

### 前端 Runtime SDK (`@wailsio/runtime`)

```js
import {
    Application, Window, Events, Browser, Dialogs,
    Flags, Screens, System, Clipboard, WML
} from '@wailsio/runtime'

// Application
Application.Quit()
Application.Hide()  // macOS
Application.Show()

// Window（操作当前窗口）
Window.Center()
Window.SetTitle("New")
Window.Minimise()
Window.Maximise()
Window.Restore()
Window.Show()
Window.Hide()
Window.Close()
Window.Focus()
Window.Reload()
Window.SetSize(800, 600)
Window.SetPosition(100, 100)
const sz = await Window.Size()
const pos = await Window.Position()

// Events
Events.On(name, handler)          // 返回 unsubscribe
Events.Once(name, handler)
Events.OnMultiple(name, handler, n)
Events.Off(name, ...more)
Events.OffAll()
await Events.Emit(name, data)     // Promise<boolean>（true=被 hook 取消）
// 事件名可用生成的常量：import { UserLogin } from './bindings/events'（beta.33+，见 wails-events）

// Browser
Browser.OpenURL(url)

// Dialogs
const path = await Dialogs.OpenFile({title: "Select", filters: [...]})
const choice = await Dialogs.Question({title, message, buttons: [...]})

// Screens
const screens = await Screens.GetAll()   // GetPrimary / GetCurrent / GetByID / GetByIndex

// System
const info = await System.Environment()  // OS / Arch / Theme
const isDark = await System.IsDarkMode()
System.IsMac(); System.IsMobile(); System.IsDesktop()   // 同步平台检测

// CancellablePromise 可单独导入（beta.31+，不求值 runtime 根入口）：
// import { CancellablePromise } from '@wailsio/runtime/cancellable'

// Clipboard
await Clipboard.SetText("hello")
const text = await Clipboard.Text()

// Flags（构建/运行时常量）
Flags.Get("name")

// WML（Wails Markup Language - 声明式）
// <button wml-event="myevent">Click</button>
// <a wml-openurl="https://wails.io">Link</a>
// 自动监听 DOM 并触发事件
```

## References 索引

| 主题 | 文件 |
|------|------|
| 剪贴板 | [clipboard.md](./references/clipboard.md) |
| 通知（含交互按钮/文本输入） | [notifications.md](./references/notifications.md) |
| 屏幕信息 | [screens.md](./references/screens.md) |
| 自启动 | [autostart.md](./references/autostart.md) |
| macOS Dock（badge/progress/attention） | [platform-dock.md](./references/platform-dock.md) |
| 应用级键盘快捷键（KeyBinding） | [keyboard-shortcuts.md](./references/keyboard-shortcuts.md) |
| 系统级全局快捷键（GlobalShortcut） | [global-shortcuts.md](./references/global-shortcuts.md) |
| 文件拖放（OS 拖入） | [drag-and-drop-files.md](./references/drag-and-drop-files.md) |
| HTML 拖放（webview 内） | [drag-and-drop-html.md](./references/drag-and-drop-html.md) |
| 浏览器集成（OpenURL） | [browser-integration.md](./references/browser-integration.md) |
| 系统环境信息 | [environment-info.md](./references/environment-info.md) |
| **前端 Runtime SDK 完整 API**（Application/Window/Events/Browser/Dialogs/Flags/Screens/System/Clipboard/WML） | [frontend-runtime.md](./references/frontend-runtime.md) |

## 链接到其他 SKILL

- 应用入口注册 Service → `wails-application`
- 窗口选项 EnableFileDrop → `wails-window`
- KeyBinding 触发的菜单/对话框 → `wails-menus-dialogs`
- 自定义事件、应用事件 → `wails-events`
