---
name: wails-overview
description: 理解 Wails v3 整体架构、应用生命周期、Go-Frontend 桥接、构建系统、Manager API 与版本对比。当用户问到「Wails 是什么 / 工作原理 / 与 Electron 区别 / 启动流程 / 桥接性能 / 构建步骤 / app.Window 等管理器」时使用。
---

# Wails v3 - 总览

Wails v3 是用 **Go 后端 + Web 前端** 构建跨平台桌面应用的框架，使用操作系统原生 WebView（Windows: WebView2 / macOS: WebKit / Linux: WebKitGTK），无需打包 Chromium，单文件 ~15MB，启动 <0.5s，内存 ~10MB。

## 何时使用本 SKILL

- 解释 Wails 架构、技术原理
- 对比 Wails 与 Electron / Tauri / Flutter
- 调用 `app.Window` / `app.Event` / `app.Menu` 等 Manager API
- 排查启动顺序、`OnShutdown` / `ShouldQuit` / `ServiceStartup` 钩子
- 理解 Go ↔ JavaScript 桥接的类型映射、性能特征

## 关键摘要

### 与 Electron 对比

| 项目 | Wails | Electron |
|------|-------|----------|
| 浏览器 | OS WebView | 内置 Chromium (~100MB) |
| 后端 | Go (编译) | Node.js (解释) |
| 通信 | 内存桥接 | IPC 进程间 |
| 体积 | ~15MB | ~150MB |
| 启动 | <0.5s | 2-3s |

### Manager API（一个 Logger + 11 个 Manager）

`*application.App` 提供以下字段：

- `app.Window` - 窗口创建/管理/回调
- `app.ContextMenu` - 上下文菜单
- `app.KeyBinding` - 全局快捷键
- `app.Browser` - 打开 URL/文件
- `app.Env` - 环境信息
- `app.Dialog` - 文件/消息对话框
- `app.Event` - 自定义事件
- `app.Menu` - 应用菜单
- `app.Screen` - 屏幕信息
- `app.Clipboard` - 剪贴板
- `app.SystemTray` - 系统托盘
- `app.Autostart` - 开机自启动

### Go ↔ TypeScript 类型映射

| Go | TypeScript |
|----|-----------|
| `string` | `string` |
| `int*`/`float*` | `number` |
| `bool` | `boolean` |
| `[]T` | `T[]` |
| `map[string]T` | `Record<string, T>` |
| `struct` | `interface` |
| `time.Time` | `Date` |
| `error` | 抛出异常 |

不支持：`chan`、`func()`、非 `interface{}` 接口、非 struct 指针、未导出字段。

### 生命周期阶段

1. **初始化** - `application.New(opts)` 解析选项 → 注册服务 → 设置 runtime
2. **启动** - `app.Run()` → ServiceStartup → 进入事件循环
3. **退出信号** - `ShouldQuit` 钩子（可拦截）→ `OnShutdown` 回调 → ServiceShutdown → 清理

⚠️ 没有 `OnStartup` 字段；启动逻辑应放在：
- 服务的 `ServiceStartup(ctx, options)`
- `app.Event.OnApplicationEvent(events.Common.ApplicationStarted, ...)`
- `app.Run()` 之前

### 桥接性能

- 单次调用开销 <1ms（in-memory，无 HTTP/IPC）
- 每次调用 ~1KB 缓冲；大数据 (>1MB) 尝试 zero-copy
- 调用并发：每个调用一个 goroutine，可 `Promise.all` 并行

## References 索引

| 主题 | 文件 |
|------|------|
| 整体架构（推荐先读） | [architecture.md](./references/architecture.md) |
| 应用生命周期详解 | [lifecycle.md](./references/lifecycle.md) |
| Manager API 完整参考 | [manager-api.md](./references/manager-api.md) |
| Go-Frontend 桥接深入 | [bridge.md](./references/bridge.md) |
| 构建系统原理 | [build-system.md](./references/build-system.md) |
| 为什么选 Wails | [why-wails.md](./references/why-wails.md) |
| 第一个应用速览 | [quick-first-app.md](./references/quick-first-app.md) |
| 后续学习路径 | [next-steps.md](./references/next-steps.md) |
| 常见问题 FAQ | [faq.md](./references/faq.md) |
| 完整 Changelog（版本历史） | [changelog.md](./references/changelog.md) |

## 链接到其他 SKILL

- 安装与新建项目 → `wails-quickstart`
- CLI 命令查询 → `wails-cli`
- `application.New` 选项详细 → `wails-application`
- 桥接 / 服务编写 → `wails-bindings`
- 窗口管理 → `wails-window`
