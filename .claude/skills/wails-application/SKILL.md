---
name: wails-application
description: application.New / Options / Run / Quit / RegisterService / OnShutdown / PostShutdown / ShouldQuit / Logger / RawMessageHandler / WarningHandler / ErrorHandler / Server options / application.System 平台检测 / 平台 Options（含 Linux ApplicationID）。当用户问到 application.Options 字段、Mac/Windows/Linux/iOS/Android 平台选项、GTK application id / flatpak、应用入口写法、application.System.IsMobile 时使用。
---

# Wails v3 - Application API

`*application.App` 是 Wails 应用的核心，管理窗口、服务、事件、对话框、菜单等所有资源。

## 何时使用本 SKILL

- 写 main.go 创建应用入口
- 配置 `application.Options` 字段（Name/Description/Services/Mac/Windows/Linux/RawMessageHandler）
- 注册服务 `RegisterService` 或在 Options.Services 列表中
- 实现关闭拦截 `ShouldQuit`、清理 `OnShutdown`
- 使用 `app.Logger` 结构化日志（基于 `*slog.Logger`）
- 使用 `RawMessageHandler` 绕过绑定系统（仅性能瓶颈时）

## 关键摘要

### 创建应用

```go
import "github.com/wailsapp/wails/v3/pkg/application"

app := application.New(application.Options{
    Name:        "My App",
    Description: "Demo app",
    Services: []application.Service{
        application.NewService(&MyService{}),
    },
})
```

### 核心方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `Run()` | `func (a *App) Run() error` | 启动事件循环 |
| `Quit()` | `func (a *App) Quit()` | 优雅关闭 |
| `Config()` | `func (a *App) Config() Options` | 返回当前配置 |
| `RegisterService(svc)` | 无返回值 | 服务初始化错误在 Run 期通过 ServiceStartup 报告 |

### Options 关键字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `Name` | `string` | 应用名 |
| `Description` | `string` | 描述 |
| `Services` | `[]Service` | 注册服务列表 |
| `LogLevel` | `slog.Level` | 日志级别 |
| `Logger` | `*slog.Logger` | 自定义 logger（可选） |
| `ShouldQuit` | `func() bool` | 拦截退出（如未保存数据） |
| `OnShutdown` | `func()` | 退出确认后清理 |
| `PostShutdown` | `func()` | 应用实例销毁之后调用（此时 app 已不可用） |
| `RawMessageHandler` | `func(window Window, message string, originInfo *OriginInfo)` | 接收前端 `System.invoke()` 原始消息 |
| `PanicHandler` | `func(*PanicDetails)` | 捕获 panic（见 `wails-advanced`） |
| `WarningHandler` / `ErrorHandler` | `func(string)` / `func(error)` | 运行时警告 / 错误回调 |
| `DisableDefaultSignalHandler` | `bool` | 关闭默认 SIGINT/SIGTERM 处理（beta.21 起默认 handler 在 `App.Run` 中启动） |
| `KeyBindings` | `map[string]func(window Window)` | 应用级快捷键（另见 `app.GlobalShortcut`） |
| `SingleInstance` / `FileAssociations` / `Transport` | — | 见 `wails-advanced` |
| `Server` | `ServerOptions` | `-tags server` 构建的 HTTP 服务选项（含 `WebSocketOriginPatterns`，见 `wails-build`） |
| `Mac` / `Windows` / `Linux` | `MacOptions` / `WindowsOptions` / `LinuxOptions` | 桌面平台选项 |
| `IOS` / `Android` | `IOSOptions` / `AndroidOptions` | 移动端选项（实验性） |
| `Assets` | `AssetOptions` | 静态资源（fs.FS / Handler） |
| `Icon` / `Flags` / `MarshalError` / `BindAliases` | — | 应用图标、传给前端的 flags、绑定错误序列化、绑定 ID 别名 |

⚠️ **没有 `OnStartup` 字段**。启动逻辑放在：
- 服务的 `ServiceStartup(ctx, options) error`
- `app.Event.OnApplicationEvent(events.Common.ApplicationStarted, ...)`
- 调用 `app.Run()` 之前

### Manager 字段（一个 logger + 13 个 manager + `app.Updater`）

```go
app.Window       // 窗口管理（New / NewWithOptions / GetByName / GetAll）
app.Menu         // 应用菜单
app.Dialog       // 对话框
app.Event        // 事件（Emit / On / OnApplicationEvent）
app.Clipboard    // 剪贴板
app.Screen       // 屏幕信息
app.SystemTray   // 系统托盘
app.Browser      // 打开 URL/文件
app.Env          // 环境信息
app.ContextMenu  // 上下文菜单
app.KeyBinding   // 应用级快捷键（应用聚焦时）
app.GlobalShortcut // 系统级全局快捷键（未聚焦也触发）
app.Updater      // 自动更新器（见 wails-advanced）
app.Logger       // *slog.Logger
app.Autostart    // 开机自启动
```

### 平台 Options

**Windows** (`WindowsOptions`)：
```go
Windows: application.WindowsOptions{
    EnabledFeatures:       []string{"msWebView2EnableDraggableRegions"},
    DisabledFeatures:      []string{"msExperimentalFeature"},
    AdditionalBrowserArgs: []string{"--remote-debugging-port=9222"},
    WndClass:                      "MyAppClass",
    WebviewUserDataPath:           "",   // 默认 %APPDATA%\[Binary.exe]
    WebviewBrowserPath:            "",
    DisableQuitOnLastWindowClosed: false,
},
```

**Mac** (`MacOptions`)：
```go
Mac: application.MacOptions{
    ActivationPolicy: application.ActivationPolicyRegular,
    ApplicationShouldTerminateAfterLastWindowClosed: true,
},
```

**Linux** (`LinuxOptions`)：
```go
Linux: application.LinuxOptions{
    ProgramName:                   "my-app",           // 留空且设置了 ApplicationID 时默认取 ApplicationID
    ApplicationID:                 "com.example.MyApp", // beta.23 新增；默认 "org.wails.<净化后的 Name>"
    DisableQuitOnLastWindowClosed: false,
},
```
`ApplicationID` 必须满足 `g_application_id_is_valid()`（≥2 段、`.` 分隔、仅 `A-Za-z0-9_-`、段首非数字、≤255 字符），不合法会经 `ErrorHandler` 报告并回退默认值。**沙盒构建（flatpak）必须设置**；Linux 单实例的 D-Bus 名也基于它。

### 平台检测：`application.System`

共享代码里免 build tag 判断平台：`application.System.IsMobile()` / `IsDesktop()` / `IsServer()` / `IsPlatform(application.PlatformMacOS)`（常量 `PlatformMacOS/Windows/Linux/IOS/Android/Server`）。Foundation 里平台窗口差异仍优先走 `internal/app/window_<os>.go`。详见 references 中「Platform Detection」一节。

### 运行前调用的行为（v3.1.0）

- `app.Run()` 之前提交到主线程的工作会**排队到 Run 启动后执行**（而不是丢失）。
- `app.Run()` 之前弹对话框**什么都不做**（旧版会永久阻塞）——对话框放到 `ApplicationStarted` 事件或服务 `ServiceStartup` 之后。
- `app.Run()` 之后才创建的 systray 在 Linux 上也能正常显示（beta.9 时可能被丢）。

### 事件管理

```go
// 发自定义事件（返回 true 表示被钩子取消）
app.Event.Emit("user-logged-in", map[string]any{"u": "alice"})

// 监听自定义事件，返回 unsubscribe func()
unsub := app.Event.On("user-logged-in", func(e *application.CustomEvent) {
    // e.Data
})

// 监听应用生命周期事件
app.Event.OnApplicationEvent(events.Common.ApplicationStarted, func(e *application.ApplicationEvent) {
    // 启动完成
})

// shutdown 不是事件常量，用 OnShutdown:
app.OnShutdown(func() { /* cleanup */ })
```

### 对话框（直接通过 app.Dialog）

```go
app.Dialog.Info().SetTitle("成功").SetMessage("完成").Show()
app.Dialog.Error().SetMessage("出错").Show()
app.Dialog.Warning().SetMessage("不可撤销").Show()

// 问题对话框
d := app.Dialog.Question().SetTitle("确认").SetMessage("继续?")
yes := d.AddButton("是"); yes.OnClick(func() { /* yes */ })
no := d.AddButton("否")
d.SetDefaultButton(yes); d.SetCancelButton(no); d.Show()

// 文件对话框
path, err := app.Dialog.OpenFile().
    SetTitle("选择文件").
    AddFilter("Images", "*.png;*.jpg").
    PromptForSingleSelection()

// 文件夹（开 OpenFile，关闭文件选择）
path, err := app.Dialog.OpenFile().
    CanChooseDirectories(true).CanChooseFiles(false).
    PromptForSingleSelection()
```

### Logger（slog）

```go
app.Logger.Info("Processing", "len", n)
app.Logger.Error("Failed", "err", err)
app.Logger.Debug("Debug info")
app.Logger.Warn("Warning")
```

### RawMessageHandler

⚠️ 仅在性能确认绑定是瓶颈时使用。

```go
app := application.New(application.Options{
    RawMessageHandler: func(window application.Window, message string, originInfo *application.OriginInfo) {
        fmt.Printf("From %s (%s): %s\n", window.Name(), originInfo.Origin, message)
        window.EmitEvent("response", processMessage(message))
    },
})
```

`OriginInfo` 字段：`Origin`、`TopOrigin`、`IsMainFrame`（不同平台填充不同子集）。

### 完整示例

```go
package main

import "github.com/wailsapp/wails/v3/pkg/application"

func main() {
    app := application.New(application.Options{
        Name:        "My Application",
        Description: "A demo",
        Mac: application.MacOptions{
            ApplicationShouldTerminateAfterLastWindowClosed: true,
        },
    })

    window := app.Window.NewWithOptions(application.WebviewWindowOptions{
        Title:            "My App",
        Width:            1024,
        Height:           768,
        MinWidth:         800,
        MinHeight:        600,
        BackgroundColour: application.NewRGB(255, 255, 255),
        URL:              "http://wails.localhost/",
    })
    window.Center()
    window.Show()

    if err := app.Run(); err != nil {
        log.Fatal(err)
    }
}
```

## References 索引

| 主题 | 文件 |
|------|------|
| Application API 完整参考 | [application.md](./references/application.md) |

## 链接到其他 SKILL

- 窗口选项细节 → `wails-window`
- 菜单 / 对话框深入 → `wails-menus-dialogs`
- 事件系统全貌 → `wails-events`
- Service 编写 → `wails-bindings`
- 生命周期 / Manager API 概念 → `wails-overview`
- RawMessageHandler 详解 → `wails-advanced`
