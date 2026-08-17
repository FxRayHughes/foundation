---
name: wails-upgrade-sop
description: Foundation 升级 Wails v3 版本的标准作业流程（SOP）。从拉取参考源码 → 逐一核对 API 破坏性变更 → 升级后端/前端/bindings → 同步 wails-* skill → 构建验证 → 发版（commit/tag/push/GitHub Release）。含本机专属的网络代理、pnpm 供应链策略、GOBIN 位置等已知坑。当用户说"升级 wails / 跟进 wails 新版本 / 同步 skill / 发新版本"时使用。
---

# Wails v3 升级 SOP

把「Foundation 跟进 Wails v3 新版本」这件事固化成可复制流程。**每次升级重新拉取参考源码**（用完即删，不常驻仓库）。

> 本 SOP 由 2026-08-17 `alpha.96 → beta.9` 那次升级沉淀而来。具体某次升级的结论记在项目 `CLAUDE.md` 变更记录 + memory，不写进本 SOP —— 本文件只留**流程**。

---

## 0. 本机专属前提（每个 shell 都要带）

这台机器有三个非默认约束，不带上会在中途莫名失败：

| 坑 | 症状 | 解法 |
|----|------|------|
| `proxy.golang.org` / `github.com` 直连时好时坏 | `go get` 卡 `i/o timeout`（`dial tcp 142.250.66.x:443`） | 所有 go 命令带 `GOPROXY="https://goproxy.cn,direct" GOSUMDB="sum.golang.google.cn"` |
| `GOBIN` 被 mise 改到非标准位置 | `go install` 出来的 `wails3`/`task` "找不到" | 二进制在 `$(go env GOBIN)`（形如 `~/.local/share/mise/installs/go/<ver>/bin`），**不是** `$GOPATH/bin`。把它加进 `PATH` |
| pnpm 开了 `minimumReleaseAge` 供应链策略 | `pnpm install` 报 `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`，说某包"published within cutoff" | `pnpm add <pkg>@<新版本>` 会自动生成 `frontend/pnpm-workspace.yaml`（`minimumReleaseAgeExclude`）。**这个文件是 load-bearing，必须提交、绝不能当副产物删掉** |

标准前缀（贴在每条 go / 构建命令前）：
```sh
export GOPROXY="https://goproxy.cn,direct" GOSUMDB="sum.golang.google.cn"
export PATH="$(go env GOBIN):$PATH"
```

---

## 1. 拉取参考源码（用完即删）

先确认目标版本（用户会给，或看 GitHub releases）。然后 shallow clone 到**上级目录**（不进项目仓库）：

```sh
cd /Users/ray_hughes/Documents/CodeSpase/wails
gh repo clone wailsapp/wails -- --depth 1 --branch <TARGET_TAG>   # 如 v3.0.0-beta.9
```

> `gh clone` 走 git 协议，github.com 波动时也可能失败——失败就重试。克隆较大（几分钟），后台跑 + Monitor 等完成。

关键路径（后续步骤反复用到）：
- Go API 源码：`wails/v3/pkg/application/`、`wails/v3/pkg/events/`
- 变更日志（权威、含全历史）：`wails/docs/src/content/docs/changelog.mdx`
- 官方文档（.mdx，Astro Starlight）：`wails/docs/src/content/docs/`
- 前端 runtime 源码：`wails/v3/internal/runtime/desktop/@wailsio/runtime/src/`
- CLI flag 定义：`wails/v3/internal/flags/`

**收尾（发版后必做）**：`rm -rf /Users/ray_hughes/Documents/CodeSpase/wails/wails`。

---

## 2. 核对 API 破坏性变更（升级成败的关键，别省）

**不要只读 changelog 就下结论**——changelog 多是 fix/feature，真正影响项目的是签名变化。方法是「先列出项目用到的 API 面，再逐个到新版源码里验签名」。

### 2a. 列出项目实际用到的 Wails API 面
```sh
cd <项目>
grep -rn "wails/v3" internal/ --include="*.go" | grep -v _test.go        # 有哪些 import
grep -rhoE "application\.[A-Za-z][A-Za-z0-9_]*" internal/ | sort -u       # application.* 调用
grep -rhoE "events\.[A-Za-z][A-Za-z0-9_]*" internal/ | sort -u            # events.* 调用
grep -rnE "\.(Emit|On|OnWindowEvent|NewWithOptions|RegisterService)\(" internal/
```
Foundation 已知会用到：`application.New/Options/NewService/Service/App/Context`、`RegisterEvent[T]`、`app.Event.Emit`、`events.Common.WindowClosing`、`app.Window.NewWithOptions` + `WebviewWindowOptions`（含 `Mac`/`Windows` 子结构）、`OnWindowEvent`/`Center`、`AssetOptions`/`AssetFileServerFS`、`NewRGB`、systray（`app.SystemTray.New`、`SetTemplateIcon`/`AttachWindow`/`WindowOffset`/`SetMenu`/`OnRightClick`/`OpenMenu`）、`NewMenu`/`Add`/`AddSeparator`/`OnClick`、`app.Quit`。

### 2b. 逐个到新版源码验签名
在 clone 的 `wails/v3/pkg/application/` 里 `grep -n "func NewService"`、`grep -n "type WebviewWindowOptions"` 等，确认签名/字段是否变。**大多数升级里项目用到的面是不变的**（beta.9 那次就是零业务改动）。

### 2c. 已知历史雷区（每次都顺手查一遍是否又变）
- `NewService` 是否还是单参？（曾经有 2 参 `NewService(x, ServiceOptions{})`，后来拆成 `NewServiceWithOptions`）
- bindings 里 `time.Time` / `[]byte` 的默认映射（曾从 `Date`/`Uint8Array` 改成 RFC3339Nano 字符串 / base64 字符串，并加了 `-time-type` flag）
- `webview2` 是否还是独立 module（已折叠进 v3，`go mod tidy` 会自动删独立 indirect 依赖）

### 2d. 大工作量时可并行
把「核对项目 API 面」和「审计 skill 文档漂移」拆给 subagent 并行跑（beta.9 那次这么做的），主线程同时推进后端升级。

---

## 3. 升级后端

```sh
export GOPROXY="https://goproxy.cn,direct" GOSUMDB="sum.golang.google.cn"
go get github.com/wailsapp/wails/v3@<TARGET_TAG>
go mod tidy
go build ./internal/... && go vet ./internal/...      # 真正的 API 测试（不要只 build ./...）
```
- `go build ./...` 会因 `//go:embed all:frontend/dist` 缺目录而报错——那是前端还没构建，**不是** API 问题，忽略。以 `./internal/...` 为准。
- 若 2c 发现有签名变化，按新签名改 `internal/` 里对应调用，再重跑上面两条直到全绿。

---

## 4. 升级前端 + 重新生成 bindings

```sh
# 4a. 前端 runtime 对齐到同版本（package.json 建议从 "latest" 锁成精确版本，避免 beta 期漂移）
cd frontend
pnpm add @wailsio/runtime@<3.0.0-…>     # 会写 pnpm-lock + 生成 pnpm-workspace.yaml(见 §0 坑三)
cat node_modules/@wailsio/runtime/package.json | grep version   # 确认落到目标版本
#   注意：pnpm 的 @latest 可能滞后解析到上一个 beta，务必显式写精确版本号

# 4b. 装/更新 wails3 CLI 到同版本
export PATH="$(go env GOBIN):$PATH"
go install github.com/wailsapp/wails/v3/cmd/wails3@<TARGET_TAG>
wails3 version    # 应显示 <TARGET_TAG>

# 4c. 重新生成 bindings（gitignored，属生成物）
wails3 generate bindings

# 4d. 类型检查（definitive 前端验证）
pnpm typecheck
```

---

## 5. 同步 wails-* skill 知识库

skill 内容源自官方 `docs/src/content/docs/`（旧版拷贝）。按 §2 审计结果逐条改。**只改因新版而错的 + 补高价值新特性**，忽略翻译/showcase/CI 类改动。

- 破坏性变更（会让示例编译不过 / 类型错）→ **必改**。例：`wails-bindings` 里 2 参 `NewService` → `NewServiceWithOptions`；`models.md` 的 `time.Time`/`[]byte` 映射表。
- 文档结构性缺失（已文档化的结构体少了新字段 / 措辞现在会误导）→ **应改**。例：`wails-window` 补 `DisableMenu`/`CornerType`；`wails-runtime-features` 修正 `KeyBinding` 的 "global" 措辞。
- 纯新特性（旧内容没错，只是缺）→ **择高价值补**。整段官方 doc 可直接 `cp` 进 `references/`（它是权威源）再在 SKILL.md 加索引 + 触发词。

改完必做的一致性收尾：
```sh
# 确认没有残留会编译不过的旧写法（示例：2 参 NewService）
grep -rnE "NewService\([^,)]+,\s*application\.(Service)?Options" .claude/skills/
# 把 changelog 参考刷新到新版（新版 changelog 是全历史超集，可直接覆盖，frontmatter 一致）
cp <clone>/docs/src/content/docs/changelog.mdx .claude/skills/wails-overview/references/changelog.md
# 刷新 INDEX.md 里的「最新基准」行
```
新增/改动 skill 的 frontmatter `description` 里要把新特性触发词也加上（如 `GlobalShortcut`/`Streams`/`MCP`），否则路由不到。

---

## 6. 构建验证（发版前）

`wails3 build` 需要 go-task（wailsapp fork）：
```sh
export PATH="$(go env GOBIN):$PATH"
export GOPROXY="https://goproxy.cn,direct" GOSUMDB="sum.golang.google.cn"
go install github.com/wailsapp/task/v3/cmd/task@<与新版 wails go.mod 对齐的版本>   # 如 v3.40.1-patched3
wails3 build      # darwin native 是 CGO_ENABLED=1，需 clang（macOS 自带）
ls -la bin/ && file bin/*   # 期望 bin/foundation, Mach-O arm64
```
这一步会跑完整链路：go mod tidy → pnpm install → generate bindings → tsc+vite 生产构建 → go build。任何环节挂了这里都会暴露（beta.9 那次就是在这步撞到 §0 坑三）。Vite「chunks >500kB」是既有 advisory，非错误。

---

## 7. 发版

先跟用户确认三件事（外发动作，边界要用户拍板）：**版本号**、**发布范围**（只本地 / push / 含 GitHub Release）、**是否跑完整构建**。

```sh
# 7a. 版本号：改 build/config.yml 的 info.version（不是 frontend/package.json）
#     注意 info.* 其它字段是脚手架占位值，不要顺手改（那是使用者改名的事）

# 7b. 提交（确认 .gitignore 已排除 bin/ frontend/dist frontend/bindings .task）
git status --short            # 应只有 skill/go.mod/go.sum/package.json/pnpm-lock/pnpm-workspace/config.yml/CLAUDE.md
git add -A && git commit -F <msg>   # 结尾带 Co-Authored-By: Claude ...

# 7c. tag（annotated，release 用）
git tag -a v<X.Y.Z> -m "..."

# 7d. push + GitHub Release
git push origin master && git push origin v<X.Y.Z>
gh release create v<X.Y.Z> --title "..." --notes-file <notes> --verify-tag
gh release view v<X.Y.Z>     # 确认 draft:false prerelease:false，notes 正确
```
提交前更新 `CLAUDE.md` 变更记录追加本次升级条目；发版后 `rm -rf` §1 的克隆。

---

## 铁律速记

1. 参考源码**每次重拉、用完即删**，不进项目仓库。
2. 所有 go 命令带 `GOPROXY=goproxy.cn`；二进制去 `$(go env GOBIN)` 找。
3. `frontend/pnpm-workspace.yaml` 一旦生成就**必须提交**，删了 `wails3 build` 会挂。
4. 判断"要不要改代码"靠**逐个验新版源码签名**，不靠读 changelog 猜。
5. 后端验证以 `go build ./internal/...` 为准（`./...` 的 embed 报错是噪音）。
6. 发布是外发动作，版本号/范围**先问用户**再动手。

## 关联
- 本次具体结论 → 项目 `CLAUDE.md` 变更记录 + memory `wails-beta9-upgrade`
- Wails 各主题知识库 → `wails-*` skill（见 `.claude/skills/INDEX.md`）
- 网络代理坑详情 → memory `go-proxy-workaround`
