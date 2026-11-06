---
name: wails-overview
description: 理解 Wails v3 整体架构、应用生命周期、Go-Frontend 桥接、构建系统、Manager API、版本发布策略（weekly / nightly / hotfix）、v3 新特性（What's New）、平台支持矩阵（Roadmap/Status）与 Changelog。当用户问到「Wails 是什么 / 工作原理 / 与 Electron 区别 / 启动流程 / 桥接性能 / 构建步骤 / app.Window 等管理器 / Wails 版本号规则 / v3.1 / nightly / @latest / What's New / 支持哪些平台 / changelog」时使用。
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

### 版本与发布策略（v3.0.0 GA 起，2026-10-26）

- **当前基准：v3.1.0（2026-11-01，GA 后第一个 weekly）**。v3.0.0 = 正式 GA。
- **Weekly** 发版递增 minor：`v3.1.0`、`v3.2.0`…；**Nightly** 预览下一个 weekly：`v3.1.0-nightly.YYYYMMDD`（npm 走 `nightly` dist-tag）；**Hotfix** 递增 patch。
- Go 的 `@latest` 只会解析到 weekly / hotfix，**永远不会**解析到 nightly。
- `@wailsio/runtime` npm 版本号**始终与 Wails 版本一致**；生产构建请锁精确版本（`wails3 init` 生成的模板已自动 pin 到生成它的 CLI 版本）。
- 需要 **Go 1.26+**（v3 模块声明 `go 1.26.0`；建议 Go 1.26.10 / 1.27.3+，含 `crypto/x509` 安全修复）。
- 新特性 / 公开行为变更走 **WEP（Wails Enhancement Proposal）** 草稿 PR，而不是 feature-request issue。
- v2 继续接收关键更新，文档迁到 `v2.wails.io`；v3 文档在 `wails.io`（M-Press 站点）。
- 平台：Windows / macOS / Linux（amd64 + arm64）；**Linux 默认 GTK4 + WebKitGTK 6.0**。官方文档称旧栈 `-tags gtk3`（GTK3 + WebKit2GTK 4.1）「v3.0.x 保留、v3.1 移除」——**但 v3.1.0 源码里 `gtk3` build tag 文件仍在**（`pkg/application/*_gtk3*.go`），实际仍可用；视为随时可能删除的过渡选项。iOS / Android 为**实验性**，不在稳定性承诺内。
- **v3.1.0 新增（实验性）**：macOS / Linux 的 **CGO-free 后端**（`-tags purego` 或 `WAILS_PUREGO=1`，见 `wails-build`）；**原生 YAML 构建**（`wails.yaml`，需 `WAILS_EXP_USE_WAKE=1` 开启，见 `wails-build`）。

### Manager API（一个 Logger + 13 个 Manager）

`*application.App` 提供以下字段：

- `app.Window` - 窗口创建/管理/回调
- `app.ContextMenu` - 上下文菜单
- `app.KeyBinding` - 应用级快捷键（应用聚焦时跨窗口生效）
- `app.GlobalShortcut` - 系统级全局快捷键（应用未聚焦也触发）
- `app.Browser` - 打开 URL/文件
- `app.Env` - 环境信息
- `app.Dialog` - 文件/消息对话框
- `app.Event` - 自定义事件
- `app.Menu` - 应用菜单
- `app.Screen` - 屏幕信息
- `app.Clipboard` - 剪贴板
- `app.SystemTray` - 系统托盘
- `app.Autostart` - 开机自启动
- `app.Updater` - 自动更新器（`*updater.Updater`，见 `wails-advanced`）

### Go ↔ TypeScript 类型映射

| Go | TypeScript |
|----|-----------|
| `string` | `string` |
| `int*`/`float*` | `number` |
| `bool` | `boolean` |
| `[]T` | `T[]` |
| `map[string]T` | `Record<string, T>` |
| `struct` | `interface` |
| `time.Time` | `string`（RFC3339Nano，默认；`-time-type=Date` 可改为 `Date`） |
| `[]byte` | `string`（base64） |
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
| v3 新特性总览（What's New） | [whats-new.md](./references/whats-new.md) |
| 平台支持矩阵 / Roadmap（GA 状态、GTK3 退场、移动端实验性） | [status.md](./references/status.md) |
| 完整 Changelog（版本历史，至 v3.1.0） | [changelog.md](./references/changelog.md) |

## 链接到其他 SKILL

- 安装与新建项目 → `wails-quickstart`
- CLI 命令查询 → `wails-cli`
- `application.New` 选项详细 → `wails-application`
- 桥接 / 服务编写 → `wails-bindings`
- 窗口管理 → `wails-window`
