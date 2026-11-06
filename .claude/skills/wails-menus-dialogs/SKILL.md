---
name: wails-menus-dialogs
description: 应用菜单（菜单栏）、上下文菜单（右键）、系统托盘（systray）、对话框（消息/文件/自定义）。当用户问到「app.NewMenu / app.Menu.Set / Submenu / AddRole / FileMenu EditMenu / OnClick / AddSectionHeader 菜单分组标题 / --custom-contextmenu / app.ContextMenu.Add / SystemTray / app.SystemTray.New / SetTooltip / app.Dialog / OpenFile / SaveFile / Question / Info / Custom Dialog / Linux portal 文件对话框」时使用。
---

# Wails v3 - 菜单与对话框

桌面应用的标准 UI 组件：菜单栏、右键菜单、系统托盘、消息/文件对话框。

## 何时使用本 SKILL

- 创建跨平台菜单栏（File / Edit / View / Help）
- 实现右键上下文菜单
- 实现系统托盘图标 + 弹出菜单
- 弹出消息对话框（Info / Warning / Error / Question）
- 文件选择 / 保存 / 文件夹选择对话框
- 自定义对话框（用一个 webview 窗口实现）

## 关键摘要

### 应用菜单（菜单栏）

```go
import (
    "runtime"
    "github.com/wailsapp/wails/v3/pkg/application"
)

menu := app.NewMenu()

if runtime.GOOS == "darwin" {
    menu.AddRole(application.AppMenu)        // macOS 应用名菜单
}
menu.AddRole(application.FileMenu)
menu.AddRole(application.EditMenu)
menu.AddRole(application.WindowMenu)
menu.AddRole(application.HelpMenu)

app.Menu.Set(menu)

// 让 Windows / Linux 窗口继承菜单
app.Window.NewWithOptions(application.WebviewWindowOptions{
    UseApplicationMenu: true,
})
```

⚠️ macOS 菜单栏全局；Windows/Linux 在窗口标题栏，需 `UseApplicationMenu: true`。

#### 自定义菜单项

```go
fileMenu := menu.AddSubmenu("File")
fileMenu.Add("New").OnClick(func(ctx *application.Context) { /* ... */ })
fileMenu.Add("Open").OnClick(func(ctx *application.Context) { /* ... */ })
fileMenu.AddSeparator()
fileMenu.Add("Quit").OnClick(func(ctx *application.Context) { app.Quit() })
```

#### 菜单项属性

```go
item := fileMenu.Add("Open")
item.SetAccelerator("CmdOrCtrl+O")  // 快捷键
item.SetEnabled(false)
item.SetChecked(true)               // checkable
item.SetHidden(false)
item.SetLabel("Open File...")
item.SetTooltip("Open a file from disk")
item.SetIcon(iconBytes)
```

#### 分组标题（beta.32 新增，macOS 14+）

```go
menu.AddSectionHeader("Recent")   // macOS 14+ 原生、不可交互的分组标题；旧 macOS 与其他平台为 no-op
```

#### 内置 Roles

| Role | 说明 |
|------|------|
| `AppMenu` | macOS 应用菜单（About / Preferences / Hide / Quit） |
| `FileMenu` | 标准 File 菜单（New / Open / Save / Close） |
| `EditMenu` | 编辑（Undo / Redo / Cut / Copy / Paste / Select All） |
| `ViewMenu` | 视图（Reload / DevTools / Zoom） |
| `WindowMenu` | 窗口（Minimize / Maximize / Close） |
| `HelpMenu` | 帮助 |
| `ServicesMenu` | macOS Services 子菜单 |

### 上下文菜单（右键）

```go
ctxMenu := app.ContextMenu.New()
ctxMenu.Add("Copy").OnClick(func(ctx *application.Context) {
    data := ctx.ContextMenuData()   // 前端 --custom-contextmenu-data 的值
})
ctxMenu.AddSeparator()
app.ContextMenu.Add("my-menu", ctxMenu)   // 按名字注册（另有 Remove / Get / GetAll）
```

前端用 **CSS 自定义属性**绑定（不是 data 属性，也没有 JS `OpenContextMenu`）：
```html
<div style="--custom-contextmenu: my-menu; --custom-contextmenu-data: file-123">右键打开菜单</div>
```

### 系统托盘（SystemTray）

```go
tray := app.SystemTray.New()
tray.SetIcon(iconBytes)        // PNG/ICO bytes（macOS 推荐 ICNS template）
tray.SetTooltip("My App")      // v3.1.0 补齐 SetTooltip 实现（#6017）
tray.SetLabel("Status: OK")    // macOS 文本标签

trayMenu := app.NewMenu()
trayMenu.Add("Show").OnClick(func(ctx *application.Context) { ... })
trayMenu.Add("Quit").OnClick(func(ctx *application.Context) { app.Quit() })
tray.SetMenu(trayMenu)

// 点击事件
tray.OnClick(func() { ... })
tray.OnRightClick(func() { ... })
tray.OnDoubleClick(func() { ... })
// 另有 OnRightDoubleClick / OnMouseEnter / OnMouseLeave
```

托盘行为修复：Linux 上 `Run()` 之后创建的托盘不再丢失（v3.1.0）；Windows 右键（`WM_CONTEXTMENU`）可正常弹菜单（beta.30）；macOS 点击类型判定修正（beta.16）。

### 消息对话框

```go
// Info / Warning / Error
app.Dialog.Info().SetTitle("成功").SetMessage("操作完成").Show()
app.Dialog.Warning().SetTitle("警告").SetMessage("不可撤销").Show()
app.Dialog.Error().SetTitle("错误").SetMessage("出错了").Show()

// Question（多按钮）
d := app.Dialog.Question().SetTitle("确认").SetMessage("继续?")
yes := d.AddButton("是"); yes.OnClick(func() { /* */ })
no := d.AddButton("否")
d.SetDefaultButton(yes)
d.SetCancelButton(no)
d.Show()
```

⚠️ **在 `app.Run()` 之前弹对话框什么都不做**（v3.1.0 起；旧版会永久阻塞）。放到 `ApplicationStarted` 或服务 `ServiceStartup` 之后。

### 文件对话框

```go
// 选择单个文件
path, err := app.Dialog.OpenFile().
    SetTitle("选择图片").
    AddFilter("Images", "*.png;*.jpg;*.gif").
    SetDirectory("/initial/path").
    PromptForSingleSelection()

// 选择多个
paths, err := app.Dialog.OpenFile().
    AddFilter("Documents", "*.pdf;*.docx").
    PromptForMultipleSelection()

// 保存
path, err := app.Dialog.SaveFile().
    SetTitle("保存为").
    SetFilename("untitled.txt").
    AddFilter("Text", "*.txt").
    PromptForSingleSelection()

// 选择文件夹
folder, err := app.Dialog.OpenFile().
    CanChooseDirectories(true).
    CanChooseFiles(false).
    PromptForSingleSelection()
```

### 自定义对话框

把任意 webview 窗口当对话框：
```go
dialog := app.Window.NewWithOptions(application.WebviewWindowOptions{
    Name:   "settings-dialog",
    Title:  "Settings",
    Width:  500, Height: 400,
    URL:    "http://wails.localhost/settings",
    DisableResize:    true,
    AlwaysOnTop:      true,
    Hidden:           false,
})
```

### Context（菜单点击上下文）

```go
fileMenu.Add("Open").OnClick(func(ctx *application.Context) {
    item := ctx.ClickedMenuItem()   // 被点击的菜单项
    checked := ctx.IsChecked()      // checkbox / radio 状态
    data := ctx.ContextMenuData()   // 上下文菜单附带数据
    // 当前窗口用 app.Window.Current()
})
```

## References 索引

| 主题 | 文件 |
|------|------|
| 应用菜单完整指南 | [menu-application.md](./references/menu-application.md) |
| 上下文菜单 | [menu-context.md](./references/menu-context.md) |
| 菜单 Feature Reference（角色/常量列表） | [menu-feature-reference.md](./references/menu-feature-reference.md) |
| 系统托盘完整 API | [menu-systray.md](./references/menu-systray.md) |
| 对话框总览 | [dialogs-overview.md](./references/dialogs-overview.md) |
| 消息对话框（Info/Warning/Error/Question） | [dialogs-message.md](./references/dialogs-message.md) |
| 文件对话框（Open/Save/Folder） | [dialogs-file.md](./references/dialogs-file.md) |
| 自定义对话框（窗口式） | [dialogs-custom.md](./references/dialogs-custom.md) |
| Menu API Reference | [menu-reference.md](./references/menu-reference.md) |
| Dialogs API Reference | [dialogs-reference.md](./references/dialogs-reference.md) |
| Menus 综合 Guide | [menus-guide.md](./references/menus-guide.md) |

## 链接到其他 SKILL

- 应用入口（注册菜单） → `wails-application`
- 窗口选项 `UseApplicationMenu` → `wails-window`
- 应用级 / 系统级快捷键（KeyBinding / GlobalShortcut） → `wails-runtime-features`
- Linux GTK4 文件对话框走 xdg-desktop-portal（默认目录 / 过滤器展示与 GTK3 不同） → `dialogs-reference.md` 的 Linux Dialog Behavior
- 菜单点击事件流 → `wails-events`
