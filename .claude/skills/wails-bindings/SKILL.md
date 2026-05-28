---
name: wails-bindings
description: 编写 Service、生成 TypeScript 绑定、方法签名、模型映射、枚举支持、最佳实践。当用户问到「Service / Greet / NewService / 服务生命周期 / ServiceStartup / ServiceShutdown / 类型映射 / TypeScript 生成 / 自定义 binding 名 / Internal 隐藏方法」时使用。
---

# Wails v3 - Bindings & Services

Service 是 Wails 推荐的组织 Go 后端逻辑、暴露给前端调用的结构。每个 Service 是单例，按 struct 注册，导出方法自动生成 TypeScript 绑定。

## 何时使用本 SKILL

- 编写新的 Service 类（数据访问、业务逻辑、外部 API 包装）
- 配置 Service 启动/关闭生命周期 (`ServiceStartup` / `ServiceShutdown` / `ServiceName`)
- 控制类型映射、JSON 标签、自定义 enums
- 配置 `wails3 generate bindings` 输出（位置/格式/索引）
- 调试 binding 不生成 / 类型错误问题
- 隐藏方法不暴露给前端、命名冲突解决

## 关键摘要

### 最简 Service

```go
type GreetService struct{ prefix string }

func NewGreetService(p string) *GreetService { return &GreetService{prefix: p} }
func (g *GreetService) Greet(name string) string { return g.prefix + name + "!" }

app := application.New(application.Options{
    Services: []application.Service{
        application.NewService(NewGreetService("Hello, ")),
    },
})
```

前端：
```js
import { Greet } from './bindings/changeme/GreetService';
const msg = await Greet("World");  // "Hello, World!"
```

### 规则

- **导出方法**（PascalCase）才会被绑定
- Service 是**单例**（整个应用一份实例）
- 跨多个窗口共享，**必须自行加锁** (`sync.Mutex`)
- 方法可返回 `(T, error)`；error 在 JS 中转换成 throw

### 生命周期接口

实现以下方法可拿到生命周期回调（可选）：

```go
type MyService struct {}

// 启动时调用，返回 error 中止启动
func (s *MyService) ServiceStartup(ctx context.Context, opts application.ServiceOptions) error {
    // 注意：这是 startup 唯一推荐位置（没有 application.OnStartup）
    return nil
}

// 退出时调用
func (s *MyService) ServiceShutdown() error { return nil }

// 自定义 binding 路径名（默认用包路径 + struct 名）
func (s *MyService) ServiceName() string { return "Greeter" }
```

### 注入依赖

```go
type UserService struct {
    db     *sql.DB
    logger *slog.Logger
}

func NewUserService(db *sql.DB, logger *slog.Logger) *UserService {
    return &UserService{db: db, logger: logger}
}

func (u *UserService) GetUser(id int) (*User, error) { /* ... */ }
```

注册：
```go
db := openDB()
logger := slog.Default()
app := application.New(application.Options{
    Services: []application.Service{
        application.NewService(NewUserService(db, logger)),
    },
})
```

### 上下文（窗口/应用）

Service 方法接收 `context.Context` 作为首个参数即可获取调用上下文：

```go
func (s *MyService) DoStuff(ctx context.Context) error {
    win, _ := ctx.Value(application.WindowKey).(application.Window)
    app := application.Get()
    _ = win; _ = app
    return nil
}
```

### 类型映射

| Go | TypeScript |
|----|------------|
| `string` | `string` |
| `int*`/`uint*`/`float*` | `number` |
| `bool` | `boolean` |
| `[]T` | `T[]` |
| `map[string]T` | `Record<string, T>` |
| `struct` | `interface` |
| `time.Time` | `Date` |
| `error` | throw exception |

不支持：`chan`、`func()`、非 struct 指针、未导出字段。
JSON 标签控制 TypeScript 字段名：`Name string `json:"username"`` → `username: string`

### 枚举（Enums）

Go 端：
```go
type Status int

const (
    StatusActive Status = iota
    StatusInactive
    StatusPending
)

func (s Status) String() string {
    return [...]string{"active", "inactive", "pending"}[s]
}
```

TypeScript 自动生成 numeric enum 或 string enum。详见 `enums.md`。

### Models（结构体共享）

```go
type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}
```

→ TypeScript：
```ts
export interface User {
    id: number
    name: string
    email: string
}
```

### 控制 binding 生成

```sh
wails3 generate bindings -d frontend/bindings -ts -models -clean -v
```

| Flag | 作用 |
|------|------|
| `-d` | 输出目录 |
| `-ts` | 生成 .d.ts 类型 |
| `-models` | 生成 model 文件 |
| `-index` | 生成入口 index 文件 |
| `-clean` | 输出前清空（默认 true） |
| `-noevents` | 跳过事件常量 |
| `-noindex` | 不生成 index |
| `-i` | 接口绑定 |
| `-b` | bundle 模式 |
| `-names` | 启用 `Call.ByName` |
| `-obfuscated` | Garble 兼容稳定 ID |

### 最佳实践

- 一个 Service 一类职责（CalculatorService、UserService、FileService）
- 所有 IO 用 `(T, error)`，前端 `try/catch`
- 大数据流用事件 (`app.Event.Emit("progress", ...)`)，而非返回数组
- 长任务用 goroutine + context 取消
- 上下文用于权限检查、当前窗口识别

## References 索引

| 主题 | 文件 |
|------|------|
| Services 完整指南 | [services.md](./references/services.md) |
| 方法签名规则、参数/返回类型 | [methods.md](./references/methods.md) |
| Models（结构体）类型映射 | [models.md](./references/models.md) |
| Enums 枚举生成 | [enums.md](./references/enums.md) |
| 高级绑定（自定义 marshaller、interface） | [advanced.md](./references/advanced.md) |
| Best Practices | [best-practices.md](./references/best-practices.md) |
| 教程：从零创建 Service | [tutorial-creating-a-service.md](./references/tutorial-creating-a-service.md) |

## 链接到其他 SKILL

- `wails3 generate bindings` 详细 flags → `wails-cli`
- 应用入口与 Service 注册 → `wails-application`
- 事件系统（流式数据） → `wails-events`
- Raw message（绕过 binding） → `wails-advanced`
