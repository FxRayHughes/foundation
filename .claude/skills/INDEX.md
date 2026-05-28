# Wails v3 Skills 索引

本项目附带的 Wails v3 知识库，按功能拆分为 12 个内容 SKILL + 1 个维护 SKILL，覆盖官方文档全部内容（约 30000+ 行）。

调用方式：在对话中直接使用 `/<skill-name>`，或由 Claude 根据任务匹配自动加载。

> **同步上游文档** → 用 `/wails-skill-update` 自动拉取最新 master 文档并对比更新（脚本在 `wails-skill-update/`）。

| Skill | 触发场景 | 主要内容 |
|-------|---------|---------|
| [wails-overview](./wails-overview/SKILL.md) | 理解架构、生命周期、桥接、构建系统、版本对比、FAQ、Changelog | concepts/* + quick-start 概念部分 + faq + changelog |
| [wails-quickstart](./wails-quickstart/SKILL.md) | 安装 wails3、新建项目、首个应用、项目结构 | getting-started/* + quick-start/installation + project-structure |
| [wails-cli](./wails-cli/SKILL.md) | wails3 CLI 命令查询与使用 | reference/cli + reference/overview + guides/cli |
| [wails-application](./wails-application/SKILL.md) | application.New 配置、生命周期钩子、Quit/Hide | reference/application |
| [wails-window](./wails-window/SKILL.md) | 窗口创建、frameless、多窗口、事件、自定义 | features/windows/* + reference/window + customising-windows |
| [wails-bindings](./wails-bindings/SKILL.md) | Service 编写、绑定生成、模型/枚举/方法 | features/bindings/* + tutorials/01-creating-a-service |
| [wails-events](./wails-events/SKILL.md) | 应用事件、窗口事件、ApplicationEvent 列表 | features/events + features/windows/events + reference/events + events-reference |
| [wails-menus-dialogs](./wails-menus-dialogs/SKILL.md) | 应用菜单、上下文菜单、systray、对话框 | features/menus/* + features/dialogs/* + reference/menu + reference/dialogs |
| [wails-runtime-features](./wails-runtime-features/SKILL.md) | 剪贴板、通知、屏幕、自启动、平台 API、键盘、拖放、浏览器、环境、前端 runtime | features/clipboard/notifications/screens/autostart/platform/keyboard/drag-and-drop/browser/environment + reference/frontend-runtime |
| [wails-build](./wails-build/SKILL.md) | 跨平台构建、签名、混淆、安装包、服务器模式、UAC、故障排查 | guides/build/* + installers + server-build + windows-uac + troubleshooting |
| [wails-advanced](./wails-advanced/SKILL.md) | 自定义传输、单实例、文件关联、协议、更新器、性能、安全、panic、raw msg、路由、Gin、测试、自定义模板 | guides/* (高级与杂项) |
| [wails-tutorials-migration](./wails-tutorials-migration/SKILL.md) | 完整教程（todo/notes/self-update）+ v2→v3 迁移 | tutorials/* + migration/* |
| [wails-skill-update](./wails-skill-update/SKILL.md) | **维护**：拉取最新文档、diff、更新 references | fetch + diff + apply 三个脚本 |
| [foundation-theme](./foundation-theme/SKILL.md) | **本项目**：主题注册系统使用与扩展 | 注册新主题、切换主题、消费 `theme.palette.foundation` |
| [foundation-i18n](./foundation-i18n/SKILL.md) | **本项目**：国际化系统（注册式 + 页面级语言包） | 注册新语言、写页面级语言包、消费 `useT()`、铁律：人类可见字符串必须走 `t()` |
| [foundation-persistence](./foundation-persistence/SKILL.md) | **本项目**：持久化层（SQLite + GORM + AutoMigrate） | 加新表三步、业务 service 接入 Holder、前端 service 包装、路径切换、表统计与清空、PRAGMA / 并发、Provider 异步化模式 |
| [foundation-utils](./foundation-utils/SKILL.md) | **本项目**：工具层（httpx / procx / cryptox / logx / filex） | HTTP 客户端、子进程（含 Windows JobObject）、AES-GCM、slog 日志、原子写；含 subprocess 白名单 service |

## 内容来源

所有 SKILL 内容源自官方仓库 `wailsapp/wails`（`docs/src/content/docs/`，Astro Starlight）。
最新基准：master @ `6329e9d2bec9`（2026-05-28 拉取，91 个英文 mdx 文档）。

每个 SKILL 文件夹结构：

```
wails-<name>/
├── SKILL.md          # 入口：触发条件 + 关键摘要 + references 索引
└── references/       # 完整原文（按主题拆分的 .md 文件）
```

## 与官方文档对应表

| 文档目录 | 归属 SKILL |
|---------|-----------|
| concepts/architecture, lifecycle, manager-api, bridge, build-system | wails-overview |
| quick-start/why-wails, first-app, next-steps | wails-overview |
| faq.mdx, changelog.mdx | wails-overview |
| getting-started/installation, your-first-app | wails-quickstart |
| quick-start/installation | wails-quickstart |
| guides/dev/project-structure | wails-quickstart |
| reference/cli, reference/overview | wails-cli |
| guides/cli | wails-cli |
| reference/application | wails-application |
| features/windows/*, reference/window | wails-window |
| guides/customising-windows | wails-window |
| features/bindings/* | wails-bindings |
| tutorials/01-creating-a-service | wails-bindings |
| features/events/*, features/windows/events | wails-events |
| reference/events, guides/events-reference | wails-events |
| features/menus/*, features/dialogs/* | wails-menus-dialogs |
| reference/menu, reference/dialogs | wails-menus-dialogs |
| guides/menus | wails-menus-dialogs |
| features/clipboard/notifications/screens/autostart/platform/keyboard/drag-and-drop/browser/environment | wails-runtime-features |
| reference/frontend-runtime | wails-runtime-features |
| guides/build/*, guides/installers, guides/server-build, guides/windows-uac | wails-build |
| troubleshooting/mac-syso | wails-build |
| guides/custom-transport, single-instance, file-associations | wails-advanced |
| guides/distribution/custom-protocols, updater | wails-advanced |
| guides/performance, security, panic-handling, raw-messages, routing | wails-advanced |
| guides/gin-routing, gin-services | wails-advanced |
| guides/e2e-testing, testing | wails-advanced |
| guides/advanced/custom-templates | wails-advanced |
| tutorials/02..04, tutorials/overview | wails-tutorials-migration |
| migration/v2-to-v3 | wails-tutorials-migration |

## 维护：同步上游文档

```powershell
$skill = '.claude\skills\wails-skill-update'
pwsh -File "$skill\fetch-docs.ps1"          # 拉取最新 master
pwsh -File "$skill\diff-docs.ps1"           # 看变更
pwsh -File "$skill\apply-update.ps1"        # dry-run
pwsh -File "$skill\apply-update.ps1" -Apply # 真正更新（自动备份）
```

## 版本

基于 Wails v3 alpha (master 分支)。同步基准 commit 见上方"内容来源"。

