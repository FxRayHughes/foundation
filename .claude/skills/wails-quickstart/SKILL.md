---
name: wails-quickstart
description: Wails v3 安装、依赖检查、新建项目、第一个应用、项目结构解析。当用户问到「如何安装 wails3 / wails3 init / wails3 doctor / 项目目录结构 / 新手开始 / Go 版本要求 / WebView2 依赖」时使用。
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
- macOS 10.15+ AMD64（部署到 10.13+）/ macOS 11.0+ ARM64
- Ubuntu 24.04 AMD64/ARM64（其他 Linux 也可能可用）

### 必装依赖

| 依赖 | 要求 | 验证 |
|------|------|------|
| Go | ≥1.24（推荐 1.25） | `go version` |
| npm | 模板需要（可选） | `npm --version` |
| Xcode CLT | macOS 必需 | `xcode-select --install` |
| WebView2 Runtime | Windows 必需 | `wails3 doctor` |
| gcc + gtk4 + webkitgtk-6.0 | Linux 必需 | `wails3 doctor` 会给出安装命令 |

Linux 旧栈：可用 `-tags gtk3` 切回 GTK3 + WebKit2GTK 4.1（v3.1 前保留）。

### 安装 CLI

正式版：
```sh
go install -v github.com/wailsapp/wails/v3/cmd/wails3@latest
```

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
│   └── windows/              # NSIS、icon.ico、wails.exe.manifest
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

## 链接到其他 SKILL

- 整体架构与原理 → `wails-overview`
- CLI 命令查询 → `wails-cli`
- 完整 todo/notes 教程 → `wails-tutorials-migration`
- 构建配置 / 跨平台 / 签名 → `wails-build`
