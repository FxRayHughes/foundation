---
name: foundation-utils
description: Foundation 脚手架的 Go 工具层使用指南：httpx（HTTP 客户端）、procx（子进程 + Windows JobObject）、cryptox（AES-GCM）、logx（slog + 文件 rotate）、filex（原子写）。覆盖典型用法、跨平台细节、与 SQLite / 前端的边界，以及"业务代码不许直接 net/http / exec.Cmd / log.Println / os.WriteFile 配置"等铁律。
---

# Foundation 工具层

`internal/utils/` 下五个包，把跨业务的横切关注点（HTTP、子进程、加密、日志、文件 IO）收口在统一实现里。

| 包 | 职责 | 替代了什么 |
|----|------|-----------|
| `httpx` | HTTP 客户端 + JSON helper + 重试 | `net/http.DefaultClient`、各业务自造 client |
| `procx` | 子进程启停 + 进程组绑定 | `os/exec.Cmd.Start` + 各业务自写 kill 子树 |
| `cryptox` | AES-GCM 对称加密 token / API key | "顺手 base64 一下" |
| `logx` | `log/slog` + 控制台 + 文件 rotate | `fmt.Println`、`log.Printf` |
| `filex` | 原子写、限长读、目录确保 | `os.WriteFile` 写配置（断电半截） |

> 这些工具**只在 Go 端**。前端要用通过对应业务 service 暴露（如 `subprocess` service 把 procx 包成 Wails 接口）。

---

## 1. 铁律

| # | 规则 | 原因 |
|---|------|------|
| 1 | 业务代码**禁止** `net/http.Get/Post/DefaultClient` | 没超时、没复用、没 UA、没限流；用 `httpx.GetJSON / PostJSON / Do` |
| 2 | 业务代码**禁止** `os/exec.Command(...).Start()` 直接用 | 父进程崩溃留僵尸；用 `procx.StartCtx` 自动绑 Job / pgid |
| 3 | 敏感字符串落 SQLite **必须**先 `cryptox.EncryptString` | "API key 明文存 db" 是不可接受的 |
| 4 | 业务代码**禁止** `log.Printf` / `fmt.Println` | 没结构化字段、不落文件；用 `logx.For("component").Info(...)` |
| 5 | 写"配置类文件"**必须** `filex.WriteAtomic`（不是普通 `os.WriteFile`） | 断电 / 崩溃产生半截 JSON 会让下一次启动炸 |
| 6 | 子进程暴露给前端**只能**走 `internal/services/subprocess` 的白名单 | 直接开 `RunArbitraryCommand` 等于把 webview 变 RCE 通道 |

---

## 2. httpx：HTTP 客户端

### 2.1 设计速览

- 单例 `*http.Client`（连接池复用），`Client()` 取
- 默认 30s 超时（用 context deadline，不用 `Client.Timeout`）
- 默认 UA：`logx.SetUserAgent` 注入；不设也带个 fallback
- 4xx/5xx 自动包成 `*HTTPError`，业务可 `errors.As` 取 status / body 摘要
- **缺省不重试**；要重试调 `httpx.Retry(...)` 显式开

### 2.2 典型用法

```go
import "foundation/internal/utils/httpx"

type WeatherResp struct {
    City string  `json:"city"`
    Temp float64 `json:"temp"`
}

func fetchWeather(ctx context.Context, city string) (*WeatherResp, error) {
    var out WeatherResp
    err := httpx.GetJSON(ctx, "https://api.example.com/weather?city="+city, &out)
    if err != nil {
        if he, ok := httpx.IsHTTPError(err); ok && he.StatusCode == 404 {
            return nil, ErrCityNotFound
        }
        return nil, err
    }
    return &out, nil
}

// POST 一份 JSON
type SendIn struct{ Text string `json:"text"` }
type SendOut struct{ ID string `json:"id"` }

func sendMessage(ctx context.Context, text string) (string, error) {
    var out SendOut
    if err := httpx.PostJSON(ctx, "https://api.example.com/send", SendIn{Text: text}, &out); err != nil {
        return "", err
    }
    return out.ID, nil
}
```

### 2.3 重试（按需）

```go
err := httpx.Retry(ctx, httpx.RetryConfig{
    MaxAttempts: 3,
    BaseDelay:   200 * time.Millisecond,
    MaxDelay:    3 * time.Second,
}, func(ctx context.Context) error {
    return httpx.GetJSON(ctx, url, &out)
})
```

`DefaultShouldRetry` 策略：
- 5xx / 408 / 429 → 重试
- context 取消 / 超时 → 不重试（调用方主动停了）
- 其他 IO / 网络错误 → 重试

要自定义判定，传 `cfg.ShouldRetry`。

### 2.4 自定义 Header / 流式

```go
req, cancel, err := httpx.NewRequest(ctx, http.MethodPost, url, body)
if err != nil { return err }
defer cancel()
req.Header.Set("Authorization", "Bearer "+token)
resp, err := httpx.Do(req)
if err != nil { return err }
defer resp.Body.Close()
// stream resp.Body ...
```

---

## 3. procx：子进程

### 3.1 进程组绑定（核心价值）

| 平台 | 机制 |
|------|------|
| Windows | 每个子进程一个独立 `JobObject` + `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`。父进程退出 → handle 关闭 → 系统连带 kill 整个 Job |
| Unix | `setpgid` 让子进程独立成进程组，`Stop` 时 `kill(-pgid, signal)` 一刀切 |

实践效果：父进程 panic / OOM / `kill -9` 都不会留僵尸子进程。

### 3.2 启动 + Wait

```go
import "foundation/internal/utils/procx"

err := procx.Run(ctx, procx.Spec{
    Name: "ffmpeg",
    Args: []string{"-i", input, "-c:v", "libx264", output},
    OnStdout: func(line string) { logx.For("ffmpeg").Debug(line) },
    OnStderr: func(line string) { logx.For("ffmpeg").Info(line) }, // ffmpeg 把进度打到 stderr
    CaptureOutput: true,
    KillGracePeriod: 3 * time.Second,
})
```

### 3.3 长生命周期 + 显式 Stop

```go
proc, err := procx.StartCtx(ctx, procx.Spec{
    Name: "my-daemon",
    Args: []string{"--config", "x.toml"},
})
if err != nil { return err }
defer proc.Stop() // 幂等

// ... 业务期间调用 proc.PID() / 发送 stdin 等

// 显式停止，超时 KillGracePeriod 后强杀
proc.Stop()

// 等退出码
exitErr := proc.Wait()
```

### 3.4 取消语义

`StartCtx(ctx, ...)` 内部监听 ctx：取消时自动调 `Stop()`，给 `KillGracePeriod` 优雅时间，再强杀。**业务方不需要手写 select**。

---

## 4. cryptox：对称加密

### 4.1 安全模型（先看清楚）

- **不是银行级加密**。目标：让"顺手 grep db 文件 / 备份磁盘 / 误传日志"不直接泄露明文
- **对抗能力**：本地非 root 用户读 db 文件 → 安全（拿不到 master key）
- **不对抗**：本地 root 用户、能跑同 user 进程的恶意软件 —— 它们能读 master key 文件
- 真要对抗本地 root，请改走 OS 凭证存储（DPAPI / Keychain / libsecret），后续在 cryptox 之上加抽象层

### 4.2 用法

```go
import "foundation/internal/utils/cryptox"

// 写入：业务 service 把 token 加密后塞进 SQLite
encrypted, err := cryptox.EncryptString(plaintextToken)
if err != nil { return err }
db.Save(&Credential{Provider: "openai", TokenCipher: encrypted})

// 读取
var c Credential
db.First(&c, "provider = ?", "openai")
plain, err := cryptox.DecryptString(c.TokenCipher)
if err != nil {
    if errors.Is(err, cryptox.ErrInvalidCiphertext) {
        // 用户换了机器 / 主密钥丢了 → 走"重新输入凭据"流程
        return ErrCredentialReauth
    }
    return err
}
```

### 4.3 编码格式

`base64( 1B version | 12B nonce | ciphertext+GCM tag )`

- 第一个字节是 `version1 = 0x01`，将来换密钥派生 / 算法时递增
- 老版本数据迁移：业务方在 cryptox 加 `migrate <vN -> vN+1>` 钩子；当前版本暂未涉及

---

## 5. logx：日志

### 5.1 启动一次

`internal/app/app.go` 的 `Run` 顶部：

```go
logx.Init(logx.Config{
    Level:          slog.LevelInfo, // dev 期可调 slog.LevelDebug
    ConsoleEnabled: true,
})
defer logx.Close() // app 退出前刷盘
```

日志位置（默认 logs/ 与 db 同级）：
- Windows: `%AppData%\Foundation\logs\app.log`
- macOS: `~/Library/Logs/Foundation/app.log`
- Linux: `~/.local/state/Foundation/logs/app.log`

### 5.2 业务用法

```go
import "foundation/internal/utils/logx"

func (s *Service) DoStuff(ctx context.Context, id string) error {
    log := logx.For("messages")  // component 字段自动带上
    log.Info("start", "id", id)
    if err := work(); err != nil {
        log.Error("work failed", "id", id, "err", err)
        return err
    }
    log.Info("done", "id", id)
    return nil
}
```

输出格式：
- 控制台 → text（人类友好）
- 文件 → JSON（聚合 / 排查友好）

### 5.3 与 procx 集成

子进程的 stdout / stderr 通过 `OnStdout` / `OnStderr` 串到 logx：

```go
log := logx.For("ffmpeg")
procx.Run(ctx, procx.Spec{
    Name: "ffmpeg",
    Args: args,
    CaptureOutput: true,
    OnStdout: func(line string) { log.Debug(line) },
    OnStderr: func(line string) { log.Info(line) },
})
```

### 5.4 Rotate

`fileRotator` size-based：默认 8MB 一卷，保留 3 个历史（`app.log.1` … `app.log.3`）。
要改阈值传 `Config.MaxSizeBytes` / `Backups`。生产环境若有集中日志（ELK / Loki），通常**不依赖**本地 rotate，关掉 console / 降低 backups 即可。

---

## 6. filex：文件 IO

### 6.1 WriteAtomic

```go
import "foundation/internal/utils/filex"

cfg := MyConfig{...}
data, _ := json.MarshalIndent(cfg, "", "  ")
if err := filex.WriteAtomic("/path/to/config.json", data, 0o644); err != nil {
    return err
}
```

流程：写到同目录的 `.tmp.<rand>` → fsync → rename → 替换原文件。
断电 / 崩溃只可能产生残余 `.tmp` 文件，不会破坏原文件。

### 6.2 ReadLimit

```go
data, err := filex.ReadLimit(path, 4<<20) // 4MB 上限
```

防止超大 / 失控文件耗尽内存。0 / 负数取默认 8MB。

### 6.3 EnsureDir

```go
filex.EnsureDir("/some/nested/path") // mkdir -p 同义
```

---

## 7. subprocess Wails service：把 procx 暴露给前端

### 7.1 安全模型（**重要**）

子进程能力开放给前端 = 给 webview 一条潜在 RCE 通道。**只能用白名单**：

```go
// internal/services/subprocess/commands.go
var whitelist = []Command{
    {
        Name:        "ping",
        Description: "Ping a host",
        Exe:         "ping",
        PrependArgs: []string{"-n", "4"}, // Windows
        ArgPattern:  regexp.MustCompile(`^[a-zA-Z0-9._:-]+$`),
        MaxArgs:     1,
    },
}
```

每加一行白名单前先回答：
1. 这条命令的副作用范围（写文件 / 网络 / 改系统）能接受吗？
2. 用户能在 args 里塞路径 / shell 元字符吗？必须用 `ArgPattern` 卡死
3. `Cwd` 要不要锁到应用数据目录子树（`AllowedCwdRoots`）？

### 7.2 前端用法

```ts
import { SubprocessService } from '@/services';

// 列出可用命令（用来动态渲染 UI）
const cmds = await SubprocessService.availableCommands();

// 启动
const { id, pid } = await SubprocessService.run({ name: 'ping', args: ['8.8.8.8'] });

// 订阅输出
const offLine = SubprocessService.onLine(id, (line, stream) => {
  console.log(`[${stream}] ${line}`);
});
const offExit = SubprocessService.onExit(id, ({ exitCode, error }) => {
  console.log('exit', exitCode, error);
});

// 停止
await SubprocessService.stop(id);

// 卸载时清理订阅
offLine();
offExit();
```

事件名约定：`subprocess:<stdout|stderr|exit>:<id>`，业务方一般不直接订阅，用 `onLine` / `onExit` 即可。

---

## 8. 反例（PR 中出现这些会被打回）

❌ 业务代码用默认 client：

```go
resp, _ := http.Get(url) // 没超时！goroutine 会卡死
```

✅
```go
err := httpx.GetJSON(ctx, url, &out)
```

---

❌ 直接 exec.Command + Start：

```go
cmd := exec.Command("ffmpeg", args...)
cmd.Start() // 父挂了 ffmpeg 还在跑！
```

✅
```go
proc, _ := procx.StartCtx(ctx, procx.Spec{Name: "ffmpeg", Args: args})
defer proc.Stop()
```

---

❌ 明文存 token：

```go
db.Save(&Credential{Token: rawToken}) // 任何人 dump db 都看得见
```

✅
```go
enc, _ := cryptox.EncryptString(rawToken)
db.Save(&Credential{TokenCipher: enc})
```

---

❌ `log.Printf("user %s logged in", id)`

✅
```go
logx.For("auth").Info("user logged in", "user_id", id)
```

---

❌ `os.WriteFile("storage.json", data, 0644)` 写配置

✅
```go
filex.WriteAtomic("storage.json", data, 0o644)
```

---

❌ 给前端开个万能 `RunCommand(name, args)`

✅ 在 `commands.go` 加严格白名单 + `ArgPattern`。

---

## 9. 相关文件

```
internal/utils/
├── httpx/
│   ├── httpx.go        # Client / NewRequest / GetJSON / PostJSON / HTTPError
│   └── retry.go        # Retry / RetryConfig / DefaultShouldRetry
├── procx/
│   ├── procx.go        # Spec / Process / StartCtx / Run / Wait / Stop
│   ├── procx_windows.go # JobObject + KILL_ON_JOB_CLOSE + ResumeThread
│   └── procx_unix.go   # setpgid + kill(-pgid)
├── cryptox/
│   └── cryptox.go      # EncryptString / DecryptString / .master.key
├── logx/
│   └── logx.go         # Init / For / fileRotator / fanoutHandler
└── filex/
    └── filex.go        # WriteAtomic / ReadLimit / EnsureDir

internal/services/subprocess/   # procx 的前端入口
├── subprocess.go      # Service / Run / Stop / List / AvailableCommands
└── commands.go        # whitelist + Command.validateArgs / validateCwd

frontend/src/services/subprocess/SubprocessService.ts  # 前端包装 + 事件订阅
```
