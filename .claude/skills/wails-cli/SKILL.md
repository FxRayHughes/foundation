---
name: wails-cli
description: wails3 命令行参考。当用户问到「wails3 init / dev / build / package / generate / doctor / tool / service / ios / sign / update」等 CLI 命令、Taskfile 集成、构建产物路径、generate bindings 用法时使用。
---

# Wails v3 - CLI 参考

`wails3` 是 Wails 3 的命令行入口：创建/开发/构建/签名/打包/检查应用。多数构建编排被委托给项目内的 Taskfile（`build/` 下），许多 `wails3` 命令是对 Task 的薄封装。

## 何时使用本 SKILL

- 查询 `wails3` 子命令、参数、行为
- 编写 Taskfile 调用 wails3 子命令
- 排查构建产物位置（不在 `build/bin/`，而在 `bin/`）
- 配置 `wails3 generate bindings` / `icons` / `syso` 等代码生成

## 命令分组速查

### 项目生命周期

| 命令 | 作用 |
|------|------|
| `wails3 init` | 从模板创建新项目。常用 flag：`-n` 项目名、`-t` 模板（默认 `vanilla`）、`-p` Go 包名、`-d` 目录、`-l` 列模板、`-mod` Go 模块路径、`--git` Git URL、`--skipgomodtidy`、产品元数据 `--productname/description/version/company/copyright/comments/identifier` |
| `wails3 dev` | 开发模式（前端热重载）。`--config` 默认 `./build/config.yml`、`--port` Vite 端口、`-s` HTTPS |
| `wails3 build` | 构建（薄封装到 Taskfile `build` 任务）。`--tags` → `EXTRA_TAGS=`、`--obfuscated`（Garble）、`--garbleargs` |
| `wails3 package` | 调用平台 `package` 任务 |
| `wails3 task [name]` | 执行任意 Taskfile 任务；不带名时 `--list` 列出全部 |
| `wails3 doctor` / `doctor-ng` | 诊断报告（new TUI 变体） |
| `wails3 version` / `releasenotes` / `docs` / `sponsor` | CLI 版本、发版说明、官网、赞助页 |

### `wails3 generate <sub>`

| 子命令 | 作用 |
|-------|------|
| `bindings` | 生成 Go→前端绑定。Flags：`-d` 输出目录、`-models`、`-index`、`-ts`、`-i` 接口、`-b` bundle、`-names` `Call.ByName`、`-noevents`、`-noindex`、`-dry`、`-silent`、`-v`、`-clean`（默认 `true`）、`-f`、`-obfuscated`、`-obfuscated-output`。可以传 `./...` 等包模式 |
| `icons` | PNG 转平台图标。`-input`、`-windowsfilename`、`-macfilename`、`-iconcomposerinput`、`-macassetdir` |
| `build-assets` | 从 `build/config.yml` 生成 `build/` 内容（Taskfile 片段、NSIS、Info.plist、.desktop 等） |
| `runtime` | 重新生成 `/wails/runtime.js` |
| `syso` | 生成 Windows `.syso`（图标 + manifest + 版本信息） |
| `webview2bootstrapper` | WebView2 引导安装器 |
| `constants` | 从 Go 事件类型生成 JS 常量 |
| `template` | 脚手架新模板 |
| `.desktop` | Linux `.desktop` 文件 |
| `appimage` | AppImage 构建目录 |

### `wails3 update <sub>`

| 子命令 | 作用 |
|-------|------|
| `update build-assets` | 从 `build/config.yml` 刷新 `build/`（尽量保留用户改动） |
| `update cli` | 自更新 `wails3` 二进制 |

### 签名 & 打包

| 命令 | 作用 |
|------|------|
| `wails3 setup signing` | 交互向导，根据 `build/` 自动检测平台。`--platform` 可重复 |
| `wails3 setup entitlements` | macOS 权限向导。`--output` 默认 `build/darwin/entitlements.plist` |
| `wails3 sign [GOOS=…]` | 调用平台 `*:sign` Task 任务 |
| `wails3 tool sign` | 低级直接签名。`--input/output/verbose/certificate/password/thumbprint/timestamp/identity/entitlements/hardened-runtime/notarize/keychain-profile/pgp-key/pgp-password/role` |

⚠️ 没有 `wails3 signing` 子命令 — 钥匙串凭证用 `xcrun notarytool store-credentials`，PGP 用 `gpg`，`wails3 setup signing` 会自动化两者。

### `wails3 tool <sub>`

| 子命令 | 作用 |
|-------|------|
| `checkport` | 检查 TCP 端口是否打开（等 Vite 启动） |
| `watcher` | 监视文件变化并执行命令 |
| `cp` | 跨平台文件复制 |
| `buildinfo` | 打印二进制嵌入的 Go build info |
| `package` | 用 `build/linux/nfpm` 构建 `deb` / `rpm` / `archlinux` 包 |
| `version` | 升 semver |
| `lipo` | 合并多 macOS 架构成 universal 二进制 |
| `capabilities` | 探测 GTK3/GTK4 / WebKit 可用性 |
| `sign` | 见上 |

### `wails3 service <sub>`

| 子命令 | 作用 |
|-------|------|
| `service init` | 脚手架新 service 包 |

### `wails3 ios <sub>`

| 子命令 | 作用 |
|-------|------|
| `ios overlay:gen` | 生成 iOS bridge shim 的 Go overlay |
| `ios xcode:gen` | 生成 Xcode 项目 |

## 构建产物路径

- 原生二进制：`bin/<APP_NAME>`（Windows 是 `bin/<APP_NAME>.exe`）
- 打包产物（`.app` / `.dmg` / NSIS / MSIX / DEB / RPM / AppImage）：均落到 `bin/` 或平台子目录
- ⚠️ 没有 `build/bin/`

## 全局 flag

| Flag | 作用 |
|------|------|
| `--no-colour` | 禁用 ANSI 颜色 |

## 帮助命令

```sh
wails3 --help
wails3 <command> --help
```

## References 索引

| 主题 | 文件 |
|------|------|
| CLI 完整参考（命令/flag/示例） | [cli-reference.md](./references/cli-reference.md) |
| 顶层 Reference 概述 | [reference-overview.md](./references/reference-overview.md) |
| CLI Guide（含 Task 调用） | [cli-guide.md](./references/cli-guide.md) |

## 链接到其他 SKILL

- 代码签名 / 打包 / 跨平台细节 → `wails-build`
- `application.New` 选项参考 → `wails-application`
- bindings 生成 / Service 编写 → `wails-bindings`
