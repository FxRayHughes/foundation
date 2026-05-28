---
name: wails-advanced
description: Wails v3 高级与杂项主题：自定义传输（WebSocket/gRPC）、单实例、文件关联、自定义 URL 协议、自动更新器（Updater）、性能优化、安全实践、Panic 处理、Raw Messages、HTTP/Gin 路由集成、E2E 测试 (Playwright)、单元测试、自定义模板。当用户问到「Custom Transport / SingleInstance / FileAssociations / myapp:// / app.Updater / Provider / GitHub Releases / RawMessageHandler / PanicHandler / Gin 路由 / e2e Playwright / wails3 generate template」时使用。
---

# Wails v3 - 高级与杂项

15 类高级主题，开发到生产部署阶段最常见的复杂功能。

## 何时使用本 SKILL

- 实现 WebSocket / gRPC 等自定义 IPC 传输
- 限制单实例运行 + 第二实例传参
- macOS / Windows 文件关联（双击 .myext 打开）
- 自定义 URL 协议（`myapp://...` 深度链接）
- 自动更新器（GitHub Releases / Sparkle / 自托管）
- 性能优化（启动 / 内存 / 桥接）
- 安全（输入验证、CSP、bcrypt、JWT、SQL 注入防护）
- Panic 处理 + 上报
- Raw Message（绕过绑定的低级 IPC）
- 嵌入 Gin（HTTP 路由 / REST API / 服务化）
- 自定义前端路由（hash / history）
- E2E 测试（Playwright / Robotgo）
- 单元测试
- 自定义项目模板

## 关键摘要

### 自定义传输（替换默认 HTTP）

```go
type MyCustomTransport struct{}

func (t *MyCustomTransport) Start(ctx context.Context, processor *application.MessageProcessor) error {
    // 启动 WebSocket / gRPC server
    // 收到消息时调用 processor.HandleRuntimeCallWithIDs(...)
    return nil
}

func (t *MyCustomTransport) Stop() error { return nil }

app := application.New(application.Options{
    Transport: &MyCustomTransport{},
})
```

详见 `custom-transport.md` + `examples/websocket-transport`。

### 单实例

```go
app := application.New(application.Options{
    SingleInstance: &application.SingleInstanceOptions{
        UniqueID: "com.myapp.unique-id",
        OnSecondInstanceLaunch: func(data application.SecondInstanceData) {
            // data.Args / WorkingDir / AdditionalData
            // 把当前主窗口拉到前台、加载第二实例传的文件
        },
        AdditionalData: map[string]string{"launchtime": time.Now().String()},
        // 可选 32 字节加密密钥（AES-256-GCM）
        // EncryptionKey: [32]byte{...},
    },
})
```

⚠️ 不启用 `EncryptionKey` 时，第二实例传来的数据视为不可信。

### 文件关联

`build/config.yml`：
```yaml
fileAssociations:
  - ext: myapp
    name: MyApp Document
    description: MyApp Document File
    iconName: myappFileIcon
    role: Editor
```

```sh
wails3 update build-assets   # 刷新 build/
wails3 package                # 打包时注入到 NSIS / Info.plist
```

Go 监听文件打开：
```go
app.Event.OnApplicationEvent(events.Common.ApplicationOpenedWithFile, func(e *application.ApplicationEvent) {
    path := e.Context().OpenedWithFile()  // 路径
})
```

仅支持 Windows（NSIS）和 macOS。Linux 需手写 `.desktop` + `xdg-mime`。

### 自定义 URL 协议（`myapp://...`）

`build/config.yml`：
```yaml
protocols:
  - scheme: myapp
    description: "My App Protocol"
```

监听：
```go
app.Event.OnApplicationEvent(events.Common.ApplicationLaunchedWithUrl, func(e *application.ApplicationEvent) {
    url := e.Context().LaunchedWithURL()  // myapp://open/document?id=123
})
```

⚠️ 没有 `application.Protocol` 类型 / `Protocols` 字段；纯靠 packager 注入 NSIS / MSIX manifest / macOS `CFBundleURLTypes` / Linux `.desktop`+`xdg-mime`。

### Updater（自动更新）

```go
import (
    "github.com/wailsapp/wails/v3/pkg/updater"
    "github.com/wailsapp/wails/v3/pkg/updater/providers/github"
)

gh, _ := github.New(github.Config{Repository: "myorg/myapp"})
app.Updater.Init(updater.Config{
    CurrentVersion: "1.0.0",
    Providers:      []updater.Provider{gh},
    PublicKey:      pubKey,        // 验签
})

app.Updater.CheckAndInstall(context.Background())
// 也可自定义 UI；监听 events.Updater.* 自行控制
```

状态机：`unconfigured → idle → checking → up-to-date | available → downloading → verifying → installing → ready → [Restart]` / `error`

Providers：GitHub Releases / keygen.sh / Sparkle AppCast / 自定义实现 `Provider` 接口。

### Raw Messages（绕过绑定）

```go
app := application.New(application.Options{
    RawMessageHandler: func(window application.Window, message string, originInfo *application.OriginInfo) {
        // 处理任意消息字符串
        window.EmitEvent("response", processed)
    },
})
```

前端：
```js
import { System } from '@wailsio/runtime'
System.invoke("raw-message-payload")
```

⚠️ 仅在性能确认绑定是瓶颈时使用。

### Panic 处理

```go
app := application.New(application.Options{
    PanicHandler: func(details application.PanicDetails) {
        // details.StackTrace / Error / FunctionName / Args / WindowID
        sendToSentry(details)
    },
})
```

捕获绑定服务方法 + 内部 runtime panic。后台 goroutine 需自己 `defer recover()`。

### 嵌入 Gin（HTTP / REST）

```go
import "github.com/gin-gonic/gin"

r := gin.Default()
r.GET("/api/users", func(c *gin.Context) { c.JSON(200, users) })

app := application.New(application.Options{
    Assets: application.AssetOptions{
        Handler: r,   // Gin 作为静态资源 + API handler
    },
})
```

详见 `gin-routing.md` 与 `gin-services.md`。

### 自定义路由

前端用 hash 或 history router；后端 Assets.Handler 处理 fallback：
```go
Assets: application.AssetOptions{
    FS: embed.FS,
    Middleware: func(next http.Handler) http.Handler {
        // SPA fallback：未知路径返回 index.html
    },
}
```

### 测试

**单元测试**（不依赖 wails）：
```go
func TestUserService_Create(t *testing.T) {
    s := &UserService{users: map[string]*User{}}
    u, err := s.Create("a@b.com", "pwd123")
    if err != nil { t.Fatal(err) }
    if u.Email != "a@b.com" { t.Errorf("got %s", u.Email) }
}
```

**E2E 测试**（Playwright + dev 服务器或 server build）：
```sh
wails3 build -tags server  # 服务器模式启动
playwright test            # 通过 HTTP 控制
```

### 自定义模板

```sh
wails3 generate template       # 脚手架新模板
wails3 init -t ./my-template   # 用本地模板创建项目
wails3 init -t github:user/wails-template
```

模板结构：`Taskfile.yml` + `frontend/` + `template.json`（元数据）。详见 `custom-templates.md`。

### 性能要点

- 桥接调用合批：N 次 → 1 次 `ProcessItems(items)`
- 大数据用事件 stream，不要返回大数组
- 长任务 goroutine + context 取消
- 启动时延迟非关键服务到 `ApplicationStarted` 事件
- WebView 内存：避免一次性 DOM 大量 element；用虚拟列表

### 安全要点

- 输入永远在 Go 端验证（前端不可信）
- 文件路径用 `filepath.Clean` 防穿越
- SQL 用 `?` 参数化，绝不字符串拼接
- 密码用 `golang.org/x/crypto/bcrypt`
- 启用 CSP（在 webview 注入 meta）
- 限制 `RawMessageHandler` 处理逻辑长度
- 检查 `OriginInfo.IsMainFrame`、`Origin`

## References 索引

| 主题 | 文件 |
|------|------|
| 自定义传输（WebSocket/gRPC） | [custom-transport.md](./references/custom-transport.md) |
| 单实例 | [single-instance.md](./references/single-instance.md) |
| 文件关联 | [file-associations.md](./references/file-associations.md) |
| 自定义 URL 协议 | [custom-protocols.md](./references/custom-protocols.md) |
| 自动更新器（Updater 完整指南） | [updater.md](./references/updater.md) |
| 性能优化 | [performance.md](./references/performance.md) |
| 安全最佳实践 | [security.md](./references/security.md) |
| Panic 处理 | [panic-handling.md](./references/panic-handling.md) |
| Raw Messages | [raw-messages.md](./references/raw-messages.md) |
| 自定义前端路由 | [routing.md](./references/routing.md) |
| Gin 路由集成 | [gin-routing.md](./references/gin-routing.md) |
| Gin 作为 Service | [gin-services.md](./references/gin-services.md) |
| E2E 测试（Playwright） | [e2e-testing.md](./references/e2e-testing.md) |
| 单元/集成测试 | [testing.md](./references/testing.md) |
| 自定义模板 | [custom-templates.md](./references/custom-templates.md) |
| Guides 架构概览 | [guides-architecture.md](./references/guides-architecture.md) |

## 链接到其他 SKILL

- 应用入口（PanicHandler / SingleInstance / Transport 字段） → `wails-application`
- bindings 生成（含 obfuscated） → `wails-bindings`
- 构建 / 打包 / Garble / 服务器模式 → `wails-build`
- 应用事件常量（ApplicationLaunchedWithUrl 等） → `wails-events`
