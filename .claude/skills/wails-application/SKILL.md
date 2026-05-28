---
name: wails-application
description: application.New / Options / Run / Quit / RegisterService / OnShutdown / ShouldQuit / Logger / RawMessageHandler / 平台 Options。当用户问到 application.Options 字段、Mac/Windows/Linux 平台选项、应用入口写法时使用。
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
| `RawMessageHandler` | `func(window Window, message string, originInfo *OriginInfo)` | 接收前端 `System.invoke()` 原始消息 |
| `Mac` | `MacOptions` | macOS 选项 |
| `Windows` | `WindowsOptions` | Windows 选项 |
| `Linux` | `LinuxOptions` | Linux 选项 |
| `Assets` | `AssetOptions` | 静态资源（fs.FS / Handler） |

⚠️ **没有 `OnStartup` 字段**。启动逻辑放在：
- 服务的 `ServiceStartup(ctx, options) error`
- `app.Event.OnApplicationEvent(events.Common.ApplicationStarted, ...)`
- 调用 `app.Run()` 之前

### Manager 字段（一个 logger + 11 个 manager）

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
app.KeyBinding   // 全局快捷键
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
    ProgramName:                   "my-app",
    DisableQuitOnLastWindowClosed: false,
},
```

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
