[根目录](../CLAUDE.md) > **build**

# build - 多平台构建模块

## 模块职责

集中维护跨平台构建、打包、分发所需的所有脚本、配置与资源。每个平台拥有独立的 `Taskfile.yml`，由根 `Taskfile.yml` 通过 `includes` 聚合调用。打包目标涵盖 Windows (NSIS / MSIX)、macOS (Info.plist / Assets.car)、Linux (AppImage / nfpm)、iOS (Xcode 项目模板)、Android (Gradle 项目)、以及 Docker 服务器/跨编译镜像。

## 入口与启动

- 公共入口：`build/Taskfile.yml`（被根 Taskfile 通过 `common:` 命名空间引用）
- 全局应用元信息：`build/config.yml`（`info.companyName`、`productName`、`version` 等；修改后需要 `wails3 task common:update:build-assets` 同步资源）
- 应用图标：`build/appicon.png`、`build/appicon.icon/`

## 对外接口

通过根 Taskfile 暴露给开发者的命令均最终调用本目录下的子 Taskfile：

| 子模块 | 入口 Taskfile | 主要产物 |
|--------|---------------|----------|
| Windows | `build/windows/Taskfile.yml` | `nsis/project.nsi`、`msix/template.xml`、`wails.exe.manifest` |
| macOS | `build/darwin/Taskfile.yml` | `Info.plist`、`Info.dev.plist`、`Assets.car`、`icons.icns` |
| Linux | `build/linux/Taskfile.yml` | `appimage/build.sh`、`nfpm/nfpm.yaml`、`desktop/` |
| iOS | `build/ios/Taskfile.yml` | `project.pbxproj`、`Info.plist`、`main.m`、`main_ios.go`、`Assets.xcassets` |
| Android | `build/android/Taskfile.yml` | Gradle 工程：`build.gradle`、`settings.gradle`、`gradlew`、`app/src/main/...` |
| Docker | `build/docker/` | `Dockerfile.server`、`Dockerfile.cross` |

## 关键依赖与配置

- `build/config.yml`
  - `info.*`：版本、公司、Bundle ID、Copyright
  - `dev_mode`：dev server 监视/忽略规则、子进程启动顺序
  - `fileAssociations`：文件关联占位
- iOS 选配段：`config.yml` 中注释的 `ios:` 段允许覆盖 bundleID、版本等
- iOS Go 入口：`build/ios/main_ios.go`、`app_options_ios.go`、`app_options_default.go`
- Android Activity：`build/android/app/src/main/java/com/wails/app/MainActivity.java`、`WailsBridge.java`、`WailsJSBridge.java`、`WailsPathHandler.java`
- Android 入口：`build/android/main_android.go`
- 安装钩子（Linux）：`build/linux/nfpm/scripts/{preinstall,postinstall,preremove,postremove}.sh`

## 数据模型

无应用层数据模型。仅包含构建系统的元数据与资源声明（plist、manifest、proto 等）。

## 测试与质量

- 无构建脚本测试。
- 建议：在 CI 中分别针对 Windows / macOS / Linux 跑 `task build`，验证打包配置可用。
- `build/windows/nsis/MicrosoftEdgeWebview2Setup.exe` 已在 `.gitignore` 中（运行时下载/缓存）。

## 常见问题 (FAQ)

- Q：修改了 `build/config.yml` 中的 `info.*` 字段，但二进制元数据没变？
  - A：执行 `wails3 task common:update:build-assets` 重新生成各平台资源（plist、manifest、msix 等）。
- Q：为什么 iOS / Android 目录里有独立的 `main_*.go`？
  - A：移动平台需要不同的初始化路径（无独立桌面窗口、需要绑定到原生 Activity / UIViewController），通过构建标签隔离。
- Q：如何切换包管理器？
  - A：根 Taskfile 的 `PACKAGE_MANAGER` 默认 `pnpm`，可在调用任务时通过 `task PACKAGE_MANAGER=npm dev` 覆盖。

## 相关文件清单

```
build/
├── Taskfile.yml                   # 公共构建任务
├── config.yml                     # 应用元信息与 dev_mode 配置
├── appicon.png / appicon.icon/    # 应用图标源
├── windows/
│   ├── Taskfile.yml
│   ├── icon.ico
│   ├── info.json
│   ├── wails.exe.manifest
│   ├── nsis/{project.nsi, wails_tools.nsh}
│   └── msix/{app_manifest.xml, template.xml}
├── darwin/
│   ├── Taskfile.yml
│   ├── Info.plist / Info.dev.plist
│   ├── Assets.car
│   └── icons.icns
├── linux/
│   ├── Taskfile.yml
│   ├── appimage/build.sh
│   ├── desktop/
│   └── nfpm/{nfpm.yaml, scripts/*.sh}
├── ios/
│   ├── Taskfile.yml
│   ├── Info.plist / Info.dev.plist
│   ├── entitlements.plist
│   ├── project.pbxproj
│   ├── main.m / main_ios.go
│   ├── app_options_ios.go / app_options_default.go
│   ├── LaunchScreen.storyboard
│   ├── Assets.xcassets
│   ├── icon.png
│   └── build.sh
├── android/
│   ├── Taskfile.yml
│   ├── build.gradle / settings.gradle / gradle.properties
│   ├── gradlew / gradlew.bat
│   ├── gradle/wrapper/{gradle-wrapper.jar, gradle-wrapper.properties}
│   ├── main_android.go
│   ├── scripts/deps/install_deps.go
│   └── app/
│       ├── build.gradle / proguard-rules.pro
│       └── src/main/
│           ├── AndroidManifest.xml
│           ├── java/com/wails/app/{MainActivity,WailsBridge,WailsJSBridge,WailsPathHandler}.java
│           └── res/{layout, mipmap-*, values}
└── docker/
    ├── Dockerfile.server          # 服务器模式镜像
    └── Dockerfile.cross           # 跨编译镜像（约 800MB）
```

## 变更记录 (Changelog)

- 2026-05-28 13:09:44：初始化模块文档。
