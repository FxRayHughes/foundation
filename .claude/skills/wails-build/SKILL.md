---
name: wails-build
description: Wails v3 构建系统 (Task)：本地构建、跨平台编译（Docker）、平台特定打包（NSIS/MSI/dmg/AppImage/deb/rpm）、代码签名（Windows/macOS notarization）、Garble 混淆、安装器（NSIS/Windows installer）、服务器模式构建（无 GUI）、Windows UAC。当用户问到「wails3 build / package / GOOS GOARCH / Task / Docker setup / signing / notarytool / NSIS / dmg / AppImage / nfpm / obfuscation / server build / UAC manifest / wails.exe.manifest」时使用。
---

# Wails v3 - 构建与分发

Wails v3 用 [Task](https://taskfile.dev) 作为构建系统。`wails3 build / package` 是 Task 的薄封装。所有构建产物落在 `bin/`（不是 `build/bin/`）。

## 何时使用本 SKILL

- 本地编译当前平台
- 跨平台交叉编译到 Windows / macOS / Linux（含 ARM64）
- 平台打包：NSIS 安装器、`.app`/`.dmg`、AppImage / deb / rpm
- macOS 代码签名 + 公证（notarization）
- Windows 代码签名（PFX、PGP、SignTool）
- Garble 混淆构建
- 服务器模式构建（无 GUI、CGO-free）
- Windows UAC manifest（提权）
- Linux 旧 GTK3 栈兼容

## 关键摘要

### 基础构建

```sh
wails3 build                          # 当前平台
wails3 build GOOS=windows             # 交叉编译
wails3 build GOOS=darwin GOARCH=arm64
GOOS=linux wails3 build               # 环境变量也可

wails3 dev                            # 开发模式（热重载）
wails3 dev -port 3000 -s              # HTTPS + 自定义端口
```

### 跨平台（需 Docker）

```sh
# 一次性设置（~800MB 镜像）
wails3 task setup:docker

# 然后任意目标
wails3 build GOOS=darwin
wails3 build GOOS=linux
```

| 目标 | 是否需 Docker |
|------|-----|
| Windows（CGO 关） | ❌ 任意主机直接 |
| Windows（CGO 开） | ✅ 非 Windows 主机 |
| macOS | ✅ |
| Linux | ✅ |

### 自定义 build tags

```sh
wails3 build -tags gtk3                  # Linux 旧 GTK3 + WebKit2GTK 4.1
wails3 build -tags server                # 服务器模式（无 GUI、CGO-free）
wails3 build -tags gtk3,customtag        # 多个
```

`-tags` 转 `EXTRA_TAGS` 到 Taskfile。

### 打包

```sh
wails3 package                       # 当前平台
wails3 package GOOS=windows          # NSIS installer → bin/
wails3 package GOOS=darwin           # .app / .dmg → bin/
wails3 package GOOS=linux            # AppImage + deb + rpm → bin/
```

### Windows 平台

- `wails.exe.manifest` 控制 UAC 与版本信息
- `wails3 generate syso` 生成图标 + manifest 嵌入
- NSIS 文件：`build/windows/nsis/project.nsi`
- 提升权限（UAC）：manifest 设 `requireAdministrator`，详见 windows-uac.md

### macOS 平台

- `Info.plist`：`build/darwin/Info.plist`（生产）/ `Info.dev.plist`（开发）
- 签名：`wails3 setup signing` → `wails3 sign GOOS=darwin`
- Notarization：`xcrun notarytool store-credentials` 存凭证后 sign 流程会自动公证
- Universal Binary：`wails3 task darwin:build:universal` 或 `wails3 tool lipo` 合并 amd64+arm64
- DMG：`wails3 task darwin:create:dmg`

### Linux 平台

- AppImage：`build/linux/appimage/build.sh` + `wails3 generate appimage`
- nfpm（deb / rpm / archlinux）：`build/linux/nfpm/nfpm.yaml`
- `.desktop` 文件：`wails3 generate .desktop`
- GTK4（默认） vs GTK3（`-tags gtk3`）

### 代码签名

```sh
# 交互式向导（自动检测平台）
wails3 setup signing
wails3 setup signing --platform windows --platform darwin

# macOS entitlements 向导
wails3 setup entitlements

# 实际签名（薄封装到平台 *:sign 任务）
wails3 sign                # 当前 OS
wails3 sign GOOS=darwin    # 指定

# 低级直接签名
wails3 tool sign --input app.exe --output app-signed.exe \
    --certificate cert.pfx --password XXX --thumbprint ABC \
    --timestamp http://timestamp.digicert.com
```

⚠️ 没有 `wails3 signing`（注意是 `sign` / `setup signing`）。
钥匙串凭证用 `xcrun notarytool store-credentials`，PGP 用 `gpg`。

### Garble 混淆

```sh
wails3 build --obfuscated
wails3 build --obfuscated --garbleargs="-literals"

# bindings 必须用稳定 ID（避免方法名混淆）
wails3 generate bindings -obfuscated
```

### 服务器模式（无 GUI）

```sh
wails3 build -tags server
# 或
task build:server
```

CGO-free，可在 Docker / 容器中运行；前端通过 HTTP 访问。详见 server-build.md。

### Taskfile 直接调用

```sh
wails3 task --list
wails3 task build -v          # verbose
wails3 task --dry             # 预览
wails3 task build -f          # 强制重建
wails3 task darwin:build ARCH=amd64
wails3 task linux:create:deb
wails3 task darwin:build:universal
```

### 资源生成

```sh
wails3 generate icons -input build/appicon.png
wails3 generate syso       # Windows 图标 + manifest + 版本
wails3 generate appimage   # Linux AppImage 目录
wails3 generate webview2bootstrapper  # Windows WebView2 引导

# 刷新 build/ 目录（保留用户改动）
wails3 update build-assets -name "MyApp" -config build/config.yml -dir build
```

### 构建产物路径

| 类型 | 路径 |
|------|------|
| 二进制 | `bin/<APP_NAME>` 或 `bin/<APP_NAME>.exe` |
| Windows installer | `bin/`（NSIS / MSIX） |
| macOS .app/.dmg | `bin/` |
| Linux deb/rpm/AppImage | `bin/` |

## References 索引

| 主题 | 文件 |
|------|------|
| 基础构建命令 | [building.md](./references/building.md) |
| 跨平台编译（Docker） | [cross-platform.md](./references/cross-platform.md) |
| 构建配置自定义（config.yml / Taskfile） | [customization.md](./references/customization.md) |
| Linux 打包（GTK3/4、AppImage、nfpm） | [linux.md](./references/linux.md) |
| macOS 打包（.app/.dmg、universal、Info.plist） | [macos.md](./references/macos.md) |
| Windows 打包（NSIS、MSIX、syso、manifest） | [windows.md](./references/windows.md) |
| Garble 混淆构建 | [obfuscation.md](./references/obfuscation.md) |
| 代码签名（Windows / macOS notarization 完整流程） | [signing.md](./references/signing.md) |
| 安装器（NSIS） | [installers.md](./references/installers.md) |
| 服务器模式（无 GUI） | [server-build.md](./references/server-build.md) |
| Windows UAC manifest | [windows-uac.md](./references/windows-uac.md) |
| 故障排查：macOS Syso 错误 | [troubleshooting-mac-syso.md](./references/troubleshooting-mac-syso.md) |

## 链接到其他 SKILL

- 完整 CLI 命令查询 → `wails-cli`
- 构建系统底层原理（编译/绑定生成/嵌入） → `wails-overview`
- 自动更新器（updater） → `wails-advanced`
- 自定义模板 → `wails-advanced`
