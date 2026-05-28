---
name: wails-runtime-features
description: 剪贴板、通知、屏幕、自启动、平台 API（dock）、键盘快捷键、文件/HTML 拖放、浏览器集成、环境信息、前端 @wailsio/runtime。当用户问到「app.Clipboard / Notifications / app.Screen / Autostart / Dock / KeyBinding / EnableFileDrop / OpenURL / app.Env / @wailsio/runtime / Application Window WML Events Browser Dialogs Flags Screens System」等运行时功能时使用。
---

# Wails v3 - Runtime 功能合集

10 类运行时功能（除窗口/菜单外）+ 前端 `@wailsio/runtime` SDK。

## 何时使用本 SKILL

- 调用系统剪贴板（复制/粘贴）
- 发送桌面通知（含交互按钮 / 文本输入）
- 多显示器、DPI 缩放查询
- 注册开机自启动
- macOS Dock badge / progress / 弹跳
- 全局键盘快捷键
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

// 交互式（先注册 category）
notifier.RegisterNotificationCategory(notifications.NotificationCategory{
    ID: "MESSAGE_CATEGORY",
    Actions: []notifications.NotificationAction{
        {ID: "REPLY", Title: "回复"},
        {ID: "MARK_READ", Title: "已读"},
    },
})
```

### 屏幕（`app.Screen`）

```go
all := app.Screen.GetAll()       // []Screen
primary := app.Screen.GetPrimary()
current := app.Screen.GetCurrent()  // 当前光标所在屏幕

for _, s := range all {
    fmt.Printf("%s %dx%d scale=%.2f primary=%v\n",
        s.Name, s.Size.Width, s.Size.Height, s.ScaleFactor, s.IsPrimary)
}

// Screen 字段：ID, Name, Size{Width,Height}, X, Y, ScaleFactor, IsPrimary,
// WorkArea (可用区域，去除 dock/taskbar), Bounds (全屏区域)
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

### macOS Dock（`app.Dock`，仅 macOS）

```go
// Badge
app.Dock.SetBadge("3")
app.Dock.SetBadge("")    // 清除

// Progress
app.Dock.SetProgress(0.5)  // 0-1
app.Dock.HideProgress()

// 弹跳
app.Dock.RequestUserAttention(application.AttentionTypeCritical)
```

### 全局键盘快捷键（`app.KeyBinding`）

```go
app.KeyBinding.Add("Ctrl+S", func(window application.Window) {
    window.EmitEvent("file:save", nil)
})

// macOS 用 Cmd 替代
app.KeyBinding.Add("CmdOrCtrl+N", func(w application.Window) { /* */ })
app.KeyBinding.Add("CmdOrCtrl+Shift+P", func(w application.Window) { /* command palette */ })

app.KeyBinding.Remove("Ctrl+S")
app.KeyBinding.RemoveAll()
```

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

isDark := app.Env.IsDarkMode()

// 显示文件在文件管理器中
app.Env.ShowInFileManager("/path/to/file")

// 打开默认应用
app.Env.OpenWithDefaultApplication("/path/to/file.pdf")
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
Application.OpenContextMenu('menu-id', {x, y, data})

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
Events.On(name, handler)
Events.Once(name, handler)
Events.Off(name)
Events.Emit(name, data)

// Browser
Browser.OpenURL(url)

// Dialogs
const path = await Dialogs.OpenFile({title: "Select", filters: [...]})
const choice = await Dialogs.Question({title, message, buttons: [...]})

// Screens
const screens = await Screens.GetAll()

// System
const info = await System.Environment()  // OS / Arch / Theme
const isDark = await System.IsDarkMode()

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
| 全局键盘快捷键 | [keyboard-shortcuts.md](./references/keyboard-shortcuts.md) |
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
