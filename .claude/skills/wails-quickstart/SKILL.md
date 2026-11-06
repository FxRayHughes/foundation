---
name: wails-quickstart
description: Wails v3 安装、wails3 setup 引导向导、依赖检查、新建项目、第一个应用、项目结构解析、调试、接入其他前端框架。当用户问到「如何安装 wails3 / wails3 setup / setup wizard / wails3 init / wails3 doctor / 项目目录结构 / 新手开始 / Go 版本要求（Go 1.26）/ WebView2 依赖 / GTK4 WebKitGTK 6.0 / 调试 debugging / devtools / 其他前端框架」时使用。
---

# Wails v3 - 快速开始

包含安装 Wails CLI、检查依赖、初始化项目、构建运行第一个应用、了解项目目录结构。

## 何时使用本 SKILL

- 第一次接触 Wails，需要安装环境
- 排查 `wails3 doctor` 报告的依赖缺失
- 用 `wails3 init` 新建项目
- 想了解 build/、frontend/、main.go、greetservice.go 等目录的职责
- 了解 Taskfile.yml / go.mod / package.json 的角色

## 关键摘要

### 系统要求

- Windows 10/11 AMD64/ARM64
- macOS AMD64/ARM64：标准构建任务的部署目标为 **macOS 12.0+**（`build/darwin/Taskfile.yml` 的 `-mmacosx-version-min=12.0`）
- Ubuntu 24.04 AMD64/ARM64（其他 Linux 也可能可用；默认需要 GTK4 + WebKitGTK 6.0）

### 必装依赖

| 依赖 | 要求 | 验证 |
|------|------|------|
| Go | **≥1.26**（v3 模块声明 `go 1.26.0`；推荐 1.26.10 / 1.27.3+，含 `crypto/x509` 安全修复；旧 Go 可借 `GOTOOLCHAIN=auto` 自动拉取） | `go version` |
| npm | 模板需要（可选） | `npm --version` |
| Xcode CLT | macOS 必需 | `xcode-select --install` |
| WebView2 Runtime | Windows 必需 | `wails3 doctor` |
| gcc + gtk4 + webkitgtk-6.0 | Linux 必需 | `wails3 doctor` 会给出安装命令 |

Linux 旧栈：可用 `-tags gtk3` 切回 GTK3 + WebKit2GTK 4.1（Ubuntu 22.04 / Debian 12 / RHEL 9 等只有 4.1 的发行版需要）。官方文档称「v3.1 移除」，但 **v3.1.0 源码中该 tag 仍在**，按过渡选项对待。

### 安装 CLI

正式版（`@latest` 只解析到 weekly / hotfix，不会拿到 nightly；需要可复现时写精确版本如 `@v3.1.0`）：
```sh
go install -v github.com/wailsapp/wails/v3/cmd/wails3@latest
```

### `wails3 setup` 引导向导（v3 GA 新增，标注实验性）

```sh
wails3 setup                 # 在浏览器打开向导：依赖检查 / 全局默认值 / 可选 Docker 跨平台 / 签名凭据
wails3 setup signing         # 子命令：配置代码签名
wails3 setup entitlements    # 子命令：配置 macOS entitlements
```
- 全局偏好写到 `$XDG_CONFIG_HOME/wails/defaults.yaml`（回退 `~/.config/wails/defaults.yaml`），供 `wails3 init` 复用；与项目的 `build/config.yml` 无关。
- ⚠️ 官方 setup.md 的「Sub-Commands」写成 `wails3 signing` / `wails3 entitlements`，**源码（cmd/wails3/main.go）实际是 `wails3 setup signing` / `wails3 setup entitlements`**，以源码为准。
- 向导主要在 Linux 上测试；有问题退回 `wails3 doctor` + 手动安装依赖。

开发版：
```sh
git clone https://github.com/wailsapp/wails.git
cd wails/v3/cmd/wails3
go install
```

⚠️ 开发版生成的项目用 Go `replace` 指向本地源码。

### 快速建项目

```sh
wails3 init -n myfirstapp
cd myfirstapp
wails3 build       # 生产构建
wails3 dev         # 开发模式（热重载）
```

或用 Task：
```sh
task dev      # = wails3 dev
task build    # 构建
task run      # 运行已构建的应用
task build:server   # 服务器模式（无 GUI）
```

### 标准项目结构（`wails3 init` 默认）

```
myfirstapp/
├── build/                    # 构建产物 + 平台资源
│   ├── appicon.png           # 应用图标
│   ├── config.yml            # 构建配置
│   ├── Taskfile.yml          # 顶层构建任务
│   ├── darwin/               # macOS（Info.plist、icons.icns）
│   ├── linux/                # AppImage / NFPM 打包
│   ├── windows/              # NSIS、MSIX、icon.ico、wails.exe.manifest
│   ├── android/ ios/         # 移动端工程（实验性）
│   └── docker/               # 跨平台交叉编译镜像
├── frontend/                 # 前端代码
│   ├── index.html
│   ├── main.js
│   ├── package.json
│   └── public/               # 静态资源
├── main.go                   # 应用入口
├── greetservice.go           # 示例服务
├── go.mod / go.sum
└── Taskfile.yml              # 项目根任务
```

绑定生成位置：`frontend/bindings/<go-import-path>/<service>.{js,ts,d.ts}`，构建/dev 时由 wails3 自动产出。

### 排查 `wails3 not found`

1. 确认 Go 安装正确，且 `~/go/bin` 在 PATH 中
   - macOS/Linux：`echo $PATH | grep go/bin`
   - Windows：`$env:PATH -split ';' | Where-Object { $_ -like '*\go\bin' }`
2. 重启终端让新 PATH 生效

## References 索引

| 主题 | 文件 |
|------|------|
| 完整安装文档（getting-started） | [installation.md](./references/installation.md) |
| 你的第一个应用（含视频步骤） | [your-first-app.md](./references/your-first-app.md) |
| 安装替代版（quick-start） | [quick-installation.md](./references/quick-installation.md) |
| 项目结构详解 | [project-structure.md](./references/project-structure.md) |
| `wails3 setup` 向导 | [setup.md](./references/setup.md) |
| 调试（devtools / Go 调试器） | [debugging.md](./references/debugging.md) |
| 接入其他前端框架 | [frontend-frameworks.md](./references/frontend-frameworks.md) |

## 链接到其他 SKILL

- 整体架构与原理 → `wails-overview`
- CLI 命令查询 → `wails-cli`
- 完整 todo/notes 教程 → `wails-tutorials-migration`
- 构建配置 / 跨平台 / 签名 → `wails-build`
