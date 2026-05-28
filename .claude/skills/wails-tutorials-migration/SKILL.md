---
name: wails-tutorials-migration
description: 完整动手教程（QR Code Service / TODO List / Notes / Self-Update App）+ v2→v3 迁移指南。当用户说「教程 / step-by-step / 教我做一个 todo / notes 应用 / 自动更新教程 / 从 wails v2 升级 / wails.Run / Bind / startup / Bind 列表 / 迁移」时使用。
---

# Wails v3 - 教程与迁移

包含 4 个完整动手教程（从浅到深），以及 v2→v3 迁移指南。

## 何时使用本 SKILL

- 想要按步骤跟做一个完整 Wails 应用
- 第一次接触 Wails 想从 todo / notes 入门
- 实现自动更新（含 GitHub 发布、签名）
- 把 Wails v2 项目升级到 v3

## 教程速览

| # | 教程 | 时长 | 学到什么 |
|---|------|------|----------|
| 01 | QR Code Service | ~10min | Service 架构基础、外部 Go 依赖、绑定 |
| 02 | TODO List (Vanilla JS) | ~20min | CRUD、线程安全的状态管理、类型安全绑定 |
| 03 | Notes (Apple Notes 风格) | ~30min | 原生文件对话框、JSON 持久化、防抖自动保存 |
| 04 | Self-Updating App | ~25min | `app.Updater`、GitHub Releases provider、Ed25519 签名、SHA256SUMS、自定义 UI |

⚠️ Tutorial 01（QR Code Service）的内容已合并到 `wails-bindings` skill 的 references。本 skill 主要包含 02/03/04。

## v2 → v3 迁移要点速查

### 应用初始化

| 角度 | v2 | v3 |
|------|----|----|
| API | `wails.Run(&options.App{...})` 一调到底 | `application.New(opts)` 创建 → `app.Window.NewWithOptions(...)` → `app.Run()` 三步 |
| 多窗口 | 不易 | 任何时候 `app.Window.New()` |
| 错误处理 | 统一 | 各阶段独立 |

### 绑定

| 角度 | v2 | v3 |
|------|----|----|
| Context | 每个 struct 需要 `ctx context.Context` 字段 + `startup(ctx)` | Service 是普通 struct；需要 ctx 时方法首参 `context.Context` |
| 注册 | `Bind: []interface{}{&App{}}` | `Services: []application.Service{application.NewService(&MyService{})}` |
| 生命周期 | `startup` 函数 | 实现 `ServiceStartup(ctx, opts) error` 方法 |

### 事件系统

| 角度 | v2 | v3 |
|------|----|----|
| API | `runtime.EventsEmit(ctx, name, data)` | `app.Event.Emit(name, data)` |
| 监听 | `runtime.EventsOn(ctx, name, fn)` | `app.Event.On(name, fn)` 返回 unsubscribe |
| 系统事件 | 字符串 | `events.Common.WindowFocus` 等常量 |

### 窗口

| 角度 | v2 | v3 |
|------|----|----|
| 创建 | `wails.Run(&options.App{...})` 内置一个窗口 | 显式 `app.Window.New()` |
| 操作 | `runtime.WindowSetTitle(ctx, "x")` | `window.SetTitle("x")` |
| 多窗口 | 难 | 原生支持，`app.Window.GetByName(name)` |

### 对话框

| 角度 | v2 | v3 |
|------|----|----|
| API | `runtime.MessageDialog(ctx, options)` | `app.Dialog.Info()/Question()/...` builder |
| 文件 | `runtime.OpenFileDialog(ctx, options)` | `app.Dialog.OpenFile().AddFilter().PromptForSingleSelection()` |

### 菜单

| 角度 | v2 | v3 |
|------|----|----|
| 创建 | `menu.NewMenuFromItems(...)` | `app.NewMenu().AddSubmenu("File").Add("New").OnClick(...)` |
| 注册 | `Menu` field on options | `app.Menu.Set(menu)` + 窗口 `UseApplicationMenu: true` |

### 配置文件

- v2 `wails.json` → v3 `build/config.yml`
- 旧 `wails.json` 中的 `frontend:install`、`frontend:build` 等命令 → v3 Taskfile（`Taskfile.yml`）

### CLI

| v2 | v3 |
|----|----|
| `wails init` | `wails3 init` |
| `wails build` | `wails3 build` |
| `wails dev` | `wails3 dev` |
| `wails generate module` | `wails3 generate bindings` |
| 没有 | `wails3 task --list` 看所有 Task |

### 迁移时长

典型应用：1-4 小时。

### 重要提示

- v3 是**完全重写**，不是 v2 的增量升级
- 很多模式需要重新设计（绑定 / 窗口 / 菜单）
- 旧 `app.NewWebviewWindow(...)` API **不存在** —— 没有兼容包装层
- 如有大量 v2 业务逻辑，建议先写一个最小 v3 应用熟悉模式再逐步迁移

## References 索引

| 主题 | 文件 |
|------|------|
| 教程总览 | [overview.md](./references/overview.md) |
| 02 TODO List 完整教程 | [02-todo-vanilla.md](./references/02-todo-vanilla.md) |
| 03 Notes 完整教程 | [03-notes-vanilla.md](./references/03-notes-vanilla.md) |
| 04 Self-Update 完整教程 | [04-self-update-a-wails-app.md](./references/04-self-update-a-wails-app.md) |
| **v2 → v3 迁移指南**（完整 breaking changes） | [v2-to-v3.md](./references/v2-to-v3.md) |

## 链接到其他 SKILL

- 01 教程（QR Code Service） → `wails-bindings` 的 `references/tutorial-creating-a-service.md`
- 服务编写 / 绑定 → `wails-bindings`
- 文件对话框 / 菜单 → `wails-menus-dialogs`
- 自动更新（详细 API） → `wails-advanced`（`updater.md`）
- 应用入口配置 → `wails-application`
- 事件系统 → `wails-events`
