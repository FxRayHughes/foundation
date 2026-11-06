# Foundation

[![Wails v3](https://img.shields.io/badge/Wails-v3.1.0-red)](https://v3.wails.io)
[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go)](https://go.dev)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev)
[![Mantine](https://img.shields.io/badge/Mantine-9.7-339AF0?logo=mantine)](https://mantine.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org)

**Foundation** 是一个**生产可用的 Wails v3 桌面应用脚手架**。开箱包含：

- 🪟 Windows / macOS / Linux 三平台原生窗口（Win/Linux 前端自绘 + macOS 沉浸式红绿灯）
- 🎨 注册式主题系统（内置三套预设 + 自定义调色板）
- 🌐 注册式 i18n（公用 + 页面级语言包）
- 💾 SQLite + GORM 持久化（AutoMigrate 零迁移文件，可视化数据存储页 + 表清空）
- 🛠 工具层：HTTP 客户端、子进程（Windows JobObject）、AES-GCM 加密、slog 日志、原子写
- 📐 严格的 MVVM 前端规范（View / ViewModel / Style / Service / lang 五层）

**适用人群**：想跳过"造轮子两周"直接进入业务开发的团队 / 个人。

<p align="center">
  <img src="./docs/screenshots/macos-native.png" alt="Foundation 在 macOS 上运行（经典布局，原生红绿灯）" width="880">
  <br><sub>macOS 原生窗口 · 经典布局 · 系统红绿灯与自绘标题栏垂直对齐</sub>
</p>

> **从 v0.0.3（MUI）升级？** 见 [v1.0.0 迁移指南](./docs/MIGRATION-v1.md)（Wails v3.1.0 + Mantine 9，含 MUI → Mantine 逐项对照与破坏性变更速查表）。

---

## 目录

- [Foundation](#foundation)
  - [目录](#目录)
  - [✨ 特性一览](#-特性一览)
  - [🖼 截图](#-截图)
    - [九种布局预设](#九种布局预设)
    - [页面与组件](#页面与组件)
    - [主题](#主题)
    - [托盘面板与子窗口](#托盘面板与子窗口)
  - [🛠 安装 Wails CLI](#-安装-wails-cli)
    - [系统要求](#系统要求)
    - [必装依赖](#必装依赖)
    - [安装 wails3 CLI](#安装-wails3-cli)
    - [验证环境](#验证环境)
  - [🚀 快速开始](#-快速开始)
    - [1. 克隆 + 改名](#1-克隆--改名)
    - [2. 装依赖](#2-装依赖)
    - [3. 生成 bindings](#3-生成-bindings)
    - [4. 跑起来](#4-跑起来)
  - [📂 项目结构](#-项目结构)
  - [⌨️ 常用命令速查](#️-常用命令速查)
  - [🧪 E2E 测试与截图](#-e2e-测试与截图)
  - [📐 工程规范](#-工程规范)
  - [✏️ 把脚手架改名为你的项目](#️-把脚手架改名为你的项目)
  - [🧩 加新功能：常见路径](#-加新功能常见路径)
    - [加一个页面](#加一个页面)
    - [加一张数据表](#加一张数据表)
    - [加一个后端 service](#加一个后端-service)
    - [发起 HTTP 请求](#发起-http-请求)
    - [启动子进程](#启动子进程)
  - [📚 文档](#-文档)
  - [📜 License](#-license)

---

## ✨ 特性一览

| 类别 | 内容 |
|-----|------|
| **窗口** | Windows/Linux 完全无边框（前端自绘标题栏 + 窗口控制按钮）；macOS 沉浸式标题栏 + 系统红绿灯 |
| **布局** | 应用外壳为 **CSS Grid**，内置 **9 种布局预设**（经典图标栏 / 展开侧栏 / 顶部导航 / 融合标题栏 / 右侧栏 / 底部 Dock / 悬浮 Dock（可拖拽）/ 浮动卡片 / 专注抽屉），「设置 → 布局」实时切换并持久化；导航全部从路由表自动渲染；首页为响应式卡片网格 |
| **路由** | 唯一事实源 `routes.tsx` + `<RouterOutlet />` + `useRouter()`；支持 `keepAlive` 页面缓存 |
| **UI 栈** | Mantine 9（`@mantine/core` / `@mantine/hooks`）+ CSS Modules + `@tabler/icons-react`；图表 `@mantine/charts`（recharts）+ 自实现高级图表（`components/x-pro/charts`）；数据表格 `components/x-pro/data-grid`（基于 `mantine-datatable`） |
| **主题** | `foundation-light` / `foundation-dark` / `foundation-obsidian` + 用户自定义调色板（16 个语义槽位），编译为 CSS 变量 `--fd-*` + Mantine 主色 `foundation` |
| **i18n** | `zh-CN` / `en-US`（默认 zh-CN）；`'auto'` 跟随浏览器；公用 + 页面级语言包深合并 |
| **首屏优化** | `index.html` 内联静态骨架（消除白屏）+ React 骨架组件 + lazy import + Suspense |
| **持久化** | SQLite + GORM AutoMigrate；用户可在「设置 → 数据存储」改数据库位置（原生「另存为」对话框） |
| **数据可视化** | 设置页内置环形 + 条形图（`@mantine/charts`）展示各表占用 + 逐表清空 |
| **工具层** | `httpx` HTTP / `procx` 子进程（Windows JobObject）/ `cryptox` AES-GCM / `logx` slog+rotate / `filex` 原子写 |
| **子进程** | 严格白名单子进程 service：前端可调，命令必须在 `commands.go` 注册并通过 `ArgPattern` 校验 |
| **原生对话框** | `NativeDialogs` 服务封装 Wails v3 `Dialogs.*`，禁用浏览器 `alert/confirm/prompt` |
| **系统托盘** | 运行时启用 / 禁用（开关持久化、启动恢复）+ Mantine 托盘面板 + 托盘菜单 i18n |
| **数据表格导出** | 原生「另存为」→ Go 后端写 CSV（UTF-8 BOM）/ 真 `.xlsx`（excelize，表头加粗冻结、数字保持数值） |
| **跨窗口同步** | 主窗口 / 子窗口 / 托盘面板的主题与语言经 `appsettings:changed` 事件实时一致 |
| **E2E** | Playwright 驱动 Wails server 模式（真实后端 + 隔离数据目录 `FOUNDATION_DATA_DIR`），本 README 截图即由它生成 |

---

## 🖼 截图

> 以下截图（除顶部 macOS 原生截图外）由 [E2E 脚本](./frontend/e2e/screenshots.spec.ts) 自动生成：Wails server 模式运行真实后端，Chromium 渲染真实前端，标题栏按 Windows 样式（自绘最小化 / 最大化 / 关闭）。运行 `cd frontend && pnpm e2e:screenshots` 即可重新生成。

### 九种布局预设

外壳是一个 CSS Grid（`title / nav / main`），预设只声明「导航形态 × 导航位置 × 内容外框」三件事（[`src/layouts/presets.ts`](./frontend/src/layouts/presets.ts)），新增预设只需加一行。在「设置 → 布局」点选即时生效，选择存入 SQLite。

| 经典（默认） | 展开侧栏 | 顶部导航 |
|:---:|:---:|:---:|
| <img src="./docs/screenshots/layout-classic.png" alt="经典布局"> | <img src="./docs/screenshots/layout-sidebar.png" alt="展开侧栏"> | <img src="./docs/screenshots/layout-topnav.png" alt="顶部导航"> |
| 64px 左侧图标栏，紧凑 | 图标 + 文字，可折叠为图标栏 | 标题栏下方水平导航条 |
| **融合标题栏** | **右侧栏** | **底部 Dock** |
| <img src="./docs/screenshots/layout-titlebar.png" alt="融合标题栏"> | <img src="./docs/screenshots/layout-right.png" alt="右侧栏"> | <img src="./docs/screenshots/layout-dock.png" alt="底部 Dock"> |
| 导航嵌入标题栏，省出一行 | 图标栏放到右侧 | 内容区底部居中浮动 |
| **悬浮 Dock** | **浮动卡片** | **专注** |
| <img src="./docs/screenshots/layout-floating.png" alt="悬浮 Dock"> | <img src="./docs/screenshots/layout-inset.png" alt="浮动卡片"> | <img src="./docs/screenshots/layout-focus-drawer.png" alt="专注（抽屉展开）"> |
| 竖向悬浮，拖动手柄移动，松手吸附左 / 右边缘；永不进入标题栏 | 侧栏 + 四周留白的圆角内容卡片 | 无常驻导航，标题栏菜单按钮呼出抽屉 |

### 页面与组件

| 设置 → 布局 | 设置 → 个性化 |
|:---:|:---:|
| <img src="./docs/screenshots/page-settings-layout.png" alt="布局设置页"> | <img src="./docs/screenshots/page-settings-personalization.png" alt="个性化设置页"> |
| 每个预设一张 CSS 绘制的示意缩略图，键盘可达 | 主题 / 显示偏好 / 自定义调色板（实时预览） |
| **设置 → 数据存储** | **X-Pro：DataGrid** |
| <img src="./docs/screenshots/page-settings-database.png" alt="数据存储页"> | <img src="./docs/screenshots/page-xpro-grid.png" alt="DataGrid Pro / Premium"> |
| 数据库位置、占用空间、逐表统计图 | 列钉住 / 行拖拽 / 列菜单 / 列宽拖拽 / 钉住行 / 聚合 / 原生导出 |
| **X-Pro：图表** | **首页** |
| <img src="./docs/screenshots/page-xpro-charts.png" alt="X-Pro 图表"> | <img src="./docs/screenshots/layout-classic.png" alt="首页卡片网格"> |
| 热力图 / 漏斗（纵 + 横）/ 雷达 / K 线 / 桑基 / 甘特 / 矩形树图 | 响应式卡片网格：后端往返、子窗口、托盘、当前布局 |

### 主题

| 黑暗 · 展开侧栏 | 黑曜 · 浮动卡片 |
|:---:|:---:|
| <img src="./docs/screenshots/theme-dark.png" alt="黑暗主题"> | <img src="./docs/screenshots/theme-obsidian.png" alt="黑曜主题"> |

主题编译为 CSS 变量 `--fd-*`，组件样式只写 `var(--fd-*)`，切换主题零重渲染；另有「跟随系统」与用户自定义调色板。

### 托盘面板与子窗口

| 托盘面板 | 确认子窗口 |
|:---:|:---:|
| <img src="./docs/screenshots/tray-panel.png" alt="托盘面板" width="260"> | <img src="./docs/screenshots/child-confirm.png" alt="确认子窗口" width="340"> |
| 点击托盘图标弹出；失焦 / Esc 隐藏；「打开设置」驱动主窗口路由 | 子窗口与主窗口共享主题 / 语言（跨窗口实时同步） |

---

## 🛠 安装 Wails CLI

### 系统要求

| 平台 | 版本 |
|------|------|
| Windows | 10 / 11（AMD64 或 ARM64） |
| macOS | 10.15+（开发）/ 部署到 10.13+ |
| Linux | Ubuntu 24.04 AMD64/ARM64（其他发行版亦可） |

### 必装依赖

| 依赖 | 版本 | 验证 / 安装 |
|------|------|------------|
| **Go** | ≥ 1.26（Wails v3.1.0 要求） | `go version` |
| **Node.js** | ≥ 20 | `node --version` |
| **pnpm** | latest | `npm i -g pnpm` |
| **task** (go-task) | latest | `go install github.com/go-task/task/v3/cmd/task@latest` |
| **WebView2 Runtime** | Windows 必装 | Win10 ≥1803 内置；老系统从 [Microsoft 下载](https://developer.microsoft.com/microsoft-edge/webview2/) |
| **Xcode CLT** | macOS 必装 | `xcode-select --install` |
| **gcc + gtk4 + webkit2gtk-6.0** | Linux 必装 | `wails3 doctor` 会给出本机系统的精确安装命令 |

> Linux 旧栈用户：可以加 `-tags gtk3` 切回 GTK3 + WebKit2GTK 4.1（v3.1 之前保留兼容）。

### 安装 wails3 CLI

```sh
go install -v github.com/wailsapp/wails/v3/cmd/wails3@latest
```

确保 `$GOPATH/bin` 或 `$HOME/go/bin` 在 PATH 里：

```sh
# 临时
export PATH=$PATH:$(go env GOPATH)/bin

# 永久（bash/zsh）
echo 'export PATH=$PATH:$(go env GOPATH)/bin' >> ~/.bashrc

# Windows PowerShell：去"环境变量"图形界面把 %USERPROFILE%\go\bin 加进 PATH
```

### 验证环境

```sh
wails3 doctor
```

输出会列出所有检测项 + 缺失依赖的安装提示。**全绿之后再继续。**

---

## 🚀 快速开始

### 1. 克隆 + 改名

```sh
git clone https://github.com/FxRayHughes/foundation.git my-app
cd my-app

# 强烈建议立即按下方「改名指南」把 module 名 / 应用名替换为你自己的
# 不改也能跑，但生成 bindings 后路径里都是 foundation 字样
```

### 2. 装依赖

```sh
# Go 依赖
go mod tidy

# 前端依赖
cd frontend && pnpm install && cd ..
```

### 3. 生成 bindings

```sh
wails3 generate bindings
```

> bindings 是 Wails 自动生成的前端 ↔ 后端 RPC 胶水代码，路径在 `frontend/bindings/<module-name>/...`。**改了 Go module 名或 service 后必须重新生成。** 已加入 `.gitignore`。

### 4. 跑起来

```sh
# 开发（前后端热重载，Vite dev server 默认端口 9245）
wails3 dev
# 等价：task dev

# 生产构建（当前平台）
task build

# 打包
task package
```

应用首次启动会在用户数据目录建立 `foundation.db`：

| 平台 | 默认数据库位置 |
|------|---------------|
| Windows | `%AppData%\Foundation\foundation.db` |
| macOS | `~/Library/Application Support/Foundation/foundation.db` |
| Linux | `~/.local/share/Foundation/foundation.db` |

可在应用内「设置 → 数据存储」修改位置（原生「另存为」对话框，自动迁移现有数据）。

---

## 📂 项目结构

```
foundation/
├── main.go                            # 仅 embed.FS + app.Run；不接受业务代码
├── go.mod
├── Taskfile.yml                       # 顶层任务（dev/build/package）
│
├── internal/                          # 后端业务（package private）
│   ├── app/
│   │   ├── app.go                     # 启动顺序：logx→httpx UA→storage→service→app.Run
│   │   ├── window_windows.go          # 无边框窗口（build tag）
│   │   ├── window_darwin.go           # 沉浸式 + 红绿灯
│   │   └── window_linux.go            # 无边框窗口
│   ├── events/events.go               # 集中注册类型化事件
│   ├── services/                      # Wails Service（自动暴露给前端）
│   │   ├── greet/                     # 示例 service
│   │   ├── preferences/               # KV 偏好（持久化）
│   │   ├── appsettings/               # 单行表（主题/自定义/语言）
│   │   ├── storagesvc/                # 数据库路径管理 + 表统计 + 清空
│   │   └── subprocess/                # 子进程白名单（前端可调）
│   ├── storage/                       # SQLite 持久化层
│   │   ├── db.go                      # Open / Holder（热替换）
│   │   ├── pragma.go                  # WAL / busy_timeout / cache / mmap
│   │   ├── models.go                  # AllModels（加表唯一注册中心）
│   │   ├── usage.go                   # dbstat 表占用统计
│   │   └── ...
│   └── utils/                         # 跨业务工具层
│       ├── httpx/                     # HTTP 客户端 + JSON helper + retry
│       ├── procx/                     # 子进程 + Windows JobObject
│       ├── cryptox/                   # AES-GCM 对称加密
│       ├── logx/                      # slog + 控制台 + 文件 rotate
│       └── filex/                     # 原子写
│
├── frontend/                          # React 19 + Mantine 9 + Vite 8
│   ├── index.html                     # 内联首屏骨架（消除白屏）
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                    # Provider 链装配
│   │   ├── routes.tsx                 # 路由表（唯一事实源）
│   │   ├── components/                # AppLayout / TitleBar / Sidebar / Skeleton / x-pro（图表 + 数据表格）
│   │   ├── pages/
│   │   │   ├── HomePage/              # 一个页面 = View+VM+Style(.module.css)+lang+Skeleton
│   │   │   └── SettingsPage/
│   │   │       ├── SettingsPage.tsx   # 框架：左列入口 + 右列分发
│   │   │       ├── personalization/   # 子页：主题 + 偏好 + 自定义主题
│   │   │       ├── language/          # 子页：语言切换
│   │   │       └── database/          # 子页：数据存储路径 / 图表 / 清空
│   │   ├── router/                    # RouteDefinition / RouterOutlet / useRouter
│   │   ├── services/                  # services 包装 bindings（View/VM 不直接 import bindings）
│   │   ├── styles/                    # global.css + themes/（Mantine 主题注册系统，含 customTheme）
│   │   ├── i18n/                      # 注册式 i18n
│   │   └── preferences/               # PreferencesProvider（异步对接 SQLite）
│   ├── bindings/                      # wails3 自动生成（gitignore）
│   └── package.json
│
├── build/                             # 多平台构建配置 + 资源
│   ├── config.yml                     # productName / identifier / version
│   ├── windows/ darwin/ linux/        # 各平台 Taskfile + 资源
│   └── ...
│
├── .claude/                           # AI 协作工作区
│   └── skills/
│       ├── wails-*/                   # Wails v3 官方文档（13 个 skill）
│       ├── foundation-theme/          # 主题系统使用指南（Mantine + --fd-* CSS 变量）
│       ├── foundation-mantine*/       # Mantine 组件 / 图标 / 图表 / 数据表格使用指南
│       ├── foundation-i18n/           # i18n 使用指南
│       ├── foundation-persistence/    # 持久化层使用指南
│       └── foundation-utils/          # 工具层使用指南（httpx/procx/cryptox/logx/filex）
│
├── CLAUDE.md                          # 项目级 AI 协作约定
├── README.md                          # 本文
└── .gitignore
```

---

## ⌨️ 常用命令速查

| 命令 | 作用 |
|------|------|
| `wails3 dev` | 前后端热重载开发模式 |
| `wails3 build` | 直接编译当前平台二进制（无打包） |
| `wails3 generate bindings` | 重新生成 `frontend/bindings/` |
| `wails3 doctor` | 检测开发环境依赖 |
| `task dev` | = `wails3 dev` |
| `task build` | 当前平台生产构建 |
| `task package` | 当前平台打包（含安装包） |
| `task run` | 跑已构建的二进制 |
| `task <os>:build` | 指定平台构建（windows/darwin/linux） |
| `task build:server` | 服务器模式（无 GUI，HTTP 后端） |
| `cd frontend && pnpm typecheck` | 单独跑前端类型检查（不出文件） |
| `cd frontend && pnpm build` | 单独构建前端（产物到 `frontend/dist`） |
| `go build .` | 单独构建后端（需要 `frontend/dist` 已存在） |
| `go vet ./...` | 后端静态检查 |
| `go test ./internal/...` | 后端单元测试 |
| `cd frontend && pnpm e2e` | E2E 测试（需先 `wails3 task build:server`） |
| `cd frontend && pnpm e2e:screenshots` | 重新生成 `docs/screenshots/*.png` |

---

## 🧪 E2E 测试与截图

E2E 用 [Playwright](https://playwright.dev) 驱动 **Wails server 模式**：`-tags server` 构建出的二进制不开原生窗口，直接以 HTTP 提供同一套前端 + 全部 Go service / 事件，所以测试覆盖的是真实后端，而不是 mock。

```bash
# 1. 构建 server 模式二进制（产物 bin/foundation-server）
wails3 task build:server

# 2. 跑全部 E2E（含悬浮 Dock 拖拽回归测试）
cd frontend && pnpm e2e

# 3. 只重新生成 README 截图（写到 docs/screenshots/）
pnpm e2e:screenshots
```

| 设计点 | 说明 |
|-------|------|
| **数据隔离** | `playwright.config.ts` 每次以空目录启动后端，经 `FOUNDATION_DATA_DIR` 让数据库 / 主密钥 / 日志都写进仓库下的 `.e2e-data/`（已 gitignore），**绝不触碰你的真实数据** |
| **确定性** | 截图脚本直接把布局 / 主题写入 E2E 数据库再刷新，不依赖点击路径；就绪以启动骨架移除为准（偏好已从后端读回） |
| **浏览器** | 默认使用本机已装的 Microsoft Edge（`channel: 'msedge'`），免下载；CI 可设 `E2E_CHANNEL=chromium` 并先 `npx playwright install chromium` |
| **端口** | 默认 `9346`，可用 `E2E_PORT` 覆盖（Wails 读取 `WAILS_SERVER_PORT`） |
| **局限** | 浏览器里没有原生窗口：托盘图标、红绿灯、原生对话框需在桌面构建中手动验证 |

`FOUNDATION_DATA_DIR` 同样适用于**便携版**：设置后应用把所有数据放在该目录下（不再使用系统用户目录）。

---

## 📐 工程规范

下面这些规范在 `CLAUDE.md` 与 `frontend/CLAUDE.md` 里都有详细说明。简要列出：

| 类别 | 铁律 |
|------|------|
| **MVVM** | View 不写业务（只消费 ViewModel）；ViewModel 不返回 JSX、不直接 import bindings；Service 层包装 bindings |
| **i18n** | 任何人类可见字符串必须经 `t()`（含 `aria-label` / `placeholder` / 对话框文案） |
| **持久化** | 跨会话状态只走 SQLite（`PreferencesService` / `AppSettingsService` / 自定义 service）；**禁止** `localStorage` / `sessionStorage` |
| **业务 service** | 持有 `*storage.Holder`，**不要** capture `*storage.DB`（切换路径会替换） |
| **HTTP** | **禁止** `net/http.DefaultClient`；用 `httpx.GetJSON / PostJSON / Do` |
| **子进程** | **禁止** `os/exec.Cmd.Start`；用 `procx.StartCtx`（自动绑 JobObject / pgid） |
| **加密** | 敏感字符串落 SQLite 必须 `cryptox.EncryptString` |
| **日志** | **禁止** `log.Printf` / `fmt.Println`；用 `logx.For("component").Info(...)` |
| **配置文件** | **禁止** `os.WriteFile` 写配置；用 `filex.WriteAtomic` |
| **原生对话框** | 文件 / 文件夹 / 确认 / 错误 提示必须走 `NativeDialogs`，**禁止** `alert/confirm/prompt` |
| **UI 组件** | 只用 Mantine（`@mantine/*`）+ CSS Modules；**禁止**引入 `@mui/*` / `@emotion/*` / `sx` 写法 |
| **Icon** | UI 图标必须用 `@tabler/icons-react` 的 React 组件（`<IconXxx size={20} stroke={1.75} />`）；**禁止** emoji / Unicode / 其它 icon 包 |
| **样式取色** | 样式写 `<Name>.module.css`，颜色永远用 `var(--fd-*)`（JS 侧用 `FOUNDATION_CSS_VARS` / `useFoundationPalette()`）；圆角语言：按钮 4–6px / 容器 8px |
| **平台分支** | 走 `internal/app/window_<os>.go` 的 build tag 文件，**禁止** `runtime.GOOS` 判断 |

---

## ✏️ 把脚手架改名为你的项目

`foundation` 这个名字出现在多处，按顺序替换：

| 步骤 | 文件 / 字段 | 替换 |
|------|------------|------|
| 1 | `go.mod` 第 1 行 `module foundation` | `module <your-app>` |
| 2 | 全局替换 `import "foundation/internal/...` | `import "<your-app>/internal/...` |
| 3 | `internal/storage/paths.go` 的 `AppDirName = "Foundation"` | 你的产品名 |
| 4 | `internal/utils/cryptox/cryptox.go` 的 `AppDirName` | 同上 |
| 5 | `internal/utils/logx/logx.go` 的 `AppDirName` | 同上 |
| 6 | `internal/app/app.go` 的 `Name`、`Description` | 你的产品信息 |
| 7 | `internal/app/window_*.go` 的 `Title` | 同上 |
| 8 | `frontend/src/services/*/*.ts` 中所有 `@bindings/foundation/...`（greet / preferences / appsettings / storage / subprocess / childwindow / systray / export） | `@bindings/<your-app>/...` |
| 9 | `frontend/package.json` 的 `name` 字段 | `<your-app>-frontend` |
| 10 | `frontend/index.html` 的 `<title>` | 你的产品名 |
| 11 | `Taskfile.yml` 的 `APP_NAME: "foundation"` | `<your-app>` |
| 12 | `build/config.yml` 的 `info.productName` / `info.companyName` / `info.productIdentifier` | 你的元信息 |

替换完毕：

```sh
go mod tidy
cd frontend && pnpm install
wails3 generate bindings
wails3 task common:update:build-assets   # 用新 productName 重生成图标 / Info.plist
```

> 改名后第一次 `wails3 dev` 之前**一定**要重新 `wails3 generate bindings`，否则前端 import 路径会指向不存在的旧 module。

---

## 🧩 加新功能：常见路径

### 加一个页面

详见 `frontend/CLAUDE.md` 的「路由规范」。

```ts
// 1. 写页面：frontend/src/pages/AccountPage/{AccountPage.tsx, useAccountPage.ts, AccountPage.module.css, AccountPage.skeleton.tsx, index.ts}
//    若有人类可见文案：再加 lang/{zh-CN.ts, en-US.ts, index.ts} + register<Name>Locales

// 2. 在 src/routes.tsx 追加一项
import { IconUser } from '@tabler/icons-react';
import { AccountPage } from '@/pages/AccountPage';
import { AccountPageSkeleton } from '@/pages/AccountPage/AccountPage.skeleton';

export const routes: RouteDefinition[] = [
  // ...
  {
    id: 'account',
    labelKey: 'route.account',
    label: 'Account',
    icon: IconUser,
    element: <AccountPage />,
    fallback: <AccountPageSkeleton />,
    slot: 'primary',
  },
];

// 3. 公用 locale 加 route.account
// 4. App.tsx 调一次 registerAccountPageLocales()
```

### 加一张数据表

详见 `.claude/skills/foundation-persistence/SKILL.md`。

```go
// 1. internal/storage/models.go
type Message struct {
    ID        uint   `gorm:"primaryKey;autoIncrement"`
    Content   string `gorm:"type:text;not null"`
    CreatedAt int64  `gorm:"autoCreateTime:milli;index"`
}

// 2. 同文件 AllModels 数组追加
var AllModels = []ModelDescriptor{
    // ... 已有
    { Model: &Message{}, TableName: "messages", LabelKey: "messages", Clearable: true },
}

// 3. 重启 → AutoMigrate 自动建表 + 设置页双图自动展示
```

### 加一个后端 service

```go
// 1. internal/services/messages/messages.go
type Service struct { holder *storage.Holder }
func New(holder *storage.Holder) *Service { return &Service{holder: holder} }
func (s *Service) Send(ctx context.Context, content string) error { /* ... */ }

// 2. internal/app/app.go 注册
Services: []application.Service{
    // ... 已有
    application.NewService(messages.New(holder)),
},

// 3. wails3 generate bindings

// 4. frontend/src/services/messages/MessagesService.ts 包装
import { Service as Binding } from '@bindings/foundation/internal/services/messages';
export const MessagesService = {
    async send(content: string) { return Binding.Send(content); },
};
```

### 发起 HTTP 请求

详见 `.claude/skills/foundation-utils/SKILL.md`。

```go
import "foundation/internal/utils/httpx"

var resp WeatherResp
if err := httpx.GetJSON(ctx, url, &resp); err != nil {
    if he, ok := httpx.IsHTTPError(err); ok && he.StatusCode == 404 {
        return ErrNotFound
    }
    return err
}
```

### 启动子进程

```go
import "foundation/internal/utils/procx"

err := procx.Run(ctx, procx.Spec{
    Name: "ffmpeg",
    Args: []string{"-i", input, output},
    CaptureOutput: true,
    OnStdout: func(line string) { logx.For("ffmpeg").Debug(line) },
})
// 父进程崩溃时子进程自动连带 kill（Windows JobObject / Unix pgid）
```

要让前端能调，必须经过 `internal/services/subprocess/commands.go` 的白名单。

---

## 📚 文档

| 文档 | 内容 |
|------|------|
| [CLAUDE.md](./CLAUDE.md) | 项目级 AI 协作约定（架构概览 + 工程规范汇总） |
| [frontend/CLAUDE.md](./frontend/CLAUDE.md) | 前端模块详细规范（MVVM / 路由 / 持久化 / 原生对话框 / Icon / 子目录隔离） |
| [frontend/DEVELOPMENT.md](./frontend/DEVELOPMENT.md) | 前端 MVVM 落地细则 |
| [build/CLAUDE.md](./build/CLAUDE.md) | 多平台构建配置说明 |
| [docs/MIGRATION-v1.md](./docs/MIGRATION-v1.md) | v0.0.3 → v1.0.0 迁移指南（MUI → Mantine、Wails v3.1.0） |
| `.claude/skills/wails-*/` | Wails v3 官方文档（按主题拆分的 13 个 skill） |
| `.claude/skills/foundation-theme/` | 主题系统使用指南 |
| `.claude/skills/foundation-mantine*/` | Mantine 组件 / 图标 / 图表 / 数据表格使用指南 |
| `.claude/skills/foundation-i18n/` | i18n 使用指南 |
| `.claude/skills/foundation-persistence/` | 持久化层使用指南 |
| `.claude/skills/foundation-utils/` | 工具层使用指南（httpx/procx/cryptox/logx/filex） |
| [Wails v3 官网](https://v3.wails.io) | 上游文档 |
| [Mantine 官网](https://mantine.dev) | UI 组件库（`@mantine/core` / `@mantine/charts`） |
| [mantine-datatable](https://icflorescu.github.io/mantine-datatable/) | 数据表格 |
| [Tabler Icons](https://tabler.io/icons) | 图标库 |

---

## 📜 License

MIT
